// ========================================
// ダッシュボード ホーム
// LPに合わせたモダンなデザイン
// ========================================

'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';

export default function DashboardHome() {
    const { user, userDoc } = useAuth();
    const userName = user?.displayName || userDoc?.displayName || user?.email?.split('@')[0] || 'ゲスト';

    // TODO: Firestoreから実際のプロジェクトを取得
    const recentProjects: any[] = [];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* ヘッダーセクション */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        こんにちは、<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">{userName}</span>さん
                    </h1>
                    <p className="text-gray-500 mt-2">
                        今日も新しいクリエイティブを作りましょう。
                    </p>
                </div>
                <Link href="/create">
                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        新規プロジェクト作成
                    </button>
                </Link>
            </div>

            {/* クイックアクション */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/create" className="group">
                    <div className="h-full p-6 bg-white/70 backdrop-blur-sm border border-orange-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200 to-orange-100 rounded-bl-full opacity-30 group-hover:opacity-50 transition-opacity" />
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">AI生成を開始</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">URLやテキストから高品質な広告バナーを自動生成します。</p>
                    </div>
                </Link>

                <Link href="/templates" className="group">
                    <div className="h-full p-6 bg-white/70 backdrop-blur-sm border border-purple-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-purple-100 rounded-bl-full opacity-30 group-hover:opacity-50 transition-opacity" />
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">テンプレートから作成</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">プロがデザインしたテンプレートでカスタマイズ可能な広告を作成。</p>
                    </div>
                </Link>

                <Link href="/history" className="group">
                    <div className="h-full p-6 bg-white/70 backdrop-blur-sm border border-indigo-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200 to-indigo-100 rounded-bl-full opacity-30 group-hover:opacity-50 transition-opacity" />
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">履歴を確認</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">過去に作成したプロジェクトの確認、編集、再ダウンロード。</p>
                    </div>
                </Link>
            </div>

            {/* 最近のプロジェクト */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">最近のプロジェクト</h2>
                    {recentProjects.length > 0 && (
                        <Link href="/history" className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline">
                            すべて見る →
                        </Link>
                    )}
                </div>

                {recentProjects.length === 0 ? (
                    /* 空の状態 */
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-12 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">プロジェクトがまだありません</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                            最初のクリエイティブを作成して、AIの力を体験しましょう。
                        </p>
                        <Link href="/create">
                            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                最初のプロジェクトを作成
                            </button>
                        </Link>
                    </div>
                ) : (
                    /* プロジェクト一覧 */
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/80 text-gray-500 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">プロジェクト名</th>
                                        <th className="px-6 py-4 font-semibold">タイプ</th>
                                        <th className="px-6 py-4 font-semibold">ステータス</th>
                                        <th className="px-6 py-4 font-semibold">最終更新</th>
                                        <th className="px-6 py-4 font-semibold text-right">アクション</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentProjects.map((project) => (
                                        <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {project.title}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {project.type}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${project.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        project.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'}`}>
                                                    {project.status === 'completed' ? '完了' :
                                                        project.status === 'processing' ? '生成中' : '下書き'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {project.date}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-gray-400 hover:text-purple-600 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>

            {/* クイックヒント */}
            <section className="bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">💡 ヒント</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            商品ページのURLを入力するだけで、AIが自動的に魅力的な広告クリエイティブを生成します。
                            まずは「AI生成を開始」から試してみましょう！
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
