# Stripe 手動確認チェックリスト

本ドキュメントは、`ad-image-generator` の Stripe テストモード確認用です。  
実操作は Stripe テストモードで行い、アプリ画面、Stripe ダッシュボード、DB の 3 点で結果を照合します。

## 事前準備

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_BUSINESS`
- `STRIPE_PRICE_ONETIME_20`
- `STRIPE_PRICE_ONETIME_50`
- `STRIPE_PRICE_ONETIME_100`
- `NEXT_PUBLIC_APP_URL`

確認対象画面:

- `/pricing`
- `/dashboard`
- `/settings`

確認対象テーブル:

- `user`
- `stripe_webhook_event`

## 共通確認項目

各ケースで最低限ここを見ます。

- Stripe ダッシュボードにイベントが来ている
- `stripe_webhook_event` に対象イベント ID が記録されている
- `user.plan`
- `user.credits`
- `user.subscriptionStatus`
- `user.stripeCustomerId`
- `user.stripeSubscriptionId`
- `user.currentPeriodEnd`
- `user.cancelAtPeriodEnd`

## ケース 1: 新規サブスクリプション購入

例: `Free -> Starter`

期待結果:

- Checkout 完了後に `/dashboard?payment=success...` へ戻る
- `user.plan = starter`
- `user.subscriptionStatus = active`
- `user.stripeSubscriptionId` が入る
- `user.credits` が Starter 分だけ増える
- `/settings` のプラン表示が `starter` になる

見るべき Stripe イベント:

- `checkout.session.completed`
- `customer.subscription.updated`
- `invoice.paid`

## ケース 2: 都度クレジット購入

例: `onetime_20`

期待結果:

- `user.plan` は変わらない
- `user.subscriptionStatus` は変わらない
- `user.credits` だけ加算される
- `stripe_webhook_event` に `checkout.session.completed` が記録される

見るべき Stripe イベント:

- `checkout.session.completed`

## ケース 3: Stripe ポータルからプラン変更

例: `Starter -> Pro`

期待結果:

- `user.plan = pro`
- `/settings` の表示も `pro` へ更新される
- `cancelAtPeriodEnd` が不意に変わらない
- 権限差分がある場合、その後の画面制御も新プラン基準になる

見るべき Stripe イベント:

- `customer.subscription.updated`
- 必要に応じて `invoice.paid`

## ケース 4: 解約予約

期待結果:

- `user.cancelAtPeriodEnd = true`
- `user.currentPeriodEnd` が表示される
- `/settings` に「期間終了後 Free に移行」の表示が出る

見るべき Stripe イベント:

- `customer.subscription.updated`

## ケース 5: 解約完了

期待結果:

- `user.plan = free`
- `user.subscriptionStatus = canceled`
- `user.stripeSubscriptionId = null`
- `user.cancelAtPeriodEnd = false`

見るべき Stripe イベント:

- `customer.subscription.deleted`

## ケース 6: 支払い失敗

期待結果:

- `user.subscriptionStatus = past_due` もしくは Stripe 側状態に準じた値
- 既存クレジットが不正に増えない

見るべき Stripe イベント:

- `invoice.payment_failed`

## DB 確認の例

ユーザー確認:

```sql
select
  id,
  email,
  plan,
  credits,
  subscription_status,
  stripe_customer_id,
  stripe_subscription_id,
  current_period_end,
  cancel_at_period_end,
  updated_at
from user
where email = '<対象メールアドレス>';
```

webhook 履歴確認:

```sql
select
  id,
  type,
  processed_at,
  created_at
from stripe_webhook_event
order by created_at desc
limit 20;
```

## 異常時の切り分け

### Checkout は成功したがアプリ側が更新されない

- Stripe ダッシュボードで webhook 配信結果を確認
- `stripe_webhook_event` に event ID が入っているか確認
- `STRIPE_WEBHOOK_SECRET` が一致しているか確認

### プラン変更したのに `/settings` が古い

- `customer.subscription.updated` が到達しているか確認
- `user.plan` が更新されているか DB で確認
- 画面側は再読込して `auth` セッションが更新されるか確認

### クレジットだけ変わらない

- `checkout.session.completed` または `invoice.paid` が処理されているか確認
- `planId` と Price ID の対応が `.env.local` と Stripe ダッシュボードで一致しているか確認

## 注意

- `/dashboard?payment=success` は webhook 成功を保証しません
- アプリの真実は DB 更新結果です
- 問題が起きた場合は、Stripe イベント ID と `user.email` をセットで残すと追跡しやすいです
