import type { EnrichedAdTemplate, TemplateLibraryStats } from '@/lib/template-catalog';

export interface TemplateLibraryState {
    favoriteIds: string[];
    recentIds: string[];
    customTemplates: EnrichedAdTemplate[];
    stats: Record<string, TemplateLibraryStats>;
}

export type TemplateLibraryEventType = 'open' | 'create' | 'customize';
