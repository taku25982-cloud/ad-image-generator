'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const prompts = [
  '背景を都会の夜景に変更して',
  '文字をMidnight Eleganceに変え、色をゴールドに',
  'ボトルに高級感のあるライティングを追加して'
];

export const AIEditorShowcase = () => {
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);

  // Prompt animation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPromptIdx((prev) => (prev + 1) % prompts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [currentPromptIdx]);

  return (
    <section className="py-24 bg-white overflow-hidden scroll-mt-20 relative z-10" id="ai-edit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 mb-6">
                <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">AI Editor</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              言葉だけで画像を<br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600">自由自在にブラッシュアップ</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              「背景を夜景に変えて」「ロゴの色を調整して」。
              AIがあなたの意図を汲み取り、高品質なパターンを生成します。
            </p>
        </div>

        <div className="bg-gray-50 p-6 sm:p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            
            {/* Before */}
            <div className="flex-1 w-full text-center">
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold tracking-widest bg-gray-200 text-gray-600 mb-6">BEFORE</span>
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl ring-4 ring-white">
                 <Image src="/images/sample/ai_editing_before_1774095259644.png" alt="Before" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
              </div>
            </div>

            {/* Prompt Arrow */}
            <div className="flex flex-col items-center justify-center flex-shrink-0 relative w-full lg:w-64 py-8 lg:py-0 z-10">
               <div className="bg-white px-6 py-5 rounded-3xl shadow-xl border border-orange-100 text-sm font-bold text-gray-800 animate-bounce-slow text-center relative z-20 w-full max-w-[280px]">
                 <span className="block text-orange-500 text-[10px] font-black uppercase tracking-widest mb-2">AIに指示</span>
                 <p className="leading-relaxed">「{prompts[currentPromptIdx]}」</p>
               </div>
               
               {/* Right arrow for desktop */}
               <div className="hidden lg:flex absolute top-1/2 -right-8 -translate-y-1/2 items-center justify-center text-orange-400 animate-pulse">
                  <svg className="w-10 h-10 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
               </div>
               
               {/* Down arrow for mobile */}
               <div className="flex lg:hidden absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 items-center justify-center text-orange-400 animate-pulse">
                  <svg className="w-8 h-8 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
               </div>
            </div>

            {/* After */}
            <div className="flex-1 w-full text-center">
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold tracking-widest bg-gradient-to-r from-orange-400 to-pink-500 text-white mb-6 shadow-md">AFTER</span>
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white transform lg:scale-105">
                 <Image src="/images/sample/ai_editing_after_1774095275262.png" alt="After" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};
