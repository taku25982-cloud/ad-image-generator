import { NextResponse } from 'next/server';
import { getTemplateLibraryStateForUser } from '@/lib/template-library-server';

export async function GET() {
    try {
        const state = await getTemplateLibraryStateForUser();
        return NextResponse.json(state);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'ライブラリの取得に失敗しました';
        const status = message === '認証が必要です' ? 401 : 500;

        return NextResponse.json({ error: message }, { status });
    }
}
