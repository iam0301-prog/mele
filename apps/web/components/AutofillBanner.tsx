import Link from 'next/link';

interface Props {
  show: boolean;
  fields?: string[];
}

export function AutofillBanner({ show, fields }: Props) {
  if (!show) return null;
  return (
    <div className="rounded-lg bg-success/[0.08] border border-success/40 px-4 py-3 mb-5 flex items-center gap-3 text-xs">
      <span className="text-success text-base" aria-hidden="true">✓</span>
      <span className="flex-1 text-white/85">
        已從你的個人資料帶入{fields && fields.length > 0 ? `：${fields.join(' / ')}` : '常用出生資料'}。你仍可以在本次排盤前手動調整。
      </span>
      <Link href="/account/profile" className="text-accent hover:underline whitespace-nowrap">
        編輯資料
      </Link>
    </div>
  );
}
