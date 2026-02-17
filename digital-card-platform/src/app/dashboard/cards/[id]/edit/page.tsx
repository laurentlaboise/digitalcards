'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CardEditor from '@/components/CardEditor';
import { CardData } from '@/types';

export default function EditCardPage() {
  const params = useParams();
  const cardId = params.id as string;
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCard() {
      try {
        const res = await fetch(`/api/cards/${cardId}`);
        if (!res.ok) throw new Error('Card not found');
        const data = await res.json();
        setCard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load card');
      } finally {
        setLoading(false);
      }
    }
    fetchCard();
  }, [cardId]);

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading card...</div>;
  }

  if (error || !card) {
    return (
      <div className="text-center py-20 text-red-400">
        {error || 'Card not found'}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Edit Card</h1>
      <CardEditor cardId={cardId} initialData={card} />
    </div>
  );
}
