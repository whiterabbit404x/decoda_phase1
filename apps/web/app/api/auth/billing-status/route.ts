import { proxyAuthRequest } from '../_shared/proxy';

export async function GET(request: Request) {
  return proxyAuthRequest(request, '/billing/status', 'GET', { requireAuth: true });
}
