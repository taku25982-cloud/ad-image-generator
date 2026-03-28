'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { AppHeader } from '@/components/layout/AppHeader';
import {
    getPerformanceScore,
    INDUSTRY_OPTIONS,
    scoreTemplateForQuery,
    TEMPLATE_CATALOG,
    USE_CASE_LABELS,
    USE_CASE_OPTIONS,
    type EnrichedAdTemplate,
    type TemplateLibraryStats,
} from '@/lib/template-catalog';
import {
    getTemplateLibraryState,
    syncTemplateLibraryState,
    toggleFavoriteTemplateSync,
    trackTemplateEvent,
} from '@/lib/template-library';

const TONE_LABELS: Record<string, string> = {
    bold: '力強くて目立つ',
    modern: 'モダン・スタイリッシュ',
    minimal: 'シンプル・ミニマル',
    warm: '温かみがある',
    pop: 'ポップ・カジュアル',
    clean: '清潔感',
    professional: 'プロフェッショナル',
    elegant: '上品・エレガント',
    friendly: '親しみやすい',
    luxury: '高級感',
    energetic: '活発・エネルギッシュ',
    trustworthy: '誠実・安心感',
    natural: '自然・オーガニック',
    cute: 'かわいく親しみやすい',
};

type CollectionFilter = 'all' | 'favorites' | 'recent';
type SortMode = 'recommended' | 'popular' | 'favorite' | 'performance' | 'latest';

const COLLECTION_FILTER_OPTIONS: Array<{ value: CollectionFilter; label: string; description: string }> = [
    { value: 'all', label: 'すべて', description: '全テンプレートを横断して比較' },
    { value: 'favorites', label: 'お気に入り', description: '再利用したい候補だけ表示' },
    { value: 'recent', label: '最近使った', description: '直近の検討履歴から再開' },
];

const SORT_MODE_OPTIONS: Array<{ value: SortMode; label: string; description: string }> = [
    { value: 'recommended', label: 'おすすめ順', description: '検索意図と使いやすさを総合評価' },
    { value: 'performance', label: '成果順', description: '利用実績と編集耐性を優先' },
    { value: 'popular', label: '人気順', description: 'よく選ばれている定番から確認' },
    { value: 'favorite', label: 'お気に入り優先', description: '保存済みテンプレを先頭に表示' },
];

function TemplateCard({
    template,
    stats,
    isFavorite,
    onToggleFavorite,
    onOpen,
}: {
    template: EnrichedAdTemplate;
    stats?: TemplateLibraryStats;
    isFavorite: boolean;
    onToggleFavorite: (template: EnrichedAdTemplate) => void;
    onOpen: (template: EnrichedAdTemplate) => void;
}) {
    const primaryUseCase = template.useCases[0] ? USE_CASE_LABELS[template.useCases[0]] : 'テンプレート';
    const performanceScore = getPerformanceScore(template, stats);

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onOpen(template)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpen(template);
                }
            }}
            className="group relative overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,249,245,0.92))] text-left shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-white/70 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_75px_rgba(15,23,42,0.14)]"
        >
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative h-52 overflow-hidden bg-gradient-to-br from-orange-100 via-white to-purple-100">
                <Image
                    src={template.thumbnail}
                    alt={template.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.02)_28%,rgba(69,26,3,0.18)_60%,rgba(88,28,135,0.46)_100%)]" />
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/30 to-transparent" />
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/50 bg-white/90 px-3 py-1 text-[10px] font-black tracking-[0.16em] text-fuchsia-700 shadow-sm">
                        {primaryUseCase}
                    </span>
                    {template.popular && (
                        <span className="rounded-full border border-orange-300/60 bg-orange-500 px-3 py-1 text-[10px] font-black tracking-[0.16em] text-white shadow-sm">
                            人気
                        </span>
                    )}
                </div>
                <button
                    onClick={(event) => {
                        event.stopPropagation();
                        onToggleFavorite(template);
                    }}
                    className={`absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-all ${
                        isFavorite
                            ? 'border-yellow-200 bg-yellow-50 text-yellow-500'
                            : 'border-white/40 bg-white/85 text-gray-400 hover:text-yellow-500'
                    }`}
                    aria-label="お気に入りに追加"
                >
                    <svg className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.12 3.442a1 1 0 00.95.69h3.62c.969 0 1.371 1.24.588 1.81l-2.93 2.13a1 1 0 00-.364 1.118l1.12 3.442c.3.921-.755 1.688-1.54 1.118l-2.93-2.13a1 1 0 00-1.176 0l-2.93 2.13c-.784.57-1.838-.197-1.539-1.118l1.12-3.442a1 1 0 00-.364-1.118l-2.93-2.13c-.783-.57-.38-1.81.588-1.81h3.62a1 1 0 00.95-.69l1.12-3.442z" />
                    </svg>
                </button>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <p className="text-xl font-black leading-tight drop-shadow-sm">{template.name}</p>
                            <p className="mt-1 text-xs font-medium text-white/80">{template.industries.slice(0, 2).join(' / ')}</p>
                        </div>
                        <div className="rounded-2xl border border-white/20 bg-white/15 px-3 py-2 text-right backdrop-blur-md">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">Edit</p>
                            <p className="text-sm font-semibold">{template.editProfile.score}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">{template.description}</p>
                    <div className="shrink-0 rounded-2xl border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-500">Score</p>
                        <p className="text-sm font-black text-emerald-700">{performanceScore}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {template.useCases.slice(0, 2).map((useCase) => (
                        <span key={useCase} className="rounded-full border border-fuchsia-100 bg-fuchsia-50 px-3 py-1 text-[11px] font-semibold text-fuchsia-700">
                            {USE_CASE_LABELS[useCase]}
                        </span>
                    ))}
                    {template.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-[11px] font-medium text-stone-600">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-3 rounded-[22px] border border-stone-200/80 bg-stone-50/90 p-3 text-xs text-stone-500">
                    <div>
                        <p className="mb-1 font-black tracking-[0.14em] text-stone-400">テイスト</p>
                        <p className="font-semibold text-stone-800">{TONE_LABELS[template.presets.tone] || '標準'}</p>
                    </div>
                    <div>
                        <p className="mb-1 font-black tracking-[0.14em] text-stone-400">対応サイズ</p>
                        <p className="font-semibold text-stone-800">{template.supportedFormats.length}種</p>
                    </div>
                    <div>
                        <p className="mb-1 font-black tracking-[0.14em] text-stone-400">編集耐性</p>
                        <p className="font-semibold text-stone-800">{template.editProfile.label}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TemplatesPage() {
    const { userDoc } = useAuth();
    const router = useRouter();
    const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>('all');
    const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
    const [selectedUseCase, setSelectedUseCase] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState<SortMode>('recommended');
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [recentIds, setRecentIds] = useState<string[]>([]);
    const [stats, setStats] = useState<Record<string, TemplateLibraryStats>>({});
    const [selectedTemplate, setSelectedTemplate] = useState<EnrichedAdTemplate | null>(null);
    const [selectedFormats, setSelectedFormats] = useState<string[]>([]);

    const refreshLibraryState = async () => {
        const state = await syncTemplateLibraryState();
        setFavoriteIds(state.favoriteIds);
        setRecentIds(state.recentIds);
        setStats(state.stats);
    };

    useEffect(() => {
        const localState = getTemplateLibraryState();
        setFavoriteIds(localState.favoriteIds);
        setRecentIds(localState.recentIds);
        setStats(localState.stats);
        void refreshLibraryState();
    }, []);

    const allTemplates = useMemo(() => TEMPLATE_CATALOG, []);
    const collectionTemplates = useMemo(() => {
        switch (collectionFilter) {
            case 'favorites':
                return allTemplates.filter((template) => favoriteIds.includes(template.id));
            case 'recent':
                return recentIds
                    .map((id) => allTemplates.find((template) => template.id === id))
                    .filter(Boolean) as EnrichedAdTemplate[];
            default:
                return allTemplates;
        }
    }, [allTemplates, collectionFilter, favoriteIds, recentIds]);

    const filteredTemplates = useMemo(() => {
        let templates = collectionTemplates.filter((template) => {
            if (selectedIndustry !== 'all' && !template.industries.includes(selectedIndustry)) {
                return false;
            }
            if (selectedUseCase !== 'all' && !template.useCases.includes(selectedUseCase as keyof typeof USE_CASE_LABELS)) {
                return false;
            }
            return true;
        });

        if (searchQuery.trim()) {
            templates = templates.filter((template) => scoreTemplateForQuery(template, searchQuery) > template.performanceSeed);
        }

        return [...templates].sort((a, b) => {
            if (sortMode === 'latest') {
                return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
            }
            if (sortMode === 'favorite') {
                return Number(favoriteIds.includes(b.id)) - Number(favoriteIds.includes(a.id));
            }
            if (sortMode === 'popular') {
                return Number(Boolean(b.popular)) - Number(Boolean(a.popular));
            }
            if (sortMode === 'performance') {
                return getPerformanceScore(b, stats[b.id]) - getPerformanceScore(a, stats[a.id]);
            }
            return scoreTemplateForQuery(b, searchQuery) - scoreTemplateForQuery(a, searchQuery);
        });
    }, [collectionTemplates, favoriteIds, searchQuery, selectedIndustry, selectedUseCase, sortMode, stats]);

    const recommendedTemplates = useMemo(
        () => [...allTemplates].sort((a, b) => getPerformanceScore(b, stats[b.id]) - getPerformanceScore(a, stats[a.id])).slice(0, 4),
        [allTemplates, stats]
    );
    const heroTemplate = recommendedTemplates[0] ?? filteredTemplates[0] ?? allTemplates[0];
    const activeFilterCount = [collectionFilter !== 'all', selectedIndustry !== 'all', selectedUseCase !== 'all', searchQuery.trim().length > 0].filter(Boolean).length;
    const activeFilterLabels = [
        collectionFilter !== 'all' ? COLLECTION_FILTER_OPTIONS.find((item) => item.value === collectionFilter)?.label : null,
        selectedIndustry !== 'all' ? selectedIndustry : null,
        selectedUseCase !== 'all' ? USE_CASE_LABELS[selectedUseCase as keyof typeof USE_CASE_LABELS] : null,
        searchQuery.trim() ? `検索: ${searchQuery.trim()}` : null,
    ].filter(Boolean) as string[];

    const resetFilters = () => {
        setCollectionFilter('all');
        setSelectedIndustry('all');
        setSelectedUseCase('all');
        setSearchQuery('');
        setSortMode('recommended');
    };

    const openTemplate = async (template: EnrichedAdTemplate) => {
        setSelectedTemplate(template);
        setSelectedFormats(template.supportedFormats.slice(0, 3));
        await trackTemplateEvent(template.id, 'open');
        await refreshLibraryState();
    };

    const handleToggleFavorite = async (template: EnrichedAdTemplate) => {
        await toggleFavoriteTemplateSync(template.id);
        await refreshLibraryState();
    };

    const handleProceedToCreate = (template: EnrichedAdTemplate) => {
        const primaryFormat = selectedFormats[0] || template.format;
        const params = new URLSearchParams({
            templateId: template.id,
            templateFormat: primaryFormat,
            formatBundle: selectedFormats.join(','),
        });
        void trackTemplateEvent(template.id, 'open');
        router.push(`/create?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.16),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(217,119,6,0.10),_transparent_34%),linear-gradient(180deg,_#f6efe7_0%,_#fbf8f2_36%,_#f6f1ee_100%)]">
            <AppHeader />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <section className="mb-10">
                    <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(255,248,241,0.88)_48%,rgba(255,255,255,0.72))] px-6 py-6 shadow-[0_30px_80px_rgba(75,39,19,0.10)] ring-1 ring-white/60 backdrop-blur-xl sm:px-8 sm:py-8">
                        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-orange-300/25 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 left-8 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />
                        <div className="pointer-events-none absolute inset-y-6 right-[18%] hidden w-px bg-gradient-to-b from-transparent via-stone-300/60 to-transparent lg:block" />

                        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-end">
                            <div className="max-w-3xl">
                                <p className="mb-3 text-xs font-black uppercase tracking-[0.34em] text-orange-600">Template Atelier</p>
                                <h1 className="text-4xl font-black tracking-tight text-stone-900 md:text-5xl">
                                    探して終わりではなく、
                                    <span className="block bg-[linear-gradient(135deg,#c2410c_0%,#ea580c_30%,#c026d3_100%)] bg-clip-text text-transparent">
                                        仕上がりまで想像できるテンプレ選びへ
                                    </span>
                                </h1>
                                <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600 md:text-lg">
                                    業種、使う場面、編集しやすさ、成果の見込みを一画面で比較。使いやすいテンプレートを素早く選べます。
                                </p>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <div className="rounded-full border border-stone-200 bg-white/75 px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm">
                                        {filteredTemplates.length}件を比較中
                                    </div>
                                    <div className="rounded-full border border-orange-200 bg-orange-50/90 px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm">
                                        アクティブ条件 {activeFilterCount}件
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {heroTemplate && (
                                    <div className="relative overflow-hidden rounded-[30px] border border-orange-100/80 bg-[linear-gradient(135deg,rgba(255,247,237,0.98),rgba(255,255,255,0.94)_38%,rgba(250,245,255,0.96)_100%)] p-5 text-stone-900 shadow-[0_20px_60px_rgba(168,85,247,0.10)] ring-1 ring-white/70">
                                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.24),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.18),transparent_42%)]" />
                                        <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-orange-200/40 blur-2xl" />
                                        <p className="relative text-[11px] font-black uppercase tracking-[0.24em] text-orange-500">Featured Pick</p>
                                        <h2 className="relative mt-3 text-2xl font-black leading-tight text-stone-900">{heroTemplate.name}</h2>
                                        <p className="relative mt-2 text-sm leading-relaxed text-stone-600">{heroTemplate.description}</p>
                                        <div className="relative mt-4 flex flex-wrap gap-2">
                                            {heroTemplate.useCases.slice(0, 2).map((useCase) => (
                                                <span key={useCase} className="rounded-full border border-orange-100 bg-white/85 px-3 py-1 text-[11px] font-semibold text-purple-700 shadow-sm">
                                                    {USE_CASE_LABELS[useCase]}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="relative mt-5 grid grid-cols-3 gap-3">
                                            <div className="rounded-2xl border border-orange-100 bg-white/70 px-3 py-3 shadow-sm">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-400">Score</p>
                                                <p className="mt-2 text-lg font-black text-stone-900">{getPerformanceScore(heroTemplate, stats[heroTemplate.id])}</p>
                                            </div>
                                            <div className="rounded-2xl border border-purple-100 bg-white/70 px-3 py-3 shadow-sm">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-400">Formats</p>
                                                <p className="mt-2 text-lg font-black text-stone-900">{heroTemplate.supportedFormats.length}</p>
                                            </div>
                                            <div className="rounded-2xl border border-fuchsia-100 bg-white/70 px-3 py-3 shadow-sm">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-400">Edit</p>
                                                <p className="mt-2 text-sm font-black text-stone-900">{heroTemplate.editProfile.label}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {[
                                        { label: '業種軸', value: `${INDUSTRY_OPTIONS.length}カテゴリ` },
                                        { label: '場面タグ', value: `${USE_CASE_OPTIONS.length}種類` },
                                        { label: '最近使った', value: `${recentIds.length}件` },
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-[24px] border border-stone-200/80 bg-white/82 px-4 py-3 shadow-sm">
                                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-400">{item.label}</p>
                                            <p className="mt-1 text-lg font-black text-stone-900">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-8 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                    <div className="rounded-[30px] border border-stone-200/80 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-100 text-fuchsia-700 shadow-sm">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-bold text-stone-900">自然文で探す</h2>
                                <p className="text-sm text-stone-500">例: 飲食向け、赤系、セール感強め、文字差し替えしやすい</p>
                            </div>
                        </div>
                        <div className="rounded-[26px] border border-stone-200 bg-[linear-gradient(180deg,rgba(250,250,249,0.9),rgba(255,255,255,1))] p-3">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="テンプレートを自然文で検索..."
                                className="h-13 w-full rounded-2xl border border-stone-200 bg-white/90 px-4 text-stone-900 outline-none transition-all focus:border-fuchsia-400 focus:bg-white focus:ring-4 focus:ring-fuchsia-100"
                            />
                            <div className="mt-3 flex flex-wrap gap-2">
                                {['セール感を出したい', '高級感のある訴求', '文字差し替えしやすい', '飲食向けで暖色系'].map((prompt) => (
                                    <button
                                        key={prompt}
                                        onClick={() => setSearchQuery(prompt)}
                                        className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:border-stone-300 hover:bg-white"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[30px] border border-stone-200/80 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                        <p className="mb-3 text-sm font-bold text-stone-900">並び替え</p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {SORT_MODE_OPTIONS.map((item) => (
                                <button
                                    key={item.value}
                                    onClick={() => setSortMode(item.value)}
                                    className={`rounded-[22px] border px-4 py-3 text-left transition-all ${
                                        sortMode === item.value
                                            ? 'border-fuchsia-200 bg-[linear-gradient(135deg,#fff0fb,#fff7ed)] text-stone-900 shadow-sm'
                                            : 'border-stone-200 bg-stone-50/70 text-stone-600 hover:border-stone-300 hover:bg-white'
                                    }`}
                                >
                                    <p className="text-sm font-bold">{item.label}</p>
                                    <p className="mt-1 text-xs opacity-75">{item.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mb-8 rounded-[32px] border border-stone-200/80 bg-white/88 p-5 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
                    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-stone-400">Refine</p>
                            <h2 className="mt-2 text-2xl font-black text-stone-900">候補を絞り込んで、比較しやすい状態をつくる</h2>
                        </div>
                        {activeFilterLabels.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                {activeFilterLabels.map((label) => (
                                    <span key={label} className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600">
                                        {label}
                                    </span>
                                ))}
                                <button
                                    onClick={resetFilters}
                                    className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 transition hover:bg-orange-100"
                                >
                                    条件をリセット
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
                    <div>
                        <p className="mb-3 text-sm font-bold text-stone-900">表示コレクション</p>
                        <div className="flex flex-wrap gap-2">
                            {COLLECTION_FILTER_OPTIONS.map((item) => (
                                <button
                                    key={item.value}
                                    onClick={() => setCollectionFilter(item.value)}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                                        collectionFilter === item.value
                                            ? 'bg-stone-900 text-white shadow-sm'
                                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                    }`}
                                    title={item.description}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="mb-3 text-sm font-bold text-stone-900">業種</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedIndustry('all')}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedIndustry === 'all' ? 'bg-fuchsia-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                            >
                                すべて
                            </button>
                            {INDUSTRY_OPTIONS.slice(0, 8).map((industry) => (
                                <button
                                    key={industry}
                                    onClick={() => setSelectedIndustry(industry)}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedIndustry === industry ? 'bg-fuchsia-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                                >
                                    {industry}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="mb-3 text-sm font-bold text-stone-900">使う場面</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedUseCase('all')}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedUseCase === 'all' ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                            >
                                すべて
                            </button>
                            {USE_CASE_OPTIONS.slice(0, 6).map((useCase) => (
                                <button
                                    key={useCase.id}
                                    onClick={() => setSelectedUseCase(useCase.id)}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedUseCase === useCase.id ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                                >
                                    {useCase.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    </div>
                </section>

                {collectionFilter === 'all' && recommendedTemplates.length > 0 && (
                    <section className="mb-10">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-stone-900">おすすめテンプレート</h2>
                                <p className="text-sm text-stone-500">人気・利用実績・編集しやすさをまとめて見たおすすめです。</p>
                            </div>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            {recommendedTemplates.map((template) => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    stats={stats[template.id]}
                                    isFavorite={favoriteIds.includes(template.id)}
                                    onToggleFavorite={handleToggleFavorite}
                                    onOpen={openTemplate}
                                />
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-stone-900">テンプレート一覧</h2>
                            <p className="text-sm text-stone-500">{filteredTemplates.length}件のテンプレートが見つかりました。</p>
                        </div>
                        <div className="rounded-[24px] border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-600 shadow-sm">
                            {filteredTemplates.length > 0
                                ? `上位候補は「${filteredTemplates[0]?.name ?? 'テンプレート'}」。クリックすると詳細を確認できます。`
                                : '条件を少し広げると、比較できる候補が増えます。'}
                        </div>
                    </div>
                    {filteredTemplates.length === 0 ? (
                        <div className="rounded-[28px] border border-dashed border-stone-300 bg-white/80 p-16 text-center">
                            <p className="text-lg font-bold text-stone-900">条件に合うテンプレートがありません</p>
                            <p className="mt-2 text-sm text-stone-500">検索語やフィルタを少し広げると見つけやすくなります。</p>
                            <button
                                onClick={resetFilters}
                                className="mt-5 rounded-full border border-orange-200 bg-orange-50 px-5 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-100"
                            >
                                条件をリセット
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredTemplates.map((template) => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    stats={stats[template.id]}
                                    isFavorite={favoriteIds.includes(template.id)}
                                    onToggleFavorite={handleToggleFavorite}
                                    onOpen={openTemplate}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {selectedTemplate && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                        onClick={() => setSelectedTemplate(null)}
                    >
                        <div
                            className="flex max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-2xl"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="flex flex-1 flex-col overflow-hidden">
                                <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-500">Template Detail</p>
                                        <h3 className="mt-2 text-2xl font-black text-gray-900">{selectedTemplate.name}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-gray-500">{selectedTemplate.description}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTemplate(null)}
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 text-gray-500 transition hover:bg-gray-50"
                                        aria-label="閉じる"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto px-6 py-6">
                                    <div className="space-y-6">
                                        <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-gray-100 bg-gray-50 shadow-sm">
                                            <Image
                                                src={selectedTemplate.thumbnail}
                                                alt={selectedTemplate.name}
                                                fill
                                                sizes="(max-width: 1280px) 100vw, 900px"
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
                                                    {selectedTemplate.industries.join(' / ')}
                                                </p>
                                                <p className="mt-2 text-2xl font-black">{selectedTemplate.name}</p>
                                            </div>
                                        </div>

                                        <section className="rounded-[28px] border border-stone-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,250,249,0.96))] p-6 shadow-sm">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {selectedTemplate.useCases.map((useCase) => (
                                                    <span key={useCase} className="rounded-full border border-fuchsia-100 bg-fuchsia-50 px-3 py-1 text-[11px] font-semibold text-fuchsia-700">
                                                        {USE_CASE_LABELS[useCase]}
                                                    </span>
                                                ))}
                                                <span className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-[11px] font-semibold text-stone-600">
                                                    {selectedTemplate.supportedFormats.length}サイズ対応
                                                </span>
                                            </div>

                                            <div className="mt-5 space-y-5">
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-400">概要</p>
                                                    <p className="mt-2 text-base leading-relaxed text-stone-700">{selectedTemplate.description}</p>
                                                </div>

                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
                                                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-400">キャッチコピー</p>
                                                        <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-900">{selectedTemplate.presets.catchCopy}</p>
                                                    </div>
                                                    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
                                                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-400">ターゲット</p>
                                                        <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-900">
                                                            {selectedTemplate.presets.targetAudience || '幅広いターゲットに対応'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-400">カスタム指示</p>
                                                    <div className="mt-2 rounded-[22px] border border-stone-200 bg-stone-50/90 p-4">
                                                        <p className="whitespace-pre-wrap text-sm leading-7 text-stone-700">
                                                            {selectedTemplate.customInstructions}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 bg-gray-50/70 px-6 py-5">
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <button
                                            onClick={() => handleToggleFavorite(selectedTemplate)}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-4 font-semibold text-gray-700 hover:bg-gray-50"
                                        >
                                            <svg className="h-5 w-5 text-yellow-500" fill={favoriteIds.includes(selectedTemplate.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.12 3.442a1 1 0 00.95.69h3.62c.969 0 1.371 1.24.588 1.81l-2.93 2.13a1 1 0 00-.364 1.118l1.12 3.442c.3.921-.755 1.688-1.54 1.118l-2.93-2.13a1 1 0 00-1.176 0l-2.93 2.13c-.784.57-1.838-.197-1.539-1.118l1.12-3.442a1 1 0 00-.364-1.118l-2.93-2.13c-.783-.57-.38-1.81.588-1.81h3.62a1 1 0 00.95-.69l1.12-3.442z" />
                                            </svg>
                                            お気に入り
                                        </button>
                                        {selectedTemplate.isPremium && (!userDoc?.subscription?.plan || userDoc.subscription.plan === 'free') ? (
                                            <Link
                                                href="/pricing"
                                                className="flex-1 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-center font-bold text-white shadow-lg"
                                            >
                                                アップグレードして利用
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => handleProceedToCreate(selectedTemplate)}
                                                className="flex-1 rounded-2xl bg-gradient-to-r from-orange-500 to-purple-600 px-6 py-4 font-bold text-white shadow-lg"
                                            >
                                                このテンプレートで作成する
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
