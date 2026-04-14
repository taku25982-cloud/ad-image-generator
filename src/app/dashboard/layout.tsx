// ========================================
// ダッシュボード共通レイアウト
// ヘッダーナビゲーションを利用
// ========================================

import { AppHeader } from '@/components/layout/AppHeader';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-purple-50/30 to-indigo-50/50 flex flex-col relative">
            {/* バックグラウンド装飾 */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-200/20 to-transparent rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full blur-[100px]" />
            </div>

            {/* ヘッダー */}
            <AppHeader />

            {/* メインコンテンツ */}
            <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
