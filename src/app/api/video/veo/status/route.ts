import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { extractGeneratedVideoFile, getVeoOperation, getVeoOperationErrorMessage } from '@/lib/veo';

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

    const operationName = request.nextUrl.searchParams.get('operationName');
    if (!operationName) {
      return NextResponse.json({ error: 'operationName が必要です。' }, { status: 400 });
    }

    const operation = await getVeoOperation(operationName);
    const file = extractGeneratedVideoFile(operation);

    if (operation.done && operation.error) {
      return NextResponse.json({
        success: false,
        state: 'failed',
        error: getVeoOperationErrorMessage(operation),
      });
    }

    if (operation.done && file?.name) {
      return NextResponse.json({
        success: true,
        state: 'completed',
        fileName: file.name,
        fileUri: file.uri,
        downloadUri: file.downloadUri,
      });
    }

    return NextResponse.json({
      success: true,
      state: operation.done ? 'completed' : 'processing',
    });
  } catch (error) {
    console.error('Veo status route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Veo生成状態の取得に失敗しました。' },
      { status: 500 }
    );
  }
}
