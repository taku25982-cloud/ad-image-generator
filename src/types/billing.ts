// ========================================
// 課金関連の型定義
// ========================================

import { PLAN_MONTHLY_CREDITS } from '@/lib/video-billing';

// 料金プラン定義
export interface PricingPlan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    credits: number;
    features: string[];
    aiEditing: boolean;
    historyRetention: number | null; // null = 無制限
    stripePriceId?: string;
    recommended?: boolean;
}

// プラン設定
export const PRICING_PLANS: PricingPlan[] = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'JPY',
        interval: 'month',
        credits: PLAN_MONTHLY_CREDITS.free, // 初回のみ
        features: [
            '3クレジット（初回のみ）',
            '全フォーマット対応',
            'テンプレート利用',
            '7日間履歴保存',
        ],
        aiEditing: false,
        historyRetention: 7,
    },
    {
        id: 'starter',
        name: 'Starter',
        price: 980,
        currency: 'JPY',
        interval: 'month',
        credits: PLAN_MONTHLY_CREDITS.starter,
        features: [
            '40クレジット/月',
            '全フォーマット対応',
            'テンプレート利用',
            'AI編集機能',
            'Veo 3.1 Lite 動画生成',
            '30日間履歴保存',
        ],
        aiEditing: true,
        historyRetention: 30,
        stripePriceId: process.env.STRIPE_PRICE_STARTER,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 1980,
        currency: 'JPY',
        interval: 'month',
        credits: PLAN_MONTHLY_CREDITS.pro,
        features: [
            '100クレジット/月',
            '全フォーマット対応',
            'テンプレート利用',
            'AI編集機能',
            'Veo 3.1 Lite 動画生成',
            '90日間履歴保存',
            '優先サポート',
        ],
        aiEditing: true,
        historyRetention: 90,
        stripePriceId: process.env.STRIPE_PRICE_PRO,
        recommended: true,
    },
    {
        id: 'business',
        name: 'Business',
        price: 4980,
        currency: 'JPY',
        interval: 'month',
        credits: PLAN_MONTHLY_CREDITS.business,
        features: [
            '240クレジット/月',
            '全フォーマット対応',
            'テンプレート利用',
            'AI編集機能',
            'Veo 3.1 Lite 動画生成',
            '無制限履歴保存',
            '優先サポート',
        ],
        aiEditing: true,
        historyRetention: null,
        stripePriceId: process.env.STRIPE_PRICE_BUSINESS,
    },
];

// Checkout Session
export interface CheckoutSession {
    sessionId: string;
    url: string;
}

// サブスクリプション情報
export interface SubscriptionInfo {
    subscriptionId: string;
    plan: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
}
