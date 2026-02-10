// ========================================
// 広告作成ページ（1ページ統合版）
// ========================================

'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AD_TEMPLATES } from '@/lib/templates';

// 広告フォーマット定義
const adFormats = [
    {
        id: 'instagram-story',
        name: 'Instagram ストーリー',
        size: '1080×1920',
        icon: '📱',
        category: 'SNS',
    },
    {
        id: 'instagram-feed',
        name: 'Instagram 投稿',
        size: '1080×1080',
        icon: '📸',
        category: 'SNS',
    },
    {
        id: 'facebook-ad',
        name: 'Facebook 広告',
        size: '1200×628',
        icon: '👥',
        category: 'SNS',
    },
    {
        id: 'twitter-post',
        name: 'X (Twitter) 投稿',
        size: '1200×675',
        icon: '🐦',
        category: 'SNS',
    },
    {
        id: 'youtube-thumbnail',
        name: 'YouTube サムネイル',
        size: '1280×720',
        icon: '▶️',
        category: 'SNS',
    },
    {
        id: 'google-display',
        name: 'Google ディスプレイ',
        size: '300×250',
        icon: '🌐',
        category: 'バナー',
    },
    {
        id: 'ec-banner',
        name: 'ECバナー',
        size: '728×90',
        icon: '🛒',
        category: 'EC',
    },
    {
        id: 'product-image',
        name: '商品画像',
        size: '800×800',
        icon: '🎁',
        category: 'EC',
    },
];

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
    const [showAllFormats, setShowAllFormats] = useState(false);
    const [formData, setFormData] = useState({
        productUrl: '',
        productName: '',
        catchCopy: '',
        description: '',
        targetAudience: '',
        tone: 'modern',
        primaryColor: '#FF6B35',
        secondaryColor: '#7C3AED',
    });

    // 生成関連の状態
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);

    // AI編集関連の状態
    const [editInstruction, setEditInstruction] = useState('');
    const [editType, setEditType] = useState('style_change');
    const [isEditing, setIsEditing] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [showEditPanel, setShowEditPanel] = useState(false);

    // 参考画像の状態
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);

    // セクション開閉状態
    const [openSections, setOpenSections] = useState({
        format: true,
        product: true,
        style: true,
    });

    useEffect(() => {
        if (!user && !loading) {
            router.push('/');
        }
    }, [user, loading, router]);

    // テンプレートプリセットの適用
    useEffect(() => {
        const templateId = searchParams.get('templateId');
        if (templateId) {
            const template = AD_TEMPLATES.find(t => t.id === templateId);
            if (template) {
                setSelectedFormat(template.format);
                setTemplateName(template.name);
                setFormData({
                    productUrl: '',
                    productName: '',
                    catchCopy: template.presets.catchCopy,
                    description: template.presets.description,
                    targetAudience: template.presets.targetAudience,
                    tone: template.presets.tone,
                    primaryColor: template.presets.primaryColor,
                    secondaryColor: template.presets.secondaryColor,
                });
            }
        }
    }, [searchParams]);

    const toneOptions = [
        { id: 'modern', label: 'モダン', description: '洗練された現代的なデザイン' },
        { id: 'cute', label: 'キュート', description: '可愛らしく親しみやすいデザイン' },
        { id: 'luxury', label: 'ラグジュアリー', description: '高級感のある上品なデザイン' },
        { id: 'pop', label: 'ポップ', description: '明るく元気なデザイン' },
        { id: 'minimal', label: 'ミニマル', description: 'シンプルで洗練されたデザイン' },
        { id: 'bold', label: 'ボールド', description: '大胆でインパクトのあるデザイン' },
    ];

    const selectedFormatData = adFormats.find(f => f.id === selectedFormat);

    // 表示するフォーマット（折りたたみ時は4つまで）
    const visibleFormats = showAllFormats ? adFormats : adFormats.slice(0, 4);

    // セクション開閉のトグル
    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // 参考画像のアップロード処理
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setGenerationError('画像サイズは5MB以下にしてください');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setGenerationError('画像ファイルを選択してください');
            return;
        }

        setReferenceImageFile(file);

        const reader = new FileReader();
        reader.onload = (event) => {
            setReferenceImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
        setGenerationError(null);
    };

    const handleRemoveImage = () => {
        setReferenceImage(null);
        setReferenceImageFile(null);
    };

    const handleGenerate = async () => {
        if (!selectedFormat || !formData.productName) {
            setGenerationError('フォーマットと商品名は必須です');
            return;
        }

        if ((userDoc?.credits ?? 0) < 1) {
            setGenerationError('クレジットが不足しています。プランをアップグレードしてください。');
            return;
        }

        setIsGenerating(true);
        setGenerationError(null);
        setGeneratedImage(null);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    format: selectedFormat,
                    productName: formData.productName,
                    catchCopy: formData.catchCopy,
                    description: formData.description,
                    targetAudience: formData.targetAudience,
                    tone: formData.tone,
                    primaryColor: formData.primaryColor,
                    secondaryColor: formData.secondaryColor,
                    referenceImage: referenceImage,
                }),
            });

            const data = await response.json() as any;

            if (!response.ok) {
                const errMsg = data.details ? `${data.error}（${data.details}）` : (data.error || '生成に失敗しました');
                throw new Error(errMsg);
            }

            if (data.imageUrl) {
                setGeneratedImage(data.imageUrl);
                await refreshUserDoc();
                // 結果エリアにスクロール
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

    const handleDownload = () => {
        if (!generatedImage) return;

        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `ad-${selectedFormat}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReset = () => {
        setSelectedFormat(null);
        setTemplateName(null);
        setFormData({
            productUrl: '',
            productName: '',
            catchCopy: '',
            description: '',
            targetAudience: '',
            tone: 'modern',
            primaryColor: '#FF6B35',
            secondaryColor: '#7C3AED',
        });
        setGeneratedImage(null);
        setGenerationError(null);
        setReferenceImage(null);
        setReferenceImageFile(null);
        setEditInstruction('');
        setEditError(null);
        setShowEditPanel(false);
    };

    // AI編集
    const editTypeOptions = [
        { id: 'text_change', label: 'テキスト変更', icon: '✏️' },
        { id: 'color_adjust', label: 'カラー調整', icon: '🎨' },
        { id: 'style_change', label: 'スタイル変更', icon: '✨' },
        { id: 'element_remove', label: '要素削除', icon: '✂️' },
    ];

    const handleEdit = async () => {
        if (!generatedImage || !editInstruction.trim()) {
            setEditError('編集指示を入力してください');
            return;
        }

        setIsEditing(true);
        setEditError(null);

        try {
            const response = await fetch('/api/edit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageData: generatedImage,
                    instruction: editInstruction,
                    editType,
                }),
            });

            const data = await response.json() as any;

            if (!response.ok) {
                throw new Error(data.error || '編集に失敗しました');
            }

            if (data.imageUrl) {
                setGeneratedImage(data.imageUrl);
                setEditInstruction('');
                setEditError(null);
            } else {
                setEditError(data.message || '編集結果の取得に失敗しました');
            }
        } catch (error) {
            console.error('Edit error:', error);
            setEditError(error instanceof Error ? error.message : '編集中にエラーが発生しました');
        } finally {
            setIsEditing(false);
        }
    };

    // 生成ボタンの有効/無効
    const canGenerate = selectedFormat && formData.productName && !isGenerating;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-purple-50/30 to-indigo-50/50 relative">
            {/* 背景デコレーション */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-200/20 to-transparent rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full blur-[100px]" />
            </div>

            {/* ヘッダー */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-purple-600">
                            AI Generator
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="font-semibold text-gray-700">新規作成</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-purple-50 rounded-full">
                            <span className="text-xs text-gray-500">クレジット:</span>
                            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">
                                {userDoc?.credits ?? 0}
                            </span>
                        </div>
                        <Link href="/dashboard" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
                            ダッシュボードへ
                        </Link>
                    </div>
                </div>
            </header>

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

                        {/* セクション1: フォーマット選択 */}
                        <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => toggleSection('format')}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">1</div>
                                    <div className="text-left">
                                        <h2 className="font-bold text-gray-900">フォーマット選択</h2>
                                        {selectedFormatData && (
                                            <p className="text-xs text-gray-500 mt-0.5">{selectedFormatData.icon} {selectedFormatData.name}（{selectedFormatData.size}）</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedFormat && (
                                        <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full">✓ 選択済み</span>
                                    )}
                                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${openSections.format ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {openSections.format && (
                                <div className="px-6 pb-6 animate-fade-in">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {visibleFormats.map((format) => (
                                            <button
                                                key={format.id}
                                                onClick={() => setSelectedFormat(format.id)}
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
                                    {adFormats.length > 4 && (
                                        <button
                                            onClick={() => setShowAllFormats(!showAllFormats)}
                                            className="mt-3 w-full py-2 text-sm text-purple-600 font-medium hover:text-purple-700 transition-colors"
                                        >
                                            {showAllFormats ? '折りたたむ ▲' : `すべて表示（${adFormats.length}件） ▼`}
                                        </button>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* セクション2: 商品情報 */}
                        <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => toggleSection('product')}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">2</div>
                                    <div className="text-left">
                                        <h2 className="font-bold text-gray-900">商品情報</h2>
                                        {formData.productName && (
                                            <p className="text-xs text-gray-500 mt-0.5">{formData.productName}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {formData.productName && (
                                        <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full">✓ 入力済み</span>
                                    )}
                                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${openSections.product ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {openSections.product && (
                                <div className="px-6 pb-6 space-y-5 animate-fade-in">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            商品ページURL（任意）
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.productUrl}
                                            onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                                            placeholder="https://example.com/product"
                                            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">URLを入力すると、AIが自動的に商品情報を抽出します</p>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-3 bg-white/80 text-gray-400 rounded">または手動で入力</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            商品名・サービス名 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.productName}
                                            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                            placeholder="例：プレミアムヘッドフォン Pro X"
                                            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            キャッチコピー（任意）
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.catchCopy}
                                            onChange={(e) => setFormData({ ...formData, catchCopy: e.target.value })}
                                            placeholder="例：音楽の新しい体験を。"
                                            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            商品説明（任意）
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="商品やサービスの特徴、アピールポイント"
                                            rows={2}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            ターゲット層（任意）
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.targetAudience}
                                            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                            placeholder="例：20〜30代の音楽好きな女性"
                                            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                        />
                                    </div>

                                    {/* 参考画像アップロード */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            参考画像（任意）
                                        </label>

                                        {referenceImage ? (
                                            <div className="relative">
                                                <div className="relative rounded-xl overflow-hidden border-2 border-purple-300 bg-gray-50">
                                                    <img
                                                        src={referenceImage}
                                                        alt="参考画像プレビュー"
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
                                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all">
                                                <div className="flex items-center gap-2 py-3">
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-500"><span className="font-semibold text-purple-600">クリックして画像を選択</span> (最大5MB)</span>
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
                            )}
                        </section>

                        {/* セクション3: スタイル設定 */}
                        <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => toggleSection('style')}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">3</div>
                                    <div className="text-left">
                                        <h2 className="font-bold text-gray-900">スタイル設定</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {toneOptions.find(t => t.id === formData.tone)?.label}
                                        </p>
                                    </div>
                                </div>
                                <svg className={`w-5 h-5 text-gray-400 transition-transform ${openSections.style ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {openSections.style && (
                                <div className="px-6 pb-6 space-y-6 animate-fade-in">
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
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">カラーパレット</label>
                                        <div className="flex items-center gap-5">
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
                                    </div>
                                </div>
                            )}
                        </section>

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
                                        AIで生成する（1クレジット消費）
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
                    </div>

                    {/* ===== 右カラム: プレビュー & 結果 ===== */}
                    <div className="lg:col-span-1" ref={resultRef}>
                        <div className="lg:sticky lg:top-24 space-y-6">

                            {/* 生成前: プレビューサマリー */}
                            {!generatedImage && (
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
                                        style={{
                                            background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})`
                                        }}
                                    >
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
                                            <span className="text-gray-500">フォーマット</span>
                                            <span className="font-medium text-gray-900">{selectedFormatData?.name || '未選択'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">サイズ</span>
                                            <span className="font-medium text-gray-900">{selectedFormatData?.size || '—'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">商品名</span>
                                            <span className="font-medium text-gray-900 truncate ml-4">{formData.productName || '未入力'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">テイスト</span>
                                            <span className="font-medium text-gray-900">{toneOptions.find(t => t.id === formData.tone)?.label}</span>
                                        </div>
                                        {formData.catchCopy && (
                                            <div className="pt-2 border-t border-gray-100">
                                                <span className="text-gray-500 block mb-1">キャッチコピー</span>
                                                <span className="font-medium text-gray-900 text-xs">{formData.catchCopy}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 生成後: 結果表示 */}
                            {generatedImage && (
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
                                    <div className="mb-5 aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group relative">
                                        <img
                                            src={generatedImage}
                                            alt="Generated Ad"
                                            className="w-full h-full object-contain"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                                            <button
                                                onClick={() => window.open(generatedImage, '_blank')}
                                                className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                                                title="拡大表示"
                                            >
                                                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* 生成情報 */}
                                    <div className="grid grid-cols-2 gap-3 text-xs mb-5 border-t border-gray-100 pt-4">
                                        <div>
                                            <span className="text-gray-500 block">フォーマット</span>
                                            <span className="font-medium">{selectedFormatData?.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">サイズ</span>
                                            <span className="font-medium">{selectedFormatData?.size}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">商品名</span>
                                            <span className="font-medium">{formData.productName}</span>
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
                                            ダウンロード
                                        </button>
                                        <button
                                            onClick={() => setShowEditPanel(!showEditPanel)}
                                            className={`w-full py-3 border-2 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm ${showEditPanel
                                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                                }`}
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

                                    {/* AI編集パネル */}
                                    {showEditPanel && (
                                        <div className="mt-5 pt-5 border-t border-gray-100 animate-fade-in">
                                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                AI編集
                                            </h4>

                                            {/* 編集タイプ選択 */}
                                            <div className="mb-3">
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {editTypeOptions.map((option) => (
                                                        <button
                                                            key={option.id}
                                                            onClick={() => setEditType(option.id)}
                                                            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${editType === option.id
                                                                ? 'bg-purple-600 text-white shadow-sm'
                                                                : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
                                                                }`}
                                                        >
                                                            <span className="mr-1">{option.icon}</span> {option.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* 編集指示入力 */}
                                            <div className="mb-3">
                                                <textarea
                                                    value={editInstruction}
                                                    onChange={(e) => setEditInstruction(e.target.value)}
                                                    placeholder="例：キャッチコピーを「限定セール」に変更"
                                                    rows={2}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none"
                                                />
                                            </div>

                                            {editError && (
                                                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
                                                    {editError}
                                                </div>
                                            )}

                                            <button
                                                onClick={handleEdit}
                                                disabled={isEditing || !editInstruction.trim()}
                                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 text-sm"
                                            >
                                                {isEditing ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        編集中...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                        </svg>
                                                        AIで編集する
                                                    </>
                                                )}
                                            </button>
                                            <p className="text-xs text-gray-400 mt-2 text-center">
                                                ※ Starterプラン以上で利用可能
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* ローディングオーバーレイ */}
            {isGenerating && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">AIが画像を生成中...</h3>
                        <p className="text-gray-500">しばらくお待ちください</p>
                    </div>
                </div>
            )}
        </div>
    );
}
