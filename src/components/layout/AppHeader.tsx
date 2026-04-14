'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLoginModalStore } from '@/store/useLoginModalStore';
import { useFeedbackModalStore } from '@/store/useFeedbackModalStore';
import { signOut } from '@/lib/auth-client';
import { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import { Menu, X, Settings, LogOut, Plus } from 'lucide-react';
import { SHOW_BRAND_FEATURES, SHOW_PROJECT_FEATURES, SHOW_VIDEO_FEATURES } from '@/lib/feature-flags';

export function AppHeader() {
    const { user, userDoc } = useAuth();
    const pathname = usePathname();
    const isHydrated = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { openModal } = useLoginModalStore();
    const { openFeedback } = useFeedbackModalStore();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    window.location.href = '/';
                }
            }
        });
    };

    const navItems = [
        {
            href: '/dashboard', label: 'ダッシュボード', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            href: '/create', label: '画像生成', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            )
        },
        {
            href: '/edit', label: '画像編集', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            )
        },
        {
            href: '/video', label: '動画作成', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            href: '/templates', label: 'テンプレート', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            href: '/brand-kits', label: 'ブランド', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.023.195 1.414.586l6 6a2 2 0 010 2.828l-4.586 4.586a2 2 0 01-2.828 0l-6-6A2 2 0 015 9V4a1 1 0 011-1h1z" />
                </svg>
            )
        },
        {
            href: '/projects', label: '案件', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
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
            href: '/pricing', label: '料金プラン', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            )
        },
    ];
    const visibleNavItems = navItems.filter((item) => {
        if (item.href === '/video' && !SHOW_VIDEO_FEATURES) return false;
        if (item.href === '/brand-kits' && !SHOW_BRAND_FEATURES) return false;
        if (item.href === '/projects' && !SHOW_PROJECT_FEATURES) return false;
        return true;
    });
    const isAuthenticated = isHydrated && Boolean(user);

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* ロゴ */}
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-purple-600 hidden sm:block">
                            AI Generator
                        </span>
                    </Link>

                    {/* ナビゲーション (PC) */}
                    {isAuthenticated && (
                        <nav className="hidden md:flex items-center gap-1 mx-4">
                            {visibleNavItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <button
                                        key={item.href}
                                        onClick={() => {
                                            if (item.href.includes('feedback')) {
                                                openFeedback();
                                            } else {
                                                window.location.href = item.href;
                                            }
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${isActive
                                            ? 'bg-gradient-to-r from-orange-50 to-purple-50 text-purple-700 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>
                    )}

                    {/* 右側アクション */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                {/* クレジット表示 */}
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-purple-50 rounded-full border border-purple-100 hidden sm:flex">
                                    <span className="text-xs text-gray-500">クレジット:</span>
                                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">
                                        {userDoc?.credits ?? 0}
                                    </span>
                                    <Link
                                        href="/pricing"
                                        className="ml-1 flex items-center gap-1 px-2 py-0.5 bg-purple-100/80 hover:bg-purple-200 text-purple-700 text-xs font-semibold rounded-full transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                        追加
                                    </Link>
                                </div>

                                {/* ユーザー情報＆ログアウト */}
                                <div className="relative flex items-center gap-3" ref={profileMenuRef}>
                                    <button
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="focus:outline-none transition-transform hover:scale-105"
                                    >
                                        {user?.image ? (
                                            <span className="relative hidden h-9 w-9 overflow-hidden rounded-full border-2 border-transparent shadow-sm transition-colors hover:border-purple-200 sm:block">
                                                <Image
                                                    src={user.image}
                                                    alt={user.name || 'ユーザー'}
                                                    fill
                                                    sizes="36px"
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                            </span>
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-orange-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-sm hidden sm:flex border-2 border-transparent hover:border-purple-200 transition-colors">
                                                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </button>

                                    {/* ドロップダウンメニュー */}
                                    {isProfileMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 py-1.5 z-50 overflow-hidden transform origin-top-right transition-all">
                                            <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50 mb-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'ユーザー'}</p>
                                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                            </div>

                                            <Link
                                                href="/settings"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                                            >
                                                <Settings className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                                                設定
                                            </Link>

                                            <Link
                                                href="/pricing"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                                            >
                                                <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                                料金プラン
                                            </Link>

                                            <div className="my-1 border-t border-gray-50"></div>

                                            <button
                                                onClick={() => {
                                                    setIsProfileMenuOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-500" />
                                                ログアウト
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4 hidden sm:flex">
                                <button onClick={openModal} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                                    ログイン
                                </button>
                                <button onClick={openModal} className="px-5 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all">
                                    無料で始める
                                </button>
                            </div>
                        )}

                        {/* モバイルメニューボタン */}
                        <button
                            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* モバイルメニューナビゲーション */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <nav className="flex flex-col p-4 space-y-1">
                        {isAuthenticated ? (
                            <>
                                <div className="px-4 py-2 mb-2 flex items-center justify-between bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg">
                                    <span className="text-sm text-gray-600">保有クレジット</span>
                                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">
                                        {userDoc?.credits ?? 0}
                                    </span>
                                </div>
                                {visibleNavItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <button
                                            key={item.href}
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                if (item.href.includes('feedback')) {
                                                    openFeedback();
                                                } else {
                                                    window.location.href = item.href;
                                                }
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                                                ? 'bg-gradient-to-r from-orange-50 to-purple-50 text-purple-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        openModal();
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors text-left"
                                >
                                    ログイン
                                </button>
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        openModal();
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-medium shadow-sm transition-colors text-left"
                                >
                                    無料で始める
                                </button>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
