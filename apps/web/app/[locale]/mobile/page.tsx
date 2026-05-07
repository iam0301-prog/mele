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
  const copy = getReleasePageCopy(locale).mobile;

  return buildLocalizedMetadata({
    locale,
    dictionary,
    pathname: '/mobile',
    title: `${copy.title} | ${dictionary.meta.siteName}`,
    description: copy.body,
  });
}

export default async function LocalizedMobilePage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const copy = getReleasePageCopy(locale).mobile;

  return (
    <LocalizedStaticPage
      locale={locale}
      copy={{
        kicker: copy.kicker,
        title: copy.title,
        body: copy.body,
        primary: copy.primary,
        secondary: copy.secondary,
        sections: copy.panels.map((panel) => ({ title: panel.title, body: panel.body })),
      }}
      primaryHref="/daily"
      secondaryHref="/tools"
    />
  );
}
