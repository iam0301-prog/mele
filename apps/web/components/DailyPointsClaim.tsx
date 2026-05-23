'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DAILY_POINT_AMOUNT } from '@/lib/member-unlocks';
import { readClientTestUser } from '@/lib/test-auth';

interface State {
  loading: boolean;
  authed: boolean;
  claimedToday: boolean;
  balance: number;
  testMode: boolean;
}

interface PointRpcResult {
  balance?: number;
  claimed?: boolean;
}

const taipeiToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date());

/**
 * Discoverable daily-points claim card.
 *
 * Renders three states based on auth + claim status:
 * - Guest: shows "login to claim 200/day" CTA → drives signup.
 * - Member, not yet claimed today: shows balance + 「領取 200 點」 primary button.
 * - Member, already claimed: shows balance with ✓ 今日已領 badge.
 *
 * Designed for the /daily page hero and the homepage. Stateless across re-mounts;
 * pulls latest wallet + today's claim status from Supabase on mount.
 */
export function DailyPointsClaim({
  returnPath = '/daily',
  className = '',
}: {
  returnPath?: string;
  className?: string;
}) {
  const [state, setState] = useState<State>({
    loading: true,
    authed: false,
    claimedToday: false,
    balance: 0,
    testMode: false,
  });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Honor the local test-account flow used in closed beta
        const testUser = readClientTestUser();
        if (testUser) {
          if (!cancelled) {
            setState({
              loading: false,
              authed: true,
              claimedToday: false,
              balance: DAILY_POINT_AMOUNT,
              testMode: true,
            });
          }
          return;
        }
        if (!cancelled) {
          setState({
            loading: false,
            authed: false,
            claimedToday: false,
            balance: 0,
            testMode: false,
          });
        }
        return;
      }

      const today = taipeiToday();
      const [walletResult, claimResult] = await Promise.all([
        supabase
          .from('member_wallets')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('daily_point_claims')
          .select('claim_date')
          .eq('user_id', user.id)
          .eq('claim_date', today)
          .maybeSingle(),
      ]);

      if (cancelled) return;
      setState({
        loading: false,
        authed: true,
        claimedToday: Boolean(claimResult.data),
        balance: (walletResult.data?.balance as number | undefined) ?? 0,
        testMode: false,
      });
    }

    load().catch(() => {
      if (!cancelled) {
        setState((prev) => ({ ...prev, loading: false }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const claim = async () => {
    if (state.testMode) {
      // Test mode is in-memory only — flip locally
      setState((s) => ({ ...s, claimedToday: true, balance: s.balance + DAILY_POINT_AMOUNT }));
      setNotice(`測試模式：已模擬領取 ${DAILY_POINT_AMOUNT} 點。`);
      return;
    }
    setBusy(true);
    setNotice(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc('claim_daily_points');
    if (error) {
      setNotice(error.message);
      setBusy(false);
      return;
    }
    const payload = (data ?? {}) as PointRpcResult;
    setState((s) => ({
      ...s,
      claimedToday: true,
      balance: typeof payload.balance === 'number' ? payload.balance : s.balance + DAILY_POINT_AMOUNT,
    }));
    setNotice(
      payload.claimed
        ? `已領取每日 ${DAILY_POINT_AMOUNT} 點。`
        : '今日已領過，明天再回來。',
    );
    setBusy(false);
  };

  if (state.loading) {
    return (
      <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/55 ${className}`}>
        正在讀取點數狀態…
      </div>
    );
  }

  if (!state.authed) {
    const loginHref = `/account/login?return=${encodeURIComponent(returnPath)}`;
    return (
      <div className={`rounded-2xl border border-accent-dim bg-accent/[0.06] p-4 text-sm leading-relaxed ${className}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-white/82">
            登入後每天可領 <strong className="text-accent">{DAILY_POINT_AMOUNT} 點</strong>，
            用來解鎖深入解讀、流日 / 流月 / 流年。
          </div>
          <Link href={loginHref} className="mele-btn-secondary !px-4 !py-2 !text-xs">
            登入領點
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-accent-dim bg-accent/[0.06] p-4 text-sm leading-relaxed ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-white/82">
          目前點數：<strong className="text-accent">{state.balance}</strong>
          {state.claimedToday ? (
            <span className="ml-3 inline-flex items-center gap-1 text-success">
              <span aria-hidden="true">✓</span> 今日已領取
            </span>
          ) : (
            <span className="ml-3 text-white/64">今日可領 {DAILY_POINT_AMOUNT} 點</span>
          )}
          {notice && <div className="mt-1 text-xs text-white/60">{notice}</div>}
        </div>
        <button
          type="button"
          onClick={claim}
          disabled={state.claimedToday || busy}
          className="mele-btn-primary !px-4 !py-2 !text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy
            ? '領取中…'
            : state.claimedToday
              ? '今日已領'
              : `領取 ${DAILY_POINT_AMOUNT} 點`}
        </button>
      </div>
    </div>
  );
}
