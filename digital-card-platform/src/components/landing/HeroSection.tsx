import Link from 'next/link';
import { Award } from 'lucide-react';

const G2_BADGES = [
  'Leader Winter 2025',
  'Best Results',
  'Easiest to Use',
  'Best Support',
  'Momentum Leader',
];

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="max-w-container mx-auto px-6 text-center">
        {/* Social proof pill */}
        <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 border border-stone-200 px-4 py-2 text-sm text-stone-600 mb-8">
          <span className="inline-block w-2 h-2 rounded-full bg-brand-orange" />
          One tap. Every connection.
        </div>

        {/* H1 */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-stone-900 leading-[1.08] mb-6 max-w-4xl mx-auto">
          Digital business cards built for lead capture
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          The #1 platform for digital business cards, NFC sharing, and lead capture.
          Share your contact info in one tap and turn every interaction into a qualified lead.
        </p>

        {/* CTA row */}
        <div className="flex items-center justify-center gap-4 flex-wrap mb-16">
          <Link
            href="/register"
            className="rounded-full bg-brand-orange text-white px-8 py-4 text-base font-medium hover:bg-[#e64a19] transition-colors shadow-lg shadow-brand-orange/20"
          >
            Get started free
          </Link>
          <Link
            href="/card/demo"
            className="rounded-full border border-stone-300 text-stone-700 px-8 py-4 text-base font-medium hover:border-stone-400 hover:bg-stone-50 transition-colors"
          >
            Watch demo
          </Link>
        </div>

        {/* G2 badges */}
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {G2_BADGES.map((badge) => (
            <div
              key={badge}
              className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <Award className="w-5 h-5" />
              <span className="text-xs font-medium">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
