import { cookies, headers } from 'next/headers';
import {
  TEST_AUTH_COOKIE,
  TEST_AUTH_USER,
  isLocalTestHost,
  isTestAuthFeatureEnabled,
} from './test-auth';

export function getServerTestUser() {
  if (!isTestAuthFeatureEnabled()) return null;
  const host = headers().get('host')?.split(':')[0] ?? '';
  if (!isLocalTestHost(host)) return null;
  return cookies().get(TEST_AUTH_COOKIE)?.value === '1' ? TEST_AUTH_USER : null;
}
