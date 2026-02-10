import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'お問い合わせ | AI Generator',
    description: 'AI Generatorに関するお問い合わせはこちらから',
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

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pt-20">
            <Header />

            <main className="container mx-auto px-6 py-16 max-w-2xl">
                <h1 className="text-3xl md:text-4xl font-black mb-8 text-center">お問い合わせ</h1>
                <p className="text-gray-500 mb-12 text-center max-w-lg mx-auto">
                    ご質問やご不明な点がございましたら、お気軽にお問い合わせください。<br className="hidden md:block" />
                    通常24時間以内にご返信いたします。
                </p>

                <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm">
                    <form className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
                                お名前 <span className="text-orange-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all outline-none"
                                placeholder="山田 太郎"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                                メールアドレス <span className="text-orange-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all outline-none"
                                placeholder="taro.yamada@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-sm font-bold text-gray-900 mb-2">
                                件名 <span className="text-orange-500">*</span>
                            </label>
                            <select
                                id="subject"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all outline-none"
                                required
                            >
                                <option value="">選択してください</option>
                                <option value="service">サービスについて</option>
                                <option value="account">アカウント・ログインについて</option>
                                <option value="billing">料金・お支払いについて</option>
                                <option value="bug">不具合の報告</option>
                                <option value="other">その他</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-bold text-gray-900 mb-2">
                                お問い合わせ内容 <span className="text-orange-500">*</span>
                            </label>
                            <textarea
                                id="message"
                                rows={5}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all outline-none resize-none"
                                placeholder="お問い合わせ内容をご記入ください"
                                required
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-violet-600 text-white font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg shadow-violet-200"
                            >
                                送信する
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
