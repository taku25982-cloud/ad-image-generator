// ========================================
// Stripe Checkout Session作成API
// ========================================


import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getStripe, PLAN_PRICE_MAP } from '@/lib/stripe/server';

export async function POST(request: NextRequest) {
    try {
        // 認証
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
        }

        const userId = session.user.id;

        // リクエストボディ
        const body = await request.json() as any;
        const { planId } = body;

        // デバッグログ
        console.log('Checkout Request:', { userId, planId });

        // 価格ID取得
        const priceId = PLAN_PRICE_MAP[planId];
        if (!priceId) {
            return NextResponse.json({ error: '無効なプラン、または価格IDが設定されていません' }, { status: 400 });
        }

        const stripe = getStripe();

        // ユーザー情報を取得
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
        }

        let stripeCustomerId = user.stripeCustomerId;

        // Stripeカスタマーが未作成の場合は作成
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: session.user.email,
                metadata: {
                    userId: userId,
                },
            });
            stripeCustomerId = customer.id;

            // DBにStripeカスタマーIDを保存
            await db.update(users)
                .set({ stripeCustomerId })
                .where(eq(users.id, userId));
        }

        // Checkout Session作成
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const checkoutSession = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${appUrl}/dashboard?payment=success&plan=${planId}`,
            cancel_url: `${appUrl}/pricing?payment=cancelled`,
            metadata: {
                userId: userId,
                planId,
            },
            subscription_data: {
                metadata: {
                    userId: userId,
                    planId,
                },
            },
        });

        return NextResponse.json({
            sessionId: checkoutSession.id,
            url: checkoutSession.url,
        });

    } catch (error) {
        console.error('Checkout session creation error:', error);
        return NextResponse.json(
            { error: '決済セッションの作成に失敗しました', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
