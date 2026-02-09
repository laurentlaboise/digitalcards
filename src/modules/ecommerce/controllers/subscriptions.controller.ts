import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { SubscriptionsService } from '../services/subscriptions.service';
import { UpgradeSubscriptionDto } from '../dto/upgrade-subscription.dto';
import { AddSeatsDto } from '../dto/add-seats.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get('plans')
  @Public()
  @ApiOperation({ summary: 'Get available subscription plans' })
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade subscription to a new tier' })
  async upgrade(
    @CurrentUser('id') userId: string,
    @Body() dto: UpgradeSubscriptionDto,
  ) {
    return this.subscriptionsService.upgrade(userId, dto.tier);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel current subscription' })
  async cancel(@CurrentUser('id') userId: string) {
    return this.subscriptionsService.cancel(userId);
  }

  @Post('add-seats')
  @ApiOperation({ summary: 'Add seats to organization subscription' })
  async addSeats(@Body() dto: AddSeatsDto) {
    return this.subscriptionsService.addSeats(
      dto.organization_id,
      dto.count,
    );
  }
}
