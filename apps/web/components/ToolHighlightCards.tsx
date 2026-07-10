'use client';

/**
 * 占星結果頁「資訊分層」正式版：第一屏只看太陽/月亮/上升三張重點卡，
 * 讓不懂占星的人先知道「你是誰」；深色星盤圖與十行星表、相位表退到後面（見 ToolResult.tsx
 * 的排列順序，以及 AstroDetailPanel 的摺疊 <details>）。
 * 只影響「顯示層」與六語言文案，計算資料完全沿用既有 result.data，排序邏輯不動。
 */

import type { CalcResponse } from '@/lib/api';
import type { ToolResultCopy } from '@/lib/i18n/tool-result-copy';

type Dict = Record<string, unknown>;

function asDict(value: unknown): Dict {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Dict) : {};
}

function cleanText(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = String(value).trim();
  return text;
}

function formatZodiacPoint(value: unknown): string {
  const obj = asDict(value);
  const sign = asDict(obj.sign);
  if (Object.keys(sign).length === 0) return '';
  const degRaw = sign.degInSign;
  const deg = degRaw === null || degRaw === undefined || degRaw === '' ? NaN : Number(degRaw);
  const degText = Number.isFinite(deg) ? `${deg.toFixed(1)}°` : '';
  return [cleanText(sign.symbol), cleanText(sign.zh), degText].filter(Boolean).join(' ');
}

/** 找不到值時回傳 null，由呼叫端決定要不要顯示「需要出生時間」之類的替代文字 */
function firstText(data: Dict, keys: string[]): string | null {
  for (const key of keys) {
    const raw = data[key];
    if (raw === null || raw === undefined || raw === '') continue;
    if (typeof raw === 'object') {
      const formatted = formatZodiacPoint(raw);
      if (formatted) return formatted;
      const obj = asDict(raw);
      const direct = cleanText(obj.zh) || cleanText(obj.name) || cleanText(obj.label);
      if (direct) return direct;
      continue;
    }
    const text = cleanText(raw);
    if (text) return text;
  }
  return null;
}

export function ToolHighlightCards({ result, t }: { result: CalcResponse; t: ToolResultCopy }) {
  const data = asDict(result.data);

  if (result.tool !== 'astro') return null;

  const copy = t.astroHighlight;
  const sun = firstText(data, ['sun']) ?? copy.unavailable;
  const moon = firstText(data, ['moon']) ?? copy.unavailable;
  const asc = firstText(data, ['ascendant']) ?? copy.unavailable;

  return (
    <section className="tool-highlight tool-highlight--astro" aria-label={copy.eyebrow}>
      <div className="tool-highlight__eyebrow">{copy.eyebrow}</div>
      <h2 className="tool-highlight__title">
        {copy.cards.sun.label} {sun}・{copy.cards.moon.label} {moon}・{copy.cards.ascendant.label} {asc}
      </h2>
      <p className="tool-highlight__lead">{copy.lead}</p>
      <div className="tool-highlight__grid">
        <article className="tool-highlight__card tool-highlight__card--sun">
          <span>{copy.cards.sun.label}</span>
          <strong>{sun}</strong>
          <p>{copy.cards.sun.body}</p>
        </article>
        <article className="tool-highlight__card tool-highlight__card--moon">
          <span>{copy.cards.moon.label}</span>
          <strong>{moon}</strong>
          <p>{copy.cards.moon.body}</p>
        </article>
        <article className="tool-highlight__card tool-highlight__card--ascendant">
          <span>{copy.cards.ascendant.label}</span>
          <strong>{asc}</strong>
          <p>{copy.cards.ascendant.body}</p>
        </article>
      </div>
      <p className="tool-highlight__scroll-hint">{copy.scrollHint}</p>
    </section>
  );
}
