import { fetchDashboardPageData } from '../../dashboard-data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const apiUrl = searchParams.get('apiUrl')?.trim();
  const data = await fetchDashboardPageData(apiUrl || undefined);

  return Response.json(data, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
