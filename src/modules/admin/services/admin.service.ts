import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { User, SubscriptionTier, Profile, Order, OrderStatus, Subscription, AnalyticsEvent } from '../../../entities';
import { AdminQueryDto } from '../dto/admin-query.dto';
import { paginate } from '../../../common/interfaces/pagination.interface';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly redis: Redis;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsRepo: Repository<AnalyticsEvent>,
    private readonly configService: ConfigService,
  ) {
    this.redis = new Redis({
      host: this.configService.get('redis.host'),
      port: this.configService.get('redis.port'),
      password: this.configService.get('redis.password'),
    });
  }

  async getUsers(query: AdminQueryDto) {
    const { page = 1, limit = 20, search, tier, start_date, end_date } = query;

    const qb = this.userRepo.createQueryBuilder('user');

    if (search) {
      qb.andWhere('user.email ILIKE :search', { search: `%${search}%` });
    }

    if (tier) {
      qb.andWhere('user.subscription_tier = :tier', { tier });
    }

    if (start_date && end_date) {
      qb.andWhere('user.created_at BETWEEN :start AND :end', {
        start: start_date,
        end: end_date,
      });
    }

    qb.orderBy('user.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await qb.getManyAndCount();

    return paginate(
      users.map(({ password_hash, ...u }) => u),
      total,
      { page, limit },
    );
  }

  async suspendUser(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.is_suspended = true;
    await this.userRepo.save(user);

    // Invalidate sessions
    await this.redis.del(`session:${userId}`);

    this.logger.log(`User ${userId} suspended`);
    return { message: 'User suspended' };
  }

  async unsuspendUser(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.is_suspended = false;
    await this.userRepo.save(user);

    this.logger.log(`User ${userId} unsuspended`);
    return { message: 'User unsuspended' };
  }

  async getPlatformAnalytics() {
    const totalUsers = await this.userRepo.count();
    const totalProfiles = await this.profileRepo.count();
    const totalOrders = await this.orderRepo.count();

    const activeSubscriptions = await this.subscriptionRepo.count({
      where: { status: 'active' as any },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = await this.userRepo
      .createQueryBuilder('user')
      .where('user.created_at >= :date', { date: thirtyDaysAgo })
      .getCount();

    const totalViews = await this.analyticsRepo
      .createQueryBuilder('event')
      .where('event.event_type = :type', { type: 'view' })
      .andWhere('event.timestamp >= :date', { date: thirtyDaysAgo })
      .getCount();

    const tierBreakdown = await this.userRepo
      .createQueryBuilder('user')
      .select('user.subscription_tier', 'tier')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.subscription_tier')
      .getRawMany();

    const revenueOrders = await this.orderRepo
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total_revenue')
      .where('order.status != :status', { status: OrderStatus.CANCELLED })
      .andWhere('order.created_at >= :date', { date: thirtyDaysAgo })
      .getRawOne();

    return {
      total_users: totalUsers,
      total_profiles: totalProfiles,
      total_orders: totalOrders,
      active_subscriptions: activeSubscriptions,
      new_users_last_30_days: newUsersLast30Days,
      profile_views_last_30_days: totalViews,
      tier_breakdown: tierBreakdown,
      revenue_last_30_days: parseFloat(revenueOrders?.total_revenue || '0'),
    };
  }

  async getOrders(query: AdminQueryDto) {
    const { page = 1, limit = 20, status, start_date, end_date } = query;

    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user');

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    if (start_date && end_date) {
      qb.andWhere('order.created_at BETWEEN :start AND :end', {
        start: start_date,
        end: end_date,
      });
    }

    qb.orderBy('order.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [orders, total] = await qb.getManyAndCount();
    return paginate(orders, total, { page, limit });
  }

  async fulfillOrder(orderId: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    order.status = OrderStatus.FULFILLED;
    order.fulfilled_at = new Date();
    await this.orderRepo.save(order);

    this.logger.log(`Order ${orderId} fulfilled`);
    return { message: 'Order fulfilled', order };
  }

  async getFeatureFlags() {
    const flags = await this.redis.hgetall('feature_flags');
    return Object.entries(flags).map(([name, value]) => ({
      name,
      enabled: value === 'true',
    }));
  }

  async setFeatureFlag(flag: string, enabled: boolean) {
    await this.redis.hset('feature_flags', flag, String(enabled));
    this.logger.log(`Feature flag ${flag} set to ${enabled}`);
    return { flag, enabled };
  }
}
