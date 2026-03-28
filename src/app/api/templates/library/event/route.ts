import { NextResponse } from 'next/server';
import { recordTemplateLibraryEvent, setTemplateFavoriteState } from '@/lib/template-library-server';
import type { TemplateLibraryEventType } from '@/types/template-library';

interface EventRequestBody {
    templateId?: string;
    type?: TemplateLibraryEventType;
    isFavorite?: boolean;
}

function isEventType(value: unknown): value is TemplateLibraryEventType {
    return value === 'open' || value === 'create' || value === 'customize';
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as EventRequestBody;

        if (!body.templateId) {
            return NextResponse.json({ error: 'templateId が必要です' }, { status: 400 });
        }

        if (typeof body.isFavorite === 'boolean') {
            await setTemplateFavoriteState(body.templateId, body.isFavorite);
            return NextResponse.json({ success: true });
        }

        if (!isEventType(body.type)) {
            return NextResponse.json({ error: 'type が不正です' }, { status: 400 });
        }

        await recordTemplateLibraryEvent(body.templateId, body.type);
        return NextResponse.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'テンプレートイベントの保存に失敗しました';
        const status = message === '認証が必要です' ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
