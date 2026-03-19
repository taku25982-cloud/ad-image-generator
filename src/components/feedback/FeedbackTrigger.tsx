'use client';

import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

export function FeedbackTrigger() {
  return (
    <Link
      href="/contact?subject=feedback"
      className="fixed bottom-6 right-6 z-[60] group flex items-center gap-2"
    >
      {/* ツールチップ的なラベル */}
      <span className="px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shadow-xl pointer-events-none">
        フィードバックをお願いします！
      </span>
      
      {/* メインボタン */}
      <div className="relative w-14 h-14 flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500 to-violet-600 blur-lg opacity-40 group-hover:opacity-70 transition-opacity animate-pulse" />
        <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-orange-500 to-violet-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-active:scale-95 transition-transform duration-300 border border-white/20">
          <MessageSquare className="w-6 h-6" />
        </div>
      </div>
    </Link>
  );
}
