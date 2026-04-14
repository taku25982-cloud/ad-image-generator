import 'server-only';

import { headers } from 'next/headers';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { brandKits, generations, projects, users } from '@/db/schema';

export async function requireSessionUser() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error('認証が必要です');
    }

    return session;
}

export async function requireCurrentUser(userId: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user) {
        throw new Error('ユーザーが見つかりません');
    }

    return user;
}

export async function requireOwnedBrandKit(userId: string, brandKitId: string) {
    const brandKit = await db.query.brandKits.findFirst({
        where: and(eq(brandKits.id, brandKitId), eq(brandKits.userId, userId)),
    });

    if (!brandKit) {
        throw new Error('ブランドキットが見つかりません');
    }

    return brandKit;
}

export async function requireOwnedProject(userId: string, projectId: string) {
    const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
    });

    if (!project) {
        throw new Error('プロジェクトが見つかりません');
    }

    return project;
}

export async function requireOwnedGeneration(userId: string, generationId: string) {
    const generation = await db.query.generations.findFirst({
        where: and(eq(generations.id, generationId), eq(generations.userId, userId)),
    });

    if (!generation) {
        throw new Error('派生元の履歴が見つかりません');
    }

    return generation;
}
