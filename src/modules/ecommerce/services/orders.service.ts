import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  Order,
  OrderStatus,
  OrderType,
  Product,
  ProductType,
} from '../../../entities';
import { ProductsService } from './products.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productsService: ProductsService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('stripe.secretKey'), {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(
    userId: string,
    items: Array<{
      product_id: string;
      quantity: number;
      customization?: Record<string, any>;
    }>,
    shippingAddress?: {
      name: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    },
  ): Promise<{ sessionId: string; url: string }> {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const orderItems: Order['items'] = [];
    let subtotal = 0;
    let hasPhysicalProduct = false;

    for (const item of items) {
      const product = await this.productsService.findOne(item.product_id);

      const inventory = await this.productsService.checkInventory(
        item.product_id,
        item.quantity,
      );
      if (!inventory.available) {
        throw new BadRequestException(
          `Insufficient inventory for product "${product.name}". Available: ${inventory.currentStock}`,
        );
      }

      if (
        product.product_type === ProductType.NFC_CARD ||
        product.product_type === ProductType.NFC_TAG
      ) {
        hasPhysicalProduct = true;
      }

      const itemTotal = Number(product.base_price) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: product.id,
        name: product.name,
        quantity: item.quantity,
        price: Number(product.base_price),
        customization: item.customization,
      });

      if (product.stripe_price_id) {
        lineItems.push({
          price: product.stripe_price_id,
          quantity: item.quantity,
        });
      } else {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description || undefined,
            },
            unit_amount: Math.round(Number(product.base_price) * 100),
          },
          quantity: item.quantity,
        });
      }
    }

    if (hasPhysicalProduct && !shippingAddress) {
      throw new BadRequestException(
        'Shipping address is required for physical products',
      );
    }

    const orderType = hasPhysicalProduct
      ? OrderType.HARDWARE
      : OrderType.DIGITAL;

    const total = subtotal;

    const order = this.orderRepository.create({
      user_id: userId,
      order_type: orderType,
      items: orderItems,
      subtotal,
      tax: 0,
      shipping: 0,
      total,
      currency: 'usd',
      status: OrderStatus.PENDING,
      shipping_address: shippingAddress || null,
    });

    const savedOrder = await this.orderRepository.save(order);

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${this.configService.get('app.frontendUrl')}/orders/${savedOrder.id}?success=true`,
      cancel_url: `${this.configService.get('app.frontendUrl')}/checkout?cancelled=true`,
      metadata: {
        order_id: savedOrder.id,
        user_id: userId,
      },
    };

    if (hasPhysicalProduct && shippingAddress) {
      sessionParams.shipping_address_collection = {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR'],
      };
    }

    const session = await this.stripe.checkout.sessions.create(sessionParams);

    savedOrder.stripe_checkout_session_id = session.id;
    await this.orderRepository.save(savedOrder);

    this.logger.log(
      `Created checkout session ${session.id} for order ${savedOrder.id}`,
    );

    return { sessionId: session.id, url: session.url };
  }

  async completeCheckout(sessionId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { stripe_checkout_session_id: sessionId },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with checkout session ${sessionId} not found`,
      );
    }

    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    order.status = OrderStatus.PAID;
    order.stripe_payment_intent_id = session.payment_intent as string;

    const savedOrder = await this.orderRepository.save(order);

    // Decrement inventory for physical products
    for (const item of order.items) {
      await this.productRepository
        .createQueryBuilder()
        .update(Product)
        .set({
          inventory_count: () => `inventory_count - ${item.quantity}`,
        })
        .where('id = :id AND inventory_count IS NOT NULL', {
          id: item.product_id,
        })
        .execute();
    }

    this.logger.log(`Order ${order.id} marked as paid`);

    return savedOrder;
  }

  async getUserOrders(
    userId: string,
    pagination: { page: number; limit: number },
  ): Promise<{ orders: Order[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [orders, total] = await this.orderRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return { orders, total, page, limit };
  }

  async getOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.user_id !== userId) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.PAID
    ) {
      throw new BadRequestException(
        `Cannot cancel order with status "${order.status}". Only pending or paid orders can be cancelled.`,
      );
    }

    if (order.fulfilled_at) {
      throw new BadRequestException(
        'Cannot cancel an order that has already been fulfilled',
      );
    }

    // If already paid, issue a refund through Stripe
    if (
      order.status === OrderStatus.PAID &&
      order.stripe_payment_intent_id
    ) {
      await this.stripe.refunds.create({
        payment_intent: order.stripe_payment_intent_id,
      });
      this.logger.log(`Refund initiated for order ${orderId}`);
    }

    order.status = OrderStatus.CANCELLED;
    const savedOrder = await this.orderRepository.save(order);

    this.logger.log(`Order ${orderId} cancelled by user ${userId}`);

    return savedOrder;
  }

  async fulfillOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException(
        `Cannot fulfill order with status "${order.status}". Order must be paid first.`,
      );
    }

    order.status = OrderStatus.FULFILLED;
    order.fulfilled_at = new Date();

    const savedOrder = await this.orderRepository.save(order);

    this.logger.log(`Order ${orderId} fulfilled`);

    return savedOrder;
  }
}
