// ========================================
// 履歴ページ
// ========================================

'use client';

import Image from 'next/image';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAdHistoriesByUserId, deleteAdHistory, type AdHistory } from '@/lib/history';
import { AppHeader } from '@/components/layout/AppHeader';

export default function HistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [histories, setHistories] = useState<AdHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const formatDisplayLabel = (format: string) => format.replace(/-/g, ' ');

    const buildEditUrl = (item: AdHistory) => {
        const params = new URLSearchParams({
            imageUrl: item.imageUrl,
            format: item.format,
            productName: item.productName,
            catchCopy: item.catchCopy || '',
            description: item.description || '',
            targetAudience: item.targetAudience || '',
            tone: item.tone || '',
            primaryColor: item.primaryColor || '',
            secondaryColor: item.secondaryColor || '',
        });

        return `/edit?${params.toString()}`;
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchHistories = async () => {
            if (!user) return;
            try {
                const data = await getAdHistoriesByUserId();
                setHistories(data);
            } catch (error) {
                console.error('Fetch histories error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistories();
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm('この履歴を削除してもよろしいですか？')) return;

        setDeletingId(id);
        try {
            await deleteAdHistory(id);
            setHistories(histories.filter(h => h.id !== id));
        } catch (error) {
            console.error('Delete error:', error);
            alert('削除に失敗しました');
        } finally {
            setDeletingId(null);
        }
    };

    const handleDownload = async (e: React.MouseEvent, url: string, filename: string) => {
        e.stopPropagation();
        try {
            let response: Response;
            try {
                response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Direct fetch failed');
                }
            } catch {
                const proxyRes = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`);
                if (!proxyRes.ok) {
                    throw new Error('Proxy fetch failed');
                }

                const data = await proxyRes.json() as { dataUrl?: string };
                if (!data.dataUrl) {
                    throw new Error('No dataUrl in proxy response');
                }

                response = await fetch(data.dataUrl);
            }

            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `${filename.replace(/\s+/g, '_')}_ad.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.error('Download failed:', error);
            window.open(url, '_blank');
        }
    };

    const handleDownloadBundle = async (e: React.MouseEvent, item: AdHistory) => {
        e.stopPropagation();
        for (const variant of item.variants) {
            await handleDownload(e, variant.imageUrl, `${filenameBase(item.productName)}-${variant.format}`);
        }
    };

    const filenameBase = (value: string) => value.replace(/\s+/g, '_');

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-purple-50/30 to-indigo-50/50">
            <AppHeader />

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">生成履歴</h1>
                    <Link href="/create">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            新規作成
                        </button>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500">履歴を読み込み中...</p>
                    </div>
                ) : histories.length === 0 ? (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-16 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">履歴がありません</h3>
                        <p className="text-gray-500 mb-6">広告を生成すると、ここに履歴が表示されます。</p>
                        <Link href="/create">
                            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                                最初の広告を作成する
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {histories.map((item, index) => (
                            <div
                                key={item.id}
                                className="bg-white/95 rounded-[28px] border border-gray-200/80 overflow-hidden shadow-[0_10px_30px_rgba(15,23,42,0.06)] ring-1 ring-white transition-all duration-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] hover:-translate-y-1"
                            >
                                <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.productName}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        priority={index === 0}
                                        unoptimized
                                        className="w-full h-full object-contain"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-purple-600 shadow-sm">
                                        {formatDisplayLabel(item.format)}
                                    </div>
                                </div>
                                <div className="p-5 border-t border-gray-100/80">
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        <button
                                            onClick={() => window.open(item.imageUrl, '_blank')}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                                            title="拡大表示"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => router.push(buildEditUrl(item))}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                                            title="AIで編集"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => handleDownload(e, item.imageUrl, item.productName)}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2.5 text-sm font-semibold text-purple-600 hover:bg-purple-100 transition-colors"
                                            title="ダウンロード"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            disabled={deletingId === item.id}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                            title="削除"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-gray-900 line-clamp-1">{item.productName}</h3>
                                            {item.bundleTotal && item.bundleTotal > 1 && (
                                                <p className="mt-1 text-[11px] font-semibold text-purple-600">
                                                    {item.bundleTotal}サイズ一括生成
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-medium shrink-0">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ja-JP') : '...'}
                                        </span>
                                    </div>
                                    {item.catchCopy && (
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{item.catchCopy}</p>
                                    )}
                                    {item.variants.length > 1 && (
                                        <div className="mb-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-3">
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">Generated Sizes</span>
                                                <button
                                                    onClick={(e) => void handleDownloadBundle(e, item)}
                                                    className="text-[11px] font-semibold text-purple-600 hover:text-purple-700"
                                                >
                                                    一括DL
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {item.variants.map((variant) => (
                                                    <span key={variant.id} className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-gray-600 border border-gray-200">
                                                        {formatDisplayLabel(variant.format)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: item.primaryColor }} />
                                        <div className="w-3 h-3 rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: item.secondaryColor }} />
                                        <span className="text-[10px] text-gray-400 ml-auto capitalize">{item.tone || 'standard'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
