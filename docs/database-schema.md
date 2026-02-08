# 広告画像ジェネレーター データベーススキーマ設計

## 1. 概要

Firebase Firestoreを使用したNoSQLデータベース設計です。

---

## 2. コレクション構成

```
firestore/
├── users/                    # ユーザー情報
├── generations/              # 生成履歴
├── templates/                # テンプレート定義
└── uploads/                  # アップロード画像管理
```

---

## 3. コレクション詳細

### 3.1 users コレクション

ユーザーの基本情報とサブスクリプション情報を管理します。

```typescript
// パス: users/{userId}
interface User {
  // 基本情報
  uid: string;                    // FirebaseユーザーID
  email: string;                  // メールアドレス
  displayName: string;            // 表示名
  photoUrl: string | null;        // プロフィール画像URL
  
  // クレジット情報
  credits: number;                // 現在のクレジット残高
  
  // サブスクリプション情報
  subscription: {
    plan: 'free' | 'starter' | 'pro' | 'business';
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    currentPeriodStart: Timestamp | null;
    currentPeriodEnd: Timestamp | null;
    cancelAtPeriodEnd: boolean;
  };
  
  // 利用統計
  usage: {
    totalGenerations: number;     // 累計生成数
    monthlyGenerations: number;   // 今月の生成数
    lastGenerationAt: Timestamp | null;
    usageResetAt: Timestamp;      // 月次リセット日
  };
  
  // タイムスタンプ
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### インデックス

| フィールド | 順序 | 用途 |
|-----------|------|------|
| email | ASC | メールでのユーザー検索 |
| subscription.plan | ASC | プラン別ユーザー抽出 |
| createdAt | DESC | 新規ユーザー順 |

---

### 3.2 generations コレクション

生成された広告画像の履歴を管理します。

```typescript
// パス: generations/{generationId}
interface Generation {
  // 識別子
  generationId: string;           // 生成ID
  userId: string;                 // 所有者のユーザーID
  
  // 画像情報
  imageUrl: string;               // R2の画像URL
  thumbnailUrl: string;           // サムネイルURL
  
  // フォーマット情報
  format: {
    type: string;                 // フォーマットタイプ
    name: string;                 // フォーマット名
    width: number;
    height: number;
    aspectRatio: string;
  };
  
  // テンプレート情報
  templateId: string;
  templateName: string;
  
  // 入力内容
  content: {
    productName: string;
    catchphrase: string;
    description?: string;
    targetAudience?: string;
    tone?: string;
    cta?: string;
    price?: string;
  };
  
  // ブランディング情報
  branding: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
  };
  
  // 商品画像
  productImageUrl?: string;
  
  // 生成に使用したプロンプト（デバッグ・改善用）
  prompt: string;
  
  // 編集履歴
  editHistory: Array<{
    editId: string;
    editType: 'text_change' | 'color_adjust' | 'style_change' | 'element_remove';
    instruction: string;
    resultImageUrl: string;
    createdAt: Timestamp;
  }>;
  
  // ステータス
  status: 'completed' | 'failed' | 'processing';
  
  // メタデータ
  creditsUsed: number;
  expiresAt: Timestamp | null;    // 履歴有効期限（プランによる）
  
  // タイムスタンプ
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### インデックス

| フィールド | 順序 | 用途 |
|-----------|------|------|
| userId, createdAt | DESC | ユーザーの履歴一覧 |
| userId, format.type | ASC | フォーマット別フィルタ |
| expiresAt | ASC | 期限切れ履歴のクリーンアップ |

---

### 3.3 templates コレクション

利用可能なテンプレートを管理します。

```typescript
// パス: templates/{templateId}
interface Template {
  // 識別子
  templateId: string;
  
  // 基本情報
  name: string;                   // テンプレート名
  description: string;            // 説明
  category: string;               // カテゴリ（modern, pop, luxury, etc.）
  
  // 画像
  thumbnailUrl: string;           // サムネイル画像
  previewUrls: string[];          // プレビュー画像（複数）
  
  // 対応フォーマット
  supportedFormats: string[];     // 対応するフォーマットタイプ
  
  // プロンプト設定
  promptTemplate: string;         // 生成用プロンプトテンプレート
  styleKeywords: string[];        // スタイルキーワード
  
  // 表示設定
  isActive: boolean;              // アクティブ状態
  order: number;                  // 表示順
  
  // メタデータ
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### インデックス

| フィールド | 順序 | 用途 |
|-----------|------|------|
| category, order | ASC | カテゴリ別表示 |
| isActive | ASC | アクティブテンプレートのみ取得 |

---

### 3.4 uploads コレクション

ユーザーがアップロードした画像（ロゴ、商品画像）を管理します。

```typescript
// パス: uploads/{uploadId}
interface Upload {
  // 識別子
  uploadId: string;
  userId: string;
  
  // 画像情報
  url: string;                    // R2のURL
  fileName: string;               // 元のファイル名
  mimeType: string;               // MIMEタイプ
  size: number;                   // ファイルサイズ（バイト）
  
  // 種類
  type: 'logo' | 'product' | 'other';
  
  // タイムスタンプ
  createdAt: Timestamp;
}
```

#### インデックス

| フィールド | 順序 | 用途 |
|-----------|------|------|
| userId, type | ASC | ユーザーの画像種類別一覧 |
| userId, createdAt | DESC | アップロード履歴 |

---

## 4. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // =====================
    // ヘルパー関数
    // =====================
    
    // 認証済みかどうか
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // 本人かどうか
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // =====================
    // users コレクション
    // =====================
    match /users/{userId} {
      // 本人のみ読み取り可能
      allow read: if isOwner(userId);
      
      // 作成は認証済みユーザーで自分のドキュメントのみ
      allow create: if isOwner(userId)
        && request.resource.data.uid == userId
        && request.resource.data.credits == 3  // 初期クレジット
        && request.resource.data.subscription.plan == 'free';
      
      // 更新は本人のみ（一部フィールドは制限）
      allow update: if isOwner(userId)
        && request.resource.data.uid == resource.data.uid  // uidは変更不可
        // creditsはサーバーサイドでのみ変更可能にするため、ここでは禁止
        && request.resource.data.credits == resource.data.credits;
      
      // 削除は禁止（アカウント削除はサーバーサイドで処理）
      allow delete: if false;
    }
    
    // =====================
    // generations コレクション
    // =====================
    match /generations/{generationId} {
      // 本人の生成履歴のみ読み取り可能
      allow read: if isAuthenticated()
        && resource.data.userId == request.auth.uid;
      
      // 作成はサーバーサイドでのみ行う
      allow create: if false;
      
      // 更新は禁止（編集履歴の追加はサーバーサイドで行う）
      allow update: if false;
      
      // 削除は本人のみ
      allow delete: if isAuthenticated()
        && resource.data.userId == request.auth.uid;
    }
    
    // =====================
    // templates コレクション
    // =====================
    match /templates/{templateId} {
      // 認証済みユーザーは読み取り可能
      allow read: if isAuthenticated();
      
      // 書き込みは禁止（管理者はAdmin SDKで操作）
      allow write: if false;
    }
    
    // =====================
    // uploads コレクション
    // =====================
    match /uploads/{uploadId} {
      // 本人のアップロードのみ読み取り可能
      allow read: if isAuthenticated()
        && resource.data.userId == request.auth.uid;
      
      // 作成は本人のみ
      allow create: if isAuthenticated()
        && request.resource.data.userId == request.auth.uid;
      
      // 更新は禁止
      allow update: if false;
      
      // 削除は本人のみ
      allow delete: if isAuthenticated()
        && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 5. データ操作パターン

### 5.1 新規ユーザー作成

```typescript
// Firebase Authのユーザー作成時に自動実行
async function createUserDocument(firebaseUser: FirebaseUser) {
  const userData: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || '',
    photoUrl: firebaseUser.photoURL,
    credits: 3,  // 初期クレジット
    subscription: {
      plan: 'free',
      status: 'active',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
    usage: {
      totalGenerations: 0,
      monthlyGenerations: 0,
      lastGenerationAt: null,
      usageResetAt: Timestamp.now(),
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  await setDoc(doc(db, 'users', firebaseUser.uid), userData);
}
```

### 5.2 画像生成時のトランザクション

```typescript
// クレジット消費と生成履歴作成をトランザクションで実行
async function createGeneration(
  userId: string,
  generationData: Omit<Generation, 'generationId' | 'createdAt' | 'updatedAt'>
) {
  return await runTransaction(db, async (transaction) => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data() as User;
    
    if (userData.credits < 1) {
      throw new Error('Insufficient credits');
    }
    
    // クレジット消費
    transaction.update(userRef, {
      credits: userData.credits - 1,
      'usage.totalGenerations': userData.usage.totalGenerations + 1,
      'usage.monthlyGenerations': userData.usage.monthlyGenerations + 1,
      'usage.lastGenerationAt': Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    // 生成履歴作成
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const generationRef = doc(db, 'generations', generationId);
    
    transaction.set(generationRef, {
      generationId,
      userId,
      ...generationData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return generationId;
  });
}
```

### 5.3 サブスクリプション更新（Webhook処理）

```typescript
// Stripe Webhookからのサブスクリプション更新
async function updateSubscription(
  userId: string,
  subscriptionData: {
    plan: string;
    status: string;
    stripeSubscriptionId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  }
) {
  const userRef = doc(db, 'users', userId);
  
  const planCredits = {
    starter: 50,
    pro: 200,
    business: 1000,
  };
  
  await updateDoc(userRef, {
    'subscription.plan': subscriptionData.plan,
    'subscription.status': subscriptionData.status,
    'subscription.stripeSubscriptionId': subscriptionData.stripeSubscriptionId,
    'subscription.currentPeriodStart': Timestamp.fromDate(subscriptionData.currentPeriodStart),
    'subscription.currentPeriodEnd': Timestamp.fromDate(subscriptionData.currentPeriodEnd),
    credits: planCredits[subscriptionData.plan] || 0,
    'usage.monthlyGenerations': 0,  // リセット
    'usage.usageResetAt': Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}
```

---

## 6. バックアップと保守

### 6.1 自動バックアップ

- Firestoreの自動バックアップを有効化
- 日次でCloud Storageにエクスポート

### 6.2 期限切れデータのクリーンアップ

```typescript
// Cloud Functionsで定期実行
async function cleanupExpiredGenerations() {
  const now = Timestamp.now();
  
  const expiredQuery = query(
    collection(db, 'generations'),
    where('expiresAt', '<=', now)
  );
  
  const snapshot = await getDocs(expiredQuery);
  
  const batch = writeBatch(db);
  
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
    // R2からも画像を削除（別途処理）
  });
  
  await batch.commit();
}
```

---

## 7. 履歴保存期間の設定

| プラン | 保存期間 | expiresAt設定 |
|--------|---------|---------------|
| Free | 7日間 | createdAt + 7日 |
| Starter | 30日間 | createdAt + 30日 |
| Pro | 90日間 | createdAt + 90日 |
| Business | 無制限 | null |
