// ========================================
// AI画像編集API
// ========================================

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// Gemini APIクライアントの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        // 認証
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        let decodedToken;
        try {
            decodedToken = await getAdminAuth().verifyIdToken(idToken);
        } catch (error) {
            console.error('Auth verification error:', error);
            return NextResponse.json({ error: '認証に失敗しました' }, { status: 401 });
        }

        const uid = decodedToken.uid;

        // ユーザー情報取得（プランチェック用）
        const adminDb = getAdminDb();
        const userRef = adminDb.collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
        }

        const userData = userDoc.data();
        const plan = userData?.subscription?.plan || 'free';

        // 無料プランの場合は編集機能を制限
        if (plan === 'free') {
            return NextResponse.json(
                { error: 'AI編集機能はStarterプラン以上でご利用いただけます。プランをアップグレードしてください。' },
                { status: 403 }
            );
        }

        // リクエストボディのパース
        const body = await request.json();
        const { imageData, instruction, editType } = body;

        // バリデーション
        if (!imageData) {
            return NextResponse.json({ error: '編集対象の画像が必要です' }, { status: 400 });
        }
        if (!instruction) {
            return NextResponse.json({ error: '編集指示が必要です' }, { status: 400 });
        }

        // 編集プロンプトの生成
        const prompt = buildEditPrompt({ instruction, editType });

        // Gemini APIで画像編集
        const model = genAI.getGenerativeModel({
            model: 'gemini-3-pro-image-preview',
            generationConfig: {
                // @ts-expect-error - responseModalities is valid for Gemini models
                responseModalities: ['Text', 'Image'],
            },
        });

        // コンテンツパーツを構築（画像 + テキスト指示）
        const contentParts: Part[] = [];

        // 元画像を添付
        const base64Match = imageData.match(/^data:([^;]+);base64,(.+)$/);
        if (base64Match) {
            contentParts.push({
                inlineData: {
                    mimeType: base64Match[1],
                    data: base64Match[2],
                },
            });
        }

        contentParts.push({ text: prompt });

        const result = await model.generateContent(contentParts);
        const response = result.response;

        // レスポンスからパーツを取得
        const parts = response.candidates?.[0]?.content?.parts || [];

        let editedImageData: string | null = null;
        let textContent = '';

        for (const part of parts) {
            if ('inlineData' in part && part.inlineData) {
                editedImageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            } else if ('text' in part && part.text) {
                textContent = part.text;
            }
        }

        if (!editedImageData) {
            return NextResponse.json({
                success: false,
                error: '画像の編集に失敗しました。別の指示で再度お試しください。',
                message: textContent,
            }, { status: 500 });
        }

        // 利用統計を更新
        await userRef.update({
            'usage.totalGenerations': FieldValue.increment(1),
            'usage.lastGenerationAt': FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
            success: true,
            imageUrl: editedImageData,
            message: textContent || '画像を編集しました。',
        });

    } catch (error) {
        console.error('Image edit error:', error);
        return NextResponse.json(
            {
                error: '画像編集中にエラーが発生しました',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// 編集プロンプト生成関数
function buildEditPrompt(params: {
    instruction: string;
    editType?: string;
}): string {
    const { instruction, editType } = params;

    const editTypeGuide: Record<string, string> = {
        text_change: 'テキストの内容やフォント、配置を変更してください。',
        color_adjust: '色味やカラーパレットを調整してください。',
        style_change: 'デザインスタイルや雰囲気を変更してください。',
        element_remove: '不要な要素を除去してください。',
    };

    const guide = editType && editTypeGuide[editType]
        ? `\n編集の種類: ${editTypeGuide[editType]}`
        : '';

    return `
あなたはプロの広告デザイナーです。添付された広告画像に対して、以下の編集指示に従って画像を修正してください。
${guide}
【編集指示】
${instruction}

【重要な注意事項】
1. 元の画像のレイアウトやデザインの品質を維持しながら修正してください。
2. 指示された部分のみを変更し、他の要素にはできるだけ影響を与えないでください。
3. 広告として完成度の高い仕上がりを保ってください。
4. 修正後の画像を出力してください。

修正した広告画像を生成してください。
`.trim();
}
