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

async function resolveLocale(params: PageProps['params']): Promise<Locale> {
  const { locale } = await params;
  return isLocale(locale) ? locale : 'zh-TW';
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const isEnglish = locale === 'en';
  return {
    title: isEnglish ? 'Public Beta Feedback' : '公開測試回報',
    description: isEnglish
      ? 'Tell MELE what felt confusing, broken, useful, or worth improving during public beta.'
      : '回報 MELE 公開測試期間看不懂、卡住、有感或需要改善的地方。',
  };
}

const copy = {
  'zh-TW': {
    eyebrow: 'PUBLIC BETA FEEDBACK',
    title: '回報一個卡住點，就能幫 MELE 更接近公開。',
    body: '公開測試最需要的不是漂亮稱讚，而是「我在哪一步看不懂、按不下去、不敢相信」。請先用下面格式回報，正式表單串好前，這頁就是測試者的回報入口。',
    primary: '複製回報格式',
    secondary: '回到公開測試',
    tertiary: '繼續測工具',
    sections: [
      {
        title: '1. 你剛剛在哪裡？',
        body: '例如：首頁、每日儀式、塔羅結果、生命靈數、登入、點數解鎖、老師頁。',
      },
      {
        title: '2. 發生什麼事？',
        body: '例如：文字看不懂、按鈕不知道去哪、手機版太擠、結果太空泛、登入後沒有回到原頁。',
      },
      {
        title: '3. 你原本期待看到什麼？',
        body: '例如：我以為會先看到免費結果；我想知道 100 點會解鎖什麼；我需要一個更明確的下一步。',
      },
      {
        title: '4. 有截圖最好，沒有也可以',
        body: '請留下手機型號、瀏覽器、頁面網址與大概時間。不要傳身份證、信用卡或敏感個資。',
      },
    ],
    templateTitle: '建議回報格式',
    template: [
      '我在：',
      '我想做：',
      '我卡住 / 不信任的地方：',
      '我原本期待：',
      '手機 / 瀏覽器：',
      '截圖：有 / 無',
    ],
    noteTitle: '公開測試處理原則',
    noteBody: '付款、登入、資料保存異常優先處理；文字不清楚與手機版擁擠第二優先；個人解讀內容是否有感會累積成下一輪內容修正。',
  },
  en: {
    eyebrow: 'PUBLIC BETA FEEDBACK',
    title: 'Report one point of friction and help MELE get closer to launch.',
    body: 'Public beta does not need polished praise. It needs the moment where you felt confused, stuck, or unsure whether to trust the product. Until the final form is connected, this page is the feedback entry.',
    primary: 'Copy feedback format',
    secondary: 'Back to public beta',
    tertiary: 'Keep testing tools',
    sections: [
      { title: '1. Where were you?', body: 'Home, daily ritual, tarot result, numerology, login, point unlock, guide page, etc.' },
      { title: '2. What happened?', body: 'Confusing copy, unclear button, cramped mobile layout, generic result, login redirect issue, etc.' },
      { title: '3. What did you expect?', body: 'A free result first, clearer 100-point unlock details, or a more obvious next step.' },
      { title: '4. Screenshots help, but are optional', body: 'Include phone model, browser, page URL, and time. Do not send ID cards, credit cards, or sensitive data.' },
    ],
    templateTitle: 'Suggested feedback format',
    template: ['I was on:', 'I wanted to:', 'What felt stuck / untrustworthy:', 'I expected:', 'Phone / browser:', 'Screenshot: yes / no'],
    noteTitle: 'How beta feedback is handled',
    noteBody: 'Payment, login, and saved-data issues are first priority. Unclear copy and cramped mobile screens are second. Reading quality feedback will shape the next content pass.',
  },
} as const;

export default async function FeedbackPage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const c = locale === 'en' ? copy.en : copy['zh-TW'];
  const mailtoBody = encodeURIComponent(c.template.join('\n'));
  const mailtoHref = `mailto:support@mele.app?subject=${encodeURIComponent('MELE public beta feedback')}&body=${mailtoBody}`;

  return (
    <main className="beta2-home public-feedback-page">
      <section className="beta2-public-panel public-feedback-hero" aria-label={c.title}>
        <div>
          <span className="beta2-panel-kicker">{c.eyebrow}</span>
          <h1>{c.title}</h1>
          <p>{c.body}</p>
          <div className="beta2-actions public-feedback-actions">
            <a href={mailtoHref} className="beta2-primary">{c.primary}</a>
            <Link href={localizePath('/beta', locale)} className="beta2-secondary">{c.secondary}</Link>
            <Link href={localizePath('/tools', locale)} className="beta2-ghost">{c.tertiary}</Link>
          </div>
        </div>
        <div className="feedback-template-card">
          <span>{c.templateTitle}</span>
          <pre>{c.template.join('\n')}</pre>
        </div>
      </section>

      <section className="beta2-path" aria-label={c.templateTitle}>
        {c.sections.map((section, index) => (
          <article key={section.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </article>
        ))}
      </section>

      <section className="beta2-notice" aria-label={c.noteTitle}>
        <div>
          <span>{c.noteTitle}</span>
          <p>{c.noteBody}</p>
        </div>
        <Link href={localizePath('/daily', locale)}>{locale === 'en' ? 'Test daily ritual' : '測每日儀式'}</Link>
      </section>
    </main>
  );
}
