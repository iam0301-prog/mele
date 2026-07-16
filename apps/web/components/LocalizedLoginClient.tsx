'use client';

import type { Provider } from '@supabase/supabase-js';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useToast } from '@/components/ToastProvider';
import { createClient } from '@/lib/supabase/client';
import { canUseClientTestAuth, setClientTestAuth } from '@/lib/test-auth';
import { localizePath, type Locale } from '@/lib/i18n/config';
import { getReleasePageCopy } from '@/lib/i18n/release-page-copy';
import { normalizeLoginReturnPath } from '@/lib/auth-callback-redirects';
import { findBirthLocationPreset, getBirthLocationPresets, presetTimezoneName, type BirthLocationPreset } from '@/components/BirthInputs';

type Mode = 'signin' | 'signup';
type SocialProviderKey = 'google' | 'line';
type ProviderStatus = { loading: boolean; google: boolean; line: boolean; error: boolean };

const GOOGLE_LOGIN_FLAG = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN;
const LINE_LOGIN_FLAG = process.env.NEXT_PUBLIC_ENABLE_LINE_LOGIN;
const LINE_OAUTH_PROVIDER = (process.env.NEXT_PUBLIC_LINE_OAUTH_PROVIDER || 'custom:line') as Provider;

const SOCIAL_PROVIDERS: Record<SocialProviderKey, { provider: Provider; scopes?: string }> = {
  google: { provider: 'google' },
  line: { provider: LINE_OAUTH_PROVIDER, scopes: 'openid profile email' },
};

function detectLineProvider(settings: { external?: Record<string, unknown> }) {
  const external = settings.external ?? {};
  const providerName = String(LINE_OAUTH_PROVIDER).replace(/^custom:/, '');
  const candidates = [LINE_OAUTH_PROVIDER, providerName, 'line', `custom_${providerName}`, `custom:${providerName}`];

  return candidates.some((key) => external[String(key)] === true)
    || (
      typeof external.custom === 'object'
      && external.custom !== null
      && (external.custom as Record<string, unknown>)[providerName] === true
    );
}

function safeReturnUrl(value: string | null, locale: Locale) {
  return normalizeLoginReturnPath(value, localizePath('/account/charts', locale));
}

export function LocalizedLoginClient({ locale }: { locale: Locale }) {
  const copy = getReleasePageCopy(locale).login;
  const search = useSearchParams();
  const toast = useToast();
  const returnUrl = useMemo(() => safeReturnUrl(search.get('return'), locale), [search, locale]);
  const authError = search.get('error');
  const authMessage = search.get('message')?.trim() || '';
  const authNotice = useMemo(() => {
    if (!authError) return '';
    if (authError === 'not_admin') return '這個瀏覽器目前登入的帳號不是後台管理員。請改用管理員 Email 登入。';
    if (authError === 'email_confirmed_login_required') return copy.validation.emailConfirmedLoginRequired;
    return authMessage || copy.validation.authCallback;
  }, [authError, authMessage, copy.validation.authCallback, copy.validation.emailConfirmedLoginRequired]);
  const forceSignOut = search.get('force_signout') === '1';
  const invite = search.get('invite') ?? '';
  const [mode, setMode] = useState<Mode>(() => (invite || search.get('mode') === 'signup' ? 'signup' : 'signin'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState('未填');
  const [birthLocation, setBirthLocation] = useState('台北市');
  const [birthLat, setBirthLat] = useState('25.033');
  const [birthLon, setBirthLon] = useState('121.5654');
  const [birthTz, setBirthTz] = useState('Asia/Taipei');
  const [agreed, setAgreed] = useState(false);
  const [age, setAge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testAuth, setTestAuth] = useState(false);
  const [signupNotice, setSignupNotice] = useState('');
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({
    loading: true,
    google: false,
    line: false,
    error: false,
  });

  const buildAuthCallbackUrl = (next: string) =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const applyBirthPreset = (preset: BirthLocationPreset) => {
    setBirthLocation(preset.label);
    setBirthLat(String(preset.lat));
    setBirthLon(String(preset.lon));
    setBirthTz(presetTimezoneName(preset) ?? birthTz);
  };

  const updateBirthLocation = (value: string) => {
    setBirthLocation(value);
    const preset = findBirthLocationPreset(value, locale);
    if (!preset) return;
    setBirthLat(String(preset.lat));
    setBirthLon(String(preset.lon));
    setBirthTz(presetTimezoneName(preset) ?? birthTz);
  };

  function friendlyAuthError(err: unknown, fallback: string) {
    const message = err instanceof Error ? err.message : '';
    const normalized = message.toLowerCase();
    if (
      normalized.includes('error sending confirmation email') ||
      normalized.includes('error sending recovery email') ||
      normalized.includes('email rate limit') ||
      normalized.includes('smtp')
    ) {
      return copy.validation.emailDelivery;
    }
    if (normalized.includes('already registered') || normalized.includes('user already registered')) {
      return copy.validation.existingAccount;
    }
    return message || fallback;
  }

  function isSocialProviderEnabled(provider: SocialProviderKey) {
    if (provider === 'google') return GOOGLE_LOGIN_FLAG !== 'false' && providerStatus.google;
    return LINE_LOGIN_FLAG === 'true' && providerStatus.line;
  }

  useEffect(() => {
    setTestAuth(canUseClientTestAuth());
  }, []);

  useEffect(() => {
    if (forceSignOut) {
      const clearWrongSession = async () => {
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
        } catch {
          // 登入頁仍可手動輸入管理員帳號，不需要阻斷畫面。
        } finally {
          window.location.replace(`${localizePath('/account/login', locale)}?return=${encodeURIComponent(returnUrl)}`);
        }
      };
      void clearWrongSession().catch(() => {
        window.location.replace(`${localizePath('/account/login', locale)}?return=${encodeURIComponent(returnUrl)}`);
      });
    }
  }, [forceSignOut, locale, returnUrl]);

  useEffect(() => {
    if (authError === 'not_admin') {
      setMode('signin');
      toast(authNotice, 'error');
      return;
    }
    if (authError === 'email_confirmed_login_required') {
      setMode('signin');
      setSignupNotice(copy.validation.emailConfirmedLoginRequired);
      toast(copy.validation.emailConfirmedLoginRequired, 'success');
      return;
    }
    if (authError) toast(authNotice || copy.validation.authCallback, 'error');
  }, [authError, authNotice, copy.validation.authCallback, copy.validation.emailConfirmedLoginRequired, toast]);

  useEffect(() => {
    const loadAuthSettings = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !anonKey) {
        setProviderStatus({ loading: false, google: false, line: false, error: true });
        return;
      }

      try {
        const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/settings`, {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
        });
        if (!response.ok) throw new Error(`Auth settings HTTP ${response.status}`);
        const settings = await response.json();
        setProviderStatus({
          loading: false,
          google: settings.external?.google === true,
          line: detectLineProvider(settings),
          error: false,
        });
      } catch {
        setProviderStatus({ loading: false, google: false, line: false, error: true });
      }
    };

    void loadAuthSettings();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignupNotice('');
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
        window.location.assign(returnUrl);
        return;
      }

      const consentedAt = new Date().toISOString();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: buildAuthCallbackUrl(returnUrl),
          data: {
            display_name: displayName,
            birth_date: birthDate || null,
            birth_time: birthTime || null,
            birth_location: birthLocation || null,
            birth_lat: birthLat ? parseFloat(birthLat) : null,
            birth_lon: birthLon ? parseFloat(birthLon) : null,
            birth_timezone: birthTz,
            gender,
            privacy_consent_at: consentedAt,
            tos_consent_at: consentedAt,
            consent_version: '2026-04-30',
            beta_invite_code: invite || null,
          },
        },
      });
      if (error) throw error;
      const likelyExistingSignup =
        data.user &&
        !data.session &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0;
      if (likelyExistingSignup) {
        setMode('signin');
        setPassword('');
        setSignupNotice(copy.validation.existingAccount);
        toast(copy.validation.existingAccount, 'error');
        return;
      }
      if (data.session) {
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            display_name: displayName,
            birth_date: birthDate || null,
            birth_time: birthTime || null,
            birth_location: birthLocation || null,
            birth_lat: birthLat ? parseFloat(birthLat) : null,
            birth_lon: birthLon ? parseFloat(birthLon) : null,
            birth_timezone: birthTz,
            gender,
            privacy_consent_at: consentedAt,
            tos_consent_at: consentedAt,
            privacy_consent_version: '2026-04-30',
          });
          if (profileError) console.warn('profile upsert failed:', profileError);
        }
        window.location.assign(returnUrl);
      } else {
        setMode('signin');
        setPassword('');
        setSignupNotice(copy.successSignUp);
        toast(copy.successSignUp, 'success');
      }
    } catch (err) {
      toast(friendlyAuthError(err, copy.validation.emailPassword), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function sendReset() {
    if (!email) return toast(copy.validation.emailPassword, 'error');
    setSignupNotice('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildAuthCallbackUrl(localizePath('/account/profile', locale)),
      });
      if (error) throw error;
      setSignupNotice(copy.resetSent);
      toast(copy.resetSent, 'success');
    } catch (err) {
      toast(friendlyAuthError(err, copy.validation.emailPassword), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function resendConfirmation() {
    if (!email) return toast(copy.validation.emailPassword, 'error');
    setSignupNotice('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: buildAuthCallbackUrl(returnUrl),
        },
      });
      if (error) throw error;
      setSignupNotice(copy.confirmationSent);
      toast(copy.confirmationSent, 'success');
    } catch (err) {
      toast(friendlyAuthError(err, copy.validation.emailPassword), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function social(provider: SocialProviderKey) {
    const meta = SOCIAL_PROVIDERS[provider];
    if (providerStatus.loading || !isSocialProviderEnabled(provider)) {
      toast(copy.validation.authProviderSetup, 'error');
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: meta.provider,
      options: {
        redirectTo: buildAuthCallbackUrl(returnUrl),
        scopes: meta.scopes,
      },
    });
    if (error) toast(friendlyAuthError(error, copy.validation.authProviderSetup), 'error');
  }

  function useLocalAccount() {
    if (!setClientTestAuth()) {
      toast(copy.disabled, 'error');
      return;
    }
    window.location.assign(returnUrl);
  }

  const providerHint = providerStatus.loading
    ? '正在檢查 Google / LINE OAuth 狀態'
    : providerStatus.error
      ? '暫時無法讀取 OAuth 設定，Email 登入仍可使用'
      : 'Email 可用；Google / LINE 會依 Supabase 設定顯示';

  const flowSteps = mode === 'signin'
    ? ['登入帳號', '完成每日儀式', '回到會員頁面']
    : ['建立帳號', '驗證 Email', '開始每日儀式'];

  return (
    <main className="mag-account-page auth-beta-page">
      <section className="auth-beta-shell" aria-label="登入與註冊">
        <aside className="auth-beta-story">
          <p className="auth-beta-kicker">會員入口</p>
          <h1>{copy.title}</h1>
          <p className="auth-beta-lead">{copy.body}</p>

          <div className="auth-beta-flow" aria-label="登入後流程">
            {flowSteps.map((step, index) => (
              <div key={step} className="auth-beta-flow__item">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>

          <div className="auth-beta-status" aria-label="會員功能總覽">
            <div>
              <span>每日儀式</span>
              <strong>塔羅 / 盧恩</strong>
            </div>
            <div>
              <span>延伸解讀</span>
              <strong>流日 / 流月</strong>
            </div>
            <div>
              <span>OAuth</span>
              <strong>{providerStatus.loading ? '檢查中' : (providerStatus.google || providerStatus.line ? '部分可用' : '未啟用')}</strong>
            </div>
          </div>
        </aside>

        <form onSubmit={submit} className="auth-beta-card">
          <div className="auth-beta-tabs" role="tablist" aria-label="切換登入或註冊">
            <button
              type="button"
              className={mode === 'signin' ? 'is-active' : ''}
              onClick={() => setMode('signin')}
            >
              {copy.signIn}
            </button>
            <button
              type="button"
              className={mode === 'signup' ? 'is-active' : ''}
              onClick={() => setMode('signup')}
            >
              {copy.signUp}
            </button>
          </div>

          <div className="auth-beta-form-head">
            <span>{mode === 'signin' ? '回到你的會員進度' : '建立會員帳號'}</span>
            <strong>{mode === 'signin' ? '登入後會回到會員解讀庫或剛才的任務。' : '先留下必要資料，出生資料可以之後再補。'}</strong>
          </div>

          {authNotice && (
            <div className="auth-beta-notice is-error" role="alert">
              {authNotice}
            </div>
          )}

          {signupNotice && (
            <div className="auth-beta-notice" role="status">
              {signupNotice}
            </div>
          )}

          {mode === 'signup' && (
            <div className="auth-beta-section">
              <label>
                <span>{copy.displayName}</span>
                <input id="localized-signup-display-name" name="displayName" className="mele-input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" />
              </label>

              <details className="auth-beta-details">
                <summary>選填出生資料，之後可再補</summary>
                <div className="auth-beta-details__grid">
                  <label>
                    <span>出生日期</span>
                    <input id="localized-signup-birth-date" name="birthDate" type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className="mele-input" />
                  </label>
                  <label>
                    <span>出生時間</span>
                    <input id="localized-signup-birth-time" name="birthTime" type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} className="mele-input" />
                  </label>
                  <label className="auth-beta-wide">
                    <span>出生地</span>
                    <input
                      id="localized-signup-birth-location"
                      name="birthLocation"
                      value={birthLocation}
                      onChange={(event) => updateBirthLocation(event.target.value)}
                      onBlur={(event) => {
                        const preset = findBirthLocationPreset(event.target.value, locale);
                        if (preset) applyBirthPreset(preset);
                      }}
                      className="mele-input"
                      placeholder="例如：台北市"
                    />
                  </label>
                  <div className="auth-beta-presets auth-beta-wide">
                    {getBirthLocationPresets(locale).slice(0, 8).map((preset) => (
                      <button key={preset.label} type="button" onClick={() => applyBirthPreset(preset)}>
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <label>
                    <span>緯度</span>
                    <input id="localized-signup-birth-latitude" name="birthLatitude" type="number" step="0.0001" value={birthLat} onChange={(event) => setBirthLat(event.target.value)} className="mele-input" />
                  </label>
                  <label>
                    <span>經度</span>
                    <input id="localized-signup-birth-longitude" name="birthLongitude" type="number" step="0.0001" value={birthLon} onChange={(event) => setBirthLon(event.target.value)} className="mele-input" />
                  </label>
                  <label>
                    <span>性別</span>
                    <select id="localized-signup-gender" name="gender" value={gender} onChange={(event) => setGender(event.target.value)} className="mele-input">
                      <option value="女">女</option>
                      <option value="男">男</option>
                      <option value="其他">其他</option>
                      <option value="未填">不透露</option>
                    </select>
                  </label>
                  <label className="auth-beta-wide">
                    <span>出生地時區</span>
                    <input id="localized-signup-birth-timezone" name="birthTimezone" value={birthTz} onChange={(event) => setBirthTz(event.target.value)} className="mele-input" />
                  </label>
                </div>
              </details>
            </div>
          )}

          <div className="auth-beta-section">
            <label>
              <span>{copy.email}</span>
              <input id="localized-login-email" name="email" className="mele-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
            </label>
            <label>
              <span>{copy.password}</span>
              <input id="localized-login-password" name="password" className="mele-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
            </label>
          </div>

          {mode === 'signup' && (
            <div className="auth-beta-consent">
              <label>
                <input id="localized-signup-agreed" name="agreed" type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
                <span>{copy.consent}</span>
              </label>
              <label>
                <input id="localized-signup-age-confirmed" name="ageConfirmed" type="checkbox" checked={age} onChange={(event) => setAge(event.target.checked)} />
                <span>{copy.age}</span>
              </label>
            </div>
          )}

          <button type="submit" className="auth-beta-submit" disabled={loading}>
            {mode === 'signin' ? copy.submitSignIn : copy.submitSignUp}
          </button>

          <div className="auth-beta-help">
            <button type="button" onClick={sendReset} disabled={loading}>{copy.reset}</button>
            <button type="button" onClick={resendConfirmation} disabled={loading}>{copy.resend}</button>
          </div>

          {testAuth && (
            <button type="button" className="auth-beta-local" onClick={useLocalAccount}>
              {copy.localTest}
            </button>
          )}

          <div className="auth-beta-social">
            <div>
              <span>{copy.socialTitle}</span>
              <p>{providerHint}</p>
            </div>
            <div className="auth-beta-social__buttons">
              <button
                type="button"
                onClick={() => social('google')}
                disabled={loading}
                aria-disabled={!isSocialProviderEnabled('google')}
                className={isSocialProviderEnabled('google') ? '' : 'is-disabled'}
              >
                {copy.google}{isSocialProviderEnabled('google') ? '' : ` · ${copy.disabled}`}
              </button>
              <button
                type="button"
                onClick={() => social('line')}
                disabled={loading}
                aria-disabled={!isSocialProviderEnabled('line')}
                className={isSocialProviderEnabled('line') ? '' : 'is-disabled'}
              >
                {copy.line}{isSocialProviderEnabled('line') ? '' : ` · ${copy.disabled}`}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
