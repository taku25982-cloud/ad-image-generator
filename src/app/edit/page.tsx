'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { AppHeader } from '@/components/layout/AppHeader';
import { resizeAndCompressImage } from '@/lib/image-utils';

interface EditMetadata {
    format?: string;
    content?: {
        productName?: string;
        catchphrase?: string;
        description?: string;
        targetAudience?: string;
    };
    branding?: {
        tone?: string;
        primaryColor?: string;
        secondaryColor?: string;
    };
}

const editTypeOptions = [
    { id: 'text_change', label: 'テキスト変更', icon: '✏️', description: 'テキストの内容やフォント、配置を変更' },
    { id: 'color_adjust', label: 'カラー調整', icon: '🎨', description: '色味やカラーパレットを調整' },
    { id: 'style_change', label: 'スタイル変更', icon: '✨', description: 'デザインスタイルや雰囲気を変更' },
    { id: 'element_remove', label: '要素削除', icon: '✂️', description: '不要な要素を除去' },
];

function EditPageContent() {
    const { user, loading, userDoc, refreshUserDoc } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const resultRef = useRef<HTMLDivElement>(null);

    // 画像と編集状態
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);

    // 編集指示
    const [editInstruction, setEditInstruction] = useState('');
    const [editType, setEditType] = useState('style_change');
    const [editMetadata, setEditMetadata] = useState<EditMetadata>({});

    // 処理状態
    const [isEditing, setIsEditing] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    // Gemini 3.1の思考シグネチャ（連続編集時の精度向上に使用）
    const [thoughtSignature, setThoughtSignature] = useState<string | null>(null);
    const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    useEffect(() => {
        if (!user && !loading) {
            router.push('/');
        }
    }, [user, loading, router]);

    // urlパラメータからimageUrlを取得する (履歴などから遷移した場合)
    useEffect(() => {
        const imageUrlParam = searchParams.get('imageUrl');
        const productName = searchParams.get('productName');
        const catchCopy = searchParams.get('catchCopy');
        const description = searchParams.get('description');
        const targetAudience = searchParams.get('targetAudience');
        const format = searchParams.get('format');
        const tone = searchParams.get('tone');
        const primaryColor = searchParams.get('primaryColor');
        const secondaryColor = searchParams.get('secondaryColor');

        setEditMetadata({
            format: format || undefined,
            content: {
                productName: productName || undefined,
                catchphrase: catchCopy || undefined,
                description: description || undefined,
                targetAudience: targetAudience || undefined,
            },
            branding: {
                tone: tone || undefined,
                primaryColor: primaryColor || undefined,
                secondaryColor: secondaryColor || undefined,
            },
        });

        if (imageUrlParam) {
            // URLから画像をフェッチしてbase64に変換する（CORSが必要な場合がある）か、
            // もしくはそのままURLとして利用する
            setSourceImage(decodeURIComponent(imageUrlParam));

            // base64形式でないURLが渡された場合、内部的には fetch("/api/edit") で
            // base64を期待しているため、画像をフェッチして Data URL に変換しておく
            if (!imageUrlParam.startsWith('data:')) {
                fetchImageAsBase64(decodeURIComponent(imageUrlParam));
            }
        }
    }, [searchParams]);

    const fetchImageAsBase64 = async (url: string) => {
        try {
            // CORSエラーを回避するため、プロキシAPIを経由して取得する
            const res = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`);
            if (res.ok) {
                const data = await res.json() as { dataUrl?: string };
                if (data.dataUrl) {
                    setSourceImage(data.dataUrl);
                    return;
                }
            }

            // プロキシが失敗した場合はフォールバックとして直接取得を試みる
            const fallbackRes = await fetch(url);
            const blob = await fallbackRes.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
                setSourceImage(reader.result as string);
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            console.error('Failed to convert image to base64', error);
            // 代替案としてそのままURLを使用するが、API側で対応が必要になる可能性がある
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const dataUrl = await resizeAndCompressImage(file);
            setSourceImage(dataUrl);
            setEditedImage(null); // 新しい画像をアップロードしたら編集完了画像をリセット
            setEditError(null);
            setEditMetadata({});
        } catch (error) {
            setEditError(error instanceof Error ? error.message : '画像の処理に失敗しました');
            setSourceImage(null);
        }
    };

    const handleRemoveImage = () => {
        setSourceImage(null);
        setEditedImage(null);
        setEditInstruction('');
        setThoughtSignature(null); // 画像を変更したらシグネチャもリセット
        setEditMetadata({});
    };

    const handleEdit = async () => {
        if (!sourceImage) {
            setEditError('編集元の画像が必要です');
            return;
        }

        if (!editInstruction.trim()) {
            setEditError('編集指示を入力してください');
            return;
        }

        if (!isAdmin && (userDoc?.credits ?? 0) < 1) {
            setEditError('クレジットが不足しています。プランをアップグレードしてください。');
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
                    imageData: sourceImage,
                    instruction: editInstruction,
                    editType: editType,
                    format: editMetadata.format,
                    content: editMetadata.content,
                    branding: editMetadata.branding,
                    // 前回の編集から受け取ったシグネチャがあれば渡す
                    ...(thoughtSignature ? { thoughtSignature } : {}),
                }),
            });

            const data = await response.json() as {
                imageUrl?: string;
                error?: string;
                details?: unknown;
                message?: string;
                thoughtSignature?: string;
            };

            if (!response.ok) {
                let errorDetails = '';
                if (data.details) {
                    errorDetails = typeof data.details === 'object' 
                        ? JSON.stringify(data.details) 
                        : String(data.details);
                }
                const errMsg = errorDetails ? `${data.error}（${errorDetails}）` : (data.error || '編集に失敗しました');
                throw new Error(errMsg);
            }

            if (data.imageUrl) {
                setEditedImage(data.imageUrl);
                // 次の編集のためにシグネチャを保存
                if (data.thoughtSignature) {
                    setThoughtSignature(data.thoughtSignature as string);
                }
                await refreshUserDoc(); // クレジット消費を反映

                // 結果エリアにスクロール
                setTimeout(() => {
                    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
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

    const handleDownload = async () => {
        if (!editedImage) return;

        try {
            let response;
            try {
                response = await fetch(editedImage);
                if (!response.ok) throw new Error('Network response was not ok');
            } catch {
                // CORSエラーなどで直接取得に失敗した場合、プロキシを経由する
                const proxyRes = await fetch(`/api/proxy-image?url=${encodeURIComponent(editedImage)}`);
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
            link.download = `edited-ad-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed, falling back to direct link:', error);
            // フォールバック
            const link = document.createElement('a');
            link.href = editedImage;
            link.download = `edited-ad-${Date.now()}.png`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const canEdit = sourceImage && !isEditing;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 relative">
            {/* 背景デコレーション */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-200/20 to-transparent rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-pink-200/20 to-transparent rounded-full blur-[120px]" />
            </div>

            <AppHeader />

            <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg text-white">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                        AI画像編集
                    </h1>
                    <p className="mt-2 text-gray-600">
                        生成された広告画像やお手持ちの画像の一部分を、AIを使って部分的に修正します。
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 左カラム：入力・設定エリア */}
                    <div className="space-y-6">
                        {/* 1. 画像アップロード / 表示 */}
                        <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-sm">1</span>
                                編集する画像を選択
                            </h2>

                            {sourceImage ? (
                                <div className="space-y-4">
                                    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center min-h-[200px] aspect-auto max-h-[400px]">
                                        <Image
                                            src={sourceImage}
                                            alt="編集元画像"
                                            width={800}
                                            height={400}
                                            unoptimized
                                            className="w-full h-full object-contain max-h-[400px]"
                                        />
                                        <button
                                            onClick={handleRemoveImage}
                                            className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors shadow-lg backdrop-blur-sm"
                                            title="画像を削除"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="text-center">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            画像セットアップ完了
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-all bg-white">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-gray-700 font-medium">クリックして画像をアップロード</p>
                                            <p className="text-xs text-gray-500 mt-1">PNG, JPG形式 (最大5MB)</p>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </section>

                        {/* 2. 編集内容の設定 */}
                        <section className={`bg-white/70 backdrop-blur-sm rounded-2xl border transition-all duration-300 p-6 ${sourceImage ? 'border-purple-200 shadow-md' : 'border-gray-100 opacity-60 pointer-events-none'}`}>
                            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-sm ${sourceImage ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>2</span>
                                どのように修正しますか？
                            </h2>

                            <div className="space-y-5">
                                {/* 編集カテゴリの選択 */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">編集タイプ</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {editTypeOptions.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => setEditType(option.id)}
                                                className={`p-3 rounded-xl border-2 text-left transition-all ${editType === option.id
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-gray-100 hover:border-gray-200 bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-lg">{option.icon}</span>
                                                    <span className="font-semibold text-gray-900 text-sm">{option.label}</span>
                                                </div>
                                                <p className="text-xs text-gray-500">{option.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 細かい指示の入力 */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        具体的な指示
                                    </label>
                                    <textarea
                                        value={editInstruction}
                                        onChange={(e) => setEditInstruction(e.target.value)}
                                        placeholder="例：キャッチコピーを「今だけ半額」に変更し、フォントを太くしてください"
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-2">
                                        ※ 指示した箇所のみが変更され、他のデザインは維持されます。
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 実行ボタン */}
                        <div className="sticky bottom-4 z-40">
                            <button
                                onClick={handleEdit}
                                disabled={!canEdit || !editInstruction.trim()}
                                className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3"
                            >
                                {isEditing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        AIが画像を編集中...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                        {isAdmin ? 'AIで編集する（管理者：制限なし）' : 'AIで編集する（1クレジット消費）'}
                                    </>
                                )}
                            </button>

                            {editError && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                    {editError}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 右カラム：編集結果プレビュー */}
                    <div className="lg:col-span-1" ref={resultRef}>
                        <div className="lg:sticky lg:top-24 space-y-6">

                            {!editedImage && sourceImage && (
                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-8 text-center h-[500px] flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 font-medium">画像の編集指示を入力して、<br />「AIで編集する」を押してください</p>
                                </div>
                            )}

                            {!editedImage && !sourceImage && (
                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-8 text-center h-[500px] flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 font-medium">左側のエリアから<br />編集したい画像をアップロードしてください</p>
                                </div>
                            )}

                            {/* 生成後: 結果表示 */}
                            {editedImage && (
                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-purple-100 p-6 shadow-lg shadow-purple-500/10 animate-fade-in">
                                    <div className="mb-6 flex items-center animate-fade-in-up">
                                        <span className="text-2xl mr-2 animate-bounce">✨</span>
                                        <span className="text-xl font-bold text-gray-800 tracking-tight">編集完了！</span>
                                    </div>

                                    {/* 新旧比較プレビュー */}
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">After (編集後)</span>
                                            </div>
                                            <div className="aspect-auto bg-gray-50 rounded-xl overflow-hidden border-2 border-purple-200">
                                                <Image
                                                    src={editedImage}
                                                    alt="編集後画像"
                                                    width={800}
                                                    height={800}
                                                    unoptimized
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </div>

                                        <div className="relative py-2">
                                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gray-200"></div>
                                            <div className="relative flex justify-center">
                                                <div className="bg-white px-2 py-0.5 rounded-full border border-gray-200 text-gray-400">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">Before (編集前)</span>
                                            </div>
                                            <div className="aspect-auto bg-gray-50 rounded-xl overflow-hidden border border-gray-200 opacity-80">
                                                <Image
                                                    src={sourceImage as string}
                                                    alt="編集元画像"
                                                    width={800}
                                                    height={800}
                                                    unoptimized
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="mt-6">
                                        <button
                                            onClick={handleDownload}
                                            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold shadow-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            編集済みの画像を保存
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </main>

            {/* ローディングオーバーレイ */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center">
                        <div className="w-16 h-16 relative mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl">✨</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">AIが画像を編集中...</h3>
                        <p className="text-gray-500 text-sm">指示に合わせて調整しています。<br />しばらくお待ちください。</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function EditPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        }>
            <EditPageContent />
        </Suspense>
    );
}

