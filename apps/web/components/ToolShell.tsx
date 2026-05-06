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
}

export function ToolShell({
  title,
  subtitle,
  description,
  locale = DEFAULT_LOCALE,
  children,
}: Props) {
  const copy = getToolLocaleCopy(locale);

  return (
    <div className="tool-page-shell mx-auto px-5 py-8">
      <Link href={localizePath('/tools', locale)} className="text-accent text-xs tracking-widest hover:opacity-80 transition-opacity">
        {copy.shell.backLabel}
      </Link>

      <header className="text-center pt-8 pb-6">
        <div className="text-accent tracking-[0.35em] text-sm mb-4 opacity-70">{copy.shell.eyebrow}</div>
        <h1 className="mele-h1">{title}</h1>
        <div className="mele-subtitle">{subtitle}</div>
        <p className="mt-5 text-white/70 text-sm leading-loose max-w-xl mx-auto">{description}</p>
      </header>

      {children}
    </div>
  );
}

export function ConsultCTA({
  spec,
  label,
  locale = DEFAULT_LOCALE,
}: {
  spec: string;
  label: string;
  locale?: Locale;
}) {
  const copy = getToolLocaleCopy(locale).consult;
  const action = copy.action.replace('{label}', label);

  return (
    <div className="rounded-2xl border border-accent bg-gradient-to-br from-accent/[0.12] to-accent/[0.04] p-7 mt-8 text-center">
      <div className="font-serif text-xl text-accent mb-3">{copy.title}</div>
      <p className="text-white/85 text-sm leading-relaxed mb-5">{copy.body}</p>
      <Link href={localizePath(`/teachers?spec=${encodeURIComponent(spec)}`, locale)} className="mele-btn-primary">
        {action}
      </Link>
    </div>
  );
}
