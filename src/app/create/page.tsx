// ========================================
// 広告作成ページ（1ページ統合版）
// ========================================

'use client';

import Image from 'next/image';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AD_FORMATS, getAdFormatById } from '@/lib/ad-formats';
import { UnifiedFormData, DEFAULT_FORM_DATA, AdObjectiveId, AD_OBJECTIVES } from '@/lib/ad-config/types';
import { ObjectiveSelector } from '@/components/ad-config/ObjectiveSelector';
import { DynamicFormFields } from '@/components/ad-config/DynamicFormFields';
import { AppHeader } from '@/components/layout/AppHeader';
import { resizeAndCompressImage } from '@/lib/image-utils';
import { getTemplateById } from '@/lib/template-catalog';
import { getCustomTemplates, syncTemplateLibraryState, trackTemplateEvent } from '@/lib/template-library';

interface GeneratedImageItem {
    generationId: string;
    imageUrl: string;
    format: string;
    dimensions?: {
        width: number;
        height: number;
    };
}

// Suspenseラッパー（useSearchParamsに必要）
export default function CreatePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <CreatePageContent />
        </Suspense>
    );
}

function CreatePageContent() {
    const { user, userDoc, refreshUserDoc, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const resultRef = useRef<HTMLDivElement>(null);
    const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
    const [templateName, setTemplateName] = useState<string | null>(null);
    const [templateId, setTemplateId] = useState<string | null>(null);
    const [formatBundle, setFormatBundle] = useState<string[]>([]);
    const [showAllFormats, setShowAllFormats] = useState(false);
    const [formData, setFormData] = useState<UnifiedFormData>(DEFAULT_FORM_DATA);

    // 生成関連の状態
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImageItem[]>([]);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;



    // 参考画像の状態
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);



    useEffect(() => {
        if (!user && !loading) {
            router.push('/');
        }
    }, [user, loading, router]);

    // テンプレートプリセットの適用
    useEffect(() => {
        const loadTemplate = async () => {
            const templateId = searchParams.get('templateId');
            if (!templateId) {
                return;
            }

            await syncTemplateLibraryState();
            const template = getTemplateById(templateId, getCustomTemplates());
            if (template) {
                const formatBundleParam = searchParams.get('formatBundle');
                const templateFormatParam = searchParams.get('templateFormat');
                const objective = (template.objective as AdObjectiveId) || 'new-product';
                let mappedPresets: Partial<UnifiedFormData> = {};

                // テンプレートの「キャッチコピー」と「説明」を、目的に応じた「汎用的な説明フィールド」にのみマッピングする
                // （商品名やイベント名などの「固有名詞」はユーザー自身が入力できるよう空欄にする）
                switch (objective) {
                    case 'new-product':
                        mappedPresets = { productName: '', catchCopy: template.presets.catchCopy, description: template.presets.description };
                        break;
                    case 'sale-campaign':
                        mappedPresets = { campaignName: '', discountInfo: template.presets.catchCopy, campaignTargets: template.presets.description };
                        break;
                    case 'event-seminar':
                        mappedPresets = { eventName: '', eventDateTime: '', eventLocation: '', eventContent: template.presets.description };
                        break;
                    case 'recruitment':
                        mappedPresets = { jobTitle: '', companyName: '', jobBenefits: `${template.presets.catchCopy} ${template.presets.description}`, jobRequirements: '' };
                        break;
                    case 'brand-awareness':
                        mappedPresets = { brandName: '', brandMessage: template.presets.catchCopy, brandCoreValue: template.presets.description };
                        break;
                    case 'app-install':
                        mappedPresets = { appName: '', appFeatures: template.presets.description, appTargetUser: template.presets.targetAudience || '', appDownloadBenefit: template.presets.catchCopy || '' };
                        break;
                    case 'lead-generation':
                        mappedPresets = { materialName: '', materialBenefits: template.presets.description, leadCallToAction: template.presets.catchCopy || '' };
                        break;
                    case 'store-visit':
                        mappedPresets = { storeName: '', storeLocation: '', specialOffer: template.presets.catchCopy, signatureMenu: '' };
                        break;
                }

                setTemplateId(template.id);
                setSelectedFormat(templateFormatParam || template.format);
                setTemplateName(template.name);
                setFormatBundle(
                    (formatBundleParam ? formatBundleParam.split(',') : template.supportedFormats || [template.format])
                        .filter(Boolean)
                );
                setFormData({
                    ...DEFAULT_FORM_DATA,
                    objective: objective,
                    tone: template.presets.tone || 'modern',
                    primaryColor: template.presets.primaryColor || '#FF6B35',
                    secondaryColor: template.presets.secondaryColor || '#7C3AED',
                    targetAudience: template.presets.targetAudience || '',
                    customInstructions: template.customInstructions || '',
                    ...mappedPresets
                });
                await trackTemplateEvent(template.id, 'open');
            }
        };

        void loadTemplate();
    }, [searchParams]);

    const toneOptions = [
        { id: 'modern', label: 'モダン', description: '洗練された現代的なデザイン' },
        { id: 'cute', label: 'キュート', description: '可愛らしく親しみやすいデザイン' },
        { id: 'luxury', label: 'ラグジュアリー', description: '高級感のある上品なデザイン' },
        { id: 'pop', label: 'ポップ', description: '明るく元気なデザイン' },
        { id: 'minimal', label: 'ミニマル', description: 'シンプルで洗練されたデザイン' },
        { id: 'bold', label: 'ボールド', description: '大胆でインパクトのあるデザイン' },
    ];

    const selectedFormatData = getAdFormatById(selectedFormat);
    const primaryGeneratedImage = generatedImages[0] || null;
    const requestedFormats = Array.from(new Set((formatBundle.length > 0 ? formatBundle : selectedFormat ? [selectedFormat] : []).filter(Boolean)));
    const creditsNeeded = isAdmin ? 0 : Math.max(1, requestedFormats.length || 0);

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
            setReferenceImageFile(file);
            const dataUrl = await resizeAndCompressImage(file);
            setReferenceImage(dataUrl);
            setGenerationError(null);
        } catch (error) {
            setGenerationError(error instanceof Error ? error.message : '画像の処理に失敗しました');
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

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    format: selectedFormat,
                    formatBundle: requestedFormats,
                    ...formData, // unified form data をすべて送信
                    ...(referenceImage ? { referenceImage } : {}),
                }),
            });

            const data = await response.json() as {
                imageUrl?: string;
                images?: GeneratedImageItem[];
                error?: string;
                details?: unknown;
                message?: string;
            };

            if (!response.ok) {
                let errorDetails = '';
                if (data.details) {
                    errorDetails = typeof data.details === 'object' 
                        ? JSON.stringify(data.details) 
                        : String(data.details);
                }
                const errMsg = errorDetails ? `${data.error}（${errorDetails}）` : (data.error || '生成に失敗しました');
                throw new Error(errMsg);
            }

            if (data.images?.length) {
                setGeneratedImages(data.images);
                if (templateId) {
                    await trackTemplateEvent(templateId, 'create');
                }
                await refreshUserDoc();
                // 結果エリアにスクロール
                setTimeout(() => {
                    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            } else if (data.imageUrl) {
                setGeneratedImages([{ generationId: crypto.randomUUID(), imageUrl: data.imageUrl, format: selectedFormat || 'custom' }]);
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
            // CORSエラーを考慮し、まずは直接取得を試みる
            let response;
            try {
                response = await fetch(primaryGeneratedImage.imageUrl);
                if (!response.ok) throw new Error('Network response was not ok');
            } catch {
                // 直接取得に失敗した場合（CORSなど）、プロキシAPIを経由する
                const proxyRes = await fetch(`/api/proxy-image?url=${encodeURIComponent(primaryGeneratedImage.imageUrl)}`);
                if (proxyRes.ok) {
                    const data = await proxyRes.json() as { dataUrl?: string };
                    if (data.dataUrl) {
                        response = await fetch(data.dataUrl);
                    } else {
                        throw new Error('No dataUrl in proxy response');
                    }
                } else {
                    throw new Error('Proxy fetch failed');
                }
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ad-${primaryGeneratedImage.format}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed, falling back to direct link:', error);
            // フォールバック：直接リンクを開く（別タブで表示される可能性がある）
            const link = document.createElement('a');
            link.href = primaryGeneratedImage.imageUrl;
            link.download = `ad-${primaryGeneratedImage.format}-${Date.now()}.png`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleDownloadAll = async () => {
        for (const image of generatedImages) {
            try {
                const response = await fetch(image.imageUrl);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `ad-${image.format}-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Bulk download failed:', error);
                window.open(image.imageUrl, '_blank');
            }
        }
    };

    const handleReset = () => {
        setSelectedFormat(null);
        setTemplateName(null);
        setTemplateId(null);
        setFormatBundle([]);
        setFormData(DEFAULT_FORM_DATA);
        setGeneratedImages([]);
        setGenerationError(null);
        setReferenceImage(null);
        setReferenceImageFile(null);

    };



    // 生成ボタンの有効/無効 (最低限フォーマットが選ばれていて、プロンプトの元になる情報があればOK)
    const canGenerate = selectedFormat && !isGenerating;

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

                        {/* セクション2: フォーマット選択 */}
                        <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 hover:border-gray-200 overflow-hidden transition-all duration-300">
                            <div className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-50 bg-gray-50/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">2</div>
                                    <div className="text-left">
                                        <h2 className="font-bold text-gray-900">フォーマット選択</h2>
                                        {selectedFormatData && (
                                            <p className="text-xs text-gray-500 mt-0.5">{selectedFormatData.icon} {selectedFormatData.name}（{selectedFormatData.size}）</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedFormat && (
                                        <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full hidden sm:inline-block">✓ 選択済み</span>
                                    )}
                                </div>
                            </div>
                            <div className="px-6 py-6 animate-fade-in">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {visibleFormats.map((format) => (
                                            <button
                                                key={format.id}
                                                onClick={() => {
                                                    setSelectedFormat(format.id);
                                                }}
                                                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:-translate-y-0.5 ${selectedFormat === format.id
                                                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-orange-50 shadow-md shadow-purple-500/10'
                                                    : 'border-gray-100 bg-white/70 hover:border-gray-200 hover:shadow-sm'
                                                    }`}
                                            >
                                                <span className="text-2xl mb-2 block">{format.icon}</span>
                                                <h3 className="font-bold text-gray-900 text-sm mb-0.5">{format.name}</h3>
                                                <p className="text-xs text-gray-500">{format.size}</p>
                                            </button>
                                        ))}
                                    </div>
                                    {AD_FORMATS.length > 4 && (
                                        <button
                                            onClick={() => setShowAllFormats(!showAllFormats)}
                                            className="mt-3 w-full py-2 text-sm text-purple-600 font-medium hover:text-purple-700 transition-colors"
                                        >
                                            {showAllFormats ? '折りたたむ ▲' : `すべて表示（${AD_FORMATS.length}件） ▼`}
                                        </button>
                                    )}
                                    {templateName && formatBundle.length > 0 && (
                                        <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
                                            <div className="flex items-center justify-between gap-3 mb-3">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">サイズ展開ガイド</p>
                                                    <p className="text-xs text-gray-500">このテンプレートで相性のよいサイズ候補です。ワンクリックで切り替えられます。</p>
                                                </div>
                                                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-orange-600 shadow-sm">
                                                    {formatBundle.length}サイズ
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {formatBundle.map((formatId) => {
                                                    const format = getAdFormatById(formatId);
                                                    if (!format) {
                                                        return null;
                                                    }

                                                    return (
                                                        <button
                                                            key={formatId}
                                                            onClick={() => setSelectedFormat(formatId)}
                                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                                                                selectedFormat === formatId
                                                                    ? 'bg-orange-500 text-white shadow-md'
                                                                    : 'bg-white text-gray-600 border border-orange-100 hover:border-orange-300'
                                                            }`}
                                                        >
                                                            {format.icon} {format.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </section>

                        {/* セクション3: 詳細情報 */}
                        <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 hover:border-gray-200 overflow-hidden transition-all duration-300">
                            <div className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-50 bg-gray-50/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">3</div>
                                    <div className="text-left">
                                        <h2 className="font-bold text-gray-900">詳細情報</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">目的ごとの情報を入力・抽出</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-6 space-y-5 animate-fade-in">

                                    <DynamicFormFields
                                        objective={formData.objective as AdObjectiveId}
                                        formData={formData}
                                        onChange={(changes) => setFormData({ ...formData, ...changes })}
                                    />

                                    {/* 参考画像アップロード */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            参考画像（任意）
                                        </label>

                                        {referenceImage ? (
                                            <div className="relative">
                                                <div className="relative rounded-xl overflow-hidden border-2 border-purple-300 bg-gray-50">
                                                    <Image
                                                        src={referenceImage}
                                                        alt="参考画像プレビュー"
                                                        width={512}
                                                        height={128}
                                                        unoptimized
                                                        className="w-full h-32 object-contain"
                                                    />
                                                    <button
                                                        onClick={handleRemoveImage}
                                                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1 text-center">{referenceImageFile?.name}</p>
                                            </div>
                                        ) : (
                                            <label 
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                                                    isDragging 
                                                    ? 'border-purple-500 bg-purple-50 shadow-inner scale-[0.98]' 
                                                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 py-3">
                                                    <svg className={`w-6 h-6 ${isDragging ? 'text-purple-600 animate-bounce' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-500">
                                                        {isDragging ? (
                                                            <span className="font-bold text-purple-600">ここにドロップしてアップロード</span>
                                                        ) : (
                                                            <><span className="font-semibold text-purple-600">クリック</span> または <span className="font-semibold text-purple-600">ドラッグ＆ドロップ</span> (最大5MB)</>
                                                        )}
                                                    </span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>


                                </div>
                        </section>

                        {/* セクション4: スタイル設定 */}
                        <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 hover:border-gray-200 overflow-hidden transition-all duration-300">
                            <div className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-50 bg-gray-50/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">4</div>
                                    <div className="text-left">
                                        <h2 className="font-bold text-gray-900">スタイル設定</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {toneOptions.find(t => t.id === formData.tone)?.label}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-6 space-y-6 animate-fade-in">
                                    {/* トーン選択 */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">デザインテイスト</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {toneOptions.map((tone) => (
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
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">フォーマット</span>
                                                <span className="font-medium text-gray-900">{selectedFormatData?.name || '未選択'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">テイスト</span>
                                                <span className="font-medium text-gray-900">{toneOptions.find(t => t.id === formData.tone)?.label}</span>
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
                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 shadow-lg animate-fade-in">
                                    <div className="mb-6 flex items-center animate-fade-in-up">
                                        <span className="text-2xl mr-2 animate-bounce">🎉</span>
                                        <span className="text-xl font-bold text-gray-800 tracking-tight">生成完了！</span>
                                        <div className="ml-3 px-2.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full flex items-center gap-1 border border-green-200">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            履歴保存済
                                        </div>
                                    </div>

                                    {/* 画像表示エリア */}
                                    <div className="mb-5 space-y-4">
                                        <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group relative">
                                            <Image
                                                src={primaryGeneratedImage.imageUrl}
                                                alt="Generated Ad"
                                                fill
                                                sizes="(max-width: 1024px) 100vw, 33vw"
                                                unoptimized
                                                className="w-full h-full object-contain"
                                            />
                                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                                                <button
                                                    onClick={() => window.open(primaryGeneratedImage.imageUrl, '_blank')}
                                                    className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                                                    title="拡大表示"
                                                >
                                                    <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        {generatedImages.length > 1 && (
                                            <div>
                                                <div className="mb-2 flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-gray-900">一括生成されたサイズ</p>
                                                    <span className="rounded-full bg-purple-50 px-3 py-1 text-[11px] font-bold text-purple-700">
                                                        {generatedImages.length}サイズ
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {generatedImages.map((image) => {
                                                        const formatMeta = getAdFormatById(image.format);
                                                        return (
                                                            <button
                                                                key={image.generationId}
                                                                onClick={() => window.open(image.imageUrl, '_blank')}
                                                                className="rounded-2xl border border-gray-100 bg-white p-2 text-left transition hover:border-purple-200 hover:shadow-sm"
                                                            >
                                                                <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
                                                                    <Image
                                                                        src={image.imageUrl}
                                                                        alt={formatMeta?.name || image.format}
                                                                        fill
                                                                        sizes="160px"
                                                                        unoptimized
                                                                        className="object-contain"
                                                                    />
                                                                </div>
                                                                <p className="mt-2 text-xs font-semibold text-gray-900">{formatMeta?.name || image.format}</p>
                                                                <p className="text-[11px] text-gray-500">{formatMeta?.size || `${image.dimensions?.width || ''}×${image.dimensions?.height || ''}`}</p>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 生成情報 */}
                                    <div className="grid grid-cols-2 gap-3 text-xs mb-5 border-t border-gray-100 pt-4">
                                        <div>
                                            <span className="text-gray-500 block">目的</span>
                                            <span className="font-medium">{AD_OBJECTIVES.find(o => o.id === formData.objective)?.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">フォーマット</span>
                                            <span className="font-medium">{generatedImages.length > 1 ? `${generatedImages.length}サイズ一括生成` : (getAdFormatById(primaryGeneratedImage.format)?.name || selectedFormatData?.name)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">サイズ</span>
                                            <span className="font-medium">{getAdFormatById(primaryGeneratedImage.format)?.size || selectedFormatData?.size}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">テイスト</span>
                                            <span className="font-medium">{toneOptions.find(t => t.id === formData.tone)?.label}</span>
                                        </div>
                                    </div>

                                    {/* アクションボタン */}
                                    <div className="space-y-2">
                                        <button
                                            onClick={handleDownload}
                                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            {generatedImages.length > 1 ? 'メイン画像をダウンロード' : 'ダウンロード'}
                                        </button>
                                        {generatedImages.length > 1 && (
                                            <button
                                                onClick={handleDownloadAll}
                                                className="w-full py-3 border-2 border-orange-200 bg-orange-50 text-orange-700 rounded-xl font-semibold hover:border-orange-300 hover:bg-orange-100 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M8 12l4 4m0 0l4-4m-4 4V4" />
                                                </svg>
                                                すべてのサイズをダウンロード
                                            </button>
                                        )}
                                        <button
                                            onClick={() => router.push(`/edit?imageUrl=${encodeURIComponent(primaryGeneratedImage.imageUrl)}`)}
                                            className="w-full py-3 border-2 border-purple-200 bg-white text-purple-700 rounded-xl font-semibold hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            AIで編集
                                        </button>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleGenerate}
                                                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                再生成
                                            </button>
                                            <button
                                                onClick={handleReset}
                                                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                新規作成
                                            </button>
                                        </div>
                                        <div className="pt-2 text-center">
                                            <Link href="/history" className="text-xs text-purple-600 hover:text-purple-800 font-medium hover:underline inline-flex items-center gap-1">
                                                履歴一覧を見る
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>


                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main >

            {/* ローディングオーバーレイ */}
            {
                isGenerating && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center">
                            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">AIが画像を生成中...</h3>
                            <p className="text-gray-500">しばらくお待ちください</p>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

