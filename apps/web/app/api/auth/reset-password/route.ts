import { proxyAuthRequest } from '../_shared/proxy';

export async function POST(request: Request) {
  return proxyAuthRequest(request, '/auth/reset-password', 'POST');
}
