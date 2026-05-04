import Link from 'next/link';
import { ArRelicStage } from '@/components/ArRelicStage';

const ROADMAP = [
  {
    title: '第一階段：先穩定可讀',
    body: '目前先用精修 2D 視覺展示，確保手機、桌面與 LINE 內建瀏覽器都能看懂結果。',
  },
  {
    title: '第二階段：建立正式美術規格',
    body: '塔羅、盧恩、紫微、人類圖都要先有一致的美術規格，不能只放一個粗糙模型。',
  },
  {
    title: '第三階段：再開放真正 AR',
    body: '等 GLB/USDZ 資產達到可發布品質，再把 AR 放回結果頁，讓它成為加分體驗而不是干擾。',
  },
];

export default function ARPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-20 md:px-8">
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="ritual-hero">
          <div className="ritual-kicker">VISUAL EXPERIENCE</div>
          <h1>AR 正式版暫停，先用更清楚的 2D 視覺展示</h1>
          <p>
            目前的 3D 模型質感還不到正式上線標準，所以這一版先停用模型檔，改成穩定、清楚、有儀式感的 2D 結果展示。
            等卡牌、石面與盤面模型完成後，再恢復真正 AR。
          </p>
          <div className="ritual-hero__actions">
            <Link href="/tools/ziwei" className="mele-btn-primary">測試紫微命盤</Link>
            <Link href="/daily" className="mele-btn-secondary">查看每日儀式</Link>
          </div>
        </div>

        <ArRelicStage initialMode="human-design" />
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {ROADMAP.map((item) => (
          <article key={item.title} className="ritual-panel">
            <div className="ritual-kicker">ROADMAP</div>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="ritual-panel mt-6">
        <div className="ritual-kicker">QUALITY RULE</div>
        <h2>沒有達到正式質感前，不把半成品放到使用者面前</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="ritual-note">
            <h3>人類圖</h3>
            <p>先用清楚 BodyGraph，重點是中心、通道與閘門能被閱讀。</p>
          </div>
          <div className="ritual-note">
            <h3>命盤</h3>
            <p>紫微、八字、占星先強化導讀，讓使用者知道先看哪裡。</p>
          </div>
          <div className="ritual-note">
            <h3>塔羅</h3>
            <p>保留牌面風格與牌義摘要，之後再做完整卡牌模型。</p>
          </div>
          <div className="ritual-note">
            <h3>盧恩</h3>
            <p>石面、木頭、水晶材質先用視覺化呈現，模型完成後再上 AR。</p>
          </div>
        </div>
      </section>
    </main>
  );
}
