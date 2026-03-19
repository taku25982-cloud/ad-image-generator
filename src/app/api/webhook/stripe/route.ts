// ========================================
// Stripe Webhook処理
// ========================================


import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, normalizeSubscriptionStatus, PLAN_CREDITS, PRICE_PLAN_MAP } from '@/lib/stripe/server';
import { db } from '@/lib/db';
import { stripeWebhookEvents, users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

type StripeInvoiceWithSubscription = Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
};

type StripeSubscriptionWithPeriods = Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
};

function getUserIdFromMetadata(metadata: Stripe.Metadata | null | undefined): string | undefined {
    return metadata?.userId || metadata?.firebaseUid;
}

function getBillingPeriodDate(unixSeconds: number | undefined): Date | null {
    if (!unixSeconds) {
        return null;
    }

    return new Date(unixSeconds * 1000);
}

function isUniqueConstraintError(error: unknown): boolean {
    return error instanceof Error && (
        error.message.includes('UNIQUE constraint failed') ||
        error.message.includes('PRIMARY KEY constraint failed')
    );
}

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
        try {
            await db.insert(stripeWebhookEvents).values({
                id: event.id,
                type: event.type,
                processedAt: new Date(),
            });
        } catch (error) {
            if (isUniqueConstraintError(error)) {
                console.log(`Skipping duplicate Stripe event: ${event.id}`);
                return NextResponse.json({ received: true, duplicate: true });
            }

            throw error;
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = getUserIdFromMetadata(session.metadata);
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
                        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null;
                        const subscription = subscriptionId
                            ? await stripe.subscriptions.retrieve(subscriptionId) as StripeSubscriptionWithPeriods
                            : null;

                        // サブスクリプションの場合
                        await db.update(users)
                            .set({
                                plan: planId,
                                subscriptionStatus: normalizeSubscriptionStatus('active'),
                                stripeSubscriptionId: subscriptionId,
                                stripeCustomerId: session.customer as string,
                                credits: sql`${users.credits} + ${credits}`,
                                usageMonthlyGenerations: 0,
                                usageResetAt: new Date(),
                                currentPeriodStart: getBillingPeriodDate(subscription?.current_period_start),
                                currentPeriodEnd: getBillingPeriodDate(subscription?.current_period_end),
                                cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
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
                const subscriptionId = (invoice as StripeInvoiceWithSubscription).subscription;
                const subscriptionIdValue = typeof subscriptionId === 'string' ? subscriptionId : null;

                if (subscriptionIdValue && (invoice.billing_reason === 'subscription_cycle' || invoice.billing_reason === 'subscription_update')) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionIdValue) as StripeSubscriptionWithPeriods;
                    const userId = getUserIdFromMetadata(subscription.metadata);
                    
                    // 現在の購読価格からプランIDを逆引き
                    const activePriceId = subscription.items.data[0]?.price.id;
                    const planId = PRICE_PLAN_MAP[activePriceId] || subscription.metadata?.planId;

                    if (userId && planId) {
                        const credits = PLAN_CREDITS[planId] || 0;
                        const isCycleRenewal = invoice.billing_reason === 'subscription_cycle';
                        const billingUpdate = {
                            subscriptionStatus: normalizeSubscriptionStatus(subscription.status),
                            stripeSubscriptionId: subscription.id,
                            stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || null,
                            currentPeriodStart: getBillingPeriodDate(subscription.current_period_start),
                            currentPeriodEnd: getBillingPeriodDate(subscription.current_period_end),
                            cancelAtPeriodEnd: subscription.cancel_at_period_end,
                            updatedAt: new Date(),
                            ...(isCycleRenewal ? {
                                plan: planId,
                                credits: sql`${users.credits} + ${credits}`,
                                usageMonthlyGenerations: 0,
                                usageResetAt: new Date(),
                            } : {}),
                        };

                        await db.update(users)
                            .set(billingUpdate)
                            .where(eq(users.id, userId));

                        if (isCycleRenewal) {
                            console.log(`Credits renewed (${invoice.billing_reason}): ${userId} -> added ${credits} credits (Plan: ${planId})`);
                        } else {
                            console.log(`Subscription billing updated without credit top-up: ${userId} -> ${planId}`);
                        }
                    }
                }
                break;
            }

            // サブスクリプション削除（解約完了時）
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = getUserIdFromMetadata(subscription.metadata);

                if (userId) {
                    await db.update(users)
                        .set({
                            plan: 'free',
                            subscriptionStatus: normalizeSubscriptionStatus('canceled'),
                            stripeSubscriptionId: null,
                            cancelAtPeriodEnd: false,
                            currentPeriodStart: null,
                            currentPeriodEnd: null,
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
                const userId = getUserIdFromMetadata(subscription.metadata);

                if (userId) {
                    await db.update(users)
                        .set({
                            subscriptionStatus: normalizeSubscriptionStatus(subscription.status),
                            stripeSubscriptionId: subscription.id,
                            stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || null,
                            currentPeriodStart: getBillingPeriodDate((subscription as StripeSubscriptionWithPeriods).current_period_start),
                            currentPeriodEnd: getBillingPeriodDate((subscription as StripeSubscriptionWithPeriods).current_period_end),
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
                const subscriptionId = (invoice as StripeInvoiceWithSubscription).subscription;
                const subscriptionIdValue = typeof subscriptionId === 'string' ? subscriptionId : null;

                if (subscriptionIdValue) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionIdValue);
                    const userId = getUserIdFromMetadata(subscription.metadata);

                    if (userId) {
                        await db.update(users)
                            .set({
                                subscriptionStatus: normalizeSubscriptionStatus(subscription.status),
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
