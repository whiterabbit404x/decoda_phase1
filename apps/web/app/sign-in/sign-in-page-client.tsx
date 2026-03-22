'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import AuthPageShell from '../auth-page-shell';
import type { BuildInfo } from '../build-info';
import { resolveAuthFormState } from '../auth-form-state';
import { usePilotAuth } from '../pilot-auth-context';

export default function SignInPageClient({
  nextPath,
  initialBuildInfo,
}: {
  nextPath?: string;
  initialBuildInfo: BuildInfo;
}) {
  const router = useRouter();
  const {
    apiTimeoutMs,
    configLoading,
    configured,
    liveModeEnabled,
    runtimeConfigDiagnostic,
    runtimeConfigSource,
    signIn,
    apiUrl,
  } = usePilotAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runtimeConfig = useMemo(() => ({
    apiUrl: apiUrl || null,
    liveModeEnabled,
    apiTimeoutMs,
    configured,
    diagnostic: runtimeConfigDiagnostic,
    source: runtimeConfigSource,
  }), [apiTimeoutMs, apiUrl, configured, liveModeEnabled, runtimeConfigDiagnostic, runtimeConfigSource]);
  const formState = resolveAuthFormState(runtimeConfig, configLoading, loading);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn({ email, password });
      router.push(nextPath ?? '/dashboard');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : String(submitError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      eyebrow="Pilot access"
      title="Sign in to your workspace"
      lede="Open your live pilot workspace, save operating history, and keep your team on the same company view."
      statusMessage={formState.statusMessage}
      deploymentWarning={formState.deploymentWarning}
      afterWarnings={nextPath ? <p className="muted">Sign in to continue to {nextPath}.</p> : null}
      runtimeConfig={runtimeConfig}
      configLoading={configLoading}
      initialBuildInfo={initialBuildInfo}
    >
      <form className="dataCard authForm" onSubmit={handleSubmit}>
        <label className="label">Email</label>
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        <label className="label">Password</label>
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        <button type="submit" disabled={formState.submitDisabled}>{loading ? 'Signing in…' : 'Sign in'}</button>
        {error ? <p className="statusLine">{error}</p> : null}
        {!configLoading && !configured ? <p className="statusLine">Auth is disabled until this deployment exposes a valid API_URL.</p> : null}
        <p className="muted">Need an account? <Link href="/sign-up">Create one</Link>.</p>
      </form>
    </AuthPageShell>
  );
}
