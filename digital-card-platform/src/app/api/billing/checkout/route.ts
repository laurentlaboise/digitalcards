import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getStripe, appOrigin } from '@/lib/stripe';
import { priceIdFor, type PaidPlan } from '@/lib/plans';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Sign in before you pay.' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const plan = body.plan as PaidPlan;
  if (plan !== 'pro' && plan !== 'business') {
    return NextResponse.json({ error: 'Choose Pro or Business.' }, { status: 400 });
  }

  const price = priceIdFor(plan);
  if (!price || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe prices are not configured.' }, { status: 500 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });

  const stripe = getStripe();
  const origin = appOrigin(req);
  const suffix = Math.random().toString(36).slice(2, 10).padEnd(8, 'a');
  const payload = {
    mode: 'subscription' as const,
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing`,
    client_reference_id: user.id,
    customer: user.stripeCustomerId || undefined,
    customer_email: user.stripeCustomerId ? undefined : user.email,
    metadata: { userId: user.id, plan },
    subscription_data: {
      metadata: { userId: user.id, plan },
      billing_mode: { type: 'flexible' as const },
    },
    integration_identifier: `tapcard_checkout_${suffix}`,
  };

  try {
    const checkout = await stripe.checkout.sessions.create(payload);
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error('Checkout error', error);
    return NextResponse.json({ error: 'Stripe could not open checkout.' }, { status: 502 });
  }
}
