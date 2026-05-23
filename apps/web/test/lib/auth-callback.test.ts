import { describe, expect, it } from 'vitest';
import { buildLocalizedAuthFailureUrl, normalizeLoginReturnPath } from '@/lib/auth-callback-redirects';

describe('auth callback redirects', () => {
  it('keeps the original protected return path when sending users back to login after OAuth/email failure', () => {
    const url = buildLocalizedAuthFailureUrl({
      origin: 'https://mele.example',
      next: '/account/charts?tab=history',
      error: 'auth_failed',
    });

    expect(url.pathname).toBe('/zh-TW/account/login');
    expect(url.searchParams.get('error')).toBe('auth_failed');
    expect(url.searchParams.get('return')).toBe('/account/charts?tab=history');
  });

  it('uses the locale-aware login page and preserves localized return targets', () => {
    const url = buildLocalizedAuthFailureUrl({
      origin: 'https://mele.example',
      next: '/en/account/charts',
      error: 'email_confirmed_login_required',
      message: 'Missing code verifier',
    });

    expect(url.pathname).toBe('/en/account/login');
    expect(url.searchParams.get('error')).toBe('email_confirmed_login_required');
    expect(url.searchParams.get('message')).toBe('Missing code verifier');
    expect(url.searchParams.get('return')).toBe('/en/account/charts');
  });

  it('falls back to a safe account path when next is unsafe', () => {
    const url = buildLocalizedAuthFailureUrl({
      origin: 'https://mele.example',
      next: 'https://evil.example/phish',
      error: 'auth_callback_failed',
    });

    expect(url.pathname).toBe('/zh-TW/account/login');
    expect(url.searchParams.get('return')).toBe('/account/charts');
  });

  it('normalizes login return targets before redirecting after sign-in', () => {
    expect(normalizeLoginReturnPath('/account/charts?tab=history')).toBe('/account/charts?tab=history');
    expect(normalizeLoginReturnPath('/en/teacher-portal')).toBe('/en/teacher-portal');
    expect(normalizeLoginReturnPath('https://evil.example/phish')).toBe('/account/charts');
    expect(normalizeLoginReturnPath('//evil.example/phish')).toBe('/account/charts');
    expect(normalizeLoginReturnPath(null)).toBe('/account/charts');
    expect(normalizeLoginReturnPath('//evil.example/phish', '/en/account/charts')).toBe('/en/account/charts');
  });
});
