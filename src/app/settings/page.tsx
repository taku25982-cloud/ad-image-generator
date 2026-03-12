// ========================================
// 設定ページ
// ========================================

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';

import { signOut } from '@/lib/auth-client';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/AppHeader';

export default function SettingsPage() {
    const { user, userDoc, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile');

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

    // アイコンSVGコンポーネント (外部ライブラリ非依存)
    const Icon = ({ name, className = "w-5 h-5" }: { name: string, className?: string }) => {
        switch (name) {
            case 'profile':
                return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
            case 'plan':
                return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
            case 'logout':
                return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
            default:
                return null;
        }
    };

    const tabs = [
        { id: 'profile', label: 'アカウント情報', icon: 'profile' },
        { id: 'plan', label: 'プラン・お支払い', icon: 'plan' },
    ];

    return (
        <div className="min-h-screen bg-[#FDFCFB]">
            {/* 背景装飾 */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] bg-gradient-to-bl from-orange-100/40 via-purple-100/20 to-transparent rounded-full blur-3xl opacity-70" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-tr from-indigo-100/40 via-blue-50/20 to-transparent rounded-full blur-3xl opacity-70" />
            </div>

            <AppHeader />

            <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-2">設定・アカウント</h1>
                    <p className="text-gray-500 font-medium">プロフィール情報やアプリの利用状況を管理します</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                    {/* ナビゲーション */}
                    <nav className="w-full md:w-64 shrink-0 space-y-2">
                        {tabs.map((tab) => (
                            <button 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl font-bold transition-all duration-300 relative group ${
                                    activeTab === tab.id 
                                    ? 'text-purple-700 bg-white shadow-[0_4px_20px_rgb(147,51,234,0.08)] ring-1 ring-purple-100' 
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
                                }`}
                            >
                                {activeTab === tab.id && (
                                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-orange-400 to-purple-500 rounded-r-md"></div>
                                )}
                                <Icon name={tab.icon} className={`w-5 h-5 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-3'}`} />
                                {tab.label}
                            </button>
                        ))}

                        <div className="pt-6 mt-6 border-t border-gray-100">
                            <button 
                                onClick={handleLogout} 
                                className="w-full flex items-center justify-center md:justify-start gap-3.5 px-5 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors group"
                            >
                                <Icon name="logout" className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                                ログアウト
                            </button>
                        </div>
                    </nav>

                    {/* メイン コンテンツ領域 */}
                    <div className="flex-1">
                        
                        {/* 1. アカウント情報 */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 lg:p-10">
                                    <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                            <Icon name="profile" className="w-5 h-5" />
                                        </div>
                                        基本プロフィール
                                    </h2>
                                    
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10 pb-10 border-b border-gray-100/80">
                                        <div className="relative group shrink-0">
                                            {user?.image ? (
                                                <img src={user.image} alt="" className="w-28 h-28 rounded-full object-cover shadow-lg ring-4 ring-white" />
                                            ) : (
                                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white">
                                                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2 text-center sm:text-left mt-4 sm:mt-0">
                                            <h3 className="text-2xl font-extrabold text-gray-900">{user?.name || 'ゲストユーザー'}</h3>
                                            <p className="text-gray-500 font-medium">{user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">表示名</label>
                                            <div className="px-5 py-4 bg-gray-50/80 rounded-2xl border border-gray-100 font-medium text-gray-900">
                                                {user?.name || '未設定'}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">メールアドレス</label>
                                            <div className="px-5 py-4 bg-gray-50/80 rounded-2xl border border-gray-100 font-medium text-gray-900">
                                                {user?.email}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-red-100/50 shadow-[0_8px_30px_rgb(239,68,68,0.03)] p-8 lg:p-10">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 mb-2">アカウントの削除</h2>
                                            <p className="text-gray-500 text-sm leading-relaxed">これまでに作成した広告データや履歴が完全に削除されます。<br className="hidden sm:block"/>この操作は取り消せません。</p>
                                        </div>
                                        <button className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors shrink-0 w-full sm:w-auto">
                                            アカウントを削除
                                        </button>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* 3. プラン・お支払い */}
                        {activeTab === 'plan' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 lg:p-10">
                                    <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                            <Icon name="plan" className="w-5 h-5" />
                                        </div>
                                        プランと利用状況
                                    </h2>

                                    <div className="flex flex-col lg:flex-row gap-10">
                                        {/* 左側：現在のプラン詳細 */}
                                        <div className="flex-1 space-y-6">
                                            <div className="flex items-end gap-3">
                                                <h3 className="text-3xl font-extrabold text-gray-900 capitalize tracking-tight">
                                                    {userDoc?.subscription?.plan || 'Free'} プラン
                                                </h3>
                                                <span className="text-sm font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full mb-1">
                                                    現在のプラン
                                                </span>
                                            </div>
                                            
                                            <p className="text-gray-500 leading-relaxed text-sm">
                                                {userDoc?.subscription?.plan === 'pro' 
                                                    ? 'Proプランをご利用中です。すべての機能と優先サポートにアクセスでき、より快適にコンテンツを作成いただけます。' 
                                                    : 'Freeプランをご利用中です。基本的な機能を使用してプラットフォームをお試しいただけます。より多くの機能をご希望の場合はアップグレードをご検討ください。'}
                                            </p>

                                            <div className="space-y-3 pt-4 border-t border-gray-100/80">
                                                <h4 className="text-sm font-bold text-gray-900">プランに含まれる主な機能：</h4>
                                                <ul className="space-y-2.5 text-sm text-gray-600">
                                                    {userDoc?.subscription?.plan === 'pro' ? (
                                                        <>
                                                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /> クレジットの追加購入が可能</li>
                                                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /> 高度なAI機能へのアクセス</li>
                                                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /> 優先的な処理リソースによる高速な生成</li>
                                                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /> 全てのプレミアムテンプレートの利用</li>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" /> 基本的な画像・動画の自動生成</li>
                                                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" /> 無料の標準テンプレートの利用</li>
                                                            <li className="flex items-center gap-3 text-gray-400"><div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" /> <del>優先的な処理リソースによる高速な生成</del></li>
                                                            <li className="flex items-center gap-3 text-gray-400"><div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" /> <del>プレミアムテンプレートの利用</del></li>
                                                        </>
                                                    )}
                                                </ul>
                                            </div>

                                            {userDoc?.subscription?.cancelAtPeriodEnd && (
                                                <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-sm font-medium text-yellow-800 flex gap-3 items-start">
                                                    <span className="text-yellow-600 text-base mt-0.5">⚠️</span>
                                                    <div>
                                                        解約手続き済みです。<br/>
                                                        現在の更新期間の終了後にFreeプランへ移行します。それまでは引き続きPro機能をご利用いただけます。
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pt-2">
                                                <Link href="/pricing" className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-[0_2px_10px_rgb(147,51,234,0.2)] hover:bg-purple-700 hover:shadow-[0_4px_15px_rgb(147,51,234,0.3)] transition-all w-full sm:w-auto">
                                                    {userDoc?.subscription?.plan === 'pro' ? 'プランの詳細・他のプランを見る' : 'Proプランにアップグレード'}
                                                </Link>
                                            </div>
                                        </div>

                                        {/* 右側：クレジット残高 */}
                                        <div className="lg:w-72 shrink-0">
                                            <div className="p-8 bg-gray-50/80 rounded-2xl border border-gray-100 h-full flex flex-col overflow-hidden relative">
                                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400 to-purple-500"></div>
                                                
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 text-center">
                                                    利用可能クレジット
                                                </h4>
                                                
                                                <div className="flex-1 flex items-center justify-center mb-6">
                                                    <div className="text-center">
                                                        <div className="flex items-baseline justify-center gap-1.5 mb-2">
                                                            <span className="text-5xl font-black text-gray-900 tracking-tight">
                                                                {userDoc?.credits ?? 0}
                                                            </span>
                                                            <span className="text-xl text-gray-500 font-bold">cr</span>
                                                        </div>
                                                        <div className="inline-block px-3 py-1 bg-white rounded-md text-xs font-bold text-purple-600 border border-purple-100">
                                                            現在の残高
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-auto text-xs text-gray-500 bg-white p-4 rounded-xl border border-gray-100">
                                                    <p className="mb-2"><strong className="text-gray-700">消費について:</strong></p>
                                                    <ul className="space-y-1 pl-3 list-disc text-gray-400">
                                                        <li>AIによる画像生成</li>
                                                        <li>高度なAI編集機能</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {userDoc?.subscription?.stripeCustomerId && (
                                    <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 lg:p-10">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 mb-2">ご請求情報・お支払い方法</h2>
                                                <p className="text-gray-500 text-sm leading-relaxed">クレジットカードの変更や、お支払い履歴の確認（領収書）、サブスクリプションの解約はStripeポータルから行えます。</p>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const res = await fetch('/api/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
                                                        const data = await res.json() as any;
                                                        if (data.url) window.open(data.url, '_blank');
                                                    } catch (e) {
                                                        console.error('Portal error:', e);
                                                        alert('ポータルの表示に失敗しました');
                                                    }
                                                }}
                                                className="px-6 py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shrink-0 shadow-md w-full sm:w-auto text-center"
                                            >
                                                Stripeポータルを開く
                                            </button>
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
