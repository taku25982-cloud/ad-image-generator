import { describe, expect, it, vi } from 'vitest';
import {
    buildProxyImageUrl,
    fetchDownloadBlob,
    getReferenceImageErrorMessage,
    processReferenceImage,
} from './create-media';

describe('create media helpers', () => {
    it('builds proxy image urls', () => {
        expect(buildProxyImageUrl('https://example.com/image.png?x=1')).toBe(
            '/api/proxy-image?url=https%3A%2F%2Fexample.com%2Fimage.png%3Fx%3D1',
        );
    });

    it('formats reference image errors', () => {
        expect(getReferenceImageErrorMessage(new Error('boom'))).toBe('boom');
        expect(getReferenceImageErrorMessage('unknown')).toBe('画像の処理に失敗しました');
    });

    it('processes reference images via injected resizer', async () => {
        const file = new File(['data'], 'example.png', { type: 'image/png' });
        const resizeImage = vi.fn().mockResolvedValue('data:image/png;base64,abc');

        await expect(processReferenceImage(file, resizeImage)).resolves.toEqual({
            file,
            dataUrl: 'data:image/png;base64,abc',
        });
    });

    it('falls back to proxy fetch for downloads', async () => {
        const blob = new Blob(['image']);
        const fetchImpl = vi.fn()
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ dataUrl: 'data:image/png;base64,abc' }),
            })
            .mockResolvedValueOnce({
                ok: true,
                blob: async () => blob,
            });

        await expect(fetchDownloadBlob(fetchImpl as unknown as typeof fetch, 'https://example.com/image.png')).resolves.toBe(blob);
        expect(fetchImpl).toHaveBeenCalledTimes(3);
    });
});
