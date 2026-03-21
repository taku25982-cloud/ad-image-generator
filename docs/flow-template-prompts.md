# Flow Prompt Guide

外部の画像生成環境で現在のテンプレート挙動を再現したい場合の簡易ガイドです。

## 正式な参照先

- 展開済み全文: [flow-template-prompts-expanded.md](/C:/Projects/gemini-cli-company-demo/apps/ad-image-generator/docs/flow-template-prompts-expanded.md)
- 生成元スクリプト: [export-flow-template-prompts.mjs](/C:/Projects/gemini-cli-company-demo/apps/ad-image-generator/scripts/export-flow-template-prompts.mjs)
- テンプレート定義: [templates.ts](/C:/Projects/gemini-cli-company-demo/apps/ad-image-generator/src/lib/templates.ts)
- 実際の生成 API: [route.ts](/C:/Projects/gemini-cli-company-demo/apps/ad-image-generator/src/app/api/generate/route.ts)

## 現在のプロンプト構成

生成時の指示は次の 5 ブロックで構成されます。

1. `【広告の目的】`
2. `【入力情報】`
3. `【テキスト固定ルール】`
4. `【カスタム指示】`
5. `【デザイン要件】` と `【重要な指示】`

## 現在の特徴

- 主要文言は言い換えず、そのまま使うルールあり
- テンプレートごとに個別のクリエイティブプロファイルあり
  - 主役
  - 背景 / 演出
  - 構図
  - 文字配置
  - 禁止事項
- 共通の広告クリエイティブ原則あり
  - 主役は 1 つ
  - 文字は 3 階層以内
  - コラージュ感を避ける
  - 役割がひと目でわかる構図
  - 光・角度・余白・文字位置を安定させる

## 現在の対応フォーマット

- `instagram-story` `1080x1920`
- `instagram-feed` `1080x1080`
- `facebook-ad` `1200x628`
- `twitter-post` `1200x675`
- `youtube-thumbnail` `1280x720`
- `google-display` `300x250`
- `ec-banner` `728x90`
- `product-image` `800x800`

## 再生成

```powershell
node --experimental-strip-types scripts/export-flow-template-prompts.mjs
```

実際に Flow へコピペする場合は、基本的に [flow-template-prompts-expanded.md](/C:/Projects/gemini-cli-company-demo/apps/ad-image-generator/docs/flow-template-prompts-expanded.md) の `Full Prompt` を使うのが最も確実です。
