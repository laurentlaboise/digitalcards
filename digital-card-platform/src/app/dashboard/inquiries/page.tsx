'use client';

import { useEffect, useState } from 'react';

type InquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  country: string | null;
  plan: string;
  message: string | null;
  status: string;
  createdAt: string;
};

export default function InquiriesPage() {
  const [rows, setRows] = useState<InquiryRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/inquiries')
      .then(async (res) => {
        if (res.status === 403) throw new Error('This desk is for the TapCard operator.');
        if (!res.ok) throw new Error('Could not load requests.');
        setRows(await res.json());
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-300">Loading requests…</p>;
  if (error) return <p className="text-red-300">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">TapCard requests</h1>
      <p className="mt-2 text-gray-400">People who asked for a card from the public site. No payment is attached.</p>
      {rows.length === 0 ? (
        <p className="mt-8 text-gray-300">No requests yet.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {rows.map((row) => (
            <li key={row.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-gray-200">
              <p className="text-lg font-semibold text-white">{row.name}</p>
              <p className="text-sm text-gray-400">
                {row.plan} · {row.email}
                {row.phone ? ` · ${row.phone}` : ''}
                {row.country ? ` · ${row.country}` : ''}
              </p>
              {row.company && <p className="mt-1 text-sm">{row.company}</p>}
              {row.message && <p className="mt-2 text-sm text-gray-300">{row.message}</p>}
              <p className="mt-2 text-xs text-gray-500">{new Date(row.createdAt).toLocaleString()} · {row.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
