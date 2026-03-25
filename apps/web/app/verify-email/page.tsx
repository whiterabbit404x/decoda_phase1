'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePilotAuth } from 'app/pilot-auth-context';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const { verifyEmail } = usePilotAuth();
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = params.get('token') || '';
    if (!token) {
      setState('error');
      setMessage('Missing verification token.');
      return;
    }
    verifyEmail(token)
      .then(() => {
        setState('ok');
        setMessage('Email verified. You can sign in now.');
      })
      .catch((error: unknown) => {
        setState('error');
        setMessage(error instanceof Error ? error.message : 'Verification failed.');
      });
  }, [params, verifyEmail]);

  return <main className="container authPage"><section className="dataCard"><h1>Verify email</h1><p>{message}</p><p><Link href="/sign-in">Go to sign in</Link></p>{state === 'error' ? <p><Link href="/sign-up">Create account again</Link></p> : null}</section></main>;
}
