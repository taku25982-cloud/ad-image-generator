// ========================================
// 認証関連の型定義
// ========================================


// 認証ユーザー情報
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// ユーザー情報ドキュメント
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  credits: number;
  subscription: Subscription;
  usage: Usage;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  plan: PlanType;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export interface Usage {
  totalGenerations: number;
  monthlyGenerations: number;
  lastGenerationAt: Date | null;
  usageResetAt: Date;
}

export type PlanType = 'free' | 'starter' | 'pro' | 'business';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'none';
