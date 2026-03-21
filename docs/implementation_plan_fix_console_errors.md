# 実装計画書：Remotionコンソールエラーおよび警告の修正

## 1. 概要
Remotionを使用した動画生成ページにおいて、コンソールに出力されている複数の警告およびエラー（ライセンス警告、フォント読み込み警告、スタイル競合警告、画像デコードエラー）を修正します。

## 2. 修正内容

### 2.1 Remotionライセンス警告の解消
- **対象ファイル**: `src/app/video/page.tsx`
- **内容**: `<Player />` コンポーネントに `acknowledgeRemotionLicense={true}` プロップを追加し、ライセンス確認メッセージを非表示にします。

### 2.2 フォント読み込み警告の最適化
- **対象ファイル**: `src/remotion/AdVideo.tsx`
- **内容**: `loadFont()` の呼び出し時に `ignoreTooManyRequestsWarning: true` を指定し、リクエスト過多の警告を抑制します。

### 2.3 スタイルプロパティの競合解消
- **対象ファイル**: `src/remotion/AdVideo.tsx`
- **内容**: `AbsoluteFill` の `style` において、`background` (ショートハンド) と `backgroundColor` (個別指定) が混在している箇所を修正します。グラデーションには `backgroundImage` を使用します。

### 2.4 画像デコードエラーの修正
- **対象ファイル**: `src/app/video/page.tsx`
- **内容**: デフォルトの Unsplash 画像 URL のサイズ（`w=2670`）を適切なサイズ（`w=1280`）に調整します。

## 3. 作業ステップ

1. 作業用ブランチ `fix/video-console-errors` を作成。
2. `src/remotion/AdVideo.tsx` のスタイルとフォント読み込みを修正。
3. `src/app/video/page.tsx` のライセンスプロップ追加とデフォルト画像URLの修正。
4. 修正内容の確認（ブラウザコンソールのチェック）。
5. 変更内容をコミットし、プッシュ。
