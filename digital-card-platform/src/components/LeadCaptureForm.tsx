'use client';

import { FormEvent, useState } from 'react';

export default function LeadCaptureForm({
  slug,
  ownerName,
}: {
  slug: string;
  ownerName: string;
}) {
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch(`/api/public/${slug}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          company: form.get('company'),
          note: form.get('note'),
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
      <section className="mt-4 w-full rounded-2xl border border-white/10 bg-white p-5 text-center sm:p-6">
        <h2 className="text-lg font-semibold text-stone-900">Saved.</h2>
        <p className="mt-2 text-sm text-stone-600">
          {ownerName} has your details and can reply from the customer inbox.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-4 w-full overflow-hidden rounded-2xl border border-white/10 bg-white">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-5 py-3 text-left"
      >
        <span>
          <span className="block text-base font-semibold text-stone-900">Leave your details</span>
          <span className="block text-xs text-stone-500">
            {ownerName} gets this in their inbox.
          </span>
        </span>
        <span aria-hidden="true" className={`text-[#1B2A6B] ${open ? 'rotate-180' : ''} inline-block`}>
          ▾
        </span>
      </button>
      {open && (
      <form onSubmit={onSubmit} className="space-y-3 px-5 pb-5">
        <input
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          name="website_url"
          aria-hidden="true"
        />
        <label className="block text-sm">
          <span className="mb-1 block text-stone-700">Name</span>
          <input
            name="name"
            required
            minLength={2}
            className="w-full rounded-lg border border-stone-300 px-3 py-3 text-base text-stone-900"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-stone-700">Email</span>
          <input
            name="email"
            type="email"
            className="w-full rounded-lg border border-stone-300 px-3 py-3 text-base text-stone-900"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-stone-700">Phone or WhatsApp</span>
          <input
            name="phone"
            className="w-full rounded-lg border border-stone-300 px-3 py-3 text-base text-stone-900"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-stone-700">Company <span className="text-stone-400">(optional)</span></span>
          <input
            name="company"
            className="w-full rounded-lg border border-stone-300 px-3 py-3 text-base text-stone-900"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-stone-700">What do you need?</span>
          <textarea
            name="note"
            rows={3}
            className="w-full rounded-lg border border-stone-300 px-3 py-3 text-base text-stone-900"
          />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="min-h-11 w-full rounded-full bg-[#C9A84C] px-4 py-3 text-sm font-semibold text-[#0C1330] disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Send to ' + ownerName}
        </button>
        <p className="text-xs text-stone-500">Add an email or a phone. Both is better.</p>
      </form>
      )}
    </section>
  );
}
