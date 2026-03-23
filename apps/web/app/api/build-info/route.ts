import { getBuildInfo } from '../../build-info';

export const dynamic = 'force-dynamic';

function readRequestHost(request: Request) {
  return request.headers.get('x-forwarded-host')
    ?? request.headers.get('host')
    ?? null;
}

export async function GET(request: Request): Promise<Response> {
  return Response.json(getBuildInfo(process.env, { host: readRequestHost(request) }), {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
