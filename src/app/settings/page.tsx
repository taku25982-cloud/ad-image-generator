// ========================================
// 設定ページ
// ========================================

'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/firebase/auth';
import Link from 'next/link';

export default function SettingsPage() {
    const { user, userDoc } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile');

    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    const tabs = [
        { id: 'profile', label: 'プロフィール', icon: '👤' },
        { id: 'plan', label: 'プラン', icon: '💳' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-purple-50/30 to-indigo-50/50">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-purple-600">設定</span>
                    </div>
                    <Link href="/dashboard" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
                        ダッシュボードへ
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="flex gap-8">
                    <nav className="w-48 space-y-1">
                        {tabs.map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}>
                                <span>{tab.icon}</span>{tab.label}
                            </button>
                        ))}
                    </nav>

                    <div className="flex-1">
                        {activeTab === 'profile' && (
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">プロフィール</h2>
                                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                                    {user?.photoURL ? (
                                        <img src={user.photoURL} alt="" className="w-20 h-20 rounded-full object-cover shadow-lg" />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">{user?.email?.charAt(0).toUpperCase()}</div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{user?.displayName || 'ユーザー'}</h3>
                                        <p className="text-gray-500">{user?.email}</p>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">ログアウト</button>
                            </div>
                        )}

                        {activeTab === 'plan' && (
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">プラン</h2>
                                <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl p-6 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm text-gray-500">現在のプラン</span>
                                            <h3 className="text-2xl font-bold text-gray-900 capitalize">{userDoc?.subscription?.plan || '無料'}</h3>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm text-gray-500">クレジット残高</span>
                                            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">{userDoc?.credits ?? 0}</p>
                                        </div>
                                    </div>
                                    {userDoc?.subscription?.cancelAtPeriodEnd && (
                                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                                            ⚠️ 現在の期間終了後に解約されます。
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Link href="/pricing" className="flex-1">
                                        <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                                            プランを変更する
                                        </button>
                                    </Link>
                                    {userDoc?.subscription?.stripeCustomerId && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const token = await user?.getIdToken();
                                                    const res = await fetch('/api/portal', {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'Authorization': `Bearer ${token}`,
                                                        },
                                                    });
                                                    const data = await res.json();
                                                    if (data.url) window.location.href = data.url;
                                                } catch (e) {
                                                    console.error('Portal error:', e);
                                                    alert('ポータルの表示に失敗しました');
                                                }
                                            }}
                                            className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:shadow-md transition-all"
                                        >
                                            サブスクリプション管理
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
