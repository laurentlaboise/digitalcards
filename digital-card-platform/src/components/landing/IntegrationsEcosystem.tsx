'use client';

import {
  Workflow,
  Layers,
  Table2,
  Zap,
  Code,
  Webhook,
  ArrowRight,
} from 'lucide-react';
import { INTEGRATION_ITEMS } from '@/data/landing-data';
import Link from 'next/link';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Workflow,
  Layers,
  Table2,
  Zap,
  Code,
  Webhook,
};

export default function IntegrationsEcosystem() {
  return (
    <section id="solutions" className="py-section-mobile md:py-section">
      <div className="max-w-container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900 mb-4">
            Connect with your entire stack
          </h2>
          <p className="text-stone-500 text-lg max-w-3xl mx-auto">
            Build custom data pipelines, automate with n8n workflows and Make.com scenarios,
            or connect directly via our public REST API.
          </p>
        </div>

        {/* Integration grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {INTEGRATION_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.iconName];
            return (
              <div
                key={item.id}
                className="rounded-xl border border-stone-200 bg-white p-6 hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-5 group-hover:bg-stone-200 transition-colors">
                  {Icon && <Icon className="w-6 h-6 text-stone-700" />}
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-stone-500 mb-4">{item.description}</p>
                <ul className="space-y-2 mb-5">
                  {item.capabilities.map((cap) => (
                    <li
                      key={cap}
                      className="flex items-start gap-2 text-xs text-stone-600"
                    >
                      <span className="mt-1 w-1 h-1 rounded-full bg-stone-400 flex-shrink-0" />
                      {cap}
                    </li>
                  ))}
                </ul>
                <button className="rounded-full border border-stone-300 px-4 py-1.5 text-xs font-medium text-stone-600 hover:border-stone-400 hover:text-stone-800 transition-colors">
                  Connect
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom CTAs */}
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <Link
            href="/integrations"
            className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            View all integrations
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/docs/api"
            className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            Read API docs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
