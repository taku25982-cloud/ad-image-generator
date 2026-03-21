# 現在の実装メモ

## 技術スタック

- Next.js 16.1.6
- React 19
- Better Auth
- Drizzle ORM
- Turso / libSQL
- Gemini Image Generation API
- Cloudflare R2
- Stripe
- Upstash Ratelimit / Redis

## 認証

- Better Auth を使用
- Google ログイン対応
- 管理者判定は `NEXT_PUBLIC_ADMIN_EMAIL`

## データベース

主要テーブルは [schema.ts](/C:/Projects/gemini-cli-company-demo/apps/ad-image-generator/src/db/schema.ts) にあります。

- `user`
  - プラン、クレジット、Stripe 情報、利用統計
- `session`
- `account`
- `verification`
- `generation`
  - 生成画像、プロンプト、入力内容、ブランド設定、編集履歴
- `stripe_webhook_event`

## 主要 API

現在存在する API ルートは次のとおりです。

- `/api/auth/[...all]`
- `/api/checkout`
- `/api/edit`
- `/api/generate`
- `/api/portal`
- `/api/proxy-image`
- `/api/webhook/stripe`

## 画像生成

- 生成は `/api/generate`
- Gemini モデルは `gemini-3.1-flash-image-preview`
- 参考画像は `data:image/...` の Base64 で送信
- 一時的な `503` / 高負荷エラーには自動再試行あり
- クレジット消費と履歴保存は生成成功後のみ
- テキスト固定ルールにより、主要文言は言い換えずに使う方針

## 編集

- `/api/edit` で画像編集対応
- 生成時の `thoughtSignature` を次回編集精度向上に利用

## 広告フォーマット

現在の作成画面と生成 API で扱うフォーマットは 8 種です。

- `instagram-story` `1080x1920`
- `instagram-feed` `1080x1080`
- `facebook-ad` `1200x628`
- `twitter-post` `1200x675`
- `youtube-thumbnail` `1280x720`
- `google-display` `300x250`
- `ec-banner` `728x90`
- `product-image` `800x800`

## テンプレート機能

- テンプレート定義は [templates.ts](/C:/Projects/gemini-cli-company-demo/apps/ad-image-generator/src/lib/templates.ts)
- 現在 32 テンプレート
- 各テンプレートは:
  - `presets`
  - `customInstructions`
  - サムネ生成用 `getTemplateSampleInput(templateId)`
  - 再現性向上のための個別クリエイティブプロファイル
    - `hero`
    - `scene`
    - `composition`
    - `textPlacement`
    - `avoid`
- プレミアムテンプレートはフリープランで詳細ロック
- テンプレート経由で作成する場合、色指定 UI は非表示

## Flow 向けドキュメント

- 概要: [flow-template-prompts.md](/C:/Projects/gemini-cli-company-demo/apps/ad-image-generator/docs/flow-template-prompts.md)
- 展開済み全文: [flow-template-prompts-expanded.md](/C:/Projects/gemini-cli-company-demo/apps/ad-image-generator/docs/flow-template-prompts-expanded.md)

## 補足

- 初期の Firebase / Firestore 前提の設計書は現行実装と一致しないため削除済み
- ドキュメント更新時は、コードを正とし、必要なら `flow-template-prompts-expanded.md` を再生成する
