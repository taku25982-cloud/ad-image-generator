import { NextResponse } from 'next/server';
import { z } from 'zod';

type ApiErrorOptions = {
    details?: unknown;
    headers?: HeadersInit;
};

export function apiError(status: number, error: string, options: ApiErrorOptions = {}) {
    const body = options.details === undefined
        ? { error }
        : { error, details: options.details };

    return NextResponse.json(body, {
        status,
        headers: options.headers,
    });
}

export function apiValidationError(error: z.ZodError) {
    return apiError(400, '入力内容に誤りがあります', {
        details: error.flatten().fieldErrors,
    });
}

export function apiBadRequest(error = '無効なリクエストです') {
    return apiError(400, error);
}

export function apiRateLimited(limit: number, remaining: number, reset: number) {
    return apiError(429, 'リクエストが多すぎます。しばらく待ってから再度お試しください。', {
        headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
        },
    });
}

export function apiFromKnownError(error: unknown) {
    if (!(error instanceof Error)) {
        return null;
    }

    if (error.message === '認証が必要です') {
        return apiError(401, error.message);
    }

    if (
        error.message === 'ユーザーが見つかりません' ||
        error.message === 'ブランドキットが見つかりません' ||
        error.message === 'プロジェクトが見つかりません' ||
        error.message === '派生元の履歴が見つかりません'
    ) {
        return apiError(404, error.message);
    }

    return null;
}
