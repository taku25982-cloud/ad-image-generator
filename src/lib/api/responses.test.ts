import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
    apiBadRequest,
    apiError,
    apiFromKnownError,
    apiRateLimited,
    apiValidationError,
} from './responses';

describe('api responses', () => {
    it('returns validation field errors', async () => {
        const schema = z.object({
            name: z.string().min(1),
        });
        const parsed = schema.safeParse({ name: '' });

        expect(parsed.success).toBe(false);
        const response = apiValidationError(parsed.error);

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toMatchObject({
            error: '入力内容に誤りがあります',
            details: {
                name: expect.any(Array),
            },
        });
    });

    it('maps known auth and not-found errors', async () => {
        const unauthorized = apiFromKnownError(new Error('認証が必要です'));
        const notFound = apiFromKnownError(new Error('プロジェクトが見つかりません'));

        expect(unauthorized?.status).toBe(401);
        expect(notFound?.status).toBe(404);
        await expect(unauthorized?.json()).resolves.toEqual({ error: '認証が必要です' });
        await expect(notFound?.json()).resolves.toEqual({ error: 'プロジェクトが見つかりません' });
    });

    it('sets rate limit headers', async () => {
        const response = apiRateLimited(10, 0, 12345);

        expect(response.status).toBe(429);
        expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
        expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
        expect(response.headers.get('X-RateLimit-Reset')).toBe('12345');
    });

    it('builds generic error responses', async () => {
        const response = apiError(503, '一時的に利用できません', { details: 'busy' });
        const badRequest = apiBadRequest();

        expect(response.status).toBe(503);
        await expect(response.json()).resolves.toEqual({
            error: '一時的に利用できません',
            details: 'busy',
        });
        await expect(badRequest.json()).resolves.toEqual({ error: '無効なリクエストです' });
    });
});
