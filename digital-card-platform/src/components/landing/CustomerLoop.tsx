import Link from 'next/link';

const STEPS = [
  {
    n: '1',
    title: 'Publish one card',
    text: 'Name, phone, WhatsApp, and a short line about the work. The link and QR are the card. The other person does not install an app.',
  },
  {
    n: '2',
    title: 'They leave their name',
    text: 'On the card page they can save your contact or send their own name, phone, and what they need. That row is a lead.',
  },
  {
    n: '3',
    title: 'You work the inbox',
    text: 'New, contacted, customer, or passed. You reply yourself on WhatsApp or a call. Nothing is emailed or charged from this desk.',
  },
];

export default function CustomerLoop() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-container mx-auto px-6">
        <p className="text-sm font-medium text-brand-orange">How customers arrive</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
          The card is the front door. The inbox is the back office.
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-stone-600">
          A person meets you, opens the link, and either saves you or leaves their details.
          You follow up. That is the whole acquisition loop in this build.
        </p>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="rounded-2xl border border-stone-200 bg-cream p-6">
              <span className="text-sm font-semibold text-brand-orange">Step {step.n}</span>
              <h3 className="mt-2 text-xl font-semibold text-stone-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/card/demo" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-800">
            Open the sample card
          </Link>
          <Link href="/get-customers" className="rounded-full bg-brand-charcoal px-5 py-3 text-sm font-medium text-white">
            See the full path
          </Link>
        </div>
      </div>
    </section>
  );
}
