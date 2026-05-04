export const TEST_AUTH_STORAGE_KEY = 'mele_test_auth_v1';
export const TEST_AUTH_COOKIE = 'mele_test_auth_v1';

export const TEST_AUTH_USER = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'test@mele.local',
  displayName: '測試會員',
};

export function isTestAuthFeatureEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE === 'true';
}

export function isLocalTestHost(hostname: string) {
  return ['localhost', '127.0.0.1', '::1'].includes(hostname);
}

export function canUseClientTestAuth() {
  return (
    isTestAuthFeatureEnabled() &&
    typeof window !== 'undefined' &&
    isLocalTestHost(window.location.hostname)
  );
}

export function readClientTestUser() {
  if (!canUseClientTestAuth()) return null;
  try {
    return window.localStorage.getItem(TEST_AUTH_STORAGE_KEY) ? TEST_AUTH_USER : null;
  } catch {
    return null;
  }
}

export function setClientTestAuth() {
  if (!canUseClientTestAuth()) return false;
  window.localStorage.setItem(TEST_AUTH_STORAGE_KEY, '1');
  document.cookie = `${TEST_AUTH_COOKIE}=1; path=/; max-age=604800; SameSite=Lax`;
  return true;
}

export function clearClientTestAuth() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(TEST_AUTH_STORAGE_KEY);
    } catch {
      // Ignore storage errors in private browsing or restricted webviews.
    }
    document.cookie = `${TEST_AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}
