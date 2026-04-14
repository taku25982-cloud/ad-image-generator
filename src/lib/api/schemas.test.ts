import { describe, expect, it } from 'vitest';
import { editRequestSchema, generateRequestSchema } from './schemas';

describe('generateRequestSchema', () => {
    it('accepts the minimum valid generate payload', () => {
        const parsed = generateRequestSchema.parse({
            format: 'instagram-feed',
            objective: 'new-product',
        });

        expect(parsed.tone).toBe('modern');
        expect(parsed.primaryColor).toBe('auto');
        expect(parsed.secondaryColor).toBe('auto');
    });

    it('rejects invalid reference images and too many formats', () => {
        expect(() => generateRequestSchema.parse({
            format: 'instagram-feed',
            objective: 'new-product',
            referenceImage: 'https://example.com/file.png',
        })).toThrow('不正な画像データです');

        expect(() => generateRequestSchema.parse({
            format: 'instagram-feed',
            objective: 'new-product',
            formats: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        })).toThrow();
    });
});

describe('editRequestSchema', () => {
    it('accepts the minimum valid edit payload', () => {
        const parsed = editRequestSchema.parse({
            imageData: 'data:image/png;base64,abc123',
            instruction: '文字色を青に変える',
        });

        expect(parsed.instruction).toBe('文字色を青に変える');
    });

    it('rejects invalid image data', () => {
        expect(() => editRequestSchema.parse({
            imageData: '/images/example.png',
            instruction: '文字色を青に変える',
        })).toThrow('不正な画像データ形式です');
    });
});
