
'use server';

import { db } from '@/lib/db';
import { generations } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export interface AdHistoryVariant {
    id: string;
    imageUrl: string;
    format: string;
}

export interface AdHistory {
    id: string;
    userId: string;
    imageUrl: string;
    format: string;
    productName: string;
    catchCopy?: string;
    description?: string;
    targetAudience?: string;
    tone: string;
    primaryColor: string;
    secondaryColor: string;
    prompt?: string;
    createdAt: Date;
    bundleId?: string;
    bundleLabel?: string;
    bundleTotal?: number;
    variants: AdHistoryVariant[];
}

interface SaveAdHistoryInput {
    imageUrl: string;
    format: string;
    productName: string;
    catchCopy?: string;
    description?: string;
    targetAudience?: string;
    tone: string;
    primaryColor: string;
    secondaryColor: string;
    prompt?: string;
    bundleId?: string;
    bundleLabel?: string;
    bundleTotal?: number;
}

interface GenerationContent {
    productName?: string;
    catchphrase?: string;
    description?: string;
    targetAudience?: string;
    bundleId?: string;
    bundleLabel?: string;
    bundleIndex?: number;
    bundleTotal?: number;
}

interface BrandingContent {
    tone?: string;
    primaryColor?: string;
    secondaryColor?: string;
}

function normalizeFormatLabel(format: unknown): string {
    if (typeof format === 'string') {
        return format;
    }
    if (format && typeof format === 'object') {
        if ('name' in format && typeof format.name === 'string') {
            return format.name;
        }
        if ('id' in format && typeof format.id === 'string') {
            return format.id;
        }
    }
    return 'custom';
}

function normalizeToneLabel(branding: unknown): string {
    if (!branding || typeof branding !== 'object') {
        return '';
    }

    const value = (branding as Record<string, unknown>).tone;
    return typeof value === 'string' ? value : '';
}

function getBundleMetadata(content: GenerationContent) {
    return {
        bundleId: typeof content.bundleId === 'string' && content.bundleId.length > 0 ? content.bundleId : undefined,
        bundleLabel: typeof content.bundleLabel === 'string' && content.bundleLabel.length > 0 ? content.bundleLabel : undefined,
        bundleIndex: typeof content.bundleIndex === 'number' ? content.bundleIndex : 0,
        bundleTotal: typeof content.bundleTotal === 'number' ? content.bundleTotal : undefined,
    };
}

/**
 * セッションを検証してユーザーIDを返す内部ヘルパー
 */
async function getAuthenticatedUserId(): Promise<string> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error('認証が必要です');
    }
    return session.user.id;
}

/**
 * 広告生成履歴を保存する
 */
export const saveAdHistory = async (data: SaveAdHistoryInput) => {
    const userId = await getAuthenticatedUserId();
    try {
        const id = crypto.randomUUID();
        await db.insert(generations).values({
            id,
            userId,
            imageUrl: data.imageUrl,
            thumbnailUrl: data.imageUrl, // 同一URLを使用
            format: data.format,
            prompt: data.prompt || '',
            templateId: 'custom',
            status: 'completed',
            creditsUsed: 1,
            content: {
                productName: data.productName,
                catchphrase: data.catchCopy || '',
                description: data.description || '',
                targetAudience: data.targetAudience || '',
                bundleId: data.bundleId || '',
                bundleLabel: data.bundleLabel || '',
                bundleIndex: 0,
                bundleTotal: data.bundleTotal || 1,
            },
            branding: {
                tone: data.tone,
                primaryColor: data.primaryColor,
                secondaryColor: data.secondaryColor,
            }
        });
        return id;
    } catch (error) {
        console.error('Error saving ad history:', error);
        throw error;
    }
};

/**
 * ログイン中ユーザーの広告生成履歴を取得する
 * （クライアントからuserIdを受け取らず、セッションから安全に取得）
 */
export const getAdHistoriesByUserId = async () => {
    const userId = await getAuthenticatedUserId();
    try {
        const results = await db.query.generations.findMany({
            where: eq(generations.userId, userId),
            orderBy: [desc(generations.createdAt)],
        });

        const normalized = results.map((res) => {
            const content = ((res.content && typeof res.content === 'object')
                ? res.content
                : {}) as GenerationContent;
            const branding = ((res.branding && typeof res.branding === 'object')
                ? res.branding
                : {}) as BrandingContent;
            const bundle = getBundleMetadata(content);

            return {
                id: res.id,
                userId: res.userId,
                imageUrl: res.imageUrl,
                format: normalizeFormatLabel(res.format),
                productName: content.productName || '',
                catchCopy: content.catchphrase || '',
                description: content.description || '',
                targetAudience: content.targetAudience || '',
                tone: normalizeToneLabel(branding),
                primaryColor: branding.primaryColor || '',
                secondaryColor: branding.secondaryColor || '',
                prompt: res.prompt,
                createdAt: res.createdAt,
                bundleId: bundle.bundleId,
                bundleLabel: bundle.bundleLabel,
                bundleIndex: bundle.bundleIndex,
                bundleTotal: bundle.bundleTotal,
            };
        });

        const grouped = new Map<string, (typeof normalized)[number][]>();
        for (const item of normalized) {
            const groupKey = item.bundleId || item.id;
            const current = grouped.get(groupKey) || [];
            current.push(item);
            grouped.set(groupKey, current);
        }

        return Array.from(grouped.values())
            .map((group) => {
                const sorted = [...group].sort((a, b) => {
                    const left = a.bundleIndex ?? 0;
                    const right = b.bundleIndex ?? 0;
                    return left - right;
                });
                const primary = sorted[0];

                return {
                    ...primary,
                    bundleId: primary.bundleId,
                    bundleLabel: primary.bundleLabel,
                    bundleTotal: primary.bundleTotal || sorted.length,
                    variants: sorted.map((item) => ({
                        id: item.id,
                        imageUrl: item.imageUrl,
                        format: item.format,
                    })),
                };
            })
            .sort((a, b) => {
                const left = a.createdAt ? a.createdAt.getTime() : 0;
                const right = b.createdAt ? b.createdAt.getTime() : 0;
                return right - left;
            }) as AdHistory[];
    } catch (error) {
        console.error('Error getting ad histories:', error);
        throw error;
    }
};

/**
 * 履歴を削除する（セッション検証あり）
 */
export const deleteAdHistory = async (id: string) => {
    const userId = await getAuthenticatedUserId();
    try {
        // 削除対象が自分のものか確認してから削除
        const record = await db.query.generations.findFirst({
            where: eq(generations.id, id),
        });
        if (!record || record.userId !== userId) {
            throw new Error('削除権限がありません');
        }

        const content = ((record.content && typeof record.content === 'object')
            ? record.content
            : {}) as GenerationContent;
        const bundleId = getBundleMetadata(content).bundleId;

        if (!bundleId) {
            await db.delete(generations).where(eq(generations.id, id));
            return;
        }

        const records = await db.query.generations.findMany({
            where: eq(generations.userId, userId),
        });

        const targetIds = records
            .filter((item) => {
                const itemContent = ((item.content && typeof item.content === 'object')
                    ? item.content
                    : {}) as GenerationContent;
                return getBundleMetadata(itemContent).bundleId === bundleId;
            })
            .map((item) => item.id);

        if (targetIds.length === 0) {
            await db.delete(generations).where(eq(generations.id, id));
            return;
        }

        await db.delete(generations).where(inArray(generations.id, targetIds));
    } catch (error) {
        console.error('Error deleting ad history:', error);
        throw error;
    }
};
