// ========================================
// 履歴ページ
// ========================================

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteAdHistory, toggleAdHistoryFavorite, updateAdHistoryPerformance, type AdHistory } from '@/lib/history';
import { AppHeader } from '@/components/layout/AppHeader';
import { SHOW_VIDEO_FEATURES } from '@/lib/feature-flags';

type InitialAdHistory = Omit<AdHistory, 'createdAt'> & {
    createdAt: string;
};

function reviveHistory(item: InitialAdHistory): AdHistory {
    return {
        ...item,
        createdAt: new Date(item.createdAt),
    };
}

export default function HistoryPage({
    initialHistories,
}: {
    initialHistories: InitialAdHistory[];
}) {
    const router = useRouter();
    const [histories, setHistories] = useState<AdHistory[]>(() => initialHistories.map(reviveHistory));
    const [loading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingFavoriteId, setTogglingFavoriteId] = useState<string | null>(null);
    const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
    const [selectedView, setSelectedView] = useState<'all' | 'favorites'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortKey, setSortKey] = useState<'recent' | 'favorite' | 'name'>('recent');
    const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [editingPerformanceId, setEditingPerformanceId] = useState<string | null>(null);
    const [isSavingPerformance, setIsSavingPerformance] = useState(false);
    const [performanceDraft, setPerformanceDraft] = useState({
        ctr: '',
        cvr: '',
        cpa: '',
        spend: '',
        conversions: '',
        resultNote: '',
    });
    const formatDisplayLabel = (format: string) => format.replace(/-/g, ' ');
    const isVideoHistory = (item: AdHistory) => item.mediaType === 'video';

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
            brandKitId: item.brandKitId || '',
            projectId: item.projectId || '',
            sourceGenerationId: item.id,
        });

        return `/edit?${params.toString()}`;
    };

    const buildCreateUrl = (item: AdHistory, mode: 'duplicate' | 'variation') => {
        const params = new URLSearchParams({
            format: item.format,
            productName: item.productName,
            catchCopy: item.catchCopy || '',
            description: item.description || '',
            targetAudience: item.targetAudience || '',
            tone: item.tone || '',
            primaryColor: item.primaryColor || '',
            secondaryColor: item.secondaryColor || '',
            brandKitId: item.brandKitId || '',
            projectId: item.projectId || '',
            sourceGenerationId: item.id,
            originType: mode,
        });

        return `/create?${params.toString()}`;
    };

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
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Direct fetch failed');
            }

            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `${filename.replace(/\s+/g, '_')}_ad${blob.type.startsWith('video/') ? '.mp4' : '.png'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.error('Download failed:', error);
            window.open(url, '_blank');
        }
    };

    const handleFavoriteToggle = async (id: string, nextValue: boolean) => {
        setTogglingFavoriteId(id);
        try {
            await toggleAdHistoryFavorite(id, nextValue);
            setHistories((current) => current.map((item) => (
                item.id === id ? { ...item, isFavorite: nextValue } : item
            )));
        } catch (error) {
            console.error('Favorite toggle error:', error);
            alert('お気に入りの更新に失敗しました');
        } finally {
            setTogglingFavoriteId(null);
        }
    };

    const toggleHistorySelection = (id: string) => {
        setSelectedHistoryIds((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        );
    };

    const handleSelectAllVisible = () => {
        const visibleIds = filteredHistories.map((item) => item.id);
        const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedHistoryIds.includes(id));

        setSelectedHistoryIds((current) => {
            if (allSelected) {
                return current.filter((id) => !visibleIds.includes(id));
            }

            return Array.from(new Set([...current, ...visibleIds]));
        });
    };

    const handleBulkDelete = async () => {
        if (selectedHistoryIds.length === 0) return;
        if (!confirm(`選択した ${selectedHistoryIds.length} 件の履歴を削除しますか？`)) return;

        setIsBulkUpdating(true);
        try {
            await Promise.all(selectedHistoryIds.map((id) => deleteAdHistory(id)));
            setHistories((current) => current.filter((item) => !selectedHistoryIds.includes(item.id)));
            setSelectedHistoryIds([]);
        } catch (error) {
            console.error('Bulk delete error:', error);
            alert('一括削除に失敗しました');
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleBulkFavorite = async (nextValue: boolean) => {
        if (selectedHistoryIds.length === 0) return;

        setIsBulkUpdating(true);
        try {
            await Promise.all(selectedHistoryIds.map((id) => toggleAdHistoryFavorite(id, nextValue)));
            setHistories((current) =>
                current.map((item) =>
                    selectedHistoryIds.includes(item.id)
                        ? { ...item, isFavorite: nextValue }
                        : item
                )
            );
        } catch (error) {
            console.error('Bulk favorite error:', error);
            alert('一括更新に失敗しました');
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const openPerformanceEditor = (item: AdHistory) => {
        setEditingPerformanceId(item.id);
        setPerformanceDraft({
            ctr: item.performance?.ctr?.toString() || '',
            cvr: item.performance?.cvr?.toString() || '',
            cpa: item.performance?.cpa?.toString() || '',
            spend: item.performance?.spend?.toString() || '',
            conversions: item.performance?.conversions?.toString() || '',
            resultNote: item.performance?.resultNote || '',
        });
    };

    const handlePerformanceSave = async (id: string) => {
        setIsSavingPerformance(true);
        try {
            const nextPerformance = {
                ctr: performanceDraft.ctr ? Number(performanceDraft.ctr) : undefined,
                cvr: performanceDraft.cvr ? Number(performanceDraft.cvr) : undefined,
                cpa: performanceDraft.cpa ? Number(performanceDraft.cpa) : undefined,
                spend: performanceDraft.spend ? Number(performanceDraft.spend) : undefined,
                conversions: performanceDraft.conversions ? Number(performanceDraft.conversions) : undefined,
                resultNote: performanceDraft.resultNote.trim() || undefined,
            };

            await updateAdHistoryPerformance(id, nextPerformance);
            setHistories((current) => current.map((item) => (
                item.id === id
                    ? { ...item, performance: nextPerformance }
                    : item
            )));
            setEditingPerformanceId(null);
        } catch (error) {
            console.error('Performance save error:', error);
            alert('成果メモの保存に失敗しました');
        } finally {
            setIsSavingPerformance(false);
        }
    };

    const projectOptions = Array.from(
        new Map(
            histories
                .filter((item) => item.projectId && item.projectName)
                .map((item) => [item.projectId as string, item.projectName as string])
        ).entries()
    ).map(([id, name]) => ({ id, name }));

    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filteredHistories = histories.filter((item) => {
        if (selectedProjectFilter !== 'all' && item.projectId !== selectedProjectFilter) {
            return false;
        }

        if (selectedView === 'favorites' && !item.isFavorite) {
            return false;
        }

        if (!normalizedQuery) {
            return true;
        }

        const searchTargets = [
            item.productName,
            item.catchCopy,
            item.description,
            item.targetAudience,
            item.projectName,
            item.brandKitName,
            item.tone,
            item.format,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        if (!searchTargets.includes(normalizedQuery)) {
            return false;
        }

        return true;
    }).sort((left, right) => {
        if (sortKey === 'favorite') {
            const favoriteScore = Number(Boolean(right.isFavorite)) - Number(Boolean(left.isFavorite));
            if (favoriteScore !== 0) {
                return favoriteScore;
            }
        }

        if (sortKey === 'name') {
            return left.productName.localeCompare(right.productName, 'ja');
        }

        return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-purple-50/30 to-indigo-50/50">
            <AppHeader />

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">生成履歴</h1>
                        <p className="mt-2 text-sm text-gray-500">案件ごとに見返しながら、複製、派生生成、編集につなげられます。</p>
                        <div className="mt-4 inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setSelectedView('all')}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                    selectedView === 'all'
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                すべて
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedView('favorites')}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                    selectedView === 'favorites'
                                        ? 'bg-amber-500 text-white'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                お気に入り
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative">
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="商品名、コピー、ブランド名で検索"
                                className="min-w-[260px] rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200/70"
                            />
                            <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <select
                            value={sortKey}
                            onChange={(e) => setSortKey(e.target.value as 'recent' | 'favorite' | 'name')}
                            className="min-w-[200px] rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200/70"
                        >
                            <option value="recent">新しい順</option>
                            <option value="favorite">お気に入り優先</option>
                            <option value="name">商品名順</option>
                        </select>
                        {projectOptions.length > 0 && (
                            <select
                                value={selectedProjectFilter}
                                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                                className="min-w-[220px] rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200/70"
                            >
                                <option value="all">すべてのプロジェクト</option>
                                {projectOptions.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <Link href="/create">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                新規作成
                            </button>
                        </Link>
                    </div>
                </div>

                {filteredHistories.length > 0 && (
                    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/80 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={filteredHistories.length > 0 && filteredHistories.every((item) => selectedHistoryIds.includes(item.id))}
                                    onChange={handleSelectAllVisible}
                                    className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                />
                                表示中をすべて選択
                            </label>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                                選択中 {selectedHistoryIds.length} 件
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => handleBulkFavorite(true)}
                                disabled={selectedHistoryIds.length === 0 || isBulkUpdating}
                                className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                お気に入りに追加
                            </button>
                            <button
                                type="button"
                                onClick={() => handleBulkFavorite(false)}
                                disabled={selectedHistoryIds.length === 0 || isBulkUpdating}
                                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                お気に入り解除
                            </button>
                            <button
                                type="button"
                                onClick={handleBulkDelete}
                                disabled={selectedHistoryIds.length === 0 || isBulkUpdating}
                                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                選択分を削除
                            </button>
                        </div>
                    </div>
                )}

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
                ) : filteredHistories.length === 0 ? (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-16 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center">
                            <svg className="w-10 h-10 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M6 12h12M9 17h6" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">条件に合う履歴がありません</h3>
                        <p className="text-gray-500 mb-6">検索語やフィルタを変えるか、新しく生成してください。</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredHistories.map((item, index) => (
                            <div
                                key={item.id}
                                className="bg-white/95 rounded-[28px] border border-gray-200/80 overflow-hidden shadow-[0_10px_30px_rgba(15,23,42,0.06)] ring-1 ring-white transition-all duration-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] hover:-translate-y-1"
                            >
                                <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                                    <label className="absolute left-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/90 backdrop-blur">
                                        <input
                                            type="checkbox"
                                            checked={selectedHistoryIds.includes(item.id)}
                                            onChange={() => toggleHistorySelection(item.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                        />
                                    </label>
                                    {isVideoHistory(item) ? (
                                        <video
                                            src={item.imageUrl}
                                            className="h-full w-full object-cover"
                                            muted
                                            playsInline
                                            preload="metadata"
                                        />
                                    ) : (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.productName}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            priority={index === 0}
                                            unoptimized
                                            className="w-full h-full object-contain"
                                        />
                                    )}
                                    <div className="absolute top-4 left-16 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-purple-600 shadow-sm">
                                        {formatDisplayLabel(item.format)}
                                    </div>
                                    {isVideoHistory(item) && (
                                        <div className="absolute bottom-4 left-4 rounded-full bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                                            video
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleFavoriteToggle(item.id, !item.isFavorite)}
                                        disabled={togglingFavoriteId === item.id}
                                        className={`absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur transition ${
                                            item.isFavorite
                                                ? 'border-amber-200 bg-amber-50 text-amber-500'
                                                : 'border-white/80 bg-white/85 text-gray-400 hover:text-amber-500'
                                        } disabled:cursor-not-allowed disabled:opacity-60`}
                                        title={item.isFavorite ? 'お気に入り解除' : 'お気に入り登録'}
                                    >
                                        <svg className="h-5 w-5" fill={item.isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.324 4.074a1 1 0 00.95.69h4.285c.969 0 1.371 1.24.588 1.81l-3.467 2.52a1 1 0 00-.364 1.118l1.324 4.073c.3.922-.755 1.688-1.539 1.118l-3.467-2.52a1 1 0 00-1.176 0l-3.467 2.52c-.783.57-1.838-.196-1.539-1.118l1.324-4.073a1 1 0 00-.364-1.118L2.98 9.5c-.783-.57-.38-1.81.588-1.81h4.285a1 1 0 00.95-.69l1.246-4.073z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-5 border-t border-gray-100/80">
                                    <div className="grid grid-cols-3 gap-2 mb-4 sm:grid-cols-5">
                                        <button
                                            onClick={() => window.open(item.imageUrl, '_blank')}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                                            title="拡大表示"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                            </svg>
                                        </button>
                                        {isVideoHistory(item) && SHOW_VIDEO_FEATURES ? (
                                            <button
                                                onClick={() => router.push('/video')}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                title="動画ページで再利用"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m-10 4h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => router.push(buildEditUrl(item))}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                title="AIで編集"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => handleDownload(e, item.imageUrl, item.productName)}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2.5 text-sm font-semibold text-purple-600 hover:bg-purple-100 transition-colors"
                                            title="ダウンロード"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </button>
                                        {isVideoHistory(item) && SHOW_VIDEO_FEATURES ? (
                                            <button
                                                onClick={() => router.push('/video')}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                                                title="この設定で再生成"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m14.418 2A8 8 0 005.582 9m0 0H9m11 11v-5h-.581m0 0A8.003 8.003 0 016.582 15m12.837 0H15" />
                                                </svg>
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => router.push(buildCreateUrl(item, 'duplicate'))}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                                                    title="複製して作成"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 10h6a2 2 0 002-2v-8a2 2 0 00-2-2h-6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => router.push(buildCreateUrl(item, 'variation'))}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                                                    title="派生生成"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
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
                                        <button
                                            onClick={() => openPerformanceEditor(item)}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm font-semibold text-sky-700 hover:bg-sky-100 transition-colors"
                                            title="成果を記録"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 11V7m0 4l-3 3m3-3l3 3m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-900 line-clamp-1">{item.productName}</h3>
                                                {isVideoHistory(item) && (
                                                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                                                        Veo
                                                    </span>
                                                )}
                                                {item.isFavorite && (
                                                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                                        favorite
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-medium shrink-0">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ja-JP') : '...'}
                                        </span>
                                    </div>
                                    {item.catchCopy && (
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{item.catchCopy}</p>
                                    )}
                                    {isVideoHistory(item) && (
                                        <div className="mb-4 flex flex-wrap gap-2">
                                            <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-700">
                                                {item.videoDuration || '-'}秒
                                            </span>
                                            {item.sourceModel && (
                                                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                                                    {item.sourceModel}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {(item.projectName || item.brandKitName) && (
                                        <div className="mb-4 flex flex-wrap gap-2">
                                            {item.projectName && (
                                                <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
                                                    {item.projectName}
                                                </span>
                                            )}
                                            {item.brandKitName && (
                                                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                                                    {item.brandKitName}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {item.performance && (
                                        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-sky-100 bg-sky-50/70 p-3 text-[11px]">
                                            <div>
                                                <span className="text-sky-700 font-semibold">CTR</span>
                                                <p className="mt-1 font-bold text-gray-900">{item.performance.ctr ?? '-'}%</p>
                                            </div>
                                            <div>
                                                <span className="text-sky-700 font-semibold">CVR</span>
                                                <p className="mt-1 font-bold text-gray-900">{item.performance.cvr ?? '-'}%</p>
                                            </div>
                                            <div>
                                                <span className="text-sky-700 font-semibold">CPA</span>
                                                <p className="mt-1 font-bold text-gray-900">{item.performance.cpa ?? '-'}</p>
                                            </div>
                                            <div>
                                                <span className="text-sky-700 font-semibold">CV数</span>
                                                <p className="mt-1 font-bold text-gray-900">{item.performance.conversions ?? '-'}</p>
                                            </div>
                                        </div>
                                    )}
                                    {editingPerformanceId === item.id && (
                                        <div className="mb-4 space-y-3 rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { key: 'ctr', label: 'CTR (%)' },
                                                    { key: 'cvr', label: 'CVR (%)' },
                                                    { key: 'cpa', label: 'CPA' },
                                                    { key: 'spend', label: '広告費' },
                                                    { key: 'conversions', label: 'CV数' },
                                                ].map((field) => (
                                                    <label key={field.key} className="text-xs font-semibold text-sky-800">
                                                        {field.label}
                                                        <input
                                                            value={performanceDraft[field.key as keyof typeof performanceDraft] as string}
                                                            onChange={(event) => setPerformanceDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                                                            className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200/70"
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                            <label className="block text-xs font-semibold text-sky-800">
                                                成果メモ
                                                <textarea
                                                    value={performanceDraft.resultNote}
                                                    onChange={(event) => setPerformanceDraft((current) => ({ ...current, resultNote: event.target.value }))}
                                                    rows={3}
                                                    className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200/70"
                                                />
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handlePerformanceSave(item.id)}
                                                    disabled={isSavingPerformance}
                                                    className="flex-1 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {isSavingPerformance ? '保存中...' : '成果を保存'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingPerformanceId(null)}
                                                    className="rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 hover:bg-sky-50"
                                                >
                                                    閉じる
                                                </button>
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
