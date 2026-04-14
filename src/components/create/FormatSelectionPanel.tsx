'use client';

interface FormatItem {
    id: string;
    name: string;
    size: string;
    icon: string;
}

interface FormatPackItem {
    id: 'single' | 'social-starter' | 'social-wide' | 'commerce';
    name: string;
    description: string;
    formatIds: readonly string[];
}

export function FormatSelectionPanel({
    selectedFormat,
    selectedFormatLabel,
    visibleFormats,
    showAllFormats,
    totalFormatCount,
    onToggleShowAll,
    onSelectFormat,
    formatPacks,
    selectedFormatPack,
    onSelectFormatPack,
    targetFormats,
    mediumOptimizationTips,
    getFormatName,
}: {
    selectedFormat: string | null;
    selectedFormatLabel?: string;
    visibleFormats: readonly FormatItem[];
    showAllFormats: boolean;
    totalFormatCount: number;
    onToggleShowAll: () => void;
    onSelectFormat: (formatId: string) => void;
    formatPacks: readonly FormatPackItem[];
    selectedFormatPack: 'single' | 'social-starter' | 'social-wide' | 'commerce';
    onSelectFormatPack: (packId: 'single' | 'social-starter' | 'social-wide' | 'commerce') => void;
    targetFormats: string[];
    mediumOptimizationTips: string[];
    getFormatName: (formatId: string) => string;
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:border-gray-200">
            <div className="flex w-full items-center justify-between border-b border-gray-50 bg-gray-50/20 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 text-sm font-bold text-white shadow-sm">2</div>
                    <div className="text-left">
                        <h2 className="font-bold text-gray-900">フォーマット選択</h2>
                        {selectedFormatLabel && <p className="mt-0.5 text-xs text-gray-500">{selectedFormatLabel}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {selectedFormat && (
                        <span className="hidden rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600 sm:inline-block">✓ 選択済み</span>
                    )}
                </div>
            </div>
            <div className="animate-fade-in px-6 py-6">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {visibleFormats.map((format) => (
                        <button
                            key={format.id}
                            type="button"
                            onClick={() => onSelectFormat(format.id)}
                            className={`rounded-xl border-2 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                                selectedFormat === format.id
                                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-orange-50 shadow-md shadow-purple-500/10'
                                    : 'border-gray-100 bg-white/70 hover:border-gray-200 hover:shadow-sm'
                            }`}
                        >
                            <span className="mb-2 block text-2xl">{format.icon}</span>
                            <h3 className="mb-0.5 text-sm font-bold text-gray-900">{format.name}</h3>
                            <p className="text-xs text-gray-500">{format.size}</p>
                        </button>
                    ))}
                </div>

                {totalFormatCount > 4 && (
                    <button
                        type="button"
                        onClick={onToggleShowAll}
                        className="mt-3 w-full py-2 text-sm font-medium text-purple-600 transition-colors hover:text-purple-700"
                    >
                        {showAllFormats ? '折りたたむ ▲' : `すべて表示（${totalFormatCount}件） ▼`}
                    </button>
                )}

                <div className="mt-5 rounded-2xl border border-indigo-100 bg-[linear-gradient(135deg,rgba(238,242,255,0.9),rgba(255,255,255,0.95))] p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-bold text-gray-900">媒体別の自動展開</p>
                            <p className="mt-1 text-xs text-gray-500">1回の入力で複数サイズへまとめて展開できます</p>
                        </div>
                        <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">差別化ポイント</span>
                    </div>

                    <div className="mt-4 grid gap-2">
                        {formatPacks.map((pack) => (
                            <button
                                key={pack.id}
                                type="button"
                                onClick={() => onSelectFormatPack(pack.id)}
                                className={`rounded-2xl border p-3 text-left transition ${
                                    selectedFormatPack === pack.id
                                        ? 'border-indigo-300 bg-indigo-50'
                                        : 'border-white/80 bg-white/80 hover:border-indigo-200'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-gray-900">{pack.name}</p>
                                        <p className="mt-1 text-xs leading-5 text-gray-500">{pack.description}</p>
                                    </div>
                                    <span className="text-xs font-bold text-indigo-700">
                                        {pack.id === 'single' ? '1媒体' : `${Array.from(new Set([selectedFormat, ...pack.formatIds].filter(Boolean))).length}媒体`}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 rounded-xl border border-white/80 bg-white/80 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">今回の展開先</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {targetFormats.length > 0 ? targetFormats.map((formatId) => (
                                <span key={formatId} className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                    {getFormatName(formatId)}
                                </span>
                            )) : (
                                <span className="text-xs text-gray-500">まずはフォーマットを選択してください</span>
                            )}
                        </div>
                    </div>

                    {mediumOptimizationTips.length > 0 && (
                        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/80 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700">媒体最適化の要点</p>
                            <div className="mt-2 space-y-1.5">
                                {mediumOptimizationTips.map((tip) => (
                                    <p key={tip} className="text-xs leading-5 text-indigo-950">{tip}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
