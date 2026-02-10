import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '利用規約 | AI Generator',
    description: 'AI Generatorの利用規約です。',
};

// ヘッダーコンポーネント（LPと共通のデザイン）
const Header = () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500 to-violet-600 opacity-90" />
                    <svg className="w-5 h-5 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <span className="font-bold text-xl tracking-tight text-gray-900">
                    AI Generator
                </span>
            </Link>
            <nav className="flex items-center gap-6">
                <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                    トップへ戻る
                </Link>
            </nav>
        </div>
    </header>
);

// フッターコンポーネント
const Footer = () => (
    <footer className="bg-white border-t border-gray-100 py-12 relative z-10 mt-20">
        <div className="container mx-auto px-6 text-center">
            <p className="text-xs text-gray-500">
                © 2026 AI Generator. All rights reserved.
            </p>
        </div>
    </footer>
);

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pt-20">
            <Header />

            <main className="container mx-auto px-6 py-16 max-w-4xl">
                <h1 className="text-3xl md:text-4xl font-black mb-8">利用規約</h1>
                <p className="text-gray-500 mb-12">最終更新日: 2026年2月10日</p>

                <div className="space-y-12 bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm">
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">01</span>
                            総則
                        </h2>
                        <div className="prose prose-gray max-w-none text-gray-600 text-sm leading-relaxed space-y-4">
                            <p>
                                本利用規約（以下「本規約」といいます。）は、AI Generator（以下「当社」といいます。）が提供するサービス（以下「本サービス」といいます。）の利用条件を定めるものです。登録ユーザーの皆様（以下「ユーザー」といいます。）には、本規約に従って本サービスをご利用いただきます。
                            </p>
                            <p>
                                ユーザーが本サービスを利用することをもって、本規約に同意したものとみなします。
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">02</span>
                            アカウント登録
                        </h2>
                        <div className="prose prose-gray max-w-none text-gray-600 text-sm leading-relaxed space-y-4">
                            <p>
                                本サービスの利用を希望する者は、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
                            </p>
                            <p>
                                当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>虚偽の事項を届け出た場合</li>
                                <li>本規約に違反したことがある者からの申請である場合</li>
                                <li>その他、当社が利用登録を相当でないと判断した場合</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">03</span>
                            禁止事項
                        </h2>
                        <div className="prose prose-gray max-w-none text-gray-600 text-sm leading-relaxed space-y-4">
                            <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>法令または公序良俗に違反する行為</li>
                                <li>犯罪行為に関連する行為</li>
                                <li>本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為</li>
                                <li>当社、ほかのユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                                <li>本サービスによって得られた情報を商業的に利用する行為（当社が認めた場合を除く）</li>
                                <li>当社のサービスの運営を妨害するおそれのある行為</li>
                                <li>不正アクセスをし、またはこれを試みる行為</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">04</span>
                            免責事項
                        </h2>
                        <div className="prose prose-gray max-w-none text-gray-600 text-sm leading-relaxed space-y-4">
                            <p>
                                当社は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
                            </p>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
