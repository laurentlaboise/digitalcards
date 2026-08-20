'use client';

import { useState, useRef, useEffect } from 'react';
import {
  UserPlus,
  Share2,
  CreditCard,
  QrCode,
  Wallet,
  Mail,
  Monitor,
  Plug,
  Users,
  BarChart3,
  TrendingUp,
  Plug2,
  Code2,
  Database,
} from 'lucide-react';
import { FEATURE_TABS } from '@/data/landing-data';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  UserPlus,
  Share2,
  CreditCard,
  QrCode,
  Wallet,
  Mail,
  Monitor,
  Plug,
  Users,
  BarChart3,
  TrendingUp,
  Plug2,
  Code2,
  Database,
};

export default function FeatureShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const tabBarRef = useRef<HTMLDivElement>(null);

  const tab = FEATURE_TABS[activeTab];
  const Icon = ICON_MAP[tab.iconName];

  // Scroll active tab into view on mobile
  useEffect(() => {
    if (!tabBarRef.current) return;
    const activeButton = tabBarRef.current.children[activeTab] as HTMLElement;
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);

  return (
    <section id="features" className="py-section-mobile md:py-section">
      <div className="max-w-container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900 mb-4">
            One platform. Every way to share.
          </h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto">
            From NFC cards to API integrations, everything you need to capture leads and grow your network.
          </p>
        </div>

        {/* Tab bar */}
        <div className="relative mb-10">
          {/* Gradient fade on edges (mobile) */}
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-cream to-transparent pointer-events-none z-10 md:hidden" />
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-cream to-transparent pointer-events-none z-10 md:hidden" />

          <div
            ref={tabBarRef}
            className="flex gap-1.5 overflow-x-auto scrollbar-hidden px-1 py-1 md:flex-wrap md:justify-center"
          >
            {FEATURE_TABS.map((t, i) => {
              const TabIcon = ICON_MAP[t.iconName];
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(i)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    i === activeTab
                      ? 'bg-brand-charcoal text-white'
                      : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {TabIcon && <TabIcon className="w-4 h-4" />}
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div key={activeTab} className="animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Text side */}
            <div>
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-5">
                {Icon && <Icon className="w-6 h-6 text-stone-700" />}
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-4">
                {tab.title}
              </h3>
              <p className="text-stone-500 leading-relaxed mb-6">
                {tab.description}
              </p>
              <ul className="space-y-3">
                {tab.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-sm text-stone-600">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-stone-400 flex-shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual placeholder */}
            <div className="rounded-xl bg-stone-100 border border-stone-200 aspect-[4/3] flex items-center justify-center">
              {Icon && <Icon className="w-16 h-16 text-stone-300" />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
