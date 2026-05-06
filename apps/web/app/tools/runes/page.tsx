'use client';

import { useState } from 'react';
import { ConsultCTA, ToolShell } from '@/components/ToolShell';
import { ToolError, ToolLoading } from '@/components/ToolFeedback';
import { ToolResultSection } from '@/components/ToolResultSection';
import { calc, CalcError, type CalcResponse } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { useCurrentLocale } from '@/lib/i18n/use-current-locale';
import { getToolPageCopy } from '@/lib/i18n/tool-page-copy';

export default function RunesPage() {
  const locale = useCurrentLocale();
  const copy = getToolPageCopy(locale, 'runes');
  const toast = useToast();
  const [question, setQuestion] = useState('');
  const [material, setMaterial] = useState(copy.materials?.[0]?.value ?? 'stone');
  const [spread, setSpread] = useState(copy.spreads?.[1]?.value ?? 'three');
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
      const selectedSpread = copy.spreads?.find((item) => item.value === spread) ?? copy.spreads?.[1];
      const response = await calc('runes', {
        count: selectedSpread?.count ?? 3,
        reversed,
        spread: selectedSpread?.value ?? 'three',
        material,
        question: question.trim(),
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
      <form onSubmit={onSubmit} className="mele-card" noValidate>
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
          <label className="mele-label">{copy.materialLabel}</label>
          <div className="rune-material-grid">
            {copy.materials?.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setMaterial(item.value)}
                className={material === item.value ? 'is-active' : ''}
              >
                <span className={`rune-material-preview rune-material-preview--${item.value}`} aria-hidden="true">
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
          <ToolResultSection kind="runes" result={result} locale={locale} />
          <ConsultCTA locale={locale} spec={copy.spec} label={copy.title} />
        </>
      )}
    </ToolShell>
  );
}
