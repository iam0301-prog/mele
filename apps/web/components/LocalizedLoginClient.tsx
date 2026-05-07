'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useToast } from '@/components/ToastProvider';
import { createClient } from '@/lib/supabase/client';
import { canUseClientTestAuth, setClientTestAuth } from '@/lib/test-auth';
import { localizePath, type Locale } from '@/lib/i18n/config';
import { getReleasePageCopy } from '@/lib/i18n/release-page-copy';

type Mode = 'signin' | 'signup';

function safeReturnUrl(value: string | null, locale: Locale) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return localizePath('/account/charts', locale);
  }
  return value;
}

export function LocalizedLoginClient({ locale }: { locale: Locale }) {
  const copy = getReleasePageCopy(locale).login;
  const router = useRouter();
  const search = useSearchParams();
  const toast = useToast();
  const returnUrl = useMemo(() => safeReturnUrl(search.get('return'), locale), [search, locale]);
  const invite = search.get('invite') ?? '';
  const [mode, setMode] = useState<Mode>(() => (invite || search.get('mode') === 'signup' ? 'signup' : 'signin'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [age, setAge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testAuth, setTestAuth] = useState(false);

  useEffect(() => {
    setTestAuth(canUseClientTestAuth());
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || password.length < 6) return toast(copy.validation.emailPassword, 'error');
    if (mode === 'signup' && !displayName.trim()) return toast(copy.validation.displayName, 'error');
    if (mode === 'signup' && !agreed) return toast(copy.validation.consent, 'error');
    if (mode === 'signup' && !age) return toast(copy.validation.age, 'error');

    setLoading(true);
    try {
      const supabase = createClient();
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast(copy.successSignIn, 'success');
        router.push(returnUrl);
        router.refresh();
        return;
      }

      const consentedAt = new Date().toISOString();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnUrl)}`,
          data: {
            display_name: displayName,
            privacy_consent_at: consentedAt,
            tos_consent_at: consentedAt,
            consent_version: '2026-04-30',
            beta_invite_code: invite || null,
          },
        },
      });
      if (error) throw error;
      if (data.session) {
        router.push(returnUrl);
        router.refresh();
      } else {
        setMode('signin');
        toast(copy.successSignUp, 'success');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : copy.validation.emailPassword, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function sendReset() {
    if (!email) return toast(copy.validation.emailPassword, 'error');
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(localizePath('/account/profile', locale))}`,
      });
      if (error) throw error;
      toast(copy.resetSent, 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : copy.validation.emailPassword, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function resendConfirmation() {
    if (!email) return toast(copy.validation.emailPassword, 'error');
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnUrl)}`,
        },
      });
      if (error) throw error;
      toast(copy.confirmationSent, 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : copy.validation.emailPassword, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function social(provider: 'google' | 'line') {
    toast(`${provider} ${copy.disabled}`, 'error');
  }

  function useLocalAccount() {
    if (!setClientTestAuth()) {
      toast(copy.disabled, 'error');
      return;
    }
    router.push(returnUrl);
    router.refresh();
  }

  return (
    <main className="container mx-auto max-w-5xl px-5 py-16">
      <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="mele-card">
          <div className="ritual-kicker">{copy.kicker}</div>
          <h1 className="mt-3 font-serif text-4xl text-paper">{copy.title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/68">{copy.body}</p>
        </div>

        <form onSubmit={submit} className="mele-card grid gap-4">
          <div className="grid grid-cols-2 gap-2 rounded-full border border-white/10 bg-black/20 p-1">
            <button
              type="button"
              className={mode === 'signin' ? 'mele-btn-primary !py-2' : 'mele-btn-secondary !py-2'}
              onClick={() => setMode('signin')}
            >
              {copy.signIn}
            </button>
            <button
              type="button"
              className={mode === 'signup' ? 'mele-btn-primary !py-2' : 'mele-btn-secondary !py-2'}
              onClick={() => setMode('signup')}
            >
              {copy.signUp}
            </button>
          </div>

          {mode === 'signup' && (
            <label className="grid gap-2 text-sm">
              <span>{copy.displayName}</span>
              <input className="mele-input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" />
            </label>
          )}

          <label className="grid gap-2 text-sm">
            <span>{copy.email}</span>
            <input className="mele-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </label>
          <label className="grid gap-2 text-sm">
            <span>{copy.password}</span>
            <input className="mele-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
          </label>

          {mode === 'signup' && (
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/72">
              <label className="flex gap-3">
                <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
                <span>{copy.consent}</span>
              </label>
              <label className="flex gap-3">
                <input type="checkbox" checked={age} onChange={(event) => setAge(event.target.checked)} />
                <span>{copy.age}</span>
              </label>
            </div>
          )}

          <button type="submit" className="mele-btn-primary" disabled={loading}>
            {mode === 'signin' ? copy.submitSignIn : copy.submitSignUp}
          </button>

          <div className="flex flex-wrap gap-2">
            <button type="button" className="home-ghost-link" onClick={sendReset} disabled={loading}>{copy.reset}</button>
            <button type="button" className="home-ghost-link" onClick={resendConfirmation} disabled={loading}>{copy.resend}</button>
          </div>

          {testAuth && (
            <button type="button" className="mele-btn-secondary" onClick={useLocalAccount}>
              {copy.localTest}
            </button>
          )}

          <div className="border-t border-white/10 pt-5">
            <div className="ritual-kicker">{copy.socialTitle}</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button type="button" className="mele-btn-secondary" onClick={() => social('google')}>{copy.google} - {copy.disabled}</button>
              <button type="button" className="mele-btn-secondary" onClick={() => social('line')}>{copy.line} - {copy.disabled}</button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
