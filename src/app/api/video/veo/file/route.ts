import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { downloadVeoFile } from '@/lib/veo';

async function getSessionOrDevSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return session;
  }

  if (process.env.NODE_ENV === 'development') {
    return {
      user: {
        id: 'dev-user-id',
        email: 'dev@example.com',
        name: 'Dev User',
      },
    } as never;
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    if (process.env.ENABLE_VEO_VIDEO !== 'true') {
      return NextResponse.json(
        { error: 'Veo試験機能は無効です。ENABLE_VEO_VIDEO=true を設定してください。' },
        { status: 403 }
      );
    }

    const session = await getSessionOrDevSession();
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const fileName = request.nextUrl.searchParams.get('fileName');
    const downloadUri = request.nextUrl.searchParams.get('downloadUri');

    if (!fileName && !downloadUri) {
      return NextResponse.json({ error: 'fileName または downloadUri が必要です。' }, { status: 400 });
    }

    const { arrayBuffer, contentType } = await downloadVeoFile({
      name: fileName || undefined,
      downloadUri: downloadUri || undefined,
    });

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'attachment; filename="veo-generated-ad.mp4"',
      },
    });
  } catch (error) {
    console.error('Veo file route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Veo動画ファイルの取得に失敗しました。' },
      { status: 500 }
    );
  }
}
