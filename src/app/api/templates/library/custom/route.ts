import { NextResponse } from 'next/server';
import { saveCustomTemplateForUser } from '@/lib/template-library-server';
import type { EnrichedAdTemplate } from '@/lib/template-catalog';

interface CustomTemplateRequestBody {
    template?: EnrichedAdTemplate;
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as CustomTemplateRequestBody;

        if (!body.template?.id || !body.template.name || !body.template.description) {
            return NextResponse.json({ error: 'template が不正です' }, { status: 400 });
        }

        await saveCustomTemplateForUser(body.template);
        return NextResponse.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'カスタムテンプレートの保存に失敗しました';
        const status = message === '認証が必要です' ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
