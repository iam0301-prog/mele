'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { captureException } from '@/lib/observability';

/**
 * Route-level error boundary.
 * Triggers when a server / client error throws inside a route segment.
 * `global-error.tsx` (root layout error) is separate and not yet defined.
 *
 * `reset()` re-renders the segment — useful when the error is transient
 * (network, race condition). When errors persist after retry, user can
 * navigate home.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error, {
      tags: { boundary: 'route' },
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <main className="container mx-auto max-w-xl px-5 py-24 text-center">
      <div className="mele-subtitle text-rose-300">SOMETHING TANGLED</div>
      <h1 className="mt-3 font-serif text-3xl tracking-widest text-accent">
        星象暫時迷路了
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-white/72">
        頁面在載入時遇到無法處理的狀況。你可以重新嘗試，或回到首頁繼續探索。
      </p>
      {error.digest && (
        <p className="mt-3 text-[11px] tracking-widest text-white/45">
          錯誤代碼：{error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="mele-btn-primary">
          ↻ 重新嘗試
        </button>
        <Link href="/" className="mele-btn-secondary">
          返回首頁
        </Link>
      </div>
    </main>
  );
}
