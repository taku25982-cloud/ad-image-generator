import { NextResponse } from 'next/server';
import { and, eq, isNotNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { generations, projects } from '@/db/schema';
import {
    assertBrandKitOwnership,
    buildProjectInsertValues,
    getAuthenticatedUserId,
    listProjectsForUser,
    projectInputSchema,
} from '@/lib/phase1-server';

export async function GET() {
    try {
        const userId = await getAuthenticatedUserId();
        const [items, stats] = await Promise.all([
            listProjectsForUser(userId),
            db
                .select({
                    projectId: generations.projectId,
                    usageCount: sql<number>`count(*)`,
                    lastGeneratedAt: sql<string | null>`max(${generations.createdAt})`,
                })
                .from(generations)
                .where(and(eq(generations.userId, userId), isNotNull(generations.projectId)))
                .groupBy(generations.projectId),
        ]);

        const statsMap = new Map(
            stats.map((entry) => [
                entry.projectId,
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
        const message = error instanceof Error ? error.message : 'プロジェクトの取得に失敗しました';
        const status = message === '認証が必要です' ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}

export async function POST(request: Request) {
    try {
        const userId = await getAuthenticatedUserId();
        const rawBody = await request.json();
        const parsed = projectInputSchema.safeParse(rawBody);

        if (!parsed.success) {
            return NextResponse.json(
                { error: '入力内容に誤りがあります', details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        if (parsed.data.brandKitId) {
            await assertBrandKitOwnership(userId, parsed.data.brandKitId);
        }

        const values = buildProjectInsertValues(userId, parsed.data);
        await db.insert(projects).values(values);

        return NextResponse.json({ item: values }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'プロジェクトの作成に失敗しました';
        const status = message === '認証が必要です' ? 401 : message === 'ブランドキットが見つかりません' ? 404 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
