'use client';

import BusinessCard from '@/components/BusinessCard';
import ShareButton from '@/components/ShareButton';
import { CardData } from '@/types';

interface CardViewClientProps {
  card: CardData;
}

export default function CardViewClient({ card }: CardViewClientProps) {
  const url = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <BusinessCard card={card} />
      <ShareButton
        url={url}
        title={`${card.fullName}'s TapCard`}
      />
      <p className="mt-8 mb-6 text-center text-xs text-brand-charcoal/70">
        Made with <span className="font-brand">TapCard<span className="text-brand-orange">.</span></span>
      </p>
    </>
  );
}
