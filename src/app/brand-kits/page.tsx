'use client';

import { AppHeader } from '@/components/layout/AppHeader';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

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
    updatedAt?: string | number | Date | null;
    usageCount?: number;
    lastGeneratedAt?: string | number | Date | null;
}

interface DraftState {
    name: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    preferredTone: string;
    defaultCopyRules: string;
    negativeRules: string;
    fontPreferences: string;
    isDefault: boolean;
}

const INITIAL_DRAFT: DraftState = {
    name: '',
    description: '',
    primaryColor: '#FF6B35',
    secondaryColor: '#7C3AED',
    accentColor: '#111827',
    preferredTone: '',
    defaultCopyRules: '',
    negativeRules: '',
    fontPreferences: '',
    isDefault: false,
};

function parseLines(value: string) {
    const items = value.split('\n').map((line) => line.trim()).filter(Boolean);
    return items.length > 0 ? items : null;
}

function formatDate(value?: string | number | Date | null) {
    if (!value) return '未更新';
    return new Date(value).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
}

function toDraft(item: BrandKitItem): DraftState {
    return {
        name: item.name ?? '',
        description: item.description ?? '',
        primaryColor: item.primaryColor ?? '#FF6B35',
        secondaryColor: item.secondaryColor ?? '#7C3AED',
        accentColor: item.accentColor ?? '#111827',
        preferredTone: item.preferredTone ?? '',
        defaultCopyRules: item.defaultCopyRules?.join('\n') ?? '',
        negativeRules: item.negativeRules?.join('\n') ?? '',
        fontPreferences: item.fontPreferences?.join('\n') ?? '',
        isDefault: Boolean(item.isDefault),
    };
}

export default function BrandKitsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<BrandKitItem[]>([]);
    const [draft, setDraft] = useState<DraftState>(INITIAL_DRAFT);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortKey, setSortKey] = useState<'default' | 'recent' | 'usage'>('default');

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
                const response = await fetch('/api/brand-kits', { cache: 'no-store' });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'ブランドキットの取得に失敗しました');
                }
                setItems(Array.isArray(data.items) ? data.items : []);
            } catch (fetchError) {
                setError(fetchError instanceof Error ? fetchError.message : 'ブランドキットの取得に失敗しました');
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();
    }, [user]);

    const resetForm = () => {
        setEditingId(null);
        setDraft(INITIAL_DRAFT);
    };

    const filteredItems = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const filtered = items.filter((item) => {
            if (!normalizedQuery) {
                return true;
            }

            const searchTargets = [
                item.name,
                item.description,
                item.preferredTone,
                ...(item.defaultCopyRules ?? []),
                ...(item.negativeRules ?? []),
                ...(item.fontPreferences ?? []),
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return searchTargets.includes(normalizedQuery);
        });

        return filtered.sort((left, right) => {
            if (sortKey === 'usage') {
                return (right.usageCount ?? 0) - (left.usageCount ?? 0);
            }

            if (sortKey === 'recent') {
                return new Date(right.lastGeneratedAt || right.updatedAt || 0).getTime()
                    - new Date(left.lastGeneratedAt || left.updatedAt || 0).getTime();
            }

            const defaultScore = Number(Boolean(right.isDefault)) - Number(Boolean(left.isDefault));
            if (defaultScore !== 0) {
                return defaultScore;
            }

            return new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime();
        });
    }, [items, searchQuery, sortKey]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const payload = {
                name: draft.name,
                description: draft.description || null,
                primaryColor: draft.primaryColor || null,
                secondaryColor: draft.secondaryColor || null,
                accentColor: draft.accentColor || null,
                preferredTone: draft.preferredTone || null,
                defaultCopyRules: parseLines(draft.defaultCopyRules),
                negativeRules: parseLines(draft.negativeRules),
                fontPreferences: parseLines(draft.fontPreferences),
                isDefault: draft.isDefault,
            };

            const response = await fetch(editingId ? `/api/brand-kits/${editingId}` : '/api/brand-kits', {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'ブランドキットの保存に失敗しました');
            }

            const nextItem = data.item as BrandKitItem;
            setItems((current) => {
                const merged = editingId
                    ? current.map((item) => (item.id === nextItem.id ? nextItem : item))
                    : [nextItem, ...current];

                if (!nextItem.isDefault) return merged;

                return merged.map((item) => ({
                    ...item,
                    isDefault: item.id === nextItem.id,
                }));
            });
            resetForm();
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'ブランドキットの保存に失敗しました');
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
            const response = await fetch(`/api/brand-kits/${id}`, { method: 'DELETE' });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'ブランドキットの削除に失敗しました');
            }

            setItems((current) => current.filter((item) => item.id !== id));
            if (editingId === id) resetForm();
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : 'ブランドキットの削除に失敗しました');
        } finally {
            setDeletingId(null);
        }
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/70 via-white to-fuchsia-50/70">
            <AppHeader />
            <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
                <section className="grid gap-8 overflow-hidden rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_-36px_rgba(124,58,237,0.35)] lg:grid-cols-[1.15fr_0.85fr] sm:p-8">
                    <div>
                        <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-orange-700">
                            BRAND WORKSPACE
                        </span>
                        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                            ブランドの軸を登録して、
                            <span className="block bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 bg-clip-text text-transparent">
                                生成のブレを減らす
                            </span>
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                            色、トーン、禁止表現、コピー規則を先にまとめておくと、画像生成や派生生成の品質が安定します。
                        </p>

                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">登録数</p>
                                <p className="mt-2 text-3xl font-black text-slate-900">{items.length}</p>
                            </div>
                            <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50/70 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-700">標準ブランド</p>
                                <p className="mt-2 text-lg font-black text-slate-900">
                                    {items.find((item) => item.isDefault)?.name ?? '未設定'}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">総利用回数</p>
                                <p className="mt-2 text-3xl font-black text-slate-900">
                                    {items.reduce((total, item) => total + (item.usageCount ?? 0), 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-100 bg-[linear-gradient(180deg,rgba(124,58,237,0.08),rgba(255,255,255,0.85))] p-5 sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-500">{editingId ? 'ブランドキットを編集' : '新しいブランドキット'}</p>
                                <h2 className="mt-1 text-xl font-black text-slate-900">{editingId ? 'ルールを更新' : '生成ルールを登録'}</h2>
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
                                placeholder="ブランド名"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-100"
                                required
                            />
                            <textarea
                                value={draft.description}
                                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                                placeholder="ブランドの特徴"
                                rows={3}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-100"
                            />

                            <div className="grid gap-3 sm:grid-cols-3">
                                {[
                                    { key: 'primaryColor', label: '主色' },
                                    { key: 'secondaryColor', label: '副色' },
                                    { key: 'accentColor', label: 'アクセント' },
                                ].map((field) => (
                                    <label key={field.key} className="rounded-2xl border border-slate-200 bg-white p-3">
                                        <span className="mb-2 block text-sm font-semibold text-slate-700">{field.label}</span>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={draft[field.key as keyof DraftState] as string}
                                                onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                                                className="h-10 w-12 rounded-xl border border-slate-200"
                                            />
                                            <input
                                                value={draft[field.key as keyof DraftState] as string}
                                                onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-100"
                                            />
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <input
                                value={draft.preferredTone}
                                onChange={(event) => setDraft((current) => ({ ...current, preferredTone: event.target.value }))}
                                placeholder="推奨トーン"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-100"
                            />
                            <textarea
                                value={draft.defaultCopyRules}
                                onChange={(event) => setDraft((current) => ({ ...current, defaultCopyRules: event.target.value }))}
                                placeholder="コピー規則を1行ずつ"
                                rows={3}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-100"
                            />
                            <textarea
                                value={draft.negativeRules}
                                onChange={(event) => setDraft((current) => ({ ...current, negativeRules: event.target.value }))}
                                placeholder="禁止表現を1行ずつ"
                                rows={3}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-100"
                            />
                            <textarea
                                value={draft.fontPreferences}
                                onChange={(event) => setDraft((current) => ({ ...current, fontPreferences: event.target.value }))}
                                placeholder="フォント指針を1行ずつ"
                                rows={2}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-100"
                            />

                            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={draft.isDefault}
                                    onChange={(event) => setDraft((current) => ({ ...current, isDefault: event.target.checked }))}
                                    className="h-4 w-4 rounded border-slate-300 text-fuchsia-600 focus:ring-fuchsia-500"
                                />
                                このブランドキットを既定値として使う
                            </label>

                            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSaving ? '保存中...' : editingId ? '更新する' : '作成する'}
                                </button>
                                <Link href="/create" className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-fuchsia-200 hover:bg-fuchsia-50 hover:text-fuchsia-700">
                                    画像生成へ
                                </Link>
                            </div>
                        </form>
                    </div>
                </section>

                <section className="space-y-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900">保存済みブランドキット</h2>
                            <p className="mt-1 text-sm text-slate-500">複数ブランドや商品ごとに使い分けられます。</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <input
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="ブランド名、ルール、トーンで検索"
                                    className="min-w-[260px] rounded-full border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-200/70"
                                />
                                <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <select
                                value={sortKey}
                                onChange={(event) => setSortKey(event.target.value as 'default' | 'recent' | 'usage')}
                                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-200/70"
                            >
                                <option value="default">既定値優先</option>
                                <option value="recent">最終利用が新しい順</option>
                                <option value="usage">利用回数が多い順</option>
                            </select>
                            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">{filteredItems.length} 件</span>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="h-52 animate-pulse rounded-[26px] border border-white/80 bg-white/70" />
                            ))}
                        </div>
                    ) : (
                        filteredItems.length === 0 ? (
                            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center">
                                <p className="text-lg font-bold text-slate-900">条件に合うブランドキットはありません</p>
                                <p className="mt-2 text-sm text-slate-500">検索語や並び順を変えるか、新しいブランドキットを作成してください。</p>
                            </div>
                        ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {filteredItems.map((item) => (
                                <article key={item.id} className="overflow-hidden rounded-[26px] border border-white/80 bg-white/85 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] transition hover:-translate-y-1">
                                    <div
                                        className="h-24 w-full"
                                        style={{ background: `linear-gradient(135deg, ${item.primaryColor || '#FF6B35'} 0%, ${item.secondaryColor || '#7C3AED'} 55%, ${item.accentColor || '#111827'} 100%)` }}
                                    />
                                    <div className="space-y-4 p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-black text-slate-900">{item.name}</h3>
                                                    {item.isDefault && <span className="rounded-full bg-fuchsia-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-700">Default</span>}
                                                </div>
                                                <p className="mt-1 text-sm text-slate-500">{item.description || '説明なし'}</p>
                                            </div>
                                            <span className="text-xs font-medium text-slate-400">{formatDate(item.updatedAt)}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {item.preferredTone && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.preferredTone}</span>}
                                            {(item.defaultCopyRules || []).slice(0, 2).map((rule) => (
                                                <span key={rule} className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">{rule}</span>
                                            ))}
                                        </div>

                                        <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:grid-cols-2">
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">利用回数</p>
                                                <p className="mt-1 text-lg font-black text-slate-900">{item.usageCount ?? 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">最終利用</p>
                                                <p className="mt-1 text-sm font-bold text-slate-900">{formatDate(item.lastGeneratedAt)}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingId(item.id);
                                                    setDraft(toDraft(item));
                                                    setError(null);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-fuchsia-200 hover:bg-fuchsia-50 hover:text-fuchsia-700"
                                            >
                                                編集
                                            </button>
                                            <Link href={`/create?brandKitId=${encodeURIComponent(item.id)}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-700">
                                                このブランドで生成
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
