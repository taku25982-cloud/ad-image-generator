import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { generateRateLimit } from '@/lib/ratelimit';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const suggestRequestSchema = z.object({
  instruction: z.string().min(1, '指示内容を入力してください').max(500, '指示は500文字以内で入力してください'),
  imageUrl: z.string().optional(),
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

    // 2. レートリミットチェック
    if (generateRateLimit) {
        const { success, limit, reset, remaining } = await generateRateLimit.limit(`video_suggest_${userId}`);
        if (!success) {
            return NextResponse.json(
                { error: 'リクエストが多すぎます。しばらく待ってから再度お試しください。' },
                { 
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': remaining.toString(),
                        'X-RateLimit-Reset': reset.toString(),
                    }
                }
            );
        }
    }

    // 3. ユーザー情報の取得とクレジットチェック
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (!isAdmin && (user.credits || 0) <= 0) {
      return NextResponse.json({ error: 'クレジットが不足しています' }, { status: 403 });
    }

    // 4. ボディパース
    const reqBody = await request.json();
    const result = suggestRequestSchema.safeParse(reqBody);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { instruction, imageUrl } = result.data;

    // 5. Gemini API (gemini-3-flash-preview) の準備
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const prompt = `
あなたは世界最高峰の広告クリエイティブディレクター、かつRemotionエキスパートエンジニアです。
ユーザーから提供された指示と画像に基づき、視聴者の目を引き、コンバージョン率を最大化する広告動画の構成案を策定してください。

## ユーザー指示
"${instruction}"

## 出力要件
以下のプロパティを持つJSONオブジェクトのみを出力してください。
1. titleText: 動画の中心となる強力なキャッチコピー（適宜 "\\n" で改行を含める）。
2. subText: 魅力を補足する短い説明文。
3. bgColors: 視覚的調和が取れ、かつ指示の雰囲気に合致するHexカラーコード2色の配列。
4. formatIndex: 0 (横長16:9), 1 (縦長9:16), 2 (正方形1:1) の中から、指示内容に最も適したサイズ。
5. duration: 動画の推奨再生時間（3〜30秒）。

## 戦略的アドバイス
- 画像が提供されている場合、その色のトーンや被写体の雰囲気を解析し、bgColorsやテキスト内容に反映させてください。
- 背景色は「読みやすさ」を重視し、テキスト（通常は白または明るい色）とのコントラストを確保してください。
- ターゲットを意識した言葉選びを行ってください。
`.trim();

    const parts: Part[] = [];
    
    // 画像データがある場合はPartとして追加（マルチモーダル対応）
    if (imageUrl && imageUrl.startsWith('data:image/')) {
        const [meta, base64Data] = imageUrl.split(';base64,');
        const mimeType = meta.split(':')[1];
        parts.push({
            inlineData: {
                mimeType: mimeType,
                data: base64Data,
            },
        });
    }

    // プロンプトを追加
    parts.push({ text: prompt });

    const geminiResponse = await model.generateContent(parts);
    const responseText = geminiResponse.response.text();
    
    let suggestedParams;
    try {
      suggestedParams = JSON.parse(responseText);
    } catch(e) {
      console.error("Gemini JSON Parsing Error:", responseText);
      return NextResponse.json({ error: 'AIからの応答を解析できませんでした。' }, { status: 500 });
    }

    // 6. クレジット消費と利用統計の更新
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
                    credits: sql`${users.credits} - 1`,
                })
                .where(eq(users.id, userId));
        } else {
            await tx.update(users)
                .set(updateData)
                .where(eq(users.id, userId));
        }
    });

    return NextResponse.json({
      success: true,
      data: suggestedParams,
    });

  } catch (error: any) {
    console.error('Video Suggestion API Exception:', error);
    return NextResponse.json(
      { error: 'サーバー内部エラーが発生しました。' },
      { status: 500 }
    );
  }
}
