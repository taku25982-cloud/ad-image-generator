import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_FORM_DATA } from './ad-config/types';
import {
    buildGenerateRequestPayload,
    getGenerateErrorMessage,
    normalizeGeneratedImages,
} from './create-generation';

describe('buildGenerateRequestPayload', () => {
    it('omits empty optional ids and includes reference image when present', () => {
        const payload = buildGenerateRequestPayload({
            selectedFormat: 'instagram-feed',
            targetFormats: ['instagram-feed'],
            selectedBrandKitId: '',
            selectedProjectId: 'project-1',
            sourceGenerationId: '',
            originType: 'custom',
            variantCount: 2,
            variantMode: 'message',
            formData: DEFAULT_FORM_DATA,
            referenceImage: 'data:image/png;base64,abc',
        });

        expect(payload.brandKitId).toBeUndefined();
        expect(payload.projectId).toBe('project-1');
        expect(payload.referenceImage).toBe('data:image/png;base64,abc');
        expect(payload.format).toBe('instagram-feed');
    });
});

describe('getGenerateErrorMessage', () => {
    it('formats structured details into one message', () => {
        expect(getGenerateErrorMessage({
            error: '入力内容に誤りがあります',
            details: { format: ['必須です'] },
        })).toBe('入力内容に誤りがあります（{"format":["必須です"]}）');
    });
});

describe('normalizeGeneratedImages', () => {
    it('marks returned images as non-favorite', () => {
        const result = normalizeGeneratedImages({
            images: [{
                generationId: 'gen-1',
                imageUrl: 'https://example.com/image.png',
                format: 'instagram-feed',
            }],
        }, 'instagram-feed');

        expect(result).toEqual([{
            generationId: 'gen-1',
            imageUrl: 'https://example.com/image.png',
            format: 'instagram-feed',
            isFavorite: false,
        }]);
    });

    it('creates a single image item from legacy imageUrl response', () => {
        vi.spyOn(crypto, 'randomUUID').mockReturnValue('generated-id');

        const result = normalizeGeneratedImages({
            imageUrl: 'https://example.com/image.png',
        }, 'instagram-feed');

        expect(result).toEqual([{
            generationId: 'generated-id',
            imageUrl: 'https://example.com/image.png',
            format: 'instagram-feed',
            isFavorite: false,
        }]);
    });
});
