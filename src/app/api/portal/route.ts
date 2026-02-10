// ========================================
// Stripeカスタマーポータル作成API
// ========================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { getStripe } from '@/lib/stripe/server';

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
        const adminDb = getAdminDb();

        // ユーザー情報を取得
        const userRef = adminDb.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
        }

        const userData = userDoc.data();
        const stripeCustomerId = userData?.subscription?.stripeCustomerId;

        if (!stripeCustomerId) {
            return NextResponse.json({ error: 'サブスクリプション情報がありません' }, { status: 404 });
        }

        const stripe = getStripe();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // カスタマーポータルセッション作成
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${appUrl}/settings`,
        });

        return NextResponse.json({
            url: portalSession.url,
        });

    } catch (error) {
        console.error('Portal session error:', error);
        return NextResponse.json(
            { error: 'ポータルセッションの作成に失敗しました' },
            { status: 500 }
        );
    }
}
