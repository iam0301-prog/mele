'use client';

import type React from 'react';
import dynamic from 'next/dynamic';
import { ToolResult } from '@/components/ToolResult';
import type { CalcResponse, CalcTool } from '@/lib/api';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/i18n/config';
import { getToolResultCopy } from '@/lib/i18n/tool-result-copy';
import type { ReadingArKind } from '@/components/ReadingArStage';

type ArStageProps = { kind: ReadingArKind; result?: CalcResponse | null; locale?: Locale };

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

/**
 * Feature flag：控制哪些工具顯示「視覺 AR Stage」區塊。
 *
 * 保留 true 的條件：工具有真正有資訊價值的圖（非純 CSS 裝飾）：
 *   - humandesign：後端回傳真實 SVG BodyGraph，含中心/通道/閘門，有閱讀價值。
 *   - tarot：真實牌面插畫圖片（/tarot/cards/...），提供視覺上下文。
 *
 * 設為 false（半成品 CSS 材質展示，無獨立資訊價值）：
 *   - runes：純 CSS 石面裝飾，沒有真實圖片。
 *   - numerology / bazi / ziwei / astro：PlatePreview 為純 CSS 裝飾盤，資訊已在文字解讀中完整呈現。
 *   - maya：ToolResultSection 已有 `kind !== 'maya'` 保護，此處設 false 為雙重確認。
 *
 * 等 AR/3D 或真實插圖完成後，把對應項目改回 true 即可恢復。
 */
const AR_STAGE_ENABLED: Record<CalcTool, boolean> = {
  humandesign: true,  // 真實 SVG BodyGraph，有閱讀價值
  tarot: true,        // 真實牌面插畫
  numerology: false,  // 純 CSS 裝飾盤，半成品
  bazi: false,        // 純 CSS 裝飾盤，半成品
  ziwei: false,       // 純 CSS 裝飾盤，半成品
  astro: false,       // 純 CSS 裝飾盤，半成品
  runes: false,       // 純 CSS 材質裝飾，沒有真實圖片
  maya: true,         // 瑪雅有真實圖騰印記（MayaTotemGlyph），恢復顯示
};

export function ToolResultSection({
  kind,
  result,
  showAr = true,
  arFirst = true,
  locale = DEFAULT_LOCALE,
}: {
  kind: CalcTool;
  result: CalcResponse;
  showAr?: boolean;
  arFirst?: boolean;
  locale?: Locale;
}) {
  const shouldRenderVisualStage = showAr && AR_STAGE_ENABLED[kind];
  const ReadingArStage = READING_AR_STAGES[locale] ?? READING_AR_STAGES[DEFAULT_LOCALE];
  const arStage = shouldRenderVisualStage ? <ReadingArStage kind={kind} result={result} locale={locale} /> : null;
  // 塔羅原本被排除在「AR/牌卡圖優先」之外（會排在文字解讀最後面，要滑到底才看得到牌）。
  // 老闆要求塔羅要在最上面就看到牌，所以拿掉這個排除，預設所有工具（含塔羅）都先看視覺結果再看文字解讀。
  const shouldShowArFirst = arFirst;

  return (
    <>
      {shouldShowArFirst && arStage}
      <ToolResult result={result} locale={locale} />
      {!shouldShowArFirst && arStage}
    </>
  );
}
