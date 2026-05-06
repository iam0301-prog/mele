'use client';

import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import { getToolLocaleCopy } from '@/lib/i18n/tool-page-copy';

export function ToolLoading({
  label,
  locale = DEFAULT_LOCALE,
}: {
  label?: string;
  locale?: Locale;
}) {
  const copy = getToolLocaleCopy(locale).feedback;

  return (
    <div className="tool-loading-ritual mele-card mt-6" aria-live="polite">
      <div className="tool-loading-ritual__portrait" aria-hidden="true">
        <span className="tool-loading-ritual__halo" />
        <span className="tool-loading-ritual__face">
          <i className="tool-loading-ritual__eye tool-loading-ritual__eye--left" />
          <i className="tool-loading-ritual__eye tool-loading-ritual__eye--right" />
          <b className="tool-loading-ritual__smile" />
          <em className="tool-loading-ritual__spark tool-loading-ritual__spark--one" />
          <em className="tool-loading-ritual__spark tool-loading-ritual__spark--two" />
        </span>
      </div>
      <div className="tool-loading-ritual__copy">
        <span>{copy.loadingKicker}</span>
        <strong>{label ?? copy.loadingBody}</strong>
        <p>{copy.loadingBody}</p>
      </div>
      <div className="tool-loading-ritual__steps" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

export function ToolError({
  message,
  locale = DEFAULT_LOCALE,
}: {
  message: string;
  locale?: Locale;
}) {
  const copy = getToolLocaleCopy(locale).feedback;

  return (
    <div className="rounded-2xl border border-reverse bg-reverse/[0.05] p-8 mt-6 text-center text-rose-300">
      <div className="text-2xl mb-2">{copy.errorTitle}</div>
      <div className="text-sm">{message}</div>
      <div className="text-xs mt-3 text-white/50">{copy.errorHint}</div>
    </div>
  );
}
