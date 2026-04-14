import { describe, expect, it } from 'vitest';
import {
    buildCreateInitialQuery,
    getSingleValue,
    normalizeStringArray,
    serializeBrandKits,
    serializeProjects,
} from './create';

describe('create page data helpers', () => {
    it('picks the first value from search params arrays', () => {
        expect(getSingleValue(['first', 'second'])).toBe('first');
        expect(getSingleValue('single')).toBe('single');
        expect(getSingleValue(undefined)).toBeUndefined();
    });

    it('normalizes array-like JSON fields for client DTOs', () => {
        expect(normalizeStringArray(['a', 'b'])).toEqual(['a', 'b']);
        expect(normalizeStringArray(['a', 1, null, 'b'])).toEqual(['a', 'b']);
        expect(normalizeStringArray('invalid')).toBeNull();
        expect(normalizeStringArray([])).toBeNull();
    });

    it('builds the initial create query from search params', () => {
        expect(buildCreateInitialQuery({
            format: ['instagram-feed', 'facebook-ad'],
            projectId: 'project-1',
            catchCopy: 'sale',
        })).toEqual({
            templateId: undefined,
            templateFormat: undefined,
            format: 'instagram-feed',
            brandKitId: undefined,
            projectId: 'project-1',
            originType: undefined,
            sourceGenerationId: undefined,
            productName: undefined,
            catchCopy: 'sale',
            description: undefined,
            targetAudience: undefined,
            tone: undefined,
            primaryColor: undefined,
            secondaryColor: undefined,
        });
    });

    it('serializes brand kits and projects to client-safe DTOs', () => {
        expect(serializeBrandKits([{
            id: 'brand-1',
            name: 'Brand',
            description: 'desc',
            defaultCopyRules: ['keep'],
            negativeRules: ['avoid'],
            fontPreferences: ['sans'],
            isDefault: true,
        }])).toEqual([{
            id: 'brand-1',
            name: 'Brand',
            description: 'desc',
            primaryColor: undefined,
            secondaryColor: undefined,
            accentColor: undefined,
            preferredTone: undefined,
            defaultCopyRules: ['keep'],
            negativeRules: ['avoid'],
            fontPreferences: ['sans'],
            isDefault: true,
        }]);

        expect(serializeProjects([{
            id: 'project-1',
            name: 'Project',
            tags: ['one', 2, 'two'],
        }])).toEqual([{
            id: 'project-1',
            name: 'Project',
            description: undefined,
            brandKitId: undefined,
            status: undefined,
            tags: ['one', 'two'],
        }]);
    });
});
