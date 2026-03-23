import { getRuntimeConfig } from './runtime-config';

export const AUTH_MODE = 'same-origin proxy';

export type RuntimeConfigSummary = {
  configured: boolean;
  diagnostic: string | null;
  liveModeEnabled: boolean;
  apiTimeoutMs: number | null;
  source: ReturnType<typeof getRuntimeConfig>['source'];
};

export type BuildInfo = {
  vercelEnv: string | null;
  vercelUrl: string | null;
  currentHost: string | null;
  gitBranch: string | null;
  gitCommitShaShort: string | null;
  nodeEnv: string | null;
  buildTimestamp: string | null;
  authMode: typeof AUTH_MODE;
  runtimeConfigSummary: RuntimeConfigSummary;
};

function firstNonEmpty(...values: Array<string | undefined | null>) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export function shortenCommitSha(commitSha: string | null | undefined) {
  const normalized = firstNonEmpty(commitSha);
  return normalized ? normalized.slice(0, 7) : null;
}

export function getBuildInfo(env: NodeJS.ProcessEnv = process.env, currentHost?: string | null): BuildInfo {
  const runtimeConfig = getRuntimeConfig(env);

  return {
    vercelEnv: firstNonEmpty(env.VERCEL_ENV, env.NEXT_PUBLIC_VERCEL_ENV),
    vercelUrl: firstNonEmpty(env.VERCEL_URL, env.NEXT_PUBLIC_VERCEL_URL),
    currentHost: firstNonEmpty(currentHost, env.VERCEL_URL, env.NEXT_PUBLIC_VERCEL_URL),
    gitBranch: firstNonEmpty(env.VERCEL_GIT_COMMIT_REF, env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF, env.GIT_BRANCH),
    gitCommitShaShort: shortenCommitSha(firstNonEmpty(env.VERCEL_GIT_COMMIT_SHA, env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA, env.GIT_COMMIT_SHA)),
    nodeEnv: firstNonEmpty(env.NODE_ENV),
    buildTimestamp: firstNonEmpty(env.BUILD_TIMESTAMP, env.NEXT_PUBLIC_BUILD_TIMESTAMP, env.VERCEL_BUILD_TIMESTAMP),
    authMode: AUTH_MODE,
    runtimeConfigSummary: {
      configured: runtimeConfig.configured,
      diagnostic: runtimeConfig.diagnostic,
      liveModeEnabled: runtimeConfig.liveModeEnabled,
      apiTimeoutMs: runtimeConfig.apiTimeoutMs,
      source: runtimeConfig.source,
    },
  };
}
