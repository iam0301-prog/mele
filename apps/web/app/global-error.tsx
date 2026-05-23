'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="zh-TW">
      <body>
        <main style={{ minHeight: '100vh', padding: '48px 20px', background: '#050817', color: '#fff' }}>
          <section style={{ margin: '0 auto', maxWidth: 560 }}>
            <p style={{ color: '#f4c36a', fontSize: 14, letterSpacing: '0.16em' }}>MELE</p>
            <h1 style={{ marginTop: 12, fontSize: 32 }}>頁面暫時出了一點狀況</h1>
            <p style={{ marginTop: 16, color: '#cbd5e1', lineHeight: 1.8 }}>
              我們已經收到錯誤紀錄。你可以先重新整理一次；如果還是不行，請稍後再試。
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 24,
                border: 0,
                borderRadius: 999,
                background: '#f4c36a',
                color: '#23160a',
                cursor: 'pointer',
                fontWeight: 700,
                padding: '12px 18px',
              }}
            >
              再試一次
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
