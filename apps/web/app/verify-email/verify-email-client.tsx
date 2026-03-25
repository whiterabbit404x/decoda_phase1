'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';
  const [status, setStatus] = useState<'idle'|'loading'|'verified'|'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function verify() {
    setStatus('loading');
    setMessage(null);
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus('error');
      setMessage(data.detail ?? 'Unable to verify email token.');
      return;
    }
    setStatus('verified');
  }

  async function resend() {
    const response = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? 'Verification email resent.' : (data.detail ?? 'Unable to resend verification email.'));
  }

  return (
    <main className="container authPage">
      <div className="hero"><div><p className="eyebrow">Email verification</p><h1>Verify your email</h1></div></div>
      {email ? <p className="muted">Account: {email}</p> : null}
      <div className="dataCard authForm">
        {!token ? <p className="statusLine">Verification link is missing a token.</p> : null}
        <button type="button" onClick={() => void verify()} disabled={!token || status === 'loading'}>{status === 'loading' ? 'Verifying…' : 'Verify email'}</button>
        {status === 'verified' ? <p className="statusLine">Email verified. You can now sign in.</p> : null}
        {message ? <p className="statusLine">{message}</p> : null}
        <button type="button" onClick={() => void resend()} disabled={!email}>Resend verification</button>
      </div>
    </main>
  );
}
