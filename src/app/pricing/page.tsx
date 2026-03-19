// ========================================
// 料金プランページ
// ========================================

'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { useLoginModalStore } from '@/store/useLoginModalStore';

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
            '基本テンプレート (12種類)',
        ],
        limitations: [
            'AI編集機能なし',
        ],
        cta: '現在のプラン',
        popular: false,
    },
    {
        id: 'starter',
        name: 'Starter',
        price: '¥980',
        period: '/月',
        credits: 30,
        description: '30クレジット/月で広告作成を始めましょう。',
        features: [
            '30クレジット/月',
            '全フォーマット対応',
            'プレミアムテンプレート (全32種類以上)',
            'AI編集機能',
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
        credits: 80,
        description: '80クレジット/月で広告作成を始めましょう。',
        features: [
            '80クレジット/月',
            '全フォーマット対応',
            'プレミアムテンプレート (全32種類以上)',
            'AI編集機能',
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
        credits: 150,
        description: '150クレジット/月で広告作成を始めましょう。',
        features: [
            '150クレジット/月',
            '全フォーマット対応',
            'プレミアムテンプレート (全32種類以上)',
            'AI編集機能',
            '専用サポート',
        ],
        limitations: [],
        cta: 'このプランを選択',
        popular: false,
    },
];

const onetimePlans = [
    {
        id: 'onetime_20',
        name: '20クレジット追加',
        price: '¥300',
        period: '',
        credits: 20,
        description: '少しだけ追加したい時に。有効期限はありません。',
        features: [
            '20クレジット追加',
            '有効期限なし',
            '現在のプラン機能に準じて利用可能',
        ],
        limitations: [],
        cta: '購入する',
        popular: false,
    },
    {
        id: 'onetime_50',
        name: '50クレジット追加',
        price: '¥700',
        period: '',
        credits: 50,
        description: 'お得な50クレジットパック。有効期限はありません。',
        features: [
            '50クレジット追加',
            '有効期限なし',
            '現在のプラン機能に準じて利用可能',
        ],
        limitations: [],
        cta: '購入する',
        popular: true,
    },
    {
        id: 'onetime_100',
        name: '100クレジット追加',
        price: '¥1,200',
        period: '',
        credits: 100,
        description: '最もお得な100クレジットパック。有効期限はありません。',
        features: [
            '100クレジット追加',
            '有効期限なし',
            '現在のプラン機能に準じて利用可能',
        ],
        limitations: [],
        cta: '購入する',
        popular: false,
    },
];

interface CheckoutResponse {
    error?: string;
    url?: string;
}

export default function PricingPage() {
    const { user, userDoc } = useAuth();
    const currentPlan = userDoc?.subscription?.plan || 'free';
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [pricingType, setPricingType] = useState<'subscription' | 'onetime'>('subscription');

    const handleSelectPlan = async (planId: string) => {
        if (planId === 'free') return;

        // 未ログインの場合はログインページへ
        if (!user) {
            useLoginModalStore.getState().openModal();
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

            const data = await response.json() as CheckoutResponse;

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
            <AppHeader />

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

                {/* 支払いタイプ切り替え */}
                <div className="flex justify-center mb-16">
                    <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl inline-flex shadow-sm border border-gray-100">
                        <button
                            onClick={() => setPricingType('subscription')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${pricingType === 'subscription'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                        >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            サブスクリプション
                        </button>
                        <button
                            onClick={() => setPricingType('onetime')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${pricingType === 'onetime'
                                ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                        >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            買い切りクレジット
                        </button>
                    </div>
                </div>

                {pricingType === 'subscription' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* プランカード */}
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
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">必要な分だけ。クレジット都度追加</h2>
                            <p className="text-gray-500">
                                使いたい時に使いたい分だけ追加購入できます。<br />
                                追加したクレジットに有効期限はありません。
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {onetimePlans.map((plan) => {
                                return (
                                    <div
                                        key={plan.id}
                                        className={`relative flex flex-col h-full bg-white/70 backdrop-blur-sm rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${plan.popular
                                            ? 'border-orange-300 shadow-xl shadow-orange-500/10'
                                            : 'border-gray-100 shadow-sm hover:shadow-lg'
                                            }`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
                                                    一番お得
                                                </span>
                                            </div>
                                        )}

                                        <div className="mb-6">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                                        </div>

                                        <div className="space-y-3 mb-6 flex-1">
                                            {plan.features.map((feature, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm">
                                                    <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="text-gray-700">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handleSelectPlan(plan.id)}
                                            disabled={loadingPlan === plan.id}
                                            className={`w-full py-3 rounded-xl font-semibold transition-all mt-auto flex items-center justify-center gap-2 ${plan.popular
                                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:shadow-xl'
                                                : 'bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50'
                                                } ${loadingPlan === plan.id ? 'opacity-70 cursor-wait' : ''}`}
                                        >
                                            {loadingPlan === plan.id ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    処理中...
                                                </>
                                            ) : '追加購入する'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

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
                                a: '無料プランでは繰り越しはありません。有料プランで毎月付与されるクレジットは、契約中であれば無期限・無制限で繰り越してご利用いただけます。また、都度購入したクレジットにも有効期限はありません。',
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
