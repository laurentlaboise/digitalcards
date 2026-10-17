import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';

const STEPS = [
  {
    title: 'You publish a card',
    text: 'Sign in, add your name and the number people should use, and turn the card on. The public address is /card/your-name.',
  },
  {
    title: 'You hand them the link or the QR',
    text: 'Print the QR, put the link in a chat, or open the page on your phone. The other person uses the browser they already have.',
  },
  {
    title: 'They save you, or they introduce themselves',
    text: 'Save contact downloads a contact file. Leave your details posts their name into your inbox. Both can happen.',
  },
  {
    title: 'You move the row',
    text: 'In Customers you set the status. New means you have not replied. Contacted means you wrote. Customer means they bought or booked. Passed means you will not follow up.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-cream text-stone-900">
      <Header />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-28">
        <p className="text-sm font-medium text-brand-orange">The path</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">How a meeting becomes a name you can reply to</h1>
        <ol className="mt-10 space-y-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-stone-200 bg-white p-6">
              <p className="text-sm font-semibold text-brand-orange">0{index + 1}</p>
              <h2 className="mt-1 text-xl font-semibold">{step.title}</h2>
              <p className="mt-2 text-stone-600">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register" className="rounded-full bg-brand-orange px-5 py-3 text-sm font-medium text-white">
            Make a card
          </Link>
          <Link href="/card/demo" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium">
            Try it on the sample card
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
