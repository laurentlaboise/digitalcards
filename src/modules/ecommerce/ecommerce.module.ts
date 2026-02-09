import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import {
  Product,
  Order,
  Subscription,
  User,
  Organization,
} from '../../entities';
import { ProductsService } from './services/products.service';
import { OrdersService } from './services/orders.service';
import { SubscriptionsService } from './services/subscriptions.service';
import { ProductsController } from './controllers/products.controller';
import { OrdersController } from './controllers/orders.controller';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { WebhooksController } from './controllers/webhooks.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Order,
      Subscription,
      User,
      Organization,
    ]),
    ConfigModule,
  ],
  controllers: [
    ProductsController,
    OrdersController,
    SubscriptionsController,
    WebhooksController,
  ],
  providers: [ProductsService, OrdersService, SubscriptionsService],
  exports: [ProductsService, OrdersService, SubscriptionsService],
})
export class EcommerceModule {}
