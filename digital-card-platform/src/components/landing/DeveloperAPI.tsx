'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  FileCode2,
  Database,
  Webhook,
  Cloud,
  Package,
} from 'lucide-react';
import { API_CODE_EXAMPLES } from '@/data/landing-data';

const CODE_TABS = [
  { id: 'curl', label: 'cURL' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
] as const;

type CodeTabId = (typeof CODE_TABS)[number]['id'];

const DEV_FEATURES = [
  {
    icon: Globe,
    title: 'Public API',
    description: 'Full REST API with OAuth2 authentication',
  },
  {
    icon: FileCode2,
    title: 'API Scaffold',
    description: 'Boilerplate templates for quick integration',
  },
  {
    icon: Database,
    title: 'Data Pipeline',
    description: 'Fetch, transform, and sync contact data',
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    description: 'Real-time event notifications',
  },
  {
    icon: Cloud,
    title: 'API Deployment',
    description: 'Self-hosted or cloud deployment options',
  },
  {
    icon: Package,
    title: 'SDKs',
    description: 'JavaScript and Python client libraries',
  },
];

export default function DeveloperAPI() {
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTabId>('curl');

  return (
    <section id="developers" className="py-section-mobile md:py-section bg-stone-900 text-stone-100">
      <div className="max-w-container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Built for developers
          </h2>
          <p className="text-stone-400 text-lg max-w-2xl mx-auto">
            A public API, boilerplate scaffolds, and deployment options that let you
            integrate digital cards into any application or data pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Feature list */}
          <div className="space-y-6">
            {DEV_FEATURES.map((feat) => (
              <div key={feat.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center flex-shrink-0">
                  <feat.icon className="w-5 h-5 text-stone-300" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-stone-400">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Code block */}
          <div>
            {/* Tab bar */}
            <div className="flex gap-1.5 mb-4">
              {CODE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCodeTab(tab.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    tab.id === activeCodeTab
                      ? 'bg-white text-stone-900'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Code display */}
            <div className="rounded-xl bg-stone-800 border border-stone-700 p-6 overflow-x-auto">
              <pre className="text-sm text-stone-300 leading-relaxed whitespace-pre font-mono">
                {API_CODE_EXAMPLES[activeCodeTab]}
              </pre>
            </div>
          </div>
        </div>

        {/* Bottom CTAs */}
        <div className="flex items-center justify-center gap-4 flex-wrap mt-12">
          <Link
            href="/docs/api"
            className="rounded-full bg-white text-stone-900 px-6 py-3 text-sm font-medium hover:bg-stone-100 transition-colors"
          >
            Explore API docs
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-stone-500 text-stone-300 px-6 py-3 text-sm font-medium hover:border-stone-400 hover:text-white transition-colors"
          >
            Get API key
          </Link>
        </div>
      </div>
    </section>
  );
}
