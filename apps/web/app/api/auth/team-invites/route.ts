import { proxyAuthRequest } from '../_shared/proxy';

export async function POST(request: Request) {
  return proxyAuthRequest(request, '/workspaces/invites', 'POST', { requireAuth: true });
}
