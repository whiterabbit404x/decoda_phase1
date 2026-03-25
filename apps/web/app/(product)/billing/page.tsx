'use client';

import { useEffect, useState } from 'react';
import AuthenticatedRoute from 'app/authenticated-route';
import { usePilotAuth } from 'app/pilot-auth-context';

export default function BillingPage() {
  const { authHeaders } = usePilotAuth();
  const [billing, setBilling] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch('/api/auth/billing-status', { headers: authHeaders() }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load billing');
      setBilling(data.billing);
    }).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Unable to load billing'));
  }, [authHeaders]);

  return <AuthenticatedRoute><main className="productPage"><section className="featureSection"><div className="sectionHeader"><div><p className="eyebrow">Billing</p><h1>Plan and subscription</h1></div></div>{error ? <div className="emptyStatePanel"><h2>Billing unavailable</h2><p>{error}</p></div> : null}<article className="dataCard"><pre>{JSON.stringify(billing, null, 2)}</pre><button type="button" onClick={() => void fetch('/api/auth/billing-checkout', { method: 'POST', headers: authHeaders() }).then(async (r) => { const d = await r.json(); if (d.url) window.location.href = d.url; else throw new Error(d.detail || 'Checkout unavailable'); }).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Checkout unavailable'))}>Start checkout</button></article></section></main></AuthenticatedRoute>;
}
