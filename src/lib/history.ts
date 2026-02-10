
'use server';

import { db } from '@/lib/db';
import { generations } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export interface AdHistory {
    id: string;
    userId: string;
    imageUrl: string;
    format: any; // Drizzle handles JSON
    productName: string;
    catchCopy?: string;
    description?: string;
    targetAudience?: string;
    tone: string;
    primaryColor: string;
    secondaryColor: string;
    prompt?: string;
    createdAt: Date;
}


/**
 * 広告生成履歴を保存する
 */
export const saveAdHistory = async (data: Omit<AdHistory, 'id' | 'createdAt'>) => {
    try {
        const id = crypto.randomUUID();
        await db.insert(generations).values({
            id,
            userId: data.userId,
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
            },
            branding: {
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
 * ユーザーの広告生成履歴を取得する
 */
export const getAdHistoriesByUserId = async (userId: string) => {
    try {
        const results = await db.query.generations.findMany({
            where: eq(generations.userId, userId),
            orderBy: [desc(generations.createdAt)],
        });

        return (results as any[]).map(res => ({
            id: res.id,
            userId: res.userId,
            imageUrl: res.imageUrl,
            format: res.format,
            productName: (res.content as any)?.productName || '',
            catchCopy: (res.content as any)?.catchphrase || '',
            description: (res.content as any)?.description || '',
            targetAudience: (res.content as any)?.targetAudience || '',
            tone: '', // スキーマに合わせて調整が必要ならここで
            primaryColor: (res.branding as any)?.primaryColor || '',
            secondaryColor: (res.branding as any)?.secondaryColor || '',
            prompt: res.prompt,
            createdAt: res.createdAt,
        })) as AdHistory[];
    } catch (error) {
        console.error('Error getting ad histories:', error);
        throw error;
    }
};

/**
 * 履歴を削除する
 */
export const deleteAdHistory = async (id: string) => {
    try {
        await db.delete(generations).where(eq(generations.id, id));
    } catch (error) {
        console.error('Error deleting ad history:', error);
        throw error;
    }
};
