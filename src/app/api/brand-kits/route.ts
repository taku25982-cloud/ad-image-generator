import { NextResponse } from 'next/server';
import { and, eq, isNotNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { brandKits, generations } from '@/db/schema';
import {
    brandKitInputSchema,
    buildBrandKitInsertValues,
    getAuthenticatedUserId,
    listBrandKitsForUser,
} from '@/lib/phase1-server';

export async function GET() {
    try {
        const userId = await getAuthenticatedUserId();
        const [items, stats] = await Promise.all([
            listBrandKitsForUser(userId),
            db
                .select({
                    brandKitId: generations.brandKitId,
                    usageCount: sql<number>`count(*)`,
                    lastGeneratedAt: sql<string | null>`max(${generations.createdAt})`,
                })
                .from(generations)
                .where(and(eq(generations.userId, userId), isNotNull(generations.brandKitId)))
                .groupBy(generations.brandKitId),
        ]);

        const statsMap = new Map(
            stats.map((entry) => [
                entry.brandKitId,
                {
                    usageCount: Number(entry.usageCount ?? 0),
                    lastGeneratedAt: entry.lastGeneratedAt,
                },
            ])
        );

        const enrichedItems = items.map((item) => ({
            ...item,
            usageCount: statsMap.get(item.id)?.usageCount ?? 0,
            lastGeneratedAt: statsMap.get(item.id)?.lastGeneratedAt ?? null,
        }));
        return NextResponse.json({ items: enrichedItems });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'ブランドキットの取得に失敗しました';
        const status = message === '認証が必要です' ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}

export async function POST(request: Request) {
    try {
        const userId = await getAuthenticatedUserId();
        const rawBody = await request.json();
        const parsed = brandKitInputSchema.safeParse(rawBody);

        if (!parsed.success) {
            return NextResponse.json(
                { error: '入力内容に誤りがあります', details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const values = buildBrandKitInsertValues(userId, parsed.data);

        if (values.isDefault) {
            await db.update(brandKits).set({ isDefault: false, updatedAt: new Date() }).where(eq(brandKits.userId, userId));
        }

        await db.insert(brandKits).values(values);

        return NextResponse.json({ item: values }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'ブランドキットの作成に失敗しました';
        const status = message === '認証が必要です' ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
