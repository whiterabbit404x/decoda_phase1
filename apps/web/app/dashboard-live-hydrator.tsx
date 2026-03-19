'use client';

import { useEffect, useState } from 'react';

import DashboardPageContent from './dashboard-page-content';
import { DashboardPageData, fetchDashboardPageData } from './dashboard-data';

type Props = {
  initialData: DashboardPageData;
};

export default function DashboardLiveHydrator({ initialData }: Props) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    let active = true;

    async function hydrateDashboard() {
      const liveData = await fetchDashboardPageData(initialData.apiUrl);

      if (!active || !liveData.dashboard) {
        return;
      }

      setData(liveData);
    }

    void hydrateDashboard();

    return () => {
      active = false;
    };
  }, [initialData.apiUrl]);

  return <DashboardPageContent data={data} />;
}
