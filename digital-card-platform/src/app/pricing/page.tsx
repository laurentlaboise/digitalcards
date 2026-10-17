import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import PlanButtons from '@/components/billing/PlanButtons';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    points: ['1 published card', 'QR and contact download', 'Lead form on the card', 'View count'],
  },
  {
    name: 'Pro',
    price: '$2.50/mo',
    points: ['5 cards', 'Same lead inbox', 'Monthly Stripe subscription', 'Cancel in the billing portal'],
  },
  {
    name: 'Business',
    price: '$5/mo',
    points: ['25 cards', 'Same lead inbox', 'Monthly Stripe subscription', 'No separate team admin yet'],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-cream text-stone-900">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pb-20 pt-28">
        <h1 className="text-4xl font-bold tracking-tight">Prices</h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          Free is one card and does not charge. Pro is $2.50 a month for 5 cards. Business is $5 a month for 25 cards.
          Both paid plans open Stripe Checkout. A charge happens only after you confirm on Stripe. Tax is not added here.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <article key={plan.name} className="rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="mt-2 text-3xl font-bold">{plan.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-stone-600">
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <PlanButtons />
      </main>
      <Footer />
    </div>
  );
}
