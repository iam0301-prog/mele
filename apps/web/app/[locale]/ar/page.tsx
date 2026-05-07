import type { Metadata } from 'next';
import { LocalizedStaticPage } from '@/components/LocalizedStaticPage';
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
  const copy = getReleasePageCopy(locale).ar;

  return buildLocalizedMetadata({
    locale,
    dictionary,
    pathname: '/ar',
    title: `${copy.title} | ${dictionary.meta.siteName}`,
    description: copy.body,
  });
}

export default async function LocalizedArPage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const copy = getReleasePageCopy(locale).ar;
  return <LocalizedStaticPage locale={locale} copy={copy} primaryHref="/tools/tarot" secondaryHref="/daily" />;
}
