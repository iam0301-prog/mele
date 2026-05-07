import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LocalizedLoginClient } from '@/components/LocalizedLoginClient';
import { LOCALES, buildLocalizedMetadata, getDictionary, isLocale, type Locale } from '@/lib/i18n';
import { getReleasePageCopy } from '@/lib/i18n/release-page-copy';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

async function resolveLocale(params: PageProps['params']): Promise<Locale> {
  const { locale } = await params;
  return isLocale(locale) ? locale : 'zh-TW';
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  const copy = getReleasePageCopy(locale).login;

  return buildLocalizedMetadata({
    locale,
    dictionary,
    pathname: '/account/login',
    title: `${copy.title} | ${dictionary.meta.siteName}`,
    description: copy.body,
  });
}

export default async function LocalizedLoginPage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  return (
    <Suspense fallback={<main className="container mx-auto max-w-5xl px-5 py-16" />}>
      <LocalizedLoginClient locale={locale} />
    </Suspense>
  );
}
