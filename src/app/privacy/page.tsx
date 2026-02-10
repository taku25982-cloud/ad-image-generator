import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'プライバシーポリシー | AI Generator',
    description: 'AI Generatorのプライバシーポリシーです。',
};

// ヘッダーコンポーネント
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

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pt-20">
            <Header />

            <main className="container mx-auto px-6 py-16 max-w-4xl">
                <h1 className="text-3xl md:text-4xl font-black mb-8">プライバシーポリシー</h1>
                <p className="text-gray-500 mb-12">最終更新日: 2026年2月10日</p>

                <div className="space-y-12 bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm">
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">01</span>
                            個人情報の収集
                        </h2>
                        <div className="prose prose-gray max-w-none text-gray-600 text-sm leading-relaxed space-y-4">
                            <p>
                                当社は、ユーザーが本サービスを利用する際に、氏名、メールアドレス、クレジットカード情報などの個人情報をお尋ねすることがあります。また、ユーザーと提携先などとの間でなされた、ユーザーの個人情報を含む取引記録や決済に関する情報を、当社の提携先から収集することがあります。
                            </p>
                            <p>
                                ユーザーが本サービスを利用する際、Cookie（クッキー）や類似の技術を使用して情報を収集することがあります。
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">02</span>
                            個人情報の利用目的
                        </h2>
                        <div className="prose prose-gray max-w-none text-gray-600 text-sm leading-relaxed space-y-4">
                            <p>当社が個人情報を収集・利用する目的は以下のとおりです。</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>サービスの提供・運営のため</li>
                                <li>ユーザーからのお問い合わせに回答するため</li>
                                <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
                                <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
                                <li>ユーザーにご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">03</span>
                            個人情報の第三者提供
                        </h2>
                        <div className="prose prose-gray max-w-none text-gray-600 text-sm leading-relaxed space-y-4">
                            <p>
                                当社は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>法令に基づく場合</li>
                                <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">04</span>
                            個人情報の管理
                        </h2>
                        <div className="prose prose-gray max-w-none text-gray-600 text-sm leading-relaxed space-y-4">
                            <p>
                                当社は、利用者の個人情報を正確かつ最新の状態に保ち、個人情報への不正アクセス・紛失・破損・改ざん・漏洩などを防止するため、セキュリティシステムの維持・管理体制の整備・社員教育の徹底等の必要な措置を講じ、安全対策を実施し個人情報の厳重な管理を行ないます。
                            </p>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
