'use client';

import { useEffect, useState } from 'react';

import DashboardPageContent from './dashboard-page-content';
import {
  ComplianceDashboardResponse,
  DashboardPageData,
  DashboardResponse,
  ResilienceDashboardResponse,
  RiskDashboardResponse,
  ThreatDashboardResponse,
} from './dashboard-data';

type Props = {
  initialData: DashboardPageData;
};

type HydrationDebugState = {
  apiHydrationError?: string;
  backupReachabilityError?: string;
  retriesAttempted: number;
};

type LiveSectionUpdates = Partial<DashboardPageData>;

type BackupHydrationResult = {
  updates: LiveSectionUpdates;
  gatewayReachable: boolean;
  errors: string[];
};

const HYDRATION_RETRY_DELAY_MS = 1200;
const BACKUP_FETCH_TIMEOUT_MS = 2000;
const OFFLINE_GATEWAY_STATUSES = new Set(['waiting', 'down', 'offline', 'unavailable', 'fallback']);

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function debugHydrationFailure(path: string, error: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[dashboard] Live hydration failed for ${path}; retaining current section state.`, error);
  }
}

function normalizeRuntimeStatus(status?: string) {
  return status?.trim().toLowerCase() ?? '';
}

function isGatewayServiceOk(dashboard: DashboardResponse | null | undefined) {
  if (!dashboard) {
    return false;
  }

  return dashboard.services.some(
    (service) => service.service_name === 'api' && normalizeRuntimeStatus(service.status) === 'ok'
  );
}

function isGatewayClearlyReachable(dashboard: DashboardResponse | null | undefined) {
  if (!dashboard) {
    return false;
  }

  if (isGatewayServiceOk(dashboard)) {
    return true;
  }

  const apiCard = dashboard.cards.find((card) => card.service === 'api' || card.title === 'API Gateway');
  if (apiCard) {
    return !OFFLINE_GATEWAY_STATUSES.has(normalizeRuntimeStatus(apiCard.status));
  }

  return dashboard.services.length > 0 || dashboard.cards.length > 0;
}

function isLiveSection<T extends { source: 'live' | 'fallback' }>(section: T) {
  return section.source === 'live';
}

function collectLiveSectionUpdates(data: DashboardPageData): LiveSectionUpdates {
  const updates: LiveSectionUpdates = {};

  if (data.dashboard && isGatewayClearlyReachable(data.dashboard)) {
    updates.dashboard = data.dashboard;
  }

  if (isLiveSection(data.riskDashboard)) {
    updates.riskDashboard = data.riskDashboard;
  }

  if (isLiveSection(data.threatDashboard)) {
    updates.threatDashboard = data.threatDashboard;
  }

  if (isLiveSection(data.complianceDashboard)) {
    updates.complianceDashboard = data.complianceDashboard;
  }

  if (isLiveSection(data.resilienceDashboard)) {
    updates.resilienceDashboard = data.resilienceDashboard;
  }

  return updates;
}

function hasLiveSectionUpdates(updates: LiveSectionUpdates) {
  return Object.keys(updates).length > 0;
}

function mergeDashboardPageData(current: DashboardPageData, updates: LiveSectionUpdates): DashboardPageData {
  return {
    ...current,
    ...updates,
  };
}

function isHydrationSuccess(data: DashboardPageData) {
  return isGatewayServiceOk(data.dashboard) || isGatewayClearlyReachable(data.dashboard);
}

async function fetchJsonWithTimeout<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), BACKUP_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}.`);
    }

    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function performBackupHydration(apiUrl: string): Promise<BackupHydrationResult> {
  const [dashboardResult, riskResult, threatResult, complianceResult, resilienceResult] = await Promise.allSettled([
    fetchJsonWithTimeout<DashboardResponse>(`${apiUrl}/dashboard`),
    fetchJsonWithTimeout<RiskDashboardResponse>(`${apiUrl}/risk/dashboard`),
    fetchJsonWithTimeout<ThreatDashboardResponse>(`${apiUrl}/threat/dashboard`),
    fetchJsonWithTimeout<ComplianceDashboardResponse>(`${apiUrl}/compliance/dashboard`),
    fetchJsonWithTimeout<ResilienceDashboardResponse>(`${apiUrl}/resilience/dashboard`),
  ]);

  const updates: LiveSectionUpdates = {};
  const errors: string[] = [];
  let gatewayReachable = false;

  if (dashboardResult.status === 'fulfilled') {
    updates.dashboard = dashboardResult.value;
    gatewayReachable = true;
  } else {
    errors.push(`/dashboard: ${toErrorMessage(dashboardResult.reason)}`);
    debugHydrationFailure('/dashboard', dashboardResult.reason);
  }

  if (riskResult.status === 'fulfilled') {
    if (isLiveSection(riskResult.value)) {
      updates.riskDashboard = riskResult.value;
    }
  } else {
    errors.push(`/risk/dashboard: ${toErrorMessage(riskResult.reason)}`);
    debugHydrationFailure('/risk/dashboard', riskResult.reason);
  }

  if (threatResult.status === 'fulfilled') {
    if (isLiveSection(threatResult.value)) {
      updates.threatDashboard = threatResult.value;
    }
  } else {
    errors.push(`/threat/dashboard: ${toErrorMessage(threatResult.reason)}`);
    debugHydrationFailure('/threat/dashboard', threatResult.reason);
  }

  if (complianceResult.status === 'fulfilled') {
    if (isLiveSection(complianceResult.value)) {
      updates.complianceDashboard = complianceResult.value;
    }
  } else {
    errors.push(`/compliance/dashboard: ${toErrorMessage(complianceResult.reason)}`);
    debugHydrationFailure('/compliance/dashboard', complianceResult.reason);
  }

  if (resilienceResult.status === 'fulfilled') {
    if (isLiveSection(resilienceResult.value)) {
      updates.resilienceDashboard = resilienceResult.value;
    }
  } else {
    errors.push(`/resilience/dashboard: ${toErrorMessage(resilienceResult.reason)}`);
    debugHydrationFailure('/resilience/dashboard', resilienceResult.reason);
  }

  return {
    updates,
    gatewayReachable,
    errors,
  };
}

export default function DashboardLiveHydrator({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [gatewayReachableOverride, setGatewayReachableOverride] = useState(false);
  const [debugState, setDebugState] = useState<HydrationDebugState>({ retriesAttempted: 0 });

  useEffect(() => {
    let active = true;
    let retryTimer: number | undefined;

    async function attemptHydration(attempt: number): Promise<void> {
      try {
        const response = await fetch(
          `/api/dashboard-page-data?apiUrl=${encodeURIComponent(initialData.apiUrl)}`,
          {
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          throw new Error(`Hydration request failed with status ${response.status}.`);
        }

        const liveData = (await response.json()) as DashboardPageData;

        if (!active) {
          return;
        }

        const routeUpdates = collectLiveSectionUpdates(liveData);
        const routeHydrationSucceeded = isHydrationSuccess(liveData);
        const routeGatewayReachable = routeHydrationSucceeded || Boolean(routeUpdates.dashboard);

        if (routeHydrationSucceeded) {
          setData(liveData);
          setGatewayReachableOverride((current) => current || routeGatewayReachable);
          setDebugState({ retriesAttempted: attempt });
          return;
        }

        const backupResult = await performBackupHydration(initialData.apiUrl);

        if (!active) {
          return;
        }

        const mergedUpdates = {
          ...routeUpdates,
          ...backupResult.updates,
        };

        if (hasLiveSectionUpdates(mergedUpdates)) {
          setData((current) => mergeDashboardPageData(current, mergedUpdates));
        }

        const gatewayReachable = routeGatewayReachable || backupResult.gatewayReachable;
        setGatewayReachableOverride((current) => current || gatewayReachable);

        if (!hasLiveSectionUpdates(mergedUpdates) && attempt === 0) {
          retryTimer = window.setTimeout(() => {
            void attemptHydration(1);
          }, HYDRATION_RETRY_DELAY_MS);
        }

        setDebugState({
          apiHydrationError: 'Hydration route returned fallback data; attempted direct browser recovery.',
          backupReachabilityError:
            gatewayReachable || backupResult.errors.length === 0
              ? undefined
              : backupResult.errors.join(' | '),
          retriesAttempted: attempt + (hasLiveSectionUpdates(mergedUpdates) ? 0 : 1),
        });
      } catch (error) {
        if (!active) {
          return;
        }

        debugHydrationFailure('/api/dashboard-page-data', error);

        const backupResult = await performBackupHydration(initialData.apiUrl);

        if (!active) {
          return;
        }

        if (hasLiveSectionUpdates(backupResult.updates)) {
          setData((current) => mergeDashboardPageData(current, backupResult.updates));
        }

        setGatewayReachableOverride((current) => current || backupResult.gatewayReachable);

        if (!hasLiveSectionUpdates(backupResult.updates) && attempt === 0) {
          retryTimer = window.setTimeout(() => {
            void attemptHydration(1);
          }, HYDRATION_RETRY_DELAY_MS);
          setDebugState({
            apiHydrationError: toErrorMessage(error),
            backupReachabilityError:
              backupResult.gatewayReachable || backupResult.errors.length === 0
                ? undefined
                : backupResult.errors.join(' | '),
            retriesAttempted: attempt + 1,
          });
          return;
        }

        setDebugState({
          apiHydrationError: toErrorMessage(error),
          backupReachabilityError:
            backupResult.gatewayReachable || backupResult.errors.length === 0
              ? undefined
              : backupResult.errors.join(' | '),
          retriesAttempted: attempt + (hasLiveSectionUpdates(backupResult.updates) ? 0 : 1),
        });
      }
    }

    void attemptHydration(0);

    return () => {
      active = false;
      if (retryTimer !== undefined) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [initialData.apiUrl]);

  return (
    <DashboardPageContent
      data={data}
      gatewayReachableOverride={gatewayReachableOverride}
    />
  );
}
