import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    // 認証チェック: ログインしていないユーザーはアクセス不可
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URLパラメーターが必要です' }, { status: 400 });
    }

    // 許可するホストを検証（R2のパブリックURLからのみ取得を許可）
    try {
        const parsedUrl = new URL(url);
        const allowedHosts = [
            process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : null,
            'r2.dev',
        ].filter(Boolean);

        const isAllowed = allowedHosts.some(host =>
            host && (parsedUrl.hostname === host || parsedUrl.hostname.endsWith('.' + host))
        );
        if (!isAllowed) {
            return NextResponse.json({ error: '許可されていないURLです' }, { status: 403 });
        }
    } catch {
        return NextResponse.json({ error: '無効なURLです' }, { status: 400 });
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return NextResponse.json(
                { error: '画像の取得に失敗しました', status: response.status },
                { status: response.status }
            );
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const contentType = response.headers.get('content-type') || 'image/png';

        return NextResponse.json({
            dataUrl: `data:${contentType};base64,${base64}`
        });

    } catch (error) {
        console.error('Proxy image error:', error);
        return NextResponse.json(
            { error: 'サーバーでプロキシリクエスト中にエラーが発生しました' },
            { status: 500 }
        );
    }
}
