'use client';

import Link from 'next/link';
import { LoginButton } from '@/components/auth/LoginButton';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PRICING_PLANS } from '@/types/billing';
import { GallerySection } from '@/components/landing/GallerySection';
import { AIEditorShowcase } from '@/components/landing/AIEditorShowcase';
import { TargetUsersSection } from '@/components/landing/TargetUsersSection';

export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace('/dashboard');
            } else {
                const timeout = setTimeout(() => {
                    setInitialLoading(false);
                }, 0);
                return () => clearTimeout(timeout);
            }
        }
    }, [user, loading, router]);

    if (initialLoading || user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const featureCards = [
        {
            emoji: '✨',
            title: 'AI画像生成',
            desc: '商品やキャンペーン情報を入力するだけで、広告クリエイティブを AI が自動生成。主要文言はそのまま活かしながら、目的に合う構図へ整理します。',
            gradient: 'from-orange-500 to-pink-500'
        },
        {
            emoji: '🧩',
            title: 'テンプレート活用',
            desc: '32種類のテンプレートから開始でき、目的別のカスタム指示や色彩設計も反映。無料プランは基本テンプレート、有料プランはプレミアムテンプレートも使えます。',
            gradient: 'from-violet-500 to-blue-500'
        },
        {
            emoji: '🖼️',
            title: '参考画像とAI編集',
            desc: '参考画像を使った生成に対応。さらに有料プランでは AI 編集で、既存の広告画像を自然言語でブラッシュアップできます。',
            gradient: 'from-blue-500 to-cyan-500'
        }
    ];

    const landingPlans = [
        {
            ...PRICING_PLANS[0],
            tagline: 'Forever Free',
            ctaClassName: 'w-full py-4 rounded-full border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all',
            ctaLabel: '無料で始める',
            accentClassName: 'text-gray-300',
            featured: false,
        },
        {
            ...PRICING_PLANS[1],
            tagline: 'For Beginners',
            ctaClassName: 'w-full py-4 rounded-full bg-orange-50 text-orange-600 font-bold text-sm hover:bg-orange-100 transition-all',
            ctaLabel: '今すぐ始める',
            accentClassName: 'text-orange-500',
            featured: false,
        },
        {
            ...PRICING_PLANS[2],
            tagline: 'For Creators',
            featured: true,
            ctaClassName: 'w-full py-4 rounded-full bg-white text-violet-600 font-bold text-sm hover:bg-gray-50 transition-all shadow-lg',
            ctaLabel: '今すぐ始める',
            accentClassName: 'text-violet-200',
        },
        {
            ...PRICING_PLANS[3],
            tagline: 'For Business',
            ctaClassName: 'w-full py-4 rounded-full bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-all',
            ctaLabel: '今すぐ始める',
            accentClassName: 'text-gray-400',
            featured: false,
        }
    ];

    const faqs = [
        {
            q: 'クレジットとは何ですか？',
            a: 'クレジットは広告画像の生成や AI 編集に使うポイントです。通常は 1 回の生成または 1 回の AI 編集ごとに 1 クレジットを消費します。',
        },
        {
            q: '無料プランでも使えますか？',
            a: 'はい。Free プランでは初回 3 クレジットが付与され、全フォーマット対応・基本テンプレート利用・7日間の履歴保存が使えます。',
        },
        {
            q: 'プレミアムテンプレートとAI編集はどのプランから使えますか？',
            a: 'Starter 以上でプレミアムテンプレートと AI 編集が利用できます。Free プランではプレミアムテンプレート詳細はロックされます。',
        },
        {
            q: 'プランはいつでも変更できますか？',
            a: 'はい。アップグレードや解約はいつでも行えます。詳細な契約状況はログイン後の設定画面や Stripe カスタマーポータルから確認できます。',
        },
        {
            q: '生成した画像は商用利用できますか？',
            a: 'はい。LP 上でも案内している通り、全プランで生成画像の商用利用を想定しています。',
        },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden bg-white text-gray-900 selection:bg-orange-500/20 selection:text-orange-600">

            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white" />
                <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-orange-300/30 via-orange-200/20 to-transparent blur-[120px] animate-float-slow" />
                <div className="absolute top-[10%] right-[-15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-violet-400/25 via-purple-300/15 to-transparent blur-[100px] animate-float-reverse" />
                <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tr from-blue-300/20 to-transparent blur-[80px] animate-float" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-gray-200/50" />
                <div className="container mx-auto px-6 h-20 flex items-center relative">
                    {/* Left content: Logo */}
                    <div className="flex-1 flex justify-start">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500 to-violet-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500 to-violet-600 blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                                <svg className="w-5 h-5 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900">
                                AI Generator
                            </span>
                        </Link>
                    </div>

                    {/* Center content: Navigation */}
                    <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-10">
                        <Link href="#gallery" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            ギャラリー
                        </Link>
                        <Link href="#ai-edit" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            AI編集
                        </Link>
                        <Link href="#targets" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            活用シーン
                        </Link>
                        <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            使い方
                        </Link>
                        <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            料金
                        </Link>
                    </nav>

                    {/* Right content: Actions */}
                    <div className="flex-1 flex items-center justify-end gap-4">
                        <LoginButton className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            ログイン
                        </LoginButton>
                        <LoginButton className="group relative">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-violet-600 blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                            <div className="relative px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-violet-600 text-white text-sm font-bold hover:scale-105 transition-transform">
                                無料で始める
                            </div>
                        </LoginButton>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-40 pb-16 z-10">
                <div className="container mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/80 border border-gray-200/50 backdrop-blur-sm mb-8 animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">Powered by Gemini AI</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.3] mb-8 tracking-tight animate-fade-in-up animation-delay-100">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 p-2 -m-2 inline-block">広告画像</span>を
                        <br />
                        <span className="text-gray-900">数秒で作成</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
                        商品情報やキャンペーン内容、テンプレート、参考画像を組み合わせて、SNS・EC・バナーなどに最適な
                        <br className="hidden md:block" />
                        プロ品質の広告クリエイティブを AI が自動生成します。
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 animate-fade-in-up animation-delay-300">
                        <LoginButton className="group relative">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-violet-600 blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                            <div className="relative px-10 py-4 rounded-full bg-gradient-to-r from-orange-500 to-violet-600 text-white font-bold text-lg hover:scale-105 transition-all shadow-lg flex items-center">
                                無料で始める
                                <span className="ml-2">→</span>
                            </div>
                        </LoginButton>
                        <Link href="#how-it-works">
                            <button className="px-10 py-4 rounded-full bg-white border border-gray-200 text-gray-700 font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                                使い方を見る
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <GallerySection />

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 relative z-10 scroll-mt-20">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-6">
                            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">How It Works</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-relaxed">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-violet-600 p-2 -m-2 inline-block">3ステップ</span>で完成
                        </h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            複雑な操作は一切不要。直感的なインターフェースで<br className="hidden md:block" />
                            誰でも簡単にプロ品質の広告を作成できます。
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                step: '01',
                                title: 'フォーマットかテンプレートを選択',
                                desc: '8種類の広告フォーマットから選ぶか、32種類のテンプレートから作成を開始。用途に合う土台をすぐ決められます。',
                                icon: '📐',
                                gradient: 'from-orange-500 to-pink-500'
                            },
                            {
                                step: '02',
                                title: '内容を入力',
                                desc: '商品名やオファー、ターゲット、カスタム指示を入力。必要なら参考画像も追加して、生成精度をさらに高められます。',
                                icon: '✏️',
                                gradient: 'from-pink-500 to-violet-500'
                            },
                            {
                                step: '03',
                                title: '生成して必要なら編集',
                                desc: 'Gemini が広告画像を生成。気に入ったものは保存し、有料プランなら AI 編集でさらに細かくブラッシュアップできます。',
                                icon: '✨',
                                gradient: 'from-violet-500 to-blue-500'
                            }
                        ].map((item, i) => (
                            <div key={i} className="relative group">
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-gray-200 to-transparent" />
                                )}
                                <div className="relative p-8 rounded-3xl bg-white border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl group-hover:shadow-gray-200/50">
                                    <div className={`absolute -top-4 left-8 px-4 py-1 rounded-full bg-gradient-to-r ${item.gradient} text-xs font-black text-white shadow-lg`}>
                                        STEP {item.step}
                                    </div>
                                    <div className="w-20 h-20 rounded-2xl mb-6 relative flex items-center justify-center">
                                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-10`} />
                                        <span className="relative text-4xl">{item.icon}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                                    <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-16">
                        <LoginButton className="group inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold transition-colors">
                            今すぐ試してみる
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </LoginButton>
                    </div>
                </div>
            </section>

            {/* AI Editor Showcase Section */}
            <AIEditorShowcase />

            {/* Features Section */}
            <section id="features" className="py-20 relative z-10 bg-gray-50/50 scroll-mt-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 mb-6">
                            <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Premium Features</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-relaxed">
                            クリエイティブ制作を<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-blue-600 p-2 -m-2 inline-block">もっと自由に</span>
                        </h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            広告制作の常識を変える、AI Generatorの強力な機能。<br className="hidden md:block" />
                            最新のAIモデルが、あなたのビジネスを加速させます。
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {featureCards.map((feature, i) => (
                            <div
                                key={i}
                                className="group relative p-10 rounded-3xl bg-white border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
                            >
                                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                                    {feature.emoji}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                                <div className={`mt-8 w-12 h-1 rounded-full bg-gradient-to-r ${feature.gradient} opacity-30 group-hover:w-20 group-hover:opacity-100 transition-all duration-500`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Target Users Section */}
            <TargetUsersSection />

            {/* Pricing Section */}
            <section id="pricing" className="py-20 relative z-10 scroll-mt-20">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-6">
                            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Pricing</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-gray-900">
                            シンプルな料金プラン
                        </h2>
                        <p className="text-lg text-gray-500">
                            Free から始めて、必要に応じてアップグレード。<span className="text-orange-600 font-semibold">全プラン商用利用OK。</span>
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {landingPlans.map((plan) => (
                            <div
                                key={plan.id}
                                className={plan.featured
                                    ? 'relative p-8 rounded-3xl bg-gradient-to-br from-orange-500 via-pink-500 to-violet-600 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl flex flex-col text-white'
                                    : 'relative p-8 rounded-3xl bg-white border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl flex flex-col'}
                            >
                                {plan.featured && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-xs font-black text-violet-600 uppercase tracking-wider shadow-lg">
                                        人気
                                    </div>
                                )}

                                <h3 className={`text-xl font-bold mb-2 ${plan.featured ? 'text-white mt-2' : 'text-gray-900'}`}>{plan.name}</h3>
                                <div className="flex items-baseline mb-1">
                                    <span className={`text-4xl font-black ${plan.featured ? 'text-white' : 'text-gray-900'}`}>¥{plan.price.toLocaleString()}</span>
                                    {plan.price > 0 && (
                                        <span className={`${plan.featured ? 'text-white/70' : 'text-gray-400'} text-sm font-medium ml-1`}>/月</span>
                                    )}
                                </div>
                                <p className={`text-xs font-medium mb-8 uppercase tracking-wide ${plan.featured ? 'text-white/80' : 'text-gray-400'}`}>{plan.tagline}</p>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((item, i) => (
                                        <li key={i} className={`flex items-start gap-3 text-sm ${plan.featured ? 'text-white/90' : 'text-gray-600'}`}>
                                            {plan.featured ? (
                                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            ) : (
                                                <svg className={`w-5 h-5 ${plan.accentClassName} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            )}
                                            {item}
                                        </li>
                                    ))}
                                </ul>

                                <LoginButton className={plan.ctaClassName}>
                                    {plan.ctaLabel}
                                </LoginButton>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 relative z-10 bg-gray-50/50 scroll-mt-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 mb-6">
                            <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">FAQ</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-gray-900">よくある質問</h2>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all">
                                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                                <p className="text-gray-500">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-violet-600">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] opacity-30" />
                </div>
                <div className="absolute top-0 left-0 right-0 h-24 bg-gray-50" style={{ clipPath: 'ellipse(60% 100% at 50% 0%)' }} />
                <div className="container mx-auto px-6 relative z-10 text-center pt-16">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 tracking-tight">
                        今すぐ無料で始めましょう
                    </h2>
                    <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
                        クレジットカード不要。1分でアカウント作成。<br />
                        あなたのクリエイティブワークフローを劇的に加速させます。
                    </p>
                    <LoginButton className="px-12 py-5 bg-white text-violet-600 rounded-full font-bold text-xl hover:bg-gray-50 hover:scale-105 transition-all shadow-2xl">
                        無料で始める
                    </LoginButton>
                    <p className="mt-6 text-sm text-white/70">
                        3クレジット無料付与 • いつでも解約可能
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 border-t border-gray-800 py-16 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col items-center justify-center gap-8 text-center mb-12">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-violet-600 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-white font-bold text-xl tracking-tight">AI Generator</span>
                        </div>
                        <nav className="flex flex-wrap justify-center gap-x-10 gap-y-4">
                            <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">利用規約</Link>
                            <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">プライバシー</Link>
                            <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">お問い合わせ</Link>
                        </nav>
                    </div>
                    <div className="border-t border-gray-800 pt-8 flex justify-center items-center">
                        <p className="text-xs text-gray-500">
                            © 2026 AI Generator. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
