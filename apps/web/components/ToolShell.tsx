import Link from 'next/link';
import type { ReactNode } from 'react';
import { DEFAULT_LOCALE, localizePath, type Locale } from '@/lib/i18n/config';
import { getToolLocaleCopy } from '@/lib/i18n/tool-page-copy';

interface Props {
  title: string;
  subtitle: string;
  description: string;
  spec: string;
  locale?: Locale;
  children: ReactNode;
  /**
   * 階段 2 示範：塔羅、生命靈數兩頁整頁（含表單卡、選卡、按鈕）改全紙感 --mag-* 風，
   * 而非只有 header/tool-beta-note。其餘六工具頁維持舊深藍風，不傳這個 prop。
   */
  themed?: boolean;
}

export function ToolShell({
  title,
  subtitle,
  description,
  locale = DEFAULT_LOCALE,
  children,
  themed = false,
}: Props) {
  const copy = getToolLocaleCopy(locale);

  const shell = (
    <div className="tool-page-shell mag-tool-shell mx-auto px-5 py-8">
      <Link href={localizePath('/tools', locale)} className="mag-tool-shell__back">
        {copy.shell.backLabel}
      </Link>

      <header className="mag-tool-shell__header">
        <div className="mag-label mag-tool-shell__eyebrow">{copy.shell.eyebrow}</div>
        <h1 className="mag-tool-shell__title">{title}</h1>
        <div className="mag-tool-shell__subtitle">{subtitle}</div>
        <p className="mag-tool-shell__desc">{description}</p>
      </header>

      <section className="mag-tool-beta-note" aria-label={copy.shell.feedbackAriaLabel}>
        <div>
          <span className="mag-label">{copy.shell.feedbackKicker}</span>
          <p>{copy.shell.feedbackBody}</p>
        </div>
        <Link href={localizePath('/feedback', locale)}>
          {copy.shell.feedbackAction}
        </Link>
      </section>

      {children}
    </div>
  );

  if (themed) {
    return <div className="mag-tool-page">{shell}</div>;
  }

  return shell;
}

export function ConsultCTA({
  spec,
  locale = DEFAULT_LOCALE,
}: {
  spec: string;
  label: string;
  locale?: Locale;
}) {
  const copy = getToolLocaleCopy(locale).consult;

  return (
    <div className="mag-consult">
      <div className="mag-consult__title">{copy.title}</div>
      <p className="mag-consult__body">{copy.body}</p>
      <Link href={localizePath(`/teachers?spec=${encodeURIComponent(spec)}`, locale)} className="mag-consult__action">
        {copy.action}
      </Link>
    </div>
  );
}

/**
 * 結果頁「旅程中繼站」文末的兩個溫和選項：①換個角度再看看（連到另一個工具） ②需要時，找老師。
 * 階段 2 先只用在塔羅、生命靈數兩個示範頁；其餘工具仍沿用 ConsultCTA，階段 3 再鋪開。
 */
export function ResultNextSteps({
  locale = DEFAULT_LOCALE,
  spec,
  alternateHref,
  alternateLabel,
}: {
  locale?: Locale;
  spec: string;
  alternateHref: string;
  alternateLabel: string;
}) {
  const copy = getToolLocaleCopy(locale);

  return (
    <div className="mag-result-actions">
      <Link href={localizePath(alternateHref, locale)} className="mag-result-actions__link">
        <span className="mag-label">{copy.resultActions.changeAngle}</span>
        <strong>{alternateLabel}</strong>
      </Link>
      <Link
        href={localizePath(`/teachers?spec=${encodeURIComponent(spec)}`, locale)}
        className="mag-result-actions__link mag-result-actions__link--guide"
      >
        <span className="mag-label">{copy.consult.title}</span>
        <strong>{copy.consult.action}</strong>
      </Link>
    </div>
  );
}
