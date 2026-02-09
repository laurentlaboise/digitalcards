import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { OrdersService } from '../services/orders.service';
import { CreateCheckoutDto } from '../dto/create-checkout.dto';

@ApiTags('Orders')
@Controller()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout/sessions')
  @ApiOperation({ summary: 'Create a new checkout session' })
  async createCheckoutSession(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.ordersService.createCheckoutSession(
      userId,
      dto.items,
      dto.shipping_address,
    );
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserOrders(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.getUserOrders(userId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order details' })
  async getOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.getOrder(id);
  }

  @Post('orders/:id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  async cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.cancelOrder(id, userId);
  }
}
