'use client';

import type React from 'react';
import dynamic from 'next/dynamic';
import { ToolResult } from '@/components/ToolResult';
import type { CalcResponse, CalcTool } from '@/lib/api';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/i18n/config';
import { getToolResultCopy } from '@/lib/i18n/tool-result-copy';
import type { ReadingArKind } from '@/components/ReadingArStage';

type ArStageProps = { kind: ReadingArKind; result?: CalcResponse | null };

// 預先計算每個 locale 的 AR loading 文字（module top-level）
const AR_LOADING_TEXT = Object.fromEntries(
  LOCALES.map((locale) => {
    const t = getToolResultCopy(locale);
    return [locale, t.arLoading];
  }),
) as Record<Locale, { kicker: string; title: string; body: string }>;

function makeReadingArStage(locale: Locale): React.ComponentType<ArStageProps> {
  const ar = AR_LOADING_TEXT[locale];
  return dynamic<ArStageProps>(
    () => import('@/components/ReadingArStage').then(
      (m) => m.ReadingArStage as React.ComponentType<ArStageProps>,
    ),
    {
      ssr: false,
      loading: () => (
        <section className="reading-ar reading-ar--loading" aria-label={ar.kicker}>
          <div className="ritual-kicker">{ar.kicker}</div>
          <h2>{ar.title}</h2>
          <p>{ar.body}</p>
        </section>
      ),
    },
  );
}

// 六語言各自的 dynamic 元件（module top-level）
const READING_AR_STAGES = Object.fromEntries(
  LOCALES.map((locale) => [locale, makeReadingArStage(locale)]),
) as Record<Locale, React.ComponentType<ArStageProps>>;

export function ToolResultSection({
  kind,
  result,
  showAr = true,
  arFirst = false,
  locale = DEFAULT_LOCALE,
}: {
  kind: CalcTool;
  result: CalcResponse;
  showAr?: boolean;
  arFirst?: boolean;
  locale?: Locale;
}) {
  const shouldRenderVisualStage = showAr && kind !== 'maya';
  const ReadingArStage = READING_AR_STAGES[locale] ?? READING_AR_STAGES[DEFAULT_LOCALE];
  const arStage = shouldRenderVisualStage ? <ReadingArStage kind={kind} result={result} /> : null;
  const shouldShowArFirst = arFirst || kind !== 'tarot';

  return (
    <>
      {shouldShowArFirst && arStage}
      <ToolResult result={result} locale={locale} />
      {!shouldShowArFirst && arStage}
    </>
  );
}
