// ========================================
// ダッシュボードレイアウト
// LPに合わせたモダンなデザイン
// ========================================

'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

import { signOut } from '@/lib/auth-client';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, userDoc, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

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
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-purple-50 to-indigo-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center animate-pulse">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 font-medium">読み込み中...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const navItems = [
        {
            href: '/dashboard', label: 'ダッシュボード', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            href: '/create', label: '新規作成', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            )
        },
        {
            href: '/history', label: '履歴', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            href: '/settings', label: '設定', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            href: '/pricing', label: '料金プラン', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-purple-50/30 to-indigo-50/50 flex relative">
            {/* 背景デコレーション */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-200/20 to-transparent rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full blur-[100px]" />
            </div>

            {/* サイドバー */}
            <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 hidden md:flex flex-col fixed inset-y-0 left-0 z-50 shadow-xl shadow-gray-200/20">
                {/* ロゴ */}
                <Link href="/" className="h-16 flex items-center gap-3 px-6 border-b border-gray-100 group">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-purple-600">
                        AI Generator
                    </span>
                </Link>

                {/* ナビゲーション */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* クレジット表示 */}
                <div className="p-4 border-t border-gray-100">
                    <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">クレジット残高</span>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-purple-600">
                                {userDoc?.credits ?? 0}
                            </span>
                        </div>
                        <Link href="/pricing" className="text-xs text-purple-600 hover:text-purple-700 font-medium hover:underline">
                            クレジットを追加 →
                        </Link>
                    </div>
                </div>

                {/* ユーザー情報 */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        {user.image ? (
                            <img
                                src={user.image}
                                alt={user.name || 'ユーザー'}
                                className="w-10 h-10 rounded-full object-cover shadow-lg"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'ユーザー'}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="ログアウト"
                            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* メインコンテンツ */}
            <main className="flex-1 md:ml-64 p-8 relative z-10">
                {children}
            </main>
        </div>
    );
}
