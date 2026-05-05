'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { DAILY_POINT_AMOUNT, POINT_UNLOCK_COST, type MemberUnlockType } from '@/lib/member-unlocks';
import { readClientTestUser } from '@/lib/test-auth';
import type { ChartTool, MemberWallet } from '@/types/db';

interface ChartRecord {
  id: string;
  tool: ChartTool;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  created_at: string;
}

interface ContentUnlockRow {
  id: string;
  unlock_type: MemberUnlockType;
  tool: ChartTool;
  scope_key: string;
  cost_points: number;
  created_at: string;
}

const TOOL_LABEL: Record<string, string> = {
  numerology: '生命靈數',
  maya: '馬雅曆',
  bazi: '八字',
  ziwei: '紫微斗數',
  tarot: '塔羅',
  runes: '盧恩',
  astro: '占星',
  humandesign: '人類圖',
};

const UNLOCK_LABEL: Record<MemberUnlockType, string> = {
  deep_reading: '深入解釋',
  transit_day: '流日',
  transit_month: '流月',
  transit_year: '流年',
};

function formatDate(value: string) {
  return new Date(value).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ChartsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<ChartRecord[]>([]);
  const [wallet, setWallet] = useState<MemberWallet | null>(null);
  const [unlocks, setUnlocks] = useState<ContentUnlockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [testMode, setTestMode] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadArchive() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const testUser = readClientTestUser();
        if (testUser) {
          setTestMode(true);
          setWallet({
            user_id: testUser.id,
            balance: DAILY_POINT_AMOUNT,
            lifetime_earned: DAILY_POINT_AMOUNT,
            lifetime_spent: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setUnlocks([]);
          setRecords([]);
          setLoading(false);
          return;
        }
        router.push('/account/login?return=/account/charts');
        return;
      }

      const [walletResult, unlockResult, chartResult] = await Promise.all([
        supabase
          .from('member_wallets')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('content_unlocks')
          .select('id, unlock_type, tool, scope_key, cost_points, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(12),
        supabase
          .from('chart_records')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (cancelled) return;
      if (walletResult.error) setNotice(walletResult.error.message);
      setWallet((walletResult.data as MemberWallet | null) ?? null);
      setUnlocks((unlockResult.data || []) as ContentUnlockRow[]);
      setRecords((chartResult.data || []) as ChartRecord[]);
      setLoading(false);
    }

    loadArchive().catch((error: Error) => {
      if (!cancelled) {
        setNotice(error.message);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="container mx-auto max-w-5xl px-5 py-12">
      <header className="text-center pb-8">
        <h1 className="font-serif text-3xl tracking-widest mb-2">會員解讀庫</h1>
        <div className="mele-subtitle">MEMBER ORACLE ARCHIVE</div>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/68">
          會員在前台先看簡易解釋；付 {POINT_UNLOCK_COST} 點可開深入解釋、流日、流月或流年。已解鎖的內容會留在這裡，方便回看，也方便日後與老師諮詢銜接。
        </p>
      </header>

      {testMode && (
        <div className="mb-5 rounded-lg border border-accent-dim bg-accent/[0.08] p-4 text-sm leading-relaxed text-white/72">
          本機測試帳號正在使用示範會員庫；正式註冊登入後，這裡會讀取 Supabase 會員點數、解鎖紀錄與排盤紀錄。
        </div>
      )}

      {notice && (
        <div className="mb-5 rounded-lg border border-reverse/40 bg-reverse/10 p-4 text-sm text-rose-200">
          {notice}
        </div>
      )}

      <section className="member-vault" aria-label="會員點數">
        <div>
          <span>POINT WALLET</span>
          <h2>會員點數</h2>
          <p>每天可領 200 點；每次深入解釋、流日、流月、流年目前皆以 100 點解鎖。會員先理解自己，再決定是否進一步請老師細看。</p>
        </div>
        <div className="member-vault__stats">
          <article>
            <span>可用點數</span>
            <strong>{loading ? '...' : wallet?.balance ?? 0}</strong>
          </article>
          <article>
            <span>累計獲得</span>
            <strong>{loading ? '...' : wallet?.lifetime_earned ?? 0}</strong>
          </article>
          <article>
            <span>累計使用</span>
            <strong>{loading ? '...' : wallet?.lifetime_spent ?? 0}</strong>
          </article>
        </div>
      </section>

      <section className="member-unlock-history" aria-label="解鎖紀錄">
        <div className="member-section-heading">
          <span>UNLOCK HISTORY</span>
          <h2>解鎖紀錄</h2>
        </div>
        {loading && <div className="member-empty-state">載入解鎖紀錄中...</div>}
        {!loading && unlocks.length === 0 && (
          <div className="member-empty-state">
            目前尚未解鎖內容。你可以先到任一工具取得簡易解釋，再用點數開啟文言感深度解讀。
            <div><Link href="/" className="member-inline-link">前往工具首頁</Link></div>
          </div>
        )}
        {!loading && unlocks.length > 0 && (
          <div className="member-unlock-history__grid">
            {unlocks.map((item) => (
              <article key={item.id}>
                <span>{TOOL_LABEL[item.tool] ?? item.tool}</span>
                <h3>{UNLOCK_LABEL[item.unlock_type] ?? item.unlock_type}</h3>
                <p>已使用 {item.cost_points} 點開啟。老師諮詢時可依此脈絡延伸，不必從零開始。</p>
                <time>{formatDate(item.created_at)}</time>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="chart-history-card" aria-label="排盤紀錄">
        <div className="member-section-heading">
          <span>CHART HISTORY</span>
          <h2>排盤紀錄</h2>
        </div>
        {loading && <div className="member-empty-state">載入排盤紀錄中...</div>}
        {!loading && records.length === 0 && (
          <div className="member-empty-state">
            尚未保存任何排盤。先做一份免費簡易解釋，之後再視需要付點數看深度內容。
            <div><Link href="/" className="member-inline-link">開始第一份解讀</Link></div>
          </div>
        )}
        {!loading && records.length > 0 && (
          <ul>
            {records.map((record) => (
              <li key={record.id}>
                <div>
                  <strong>{TOOL_LABEL[record.tool] || record.tool}</strong>
                  <time>{formatDate(record.created_at)}</time>
                </div>
                <Link href={`/tools/${record.tool}`}>再次查看</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <nav className="mt-6 flex flex-wrap justify-center gap-4 text-xs tracking-widest">
        <Link href="/account/profile" className="text-accent hover:opacity-80">會員資料</Link>
        <Link href="/account/mybookings" className="text-accent hover:opacity-80">我的諮詢</Link>
        <Link href="/daily" className="text-accent hover:opacity-80">每日儀式</Link>
      </nav>
    </main>
  );
}
