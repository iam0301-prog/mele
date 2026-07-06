'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';
import { localizePath, type Locale } from '@/lib/i18n/config';

export function ResetPasswordClient({ locale }: { locale?: Locale }) {
  const toast = useToast();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [checkTimedOut, setCheckTimedOut] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const loginHref = locale ? localizePath('/account/login', locale) : '/account/login';
  const profileHref = locale ? localizePath('/account/profile', locale) : '/account/profile';

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    const timeout = window.setTimeout(() => {
      if (!active) return;
      setCheckTimedOut(true);
      setChecking(false);
    }, 4000);

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      window.clearTimeout(timeout);
      setHasSession(Boolean(data.session));
      setChecking(false);
    }).catch(() => {
      if (!active) return;
      window.clearTimeout(timeout);
      setCheckTimedOut(true);
      setChecking(false);
    });

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) return toast('新密碼至少需要 8 個字元。', 'error');
    if (password !== confirm) return toast('兩次輸入的新密碼不一致。', 'error');

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast('密碼已更新，請用新密碼登入。', 'success');
      await supabase.auth.signOut();
      window.location.assign(`${loginHref}?message=${encodeURIComponent('密碼已更新，請用新密碼登入。')}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '密碼更新失敗，請重新寄送重設信。';
      toast(message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mag-account-page container mx-auto max-w-lg px-5 py-12">
      <header className="pb-8 text-center">
        <div className="mb-5 text-base tracking-[0.5em] text-accent opacity-70">PASSWORD RESET</div>
        <h1 className="mb-2 font-serif text-4xl tracking-widest">設定新密碼</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          {checking
            ? '正在確認重設連結，確認成功後就可以輸入新密碼。'
            : hasSession
              ? '請在這裡輸入新密碼。完成後系統會登出，讓你用新密碼重新登入。'
              : '如果重設信已過期或沒有成功建立登入狀態，請重新寄送一次忘記密碼信。'}
        </p>
      </header>

      <section className="mele-card space-y-5">
        {checking ? (
          <p className="text-sm text-white/60">正在確認重設連結...</p>
        ) : !hasSession ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-reverse/50 bg-reverse/10 p-3 text-sm leading-relaxed text-rose-100">
              {checkTimedOut
                ? '系統確認重設連結花費太久，可能是網路暫時不穩或這個連結沒有成功建立登入狀態。請先重新整理；如果仍然看到這個訊息，請回登入頁重新寄送一次「忘記密碼」信。'
                : '這個重設連結沒有成功建立登入狀態，可能已過期、已使用過，或是在不同瀏覽器開啟。請回登入頁重新寄送一次「忘記密碼」信。'}
            </div>
            <Link href={loginHref} className="mele-btn-primary inline-flex">回登入頁重新寄送</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="mele-label">新密碼</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mele-input"
                placeholder="至少 8 個字元"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mele-label">再次輸入新密碼</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="mele-input"
              />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" disabled={saving} aria-disabled={saving} className="mele-btn-primary">
                {saving ? '更新中...' : '更新密碼'}
              </button>
              <Link href={profileHref} className="mele-btn-secondary">先回個人資料</Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
