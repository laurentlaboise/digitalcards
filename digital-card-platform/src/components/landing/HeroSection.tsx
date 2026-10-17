import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="max-w-container mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 border border-stone-200 px-4 py-2 text-sm text-stone-600 mb-8">
          <span className="inline-block w-2 h-2 rounded-full bg-brand-orange" />
          TapCard · Laos and Southeast Asia
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-stone-900 leading-[1.08] mb-6 max-w-4xl mx-auto">
          A card link that brings the next customer back to you
        </h1>

        <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Share one page. They save your number or leave theirs. You see the name
          in an inbox and reply on WhatsApp. QR first. No app for the person you just met.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/register"
            className="rounded-full bg-brand-orange text-white px-8 py-4 text-base font-medium hover:bg-[#e64a19] transition-colors"
          >
            Make a free card
          </Link>
          <Link
            href="/card/demo"
            className="rounded-full border border-stone-300 text-stone-700 px-8 py-4 text-base font-medium hover:border-stone-400 hover:bg-stone-50 transition-colors"
          >
            Open a live card
          </Link>
        </div>
      </div>
    </section>
  );
}
