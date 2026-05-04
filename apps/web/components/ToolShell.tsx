import Link from 'next/link';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle: string;
  description: string;
  spec: string;
  children: ReactNode;
}

export function ToolShell({ title, subtitle, description, children }: Props) {
  return (
    <div className="tool-page-shell mx-auto px-5 py-8">
      <Link href="/" className="text-accent text-xs tracking-widest hover:opacity-80 transition-opacity">
        返回命理媒介中心
      </Link>

      <header className="text-center pt-8 pb-6">
        <div className="text-accent tracking-[0.35em] text-sm mb-4 opacity-70">線上解盤工具</div>
        <h1 className="mele-h1">{title}</h1>
        <div className="mele-subtitle">{subtitle}</div>
        <p className="mt-5 text-white/70 text-sm leading-loose max-w-xl mx-auto">{description}</p>
      </header>

      {children}
    </div>
  );
}

export function ConsultCTA({ spec, label }: { spec: string; label: string }) {
  return (
    <div className="rounded-2xl border border-accent bg-gradient-to-br from-accent/[0.12] to-accent/[0.04] p-7 mt-8 text-center">
      <div className="font-serif text-xl text-accent mb-3">想把結果解得更細嗎？</div>
      <p className="text-white/85 text-sm leading-relaxed mb-5">
        線上工具適合快速看見主題與方向。
        <br />
        若你想把關係、事業、選擇或人生階段講清楚，可以預約
        <strong className="text-accent-light"> {label} </strong>
        專長老師進一步解盤。
      </p>
      <Link href={`/teachers?spec=${encodeURIComponent(spec)}`} className="mele-btn-primary">
        尋找{label}老師
      </Link>
    </div>
  );
}
