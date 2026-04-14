import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createHash } from 'crypto';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { generations, users } from '@/db/schema';
import { downloadVeoFile } from '@/lib/veo';
import { canUseVeo, getVeoCreditCost } from '@/lib/video-billing';
import { uploadBinaryToR2 } from '@/lib/storage';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const finalizeDurationSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }
  return value;
}, z.union([z.literal(4), z.literal(6), z.literal(8)]));

const finalizeSchema = z.object({
  operationName: z.string().optional(),
  prompt: z.string().min(1),
  formatId: z.string().min(1),
  durationSeconds: finalizeDurationSchema,
  aspectRatio: z.enum(['16:9', '9:16']),
  brandHint: z.string().optional(),
  fileName: z.string().optional(),
  fileUri: z.string().optional(),
  downloadUri: z.string().optional(),
});

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

function buildHistoryTitle(input: z.infer<typeof finalizeSchema>) {
  if (input.brandHint?.trim()) {
    return input.brandHint.trim().slice(0, 80);
  }

  return input.prompt.trim().slice(0, 80);
}

function buildDeterministicGenerationId(userId: string, fileKey: string) {
  return createHash('sha256')
    .update(`${userId}:${fileKey}`)
    .digest('hex')
    .slice(0, 32);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrDevSession();
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = finalizeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || '入力内容が不正です' }, { status: 400 });
    }

    if (!parsed.data.fileName && !parsed.data.fileUri && !parsed.data.downloadUri) {
      return NextResponse.json({ error: 'fileName または fileUri / downloadUri が必要です。' }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const plan = user.plan || 'free';

    if (!isAdmin && !canUseVeo(plan)) {
      return NextResponse.json(
        { error: 'Veo 3.1 Lite 動画生成は Starter プラン以上で利用できます。' },
        { status: 403 }
      );
    }

    const creditsUsed = getVeoCreditCost(parsed.data.durationSeconds);
    if (!isAdmin && (user.credits || 0) < creditsUsed) {
      return NextResponse.json(
        { error: `クレジットが不足しています。${creditsUsed}クレジット必要です。` },
        { status: 403 }
      );
    }

    const fileKey =
      parsed.data.operationName ||
      parsed.data.fileName ||
      parsed.data.fileUri ||
      parsed.data.downloadUri ||
      '';
    const id = buildDeterministicGenerationId(session.user.id, fileKey);

    const existingGeneration = await db.query.generations.findFirst({
      where: eq(generations.id, id),
    });

    if (existingGeneration) {
      return NextResponse.json({
        success: true,
        historyId: existingGeneration.id,
        assetUrl: existingGeneration.imageUrl,
        duplicated: true,
      });
    }

    const { arrayBuffer, contentType } = await downloadVeoFile({
      name: parsed.data.fileName,
      uri: parsed.data.fileUri,
      downloadUri: parsed.data.downloadUri,
    });

    const storagePath = `generated/${session.user.id}/videos/${Date.now()}-${id}.mp4`;
    const storedVideoUrl = await uploadBinaryToR2(arrayBuffer, storagePath, contentType);
    const historyTitle = buildHistoryTitle(parsed.data);

    await db.insert(generations).values({
      id,
      userId: session.user.id,
      imageUrl: storedVideoUrl,
      thumbnailUrl: storedVideoUrl,
      format: parsed.data.formatId,
      prompt: parsed.data.prompt,
      templateId: 'veo-video',
      status: 'completed',
      creditsUsed,
      content: {
        productName: historyTitle,
        catchphrase: parsed.data.brandHint || '',
        description: parsed.data.prompt,
        targetAudience: '',
        mediaType: 'video',
        videoDuration: parsed.data.durationSeconds,
        sourceModel: 'veo-3.1-lite-generate-preview',
        aspectRatio: parsed.data.aspectRatio,
        operationName: parsed.data.operationName,
      },
      branding: {
        tone: 'veo-video',
        primaryColor: '#FF8748',
        secondaryColor: '#7C3AED',
      },
      originType: 'veo-video',
    });

    await db.update(users)
      .set({
        ...(isAdmin ? {} : { credits: sql`${users.credits} - ${creditsUsed}` }),
        usageTotalGenerations: sql`${users.usageTotalGenerations} + 1`,
        usageMonthlyGenerations: sql`${users.usageMonthlyGenerations} + 1`,
        usageLastGenerationAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      historyId: id,
      assetUrl: storedVideoUrl,
    });
  } catch (error) {
    console.error('Veo finalize route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Veo動画の保存に失敗しました。' },
      { status: 500 }
    );
  }
}
