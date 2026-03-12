// ========================================
// テンプレート一覧ページ
// ========================================

'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    AD_TEMPLATES,
    TEMPLATE_CATEGORIES,
    type TemplateCategory,
    type AdTemplate,
} from '@/lib/templates';
import { AppHeader } from '@/components/layout/AppHeader';

// デザインテイスト（トーン）の日本語ラベルマッピング
const TONE_LABELS: Record<string, string> = {
    'bold': '力強くて目立つ',
    'modern': 'モダン・スタイリッシュ',
    'minimal': 'シンプル・ミニマル',
    'warm': '温かみがある・親しみやすい',
    'pop': 'ポップ・カジュアル',
    'clean': '清潔感・クリーン',
    'professional': 'プロフェッショナル・信頼感',
    'elegant': '上品・エレガント',
    'friendly': '親しみやすい・フレンドリー',
    'luxury': '高級感・ラグジュアリー',
    'energetic': '活発・エネルギッシュ',
    'trustworthy': '誠実・安心感',
    'natural': '自然・オーガニック',
};

export default function TemplatesPage() {
    const { user, userDoc } = useAuth();
    const router = useRouter();

    // フィルター・検索の状態
    const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all' | 'basic' | 'premium'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

    // 選択されたテンプレート(モーダル表示用)
    const [selectedTemplate, setSelectedTemplate] = useState<AdTemplate | null>(null);

    // フィルタリングされたテンプレート一覧
    const filteredTemplates = useMemo(() => {
        let templates = AD_TEMPLATES;

        // カテゴリフィルター
        if (selectedCategory === 'basic') {
            templates = templates.filter(t => !t.isPremium);
        } else if (selectedCategory === 'premium') {
            templates = templates.filter(t => t.isPremium);
        } else if (selectedCategory !== 'all') {
            templates = templates.filter(t => t.category === selectedCategory);
        }

        // 検索フィルター
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            templates = templates.filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.tags.some(tag => tag.toLowerCase().includes(q))
            );
        }

        return templates;
    }, [selectedCategory, searchQuery]);

    // テンプレート詳細モーダルを開く
    const handleOpenModal = (template: AdTemplate) => {
        setSelectedTemplate(template);
    };

    // テンプレート選択 → 作成ページに遷移
    const handleProceedToCreate = (template: AdTemplate) => {
        // テンプレート情報をクエリパラメータとして作成ページに渡す
        const params = new URLSearchParams({
            templateId: template.id,
        });
        router.push(`/create?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-purple-50/30 to-indigo-50/50 relative">
            {/* 背景デコレーション */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-200/20 to-transparent rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-orange-200/20 to-transparent rounded-full blur-[100px]" />
            </div>

            {/* ヘッダー */}
            <AppHeader />

            <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
                {/* タイトルセクション */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        テンプレートから<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">作成</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        プロがデザインしたテンプレートを選んで、あなたのブランドに合わせてカスタマイズしましょう。
                    </p>
                </div>

                {/* 検索バー */}
                <div className="max-w-xl mx-auto mb-8">
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="テンプレートを検索... （例: セール、フード、SaaS）"
                            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* カテゴリフィルター */}
                <div className="mb-10">
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === 'all'
                                ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                                : 'bg-white/70 text-gray-600 border border-gray-200 hover:border-purple-300 hover:shadow-md'
                                }`}
                        >
                            すべて ({AD_TEMPLATES.length})
                        </button>
                        <button
                            onClick={() => setSelectedCategory('basic')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === 'basic'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20'
                                : 'bg-white/70 text-gray-600 border border-gray-200 hover:border-green-300 hover:shadow-md'
                                }`}
                        >
                            📦 基本 ({AD_TEMPLATES.filter(t => !t.isPremium).length})
                        </button>
                        <button
                            onClick={() => setSelectedCategory('premium')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === 'premium'
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20'
                                : 'bg-white/70 text-gray-600 border border-gray-200 hover:border-purple-300 hover:shadow-md'
                                }`}
                        >
                            💎 プレミアム ({AD_TEMPLATES.filter(t => t.isPremium).length})
                        </button>
                        {TEMPLATE_CATEGORIES.map((cat) => {
                            const count = AD_TEMPLATES.filter(t => t.category === cat.id).length;
                            if (count === 0) return null;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === cat.id
                                        ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                                        : 'bg-white/70 text-gray-600 border border-gray-200 hover:border-purple-300 hover:shadow-md'
                                        }`}
                                >
                                    {cat.icon} {cat.label} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* テンプレートグリッド */}
                {filteredTemplates.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">テンプレートが見つかりません</h3>
                        <p className="text-gray-500 mb-6">検索条件を変えてお試しください</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 hover:shadow-md transition-all"
                        >
                            フィルターをリセット
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredTemplates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => handleOpenModal(template)}
                                onMouseEnter={() => setHoveredTemplate(template.id)}
                                onMouseLeave={() => setHoveredTemplate(null)}
                                className="group text-left bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
                            >
                                {/* サムネイル */}
                                <div className="relative h-44 overflow-hidden bg-gray-100">
                                    {/* 背景画像 */}
                                    <div className="absolute inset-0">
                                        <img 
                                            src={template.thumbnail} 
                                            alt={template.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent opacity-80" />
                                    </div>
                                    {/* バッジ (右上) */}
                                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end z-20">
                                        {template.isPremium && (
                                            <span className="px-2 py-1 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white text-[9px] font-black rounded-lg shadow-lg flex items-center gap-1 border border-white/20 backdrop-blur-sm">
                                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                                PREMIUM
                                            </span>
                                        )}
                                        {template.popular && (
                                            <span className="px-2 py-1 bg-orange-500 text-white text-[9px] font-black rounded-lg shadow-lg border border-white/20">
                                                🔥 人気
                                            </span>
                                        )}
                                        {template.isNew && (
                                            <span className="px-2 py-1 bg-blue-500 text-white text-[9px] font-black rounded-lg shadow-lg border border-white/20">
                                                ✨ NEW
                                            </span>
                                        )}
                                    </div>

                                    {/* アイコンとカテゴリ (左下に配置) */}
                                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/30 text-white">
                                            <span className="text-sm filter drop-shadow-md">{template.icon}</span>
                                            <span className="text-xs font-medium drop-shadow-md">
                                                {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ホバーオーバーレイ */}
                                    <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${hoveredTemplate === template.id ? 'opacity-100' : 'opacity-0'
                                        }`}>
                                        <span className="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold shadow-lg transform group-hover:scale-100 scale-90 transition-transform duration-300">
                                            詳細を見る
                                        </span>
                                    </div>
                                </div>

                                {/* コンテンツ */}
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                                        {template.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                                        {template.description}
                                    </p>

                                    {/* タグ */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {template.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* フルサイズ向けのプレビュー (下部に各種情報をまとめる) */}
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-bold mb-0.5">テイスト</span>
                                            <span className="text-xs text-gray-700 font-medium">{TONE_LABELS[template.presets.tone] || '標準'}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* カスタム作成CTA */}
                <div className="mt-16 text-center">
                    <div className="inline-flex flex-col items-center bg-white/70 backdrop-blur-sm rounded-3xl border border-gray-100 p-10 max-w-lg shadow-sm">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center mb-5 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">テンプレートを使わずに作成</h3>
                        <p className="text-gray-500 mb-6 leading-relaxed">
                            ゼロからオリジナルの広告を作成したい場合はこちら。
                            AIがあなたのアイデアを形にします。
                        </p>
                        <Link
                            href="/create"
                            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                        >
                            カスタム作成 →
                        </Link>
                    </div>
                </div>
            </main>

            {/* テンプレート詳細モーダル */}
            {selectedTemplate && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                    onClick={() => setSelectedTemplate(null)}
                >
                    <div 
                        className="bg-white rounded-3xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 画像部分 (左側) */}
                        <div className="w-full md:w-1/2 relative h-48 md:h-auto shrink-0 bg-gray-100">
                            <img 
                                src={selectedTemplate.thumbnail} 
                                alt={selectedTemplate.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4 flex gap-2">
                                {selectedTemplate.isPremium && (
                                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1.5">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                        PREMIUM
                                    </span>
                                )}
                                {selectedTemplate.popular && (
                                    <span className="px-3 py-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-md">🔥 人気</span>
                                )}
                                {selectedTemplate.isNew && (
                                    <span className="px-3 py-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white text-xs font-bold rounded-full shadow-md">✨ NEW</span>
                                )}
                            </div>
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-900/80 to-transparent p-6 pt-12">
                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 text-white w-max">
                                    <span className="text-lg">{selectedTemplate.icon}</span>
                                    <span className="text-sm font-medium">
                                        {TEMPLATE_CATEGORIES.find(c => c.id === selectedTemplate.category)?.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 詳細情報部分 (右側) */}
                        <div className="w-full md:w-1/2 flex flex-col min-h-0 flex-1">
                            {/* スクロールするコンテンツ */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{selectedTemplate.name}</h2>
                                        <p className="text-gray-500 text-sm md:text-base leading-relaxed">{selectedTemplate.description}</p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedTemplate(null)}
                                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors shrink-0 -mt-1 -mr-1 md:-mt-2 md:-mr-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {selectedTemplate.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-purple-50/80 text-purple-600 rounded-full text-xs font-medium border border-purple-100/50">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="space-y-5">
                                    <div className="bg-gradient-to-r from-orange-50/50 to-orange-50/80 p-4 rounded-2xl border border-orange-100/50">
                                        <h4 className="text-xs font-bold text-orange-800/70 mb-1.5 flex items-center gap-1.5">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            キャッチコピー
                                        </h4>
                                        <p className="text-gray-900 font-bold">{selectedTemplate.presets.catchCopy}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 mb-1.5">説明文</h4>
                                        <p className="text-gray-700 text-sm leading-relaxed">{selectedTemplate.presets.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-t border-gray-100/80">
                                        <h4 className="text-xs font-bold text-gray-400">想定ターゲット</h4>
                                        <span className="text-sm text-gray-700 font-medium">{selectedTemplate.presets.targetAudience}</span>
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-y border-gray-100/80 bg-gray-50/50 -mx-6 px-6 md:-mx-8 md:px-8">
                                        <h4 className="text-xs font-bold text-gray-400">デザインテイスト</h4>
                                        <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                                            {TONE_LABELS[selectedTemplate.presets.tone] || '標準'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* 固定のフッター（ボタンエリア） */}
                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0">
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setSelectedTemplate(null)}
                                        className="px-6 py-4 bg-white text-gray-600 font-bold border border-gray-200 rounded-2xl hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                                    >
                                        キャンセル
                                    </button>
                                    {selectedTemplate.isPremium && (!userDoc?.subscription?.plan || userDoc?.subscription?.plan === 'free') ? (
                                        <Link 
                                            href="/pricing"
                                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                            アップグレードして利用
                                        </Link>
                                    ) : (
                                        <button 
                                            onClick={() => handleProceedToCreate(selectedTemplate)}
                                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                        >
                                            このテンプレートを使う
                                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
