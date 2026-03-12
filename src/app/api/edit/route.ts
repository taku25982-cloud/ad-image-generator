// ========================================
// AI画像編集API
// ========================================


import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { generateRateLimit } from '@/lib/ratelimit';

// Gemini APIクライアントの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// リクエストボディのZodスキーマ定義
const editRequestSchema = z.object({
    imageData: z.string().refine(val => val.startsWith('data:image/'), { message: '不正な画像データ形式です' }),
    instruction: z.string().min(1, '編集指示は必須です').max(1000, '指示が長すぎます'),
    editType: z.string().optional(),
    thoughtSignature: z.string().optional(),
    format: z.any().optional(),
    content: z.any().optional(),
    branding: z.any().optional(),
});

export async function POST(request: NextRequest) {
    try {
        // IPアドレスの取得（フォールバック用）
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';

        // 認証
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
        }

        const userId = session.user.id;

        // レートリミットのチェック（ユーザーIDベース。編集は生成と同じリミッターを共有）
        if (generateRateLimit) {
            const { success, limit, reset, remaining } = await generateRateLimit.limit(`generate_${userId}`);
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

        // ユーザー情報取得（プランチェック用）
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
        }

        const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        const plan = user.plan || 'free';

        // 無料プランの場合は編集機能を制限 (管理者はスキップ)
        if (!isAdmin && plan === 'free') {
            return NextResponse.json(
                { error: 'AI編集機能はStarterプラン以上でご利用いただけます。プランをアップグレードしてください。' },
                { status: 403 }
            );
        }

        // リクエストボディのパースとZodによる厳密なバリデーション
        let body;
        try {
            const rawBody = await request.json();
            body = editRequestSchema.parse(rawBody);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: '入力内容に誤りがあります', details: error.flatten().fieldErrors },
                    { status: 400 }
                );
            }
            return NextResponse.json({ error: '無効なリクエストです' }, { status: 400 });
        }

        const { imageData, instruction, editType, thoughtSignature } = body;

        // 編集プロンプトの生成
        const prompt = buildEditPrompt({ instruction, editType });

        // Gemini APIで画像編集
        const model = genAI.getGenerativeModel({
            model: 'gemini-3.1-flash-image-preview',
            generationConfig: {
                // @ts-expect-error - responseModalities is valid for Gemini models
                responseModalities: ['Text', 'Image'],
            },
        });

        // コンテンツパーツを構築（思考シグネチャ → 元画像 → テキスト指示の順）
        const contentParts: Part[] = [];

        // 思考シグネチャがある場合、最初に追加（Gemini 3.1の仕様）
        if (thoughtSignature) {
            contentParts.push({
                // @ts-expect-error - thoughtSignature is valid for Gemini 3.1 models
                thoughtSignature,
            });
        }

        // 元画像を添付
        const base64Match = imageData.match(/^data:([^;]+);base64,(.+)$/);
        if (base64Match) {
            contentParts.push({
                inlineData: {
                    mimeType: base64Match[1],
                    data: base64Match[2],
                },
            });
        }

        contentParts.push({ text: prompt });

        const result = await model.generateContent(contentParts);
        const response = result.response;

        // レスポンスからパーツを取得
        const parts = response.candidates?.[0]?.content?.parts || [];

        let editedImageData: string | null = null;
        let textContent = '';
        // 次の編集のために思考シグネチャを受け取る
        let nextThoughtSignature: string | null = null;

        for (const part of parts) {
            if ('inlineData' in part && part.inlineData) {
                editedImageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            } else if ('text' in part && part.text) {
                textContent = part.text;
            } else if ('thoughtSignature' in part && (part as any).thoughtSignature) {
                nextThoughtSignature = (part as any).thoughtSignature as string;
            }
        }

        if (!editedImageData) {
            return NextResponse.json({
                success: false,
                error: '画像の編集に失敗しました。別の指示で再度お試しください。',
                message: textContent,
            }, { status: 500 });
        }

        // --- R2へのアップロード ---
        let storedImageUrl = editedImageData;
        try {
            const { uploadImageToR2 } = await import('@/lib/storage');
            const fileName = `edited/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
            storedImageUrl = await uploadImageToR2(editedImageData, fileName);
        } catch (error) {
            console.error('R2 Upload failed for edited image:', error);
        }

        // --- データの保存 (Drizzle Transaction) ---
        try {
            const { generations } = await import('@/db/schema');
            const { format, content, branding } = body;

            await db.transaction(async (tx: any) => {
                // 1. 利用統計を更新
                if (!isAdmin) {
                    await tx.update(users)
                        .set({
                            credits: sql`${users.credits} - 1`,
                            usageTotalGenerations: sql`${users.usageTotalGenerations} + 1`,
                            usageMonthlyGenerations: sql`${users.usageMonthlyGenerations} + 1`,
                            usageLastGenerationAt: new Date(),
                            updatedAt: new Date(),
                        })
                        .where(eq(users.id, userId));
                } else {
                    await tx.update(users)
                        .set({
                            usageTotalGenerations: sql`${users.usageTotalGenerations} + 1`,
                            usageLastGenerationAt: new Date(),
                            updatedAt: new Date(),
                        })
                        .where(eq(users.id, userId));
                }

                // 2. 履歴保存
                await tx.insert(generations).values({
                    id: crypto.randomUUID(),
                    userId: userId,
                    imageUrl: storedImageUrl,
                    thumbnailUrl: storedImageUrl,
                    prompt: instruction,
                    templateId: 'edit',
                    status: 'completed',
                    creditsUsed: isAdmin ? 0 : 1,
                    content: content || {
                        instruction: instruction,
                        editType: editType || 'unknown',
                    },
                    format: format || 'custom',
                    branding: branding || {},
                });
            });
        } catch (error) {
            console.error('Failed to update stats or record history:', error);
        }

        return NextResponse.json({
            success: true,
            imageUrl: storedImageUrl,
            message: textContent || '画像を編集しました。',
            // 次の編集リクエストで渡すと連続編集の精度が向上する
            thoughtSignature: nextThoughtSignature ?? undefined,
        });

    } catch (error) {
        console.error('Image edit error:', error);
        return NextResponse.json(
            {
                error: '画像編集中にエラーが発生しました',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// 編集プロンプト生成関数
function buildEditPrompt(params: {
    instruction: string;
    editType?: string;
}): string {
    const { instruction, editType } = params;

    const editTypeGuide: Record<string, string> = {
        text_change: 'テキストの内容やフォント、配置を変更してください。',
        color_adjust: '色味やカラーパレットを調整してください。',
        style_change: 'デザインスタイルや雰囲気を変更してください。',
        element_remove: '不要な要素を除去してください。',
    };

    const guide = editType && editTypeGuide[editType]
        ? `\n編集の種類: ${editTypeGuide[editType]}`
        : '';

    return `
あなたはプロの広告デザイナーです。添付された広告画像に対して、以下の編集指示に従って画像を修正してください。
${guide}
【編集指示】
${instruction}

【重要な注意事項】
1. 元の画像のレイアウトやデザインの品質を維持しながら修正してください。
2. 指示された部分のみを変更し、他の要素にはできるだけ影響を与えないでください。
3. 広告として完成度の高い仕上がりを保ってください。
4. 修正後の画像を出力してください。

修正した広告画像を生成してください。
`.trim();
}
