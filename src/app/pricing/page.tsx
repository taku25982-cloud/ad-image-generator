// ========================================
// 料金プランページ
// ========================================

'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';

import { useState } from 'react';

const plans = [
    {
        id: 'free',
        name: 'Free',
        price: '¥0',
        period: '',
        credits: 3,
        description: 'Forever Free - 試してみたい方に。基本機能をお試しいただけます。',
        features: [
            '3クレジット (初回のみ)',
            '全フォーマット対応',
            '基本テンプレート',
            '7日間ストレージ保存',
        ],
        limitations: [
            'AI編集機能なし',
            'ウォーターマーク付き',
        ],
        cta: '現在のプラン',
        popular: false,
    },
    {
        id: 'starter',
        name: 'Starter',
        price: '¥980',
        period: '/月',
        credits: 50,
        description: '50クレジット/月で広告作成を始めましょう。',
        features: [
            '50クレジット/月',
            '全フォーマット対応',
            'プレミアムテンプレート',
            'AI編集機能',
            '30日間ストレージ保存',
            'ウォーターマークなし',
        ],
        limitations: [],
        cta: 'このプランを選択',
        popular: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '¥1,980',
        period: '/月',
        credits: 200,
        description: '200クレジット/月で広告作成を始めましょう。',
        features: [
            '200クレジット/月',
            '全フォーマット対応',
            'プレミアムテンプレート',
            'AI編集機能',
            '90日間ストレージ保存',
            '優先サポート',
        ],
        limitations: [],
        cta: 'このプランを選択',
        popular: true,
    },
    {
        id: 'business',
        name: 'Business',
        price: '¥4,980',
        period: '/月',
        credits: 1000,
        description: '1,000クレジット/月で広告作成を始めましょう。',
        features: [
            '1,000クレジット/月',
            '全フォーマット対応',
            'プレミアムテンプレート',
            'AI編集機能',
            '無制限ストレージ',
            '専用サポート',
        ],
        limitations: [],
        cta: 'このプランを選択',
        popular: false,
    },
];

export default function PricingPage() {
    const { user, userDoc } = useAuth();
    const currentPlan = userDoc?.subscription?.plan || 'free';
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleSelectPlan = async (planId: string) => {
        if (planId === 'free') return;

        // 未ログインの場合はログインページへ
        if (!user) {
            window.location.href = '/login?redirect=/pricing';
            return;
        }

        if (planId === 'business') {
            window.open('mailto:support@example.com?subject=Businessプランについて', '_blank');
            return;
        }

        setLoadingPlan(planId);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ planId }),
            });

            const data = await response.json() as any;

            if (!response.ok) {
                throw new Error(data.error || '決済セッションの作成に失敗しました');
            }

            // Stripe Checkoutページにリダイレクト
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert(error instanceof Error ? error.message : '決済の開始に失敗しました');
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-purple-50/30 to-indigo-50/50 relative">
            {/* 背景デコレーション */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-200/20 to-transparent rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full blur-[100px]" />
            </div>

            {/* ヘッダー */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-purple-600">
                            AI Generator
                        </span>
                    </div>
                    <nav className="flex items-center gap-4">
                        {user ? (
                            <Link href="/dashboard" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                ダッシュボードへ
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                    ログイン
                                </Link>
                                <Link href="/login?mode=signup" className="px-5 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all">
                                    無料で始める
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-16 relative z-10">
                {/* タイトル */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        シンプルな<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">料金プラン</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        すべてのプランで基本機能が使えます。全プラン商用利用OK。<br />
                        あなたのニーズに合わせてお選びください。
                    </p>
                </div>

                {/* プランカード */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan) => {
                        const isCurrentPlan = currentPlan === plan.id;
                        return (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col h-full bg-white/70 backdrop-blur-sm rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${plan.popular
                                    ? 'border-purple-300 shadow-xl shadow-purple-500/10'
                                    : 'border-gray-100 shadow-sm hover:shadow-lg'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                                            人気プラン
                                        </span>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                                        {plan.period && <span className="text-gray-500">{plan.period}</span>}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                                </div>

                                <div className="space-y-3 mb-6 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                    {plan.limitations.map((limitation, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            <span className="text-gray-400">{limitation}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    disabled={isCurrentPlan || loadingPlan === plan.id}
                                    className={`w-full py-3 rounded-xl font-semibold transition-all mt-auto flex items-center justify-center gap-2 ${isCurrentPlan
                                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                        : plan.popular
                                            ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                                            : 'bg-gray-900 text-white hover:bg-gray-800'
                                        } ${loadingPlan === plan.id ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {loadingPlan === plan.id ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            処理中...
                                        </>
                                    ) : isCurrentPlan ? '現在のプラン' : 'このプランを選択'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ */}
                <div className="mt-20">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">よくある質問</h2>
                    <div className="max-w-3xl mx-auto space-y-4">
                        {[
                            {
                                q: 'クレジットとは何ですか？',
                                a: 'クレジットは広告画像を生成するために必要なポイントです。1回の生成につき1クレジットを消費します。',
                            },
                            {
                                q: 'プランはいつでも変更できますか？',
                                a: 'はい、いつでもアップグレード・ダウングレードが可能です。変更は次の請求サイクルから適用されます。',
                            },
                            {
                                q: '未使用のクレジットは繰り越せますか？',
                                a: '無料プランでは繰り越しはありません。有料プランでは最大2ヶ月分まで繰り越しが可能です。',
                            },
                            {
                                q: '解約はいつでもできますか？',
                                a: 'はい、いつでも解約可能です。解約後も請求期間終了まではサービスをご利用いただけます。',
                            },
                            {
                                q: '生成した画像は商用利用できますか？',
                                a: 'はい、全プランで生成した画像の商用利用が可能です。広告、SNS投稿、ウェブサイトなどにご自由にお使いいただけます。',
                            },
                        ].map((faq, i) => (
                            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                                <p className="text-gray-500">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
