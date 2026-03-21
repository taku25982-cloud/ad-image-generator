# 実装計画: Zodエラープロパティの修正

## 1. 現状の課題
`src/app/api/video/suggest/route.ts` (L68) において、Zod の `SafeParseError` から返される `ZodError` オブジェクトのプロパティとして `errors` を参照していますが、TypeScript の型定義には `errors` は存在せず、`issues` が正しいプロパティ名です。これにより、開発環境やビルド時にエラーが発生しています。

## 2. 修正内容
該当箇所の `result.error.errors` を `result.error.issues` に修正します。

```diff
- return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
+ return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
```

## 3. 手順
1. `src/app/api/video/suggest/route.ts` を修正。
2. 型チェック（Lint）を実行し、エラーが解消されたことを確認。
3. `docs/tasks.md` 内にバグ修正タスクを記録（必要に応じて）。

## 4. リスク
特になし。標準的な API の修正であり、影響範囲は `/api/video/suggest` のバリデーションエラー時のみ。
