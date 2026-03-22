import type { BuildInfo } from './build-info';

function renderValue(value: string | null | undefined, fallback = 'unknown') {
  return value && value.trim() ? value : fallback;
}

export function formatBuildLine(buildInfo: BuildInfo | null | undefined) {
  return `Build: ${renderValue(buildInfo?.gitCommitShaShort)} · ${renderValue(buildInfo?.gitBranch)} · ${renderValue(buildInfo?.vercelEnv)}`;
}

export default function AuthBuildBadge({
  buildInfo,
  loading = false,
  compact = false,
}: {
  buildInfo: BuildInfo | null;
  loading?: boolean;
  compact?: boolean;
}) {
  const buildLine = loading ? 'Build: loading… · loading… · loading…' : formatBuildLine(buildInfo);

  return (
    <section className={`buildBadge${compact ? ' buildBadgeCompact' : ''}`} aria-live="polite">
      <p className="sectionEyebrow">Deployment identity</p>
      <p className="buildVersionLine">{buildLine}</p>
      <div className="kvGrid compactKvGrid buildBadgeGrid">
        <p>
          <span>environment</span>
          {loading ? 'loading…' : renderValue(buildInfo?.vercelEnv)}
        </p>
        <p>
          <span>currentHost</span>
          {loading ? 'loading…' : renderValue(buildInfo?.currentHost ?? buildInfo?.vercelUrl)}
        </p>
        <p>
          <span>branch</span>
          {loading ? 'loading…' : renderValue(buildInfo?.gitBranch)}
        </p>
        <p>
          <span>commit</span>
          {loading ? 'loading…' : renderValue(buildInfo?.gitCommitShaShort)}
        </p>
        <p>
          <span>buildTimestamp</span>
          {loading ? 'loading…' : renderValue(buildInfo?.buildTimestamp, 'not exposed')}
        </p>
        <p>
          <span>authMode</span>
          {loading ? 'loading…' : renderValue(buildInfo?.authMode)}
        </p>
      </div>
    </section>
  );
}
