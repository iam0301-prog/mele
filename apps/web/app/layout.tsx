import type { Metadata, Viewport } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3006'),
  title: {
    default: '海底之星 MELE',
    template: '%s | 海底之星 MELE',
  },
  description:
    '海底之星 MELE 整合八字、紫微、占星、人類圖、馬雅曆、生命靈數、塔羅與盧恩，提供每日儀式、AR 解盤與老師媒合。',
  keywords: ['命理', '八字', '紫微斗數', '塔羅', '盧恩', '馬雅曆', '人類圖', '生命靈數', '占星', 'AR 解盤'],
  manifest: '/manifest.json',
  applicationName: '海底之星 MELE',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '海底之星 MELE',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    siteName: '海底之星 MELE',
    title: '海底之星 MELE',
    description: '用每日儀式、AR 解盤與老師媒合，陪使用者更清楚地理解自己。',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0D1B2A',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="font-sans">
        <script dangerouslySetInnerHTML={{ __html: localPreviewCacheResetScript }} />
        <ToastProvider>
          <Header />
          <main className="relative z-10 min-h-[calc(100vh-160px)]">{children}</main>
          <Footer />
          <CookieConsentBanner />
        </ToastProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
