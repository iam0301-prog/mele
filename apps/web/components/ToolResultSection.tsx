'use client';

import dynamic from 'next/dynamic';
import { ToolResult } from '@/components/ToolResult';
import type { CalcResponse, CalcTool } from '@/lib/api';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';

const ReadingArStage = dynamic(
  () => import('@/components/ReadingArStage').then((module) => module.ReadingArStage),
  {
    ssr: false,
    loading: () => (
      <section className="reading-ar reading-ar--loading" aria-label="視覺結果展示載入中">
        <div className="ritual-kicker">VISUAL RESULT STAGE</div>
        <h2>正在整理視覺結果展示</h2>
        <p>這裡會用穩定的 2D 盤面、牌面或石面呈現結果；AR / 3D 正式版完成後再開放。</p>
      </section>
    ),
  },
);

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
  void locale;
  const arStage = showAr ? <ReadingArStage kind={kind} result={result} /> : null;
  const shouldShowArFirst = arFirst || kind !== 'tarot';

  return (
    <>
      {shouldShowArFirst && arStage}
      <ToolResult result={result} />
      {!shouldShowArFirst && arStage}
    </>
  );
}
