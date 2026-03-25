'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { usePilotAuth } from 'app/pilot-auth-context';

export default function AcceptInvitePage() {
  const params = useSearchParams();
  const { authHeaders, refreshUser } = usePilotAuth();
  const [message, setMessage] = useState<string | null>(null);
  return <main className="container authPage"><section className="dataCard"><h1>Accept invite</h1><button type="button" onClick={() => { const token = params.get('token') || ''; void fetch('/api/auth/team-invites-accept', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ token }) }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.detail || 'Invite failed'); await refreshUser(); setMessage('Invite accepted.'); }).catch((e: unknown) => setMessage(e instanceof Error ? e.message : 'Invite failed')); }}>Accept invite</button>{message ? <p className="statusLine">{message}</p> : null}</section></main>;
}
