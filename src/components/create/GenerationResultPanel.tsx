'use client';

import Image from 'next/image';
import Link from 'next/link';

interface GeneratedImageItem {
    generationId: string;
    imageUrl: string;
    format: string;
    variantLabel?: string;
    isFavorite?: boolean;
}

interface CreativeScoreMetric {
    label: string;
    score: number;
    note: string;
}

interface CreativeEvaluation {
    totalScore: number;
    verdict: string;
    summary: string;
    suggestions: string[];
    experimentIdeas: string[];
    metrics: CreativeScoreMetric[];
}

export function GenerationResultPanel({
    primaryGeneratedImage,
    generatedImages,
    selectedGeneratedIndex,
    onSelectGeneratedIndex,
    objectiveName,
    formatName,
    sizeLabel,
    targetFormatsCount,
    toneLabel,
    creativeEvaluation,
    isSavingWinner,
    onWinnerToggle,
    onDownload,
    onEdit,
    onRegenerate,
    onReset,
}: {
    primaryGeneratedImage: GeneratedImageItem;
    generatedImages: GeneratedImageItem[];
    selectedGeneratedIndex: number;
    onSelectGeneratedIndex: (index: number) => void;
    objectiveName?: string;
    formatName?: string;
    sizeLabel?: string;
    targetFormatsCount: number;
    toneLabel?: string;
    creativeEvaluation: CreativeEvaluation | null;
    isSavingWinner: boolean;
    onWinnerToggle: () => void;
    onDownload: () => void;
    onEdit: () => void;
    onRegenerate: () => void;
    onReset: () => void;
}) {
    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 shadow-lg animate-fade-in">
            <div className="mb-6 flex items-center animate-fade-in-up">
                <span className="mr-2 text-2xl animate-bounce">🎉</span>
                <span className="text-xl font-bold tracking-tight text-gray-800">生成完了！</span>
                <div className="ml-3 flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-700">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    履歴保存済
                </div>
            </div>

            <div className="mb-5 space-y-4">
                <div className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
                    <Image
                        src={primaryGeneratedImage.imageUrl}
                        alt="Generated Ad"
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        priority
                        unoptimized
                        className="h-full w-full object-contain"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                            type="button"
                            onClick={() => window.open(primaryGeneratedImage.imageUrl, '_blank')}
                            className="rounded-full bg-white/90 p-2 transition-colors hover:bg-white"
                            title="拡大表示"
                        >
                            <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {generatedImages.length > 1 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {generatedImages.map((image, index) => (
                            <button
                                key={image.generationId}
                                type="button"
                                onClick={() => onSelectGeneratedIndex(index)}
                                className={`overflow-hidden rounded-2xl border text-left transition ${
                                    selectedGeneratedIndex === index
                                        ? 'border-violet-300 bg-violet-50 shadow-sm'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <div className="relative aspect-square bg-gray-50">
                                    <Image
                                        src={image.imageUrl}
                                        alt={image.variantLabel || `案 ${index + 1}`}
                                        fill
                                        sizes="160px"
                                        unoptimized
                                        className="object-contain"
                                    />
                                </div>
                                <div className="p-3">
                                    <p className="text-sm font-bold text-gray-900">{image.variantLabel || `案 ${index + 1}`}</p>
                                    <p className="mt-1 text-[11px] text-gray-500">
                                        {selectedGeneratedIndex === index ? '現在表示中' : 'クリックで比較'}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-xs">
                <div><span className="block text-gray-500">目的</span><span className="font-medium">{objectiveName}</span></div>
                <div><span className="block text-gray-500">フォーマット</span><span className="font-medium">{formatName}</span></div>
                <div><span className="block text-gray-500">展開媒体数</span><span className="font-medium">{targetFormatsCount} 媒体</span></div>
                <div><span className="block text-gray-500">サイズ</span><span className="font-medium">{sizeLabel}</span></div>
                <div><span className="block text-gray-500">テイスト</span><span className="font-medium">{toneLabel}</span></div>
                <div><span className="block text-gray-500">バリエーション</span><span className="font-medium">{primaryGeneratedImage.variantLabel || '単一案'}</span></div>
            </div>

            {creativeEvaluation && (
                <div className="mb-5 rounded-2xl border border-violet-100 bg-[linear-gradient(135deg,rgba(139,92,246,0.08),rgba(255,255,255,0.95))] p-4 shadow-sm">
                    <div className="grid gap-4">
                        <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-600">Creative Score</p>
                            <div className="mt-2 flex flex-wrap items-end gap-3">
                                <span className="text-4xl font-black text-slate-900">{creativeEvaluation.totalScore}</span>
                                <span className="mb-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">{creativeEvaluation.verdict}</span>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-600">{creativeEvaluation.summary}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {creativeEvaluation.metrics.map((metric) => (
                                <div key={metric.label} className="rounded-2xl border border-white/80 bg-white/85 p-3">
                                    <p className="text-xs font-semibold text-slate-500">{metric.label}</p>
                                    <div className="mt-2 flex items-end gap-2">
                                        <p className="text-2xl font-black leading-none text-slate-900">{metric.score}</p>
                                        <span className="pb-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">/100</span>
                                    </div>
                                    <p className="mt-2 text-[11px] leading-5 text-slate-500">{metric.note}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {creativeEvaluation.suggestions.length > 0 && (
                        <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">改善ポイント</p>
                            <div className="mt-2 space-y-2">
                                {creativeEvaluation.suggestions.map((suggestion) => (
                                    <p key={suggestion} className="text-sm leading-6 text-amber-900">{suggestion}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {creativeEvaluation.experimentIdeas.length > 0 && (
                        <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">次に試すA/Bテスト</p>
                            <div className="mt-2 space-y-2">
                                {creativeEvaluation.experimentIdeas.map((idea) => (
                                    <p key={idea} className="text-sm leading-6 text-sky-950">{idea}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-2">
                <button type="button" onClick={onWinnerToggle} disabled={isSavingWinner} className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all duration-200 ${primaryGeneratedImage.isFavorite ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-amber-200 bg-white text-amber-700 hover:bg-amber-50'} disabled:cursor-not-allowed disabled:opacity-60`}>
                    <svg className="h-4 w-4" fill={primaryGeneratedImage.isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.324 4.074a1 1 0 00.95.69h4.285c.969 0 1.371 1.24.588 1.81l-3.467 2.52a1 1 0 00-.364 1.118l1.324 4.073c.3.922-.755 1.688-1.539 1.118l-3.467-2.52a1 1 0 00-1.176 0l-3.467 2.52c-.783.57-1.838-.196-1.539-1.118l1.324-4.073a1 1 0 00-.364-1.118L2.98 9.5c-.783-.57-.38-1.81.588-1.81h4.285a1 1 0 00.95-.69l1.246-4.073z" /></svg>
                    {isSavingWinner ? '保存中...' : primaryGeneratedImage.isFavorite ? '採用案から外す' : '勝ち案として保存'}
                </button>
                <button type="button" onClick={onDownload} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    ダウンロード
                </button>
                <button type="button" onClick={onEdit} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-purple-200 bg-white py-3 text-sm font-semibold text-purple-700 transition-all duration-200 hover:border-purple-300 hover:bg-purple-50">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    AIで編集
                </button>
                <div className="flex gap-2">
                    <button type="button" onClick={onRegenerate} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:shadow-sm">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        再生成
                    </button>
                    <button type="button" onClick={onReset} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-200">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        新規作成
                    </button>
                </div>
                <div className="pt-2 text-center">
                    <Link href="/history" className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800 hover:underline">
                        履歴一覧を見る
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
