import { proxyAuthRequest } from '../_shared/proxy';

export async function POST(request: Request) {
  return proxyAuthRequest(request, '/billing/checkout-session', 'POST', { requireAuth: true });
}
