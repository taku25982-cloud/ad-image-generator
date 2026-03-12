// ========================================
// Stripe Webhook処理
// ========================================


import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, PLAN_CREDITS, PRICE_PLAN_MAP } from '@/lib/stripe/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    const stripe = getStripe();
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Stripe署名がありません' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET が設定されていません');
        return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret
        );
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return NextResponse.json({ error: 'Webhook検証エラー' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                // 注意: 以前のFirebaseUidと互換性を持たせるため両方チェック
                const userId = session.metadata?.userId || session.metadata?.firebaseUid;
                const planId = session.metadata?.planId;

                if (userId && planId) {
                    const credits = PLAN_CREDITS[planId] || 0;

                    if (session.mode === 'payment' || planId.startsWith('onetime_')) {
                        // 都度決済の場合
                        await db.update(users)
                            .set({
                                stripeCustomerId: session.customer as string,
                                credits: sql`${users.credits} + ${credits}`,
                                updatedAt: new Date(),
                            })
                            .where(eq(users.id, userId));

                        console.log(`One-time purchase activated: ${userId} -> ${planId} (${credits} credits)`);
                    } else {
                        // サブスクリプションの場合
                        await db.update(users)
                            .set({
                                plan: planId,
                                subscriptionStatus: 'active',
                                stripeSubscriptionId: session.subscription as string,
                                stripeCustomerId: session.customer as string,
                                credits: sql`${users.credits} + ${credits}`,
                                usageMonthlyGenerations: 0,
                                usageResetAt: new Date(),
                                updatedAt: new Date(),
                            })
                            .where(eq(users.id, userId));

                        // サブスクリプション側のメタデータにも設定しておく（ポータル操作時の名残として）
                        try {
                            if (session.subscription) {
                                await stripe.subscriptions.update(session.subscription as string, {
                                    metadata: {
                                        userId: userId,
                                        planId: planId,
                                    }
                                });
                            }
                        } catch (e) {
                            console.error('Failed to update subscription metadata:', e);
                        }

                        console.log(`Subscription activated: ${userId} -> ${planId}`);
                    }
                }
                break;
            }

            // サブスクリプション更新・プラン変更による決済（請求期間更新時）
            case 'invoice.paid': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = (invoice as any).subscription as string;

                if (subscriptionId && (invoice.billing_reason === 'subscription_cycle' || invoice.billing_reason === 'subscription_update')) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const userId = subscription.metadata?.userId || subscription.metadata?.firebaseUid;
                    
                    // アップグレード等でプランが変わった場合、PriceIDから最新のプランIDを逆引きする
                    const activePriceId = subscription.items.data[0]?.price.id;
                    const planId = PRICE_PLAN_MAP[activePriceId] || subscription.metadata?.planId;

                    if (userId && planId) {
                        const credits = PLAN_CREDITS[planId] || 0;

                        // 金額ゼロの場合はクレジットを付与しない（無料のトライアルやインボイス発行のみの場合など）
                        // ただし、subscription_cycle の場合は、0円でも月次更新とみなして付与する
                        const shouldAddCredits = invoice.amount_paid > 0 || invoice.billing_reason === 'subscription_cycle';

                        await db.update(users)
                            .set({
                                plan: planId, // 新しいプランに上書き
                                credits: shouldAddCredits ? sql`${users.credits} + ${credits}` : users.credits,
                                usageMonthlyGenerations: 0,
                                usageResetAt: new Date(),
                                currentPeriodStart: new Date(((subscription as any).current_period_start || 0) * 1000),
                                currentPeriodEnd: new Date(((subscription as any).current_period_end || 0) * 1000),
                                updatedAt: new Date(),
                            })
                            .where(eq(users.id, userId));

                        if (shouldAddCredits) {
                            console.log(`Credits renewed (${invoice.billing_reason}): ${userId} -> added ${credits} credits (Plan: ${planId})`);
                        }
                    }
                }
                break;
            }

            // サブスクリプション削除（解約完了時）
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId || subscription.metadata?.firebaseUid;

                if (userId) {
                    await db.update(users)
                        .set({
                            plan: 'free',
                            subscriptionStatus: 'cancelled',
                            stripeSubscriptionId: null,
                            cancelAtPeriodEnd: false,
                            updatedAt: new Date(),
                        })
                        .where(eq(users.id, userId));

                    console.log(`Subscription cancelled: ${userId}`);
                }
                break;
            }

            // サブスクリプション更新（プラン変更/解約予約のみ）
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId || subscription.metadata?.firebaseUid;

                if (userId) {
                    // ポータルでの変更を最新のプラン状態として反映
                    const activePriceId = subscription.items.data[0]?.price.id;
                    const planId = PRICE_PLAN_MAP[activePriceId] || subscription.metadata?.planId || 'free';

                    await db.update(users)
                        .set({
                            plan: planId,
                            subscriptionStatus: subscription.status,
                            cancelAtPeriodEnd: subscription.cancel_at_period_end,
                            updatedAt: new Date(),
                        })
                        .where(eq(users.id, userId));
                }
                break;
            }

            // 支払い失敗
            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = (invoice as any).subscription as string;

                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const userId = subscription.metadata?.userId || subscription.metadata?.firebaseUid;

                    if (userId) {
                        await db.update(users)
                            .set({
                                subscriptionStatus: 'past_due',
                                updatedAt: new Date(),
                            })
                            .where(eq(users.id, userId));

                        console.log(`Payment failed: ${userId}`);
                    }
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }


        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook処理エラー' },
            { status: 500 }
        );
    }
}
