'use client';

import { useEffect, useState } from 'react';
import { calc, CalcError, type CalcResponse } from '@/lib/api';

type Voice = 'scholar' | 'friend' | 'master';

interface VoiceMeta {
  key: Voice;
  emoji: string;
  label: string;
  hint: string;
}

const VOICES: VoiceMeta[] = [
  { key: 'scholar', emoji: '📚', label: '學院派', hint: '理論 + 同理視角，適合知識型客戶' },
  { key: 'friend', emoji: '☕', label: '朋友式', hint: '聊天、共感，適合情緒型客戶' },
  { key: 'master', emoji: '🧙', label: '老師口吻', hint: '斷語 + 關懷，適合決策型客戶' },
];

interface State {
  loading: boolean;
  error: string | null;
  byVoice: Partial<Record<Voice, string>>;
}

/**
 * Teacher-side preview tool: shows the same numerology reading
 * rendered in 3 different voices so the teacher can pick the
 * angle that fits their client before the consultation.
 *
 * Calls /api/calc/numerology three times with ?voice=X.
 * Backend (engines/explanations.py) reads data/copy/numerology.yaml.
 */
export function TeacherNumerologyVoicePreview() {
  const today = new Date();
  const defaultDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
  }).format(today);

  const [date, setDate] = useState<string>(defaultDate);
  const [activeVoice, setActiveVoice] = useState<Voice>('master');
  const [state, setState] = useState<State>({ loading: false, error: null, byVoice: {} });
  const [meta, setMeta] = useState<{ lifePath?: number; archetype?: string }>({});

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    const [year, month, day] = date.split('-').map(Number);
    if (!year || !month || !day) return;

    setState({ loading: true, error: null, byVoice: {} });

    Promise.all(
      VOICES.map(async ({ key }) => {
        const response = (await calc('numerology', { year, month, day }, { detail: 'full', voice: key })) as CalcResponse;
        return [key, response] as const;
      }),
    )
      .then((entries) => {
        if (cancelled) return;
        const byVoice: Partial<Record<Voice, string>> = {};
        let lifePath: number | undefined;
        let archetype: string | undefined;
        for (const [voice, response] of entries) {
          byVoice[voice] = response.render.html ?? '';
          const data = response.data as Record<string, unknown>;
          if (typeof data.lifePath === 'number') lifePath = data.lifePath;
          const arche = data.lifePathArchetype as { name?: string } | undefined;
          if (arche?.name) archetype = arche.name;
        }
        setMeta({ lifePath, archetype });
        setState({ loading: false, error: null, byVoice });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof CalcError ? err.message : (err as Error).message;
        setState({ loading: false, error: message, byVoice: {} });
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  const activeHtml = state.byVoice[activeVoice] ?? '';

  return (
    <section className="mele-card mt-8" aria-label="生命靈數 voice 對照預覽">
      <div className="mele-section-subtitle">VOICE PREVIEW</div>
      <h2 className="font-serif text-xl text-accent mt-1 mb-3">生命靈數 · 三種解讀語氣</h2>
      <p className="text-xs leading-relaxed text-white/65 mb-5">
        輸入客戶生日 → 切換語氣 tab 看同盤面三種敘述方式，挑當下諮詢最適合的角度開講。
      </p>

      <div className="grid gap-4 sm:grid-cols-[200px_1fr] items-start">
        <div className="space-y-3">
          <label className="block">
            <span className="mele-label">客戶生日</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mele-input"
            />
          </label>
          {meta.lifePath && (
            <div className="rounded-lg border border-accent-dim bg-accent/[0.06] p-3 text-xs leading-relaxed">
              <div className="text-accent">生命靈數 {meta.lifePath}</div>
              {meta.archetype && <div className="text-white/72 mt-0.5">{meta.archetype}</div>}
            </div>
          )}
        </div>

        <div>
          {/* Voice tabs */}
          <div className="flex flex-wrap gap-2 mb-4 border-b border-accent-dim pb-3">
            {VOICES.map((voice) => {
              const isActive = voice.key === activeVoice;
              return (
                <button
                  key={voice.key}
                  type="button"
                  onClick={() => setActiveVoice(voice.key)}
                  className={`rounded-lg px-3 py-2 text-xs tracking-wide transition-all ${
                    isActive
                      ? 'bg-accent text-primary shadow-[0_0_18px_rgba(212,175,55,0.25)]'
                      : 'border border-accent-dim text-white/72 hover:border-accent hover:text-accent'
                  }`}
                  aria-pressed={isActive}
                  title={voice.hint}
                >
                  <span aria-hidden="true">{voice.emoji}</span> {voice.label}
                </button>
              );
            })}
          </div>

          {/* Active voice hint */}
          <p className="text-[11px] text-white/55 mb-3">
            {VOICES.find((v) => v.key === activeVoice)?.hint}
          </p>

          {/* Reading content */}
          {state.loading && (
            <div className="rounded-lg border border-accent-dim bg-white/[0.03] p-4 text-sm text-white/60">
              讀取三種語氣中…
            </div>
          )}
          {state.error && (
            <div
              className="rounded-lg border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-300"
              role="alert"
            >
              讀取失敗：{state.error}
            </div>
          )}
          {!state.loading && !state.error && activeHtml && (
            <article
              className="rounded-lg border border-accent-dim bg-white/[0.025] p-5 leading-relaxed text-white/82"
              dangerouslySetInnerHTML={{ __html: activeHtml }}
            />
          )}
          {!state.loading && !state.error && !activeHtml && (
            <div className="rounded-lg border border-accent-dim bg-white/[0.03] p-4 text-sm text-white/55">
              選一個生日開始預覽。
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
