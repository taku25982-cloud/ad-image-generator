// ========================================
// 履歴ページ
// ========================================

'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAdHistoriesByUserId, deleteAdHistory, type AdHistory } from '@/lib/firebase/history';

export default function HistoryPage() {
    const { user, userDoc } = useAuth();
    const [histories, setHistories] = useState<AdHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistories = async () => {
            if (!user) return;
            try {
                const data = await getAdHistoriesByUserId(user.uid);
                setHistories(data);
            } catch (error) {
                console.error('Fetch histories error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistories();
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm('この履歴を削除してもよろしいですか？')) return;

        setDeletingId(id);
        try {
            await deleteAdHistory(id);
            setHistories(histories.filter(h => h.id !== id));
        } catch (error) {
            console.error('Delete error:', error);
            alert('削除に失敗しました');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-purple-50/30 to-indigo-50/50">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-purple-600">履歴</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-purple-50 rounded-full">
                            <span className="text-xs text-gray-500">クレジット:</span>
                            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">{userDoc?.credits ?? 0}</span>
                        </div>
                        <Link href="/dashboard" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
                            ダッシュボードへ
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">生成履歴</h1>
                    <Link href="/create">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            新規作成
                        </button>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500">履歴を読み込み中...</p>
                    </div>
                ) : histories.length === 0 ? (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-16 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">履歴がありません</h3>
                        <p className="text-gray-500 mb-6">広告を生成すると、ここに履歴が表示されます。</p>
                        <Link href="/create">
                            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                                最初の広告を作成する
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {histories.map((item) => (
                            <div key={item.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.productName}
                                        className="w-full h-full object-contain"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => window.open(item.imageUrl, '_blank')}
                                            className="p-3 bg-white text-gray-900 rounded-full hover:scale-110 transition-transform shadow-lg"
                                            title="拡大表示"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            disabled={deletingId === item.id}
                                            className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg disabled:opacity-50"
                                            title="削除"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-purple-600 shadow-sm">
                                        {item.format}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900 line-clamp-1">{item.productName}</h3>
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('ja-JP') : '...'}
                                        </span>
                                    </div>
                                    {item.catchCopy && (
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{item.catchCopy}</p>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: item.primaryColor }} />
                                        <div className="w-3 h-3 rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: item.secondaryColor }} />
                                        <span className="text-[10px] text-gray-400 ml-auto capitalize">{item.tone}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
