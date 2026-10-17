import type Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';
import { isPaidStatus, planFromPrice, type PaidPlan } from '@/lib/plans';

export async function applySubscription(input: {
  userId: string;
  customerId?: string | null;
  subscriptionId?: string | null;
  plan?: string | null;
  status?: string | null;
}) {
  const paid = isPaidStatus(input.status);
  await prisma.user.update({
    where: { id: input.userId },
    data: {
      stripeCustomerId: input.customerId || undefined,
      stripeSubscriptionId: input.subscriptionId || null,
      subscriptionStatus: input.status || null,
      plan: paid ? input.plan || 'pro' : 'free',
    },
  });
}

export async function syncSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;
  const priceId = subscription.items.data[0]?.price?.id;
  const plan = planFromPrice(priceId) || (subscription.metadata?.plan as PaidPlan | undefined) || 'pro';
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  await applySubscription({
    userId,
    customerId,
    subscriptionId: subscription.id,
    plan,
    status: subscription.status,
  });
}

export async function syncCheckoutSession(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId || session.client_reference_id;
  if (!userId || session.mode !== 'subscription') return null;
  const stripe = getStripe();
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  if (!subscriptionId) return null;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (!subscription.metadata?.userId) {
    await stripe.subscriptions.update(subscriptionId, {
      metadata: { userId, plan: session.metadata?.plan || subscription.metadata?.plan || '' },
    });
    subscription.metadata = { ...subscription.metadata, userId, plan: session.metadata?.plan || '' };
  }
  await syncSubscription(subscription);
  return subscription;
}
