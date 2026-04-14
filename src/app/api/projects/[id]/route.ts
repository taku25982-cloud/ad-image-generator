import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { projects } from '@/db/schema';
import {
    assertBrandKitOwnership,
    assertProjectOwnership,
    buildProjectUpdateValues,
    getAuthenticatedUserId,
    projectInputSchema,
} from '@/lib/phase1-server';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
    try {
        const userId = await getAuthenticatedUserId();
        const { id } = await context.params;
        const item = await assertProjectOwnership(userId, id);
        return NextResponse.json({ item });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'プロジェクトの取得に失敗しました';
        const status = message === '認証が必要です' ? 401 : message === 'プロジェクトが見つかりません' ? 404 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}

export async function PUT(request: Request, context: RouteContext) {
    try {
        const userId = await getAuthenticatedUserId();
        const { id } = await context.params;
        await assertProjectOwnership(userId, id);

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

        const values = buildProjectUpdateValues(parsed.data);
        await db.update(projects).set(values).where(and(eq(projects.id, id), eq(projects.userId, userId)));
        const item = await assertProjectOwnership(userId, id);

        return NextResponse.json({ item });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'プロジェクトの更新に失敗しました';
        const status = message === '認証が必要です' ? 401 : message === 'プロジェクトが見つかりません' || message === 'ブランドキットが見つかりません' ? 404 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}

export async function DELETE(_request: Request, context: RouteContext) {
    try {
        const userId = await getAuthenticatedUserId();
        const { id } = await context.params;
        await assertProjectOwnership(userId, id);

        await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));

        return NextResponse.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'プロジェクトの削除に失敗しました';
        const status = message === '認証が必要です' ? 401 : message === 'プロジェクトが見つかりません' ? 404 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
