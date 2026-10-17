'use client';

import { useEffect, useState } from 'react';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import PublicCard from '@/components/PublicCard';
import ShareButton from '@/components/ShareButton';
import { CardData } from '@/types';

export default function CardViewClient({ card }: { card: CardData }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  return (
    <div
      className="min-h-dvh overflow-x-hidden bg-[#0C1330] pb-[max(2rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-8 sm:pt-12"
      style={{
        backgroundImage:
          'radial-gradient(70rem 32rem at 50% -8%, rgba(201,168,76,.22), transparent 62%)',
      }}
    >
      <div className="mx-auto flex w-full max-w-[400px] flex-col">
        <PublicCard card={card} />
        <ShareButton url={url} title={`${card.fullName}'s TapCard`} inline />
        <LeadCaptureForm slug={card.slug} ownerName={card.fullName} />
        <p className="mb-2 mt-6 text-center text-xs text-white/60">
          Made with TapCard
        </p>
      </div>
    </div>
  );
}
