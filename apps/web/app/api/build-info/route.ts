import { getBuildInfo } from '../../build-info';

export const dynamic = 'force-dynamic';

function resolveCurrentHost(request: Request) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  if (forwardedHost?.trim()) {
    return forwardedHost.trim();
  }

  const host = request.headers.get('host');
  if (host?.trim()) {
    return host.trim();
  }

  try {
    return new URL(request.url).host;
  } catch {
    return null;
  }
}

export async function GET(request: Request): Promise<Response> {
  return Response.json(getBuildInfo(process.env, resolveCurrentHost(request)), {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
