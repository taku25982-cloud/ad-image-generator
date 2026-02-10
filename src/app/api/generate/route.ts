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

// Gemini APIクライアントの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

        // クレジットチェック
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
        }

        if ((user.credits || 0) <= 0) {
            return NextResponse.json({ error: 'クレジットが不足しています' }, { status: 403 });
        }

        // リクエストボディのパース
        const body = await request.json() as any;
        const {
            format,
            productName,
            catchCopy,
            description,
            targetAudience,
            tone,
            primaryColor,
            secondaryColor,
            referenceImage, // 参考画像（Base64）
        } = body;

        // バリデーション
        if (!format || !productName) {
            return NextResponse.json(
                { error: '必須項目が不足しています' },
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
            productName,
            catchCopy,
            description,
            targetAudience,
            toneDesc,
            primaryColor,
            secondaryColor,
            dimensions,
            format,
            hasReferenceImage: !!referenceImage,
        });

        // Gemini APIで画像生成
        const model = genAI.getGenerativeModel({
            model: 'gemini-3-pro-image-preview',
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

        for (const part of parts) {
            if ('inlineData' in part && part.inlineData) {
                imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            } else if ('text' in part && part.text) {
                textContent = part.text;
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
        await db.transaction(async (tx: typeof db) => {
            // 1. クレジット消費
            await tx.update(users)
                .set({
                    credits: sql`${users.credits} - 1`,
                    usageTotalGenerations: sql`${users.usageTotalGenerations} + 1`,
                    usageMonthlyGenerations: sql`${users.usageMonthlyGenerations} + 1`,
                    usageLastGenerationAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userId));

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
                creditsUsed: 1,
                content: {
                    productName,
                    catchphrase: catchCopy || '',
                    description: description || '',
                    targetAudience: targetAudience || '',
                },
                branding: {
                    primaryColor,
                    secondaryColor,
                }
            });
        });

        return NextResponse.json({
            success: true,
            imageUrl: storedImageUrl,
            prompt: prompt,
            dimensions,
        });

    } catch (error) {
        console.error('=== Image generation error ===');
        console.error('Error type:', typeof error);
        console.error('Error message:', error instanceof Error ? error.message : String(error));
        console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyError = error as any;
        if (anyError?.response) {
            console.error('API Response status:', anyError.response?.status);
            console.error('API Response data:', JSON.stringify(anyError.response?.data || anyError.response?.text?.() || 'N/A'));
        }
        if (anyError?.errorDetails) {
            console.error('Error details:', JSON.stringify(anyError.errorDetails));
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
4. 指定されたカラースキームを活用
5. プロフェッショナルな広告として完成度の高いデザイン
6. SNSやウェブで映える目を引くビジュアル
${hasReferenceImage ? '7. 参考画像の商品・スタイルを活かしたデザイン' : ''}

広告画像を生成してください。
`.trim();
}
