'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const galleryItems = [
  {
    src: '/images/sample/gallery_flash_sale_1774095198226.png',
    title: 'タイムセール',
    format: 'Product Square',
    size: '1080x1080'
  },
  {
    src: '/images/sample/gallery_new_arrival_1774095215060.png',
    title: '新商品発売',
    format: 'Product Square',
    size: '1080x1080'
  },
  {
    src: '/images/sample/gallery_premium_watch_1774095229725.png',
    title: 'プレミアム商品',
    format: 'Product Square',
    size: '1080x1080'
  },
  {
    src: '/images/sample/gallery_food_burger_1774095244690.png',
    title: '新メニュー告知',
    format: 'Product Square',
    size: '1080x1080'
  }
];

export const GallerySection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let lastTime = 0;

    const scroll = (time: number) => {
      if (time - lastTime > 100) {
        lastTime = time;
      }
      
      const setWidth = container.scrollWidth / 4;

      if (!isPaused && (time - lastTime) > 0) {
        container.scrollLeft += 0.5;
      }

      // 常にスクロール位置をチェックし、端に行かせない（無限ループ）
      if (container.scrollLeft >= setWidth * 2) {
        // 右に進みすぎたら1セット分戻す
        container.scrollLeft -= setWidth;
      } else if (container.scrollLeft <= 0) {
        // 左に戻りすぎたら1セット分進める（手動で左にスワイプした対応）
        container.scrollLeft += setWidth;
      }
      
      lastTime = time;
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  return (
    <section className="py-24 bg-gray-50 overflow-hidden scroll-mt-20 relative z-10" id="gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-6">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Showcase</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-relaxed">
          あらゆる用途に対応する<br className="sm:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">圧倒的なクオリティ</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          タイムセール告知から新商品のPRまで。<br className="hidden md:block"/>
          用途に合わせた最適な構図とプロ品質のクリエイティブを瞬時に生成します。
        </p>
      </div>

      <div className="relative group w-full">
        {/* JSによる自動スクロール + ネイティブ横スクロール */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-6 px-8 pb-10 w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* 配列を4周分表示し、十分なスクロール領域を確保した上で無限ループを制御 */}
          {Array.from({ length: 4 }).flatMap(() => galleryItems).map((item, idx) => (
            <div
              key={idx}
              className="inline-block w-[280px] md:w-80 flex-shrink-0 bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group/card border border-gray-100"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 text-left whitespace-normal">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-widest rounded-full whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.format}
                  </span>
                  <span className="text-gray-400 text-xs font-mono ml-2">{item.size} px</span>
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  AIが商品の魅力を最大限に引き出す構図と配色を自動で選定し、クリックされる広告を制作します。
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
