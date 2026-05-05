import Link from 'next/link';
import { headers } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_HEADER, getDictionary, isLocale, localizePath } from '@/lib/i18n';

export async function Footer() {
  const requestHeaders = await headers();
  const headerLocale = requestHeaders.get(LOCALE_HEADER);
  const locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);

  return (
    <footer className="relative z-10 mt-16 px-5 py-10 text-center text-xs tracking-widest text-white/45">
      <div className="mb-4 flex flex-wrap justify-center gap-5">
        <Link href={localizePath('/legal/privacy', locale)} className="transition-colors hover:text-accent">{dict.footer.privacy}</Link>
        <Link href={localizePath('/legal/tos', locale)} className="transition-colors hover:text-accent">{dict.footer.tos}</Link>
        <Link href={localizePath('/legal/disclaimer', locale)} className="transition-colors hover:text-accent">{dict.footer.disclaimer}</Link>
        <Link href={localizePath('/teachers/apply', locale)} className="transition-colors hover:text-accent">{dict.footer.teacherApply}</Link>
      </div>
      <div>{dict.footer.copyright}</div>
    </footer>
  );
}
