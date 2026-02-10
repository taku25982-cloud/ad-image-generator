// ========================================
// 認証関連の型定義
// ========================================

import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

// Firebase Userの拡張
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Firestore User Document
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  credits: number;
  subscription: Subscription;
  usage: Usage;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Subscription {
  plan: PlanType;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: Timestamp | null;
  currentPeriodEnd: Timestamp | null;
  cancelAtPeriodEnd: boolean;
}

export interface Usage {
  totalGenerations: number;
  monthlyGenerations: number;
  lastGenerationAt: Timestamp | null;
  usageResetAt: Timestamp;
}

export type PlanType = 'free' | 'starter' | 'pro' | 'business';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

// Firebase Userからの変換用
export const fromFirebaseUser = (user: FirebaseUser): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
});
