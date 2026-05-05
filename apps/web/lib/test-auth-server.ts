import { cookies, headers } from 'next/headers';
import {
  TEST_AUTH_COOKIE,
  TEST_AUTH_USER,
  isLocalTestHost,
  isTestAuthFeatureEnabled,
} from './test-auth';

export async function getServerTestUser() {
  if (!isTestAuthFeatureEnabled()) return null;
  const headerStore = await headers();
  const cookieStore = await cookies();
  const host = headerStore.get('host')?.split(':')[0] ?? '';
  if (!isLocalTestHost(host)) return null;
  return cookieStore.get(TEST_AUTH_COOKIE)?.value === '1' ? TEST_AUTH_USER : null;
}
