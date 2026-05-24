import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResetPasswordClient } from '@/components/ResetPasswordClient';
import { LOCALES, buildLocalizedMetadata, getDictionary, isLocale, type Locale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

async function resolveLocale(params: PageProps['params']): Promise<Locale | null> {
  const { locale } = await params;
  return isLocale(locale) ? locale : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  if (!locale) return {};
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    locale,
    dictionary,
    pathname: '/account/reset-password',
    title: `設定新密碼 | ${dictionary.meta.siteName}`,
    description: '設定 MELE 帳號的新密碼。',
  });
}

export default async function LocalizedResetPasswordPage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  if (!locale) notFound();
  return <ResetPasswordClient locale={locale} />;
}
