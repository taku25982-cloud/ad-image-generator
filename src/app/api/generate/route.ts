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
    objective: z.string().min(1, '広告の目的は必須です'),
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
    price: z.string().max(100, '価格が長すぎます').optional(),
    catchCopy: z.string().max(200, 'キャッチコピーが長すぎます').optional(),
    description: z.string().max(1000, '商品説明が長すぎます').optional(),
    targetAudience: z.string().max(100, 'ターゲット指定が長すぎます').optional(),
    discountInfo: z.string().max(200, '割引内容が長すぎます').optional(),
    campaignPeriod: z.string().max(200, '期間が長すぎます').optional(),
    campaignTargets: z.string().max(1000, '対象商品・備考が長すぎます').optional(),
    eventDateTime: z.string().max(200, '開催日時が長すぎます').optional(),
    eventLocation: z.string().max(300, '開催場所が長すぎます').optional(),
    eventContent: z.string().max(1000, 'イベント内容が長すぎます').optional(),
    companyName: z.string().max(200, '会社名が長すぎます').optional(),
    jobBenefits: z.string().max(1000, '福利厚生・アピールポイントが長すぎます').optional(),
    jobRequirements: z.string().max(1000, '必須スキル・求める人物像が長すぎます').optional(),
    brandMessage: z.string().max(300, 'ブランドメッセージが長すぎます').optional(),
    brandCoreValue: z.string().max(1000, 'コアバリューが長すぎます').optional(),
    appFeatures: z.string().max(1000, 'アプリ機能が長すぎます').optional(),
    appTargetUser: z.string().max(200, '想定ユーザーが長すぎます').optional(),
    appDownloadBenefit: z.string().max(300, 'ダウンロード特典が長すぎます').optional(),
    materialBenefits: z.string().max(1000, '資料メリットが長すぎます').optional(),
    leadCallToAction: z.string().max(300, '行動喚起が長すぎます').optional(),
    storeLocation: z.string().max(300, '店舗場所が長すぎます').optional(),
    signatureMenu: z.string().max(300, '看板メニューが長すぎます').optional(),
    specialOffer: z.string().max(300, '来店特典が長すぎます').optional(),
    customInstructions: z.string().max(4000, 'カスタム指示が長すぎます').optional(),
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

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const GENERATION_RETRY_DELAYS_MS = [1200, 2500];

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getErrorStatusCode(error: unknown): number | null {
    if (!error || typeof error !== 'object') {
        return null;
    }

    const errorRecord = error as Record<string, unknown>;
    const response = errorRecord.response;

    if (response && typeof response === 'object') {
        const status = (response as Record<string, unknown>).status;
        if (typeof status === 'number') {
            return status;
        }
    }

    const message = errorRecord.message;
    if (typeof message === 'string') {
        const statusMatch = message.match(/\[(\d{3})[^\]]*\]/);
        if (statusMatch) {
            return Number(statusMatch[1]);
        }
    }

    return null;
}

function isRetryableGenerationError(error: unknown) {
    const status = getErrorStatusCode(error);
    if (status && RETRYABLE_STATUS_CODES.has(status)) {
        return true;
    }

    const message = error instanceof Error ? error.message : String(error);
    return /high demand|service unavailable|temporar/i.test(message);
}

async function generateContentWithRetry(model: ReturnType<typeof genAI.getGenerativeModel>, contentParts: Part[]) {
    let lastError: unknown;

    for (let attempt = 0; attempt <= GENERATION_RETRY_DELAYS_MS.length; attempt++) {
        try {
            return await model.generateContent(contentParts);
        } catch (error) {
            lastError = error;

            if (!isRetryableGenerationError(error) || attempt === GENERATION_RETRY_DELAYS_MS.length) {
                throw error;
            }

            await sleep(GENERATION_RETRY_DELAYS_MS[attempt]);
        }
    }

    throw lastError instanceof Error ? lastError : new Error('画像生成に失敗しました');
}

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
            objective,
            productName,
            campaignName,
            eventName,
            jobTitle,
            brandName,
            appName,
            materialName,
            storeName,
            price,
            catchCopy,
            description,
            targetAudience,
            discountInfo,
            campaignPeriod,
            campaignTargets,
            eventDateTime,
            eventLocation,
            eventContent,
            companyName,
            jobBenefits,
            jobRequirements,
            brandMessage,
            brandCoreValue,
            appFeatures,
            appTargetUser,
            appDownloadBenefit,
            materialBenefits,
            leadCallToAction,
            storeLocation,
            signatureMenu,
            specialOffer,
            customInstructions,
            tone,
            primaryColor,
            secondaryColor,
            autoColor,
            referenceImage, // 参考画像（Base64）
        } = body;

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
            objective,
            productName,
            campaignName,
            eventName,
            jobTitle,
            brandName,
            appName,
            materialName,
            storeName,
            price,
            catchCopy,
            description,
            targetAudience,
            discountInfo,
            campaignPeriod,
            campaignTargets,
            eventDateTime,
            eventLocation,
            eventContent,
            companyName,
            jobBenefits,
            jobRequirements,
            brandMessage,
            brandCoreValue,
            appFeatures,
            appTargetUser,
            appDownloadBenefit,
            materialBenefits,
            leadCallToAction,
            storeLocation,
            signatureMenu,
            specialOffer,
            customInstructions,
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

        const result = await generateContentWithRetry(model, contentParts);
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
                    objective,
                    productName: productName || '',
                    campaignName: campaignName || '',
                    eventName: eventName || '',
                    jobTitle: jobTitle || '',
                    brandName: brandName || '',
                    appName: appName || '',
                    materialName: materialName || '',
                    storeName: storeName || '',
                    price: price || '',
                    catchphrase: catchCopy || '',
                    description: description || '',
                    targetAudience: targetAudience || '',
                    discountInfo: discountInfo || '',
                    campaignPeriod: campaignPeriod || '',
                    campaignTargets: campaignTargets || '',
                    eventDateTime: eventDateTime || '',
                    eventLocation: eventLocation || '',
                    eventContent: eventContent || '',
                    companyName: companyName || '',
                    jobBenefits: jobBenefits || '',
                    jobRequirements: jobRequirements || '',
                    brandMessage: brandMessage || '',
                    brandCoreValue: brandCoreValue || '',
                    appFeatures: appFeatures || '',
                    appTargetUser: appTargetUser || '',
                    appDownloadBenefit: appDownloadBenefit || '',
                    materialBenefits: materialBenefits || '',
                    leadCallToAction: leadCallToAction || '',
                    storeLocation: storeLocation || '',
                    signatureMenu: signatureMenu || '',
                    specialOffer: specialOffer || '',
                    customInstructions: customInstructions || '',
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
        const errorStatusCode = getErrorStatusCode(error);
        const isHighDemandError = errorStatusCode === 503 || /high demand|service unavailable/i.test(errorMessage);

        return NextResponse.json(
            {
                error: isHighDemandError
                    ? '画像生成サービスが一時的に混み合っています。少し時間をおいて再度お試しください'
                    : '画像生成中にエラーが発生しました',
                details: isHighDemandError
                    ? `生成モデル側で一時的な高負荷が発生しています（${errorMessage}）`
                    : errorMessage,
            },
            { status: isHighDemandError ? 503 : 500 }
        );
    }
}

// プロンプト生成関数
function buildImagePrompt(params: {
    objective: string;
    productName?: string;
    campaignName?: string;
    eventName?: string;
    jobTitle?: string;
    brandName?: string;
    appName?: string;
    materialName?: string;
    storeName?: string;
    price?: string;
    catchCopy?: string;
    description?: string;
    targetAudience?: string;
    discountInfo?: string;
    campaignPeriod?: string;
    campaignTargets?: string;
    eventDateTime?: string;
    eventLocation?: string;
    eventContent?: string;
    companyName?: string;
    jobBenefits?: string;
    jobRequirements?: string;
    brandMessage?: string;
    brandCoreValue?: string;
    appFeatures?: string;
    appTargetUser?: string;
    appDownloadBenefit?: string;
    materialBenefits?: string;
    leadCallToAction?: string;
    storeLocation?: string;
    signatureMenu?: string;
    specialOffer?: string;
    customInstructions?: string;
    toneDesc: string;
    primaryColor: string;
    secondaryColor: string;
    dimensions: { width: number; height: number };
    format: string;
    hasReferenceImage?: boolean;
}): string {
    const {
        objective,
        productName,
        campaignName,
        eventName,
        jobTitle,
        brandName,
        appName,
        materialName,
        storeName,
        price,
        catchCopy,
        description,
        targetAudience,
        discountInfo,
        campaignPeriod,
        campaignTargets,
        eventDateTime,
        eventLocation,
        eventContent,
        companyName,
        jobBenefits,
        jobRequirements,
        brandMessage,
        brandCoreValue,
        appFeatures,
        appTargetUser,
        appDownloadBenefit,
        materialBenefits,
        leadCallToAction,
        storeLocation,
        signatureMenu,
        specialOffer,
        customInstructions,
        toneDesc,
        primaryColor,
        secondaryColor,
        dimensions,
        format,
        hasReferenceImage,
    } = params;

    const objectiveLabel = getObjectiveLabel(objective);
    const objectiveDetails = buildObjectiveDetails({
        objective,
        productName,
        campaignName,
        eventName,
        jobTitle,
        brandName,
        appName,
        materialName,
        storeName,
        price,
        catchCopy,
        description,
        targetAudience,
        discountInfo,
        campaignPeriod,
        campaignTargets,
        eventDateTime,
        eventLocation,
        eventContent,
        companyName,
        jobBenefits,
        jobRequirements,
        brandMessage,
        brandCoreValue,
        appFeatures,
        appTargetUser,
        appDownloadBenefit,
        materialBenefits,
        leadCallToAction,
        storeLocation,
        signatureMenu,
        specialOffer,
        customInstructions,
    });
    const exactCopyRules = buildExactCopyRules({
        objective,
        productName,
        campaignName,
        eventName,
        jobTitle,
        brandName,
        appName,
        materialName,
        storeName,
        price,
        catchCopy,
        discountInfo,
        campaignPeriod,
        eventDateTime,
        eventLocation,
        brandMessage,
        leadCallToAction,
        specialOffer,
    });

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

【広告の目的】
- ${objectiveLabel}

【入力情報】
${objectiveDetails}
${exactCopyRules ? `\n【テキスト固定ルール】\n${exactCopyRules}\n` : ''}
${customInstructions ? `\n【カスタム指示】\n${customInstructions}\n` : ''}
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
3. 入力された文言のうち画像内に載せるものは、意味を変えず、要約せず、別表現に言い換えず、そのままの文言で読みやすく配置
4. ${primaryColor === 'auto' ? 'デザインテイストや参考画像、商品の雰囲気に最も適した配色をAIが自動で選択して適用' : '指定されたカラースキーム（メインカラー、サブカラー）を効果的に活用'}
5. プロフェッショナルな広告として完成度の高いデザイン
6. SNSやウェブで映える目を引くビジュアル
${hasReferenceImage ? '7. 参考画像の商品・スタイルを活かしたデザイン' : ''}
${primaryColor === 'auto' ? '8. 配色は商品のブランドイメージや高級感、あるいはターゲットの嗜好に合わせた調和のとれたものにする' : ''}

広告画像を生成してください。
`.trim();
}

function getObjectiveLabel(objective: string): string {
    const labels: Record<string, string> = {
        'new-product': '新商品・サービス紹介',
        'sale-campaign': 'セール・キャンペーン告知',
        'event-seminar': 'イベント・セミナー集客',
        'recruitment': '採用・求人募集',
        'brand-awareness': 'ブランド認知・PR',
        'app-install': 'アプリインストール促進',
        'lead-generation': 'リード獲得・資料請求',
        'store-visit': '実店舗への来店促進',
    };

    return labels[objective] || objective;
}

function detailLine(label: string, value?: string): string {
    return value ? `- ${label}: ${value}` : '';
}

function exactCopyLine(label: string, value?: string): string {
    return value ? `- ${label}は画像に載せる場合、文言を一字一句そのまま使用する: 「${value}」` : '';
}

function buildObjectiveDetails(params: {
    objective: string;
    productName?: string;
    campaignName?: string;
    eventName?: string;
    jobTitle?: string;
    brandName?: string;
    appName?: string;
    materialName?: string;
    storeName?: string;
    price?: string;
    catchCopy?: string;
    description?: string;
    targetAudience?: string;
    discountInfo?: string;
    campaignPeriod?: string;
    campaignTargets?: string;
    eventDateTime?: string;
    eventLocation?: string;
    eventContent?: string;
    companyName?: string;
    jobBenefits?: string;
    jobRequirements?: string;
    brandMessage?: string;
    brandCoreValue?: string;
    appFeatures?: string;
    appTargetUser?: string;
    appDownloadBenefit?: string;
    materialBenefits?: string;
    leadCallToAction?: string;
    storeLocation?: string;
    signatureMenu?: string;
    specialOffer?: string;
    customInstructions?: string;
}): string {
    const linesByObjective: Record<string, string[]> = {
        'new-product': [
            detailLine('商品名', params.productName),
            detailLine('価格', params.price),
            detailLine('キャッチコピー', params.catchCopy),
            detailLine('商品説明', params.description),
            detailLine('ターゲット層', params.targetAudience),
        ],
        'sale-campaign': [
            detailLine('セール名・キャンペーン名', params.campaignName),
            detailLine('特典・割引内容', params.discountInfo),
            detailLine('期間', params.campaignPeriod),
            detailLine('対象商品・備考', params.campaignTargets),
        ],
        'event-seminar': [
            detailLine('イベント名・セミナー名', params.eventName),
            detailLine('開催日時', params.eventDateTime),
            detailLine('開催場所', params.eventLocation),
            detailLine('イベント内容・対象者', params.eventContent),
        ],
        'recruitment': [
            detailLine('募集職種', params.jobTitle),
            detailLine('会社名', params.companyName),
            detailLine('福利厚生・アピールポイント', params.jobBenefits),
            detailLine('必須スキル・求める人物像', params.jobRequirements),
        ],
        'brand-awareness': [
            detailLine('ブランド名・企業名', params.brandName),
            detailLine('ブランドメッセージ', params.brandMessage),
            detailLine('コアバリュー・アピールポイント', params.brandCoreValue),
        ],
        'app-install': [
            detailLine('アプリ名', params.appName),
            detailLine('主要な機能・メリット', params.appFeatures),
            detailLine('想定ユーザー', params.appTargetUser),
            detailLine('ダウンロード特典・始めやすさ', params.appDownloadBenefit),
        ],
        'lead-generation': [
            detailLine('資料名・特典名', params.materialName),
            detailLine('得られるメリット・内容', params.materialBenefits),
            detailLine('行動喚起', params.leadCallToAction),
        ],
        'store-visit': [
            detailLine('店舗名', params.storeName),
            detailLine('店舗の場所・アクセス', params.storeLocation),
            detailLine('看板メニュー・目玉商品', params.signatureMenu),
            detailLine('来店特典', params.specialOffer),
        ],
    };

    const lines = linesByObjective[params.objective] || [];
    return lines.filter(Boolean).join('\n');
}

function buildExactCopyRules(params: {
    objective: string;
    productName?: string;
    campaignName?: string;
    eventName?: string;
    jobTitle?: string;
    brandName?: string;
    appName?: string;
    materialName?: string;
    storeName?: string;
    price?: string;
    catchCopy?: string;
    discountInfo?: string;
    campaignPeriod?: string;
    eventDateTime?: string;
    eventLocation?: string;
    brandMessage?: string;
    leadCallToAction?: string;
    specialOffer?: string;
}): string {
    const linesByObjective: Record<string, string[]> = {
        'new-product': [
            exactCopyLine('商品名', params.productName),
            exactCopyLine('価格', params.price),
            exactCopyLine('キャッチコピー', params.catchCopy),
        ],
        'sale-campaign': [
            exactCopyLine('セール名・キャンペーン名', params.campaignName),
            exactCopyLine('特典・割引内容', params.discountInfo),
            exactCopyLine('期間', params.campaignPeriod),
        ],
        'event-seminar': [
            exactCopyLine('イベント名・セミナー名', params.eventName),
            exactCopyLine('開催日時', params.eventDateTime),
            exactCopyLine('開催場所', params.eventLocation),
        ],
        'recruitment': [
            exactCopyLine('募集職種', params.jobTitle),
        ],
        'brand-awareness': [
            exactCopyLine('ブランド名・企業名', params.brandName),
            exactCopyLine('ブランドメッセージ', params.brandMessage),
        ],
        'app-install': [
            exactCopyLine('アプリ名', params.appName),
        ],
        'lead-generation': [
            exactCopyLine('資料名・特典名', params.materialName),
            exactCopyLine('行動喚起', params.leadCallToAction),
        ],
        'store-visit': [
            exactCopyLine('店舗名', params.storeName),
            exactCopyLine('来店特典', params.specialOffer),
        ],
    };

    const baseRules = [
        '上記の固定対象テキストは、誤字修正、要約、言い換え、翻訳、語尾変更、句読点変更、記号変更、半角全角の勝手な置換をしない。',
        '文字数が多い場合は短く書き換えるのではなく、改行やサイズ調整で対応する。',
        '固定対象以外の補助説明を追加する場合も、固定対象テキストと意味が衝突しないようにする。',
    ];

    const lines = linesByObjective[params.objective] || [];
    const filteredLines = lines.filter(Boolean);

    if (filteredLines.length === 0) {
        return '';
    }

    return [...filteredLines, ...baseRules].join('\n');
}
