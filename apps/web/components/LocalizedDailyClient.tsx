'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ToolError, ToolLoading } from '@/components/ToolFeedback';
import { ToolResultSection } from '@/components/ToolResultSection';
import { calc, type CalcResponse } from '@/lib/api';
import { hashToSeed, localDrawKey, taipeiDateKey, type DailyDrawTool } from '@/lib/daily-ritual';
import { localizePath, type Locale } from '@/lib/i18n/config';
import { getReleasePageCopy } from '@/lib/i18n/release-page-copy';

type Draws = Partial<Record<DailyDrawTool, CalcResponse>>;
type DailyReflection = { date: string; feeling: string; note: string; updatedAt: string };

const REFLECTION_PREFIX = 'mele:daily-reflection:';

function readReflection(dateKey: string): DailyReflection | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(`${REFLECTION_PREFIX}${dateKey}`);
    return raw ? JSON.parse(raw) as DailyReflection : null;
  } catch {
    return null;
  }
}

function readRecentReflections(): DailyReflection[] {
  if (typeof window === 'undefined') return [];
  const rows: DailyReflection[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(REFLECTION_PREFIX)) continue;
    try {
      const row = JSON.parse(window.localStorage.getItem(key) ?? '') as DailyReflection;
      if (row.date) rows.push(row);
    } catch { /* ignore a damaged local row */ }
  }
  return rows.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
}

function readStoredDraw(tool: DailyDrawTool, dateKey: string) {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(localDrawKey(tool, dateKey));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CalcResponse;
  } catch {
    return null;
  }
}

export function LocalizedDailyClient({ locale }: { locale: Locale }) {
  const copy = getReleasePageCopy(locale).daily;
  const dateKey = useMemo(() => taipeiDateKey(), []);
  const [draws, setDraws] = useState<Draws>(() => {
    const tarot = readStoredDraw('tarot', dateKey);
    if (tarot) return { tarot };
    const runes = readStoredDraw('runes', dateKey);
    return runes ? { runes } : {};
  });
  const [active, setActive] = useState<CalcResponse | null>(() => draws.tarot ?? draws.runes ?? null);
  const [loading, setLoading] = useState<DailyDrawTool | null>(null);
  const [error, setError] = useState('');
  const existingReflection = useMemo(() => readReflection(dateKey), [dateKey]);
  const [feeling, setFeeling] = useState(existingReflection?.feeling ?? '');
  const [reflectionNote, setReflectionNote] = useState(existingReflection?.note ?? '');
  const [reflectionSaved, setReflectionSaved] = useState(Boolean(existingReflection));
  const [recentReflections, setRecentReflections] = useState<DailyReflection[]>(() => readRecentReflections());

  const selected = draws.tarot ? 'tarot' : draws.runes ? 'runes' : null;

  async function draw(tool: DailyDrawTool) {
    if (draws[tool]) {
      setActive(draws[tool] ?? null);
      return;
    }
    if (selected) {
      setError(copy.oneChoice);
      return;
    }

    setLoading(tool);
    setError('');
    try {
      const seed = hashToSeed(`localized:${locale}:${dateKey}:${tool}`);
      const response = await calc(
        tool,
        tool === 'tarot'
          ? {
              count: 1,
              reversed: true,
              reversed_enabled: true,
              spread: 'single',
              question: copy.title,
              seed,
              tarot_style: 'ocean_poseidon',
            }
          : {
              count: 1,
              reversed: true,
              reversed_enabled: true,
              spread: 'single',
              material: 'stone',
              question: copy.title,
              seed,
            },
      );
      window.localStorage.setItem(localDrawKey(tool, dateKey), JSON.stringify(response));
      setDraws({ [tool]: response });
      setActive(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.error);
    } finally {
      setLoading(null);
    }
  }

  function saveReflection() {
    if (!feeling && !reflectionNote.trim()) return;
    const row: DailyReflection = { date: dateKey, feeling, note: reflectionNote.trim().slice(0, 500), updatedAt: new Date().toISOString() };
    window.localStorage.setItem(`${REFLECTION_PREFIX}${dateKey}`, JSON.stringify(row));
    setReflectionSaved(true);
    setRecentReflections(readRecentReflections());
  }

  return (
    <div className="mag-tool-page mag-daily-page">
      <main className="min-h-screen">
        <section className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-20 md:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="ritual-hero">
              <div className="mag-label ritual-kicker">{copy.kicker}</div>
              <h1 className="mag-daily-page__title">{copy.title}</h1>
              <p className="mag-daily-page__body">{copy.body}</p>
              <div className="ritual-hero__actions">
                <button
                  type="button"
                  onClick={() => draw('tarot')}
                  className="mele-btn-primary"
                  disabled={loading !== null || (selected !== null && selected !== 'tarot')}
                >
                  {draws.tarot ? copy.tarotDone : copy.tarot}
                </button>
                <button
                  type="button"
                  onClick={() => draw('runes')}
                  className="mele-btn-secondary"
                  disabled={loading !== null || (selected !== null && selected !== 'runes')}
                >
                  {draws.runes ? copy.runesDone : copy.runes}
                </button>
              </div>
              <p className="ritual-line-link mag-daily-page__body">{copy.oneChoice}</p>
            </div>

            <aside className="ritual-panel mag-daily-page__panel">
              <div className="mag-label ritual-kicker">{dateKey}</div>
              <h2 className="mag-daily-page__title">{copy.resultTitle}</h2>
              <p className="ritual-summary mag-daily-page__body">{copy.resultHint}</p>
              <div className="mt-5 grid gap-3">
                {copy.cards.map((card) => (
                  <div key={card.title} className="mag-daily-page__card rounded-xl p-4">
                    <strong className="mag-daily-page__card-title">{card.title}</strong>
                    <p className="mag-daily-page__body mt-2 text-sm leading-relaxed">{card.body}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          {loading && <ToolLoading label={copy.loading} locale={locale} />}
          {error && <ToolError message={error} locale={locale} />}
          {active && <ToolResultSection kind={active.tool as DailyDrawTool} result={active} locale={locale} />}

          {active && (
            <section className="daily-reflection" aria-labelledby="daily-reflection-title">
              <div>
                <span className="mag-label">{locale === 'zh-TW' ? '晚上回來看一眼' : 'Return this evening'}</span>
                <h2 id="daily-reflection-title">{locale === 'zh-TW' ? '今天，你有在哪一刻注意到自己？' : 'When did you notice yourself today?'}</h2>
                <p>{locale === 'zh-TW' ? '不用寫日記。選一個感受，再留一句真正發生的事。' : 'No long journal. Choose a feeling and note one real moment.'}</p>
              </div>
              <div className="daily-reflection__feelings" role="group" aria-label={locale === 'zh-TW' ? '今天的感受' : 'Today’s feeling'}>
                {(locale === 'zh-TW' ? ['有做到', '有注意到', '還在卡住'] : ['I did it', 'I noticed it', 'Still stuck']).map((label) => (
                  <button key={label} type="button" aria-pressed={feeling === label} onClick={() => { setFeeling(label); setReflectionSaved(false); }}>{label}</button>
                ))}
              </div>
              <label>
                <span>{locale === 'zh-TW' ? '只寫一句就好' : 'One sentence is enough'}</span>
                <textarea value={reflectionNote} maxLength={500} onChange={(event) => { setReflectionNote(event.target.value); setReflectionSaved(false); }} placeholder={locale === 'zh-TW' ? '例如：今天開會時，我沒有立刻答應不合理的要求。' : 'For example: I paused before saying yes in today’s meeting.'} />
              </label>
              <button className="daily-reflection__save" type="button" onClick={saveReflection} disabled={!feeling && !reflectionNote.trim()}>
                {reflectionSaved ? (locale === 'zh-TW' ? '已保存今天的回顧' : 'Saved today') : (locale === 'zh-TW' ? '保存今天的回顧' : 'Save reflection')}
              </button>
              {recentReflections.length > 0 && (
                <div className="daily-reflection__trail">
                  <strong>{locale === 'zh-TW' ? '最近七次回顧' : 'Your last seven reflections'}</strong>
                  <ol>{recentReflections.map((row) => <li key={row.date}><time>{row.date}</time><span>{row.feeling || row.note}</span></li>)}</ol>
                </div>
              )}
              <small>{locale === 'zh-TW' ? '封測期間先保存在這台裝置，不會公開或出現在分享內容。' : 'Stored on this device during beta and never included in shared content.'}</small>
            </section>
          )}

          <div className="flex flex-wrap gap-3">
            <Link href={localizePath('/tools', locale)} className="mele-btn-secondary">
              {getReleasePageCopy(locale).mobile.secondary}
            </Link>
            <Link href={localizePath('/teachers', locale)} className="mag-daily-page__link">
              {getReleasePageCopy(locale).mobile.panels[2]?.action ?? 'Find guidance'}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
