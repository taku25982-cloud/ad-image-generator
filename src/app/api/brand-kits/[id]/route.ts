import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { brandKits } from '@/db/schema';
import {
    assertBrandKitOwnership,
    brandKitInputSchema,
    buildBrandKitUpdateValues,
    getAuthenticatedUserId,
} from '@/lib/phase1-server';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
    try {
        const userId = await getAuthenticatedUserId();
        const { id } = await context.params;
        const item = await assertBrandKitOwnership(userId, id);
        return NextResponse.json({ item });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'ブランドキットの取得に失敗しました';
        const status = message === '認証が必要です' ? 401 : message === 'ブランドキットが見つかりません' ? 404 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}

export async function PUT(request: Request, context: RouteContext) {
    try {
        const userId = await getAuthenticatedUserId();
        const { id } = await context.params;
        await assertBrandKitOwnership(userId, id);

        const rawBody = await request.json();
        const parsed = brandKitInputSchema.safeParse(rawBody);

        if (!parsed.success) {
            return NextResponse.json(
                { error: '入力内容に誤りがあります', details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const values = buildBrandKitUpdateValues(parsed.data);

        if (values.isDefault) {
            await db.update(brandKits).set({ isDefault: false, updatedAt: new Date() }).where(eq(brandKits.userId, userId));
        }

        await db.update(brandKits).set(values).where(and(eq(brandKits.id, id), eq(brandKits.userId, userId)));
        const item = await assertBrandKitOwnership(userId, id);

        return NextResponse.json({ item });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'ブランドキットの更新に失敗しました';
        const status = message === '認証が必要です' ? 401 : message === 'ブランドキットが見つかりません' ? 404 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}

export async function DELETE(_request: Request, context: RouteContext) {
    try {
        const userId = await getAuthenticatedUserId();
        const { id } = await context.params;
        await assertBrandKitOwnership(userId, id);

        await db.delete(brandKits).where(and(eq(brandKits.id, id), eq(brandKits.userId, userId)));

        return NextResponse.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'ブランドキットの削除に失敗しました';
        const status = message === '認証が必要です' ? 401 : message === 'ブランドキットが見つかりません' ? 404 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
