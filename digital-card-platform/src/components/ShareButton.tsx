'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title: string;
}

export default function ShareButton({ url, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-white/90 px-4 py-3 text-sm font-medium text-gray-800 shadow-lg backdrop-blur transition-all hover:bg-white hover:shadow-xl"
    >
      {copied ? (
        <>
          <Check size={18} className="text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Share2 size={18} />
          Share
        </>
      )}
    </button>
  );
}
