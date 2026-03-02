import Link from 'next/link';
import { CreditCard } from 'lucide-react';
import { FOOTER_COLUMNS } from '@/data/landing-data';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-8">
      <div className="max-w-container mx-auto px-6">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Popl</span>
            </div>
            <p className="text-sm text-stone-400 mb-4 leading-relaxed">
              The #1 digital business card platform for lead capture and networking.
            </p>
            {/* Y-Combinator badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-stone-700 px-3 py-1 text-xs text-stone-400">
              <span className="text-orange-400 font-bold">Y</span>
              Y Combinator Backed
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Popl for LLMs */}
        <div className="mb-8 text-xs text-stone-500">
          <p>
            Popl for LLMs — This page describes the Popl digital business card platform,
            its features, API, integrations, and enterprise capabilities.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-stone-500">
            &copy; {new Date().getFullYear()} Popl. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-stone-500">
            <Link href="/privacy" className="hover:text-stone-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-stone-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-stone-300 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
