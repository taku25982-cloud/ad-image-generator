// ========================================
// Stripe Webhook処理
// ========================================

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, PLAN_CREDITS } from '@/lib/stripe/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    const stripe = getStripe();
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Stripe署名がありません' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return NextResponse.json({ error: 'Webhook検証エラー' }, { status: 400 });
    }

    const adminDb = getAdminDb();

    try {
        switch (event.type) {
            // サブスクリプション作成成功
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const firebaseUid = session.metadata?.firebaseUid;
                const planId = session.metadata?.planId;

                if (firebaseUid && planId) {
                    const userRef = adminDb.collection('users').doc(firebaseUid);
                    const credits = PLAN_CREDITS[planId] || 0;

                    await userRef.update({
                        'subscription.plan': planId,
                        'subscription.status': 'active',
                        'subscription.stripeSubscriptionId': session.subscription,
                        'subscription.stripeCustomerId': session.customer,
                        credits: FieldValue.increment(credits),
                        'usage.monthlyGenerations': 0,
                        'usage.usageResetAt': FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp(),
                    });

                    console.log(`Subscription activated: ${firebaseUid} -> ${planId}`);
                }
                break;
            }

            // サブスクリプション更新（請求期間更新時）
            case 'invoice.paid': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = (invoice as any).subscription as string;

                if (subscriptionId && invoice.billing_reason === 'subscription_cycle') {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const firebaseUid = subscription.metadata?.firebaseUid;
                    const planId = subscription.metadata?.planId;

                    if (firebaseUid && planId) {
                        const userRef = adminDb.collection('users').doc(firebaseUid);
                        const credits = PLAN_CREDITS[planId] || 0;

                        await userRef.update({
                            credits: credits, // 毎月リセット
                            'usage.monthlyGenerations': 0,
                            'usage.usageResetAt': FieldValue.serverTimestamp(),
                            'subscription.currentPeriodStart': new Date((subscription.items.data[0]?.current_period_start || 0) * 1000),
                            'subscription.currentPeriodEnd': new Date((subscription.items.data[0]?.current_period_end || 0) * 1000),
                            updatedAt: FieldValue.serverTimestamp(),
                        });

                        console.log(`Credits renewed: ${firebaseUid} -> ${credits} credits`);
                    }
                }
                break;
            }

            // サブスクリプション削除（解約完了時）
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const firebaseUid = subscription.metadata?.firebaseUid;

                if (firebaseUid) {
                    const userRef = adminDb.collection('users').doc(firebaseUid);

                    await userRef.update({
                        'subscription.plan': 'free',
                        'subscription.status': 'cancelled',
                        'subscription.stripeSubscriptionId': null,
                        'subscription.cancelAtPeriodEnd': false,
                        updatedAt: FieldValue.serverTimestamp(),
                    });

                    console.log(`Subscription cancelled: ${firebaseUid}`);
                }
                break;
            }

            // サブスクリプション更新（プラン変更/解約予約）
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const firebaseUid = subscription.metadata?.firebaseUid;

                if (firebaseUid) {
                    const userRef = adminDb.collection('users').doc(firebaseUid);

                    await userRef.update({
                        'subscription.status': subscription.status,
                        'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
                        updatedAt: FieldValue.serverTimestamp(),
                    });
                }
                break;
            }

            // 支払い失敗
            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = (invoice as any).subscription as string;

                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const firebaseUid = subscription.metadata?.firebaseUid;

                    if (firebaseUid) {
                        const userRef = adminDb.collection('users').doc(firebaseUid);

                        await userRef.update({
                            'subscription.status': 'past_due',
                            updatedAt: FieldValue.serverTimestamp(),
                        });

                        console.log(`Payment failed: ${firebaseUid}`);
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
