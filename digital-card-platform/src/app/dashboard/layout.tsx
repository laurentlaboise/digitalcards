'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Plus, LogOut, CreditCard, BarChart3, Settings, User } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Top Nav */}
      <nav className="border-b border-blue-500/10 bg-slate-900/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Digital<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Cards</span>
            </span>
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
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/25"
            >
              <Plus size={16} />
              New Card
            </Link>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-blue-500/20">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
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
