import { headers } from 'next/headers';

import { getBuildInfo } from '../build-info';
import SignInPageClient from './sign-in-page-client';

export const dynamic = 'force-dynamic';

export default function SignInPage({ searchParams }: { searchParams?: { next?: string } }) {
  const requestHeaders = headers();
  const currentHost = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');

  return <SignInPageClient nextPath={searchParams?.next} initialBuildInfo={getBuildInfo(process.env, currentHost)} />;
}
