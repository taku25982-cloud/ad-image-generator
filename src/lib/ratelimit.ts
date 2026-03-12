import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Redis クライアントの初期化
// 環境変数が設定されていない場合（ローカル等）はエラーを防ぐためダミーを返す
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

// 画像生成API用のレートリミット (1分間に5回まで)
export const generateRateLimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        analytics: true,
        prefix: "ratelimit:generate",
    })
    : null;

// ログイン/認証系API用のレートリミット (15分間に10回まで)
export const authRateLimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "15 m"),
        analytics: true,
        prefix: "ratelimit:auth",
    })
    : null;
