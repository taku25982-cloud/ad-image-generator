import { z } from 'zod';
import type { UnifiedFormData } from '@/lib/ad-config/types';

const veoDurationSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }
  return value;
}, z.union([z.literal(4), z.literal(6), z.literal(8)]));

export const veoRequestSchema = z.object({
  prompt: z.string().min(1).max(4000),
  imageUrl: z.string().optional(),
  durationSeconds: veoDurationSchema.default(6),
  aspectRatio: z.enum(['16:9', '9:16']).default('9:16'),
});

export type VeoGenerateRequest = z.infer<typeof veoRequestSchema>;

const VEO_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
export const VEO_LITE_MODEL = 'veo-3.1-lite-generate-preview';

type VeoFileResource = {
  name?: string;
  uri?: string;
  downloadUri?: string;
  mimeType?: string;
};

type VeoOperation = {
  name?: string;
  done?: boolean;
  error?: {
    message?: string;
  };
  response?: {
    generatedVideos?: Array<{
      video?: VeoFileResource;
    }>;
    generateVideoResponse?: {
      generatedSamples?: Array<{
        video?: VeoFileResource;
      }>;
    };
  };
};

const RETRYABLE_VEO_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const VEO_RETRY_DELAYS_MS = [1200, 2500, 5000];

function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }
  return apiKey;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getResponseStatus(error: unknown) {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const record = error as Record<string, unknown>;
  const status = record.status;
  if (typeof status === 'number') {
    return status;
  }

  return null;
}

function isRetryableVeoError(error: unknown) {
  const status = getResponseStatus(error);
  if (status && RETRYABLE_VEO_STATUS_CODES.has(status)) {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error);
  return /internal server issue|internal error|temporar|try again in a few minutes/i.test(message);
}

function parseInlineImage(imageUrl?: string) {
  if (!imageUrl || !imageUrl.startsWith('data:image/')) {
    return undefined;
  }

  const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return undefined;
  }

  return {
    mimeType: match[1],
    imageBytes: match[2],
  };
}

export function getVeoAspectRatioFromFormat(formatId: string) {
  if (formatId === 'youtube-landscape') {
    return '16:9' as const;
  }

  return '9:16' as const;
}

function pickFirst<T>(items: Array<T | undefined> | undefined) {
  return items?.find(Boolean);
}

export function buildVeoPrompt(params: {
  instruction?: string;
  formData: UnifiedFormData;
  conceptTitle?: string;
  sceneSummary?: string[];
}) {
  const { instruction, formData, conceptTitle, sceneSummary = [] } = params;
  const brand =
    formData.productName ||
    formData.campaignName ||
    formData.eventName ||
    formData.brandName ||
    formData.appName ||
    formData.storeName ||
    '広告対象';
  const support =
    formData.catchCopy ||
    formData.description ||
    formData.discountInfo ||
    formData.brandMessage ||
    formData.appFeatures ||
    formData.materialBenefits ||
    formData.specialOffer ||
    '価値が短時間で伝わる広告演出';
  const cta =
    formData.leadCallToAction || formData.specialOffer || formData.appDownloadBenefit || '詳しくはこちら';
  const tone = formData.tone || 'modern';
  const promptSections = [
    `Create a polished Japanese ad video for "${brand}".`,
    instruction ? `Creative brief: ${instruction}` : '',
    conceptTitle ? `Storyboard title: ${conceptTitle}` : '',
    `Core message: ${support}.`,
    `Call to action: ${cta}.`,
    `Visual tone: ${tone}, premium commercial lighting, clear subject focus, strong opening hook, clean product storytelling, conversion-focused ending.`,
    sceneSummary.length > 0 ? `Scene flow: ${sceneSummary.join(' / ')}.` : '',
    'Output a realistic ad with native audio, subtle camera motion, legible composition, and no on-screen subtitles or text overlays.',
  ];

  return promptSections.filter(Boolean).join(' ');
}

export async function startVeoGeneration(input: VeoGenerateRequest) {
  const apiKey = getApiKey();
  const image = parseInlineImage(input.imageUrl);
  let lastError: unknown;

  for (let attempt = 0; attempt <= VEO_RETRY_DELAYS_MS.length; attempt += 1) {
    const response = await fetch(`${VEO_API_BASE_URL}/models/${VEO_LITE_MODEL}:predictLongRunning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: input.prompt,
            ...(image ? { image } : {}),
          },
        ],
        parameters: {
          aspectRatio: input.aspectRatio,
          durationSeconds: input.durationSeconds,
        },
      }),
    });

    if (response.ok) {
      return (await response.json()) as VeoOperation;
    }

    const errorText = await response.text();
    const error = Object.assign(new Error(errorText || 'Failed to start Veo generation.'), {
      status: response.status,
    });
    lastError = error;

    if (!isRetryableVeoError(error) || attempt === VEO_RETRY_DELAYS_MS.length) {
      throw error;
    }

    await sleep(VEO_RETRY_DELAYS_MS[attempt]);
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to start Veo generation.');
}

export async function getVeoOperation(operationName: string) {
  const apiKey = getApiKey();
  const response = await fetch(`${VEO_API_BASE_URL}/${operationName}`, {
    headers: {
      'x-goog-api-key': apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch Veo operation.');
  }

  return (await response.json()) as VeoOperation;
}

export function extractGeneratedVideoFile(operation: VeoOperation) {
  return (
    pickFirst(operation.response?.generatedVideos)?.video ||
    pickFirst(operation.response?.generateVideoResponse?.generatedSamples)?.video ||
    undefined
  );
}

export function getVeoOperationErrorMessage(operation: VeoOperation) {
  return operation.error?.message || 'Veo generation failed.';
}

export async function downloadVeoFile(file: VeoFileResource) {
  const apiKey = getApiKey();
  const targetUrl =
    file.downloadUri ||
    file.uri ||
    (file.name ? `${VEO_API_BASE_URL}/${file.name}:download` : undefined);

  if (!targetUrl) {
    throw new Error('Generated video file URL was not returned.');
  }

  const response = await fetch(targetUrl, {
    headers: {
      'x-goog-api-key': apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to download generated video.');
  }

  return {
    arrayBuffer: await response.arrayBuffer(),
    contentType: response.headers.get('content-type') || file.mimeType || 'video/mp4',
  };
}
