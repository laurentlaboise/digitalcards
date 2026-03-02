'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { NAV_LINKS } from '@/data/landing-data';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-cream/95 backdrop-blur-xl transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col px-6 pt-6">
        {/* Close button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-stone-700"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-2 mt-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose}
              className="py-4 text-lg font-medium text-stone-900 border-b border-stone-200 hover:text-stone-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="mt-auto pb-12 flex flex-col gap-3">
          <Link
            href="/login"
            onClick={onClose}
            className="rounded-full border border-stone-300 text-stone-700 text-center px-8 py-4 text-base font-medium"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            onClick={onClose}
            className="rounded-full bg-stone-900 text-white text-center px-8 py-4 text-base font-medium"
          >
            Get a demo
          </Link>
        </div>
      </div>
    </div>
  );
}
