# フェーズ1 DB設計メモ

> 作成日: 2026-03-31
> 対象フェーズ: ブランドキット、プロジェクト管理、再利用基盤

---

## 1. 目的

フェーズ1では、単発生成中心のデータ構造から、継続運用向けのデータ構造へ拡張する。

主な追加要件は以下。

- ブランド単位で設定を保持する
- 生成物を案件、プロジェクト単位で束ねる
- 過去案からの複製、派生生成をしやすくする

---

## 2. 追加テーブル

## 2.1 `brand_kit`

### 用途

ユーザーごとのブランド設定を保存する。

### カラム案

- `id`
  - text, primary key
- `user_id`
  - text, not null, `user.id` 参照
- `name`
  - text, not null
- `description`
  - text, nullable
- `logo_url`
  - text, nullable
- `primary_color`
  - text, nullable
- `secondary_color`
  - text, nullable
- `accent_color`
  - text, nullable
- `preferred_tone`
  - text, nullable
- `default_copy_rules`
  - text(json), nullable
  - 例: 固定したい文言、使いたい表現、避けたい表現
- `negative_rules`
  - text(json), nullable
  - 例: NGワード、NGトーン
- `font_preferences`
  - text(json), nullable
- `is_default`
  - integer(boolean), default false
- `created_at`
  - timestamp
- `updated_at`
  - timestamp

### メモ

- 初期版ではブランドごとの複雑なバージョン管理は不要
- ロゴは R2 を使う前提
- `default_copy_rules` は JSON にして柔軟性を確保する

---

## 2.2 `project`

### 用途

生成履歴を案件、キャンペーン単位でまとめる。

### カラム案

- `id`
  - text, primary key
- `user_id`
  - text, not null, `user.id` 参照
- `brand_kit_id`
  - text, nullable, `brand_kit.id` 参照
- `name`
  - text, not null
- `description`
  - text, nullable
- `status`
  - text, default `active`
- `tags`
  - text(json), nullable
- `archived_at`
  - timestamp, nullable
- `created_at`
  - timestamp
- `updated_at`
  - timestamp

### メモ

- 初期版では共有や複数ユーザー対応はしない
- `tags` は JSON 配列で十分

---

## 3. 既存テーブルへの変更

## 3.1 `generation`

### 追加カラム案

- `project_id`
  - text, nullable, `project.id` 参照
- `brand_kit_id`
  - text, nullable, `brand_kit.id` 参照
- `source_generation_id`
  - text, nullable, `generation.id` 自己参照
- `generation_group_id`
  - text, nullable
  - 一括生成時の同時生成グループ識別子
- `variant_label`
  - text, nullable
  - 例: `square-a`, `story-b`, `warm-tone`
- `is_favorite`
  - integer(boolean), default false
- `origin_type`
  - text, nullable
  - 例: `template`, `custom`, `duplicate`, `variation`, `edit`

### 変更理由

- `project_id`
  - 案件単位で履歴を束ねるため
- `brand_kit_id`
  - どのブランド設定で作ったか追跡するため
- `source_generation_id`
  - 派生元のトレースをするため
- `generation_group_id`
  - 同時生成された複数案をひとまとまりとして扱うため

---

## 4. リレーション案

- `user 1 - N brand_kit`
- `user 1 - N project`
- `brand_kit 1 - N project`
- `project 1 - N generation`
- `brand_kit 1 - N generation`
- `generation 1 - N generation`
  - 派生生成の自己参照

---

## 5. 初期マイグレーション方針

## 5.1 マイグレーション内容

- `brand_kit` テーブル作成
- `project` テーブル作成
- `generation` に新カラム追加

## 5.2 既存データの扱い

- 既存 `generation` は `project_id = null`, `brand_kit_id = null` で維持
- 既存のお気に入り概念はテンプレート側のみなので、生成物お気に入りは新規導入

---

## 6. API影響範囲

フェーズ1で影響を受ける主なAPI、サーバー処理は以下。

- `/api/generate`
  - ブランドキット情報のプロンプト反映
  - `project_id`, `brand_kit_id` の保存
- `/api/edit`
  - 元画像の `project_id`, `brand_kit_id`, `source_generation_id` 引き継ぎ検討
- 履歴取得処理
  - プロジェクト別、ブランド別フィルタ追加
- 新規追加API
  - ブランドキット CRUD
  - プロジェクト CRUD
  - 複製、派生生成起点取得

---

## 7. UI影響範囲

### 生成画面

- ブランドキット選択
- プロジェクト選択
- プロジェクト新規作成導線

### 履歴画面

- プロジェクト別表示
- ブランド別絞り込み
- 複製、派生生成、お気に入り

### 設定画面または新規ページ

- ブランドキット管理
- プロジェクト管理

---

## 8. 未決定事項

実装前に以下を確定したい。

- ブランドキットの上限数
- 無料プランでブランドキットやプロジェクト数を制限するか
- ロゴを必須にするか
- `generation_group_id` をフェーズ1で先に入れるか、フェーズ2で追加するか
- 生成物のお気に入りを `generation` に直接持つか、別テーブルにするか

---

## 9. 推奨判断

現時点では以下の方針を推奨する。

- ブランドキット数
  - Free: 1
  - Starter以上: 複数
- プロジェクト数
  - Freeでも利用可
- `generation_group_id`
  - 先に追加してよい
  - 将来の一括生成に備えられる
- お気に入り生成物
  - 初期は `generation.is_favorite` で十分
  - 複雑化したら別テーブルへ移行

---

## 10. 実装順

1. DBスキーマ追加
2. マイグレーション作成
3. ブランドキットAPI
4. プロジェクトAPI
5. 生成APIへの紐付け追加
6. 生成画面UI追加
7. 履歴画面UI追加
