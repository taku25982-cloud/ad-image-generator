// ========================================
// ルートレイアウト
// ========================================

import type { Metadata } from 'next';
import { Zen_Maru_Gothic } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { LoginModal } from '@/components/auth/LoginModal';

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

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
    <html lang="ja" data-scroll-behavior="smooth">
      <body className={`min-h-screen bg-[var(--bg-primary)] ${zenMaruGothic.className}`}>
        <AuthProvider>
          {children}
          <LoginModal />
        </AuthProvider>
      </body>
    </html>
  );
}
