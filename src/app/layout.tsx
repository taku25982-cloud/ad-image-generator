// ========================================
// ルートレイアウト
// ========================================

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: '広告画像ジェネレーター | AIで簡単に広告クリエイティブを作成',
  description: 'AIを活用して、SNS・EC・バナー広告などの画像を簡単に生成。テンプレートとAIの力で、プロ品質の広告クリエイティブを短時間で作成できます。',
  keywords: ['広告', 'AI', '画像生成', 'SNS広告', 'バナー', 'クリエイティブ'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-[var(--bg-primary)]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
