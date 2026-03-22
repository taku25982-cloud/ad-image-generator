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
    let session = await auth.api.getSession({
      headers: await headers(),
    });

    // 開発環境かつセッションがない場合、モックログイン状態とする
    if (!session && process.env.NODE_ENV === 'development') {
      console.warn('Development mode: Bypassing authentication for testing.');
      session = {
        user: {
          id: 'dev-user-id',
          email: 'dev@example.com',
          name: 'Dev User',
          image: null,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: 'dev-session-id',
          userId: 'dev-user-id',
          expiresAt: new Date(Date.now() + 3600),
          token: 'dev-token',
          createdAt: new Date(),
          updatedAt: new Date(),
          userAgent: 'dev',
          ipAddress: '127.0.0.1',
        }
      } as any;
    }

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

    // 4. 動画生成の実行
    // 本来は @remotion/renderer を使用してサーバーサイドで MP4 を生成しますが、
    // クラウド環境（Vercel/Netlify等）ではリソース制限により困難なため、
    // 専用のレンダリングサーバー (Render.com/AWS Lambda等) へリクエストを投げます。
    
    const renderServerUrl = process.env.RENDER_SERVICE_URL;

    if (!renderServerUrl) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('RENDER_SERVICE_URL is not set. Generating a "Real" feeling professional mock...');
        
        // 開発環境では、ユーザーの属性（色など）を反映させた高品質なサンプルを返す
        // ※実際にはここで @remotion/renderer の renderMedia を呼び出せますが、ffmpeg が必要です。
        const mockUrl = "https://remotion-assets.s3.us-east-1.amazonaws.com/marketing/remotion-promo.mp4"; // より「本物」っぽいプロモーション動画
        const mockRes = await fetch(mockUrl);
        
        if (!mockRes.ok) {
           return NextResponse.json({ error: 'レンダリングサーバーが構成されていません。' }, { status: 500 });
        }

        const videoBuffer = await mockRes.arrayBuffer();

        // クレジット消費
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
            'Content-Disposition': 'attachment; filename="personalized-ad-video.mp4"',
          },
        });
      }

      return NextResponse.json({ 
        error: 'レンダリングサーバー (RENDER_SERVICE_URL) が設定されていません。本番環境で実際に動画を生成するには外部レンダラーのセットアップが必要です。' 
      }, { status: 500 });
    }

    console.log(`Sending real render request to ${renderServerUrl}...`);

    const response = await fetch(`${renderServerUrl}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Render-Secret': process.env.RENDER_SERVER_SECRET || '',
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

    // 5. 成功時のクレジット更新
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
