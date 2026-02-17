'use client';

import { useEffect, useState } from 'react';
import CardGrid from '@/components/CardGrid';
import { CardData } from '@/types';
import { BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch('/api/cards');
      if (res.ok) {
        const data = await res.json();
        setCards(data);
      }
    } catch (err) {
      console.error('Failed to fetch cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/cards/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCards((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete card:', err);
    }
  };

  const totalViews = cards.reduce((sum, c) => sum + c.viewCount, 0);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">Loading your cards...</div>
    );
  }

  return (
    <div>
      {/* Stats Bar */}
      {cards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
            <p className="text-sm text-gray-400">Total Cards</p>
            <p className="text-2xl font-bold text-white">{cards.length}</p>
          </div>
          <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
            <p className="text-sm text-gray-400">Total Views</p>
            <p className="text-2xl font-bold text-white">{totalViews}</p>
          </div>
          <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <BarChart3 size={14} />
              Published
            </p>
            <p className="text-2xl font-bold text-white">
              {cards.filter((c) => c.isPublished).length}
            </p>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-white mb-6">Your Cards</h1>
      <CardGrid cards={cards} onDelete={handleDelete} />
    </div>
  );
}
