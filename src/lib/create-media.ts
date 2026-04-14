export function buildProxyImageUrl(imageUrl: string) {
    return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
}

export function getReferenceImageErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : '画像の処理に失敗しました';
}

export async function processReferenceImage(
    file: File,
    resizeImage: (file: File) => Promise<string>,
) {
    const dataUrl = await resizeImage(file);

    return {
        file,
        dataUrl,
    };
}

export async function fetchDownloadBlob(
    fetchImpl: typeof fetch,
    imageUrl: string,
) {
    try {
        const response = await fetchImpl(imageUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.blob();
    } catch {
        const proxyRes = await fetchImpl(buildProxyImageUrl(imageUrl));
        if (!proxyRes.ok) {
            throw new Error('Proxy fetch failed');
        }

        const data = await proxyRes.json() as { dataUrl?: string };
        if (!data.dataUrl) {
            throw new Error('No dataUrl in proxy response');
        }

        const proxiedResponse = await fetchImpl(data.dataUrl);
        if (!proxiedResponse.ok) {
            throw new Error('Proxy image fetch failed');
        }

        return proxiedResponse.blob();
    }
}
