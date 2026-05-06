'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';
import type {
  AdminPointAdjustmentMode,
  ContentUnlock,
  MemberWallet,
  PointTransaction,
  Profile,
} from '@/types/db';

type MemberRow = {
  profile: Profile;
  wallet: MemberWallet | null;
  transactions: PointTransaction[];
  unlocks: ContentUnlock[];
};

type ProfileForm = {
  display_name: string;
  bio: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  birth_timezone: string;
  gender: '男' | '女' | '其他' | '未填';
};

type AdjustmentResult = {
  adjusted?: boolean;
  balance?: number;
  delta?: number;
};

const POINT_MODE_LABEL: Record<AdminPointAdjustmentMode, string> = {
  credit: '加點',
  debit: '扣點',
  set: '設定餘額',
};

const UNLOCK_LABEL: Record<string, string> = {
  deep_reading: '詳解',
  transit_day: '流日',
  transit_month: '流月',
  transit_year: '流年',
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

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sanitizeSearchTerm(term: string) {
  return term.replace(/[,%()]/g, ' ').trim();
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

function shortId(id: string) {
  return `${id.slice(0, 8)}...${id.slice(-4)}`;
}

function timeForInput(value: string | null) {
  return value ? value.slice(0, 5) : '';
}

function profileToForm(profile: Profile): ProfileForm {
  return {
    display_name: profile.display_name ?? '',
    bio: profile.bio ?? '',
    birth_date: profile.birth_date ?? '',
    birth_time: timeForInput(profile.birth_time),
    birth_location: profile.birth_location ?? '',
    birth_timezone: profile.birth_timezone ?? '',
    gender: profile.gender ?? '未填',
  };
}

export default function AdminMembersPage() {
  const toast = useToast();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [adjustingPoints, setAdjustingPoints] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    display_name: '',
    bio: '',
    birth_date: '',
    birth_time: '',
    birth_location: '',
    birth_timezone: '',
    gender: '未填',
  });
  const [pointMode, setPointMode] = useState<AdminPointAdjustmentMode>('credit');
  const [pointAmount, setPointAmount] = useState('100');
  const [pointReason, setPointReason] = useState('');

  const selectedMember = useMemo(
    () => members.find((member) => member.profile.id === selectedId) ?? members[0] ?? null,
    [members, selectedId],
  );

  const loadMembers = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const term = sanitizeSearchTerm(search);

    let profileQuery = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(term ? 120 : 80);

    if (UUID_PATTERN.test(term)) {
      profileQuery = profileQuery.eq('id', term);
    } else if (term) {
      profileQuery = profileQuery.or(`display_name.ilike.%${term}%,bio.ilike.%${term}%,birth_location.ilike.%${term}%`);
    }

    const { data: profiles, error: profileError } = await profileQuery;
    if (profileError) {
      toast(profileError.message, 'error');
      setMembers([]);
      setLoading(false);
      return;
    }

    const typedProfiles = (profiles ?? []) as Profile[];
    const ids = typedProfiles.map((profile) => profile.id);

    if (ids.length === 0) {
      setMembers([]);
      setSelectedId(null);
      setLoading(false);
      return;
    }

    const [walletResult, transactionResult, unlockResult] = await Promise.all([
      supabase.from('member_wallets').select('*').in('user_id', ids),
      supabase.from('point_transactions').select('*').in('user_id', ids).order('created_at', { ascending: false }).limit(200),
      supabase.from('content_unlocks').select('*').in('user_id', ids).order('created_at', { ascending: false }).limit(200),
    ]);

    if (walletResult.error) toast(walletResult.error.message, 'error');
    if (transactionResult.error) toast(transactionResult.error.message, 'error');
    if (unlockResult.error) toast(unlockResult.error.message, 'error');

    const wallets = new Map((walletResult.data ?? []).map((wallet) => [(wallet as MemberWallet).user_id, wallet as MemberWallet]));
    const transactionsByUser = new Map<string, PointTransaction[]>();
    const unlocksByUser = new Map<string, ContentUnlock[]>();

    for (const transaction of (transactionResult.data ?? []) as PointTransaction[]) {
      transactionsByUser.set(transaction.user_id, [...(transactionsByUser.get(transaction.user_id) ?? []), transaction]);
    }

    for (const unlock of (unlockResult.data ?? []) as ContentUnlock[]) {
      unlocksByUser.set(unlock.user_id, [...(unlocksByUser.get(unlock.user_id) ?? []), unlock]);
    }

    const rows = typedProfiles.map((profile) => ({
      profile,
      wallet: wallets.get(profile.id) ?? null,
      transactions: transactionsByUser.get(profile.id) ?? [],
      unlocks: unlocksByUser.get(profile.id) ?? [],
    }));

    setMembers(rows);
    setSelectedId((current) => (current && rows.some((row) => row.profile.id === current) ? current : rows[0]?.profile.id ?? null));
    setLoading(false);
  }, [search, toast]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    if (selectedMember) {
      setProfileForm(profileToForm(selectedMember.profile));
      setPointReason('');
    }
  }, [selectedMember]);

  const saveProfile = async () => {
    if (!selectedMember || savingProfile) return;
    setSavingProfile(true);
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_update_member_profile', {
      p_user_id: selectedMember.profile.id,
      p_display_name: profileForm.display_name || null,
      p_bio: profileForm.bio || null,
      p_birth_date: profileForm.birth_date || null,
      p_birth_time: profileForm.birth_time || null,
      p_birth_location: profileForm.birth_location || null,
      p_birth_timezone: profileForm.birth_timezone || null,
      p_gender: profileForm.gender,
    });

    setSavingProfile(false);
    if (error) {
      toast(error.message, 'error');
      return;
    }

    toast('會員資料已更新');
    await loadMembers();
  };

  const adjustPoints = async () => {
    if (!selectedMember || adjustingPoints) return;
    const amount = Number(pointAmount);
    if (!Number.isInteger(amount) || amount < 0 || (pointMode !== 'set' && amount <= 0)) {
      toast(pointMode === 'set' ? '設定餘額不可小於 0' : '加扣點數必須大於 0', 'error');
      return;
    }

    if (!pointReason.trim()) {
      toast('請填寫調整原因，後續才查得到脈絡', 'error');
      return;
    }

    setAdjustingPoints(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc('admin_adjust_member_points', {
      p_user_id: selectedMember.profile.id,
      p_mode: pointMode,
      p_amount: amount,
      p_reason: pointReason.trim(),
      p_metadata: { source: 'admin_members_page' },
    });

    setAdjustingPoints(false);
    if (error) {
      toast(error.message, 'error');
      return;
    }

    const result = data as AdjustmentResult | null;
    toast(result?.adjusted === false ? '點數沒有變動' : `點數已更新，目前餘額 ${result?.balance ?? '已重整'}`);
    setPointReason('');
    await loadMembers();
  };

  return (
    <div className="space-y-6">
      <section className="mele-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mele-section-title">會員管理</div>
            <div className="mele-section-subtitle">MEMBER OPERATIONS</div>
            <p className="max-w-2xl text-sm leading-loose text-white/68">
              這裡可以看會員錢包、點數流水與內容解鎖紀錄；調整點數與整理帳號內容都會經過後端 RPC，保留管理員與原因紀錄。
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void loadMembers();
              }}
              className="mele-input min-w-0 sm:w-72"
              placeholder="搜尋姓名、出生地、備註或 UUID"
            />
            <button type="button" onClick={() => void loadMembers()} className="mele-btn-secondary">
              搜尋
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
        <aside className="mele-card p-0 md:p-0">
          <div className="border-b border-accent-dim px-5 py-4">
            <div className="text-sm font-bold tracking-[0.25em] text-accent">會員清單</div>
            <p className="mt-1 text-xs text-white/50">封測先顯示最近與搜尋命中的會員。</p>
          </div>

          {loading && <div className="px-5 py-10 text-center text-sm text-white/58">讀取會員資料中...</div>}
          {!loading && members.length === 0 && <div className="px-5 py-10 text-center text-sm text-white/58">目前沒有符合的會員。</div>}
          {!loading && members.length > 0 && (
            <div className="max-h-[680px] overflow-y-auto">
              {members.map((member) => {
                const isSelected = selectedMember?.profile.id === member.profile.id;
                return (
                  <button
                    key={member.profile.id}
                    type="button"
                    onClick={() => setSelectedId(member.profile.id)}
                    className={`block w-full border-b border-accent-dim/30 px-5 py-4 text-left transition-colors ${
                      isSelected ? 'bg-accent/12' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-serif text-xl text-white">{member.profile.display_name || '未命名會員'}</div>
                        <div className="mt-1 text-xs text-white/45">{shortId(member.profile.id)}</div>
                      </div>
                      <div className="rounded-full border border-accent-dim px-3 py-1 text-xs text-accent">
                        {member.wallet?.balance ?? 0} 點
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/52">
                      <span>{member.profile.birth_date ?? '未填生日'}</span>
                      <span className="truncate text-right">{member.profile.birth_location ?? '未填地點'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {selectedMember && (
          <div className="space-y-5">
            <section className="mele-card">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs tracking-[0.35em] text-accent">MEMBER</div>
                  <h2 className="mt-2 font-serif text-3xl text-white">{selectedMember.profile.display_name || '未命名會員'}</h2>
                  <p className="mt-2 text-xs text-white/48">{selectedMember.profile.id}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg border border-accent-dim bg-white/[0.04] px-4 py-3">
                    <div className="text-xs text-white/45">餘額</div>
                    <strong className="font-serif text-2xl text-accent">{selectedMember.wallet?.balance ?? 0}</strong>
                  </div>
                  <div className="rounded-lg border border-accent-dim bg-white/[0.04] px-4 py-3">
                    <div className="text-xs text-white/45">累計取得</div>
                    <strong className="font-serif text-2xl text-white">{selectedMember.wallet?.lifetime_earned ?? 0}</strong>
                  </div>
                  <div className="rounded-lg border border-accent-dim bg-white/[0.04] px-4 py-3">
                    <div className="text-xs text-white/45">累計使用</div>
                    <strong className="font-serif text-2xl text-white">{selectedMember.wallet?.lifetime_spent ?? 0}</strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <div className="mele-card">
                <div className="mele-section-title">點數設定</div>
                <div className="mele-section-subtitle">POINT ADJUSTMENT</div>
                <div className="space-y-4">
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
                    <input
                      type="number"
                      min={pointMode === 'set' ? 0 : 1}
                      value={pointAmount}
                      onChange={(event) => setPointAmount(event.target.value)}
                      className="mele-input mt-2"
                    />
                  </label>
                  <label className="mele-label">
                    調整原因
                    <textarea
                      value={pointReason}
                      onChange={(event) => setPointReason(event.target.value)}
                      className="mele-input mt-2 min-h-28 resize-y"
                      placeholder="例：封測補點、客服補償、誤扣修正"
                    />
                  </label>
                  <button type="button" onClick={() => void adjustPoints()} disabled={adjustingPoints} className="mele-btn-primary w-full">
                    {adjustingPoints ? '處理中...' : '送出點數調整'}
                  </button>
                </div>
              </div>

              <div className="mele-card">
                <div className="mele-section-title">帳號內容</div>
                <div className="mele-section-subtitle">PROFILE MAINTENANCE</div>
                <div className="space-y-4">
                  <label className="mele-label">
                    顯示名稱
                    <input
                      value={profileForm.display_name}
                      onChange={(event) => setProfileForm((form) => ({ ...form, display_name: event.target.value }))}
                      className="mele-input mt-2"
                    />
                  </label>
                  <label className="mele-label">
                    性別
                    <select
                      value={profileForm.gender}
                      onChange={(event) => setProfileForm((form) => ({ ...form, gender: event.target.value as ProfileForm['gender'] }))}
                      className="mele-input mt-2"
                    >
                      {['未填', '女', '男', '其他'].map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="mele-label">
                      出生日期
                      <input
                        type="date"
                        value={profileForm.birth_date}
                        onChange={(event) => setProfileForm((form) => ({ ...form, birth_date: event.target.value }))}
                        className="mele-input mt-2"
                      />
                    </label>
                    <label className="mele-label">
                      出生時間
                      <input
                        type="time"
                        value={profileForm.birth_time}
                        onChange={(event) => setProfileForm((form) => ({ ...form, birth_time: event.target.value }))}
                        className="mele-input mt-2"
                      />
                    </label>
                  </div>
                  <label className="mele-label">
                    出生地
                    <input
                      value={profileForm.birth_location}
                      onChange={(event) => setProfileForm((form) => ({ ...form, birth_location: event.target.value }))}
                      className="mele-input mt-2"
                      placeholder="例：台北市"
                    />
                  </label>
                  <label className="mele-label">
                    時區
                    <input
                      value={profileForm.birth_timezone}
                      onChange={(event) => setProfileForm((form) => ({ ...form, birth_timezone: event.target.value }))}
                      className="mele-input mt-2"
                      placeholder="例：Asia/Taipei"
                    />
                  </label>
                  <label className="mele-label">
                    內部備註 / 會員狀態
                    <textarea
                      value={profileForm.bio}
                      onChange={(event) => setProfileForm((form) => ({ ...form, bio: event.target.value }))}
                      className="mele-input mt-2 min-h-28 resize-y"
                    />
                  </label>
                  <button type="button" onClick={() => void saveProfile()} disabled={savingProfile} className="mele-btn-primary w-full">
                    {savingProfile ? '儲存中...' : '儲存會員資料'}
                  </button>
                </div>
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <div className="mele-card">
                <div className="mele-section-title">點數流水</div>
                <div className="mele-section-subtitle">RECENT TRANSACTIONS</div>
                {selectedMember.transactions.length === 0 ? (
                  <p className="text-sm text-white/58">尚無點數交易。</p>
                ) : (
                  <div className="space-y-3">
                    {selectedMember.transactions.slice(0, 10).map((transaction) => (
                      <div key={transaction.id} className="rounded-lg border border-accent-dim/60 bg-black/20 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <strong className={transaction.direction === 'credit' ? 'text-emerald-300' : 'text-rose-300'}>
                            {transaction.direction === 'credit' ? '+' : '-'}
                            {transaction.amount} 點
                          </strong>
                          <span className="text-xs text-white/45">{formatDateTime(transaction.created_at)}</span>
                        </div>
                        <p className="mt-2 text-sm text-white/68">{transaction.reason}</p>
                        <div className="mt-1 text-xs text-white/45">交易後餘額：{transaction.balance_after} 點</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mele-card">
                <div className="mele-section-title">解鎖紀錄</div>
                <div className="mele-section-subtitle">CONTENT UNLOCKS</div>
                {selectedMember.unlocks.length === 0 ? (
                  <p className="text-sm text-white/58">尚未解鎖任何詳解或流日、流月、流年內容。</p>
                ) : (
                  <div className="space-y-3">
                    {selectedMember.unlocks.slice(0, 12).map((unlock) => (
                      <div key={unlock.id} className="rounded-lg border border-accent-dim/60 bg-black/20 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <strong className="text-accent">
                            {TOOL_LABEL[unlock.tool] ?? unlock.tool} · {UNLOCK_LABEL[unlock.unlock_type] ?? unlock.unlock_type}
                          </strong>
                          <span className="text-xs text-white/45">{unlock.cost_points} 點</span>
                        </div>
                        <p className="mt-2 break-all text-xs text-white/52">{unlock.scope_key}</p>
                        <div className="mt-1 text-xs text-white/45">{formatDateTime(unlock.created_at)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
