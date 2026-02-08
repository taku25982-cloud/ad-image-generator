# 広告画像ジェネレーター API設計書

## 1. API概要

このドキュメントでは、広告画像ジェネレーターのAPI設計について定義します。

### 1.1 ベースURL

- **開発環境**: `http://localhost:3000/api`
- **本番環境**: `https://your-domain.pages.dev/api`

### 1.2 認証

すべてのAPIリクエストは、FirebaseのIDトークンをAuthorizationヘッダーに含める必要があります。

```
Authorization: Bearer <Firebase ID Token>
```

---

## 2. 画像生成 API

### 2.1 画像生成

**POST** `/api/generate`

広告画像を生成します。1クレジットを消費します。

#### リクエスト

```json
{
  "templateId": "template_001",
  "format": {
    "type": "instagram_feed",
    "width": 1080,
    "height": 1080
  },
  "content": {
    "productName": "商品名",
    "catchphrase": "キャッチコピー",
    "description": "商品説明（オプション）",
    "targetAudience": "ターゲット層（オプション）",
    "tone": "premium",
    "cta": "今すぐ購入",
    "price": "¥9,800"
  },
  "branding": {
    "primaryColor": "#FF5733",
    "secondaryColor": "#333333",
    "logoUrl": "https://r2.example.com/logos/logo.png"
  },
  "productImageUrl": "https://r2.example.com/products/product.png"
}
```

#### レスポンス（成功: 200）

```json
{
  "success": true,
  "data": {
    "generationId": "gen_abc123",
    "imageUrl": "https://r2.example.com/generations/gen_abc123.png",
    "format": {
      "type": "instagram_feed",
      "width": 1080,
      "height": 1080
    },
    "creditsUsed": 1,
    "creditsRemaining": 49,
    "createdAt": "2026-02-08T14:00:00Z"
  }
}
```

#### エラーレスポンス（400/401/402/500）

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "クレジットが不足しています"
  }
}
```

#### エラーコード

| コード | 説明 |
|--------|------|
| UNAUTHORIZED | 認証が必要です |
| INSUFFICIENT_CREDITS | クレジット不足 |
| INVALID_FORMAT | フォーマットが不正 |
| GENERATION_FAILED | 生成に失敗しました |
| RATE_LIMIT_EXCEEDED | レート制限超過 |

---

### 2.2 画像再生成

**POST** `/api/generate/regenerate`

既存の生成設定を使用して再生成します。1クレジットを消費します。

#### リクエスト

```json
{
  "generationId": "gen_abc123"
}
```

#### レスポンス

画像生成APIと同じ形式

---

## 3. AI編集 API

### 3.1 画像編集

**POST** `/api/edit`

生成した画像をAIで編集します。1クレジットを消費します。
**注意**: 有料プラン限定機能

#### リクエスト

```json
{
  "generationId": "gen_abc123",
  "editType": "text_change",
  "editParams": {
    "instruction": "キャッチコピーを「限定セール開催中」に変更してください"
  }
}
```

#### 編集タイプ

| タイプ | 説明 |
|--------|------|
| text_change | テキスト内容の変更 |
| color_adjust | 色味・トーンの調整 |
| style_change | スタイルの変更 |
| element_remove | 要素の削除 |

#### レスポンス（成功: 200）

```json
{
  "success": true,
  "data": {
    "generationId": "gen_abc123_edit1",
    "originalId": "gen_abc123",
    "imageUrl": "https://r2.example.com/generations/gen_abc123_edit1.png",
    "creditsUsed": 1,
    "creditsRemaining": 48,
    "createdAt": "2026-02-08T14:05:00Z"
  }
}
```

---

## 4. 履歴 API

### 4.1 履歴一覧取得

**GET** `/api/history`

ユーザーの生成履歴を取得します。

#### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| limit | number | No | 取得件数（デフォルト: 20, 最大: 100） |
| cursor | string | No | ページネーションカーソル |
| formatType | string | No | フォーマットでフィルタ |

#### レスポンス（成功: 200）

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "generationId": "gen_abc123",
        "imageUrl": "https://r2.example.com/generations/gen_abc123.png",
        "thumbnailUrl": "https://r2.example.com/thumbnails/gen_abc123.png",
        "format": {
          "type": "instagram_feed",
          "width": 1080,
          "height": 1080
        },
        "content": {
          "productName": "商品名",
          "catchphrase": "キャッチコピー"
        },
        "createdAt": "2026-02-08T14:00:00Z"
      }
    ],
    "nextCursor": "cursor_xyz789",
    "hasMore": true
  }
}
```

### 4.2 履歴詳細取得

**GET** `/api/history/:generationId`

特定の生成履歴の詳細を取得します。

#### レスポンス（成功: 200）

```json
{
  "success": true,
  "data": {
    "generationId": "gen_abc123",
    "imageUrl": "https://r2.example.com/generations/gen_abc123.png",
    "format": {
      "type": "instagram_feed",
      "width": 1080,
      "height": 1080
    },
    "content": {
      "productName": "商品名",
      "catchphrase": "キャッチコピー",
      "description": "商品説明",
      "targetAudience": "20-30代女性",
      "tone": "premium",
      "cta": "今すぐ購入"
    },
    "branding": {
      "primaryColor": "#FF5733",
      "secondaryColor": "#333333",
      "logoUrl": "https://r2.example.com/logos/logo.png"
    },
    "templateId": "template_001",
    "editHistory": [
      {
        "editId": "edit_001",
        "editType": "text_change",
        "createdAt": "2026-02-08T14:05:00Z"
      }
    ],
    "createdAt": "2026-02-08T14:00:00Z"
  }
}
```

### 4.3 履歴削除

**DELETE** `/api/history/:generationId`

生成履歴を削除します。関連する画像もR2から削除されます。

#### レスポンス（成功: 200）

```json
{
  "success": true,
  "message": "履歴を削除しました"
}
```

---

## 5. 画像管理 API

### 5.1 画像アップロード

**POST** `/api/images/upload`

ロゴや商品画像をアップロードします。

#### リクエスト

```
Content-Type: multipart/form-data

file: (binary)
type: "logo" | "product"
```

#### レスポンス（成功: 200）

```json
{
  "success": true,
  "data": {
    "imageId": "img_xyz789",
    "url": "https://r2.example.com/uploads/img_xyz789.png",
    "type": "logo",
    "size": 102400,
    "createdAt": "2026-02-08T14:00:00Z"
  }
}
```

### 5.2 署名付きURL取得

**GET** `/api/images/:imageId/url`

画像のダウンロード用署名付きURLを取得します。

#### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| format | string | No | 出力形式（png/jpg） |

#### レスポンス（成功: 200）

```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://r2.example.com/...(signed)",
    "expiresAt": "2026-02-08T15:00:00Z"
  }
}
```

---

## 6. ユーザー API

### 6.1 プロファイル取得

**GET** `/api/user/profile`

現在のユーザープロファイルを取得します。

#### レスポンス（成功: 200）

```json
{
  "success": true,
  "data": {
    "uid": "user_123",
    "email": "user@example.com",
    "displayName": "ユーザー名",
    "photoUrl": "https://...",
    "credits": 50,
    "subscription": {
      "plan": "pro",
      "status": "active",
      "currentPeriodEnd": "2026-03-08T00:00:00Z"
    },
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

### 6.2 クレジット残高取得

**GET** `/api/user/credits`

クレジット残高を取得します。

#### レスポンス（成功: 200）

```json
{
  "success": true,
  "data": {
    "credits": 50,
    "plan": "pro",
    "monthlyAllowance": 200,
    "usedThisMonth": 150
  }
}
```

---

## 7. 課金 API

### 7.1 Checkout Session作成

**POST** `/api/billing/checkout`

Stripe Checkout Sessionを作成します。

#### リクエスト

```json
{
  "priceId": "price_xxx",
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

#### レスポンス（成功: 200）

```json
{
  "success": true,
  "data": {
    "sessionId": "cs_xxx",
    "url": "https://checkout.stripe.com/..."
  }
}
```

### 7.2 カスタマーポータルセッション作成

**POST** `/api/billing/portal`

Stripeカスタマーポータルへのセッションを作成します。

#### レスポンス（成功: 200）

```json
{
  "success": true,
  "data": {
    "url": "https://billing.stripe.com/..."
  }
}
```

### 7.3 サブスクリプション情報取得

**GET** `/api/billing/subscription`

現在のサブスクリプション情報を取得します。

#### レスポンス（成功: 200）

```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_xxx",
    "plan": "pro",
    "status": "active",
    "currentPeriodStart": "2026-02-08T00:00:00Z",
    "currentPeriodEnd": "2026-03-08T00:00:00Z",
    "cancelAtPeriodEnd": false
  }
}
```

### 7.4 Stripe Webhook

**POST** `/api/webhook/stripe`

Stripeからのイベントを処理します。

#### 処理するイベント

| イベント | 処理内容 |
|---------|---------|
| checkout.session.completed | サブスクリプション作成、クレジット付与 |
| customer.subscription.updated | プラン変更、クレジット調整 |
| customer.subscription.deleted | サブスクリプション解約処理 |
| invoice.paid | 月次クレジット付与 |
| invoice.payment_failed | 支払い失敗通知 |

---

## 8. テンプレート API

### 8.1 テンプレート一覧取得

**GET** `/api/templates`

利用可能なテンプレート一覧を取得します。

#### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| category | string | No | カテゴリでフィルタ |

#### レスポンス（成功: 200）

```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "templateId": "template_001",
        "name": "シンプルモダン",
        "description": "シンプルでモダンなデザイン",
        "category": "modern",
        "thumbnailUrl": "https://...",
        "supportedFormats": ["instagram_feed", "facebook_ad"]
      }
    ]
  }
}
```

---

## 9. フォーマット API

### 9.1 フォーマット一覧取得

**GET** `/api/formats`

利用可能な広告フォーマット一覧を取得します。

#### レスポンス（成功: 200）

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "categoryId": "sns",
        "name": "SNS広告",
        "formats": [
          {
            "type": "instagram_feed",
            "name": "Instagram フィード",
            "width": 1080,
            "height": 1080,
            "aspectRatio": "1:1"
          },
          {
            "type": "instagram_story",
            "name": "Instagram ストーリー",
            "width": 1080,
            "height": 1920,
            "aspectRatio": "9:16"
          }
        ]
      },
      {
        "categoryId": "ec",
        "name": "ECサイト",
        "formats": [
          {
            "type": "amazon_main",
            "name": "Amazon メイン画像",
            "width": 2000,
            "height": 2000,
            "aspectRatio": "1:1"
          }
        ]
      }
    ]
  }
}
```

---

## 10. レート制限

| エンドポイント | 制限 |
|---------------|------|
| /api/generate | 10リクエスト/分 |
| /api/edit | 10リクエスト/分 |
| /api/images/upload | 20リクエスト/分 |
| その他 | 100リクエスト/分 |

レート制限超過時は `429 Too Many Requests` を返します。
