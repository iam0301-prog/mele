'use client';

import Link from 'next/link';
import type { Provider } from '@supabase/supabase-js';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { normalizeLoginReturnPath } from '@/lib/auth-callback-redirects';
import { canUseClientTestAuth, setClientTestAuth } from '@/lib/test-auth';
import { useToast } from '@/components/ToastProvider';
import { findBirthLocationPreset, getBirthLocationPresets, presetTimezoneName, type BirthLocationPreset } from '@/components/BirthInputs';

const CONSENT_VERSION = '2026-04-30';
type SocialProviderKey = 'line' | 'google';
type ProviderStatus = { loading: boolean; google: boolean; line: boolean; email: boolean; error: string };

const GOOGLE_LOGIN_FLAG = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN;
const LINE_LOGIN_FLAG = process.env.NEXT_PUBLIC_ENABLE_LINE_LOGIN;
const LINE_OAUTH_PROVIDER = (process.env.NEXT_PUBLIC_LINE_OAUTH_PROVIDER || 'custom:line') as Provider;

const SOCIAL_PROVIDERS: Array<{ key: SocialProviderKey; provider: Provider; label: string; setupHint: string }> = [
  {
    key: 'line',
    provider: LINE_OAUTH_PROVIDER,
    label: '使用 LINE 登入',
    setupHint: 'LINE 登入需先在 Supabase 建立 custom:line provider，並在 LINE Developers 設定 callback URL。',
  },
  {
    key: 'google',
    provider: 'google',
    label: '使用 Google 登入',
    setupHint: 'Google 登入需先在 Supabase Auth Providers 開啟 Google 並填入 Google OAuth client。',
  },
];

const AUTH_ERROR_COPY: Record<string, string> = {
  auth_failed: '登入連結已失效或驗證沒有完成，請重新登入一次。',
  auth_callback_failed: '第三方登入回跳失敗，請確認 Supabase Redirect URLs 與 provider 設定。',
  email_confirmed_login_required: 'Email 可能已完成驗證，但這個瀏覽器沒有原本的註冊登入狀態。請直接用剛才註冊的 Email 與密碼登入。',
  not_admin: '這個瀏覽器目前登入的帳號不是後台管理員。請改用管理員 Email 登入。',
};

function friendlyError(error: unknown, fallback = '操作沒有完成，請再試一次。') {
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message?: unknown }).message || fallback);
  }
  return fallback;
}

const detectLineProvider = (settings: { external?: Record<string, unknown> }) => {
  const external = settings.external ?? {};
  const providerName = String(LINE_OAUTH_PROVIDER).replace(/^custom:/, '');
  const candidates = [
    LINE_OAUTH_PROVIDER,
    providerName,
    'line',
    `custom_${providerName}`,
    `custom:${providerName}`,
  ];

  return candidates.some((key) => external[key] === true)
    || (
      typeof external.custom === 'object'
      && external.custom !== null
      && (external.custom as Record<string, unknown>)[providerName] === true
    );
};

function LoginInner() {
  const search = useSearchParams();
  const toast = useToast();
  const returnUrl = normalizeLoginReturnPath(search.get('return'));
  const inviteCode = search.get('invite')?.trim() || '';
  const betaSegment = search.get('segment')?.trim() || 'invite';
  const authError = search.get('error');
  const authMessage = search.get('message');
  const forceSignOut = search.get('force_signout') === '1';
  const authErrorMessage = authError ? (authMessage || AUTH_ERROR_COPY[authError] || '登入流程沒有完成，請再試一次。') : '';

  const [mode, setMode] = useState<'signin' | 'signup'>(() => (inviteCode || search.get('mode') === 'signup' ? 'signup' : 'signin'));
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState('未填');
  const [birthLocation, setBirthLocation] = useState('台北市');
  const [birthLat, setBirthLat] = useState('25.033');
  const [birthLon, setBirthLon] = useState('121.5654');
  const [birthTz, setBirthTz] = useState('Asia/Taipei');

  const [loading, setLoading] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [confirmationSending, setConfirmationSending] = useState(false);
  const [signupNotice, setSignupNotice] = useState('');
  const [testAuthAvailable, setTestAuthAvailable] = useState(false);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({ loading: true, google: false, line: false, email: false, error: '' });

  useEffect(() => {
    if (authErrorMessage) toast(authErrorMessage, 'error');
  }, [authErrorMessage, toast]);

  useEffect(() => {
    if (!forceSignOut) return;
    const clearWrongSession = async () => {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // 登入頁仍可手動輸入管理員帳號，不需要阻斷畫面。
      } finally {
        window.location.replace(`/account/login?return=${encodeURIComponent(returnUrl)}`);
      }
    };
    void clearWrongSession().catch(() => {
      window.location.replace(`/account/login?return=${encodeURIComponent(returnUrl)}`);
    });
  }, [forceSignOut, returnUrl]);

  useEffect(() => {
    if (inviteCode) setMode('signup');
  }, [inviteCode]);

  useEffect(() => {
    setTestAuthAvailable(canUseClientTestAuth());
  }, []);

  useEffect(() => {
    const loadAuthSettings = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !anonKey) {
        setProviderStatus({ loading: false, google: false, line: false, email: false, error: 'Supabase URL 或 anon key 尚未設定。' });
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
          email: settings.external?.email === true,
          error: '',
        });
      } catch (error) {
        setProviderStatus({
          loading: false,
          google: false,
          line: false,
          email: false,
          error: error instanceof Error ? error.message : '無法讀取 Auth 設定。',
        });
      }
    };

    void loadAuthSettings();
  }, []);

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
    const preset = findBirthLocationPreset(value);
    if (!preset) return;
    setBirthLat(String(preset.lat));
    setBirthLon(String(preset.lon));
    setBirthTz(presetTimezoneName(preset) ?? birthTz);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSignupNotice('');
    if (!email || pwd.length < 6) return toast('請輸入 Email，密碼至少 6 個字元。', 'error');
    if (mode === 'signup' && !displayName.trim()) return toast('請填寫對外顯示名稱。', 'error');
    if (mode === 'signup' && !agreed) return toast('請先同意服務條款、隱私權政策與免責聲明。', 'error');
    if (mode === 'signup' && !ageConfirmed) return toast('請確認年齡與監護人同意狀態。', 'error');

    setLoading(true);
    try {
      const supabase = createClient();

      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
        if (error) {
          toast(error.message, 'error');
          return;
        }
        toast('登入成功。', 'success');
        window.location.assign(returnUrl);
        return;
      }

      const consentedAt = new Date().toISOString();
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pwd,
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
            consent_version: CONSENT_VERSION,
            marketing_opt_in: false,
            beta_invite_code: inviteCode || null,
            beta_segment: betaSegment,
          },
        },
      });

      if (error) {
        toast(error.message, 'error');
        return;
      }

      const likelyExistingSignup =
        data.user &&
        !data.session &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0;
      if (likelyExistingSignup) {
        setMode('signin');
        setPwd('');
        setSignupNotice('這個 Email 可能已經註冊或完成驗證，因此系統不一定會再寄新的註冊驗證信。請先嘗試直接登入；若忘記密碼，請使用「忘記密碼」寄送重設信。');
        toast('這個 Email 可能已經註冊，請改用登入或忘記密碼。', 'error');
        return;
      }

      if (data.user && data.session) {
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
          privacy_consent_version: CONSENT_VERSION,
        });
        if (profileError) console.warn('profile upsert failed:', profileError);

        const { data: existingConsent } = await supabase
          .from('consent_log')
          .select('consent_type')
          .eq('user_id', data.user.id)
          .eq('consent_version', CONSENT_VERSION)
          .in('consent_type', ['privacy', 'tos']);
        const existingTypes = new Set((existingConsent ?? []).map((row) => row.consent_type));
        const missingConsent = [
          { user_id: data.user.id, consent_type: 'privacy', consent_version: CONSENT_VERSION, consented_at: consentedAt },
          { user_id: data.user.id, consent_type: 'tos', consent_version: CONSENT_VERSION, consented_at: consentedAt },
        ].filter((row) => !existingTypes.has(row.consent_type));
        if (missingConsent.length > 0) {
          const { error: consentError } = await supabase.from('consent_log').insert(missingConsent);
          if (consentError) console.warn('consent log insert failed:', consentError);
        }
      }

      if (data.session) {
        toast('註冊完成，已登入。', 'success');
        window.location.assign(returnUrl);
        return;
      }

      setMode('signin');
      setPwd('');
      setSignupNotice('確認信已寄出，請到信箱完成驗證後再回來登入。若 1-2 分鐘內沒有收到，請先檢查垃圾信件與促銷分類，也可以按下重新寄送驗證信。');
      toast('確認信已寄出，請先完成 Email 驗證。', 'success');
    } catch (error) {
      toast(friendlyError(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async () => {
    if (!email) return toast('請先輸入要重設密碼的 Email。', 'error');
    setResetSending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/account/profile')}`,
      });
      if (error) return toast(error.message, 'error');
      toast('密碼重設信已寄出，請到信箱查看。', 'success');
    } catch (error) {
      toast(friendlyError(error), 'error');
    } finally {
      setResetSending(false);
    }
  };

  const resendSignupConfirmation = async () => {
    if (!email) return toast('請先輸入註冊時使用的 Email。', 'error');
    setConfirmationSending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: buildAuthCallbackUrl(returnUrl),
        },
      });
      if (error) return toast(error.message, 'error');
      setSignupNotice('驗證信已重新寄出，請檢查收件匣、垃圾信件與促銷分類。若仍收不到，通常是 Supabase SMTP 或寄信限制需要在 Dashboard 調整。');
      toast('驗證信已重新寄出。', 'success');
    } catch (error) {
      toast(friendlyError(error), 'error');
    } finally {
      setConfirmationSending(false);
    }
  };

  const isSocialProviderEnabled = (provider: SocialProviderKey) => {
    if (provider === 'google') return GOOGLE_LOGIN_FLAG !== 'false' && providerStatus.google;
    return LINE_LOGIN_FLAG === 'true' && providerStatus.line;
  };

  const lineStatusText = () => {
    if (LINE_LOGIN_FLAG !== 'true') return '尚未開啟';
    return providerStatus.line ? '已開啟' : '前端已開，雲端尚未確認';
  };

  const oauthSignIn = async (provider: SocialProviderKey) => {
    const meta = SOCIAL_PROVIDERS.find((item) => item.key === provider);
    if (!meta || !isSocialProviderEnabled(provider)) {
      toast(meta?.setupHint || '社群登入尚未啟用，請先使用 Email 登入。', 'error');
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: meta.provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnUrl)}`,
          scopes: provider === 'line' ? 'openid profile email' : undefined,
        },
      });
      if (error) toast(`${provider} 登入失敗：${error.message}`, 'error');
    } catch (error) {
      toast(friendlyError(error, `${provider} 登入失敗。`), 'error');
    }
  };

  const useLocalTestAuth = () => {
    const enabled = setClientTestAuth();
    if (!enabled) return toast('本機測試登入只會在 localhost 與免費測試模式開啟。', 'error');
    toast('已使用本機測試帳號進入。正式上線仍需完成 Email 驗證信設定。', 'success');
    window.location.assign(returnUrl);
  };

  return (
    <div className="mag-account-page container mx-auto max-w-md px-5 py-12">
      <header className="pb-8 text-center">
        <div className="mb-5 text-base tracking-[0.5em] text-accent opacity-70">ACCOUNT PORTAL</div>
        <h1 className="mb-2 font-serif text-4xl tracking-widest">{mode === 'signup' ? '建立帳號' : '登入'}</h1>
        <div className="mele-subtitle">{mode === 'signup' ? 'SIGN UP' : 'SIGN IN'}</div>
      </header>

      <div className="mele-card">
        {authErrorMessage && (
          <div className="mb-4 rounded-lg border border-reverse/50 bg-reverse/10 p-3 text-sm text-rose-200">
            {authErrorMessage}
          </div>
        )}
        {signupNotice && (
          <div className="mb-4 rounded-lg border border-accent-dim bg-accent/[0.08] p-3 text-sm text-white/80">
            {signupNotice}
          </div>
        )}
        {inviteCode && (
          <div className="mb-4 rounded-lg border border-cyan-300/40 bg-cyan-300/[0.08] p-3 text-sm leading-loose text-cyan-100">
            你正在使用邀請碼 <strong className="text-white">{inviteCode}</strong>。完成註冊後即可正常使用平台。
          </div>
        )}
        <div className="mb-6 flex border-b border-accent-dim">
          {(['signin', 'signup'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`flex-1 py-3 text-sm tracking-widest transition-colors ${
                mode === item ? 'border-b-2 border-accent text-accent' : 'text-white/60 hover:text-white'
              }`}
            >
              {item === 'signin' ? '登入' : '註冊'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="account-login-email" className="mele-label">Email</label>
            <input
              id="account-login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mele-input"
            />
          </div>

          <div>
            <label htmlFor="account-login-password" className="mele-label">密碼</label>
            <input
              id="account-login-password"
              name="password"
              type="password"
              minLength={6}
              required
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={pwd}
              onChange={(event) => setPwd(event.target.value)}
              className="mele-input"
            />
            {mode === 'signin' && (
              <div className="mt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={sendPasswordReset}
                  disabled={resetSending}
                  className="text-xs tracking-widest text-accent-light hover:text-accent disabled:opacity-60"
                >
                  {resetSending ? '寄送中...' : '忘記密碼，寄送重設信'}
                </button>
                <button
                  type="button"
                  onClick={resendSignupConfirmation}
                  disabled={confirmationSending}
                  className="text-xs tracking-widest text-accent-light hover:text-accent disabled:opacity-60"
                >
                  {confirmationSending ? '重寄中...' : '重新寄送驗證信'}
                </button>
              </div>
            )}
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="account-signup-display-name" className="mele-label">對外顯示名 *</label>
                <input
                  id="account-signup-display-name"
                  name="displayName"
                  required
                  autoComplete="name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="mele-input"
                />
              </div>

              <hr className="border-accent-dim/50" />
              <div className="text-xs tracking-widest text-accent">選填出生資料，可讓每日解讀與排盤更準確</div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="account-signup-birth-date" className="mele-label">出生日期</label>
                  <input id="account-signup-birth-date" name="birthDate" type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className="mele-input" />
                </div>
                <div>
                  <label htmlFor="account-signup-birth-time" className="mele-label">出生時間</label>
                  <input id="account-signup-birth-time" name="birthTime" type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} className="mele-input" />
                </div>
              </div>

              <div>
                <label htmlFor="account-signup-gender" className="mele-label">性別</label>
                <select id="account-signup-gender" name="gender" value={gender} onChange={(event) => setGender(event.target.value)} className="mele-input">
                  <option value="女">女</option>
                  <option value="男">男</option>
                  <option value="其他">其他</option>
                  <option value="未填">不透露</option>
                </select>
              </div>

              <div>
                <label htmlFor="account-signup-birth-location" className="mele-label">出生地</label>
                <input
                  id="account-signup-birth-location"
                  name="birthLocation"
                  value={birthLocation}
                  onChange={(event) => updateBirthLocation(event.target.value)}
                  onBlur={(event) => {
                    const preset = findBirthLocationPreset(event.target.value);
                    if (preset) applyBirthPreset(preset);
                  }}
                  placeholder="例如：台北市"
                  className="mele-input"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {getBirthLocationPresets().slice(0, 8).map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyBirthPreset(preset)}
                      className="rounded-full border border-accent-dim px-3 py-1 text-xs text-white/70 transition hover:border-accent hover:text-accent"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="account-signup-birth-latitude" className="mele-label">緯度</label>
                  <input id="account-signup-birth-latitude" name="birthLatitude" type="number" step="0.0001" value={birthLat} onChange={(event) => setBirthLat(event.target.value)} className="mele-input" />
                </div>
                <div>
                  <label htmlFor="account-signup-birth-longitude" className="mele-label">經度</label>
                  <input id="account-signup-birth-longitude" name="birthLongitude" type="number" step="0.0001" value={birthLon} onChange={(event) => setBirthLon(event.target.value)} className="mele-input" />
                </div>
              </div>

              <div>
                <label htmlFor="account-signup-birth-timezone" className="mele-label">出生地時區</label>
                <input id="account-signup-birth-timezone" name="birthTimezone" value={birthTz} onChange={(event) => setBirthTz(event.target.value)} className="mele-input" />
              </div>

              <p className="text-xs leading-relaxed text-white/50">
                出生資料會用於自動帶入排盤、每日儀式與老師諮詢前摘要。你可以之後在個人檔案修改或提出刪除請求。
              </p>

              <hr className="border-accent-dim/50" />

              <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-white/70">
                <input id="account-signup-age-confirmed" name="ageConfirmed" type="checkbox" checked={ageConfirmed} onChange={(event) => setAgeConfirmed(event.target.checked)} className="mt-0.5" />
                <span>我確認自己已滿 18 歲，或已取得法定代理人同意；未滿 13 歲不得自行註冊使用本服務。</span>
              </label>

              <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-white/70">
                <input id="account-signup-agreed" name="agreed" type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-0.5" />
                <span>
                  我已閱讀並同意
                  <Link href="/legal/tos" className="mx-1 text-accent">服務條款</Link>
                  、
                  <Link href="/legal/privacy" className="mx-1 text-accent">隱私權政策</Link>
                  與
                  <Link href="/legal/disclaimer" className="mx-1 text-accent">免責聲明</Link>
                </span>
              </label>
            </>
          )}

          <button type="submit" disabled={loading} className="mele-btn-primary w-full">
            {loading ? '處理中...' : mode === 'signup' ? '建立帳號' : '登入'}
          </button>
        </form>

        {mode === 'signin' && testAuthAvailable && (
          <div className="mt-4 rounded-lg border border-accent-dim bg-accent/[0.06] p-3">
            <div className="mb-2 text-xs leading-relaxed text-white/60">
              收不到驗證信時，可先用本機測試帳號進入會員頁與老師後台。這只在 localhost 測試模式顯示，不會取代正式登入。
            </div>
            <button type="button" onClick={useLocalTestAuth} className="mele-btn-secondary w-full">
              使用本機測試帳號
            </button>
          </div>
        )}

        <div className="mb-3 mt-6 text-center text-xs text-white/50">也可以使用社群帳號登入</div>
        <div className="mb-3 rounded-lg border border-accent-dim bg-white/[0.035] p-3 text-xs leading-relaxed text-white/58">
          {providerStatus.loading && '正在檢查 Supabase 登入設定...'}
          {!providerStatus.loading && providerStatus.error && `Auth 設定讀取失敗：${providerStatus.error}`}
          {!providerStatus.loading && !providerStatus.error && (
            <>
              Email {providerStatus.email ? '已開啟' : '未開啟'} · Google {providerStatus.google ? '已開啟' : '尚未開啟'} · LINE {lineStatusText()}
            </>
          )}
        </div>
        <div className="space-y-2">
          {SOCIAL_PROVIDERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => oauthSignIn(item.key)}
              className={`mele-btn-secondary w-full ${isSocialProviderEnabled(item.key) ? '' : 'opacity-60'}`}
              aria-disabled={!isSocialProviderEnabled(item.key)}
            >
              {item.label}
              {!isSocialProviderEnabled(item.key) && <span className="ml-2 text-[10px] opacity-60">尚未啟用</span>}
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-white/45">
          若要使用 Google 或 LINE 登入，需先在 Supabase Auth Providers 啟用對應供應商。
        </p>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-white/60 hover:text-white">回到首頁</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mag-account-page container mx-auto px-5 py-16 text-center">正在讀取登入頁...</div>}>
      <LoginInner />
    </Suspense>
  );
}
