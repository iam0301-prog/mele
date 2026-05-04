'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { ToolError, ToolLoading } from '@/components/ToolFeedback';
import { ToolResultSection } from '@/components/ToolResultSection';
import { useToast } from '@/components/ToastProvider';
import { calc, CalcError, type CalcResponse } from '@/lib/api';
import {
  buildDailyReading,
  hashToSeed,
  localDrawKey,
  taipeiDateKey,
  type DailyDrawTool,
  type DailyReading,
} from '@/lib/daily-ritual';

const LineLiffPanel = dynamic(
  () => import('@/components/LineLiffPanel').then((module) => module.LineLiffPanel),
  { ssr: false, loading: () => <div className="ritual-panel min-h-48" /> },
);

interface ProfileLite {
  display_name: string | null;
  birth_date: string | null;
}

type Draws = Partial<Record<DailyDrawTool, CalcResponse>>;
type LoadingDraws = Partial<Record<DailyDrawTool, boolean>>;

const DAILY_DRAW_EXPLANATIONS = {
  tarot: {
    title: '每日塔羅',
    body: '一天一次的牌面提醒，適合看今日情緒、事件主題與可採取的行動。抽到後會保留在本日紀錄中，不需要反覆重抽。',
  },
  runes: {
    title: '每日盧恩',
    body: '一天一次的符文提醒，適合看阻礙、資源與下一步。盧恩的語氣通常更直接，適合當作今日行動咒語。',
  },
} satisfies Record<DailyDrawTool, { title: string; body: string }>;

function drawTitle(tool: DailyDrawTool, response?: CalcResponse) {
  if (!response) return tool === 'tarot' ? '尚未抽塔羅' : '尚未抽盧恩';
  if (tool === 'tarot') {
    const first = (response.data.cards as Array<{ card?: { name_zh?: string; name_en?: string }; position?: string }> | undefined)?.[0];
    return `${first?.card?.name_zh || first?.card?.name_en || '今日塔羅'} / ${first?.position === 'reversed' ? '逆位' : '正位'}`;
  }
  const first = (response.data.runes as Array<{ rune?: { glyph?: string; name?: string; zh?: string }; position?: string }> | undefined)?.[0];
  return `${first?.rune?.glyph || 'ᚱ'} ${first?.rune?.zh || first?.rune?.name || '今日盧恩'} / ${first?.position === 'reversed' ? '逆位' : '正位'}`;
}

function restoreResponse(tool: DailyDrawTool, date: string, row: { result_data: unknown; render_data: unknown; created_at?: string }) {
  return {
    tool,
    version: 'stored',
    computed_at: row.created_at || new Date().toISOString(),
    input: { daily: true, date },
    data: (row.result_data || {}) as Record<string, unknown>,
    render: (row.render_data || {}) as CalcResponse['render'],
  } satisfies CalcResponse;
}

export default function DailyRitualPage() {
  const toast = useToast();
  const dateKey = useMemo(() => taipeiDateKey(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [reading, setReading] = useState<DailyReading>(() => buildDailyReading(dateKey));
  const [draws, setDraws] = useState<Draws>({});
  const [loadingDraws, setLoadingDraws] = useState<LoadingDraws>({});
  const [activeResult, setActiveResult] = useState<CalcResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedDailyDraw = draws.tarot ? 'tarot' : draws.runes ? 'runes' : null;
  const hasAnyDailyDraw = Boolean(selectedDailyDraw);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData.user;

      if (!currentUser) {
        const next: Draws = {};
        const tarotRaw = window.localStorage.getItem(localDrawKey('tarot', dateKey));
        const runesRaw = window.localStorage.getItem(localDrawKey('runes', dateKey));
        if (tarotRaw) next.tarot = JSON.parse(tarotRaw) as CalcResponse;
        else if (runesRaw) next.runes = JSON.parse(runesRaw) as CalcResponse;
        if (!cancelled) {
          setReading(buildDailyReading(dateKey, 'guest'));
          setDraws(next);
        }
        return;
      }

      setUserId(currentUser.id);
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('display_name, birth_date')
        .eq('id', currentUser.id)
        .maybeSingle();

      const profileLite = (profileRow as ProfileLite | null) ?? {
        display_name: currentUser.email ?? null,
        birth_date: null,
      };
      const identity = `${currentUser.id}:${profileLite.birth_date || ''}`;
      const daily = buildDailyReading(dateKey, identity);

      await supabase.from('daily_readings').upsert({
        user_id: currentUser.id,
        reading_date: dateKey,
        locale: 'zh-TW',
        source_tools: ['tarot', 'runes'],
        signals: { seed: hashToSeed(identity), tone: daily.tone },
        summary: daily.summary,
        sections: daily.sections,
        ritual_prompt: daily.ritual,
      }, { onConflict: 'user_id,reading_date,locale' });

      const { data: drawRows } = await supabase
        .from('daily_draws')
        .select('tool, result_data, render_data, created_at')
        .eq('user_id', currentUser.id)
        .eq('draw_date', dateKey);

      const restored: Draws = {};
      ((drawRows || []) as Array<{ tool: DailyDrawTool; result_data: unknown; render_data: unknown; created_at?: string }>).forEach((row) => {
        restored[row.tool] = restoreResponse(row.tool, dateKey, row);
      });

      if (!cancelled) {
        setProfile(profileLite);
        setReading(daily);
        setDraws(restored);
      }
    }

    boot().catch((err: Error) => {
      if (!cancelled) setError(err.message);
    });

    return () => {
      cancelled = true;
    };
  }, [dateKey]);

  const drawDaily = async (tool: DailyDrawTool) => {
    if (draws[tool]) {
      setActiveResult(draws[tool] ?? null);
      toast(tool === 'tarot' ? '今日塔羅已抽過，為你打開本日結果。' : '今日盧恩已抽過，為你打開本日結果。');
      return;
    }

    if (hasAnyDailyDraw) {
      toast(`今天已選擇${selectedDailyDraw === 'tarot' ? '每日塔羅' : '每日盧恩'}，每天只能選擇塔羅或盧恩其中一種。`, 'error');
      return;
    }

    setLoadingDraws((prev) => ({ ...prev, [tool]: true }));
    setError(null);

    try {
      const seed = hashToSeed(`${userId || 'guest'}:${dateKey}:${tool}`);
      const response = await calc(tool, tool === 'tarot'
        ? { count: 1, reversed: true, reversed_enabled: true, spread: 'single', question: '今日指引', seed, tarot_style: 'ocean_poseidon' }
        : { count: 1, reversed: true, reversed_enabled: true, spread: 'single', material: 'stone', question: '今日指引', seed });

      if (userId) {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        await supabase.from('daily_draws').insert({
          user_id: userId,
          draw_date: dateKey,
          tool,
          seed: String(seed),
          question: '今日指引',
          result_data: response.data,
          render_data: response.render,
        });
      } else {
        window.localStorage.setItem(localDrawKey(tool, dateKey), JSON.stringify(response));
      }

      setDraws((prev) => ({ ...prev, [tool]: response }));
      setActiveResult(response);
    } catch (err) {
      const message = err instanceof CalcError ? err.message : (err as Error).message;
      setError(message);
      toast(message, 'error');
    } finally {
      setLoadingDraws((prev) => ({ ...prev, [tool]: false }));
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1a2438_0%,#070b12_46%,#030406_100%)]">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-20 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="ritual-hero">
            <div className="ritual-kicker">DAILY ORACLE CENTER</div>
            <h1>每日儀式中心</h1>
            <p>
              {profile?.display_name ? `${profile.display_name}，` : ''}
              這裡每天為你整理一則能量提醒，並保留一次塔羅與一次盧恩抽取。登入 LINE 後，可把每日解讀延伸成回訪習慣。
            </p>
            <div className="ritual-hero__actions">
              <button type="button" onClick={() => drawDaily('tarot')} className="mele-btn-primary" disabled={loadingDraws.tarot || (hasAnyDailyDraw && !draws.tarot)}>
                {draws.tarot ? '查看今日塔羅' : '抽今日塔羅'}
              </button>
              <button type="button" onClick={() => drawDaily('runes')} className="mele-btn-secondary" disabled={loadingDraws.runes || (hasAnyDailyDraw && !draws.runes)}>
                {draws.runes ? '查看今日盧恩' : '抽今日盧恩'}
              </button>
            </div>
            <p className="ritual-line-link">
              每天只能選擇塔羅或盧恩其中一種；今天已選擇後，可以不限次回看該結果。
            </p>
            {!userId && (
              <Link href="/account/login" className="ritual-line-link">
                使用 LINE 登入後，可以保存每日結果並開啟推播提醒。
              </Link>
            )}
          </div>

          <aside className="ritual-panel">
            <div className="ritual-kicker">AR 結果展示</div>
            <h2>抽到後才進入 AR 呈現</h2>
            <p className="ritual-summary">
              AR 不放在首頁當裝飾，而是放在解讀結果後。當你完成每日塔羅或盧恩，牌面、符文、材質與重點訊息會一起進入 3D/AR 展示。
            </p>
          </aside>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="ritual-panel md:col-span-2">
            <div className="ritual-kicker">{reading.date}</div>
            <h2>{reading.title}</h2>
            <p className="ritual-summary">{reading.summary}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <span>今日焦點</span>
                <p>{reading.focus}</p>
              </div>
              <div>
                <span>避免耗能</span>
                <p>{reading.avoid}</p>
              </div>
              <div>
                <span>儀式提示</span>
                <p>{reading.ritual}</p>
              </div>
            </div>
          </article>

          <LineLiffPanel compact />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {(['tarot', 'runes'] as DailyDrawTool[]).map((tool) => (
            <article key={tool} className="ritual-draw-card">
              <div>
                <div className="ritual-kicker">{tool === 'tarot' ? 'DAILY TAROT' : 'DAILY RUNE'}</div>
                <h2>{drawTitle(tool, draws[tool])}</h2>
                <p>{DAILY_DRAW_EXPLANATIONS[tool].body}</p>
              </div>
              <button
                type="button"
                onClick={() => drawDaily(tool)}
                className="mele-btn-primary"
                disabled={loadingDraws[tool] || (hasAnyDailyDraw && !draws[tool])}
              >
                {loadingDraws[tool] ? '抽取中' : draws[tool] ? '查看結果' : tool === 'tarot' ? '抽牌' : '抽符文'}
              </button>
              {hasAnyDailyDraw && !draws[tool] && (
                <p className="ritual-draw-card__locked">
                  今天已選擇{selectedDailyDraw === 'tarot' ? '每日塔羅' : '每日盧恩'}，明天再回來選另一種。
                </p>
              )}
            </article>
          ))}
        </section>

        {loadingDraws.tarot || loadingDraws.runes ? <ToolLoading label="正在整理今日訊息..." /> : null}
        {error && <ToolError message={error} />}
        {activeResult && (
          <ToolResultSection
            kind={activeResult.tool}
            result={activeResult}
            showAr={activeResult.tool === 'tarot' || activeResult.tool === 'runes'}
          />
        )}

        <section className="ritual-panel">
          <div className="ritual-kicker">READING MAP</div>
          <h2>今日三段式解讀</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {reading.sections.map((section) => (
              <div key={section.title} className="ritual-note">
                <h3>{section.title}</h3>
                <p>{section.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="ritual-panel">
          <div className="ritual-kicker">DAILY FEATURE GUIDE</div>
          <h2>每日功能怎麼使用</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="ritual-note">
              <h3>每日解讀</h3>
              <p>每日解讀提供今天的主題、避免耗能的方向與簡短儀式，適合早上查看，晚上回顧。</p>
            </div>
            <div className="ritual-note">
              <h3>{DAILY_DRAW_EXPLANATIONS.tarot.title}</h3>
              <p>{DAILY_DRAW_EXPLANATIONS.tarot.body}</p>
            </div>
            <div className="ritual-note">
              <h3>{DAILY_DRAW_EXPLANATIONS.runes.title}</h3>
              <p>{DAILY_DRAW_EXPLANATIONS.runes.body}</p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
