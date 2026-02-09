import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TIER_KEY } from '../decorators/subscription-tier.decorator';
import { SubscriptionTier } from '../../entities';

@Injectable()
export class SubscriptionTierGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTiers = this.reflector.getAllAndOverride<SubscriptionTier[]>(
      TIER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredTiers || requiredTiers.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const tierHierarchy: Record<SubscriptionTier, number> = {
      [SubscriptionTier.FREE]: 1,
      [SubscriptionTier.PRO]: 2,
      [SubscriptionTier.ENTERPRISE]: 3,
    };

    const userTierLevel = tierHierarchy[user.subscription_tier] || 0;
    const meetsRequirement = requiredTiers.some(
      (tier) => userTierLevel >= tierHierarchy[tier],
    );

    if (!meetsRequirement) {
      throw new ForbiddenException(
        `This feature requires one of the following subscription tiers: ${requiredTiers.join(', ')}. Your current tier is: ${user.subscription_tier}`,
      );
    }

    return true;
  }
}
