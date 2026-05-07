'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';
import type {
  AdminPointAdjustmentMode,
  BetaTester,
  BetaTesterStatus,
  ContentUnlock,
  DailyPointClaim,
  MemberWallet,
  PointTransaction,
  Profile,
} from '@/types/db';

type TesterRow = {
  userId: string;
  profile: Profile | null;
  tester: BetaTester | null;
  wallet: MemberWallet | null;
  transactions: PointTransaction[];
  unlocks: ContentUnlock[];
  claims: DailyPointClaim[];
};

type TesterForm = {
  status: BetaTesterStatus;
  segment: string;
  invite_code: string;
  invite_source: string;
  preferred_contact: string;
  notes: string;
  feedback_summary: string;
};

type AdjustmentResult = {
  adjusted?: boolean;
  balance?: number;
};

const STATUS_LABEL: Record<BetaTesterStatus, string> = {
  invited: '已邀請',
  onboarded: '已註冊',
  active: '測試中',
  paused: '暫停',
  done: '已完成',
  blocked: '封鎖',
};

const STATUS_TONE: Record<BetaTesterStatus, string> = {
  invited: 'text-sky-200 border-sky-300/40 bg-sky-300/10',
  onboarded: 'text-emerald-200 border-emerald-300/40 bg-emerald-300/10',
  active: 'text-accent border-accent-dim bg-accent/10',
  paused: 'text-white/70 border-white/20 bg-white/[0.04]',
  done: 'text-violet-200 border-violet-300/40 bg-violet-300/10',
  blocked: 'text-rose-200 border-rose-300/40 bg-rose-300/10',
};

const TOOL_LABEL: Record<string, string> = {
  numerology: '生命靈數',
  maya: '瑪雅曆',
  bazi: '八字',
  ziwei: '紫微',
  tarot: '塔羅',
  runes: '盧恩',
  astro: '占星',
  humandesign: '人類圖',
};

const POINT_MODE_LABEL: Record<AdminPointAdjustmentMode, string> = {
  credit: '補點',
  debit: '扣點',
  set: '設定餘額',
};

const DEFAULT_INVITE_CODE = 'closed-beta';

function todayKey() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
}

function shortId(id: string) {
  return `${id.slice(0, 8)}...${id.slice(-4)}`;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '尚無紀錄';
  return new Date(value).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function defaultTesterForm(row: TesterRow | null): TesterForm {
  return {
    status: row?.tester?.status ?? 'active',
    segment: row?.tester?.segment ?? 'friends',
    invite_code: row?.tester?.invite_code ?? DEFAULT_INVITE_CODE,
    invite_source: row?.tester?.invite_source ?? 'admin',
    preferred_contact: row?.tester?.preferred_contact ?? '',
    notes: row?.tester?.notes ?? '',
    feedback_summary: row?.tester?.feedback_summary ?? '',
  };
}

function rowName(row: TesterRow) {
  return row.profile?.display_name || '未命名會員';
}

function buildInviteUrl(origin: string, inviteCode: string, segment = 'closed-beta') {
  const params = new URLSearchParams({
    invite: inviteCode || DEFAULT_INVITE_CODE,
    segment,
  });
  return `${origin}/zh-TW/beta?${params.toString()}`;
}

export default function AdminTestersPage() {
  const toast = useToast();
  const [rows, setRows] = useState<TesterRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'untracked' | BetaTesterStatus>('all');
  const [loading, setLoading] = useState(true);
  const [savingTester, setSavingTester] = useState(false);
  const [adjustingPoints, setAdjustingPoints] = useState(false);
  const [testerForm, setTesterForm] = useState<TesterForm>(defaultTesterForm(null));
  const [pointMode, setPointMode] = useState<AdminPointAdjustmentMode>('credit');
  const [pointAmount, setPointAmount] = useState('200');
  const [pointReason, setPointReason] = useState('封測補點');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      const statusOk =
        statusFilter === 'all' ||
        (statusFilter === 'untracked' ? !row.tester : row.tester?.status === statusFilter);
      if (!statusOk) return false;
      if (!term) return true;
      return [
        row.userId,
        row.profile?.display_name,
        row.profile?.birth_location,
        row.tester?.invite_code,
        row.tester?.segment,
        row.tester?.preferred_contact,
        row.tester?.notes,
        row.tester?.feedback_summary,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [rows, search, statusFilter]);

  const selectedRow = useMemo(
    () => filteredRows.find((row) => row.userId === selectedId) ?? filteredRows[0] ?? null,
    [filteredRows, selectedId],
  );

  const stats = useMemo(() => {
    const tracked = rows.filter((row) => row.tester);
    const active = tracked.filter((row) => row.tester && ['onboarded', 'active'].includes(row.tester.status));
    const claimedToday = rows.filter((row) => row.claims.some((claim) => claim.claim_date === todayKey()));
    const unlockedUsers = rows.filter((row) => row.unlocks.length > 0);
    const lowBalance = rows.filter((row) => (row.wallet?.balance ?? 0) < 100);
    return { tracked: tracked.length, active: active.length, claimedToday: claimedToday.length, unlockedUsers: unlockedUsers.length, lowBalance: lowBalance.length };
  }, [rows]);

  const loadTesters = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const [profileResult, testerResult] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(180),
      supabase.from('beta_testers').select('*').order('updated_at', { ascending: false }).limit(260),
    ]);

    if (profileResult.error) toast(profileResult.error.message, 'error');
    if (testerResult.error) toast(testerResult.error.message, 'error');

    const profiles = (profileResult.data ?? []) as Profile[];
    const testers = (testerResult.data ?? []) as BetaTester[];
    const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
    const testerById = new Map(testers.map((tester) => [tester.user_id, tester]));
    const userIds = Array.from(new Set([...profiles.map((profile) => profile.id), ...testers.map((tester) => tester.user_id)]));

    const missingProfileIds = userIds.filter((id) => !profilesById.has(id));
    if (missingProfileIds.length > 0) {
      const { data, error } = await supabase.from('profiles').select('*').in('id', missingProfileIds);
      if (error) toast(error.message, 'error');
      for (const profile of (data ?? []) as Profile[]) profilesById.set(profile.id, profile);
    }

    if (userIds.length === 0) {
      setRows([]);
      setSelectedId(null);
      setLoading(false);
      return;
    }

    const [walletResult, transactionResult, unlockResult, claimResult] = await Promise.all([
      supabase.from('member_wallets').select('*').in('user_id', userIds),
      supabase.from('point_transactions').select('*').in('user_id', userIds).order('created_at', { ascending: false }).limit(300),
      supabase.from('content_unlocks').select('*').in('user_id', userIds).order('created_at', { ascending: false }).limit(300),
      supabase.from('daily_point_claims').select('*').in('user_id', userIds).order('created_at', { ascending: false }).limit(300),
    ]);

    if (walletResult.error) toast(walletResult.error.message, 'error');
    if (transactionResult.error) toast(transactionResult.error.message, 'error');
    if (unlockResult.error) toast(unlockResult.error.message, 'error');
    if (claimResult.error) toast(claimResult.error.message, 'error');

    const wallets = new Map((walletResult.data ?? []).map((wallet) => [(wallet as MemberWallet).user_id, wallet as MemberWallet]));
    const transactionsByUser = new Map<string, PointTransaction[]>();
    const unlocksByUser = new Map<string, ContentUnlock[]>();
    const claimsByUser = new Map<string, DailyPointClaim[]>();

    for (const transaction of (transactionResult.data ?? []) as PointTransaction[]) {
      transactionsByUser.set(transaction.user_id, [...(transactionsByUser.get(transaction.user_id) ?? []), transaction]);
    }
    for (const unlock of (unlockResult.data ?? []) as ContentUnlock[]) {
      unlocksByUser.set(unlock.user_id, [...(unlocksByUser.get(unlock.user_id) ?? []), unlock]);
    }
    for (const claim of (claimResult.data ?? []) as DailyPointClaim[]) {
      claimsByUser.set(claim.user_id, [...(claimsByUser.get(claim.user_id) ?? []), claim]);
    }

    const nextRows = userIds
      .map((userId) => ({
        userId,
        profile: profilesById.get(userId) ?? null,
        tester: testerById.get(userId) ?? null,
        wallet: wallets.get(userId) ?? null,
        transactions: transactionsByUser.get(userId) ?? [],
        unlocks: unlocksByUser.get(userId) ?? [],
        claims: claimsByUser.get(userId) ?? [],
      }))
      .sort((a, b) => {
        const aTime = new Date(a.tester?.updated_at ?? a.profile?.created_at ?? 0).getTime();
        const bTime = new Date(b.tester?.updated_at ?? b.profile?.created_at ?? 0).getTime();
        return bTime - aTime;
      });

    setRows(nextRows);
    setSelectedId((current) => (current && nextRows.some((row) => row.userId === current) ? current : nextRows[0]?.userId ?? null));
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    void loadTesters();
  }, [loadTesters]);

  useEffect(() => {
    setTesterForm(defaultTesterForm(selectedRow));
    setPointAmount('200');
    setPointReason('封測補點');
  }, [selectedRow]);

  const copyInvite = async (inviteCode = testerForm.invite_code || DEFAULT_INVITE_CODE, segment = testerForm.segment || 'closed-beta') => {
    const url = buildInviteUrl(origin || window.location.origin, inviteCode, segment);
    await navigator.clipboard.writeText(url);
    toast('封測邀請連結已複製');
  };

  const saveTester = async (lastContactedAt?: string) => {
    if (!selectedRow || savingTester) return;
    setSavingTester(true);
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_upsert_beta_tester', {
      p_user_id: selectedRow.userId,
      p_status: testerForm.status,
      p_segment: testerForm.segment,
      p_invite_code: testerForm.invite_code || DEFAULT_INVITE_CODE,
      p_invite_source: testerForm.invite_source || 'admin',
      p_preferred_contact: testerForm.preferred_contact || null,
      p_notes: testerForm.notes || null,
      p_feedback_summary: testerForm.feedback_summary || null,
      p_last_contacted_at: lastContactedAt ?? null,
    });
    setSavingTester(false);

    if (error) {
      toast(error.message, 'error');
      return;
    }

    toast(lastContactedAt ? '已標記聯絡時間' : '測試者資料已更新');
    await loadTesters();
  };

  const adjustPoints = async () => {
    if (!selectedRow || adjustingPoints) return;
    const amount = Number(pointAmount);
    if (!Number.isInteger(amount) || amount < 0 || (pointMode !== 'set' && amount <= 0)) {
      toast(pointMode === 'set' ? '設定餘額不可小於 0' : '補點或扣點必須大於 0', 'error');
      return;
    }
    if (!pointReason.trim()) {
      toast('請填寫點數調整原因', 'error');
      return;
    }

    setAdjustingPoints(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc('admin_adjust_member_points', {
      p_user_id: selectedRow.userId,
      p_mode: pointMode,
      p_amount: amount,
      p_reason: pointReason.trim(),
      p_metadata: { source: 'admin_testers_page' },
    });
    setAdjustingPoints(false);

    if (error) {
      toast(error.message, 'error');
      return;
    }

    const result = data as AdjustmentResult | null;
    toast(`點數已更新，目前餘額 ${result?.balance ?? '已重整'}`);
    await loadTesters();
  };

  return (
    <div className="space-y-6">
      <section className="mele-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mele-section-title">封測營運台</div>
            <div className="mele-section-subtitle">BETA TESTER OPS</div>
            <p className="max-w-3xl text-sm leading-loose text-white/68">
              管理測試者、邀請連結、點數補發、每日領點、解鎖紀錄與回饋備註。這一頁是給你發測試連結後，每天早上快速掌握封測狀態用的。
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" className="mele-btn-primary" onClick={() => void copyInvite(DEFAULT_INVITE_CODE, 'closed-beta')}>
              複製通用邀請
            </button>
            <button type="button" className="mele-btn-secondary" onClick={() => void loadTesters()}>
              重新整理
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['測試者', stats.tracked],
          ['測試中', stats.active],
          ['今日已領點', stats.claimedToday],
          ['已有解鎖', stats.unlockedUsers],
          ['低於 100 點', stats.lowBalance],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-accent-dim bg-white/[0.04] p-4">
            <div className="text-xs tracking-[0.25em] text-white/45">{label}</div>
            <strong className="mt-2 block font-serif text-3xl text-accent">{Number(value).toLocaleString('zh-TW')}</strong>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <aside className="mele-card p-0 md:p-0">
          <div className="space-y-3 border-b border-accent-dim px-5 py-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="mele-input"
                placeholder="搜尋姓名、邀請碼、聯絡方式、備註"
              />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="mele-input sm:w-44">
                <option value="all">全部</option>
                <option value="untracked">未標記</option>
                {Object.entries(STATUS_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-white/45">名單含最近會員與已標記的測試者；未標記會員可直接點選後建立封測紀錄。</p>
          </div>

          {loading && <div className="px-5 py-10 text-center text-sm text-white/58">讀取封測名單中...</div>}
          {!loading && filteredRows.length === 0 && <div className="px-5 py-10 text-center text-sm text-white/58">目前沒有符合條件的會員。</div>}
          {!loading && filteredRows.length > 0 && (
            <div className="max-h-[760px] overflow-y-auto">
              {filteredRows.map((row) => {
                const status = row.tester?.status;
                const latestUnlock = row.unlocks[0];
                return (
                  <button
                    key={row.userId}
                    type="button"
                    onClick={() => setSelectedId(row.userId)}
                    className={`block w-full border-b border-accent-dim/30 px-5 py-4 text-left transition-colors ${
                      selectedRow?.userId === row.userId ? 'bg-accent/12' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-serif text-xl text-white">{rowName(row)}</div>
                        <div className="mt-1 text-xs text-white/45">{shortId(row.userId)}</div>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs ${status ? STATUS_TONE[status] : 'border-white/15 bg-white/[0.03] text-white/45'}`}>
                        {status ? STATUS_LABEL[status] : '未標記'}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-white/54">
                      <span>{row.wallet?.balance ?? 0} 點</span>
                      <span>{row.claims.length} 次領點</span>
                      <span>{row.unlocks.length} 次解鎖</span>
                    </div>
                    {latestUnlock && (
                      <div className="mt-2 truncate text-xs text-accent/80">
                        最近解鎖：{TOOL_LABEL[latestUnlock.tool] ?? latestUnlock.tool} / {latestUnlock.unlock_type}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {selectedRow && (
          <div className="space-y-5">
            <section className="mele-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-xs tracking-[0.35em] text-accent">TESTER</div>
                  <h2 className="mt-2 font-serif text-3xl text-white">{rowName(selectedRow)}</h2>
                  <p className="mt-2 text-xs text-white/48">{selectedRow.userId}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg border border-accent-dim bg-white/[0.04] px-4 py-3">
                    <div className="text-xs text-white/45">餘額</div>
                    <strong className="font-serif text-2xl text-accent">{selectedRow.wallet?.balance ?? 0}</strong>
                  </div>
                  <div className="rounded-lg border border-accent-dim bg-white/[0.04] px-4 py-3">
                    <div className="text-xs text-white/45">領點</div>
                    <strong className="font-serif text-2xl text-white">{selectedRow.claims.length}</strong>
                  </div>
                  <div className="rounded-lg border border-accent-dim bg-white/[0.04] px-4 py-3">
                    <div className="text-xs text-white/45">解鎖</div>
                    <strong className="font-serif text-2xl text-white">{selectedRow.unlocks.length}</strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="mele-card">
                <div className="mele-section-title">測試者設定</div>
                <div className="mele-section-subtitle">TESTER PROFILE</div>
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="mele-label">
                      狀態
                      <select value={testerForm.status} onChange={(event) => setTesterForm((form) => ({ ...form, status: event.target.value as BetaTesterStatus }))} className="mele-input mt-2">
                        {Object.entries(STATUS_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="mele-label">
                      分群
                      <input value={testerForm.segment} onChange={(event) => setTesterForm((form) => ({ ...form, segment: event.target.value }))} className="mele-input mt-2" placeholder="friends / teacher / vip" />
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="mele-label">
                      邀請碼
                      <input value={testerForm.invite_code} onChange={(event) => setTesterForm((form) => ({ ...form, invite_code: event.target.value }))} className="mele-input mt-2" />
                    </label>
                    <label className="mele-label">
                      聯絡方式
                      <input value={testerForm.preferred_contact} onChange={(event) => setTesterForm((form) => ({ ...form, preferred_contact: event.target.value }))} className="mele-input mt-2" placeholder="LINE / IG / Email" />
                    </label>
                  </div>
                  <label className="mele-label">
                    內部備註
                    <textarea value={testerForm.notes} onChange={(event) => setTesterForm((form) => ({ ...form, notes: event.target.value }))} className="mele-input mt-2 min-h-28 resize-y" placeholder="例：想測塔羅、對瑪雅曆有興趣、需要補點" />
                  </label>
                  <label className="mele-label">
                    回饋摘要
                    <textarea value={testerForm.feedback_summary} onChange={(event) => setTesterForm((form) => ({ ...form, feedback_summary: event.target.value }))} className="mele-input mt-2 min-h-28 resize-y" placeholder="例：首頁看懂、登入卡住、想要更白話的解釋" />
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <button type="button" onClick={() => void saveTester()} disabled={savingTester} className="mele-btn-primary sm:col-span-2">
                      {savingTester ? '儲存中...' : '儲存測試者'}
                    </button>
                    <button type="button" onClick={() => void saveTester(new Date().toISOString())} disabled={savingTester} className="mele-btn-secondary">
                      已聯絡
                    </button>
                  </div>
                  <button type="button" onClick={() => void copyInvite()} className="mele-btn-secondary w-full">
                    複製此邀請連結
                  </button>
                </div>
              </div>

              <div className="mele-card">
                <div className="mele-section-title">封測點數</div>
                <div className="mele-section-subtitle">POINT SUPPORT</div>
                <div className="space-y-4">
                  <div className="rounded-lg border border-accent-dim bg-black/20 p-4 text-sm leading-loose text-white/68">
                    每日可領 200 點；每次詳解、流日、流月、流年解鎖需 100 點。若測試者卡住，先補 200 或 500 點最直覺。
                  </div>
                  <label className="mele-label">
                    調整方式
                    <select value={pointMode} onChange={(event) => setPointMode(event.target.value as AdminPointAdjustmentMode)} className="mele-input mt-2">
                      {Object.entries(POINT_MODE_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="mele-label">
                    點數
                    <input type="number" min={pointMode === 'set' ? 0 : 1} value={pointAmount} onChange={(event) => setPointAmount(event.target.value)} className="mele-input mt-2" />
                  </label>
                  <label className="mele-label">
                    原因
                    <input value={pointReason} onChange={(event) => setPointReason(event.target.value)} className="mele-input mt-2" />
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <button type="button" onClick={() => { setPointMode('credit'); setPointAmount('200'); setPointReason('封測補點'); }} className="mele-btn-secondary">
                      +200
                    </button>
                    <button type="button" onClick={() => { setPointMode('credit'); setPointAmount('500'); setPointReason('封測深度測試補點'); }} className="mele-btn-secondary">
                      +500
                    </button>
                    <button type="button" onClick={() => void adjustPoints()} disabled={adjustingPoints} className="mele-btn-primary">
                      {adjustingPoints ? '處理中...' : '送出'}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="mele-card">
                <div className="mele-section-title">近期行為</div>
                <div className="mele-section-subtitle">ACTIVITY</div>
                <div className="space-y-3">
                  <div className="rounded-lg border border-accent-dim/60 bg-black/20 p-4 text-sm text-white/68">
                    邀請：{selectedRow.tester?.invite_code ?? '尚未標記'} · 最近聯絡：{formatDateTime(selectedRow.tester?.last_contacted_at)}
                  </div>
                  {selectedRow.transactions.slice(0, 8).map((transaction) => (
                    <div key={transaction.id} className="rounded-lg border border-accent-dim/60 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <strong className={transaction.direction === 'credit' ? 'text-emerald-300' : 'text-rose-300'}>
                          {transaction.direction === 'credit' ? '+' : '-'}
                          {transaction.amount} 點
                        </strong>
                        <span className="text-xs text-white/45">{formatDateTime(transaction.created_at)}</span>
                      </div>
                      <p className="mt-2 text-sm text-white/64">{transaction.reason}</p>
                    </div>
                  ))}
                  {selectedRow.transactions.length === 0 && <p className="text-sm text-white/58">尚無點數流水。</p>}
                </div>
              </div>

              <div className="mele-card">
                <div className="mele-section-title">解鎖紀錄</div>
                <div className="mele-section-subtitle">UNLOCKS</div>
                <div className="space-y-3">
                  {selectedRow.unlocks.slice(0, 10).map((unlock) => (
                    <div key={unlock.id} className="rounded-lg border border-accent-dim/60 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <strong className="text-accent">{TOOL_LABEL[unlock.tool] ?? unlock.tool}</strong>
                        <span className="text-xs text-white/45">{unlock.cost_points} 點</span>
                      </div>
                      <p className="mt-2 text-sm text-white/64">{unlock.unlock_type}</p>
                      <p className="mt-1 break-all text-xs text-white/45">{unlock.scope_key}</p>
                    </div>
                  ))}
                  {selectedRow.unlocks.length === 0 && <p className="text-sm text-white/58">尚未解鎖付點內容。</p>}
                </div>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
