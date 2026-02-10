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

// プランIDとStripePriceIDのマッピング
export const PLAN_PRICE_MAP: Record<string, string> = {
    starter: process.env.STRIPE_PRICE_STARTER || '',
    pro: process.env.STRIPE_PRICE_PRO || '',
    business: process.env.STRIPE_PRICE_BUSINESS || '',
};

// プランごとの月間クレジット数
export const PLAN_CREDITS: Record<string, number> = {
    free: 0,
    starter: 50,
    pro: 200,
    business: 1000,
};
