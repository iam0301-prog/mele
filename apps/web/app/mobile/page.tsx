'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToolError, ToolLoading } from '@/components/ToolFeedback';
import { ToolResultSection } from '@/components/ToolResultSection';
import { calc, CalcError, type CalcResponse } from '@/lib/api';
import {
  buildDailyReading,
  hashToSeed,
  localDrawKey,
  taipeiDateKey,
  type DailyDrawTool,
} from '@/lib/daily-ritual';
import { DEMO_TEACHERS, DEMO_TEACHER_SERVICES, isDemoTeacherId } from '@/lib/demo-teachers';
import {
  MATCH_BUDGETS,
  MATCH_DURATIONS,
  MATCH_STYLES,
  MATCH_TOOLS,
  MATCH_TOPICS,
  defaultMatchAnswers,
  rankTeacherMatches,
  serializeMatchResults,
} from '@/lib/teacher-matching';
import { createClient } from '@/lib/supabase/client';
import type { MatchAnswers, Teacher, TeacherMatchResult, TeacherService } from '@/types/db';

type Draws = Partial<Record<DailyDrawTool, CalcResponse>>;
type LoadingDraws = Partial<Record<DailyDrawTool, boolean>>;
type MobileTab = 'daily' | 'match' | 'ar' | 'teachers';
type MobileTarotStyle = 'ocean_poseidon';
type MobileRuneMaterial = 'stone' | 'wood' | 'crystal';

const MOBILE_TAROT_STYLES: Array<{ value: MobileTarotStyle; label: string; hint: string }> = [
  { value: 'ocean_poseidon', label: '大海波賽頓', hint: '第一套正式插畫牌組' },
];

const MOBILE_RUNE_MATERIALS: Array<{ value: MobileRuneMaterial; label: string; hint: string }> = [
  { value: 'stone', label: '石面', hint: '穩定、沉著、現實提醒' },
  { value: 'wood', label: '木頭', hint: '生長、選擇、自然節奏' },
  { value: 'crystal', label: '水晶', hint: '清明、淨化、能量聚焦' },
];

const MATCH_STEP_TITLES = ['你的問題', '命理形式', '老師風格', '預算時間', '補充描述'];

function getLocalDraw(tool: DailyDrawTool, dateKey: string) {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(localDrawKey(tool, dateKey));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CalcResponse;
  } catch {
    return null;
  }
}

function resultName(tool: DailyDrawTool, result?: CalcResponse) {
  if (!result) return tool === 'tarot' ? '今日牌面養分尚未領取' : '今日石面養分尚未領取';
  if (tool === 'tarot') {
    const first = (result.data.cards as Array<{ card?: { name_zh?: string; name_en?: string }; position?: string }> | undefined)?.[0];
    return `${first?.card?.name_zh || first?.card?.name_en || '今日塔羅'} / ${first?.position === 'reversed' ? '逆位' : '正位'}`;
  }
  const first = (result.data.runes as Array<{ rune?: { glyph?: string; name?: string; zh?: string }; position?: string }> | undefined)?.[0];
  return `${first?.rune?.glyph || '符文'} ${first?.rune?.zh || first?.rune?.name || '今日盧恩'} / ${first?.position === 'reversed' ? '逆位' : '正位'}`;
}

function compactRankedResults(results: TeacherMatchResult[]) {
  return serializeMatchResults(results.slice(0, 10));
}

export default function MobilePage() {
  const router = useRouter();
  const dateKey = useMemo(() => taipeiDateKey(), []);
  const reading = useMemo(() => buildDailyReading(dateKey, 'mobile-preview'), [dateKey]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [tab, setTab] = useState<MobileTab>('daily');
  const [draws, setDraws] = useState<Draws>(() => {
    const tarot = getLocalDraw('tarot', dateKey);
    if (tarot) return { tarot };
    const runes = getLocalDraw('runes', dateKey);
    return runes ? { runes } : {};
  });
  const [loading, setLoading] = useState<LoadingDraws>({});
  const [activeResult, setActiveResult] = useState<CalcResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tarotStyle, setTarotStyle] = useState<MobileTarotStyle>('ocean_poseidon');
  const [runeMaterial, setRuneMaterial] = useState<MobileRuneMaterial>('stone');

  const [matchStep, setMatchStep] = useState(1);
  const [answers, setAnswers] = useState<MatchAnswers>(() => defaultMatchAnswers());
  const [matchCompleted, setMatchCompleted] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [services, setServices] = useState<TeacherService[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchNotice, setMatchNotice] = useState<string | null>(null);
  const selectedDailyDraw = draws.tarot ? 'tarot' : draws.runes ? 'runes' : null;
  const hasAnyDailyDraw = Boolean(selectedDailyDraw);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadTeachers() {
      setMatchLoading(true);
      const supabase = createClient();
      const { data: teacherRows } = await supabase
        .from('teachers')
        .select('*')
        .eq('status', 'active')
        .order('rating', { ascending: false });

      const activeTeachers = (teacherRows || []) as Teacher[];
      if (!activeTeachers.length) {
        if (!cancelled) {
          setTeachers(DEMO_TEACHERS);
          setServices(DEMO_TEACHER_SERVICES);
          setMatchLoading(false);
        }
        return;
      }

      const { data: serviceRows } = await supabase
        .from('teacher_services')
        .select('*')
        .in('teacher_id', activeTeachers.map((teacher) => teacher.id))
        .eq('is_active', true)
        .order('display_order');

      if (!cancelled) {
        setTeachers(activeTeachers);
        setServices((serviceRows || []) as TeacherService[]);
        setMatchLoading(false);
      }
    }

    loadTeachers().catch((err: Error) => {
      if (!cancelled) {
        setError(err.message);
        setMatchLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const rankedMatches = useMemo(
    () => rankTeacherMatches(teachers, services, answers),
    [teachers, services, answers],
  );

  useEffect(() => {
    if (tab !== 'ar') return undefined;
    const timer = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [tab, activeResult]);

  const openArResult = (response: CalcResponse) => {
    setActiveResult(response);
    setTab('ar');
  };

  const draw = async (tool: DailyDrawTool) => {
    if (draws[tool]) {
      openArResult(draws[tool]);
      return;
    }

    if (hasAnyDailyDraw) {
      setError(`今天已選擇${selectedDailyDraw === 'tarot' ? '每日塔羅' : '每日盧恩'}，每天只能選擇塔羅或盧恩其中一種。`);
      return;
    }

    setLoading((prev) => ({ ...prev, [tool]: true }));
    setError(null);

    try {
      const seed = hashToSeed(`mobile:${dateKey}:${tool}`);
      const response = await calc(tool, tool === 'tarot'
        ? { count: 1, reversed: true, reversed_enabled: true, spread: 'single', question: '今日指引', seed, tarot_style: tarotStyle }
        : { count: 1, reversed: true, reversed_enabled: true, spread: 'single', material: runeMaterial, question: '今日指引', seed });

      window.localStorage.setItem(localDrawKey(tool, dateKey), JSON.stringify(response));
      setDraws((prev) => ({ ...prev, [tool]: response }));
      openArResult(response);
    } catch (err) {
      setError(err instanceof CalcError ? err.message : (err as Error).message);
    } finally {
      setLoading((prev) => ({ ...prev, [tool]: false }));
    }
  };

  const updateAnswer = <K extends keyof MatchAnswers>(key: K, value: MatchAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setMatchNotice(null);
  };

  const saveMatch = async (result: TeacherMatchResult) => {
    if (isDemoTeacherId(result.teacher.id)) {
      setMatchNotice('目前顯示的是本機示範老師。正式上架老師後，登入即可保存真實諮詢引導紀錄。');
      return;
    }

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      router.push(`/account/login?return=${encodeURIComponent('/mobile')}`);
      return;
    }

    const { error: saveError } = await supabase.from('match_sessions').insert({
      user_id: user.id,
      answers,
      ranked_results: compactRankedResults(rankedMatches),
      selected_teacher_id: result.teacher.id,
    });

    if (saveError) {
      setMatchNotice(`保存失敗：${saveError.message}`);
      return;
    }
    setMatchNotice('已保存這次諮詢引導。你之後可以依照這份建議清單回來預約。');
  };

  const finishMatch = () => {
    setMatchCompleted(true);
    setMatchStep(5);
    setMatchNotice('諮詢建議已整理完成。下方清單會依你的答案排序，分數越高代表越接近你的需求。');
  };

  return (
    <main className="mobile-shell">
      <section className="mobile-app">
        <header className="mobile-topbar">
          <Link href="/" aria-label="回到首頁">MELE</Link>
          <span>{dateKey}</span>
        </header>

        {tab === 'daily' && (
          <>
            <section className="mobile-hero">
              <div className="ritual-kicker">MOBILE ORACLE APP</div>
              <h1>今日養分</h1>
              <p>{reading.summary}</p>
            </section>

            <section className="mobile-status-card">
              <span>今日主題</span>
              <h2>{reading.title}</h2>
              <p>{reading.focus}</p>
            </section>

            <section className="mobile-style-panel" aria-label="每日儀式視覺選擇">
              <div>
                <span>塔羅牌組風格</span>
                <div className="mobile-choice-row" role="radiogroup" aria-label="塔羅牌組風格">
                  {MOBILE_TAROT_STYLES.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className={tarotStyle === item.value ? 'is-selected' : ''}
                      onClick={() => setTarotStyle(item.value)}
                      disabled={Boolean(draws.tarot) || (hasAnyDailyDraw && selectedDailyDraw !== 'tarot')}
                      aria-pressed={tarotStyle === item.value}
                    >
                      <strong>{item.label}</strong>
                      <small>{item.hint}</small>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span>盧恩石面材質</span>
                <div className="mobile-choice-row" role="radiogroup" aria-label="盧恩石面材質">
                  {MOBILE_RUNE_MATERIALS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className={runeMaterial === item.value ? 'is-selected' : ''}
                      onClick={() => setRuneMaterial(item.value)}
                      disabled={Boolean(draws.runes) || (hasAnyDailyDraw && selectedDailyDraw !== 'runes')}
                      aria-pressed={runeMaterial === item.value}
                    >
                      <strong>{item.label}</strong>
                      <small>{item.hint}</small>
                    </button>
                  ))}
                </div>
              </div>
              <p>每日只能在塔羅與盧恩之間選一種；選定後可以不限次回看該結果，明天再重新選擇。</p>
            </section>

            <section className="mobile-action-grid">
              <button type="button" onClick={() => draw('tarot')} disabled={loading.tarot || (hasAnyDailyDraw && selectedDailyDraw !== 'tarot')}>
                <span>DAILY TAROT</span>
                <strong>{resultName('tarot', draws.tarot)}</strong>
                <small>領取今日牌面養分，先看圖像，再讀關鍵字，最後選一個今天能做到的小行動。</small>
              </button>
              <button type="button" onClick={() => draw('runes')} disabled={loading.runes || (hasAnyDailyDraw && selectedDailyDraw !== 'runes')}>
                <span>DAILY RUNE</span>
                <strong>{resultName('runes', draws.runes)}</strong>
                <small>領取今日石面養分，讓符文提醒你下一步的界線、節奏與行動方向。</small>
              </button>
            </section>
            {hasAnyDailyDraw && (
              <p className="mobile-daily-lock">
                今天已選擇{selectedDailyDraw === 'tarot' ? '每日塔羅' : '每日盧恩'}，另一個每日儀式會在明天開放。
              </p>
            )}

            {(loading.tarot || loading.runes) && <ToolLoading label="正在整理今日養分..." />}
            {error && <ToolError message={error} />}

            <section className="mobile-reading-list">
              {reading.sections.map((section) => (
                <article key={section.title}>
                  <span>{section.title}</span>
                  <p>{section.body}</p>
                </article>
              ))}
            </section>
          </>
        )}

        {tab === 'match' && (
          <section className="mobile-match">
            <div className="mobile-hero mobile-hero--compact">
              <div className="ritual-kicker">GUIDANCE PATH</div>
              <h1>諮詢引導</h1>
              <p>回答五個小問題，MELE 會依你的需求、工具偏好、老師風格、預算與信任指標，整理適合進一步諮詢的老師清單。</p>
            </div>

            <div className="mobile-match-steps" aria-label="諮詢引導進度">
              {MATCH_STEP_TITLES.map((title, index) => (
                <button
                  key={title}
                  type="button"
                  className={matchStep === index + 1 ? 'is-active' : ''}
                  onClick={() => setMatchStep(index + 1)}
                >
                  <span>{index + 1}</span>
                  {title}
                </button>
              ))}
            </div>

            <div className="mobile-match-panel">
              {matchStep === 1 && (
                <MatchChoiceGroup
                  title="你現在最想問什麼？"
                  items={MATCH_TOPICS}
                  value={answers.topic}
                  onChange={(value) => updateAnswer('topic', value)}
                />
              )}

              {matchStep === 2 && (
                <MatchChoiceGroup
                  title="你想用哪種命理切入？"
                  items={MATCH_TOOLS.map((item) => ({ ...item, hint: item.value === 'unsure' ? '讓系統依問題推薦方向' : '依老師專長比對' }))}
                  value={answers.tool}
                  onChange={(value) => updateAnswer('tool', value)}
                />
              )}

              {matchStep === 3 && (
                <MatchChoiceGroup
                  title="你喜歡哪種老師風格？"
                  items={MATCH_STYLES.map((item) => ({ ...item, hint: item.keywords.slice(0, 3).join('、') }))}
                  value={answers.style}
                  onChange={(value) => updateAnswer('style', value)}
                />
              )}

              {matchStep === 4 && (
                <div className="mobile-match-fieldset">
                  <span>預算與時間</span>
                  <div className="mobile-match-grid">
                    {MATCH_BUDGETS.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        className={answers.budget === item.value ? 'is-selected' : ''}
                        onClick={() => updateAnswer('budget', item.value)}
                      >
                        <strong>{item.label}</strong>
                        <small>依可預約服務價格比對</small>
                      </button>
                    ))}
                  </div>
                  <div className="mobile-match-grid mobile-match-grid--duration">
                    {MATCH_DURATIONS.map((duration) => (
                      <button
                        key={duration}
                        type="button"
                        className={answers.duration === duration ? 'is-selected' : ''}
                        onClick={() => updateAnswer('duration', duration)}
                      >
                        <strong>{duration} 分鐘</strong>
                        <small>{duration === 30 ? '快速聚焦' : duration === 60 ? '完整解讀' : '深度陪跑'}</small>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchStep === 5 && (
                <div className="mobile-match-fieldset">
                  <span>一句話描述問題</span>
                  <textarea
                    value={answers.question}
                    onChange={(event) => updateAnswer('question', event.target.value)}
                    className="mele-input"
                    rows={4}
                    maxLength={240}
                    placeholder="例如：我最近感情卡住，想知道該繼續等待還是往前走。"
                  />
                  <small>{answers.question.length}/240，選填，但會提高推薦精準度。</small>
                </div>
              )}

              <div className="mobile-match-actions">
                <button
                  type="button"
                  className="mele-btn-secondary"
                  disabled={matchStep <= 1}
                  onClick={() => setMatchStep((step) => Math.max(1, step - 1))}
                >
                  上一步
                </button>
                {matchStep < 5 ? (
                  <button type="button" className="mele-btn-primary" onClick={() => setMatchStep((step) => Math.min(5, step + 1))}>
                    下一步
                  </button>
                ) : (
                  <button type="button" className="mele-btn-primary" onClick={finishMatch}>
                    整理建議
                  </button>
                )}
              </div>
            </div>

            {matchNotice && <div className="mobile-match-notice">{matchNotice}</div>}
            {matchLoading && <ToolLoading label="正在讀取上架老師..." />}

            {matchCompleted && (
              <section className="mobile-match-results">
                <div className="mobile-match-results__header">
                  <span>諮詢建議</span>
                  <h2>依你的需求排序</h2>
                  <p>契合分數是輔助判斷，不保證諮詢結果。預約前仍建議看老師介紹、服務內容與退款規則。</p>
                </div>

                {rankedMatches.length === 0 && (
                  <div className="mobile-match-empty">
                    目前還沒有上架老師。你仍可以先保存需求，或稍後回到諮詢老師入口查看新名單。
                  </div>
                )}

                {rankedMatches.map((result, index) => (
                  <article key={result.teacher.id} className="mobile-match-card">
                    <div className="mobile-match-card__rank">
                      <span>#{index + 1}</span>
                      <strong>{result.score}% 契合</strong>
                      {result.closest && <em>目前最接近</em>}
                    </div>
                    <div className="mobile-match-card__avatar">{result.teacher.display_name.charAt(0)}</div>
                    <div className="mobile-match-card__body">
                      <h3>{result.teacher.display_name}</h3>
                      <p>{result.teacher.title || result.teacher.intro_short || '自我探索諮詢老師'}</p>
                      <div className="mobile-match-card__meta">
                        <span>評分 {Number(result.teacher.rating || 0).toFixed(1)}</span>
                        <span>{result.teacher.total_reviews || 0} 則評價</span>
                        <span>{result.teacher.cases_count || 0} 次案例</span>
                      </div>
                      <div className="mobile-match-card__tags">
                        {(result.teacher.specialties || []).slice(0, 4).map((item) => <span key={item}>{item}</span>)}
                      </div>
                      <ul>
                        {result.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                      </ul>
                      {result.service && (
                        <div className="mobile-match-card__service">
                          <span>{result.service.name}</span>
                          <strong>NT$ {result.service.price_ntd.toLocaleString('zh-TW')} / {result.service.duration_minutes} 分鐘</strong>
                        </div>
                      )}
                      <div className="mobile-match-card__actions">
                        <Link href={`/teachers/${result.teacher.id}`}>查看老師</Link>
                        {result.service ? (
                          <Link href={isDemoTeacherId(result.teacher.id) ? `/teachers/${result.teacher.id}` : `/account/book?teacher=${result.teacher.id}&service=${result.service.id}`}>
                            {isDemoTeacherId(result.teacher.id) ? '查看示範服務' : '預約這位老師'}
                          </Link>
                        ) : (
                          <Link href={`/teachers/${result.teacher.id}`}>查看服務</Link>
                        )}
                        <button type="button" onClick={() => saveMatch(result)}>保存這次建議</button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </section>
        )}

        {tab === 'ar' && (
          <>
            {activeResult ? (
              <ToolResultSection
                kind={activeResult.tool}
                result={activeResult}
                showAr={activeResult.tool === 'tarot' || activeResult.tool === 'runes'}
                arFirst
              />
            ) : (
              <section className="mobile-ar-card mobile-ar-card--waiting">
                <span>AR 養分空間</span>
                <h2>先領取牌面或石面養分</h2>
                <p>完成每日塔羅或盧恩後，這裡會把你的牌面、石面與重點訊息放進 3D/AR 空間，讓你用更立體的方式觀察今日訊息。</p>
              </section>
            )}
          </>
        )}

        {tab === 'teachers' && (
          <section className="mobile-teacher-gateway">
            <div className="mobile-hero mobile-hero--compact">
              <div className="ritual-kicker">CONSULTATION MARKET</div>
              <h1>老師中心</h1>
              <p>想直接看所有老師、服務價格與評價，可以進入完整老師列表。若你不確定該找誰，建議先回到「引導」完成建議清單。</p>
            </div>
            <Link href="/teachers" className="mele-btn-primary">查看所有老師</Link>
            <Link href="/teachers/apply" className="mele-btn-secondary">申請成為老師</Link>
          </section>
        )}

        <nav className="mobile-tabbar" aria-label="手機主功能">
          <button type="button" disabled={!isHydrated} className={tab === 'daily' ? 'is-active' : ''} onClick={() => setTab('daily')}>每日</button>
          <button type="button" disabled={!isHydrated} className={tab === 'match' ? 'is-active' : ''} onClick={() => setTab('match')}>引導</button>
          <button type="button" disabled={!isHydrated} className={tab === 'ar' ? 'is-active' : ''} onClick={() => setTab('ar')}>AR</button>
          <button type="button" disabled={!isHydrated} className={tab === 'teachers' ? 'is-active' : ''} onClick={() => setTab('teachers')}>老師</button>
        </nav>
      </section>
    </main>
  );
}

function MatchChoiceGroup<T extends string>({
  title,
  items,
  value,
  onChange,
}: {
  title: string;
  items: Array<{ value: T; label: string; hint?: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="mobile-match-fieldset">
      <span>{title}</span>
      <div className="mobile-match-grid">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            className={value === item.value ? 'is-selected' : ''}
            onClick={() => onChange(item.value)}
          >
            <strong>{item.label}</strong>
            {item.hint && <small>{item.hint}</small>}
          </button>
        ))}
      </div>
    </div>
  );
}
