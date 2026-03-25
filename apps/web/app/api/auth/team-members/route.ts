import { proxyAuthRequest } from '../_shared/proxy';

export async function GET(request: Request) {
  return proxyAuthRequest(request, '/workspaces/members', 'GET', { requireAuth: true });
}
