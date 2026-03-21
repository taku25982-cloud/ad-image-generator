# Docs Overview

このディレクトリは、現在の実装に追従する運用ドキュメントだけを残しています。

## 現在の主要ドキュメント

- `current-state.md`
  - 現在の技術スタック、主要 API、DB、広告フォーマット、テンプレート機能の要約
- `.env.example`
  - 現在の実装で参照している環境変数の一覧
- `flow-template-prompts.md`
  - 外部生成環境向けの簡易ガイド
- `flow-template-prompts-expanded.md`
  - 32テンプレート分の展開済みフルプロンプト集
- `feature-proposals.md`
  - 将来検討用の機能アイデア集

## 生成ファイル

- `flow-template-prompts-expanded.md` は `scripts/export-flow-template-prompts.mjs` で再生成します。

```powershell
node --experimental-strip-types scripts/export-flow-template-prompts.mjs
```

## 整理方針

- 実装とズレた初期設計書は削除
- 一時的な作業計画書は削除
- 現在のコードから再現できる情報を優先
