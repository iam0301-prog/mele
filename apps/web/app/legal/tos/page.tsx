import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '服務條款｜MELE',
  description: 'MELE 命理媒介中心的會員、老師、預約、付款、退款與申訴規則。',
};

const userTerms = [
  '使用者需提供真實、可聯繫的帳號資料，不得冒用他人身分。',
  '命理排盤、塔羅、盧恩、每日儀式與 AR 呈現僅供自我探索與娛樂參考。',
  '不得利用平台騷擾老師、散布不實資訊、洗評價、詐欺或從事違法行為。',
  '未滿 13 歲者不得自行註冊；13 歲以上未滿 18 歲者需取得法定代理人或監護人同意。',
];

const bookingTerms = [
  '預約成功後，使用者可於會員中心查看預約狀態、付款狀態與諮詢資訊。',
  '平台得保留款項至諮詢完成、取消期間屆滿或爭議處理完成後，再進行撥款。',
  '使用者若需取消或申訴，應在預約頁、客服或指定管道提出，以保留處理紀錄。',
  '若老師未出席、遲到過久或未提供約定服務，平台可依紀錄啟動退款、補償或老師處分流程。',
];

const teacherTerms = [
  '老師需提供可驗證的申請資料、服務內容、價格、可預約時間與諮詢方式。',
  '老師不得私下引導使用者繞過平台付款，或要求使用者提供不必要的敏感資料。',
  '老師應準時提供服務；未出席、臨時取消或服務品質爭議將影響曝光、收益與平台資格。',
  '平台預設抽成建議為 20%，正式比例以合約與後台設定為準。',
];

export default function TosPage() {
  return (
    <article className="container mx-auto max-w-4xl px-5 py-12">
      <header className="pb-8 text-center">
        <h1 className="mb-2 font-serif text-3xl tracking-widest">服務條款</h1>
        <div className="mele-subtitle">TERMS OF SERVICE</div>
        <p className="mt-3 text-xs text-white/50">最後更新：2026 年 4 月 30 日</p>
      </header>

      <div className="mele-card prose prose-invert max-w-none">
        <p className="leading-loose text-white/72">
          本條款是公開上線前版本，用於定義 MELE、使用者與老師之間的基本權利義務。
          正式收費營運前，付款、退款、抽成、個資與責任限制條款應由律師審閱。
        </p>

        <section className="mt-7">
          <h2 className="text-accent">使用者規則</h2>
          <ul className="list-disc space-y-2 pl-5 leading-loose">
            {userTerms.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section className="mt-7">
          <h2 className="text-accent">預約、付款與退款</h2>
          <ul className="list-disc space-y-2 pl-5 leading-loose">
            {bookingTerms.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="mt-3 text-sm leading-loose text-white/60">
            退款與取消規則應在付款前再次顯示，並留下使用者同意紀錄。刷退、爭議款與客服調解流程需要在正式收費前完成演練。
          </p>
        </section>

        <section className="mt-7">
          <h2 className="text-accent">老師規則</h2>
          <ul className="list-disc space-y-2 pl-5 leading-loose">
            {teacherTerms.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section className="mt-7">
          <h2 className="text-accent">申訴與處理</h2>
          <p className="leading-loose">
            若使用者或老師對預約、付款、服務品質、評價或資料使用有疑問，可透過客服或申訴管道提出。
            平台會依資料紀錄、付款狀態、雙方說明與內部規則進行判斷。
          </p>
        </section>

        <section className="mt-7">
          <h2 className="text-accent">責任限制</h2>
          <p className="leading-loose">
            MELE 不是醫療、法律、投資、心理治療或緊急救助服務。任何命理內容、老師建議或 AR 呈現都不能取代專業判斷。
            使用前請閱讀
            <Link href="/legal/disclaimer" className="mx-1 text-accent-light">免責聲明</Link>
            。
          </p>
        </section>
      </div>
    </article>
  );
}
