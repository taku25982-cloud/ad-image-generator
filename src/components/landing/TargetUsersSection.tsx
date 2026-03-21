'use client';

import React from 'react';

const users = [
  {
    title: 'SNSマーケター',
    desc: '「投稿の反応率を最大化」',
    detail: 'InstagramやTikTok、Xの媒体特性を理解した構図で、目に留まるクリエイティブを量産。',
    icon: '📱',
    bgColor: 'bg-blue-50',
    accentColor: 'text-blue-600'
  },
  {
    title: 'ECショップオーナー',
    desc: '「商品写真を即時にバナーへ」',
    detail: 'スマホで撮った写真がプロ級の広告画像に。Amazon, 楽天, Shopifyなど主要モール全対応。',
    icon: '🛒',
    bgColor: 'bg-orange-50',
    accentColor: 'text-orange-600'
  },
  {
    title: '広告代理店',
    desc: '「構成案作成を1/10に」',
    detail: 'クライアントへのプレゼン資料やラフ案の作成スピードを劇的に改善。',
    icon: '⚡',
    bgColor: 'bg-violet-50',
    accentColor: 'text-violet-600'
  },
  {
    title: '個人事業主・起業家',
    desc: '「デザイナーなしでプロの仕上がり」',
    detail: 'コストを抑えつつ、ブランド価値を損なわない高品質なデザインを誰でも実現可能。',
    icon: '🚀',
    bgColor: 'bg-emerald-50',
    accentColor: 'text-emerald-600'
  }
];

export const TargetUsersSection = () => {
  return (
    <section className="py-24 bg-gray-50/50 scroll-mt-24 relative z-10" id="targets">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Target Users</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
            あらゆるビジネスの<br className="sm:hidden" />
            <span className="text-orange-500">強力なパートナー</span>に
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            業界や規模を問わず、広告クリエイティブを「自社で・速く・安く」
            制作したいすべての方にお使いいただけます。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {users.map((user, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-gray-200"
            >
              <div className={`w-16 h-16 ${user.bgColor} rounded-2xl flex items-center justify-center text-4xl mb-6`}>
                {user.icon}
              </div>
              <h3 className={`text-xl font-bold ${user.accentColor} mb-3`}>{user.title}</h3>
              <p className="text-gray-900 font-bold mb-4 text-base leading-tight pb-3 border-b border-gray-100">{user.desc}</p>
              <p className="text-gray-600 text-sm leading-relaxed opacity-100">{user.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
