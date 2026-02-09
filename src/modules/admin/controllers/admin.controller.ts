import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { AdminService } from '../services/admin.service';
import { AdminQueryDto } from '../dto/admin-query.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users with filters' })
  async getUsers(@Query() query: AdminQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Put('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend a user account' })
  async suspendUser(@Param('id', ParseUUIDPipe) userId: string) {
    return this.adminService.suspendUser(userId);
  }

  @Put('users/:id/unsuspend')
  @ApiOperation({ summary: 'Unsuspend a user account' })
  async unsuspendUser(@Param('id', ParseUUIDPipe) userId: string) {
    return this.adminService.unsuspendUser(userId);
  }

  @Get('analytics/platform')
  @ApiOperation({ summary: 'Platform-wide metrics and analytics' })
  async getPlatformAnalytics() {
    return this.adminService.getPlatformAnalytics();
  }

  @Get('orders')
  @ApiOperation({ summary: 'List all orders with fulfillment status' })
  async getOrders(@Query() query: AdminQueryDto) {
    return this.adminService.getOrders(query);
  }

  @Post('orders/:id/fulfill')
  @ApiOperation({ summary: 'Mark an order as fulfilled' })
  async fulfillOrder(@Param('id', ParseUUIDPipe) orderId: string) {
    return this.adminService.fulfillOrder(orderId);
  }

  @Get('feature-flags')
  @ApiOperation({ summary: 'Get all feature flags' })
  async getFeatureFlags() {
    return this.adminService.getFeatureFlags();
  }

  @Put('feature-flags/:flag')
  @ApiOperation({ summary: 'Update a feature flag' })
  async setFeatureFlag(
    @Param('flag') flag: string,
    @Body('enabled') enabled: boolean,
  ) {
    return this.adminService.setFeatureFlag(flag, enabled);
  }
}
