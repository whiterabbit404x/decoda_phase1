'use client';

import { useEffect, useState } from 'react';

import DashboardPageContent from './dashboard-page-content';
import {
  DashboardPageData,
  ComplianceDashboardResponse,
  DashboardResponse,
  fetchJson,
  normalizeDashboardResponse,
  ResilienceDashboardResponse,
  RiskDashboardResponse,
  ThreatDashboardResponse,
} from './dashboard-data';

type Props = {
  initialData: DashboardPageData;
};

function mergeDashboardPageData(currentData: DashboardPageData, liveData: Partial<DashboardPageData>): DashboardPageData {
  return {
    apiUrl: liveData.apiUrl ?? currentData.apiUrl,
    dashboard: liveData.dashboard ?? currentData.dashboard,
    riskDashboard: liveData.riskDashboard ?? currentData.riskDashboard,
    threatDashboard: liveData.threatDashboard ?? currentData.threatDashboard,
    complianceDashboard: liveData.complianceDashboard ?? currentData.complianceDashboard,
    resilienceDashboard: liveData.resilienceDashboard ?? currentData.resilienceDashboard,
  };
}

async function fetchHydrationDashboard(apiUrl: string): Promise<DashboardResponse> {
  const payload = await fetchJson<unknown>('/dashboard', apiUrl);
  const dashboard = normalizeDashboardResponse(payload);

  if (!dashboard) {
    throw new Error('Dashboard response was unavailable or invalid.');
  }

  return dashboard;
}

async function fetchHydrationSection<T>(apiUrl: string, path: string): Promise<T> {
  const payload = await fetchJson<T>(path, apiUrl);

  if (!payload) {
    throw new Error(`Hydration request for ${path} was unavailable.`);
  }

  return payload;
}

function debugHydrationFailure(path: string, error: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[dashboard] Live hydration failed for ${path}; retaining current section state.`, error);
  }
}

export default function DashboardLiveHydrator({ initialData }: Props) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    let active = true;

    async function hydrateDashboard() {
      const apiUrl = initialData.apiUrl;
      const [dashboardResult, riskResult, threatResult, complianceResult, resilienceResult] = await Promise.allSettled([
        fetchHydrationDashboard(apiUrl),
        fetchHydrationSection<RiskDashboardResponse>(apiUrl, '/risk/dashboard'),
        fetchHydrationSection<ThreatDashboardResponse>(apiUrl, '/threat/dashboard'),
        fetchHydrationSection<ComplianceDashboardResponse>(apiUrl, '/compliance/dashboard'),
        fetchHydrationSection<ResilienceDashboardResponse>(apiUrl, '/resilience/dashboard'),
      ]);

      if (!active) {
        return;
      }

      if (dashboardResult.status === 'rejected') {
        debugHydrationFailure('/dashboard', dashboardResult.reason);
      }
      if (riskResult.status === 'rejected') {
        debugHydrationFailure('/risk/dashboard', riskResult.reason);
      }
      if (threatResult.status === 'rejected') {
        debugHydrationFailure('/threat/dashboard', threatResult.reason);
      }
      if (complianceResult.status === 'rejected') {
        debugHydrationFailure('/compliance/dashboard', complianceResult.reason);
      }
      if (resilienceResult.status === 'rejected') {
        debugHydrationFailure('/resilience/dashboard', resilienceResult.reason);
      }

      setData((currentData) =>
        mergeDashboardPageData(currentData, {
          apiUrl,
          dashboard: dashboardResult.status === 'fulfilled' ? dashboardResult.value : undefined,
          riskDashboard: riskResult.status === 'fulfilled' ? riskResult.value : undefined,
          threatDashboard: threatResult.status === 'fulfilled' ? threatResult.value : undefined,
          complianceDashboard: complianceResult.status === 'fulfilled' ? complianceResult.value : undefined,
          resilienceDashboard: resilienceResult.status === 'fulfilled' ? resilienceResult.value : undefined,
        })
      );
    }

    void hydrateDashboard();

    return () => {
      active = false;
    };
  }, [initialData.apiUrl]);

  return <DashboardPageContent data={data} />;
}
