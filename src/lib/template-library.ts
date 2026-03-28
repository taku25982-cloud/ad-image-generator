'use client';

import type { EnrichedAdTemplate, TemplateLibraryStats } from '@/lib/template-catalog';
import type { TemplateLibraryEventType, TemplateLibraryState } from '@/types/template-library';

const FAVORITES_KEY = 'template:favorites';
const RECENTS_KEY = 'template:recents';
const CUSTOM_KEY = 'template:custom';
const STATS_KEY = 'template:stats';

async function postJson(url: string, body: unknown) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }
}

function readJson<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') {
        return fallback;
    }

    try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) as T : fallback;
    } catch {
        return fallback;
    }
}

function writeJson<T>(key: string, value: T) {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(key, JSON.stringify(value));
}

export function getFavoriteTemplateIds(): string[] {
    return readJson<string[]>(FAVORITES_KEY, []);
}

export function toggleFavoriteTemplate(templateId: string): string[] {
    const current = getFavoriteTemplateIds();
    const next = current.includes(templateId)
        ? current.filter((id) => id !== templateId)
        : [templateId, ...current];
    writeJson(FAVORITES_KEY, next);
    return next;
}

export function getRecentTemplateIds(): string[] {
    return readJson<string[]>(RECENTS_KEY, []);
}

export function recordRecentTemplate(templateId: string) {
    const next = [templateId, ...getRecentTemplateIds().filter((id) => id !== templateId)].slice(0, 8);
    writeJson(RECENTS_KEY, next);
}

export function getTemplateStats(): Record<string, TemplateLibraryStats> {
    return readJson<Record<string, TemplateLibraryStats>>(STATS_KEY, {});
}

export function getTemplateLibraryState(): TemplateLibraryState {
    return {
        favoriteIds: getFavoriteTemplateIds(),
        recentIds: getRecentTemplateIds(),
        customTemplates: getCustomTemplates(),
        stats: getTemplateStats(),
    };
}

function writeTemplateLibraryState(state: TemplateLibraryState) {
    writeJson(FAVORITES_KEY, state.favoriteIds);
    writeJson(RECENTS_KEY, state.recentIds);
    writeJson(CUSTOM_KEY, state.customTemplates);
    writeJson(STATS_KEY, state.stats);
}

function updateStats(templateId: string, updater: (current: TemplateLibraryStats) => TemplateLibraryStats) {
    const current = getTemplateStats();
    current[templateId] = updater(current[templateId] || {
        opens: 0,
        creates: 0,
        favorites: 0,
        customizations: 0,
    });
    writeJson(STATS_KEY, current);
}

export function recordTemplateOpen(templateId: string) {
    updateStats(templateId, (current) => ({
        ...current,
        opens: current.opens + 1,
        lastUsedAt: new Date().toISOString(),
    }));
}

export function recordTemplateCreate(templateId: string) {
    updateStats(templateId, (current) => ({
        ...current,
        creates: current.creates + 1,
        lastUsedAt: new Date().toISOString(),
    }));
}

export function syncFavoriteCount(templateId: string, isFavorite: boolean) {
    updateStats(templateId, (current) => ({
        ...current,
        favorites: Math.max(0, current.favorites + (isFavorite ? 1 : -1)),
        lastUsedAt: new Date().toISOString(),
    }));
}

export function recordTemplateCustomization(templateId: string) {
    updateStats(templateId, (current) => ({
        ...current,
        customizations: current.customizations + 1,
        lastUsedAt: new Date().toISOString(),
    }));
}

export function getCustomTemplates(): EnrichedAdTemplate[] {
    return readJson<EnrichedAdTemplate[]>(CUSTOM_KEY, []);
}

export function saveCustomTemplate(template: EnrichedAdTemplate) {
    const current = getCustomTemplates().filter((item) => item.id !== template.id);
    const next = [template, ...current].slice(0, 24);
    writeJson(CUSTOM_KEY, next);
}

export async function syncTemplateLibraryState() {
    try {
        const response = await fetch('/api/templates/library', {
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        const state = await response.json() as TemplateLibraryState;
        writeTemplateLibraryState(state);
        return state;
    } catch {
        return getTemplateLibraryState();
    }
}

export async function trackTemplateEvent(templateId: string, type: TemplateLibraryEventType) {
    recordRecentTemplate(templateId);

    if (type === 'open') {
        recordTemplateOpen(templateId);
    }
    if (type === 'create') {
        recordTemplateCreate(templateId);
    }
    if (type === 'customize') {
        recordTemplateCustomization(templateId);
    }

    try {
        await postJson('/api/templates/library/event', { templateId, type });
    } catch {
        // ローカル保存をフォールバックとして残す
    }
}

export async function toggleFavoriteTemplateSync(templateId: string) {
    const next = toggleFavoriteTemplate(templateId);
    const isFavorite = next.includes(templateId);
    syncFavoriteCount(templateId, isFavorite);

    try {
        await postJson('/api/templates/library/event', { templateId, isFavorite });
    } catch {
        // ローカル保存をフォールバックとして残す
    }

    return next;
}

export async function saveCustomTemplateSync(template: EnrichedAdTemplate) {
    saveCustomTemplate(template);

    try {
        await postJson('/api/templates/library/custom', { template });
    } catch {
        // ローカル保存をフォールバックとして残す
    }
}
