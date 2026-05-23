import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '隱私權政策｜MELE',
  description: 'MELE 多元自我理解工具平台的資料蒐集、使用、保存與刪除說明。',
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

      <div className="mb-6 rounded-lg border border-amber-400/40 bg-amber-500/[0.08] p-4 text-sm leading-relaxed text-amber-100">
        <strong className="text-amber-300">⚠ 律師審核中（v0 草案）</strong>
        <p className="mt-1.5 text-amber-100/82">
          本頁為產品上線前草案。正式公開收費前，仍應由熟悉台灣個資法、GDPR 與跨境資料處理之律師審閱。
        </p>
      </div>

      <div className="mele-card prose prose-invert max-w-none">
        <p className="leading-loose text-white/72">
          MELE 重視你的資料隱私。本政策說明我們蒐集什麼資料、為什麼蒐集、保存多久，以及你擁有哪些權利。
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
          <h2 className="text-accent">Cookies 與本機儲存</h2>
          <p className="leading-loose">
            MELE 使用 cookies 與 localStorage 維持登入狀態、記住偏好設定（如語系、解讀風格）、儲存每日抽牌結果。我們不使用第三方廣告追蹤 cookies。
            首次造訪時會詢問你的 cookie 同意（mele_cookie_consent_v1），你可以隨時於瀏覽器清除本機資料。
          </p>
        </section>

        <section className="mt-7">
          <h2 className="text-accent">資料保存期限</h2>
          <ul className="list-disc space-y-2 pl-5 leading-loose">
            <li>帳號與排盤紀錄：保留至帳號刪除為止。</li>
            <li>預約與付款紀錄：依稅務法令最少保留 5 年。</li>
            <li>老師申請文件（KYC）：申請被拒絕後 90 天內自動清除（系統自動執行）。</li>
            <li>客服與爭議紀錄：依個案爭議性，保留 1-7 年。</li>
            <li>觀測 / 錯誤紀錄：30-90 天，僅供除錯用途。</li>
          </ul>
        </section>

        <section className="mt-7">
          <h2 className="text-accent">你的權利</h2>
          <p className="leading-loose">
            依個人資料保護法第 3 條，你有以下權利：
          </p>
          <ul className="list-disc space-y-2 pl-5 leading-loose">
            <li><strong>查詢權</strong>：知道我們有你哪些資料、如何使用。</li>
            <li><strong>更正權</strong>：要求更正不完整或錯誤的資料。</li>
            <li><strong>停止處理</strong>：要求停止使用你的個人資料（可能會影響服務）。</li>
            <li><strong>刪除權</strong>：要求刪除你的個人資料（部分法定保留紀錄除外）。</li>
            <li><strong>資料可攜權</strong>：要求以可機器讀取格式提供你的資料。</li>
          </ul>
          <p className="mt-3 leading-loose">
            行使任何權利請聯絡：
            <a href="mailto:privacy@mele.example" className="ml-1 text-accent-light">privacy@mele.example</a>
            （正式上線將替換為實際聯絡信箱）。我們會在 30 天內回應你的請求。
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
