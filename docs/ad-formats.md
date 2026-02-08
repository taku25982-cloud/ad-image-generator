# 広告画像ジェネレーター 広告フォーマット定義

## 1. SNS広告フォーマット

### 1.1 Instagram

| 識別子 | 名称 | サイズ (px) | アスペクト比 | 用途 |
|--------|------|------------|-------------|------|
| `instagram_feed` | Instagram フィード | 1080 x 1080 | 1:1 | 通常投稿・広告 |
| `instagram_feed_portrait` | Instagram フィード（縦型） | 1080 x 1350 | 4:5 | 縦型フィード投稿 |
| `instagram_story` | Instagram ストーリー | 1080 x 1920 | 9:16 | ストーリー・リール広告 |
| `instagram_carousel` | Instagram カルーセル | 1080 x 1080 | 1:1 | カルーセル広告 |

### 1.2 Facebook

| 識別子 | 名称 | サイズ (px) | アスペクト比 | 用途 |
|--------|------|------------|-------------|------|
| `facebook_feed` | Facebook フィード | 1200 x 628 | 1.91:1 | ニュースフィード広告 |
| `facebook_square` | Facebook スクエア | 1200 x 1200 | 1:1 | フィード広告（正方形） |
| `facebook_story` | Facebook ストーリー | 1080 x 1920 | 9:16 | ストーリー広告 |
| `facebook_carousel` | Facebook カルーセル | 1080 x 1080 | 1:1 | カルーセル広告 |

### 1.3 X (Twitter)

| 識別子 | 名称 | サイズ (px) | アスペクト比 | 用途 |
|--------|------|------------|-------------|------|
| `twitter_single` | X シングル画像 | 1200 x 675 | 16:9 | 単一画像投稿 |
| `twitter_square` | X スクエア | 1200 x 1200 | 1:1 | 正方形画像投稿 |
| `twitter_card` | X カード | 800 x 418 | 1.91:1 | Twitterカード |

### 1.4 TikTok

| 識別子 | 名称 | サイズ (px) | アスペクト比 | 用途 |
|--------|------|------------|-------------|------|
| `tiktok_vertical` | TikTok 縦型 | 1080 x 1920 | 9:16 | 動画広告サムネイル |

### 1.5 YouTube

| 識別子 | 名称 | サイズ (px) | アスペクト比 | 用途 |
|--------|------|------------|-------------|------|
| `youtube_thumbnail` | YouTube サムネイル | 1280 x 720 | 16:9 | 動画サムネイル |
| `youtube_banner` | YouTube バナー | 2560 x 1440 | 16:9 | チャンネルバナー |

### 1.6 Pinterest

| 識別子 | 名称 | サイズ (px) | アスペクト比 | 用途 |
|--------|------|------------|-------------|------|
| `pinterest_standard` | Pinterest スタンダード | 1000 x 1500 | 2:3 | 通常ピン |
| `pinterest_square` | Pinterest スクエア | 1000 x 1000 | 1:1 | 正方形ピン |
| `pinterest_long` | Pinterest ロング | 1000 x 2100 | 1:2.1 | ロング形式ピン |

### 1.7 LINE

| 識別子 | 名称 | サイズ (px) | アスペクト比 | 用途 |
|--------|------|------------|-------------|------|
| `line_square` | LINE スクエア | 1080 x 1080 | 1:1 | LINE広告 |
| `line_vertical` | LINE 縦型 | 1080 x 1920 | 9:16 | LINE VOOM |

---

## 2. ECサイト・マーケットプレイス

### 2.1 Amazon

| 識別子 | 名称 | サイズ (px) | アスペクト比 | 備考 |
|--------|------|------------|-------------|------|
| `amazon_main` | Amazon メイン画像 | 2000 x 2000 | 1:1 | 白背景推奨 |
| `amazon_sub` | Amazon サブ画像 | 1500 x 1500 | 1:1 | 商品詳細画像 |
| `amazon_a_plus` | Amazon A+コンテンツ | 970 x 600 | - | 商品紹介コンテンツ |

### 2.2 楽天市場

| 識別子 | 名称 | サイズ (px) | アスペクト比 | 備考 |
|--------|------|------------|-------------|------|
| `rakuten_main` | 楽天 メイン画像 | 700 x 700 | 1:1 | 商品一覧表示 |
| `rakuten_large` | 楽天 大画像 | 1200 x 1200 | 1:1 | 商品詳細ページ |

### 2.3 Yahoo!ショッピング

| 識別子 | 名称 | サイズ (px) | アスペクト比 | 備考 |
|--------|------|------------|-------------|------|
| `yahoo_main` | Yahoo! メイン画像 | 600 x 600 | 1:1 | 商品一覧表示 |
| `yahoo_large` | Yahoo! 大画像 | 1200 x 1200 | 1:1 | 商品詳細ページ |

### 2.4 Shopify / 自社EC

| 識別子 | 名称 | サイズ (px) | アスペクト比 | 備考 |
|--------|------|------------|-------------|------|
| `shopify_square` | Shopify スクエア | 2048 x 2048 | 1:1 | 商品画像 |
| `shopify_portrait` | Shopify 縦型 | 2048 x 2732 | 3:4 | 縦型商品画像 |

---

## 3. バナー広告（GDN/YDA）

### 3.1 レクタングル

| 識別子 | 名称 | サイズ (px) | 用途 |
|--------|------|------------|------|
| `banner_rectangle_large` | レクタングル（大） | 336 x 280 | 記事内・サイドバー |
| `banner_rectangle_medium` | レクタングル（中） | 300 x 250 | 記事内・サイドバー |
| `banner_square` | スクエア | 250 x 250 | 汎用 |

### 3.2 ビッグバナー

| 識別子 | 名称 | サイズ (px) | 用途 |
|--------|------|------------|------|
| `banner_leaderboard` | リーダーボード | 728 x 90 | ヘッダー・フッター |
| `banner_large_leaderboard` | ラージリーダーボード | 970 x 90 | 大型ヘッダー |
| `banner_billboard` | ビルボード | 970 x 250 | 大型広告枠 |

### 3.3 モバイルバナー

| 識別子 | 名称 | サイズ (px) | 用途 |
|--------|------|------------|------|
| `banner_mobile` | モバイルバナー | 320 x 50 | スマートフォン |
| `banner_mobile_large` | モバイルバナー（大） | 320 x 100 | スマートフォン |

### 3.4 スカイスクレイパー

| 識別子 | 名称 | サイズ (px) | 用途 |
|--------|------|------------|------|
| `banner_skyscraper` | スカイスクレイパー | 160 x 600 | サイドバー |
| `banner_skyscraper_wide` | ワイドスカイスクレイパー | 300 x 600 | サイドバー |

---

## 4. その他の広告フォーマット

### 4.1 Google Ads

| 識別子 | 名称 | サイズ (px) | 用途 |
|--------|------|------------|------|
| `google_display_square` | ディスプレイ（正方形） | 1200 x 1200 | レスポンシブ広告 |
| `google_display_landscape` | ディスプレイ（横長） | 1200 x 628 | レスポンシブ広告 |

### 4.2 メールマガジン

| 識別子 | 名称 | サイズ (px) | 用途 |
|--------|------|------------|------|
| `email_header` | メールヘッダー | 600 x 200 | メルマガヘッダー |
| `email_banner` | メールバナー | 600 x 300 | メルマガ内バナー |

---

## 5. フォーマット定義（TypeScript）

```typescript
export interface AdFormat {
  type: string;
  name: string;
  category: 'sns' | 'ec' | 'banner' | 'other';
  platform: string;
  width: number;
  height: number;
  aspectRatio: string;
  description?: string;
  notes?: string;
}

export const AD_FORMATS: AdFormat[] = [
  // SNS - Instagram
  {
    type: 'instagram_feed',
    name: 'Instagram フィード',
    category: 'sns',
    platform: 'Instagram',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: '通常投稿・広告に最適',
  },
  {
    type: 'instagram_story',
    name: 'Instagram ストーリー',
    category: 'sns',
    platform: 'Instagram',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'ストーリー・リール広告',
  },
  // ... その他のフォーマット
];

// カテゴリ別にグループ化
export const FORMAT_CATEGORIES = {
  sns: {
    name: 'SNS広告',
    description: 'Instagram, Facebook, X, TikTok, YouTube, Pinterest, LINE',
    platforms: ['Instagram', 'Facebook', 'X', 'TikTok', 'YouTube', 'Pinterest', 'LINE'],
  },
  ec: {
    name: 'ECサイト・マーケットプレイス',
    description: 'Amazon, 楽天市場, Yahoo!ショッピング, Shopify',
    platforms: ['Amazon', '楽天市場', 'Yahoo!ショッピング', 'Shopify'],
  },
  banner: {
    name: 'バナー広告',
    description: 'GDN/YDA向けバナー広告',
    platforms: ['GDN', 'YDA'],
  },
  other: {
    name: 'その他',
    description: 'Googleディスプレイ広告、メールマガジンなど',
    platforms: ['Google Ads', 'Email'],
  },
};
```

---

## 6. 推奨事項

### 6.1 画像品質
- 解像度: 72dpi以上推奨（Retinaディスプレイ対応は144dpi）
- 形式: PNG（透過必要時）、JPEG（写真素材）
- 最大ファイルサイズ: プラットフォームの制限に準拠

### 6.2 テキスト配置
- Facebook/Instagram: 画像の20%以下にテキストを抑える（推奨）
- 重要な情報は中央に配置（自動トリミング対策）

### 6.3 セーフゾーン
- ストーリー形式: 上下に14%のセーフゾーンを確保
- モバイル表示を考慮した重要情報の配置
