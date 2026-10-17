'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type LeadRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  note: string | null;
  status: string;
  createdAt: string;
  card: { slug: string; fullName: string };
};

const STATUSES = ['new', 'contacted', 'customer', 'passed'];

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leads')
      .then(async (res) => {
        if (!res.ok) throw new Error('Could not load customers');
        setLeads(await res.json());
      })
      .catch(() => setError('Could not load the inbox.'))
      .finally(() => setLoading(false));
  }, []);

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setLeads((rows) => rows.map((row) => (row.id === id ? { ...row, status } : row)));
    }
  }

  if (loading) return <p className="text-gray-300">Loading customers…</p>;
  if (error) return <p className="text-red-300">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Customers</h1>
      <p className="mt-2 max-w-2xl text-gray-400">
        People who used the form on your card. Reply to them yourself. Changing the status only updates this inbox.
      </p>
      {leads.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/20 p-8 text-gray-300">
          No names yet. Open a published card and send the form.
          <div className="mt-4">
            <Link href="/card/demo" className="text-brand-orange">Open the sample card</Link>
          </div>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {leads.map((lead) => (
            <li key={lead.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">{lead.name}</p>
                  <p className="text-sm text-gray-400">
                    {lead.company ? `${lead.company} · ` : ''}
                    via {lead.card.fullName}
                  </p>
                </div>
                <label className="text-sm text-gray-300">
                  Status
                  <select
                    value={lead.status}
                    onChange={(event) => setStatus(lead.id, event.target.value)}
                    className="ml-2 rounded-lg bg-brand-charcoal px-2 py-2 text-white"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="mt-3 text-sm text-gray-200">
                {[lead.email, lead.phone].filter(Boolean).join(' · ') || 'No contact method'}
              </p>
              {lead.note && <p className="mt-2 text-sm text-gray-300">{lead.note}</p>}
              <p className="mt-2 text-xs text-gray-500">{new Date(lead.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
