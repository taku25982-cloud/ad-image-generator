import { describe, expect, it } from 'vitest';
import { serializeAdHistories } from './ad-history';

describe('serializeAdHistories', () => {
    it('serializes createdAt to ISO strings', () => {
        const createdAt = new Date('2026-04-12T00:00:00.000Z');
        const result = serializeAdHistories([{
            id: 'history-1',
            imageUrl: 'https://example.com/image.png',
            thumbnailUrl: 'https://example.com/thumb.png',
            prompt: 'prompt',
            productName: 'Product',
            catchCopy: 'copy',
            description: 'desc',
            targetAudience: 'audience',
            tone: 'modern',
            primaryColor: '#111111',
            secondaryColor: '#222222',
            format: 'instagram-feed',
            templateId: 'custom',
            createdAt,
            isFavorite: false,
            mediaType: 'image',
        }]);

        expect(result[0].createdAt).toBe(createdAt.toISOString());
    });

    it('falls back when createdAt is invalid', () => {
        const result = serializeAdHistories([{
            id: 'history-2',
            imageUrl: 'https://example.com/image.png',
            thumbnailUrl: 'https://example.com/thumb.png',
            prompt: 'prompt',
            productName: 'Product',
            catchCopy: 'copy',
            description: 'desc',
            targetAudience: 'audience',
            tone: 'modern',
            primaryColor: '#111111',
            secondaryColor: '#222222',
            format: 'instagram-feed',
            templateId: 'custom',
            createdAt: new Date('invalid'),
            isFavorite: false,
            mediaType: 'image',
        }]);

        expect(result[0].createdAt).toBe(new Date(0).toISOString());
    });
});
