'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';
  const [requestEmail, setRequestEmail] = useState(email);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function requestReset() {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: requestEmail }),
    });
    const data = await response.json().catch(() => ({}));
    setStatus(response.ok ? 'If that account exists, a reset link was sent.' : (data.detail ?? 'Unable to request reset.'));
  }

  async function submitReset() {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await response.json().catch(() => ({}));
    setStatus(response.ok ? 'Password reset complete. Sign in with your new password.' : (data.detail ?? 'Unable to reset password.'));
  }

  return (
    <main className="container authPage">
      <div className="hero"><div><p className="eyebrow">Account recovery</p><h1>Reset your password</h1></div></div>
      <div className="twoColumnSection authPageGrid">
        <div className="dataCard authForm">
          <label className="label">Email</label>
          <input value={requestEmail} onChange={(event) => setRequestEmail(event.target.value)} type="email" />
          <button type="button" onClick={() => void requestReset()}>Send reset email</button>
        </div>
        <div className="dataCard authForm">
          <label className="label">New password</label>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          <button type="button" disabled={!token || !password} onClick={() => void submitReset()}>Reset password</button>
          {!token ? <p className="statusLine">Open this page from a reset email link to complete reset.</p> : null}
        </div>
      </div>
      {status ? <p className="statusLine">{status}</p> : null}
    </main>
  );
}
