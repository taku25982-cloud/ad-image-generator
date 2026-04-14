// ========================================
// 広告作成ページ（1ページ統合版）
// ========================================

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AD_FORMATS, FORMAT_PACKS, getAdFormatById, getFormatPackById } from '@/lib/ad-formats';
import { UnifiedFormData, DEFAULT_FORM_DATA, AdObjectiveId, AD_OBJECTIVES } from '@/lib/ad-config/types';
import { ObjectiveSelector } from '@/components/ad-config/ObjectiveSelector';
import { AppHeader } from '@/components/layout/AppHeader';
import {
    buildGenerateRequestPayload,
    getGenerateErrorMessage,
    normalizeGeneratedImages,
    type GeneratedImageItem,
} from '@/lib/create-generation';
import {
    buildBrandKitRequestPayload,
    buildGeneratedAssetFileName,
    buildProjectRequestPayload,
    getWorkspaceErrorMessage,
} from '@/lib/create-workspace';
import {
    fetchDownloadBlob,
    getReferenceImageErrorMessage,
    processReferenceImage,
} from '@/lib/create-media';
import {
    getWinnerToggleErrorMessage,
    replaceHistories,
    toggleGeneratedImageFavorite,
    toWinnerToggleState,
} from '@/lib/create-winner';
import { DetailsPanel } from '@/components/create/DetailsPanel';
import { FormatSelectionPanel } from '@/components/create/FormatSelectionPanel';
import { GenerationProgressOverlay } from '@/components/create/GenerationProgressOverlay';
import { GenerationResultPanel } from '@/components/create/GenerationResultPanel';
import { WorkspacePanel } from '@/components/create/WorkspacePanel';
import { resizeAndCompressImage } from '@/lib/image-utils';
import { applyInitialQueryPreset, getTemplateMappedPresetFormData } from '@/lib/create-page';
import { getTemplateById } from '@/lib/template-catalog';
import { getCustomTemplates, syncTemplateLibraryState, trackTemplateEvent } from '@/lib/template-library';
import { getAdHistoriesByUserId, toggleAdHistoryFavorite, type AdHistory } from '@/lib/history';
import { SHOW_BRAND_FEATURES, SHOW_PROJECT_FEATURES } from '@/lib/feature-flags';

interface WinningInsight {
    favoriteCount: number;
    summary: string;
    signals: string[];
    topCtr?: number;
    topCvr?: number;
}

const TONE_OPTIONS = [
    { id: 'modern', label: 'モダン', description: '洗練された現代的なデザイン' },
    { id: 'cute', label: 'キュート', description: '可愛らしく親しみやすいデザイン' },
    { id: 'luxury', label: 'ラグジュアリー', description: '高級感のある上品なデザイン' },
    { id: 'pop', label: 'ポップ', description: '明るく元気なデザイン' },
    { id: 'minimal', label: 'ミニマル', description: 'シンプルで洗練されたデザイン' },
    { id: 'bold', label: 'ボールド', description: '大胆でインパクトのあるデザイン' },
] as const;

const DEFAULT_BRAND_KIT_DRAFT = {
    name: '',
    primaryColor: '#FF6B35',
    secondaryColor: '#7C3AED',
    preferredTone: 'modern',
};

const DEFAULT_PROJECT_DRAFT = {
    name: '',
    description: '',
};

function getInitialSelectedBrandKitId(initialBrandKits: BrandKitItem[]) {
    const defaultBrandKit = initialBrandKits.find((item) => item.isDefault) || initialBrandKits[0];
    return SHOW_BRAND_FEATURES && defaultBrandKit ? defaultBrandKit.id : '';
}

function getMediumOptimizationTips(formatId?: string | null, objective?: string) {
    const formatTips: Record<string, string[]> = {
        'instagram-story': ['縦長なので見出しは短く強く', '上下端に重要情報を置きすぎない', '主役は中央寄りに大きく配置'],
        'instagram-feed': ['正方形で一訴求に絞る', '中央の視認性を優先', 'テキストは短めに整理'],
        'facebook-ad': ['横長で視線誘導を作る', '商品、見出し、CTAの順を明確に', '情報を詰め込みすぎない'],
        'twitter-post': ['タイムラインで止まる強い見出し', '短いコピーで一瞬で伝える', 'ビジュアルの勢いを優先'],
        'youtube-thumbnail': ['小さくても読める大きな文字', '強いコントラスト', '主役を大胆に見せる'],
        'google-display': ['小サイズ前提で文字量を絞る', 'CTAを埋もれさせない', '主役を1つに絞る'],
        'ec-banner': ['価格や特典を数字で強調', '横長なので情報の流れを一直線に', '商品とCTAを近づける'],
        'product-image': ['商品そのものを主役にする', '背景は整理して信頼感を優先', 'EC用途なら清潔感を重視'],
    };

    const objectiveTip: Record<string, string> = {
        'sale-campaign': 'セール訴求では割引や特典を最優先で目立たせる',
        'lead-generation': 'リード獲得ではCTAを具体的にする',
        'app-install': 'アプリ訴求では利用メリットを先に見せる',
        'recruitment': '採用では誰向けかと働く魅力を先に出す',
        'event-seminar': 'イベントでは日時と参加価値を一目で見せる',
    };

    return [
        ...(formatId ? (formatTips[formatId] || []) : []),
        objective ? objectiveTip[objective] : '',
    ].filter(Boolean);
}

interface BrandKitItem {
    id: string;
    name: string;
    description?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    accentColor?: string | null;
    preferredTone?: string | null;
    defaultCopyRules?: string[] | null;
    negativeRules?: string[] | null;
    fontPreferences?: string[] | null;
    isDefault?: boolean;
}

interface ProjectItem {
    id: string;
    name: string;
    description?: string | null;
    brandKitId?: string | null;
    status?: string;
    tags?: string[] | null;
}

type InitialAdHistory = Omit<AdHistory, 'createdAt'> & {
    createdAt: string;
};

function reviveHistory(item: InitialAdHistory): AdHistory {
    return {
        ...item,
        createdAt: new Date(item.createdAt),
    };
}

interface CreativeScoreMetric {
    label: string;
    score: number;
    note: string;
}

interface CreativeEvaluation {
    totalScore: number;
    verdict: string;
    summary: string;
    suggestions: string[];
    experimentIdeas: string[];
    metrics: CreativeScoreMetric[];
}

function clampScore(score: number) {
    return Math.max(0, Math.min(100, Math.round(score)));
}

function evaluateCreative(input: {
    formData: UnifiedFormData;
    formatLabel?: string;
    hasBrandKit: boolean;
    hasProject: boolean;
    variantCount: number;
}): CreativeEvaluation {
    const { formData, formatLabel, hasBrandKit, hasProject, variantCount } = input;
    const headline = [formData.catchCopy, formData.campaignName, formData.brandMessage, formData.leadCallToAction]
        .filter(Boolean)
        .join(' ');
    const description = [formData.description, formData.eventContent, formData.materialBenefits, formData.brandCoreValue]
        .filter(Boolean)
        .join(' ');
    const audience = [formData.targetAudience, formData.appTargetUser]
        .filter(Boolean)
        .join(' ');
    const cta = [formData.leadCallToAction, formData.specialOffer, formData.appDownloadBenefit, formData.discountInfo]
        .filter(Boolean)
        .join(' ');
    const actionHint = /(無料|申込|応募|予約|購入|今すぐ|体験|ダウンロード|相談)/.test(`${headline} ${cta}`);
    const isShortFormat = ['instagram-story', 'google-display', 'ec-banner'].includes(formatLabel || '');

    const clarityScore = clampScore(
        35
        + (headline ? 30 : 0)
        + (description ? 20 : 0)
        + ((formData.productName || formData.brandName || formData.storeName) ? 15 : 0)
    );
    const ctaScore = clampScore(30 + (cta ? 40 : 0) + (actionHint ? 20 : 0) + (formData.price ? 10 : 0));
    const audienceScore = clampScore(35 + (audience ? 45 : 0) + (formData.objective ? 10 : 0) + (hasProject ? 10 : 0));
    const brandScore = clampScore(
        30
        + (formData.tone ? 20 : 0)
        + (formData.primaryColor && formData.primaryColor !== 'auto' ? 15 : 0)
        + (formData.secondaryColor && formData.secondaryColor !== 'auto' ? 15 : 0)
        + (hasBrandKit ? 20 : 0)
    );
    const formatScore = clampScore(
        40
        + (formatLabel ? 20 : 0)
        + (isShortFormat && headline.length <= 36 ? 20 : 0)
        + (!isShortFormat && description.length >= 20 ? 10 : 0)
        + (description.length <= 120 ? 10 : 0)
    );

    const metrics: CreativeScoreMetric[] = [
        { label: '訴求の明確さ', score: clarityScore, note: headline ? '主メッセージは入っています。' : '主メッセージが弱めです。' },
        { label: 'CTAの強さ', score: ctaScore, note: cta || actionHint ? '行動喚起の要素があります。' : '行動喚起を足す余地があります。' },
        { label: 'ターゲット適合', score: audienceScore, note: audience ? '誰向けかが見えています。' : 'ターゲット指定を足すと改善しやすいです。' },
        { label: 'ブランド整合', score: brandScore, note: hasBrandKit ? 'ブランド文脈が反映されています。' : 'ブランドキットを使うと安定します。' },
        { label: '媒体適合', score: formatScore, note: formatLabel ? '媒体サイズを踏まえた評価です。' : 'フォーマット選択で評価精度が上がります。' },
    ];

    const totalScore = clampScore(metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length);
    const suggestions: string[] = [];
    const experimentIdeas: string[] = [];

    if (!headline) suggestions.push('キャッチコピーか主見出しを足して、ひと目で伝わる訴求にしてください。');
    if (!cta && !actionHint) suggestions.push('「今すぐ」「無料」「応募」などの行動喚起を入れると反応が上がりやすいです。');
    if (!audience) suggestions.push('ターゲットを明記すると、コピーとビジュアルの精度が上がります。');
    if (!hasBrandKit) suggestions.push('ブランドキットを紐づけると、色とトーンの再現性が安定します。');
    if (isShortFormat && headline.length > 36) suggestions.push('この媒体ではメッセージをもう少し短くすると視認性が上がります。');

    switch (formData.objective) {
        case 'sale-campaign':
            if (!formData.discountInfo) suggestions.push('割引率や特典を大きく見せると、セール訴求の強さが増します。');
            experimentIdeas.push('同じ構図で「割引強調案」と「商品魅力強調案」を出し分けて CTR を比較する。');
            experimentIdeas.push('期間訴求あり/なしの 2 パターンを作って緊急性の効き方を比較する。');
            break;
        case 'lead-generation':
            if (!formData.leadCallToAction) suggestions.push('資料請求や無料相談など、具体的なCTAを前面に出すと反応が上がりやすいです。');
            experimentIdeas.push('「導入メリット訴求」と「不安解消訴求」で見出しを分けて CVR を比較する。');
            experimentIdeas.push('資料名を主役にする案と、得られる成果を主役にする案を比較する。');
            break;
        case 'app-install':
            if (!formData.appDownloadBenefit) suggestions.push('インストール直後の得や便利さを一文で見せると訴求が締まります。');
            experimentIdeas.push('UI画面訴求とベネフィット訴求の 2 方向で反応を比較する。');
            experimentIdeas.push('「今すぐDL」訴求と「無料で試す」訴求で温度感を比較する。');
            break;
        case 'recruitment':
            if (!formData.jobBenefits) suggestions.push('求人では待遇や働く魅力を短く強く出すと応募意欲につながりやすいです。');
            experimentIdeas.push('カルチャー訴求と条件訴求の 2 方向で応募率を比較する。');
            experimentIdeas.push('社員の雰囲気重視のビジュアル案と職種の専門性重視の案を比較する。');
            break;
        default:
            experimentIdeas.push('見出しを短く強くした案と、説明を厚くした案で CTR の差を見る。');
            experimentIdeas.push('トーンを変えた 2 案で、ブランドらしさと反応率のバランスを見る。');
            break;
    }

    if (variantCount <= 1) {
        experimentIdeas.unshift('次回は 3〜4 案のバリエーション生成を使って、勝ち筋を比較しながら選ぶ。');
    }

    let verdict = '改善余地あり';
    let summary = '方向性は見えていますが、まだ勝ちクリエイティブに寄せる余地があります。';

    if (totalScore >= 85) {
        verdict = 'かなり強い';
        summary = '訴求、CTA、ブランド整合のバランスが良く、そのままテストに回しやすい状態です。';
    } else if (totalScore >= 70) {
        verdict = 'テスト候補';
        summary = '十分に良い水準です。あと一段 CTA かターゲット表現を整えるとさらに強くなります。';
    }

    return {
        totalScore,
        verdict,
        summary,
        suggestions: suggestions.slice(0, 3),
        experimentIdeas: experimentIdeas.slice(0, 3),
        metrics,
    };
}

function buildWinningInsight(input: {
    histories: AdHistory[];
    brandKitId: string;
    projectId: string;
}): WinningInsight | null {
    const relevant = input.histories.filter((item) => {
        if (!item.isFavorite) {
            return false;
        }

        if (input.projectId && item.projectId === input.projectId) {
            return true;
        }

        if (input.brandKitId && item.brandKitId === input.brandKitId) {
            return true;
        }

        return false;
    });

    if (relevant.length === 0) {
        return null;
    }

    const toneCounts = new Map<string, number>();
    const formatCounts = new Map<string, number>();
    const copyLengths = relevant.map((item) => (item.catchCopy || '').length).filter((length) => length > 0);
    const ctrValues = relevant.map((item) => item.performance?.ctr).filter((value): value is number => typeof value === 'number');
    const cvrValues = relevant.map((item) => item.performance?.cvr).filter((value): value is number => typeof value === 'number');

    for (const item of relevant) {
        if (item.tone) {
            toneCounts.set(item.tone, (toneCounts.get(item.tone) || 0) + 1);
        }
        if (item.format) {
            formatCounts.set(item.format, (formatCounts.get(item.format) || 0) + 1);
        }
    }

    const topTone = [...toneCounts.entries()].sort((left, right) => right[1] - left[1])[0];
    const topFormat = [...formatCounts.entries()].sort((left, right) => right[1] - left[1])[0];
    const avgCopyLength = copyLengths.length > 0
        ? Math.round(copyLengths.reduce((sum, length) => sum + length, 0) / copyLengths.length)
        : 0;
    const topCtr = ctrValues.length > 0 ? Math.max(...ctrValues) : undefined;
    const topCvr = cvrValues.length > 0 ? Math.max(...cvrValues) : undefined;

    const signals = [
        topTone ? `勝ち案で最も多いトーンは「${topTone[0]}」です。` : '',
        topFormat ? `よく採用されているフォーマットは「${topFormat[0]}」です。` : '',
        avgCopyLength > 0 ? `採用案のキャッチコピー平均は約 ${avgCopyLength} 文字です。` : '',
        typeof topCtr === 'number' ? `記録済みの最高CTRは ${topCtr}% です。高反応案の見出しを再現候補にできます。` : '',
        typeof topCvr === 'number' ? `記録済みの最高CVRは ${topCvr}% です。反応後の深い訴求も参考になります。` : '',
    ].filter(Boolean);

    const summary = (relevant.length >= 3
        ? `過去の採用案 ${relevant.length} 件から、勝ちやすい方向性が見えています。`
        : `採用済みの案が ${relevant.length} 件あります。少しずつ勝ち筋を学習中です。`)
        + (ctrValues.length > 0 || cvrValues.length > 0 ? ' 成果数値も蓄積され始めています。' : '');

    return {
        favoriteCount: relevant.length,
        summary,
        signals,
        topCtr,
        topCvr,
    };
}

interface CreatePageClientProps {
    initialBrandKits: BrandKitItem[];
    initialProjects: ProjectItem[];
    initialHistories: InitialAdHistory[];
    initialQuery: {
        templateId?: string;
        templateFormat?: string;
        format?: string;
        brandKitId?: string;
        projectId?: string;
        originType?: string;
        sourceGenerationId?: string;
        productName?: string;
        catchCopy?: string;
        description?: string;
        targetAudience?: string;
        tone?: string;
        primaryColor?: string;
        secondaryColor?: string;
    };
}

export default function CreatePageClient(props: CreatePageClientProps) {
    return <CreatePageContent {...props} />;
}

function CreatePageContent({
    initialBrandKits,
    initialProjects,
    initialHistories,
    initialQuery,
}: CreatePageClientProps) {
    const { user, userDoc, refreshUserDoc } = useAuth();
    const router = useRouter();
    const resultRef = useRef<HTMLDivElement>(null);
    const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
    const [templateName, setTemplateName] = useState<string | null>(null);
    const [templateId, setTemplateId] = useState<string | null>(null);
    const [showAllFormats, setShowAllFormats] = useState(false);
    const [formData, setFormData] = useState<UnifiedFormData>(DEFAULT_FORM_DATA);
    const [brandKits, setBrandKits] = useState<BrandKitItem[]>(initialBrandKits);
    const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
    const [selectedBrandKitId, setSelectedBrandKitId] = useState<string>(() => getInitialSelectedBrandKitId(initialBrandKits));
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [sourceGenerationId, setSourceGenerationId] = useState<string>('');
    const [originType, setOriginType] = useState<string>('custom');
    const [variantCount, setVariantCount] = useState(1);
    const [variantMode, setVariantMode] = useState<'message' | 'tone' | 'layout'>('message');
    const [selectedFormatPack, setSelectedFormatPack] = useState<'single' | 'social-starter' | 'social-wide' | 'commerce'>('single');
    const [selectedGeneratedIndex, setSelectedGeneratedIndex] = useState(0);
    const [histories, setHistories] = useState<AdHistory[]>(() => initialHistories.map(reviveHistory));
    const isLoadingInsights = false;
    const [isSavingWinner, setIsSavingWinner] = useState(false);
    const isLoadingWorkspace = false;
    const [showBrandKitForm, setShowBrandKitForm] = useState(false);
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [isSavingBrandKit, setIsSavingBrandKit] = useState(false);
    const [isSavingProject, setIsSavingProject] = useState(false);
    const [workspaceError, setWorkspaceError] = useState<string | null>(null);
    const [brandKitDraft, setBrandKitDraft] = useState(DEFAULT_BRAND_KIT_DRAFT);
    const [projectDraft, setProjectDraft] = useState(DEFAULT_PROJECT_DRAFT);
    const showWorkspaceFeatures = SHOW_BRAND_FEATURES || SHOW_PROJECT_FEATURES;

    // 生成関連の状態
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImageItem[]>([]);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;



    // 参考画像の状態
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);



    useEffect(() => {
        if (!isGenerating) {
            setGenerationProgress(0);
            return;
        }

        setGenerationProgress(6);

        const interval = window.setInterval(() => {
            setGenerationProgress((current) => {
                if (current < 35) return current + 7;
                if (current < 60) return current + 4;
                if (current < 78) return current + 3;
                if (current < 90) return current + 2;
                if (current < 95) return current + 1;
                return current;
            });
        }, 700);

        return () => window.clearInterval(interval);
    }, [isGenerating]);

    useEffect(() => {
        if (!SHOW_BRAND_FEATURES) {
            return;
        }

        if (!selectedBrandKitId) {
            return;
        }

        const selectedBrandKit = brandKits.find((item) => item.id === selectedBrandKitId);
        if (!selectedBrandKit) {
            return;
        }

        setFormData((current) => ({
            ...current,
            tone: selectedBrandKit.preferredTone || current.tone,
            primaryColor: selectedBrandKit.primaryColor || current.primaryColor,
            secondaryColor: selectedBrandKit.secondaryColor || current.secondaryColor,
            autoColor: false,
        }));
    }, [selectedBrandKitId, brandKits]);

    useEffect(() => {
        if (!SHOW_PROJECT_FEATURES) {
            return;
        }

        if (!selectedProjectId) {
            return;
        }

        const selectedProject = projects.find((item) => item.id === selectedProjectId);
        if (!selectedProject) {
            return;
        }

        if (selectedProject.brandKitId) {
            setSelectedBrandKitId(selectedProject.brandKitId);
        }
    }, [selectedProjectId, projects]);

    // テンプレートプリセットの適用
    useEffect(() => {
        const loadTemplate = async () => {
            const templateId = initialQuery.templateId;
            if (!templateId) {
                return;
            }

            await syncTemplateLibraryState();
            const template = getTemplateById(templateId, getCustomTemplates());
            if (template) {
                const templateFormatParam = initialQuery.templateFormat;

                setTemplateId(template.id);
                setSelectedFormat(templateFormatParam || template.format);
                setTemplateName(template.name);
                setFormData(getTemplateMappedPresetFormData(template));
                await trackTemplateEvent(template.id, 'open');
            }
        };

        void loadTemplate();
    }, [initialQuery.templateFormat, initialQuery.templateId]);

    useEffect(() => {
        const preset = applyInitialQueryPreset(DEFAULT_FORM_DATA, initialQuery);
        if (!preset) {
            return;
        }

        if (preset.selectedFormat) {
            setSelectedFormat(preset.selectedFormat);
        }

        if (preset.selectedBrandKitId) {
            setSelectedBrandKitId(preset.selectedBrandKitId);
        }

        if (preset.selectedProjectId) {
            setSelectedProjectId(preset.selectedProjectId);
        }

        if (preset.sourceGenerationId) {
            setSourceGenerationId(preset.sourceGenerationId);
        }

        if (preset.originType) {
            setOriginType(preset.originType);
        }

        setFormData((current) => applyInitialQueryPreset(current, initialQuery)?.formData || current);
    }, [initialQuery]);

    const selectedFormatData = getAdFormatById(selectedFormat);
    const selectedFormatPackData = getFormatPackById(selectedFormatPack);
    const selectedBrandKit = brandKits.find((item) => item.id === selectedBrandKitId);
    const primaryGeneratedImage = generatedImages[selectedGeneratedIndex] || generatedImages[0] || null;
    const targetFormats = selectedFormatPack === 'single'
        ? (selectedFormat ? [selectedFormat] : [])
        : Array.from(new Set([selectedFormat, ...selectedFormatPackData.formatIds].filter(Boolean))) as string[];
    const mediumOptimizationTips = getMediumOptimizationTips(selectedFormat, formData.objective);
    const creditsNeeded = isAdmin ? 0 : Math.max(1, targetFormats.length) * variantCount;
    const learningInsights = useMemo(() => buildWinningInsight({
        histories,
        brandKitId: selectedBrandKitId,
        projectId: selectedProjectId,
    }), [histories, selectedBrandKitId, selectedProjectId]);
    const creativeEvaluation = useMemo(() => {
        if (!primaryGeneratedImage) {
            return null;
        }

        return evaluateCreative({
            formData,
            formatLabel: primaryGeneratedImage.format || selectedFormatData?.id,
            hasBrandKit: Boolean(selectedBrandKit),
            hasProject: Boolean(selectedProjectId),
            variantCount,
        });
    }, [formData, primaryGeneratedImage, selectedBrandKit, selectedFormatData?.id, selectedProjectId, variantCount]);

    // 表示するフォーマット（折りたたみ時は4つまで）
    const visibleFormats = showAllFormats ? AD_FORMATS : AD_FORMATS.slice(0, 4);

    // ドラッグ&ドロップ処理
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = async (file: File) => {
        try {
            const processedImage = await processReferenceImage(file, resizeAndCompressImage);
            setReferenceImageFile(processedImage.file);
            setReferenceImage(processedImage.dataUrl);
            setGenerationError(null);
        } catch (error) {
            setGenerationError(getReferenceImageErrorMessage(error));
            setReferenceImageFile(null);
            setReferenceImage(null);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleRemoveImage = () => {
        setReferenceImage(null);
        setReferenceImageFile(null);
    };

    const handleGenerate = async () => {
        if (!selectedFormat) {
            setGenerationError('フォーマットを選択してください');
            return;
        }

        if (!isAdmin && (userDoc?.credits ?? 0) < creditsNeeded) {
            setGenerationError(`クレジットが不足しています。${creditsNeeded}クレジット必要です。`);
            return;
        }

        setIsGenerating(true);
        setGenerationError(null);
        setGeneratedImages([]);
        setSelectedGeneratedIndex(0);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(buildGenerateRequestPayload({
                    selectedFormat,
                    targetFormats,
                    selectedBrandKitId,
                    selectedProjectId,
                    sourceGenerationId,
                    originType,
                    variantCount,
                    variantMode,
                    formData,
                    referenceImage,
                })),
            });
            const data = await response.json() as {
                imageUrl?: string;
                images?: GeneratedImageItem[];
                error?: string;
                details?: unknown;
                message?: string;
            };

            if (!response.ok) {
                throw new Error(getGenerateErrorMessage(data));
            }

            setGenerationProgress(100);

            const nextGeneratedImages = normalizeGeneratedImages(data, selectedFormat);
            if (nextGeneratedImages) {
                setGeneratedImages(nextGeneratedImages);
                setSelectedGeneratedIndex(0);
                if (templateId) {
                    await trackTemplateEvent(templateId, 'create');
                }
                await refreshUserDoc();
                setTimeout(() => {
                    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            } else {
                setGenerationError(data.message || '画像の生成に失敗しました。再度お試しください。');
            }
        } catch (error) {
            console.error('Generation error:', error);
            setGenerationError(error instanceof Error ? error.message : '生成中にエラーが発生しました');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        if (!primaryGeneratedImage) return;

        try {
            const blob = await fetchDownloadBlob(fetch, primaryGeneratedImage.imageUrl);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            const fileName = buildGeneratedAssetFileName(primaryGeneratedImage.format, Date.now());
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed, falling back to direct link:', error);
            // フォールバック：直接リンクを開く（別タブで表示される可能性がある）
            const link = document.createElement('a');
            const fileName = buildGeneratedAssetFileName(primaryGeneratedImage.format, Date.now());
            link.href = primaryGeneratedImage.imageUrl;
            link.download = fileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleWinnerToggle = async () => {
        const winnerToggleState = toWinnerToggleState(primaryGeneratedImage);
        if (!winnerToggleState) {
            return;
        }

        setIsSavingWinner(true);
        try {
            await toggleAdHistoryFavorite(winnerToggleState.generationId, winnerToggleState.nextValue);
            setGeneratedImages((current) => (
                toggleGeneratedImageFavorite(current, winnerToggleState.generationId, winnerToggleState.nextValue)
            ));

            const nextHistories = await getAdHistoriesByUserId();
            setHistories(replaceHistories(nextHistories));
        } catch (error) {
            console.error('Failed to update winning state:', error);
            setGenerationError(getWinnerToggleErrorMessage());
        } finally {
            setIsSavingWinner(false);
        }
    };

    const handleReset = () => {
        setSelectedFormat(null);
        setTemplateName(null);
        setTemplateId(null);
        setFormData(DEFAULT_FORM_DATA);
        setVariantCount(1);
        setVariantMode('message');
        setGeneratedImages([]);
        setSelectedGeneratedIndex(0);
        setGenerationError(null);
        setReferenceImage(null);
        setReferenceImageFile(null);
        setSelectedProjectId('');
        setSourceGenerationId('');
        setOriginType('custom');

    };

    const handleCreateBrandKit = async () => {
        if (!brandKitDraft.name.trim()) {
            setWorkspaceError('ブランドキット名を入力してください');
            return;
        }

        setIsSavingBrandKit(true);
        setWorkspaceError(null);

        try {
            const response = await fetch('/api/brand-kits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(buildBrandKitRequestPayload(brandKitDraft, brandKits.length === 0)),
            });

            const data = await response.json() as { item?: BrandKitItem; error?: string };
            if (!response.ok || !data.item) {
                throw new Error(data.error || 'ブランドキットの作成に失敗しました');
            }

            setBrandKits((current) => [data.item as BrandKitItem, ...current]);
            setSelectedBrandKitId(data.item.id);
            setBrandKitDraft(DEFAULT_BRAND_KIT_DRAFT);
            setShowBrandKitForm(false);
        } catch (error) {
            setWorkspaceError(getWorkspaceErrorMessage(error, 'ブランドキットの作成に失敗しました'));
        } finally {
            setIsSavingBrandKit(false);
        }
    };

    const handleCreateProject = async () => {
        if (!projectDraft.name.trim()) {
            setWorkspaceError('プロジェクト名を入力してください');
            return;
        }

        setIsSavingProject(true);
        setWorkspaceError(null);

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(buildProjectRequestPayload(projectDraft, selectedBrandKitId)),
            });

            const data = await response.json() as { item?: ProjectItem; error?: string };
            if (!response.ok || !data.item) {
                throw new Error(data.error || 'プロジェクトの作成に失敗しました');
            }

            setProjects((current) => [data.item as ProjectItem, ...current]);
            setSelectedProjectId(data.item.id);
            setProjectDraft(DEFAULT_PROJECT_DRAFT);
            setShowProjectForm(false);
        } catch (error) {
            setWorkspaceError(getWorkspaceErrorMessage(error, 'プロジェクトの作成に失敗しました'));
        } finally {
            setIsSavingProject(false);
        }
    };



    // 生成ボタンの有効/無効 (最低限フォーマットが選ばれていて、プロンプトの元になる情報があればOK)
    const canGenerate = selectedFormat && !isGenerating;

    const generationStatusMessage = generationProgress < 20
        ? '入力内容を確認しています'
        : generationProgress < 45
            ? '構図とテイストを設計しています'
            : generationProgress < 70
                ? '画像を生成しています'
                : generationProgress < 90
                    ? '仕上がりを整えています'
                    : '保存処理を進めています';

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-purple-50/30 to-indigo-50/50 relative">
            {/* 背景デコレーション */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-200/20 to-transparent rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full blur-[100px]" />
            </div>

            {/* ヘッダー */}
            <AppHeader />

            <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                {/* テンプレート使用中バナー */}
                {templateName && (
                    <div className="mb-6">
                        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-purple-50 to-orange-50 rounded-xl border border-purple-100">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center shadow-sm">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-semibold text-gray-700">テンプレート: </span>
                                <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500">{templateName}</span>
                                <p className="text-xs text-gray-500 mt-0.5">プリセット値が適用されています。自由に編集できます。</p>
                            </div>
                            <Link
                                href="/templates"
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                            >
                                テンプレート変更
                            </Link>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ===== 左カラム: 入力フォーム ===== */}
                    <div className="lg:col-span-2 space-y-6">

                        <ObjectiveSelector
                            selectedObjective={formData.objective as AdObjectiveId}
                            onChange={(id) => {
                                setFormData({ ...formData, objective: id });
                            }}
                        />

                        <WorkspacePanel
                            showWorkspaceFeatures={showWorkspaceFeatures}
                            showBrandFeatures={SHOW_BRAND_FEATURES}
                            showProjectFeatures={SHOW_PROJECT_FEATURES}
                            selectedBrandKitId={selectedBrandKitId}
                            selectedProjectId={selectedProjectId}
                            workspaceError={workspaceError}
                            brandKits={brandKits}
                            projects={projects}
                            showBrandKitForm={showBrandKitForm}
                            showProjectForm={showProjectForm}
                            isLoadingWorkspace={isLoadingWorkspace}
                            brandKitDraft={brandKitDraft}
                            projectDraft={projectDraft}
                            toneOptions={[...TONE_OPTIONS]}
                            isSavingBrandKit={isSavingBrandKit}
                            isSavingProject={isSavingProject}
                            setShowBrandKitForm={setShowBrandKitForm}
                            setShowProjectForm={setShowProjectForm}
                            setSelectedBrandKitId={setSelectedBrandKitId}
                            setSelectedProjectId={setSelectedProjectId}
                            setBrandKitDraft={setBrandKitDraft}
                            setProjectDraft={setProjectDraft}
                            handleCreateBrandKit={handleCreateBrandKit}
                            handleCreateProject={handleCreateProject}
                        />

                        <FormatSelectionPanel
                            selectedFormat={selectedFormat}
                            selectedFormatLabel={selectedFormatData ? `${selectedFormatData.icon} ${selectedFormatData.name}（${selectedFormatData.size}）` : undefined}
                            visibleFormats={visibleFormats}
                            showAllFormats={showAllFormats}
                            totalFormatCount={AD_FORMATS.length}
                            onToggleShowAll={() => setShowAllFormats(!showAllFormats)}
                            onSelectFormat={setSelectedFormat}
                            formatPacks={FORMAT_PACKS}
                            selectedFormatPack={selectedFormatPack}
                            onSelectFormatPack={setSelectedFormatPack}
                            targetFormats={targetFormats}
                            mediumOptimizationTips={mediumOptimizationTips}
                            getFormatName={(formatId) => getAdFormatById(formatId)?.name || formatId}
                        />

                        {/* セクション3: 詳細情報 */}
                        <DetailsPanel
                            objective={formData.objective as AdObjectiveId}
                            formData={formData}
                            onFormChange={(changes) => setFormData((current) => ({ ...current, ...changes }))}
                            referenceImage={referenceImage}
                            referenceImageFileName={referenceImageFile?.name}
                            isDragging={isDragging}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onImageUpload={handleImageUpload}
                            onRemoveImage={handleRemoveImage}
                        />

                        {/* セクション4: スタイル設定 */}
                        <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 hover:border-gray-200 overflow-hidden transition-all duration-300">
                            <div className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-50 bg-gray-50/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">4</div>
                                    <div className="text-left">
                                        <h2 className="font-bold text-gray-900">スタイル設定</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {TONE_OPTIONS.find((tone) => tone.id === formData.tone)?.label}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-6 space-y-6 animate-fade-in">
                                    {/* トーン選択 */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">デザインテイスト</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {TONE_OPTIONS.map((tone) => (
                                                <button
                                                    key={tone.id}
                                                    onClick={() => setFormData({ ...formData, tone: tone.id })}
                                                    className={`p-3 rounded-xl border-2 text-left transition-all ${formData.tone === tone.id
                                                        ? 'border-purple-500 bg-purple-50'
                                                        : 'border-gray-100 hover:border-gray-200'
                                                        }`}
                                                >
                                                    <span className="font-semibold text-gray-900 text-sm">{tone.label}</span>
                                                    <p className="text-xs text-gray-500 mt-0.5">{tone.description}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* カラー選択 */}
                                    {templateName ? (
                                        <div className="p-4 bg-gradient-to-br from-purple-50/70 to-indigo-50/70 rounded-xl border border-purple-100/70 animate-fade-in">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-sm">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4m0 18h8a2 2 0 002-2V9m-10 12V9m0 12H5m4 0h10M9 3h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V9" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">テンプレート固有の色彩設計を適用中</p>
                                                    <p className="mt-1 text-xs leading-relaxed text-purple-700/90">
                                                        テンプレート側で細かなカラーバランスを指定しているため、テンプレートから作成する場合はカラーパレットを非表示にしています。
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="block text-sm font-semibold text-gray-700">カラーパレット</label>
                                                <button
                                                    onClick={() => setFormData({ ...formData, autoColor: !formData.autoColor })}
                                                    className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold transition-all ${formData.autoColor
                                                        ? 'bg-purple-500 text-white shadow-sm'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {formData.autoColor ? (
                                                        <>
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            自動（最適化）
                                                        </>
                                                    ) : (
                                                        '手動で指定'
                                                    )}
                                                </button>
                                            </div>

                                            {!formData.autoColor ? (
                                                <div className="flex items-center gap-5 animate-fade-in">
                                                    <div>
                                                        <span className="block text-xs text-gray-500 mb-1.5">メインカラー</span>
                                                        <input
                                                            type="color"
                                                            value={formData.primaryColor}
                                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                                            className="w-12 h-12 rounded-xl cursor-pointer border border-gray-200"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs text-gray-500 mb-1.5">アクセントカラー</span>
                                                        <input
                                                            type="color"
                                                            value={formData.secondaryColor}
                                                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                                            className="w-12 h-12 rounded-xl cursor-pointer border border-gray-200"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="block text-xs text-gray-500 mb-1.5">プレビュー</span>
                                                        <div
                                                            className="h-12 rounded-xl"
                                                            style={{
                                                                background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})`
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-gradient-to-br from-purple-50/50 to-orange-50/50 rounded-xl border border-purple-100/50 animate-fade-in">
                                                    <p className="text-xs text-purple-600/80 leading-relaxed">
                                                        AIがデザインテイストや商品画像に合わせて、最適な配色を自動で選択します。
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                        </section>

                    </div>

                    {/* ===== 右カラム: プレビュー & 結果 ===== */}
                    <div className="lg:col-span-1" ref={resultRef}>
                        <div className="lg:sticky lg:top-24 space-y-6">

                            {/* 生成前: プレビューサマリー */}
                            {!primaryGeneratedImage && (
                                <>
                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-6">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            設定プレビュー
                                        </h3>

                                        {/* カラープレビュー */}
                                        <div
                                            className="h-32 rounded-xl mb-5 flex items-center justify-center relative overflow-hidden"
                                            style={formData.autoColor ? {
                                                background: `linear-gradient(135deg, #f3e8ff, #fff7ed)`,
                                            } : {
                                                background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})`
                                            }}
                                        >
                                            {formData.autoColor && (
                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                                            )}
                                            {selectedFormatData ? (
                                                <div className="text-center text-white">
                                                    <span className="text-3xl block mb-1">{selectedFormatData.icon}</span>
                                                    <span className="text-sm font-semibold opacity-90">{selectedFormatData.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-white/60 text-sm">フォーマットを選択してください</span>
                                            )}
                                        </div>

                                        {/* サマリー情報 */}
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">目的</span>
                                                <span className="font-medium text-gray-900">
                                                    {AD_OBJECTIVES.find(o => o.id === formData.objective)?.name}
                                                </span>
                                            </div>
                                    {SHOW_BRAND_FEATURES && (
                                        <div className="flex justify-between gap-3">
                                            <span className="text-gray-500">ブランド</span>
                                            <span className="text-right font-medium text-gray-900">{brandKits.find((item) => item.id === selectedBrandKitId)?.name || '未選択'}</span>
                                        </div>
                                    )}
                                    {SHOW_PROJECT_FEATURES && (
                                        <div className="flex justify-between gap-3">
                                            <span className="text-gray-500">プロジェクト</span>
                                            <span className="text-right font-medium text-gray-900">{projects.find((item) => item.id === selectedProjectId)?.name || '未選択'}</span>
                                        </div>
                                    )}
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">フォーマット</span>
                                                <span className="font-medium text-gray-900">{selectedFormatData?.name || '未選択'}</span>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <span className="text-gray-500">展開パック</span>
                                                <span className="text-right font-medium text-gray-900">{selectedFormatPackData.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">テイスト</span>
                                                <span className="font-medium text-gray-900">{TONE_OPTIONS.find((tone) => tone.id === formData.tone)?.label}</span>
                                            </div>
                                            {(formData.catchCopy || formData.campaignName || formData.brandMessage || formData.materialName || formData.eventName || formData.jobTitle || formData.appName || formData.storeName) && (
                                                <div className="pt-2 border-t border-gray-100">
                                                    <span className="text-gray-500 block mb-1">主なメッセージ</span>
                                                    <span className="font-medium text-gray-900 text-xs text-balance">
                                                        {formData.catchCopy || formData.campaignName || formData.brandMessage || formData.materialName || formData.eventName || formData.jobTitle || formData.appName || formData.storeName}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-5">
                                        <div className="flex items-center justify-between gap-3 mb-4">
                                            <h3 className="font-bold text-gray-900">バリエーション生成</h3>
                                            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 border border-violet-100">
                                                比較して選べます
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">案数</p>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {[1, 2, 3, 4].map((count) => (
                                                        <button
                                                            key={count}
                                                            type="button"
                                                            onClick={() => setVariantCount(count)}
                                                            className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${
                                                                variantCount === count
                                                                    ? 'border-violet-300 bg-violet-50 text-violet-700'
                                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                                            }`}
                                                        >
                                                            {count}案
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">差分の出し方</p>
                                                <div className="grid gap-2">
                                                    {[
                                                        { id: 'message', label: '訴求違い', description: 'ベネフィットや緊急性の見せ方を変える' },
                                                        { id: 'tone', label: 'トーン違い', description: '親しみやすさや高級感の印象を変える' },
                                                        { id: 'layout', label: '構図違い', description: '余白や視線誘導の作り方を変える' },
                                                    ].map((mode) => (
                                                        <button
                                                            key={mode.id}
                                                            type="button"
                                                            onClick={() => setVariantMode(mode.id as 'message' | 'tone' | 'layout')}
                                                            className={`rounded-2xl border p-3 text-left transition ${
                                                                variantMode === mode.id
                                                                    ? 'border-violet-300 bg-violet-50/80'
                                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                                            }`}
                                                        >
                                                            <p className="font-semibold text-gray-900">{mode.label}</p>
                                                            <p className="mt-1 text-xs leading-5 text-gray-500">{mode.description}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <h3 className="font-bold text-gray-900">勝ち案の学習</h3>
                                                <p className="mt-1 text-xs text-gray-500">採用した案を増やすほど、次回の方向性が見えやすくなります。</p>
                                            </div>
                                            {isLoadingInsights && (
                                                <span className="text-xs font-semibold text-gray-400">読み込み中...</span>
                                            )}
                                        </div>

                                        {learningInsights ? (
                                            <div className="mt-4 space-y-3">
                                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Winning Signals</p>
                                                    <p className="mt-2 text-sm leading-6 text-emerald-950">{learningInsights.summary}</p>
                                                    <p className="mt-2 text-xs font-semibold text-emerald-700">
                                                        採用済み {learningInsights.favoriteCount} 件
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    {learningInsights.signals.map((signal) => (
                                                        <p key={signal} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                                            {signal}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-4 py-4 text-sm text-gray-500">
                                                まだ勝ち案データが少ない状態です。良かった案を採用保存すると、ここに傾向が出てきます。
                                            </div>
                                        )}
                                    </div>

                                    {/* 生成ボタン */}
                                    <div className="sticky bottom-4 z-40">
                                        <button
                                            onClick={handleGenerate}
                                            disabled={!canGenerate}
                                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-lg flex items-center justify-center gap-3"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    AIが画像を生成中...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                    </svg>
                                                    {isAdmin ? 'AIで生成する（管理者：制限なし）' : `AIで生成する（${creditsNeeded}クレジット消費）`}
                                                </>
                                            )}
                                        </button>

                                        {/* エラー表示 */}
                                        {generationError && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                                {generationError}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* 生成後: 結果表示 */}
                            {primaryGeneratedImage && (
                                <GenerationResultPanel
                                    primaryGeneratedImage={primaryGeneratedImage}
                                    generatedImages={generatedImages}
                                    selectedGeneratedIndex={selectedGeneratedIndex}
                                    onSelectGeneratedIndex={setSelectedGeneratedIndex}
                                    objectiveName={AD_OBJECTIVES.find((o) => o.id === formData.objective)?.name}
                                    formatName={getAdFormatById(primaryGeneratedImage.format)?.name || selectedFormatData?.name}
                                    sizeLabel={getAdFormatById(primaryGeneratedImage.format)?.size || selectedFormatData?.size}
                                    targetFormatsCount={targetFormats.length}
                                    toneLabel={TONE_OPTIONS.find((tone) => tone.id === formData.tone)?.label}
                                    creativeEvaluation={creativeEvaluation}
                                    isSavingWinner={isSavingWinner}
                                    onWinnerToggle={handleWinnerToggle}
                                    onDownload={handleDownload}
                                    onEdit={() => router.push(`/edit?imageUrl=${encodeURIComponent(primaryGeneratedImage.imageUrl)}`)}
                                    onRegenerate={handleGenerate}
                                    onReset={handleReset}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main >

            {isGenerating && (
                <GenerationProgressOverlay
                    progress={generationProgress}
                    statusMessage={generationStatusMessage}
                />
            )}
        </div >
    );
}

