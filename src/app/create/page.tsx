// ========================================
// 広告作成ページ
// ========================================

'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';

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

export default function CreatePage() {
    const { user, userDoc, refreshUserDoc } = useAuth();
    const [step, setStep] = useState(1);
    const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
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

    const toneOptions = [
        { id: 'modern', label: 'モダン', description: '洗練された現代的なデザイン' },
        { id: 'cute', label: 'キュート', description: '可愛らしく親しみやすいデザイン' },
        { id: 'luxury', label: 'ラグジュアリー', description: '高級感のある上品なデザイン' },
        { id: 'pop', label: 'ポップ', description: '明るく元気なデザイン' },
        { id: 'minimal', label: 'ミニマル', description: 'シンプルで洗練されたデザイン' },
        { id: 'bold', label: 'ボールド', description: '大胆でインパクトのあるデザイン' },
    ];

    const selectedFormatData = adFormats.find(f => f.id === selectedFormat);

    // 参考画像のアップロード処理
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // ファイルサイズチェック（5MB以下）
        if (file.size > 5 * 1024 * 1024) {
            setGenerationError('画像サイズは5MB以下にしてください');
            return;
        }

        // ファイル形式チェック
        if (!file.type.startsWith('image/')) {
            setGenerationError('画像ファイルを選択してください');
            return;
        }

        setReferenceImageFile(file);

        // プレビュー用にBase64に変換
        const reader = new FileReader();
        reader.onload = (event) => {
            setReferenceImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
        setGenerationError(null);
    };

    // 参考画像の削除
    const handleRemoveImage = () => {
        setReferenceImage(null);
        setReferenceImageFile(null);
    };


    const handleGenerate = async () => {
        if (!selectedFormat || !formData.productName) {
            setGenerationError('商品名は必須です');
            return;
        }

        // クレジット確認
        if ((userDoc?.credits ?? 0) < 1) {
            setGenerationError('クレジットが不足しています。プランをアップグレードしてください。');
            return;
        }

        setIsGenerating(true);
        setGenerationError(null);
        setGeneratedImage(null);

        try {
            // IDトークンの取得
            const token = await user?.getIdToken();

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
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
                    referenceImage: referenceImage, // 参考画像（Base64）
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '生成に失敗しました');
            }

            if (data.imageUrl) {
                setGeneratedImage(data.imageUrl);
                await refreshUserDoc(); // クレジット残高を更新
                setStep(4); // 結果表示ステップへ
            } else {
                // 画像が生成されなかった場合
                setGenerationError(data.message || '画像の生成に失敗しました。再度お試しください。');
            }
        } catch (error) {
            console.error('Generation error:', error);
            setGenerationError(error instanceof Error ? error.message : '生成中にエラーが発生しました');
        } finally {
            setIsGenerating(false);
        }
    };

    // 画像ダウンロード
    const handleDownload = () => {
        if (!generatedImage) return;

        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `ad-${selectedFormat}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 再生成
    const handleRegenerate = () => {
        setGeneratedImage(null);
        setStep(3);
    };

    // 新規作成
    const handleReset = () => {
        setSelectedFormat(null);
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
        setStep(1);
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
            const token = await user?.getIdToken();

            const response = await fetch('/api/edit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    imageData: generatedImage,
                    instruction: editInstruction,
                    editType,
                }),
            });

            const data = await response.json();

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


    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-purple-50/30 to-indigo-50/50 relative">
            {/* 背景デコレーション */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-200/20 to-transparent rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full blur-[100px]" />
            </div>

            {/* ヘッダー */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
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

            <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">
                {/* ステップインジケーター */}
                <div className="flex items-center justify-center mb-10">
                    <div className="flex items-center gap-4">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s
                                    ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div className={`w-16 h-1 mx-2 rounded-full ${step > s ? 'bg-gradient-to-r from-orange-500 to-purple-600' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ステップ1: フォーマット選択 */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold text-gray-900 mb-3">広告フォーマットを選択</h1>
                            <p className="text-gray-500">作成したい広告のフォーマットを選んでください</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {adFormats.map((format) => (
                                <button
                                    key={format.id}
                                    onClick={() => setSelectedFormat(format.id)}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 hover:-translate-y-1 ${selectedFormat === format.id
                                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-orange-50 shadow-lg shadow-purple-500/10'
                                        : 'border-gray-100 bg-white/70 hover:border-gray-200 hover:shadow-md'
                                        }`}
                                >
                                    <span className="text-3xl mb-3 block">{format.icon}</span>
                                    <h3 className="font-bold text-gray-900 mb-1">{format.name}</h3>
                                    <p className="text-sm text-gray-500">{format.size}</p>
                                    <span className="inline-block mt-3 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                        {format.category}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-center mt-10">
                            <button
                                onClick={() => setStep(2)}
                                disabled={!selectedFormat}
                                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                次へ：商品情報を入力 →
                            </button>
                        </div>
                    </div>
                )}

                {/* ステップ2: 商品情報入力 */}
                {step === 2 && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold text-gray-900 mb-3">商品情報を入力</h1>
                            <p className="text-gray-500">
                                {selectedFormatData?.icon} {selectedFormatData?.name}（{selectedFormatData?.size}）用の広告を作成
                            </p>
                        </div>

                        <div className="max-w-2xl mx-auto bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        商品ページURL（任意）
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.productUrl}
                                        onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                                        placeholder="https://example.com/product"
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">URLを入力すると、AIが自動的に商品情報を抽出します</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-3 bg-white/80 text-gray-500 rounded">または手動で入力</span>
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
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
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
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        商品説明
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="商品やサービスの特徴、アピールポイントを入力してください"
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        ターゲット層
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.targetAudience}
                                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                        placeholder="例：20〜30代の音楽好きな女性"
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                    />
                                </div>

                                {/* 参考画像アップロード */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        参考画像（任意）
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">
                                        商品画像やデザインの参考にしたい画像をアップロードすると、より適切な広告を生成できます
                                    </p>

                                    {referenceImage ? (
                                        <div className="relative">
                                            <div className="relative rounded-xl overflow-hidden border-2 border-purple-300 bg-gray-50">
                                                <img
                                                    src={referenceImage}
                                                    alt="参考画像プレビュー"
                                                    className="w-full h-48 object-contain"
                                                />
                                                <button
                                                    onClick={handleRemoveImage}
                                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2 text-center">
                                                {referenceImageFile?.name}
                                            </p>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-sm text-gray-500 mb-1">
                                                    <span className="font-semibold text-purple-600">クリックして画像を選択</span>
                                                </p>
                                                <p className="text-xs text-gray-400">PNG, JPG, WEBP (最大5MB)</p>
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

                            <div className="flex justify-between mt-8">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                >
                                    ← 戻る
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!formData.productName}
                                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    次へ：スタイル設定 →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ステップ3: スタイル設定 */}
                {step === 3 && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold text-gray-900 mb-3">スタイルを設定</h1>
                            <p className="text-gray-500">広告のデザインテイストを選択してください</p>
                        </div>

                        <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-8">
                            {/* トーン選択 */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-gray-700 mb-4">
                                    デザインテイスト
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {toneOptions.map((tone) => (
                                        <button
                                            key={tone.id}
                                            onClick={() => setFormData({ ...formData, tone: tone.id })}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${formData.tone === tone.id
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-100 hover:border-gray-200'
                                                }`}
                                        >
                                            <span className="font-semibold text-gray-900">{tone.label}</span>
                                            <p className="text-xs text-gray-500 mt-1">{tone.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* カラー選択 */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-gray-700 mb-4">
                                    カラーパレット
                                </label>
                                <div className="flex items-center gap-6">
                                    <div>
                                        <span className="block text-xs text-gray-500 mb-2">メインカラー</span>
                                        <input
                                            type="color"
                                            value={formData.primaryColor}
                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                            className="w-16 h-16 rounded-xl cursor-pointer border border-gray-200"
                                        />
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-500 mb-2">アクセントカラー</span>
                                        <input
                                            type="color"
                                            value={formData.secondaryColor}
                                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                            className="w-16 h-16 rounded-xl cursor-pointer border border-gray-200"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block text-xs text-gray-500 mb-2">プレビュー</span>
                                        <div
                                            className="h-16 rounded-xl"
                                            style={{
                                                background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* サマリー */}
                            <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl p-6 mb-8">
                                <h3 className="font-semibold text-gray-900 mb-3">生成内容の確認</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">フォーマット:</span>
                                        <span className="ml-2 font-medium">{selectedFormatData?.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">サイズ:</span>
                                        <span className="ml-2 font-medium">{selectedFormatData?.size}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">商品名:</span>
                                        <span className="ml-2 font-medium">{formData.productName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">テイスト:</span>
                                        <span className="ml-2 font-medium">
                                            {toneOptions.find(t => t.id === formData.tone)?.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                >
                                    ← 戻る
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                    AIで生成する（1クレジット消費）
                                </button>
                            </div>

                            {/* エラー表示 */}
                            {generationError && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                    {generationError}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ステップ4: 生成結果 */}
                {step === 4 && generatedImage && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold text-gray-900 mb-3">🎉 生成完了!</h1>
                            <p className="text-gray-500">広告画像が生成されました</p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            {/* 生成された画像 */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 shadow-lg mb-8">
                                <div className="flex justify-center mb-6">
                                    <img
                                        src={generatedImage}
                                        alt="生成された広告画像"
                                        className="max-w-full h-auto rounded-xl shadow-lg"
                                        style={{ maxHeight: '500px' }}
                                    />
                                </div>

                                {/* 生成情報 */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t border-gray-100 pt-6">
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
                                        <span className="font-medium">
                                            {toneOptions.find(t => t.id === formData.tone)?.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* アクションボタン */}
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <button
                                    onClick={handleDownload}
                                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    ダウンロード
                                </button>
                                <button
                                    onClick={() => setShowEditPanel(!showEditPanel)}
                                    className={`px-8 py-4 border-2 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${showEditPanel
                                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    AIで編集
                                </button>
                                <button
                                    onClick={handleRegenerate}
                                    className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    再生成する
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-8 py-4 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    新規作成
                                </button>
                            </div>

                            {/* AI編集パネル */}
                            {showEditPanel && (
                                <div className="mt-8 bg-gradient-to-br from-purple-50 to-orange-50 rounded-2xl border border-purple-100 p-8 animate-fade-in">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        AI編集
                                    </h3>

                                    {/* 編集タイプ選択 */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">編集の種類</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {editTypeOptions.map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => setEditType(option.id)}
                                                    className={`p-3 rounded-xl text-sm font-medium transition-all ${editType === option.id
                                                            ? 'bg-purple-600 text-white shadow-md'
                                                            : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
                                                        }`}
                                                >
                                                    <span className="mr-1">{option.icon}</span> {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 編集指示入力 */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">編集指示</label>
                                        <textarea
                                            value={editInstruction}
                                            onChange={(e) => setEditInstruction(e.target.value)}
                                            placeholder="例：キャッチコピーを「限定セール開催中」に変更してください"
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none"
                                        />
                                    </div>

                                    {/* エラー表示 */}
                                    {editError && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                            {editError}
                                        </div>
                                    )}

                                    {/* 編集ボタン */}
                                    <button
                                        onClick={handleEdit}
                                        disabled={isEditing || !editInstruction.trim()}
                                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                    >
                                        {isEditing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                編集中...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                </svg>
                                                AIで編集する
                                            </>
                                        )}
                                    </button>

                                    <p className="text-xs text-gray-400 mt-3 text-center">
                                        ※ AI編集はStarterプラン以上でご利用いただけます
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
            </main>
        </div>
    );
}
