import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import {
  DEFAULT_LOCALE,
  LOCALE_HEADER,
  PATH_HEADER,
  buildLocalizedMetadata,
  getDictionary,
  isLocale,
  stripLocaleFromPathname,
} from '@/lib/i18n';
import { LocaleProvider } from '@/lib/i18n/LocaleProvider';
import './globals.css';

const localPreviewCacheResetScript = `
(function () {
  try {
    var host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1' && host !== '::1') return;
    var key = 'mele_local_preview_cache_reset_v1';
    if (window.sessionStorage && window.sessionStorage.getItem(key)) return;
    if (window.sessionStorage) window.sessionStorage.setItem(key, '1');
    var clearCaches = 'caches' in window
      ? window.caches.keys().then(function (keys) {
          return Promise.all(keys.map(function (cacheKey) { return window.caches.delete(cacheKey); }));
        })
      : Promise.resolve();
    var clearWorkers = 'serviceWorker' in navigator
      ? navigator.serviceWorker.getRegistrations().then(function (registrations) {
          return Promise.all(registrations.map(function (registration) { return registration.unregister(); }));
        })
      : Promise.resolve();
    Promise.all([clearCaches, clearWorkers]).then(function () {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) window.location.reload();
    });
  } catch (error) {
    console.warn('MELE local cache reset skipped:', error);
  }
})();
`;

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const headerLocale = requestHeaders.get(LOCALE_HEADER);
  const locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE;
  const dictionary = await getDictionary(locale);
  const headerPathname = requestHeaders.get(PATH_HEADER) || `/${locale}`;
  const pathname = stripLocaleFromPathname(headerPathname);
  const localized = buildLocalizedMetadata({
    locale,
    dictionary,
    pathname,
  });

  return {
    ...localized,
    title: {
      default: dictionary.meta.title,
      template: `%s | ${dictionary.meta.siteName}`,
    },
    manifest: '/manifest.json',
    applicationName: dictionary.meta.siteName,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: dictionary.meta.siteName,
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0D1B2A',
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const headerLocale = requestHeaders.get(LOCALE_HEADER);
  const locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE;

  return (
    <html lang={locale}>
      <body className="font-sans">
        <script dangerouslySetInnerHTML={{ __html: localPreviewCacheResetScript }} />
        <ToastProvider>
          <LocaleProvider locale={locale}>
            <Header />
            <main className="relative z-10 min-h-[calc(100vh-160px)]">{children}</main>
            <Footer />
            <CookieConsentBanner />
          </LocaleProvider>
        </ToastProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
