// ========================================
// 設定ページ
// ========================================

'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/AppHeader';
import type { PlanType, SubscriptionStatus } from '@/types/auth';
import { PLAN_MONTHLY_CREDITS, VEO_DURATION_CREDIT_COST } from '@/lib/video-billing';
import { SHOW_VIDEO_FEATURES } from '@/lib/feature-flags';

const PLAN_META: Record<PlanType, {
    badge: string;
    accent: string;
    description: string;
    creditsLabel: string;
    features: string[];
    ctaLabel: string;
}> = {
    free: {
        badge: 'お試し利用中',
        accent: 'text-purple-700 bg-purple-50',
        description: SHOW_VIDEO_FEATURES
            ? 'Freeプランでは基本機能を試せます。画像生成は可能ですが、AI編集やVeo動画生成は有料プランで有効になります。'
            : 'Freeプランでは基本機能を試せます。画像生成は可能ですが、AI編集やプレミアム機能は有料プランで有効になります。',
        creditsLabel: `初回付与 ${PLAN_MONTHLY_CREDITS.free}クレジット`,
        features: [
            '基本的な画像生成',
            '標準テンプレートの利用',
            'AI編集は利用不可',
            ...(SHOW_VIDEO_FEATURES ? ['Veo動画生成は利用不可'] : []),
            '必要に応じて都度クレジット購入が可能',
        ],
        ctaLabel: '有料プランを比較する',
    },
    starter: {
        badge: 'Starter',
        accent: 'text-blue-700 bg-blue-50',
        description: SHOW_VIDEO_FEATURES
            ? 'Starterプランでは広告制作を日常的に回せるようになり、AI編集とVeo動画生成も利用できます。'
            : 'Starterプランでは広告制作を日常的に回せるようになり、AI編集も利用できます。',
        creditsLabel: `毎月 ${PLAN_MONTHLY_CREDITS.starter}クレジット`,
        features: [
            'AI画像生成',
            'AI画像編集',
            ...(SHOW_VIDEO_FEATURES ? ['Veo 3.1 Lite 動画生成'] : []),
            'プレミアムテンプレートの利用',
            '都度クレジット購入に対応',
        ],
        ctaLabel: 'プラン詳細を見る',
    },
    pro: {
        badge: '人気プラン',
        accent: 'text-purple-700 bg-purple-50',
        description: 'Proプランでは生成量と使い勝手のバランスがよく、継続的な広告制作に向いています。',
        creditsLabel: `毎月 ${PLAN_MONTHLY_CREDITS.pro}クレジット`,
        features: [
            'AI画像生成',
            'AI画像編集',
            ...(SHOW_VIDEO_FEATURES ? ['Veo 3.1 Lite 動画生成'] : []),
            'プレミアムテンプレートの利用',
            '優先サポート',
        ],
        ctaLabel: 'プラン詳細を見る',
    },
    business: {
        badge: 'Business',
        accent: 'text-emerald-700 bg-emerald-50',
        description: 'Businessプランでは大量制作に向けたクレジット数と、より手厚い運用向け機能を利用できます。',
        creditsLabel: `毎月 ${PLAN_MONTHLY_CREDITS.business}クレジット`,
        features: [
            'AI画像生成',
            'AI画像編集',
            ...(SHOW_VIDEO_FEATURES ? ['Veo 3.1 Lite 動画生成'] : []),
            'プレミアムテンプレートの利用',
            '専用サポート',
        ],
        ctaLabel: 'プラン詳細を見る',
    },
};

const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
    active: '有効',
    canceled: '解約済み',
    past_due: '支払い確認待ち',
    trialing: 'トライアル中',
    none: '未契約',
};

const Icon = ({ name, className = 'w-5 h-5' }: { name: string; className?: string }) => {
    switch (name) {
        case 'profile':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
        case 'plan':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
        case 'logout':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
        default:
            return null;
    }
};

function formatDate(value: Date | null | undefined): string {
    if (!value) {
        return '未設定';
    }

    return value.toLocaleDateString('ja-JP');
}

export default function SettingsPage() {
    const { user, userDoc, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    window.location.href = '/';
                },
            },
        });
    };

    const currentPlan = userDoc?.subscription?.plan || 'free';
    const currentPlanMeta = PLAN_META[currentPlan];
    const subscriptionStatus = userDoc?.subscription?.status || 'none';

    const tabs = [
        { id: 'profile', label: 'アカウント情報', icon: 'profile' },
        { id: 'plan', label: 'プラン・お支払い', icon: 'plan' },
    ];

    return (
        <div className="min-h-screen bg-[#FDFCFB]">
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] bg-gradient-to-bl from-orange-100/40 via-purple-100/20 to-transparent rounded-full blur-3xl opacity-70" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-tr from-indigo-100/40 via-blue-50/20 to-transparent rounded-full blur-3xl opacity-70" />
            </div>

            <AppHeader />

            <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-2">設定・アカウント</h1>
                    <p className="text-gray-500 font-medium">プロフィール情報やアプリの利用状況を管理します</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                    <nav className="w-full md:w-64 shrink-0 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl font-bold transition-all duration-300 relative group ${
                                    activeTab === tab.id
                                        ? 'text-purple-700 bg-white shadow-[0_4px_20px_rgb(147,51,234,0.08)] ring-1 ring-purple-100'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
                                }`}
                            >
                                {activeTab === tab.id && (
                                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-orange-400 to-purple-500 rounded-r-md"></div>
                                )}
                                <Icon name={tab.icon} className={`w-5 h-5 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-3'}`} />
                                {tab.label}
                            </button>
                        ))}

                        <div className="pt-6 mt-6 border-t border-gray-100">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center md:justify-start gap-3.5 px-5 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors group"
                            >
                                <Icon name="logout" className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                                ログアウト
                            </button>
                        </div>
                    </nav>

                    <div className="flex-1">
                        {activeTab === 'profile' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 lg:p-10">
                                    <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                            <Icon name="profile" className="w-5 h-5" />
                                        </div>
                                        基本プロフィール
                                    </h2>

                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10 pb-10 border-b border-gray-100/80">
                                        <div className="relative group shrink-0">
                                            {user?.image ? (
                                                <Image src={user.image} alt="" width={112} height={112} className="w-28 h-28 rounded-full object-cover shadow-lg ring-4 ring-white" />
                                            ) : (
                                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white">
                                                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2 text-center sm:text-left mt-4 sm:mt-0">
                                            <h3 className="text-2xl font-extrabold text-gray-900">{user?.name || 'ゲストユーザー'}</h3>
                                            <p className="text-gray-500 font-medium">{user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">表示名</label>
                                            <div className="px-5 py-4 bg-gray-50/80 rounded-2xl border border-gray-100 font-medium text-gray-900">
                                                {user?.name || '未設定'}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">メールアドレス</label>
                                            <div className="px-5 py-4 bg-gray-50/80 rounded-2xl border border-gray-100 font-medium text-gray-900">
                                                {user?.email}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-red-100/50 shadow-[0_8px_30px_rgb(239,68,68,0.03)] p-8 lg:p-10">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 mb-2">アカウントの削除</h2>
                                            <p className="text-gray-500 text-sm leading-relaxed">
                                                アカウント削除は現在サポート対応です。履歴や課金状態を確認したうえで安全に削除するため、先にお問い合わせください。
                                            </p>
                                        </div>
                                        <Link
                                            href="/contact"
                                            className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors shrink-0 w-full sm:w-auto text-center"
                                        >
                                            サポートに連絡する
                                        </Link>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'plan' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 lg:p-10">
                                    <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                            <Icon name="plan" className="w-5 h-5" />
                                        </div>
                                        プランと利用状況
                                    </h2>

                                    <div className="flex flex-col lg:flex-row gap-10">
                                        <div className="flex-1 space-y-6">
                                            <div className="flex flex-wrap items-end gap-3">
                                                <h3 className="text-3xl font-extrabold text-gray-900 capitalize tracking-tight">
                                                    {currentPlan} プラン
                                                </h3>
                                                <span className={`text-sm font-medium px-3 py-1 rounded-full mb-1 ${currentPlanMeta.accent}`}>
                                                    {currentPlanMeta.badge}
                                                </span>
                                            </div>

                                            <p className="text-gray-500 leading-relaxed text-sm">
                                                {currentPlanMeta.description}
                                            </p>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">契約ステータス</p>
                                                    <p className="text-sm font-semibold text-gray-900">{SUBSCRIPTION_STATUS_LABEL[subscriptionStatus]}</p>
                                                </div>
                                                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">付与クレジット</p>
                                                    <p className="text-sm font-semibold text-gray-900">{currentPlanMeta.creditsLabel}</p>
                                                </div>
                                                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">次の更新目安</p>
                                                    <p className="text-sm font-semibold text-gray-900">{formatDate(userDoc?.subscription?.currentPeriodEnd)}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-4 border-t border-gray-100/80">
                                                <h4 className="text-sm font-bold text-gray-900">プランに含まれる主な機能</h4>
                                                <ul className="space-y-2.5 text-sm text-gray-600">
                                                    {currentPlanMeta.features.map((feature) => (
                                                        <li key={feature} className="flex items-center gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {userDoc?.subscription?.cancelAtPeriodEnd && (
                                                <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-sm font-medium text-yellow-800 flex gap-3 items-start">
                                                    <span className="text-yellow-600 text-base mt-0.5">⚠️</span>
                                                    <div>
                                                        解約手続き済みです。現在の利用期間は <strong>{formatDate(userDoc?.subscription?.currentPeriodEnd)}</strong> まで継続し、その後 Free プランへ移行します。
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pt-2">
                                                <Link href="/pricing" className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-[0_2px_10px_rgb(147,51,234,0.2)] hover:bg-purple-700 hover:shadow-[0_4px_15px_rgb(147,51,234,0.3)] transition-all w-full sm:w-auto">
                                                    {currentPlanMeta.ctaLabel}
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="lg:w-80 shrink-0">
                                            <div className="p-8 bg-gray-50/80 rounded-2xl border border-gray-100 h-full flex flex-col overflow-hidden relative">
                                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400 to-purple-500"></div>

                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 text-center">
                                                    利用可能クレジット
                                                </h4>

                                                <div className="flex-1 flex items-center justify-center mb-6">
                                                    <div className="text-center">
                                                        <div className="flex items-baseline justify-center gap-1.5 mb-2">
                                                            <span className="text-5xl font-black text-gray-900 tracking-tight">
                                                                {userDoc?.credits ?? 0}
                                                            </span>
                                                            <span className="text-xl text-gray-500 font-bold">cr</span>
                                                        </div>
                                                        <div className="inline-block px-3 py-1 bg-white rounded-md text-xs font-bold text-purple-600 border border-purple-100">
                                                            現在の残高
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 mt-auto text-xs text-gray-500 bg-white p-4 rounded-xl border border-gray-100">
                                                    <div>
                                                        <p className="mb-2"><strong className="text-gray-700">消費対象</strong></p>
                                                        <ul className="space-y-1 pl-3 list-disc text-gray-400">
                                                            <li>AIによる画像生成</li>
                                                            <li>AI画像編集</li>
                                                            {SHOW_VIDEO_FEATURES && (
                                                                <li>Veo動画生成（4秒 {VEO_DURATION_CREDIT_COST['4']}cr / 6秒 {VEO_DURATION_CREDIT_COST['6']}cr / 8秒 {VEO_DURATION_CREDIT_COST['8']}cr）</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                    <div className="pt-3 border-t border-gray-100">
                                                        <p><strong className="text-gray-700">今月の生成回数:</strong> {userDoc?.usage?.monthlyGenerations ?? 0}</p>
                                                        <p><strong className="text-gray-700">累計生成回数:</strong> {userDoc?.usage?.totalGenerations ?? 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {userDoc?.subscription?.stripeCustomerId && (
                                    <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 lg:p-10">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 mb-2">ご請求情報・お支払い方法</h2>
                                                <p className="text-gray-500 text-sm leading-relaxed">クレジットカードの変更、お支払い履歴の確認、サブスクリプションの解約や再開は Stripe ポータルから行えます。</p>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const res = await fetch('/api/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
                                                        const data = await res.json() as { url?: string };
                                                        if (data.url) {
                                                            window.open(data.url, '_blank');
                                                        }
                                                    } catch (error) {
                                                        console.error('Portal error:', error);
                                                        alert('ポータルの表示に失敗しました');
                                                    }
                                                }}
                                                className="px-6 py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shrink-0 shadow-md w-full sm:w-auto text-center"
                                            >
                                                Stripeポータルを開く
                                            </button>
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
