'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">
              Digital<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Cards</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400">Sign in to manage your digital business cards</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-blue-500/10"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm flex items-start gap-2">
              <span className="text-red-400">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-slate-900/50 border border-blue-500/20 pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-slate-900/50 border border-blue-500/20 pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 font-medium text-white hover:from-blue-700 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Forgot your password?
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-blue-500/10">
            <p className="text-center text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Demo: demo@digitalcard.io / demo1234
          </p>
        </div>
      </div>
    </div>
  );
}
