// ========================================
// Stripeカスタマーポータル作成API
// ========================================


import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getStripe } from '@/lib/stripe/server';

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

        // ユーザー情報を取得
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
        }

        const stripeCustomerId = user.stripeCustomerId;

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
