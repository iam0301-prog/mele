import Link from 'next/link';

/**
 * 404 fallback for routes that don't exist.
 * Kept locale-agnostic + visually consistent with the brand.
 * Always provides a clear exit path home + to popular destinations.
 */
export default function NotFound() {
  return (
    <main className="container mx-auto max-w-xl px-5 py-24 text-center">
      <div className="mele-subtitle">404 · PATH NOT FOUND</div>
      <h1 className="mt-3 font-serif text-3xl tracking-widest text-accent">
        這條路通往迷霧
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-white/68">
        找不到你想去的頁面。它可能已經換了位置，或從未存在過。
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="mele-btn-primary">
          返回首頁
        </Link>
        <Link href="/tools" className="mele-btn-secondary">
          看所有工具
        </Link>
        <Link href="/daily" className="mele-btn-secondary">
          今日儀式
        </Link>
      </div>
    </main>
  );
}
