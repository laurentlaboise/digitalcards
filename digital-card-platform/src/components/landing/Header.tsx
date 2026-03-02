'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, Menu } from 'lucide-react';
import { NAV_LINKS } from '@/data/landing-data';
import MobileNav from './MobileNav';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 glass border-b transition-shadow duration-200 ${
          scrolled
            ? 'border-stone-200/50 shadow-sm'
            : 'border-transparent'
        }`}
      >
        <div className="max-w-container mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-stone-900">Popl</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:inline-block text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-stone-900 text-white px-5 py-2 text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              Get a demo
            </Link>
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 -mr-2 text-stone-700"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
