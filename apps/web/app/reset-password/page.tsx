'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { usePilotAuth } from 'app/pilot-auth-context';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const { resetPassword } = usePilotAuth();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  return <main className="container authPage"><form className="dataCard authForm" onSubmit={(event) => { event.preventDefault(); const token = params.get('token') || ''; void resetPassword(token, password).then(() => setMessage('Password reset successful. You can sign in now.')).catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Reset failed.')); }}><h1>Reset password</h1><label className="label">New password</label><input type="password" minLength={10} value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="submit">Reset password</button>{message ? <p className="statusLine">{message}</p> : null}<p className="muted"><Link href="/sign-in">Back to sign in</Link></p></form></main>;
}
