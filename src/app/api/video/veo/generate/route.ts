import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { veoRequestSchema, startVeoGeneration } from '@/lib/veo';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { canUseVeo, getVeoCreditCost } from '@/lib/video-billing';

async function getSessionOrDevSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return session;
  }

  if (process.env.NODE_ENV === 'development') {
    return {
      user: {
        id: 'dev-user-id',
        email: 'dev@example.com',
        name: 'Dev User',
      },
    } as never;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    if (process.env.ENABLE_VEO_VIDEO !== 'true') {
      return NextResponse.json(
        { error: 'Veo試験機能は無効です。ENABLE_VEO_VIDEO=true を設定してください。' },
        { status: 403 }
      );
    }

    const session = await getSessionOrDevSession();
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = veoRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || '入力内容が不正です' }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const plan = user.plan || 'free';

    if (!isAdmin && !canUseVeo(plan)) {
      return NextResponse.json(
        { error: 'Veo 3.1 Lite 動画生成は Starter プラン以上で利用できます。' },
        { status: 403 }
      );
    }

    const requiredCredits = getVeoCreditCost(parsed.data.durationSeconds);

    if (!isAdmin && (user.credits || 0) < requiredCredits) {
      return NextResponse.json(
        { error: `クレジットが不足しています。${requiredCredits}クレジット必要です。` },
        { status: 403 }
      );
    }

    const operation = await startVeoGeneration(parsed.data);

    if (!operation.name) {
      return NextResponse.json({ error: 'Veo operation name を取得できませんでした。' }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      operationName: operation.name,
      creditsUsed: isAdmin ? 0 : requiredCredits,
    });
  } catch (error) {
    console.error('Veo generate route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Veo動画生成の開始に失敗しました。' },
      { status: 500 }
    );
  }
}
