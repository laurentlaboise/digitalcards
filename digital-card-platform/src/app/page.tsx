import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import CustomerLoop from '@/components/landing/CustomerLoop';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream text-stone-900">
      <Header />
      <main>
        <HeroSection />
        <CustomerLoop />
        <section className="py-20">
          <div className="max-w-container mx-auto px-6 grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">What this site does today</h2>
              <ul className="mt-4 space-y-2 text-stone-700">
                <li>A public card with your name, phone, and links.</li>
                <li>A QR code and a contact file the other person can save.</li>
                <li>A form on the card that stores a lead for you.</li>
                <li>An inbox where you mark them new, contacted, customer, or passed.</li>
                <li>A request form if you want TapCard to set a card up with you.</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-brand-charcoal p-8 text-white">
              <p className="text-sm text-stone-300">Prices on the plan</p>
              <p className="mt-2 text-3xl font-semibold">Free to publish one card</p>
              <p className="mt-3 text-stone-300">
                Pro is $2.50 a month and Business is $5 a month in the product plan.
                Billing is not switched on here, so nothing is charged.
              </p>
              <Link href="/pricing" className="mt-6 inline-block text-sm font-medium text-brand-orange">
                Read the prices
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
