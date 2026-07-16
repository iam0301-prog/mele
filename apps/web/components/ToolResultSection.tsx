'use client';

import { ToolResult } from '@/components/ToolResult';
import { ToolResultReveal } from '@/components/ToolExperiencePrelude';
import type { CalcResponse, CalcTool } from '@/lib/api';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';

/**
 * 結果只保留可解釋、可採取行動的內容。
 * 舊 2D/AR 舞台已移除：它重複包裝資料，卻沒有增加理解。
 * showAr / arFirst 暫留在介面，讓 daily/mobile 舊呼叫不必同時改動；不再產生視覺盤面。
 */
export function ToolResultSection({
  kind,
  result,
  locale = DEFAULT_LOCALE,
}: {
  kind: CalcTool;
  result: CalcResponse;
  showAr?: boolean;
  arFirst?: boolean;
  locale?: Locale;
}) {
  return (
    <>
      <ToolResultReveal tool={kind} locale={locale} />
      <ToolResult result={result} locale={locale} />
    </>
  );
}
