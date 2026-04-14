import { describe, expect, it } from 'vitest';
import {
    buildBrandKitRequestPayload,
    buildGeneratedAssetFileName,
    buildProjectRequestPayload,
    getWorkspaceErrorMessage,
} from './create-workspace';

describe('create workspace helpers', () => {
    it('builds a brand kit payload', () => {
        expect(buildBrandKitRequestPayload({
            name: 'Brand',
            primaryColor: '#111111',
            secondaryColor: '#222222',
            preferredTone: 'modern',
        }, true)).toEqual({
            name: 'Brand',
            primaryColor: '#111111',
            secondaryColor: '#222222',
            preferredTone: 'modern',
            isDefault: true,
        });
    });

    it('builds a project payload with nullable brand kit id', () => {
        expect(buildProjectRequestPayload({
            name: 'Project',
            description: 'Desc',
        }, '')).toEqual({
            name: 'Project',
            description: 'Desc',
            brandKitId: null,
        });
    });

    it('formats fallback workspace errors', () => {
        expect(getWorkspaceErrorMessage(new Error('boom'), 'fallback')).toBe('boom');
        expect(getWorkspaceErrorMessage('unknown', 'fallback')).toBe('fallback');
    });

    it('builds deterministic download filenames', () => {
        expect(buildGeneratedAssetFileName('instagram-feed', 123)).toBe('ad-instagram-feed-123.png');
    });
});
