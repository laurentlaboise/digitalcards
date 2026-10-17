'use client';

import { useState } from 'react';

async function openStripe(path: string, body?: object) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  if (res.status === 401) {
    window.location.href = '/login?callbackUrl=/pricing';
    return;
  }
  const data = await res.json();
  if (!res.ok || !data.url) {
    throw new Error(data.error || 'Stripe did not open.');
  }
  window.location.href = data.url;
}

export default function PlanButtons() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  async function go(plan: 'pro' | 'business') {
    setError('');
    setBusy(plan);
    try {
      await openStripe('/api/billing/checkout', { plan });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stripe did not open.');
      setBusy('');
    }
  }

  async function manage() {
    setError('');
    setBusy('portal');
    try {
      await openStripe('/api/billing/portal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No subscription to manage.');
      setBusy('');
    }
  }

  return (
    <div className="mt-8 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => go('pro')}
          disabled={Boolean(busy)}
          className="min-h-11 rounded-full bg-brand-orange px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy === 'pro' ? 'Opening Stripe…' : 'Subscribe to Pro'}
        </button>
        <button
          type="button"
          onClick={() => go('business')}
          disabled={Boolean(busy)}
          className="min-h-11 rounded-full bg-[#1B2A6B] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy === 'business' ? 'Opening Stripe…' : 'Subscribe to Business'}
        </button>
        <button
          type="button"
          onClick={manage}
          disabled={Boolean(busy)}
          className="min-h-11 rounded-full border border-stone-300 px-5 py-3 text-sm font-medium disabled:opacity-60"
        >
          {busy === 'portal' ? 'Opening…' : 'Manage billing'}
        </button>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <p className="text-sm text-stone-500">
        Stripe Checkout opens on the live account. You are charged only after you confirm there. Cancel from Manage billing.
      </p>
    </div>
  );
}
