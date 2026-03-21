import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

// レンダリング設定のZodスキーマ
const renderRequestSchema = z.object({
  inputProps: z.object({
    titleText: z.string(),
    subText: z.string(),
    imageUrl: z.string(),
    bgColors: z.array(z.string()).length(2),
  }),
  config: z.object({
    width: z.number(),
    height: z.number(),
    fps: z.number(),
    durationInFrames: z.number(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // 1. 認証チェック
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userId = session.user.id;

    // 2. ユーザー情報の取得とクレジットチェック (動画生成は10クレジットなど重めに設定可能)
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const requiredCredits = 5; // 動画生成は重いので5クレジット消費とする

    if (!isAdmin && (user.credits || 0) < requiredCredits) {
      return NextResponse.json({ error: `クレジットが不足しています (必要: ${requiredCredits})` }, { status: 403 });
    }

    // 3. ボディパース
    const reqBody = await request.json();
    const result = renderRequestSchema.safeParse(reqBody);

    if (!result.success) {
      return NextResponse.json({ error: '無効な要求パラメータです' }, { status: 400 });
    }

    const { inputProps, config } = result.data;

    // 4. Render.com上のレンダリングサーバーへプロキシ実行
    // 環境変数 RENDER_SERVICE_URL が設定されている想定
    // 例: https://remotion-render-service.onrender.com/render
    const renderServerUrl = process.env.RENDER_SERVICE_URL;

    if (!renderServerUrl) {
      if (process.env.NODE_ENV === 'development') {
        // 開発環境用のシミュレーション（モック）：サンプル動画を返して完了とする
        console.warn('RENDER_SERVICE_URL is not set. Using mock video for development.');
        
        // パブリックなサンプル動画（Big Buck Bunnyなど）を取得してそのまま返す
        const mockUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
        const mockRes = await fetch(mockUrl);
        
        if (!mockRes.ok) {
           return NextResponse.json({ error: 'レンダリングサーバーが構成されておらず、モック動画の取得にも失敗しました。' }, { status: 500 });
        }

        const videoBuffer = await mockRes.arrayBuffer();

        // クレジット消費などのDB更新処理を共通化するために後続へ繋げるのは難しいため、ここで完結させる
        await db.transaction(async (tx) => {
          const updateData = {
            usageTotalGenerations: sql`${users.usageTotalGenerations} + 1`,
            usageMonthlyGenerations: sql`${users.usageMonthlyGenerations} + 1`,
            usageLastGenerationAt: new Date(),
            updatedAt: new Date(),
          };

          if (!isAdmin) {
            await tx.update(users)
              .set({
                ...updateData,
                credits: sql`${users.credits} - ${requiredCredits}`,
              })
              .where(eq(users.id, userId));
          } else {
            await tx.update(users)
              .set(updateData)
              .where(eq(users.id, userId));
          }
        });

        return new NextResponse(videoBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Length': videoBuffer.byteLength.toString(),
            'Content-Disposition': 'attachment; filename="ad-video-mock.mp4"',
          },
        });
      }

      return NextResponse.json({ error: 'レンダリングサーバーが構成されていません。管理者に連絡してください。' }, { status: 500 });
    }

    console.log(`Sending render request to ${renderServerUrl}...`);

    const response = await fetch(`${renderServerUrl}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Render-Secret': process.env.RENDER_SERVER_SECRET || '', // 簡易的な署名/シークレット
      },
      body: JSON.stringify({
        inputProps,
        ...config,
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Render Server Error:', errorText);
        return NextResponse.json({ error: 'レンダリングサーバーでエラーが発生しました。' }, { status: 502 });
    }

    // 5. クレジット消費と利用統計の更新 (成功時のみ)
    await db.transaction(async (tx) => {
        const updateData = {
            usageTotalGenerations: sql`${users.usageTotalGenerations} + 1`,
            usageMonthlyGenerations: sql`${users.usageMonthlyGenerations} + 1`,
            usageLastGenerationAt: new Date(),
            updatedAt: new Date(),
        };

        if (!isAdmin) {
            await tx.update(users)
                .set({
                    ...updateData,
                    credits: sql`${users.credits} - ${requiredCredits}`,
                })
                .where(eq(users.id, userId));
        } else {
            await tx.update(users)
                .set(updateData)
                .where(eq(users.id, userId));
        }
    });

    // 6. サーバーから届いたMP4ストリームをそのままフロントエンドに流す
    const videoBuffer = await response.arrayBuffer();
    
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': videoBuffer.byteLength.toString(),
      },
    });

  } catch (error: unknown) {
    console.error('Video Render API Exception:', error);
    return NextResponse.json(
      { error: '動画レンダリング中に予期せぬエラーが発生しました。' },
      { status: 500 }
    );
  }
}
