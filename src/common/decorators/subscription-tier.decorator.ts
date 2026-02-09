import { SetMetadata } from '@nestjs/common';
import { SubscriptionTier } from '../../entities';

export const TIER_KEY = 'subscription_tier';
export const RequireTier = (...tiers: SubscriptionTier[]) =>
  SetMetadata(TIER_KEY, tiers);
