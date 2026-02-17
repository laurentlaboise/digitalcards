'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CardData } from '@/types';
import { Eye, Pencil, Trash2, ExternalLink, Copy, Check } from 'lucide-react';

interface CardGridProps {
  cards: CardData[];
  onDelete: (id: string) => void;
}

export default function CardGrid({ cards, onDelete }: CardGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyLink = async (slug: string, id: string) => {
    const url = `${window.location.origin}/card/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg mb-4">No cards yet</p>
        <Link
          href="/dashboard/cards/new"
          className="inline-block rounded-lg bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700 transition"
        >
          Create Your First Card
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.id}
          className="rounded-xl border border-gray-700 bg-gray-800/50 overflow-hidden hover:border-gray-600 transition"
        >
          {/* Card Preview Header */}
          <div
            className="h-32 relative"
            style={{
              backgroundImage: card.bannerUrl ? `url(${card.bannerUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: card.bannerUrl ? undefined : card.primaryColor,
            }}
          >
            {card.avatarUrl && (
              <div
                className="absolute bottom-0 left-4 translate-y-1/2 w-16 h-16 rounded-full bg-cover bg-center border-3 border-white shadow-lg"
                style={{ backgroundImage: `url(${card.avatarUrl})` }}
              />
            )}
            {!card.isPublished && (
              <span className="absolute top-2 right-2 bg-yellow-500/90 text-xs font-medium px-2 py-1 rounded">
                Draft
              </span>
            )}
          </div>

          {/* Card Info */}
          <div className="p-4 pt-10">
            <h3 className="text-white font-semibold text-lg">{card.fullName}</h3>
            <p className="text-gray-400 text-sm">
              {card.jobTitle}
              {card.jobTitle && card.company ? ' at ' : ''}
              {card.company}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {card.viewCount} views
              </span>
              <span className="text-gray-600">/{card.slug}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
              <Link
                href={`/dashboard/cards/${card.id}/edit`}
                className="flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-2 text-xs text-gray-300 hover:bg-gray-600 transition"
              >
                <Pencil size={12} />
                Edit
              </Link>
              <Link
                href={`/card/${card.slug}`}
                target="_blank"
                className="flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-2 text-xs text-gray-300 hover:bg-gray-600 transition"
              >
                <ExternalLink size={12} />
                View
              </Link>
              <button
                onClick={() => copyLink(card.slug, card.id)}
                className="flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-2 text-xs text-gray-300 hover:bg-gray-600 transition"
              >
                {copiedId === card.id ? <Check size={12} /> : <Copy size={12} />}
                {copiedId === card.id ? 'Copied' : 'Link'}
              </button>
              <button
                onClick={() => {
                  if (confirm('Delete this card? This cannot be undone.')) {
                    onDelete(card.id);
                  }
                }}
                className="flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-2 text-xs text-red-400 hover:bg-red-600/20 transition ml-auto"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
