'use client';

import { useEffect, useState } from 'react';
import AuthenticatedRoute from 'app/authenticated-route';
import { usePilotAuth } from 'app/pilot-auth-context';

export default function TeamPage() {
  const { authHeaders } = usePilotAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('workspace_member');
  const [members, setMembers] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = () => fetch('/api/auth/team-members', { headers: authHeaders() }).then(async (response) => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Unable to load members');
    setMembers(data.members || []);
  }).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Unable to load members'));

  useEffect(() => { void loadMembers(); }, [authHeaders]);

  return <AuthenticatedRoute><main className="productPage"><section className="featureSection"><div className="sectionHeader"><div><p className="eyebrow">Team</p><h1>Members and invites</h1></div></div><article className="dataCard"><form className="authForm" onSubmit={(event) => { event.preventDefault(); void fetch('/api/auth/team-invites', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ email, role }) }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.detail || 'Invite failed'); setEmail(''); await loadMembers(); }).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Invite failed')); }}><label className="label">Invite email</label><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required /><label className="label">Role</label><select value={role} onChange={(event) => setRole(event.target.value)}><option value="workspace_admin">Admin</option><option value="workspace_member">Member</option><option value="workspace_viewer">Viewer</option></select><button type="submit">Send invite</button></form>{error ? <p className="statusLine">{error}</p> : null}</article><article className="dataCard"><h2>Current members</h2><pre>{JSON.stringify(members, null, 2)}</pre></article></section></main></AuthenticatedRoute>;
}
