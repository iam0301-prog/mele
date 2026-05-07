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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1a2438_0%,#070b12_46%,#030406_100%)]">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-20 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="ritual-hero">
            <div className="ritual-kicker">{copy.kicker}</div>
            <h1>{copy.title}</h1>
            <p>{copy.body}</p>
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
            <p className="ritual-line-link">{copy.oneChoice}</p>
          </div>

          <aside className="ritual-panel">
            <div className="ritual-kicker">{dateKey}</div>
            <h2>{copy.resultTitle}</h2>
            <p className="ritual-summary">{copy.resultHint}</p>
            <div className="mt-5 grid gap-3">
              {copy.cards.map((card) => (
                <div key={card.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <strong className="text-accent">{card.title}</strong>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{card.body}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {loading && <ToolLoading label={copy.loading} locale={locale} />}
        {error && <ToolError message={error} locale={locale} />}
        {active && <ToolResultSection kind={active.tool as DailyDrawTool} result={active} locale={locale} />}

        <div className="flex flex-wrap gap-3">
          <Link href={localizePath('/tools', locale)} className="mele-btn-secondary">
            {getReleasePageCopy(locale).mobile.secondary}
          </Link>
          <Link href={localizePath('/teachers', locale)} className="home-ghost-link">
            {getReleasePageCopy(locale).mobile.panels[2]?.action ?? 'Find guidance'}
          </Link>
        </div>
      </section>
    </main>
  );
}
