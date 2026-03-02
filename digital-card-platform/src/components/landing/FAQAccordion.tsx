'use client';

import { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_CATEGORIES, FAQ_ITEMS } from '@/data/landing-data';

export default function FAQAccordion() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = useCallback((id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const filteredItems =
    activeCategory === 'All'
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <section id="resources" className="py-section-mobile md:py-section">
      <div className="max-w-container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto">
            Everything you need to know about digital business cards, our API, and integrations.
          </p>
        </div>

        {/* Category filter */}
        <div className="relative mb-10">
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-cream to-transparent pointer-events-none z-10 md:hidden" />
          <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-2 md:flex-wrap md:justify-center">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  cat === activeCategory
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto">
          {filteredItems.map((item) => {
            const isOpen = openItems.has(item.id);
            return (
              <div key={item.id} className="border-b border-stone-200">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="flex items-center justify-between w-full py-5 text-left"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${item.id}`}
                >
                  <span className="font-medium text-stone-900 pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-stone-400 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  id={`faq-panel-${item.id}`}
                  role="region"
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-stone-500 text-sm leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
