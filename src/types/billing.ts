// ========================================
// 課金関連の型定義
// ========================================

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
        credits: 3, // 初回のみ
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
        credits: 50,
        features: [
            '50クレジット/月',
            '全フォーマット対応',
            'テンプレート利用',
            'AI編集機能',
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
        credits: 200,
        features: [
            '200クレジット/月',
            '全フォーマット対応',
            'テンプレート利用',
            'AI編集機能',
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
        credits: 1000,
        features: [
            '1,000クレジット/月',
            '全フォーマット対応',
            'テンプレート利用',
            'AI編集機能',
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
