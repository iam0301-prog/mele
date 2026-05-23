import { redirect } from 'next/navigation';
import { LOCALES, isLocale, localizePath, type Locale } from '@/lib/i18n';

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

export default async function RetiredSpiritualPage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  redirect(localizePath('/tools', locale));
}
