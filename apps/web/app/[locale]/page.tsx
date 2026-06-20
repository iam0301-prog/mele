import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  LOCALES,
  isLocale,
  localizePath,
  type Locale,
} from '@/lib/i18n/config';

type PageProps = {
  params: Promise<{ locale: string }>;
};

async function resolveLocale(paramsPromise: PageProps['params']): Promise<Locale> {
  const { locale } = await paramsPromise;
  return isLocale(locale) ? locale : 'zh-TW';
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const isEnglish = locale === 'en';
  return {
    title: isEnglish ? 'MELE Public Beta' : 'MELE 公開測試',
    description: isEnglish
      ? 'A public beta self-discovery flow: try free tools, claim daily points, unlock deeper readings, and tell us what should improve before launch.'
      : 'MELE 公開測試入口：先免費試工具、領每日點數、解鎖深度解讀，回報正式上線前最需要改善的地方。',
  };
}

const homeCopy = {
  'zh-TW': {
    eyebrow: '公測進行中 ｜ 自我理解工具',
    title: '先整理自己，再決定下一步。',
    body: '一個讓你先整理自己、再決定下一步的工具平台。從每日儀式、命理探索到深入解讀，陪你多一個看自己的角度。需要的時候，再找老師深聊。',
    primary: '開始每日儀式',
    secondary: '看全部工具',
    tarot: '試抽塔羅',
    beta: '測試任務清單',
    teacher: '需要時找老師',
    secondaryRoutesLabel: '其他入口',
    points: '八種命理入口可直接開始',
    unlock: '每日儀式保留一點儀式感',
    teacherNote: '老師是選項，不是必須',
    previewTitle: '自我探索任務台',
    previewSubtitle: '先認識自己，再決定要不要深入',
    steps: ['基本工具了解自己', '開啟延伸說明', '需要時找老師'],
    promiseTitle: '公測中先承諾這三件事',
    promises: [
      {
        label: '公測進行中',
        title: '先跑一輪，再慢慢完善',
        body: '這個階段最重要的事是：你用得順不順、看不看得懂。有任何卡住或看不懂的地方，請告訴我們。',
      },
      {
        label: '工具優先',
        title: '先認識自己，再決定要不要深入',
        body: '從生命靈數、人類圖到每日塔羅，八種工具入口都可以直接開始，不需要先搞懂每一個系統。',
      },
      {
        label: '手機優先',
        title: '以真實使用者的手機流程為準',
        body: '公開測試最重視手機版是否太擠、按鈕是否明顯、登入與保存紀錄是否讓人卡住。',
      },
    ],
    testerTitle: '今天請你幫忙測這 4 件事',
    testerBody: '不用全部功能都玩完。只要照順序跑一輪，我們就能知道哪裡需要改善。',
    testerItems: ['一個工具是否看得懂', '每日儀式是否有回訪理由', '延伸說明是否夠清楚', '哪個按鈕或字讓你猶豫'],
    noticeTitle: '測試提醒',
    noticeBody: 'MELE 是自我理解與娛樂性工具，不取代醫療、法律、投資或心理治療建議。工具結果僅供自我探索參考，不構成任何診斷或醫療建議。若有身心不適，請尋求專業醫療或心理協助。',
    philosophyKicker: 'OUR APPROACH',
    philosophyTitle: '我們在做的事，其實很簡單',
    philosophyBody: '我們不替你下結論，只是多給你一個看自己的角度。工具結果是參考，不是替你下定論；老師是選項，不是必須。你隨時可以只用工具、不找老師。平台上的老師誰排在前面，由評價與上線狀態等客觀條件決定，排序依公開規則呈現，平台不偏袒特定老師。',
    finalTitle: '準備好就從最短路線開始',
    finalBody: '建議先跑「每日儀式 → 一個工具 → 有感就繼續看」這條線。給自己五分鐘，試試看。',
  },
  en: {
    eyebrow: 'PUBLIC BETA · testing now',
    title: 'Try one tool first, then tell us what feels unclear.',
    body: 'MELE is now in public beta. You can start with free tools, daily rituals, tarot, numerology, and point unlocks while we improve copy, mobile flow, guidance, and trust before launch.',
    primary: 'Start public beta',
    secondary: 'See all tools',
    tarot: 'Try tarot',
    beta: 'Testing checklist',
    teacher: 'Find a guide if needed',
    secondaryRoutesLabel: 'Other beta routes',
    points: 'Claim 200 test points daily',
    unlock: 'Unlock depth with 100 points',
    teacherNote: 'Guides are optional, never forced',
    previewTitle: 'Public beta flow',
    previewSubtitle: 'Finish the first feedback loop in 3 minutes',
    steps: ['Try a free tool', 'Claim test points', 'Report friction'],
    promiseTitle: 'What this beta promises',
    promises: [
      {
        label: 'Honest status',
        title: 'We will not pretend this is final',
        body: 'Some reading copy, payment flows, and guide tools are still being tuned. The site should make the testing state clear instead of pushing uncertain purchases.',
      },
      {
        label: 'Free first',
        title: 'Feel the tool before going deeper',
        body: 'The first goal is readability, return intent, and a clear next step, so core tools and daily loops are open for testing first.',
      },
      {
        label: 'Mobile-first',
        title: 'Real phone friction matters most',
        body: 'Public beta feedback should focus on cramped mobile screens, unclear buttons, login friction, and saved-record trust.',
      },
    ],
    testerTitle: 'Please test these 4 things today',
    testerBody: 'You do not need to try every feature. One clean loop tells us whether the product is close to public-ready.',
    testerItems: ['Whether one free tool is readable', 'Whether the daily ritual gives a reason to return', 'Whether points and unlocks are clear', 'Which button or sentence makes you hesitate'],
    noticeTitle: 'Testing note',
    noticeBody: 'MELE is for self-discovery and entertainment. It does not replace medical, legal, investment, or therapy advice. During public beta, if payment, login, or saved data looks wrong, stop repeating the action and report it.',
    finalTitle: 'Start with the shortest path',
    finalBody: 'Use the daily ritual → one tool → unlock or report loop. It reveals real problems better than opening every tool at once.',
  },
} as const;

export default async function LocalizedHomePage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const copy = locale === 'en' ? homeCopy.en : homeCopy['zh-TW'];

  return (
    <main className="beta2-home">
      <section className="beta2-hero" aria-label="MELE 公開測試首頁">
        <div className="beta2-hero__copy">
          <p className="beta2-eyebrow">{copy.eyebrow}</p>
          <h1>MELE</h1>
          <h2>{copy.title}</h2>
          <p>{copy.body}</p>

          <div className="beta2-actions home-hero__actions">
            <Link href={localizePath('/daily', locale)} className="beta2-primary">
              {copy.primary}
            </Link>
            <Link href={localizePath('/tools', locale)} className="beta2-secondary">
              {copy.secondary}
            </Link>
          </div>

          <nav className="home-route-links" aria-label={copy.secondaryRoutesLabel}>
            <Link href={localizePath('/tools/tarot', locale)}>
              {copy.tarot}
            </Link>
            <Link href={localizePath('/beta', locale)}>
              {copy.beta}
            </Link>
            <Link href={localizePath('/teachers', locale)}>
              {copy.teacher}
            </Link>
          </nav>

          <div className="beta2-trust home-trust-list" aria-label="公開測試規則">
            <span>{copy.points}</span>
            <span>{copy.unlock}</span>
            <span>{copy.teacherNote}</span>
          </div>
        </div>

        <div className="beta2-visual" aria-label="首頁主要視覺">
          <div className="beta2-card-stack" aria-hidden="true">
            <Image
              src="/tarot/cards/ocean_poseidon/19.webp"
              alt="大海波賽頓塔羅卡面"
              width={260}
              height={390}
              priority
              className="beta2-tarot"
            />
            <Image
              src="/maya/totems/yellow-human.png"
              alt="瑪雅黃色人圖騰"
              width={112}
              height={112}
              className="beta2-glyph"
            />
          </div>

          <div className="beta2-phone" aria-label={copy.previewTitle}>
            <div className="beta2-phone__top">
              <span>{copy.previewTitle}</span>
              <strong>200</strong>
            </div>
            <p>{copy.previewSubtitle}</p>
            <ol>
              {copy.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="beta2-path" aria-label={copy.promiseTitle}>
        {copy.promises.map((promise, index) => (
          <article key={promise.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{promise.title}</h3>
            <p>{promise.body}</p>
            <span className="beta2-path-note">{promise.label}</span>
          </article>
        ))}
      </section>

      <section className="beta2-public-panel" aria-label={copy.testerTitle}>
        <div>
          <span className="beta2-panel-kicker">PUBLIC TEST BRIEF</span>
          <h2>{copy.testerTitle}</h2>
          <p>{copy.testerBody}</p>
        </div>
        <ol>
          {copy.testerItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      {locale !== 'en' && (
        <section className="beta2-path" aria-label={homeCopy['zh-TW'].philosophyTitle}>
          <article>
            <span className="beta2-path-note">{homeCopy['zh-TW'].philosophyKicker}</span>
            <h3>{homeCopy['zh-TW'].philosophyTitle}</h3>
            <p>{homeCopy['zh-TW'].philosophyBody}</p>
          </article>
        </section>
      )}

      <section className="beta2-notice" aria-label={copy.noticeTitle}>
        <div>
          <span>{copy.noticeTitle}</span>
          <p>{copy.noticeBody}</p>
        </div>
        <Link href={localizePath('/feedback', locale)}>{locale === 'en' ? 'Report issue' : '回報問題'}</Link>
      </section>

      <section className="beta2-final-cta" aria-label={copy.finalTitle}>
        <div>
          <h2>{copy.finalTitle}</h2>
          <p>{copy.finalBody}</p>
        </div>
        <Link href={localizePath('/daily', locale)} className="beta2-primary">
          {copy.primary}
        </Link>
      </section>
    </main>
  );
}
