// ========================================
// 広告画像生成API
// ========================================


import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, generations } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { generateRateLimit } from '@/lib/ratelimit';

// Gemini APIクライアントの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// リクエストボディのZodスキーマ定義
const generateRequestSchema = z.object({
    format: z.string().min(1, 'フォーマットは必須です'),
    // 各目的ごとの主要項目（すべてオプショナルとして受け取る）
    productName: z.string().max(100, '長すぎます').optional(),
    campaignName: z.string().max(100, '長すぎます').optional(),
    eventName: z.string().max(100, '長すぎます').optional(),
    jobTitle: z.string().max(100, '長すぎます').optional(),
    brandName: z.string().max(100, '長すぎます').optional(),
    appName: z.string().max(100, '長すぎます').optional(),
    materialName: z.string().max(100, '長すぎます').optional(),
    storeName: z.string().max(100, '長すぎます').optional(),
    
    // 共通項目
    catchCopy: z.string().max(200, 'キャッチコピーが長すぎます').optional(),
    description: z.string().max(1000, '商品説明が長すぎます').optional(),
    targetAudience: z.string().max(100, 'ターゲット指定が長すぎます').optional(),
    tone: z.string().min(1).default('modern'),
    primaryColor: z.string().default('auto'),
    secondaryColor: z.string().default('auto'),
    autoColor: z.boolean().optional(),
    referenceImage: z.string()
        .refine(val => !val || val.startsWith('data:image/'), { message: '不正な画像データです' })
        .optional(),
}).passthrough(); // 他の不要なフィールドは無視して通過させる

// 広告フォーマットの定義
const formatDimensions: Record<string, { width: number; height: number }> = {
    'instagram-story': { width: 1080, height: 1920 },
    'instagram-feed': { width: 1080, height: 1080 },
    'facebook-ad': { width: 1200, height: 628 },
    'twitter-post': { width: 1200, height: 675 },
    'youtube-thumbnail': { width: 1280, height: 720 },
    'google-display': { width: 300, height: 250 },
    'ec-banner': { width: 728, height: 90 },
    'product-image': { width: 800, height: 800 },
};

// トーンの説明
const toneDescriptions: Record<string, string> = {
    modern: 'モダンで洗練された現代的なスタイル、クリーンなライン、ミニマルな装飾',
    cute: '可愛らしく親しみやすいスタイル、柔らかい色調、丸みのある要素',
    luxury: '高級感のある上品なスタイル、ゴールドやダークカラー、エレガントなタイポグラフィ',
    pop: '明るく元気なポップスタイル、ビビッドカラー、遊び心のある要素',
    minimal: 'シンプルで洗練されたミニマルスタイル、余白を活かしたデザイン',
    bold: '大胆でインパクトのあるスタイル、強いコントラスト、目を引く構図',
};


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

        // レートリミットのチェック（ユーザーIDベース）
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

        // クレジットチェック
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

        // リクエストボディのパースとZodによる厳密なバリデーション
        let body;
        try {
            const rawBody = await request.json();
            body = generateRequestSchema.parse(rawBody);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: '入力内容に誤りがあります', details: error.flatten().fieldErrors },
                    { status: 400 }
                );
            }
            return NextResponse.json({ error: '無効なリクエストです' }, { status: 400 });
        }

        const {
            format,
            productName,
            campaignName,
            eventName,
            jobTitle,
            brandName,
            appName,
            materialName,
            storeName,
            catchCopy,
            description,
            targetAudience,
            tone,
            primaryColor,
            secondaryColor,
            autoColor,
            referenceImage, // 参考画像（Base64）
        } = body;

        // メインの名称を決定（いずれか1つがあればOK）
        const mainSubjectName = productName || campaignName || eventName || jobTitle || brandName || appName || materialName || storeName;

        if (!mainSubjectName) {
            return NextResponse.json(
                { error: '商品名やイベント名などの主要な対象名を入力してください' },
                { status: 400 }
            );
        }

        // フォーマットの取得
        const dimensions = formatDimensions[format];
        if (!dimensions) {
            return NextResponse.json(
                { error: '無効なフォーマットです' },
                { status: 400 }
            );
        }

        // トーンの説明を取得
        const toneDesc = toneDescriptions[tone] || toneDescriptions.modern;

        // プロンプトの生成
        const prompt = buildImagePrompt({
            productName: mainSubjectName,
            catchCopy,
            description,
            targetAudience,
            toneDesc,
            primaryColor: autoColor ? 'auto' : primaryColor,
            secondaryColor: autoColor ? 'auto' : secondaryColor,
            dimensions,
            format,
            hasReferenceImage: !!referenceImage,
        });

        // Gemini APIで画像生成
        const model = genAI.getGenerativeModel({
            model: 'gemini-3.1-flash-image-preview',
            generationConfig: {
                // @ts-expect-error - responseModalities is valid for Gemini models
                responseModalities: ['Text', 'Image'],
            }
        });

        // コンテンツパーツを構築
        const contentParts: Part[] = [{ text: prompt }];

        // 参考画像がある場合は追加
        if (referenceImage) {
            const base64Match = referenceImage.match(/^data:([^;]+);base64,(.+)$/);
            if (base64Match) {
                const mimeType = base64Match[1];
                const base64Data = base64Match[2];
                contentParts.push({
                    inlineData: {
                        mimeType,
                        data: base64Data,
                    }
                });
            }
        }

        const result = await model.generateContent(contentParts);
        const response = result.response;
        const parts = response.candidates?.[0]?.content?.parts || [];

        let imageData: string | null = null;
        let textContent = '';
        // Gemini 3.1の思考シグネチャを抽出（編集時の精度向上に使用）
        let thoughtSignature: string | null = null;

        for (const part of parts) {
            const thoughtSignatureValue = 'thoughtSignature' in part
                ? (part as Record<string, unknown>).thoughtSignature
                : undefined;
            if ('inlineData' in part && part.inlineData) {
                imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            } else if ('text' in part && part.text) {
                textContent = part.text;
            } else if (typeof thoughtSignatureValue === 'string') {
                thoughtSignature = thoughtSignatureValue;
            }
        }

        if (!imageData) {
            return NextResponse.json({
                success: true,
                message: textContent || 'プロンプトを生成しました。実際の画像生成は追加設定が必要です。',
                prompt: prompt,
                imageUrl: null,
            });
        }

        // --- R2へのアップロード ---
        let storedImageUrl = imageData;
        try {
            const { uploadImageToR2 } = await import('@/lib/storage');
            const fileName = `generated/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
            storedImageUrl = await uploadImageToR2(imageData, fileName);
        } catch (error) {
            console.error('R2 Upload failed:', error);
            return NextResponse.json({
                error: '画像の保存（R2アップロード）に失敗しました',
                details: error instanceof Error ? error.message : 'Storage upload failed'
            }, { status: 500 });
        }

        // --- 成功時の後処理 (Drizzle Transaction) ---
        await db.transaction(async (tx) => {
            // 1. クレジット消費 (管理者はスキップ)
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
                // 管理者の場合も通算生成数などは更新しておく（任意）
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
                thumbnailUrl: storedImageUrl, // 将来的にリサイズしたものを入れる場合はここで分ける
                format: format,
                prompt: prompt,
                templateId: 'custom',
                status: 'completed',
                creditsUsed: isAdmin ? 0 : 1,
                content: {
                    productName: mainSubjectName,
                    catchphrase: catchCopy || '',
                    description: description || '',
                    targetAudience: targetAudience || '',
                },
                branding: {
                    tone,
                    primaryColor: autoColor ? 'auto' : primaryColor,
                    secondaryColor: autoColor ? 'auto' : secondaryColor,
                    autoColor: !!autoColor,
                }
            });
        });

        return NextResponse.json({
            success: true,
            imageUrl: storedImageUrl,
            prompt: prompt,
            dimensions,
            // 思考シグネチャ（次の編集リクエスト時に渡すと編集精度が向上）
            thoughtSignature: thoughtSignature ?? undefined,
        });

    } catch (error) {
        console.error('=== Image generation error ===');
        console.error('Error type:', typeof error);
        console.error('Error message:', error instanceof Error ? error.message : String(error));
        console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
        const detailedError = error as Error & {
            response?: {
                status?: number;
                data?: unknown;
                text?: () => unknown;
            };
            errorDetails?: unknown;
        };
        if (detailedError.response) {
            console.error('API Response status:', detailedError.response.status);
            console.error('API Response data:', JSON.stringify(detailedError.response.data || detailedError.response.text?.() || 'N/A'));
        }
        if (detailedError.errorDetails) {
            console.error('Error details:', JSON.stringify(detailedError.errorDetails));
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            {
                error: '画像生成中にエラーが発生しました',
                details: errorMessage,
            },
            { status: 500 }
        );
    }
}

// プロンプト生成関数
function buildImagePrompt(params: {
    productName: string;
    catchCopy?: string;
    description?: string;
    targetAudience?: string;
    toneDesc: string;
    primaryColor: string;
    secondaryColor: string;
    dimensions: { width: number; height: number };
    format: string;
    hasReferenceImage?: boolean;
}): string {
    const {
        productName,
        catchCopy,
        description,
        targetAudience,
        toneDesc,
        primaryColor,
        secondaryColor,
        dimensions,
        format,
        hasReferenceImage,
    } = params;

    const referenceImageInstruction = hasReferenceImage
        ? `
【参考画像について】
添付された参考画像を分析し、以下の点を広告に反映してください：
- 画像に写っている商品のビジュアル要素（形状、質感、特徴）
- 画像の雰囲気やスタイルを参考に
- 商品の魅力的な見せ方を参考画像から学び取る
`
        : '';

    return `
あなたはプロの広告デザイナーです。以下の条件に基づいて、魅力的な広告画像を生成してください。

【商品情報】
- 商品名: ${productName}
${catchCopy ? `- キャッチコピー: ${catchCopy}` : ''}
${description ? `- 商品説明: ${description}` : ''}
${targetAudience ? `- ターゲット: ${targetAudience}` : ''}
${referenceImageInstruction}
【デザイン要件】
- フォーマット: ${format}
- サイズ: ${dimensions.width}x${dimensions.height}px
- デザインスタイル: ${toneDesc}
- メインカラー: ${primaryColor}
- サブカラー: ${secondaryColor}

【重要な指示】
1. 商品の魅力を最大限に引き出す構図
2. ターゲットに訴求する視覚的要素
3. キャッチコピーがある場合は読みやすく配置
4. ${primaryColor === 'auto' ? 'デザインテイストや参考画像、商品の雰囲気に最も適した配色をAIが自動で選択して適用' : '指定されたカラースキーム（メインカラー、サブカラー）を効果的に活用'}
5. プロフェッショナルな広告として完成度の高いデザイン
6. SNSやウェブで映える目を引くビジュアル
${hasReferenceImage ? '7. 参考画像の商品・スタイルを活かしたデザイン' : ''}
${primaryColor === 'auto' ? '8. 配色は商品のブランドイメージや高級感、あるいはターゲットの嗜好に合わせた調和のとれたものにする' : ''}

広告画像を生成してください。
`.trim();
}
