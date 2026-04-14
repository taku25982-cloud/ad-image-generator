// ========================================
// ダッシュボード ホーム
// LPに合わせたモダンなデザイン
// ========================================

'use client';

import Image from 'next/image';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdHistory } from '@/lib/history';
import { hasSuccessfulPayment, PAYMENT_REFRESH_DELAYS_MS } from '@/lib/dashboard';
import { SHOW_BRAND_FEATURES, SHOW_PROJECT_FEATURES } from '@/lib/feature-flags';

type InitialAdHistory = Omit<AdHistory, 'createdAt'> & {
    createdAt: string;
};

function reviveHistory(item: InitialAdHistory): AdHistory {
    return {
        ...item,
        createdAt: new Date(item.createdAt),
    };
}

export default function DashboardHome({
    initialRecentProjects,
}: {
    initialRecentProjects: InitialAdHistory[];
}) {
    const { user, userDoc, refreshUserDoc } = useAuth();
    const router = useRouter();
    const userName = user?.displayName || userDoc?.displayName || user?.email?.split('@')[0] || 'ゲスト';

    const [recentProjects] = useState<AdHistory[]>(() => initialRecentProjects.map(reviveHistory));
    const loading = false;

    // Stripe決済戻り時のクレジット等の自動更新
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (hasSuccessfulPayment(window.location.search)) {
            const timers = PAYMENT_REFRESH_DELAYS_MS.map((delay) => (
                window.setTimeout(() => {
                    void refreshUserDoc();
                }, delay)
            ));

            // URLのパラメータを消去 (リロードなし)
            router.replace('/dashboard', { scroll: false });

            return () => {
                timers.forEach((timer) => window.clearTimeout(timer));
            };
        }
    }, [router, refreshUserDoc]);

    // 日時の相対表示
    const formatRelativeDate = (date: Date) => {
        const now = new Date();
        const d = new Date(date);
        const diffMs = now.getTime() - d.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHour = Math.floor(diffMs / 3600000);
        const diffDay = Math.floor(diffMs / 86400000);

        if (diffMin < 1) return 'たった今';
        if (diffMin < 60) return `${diffMin}分前`;
        if (diffHour < 24) return `${diffHour}時間前`;
        if (diffDay < 7) return `${diffDay}日前`;
        return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* ヘッダーセクション */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        こんにちは、<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">{userName}</span>さん
                    </h1>
                    <p className="text-gray-500 mt-2">
                        今日も新しいクリエイティブを作りましょう。
                    </p>
                </div>
                <Link href="/create">
                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        新規プロジェクト作成
                    </button>
                </Link>
            </div>

            {/* クイックアクション */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/create" className="group">
                    <div className="h-full p-6 bg-white/70 backdrop-blur-sm border border-orange-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200 to-orange-100 rounded-bl-full opacity-30 group-hover:opacity-50 transition-opacity" />
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">AI生成を開始</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">テキストから高品質な広告バナーを自動生成します。</p>
                    </div>
                </Link>

                <Link href="/templates" className="group">
                    <div className="h-full p-6 bg-white/70 backdrop-blur-sm border border-purple-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-purple-100 rounded-bl-full opacity-30 group-hover:opacity-50 transition-opacity" />
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">テンプレートから作成</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">プロがデザインしたテンプレートでカスタマイズ可能な広告を作成。</p>
                    </div>
                </Link>

                <Link href="/history" className="group">
                    <div className="h-full p-6 bg-white/70 backdrop-blur-sm border border-indigo-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200 to-indigo-100 rounded-bl-full opacity-30 group-hover:opacity-50 transition-opacity" />
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">履歴を確認</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">過去に作成したプロジェクトの確認、編集、再ダウンロード。</p>
                    </div>
                </Link>
            </div>

            {(SHOW_BRAND_FEATURES || SHOW_PROJECT_FEATURES) && (
                <section className={`grid grid-cols-1 gap-6 ${SHOW_BRAND_FEATURES && SHOW_PROJECT_FEATURES ? 'xl:grid-cols-[1.1fr_0.9fr]' : ''}`}>
                    {SHOW_BRAND_FEATURES && (
                        <div className="rounded-[28px] border border-fuchsia-100 bg-white/75 p-6 shadow-sm backdrop-blur-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-600">Brand System</p>
                                    <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900">ブランドのルールを先に登録</h2>
                                    <p className="mt-2 max-w-xl text-sm leading-7 text-gray-500">
                                        色、トーン、禁止表現を保存しておくと、生成結果のブレが減って派生案も作りやすくなります。
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-fuchsia-600 px-4 py-3 text-right text-white shadow-lg shadow-fuchsia-500/20">
                                    <p className="text-xs uppercase tracking-[0.18em] text-white/80">おすすめ</p>
                                    <p className="mt-1 text-base font-black leading-tight sm:text-lg">ブランド登録</p>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <Link href="/brand-kits" className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-700">
                                    ブランドキット管理
                                    <span aria-hidden="true">→</span>
                                </Link>
                                <Link href="/create" className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-fuchsia-200 hover:bg-fuchsia-50 hover:text-fuchsia-700">
                                    そのまま生成へ
                                </Link>
                            </div>
                        </div>
                    )}

                    {SHOW_PROJECT_FEATURES && (
                        <div className="rounded-[28px] border border-sky-100 bg-white/75 p-6 shadow-sm backdrop-blur-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Project Flow</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900">案件ごとに履歴を整理</h2>
                            <p className="mt-2 text-sm leading-7 text-gray-500">
                                商品やキャンペーンごとに案件を分けておくと、履歴、複製、派生生成の流れが見やすくなります。
                            </p>

                            <div className="mt-5 space-y-3">
                                {['案件を作る', 'ブランドを紐づける', '生成と編集をまとめる'].map((step, index) => (
                                    <div key={step} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-violet-600 text-sm font-black text-white">
                                            {index + 1}
                                        </span>
                                        <p className="text-sm font-semibold text-slate-700">{step}</p>
                                    </div>
                                ))}
                            </div>

                            <Link href="/projects" className="mt-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100">
                                プロジェクト管理を開く
                                <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    )}
                </section>
            )}

            {/* 最近のプロジェクト */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">最近のプロジェクト</h2>
                    {recentProjects.length > 0 && (
                        <Link href="/history" className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline">
                            すべて見る →
                        </Link>
                    )}
                </div>

                {loading ? (
                    /* ローディング状態 */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                                <div className="aspect-[4/3] bg-gray-100" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                                    <div className="h-3 bg-gray-50 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : recentProjects.length === 0 ? (
                    /* 空の状態 */
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-12 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">プロジェクトがまだありません</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                            最初のクリエイティブを作成して、AIの力を体験しましょう。
                        </p>
                        <Link href="/create">
                            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                最初のプロジェクトを作成
                            </button>
                        </Link>
                    </div>
                ) : (
                    /* プロジェクトカード一覧 */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {recentProjects.map((project, index) => (
                            <Link
                                key={project.id}
                                href={`/edit?imageUrl=${encodeURIComponent(project.imageUrl)}`}
                                className="group"
                            >
                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                                    {/* サムネイル */}
                                    <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                                        <Image
                                            src={project.imageUrl}
                                            alt={project.productName || '生成画像'}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            unoptimized
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading={index === 0 ? 'eager' : 'lazy'}
                                        />
                                        {/* ホバー時のオーバーレイ */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                            <span className="text-white text-sm font-medium flex items-center gap-1.5">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                                編集する
                                            </span>
                                        </div>
                                    </div>

                                    {/* 情報 */}
                                    <div className="p-4">
                                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                                            {project.productName || '無題のプロジェクト'}
                                        </h3>
                                        <div className="flex items-center justify-between mt-1.5">
                                            <p className="text-xs text-gray-400">
                                                {formatRelativeDate(project.createdAt)}
                                            </p>
                                            {project.catchCopy && (
                                                <span className="text-xs text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                                                    {project.catchCopy}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* クイックヒント */}
            <section className="bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">💡 ヒント</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            AIが目的や商品の特徴を理解し、自動的に魅力的な広告クリエイティブを生成します。
                            まずは「AI生成を開始」から試してみましょう！
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
