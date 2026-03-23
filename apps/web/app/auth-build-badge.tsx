'use client';

import { useEffect, useMemo, useState } from 'react';

import type { BuildInfo } from './build-info';

type AuthBuildBadgeProps = {
  className?: string;
};

function formatValue(value: string | null | undefined, fallback = 'unavailable') {
  if (!value || !String(value).trim()) {
    return fallback;
  }

  return value;
}

function formatBuildTimestamp(value: string | null | undefined) {
  return formatValue(value, 'not exposed');
}

export default function AuthBuildBadge({ className }: AuthBuildBadgeProps) {
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void fetch('/api/build-info', {
      cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Build info request failed with HTTP ${response.status}.`);
        }

        return response.json() as Promise<BuildInfo>;
      })
      .then((payload) => {
        if (!active) {
          return;
        }

        setBuildInfo(payload);
        setError(null);
      })
      .catch((fetchError) => {
        if (!active) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const badgeItems = useMemo(() => {
    if (!buildInfo) {
      return [
        ['environment', loading ? 'loading…' : 'unavailable'],
        ['host', loading ? 'loading…' : 'unavailable'],
        ['branch', loading ? 'loading…' : 'unavailable'],
        ['short commit SHA', loading ? 'loading…' : 'unavailable'],
        ['build timestamp', loading ? 'loading…' : 'not exposed'],
        ['auth mode', loading ? 'loading…' : 'unavailable'],
      ] as const;
    }

    return [
      ['environment', formatValue(buildInfo.vercelEnv)],
      ['host', formatValue(buildInfo.host)],
      ['branch', formatValue(buildInfo.branch)],
      ['short commit SHA', formatValue(buildInfo.shortCommitSha ?? buildInfo.commitSha)],
      ['build timestamp', formatBuildTimestamp(buildInfo.buildTimestamp)],
      ['auth mode', formatValue(buildInfo.authMode)],
    ] as const;
  }, [buildInfo, loading]);

  return (
    <section className={`dataCard authBuildBadge${className ? ` ${className}` : ''}`} aria-live="polite">
      <div className="authBuildBadgeHeader">
        <p className="sectionEyebrow">Deployment identity</p>
        <p className="authBuildBadgeSummary">
          {buildInfo
            ? `This auth page is running from ${formatValue(buildInfo.host)} on ${formatValue(buildInfo.branch)} @ ${formatValue(buildInfo.shortCommitSha ?? buildInfo.commitSha)} with ${formatValue(buildInfo.authMode)}.`
            : 'Loading deployment identity for this auth page…'}
        </p>
      </div>
      <div className="kvGrid compactKvGrid authBuildBadgeGrid">
        {badgeItems.map(([label, value]) => (
          <p key={label}>
            <span>{label}</span>
            {value}
          </p>
        ))}
      </div>
      {error ? <p className="statusLine">{error}</p> : null}
    </section>
  );
}
