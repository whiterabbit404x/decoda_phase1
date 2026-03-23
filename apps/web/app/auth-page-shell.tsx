'use client';

import { useEffect, useMemo, useState } from 'react';

import AuthDiagnosticCard from './auth-diagnostic-card';
import AuthBuildBadge, { formatBuildLine } from './auth-build-badge';
import type { BuildInfo } from './build-info';
import type { RuntimeConfig } from './runtime-config-schema';

const EMPTY_BUILD_INFO: BuildInfo = {
  vercelEnv: null,
  vercelUrl: null,
  currentHost: null,
  gitBranch: null,
  gitCommitShaShort: null,
  nodeEnv: null,
  buildTimestamp: null,
  authMode: 'same-origin proxy',
  runtimeConfigSummary: {
    configured: false,
    diagnostic: null,
    liveModeEnabled: false,
    apiTimeoutMs: null,
    source: {
      apiUrl: 'missing',
      liveModeEnabled: 'missing',
      apiTimeoutMs: 'missing',
    },
  },
};

async function fetchBuildInfo() {
  const response = await fetch('/api/build-info', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Build info request failed with HTTP ${response.status}.`);
  }

  return response.json() as Promise<BuildInfo>;
}

function PreviewWarning({ buildInfo }: { buildInfo: BuildInfo | null }) {
  if (buildInfo?.vercelEnv !== 'preview') {
    return null;
  }

  return (
    <aside className="dataCard previewDeploymentNotice previewDeploymentWarning" role="alert" aria-live="polite">
      <p className="eyebrow">Preview deployment</p>
      <h2>Deployment-specific preview URL</h2>
      <p>
        Preview URLs are deployment-specific. Old preview URLs may not reflect the latest source, even when the branch name looks familiar.
      </p>
      <p>
        Before debugging auth, compare the commit SHA shown on this page with <a href="/api/build-info">/api/build-info</a> and the latest expected deployment.
      </p>
    </aside>
  );
}

export default function AuthPageShell({
  eyebrow,
  title,
  lede,
  statusMessage,
  deploymentWarning,
  afterWarnings,
  runtimeConfig,
  configLoading,
  initialBuildInfo,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  statusMessage?: string | null;
  deploymentWarning?: string | null;
  afterWarnings?: React.ReactNode;
  runtimeConfig: RuntimeConfig;
  configLoading: boolean;
  initialBuildInfo: BuildInfo;
  children: React.ReactNode;
}) {
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(initialBuildInfo);
  const [buildInfoLoading, setBuildInfoLoading] = useState(false);

  useEffect(() => {
    let active = true;


    void fetchBuildInfo()
      .then((nextBuildInfo) => {
        if (active) {
          setBuildInfo(nextBuildInfo);
        }
      })
      .catch(() => {
        if (active) {
          setBuildInfo(EMPTY_BUILD_INFO);
        }
      })
      .finally(() => {
        if (active) {
          setBuildInfoLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const buildLine = useMemo(() => formatBuildLine(buildInfo), [buildInfo]);

  return (
    <main className="container authPage">
      <div className="hero authHero">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="buildVersionInline">{buildInfoLoading ? 'Build: loading… · loading… · loading…' : buildLine}</p>
          <p className="lede">{lede}</p>
        </div>
        <AuthBuildBadge buildInfo={buildInfo} loading={buildInfoLoading} />
      </div>
      {statusMessage ? <p className="statusLine">{statusMessage}</p> : null}
      {deploymentWarning ? <p className="statusLine">{deploymentWarning}</p> : null}
      <PreviewWarning buildInfo={buildInfo} />
      {afterWarnings}
      <div className="twoColumnSection authPageGrid">
        {children}
        <AuthDiagnosticCard buildInfo={buildInfo} buildInfoLoading={buildInfoLoading} loading={configLoading} runtimeConfig={runtimeConfig} />
      </div>
    </main>
  );
}
