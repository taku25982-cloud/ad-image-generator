import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { GoogleGenAI } from '@google/genai';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { generateRateLimit } from '@/lib/ratelimit';
import { AD_OBJECTIVES, type UnifiedFormData } from '@/lib/ad-config/types';
import { videoConceptSchema, type VideoConcept } from '@/types/video';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

type GeminiContentPart = {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
};

const suggestRequestSchema = z.object({
  instruction: z.string().min(1, '指示内容を入力してください').max(500, '指示は500文字以内で入力してください'),
  imageUrl: z.string().optional(),
  objective: z.string().optional(),
  selectedFormat: z.string().optional(),
  duration: z.number().min(3).max(30).optional(),
  formData: z.record(z.string(), z.unknown()).optional(),
});

const OBJECTIVE_FIELD_MAP: Record<string, { label: string; key: keyof UnifiedFormData }[]> = {
  'new-product': [
    { label: '商品名', key: 'productName' },
    { label: '価格', key: 'price' },
    { label: 'キャッチコピー', key: 'catchCopy' },
    { label: '商品説明', key: 'description' },
    { label: 'ターゲット層', key: 'targetAudience' },
  ],
  'sale-campaign': [
    { label: 'キャンペーン名', key: 'campaignName' },
    { label: '割引内容', key: 'discountInfo' },
    { label: '期間', key: 'campaignPeriod' },
    { label: '対象商品', key: 'campaignTargets' },
  ],
  'event-seminar': [
    { label: 'イベント名', key: 'eventName' },
    { label: '開催日時', key: 'eventDateTime' },
    { label: '開催場所', key: 'eventLocation' },
    { label: 'イベント内容', key: 'eventContent' },
  ],
  recruitment: [
    { label: '募集職種', key: 'jobTitle' },
    { label: '会社名', key: 'companyName' },
    { label: '福利厚生', key: 'jobBenefits' },
    { label: '求める人物像', key: 'jobRequirements' },
  ],
  'brand-awareness': [
    { label: 'ブランド名', key: 'brandName' },
    { label: 'ブランドメッセージ', key: 'brandMessage' },
    { label: 'コアバリュー', key: 'brandCoreValue' },
  ],
  'app-install': [
    { label: 'アプリ名', key: 'appName' },
    { label: '主要機能', key: 'appFeatures' },
    { label: '想定ユーザー', key: 'appTargetUser' },
    { label: '導入メリット', key: 'appDownloadBenefit' },
  ],
  'lead-generation': [
    { label: '資料名', key: 'materialName' },
    { label: '資料メリット', key: 'materialBenefits' },
    { label: '行動喚起', key: 'leadCallToAction' },
  ],
  'store-visit': [
    { label: '店舗名', key: 'storeName' },
    { label: '場所', key: 'storeLocation' },
    { label: '看板メニュー', key: 'signatureMenu' },
    { label: '来店特典', key: 'specialOffer' },
  ],
};

function getObjectiveName(objective?: string) {
  return AD_OBJECTIVES.find((item) => item.id === objective)?.name || '未指定';
}

function getFieldValue(formData: Partial<UnifiedFormData> | undefined, key: keyof UnifiedFormData) {
  const value = formData?.[key];
  return typeof value === 'string' ? value.trim() : '';
}

function buildObjectiveSummary(objective: string | undefined, formData: Partial<UnifiedFormData> | undefined) {
  const fields = OBJECTIVE_FIELD_MAP[objective || ''] || [];
  const lines = fields
    .map(({ label, key }) => {
      const value = getFieldValue(formData, key);
      return value ? `- ${label}: ${value}` : '';
    })
    .filter(Boolean);

  if (formData?.customInstructions && typeof formData.customInstructions === 'string' && formData.customInstructions.trim()) {
    lines.push(`- カスタム指示: ${formData.customInstructions.trim()}`);
  }

  if (formData?.tone && typeof formData.tone === 'string' && formData.tone.trim()) {
    lines.push(`- トーン: ${formData.tone.trim()}`);
  }

  return lines.length > 0 ? lines.join('\n') : '- 詳細情報は未入力';
}

function fallbackColors(formData: Partial<UnifiedFormData> | undefined) {
  const primary = typeof formData?.primaryColor === 'string' && formData.primaryColor ? formData.primaryColor : '#FF6B35';
  const secondary = typeof formData?.secondaryColor === 'string' && formData.secondaryColor ? formData.secondaryColor : '#7C3AED';
  return [primary, secondary] as [string, string];
}

function buildFallbackConcept(params: {
  objective?: string;
  selectedFormat?: string;
  duration?: number;
  instruction: string;
  formData?: Partial<UnifiedFormData>;
}): VideoConcept {
  const { objective = 'new-product', selectedFormat = 'instagram-feed', duration = 15, instruction, formData } = params;
  const colors = fallbackColors(formData);

  const headline =
    getFieldValue(formData, 'productName') ||
    getFieldValue(formData, 'campaignName') ||
    getFieldValue(formData, 'eventName') ||
    getFieldValue(formData, 'jobTitle') ||
    getFieldValue(formData, 'brandName') ||
    getFieldValue(formData, 'appName') ||
    getFieldValue(formData, 'materialName') ||
    getFieldValue(formData, 'storeName') ||
    '魅力を伝える広告動画';

  const support =
    getFieldValue(formData, 'catchCopy') ||
    getFieldValue(formData, 'description') ||
    getFieldValue(formData, 'discountInfo') ||
    getFieldValue(formData, 'brandMessage') ||
    instruction;

  const cta =
    getFieldValue(formData, 'leadCallToAction') ||
    getFieldValue(formData, 'specialOffer') ||
    getFieldValue(formData, 'appDownloadBenefit') ||
    '詳しくはこちら';

  const baseSceneDuration = Math.max(3, Math.floor(duration / 3));

  return {
    title: `${headline} 動画構成案`,
    objective,
    formatId: selectedFormat,
    totalDuration: duration,
    bgmMood: 'upbeat-modern',
    globalCtaText: cta,
    scenes: [
      {
        id: 'scene-hook',
        purpose: 'hook',
        headline,
        subcopy: support,
        badgeText: getFieldValue(formData, 'price') || getFieldValue(formData, 'discountInfo') || 'NEW',
        ctaText: undefined,
        durationSeconds: baseSceneDuration,
        imagePrompt: `${headline} を主役にした高品質な広告ビジュアル。${instruction}`,
        visualDirection: '冒頭で強く目を引くヒーローショット',
        bgColors: colors,
        layout: 'split-hero',
        textAlign: 'left',
        motionPreset: 'snappy-product',
      },
      {
        id: 'scene-benefit',
        purpose: 'benefit',
        headline: getFieldValue(formData, 'targetAudience') || 'ベネフィットを明確に訴求',
        subcopy: support,
        badgeText: undefined,
        ctaText: undefined,
        durationSeconds: baseSceneDuration,
        imagePrompt: `${headline} の利用シーンや価値が伝わる広告ビジュアル`,
        visualDirection: '利用シーンや価値が伝わる中盤カット',
        bgColors: colors,
        layout: 'floating-product',
        textAlign: 'left',
        motionPreset: 'calm-editorial',
      },
      {
        id: 'scene-cta',
        purpose: 'cta',
        headline: '今すぐチェック',
        subcopy: cta,
        badgeText: undefined,
        ctaText: cta,
        durationSeconds: duration - baseSceneDuration * 2,
        imagePrompt: `${headline} を訴求する締めの広告ビジュアル`,
        visualDirection: 'CTAを中央に据えた締めの構図',
        bgColors: colors,
        layout: 'editorial-center',
        textAlign: 'center',
        motionPreset: 'bold-promo',
      },
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    let session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session && process.env.NODE_ENV === 'development') {
      session = {
        user: {
          id: 'dev-user-id',
          email: 'dev@example.com',
          name: 'Dev User',
        },
      } as never;
    }

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userId = session.user.id;

    if (generateRateLimit) {
      const { success, limit, reset, remaining } = await generateRateLimit.limit(`video_suggest_${userId}`);
      if (!success) {
        return NextResponse.json(
          { error: 'リクエストが多すぎます。しばらく待ってから再度お試しください。' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
            },
          }
        );
      }
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (!isAdmin && (user.credits || 0) <= 0) {
      return NextResponse.json({ error: 'クレジットが不足しています' }, { status: 403 });
    }

    const reqBody = await request.json();
    const result = suggestRequestSchema.safeParse(reqBody);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { instruction, imageUrl, objective, selectedFormat, duration, formData } = result.data;
    const typedFormData = (formData || {}) as Partial<UnifiedFormData>;
    const objectiveName = getObjectiveName(objective);

    const model = 'gemini-3-flash-preview';

    const prompt = `
あなたは世界最高峰の広告クリエイティブディレクター兼モーショングラフィックスプランナーです。
ユーザー入力に基づき、Remotionでそのまま動画化しやすい広告動画の構成JSONを作成してください。

## 広告の目的
${objectiveName} (id: ${objective || 'unknown'})

## ユーザー指示
${instruction}

## 入力された詳細情報
${buildObjectiveSummary(objective, typedFormData)}

## 動画の前提
- 想定フォーマット: ${selectedFormat || 'instagram-feed'}
- 想定尺: ${duration || 15} 秒
- シーン数: 3〜4
- 1シーンの尺: 2〜8秒
- 出力は必ずJSONのみ

## JSON要件
- title: 構成案のタイトル
- objective: 広告目的のid
- formatId: 最適なフォーマットid
- totalDuration: 合計尺
- bgmMood: BGMのムードを短い英語フレーズで
- globalCtaText: 動画全体の行動喚起
- scenes: 配列

## scenes 要件
各sceneは以下のプロパティを持つこと:
- id: 一意な英数字
- purpose: hook / problem / benefit / proof / offer / cta のいずれか
- headline: 強い見出し
- subcopy: 補足コピー
- badgeText: 任意
- ctaText: 任意
- durationSeconds: 秒数
- imagePrompt: 高品質画像生成用の具体的な英語プロンプト
- visualDirection: 画作りの意図を日本語で簡潔に
- bgColors: 16進カラーコード2色
- layout: split-hero / editorial-center / stacked-card / floating-product のいずれか
- textAlign: left / center
- motionPreset: cinematic-soft / snappy-product / calm-editorial / bold-promo のいずれか

## 重要ルール
- 広告として自然で、冒頭で惹きつけ、終盤でCTAを強める構成にする
- 商品名、キャンペーン名、イベント名、ブランド名など入力済み固有名詞を優先して使う
- scenes の durationSeconds 合計は totalDuration と一致させる
- 画像がある場合は、その雰囲気を踏まえた imagePrompt にする
- 誇張しすぎず、現実の広告として使えるコピーにする
- sceneごとに layout や textAlign を変え、同じテンプレート感を避ける
`.trim();

    const parts: GeminiContentPart[] = [];

    if (imageUrl && imageUrl.startsWith('data:image/')) {
      const [meta, base64Data] = imageUrl.split(';base64,');
      const mimeType = meta.split(':')[1];
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    parts.push({ text: prompt });

    let concept = buildFallbackConcept({
      objective,
      selectedFormat,
      duration,
      instruction,
      formData: typedFormData,
    });

    try {
      const geminiResponse = await ai.models.generateContent({
        model,
        contents: parts as never,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          topP: 0.95,
        },
      });
      const responseText = geminiResponse.text;
      if (!responseText) {
        throw new Error('Gemini response text was empty.');
      }
      const parsed = JSON.parse(responseText);
      concept = videoConceptSchema.parse(parsed);
    } catch (error) {
      console.error('Video Suggestion parse fallback:', error);
    }

    await db.transaction(async (tx) => {
      const updateData = {
        usageTotalGenerations: sql`${users.usageTotalGenerations} + 1`,
        usageMonthlyGenerations: sql`${users.usageMonthlyGenerations} + 1`,
        usageLastGenerationAt: new Date(),
        updatedAt: new Date(),
      };

      if (!isAdmin) {
        await tx.update(users)
          .set({
            ...updateData,
            credits: sql`${users.credits} - 1`,
          })
          .where(eq(users.id, userId));
      } else {
        await tx.update(users)
          .set(updateData)
          .where(eq(users.id, userId));
      }
    });

    return NextResponse.json({
      success: true,
      data: concept,
    });
  } catch (error: unknown) {
    console.error('Video Suggestion API Exception:', error);
    return NextResponse.json(
      { error: 'サーバー内部エラーが発生しました。' },
      { status: 500 }
    );
  }
}
