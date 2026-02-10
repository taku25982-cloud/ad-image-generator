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

export default function TemplatesPage() {
    const { user, userDoc } = useAuth();
    const router = useRouter();

    // フィルター・検索の状態
    const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

    // フィルタリングされたテンプレート一覧
    const filteredTemplates = useMemo(() => {
        let templates = AD_TEMPLATES;

        // カテゴリフィルター
        if (selectedCategory !== 'all') {
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

    // テンプレート選択 → 作成ページに遷移
    const handleSelectTemplate = (template: AdTemplate) => {
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
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-purple-600">
                            AI Generator
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="font-semibold text-gray-700">テンプレート</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-purple-50 rounded-full">
                            <span className="text-xs text-gray-500">クレジット:</span>
                            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">
                                {userDoc?.credits ?? 0}
                            </span>
                        </div>
                        <Link href="/dashboard" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
                            ダッシュボードへ
                        </Link>
                    </div>
                </div>
            </header>

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
                                onClick={() => handleSelectTemplate(template)}
                                onMouseEnter={() => setHoveredTemplate(template.id)}
                                onMouseLeave={() => setHoveredTemplate(null)}
                                className="group text-left bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
                            >
                                {/* サムネイル */}
                                <div
                                    className="relative h-44 overflow-hidden"
                                    style={{ background: template.thumbnail }}
                                >
                                    {/* バッジ */}
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        {template.popular && (
                                            <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                                                🔥 人気
                                            </span>
                                        )}
                                        {template.isNew && (
                                            <span className="px-2.5 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
                                                ✨ NEW
                                            </span>
                                        )}
                                    </div>

                                    {/* アイコン中央 */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-5xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            {template.icon}
                                        </span>
                                    </div>

                                    {/* ホバーオーバーレイ */}
                                    <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${hoveredTemplate === template.id ? 'opacity-100' : 'opacity-0'
                                        }`}>
                                        <span className="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold shadow-lg transform group-hover:scale-100 scale-90 transition-transform duration-300">
                                            このテンプレートを使う
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

                                    {/* フォーマット・カラープレビュー */}
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                        <span className="text-xs text-gray-400">
                                            {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.icon}{' '}
                                            {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.label}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <div
                                                className="w-4 h-4 rounded-full border border-white shadow-sm"
                                                style={{ backgroundColor: template.presets.primaryColor }}
                                            />
                                            <div
                                                className="w-4 h-4 rounded-full border border-white shadow-sm"
                                                style={{ backgroundColor: template.presets.secondaryColor }}
                                            />
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
        </div>
    );
}
