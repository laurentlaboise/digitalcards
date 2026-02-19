'use client';

import { useEffect, useState } from 'react';
import CardGrid from '@/components/CardGrid';
import { CardData } from '@/types';
import { CreditCard, Eye, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';

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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Loading your cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-400">
          Manage your digital business cards and track engagement
        </p>
      </div>

      {/* Stats Bar */}
      {cards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl border border-blue-500/10 bg-gradient-to-br from-slate-800/50 to-blue-900/20 backdrop-blur-sm p-6 hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-sm text-gray-400">Total Cards</p>
            </div>
            <p className="text-3xl font-bold text-white">{cards.length}</p>
          </div>
          <div className="rounded-xl border border-blue-500/10 bg-gradient-to-br from-slate-800/50 to-blue-900/20 backdrop-blur-sm p-6 hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Eye className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-sm text-gray-400">Total Views</p>
            </div>
            <p className="text-3xl font-bold text-white">{totalViews}</p>
          </div>
          <div className="rounded-xl border border-blue-500/10 bg-gradient-to-br from-slate-800/50 to-blue-900/20 backdrop-blur-sm p-6 hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-sm text-gray-400">Published</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {cards.filter((c) => c.isPublished).length}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-blue-500/20 bg-slate-800/30 p-12 text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Create your first card
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Get started by creating your first digital business card. It only takes a minute!
          </p>
          <Link
            href="/dashboard/cards/new"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-medium text-white hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            Create Your First Card
          </Link>
        </div>
      )}

      {/* Cards Grid */}
      {cards.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Cards</h2>
            <Link
              href="/dashboard/cards/new"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/25"
            >
              <Plus className="w-4 h-4" />
              New Card
            </Link>
          </div>
          <CardGrid cards={cards} onDelete={handleDelete} />
        </>
      )}
    </div>
  );
}
