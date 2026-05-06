import Link from 'next/link';
import { DEFAULT_LOCALE, localizePath, type Locale } from '@/lib/i18n/config';
import { getToolLocaleCopy } from '@/lib/i18n/tool-page-copy';

interface Props {
  show: boolean;
  fields?: string[];
  locale?: Locale;
}

export function AutofillBanner({ show, fields, locale = DEFAULT_LOCALE }: Props) {
  if (!show) return null;
  const copy = getToolLocaleCopy(locale).autofill;
  const fieldText = fields && fields.length > 0 ? fields.join(' / ') : copy.fallbackFields;

  return (
    <div className="rounded-lg bg-success/[0.08] border border-success/40 px-4 py-3 mb-5 flex items-center gap-3 text-xs">
      <span className="text-success text-base" aria-hidden="true">{copy.icon}</span>
      <span className="flex-1 text-white/85">
        {copy.text.replace('{fields}', fieldText)}
      </span>
      <Link href={localizePath('/account/profile', locale)} className="text-accent hover:underline whitespace-nowrap">
        {copy.action}
      </Link>
    </div>
  );
}
