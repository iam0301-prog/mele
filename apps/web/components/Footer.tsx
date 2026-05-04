import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative z-10 mt-16 px-5 py-10 text-center text-xs tracking-widest text-white/45">
      <div className="mb-4 flex flex-wrap justify-center gap-5">
        <Link href="/legal/privacy" className="transition-colors hover:text-accent">隱私權政策</Link>
        <Link href="/legal/tos" className="transition-colors hover:text-accent">服務條款</Link>
        <Link href="/legal/disclaimer" className="transition-colors hover:text-accent">免責聲明</Link>
        <Link href="/teachers/apply" className="transition-colors hover:text-accent">老師申請</Link>
      </div>
      <div>© MELE 命理媒介中心 · DIVINATION HUB</div>
    </footer>
  );
}
