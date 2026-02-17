import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  User,
  SubscriptionTier,
  Subscription,
  SubscriptionStatus,
  SubscriptionPlan,
  Organization,
  Order,
  OrderStatus,
  OrderType,
} from '../../../entities';

export interface PlanInfo {
  tier: SubscriptionPlan;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
  features: string[];
  limits: {
    profiles: number;
    analyticsRetentionDays: number;
    storageGb: number;
    seats: number;
  };
}

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('stripe.secretKey'));
  }

  getPlans(): PlanInfo[] {
    return [
      {
        tier: SubscriptionPlan.PRO,
        name: 'Pro',
        description:
          'For professionals who need advanced features and analytics.',
        monthlyPrice: 9.99,
        annualPrice: 99.99,
        stripePriceIdMonthly: this.configService.get(
          'stripe.prices.proMonthly',
        ),
        stripePriceIdAnnual: this.configService.get(
          'stripe.prices.proAnnual',
        ),
        features: [
          'Unlimited profiles',
          'Advanced analytics',
          'Custom domains',
          'Priority support',
          'Lead capture forms',
          'CRM integrations',
        ],
        limits: {
          profiles: 50,
          analyticsRetentionDays: 365,
          storageGb: 10,
          seats: 1,
        },
      },
      {
        tier: SubscriptionPlan.ENTERPRISE,
        name: 'Enterprise',
        description:
          'For teams and organizations needing full platform capabilities.',
        monthlyPrice: 29.99,
        annualPrice: 299.99,
        stripePriceIdMonthly: this.configService.get(
          'stripe.prices.enterpriseMonthly',
        ),
        stripePriceIdAnnual: this.configService.get(
          'stripe.prices.enterpriseAnnual',
        ),
        features: [
          'Everything in Pro',
          'Team management',
          'SSO authentication',
          'White-label branding',
          'Bulk card provisioning',
          'API access',
          'Dedicated support',
          'Custom integrations',
        ],
        limits: {
          profiles: 500,
          analyticsRetentionDays: 730,
          storageGb: 100,
          seats: 10,
        },
      },
    ];
  }

  async upgrade(
    userId: string,
    tier: SubscriptionPlan,
  ): Promise<{ subscriptionId: string; clientSecret: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has an active subscription at this tier
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: {
        user_id: userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existingSubscription && existingSubscription.tier === tier) {
      throw new BadRequestException(
        `You already have an active ${tier} subscription`,
      );
    }

    // Ensure user has a Stripe customer ID
    let stripeCustomerId = user.stripe_customer_id;
    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: { user_id: userId },
      });
      stripeCustomerId = customer.id;
      await this.userRepository.update(userId, {
        stripe_customer_id: stripeCustomerId,
      });
    }

    const plans = this.getPlans();
    const plan = plans.find((p) => p.tier === tier);
    if (!plan) {
      throw new BadRequestException(`Invalid subscription tier: ${tier}`);
    }

    // Cancel existing subscription if upgrading
    if (existingSubscription) {
      await this.stripe.subscriptions.update(
        existingSubscription.stripe_subscription_id,
        { cancel_at_period_end: false },
      );
      await this.stripe.subscriptions.cancel(
        existingSubscription.stripe_subscription_id,
        { prorate: true },
      );
    }

    const stripeSubscription = await this.stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: plan.stripePriceIdMonthly }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: userId,
        tier,
      },
    });

    const invoice = stripeSubscription.latest_invoice as unknown as Stripe.Invoice & { payment_intent: Stripe.PaymentIntent };
    const paymentIntent = invoice.payment_intent;

    this.logger.log(
      `Created Stripe subscription ${stripeSubscription.id} for user ${userId} (tier: ${tier})`,
    );

    return {
      subscriptionId: stripeSubscription.id,
      clientSecret: paymentIntent.client_secret,
    };
  }

  async cancel(userId: string): Promise<{ cancelled: boolean }> {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        user_id: userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    await this.stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      },
    );

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelled_at = new Date();
    await this.subscriptionRepository.save(subscription);

    await this.userRepository.update(userId, {
      subscription_tier: SubscriptionTier.FREE,
    });

    this.logger.log(`Subscription cancelled for user ${userId}`);

    return { cancelled: true };
  }

  async addSeats(
    orgId: string,
    count: number,
  ): Promise<{ totalSeats: number }> {
    const organization = await this.organizationRepository.findOne({
      where: { id: orgId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const subscription = await this.subscriptionRepository.findOne({
      where: {
        organization_id: orgId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (!subscription) {
      throw new NotFoundException(
        'No active subscription found for this organization',
      );
    }

    // Update the subscription in Stripe to add seats
    const stripeSubscription = await this.stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id,
    );

    const subscriptionItem = stripeSubscription.items.data[0];
    const currentQuantity = subscriptionItem.quantity || 1;

    await this.stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        items: [
          {
            id: subscriptionItem.id,
            quantity: currentQuantity + count,
          },
        ],
        proration_behavior: 'create_prorations',
      },
    );

    subscription.seats_included += count;
    await this.subscriptionRepository.save(subscription);

    organization.seat_count += count;
    await this.organizationRepository.save(organization);

    this.logger.log(`Added ${count} seats to organization ${orgId}`);

    return { totalSeats: subscription.seats_included };
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    this.logger.log(`Processing Stripe webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(
          event.data.object as Stripe.Invoice,
        );
        break;

      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice,
        );
        break;

      default:
        this.logger.warn(`Unhandled webhook event type: ${event.type}`);
    }
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const orderId = session.metadata?.order_id;
    const userId = session.metadata?.user_id;

    if (orderId) {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (order) {
        order.status = OrderStatus.PAID;
        order.stripe_payment_intent_id = session.payment_intent as string;
        await this.orderRepository.save(order);
        this.logger.log(
          `Order ${orderId} marked as paid via checkout.session.completed`,
        );
      }
    } else if (userId && session.mode === 'subscription') {
      this.logger.log(
        `Subscription checkout completed for user ${userId}`,
      );
    }
  }

  private async handleSubscriptionCreated(
    stripeSubscription: Stripe.Subscription,
  ): Promise<void> {
    const userId = stripeSubscription.metadata?.user_id;
    const tier =
      (stripeSubscription.metadata?.tier as SubscriptionPlan) ||
      SubscriptionPlan.PRO;

    if (!userId) {
      this.logger.warn(
        `Subscription created without user_id metadata: ${stripeSubscription.id}`,
      );
      return;
    }

    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { stripe_subscription_id: stripeSubscription.id },
    });

    if (existingSubscription) {
      this.logger.warn(
        `Subscription ${stripeSubscription.id} already exists, skipping creation`,
      );
      return;
    }

    const subAny = stripeSubscription as any;
    const subscription = this.subscriptionRepository.create({
      user_id: userId,
      stripe_subscription_id: stripeSubscription.id,
      tier,
      status: SubscriptionStatus.ACTIVE,
      current_period_start: new Date(
        subAny.current_period_start * 1000,
      ),
      current_period_end: new Date(
        subAny.current_period_end * 1000,
      ),
      seats_included: tier === SubscriptionPlan.ENTERPRISE ? 10 : 1,
      usage_quotas: this.getQuotasForTier(tier),
    });

    await this.subscriptionRepository.save(subscription);

    const userTier =
      tier === SubscriptionPlan.ENTERPRISE
        ? SubscriptionTier.ENTERPRISE
        : SubscriptionTier.PRO;

    await this.userRepository.update(userId, {
      subscription_tier: userTier,
    });

    this.logger.log(
      `Created subscription record for user ${userId}, tier: ${tier}`,
    );
  }

  private async handleSubscriptionUpdated(
    stripeSubscription: Stripe.Subscription,
  ): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripe_subscription_id: stripeSubscription.id },
    });

    if (!subscription) {
      this.logger.warn(
        `Subscription ${stripeSubscription.id} not found for update`,
      );
      return;
    }

    const updatedSubAny = stripeSubscription as any;
    subscription.current_period_start = new Date(
      updatedSubAny.current_period_start * 1000,
    );
    subscription.current_period_end = new Date(
      updatedSubAny.current_period_end * 1000,
    );

    if (stripeSubscription.status === 'active') {
      subscription.status = SubscriptionStatus.ACTIVE;
    } else if (stripeSubscription.status === 'past_due') {
      subscription.status = SubscriptionStatus.PAST_DUE;
    } else if (
      stripeSubscription.status === 'canceled' ||
      stripeSubscription.status === 'unpaid'
    ) {
      subscription.status = SubscriptionStatus.CANCELLED;
    }

    await this.subscriptionRepository.save(subscription);

    this.logger.log(`Updated subscription ${stripeSubscription.id}`);
  }

  private async handleSubscriptionDeleted(
    stripeSubscription: Stripe.Subscription,
  ): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripe_subscription_id: stripeSubscription.id },
    });

    if (!subscription) {
      this.logger.warn(
        `Subscription ${stripeSubscription.id} not found for deletion`,
      );
      return;
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelled_at = new Date();
    await this.subscriptionRepository.save(subscription);

    if (subscription.user_id) {
      await this.userRepository.update(subscription.user_id, {
        subscription_tier: SubscriptionTier.FREE,
      });
    }

    if (subscription.organization_id) {
      await this.organizationRepository.update(subscription.organization_id, {
        subscription_tier: SubscriptionTier.FREE,
      });
    }

    this.logger.log(
      `Subscription ${stripeSubscription.id} cancelled and user downgraded to free`,
    );
  }

  private async handleInvoicePaymentFailed(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    const stripeSubscriptionId = (invoice as any).subscription as string;
    if (!stripeSubscriptionId) return;

    const subscription = await this.subscriptionRepository.findOne({
      where: { stripe_subscription_id: stripeSubscriptionId },
    });

    if (!subscription) {
      this.logger.warn(
        `Subscription ${stripeSubscriptionId} not found for payment failed event`,
      );
      return;
    }

    subscription.status = SubscriptionStatus.PAST_DUE;
    await this.subscriptionRepository.save(subscription);

    this.logger.log(
      `Subscription ${stripeSubscriptionId} marked as past_due due to payment failure`,
    );
  }

  private async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    const stripeSubscriptionId = (invoice as any).subscription as string;
    if (!stripeSubscriptionId) return;

    const subscription = await this.subscriptionRepository.findOne({
      where: { stripe_subscription_id: stripeSubscriptionId },
    });

    if (!subscription) {
      this.logger.warn(
        `Subscription ${stripeSubscriptionId} not found for payment succeeded event`,
      );
      return;
    }

    subscription.status = SubscriptionStatus.ACTIVE;
    await this.subscriptionRepository.save(subscription);

    this.logger.log(
      `Subscription ${stripeSubscriptionId} marked as active after successful payment`,
    );
  }

  private getQuotasForTier(
    tier: SubscriptionPlan,
  ): Subscription['usage_quotas'] {
    switch (tier) {
      case SubscriptionPlan.PRO:
        return {
          profiles: 50,
          analytics_retention_days: 365,
          storage_gb: 10,
        };
      case SubscriptionPlan.ENTERPRISE:
        return {
          profiles: 500,
          analytics_retention_days: 730,
          storage_gb: 100,
        };
      default:
        return {
          profiles: 5,
          analytics_retention_days: 30,
          storage_gb: 1,
        };
    }
  }
}
