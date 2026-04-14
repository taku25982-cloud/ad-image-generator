// ========================================
// AI画像編集API
// ========================================


import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/db';
import { users, generations } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { generateRateLimit } from '@/lib/ratelimit';
import { editRequestSchema } from '@/lib/api/schemas';
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

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const EDIT_RETRY_DELAYS_MS = [1200, 2500];

interface EditContentPayload {
    productName?: string;
    catchphrase?: string;
    description?: string;
    targetAudience?: string;
}

interface EditBrandingPayload {
    tone?: string;
    primaryColor?: string;
    secondaryColor?: string;
}

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

function isRetryableEditError(error: unknown) {
    const status = getErrorStatusCode(error);
    if (status && RETRYABLE_STATUS_CODES.has(status)) {
        return true;
    }

    const message = error instanceof Error ? error.message : String(error);
    return /high demand|service unavailable|temporar|fetch failed/i.test(message);
}

async function generateEditContentWithRetry(
    model: string,
    contentParts: GeminiContentPart[],
) {
    let lastError: unknown;

    for (let attempt = 0; attempt <= EDIT_RETRY_DELAYS_MS.length; attempt++) {
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

            if (!isRetryableEditError(error) || attempt === EDIT_RETRY_DELAYS_MS.length) {
                throw error;
            }

            await sleep(EDIT_RETRY_DELAYS_MS[attempt]);
        }
    }

    throw lastError instanceof Error ? lastError : new Error('画像編集に失敗しました');
}

function normalizeEditContent(content: unknown, instruction: string): EditContentPayload {
    const baseContent = content && typeof content === 'object'
        ? content as EditContentPayload
        : {};

    const productName = typeof baseContent.productName === 'string' && baseContent.productName.trim()
        ? baseContent.productName.trim()
        : 'AI編集プロジェクト';

    return {
        productName: productName.includes('AI編集') ? productName : `${productName}-AI編集`,
        catchphrase: typeof baseContent.catchphrase === 'string' ? baseContent.catchphrase : '',
        description: typeof baseContent.description === 'string' ? baseContent.description : instruction,
        targetAudience: typeof baseContent.targetAudience === 'string' ? baseContent.targetAudience : '',
    };
}

function normalizeEditBranding(branding: unknown): EditBrandingPayload {
    if (!branding || typeof branding !== 'object') {
        return {};
    }

    const baseBranding = branding as EditBrandingPayload;
    return {
        tone: typeof baseBranding.tone === 'string' ? baseBranding.tone : undefined,
        primaryColor: typeof baseBranding.primaryColor === 'string' ? baseBranding.primaryColor : undefined,
        secondaryColor: typeof baseBranding.secondaryColor === 'string' ? baseBranding.secondaryColor : undefined,
    };
}

export async function POST(request: NextRequest) {
    try {
        const session = await requireSessionUser();

        const userId = session.user.id;

        // レートリミットのチェック（ユーザーIDベース。編集は生成と同じリミッターを共有）
        if (generateRateLimit) {
            const { success, limit, reset, remaining } = await generateRateLimit.limit(`generate_${userId}`);
            if (!success) {
                return apiRateLimited(limit, remaining, reset);
            }
        }

        // ユーザー情報取得（プランチェック用）
        const user = await requireCurrentUser(userId);

        const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        const plan = user.plan || 'free';
        const currentCredits = user.credits || 0;

        // 無料プランの場合は編集機能を制限 (管理者はスキップ)
        if (!isAdmin && plan === 'free') {
            return apiError(403, 'AI編集機能はStarterプラン以上でご利用いただけます。プランをアップグレードしてください。');
        }

        if (!isAdmin && currentCredits < 1) {
            return apiError(403, 'クレジットが不足しています。プランをアップグレードするか、追加購入してください。');
        }

        // リクエストボディのパースとZodによる厳密なバリデーション
        let body;
        try {
            const rawBody = await request.json();
            body = editRequestSchema.parse(rawBody);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return apiValidationError(error);
            }
            return apiBadRequest();
        }

        const { imageData, instruction, editType, thoughtSignature, projectId, brandKitId, sourceGenerationId, originType } = body;

        let projectContext = '';
        let brandContext = '';

        if (projectId) {
            const selectedProject = await requireOwnedProject(userId, projectId);

            projectContext = [
                selectedProject.name ? `- プロジェクト名: ${selectedProject.name}` : '',
                selectedProject.description ? `- プロジェクト意図: ${selectedProject.description}` : '',
                Array.isArray(selectedProject.tags) && selectedProject.tags.length > 0
                    ? `- プロジェクトタグ: ${selectedProject.tags.join(' / ')}`
                    : '',
            ].filter(Boolean).join('\n');
        }

        if (brandKitId) {
            const selectedBrandKit = await requireOwnedBrandKit(userId, brandKitId);

            brandContext = [
                selectedBrandKit.name ? `- ブランド名: ${selectedBrandKit.name}` : '',
                selectedBrandKit.description ? `- ブランド説明: ${selectedBrandKit.description}` : '',
                selectedBrandKit.preferredTone ? `- 保ちたいトーン: ${selectedBrandKit.preferredTone}` : '',
                selectedBrandKit.primaryColor ? `- 優先カラー: ${selectedBrandKit.primaryColor}` : '',
                selectedBrandKit.secondaryColor ? `- 補助カラー: ${selectedBrandKit.secondaryColor}` : '',
                selectedBrandKit.accentColor ? `- アクセントカラー: ${selectedBrandKit.accentColor}` : '',
                Array.isArray(selectedBrandKit.defaultCopyRules) && selectedBrandKit.defaultCopyRules.length > 0
                    ? `- 守りたいコピー方針: ${selectedBrandKit.defaultCopyRules.join(' / ')}`
                    : '',
                Array.isArray(selectedBrandKit.negativeRules) && selectedBrandKit.negativeRules.length > 0
                    ? `- 避けたい表現: ${selectedBrandKit.negativeRules.join(' / ')}`
                    : '',
            ].filter(Boolean).join('\n');
        }

        if (sourceGenerationId) {
            await requireOwnedGeneration(userId, sourceGenerationId);
        }

        // 編集プロンプトの生成
        const prompt = buildEditPrompt({
            instruction,
            editType,
            brandContext,
            projectContext,
        });

        // Gemini APIで画像編集
        const model = 'gemini-3.1-flash-image-preview';

        // コンテンツパーツを構築（思考シグネチャ → 元画像 → テキスト指示の順）
        const contentParts: GeminiContentPart[] = [];

        // 思考シグネチャがある場合、最初に追加（Gemini 3.1の仕様）
        if (thoughtSignature) {
            contentParts.push({
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

        const result = await generateEditContentWithRetry(model, contentParts);
        // レスポンスからパーツを取得
        const parts = result.candidates?.[0]?.content?.parts || [];

        let editedImageData: string | null = null;
        let textContent = '';
        // 次の編集のために思考シグネチャを受け取る
        let nextThoughtSignature: string | null = null;

        for (const part of parts) {
            const thoughtSignatureValue = 'thoughtSignature' in part
                ? (part as Record<string, unknown>).thoughtSignature
                : undefined;
            if ('inlineData' in part && part.inlineData) {
                editedImageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            } else if ('text' in part && part.text) {
                textContent = part.text;
            } else if (typeof thoughtSignatureValue === 'string') {
                nextThoughtSignature = thoughtSignatureValue;
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
        let storedImageUrl: string;
        try {
            const { uploadImageToR2 } = await import('@/lib/storage');
            const fileName = `edited/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
            storedImageUrl = await uploadImageToR2(editedImageData, fileName);
        } catch (error) {
            console.error('R2 Upload failed for edited image:', error);
            return apiError(502, '編集画像の保存に失敗しました。時間をおいて再度お試しください。');
        }

        // --- データの保存 (Drizzle Transaction) ---
        try {
            const { format, content, branding } = body;
            const normalizedContent = normalizeEditContent(content, instruction);
            const normalizedBranding = normalizeEditBranding(branding);

            await db.transaction(async (tx) => {
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
                    projectId: projectId || null,
                    brandKitId: brandKitId || null,
                    sourceGenerationId: sourceGenerationId || null,
                    originType: originType || 'edit',
                    status: 'completed',
                    creditsUsed: isAdmin ? 0 : 1,
                    content: normalizedContent,
                    format: format || 'custom',
                    branding: normalizedBranding,
                });
            });
        } catch (error) {
            console.error('Failed to update stats or record history:', error);
            return apiError(500, '履歴保存または利用状況の更新に失敗しました。時間をおいて再度お試しください。');
        }

        return NextResponse.json({
            success: true,
            imageUrl: storedImageUrl,
            message: textContent || '画像を編集しました。',
            // 次の編集リクエストで渡すと連続編集の精度が向上する
            thoughtSignature: nextThoughtSignature ?? undefined,
        });

    } catch (error) {
        const knownErrorResponse = apiFromKnownError(error);
        if (knownErrorResponse) {
            return knownErrorResponse;
        }
        console.error('Image edit error:', error);
        return apiError(500, '画像編集中にエラーが発生しました', {
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

// 編集プロンプト生成関数
function buildEditPrompt(params: {
    instruction: string;
    editType?: string;
    brandContext?: string;
    projectContext?: string;
}): string {
    const { instruction, editType, brandContext, projectContext } = params;

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
あなたはプロの広告デザイナー。添付された広告画像を高品質に編集する。
${guide}
${brandContext ? `【ブランド制約】\n${brandContext}\n` : ''}
${projectContext ? `【案件文脈】\n${projectContext}\n` : ''}
【編集指示】
${instruction}

【必須ルール】
1. 変更対象以外のレイアウト、配色、完成度はできるだけ維持する。
2. ブランド制約がある場合は、トーン・色・禁止表現を優先して守る。
2. 指示された部分のみを自然に修正し、他要素への影響を最小限にする。
3. 文字や要素の可読性・視認性・広告品質を下げない。
4. 修正後の画像を出力する。
`.trim();
}
