'use client';

import { FormEvent, useState } from 'react';

export default function InquiryForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          company: form.get('company'),
          country: form.get('country'),
          plan: form.get('plan'),
          message: form.get('message'),
          website_url: form.get('website_url'),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not save that.');
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError('Could not reach the server.');
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-stone-900">You are on the list.</h2>
        <p className="mt-2 text-stone-600">
          This stays in the TapCard inquiry desk. Nobody is charged. If you want the card now,
          create a free account and publish it.
        </p>
        <a href="/register" className="mt-4 inline-block text-sm font-medium text-brand-orange">
          Create a free card
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-stone-200 bg-white p-6 space-y-3">
      <h2 className="text-xl font-semibold text-stone-900">Ask for a card</h2>
      <p className="text-sm text-stone-600">
        This writes a row in the inquiry desk. It does not take payment.
      </p>
      <input className="hidden" tabIndex={-1} autoComplete="off" name="website_url" aria-hidden="true" />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-stone-700">Name</span>
          <input name="name" required className="w-full rounded-lg border border-stone-300 px-3 py-3" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-stone-700">Email</span>
          <input name="email" type="email" required className="w-full rounded-lg border border-stone-300 px-3 py-3" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-stone-700">Phone</span>
          <input name="phone" className="w-full rounded-lg border border-stone-300 px-3 py-3" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-stone-700">Company</span>
          <input name="company" className="w-full rounded-lg border border-stone-300 px-3 py-3" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-stone-700">Country</span>
          <input name="country" placeholder="Laos" className="w-full rounded-lg border border-stone-300 px-3 py-3" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-stone-700">Plan</span>
          <select name="plan" defaultValue="free" className="w-full rounded-lg border border-stone-300 px-3 py-3">
            <option value="free">Free</option>
            <option value="pro">Pro · $2.50/mo on Stripe</option>
            <option value="business">Business · $5/mo on Stripe</option>
            <option value="enterprise">Talk first</option>
          </select>
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block text-stone-700">What should the card do for you?</span>
        <textarea name="message" rows={4} className="w-full rounded-lg border border-stone-300 px-3 py-3" />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-brand-orange px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? 'Saving…' : 'Save my request'}
      </button>
    </form>
  );
}
