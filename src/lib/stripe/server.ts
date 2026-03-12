// ========================================
// Stripe サーバーサイドユーティリティ
// ========================================

import Stripe from 'stripe';

// Stripe初期化（遅延初期化）
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
    if (!stripeInstance) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            throw new Error('STRIPE_SECRET_KEY が設定されていません');
        }
        stripeInstance = new Stripe(key);
    }
    return stripeInstance;
}

export const PLAN_PRICE_MAP: Record<string, string> = {
    starter: process.env.STRIPE_PRICE_STARTER || '',
    pro: process.env.STRIPE_PRICE_PRO || '',
    business: process.env.STRIPE_PRICE_BUSINESS || '',
    onetime_20: process.env.STRIPE_PRICE_ONETIME_20 || '',
    onetime_50: process.env.STRIPE_PRICE_ONETIME_50 || '',
    onetime_100: process.env.STRIPE_PRICE_ONETIME_100 || '',
};

// StripePriceIDからプランIDへの逆マッピング
export const PRICE_PLAN_MAP: Record<string, string> = Object.entries(PLAN_PRICE_MAP).reduce((acc, [planId, priceId]) => {
    if (priceId) {
        acc[priceId] = planId;
    }
    return acc;
}, {} as Record<string, string>);

// プランごとの月間クレジット数、または追加クレジット数
export const PLAN_CREDITS: Record<string, number> = {
    free: 0,
    starter: 30,
    pro: 80,
    business: 150,
    onetime_20: 20,
    onetime_50: 50,
    onetime_100: 100,
};
