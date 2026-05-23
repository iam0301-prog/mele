import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '@/components/ToastProvider';
import { LocalizedLoginClient } from '@/components/LocalizedLoginClient';

const mocks = vi.hoisted(() => ({
  searchParams: new URLSearchParams(),
  signInWithOAuth: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  resend: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => mocks.searchParams,
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mocks.signInWithOAuth,
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
      resetPasswordForEmail: mocks.resetPasswordForEmail,
      resend: mocks.resend,
      signOut: mocks.signOut,
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: () => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null }),
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    }),
  }),
}));

function renderLogin() {
  return render(
    <ToastProvider>
      <LocalizedLoginClient locale="zh-TW" />
    </ToastProvider>,
  );
}

describe('<LocalizedLoginClient /> auth callback handling', () => {
  beforeEach(() => {
    mocks.searchParams = new URLSearchParams();
    mocks.signInWithOAuth.mockReset().mockResolvedValue({ error: null });
    mocks.signInWithPassword.mockReset().mockResolvedValue({ error: null });
    mocks.signUp.mockReset().mockResolvedValue({ data: { user: null, session: null }, error: null });
    mocks.resetPasswordForEmail.mockReset().mockResolvedValue({ error: null });
    mocks.resend.mockReset().mockResolvedValue({ error: null });
    mocks.signOut.mockReset().mockResolvedValue({ error: null });
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mele-test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ external: { google: true, line: true } }),
    }));
  });

  it('shows the auth callback error message on the page instead of only a toast', async () => {
    mocks.searchParams = new URLSearchParams({
      error: 'auth_callback_failed',
      message: 'LINE 登入回跳失敗，請改用 Email 登入或稍後重試。',
      return: '/account/charts?tab=history',
    });

    renderLogin();

    expect(await screen.findByRole('alert')).toHaveTextContent('LINE 登入回跳失敗，請改用 Email 登入或稍後重試。');
  });

  it('keeps the safe return path when starting Google OAuth after a callback failure', async () => {
    mocks.searchParams = new URLSearchParams({
      error: 'auth_callback_failed',
      return: '/account/charts?tab=history',
    });

    renderLogin();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '使用 Google 繼續' })).toHaveAttribute('aria-disabled', 'false');
    });
    fireEvent.click(screen.getByRole('button', { name: '使用 Google 繼續' }));

    await waitFor(() => {
      expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback?next=%2Faccount%2Fcharts%3Ftab%3Dhistory'),
          scopes: undefined,
        },
      });
    });
  });

  it('routes password reset through the localized auth callback and keeps an inline success notice', async () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'tester@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: '寄送密碼重設信' }));

    await waitFor(() => {
      expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith('tester@example.com', {
        redirectTo: expect.stringContaining('/auth/callback?next=%2Fzh-TW%2Faccount%2Fprofile'),
      });
    });
    expect(await screen.findByRole('status')).toHaveTextContent('已寄出密碼重設信。');
  });

  it('resends signup confirmation through auth callback with the sanitized return path and an inline notice', async () => {
    mocks.searchParams = new URLSearchParams({
      return: '/account/charts?tab=history',
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'tester@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: '重寄認證信' }));

    await waitFor(() => {
      expect(mocks.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'tester@example.com',
        options: {
          emailRedirectTo: expect.stringContaining('/auth/callback?next=%2Faccount%2Fcharts%3Ftab%3Dhistory'),
        },
      });
    });
    expect(await screen.findByRole('status')).toHaveTextContent('已寄出認證信');
  });
});
