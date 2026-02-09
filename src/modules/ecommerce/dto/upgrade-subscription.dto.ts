import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan } from '../../../entities';

export class UpgradeSubscriptionDto {
  @ApiProperty({
    description: 'Subscription tier to upgrade to',
    enum: SubscriptionPlan,
    example: SubscriptionPlan.PRO,
  })
  @IsEnum(SubscriptionPlan)
  @IsNotEmpty()
  tier: SubscriptionPlan;
}
