
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { users, sessions, accounts, verifications } from "@/db/schema";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
        schema: {
            user: users,
            session: sessions,
            account: accounts,
            verification: verifications,
        }
    }),
    user: {
        additionalFields: {
            credits: {
                type: "number",
                required: false,
                defaultValue: 3,
            },
            plan: {
                type: "string",
                required: false,
                defaultValue: "free",
            },
            stripeCustomerId: {
                type: "string",
                required: false,
            },
            stripeSubscriptionId: {
                type: "string",
                required: false,
            },
            subscriptionStatus: {
                type: "string",
                required: false,
            },
            usageTotalGenerations: {
                type: "number",
                required: false,
                defaultValue: 0,
            },
            usageMonthlyGenerations: {
                type: "number",
                required: false,
                defaultValue: 0,
            },
            usageLastGenerationAt: {
                type: "date",
                required: false,
            },
            usageResetAt: {
                type: "date",
                required: false,
            }
        }
    },
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET,

    // ========================================
    // セキュリティ設定
    // ========================================

    // セッションCookieキャッシュ: DBアクセスを削減し認証を高速化
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5分間キャッシュ
            strategy: "compact", // compact = 最小サイズ
        },
    },

    // レート制限: ブルートフォース防止（本番環境で自動有効）
    rateLimit: {
        enabled: true,
        storage: "memory", // DBスキーマ追加不要なメモリストレージを使用
    },

    // 信頼するオリジン: CSRF防御（baseURLは自動で追加される）
    ...(process.env.BETTER_AUTH_URL && {
        trustedOrigins: [process.env.BETTER_AUTH_URL],
    }),

    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            // ログイン時は常にアカウント選択画面を表示する
            prompt: "select_account",
        },
    },
    plugins: [nextCookies()],
});
