# ad-image-generator

Next.js 16 / React 19 ベースの広告クリエイティブ生成アプリです。  
画像生成、AI 編集、Stripe 課金、Better Auth 認証、Turso 永続化、Cloudflare R2 保存を使います。

## 技術スタック

- Next.js 16
- React 19
- Better Auth
- Drizzle ORM
- Turso / libSQL
- Gemini Image Generation API
- Cloudflare R2
- Stripe
- Upstash Ratelimit / Redis

## 必須外部サービス

- Gemini API
- Turso
- Cloudflare R2
- Stripe
- Google OAuth

次は任意ですが、本番では推奨です。

- Upstash Redis
- 外部動画レンダラー

## セットアップ

1. 依存関係を入れます。

```bash
npm install
```

2. `.env.example` をコピーして `.env.local` を作成し、必要な値を設定します。

```bash
cp .env.example .env.local
```

Windows PowerShell の場合:

```powershell
Copy-Item .env.example .env.local
```

3. Turso の DB と認証情報を設定します。

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

4. Better Auth / Google OAuth を設定します。

- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

5. 画像生成と保存を設定します。

- `GEMINI_API_KEY`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

6. 課金を使う場合は Stripe を設定します。

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_BUSINESS`
- `STRIPE_PRICE_ONETIME_20`
- `STRIPE_PRICE_ONETIME_50`
- `STRIPE_PRICE_ONETIME_100`

7. レート制限を有効にする場合は Upstash を設定します。

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## 開発

```bash
npm run dev
```

`http://localhost:3000` を開いて確認します。

## ビルド

```bash
npm run build
npm run start
```

## DB マイグレーション

このリポジトリには `drizzle.config.ts` と `drizzle/migrations/` があります。  
本番投入前に、現在のスキーマと migration の適用手順を運用側で固定してください。

少なくとも以下を確認してください。

- Turso 本番 DB に migration が適用済み
- `user`, `session`, `account`, `verification`, `generation`, `stripe_webhook_event` が存在する
- 最近追加されたブランドキット / プロジェクト関連 migration も反映済み

## Stripe 運用メモ

- Checkout は `/api/checkout`
- Billing Portal は `/api/portal`
- Webhook は `/api/webhook/stripe`

本番では Stripe 側の webhook エンドポイントをこの URL に向け、`STRIPE_WEBHOOK_SECRET` を設定してください。  
Webhook が正しく動かないと、プラン反映とクレジット加算が壊れます。

手動確認の手順は [docs/stripe-test-checklist.md](./docs/stripe-test-checklist.md) を参照してください。

## 動画機能

Veo 連携は実装されていますが、通常はフラグで隠しています。

- `ENABLE_VEO_VIDEO=true` で Veo API を有効化
- `SHOW_VIDEO_FEATURES` は現在コード上で `false`

外部レンダリングを使う場合:

- `RENDER_SERVICE_URL`
- `RENDER_SERVER_SECRET`

ローカル描画を試す場合:

- `USE_LOCAL_RENDERER=true`
- `ENABLE_LOCAL_RENDER_DEV=true`

## 既知の運用注意

- Upstash 未設定時は API レート制限が無効になります
- `NEXT_PUBLIC_ADMIN_EMAIL` は管理者バイパス判定に使われます
- R2 保存に失敗すると生成・編集結果を返せないため、R2 設定は必須です
- 課金文言と実装制限は README ではなくコードを正としてください

## 検証コマンド

```bash
npm run lint
npm run build
```
