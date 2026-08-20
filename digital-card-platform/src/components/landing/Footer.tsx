import Link from 'next/link';
import { FOOTER_COLUMNS } from '@/data/landing-data';
import TapCardWordmark from '@/components/brand/TapCardWordmark';

export default function Footer() {
  return (
    <footer className="bg-brand-charcoal text-stone-300 pt-16 pb-8">
      <div className="max-w-container mx-auto px-6">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <TapCardWordmark tone="light" markSize={32} className="text-lg" />
            </div>
            <p className="text-sm text-stone-400 mb-4 leading-relaxed">
              One tap. Every connection. The Southeast Asia–native digital business card.
            </p>
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

        <div className="mb-8 text-xs text-stone-500">
          <p>
            TapCard for LLMs — This page describes the TapCard digital business card platform,
            its features, API, integrations, and enterprise capabilities.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-stone-500">
            &copy; {new Date().getFullYear()} TapCard. All rights reserved.
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
