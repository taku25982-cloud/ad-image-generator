'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLoginModalStore } from '@/store/useLoginModalStore';
import { signIn } from '@/lib/auth-client';

export function LoginModal() {
    const { isOpen, closeModal } = useLoginModalStore();
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setIsVisible(true), 0);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 350);
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // ESCキーでモーダルを閉じる
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, closeModal]);

    const handleGoogleLogin = useCallback(async () => {
        try {
            setLoading(true);
            await signIn.social({
                provider: "google",
                callbackURL: "/dashboard",
            });
        } catch (err) {
            console.error('Login error:', err);
            setLoading(false);
        }
    }, []);

    if (!isOpen && !isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-350 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            role="dialog"
            aria-modal="true"
            aria-label="ログイン"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-md"
                onClick={closeModal}
            />

            {/* Modal */}
            <div
                className={`relative w-full max-w-[420px] overflow-hidden rounded-3xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] transition-all duration-350 transform ${isOpen
                        ? 'scale-100 translate-y-0'
                        : 'scale-95 translate-y-6'
                    }`}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        background: `
                            linear-gradient(135deg, #FF8748 0%, #E85D75 35%, #9F7AEA 65%, #6B46C1 100%)
                        `,
                    }}
                />

                {/* ── 上部: メッシュグラデーション領域 ── */}
                <div className="relative px-8 pt-8 pb-10 overflow-hidden">
                    {/* 装飾: 浮遊オーブ */}
                    <div className="absolute top-[-30px] right-[-20px] w-36 h-36 bg-white/15 rounded-full blur-2xl animate-pulse-soft" />
                    <div className="absolute bottom-[-40px] left-[-20px] w-44 h-44 bg-orange-300/20 rounded-full blur-3xl animate-pulse-soft animation-delay-500" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-400/10 rounded-full blur-3xl" />

                    {/* 閉じるボタン */}
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 rounded-full transition-all duration-200 cursor-pointer"
                        aria-label="閉じる"
                    >
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* ロゴ & テキスト */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                        {/* ロゴアイコン */}
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-4 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
                            AI Generator
                        </h2>
                        <p className="text-white/75 text-sm leading-relaxed">
                            プロ品質の広告クリエイティブを、<br />AIで瞬時に作成
                        </p>
                    </div>
                </div>

                {/* ── 下部: 白背景のアクション領域 ── */}
                <div className="relative px-8 pt-6 pb-6">

                    {/* Google ログインボタン */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="relative w-full h-[52px] flex items-center justify-center gap-3 rounded-2xl border border-white/45 bg-white/92 text-[15px] font-semibold text-gray-700 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)] transition-all duration-200 hover:bg-white hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer group backdrop-blur-sm"
                    >
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <span className="inline-block w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-gray-500">接続中...</span>
                            </div>
                        ) : (
                            <>
                                <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform duration-200" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Googleで続ける</span>
                            </>
                        )}
                    </button>

                    {/* セパレーター */}
                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/25" />
                        </div>
                    </div>

                    {/* 特徴バッジ群 */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border border-white/30 bg-white/28 backdrop-blur-sm">
                            <svg className="w-4.5 h-4.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="text-[11px] font-semibold text-white">高速生成</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border border-white/30 bg-white/28 backdrop-blur-sm">
                            <svg className="w-4.5 h-4.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[11px] font-semibold text-white">プロ品質</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border border-white/30 bg-white/28 backdrop-blur-sm">
                            <svg className="w-4.5 h-4.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-[11px] font-semibold text-white">安全・安心</span>
                        </div>
                    </div>

                    {/* 利用規約 */}
                    <p className="text-[11px] text-white/72 text-center leading-relaxed">
                        ログインすることで、
                        <a href="/terms" className="text-white hover:text-white/85 underline underline-offset-2 transition-colors">利用規約</a>
                        および
                        <a href="/privacy" className="text-white hover:text-white/85 underline underline-offset-2 transition-colors">プライバシーポリシー</a>
                        に同意したものとみなします。
                    </p>
                </div>
            </div>
        </div>
    );
}
