import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';
import { syncCheckoutSession } from '@/lib/billing';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

export const metadata = { title: 'Payment received | TapCard' };

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  let plan = '';
  let problem = '';

  if (!userId) {
    problem = 'Sign in with the same account to finish recording the subscription.';
  } else if (!searchParams.session_id) {
    problem = 'Stripe did not return a checkout session.';
  } else {
    try {
      const stripe = getStripe();
      const checkout = await stripe.checkout.sessions.retrieve(searchParams.session_id);
      const owner = checkout.metadata?.userId || checkout.client_reference_id;
      if (owner !== userId) {
        problem = 'This payment belongs to a different account.';
      } else if (checkout.status !== 'complete') {
        problem = 'Stripe has not marked this payment complete.';
      } else {
        const subscription = await syncCheckoutSession(checkout);
        plan = subscription?.metadata?.plan || checkout.metadata?.plan || 'paid';
      }
    } catch {
      problem = 'Could not confirm the payment with Stripe.';
    }
  }

  return (
    <div className="min-h-screen bg-cream text-stone-900">
      <Header />
      <main className="mx-auto max-w-xl px-4 pb-20 pt-28 sm:px-6">
        <h1 className="text-3xl font-bold">{problem ? 'Not confirmed' : 'Subscription on'}</h1>
        <p className="mt-4 text-stone-700">
          {problem
            ? problem
            : `Stripe accepted the ${plan} subscription. It renews each month until you cancel. Card numbers stay at Stripe.`}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-full bg-brand-orange px-5 py-3 text-sm font-medium text-white">
            Go to the dashboard
          </Link>
          <Link href="/pricing" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium">
            Prices
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
