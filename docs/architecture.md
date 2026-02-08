# 広告画像ジェネレーター アーキテクチャ設計書

## 1. システム全体構成

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Cloudflare Pages                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Next.js Application                        │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │   │
│  │  │   Pages      │  │  Components   │  │    Hooks     │       │   │
│  │  │  (App Router)│  │              │  │              │       │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │              API Routes (Server Actions)             │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                │                    │                    │
                ▼                    ▼                    ▼
    ┌───────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │  Firebase         │ │ Google Gemini   │ │  Cloudflare R2  │
    │  ┌─────────────┐  │ │  3 Pro          │ │                 │
    │  │ Auth        │  │ │  (Image Gen)    │ │  (画像保存)      │
    │  └─────────────┘  │ └─────────────────┘ └─────────────────┘
    │  ┌─────────────┐  │
    │  │ Firestore   │  │         │
    │  └─────────────┘  │         ▼
    └───────────────────┘ ┌─────────────────┐
                          │     Stripe      │
                          │   (決済処理)     │
                          └─────────────────┘
```

---

## 2. ディレクトリ構成

```
ad-image-generator/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # 認証関連グループ
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/              # ダッシュボードグループ
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── create/               # 広告作成
│   │   │   │   └── page.tsx
│   │   │   ├── history/              # 履歴
│   │   │   │   └── page.tsx
│   │   │   ├── settings/             # 設定
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (marketing)/              # マーケティンググループ
│   │   │   ├── page.tsx              # ランディングページ
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/                      # APIルート
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   ├── generate/
│   │   │   │   └── route.ts
│   │   │   ├── edit/
│   │   │   │   └── route.ts
│   │   │   ├── webhook/
│   │   │   │   └── stripe/
│   │   │   │       └── route.ts
│   │   │   └── images/
│   │   │       └── [id]/
│   │   │           └── route.ts
│   │   │
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # 基本UIコンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                   # レイアウトコンポーネント
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   │
│   │   ├── features/                 # 機能別コンポーネント
│   │   │   ├── auth/
│   │   │   │   ├── LoginButton.tsx
│   │   │   │   └── UserMenu.tsx
│   │   │   │
│   │   │   ├── generation/
│   │   │   │   ├── TemplateSelector.tsx
│   │   │   │   ├── FormatSelector.tsx
│   │   │   │   ├── InputForm.tsx
│   │   │   │   ├── PreviewCanvas.tsx
│   │   │   │   └── GenerationResult.tsx
│   │   │   │
│   │   │   ├── editor/
│   │   │   │   ├── ImageEditor.tsx
│   │   │   │   └── EditToolbar.tsx
│   │   │   │
│   │   │   ├── history/
│   │   │   │   ├── HistoryList.tsx
│   │   │   │   └── HistoryCard.tsx
│   │   │   │
│   │   │   └── billing/
│   │   │       ├── CreditDisplay.tsx
│   │   │       ├── PlanCard.tsx
│   │   │       └── SubscriptionManager.tsx
│   │   │
│   │   └── common/                   # 共通コンポーネント
│   │       ├── Loading.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── Toast.tsx
│   │
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── config.ts             # Firebase設定
│   │   │   ├── auth.ts               # 認証ユーティリティ
│   │   │   ├── firestore.ts          # Firestore操作
│   │   │   └── admin.ts              # Firebase Admin SDK
│   │   │
│   │   ├── r2/
│   │   │   ├── client.ts             # R2クライアント
│   │   │   └── upload.ts             # アップロード処理
│   │   │
│   │   ├── stripe/
│   │   │   ├── client.ts             # Stripeクライアント
│   │   │   ├── checkout.ts           # チェックアウト処理
│   │   │   └── webhook.ts            # Webhook処理
│   │   │
│   │   ├── gemini/
│   │   │   ├── client.ts             # Gemini APIクライアント
│   │   │   ├── generate.ts           # 画像生成処理
│   │   │   └── edit.ts               # 画像編集処理
│   │   │
│   │   └── utils/
│   │       ├── format.ts             # フォーマット関連
│   │       ├── validation.ts         # バリデーション
│   │       └── constants.ts          # 定数定義
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                # 認証フック
│   │   ├── useCredits.ts             # クレジット管理
│   │   ├── useGeneration.ts          # 画像生成
│   │   ├── useHistory.ts             # 履歴管理
│   │   └── useSubscription.ts        # サブスクリプション
│   │
│   ├── store/                        # 状態管理（Zustand等）
│   │   ├── authStore.ts
│   │   ├── generationStore.ts
│   │   └── uiStore.ts
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── generation.ts
│   │   ├── billing.ts
│   │   └── index.ts
│   │
│   └── styles/
│       └── components/
│
├── public/
│   ├── images/
│   │   └── templates/                # テンプレートサムネイル
│   └── icons/
│
├── docs/                             # ドキュメント
│   ├── requirements.md
│   ├── architecture.md
│   ├── tasks.md
│   ├── api-design.md
│   └── database-schema.md
│
├── .env.local                        # 環境変数（ローカル）
├── .env.example                      # 環境変数サンプル
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. データフロー

### 3.1 画像生成フロー

```
┌─────────┐     ┌──────────────┐     ┌───────────────┐
│ ユーザー  │────▶│  入力フォーム  │────▶│ バリデーション  │
└─────────┘     └──────────────┘     └───────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────┐
│                    API Route: /api/generate              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │クレジット確認 │─▶│プロンプト生成 │─▶│ Gemini API   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                                              │
                         ┌────────────────────┼────────────────────┐
                         ▼                    ▼                    ▼
              ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
              │ R2に保存     │     │ Firestoreに  │     │ クレジット   │
              │              │     │ メタデータ保存│     │  減算        │
              └──────────────┘     └──────────────┘     └──────────────┘
                                              │
                                              ▼
                                    ┌──────────────┐
                                    │ 結果を返却    │
                                    └──────────────┘
```

### 3.2 決済フロー

```
┌─────────┐     ┌──────────────┐     ┌───────────────┐
│ ユーザー │────▶│ プラン選択    │────▶│ Stripe        │
│         │     │              │     │ Checkout      │
└─────────┘     └──────────────┘     └───────────────┘
                                              │
                                              ▼
                                    ┌───────────────┐
                                    │ 決済完了       │
                                    └───────────────┘
                                              │
                                              ▼
                                    ┌───────────────┐
                                    │ Webhook受信   │
                                    │ /api/webhook  │
                                    └───────────────┘
                                              │
                         ┌────────────────────┼────────────────────┐
                         ▼                    ▼                    ▼
              ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
              │ サブスク更新  │     │ クレジット   │     │ ユーザー通知 │
              │ (Firestore)  │     │ 付与         │     │              │
              └──────────────┘     └──────────────┘     └──────────────┘
```

---

## 4. 認証フロー

```
┌─────────┐     ┌──────────────┐     ┌───────────────┐
│ ユーザー │────▶│ Googleログイン │────▶│ Firebase Auth │
│         │     │ ボタンクリック │     │               │
└─────────┘     └──────────────┘     └───────────────┘
                                              │
                                              ▼
                                    ┌───────────────┐
                                    │ Google認証    │
                                    │ ポップアップ   │
                                    └───────────────┘
                                              │
                                              ▼
                                    ┌───────────────┐
                                    │ 認証成功      │
                                    │ トークン発行   │
                                    └───────────────┘
                                              │
                        ┌─────────────────────┴─────────────────────┐
                        ▼                                           ▼
              ┌──────────────────┐                      ┌──────────────────┐
              │ 新規ユーザー?    │                      │ 既存ユーザー     │
              │                  │                      │                  │
              │ → ユーザー作成   │                      │ → ログイン完了   │
              │ → 初期クレジット │                      │                  │
              │   (3) 付与       │                      │                  │
              └──────────────────┘                      └──────────────────┘
```

---

## 5. セキュリティ設計

### 5.1 環境変数

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=

# Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT=
R2_BUCKET_NAME=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Gemini
GEMINI_API_KEY=
```

### 5.2 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザードキュメント
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 生成履歴
    match /generations/{generationId} {
      allow read: if request.auth != null 
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null 
        && resource.data.userId == request.auth.uid;
    }
    
    // テンプレート（読み取り専用）
    match /templates/{templateId} {
      allow read: if true;
    }
  }
}
```

---

## 6. 外部サービス連携

### 6.1 Gemini API

- **用途**: 広告画像の生成・編集
- **モデル**: gemini-3-pro-image-preview
- **レート制限**: 60 RPM（要確認）
- **エラーハンドリング**: リトライロジック実装

### 6.2 Cloudflare R2

- **用途**: 生成画像の保存
- **アクセス**: 署名付きURL経由
- **ライフサイクル**: プランに応じた保存期間設定

### 6.3 Stripe

- **用途**: サブスクリプション決済
- **Webhook**: checkout.session.completed, customer.subscription.updated等

---

## 7. パフォーマンス最適化

### 7.1 画像最適化
- Next.js Image Optimization
- R2からの直接配信

### 7.2 キャッシング
- テンプレートデータのキャッシュ
- ユーザープロファイルのキャッシュ

### 7.3 遅延読み込み
- コンポーネントの動的インポート
- 画像の遅延読み込み
