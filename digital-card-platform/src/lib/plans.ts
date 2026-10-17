export type PaidPlan = 'pro' | 'business';

export const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  pro: 5,
  business: 25,
};

export function isPaidStatus(status: string | null | undefined) {
  return status === 'active' || status === 'trialing';
}

export function cardLimit(plan: string | null | undefined, status: string | null | undefined) {
  if (!isPaidStatus(status)) return PLAN_LIMITS.free;
  return PLAN_LIMITS[plan || 'free'] || PLAN_LIMITS.free;
}

export function planFromPrice(priceId: string | null | undefined): PaidPlan | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro';
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) return 'business';
  return null;
}

export function priceIdFor(plan: PaidPlan) {
  return plan === 'pro' ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_BUSINESS;
}
