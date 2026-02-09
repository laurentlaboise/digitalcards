import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Product, ProductType } from '../../../entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly redis: Redis;
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly configService: ConfigService,
  ) {
    this.redis = new Redis({
      host: this.configService.get('redis.host'),
      port: this.configService.get('redis.port'),
      password: this.configService.get('redis.password'),
    });
  }

  async findAll(filters?: {
    type?: ProductType;
  }): Promise<Product[]> {
    const cacheKey = filters?.type
      ? `products:active:${filters.type}`
      : 'products:active';

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return JSON.parse(cached);
    }

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .where('product.is_active = :isActive', { isActive: true })
      .orderBy('product.created_at', 'DESC');

    if (filters?.type) {
      queryBuilder.andWhere('product.product_type = :type', {
        type: filters.type,
      });
    }

    const products = await queryBuilder.getMany();

    await this.redis.set(cacheKey, JSON.stringify(products), 'EX', this.CACHE_TTL);
    this.logger.debug(`Cached ${products.length} products under ${cacheKey}`);

    return products;
  }

  async findOne(productId: string): Promise<Product> {
    const cacheKey = `product:${productId}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return JSON.parse(cached);
    }

    const product = await this.productRepository.findOne({
      where: { id: productId, is_active: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    await this.redis.set(cacheKey, JSON.stringify(product), 'EX', this.CACHE_TTL);
    this.logger.debug(`Cached product ${productId}`);

    return product;
  }

  async checkInventory(
    productId: string,
    quantity: number,
  ): Promise<{ available: boolean; currentStock: number }> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Digital products and subscriptions have unlimited inventory
    if (
      product.product_type === ProductType.TEMPLATE ||
      product.product_type === ProductType.DOMAIN ||
      product.product_type === ProductType.SUBSCRIPTION
    ) {
      return { available: true, currentStock: -1 };
    }

    const currentStock = product.inventory_count ?? 0;

    return {
      available: currentStock >= quantity,
      currentStock,
    };
  }
}
