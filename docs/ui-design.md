# 広告画像ジェネレーター UIデザインガイドライン

## 1. デザインコンセプト

### 1.1 テーマ: **Luminous Studio**

**方向性**: ライト基調・洗練されたクリエイティブスタジオ

広告クリエイターが使う「明るく開放的なスタジオ」をイメージ。
清潔感と信頼感を与えつつ、クリエイティビティを刺激するデザイン。

### 1.2 トーン
- **ライト & エアリー** - 白を基調とした開放感
- **プロフェッショナル** - ビジネスツールとしての信頼感
- **クリエイティブ** - 遊び心のあるアクセント
- **モダン** - 最新のデザイントレンドを取り入れる

---

## 2. カラーパレット

### 2.1 ベースカラー（ライト基調）

```css
:root {
  /* Background */
  --bg-primary: #FFFFFF;           /* メイン背景 */
  --bg-secondary: #F8FAFC;         /* セカンダリ背景 */
  --bg-tertiary: #F1F5F9;          /* カード・セクション背景 */
  --bg-elevated: #FFFFFF;          /* 浮き上がり要素 */
  
  /* Surface */
  --surface-hover: #F1F5F9;
  --surface-active: #E2E8F0;
  --surface-muted: #F8FAFC;
  
  /* Border */
  --border-default: #E2E8F0;
  --border-subtle: #F1F5F9;
  --border-strong: #CBD5E1;
}
```

### 2.2 テキストカラー

```css
:root {
  --text-primary: #0F172A;         /* メインテキスト */
  --text-secondary: #475569;       /* サブテキスト */
  --text-tertiary: #94A3B8;        /* 補助テキスト */
  --text-disabled: #CBD5E1;        /* 無効テキスト */
  --text-inverse: #FFFFFF;         /* 反転テキスト */
}
```

### 2.3 アクセントカラー

```css
:root {
  /* Primary - ビビッドなコーラル/オレンジ系 */
  --primary-50: #FFF7ED;
  --primary-100: #FFEDD5;
  --primary-200: #FED7AA;
  --primary-300: #FDBA74;
  --primary-400: #FB923C;
  --primary-500: #F97316;           /* メインアクセント */
  --primary-600: #EA580C;
  --primary-700: #C2410C;
  
  /* Secondary - ソフトなインディゴ */
  --secondary-50: #EEF2FF;
  --secondary-100: #E0E7FF;
  --secondary-500: #6366F1;
  --secondary-600: #4F46E5;
  
  /* Success */
  --success-500: #22C55E;
  --success-50: #F0FDF4;
  
  /* Warning */
  --warning-500: #EAB308;
  --warning-50: #FEFCE8;
  
  /* Error */
  --error-500: #EF4444;
  --error-50: #FEF2F2;
}
```

### 2.4 グラデーション

```css
:root {
  /* ヒーローセクション用 */
  --gradient-hero: linear-gradient(135deg, #FFF7ED 0%, #EEF2FF 50%, #F0FDF4 100%);
  
  /* カード用の微妙なグラデーション */
  --gradient-card: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
  
  /* アクセントグラデーション */
  --gradient-accent: linear-gradient(135deg, #F97316 0%, #FB923C 50%, #6366F1 100%);
  
  /* CTAボタン用 */
  --gradient-cta: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
}
```

---

## 3. タイポグラフィ

### 3.1 フォントファミリー

```css
:root {
  /* 見出し - Outfit（モダンでフレンドリー） */
  --font-display: 'Outfit', sans-serif;
  
  /* 本文 - Noto Sans JP + Source Sans 3 */
  --font-body: 'Noto Sans JP', 'Source Sans 3', sans-serif;
  
  /* コード・数値 */
  --font-mono: 'JetBrains Mono', monospace;
}
```

### 3.2 フォントサイズ

```css
:root {
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  --text-6xl: 3.75rem;     /* 60px */
}
```

### 3.3 フォントウェイト

```css
:root {
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

---

## 4. スペーシング & レイアウト

### 4.1 スペーシングスケール

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;      /* 4px */
  --space-2: 0.5rem;       /* 8px */
  --space-3: 0.75rem;      /* 12px */
  --space-4: 1rem;         /* 16px */
  --space-5: 1.25rem;      /* 20px */
  --space-6: 1.5rem;       /* 24px */
  --space-8: 2rem;         /* 32px */
  --space-10: 2.5rem;      /* 40px */
  --space-12: 3rem;        /* 48px */
  --space-16: 4rem;        /* 64px */
  --space-20: 5rem;        /* 80px */
  --space-24: 6rem;        /* 96px */
}
```

### 4.2 コンテナ

```css
:root {
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;
}
```

---

## 5. コンポーネントスタイル

### 5.1 ボーダーラジウス

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-2xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;
}
```

### 5.2 シャドウ

```css
:root {
  /* 微妙なシャドウ - ライトテーマ向け */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05);
  
  /* カード用の柔らかいシャドウ */
  --shadow-card: 0 0 0 1px rgb(0 0 0 / 0.03), 0 2px 4px rgb(0 0 0 / 0.03), 0 12px 24px rgb(0 0 0 / 0.03);
  
  /* フローティング要素用 */
  --shadow-float: 0 0 0 1px rgb(0 0 0 / 0.03), 0 4px 8px rgb(0 0 0 / 0.04), 0 24px 48px rgb(0 0 0 / 0.06);
}
```

### 5.3 トランジション

```css
:root {
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
  --transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 6. UIパターン

### 6.1 ボタン

```css
/* Primary Button */
.btn-primary {
  background: var(--gradient-cta);
  color: var(--text-inverse);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-md), 0 0 0 0 var(--primary-500);
  transition: all var(--transition-base);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), 0 0 20px -5px var(--primary-500);
}

/* Secondary Button */
.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  transition: all var(--transition-base);
}

.btn-secondary:hover {
  background: var(--surface-hover);
  border-color: var(--border-strong);
}
```

### 6.2 カード

```css
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  padding: var(--space-6);
  transition: all var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-float);
  transform: translateY(-2px);
}

/* ガラスモーフィズムカード */
.card-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}
```

### 6.3 入力フィールド

```css
.input {
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  transition: all var(--transition-base);
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px var(--primary-100);
}

.input::placeholder {
  color: var(--text-tertiary);
}
```

---

## 7. 装飾要素

### 7.1 背景パターン

```css
/* ドットグリッド背景 */
.bg-dots {
  background-image: radial-gradient(circle, var(--border-subtle) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* グラデーションメッシュ背景 */
.bg-gradient-mesh {
  background: 
    radial-gradient(at 40% 20%, var(--primary-100) 0px, transparent 50%),
    radial-gradient(at 80% 0%, var(--secondary-100) 0px, transparent 50%),
    radial-gradient(at 0% 50%, var(--success-50) 0px, transparent 50%),
    var(--bg-primary);
}
```

### 7.2 アニメーション

```css
/* フェードイン */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* スケールイン */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* シマー（ローディング） */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 25%,
    var(--bg-secondary) 50%,
    var(--bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## 8. レスポンシブ対応

### 8.1 ブレークポイント

```css
/* Mobile First */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */
/* 2xl: 1536px */
```

### 8.2 モバイル最適化

- タッチターゲット: 最小44x44px
- フォントサイズ: モバイルでは16px以上（ズーム防止）
- スペーシング: モバイルではよりコンパクトに

---

## 9. アクセシビリティ

### 9.1 カラーコントラスト

- テキスト: WCAG AA準拠（4.5:1以上）
- 大きなテキスト: 3:1以上
- フォーカス表示: 明確なフォーカスリング

### 9.2 フォーカスステート

```css
:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

---

## 10. 画面別デザイン指針

### 10.1 ランディングページ
- ヒーローセクション: グラデーションメッシュ背景 + 大きなタイポグラフィ
- 機能紹介: アイコン + 簡潔な説明カード
- 料金表: 比較しやすいカードレイアウト

### 10.2 ダッシュボード
- クリーンな白背景
- クレジット残高を目立たせる
- 最近の生成履歴をカードで表示

### 10.3 広告作成画面
- 2カラムレイアウト（入力 + プレビュー）
- ステップ表示で進捗を可視化
- リアルタイムプレビュー

### 10.4 生成結果画面
- 生成画像を中央に大きく表示
- アクションボタン（ダウンロード、編集、再生成）を目立たせる
