import { headers } from 'next/headers';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { brandKits, projects } from '@/db/schema';

export const brandKitInputSchema = z.object({
    name: z.string().trim().min(1, 'ブランド名は必須です').max(100, 'ブランド名が長すぎます'),
    description: z.string().trim().max(500, '説明が長すぎます').optional().nullable(),
    logoUrl: z.string().trim().url('ロゴURLが不正です').max(2000).optional().nullable().or(z.literal('')),
    primaryColor: z.string().trim().max(20).optional().nullable(),
    secondaryColor: z.string().trim().max(20).optional().nullable(),
    accentColor: z.string().trim().max(20).optional().nullable(),
    preferredTone: z.string().trim().max(50).optional().nullable(),
    defaultCopyRules: z.array(z.string().trim().max(300)).max(20).optional().nullable(),
    negativeRules: z.array(z.string().trim().max(300)).max(20).optional().nullable(),
    fontPreferences: z.array(z.string().trim().max(100)).max(10).optional().nullable(),
    isDefault: z.boolean().optional(),
});

export const projectInputSchema = z.object({
    name: z.string().trim().min(1, 'プロジェクト名は必須です').max(100, 'プロジェクト名が長すぎます'),
    description: z.string().trim().max(500, '説明が長すぎます').optional().nullable(),
    brandKitId: z.string().trim().max(100).optional().nullable(),
    status: z.enum(['active', 'archived']).optional(),
    tags: z.array(z.string().trim().max(50)).max(20).optional().nullable(),
});

function normalizeNullableString(value?: string | null) {
    if (value == null) {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function normalizeNullableStringArray(values?: string[] | null) {
    if (!values) {
        return null;
    }

    const normalized = values
        .map((value) => value.trim())
        .filter(Boolean);

    return normalized.length > 0 ? normalized : null;
}

export async function getAuthenticatedUserId() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        throw new Error('認証が必要です');
    }

    return session.user.id;
}

export async function assertBrandKitOwnership(userId: string, brandKitId: string) {
    const brandKit = await db.query.brandKits.findFirst({
        where: and(eq(brandKits.id, brandKitId), eq(brandKits.userId, userId)),
    });

    if (!brandKit) {
        throw new Error('ブランドキットが見つかりません');
    }

    return brandKit;
}

export async function assertProjectOwnership(userId: string, projectId: string) {
    const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
    });

    if (!project) {
        throw new Error('プロジェクトが見つかりません');
    }

    return project;
}

export async function listBrandKitsForUser(userId: string) {
    return db.query.brandKits.findMany({
        where: eq(brandKits.userId, userId),
        orderBy: [desc(brandKits.isDefault), desc(brandKits.updatedAt), desc(brandKits.createdAt)],
    });
}

export async function listProjectsForUser(userId: string) {
    return db.query.projects.findMany({
        where: eq(projects.userId, userId),
        orderBy: [desc(projects.updatedAt), desc(projects.createdAt)],
    });
}

export function buildBrandKitInsertValues(userId: string, input: z.infer<typeof brandKitInputSchema>) {
    return {
        id: crypto.randomUUID(),
        userId,
        name: input.name.trim(),
        description: normalizeNullableString(input.description),
        logoUrl: normalizeNullableString(input.logoUrl),
        primaryColor: normalizeNullableString(input.primaryColor),
        secondaryColor: normalizeNullableString(input.secondaryColor),
        accentColor: normalizeNullableString(input.accentColor),
        preferredTone: normalizeNullableString(input.preferredTone),
        defaultCopyRules: normalizeNullableStringArray(input.defaultCopyRules),
        negativeRules: normalizeNullableStringArray(input.negativeRules),
        fontPreferences: normalizeNullableStringArray(input.fontPreferences),
        isDefault: input.isDefault ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

export function buildBrandKitUpdateValues(input: z.infer<typeof brandKitInputSchema>) {
    return {
        name: input.name.trim(),
        description: normalizeNullableString(input.description),
        logoUrl: normalizeNullableString(input.logoUrl),
        primaryColor: normalizeNullableString(input.primaryColor),
        secondaryColor: normalizeNullableString(input.secondaryColor),
        accentColor: normalizeNullableString(input.accentColor),
        preferredTone: normalizeNullableString(input.preferredTone),
        defaultCopyRules: normalizeNullableStringArray(input.defaultCopyRules),
        negativeRules: normalizeNullableStringArray(input.negativeRules),
        fontPreferences: normalizeNullableStringArray(input.fontPreferences),
        isDefault: input.isDefault ?? false,
        updatedAt: new Date(),
    };
}

export function buildProjectInsertValues(userId: string, input: z.infer<typeof projectInputSchema>) {
    return {
        id: crypto.randomUUID(),
        userId,
        brandKitId: normalizeNullableString(input.brandKitId),
        name: input.name.trim(),
        description: normalizeNullableString(input.description),
        status: input.status ?? 'active',
        tags: normalizeNullableStringArray(input.tags),
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

export function buildProjectUpdateValues(input: z.infer<typeof projectInputSchema>) {
    const status = input.status ?? 'active';

    return {
        brandKitId: normalizeNullableString(input.brandKitId),
        name: input.name.trim(),
        description: normalizeNullableString(input.description),
        status,
        tags: normalizeNullableStringArray(input.tags),
        archivedAt: status === 'archived' ? new Date() : null,
        updatedAt: new Date(),
    };
}
