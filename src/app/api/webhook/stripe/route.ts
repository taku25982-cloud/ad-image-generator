// ========================================
// Stripe Webhook処理
// ========================================


import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, PLAN_CREDITS } from '@/lib/stripe/server';
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
            // サブスクリプション作成成功
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                // 注意: 以前のFirebaseUidと互換性を持たせるため両方チェック
                const userId = session.metadata?.userId || session.metadata?.firebaseUid;
                const planId = session.metadata?.planId;

                if (userId && planId) {
                    const credits = PLAN_CREDITS[planId] || 0;

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

                    console.log(`Subscription activated: ${userId} -> ${planId}`);
                }
                break;
            }

            // サブスクリプション更新（請求期間更新時）
            case 'invoice.paid': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = (invoice as any).subscription as string;

                if (subscriptionId && invoice.billing_reason === 'subscription_cycle') {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const userId = subscription.metadata?.userId || subscription.metadata?.firebaseUid;
                    const planId = subscription.metadata?.planId;

                    if (userId && planId) {
                        const credits = PLAN_CREDITS[planId] || 0;

                        await db.update(users)
                            .set({
                                credits: credits, // 毎月リセット
                                usageMonthlyGenerations: 0,
                                usageResetAt: new Date(),
                                currentPeriodStart: new Date(((subscription as any).current_period_start || 0) * 1000),
                                currentPeriodEnd: new Date(((subscription as any).current_period_end || 0) * 1000),
                                updatedAt: new Date(),
                            })
                            .where(eq(users.id, userId));

                        console.log(`Credits renewed: ${userId} -> ${credits} credits`);
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

            // サブスクリプション更新（プラン変更/解約予約）
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId || subscription.metadata?.firebaseUid;

                if (userId) {
                    await db.update(users)
                        .set({
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
