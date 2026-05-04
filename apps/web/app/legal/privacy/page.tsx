import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '隱私權政策｜MELE',
  description: 'MELE 命理媒介中心的資料蒐集、使用、保存與刪除說明。',
};

const sections = [
  {
    title: '我們會蒐集哪些資料',
    items: [
      '帳號資料：Email、登入方式、顯示名稱、同意條款紀錄。',
      '命理資料：出生日期、出生時間、出生地、性別與使用者主動輸入的問題。',
      '服務資料：預約紀錄、付款狀態、老師申請資料、客服或申訴紀錄。',
      '技術資料：IP、瀏覽器、裝置資訊、錯誤紀錄與安全稽核紀錄。',
    ],
  },
  {
    title: '資料使用目的',
    items: [
      '提供命理排盤、每日儀式、AR 呈現與老師諮詢媒合。',
      '完成登入、預約、付款、退款、通知與客服處理。',
      '維護平台安全，例如防止濫用、刷單、異常登入與詐欺行為。',
      '在取得同意後，寄送服務通知、每日提醒或產品更新。',
    ],
  },
  {
    title: '資料保存與刪除',
    items: [
      '帳號與命盤資料會保存至使用者刪除帳號或主動要求移除為止。',
      '付款、預約、爭議與稽核紀錄會依營運、稅務與法令需求保存。',
      '老師申請者上傳的高敏感文件應設定非公開儲存，並依內部政策定期清除。',
      '使用者可提出查詢、更正、停止使用或刪除個人資料的請求。',
    ],
  },
  {
    title: '第三方服務',
    items: [
      '登入與資料庫可能使用 Supabase、LINE、Google 等服務。',
      '付款可能透過綠界科技或其他金流服務完成。',
      '部署、監控、圖片或模型資產可能使用雲端主機、CDN 或儲存服務。',
      '第三方服務會依其自身隱私權政策處理資料，MELE 會盡量降低不必要的資料傳輸。',
    ],
  },
  {
    title: '兒少與監護人',
    items: [
      '未滿 13 歲者不得自行建立帳號或留下個人資料。',
      '13 歲以上未滿 18 歲者，需由法定代理人或監護人同意後使用。',
      '若我們得知未經同意蒐集兒少資料，會盡速限制帳號並協助刪除。',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <article className="container mx-auto max-w-4xl px-5 py-12">
      <header className="pb-8 text-center">
        <h1 className="mb-2 font-serif text-3xl tracking-widest">隱私權政策</h1>
        <div className="mele-subtitle">PRIVACY POLICY</div>
        <p className="mt-3 text-xs text-white/50">最後更新：2026 年 4 月 30 日</p>
      </header>

      <div className="mele-card prose prose-invert max-w-none">
        <p className="leading-loose text-white/72">
          本頁是產品上線前的隱私權政策草案，用於清楚告知使用者 MELE 如何處理資料。
          正式公開收費前，仍應由熟悉台灣個資法與跨境資料處理的律師審閱。
        </p>

        {sections.map((section) => (
          <section key={section.title} className="mt-7">
            <h2 className="text-accent">{section.title}</h2>
            <ul className="list-disc space-y-2 pl-5 leading-loose">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}

        <section className="mt-7">
          <h2 className="text-accent">你的權利與聯絡方式</h2>
          <p className="leading-loose">
            你可以聯絡 MELE 要求查詢、更正、下載、停止使用或刪除個人資料。
            正式上線時，請將下列信箱替換為實際客服與隱私聯絡信箱：
            <a href="mailto:privacy@mele.example" className="ml-1 text-accent-light">privacy@mele.example</a>
          </p>
        </section>

        <div className="mt-8 rounded-lg border border-accent-dim bg-black/25 p-4 text-sm leading-loose text-white/68">
          命理、塔羅、盧恩與 AR 解讀屬於自我探索與娛樂參考，請同時閱讀
          <Link href="/legal/disclaimer" className="mx-1 text-accent-light">免責聲明</Link>
          與
          <Link href="/legal/tos" className="mx-1 text-accent-light">服務條款</Link>
          。
        </div>
      </div>
    </article>
  );
}
