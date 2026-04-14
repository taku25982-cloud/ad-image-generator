import type { PlanType } from '@/types/auth';

export const PLAN_MONTHLY_CREDITS: Record<PlanType, number> = {
  free: 3,
  starter: 40,
  pro: 100,
  business: 240,
};

export const ONE_TIME_CREDIT_PACKS = {
  onetime_20: 20,
  onetime_50: 50,
  onetime_100: 100,
} as const;

export const VEO_DURATION_CREDIT_COST: Record<'4' | '6' | '8', number> = {
  '4': 5,
  '6': 7,
  '8': 10,
};

export function getVeoCreditCost(durationSeconds: '4' | '6' | '8' | 4 | 6 | 8) {
  return VEO_DURATION_CREDIT_COST[String(durationSeconds) as '4' | '6' | '8'];
}

export function canUseVeo(plan: string | null | undefined) {
  return plan === 'starter' || plan === 'pro' || plan === 'business';
}
