'use client';

import { AppHeader } from '@/components/layout/AppHeader';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface BrandKitOption {
    id: string;
    name: string;
}

interface ProjectItem {
    id: string;
    name: string;
    description?: string | null;
    brandKitId?: string | null;
    status?: 'active' | 'archived' | string;
    tags?: string[] | null;
    createdAt?: string | number | Date | null;
    updatedAt?: string | number | Date | null;
    usageCount?: number;
    lastGeneratedAt?: string | number | Date | null;
}

interface DraftState {
    name: string;
    description: string;
    brandKitId: string;
    status: 'active' | 'archived';
    tags: string;
}

const INITIAL_DRAFT: DraftState = {
    name: '',
    description: '',
    brandKitId: '',
    status: 'active',
    tags: '',
};

function formatDate(value?: string | number | Date | null) {
    if (!value) return '未更新';
    return new Date(value).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
}

function parseTags(value: string) {
    const tags = value.split(',').map((tag) => tag.trim()).filter(Boolean);
    return tags.length > 0 ? tags : null;
}

function toDraft(item: ProjectItem): DraftState {
    return {
        name: item.name ?? '',
        description: item.description ?? '',
        brandKitId: item.brandKitId ?? '',
        status: item.status === 'archived' ? 'archived' : 'active',
        tags: (item.tags ?? []).join(', '),
    };
}

export default function ProjectsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<ProjectItem[]>([]);
    const [brandKits, setBrandKits] = useState<BrandKitOption[]>([]);
    const [draft, setDraft] = useState<DraftState>(INITIAL_DRAFT);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortKey, setSortKey] = useState<'recent' | 'usage' | 'name'>('recent');
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [authLoading, router, user]);

    useEffect(() => {
        if (!user) return;

        const fetchItems = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [projectsResponse, brandKitsResponse] = await Promise.all([
                    fetch('/api/projects', { cache: 'no-store' }),
                    fetch('/api/brand-kits', { cache: 'no-store' }),
                ]);
                const [projectsData, brandKitsData] = await Promise.all([
                    projectsResponse.json(),
                    brandKitsResponse.json(),
                ]);

                if (!projectsResponse.ok) {
                    throw new Error(projectsData.error || 'プロジェクトの取得に失敗しました');
                }
                if (!brandKitsResponse.ok) {
                    throw new Error(brandKitsData.error || 'ブランドキットの取得に失敗しました');
                }

                setItems(Array.isArray(projectsData.items) ? projectsData.items : []);
                setBrandKits(Array.isArray(brandKitsData.items) ? brandKitsData.items : []);
            } catch (fetchError) {
                setError(fetchError instanceof Error ? fetchError.message : 'ワークスペース情報の取得に失敗しました');
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();
    }, [user]);

    const brandKitMap = useMemo(() => new Map(brandKits.map((item) => [item.id, item.name])), [brandKits]);

    const sortedItems = useMemo(() => {
        return [...items].sort((left, right) => {
            const leftStatusScore = left.status === 'archived' ? 1 : 0;
            const rightStatusScore = right.status === 'archived' ? 1 : 0;

            if (leftStatusScore !== rightStatusScore) {
                return leftStatusScore - rightStatusScore;
            }

            if (sortKey === 'usage') {
                return (right.usageCount ?? 0) - (left.usageCount ?? 0);
            }

            if (sortKey === 'name') {
                return left.name.localeCompare(right.name, 'ja');
            }

            return new Date(right.lastGeneratedAt || right.updatedAt || 0).getTime()
                - new Date(left.lastGeneratedAt || left.updatedAt || 0).getTime();
        });
    }, [items, sortKey]);

    const filteredItems = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        if (statusFilter === 'all') {
            return sortedItems.filter((item) => {
                if (!normalizedQuery) {
                    return true;
                }

                const searchTargets = [
                    item.name,
                    item.description,
                    brandKitMap.get(item.brandKitId || ''),
                    ...(item.tags ?? []),
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();

                return searchTargets.includes(normalizedQuery);
            });
        }

        return sortedItems.filter((item) => {
            const currentStatus = item.status === 'archived' ? 'archived' : 'active';
            if (currentStatus !== statusFilter) {
                return false;
            }

            if (!normalizedQuery) {
                return true;
            }

            const searchTargets = [
                item.name,
                item.description,
                brandKitMap.get(item.brandKitId || ''),
                ...(item.tags ?? []),
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return searchTargets.includes(normalizedQuery);
        });
    }, [brandKitMap, searchQuery, sortedItems, statusFilter]);

    const resetForm = () => {
        setEditingId(null);
        setDraft(INITIAL_DRAFT);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const payload = {
                name: draft.name,
                description: draft.description || null,
                brandKitId: draft.brandKitId || null,
                status: draft.status,
                tags: parseTags(draft.tags),
            };

            const response = await fetch(editingId ? `/api/projects/${editingId}` : '/api/projects', {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'プロジェクトの保存に失敗しました');
            }

            const nextItem = data.item as ProjectItem;
            setItems((current) => {
                if (!editingId) return [nextItem, ...current];
                return current.map((item) => (item.id === nextItem.id ? nextItem : item));
            });
            resetForm();
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'プロジェクトの保存に失敗しました');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        const target = items.find((item) => item.id === id);
        if (!target || !window.confirm(`「${target.name}」を削除しますか？`)) return;

        setDeletingId(id);
        setError(null);
        try {
            const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'プロジェクトの削除に失敗しました');
            }
            setItems((current) => current.filter((item) => item.id !== id));
            if (editingId === id) resetForm();
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : 'プロジェクトの削除に失敗しました');
        } finally {
            setDeletingId(null);
        }
    };

    const toggleProjectSelection = (id: string) => {
        setSelectedProjectIds((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        );
    };

    const handleSelectAllVisible = () => {
        const visibleIds = filteredItems.map((item) => item.id);
        const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedProjectIds.includes(id));

        setSelectedProjectIds((current) => {
            if (allSelected) {
                return current.filter((id) => !visibleIds.includes(id));
            }

            return Array.from(new Set([...current, ...visibleIds]));
        });
    };

    const handleBulkArchive = async (nextStatus: 'active' | 'archived') => {
        if (selectedProjectIds.length === 0) return;

        setIsBulkUpdating(true);
        try {
            const targetItems = items.filter((item) => selectedProjectIds.includes(item.id));

            await Promise.all(
                targetItems.map((item) =>
                    fetch(`/api/projects/${item.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: item.name,
                            description: item.description || null,
                            brandKitId: item.brandKitId || null,
                            status: nextStatus,
                            tags: item.tags ?? null,
                        }),
                    }).then(async (response) => {
                        const data = await response.json();
                        if (!response.ok) {
                            throw new Error(data.error || 'プロジェクトの一括更新に失敗しました');
                        }
                        return data.item as ProjectItem;
                    })
                )
            ).then((updatedItems) => {
                const updateMap = new Map(updatedItems.map((item) => [item.id, item]));
                setItems((current) => current.map((item) => updateMap.get(item.id) || item));
            });
        } catch (error) {
            console.error('Bulk archive error:', error);
            alert('一括更新に失敗しました');
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedProjectIds.length === 0) return;
        if (!window.confirm(`選択した ${selectedProjectIds.length} 件のプロジェクトを削除しますか？`)) return;

        setIsBulkUpdating(true);
        try {
            await Promise.all(
                selectedProjectIds.map(async (id) => {
                    const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
                    const data = await response.json().catch(() => ({}));
                    if (!response.ok) {
                        throw new Error(data.error || 'プロジェクトの一括削除に失敗しました');
                    }
                })
            );

            setItems((current) => current.filter((item) => !selectedProjectIds.includes(item.id)));
            setSelectedProjectIds([]);
        } catch (error) {
            console.error('Bulk delete error:', error);
            alert('一括削除に失敗しました');
        } finally {
            setIsBulkUpdating(false);
        }
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50/70 via-white to-violet-50/60">
            <AppHeader />
            <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
                <section className="grid gap-8 overflow-hidden rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_28px_90px_-42px_rgba(37,99,235,0.35)] lg:grid-cols-[1.15fr_0.85fr] sm:p-8">
                    <div>
                        <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-sky-700">
                            PROJECT STUDIO
                        </span>
                        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                            案件単位で素材を束ねて、
                            <span className="block bg-gradient-to-r from-sky-500 via-blue-500 to-violet-600 bg-clip-text text-transparent">
                                派生生成の流れを整える
                            </span>
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                            キャンペーン、商品、媒体ごとに案件を分けておくと、履歴の見返しや複製、派生生成がずっとやりやすくなります。
                        </p>

                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">登録案件</p>
                                <p className="mt-2 text-3xl font-black text-slate-900">{items.length}</p>
                            </div>
                            <div className="rounded-2xl border border-violet-100 bg-violet-50/80 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">接続ブランド</p>
                                <p className="mt-2 text-3xl font-black text-slate-900">{brandKits.length}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">総生成数</p>
                                <p className="mt-2 text-3xl font-black text-slate-900">
                                    {items.reduce((total, item) => total + (item.usageCount ?? 0), 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-100 bg-[linear-gradient(180deg,rgba(59,130,246,0.08),rgba(255,255,255,0.85))] p-5 sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-500">{editingId ? 'プロジェクトを編集' : '新しいプロジェクト'}</p>
                                <h2 className="mt-1 text-xl font-black text-slate-900">{editingId ? '案件情報を更新' : '案件を作成'}</h2>
                            </div>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white"
                                >
                                    新規作成に戻す
                                </button>
                            )}
                        </div>

                        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                            <input
                                value={draft.name}
                                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                                placeholder="プロジェクト名"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                required
                            />
                            <textarea
                                value={draft.description}
                                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                                placeholder="目的、媒体、訴求など"
                                rows={3}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                            />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <select
                                    value={draft.brandKitId}
                                    onChange={(event) => setDraft((current) => ({ ...current, brandKitId: event.target.value }))}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                >
                                    <option value="">ブランドキット未選択</option>
                                    {brandKits.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={draft.status}
                                    onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as 'active' | 'archived' }))}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                >
                                    <option value="active">進行中</option>
                                    <option value="archived">アーカイブ</option>
                                </select>
                            </div>

                            <input
                                value={draft.tags}
                                onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))}
                                placeholder="Meta, 新規獲得, セール"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                            />

                            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSaving ? '保存中...' : editingId ? '更新する' : '作成する'}
                                </button>
                                <Link href="/create" className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">
                                    画像生成へ
                                </Link>
                            </div>
                        </form>
                    </div>
                </section>

                <section className="space-y-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900">保存済みプロジェクト</h2>
                            <p className="mt-1 text-sm text-slate-500">案件ごとに履歴、複製、派生生成を束ねられます。</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <input
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="案件名、タグ、ブランド名で検索"
                                    className="min-w-[260px] rounded-full border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-200/70"
                                />
                                <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                                {[
                                    { id: 'all', label: 'すべて' },
                                    { id: 'active', label: '進行中' },
                                    { id: 'archived', label: 'アーカイブ' },
                                ].map((filter) => (
                                    <button
                                        key={filter.id}
                                        type="button"
                                        onClick={() => setStatusFilter(filter.id as 'all' | 'active' | 'archived')}
                                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                            statusFilter === filter.id
                                                ? 'bg-slate-900 text-white'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                            <select
                                value={sortKey}
                                onChange={(event) => setSortKey(event.target.value as 'recent' | 'usage' | 'name')}
                                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-200/70"
                            >
                                <option value="recent">最終生成が新しい順</option>
                                <option value="usage">生成数が多い順</option>
                                <option value="name">案件名順</option>
                            </select>
                            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
                                {filteredItems.length} 件
                            </span>
                        </div>
                    </div>

                    {filteredItems.length > 0 && (
                        <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white/80 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-3">
                                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={filteredItems.length > 0 && filteredItems.every((item) => selectedProjectIds.includes(item.id))}
                                        onChange={handleSelectAllVisible}
                                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                    />
                                    表示中をすべて選択
                                </label>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                    選択中 {selectedProjectIds.length} 件
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleBulkArchive('active')}
                                    disabled={selectedProjectIds.length === 0 || isBulkUpdating}
                                    className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    進行中に戻す
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleBulkArchive('archived')}
                                    disabled={selectedProjectIds.length === 0 || isBulkUpdating}
                                    className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    アーカイブ
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBulkDelete}
                                    disabled={selectedProjectIds.length === 0 || isBulkUpdating}
                                    className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    選択分を削除
                                </button>
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="h-48 animate-pulse rounded-[26px] border border-white/80 bg-white/70" />
                            ))}
                        </div>
                    ) : (
                        filteredItems.length === 0 ? (
                            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center">
                                <p className="text-lg font-bold text-slate-900">条件に合うプロジェクトはありません</p>
                                <p className="mt-2 text-sm text-slate-500">検索語やフィルタを変えるか、新しい案件を作成してください。</p>
                            </div>
                        ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {filteredItems.map((item) => (
                                <article key={item.id} className="overflow-hidden rounded-[26px] border border-white/80 bg-white/85 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] transition hover:-translate-y-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <label className="mt-1 inline-flex h-5 w-5 items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProjectIds.includes(item.id)}
                                                    onChange={() => toggleProjectSelection(item.id)}
                                                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                                />
                                            </label>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-black text-slate-900">{item.name}</h3>
                                                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${item.status === 'archived' ? 'bg-slate-100 text-slate-500' : 'bg-sky-100 text-sky-700'}`}>
                                                        {item.status === 'archived' ? 'Archived' : 'Active'}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-slate-500">{item.description || '説明なし'}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-slate-400">{formatDate(item.updatedAt || item.createdAt)}</span>
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Linked brand</p>
                                        <p className="mt-2 text-sm font-bold text-slate-900">
                                            {item.brandKitId ? brandKitMap.get(item.brandKitId) || 'ブランド未取得' : '未設定'}
                                        </p>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {(item.tags ?? []).length > 0 ? (
                                            item.tags?.map((tag) => (
                                                <span key={`${item.id}-${tag}`} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                                                    {tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">タグ未設定</span>
                                        )}
                                    </div>

                                    <div className="mt-4 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">生成数</p>
                                            <p className="mt-1 text-lg font-black text-slate-900">{item.usageCount ?? 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">最終生成</p>
                                            <p className="mt-1 text-sm font-bold text-slate-900">{formatDate(item.lastGeneratedAt)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingId(item.id);
                                                setDraft(toDraft(item));
                                                setError(null);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                                        >
                                            編集
                                        </button>
                                        <Link href={`/create?projectId=${encodeURIComponent(item.id)}${item.brandKitId ? `&brandKitId=${encodeURIComponent(item.brandKitId)}` : ''}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
                                            この案件で生成
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(item.id)}
                                            disabled={deletingId === item.id}
                                            className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {deletingId === item.id ? '削除中...' : '削除'}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                        )
                    )}
                </section>
            </main>
        </div>
    );
}
