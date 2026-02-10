// ========================================
// Stripe Checkout Session作成API
// ========================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { getStripe, PLAN_PRICE_MAP } from '@/lib/stripe/server';

export async function POST(request: NextRequest) {
    try {
        // 認証
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        let decodedToken;
        try {
            decodedToken = await getAdminAuth().verifyIdToken(idToken);
        } catch (error) {
            console.error('Auth verification error:', error);
            return NextResponse.json({ error: '認証に失敗しました' }, { status: 401 });
        }

        const uid = decodedToken.uid;

        // リクエストボディ
        const body = await request.json();
        const { planId } = body;

        // バリデーション
        const priceId = PLAN_PRICE_MAP[planId];
        if (!priceId) {
            return NextResponse.json({ error: '無効なプランです' }, { status: 400 });
        }

        const stripe = getStripe();
        const adminDb = getAdminDb();

        // ユーザー情報を取得
        const userRef = adminDb.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
        }

        const userData = userDoc.data();
        let stripeCustomerId = userData?.subscription?.stripeCustomerId;

        // Stripeカスタマーが未作成の場合は作成
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: decodedToken.email || '',
                metadata: {
                    firebaseUid: uid,
                },
            });
            stripeCustomerId = customer.id;

            // FirestoreにStripeカスタマーIDを保存
            await userRef.update({
                'subscription.stripeCustomerId': stripeCustomerId,
            });
        }

        // Checkout Session作成
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
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
                firebaseUid: uid,
                planId,
            },
            subscription_data: {
                metadata: {
                    firebaseUid: uid,
                    planId,
                },
            },
        });

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
        });

    } catch (error) {
        console.error('Checkout session creation error:', error);
        return NextResponse.json(
            { error: '決済セッションの作成に失敗しました', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
