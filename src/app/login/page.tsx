// ========================================
// ログインページ
// Premium Login Experience
// ========================================

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/lib/firebase/auth';

function LoginContent() {
    const searchParams = useSearchParams();
    const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // URLパラメータが変更されたときにモードを更新
    useEffect(() => {
        const modeParam = searchParams.get('mode');
        if (modeParam === 'signup') {
            setMode('signup');
        }
    }, [searchParams]);

    const handleGoogleLogin = async () => {
        try {
            setGoogleLoading(true);
            setError(null);
            await signInWithGoogle();
            router.push('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError('Googleログインに失敗しました。もう一度お試しください。');
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError('メールアドレスとパスワードを入力してください。');
            return;
        }

        if (mode === 'signup' && password.length < 6) {
            setError('パスワードは6文字以上で設定してください。');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            if (mode === 'login') {
                await signInWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password, displayName || undefined);
            }

            router.push('/dashboard');
        } catch (err: any) {
            console.error('Auth error:', err);

            // Firebase エラーメッセージの日本語化
            if (err.code === 'auth/user-not-found') {
                setError('このメールアドレスは登録されていません。');
            } else if (err.code === 'auth/wrong-password') {
                setError('パスワードが正しくありません。');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('このメールアドレスは既に使用されています。');
            } else if (err.code === 'auth/invalid-email') {
                setError('メールアドレスの形式が正しくありません。');
            } else if (err.code === 'auth/weak-password') {
                setError('パスワードが弱すぎます。6文字以上で設定してください。');
            } else {
                setError(mode === 'login'
                    ? 'ログインに失敗しました。もう一度お試しください。'
                    : '登録に失敗しました。もう一度お試しください。');
            }
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode: 'login' | 'signup') => {
        setMode(newMode);
        setError(null);
        // フォームをクリア
        setEmail('');
        setPassword('');
        setDisplayName('');
    };

    return (
        <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4 relative overflow-hidden">
            {/* 装飾要素 */}
            <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-gradient-to-br from-[var(--primary-200)] to-[var(--primary-100)] rounded-full blur-[100px] opacity-50" />
            <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-[var(--secondary-200)] to-[var(--secondary-100)] rounded-full blur-[120px] opacity-40" />
            <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-teal-200 rounded-full blur-[100px] opacity-20" />

            <div className="relative w-full max-w-md">
                {/* ロゴ */}
                <Link href="/" className="flex items-center justify-center gap-3 mb-10 group">
                    <div className="relative w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-purple-600 text-white shadow-lg overflow-hidden transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <svg className="w-7 h-7 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">AI Generator</span>
                </Link>

                {/* カード */}
                <div className="card-glass p-10 rounded-3xl shadow-2xl border border-white/50">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-3 text-[var(--text-primary)]">
                            {mode === 'login' ? 'ログイン' : '新規登録'}
                        </h1>
                        <p className="text-[var(--text-secondary)]">
                            {mode === 'login'
                                ? 'アカウントにログインしてクリエイティブを作成'
                                : '無料アカウントを作成してクリエイティブを作成'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-start gap-3">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* メール/パスワード フォーム */}
                    <form onSubmit={handleEmailSubmit} className="space-y-4 mb-6">
                        {mode === 'signup' && (
                            <div>
                                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                                    表示名（任意）
                                </label>
                                <input
                                    type="text"
                                    id="displayName"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="山田 太郎"
                                    autoComplete="name"
                                    className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-gray-400"
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                メールアドレス
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                                className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-gray-400"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                パスワード
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="6文字以上"
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-gray-400"
                                required
                                minLength={6}
                            />
                            {mode === 'signup' && (
                                <p className="text-xs text-gray-500 mt-1.5">6文字以上で設定してください</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            loading={loading}
                            variant="primary"
                            size="lg"
                            className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl mt-2"
                        >
                            {mode === 'login' ? 'ログイン' : '無料で登録'}
                        </Button>
                    </form>

                    {/* 区切り線 */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white/80 text-gray-500 rounded">または</span>
                        </div>
                    </div>

                    {/* Googleログイン */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="w-full h-14 flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {googleLoading ? (
                            <span className="inline-block w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        )}
                        Googleで{mode === 'login' ? 'ログイン' : '登録'}
                    </button>

                    {/* モード切り替え */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            {mode === 'login' ? (
                                <>
                                    アカウントをお持ちでないですか？{' '}
                                    <button
                                        type="button"
                                        onClick={() => switchMode('signup')}
                                        className="font-semibold text-purple-600 hover:text-purple-700 hover:underline"
                                    >
                                        新規登録
                                    </button>
                                </>
                            ) : (
                                <>
                                    既にアカウントをお持ちですか？{' '}
                                    <button
                                        type="button"
                                        onClick={() => switchMode('login')}
                                        className="font-semibold text-purple-600 hover:text-purple-700 hover:underline"
                                    >
                                        ログイン
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* フッター */}
                <div className="mt-10 text-center text-sm text-gray-500">
                    {mode === 'login' ? 'ログイン' : '登録'}することで
                    <Link href="#" className="text-purple-600 hover:text-purple-700 font-medium hover:underline mx-1">利用規約</Link>
                    と
                    <Link href="#" className="text-purple-600 hover:text-purple-700 font-medium hover:underline mx-1">プライバシーポリシー</Link>
                    に同意したことになります
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
