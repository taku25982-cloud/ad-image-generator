// ========================================
// 広告画像生成API
// ========================================


import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/db';
import { users, generations } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { generateRateLimit } from '@/lib/ratelimit';
import { generateRequestSchema } from '@/lib/api/schemas';
import {
    apiBadRequest,
    apiError,
    apiFromKnownError,
    apiRateLimited,
    apiValidationError,
} from '@/lib/api/responses';
import {
    requireCurrentUser,
    requireOwnedBrandKit,
    requireOwnedGeneration,
    requireOwnedProject,
    requireSessionUser,
} from '@/lib/api/authz';

// Gemini APIクライアントの初期化
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

type GeminiContentPart = {
    text?: string;
    inlineData?: {
        mimeType: string;
        data: string;
    };
    thoughtSignature?: string;
};

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

async function generateContentWithRetry(
    model: string,
    contentParts: GeminiContentPart[],
) {
    let lastError: unknown;

    for (let attempt = 0; attempt <= GENERATION_RETRY_DELAYS_MS.length; attempt++) {
        try {
            return await ai.models.generateContent({
                model,
                contents: contentParts as never,
                config: {
                    responseModalities: ['IMAGE'],
                },
            });
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

type GenerateBody = z.infer<typeof generateRequestSchema>;

interface GeneratedImageResult {
    generationId: string;
    imageUrl: string;
    format: string;
    dimensions: { width: number; height: number };
    thoughtSignature?: string;
    variantLabel?: string;
    prompt?: string;
}

const STRUCTURED_TEMPLATE_MARKER = '【STRUCTURED_TEMPLATE_RULES】';

async function generateImageForFormat(
    model: string,
    baseBody: GenerateBody,
    format: string,
    userId: string,
    brandContext?: string,
    variantInstruction?: string
) {
    const dimensions = formatDimensions[format];
    if (!dimensions) {
        throw new Error(`無効なフォーマットです: ${format}`);
    }

    const toneDesc = toneDescriptions[baseBody.tone] || toneDescriptions.modern;
    const prompt = buildImagePrompt({
        ...baseBody,
        brandContext,
        variantInstruction,
        toneDesc,
        primaryColor: baseBody.autoColor ? 'auto' : baseBody.primaryColor,
        secondaryColor: baseBody.autoColor ? 'auto' : baseBody.secondaryColor,
        dimensions,
        format,
        hasReferenceImage: !!baseBody.referenceImage,
    });

    const contentParts: GeminiContentPart[] = [{ text: prompt }];
    if (baseBody.referenceImage) {
        const base64Match = baseBody.referenceImage.match(/^data:([^;]+);base64,(.+)$/);
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
    const parts = result.candidates?.[0]?.content?.parts || [];

    let imageData: string | null = null;
    let textContent = '';
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
        throw new Error(textContent || '画像データを取得できませんでした');
    }

    const { uploadImageToR2 } = await import('@/lib/storage');
    const fileName = `generated/${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${format}.png`;
    const storedImageUrl = await uploadImageToR2(imageData, fileName);

    return {
        imageUrl: storedImageUrl,
        prompt,
        dimensions,
        thoughtSignature: thoughtSignature ?? undefined,
    };
}

export async function POST(request: NextRequest) {
    try {
        const session = await requireSessionUser();

        const userId = session.user.id;

        // レートリミットのチェック（ユーザーIDベース）
        if (generateRateLimit) {
            const { success, limit, reset, remaining } = await generateRateLimit.limit(`generate_${userId}`);
            if (!success) {
                return apiRateLimited(limit, remaining, reset);
            }
        }

        // クレジットチェック
        const user = await requireCurrentUser(userId);

        const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

        // リクエストボディのパースとZodによる厳密なバリデーション
        let body: GenerateBody;
        try {
            const rawBody = await request.json();
            body = generateRequestSchema.parse(rawBody);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return apiValidationError(error);
            }
            return apiBadRequest();
        }

        const {
            format,
            formats,
            objective,
            brandKitId,
            projectId,
            sourceGenerationId,
            originType,
            variantCount = 1,
            variantMode = 'message',
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
        } = body;

        let brandContext = '';
        let projectContext = '';

        if (brandKitId) {
            const selectedBrandKit = await requireOwnedBrandKit(userId, brandKitId);

            brandContext = [
                selectedBrandKit.name ? `- ブランド名: ${selectedBrandKit.name}` : '',
                selectedBrandKit.description ? `- ブランド説明: ${selectedBrandKit.description}` : '',
                selectedBrandKit.preferredTone ? `- このブランドらしい雰囲気: ${selectedBrandKit.preferredTone}` : '',
                selectedBrandKit.primaryColor ? `- 必ず基調にしたいメインカラー: ${selectedBrandKit.primaryColor}` : '',
                selectedBrandKit.secondaryColor ? `- 補助色として使いたいサブカラー: ${selectedBrandKit.secondaryColor}` : '',
                selectedBrandKit.accentColor ? `- 強調時のアクセントカラー: ${selectedBrandKit.accentColor}` : '',
                Array.isArray(selectedBrandKit.fontPreferences) && selectedBrandKit.fontPreferences.length > 0
                    ? `- 推奨フォントの方向性: ${selectedBrandKit.fontPreferences.join(' / ')}`
                    : '',
                Array.isArray(selectedBrandKit.defaultCopyRules) && selectedBrandKit.defaultCopyRules.length > 0
                    ? `- 必ず優先したいコピー方針: ${selectedBrandKit.defaultCopyRules.join(' / ')}`
                    : '',
                Array.isArray(selectedBrandKit.negativeRules) && selectedBrandKit.negativeRules.length > 0
                    ? `- 絶対に避けたい表現や見せ方: ${selectedBrandKit.negativeRules.join(' / ')}`
                    : '',
            ].filter(Boolean).join('\n');
        }

        if (projectId) {
            const selectedProject = await requireOwnedProject(userId, projectId);

            projectContext = [
                selectedProject.name ? `- プロジェクト名: ${selectedProject.name}` : '',
                selectedProject.description ? `- プロジェクトの狙い: ${selectedProject.description}` : '',
                Array.isArray(selectedProject.tags) && selectedProject.tags.length > 0
                    ? `- プロジェクトタグ: ${selectedProject.tags.join(' / ')}`
                    : '',
                selectedProject.status ? `- プロジェクト状態: ${selectedProject.status}` : '',
            ].filter(Boolean).join('\n');
        }

        if (sourceGenerationId) {
            await requireOwnedGeneration(userId, sourceGenerationId);
        }

        const targetFormats = Array.from(new Set((formats && formats.length > 0 ? formats : [format]).filter(Boolean)));

        if (targetFormats.some((targetFormat) => !formatDimensions[targetFormat])) {
            return apiBadRequest('無効なフォーマットが含まれています');
        }

        const creditsRequired = isAdmin ? 0 : variantCount * targetFormats.length;
        if (!isAdmin && (user.credits || 0) < creditsRequired) {
            return apiError(403, `クレジットが不足しています。${creditsRequired}クレジット必要です`);
        }

        // Gemini APIで画像生成
        const model = 'gemini-3.1-flash-image-preview';

        const variantPresetMap: Record<'message' | 'tone' | 'layout', string[]> = {
            message: [
                '訴求はベネフィット中心で、ひと目で価値が伝わる構成にする。',
                '訴求は信頼感と比較優位が伝わる構成にする。',
                '訴求は緊急性と行動喚起をやや強めて構成する。',
                '訴求は共感と導入しやすさが伝わる構成にする。',
            ],
            tone: [
                '全体をモダンで端正な雰囲気に寄せる。',
                '全体を親しみやすく軽快な雰囲気に寄せる。',
                '全体をプレミアムで高級感のある雰囲気に寄せる。',
                '全体を大胆で視線を奪う雰囲気に寄せる。',
            ],
            layout: [
                '中央に主役を置き、安定感のある構図にする。',
                '余白を活かしたミニマル構図にする。',
                '文字とビジュアルのコントラストを強めた構図にする。',
                '対角線の流れを使った動きのある構図にする。',
            ],
        };

        const variantLabels: Record<'message' | 'tone' | 'layout', string[]> = {
            message: ['ベネフィット訴求', '信頼訴求', '行動喚起訴求', '共感訴求'],
            tone: ['モダン', '親しみやすい', 'プレミアム', '大胆'],
            layout: ['中央構図', '余白重視', 'コントラスト構図', '動きのある構図'],
        };

        const bundleId = variantCount > 1 || targetFormats.length > 1 ? crypto.randomUUID() : '';
        const generatedImages: GeneratedImageResult[] = [];
        try {
            for (const targetFormat of targetFormats) {
                for (let index = 0; index < variantCount; index++) {
                    const variantInstruction = variantPresetMap[variantMode][index] || variantPresetMap[variantMode][0];
                    const generated = await generateImageForFormat(
                        model,
                        body,
                        targetFormat,
                        userId,
                        [brandContext, projectContext].filter(Boolean).join('\n'),
                        variantInstruction
                    );
                    generatedImages.push({
                        generationId: crypto.randomUUID(),
                        imageUrl: generated.imageUrl,
                        format: targetFormat,
                        dimensions: generated.dimensions,
                        thoughtSignature: generated.thoughtSignature,
                        variantLabel: `${variantLabels[variantMode][index] || `案 ${index + 1}`} / ${targetFormat}`,
                        prompt: generated.prompt,
                    });
                }
            }
        } catch (error) {
            console.error('R2 Upload or generation failed:', error);
            return apiError(500, '画像の生成または保存に失敗しました', {
                details: error instanceof Error ? error.message : 'Generation failed',
            });
        }

        // --- 成功時の後処理 (Drizzle Transaction) ---
        await db.transaction(async (tx) => {
            // 1. クレジット消費 (管理者はスキップ)
            if (!isAdmin) {
                await tx.update(users)
                    .set({
                        credits: sql`${users.credits} - ${creditsRequired}`,
                        usageTotalGenerations: sql`${users.usageTotalGenerations} + ${variantCount * targetFormats.length}`,
                        usageMonthlyGenerations: sql`${users.usageMonthlyGenerations} + ${variantCount * targetFormats.length}`,
                        usageLastGenerationAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(eq(users.id, userId));
            } else {
                // 管理者の場合も通算生成数などは更新しておく（任意）
                await tx.update(users)
                    .set({
                        usageTotalGenerations: sql`${users.usageTotalGenerations} + ${variantCount * targetFormats.length}`,
                        usageLastGenerationAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(eq(users.id, userId));
            }

            // 2. 履歴保存
            await tx.insert(generations).values(
                generatedImages.map((generatedImage, index) => ({
                    id: generatedImage.generationId,
                    userId: userId,
                    imageUrl: generatedImage.imageUrl,
                    thumbnailUrl: generatedImage.imageUrl,
                    format: generatedImage.format,
                    prompt: generatedImage.prompt || '',
                    templateId: 'custom',
                    projectId: projectId || null,
                    brandKitId: brandKitId || null,
                    sourceGenerationId: sourceGenerationId || null,
                    generationGroupId: bundleId || null,
                    variantLabel: generatedImage.variantLabel || null,
                    originType: originType || 'custom',
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
                        bundleId: bundleId || '',
                        bundleLabel: targetFormats.length > 1
                            ? `${targetFormats.length}媒体 × ${variantCount}案`
                            : variantCount > 1
                                ? `${variantCount}案バリエーション`
                                : '',
                        bundleIndex: index,
                        bundleTotal: generatedImages.length,
                    },
                    branding: {
                        tone,
                        primaryColor: autoColor ? 'auto' : primaryColor,
                        secondaryColor: autoColor ? 'auto' : secondaryColor,
                        autoColor: !!autoColor,
                    }
                }))
            );
        });

        return NextResponse.json({
            success: true,
            imageUrl: generatedImages[0]?.imageUrl,
            images: generatedImages.map((item) => ({
                generationId: item.generationId,
                imageUrl: item.imageUrl,
                format: item.format,
                dimensions: item.dimensions,
                variantLabel: item.variantLabel,
            })),
            dimensions: generatedImages[0]?.dimensions,
            thoughtSignature: generatedImages[0]?.thoughtSignature,
        });

    } catch (error) {
        const knownErrorResponse = apiFromKnownError(error);
        if (knownErrorResponse) {
            return knownErrorResponse;
        }
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

        return apiError(
            isHighDemandError ? 503 : 500,
            isHighDemandError
                ? '画像生成サービスが一時的に混み合っています。少し時間をおいて再度お試しください'
                : '画像生成中にエラーが発生しました',
            {
                details: isHighDemandError
                    ? `生成モデル側で一時的な高負荷が発生しています（${errorMessage}）`
                    : errorMessage,
            }
        );
    }
}

// プロンプト生成関数
function buildImagePrompt(params: {
    objective: string;
    brandContext?: string;
    variantInstruction?: string;
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
        brandContext,
        variantInstruction,
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
    const { proseInstructions, structuredRules } = splitCustomInstructions(customInstructions);
    const mediumOptimizationRules = getMediumOptimizationRules(format, objective);

    const visualAssetDirective = buildVisualAssetDirective({
        objective,
        productName,
        campaignTargets,
        eventName,
        companyName,
        brandName,
        appName,
        materialName,
        storeName,
        signatureMenu,
        hasReferenceImage,
    });
    const sections = [
        'あなたはプロの広告デザイナー。完成度の高い広告画像を1枚生成する。',
        `【目的】${objectiveLabel}`,
        brandContext ? `【ブランドコンテキスト】\n${brandContext}` : '',
        variantInstruction ? `【バリエーション指示】\n${variantInstruction}` : '',
        `【出力条件】フォーマット:${format} / サイズ:${dimensions.width}x${dimensions.height}px / スタイル:${toneDesc} / メインカラー:${primaryColor} / サブカラー:${secondaryColor}`,
        `【媒体最適化】\n${mediumOptimizationRules}`,
        objectiveDetails ? `【入力情報】\n${objectiveDetails}` : '',
        exactCopyRules ? `【固定テキスト】\n${exactCopyRules}` : '',
        proseInstructions ? `【テンプレート指示】\n${proseInstructions}` : '',
        structuredRules ? `${STRUCTURED_TEMPLATE_MARKER}\n${structuredRules}` : '',
        `【主役ビジュアル】\n${visualAssetDirective}`,
        hasReferenceImage
            ? '【参考画像】添付画像は使える素材として扱い、主役要素の形状・質感・特徴を保ったまま指定構図へ配置する。背景や補助演出は再生成してよいが、主役素材は別物に置き換えない。'
            : '',
        `【必須ルール】
- 画像内に採用する入力文言は、意味を変えず、要約せず、別表現に言い換えず、そのまま読みやすく配置する
- 商品や訴求の魅力が3秒以内に伝わる構図にする
- ターゲットに刺さる視覚要素と情報優先度を守る
- ${primaryColor === 'auto' ? '配色はブランドイメージ・参考画像・ターゲットの嗜好に合わせて最適化する' : '指定カラーを軸に、可読性と完成度を両立する'}
- ${structuredRules ? '構図・文字役割・素材配置は STRUCTURED_TEMPLATE_RULES を最優先にする' : '入力情報とテンプレ意図に沿ってレイアウトを決める'}
- SNSやWebで映える品質に仕上げる`,
    ];

    return sections.filter(Boolean).join('\n\n');
}

function getMediumOptimizationRules(format: string, objective: string) {
    const formatRules: Record<string, string[]> = {
        'instagram-story': [
            '9:16 の縦長を活かし、主役と見出しを中央〜上部に大きく配置する',
            '一瞬で読めるようにテキスト量を絞り、長文説明は避ける',
            '上下端のUI領域に重要情報を置きすぎない',
        ],
        'instagram-feed': [
            '正方形内で主役を大きく見せ、1メッセージ1訴求に絞る',
            'スクロール中でも止まるよう、中央付近の視認性を高める',
        ],
        'facebook-ad': [
            '横長構図で視線が左から右へ自然に流れるようにする',
            '商品、見出し、CTAの優先順位を明確に分ける',
            '文字は読みやすく、詰め込みすぎない',
        ],
        'twitter-post': [
            'タイムライン上で瞬時に理解できるよう、強い見出しを最優先にする',
            'ビジュアルのインパクトと短いコピーを両立する',
        ],
        'youtube-thumbnail': [
            '小さく表示されても読める大きな文字と強い表情・主役配置を使う',
            'コントラストを強め、1テーマを大きく見せる',
        ],
        'google-display': [
            '300x250 の小サイズでも主役、価値、CTAが潰れないようにする',
            'テキスト量はかなり絞り、視認性を最優先する',
        ],
        'ec-banner': [
            '横長バナーなので、商品・価格・CTA を一直線で理解できるようにする',
            '特典や価格は数字が目立つように扱う',
        ],
        'product-image': [
            '商品そのものを主役にし、背景は商品価値を邪魔しないよう整理する',
            'EC用途を想定し、清潔感と信頼感を優先する',
        ],
    };

    const objectiveRules: Record<string, string> = {
        'sale-campaign': 'セール目的なので、割引・特典・期限などのオファーを即座に理解できるようにする。',
        'lead-generation': 'リード獲得目的なので、資料請求や無料相談などのCTAをはっきり置く。',
        'app-install': 'アプリ訴求なので、利用メリットかUIの価値が一目で伝わるようにする。',
        'recruitment': '採用目的なので、働く魅力と対象人材が短時間で伝わる構成にする。',
        'event-seminar': 'イベント集客なので、開催情報と参加価値の優先度を高くする。',
    };

    return [
        ...(formatRules[format] || ['媒体サイズに合わせて主役、見出し、CTAの優先順位を最適化する']),
        objectiveRules[objective] || '',
    ].filter(Boolean).map((rule) => `- ${rule}`).join('\n');
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
    return value ? `- ${label}: 「${value}」をそのまま使う` : '';
}

function splitCustomInstructions(customInstructions?: string) {
    if (!customInstructions?.trim()) {
        return { proseInstructions: '', structuredRules: '' };
    }

    const markerIndex = customInstructions.indexOf(STRUCTURED_TEMPLATE_MARKER);
    if (markerIndex === -1) {
        return {
            proseInstructions: customInstructions.trim(),
            structuredRules: '',
        };
    }

    const proseInstructions = customInstructions.slice(0, markerIndex).trim();
    const structuredRules = customInstructions
        .slice(markerIndex + STRUCTURED_TEMPLATE_MARKER.length)
        .trim();

    return { proseInstructions, structuredRules };
}

function buildVisualAssetDirective(params: {
    objective: string;
    productName?: string;
    campaignTargets?: string;
    eventName?: string;
    companyName?: string;
    brandName?: string;
    appName?: string;
    materialName?: string;
    storeName?: string;
    signatureMenu?: string;
    hasReferenceImage?: boolean;
}): string {
    const withAssetByObjective: Record<string, string> = {
        'new-product': `参考画像がある場合は、その素材を主役商品として扱い、商品画像の配置指定に従って最も目立つ位置へ置く。参考画像がない場合は、${params.productName || '商品'}を主役にした新規ビジュアルを生成する。`,
        'sale-campaign': `参考画像がある場合は、その素材をセール対象の主役として使い、割引訴求より下位にならない位置に配置する。参考画像がない場合は、${params.campaignTargets || '対象商品'}が伝わる主役ビジュアルを生成する。`,
        'event-seminar': `参考画像がある場合は、その人物・会場・イベント関連素材を主役または補助要素として配置する。参考画像がない場合は、${params.eventName || 'イベント'}の価値が伝わる象徴的シーンを生成する。`,
        recruitment: `参考画像がある場合は、その人物やオフィス素材を主役として扱い、募集訴求を邪魔しない位置に配置する。参考画像がない場合は、${params.companyName || '企業'}で働く魅力が伝わる就業シーンを生成する。`,
        'brand-awareness': `参考画像がある場合は、そのブランド素材や商品ビジュアルを主役として配置する。参考画像がない場合は、${params.brandName || 'ブランド'}の世界観を象徴する主役ビジュアルを生成する。`,
        'app-install': `参考画像がある場合は、そのアプリ画面や端末素材を主役として使い、視認性の高い位置に配置する。参考画像がない場合は、${params.appName || 'アプリ'}の体験価値が伝わる画面ビジュアルを生成する。`,
        'lead-generation': `参考画像がある場合は、その資料やホワイトペーパー、相談シーン素材を主役として配置する。参考画像がない場合は、${params.materialName || '資料・特典'}の価値が伝わるビジュアルを生成する。`,
        'store-visit': `参考画像がある場合は、その商品写真、料理写真、店舗素材を主役として使い、看板メニューや来店理由が伝わる位置に配置する。参考画像がない場合は、${params.signatureMenu || params.storeName || '店舗体験'}が魅力的に見える主役ビジュアルを生成する。`,
    };

    const withoutAssetByObjective: Record<string, string> = {
        'new-product': `素材がない前提でも、${params.productName || '商品'}を主役とした完成度の高い商品ビジュアルを生成する。`,
        'sale-campaign': `素材がない前提でも、${params.campaignTargets || '対象商品'}を想起できるセール用ビジュアルを生成する。`,
        'event-seminar': `素材がない前提でも、${params.eventName || 'イベント'}の参加価値が伝わるビジュアルを生成する。`,
        recruitment: `素材がない前提でも、${params.companyName || '企業'}で働く魅力が伝わる採用ビジュアルを生成する。`,
        'brand-awareness': `素材がない前提でも、${params.brandName || 'ブランド'}の世界観が伝わるブランドビジュアルを生成する。`,
        'app-install': `素材がない前提でも、${params.appName || 'アプリ'}の体験価値が伝わるアプリ訴求ビジュアルを生成する。`,
        'lead-generation': `素材がない前提でも、${params.materialName || '資料・特典'}の価値が伝わるリード獲得用ビジュアルを生成する。`,
        'store-visit': `素材がない前提でも、${params.signatureMenu || params.storeName || '店舗体験'}が魅力的に見える来店促進ビジュアルを生成する。`,
    };

    return params.hasReferenceImage
        ? withAssetByObjective[params.objective] || '参考画像がある場合は、それを主役素材としてレイアウトに組み込む。'
        : withoutAssetByObjective[params.objective] || '素材がない前提でも、目的に合う主役ビジュアルを新規生成する。';
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
