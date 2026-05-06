'use client';

import { useState } from 'react';
import { ConsultCTA, ToolShell } from '@/components/ToolShell';
import { ToolError, ToolLoading } from '@/components/ToolFeedback';
import { ToolResultSection } from '@/components/ToolResultSection';
import { calc, CalcError, type CalcResponse } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { useCurrentLocale } from '@/lib/i18n/use-current-locale';
import { getToolPageCopy } from '@/lib/i18n/tool-page-copy';

export default function TarotPage() {
  const locale = useCurrentLocale();
  const copy = getToolPageCopy(locale, 'tarot');
  const toast = useToast();
  const [question, setQuestion] = useState('');
  const [spread, setSpread] = useState(copy.spreads?.[0]?.value ?? 'three_card');
  const [tarotStyle, setTarotStyle] = useState(copy.tarotStyles?.[1]?.value ?? 'ocean_poseidon');
  const [reversed, setReversed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalcResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!question.trim()) {
      toast(copy.validation.questionRequired ?? 'Please enter a question first.', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const selectedSpread = copy.spreads?.find((item) => item.value === spread) ?? copy.spreads?.[0];
      const response = await calc('tarot', {
        count: selectedSpread?.count ?? 3,
        reversed,
        spread: selectedSpread?.value ?? 'three_card',
        question: question.trim(),
        tarot_style: tarotStyle,
      });
      setResult(response);
    } catch (err) {
      const message = err instanceof CalcError ? err.message : (err as Error).message;
      setError(message);
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell locale={locale} title={copy.title} subtitle={copy.subtitle} description={copy.description} spec={copy.spec}>
      <form onSubmit={onSubmit} className="mele-card">
        <div className="mb-5">
          <label className="mele-label">{copy.question?.label}</label>
          <textarea
            rows={3}
            required
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={copy.question?.placeholder}
            className="mele-input"
          />
          {copy.question?.hint && <p className="text-xs text-white/50 mt-2">{copy.question.hint}</p>}
        </div>

        <div className="mb-5">
          <label className="mele-label">{copy.styleLabel}</label>
          <div className="tarot-style-grid">
            {copy.tarotStyles?.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTarotStyle(item.value)}
                className={tarotStyle === item.value ? 'is-active' : ''}
              >
                <span className={`tarot-style-preview tarot-style-preview--${item.value}`} aria-hidden="true">
                  <i />
                </span>
                <strong>{item.label}</strong>
                <small>{item.desc}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="mele-label">{copy.spreadLabel}</label>
          <select value={spread} onChange={(event) => setSpread(event.target.value)} className="mele-input">
            {copy.spreads?.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-white/85 mb-5 cursor-pointer">
          <input type="checkbox" checked={reversed} onChange={(event) => setReversed(event.target.checked)} />
          {copy.reversedLabel}
        </label>

        <button type="submit" disabled={loading} className="mele-btn-primary w-full md:w-auto">
          {loading ? copy.submit.loading : copy.submit.idle}
        </button>
      </form>

      {loading && <ToolLoading locale={locale} label={copy.loadingLabel} />}
      {error && !loading && <ToolError locale={locale} message={error} />}
      {result && !loading && (
        <>
          <div className="mele-card mt-6">
            <div className="text-accent text-xs tracking-widest mb-2">{copy.question?.resultLabel}</div>
            <div className="text-white/85 italic">“{question}”</div>
          </div>
          <ToolResultSection kind="tarot" result={result} locale={locale} />
          <ConsultCTA locale={locale} spec={copy.spec} label={copy.title} />
        </>
      )}
    </ToolShell>
  );
}
