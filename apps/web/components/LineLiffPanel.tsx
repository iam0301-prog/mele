'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';

declare global {
  interface Window {
    liff?: {
      init: (options: { liffId: string }) => Promise<void>;
      isInClient: () => boolean;
      isLoggedIn: () => boolean;
      login: (options?: { redirectUri?: string }) => void;
      getProfile: () => Promise<{ userId: string; displayName?: string; pictureUrl?: string }>;
    };
  }
}

const LIFF_SRC = 'https://static.line-scdn.net/liff/edge/2/sdk.js';

interface LineLinkState {
  linked: boolean;
  displayName: string | null;
  pushEnabled: boolean;
  dailyPushHour: number;
  liffReady: boolean;
  missingLiff: boolean;
}

function loadLiffScript() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.liff) return Promise.resolve(true);

  return new Promise<boolean>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-liff-sdk]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = LIFF_SRC;
    script.async = true;
    script.dataset.liffSdk = 'true';
    script.addEventListener('load', () => resolve(true), { once: true });
    script.addEventListener('error', () => resolve(false), { once: true });
    document.head.appendChild(script);
  });
}

export function LineLiffPanel({ compact = false }: { compact?: boolean }) {
  const toast = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [state, setState] = useState<LineLinkState>({
    linked: false,
    displayName: null,
    pushEnabled: true,
    dailyPushHour: 8,
    liffReady: false,
    missingLiff: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData.user;
      if (!currentUser) return;

      if (!cancelled) setUserId(currentUser.id);

      const { data: existing } = await supabase
        .from('line_user_links')
        .select('display_name, push_enabled, daily_push_hour')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (existing && !cancelled) {
        setState((prev) => ({
          ...prev,
          linked: true,
          displayName: existing.display_name ?? null,
          pushEnabled: existing.push_enabled,
          dailyPushHour: existing.daily_push_hour,
        }));
      }

      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      if (!liffId) {
        if (!cancelled) setState((prev) => ({ ...prev, missingLiff: true }));
        return;
      }

      const loaded = await loadLiffScript();
      if (!loaded || !window.liff) return;

      await window.liff.init({ liffId });
      if (!cancelled) setState((prev) => ({ ...prev, liffReady: true }));

      if (!window.liff.isLoggedIn()) return;
      const profile = await window.liff.getProfile();
      const { error } = await supabase.from('line_user_links').upsert({
        user_id: currentUser.id,
        line_user_id: profile.userId,
        display_name: profile.displayName ?? null,
        picture_url: profile.pictureUrl ?? null,
        push_enabled: existing?.push_enabled ?? true,
        daily_push_hour: existing?.daily_push_hour ?? 8,
      }, { onConflict: 'user_id' });

      if (!error && !cancelled) {
        setState((prev) => ({
          ...prev,
          linked: true,
          displayName: profile.displayName ?? existing?.display_name ?? null,
        }));
      }
    }

    boot().catch((error: Error) => {
      if (!cancelled) console.warn('[line-liff]', error.message);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const connectLine = async () => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) {
      toast('尚未設定 NEXT_PUBLIC_LIFF_ID，正式上線前請先建立 LIFF App。', 'error');
      return;
    }
    const loaded = await loadLiffScript();
    if (!loaded || !window.liff) {
      toast('LINE LIFF SDK 載入失敗，請稍後再試。', 'error');
      return;
    }
    await window.liff.init({ liffId });
    if (!window.liff.isLoggedIn()) {
      window.liff.login({ redirectUri: window.location.href });
      return;
    }
    window.location.reload();
  };

  const savePushSettings = async () => {
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('line_user_links')
      .update({
        push_enabled: state.pushEnabled,
        daily_push_hour: state.dailyPushHour,
      })
      .eq('user_id', userId);
    setSaving(false);
    if (error) {
      toast(error.message, 'error');
      return;
    }
    toast('每日 LINE 推播設定已更新');
  };

  if (!userId) {
    return (
      <section className={compact ? 'line-liff-panel is-compact' : 'line-liff-panel'}>
        <div>
          <div className="ritual-kicker">LINE DAILY</div>
          <h2>登入後開啟每日推播</h2>
          <p>使用 LINE 登入後，可以保存每日抽牌與每日解盤，正式上線後也能收到每日提醒。</p>
        </div>
        <Link href="/account/login?return=/daily" className="mele-btn-secondary">登入 LINE</Link>
      </section>
    );
  }

  return (
    <section className={compact ? 'line-liff-panel is-compact' : 'line-liff-panel'}>
      <div>
        <div className="ritual-kicker">LINE DAILY</div>
        <h2>{state.linked ? 'LINE 已綁定' : '綁定 LINE 每日入口'}</h2>
        <p>
          {state.linked
            ? `${state.displayName || '你的 LINE'} 已可保存每日紀錄。你可以設定每天幾點收到提醒。`
            : '正式上線後，客人從 LINE 開啟 LIFF 就能一鍵綁定，保存每日解盤與抽牌結果。'}
        </p>
        {state.missingLiff && <p className="line-liff-panel__hint">目前尚未設定 LIFF ID，本機會先保留登入與資料表能力。</p>}
      </div>

      {!state.linked && (
        <button type="button" onClick={connectLine} className="mele-btn-primary">綁定 LINE</button>
      )}

      {state.linked && (
        <div className="line-liff-panel__settings">
          <label className="line-liff-panel__toggle">
            <input
              type="checkbox"
              checked={state.pushEnabled}
              onChange={(event) => setState((prev) => ({ ...prev, pushEnabled: event.target.checked }))}
            />
            每日提醒
          </label>
          <label>
            <span>推播時間</span>
            <select
              value={state.dailyPushHour}
              onChange={(event) => setState((prev) => ({ ...prev, dailyPushHour: Number(event.target.value) }))}
              className="mele-input"
            >
              {Array.from({ length: 24 }).map((_, hour) => (
                <option key={hour} value={hour}>{`${String(hour).padStart(2, '0')}:00`}</option>
              ))}
            </select>
          </label>
          <button type="button" disabled={saving} onClick={savePushSettings} className="mele-btn-secondary">
            {saving ? '儲存中…' : '儲存設定'}
          </button>
        </div>
      )}
    </section>
  );
}
