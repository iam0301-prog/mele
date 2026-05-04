import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '免責聲明｜MELE',
  description: 'MELE 命理、塔羅、盧恩、AR 解讀與老師諮詢的使用限制說明。',
};

const disclaimers = [
  {
    title: '非醫療、法律、投資或心理治療建議',
    body: 'MELE 提供的命理、塔羅、盧恩、馬雅、人類圖、八字、紫微、占星與生命靈數內容，均為自我探索、娛樂與文化參考。任何內容都不應取代醫師、律師、會計師、投資顧問、心理師或其他合格專業人士的建議。',
  },
  {
    title: '請勿用於重大決策的唯一依據',
    body: '感情、工作、投資、健康、法律、家庭與人生重大選擇，應同時考量現實資料、專業意見與自身判斷。若內容讓你感到焦慮、恐懼或壓力，請暫停使用並尋求可信任的人或專業資源協助。',
  },
  {
    title: 'AR 與圖像呈現是輔助體驗',
    body: 'AR 牌面、石面、盤面與模型呈現，是為了提升理解與儀式感，不代表任何物理、醫療或超自然保證。不同裝置、瀏覽器與網路環境可能影響顯示效果。',
  },
  {
    title: '老師諮詢屬個人服務',
    body: '老師的解讀風格、方法與觀點由個別老師提供。平台會建立審核、評價、申訴與處理機制，但不保證每次諮詢結果符合所有人的期待。',
  },
];

export default function DisclaimerPage() {
  return (
    <article className="container mx-auto max-w-4xl px-5 py-12">
      <header className="pb-8 text-center">
        <h1 className="mb-2 font-serif text-3xl tracking-widest">免責聲明</h1>
        <div className="mele-subtitle">DISCLAIMER</div>
        <p className="mt-3 text-xs text-white/50">最後更新：2026 年 4 月 30 日</p>
      </header>

      <div className="mele-card prose prose-invert max-w-none">
        <p className="leading-loose text-white/72">
          這份聲明用來明確界定 MELE 的服務邊界，降低使用者誤解與平台營運風險。
          正式上線前仍建議交由律師審閱。
        </p>

        {disclaimers.map((item) => (
          <section key={item.title} className="mt-7">
            <h2 className="text-accent">{item.title}</h2>
            <p className="leading-loose">{item.body}</p>
          </section>
        ))}

        <div className="mt-8 rounded-lg border border-accent-dim bg-black/25 p-4 text-sm leading-loose text-white/68">
          使用 MELE 即表示你理解命理內容的限制，並同意搭配
          <Link href="/legal/tos" className="mx-1 text-accent-light">服務條款</Link>
          與
          <Link href="/legal/privacy" className="mx-1 text-accent-light">隱私權政策</Link>
          一併閱讀。
        </div>
      </div>
    </article>
  );
}
