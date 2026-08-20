'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Plus, LogOut, User } from 'lucide-react';
import TapCardWordmark from '@/components/brand/TapCardWordmark';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-brand-charcoal">
      {/* Top Nav */}
      <nav className="border-b border-white/10 bg-brand-charcoal/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center">
            <TapCardWordmark tone="light" markSize={32} className="text-xl" />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <Link
              href="/dashboard/cards/new"
              className="flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white hover:bg-[#e64a19] transition-all shadow-lg shadow-brand-orange/25"
            >
              <Plus size={16} />
              New Card
            </Link>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/15">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-gray-300">{session.user?.name || session.user?.email}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-400 hover:text-white transition"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
