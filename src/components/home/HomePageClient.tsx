'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LoginButton } from '@/components/auth/LoginButton';
import { useLoginModalStore } from '@/store/useLoginModalStore';
import { useState } from 'react';
import { PRICING_PLANS } from '@/types/billing';
import { GallerySection } from '@/components/landing/GallerySection';
import { AIEditorShowcase } from '@/components/landing/AIEditorShowcase';
import { TargetUsersSection } from '@/components/landing/TargetUsersSection';

export default function HomePage() {
    const { openModal } = useLoginModalStore();
    const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
    const [activeHowItWorksStep, setActiveHowItWorksStep] = useState(0);

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

    const howItWorksSteps = [
        {
            step: '01',
            title: 'フォーマットかテンプレートを選択',
            desc: '8種類の広告フォーマットから選ぶか、32種類のテンプレートから作成を開始。用途に合う土台をすぐ決められます。',
            icon: '📐',
            gradient: 'from-orange-500 to-pink-500',
            eyebrow: 'Start',
            meta: '最初の土台を10秒で決定',
            previewTitle: 'テンプレートギャラリー',
            previewCaption: 'カテゴリを選んで、用途に合う構図からスタート',
            previewTags: ['SNS広告', 'ECバナー', 'キャンペーン', '限定オファー'],
            previewImage: '/images/how-it-works/step-1.png'
        },
        {
            step: '02',
            title: '内容を入力',
            desc: '商品名やオファー、ターゲット、カスタム指示を入力。必要なら参考画像も追加して、生成精度をさらに高められます。',
            icon: '✏️',
            gradient: 'from-pink-500 to-violet-500',
            eyebrow: 'Prompt',
            meta: '参考画像の追加にも対応',
            previewTitle: '入力パネル',
            previewCaption: '商品情報、訴求、ターゲットをまとめて指定',
            previewTags: ['商品名', 'オファー', 'ターゲット', '参考画像'],
            previewImage: '/images/how-it-works/step-2.png'
        },
        {
            step: '03',
            title: '生成して必要なら編集',
            desc: 'Gemini が広告画像を生成。気に入ったものは保存し、有料プランなら AI 編集でさらに細かくブラッシュアップできます。',
            icon: '✨',
            gradient: 'from-violet-500 to-blue-500',
            eyebrow: 'Polish',
            meta: '完成後のブラッシュアップも一画面で',
            previewTitle: '生成結果とAI編集',
            previewCaption: '完成画像を確認して、そのまま文言や演出を微調整',
            previewTags: ['4案を比較', '保存', 'AI編集', '商用利用'],
            previewImage: '/images/how-it-works/step-3.png'
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

    const openHowItWorks = (step = 0) => {
        setActiveHowItWorksStep(step);
        setIsHowItWorksOpen(true);
    };

    const handleStartFree = () => {
        setIsHowItWorksOpen(false);
        openModal();
    };

    const activeStep = howItWorksSteps[activeHowItWorksStep];

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
                        <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            使い方
                        </Link>
                        <Link href="#ai-edit" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            AI編集
                        </Link>
                        <Link href="#targets" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            活用シーン
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
                        <button
                            type="button"
                            onClick={() => openHowItWorks()}
                            className="px-10 py-4 rounded-full bg-white border border-gray-200 text-gray-700 font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                            使い方を見る
                        </button>
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
                        {howItWorksSteps.map((item, i) => (
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

            {isHowItWorksOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4">
                    <button
                        type="button"
                        aria-label="使い方を閉じる"
                        className="absolute inset-0 bg-[rgba(46,24,14,0.48)] backdrop-blur-md"
                        onClick={() => setIsHowItWorksOpen(false)}
                    />
                    <div className="relative z-10 max-h-[92vh] w-full max-w-[1240px] overflow-y-auto rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,251,247,0.98),rgba(255,247,237,0.95)_48%,rgba(250,245,255,0.96)_100%)] text-gray-900 shadow-[0_34px_120px_-40px_rgba(76,29,12,0.35)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.16),transparent_34%),radial-gradient(circle_at_78%_12%,rgba(217,70,239,0.14),transparent_24%),radial-gradient(circle_at_24%_80%,rgba(249,115,22,0.10),transparent_28%)]" />
                        <div className="absolute inset-x-0 top-0 h-px bg-white/80" />

                        <div className="relative flex items-start justify-between px-6 pb-3 pt-4 sm:px-8 lg:px-12">
                            <div className="flex-1" />
                            <div className="flex flex-col items-center text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-fuchsia-500 shadow-[0_18px_40px_-12px_rgba(249,115,22,0.45)] sm:h-16 sm:w-16">
                                    <svg className="h-7 w-7 text-white sm:h-9 sm:w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 5v14l11-7-11-7z" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl lg:text-[3.25rem]">
                                    AI画像生成デモンストレーション
                                </h3>
                                <p className="mt-2 text-sm text-stone-500 sm:text-base">
                                    簡単3ステップでプロ品質の広告クリエイティブを作成
                                </p>
                            </div>
                            <div className="flex flex-1 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsHowItWorksOpen(false)}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-white/70 hover:text-stone-700"
                                >
                                    <span className="text-3xl leading-none">×</span>
                                </button>
                            </div>
                        </div>

                        <div className="relative border-b border-stone-200/70 px-5 pb-4 sm:px-8 lg:px-12">
                            <div className="mx-auto flex w-fit items-center justify-center gap-3 sm:gap-4">
                                {howItWorksSteps.map((item, index) => (
                                    <div key={item.step} className="flex items-center gap-3 sm:gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setActiveHowItWorksStep(index)}
                                            className={`relative flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black transition-all sm:h-14 sm:w-14 sm:text-xl ${index === activeHowItWorksStep
                                                ? 'bg-gradient-to-r from-orange-500 to-fuchsia-500 text-white shadow-[0_18px_36px_-18px_rgba(249,115,22,0.45)]'
                                                : 'bg-stone-200/90 text-stone-500 hover:bg-stone-300/90'
                                                }`}
                                        >
                                            {index + 1}
                                        </button>
                                        {index < howItWorksSteps.length - 1 && (
                                            <div className="h-1 w-24 rounded-full bg-stone-200 sm:w-36">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${index < activeHowItWorksStep ? 'bg-gradient-to-r from-orange-500 to-fuchsia-500' : 'bg-transparent'}`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(420px,1fr)] lg:px-12 lg:py-8">
                            <div className="flex min-h-0 flex-col justify-center">
                                <div className="inline-flex w-fit items-center rounded-full border border-orange-200 bg-orange-50 px-5 py-2 text-sm font-bold text-orange-700">
                                    ステップ {activeStep.step}
                                </div>
                                <h4 className="mt-6 max-w-none text-[2.5rem] font-black leading-[1.2] tracking-tight text-stone-950 sm:text-[3rem] lg:text-[3.5rem]" style={{ wordBreak: 'keep-all', overflowWrap: 'anywhere' }}>
                                    {activeStep.title}
                                </h4>
                                <p className="mt-6 max-w-xl text-base leading-8 text-stone-600 sm:text-lg">
                                    {activeStep.desc}
                                </p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    {activeStep.previewTags.map((tag) => (
                                        <span key={tag} className="rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-semibold text-stone-600 shadow-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-8 rounded-[28px] border border-orange-100 bg-white/75 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">補足</p>
                                    <p className="mt-3 text-sm leading-7 text-stone-600">
                                        ここでは流れだけを短く確認できます。各ステップの説明と画像をあとから差し替えやすいよう、余白と表示領域を固定したレイアウトにしています。
                                    </p>
                                </div>
                            </div>

                            <div className="min-h-0">
                                <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-[28px] border border-stone-200/80 bg-white/90 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.18)]">
                                    <div className="flex items-center justify-between border-b border-stone-200/80 px-5 py-4">
                                        <div>
                                            <p className="text-lg font-bold text-stone-900">{activeStep.previewTitle}</p>
                                            <p className="mt-1 text-sm text-stone-500">{activeStep.previewCaption}</p>
                                        </div>
                                        <div className="h-3.5 w-3.5 rounded-full bg-orange-400" />
                                    </div>

                                    <div className="grid min-h-0 flex-1 gap-4 p-5">
                                        <div className="flex min-h-[320px] flex-1 flex-col rounded-[24px] border border-orange-100 bg-[linear-gradient(180deg,rgba(255,247,237,0.9),rgba(255,255,255,0.95))] p-4 sm:p-5">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-stone-900">画面イメージ</p>
                                                    <p className="mt-1 text-sm text-stone-500">各ステップに対応する画面をそのまま確認できます</p>
                                                </div>
                                                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                                                    16:10 推奨
                                                </span>
                                            </div>
                                            <div className="relative mt-4 flex flex-1 items-center justify-center overflow-hidden rounded-[20px] border border-white/90 bg-white shadow-inner">
                                                <Image
                                                    src={activeStep.previewImage}
                                                    alt={activeStep.previewTitle}
                                                    fill
                                                    sizes="(max-width: 1024px) 100vw, 640px"
                                                    className="object-contain object-center"
                                                />
                                            </div>
                                        </div>
                                        <div className="rounded-[24px] border border-stone-200 bg-stone-50/80 p-5">
                                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-400">このステップで伝えること</p>
                                            <p className="mt-3 text-base font-bold text-stone-900">{activeStep.meta}</p>
                                            <p className="mt-2 text-sm leading-7 text-stone-600">
                                                画像を差し込んだあとも説明文が暴れないよう、文章量と余白を一定に保つ構成にしています。
                                            </p>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {activeStep.previewTags.map((tag) => (
                                                    <span key={`${activeStep.step}-${tag}`} className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-stone-500 shadow-sm">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-stone-200/70 bg-white/90 px-6 py-4 backdrop-blur-md sm:px-8 lg:px-12">
                            <button
                                type="button"
                                onClick={() => setActiveHowItWorksStep((prev) => Math.max(prev - 1, 0))}
                                disabled={activeHowItWorksStep === 0}
                                className="inline-flex min-w-[160px] items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 py-4 text-lg font-bold text-stone-700 transition-all hover:border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                                前のステップ
                            </button>

                            <div className="hidden items-center gap-3 md:flex">
                                {howItWorksSteps.map((item, index) => (
                                    <button
                                        key={`${item.step}-dot`}
                                        type="button"
                                        onClick={() => setActiveHowItWorksStep(index)}
                                        className={`h-4 w-4 rounded-full transition-all ${index === activeHowItWorksStep ? 'bg-orange-500' : 'bg-stone-300 hover:bg-stone-400'}`}
                                    />
                                ))}
                            </div>

                            {activeHowItWorksStep === howItWorksSteps.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={handleStartFree}
                                    className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-fuchsia-500 px-6 py-4 text-lg font-bold text-white shadow-[0_18px_40px_-18px_rgba(249,115,22,0.45)] transition-all hover:brightness-105"
                                >
                                    無料で始める
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setActiveHowItWorksStep((prev) => Math.min(prev + 1, howItWorksSteps.length - 1))}
                                    className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-fuchsia-500 px-6 py-4 text-lg font-bold text-white shadow-[0_18px_40px_-18px_rgba(249,115,22,0.45)] transition-all hover:brightness-105"
                                >
                                    次のステップ
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
