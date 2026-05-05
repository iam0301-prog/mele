import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '海底之星 MELE',
  description: '結合命盤、塔羅、盧恩、每日儀式、會員點數、老師媒合與精緻 2D 結果呈現的手機優先命理平台。',
};

const BETA_STATS = [
  { label: '今日可領 200 點', value: '200', hint: '會員每天領取，用於深入解釋與流日解鎖。' },
  { label: '會員付 100 點解鎖', value: '100', hint: '深入解釋、流日、流月、流年先以同一成本測試。' },
  { label: '八種自助工具', value: '8', hint: '先免費理解自己，再銜接老師諮詢。' },
  { label: '每日一次抽選', value: '1', hint: '每天在塔羅或盧恩之間擇一，建立回訪節奏。' },
];

const HERO_TOOLS = [
  { slug: 'tarot', name: '塔羅', tag: '今日抽牌', desc: '三種牌風、可切換牌面，完成後可進入精緻 2D 視覺展示。' },
  { slug: 'runes', name: '盧恩', tag: '每日抽符文', desc: '石面、木頭、水晶三種材質，適合短問與每日提醒。' },
  { slug: 'maya', name: '馬雅曆', tag: '20 圖騰', desc: '以 Kin、圖騰、支持與挑戰建立可理解的命運圖板。' },
  { slug: 'bazi', name: '八字', tag: '出生盤', desc: '先看日主、五行與四柱，再進一步理解流年流月。' },
];

const TOOLS = [
  { slug: 'bazi', name: '八字', desc: '四柱、日主、五行與命局節奏。', accent: '命盤' },
  { slug: 'ziwei', name: '紫微斗數', desc: '十二宮、主星、命宮與人生主題。', accent: '宮位' },
  { slug: 'astro', name: '西洋占星', desc: '太陽、月亮、上升、宮位與行星結構。', accent: '星盤' },
  { slug: 'humandesign', name: '人類圖', desc: '類型、權威、中心、閘門與通道。', accent: '能量' },
  { slug: 'numerology', name: '生命靈數', desc: '生日數字、核心天賦與今日行動。', accent: '數字' },
  { slug: 'maya', name: '馬雅曆 Kin', desc: '20 圖騰、13 調性與命運神諭板。', accent: '圖騰' },
  { slug: 'tarot', name: '塔羅', desc: '問題抽牌、牌陣、正逆位與視覺牌面。', accent: '牌面' },
  { slug: 'runes', name: '盧恩', desc: '每日符文、材質石面與簡潔行動提示。', accent: '符文' },
];

const ROLE_LANES = [
  {
    role: '會員',
    title: '先看簡易解釋，再用點數開深度',
    body: '封測版讓會員先快速知道自己在看什麼；想看更細，可用每日點數解鎖深入解釋、流日、流月或流年。',
    href: '/account/charts',
    action: '查看會員解讀庫',
  },
  {
    role: '老師',
    title: '老師詳解備忘承接會員脈絡',
    body: '老師後台會整理會員提問、預約狀態與排盤資料。諮詢不是從零開始，而是接續會員已探索的脈絡。',
    href: '/teacher-portal',
    action: '查看老師後台',
  },
  {
    role: '營運',
    title: '封測先測留存、解鎖與預約閉環',
    body: '目前重點是跑順註冊登入、每日任務、點數解鎖、老師申請、預約與後台審核，再決定正式收費節奏。',
    href: '/admin/launch',
    action: '查看發布檢查',
  },
];

const BETA_ROADMAP = [
  { step: '01', title: '完成一次免費自助解讀', body: '確認輸入欄位、結果文字、視覺盤面與手機版閱讀是否順。' },
  { step: '02', title: '領點數並解鎖一次內容', body: '測試 200 點領取、100 點解鎖，以及會員解讀庫是否留存紀錄。' },
  { step: '03', title: '做一次每日塔羅或盧恩', body: '每天只能二選一，封測要觀察使用者是否願意回訪。' },
  { step: '04', title: '從解讀轉向老師諮詢', body: '檢查老師列表、預約、免費測試模式與老師後台備忘卡。' },
];

const PROOF_ITEMS = ['精緻 2D 結果呈現', '會員點數經濟', 'Google / LINE 登入規劃', '老師媒合後台', '封測免費預約模式'];

export default function HomePage() {
  return (
    <main className="home-page min-h-screen">
      <section className="home-hero">
        <div className="home-hero__content">
          <div className="home-beta-badge">命理媒介中心 · CLOSED BETA COMMAND CENTER</div>
          <h1>海底之星 MELE</h1>
          <p>
            封閉測試版先把「自助理解、每日回訪、點數解鎖、老師詳解」四件事打通。會員不用一開始就付費，也能看懂自己的盤面；想看更深，再用點數開啟文言感解釋與流日、流月、流年。
          </p>
          <div className="home-hero__actions">
            <Link href="/daily" className="mele-btn-primary">開始今日任務</Link>
            <Link href="/tools/tarot" className="mele-btn-secondary">先抽一組塔羅</Link>
            <Link href="/teachers" className="home-ghost-link">找老師深度解讀</Link>
          </div>
        </div>

        <div className="home-oracle-console" aria-label="封閉測試任務台">
          <div className="home-oracle-console__header">
            <span>封閉測試任務台</span>
            <strong>今天先測這三件事</strong>
          </div>
          <div className="home-oracle-console__visuals" aria-label="封測視覺素材">
            <Image
              src="/tarot/cards/ocean_poseidon/19.webp"
              alt="大海波賽頓塔羅卡面"
              width={240}
              height={360}
              className="home-oracle-console__card"
              priority
            />
            <Image
              src="/maya/totems/yellow-human.png"
              alt="瑪雅黃色人圖騰"
              width={132}
              height={132}
              className="home-oracle-console__totem"
            />
          </div>
          <ol className="home-oracle-console__tasks">
            <li><span>01</span><p>完成一次工具解讀，確認新手是否看得懂。</p></li>
            <li><span>02</span><p>領每日點數，測試深入解釋與流日解鎖。</p></li>
            <li><span>03</span><p>到老師後台確認會員詳解備忘是否能承接諮詢。</p></li>
          </ol>
        </div>
      </section>

      <section className="home-proof-strip" aria-label="封測核心機制">
        {BETA_STATS.map((stat) => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.hint}</p>
          </article>
        ))}
      </section>

      <section className="home-section home-section--tools">
        <div className="home-section__header">
          <span>FIRST SESSION</span>
          <h2>一進站就能開始測，不用先讀說明書</h2>
          <p>封測首頁要像入口大廳，也要像任務板。最常測的功能先放前面：塔羅、盧恩、馬雅曆、八字。</p>
        </div>
        <div className="home-quick-grid">
          {HERO_TOOLS.map((tool) => (
            <Link href={`/tools/${tool.slug}`} key={tool.slug} className="home-quick-card">
              <span>{tool.tag}</span>
              <h3>{tool.name}</h3>
              <p>{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__header">
          <span>ORACLE SUITE</span>
          <h2>八種命理入口</h2>
          <p>每項功能都先提供會員可理解的初階解釋，再把進階內容留給點數與老師諮詢。</p>
        </div>
        <div className="home-tool-grid">
          {TOOLS.map((tool) => (
            <Link href={`/tools/${tool.slug}`} key={tool.slug} className="home-tool-card">
              <em>{tool.accent}</em>
              <h3>{tool.name}</h3>
              <p>{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section home-section--split">
        <div className="home-beta-mission">
          <span>MEMBER ECONOMY</span>
          <h2>封測先驗證點數，不急著收費</h2>
          <p>
            會員每天可領 200 點；每次深入解釋、流日、流月、流年先以 100 點解鎖。這能測出使用者願不願意為「更懂自己」多走一步。
          </p>
          <div className="home-beta-mission__actions">
            <Link href="/account/login?return=/account/charts">登入並保存紀錄</Link>
            <Link href="/daily">今日塔羅或盧恩</Link>
          </div>
        </div>
        <div className="home-beta-roadmap">
          {BETA_ROADMAP.map((item) => (
            <article key={item.step}>
              <span>{item.step}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__header">
          <span>ROLE FLOW</span>
          <h2>會員、老師、營運各有清楚任務</h2>
          <p>封測版的水準，不只在畫面，也在每個角色知道下一步該做什麼。</p>
        </div>
        <div className="home-role-lanes">
          {ROLE_LANES.map((lane) => (
            <article key={lane.role}>
              <span>{lane.role}</span>
              <h3>{lane.title}</h3>
              <p>{lane.body}</p>
              <Link href={lane.href}>{lane.action}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-section--final">
        <div>
          <span>READY FOR CLOSED BETA</span>
          <h2>測試者看到的是完整產品，不是半成品清單</h2>
          <p>首頁會引導他先體驗，再解鎖，再保存，最後銜接老師。這就是封測版最該驗證的主循環：從自助探索走向專業諮詢。</p>
        </div>
        <div className="home-proof-list">
          {PROOF_ITEMS.map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>
    </main>
  );
}
