const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function cleanText(value: unknown, max: number): string {
  return String(value ?? '').trim().slice(0, max);
}

export function isEmail(value: string): boolean {
  return EMAIL.test(value);
}

export const LEAD_STATUSES = ['new', 'contacted', 'customer', 'passed'] as const;
export const INQUIRY_PLANS = ['free', 'pro', 'business', 'enterprise'] as const;
