'use server';

import { and, desc, eq, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { customTemplates, templateLibraryEntries } from '@/db/schema';
import type { EnrichedAdTemplate, TemplateLibraryStats } from '@/lib/template-catalog';
import type { TemplateLibraryEventType, TemplateLibraryState } from '@/types/template-library';

async function getAuthenticatedUserId() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        throw new Error('認証が必要です');
    }

    return session.user.id;
}

function parseCustomTemplate(value: unknown): EnrichedAdTemplate | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    return value as EnrichedAdTemplate;
}

function toIsoString(value: Date | string | null | undefined) {
    if (!value) {
        return undefined;
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function buildMomentumScore(lastUsedAt: Date | string | null | undefined) {
    if (!lastUsedAt) {
        return 0;
    }

    const lastUsedDate = lastUsedAt instanceof Date ? lastUsedAt : new Date(lastUsedAt);
    if (Number.isNaN(lastUsedDate.getTime())) {
        return 0;
    }

    const diffDays = (Date.now() - lastUsedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 1) return 24;
    if (diffDays <= 3) return 16;
    if (diffDays <= 7) return 10;
    if (diffDays <= 14) return 6;
    return 0;
}

export async function getTemplateLibraryStateForUser(): Promise<TemplateLibraryState> {
    const userId = await getAuthenticatedUserId();

    const [libraryEntries, allLibraryEntries, savedCustomTemplates] = await Promise.all([
        db.query.templateLibraryEntries.findMany({
            where: eq(templateLibraryEntries.userId, userId),
            orderBy: [desc(templateLibraryEntries.lastUsedAt), desc(templateLibraryEntries.updatedAt)],
        }),
        db.query.templateLibraryEntries.findMany({
            orderBy: [desc(templateLibraryEntries.lastUsedAt), desc(templateLibraryEntries.updatedAt)],
        }),
        db.query.customTemplates.findMany({
            where: eq(customTemplates.userId, userId),
            orderBy: [desc(customTemplates.updatedAt), desc(customTemplates.createdAt)],
        }),
    ]);

    const favoriteIds = libraryEntries.filter((entry) => entry.isFavorite).map((entry) => entry.templateId);
    const recentIds = libraryEntries
        .filter((entry) => entry.lastUsedAt)
        .sort((a, b) => {
            const left = a.lastUsedAt ? a.lastUsedAt.getTime() : 0;
            const right = b.lastUsedAt ? b.lastUsedAt.getTime() : 0;
            return right - left;
        })
        .slice(0, 8)
        .map((entry) => entry.templateId);

    const stats = allLibraryEntries.reduce<Record<string, TemplateLibraryStats>>((acc, entry) => {
        const current = acc[entry.templateId] || {
            opens: 0,
            creates: 0,
            favorites: 0,
            customizations: 0,
            engagedUsers: 0,
            conversionRate: 0,
            favoriteRate: 0,
            momentumScore: 0,
            lastUsedAt: undefined,
        };

        current.opens += entry.opens;
        current.creates += entry.creates;
        current.favorites += entry.isFavorite ? 1 : 0;
        current.customizations += entry.customizations;
        current.engagedUsers = (current.engagedUsers || 0) + 1;

        const currentLastUsed = current.lastUsedAt ? new Date(current.lastUsedAt).getTime() : 0;
        const nextLastUsed = entry.lastUsedAt ? entry.lastUsedAt.getTime() : 0;
        if (nextLastUsed > currentLastUsed) {
            current.lastUsedAt = toIsoString(entry.lastUsedAt);
        }

        acc[entry.templateId] = current;
        return acc;
    }, {});

    for (const [templateId, entry] of Object.entries(stats)) {
        const opens = Math.max(1, entry.opens);
        const engagedUsers = Math.max(1, entry.engagedUsers || 1);
        entry.conversionRate = Number((entry.creates / opens).toFixed(2));
        entry.favoriteRate = Number((entry.favorites / engagedUsers).toFixed(2));
        entry.momentumScore = buildMomentumScore(entry.lastUsedAt);
        stats[templateId] = entry;
    }

    return {
        favoriteIds,
        recentIds,
        customTemplates: savedCustomTemplates
            .map((entry) => parseCustomTemplate(entry.templateData))
            .filter((entry): entry is EnrichedAdTemplate => Boolean(entry)),
        stats,
    };
}

export async function recordTemplateLibraryEvent(templateId: string, type: TemplateLibraryEventType) {
    const userId = await getAuthenticatedUserId();
    const now = new Date();
    const incrementOpen = type === 'open' ? 1 : 0;
    const incrementCreate = type === 'create' ? 1 : 0;
    const incrementCustomize = type === 'customize' ? 1 : 0;

    await db
        .insert(templateLibraryEntries)
        .values({
            userId,
            templateId,
            opens: incrementOpen,
            creates: incrementCreate,
            customizations: incrementCustomize,
            lastOpenedAt: type === 'open' ? now : null,
            lastUsedAt: now,
            updatedAt: now,
        })
        .onConflictDoUpdate({
            target: [templateLibraryEntries.userId, templateLibraryEntries.templateId],
            set: {
                opens: sql`${templateLibraryEntries.opens} + ${incrementOpen}`,
                creates: sql`${templateLibraryEntries.creates} + ${incrementCreate}`,
                customizations: sql`${templateLibraryEntries.customizations} + ${incrementCustomize}`,
                ...(type === 'open' ? { lastOpenedAt: now } : {}),
                lastUsedAt: now,
                updatedAt: now,
            },
        });
}

export async function setTemplateFavoriteState(templateId: string, isFavorite: boolean) {
    const userId = await getAuthenticatedUserId();
    const now = new Date();

    await db
        .insert(templateLibraryEntries)
        .values({
            userId,
            templateId,
            isFavorite,
            lastUsedAt: now,
            updatedAt: now,
        })
        .onConflictDoUpdate({
            target: [templateLibraryEntries.userId, templateLibraryEntries.templateId],
            set: {
                isFavorite,
                lastUsedAt: now,
                updatedAt: now,
            },
        });
}

export async function saveCustomTemplateForUser(template: EnrichedAdTemplate) {
    const userId = await getAuthenticatedUserId();
    const now = new Date();

    await db
        .insert(customTemplates)
        .values({
            id: template.id,
            userId,
            baseTemplateId: template.createdFromTemplateId || template.id,
            name: template.name,
            description: template.description,
            templateData: template,
            createdAt: now,
            updatedAt: now,
        })
        .onConflictDoUpdate({
            target: customTemplates.id,
            set: {
                name: template.name,
                description: template.description,
                templateData: template,
                updatedAt: now,
            },
            where: and(eq(customTemplates.id, template.id), eq(customTemplates.userId, userId)),
        });
}
