'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePilotAuth } from 'app/pilot-auth-context';

export default function ForgotPasswordPage() {
  const { forgotPassword } = usePilotAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  return <main className="container authPage"><form className="dataCard authForm" onSubmit={(event) => { event.preventDefault(); void forgotPassword(email).then(() => setMessage('If an account exists for that email, a reset link has been sent.')).catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Request failed.')); }}><h1>Forgot password</h1><label className="label">Email</label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /><button type="submit">Send reset link</button>{message ? <p className="statusLine">{message}</p> : null}<p className="muted"><Link href="/sign-in">Back to sign in</Link></p></form></main>;
}
