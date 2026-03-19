import DashboardLiveHydrator from './dashboard-live-hydrator';
import { fetchDashboardPageData } from './dashboard-data';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const initialData = await fetchDashboardPageData();

  return <DashboardLiveHydrator initialData={initialData} />;
}
