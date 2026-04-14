import type { UnifiedFormData } from './ad-config/types';

export interface GeneratedImageItem {
    generationId: string;
    imageUrl: string;
    format: string;
    variantLabel?: string;
    isFavorite?: boolean;
    dimensions?: {
        width: number;
        height: number;
    };
}

export interface GenerateApiResponse {
    imageUrl?: string;
    images?: GeneratedImageItem[];
    error?: string;
    details?: unknown;
    message?: string;
}

export function buildGenerateRequestPayload(input: {
    selectedFormat: string;
    targetFormats: string[];
    selectedBrandKitId: string;
    selectedProjectId: string;
    sourceGenerationId: string;
    originType: string;
    variantCount: number;
    variantMode: 'message' | 'tone' | 'layout';
    formData: UnifiedFormData;
    referenceImage: string | null;
}) {
    const {
        selectedFormat,
        targetFormats,
        selectedBrandKitId,
        selectedProjectId,
        sourceGenerationId,
        originType,
        variantCount,
        variantMode,
        formData,
        referenceImage,
    } = input;

    return {
        format: selectedFormat,
        formats: targetFormats,
        brandKitId: selectedBrandKitId || undefined,
        projectId: selectedProjectId || undefined,
        sourceGenerationId: sourceGenerationId || undefined,
        originType: originType || undefined,
        variantCount,
        variantMode,
        ...formData,
        ...(referenceImage ? { referenceImage } : {}),
    };
}

export function getGenerateErrorMessage(data: Pick<GenerateApiResponse, 'error' | 'details'>) {
    let errorDetails = '';
    if (data.details) {
        errorDetails = typeof data.details === 'object'
            ? JSON.stringify(data.details)
            : String(data.details);
    }

    return errorDetails ? `${data.error}（${errorDetails}）` : (data.error || '生成に失敗しました');
}

export function normalizeGeneratedImages(
    data: GenerateApiResponse,
    selectedFormat: string | null,
): GeneratedImageItem[] | null {
    if (data.images?.length) {
        return data.images.map((item) => ({ ...item, isFavorite: false }));
    }

    if (data.imageUrl) {
        return [{
            generationId: crypto.randomUUID(),
            imageUrl: data.imageUrl,
            format: selectedFormat || 'custom',
            isFavorite: false,
        }];
    }

    return null;
}
