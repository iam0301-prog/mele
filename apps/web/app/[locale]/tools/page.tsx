import Link from 'next/link';
import type { Metadata } from 'next';
import {
  LOCALES,
  buildLocalizedMetadata,
  getDictionary,
  isLocale,
  localizePath,
  type Locale,
} from '@/lib/i18n';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const betaStatusBySlug = {
  numerology: { zh: '推薦先測', en: 'Start here', level: 'ready' },
  tarot: { zh: '推薦先測', en: 'Start here', level: 'ready' },
  maya: { zh: '已可測', en: 'Testable', level: 'ready' },
  runes: { zh: '已可測', en: 'Testable', level: 'ready' },
  humandesign: { zh: '已可測', en: 'Testable', level: 'ready' },
  bazi: { zh: '已可測', en: 'Testable', level: 'ready' },
  astro: { zh: '已可測', en: 'Testable', level: 'ready' },
  ziwei: { zh: '已可測', en: 'Testable', level: 'ready' },
} as const;

type ToolSlug = keyof typeof betaStatusBySlug;

const toolsBetaCopy = {
  'zh-TW': {
    kicker: 'PUBLIC BETA TOOL MAP',
    title: '公開測試先測這幾個入口',
    body: '不要一次打開八種工具。公開測試的目標是確認：哪個工具最容易看懂、哪個流程會卡、哪個結果讓人願意回來。建議先從生命靈數、塔羅、每日儀式開始。',
    primary: '先測生命靈數',
    secondary: '試抽塔羅',
    daily: '每日儀式',
    boardTitle: '今天的工具測試順序',
    boardItems: ['先跑一個不需要出生時間的工具', '確認結果是否看得懂、有沒有下一步', '再測深度內容解讀或回報卡住處'],
    gridTitle: '工具公開測試狀態',
    gridBody: '標籤不是功能分級，而是告訴測試者「先測哪個、哪裡要特別看」。',
    feedbackTitle: '測完請回報一個地方',
    feedbackBody: '只要回報一個卡住點就有價值：看不懂、按鈕不明顯、手機太擠、結果太空泛、登入或保存紀錄不順。',
    feedbackCta: '回報測試問題',
    teacherTitle: '老師諮詢仍保留，但不當成主線',
    teacherBody: '公開測試先驗證工具與每日流程。老師入口保留給想深聊的人，不強迫、不假裝所有老師流程都已正式營運。',
  },
  en: {
    kicker: 'PUBLIC BETA TOOL MAP',
    title: 'Test these tool entrances first',
    body: 'Do not open all eight tools at once. Public beta should reveal which tool is easiest to understand, where the flow breaks, and which result makes someone want to return.',
    primary: 'Test numerology first',
    secondary: 'Try tarot',
    daily: 'Daily ritual',
    boardTitle: 'Suggested testing order',
    boardItems: ['Start with a tool that does not need birth time', 'Check whether the result is readable and has a next step', 'Then test deeper readings or report friction'],
    gridTitle: 'Tool public beta status',
    gridBody: 'The labels are not feature rankings. They tell testers what to try first and what to watch carefully.',
    feedbackTitle: 'After testing, report one thing',
    feedbackBody: 'One friction point is enough: unclear text, hidden button, cramped mobile layout, generic result, or login / saved-record friction.',
    feedbackCta: 'Report beta issue',
    teacherTitle: 'Guides remain optional, not the main path',
    teacherBody: 'Public beta validates tools and daily loops first. Guide entry stays available for deeper conversations, without pretending every guide workflow is already final.',
  },
} as const;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

async function resolveLocale(params: PageProps['params']): Promise<Locale> {
  const { locale } = await params;
  return isLocale(locale) ? locale : 'zh-TW';
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);

  return buildLocalizedMetadata({
    locale,
    dictionary,
    pathname: '/tools',
    title: `${dictionary.nav.tools} | ${dictionary.meta.siteName}`,
    description: dictionary.home.toolsBody,
  });
}

export default async function LocalizedToolsPage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const dict = await getDictionary(locale);
  const copy = locale === 'en' ? toolsBetaCopy.en : toolsBetaCopy['zh-TW'];
  const featuredTools = dict.home.tools.slice(0, 4);

  return (
    <main className="home-page tools-public-beta-page min-h-screen">
      <section className="home-hero tools-public-beta-hero">
        <div className="home-hero__content">
          <div className="home-beta-badge">{copy.kicker}</div>
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
          <div className="home-hero__actions">
            <Link href={localizePath('/tools/numerology', locale)} className="mele-btn-primary">
              {copy.primary}
            </Link>
            <Link href={localizePath('/tools/tarot', locale)} className="mele-btn-secondary">
              {copy.secondary}
            </Link>
            <Link href={localizePath('/daily', locale)} className="home-ghost-link">
              {copy.daily}
            </Link>
          </div>
        </div>

        <aside className="home-oracle-console" aria-label={copy.boardTitle}>
          <div className="home-oracle-console__header">
            <span>{dict.home.badge}</span>
            <strong>{copy.boardTitle}</strong>
          </div>
          <ol className="home-oracle-console__tasks">
            {copy.boardItems.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{item}</p>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="home-section">
        <div className="home-section__header">
          <span>{copy.kicker}</span>
          <h2>{copy.gridTitle}</h2>
          <p>{copy.gridBody}</p>
        </div>
        <div className="home-quick-grid tools-beta-grid" aria-label={`${dict.nav.tools} · ${copy.gridTitle}`}>
          {dict.home.tools.map((tool) => {
            const status = betaStatusBySlug[tool.slug as ToolSlug];
            const label = locale === 'en' ? status?.en : status?.zh;
            return (
              <Link href={localizePath(`/tools/${tool.slug}`, locale)} key={tool.slug} className="home-quick-card tools-beta-card">
                <span>{tool.tag}</span>
                <strong className={`tools-beta-status tools-beta-status--${status?.level ?? 'ready'}`}>{label}</strong>
                <h3>{tool.name}</h3>
                <p>{tool.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="home-section home-section--final tools-feedback-strip">
        <div>
          <span>FEEDBACK</span>
          <h2>{copy.feedbackTitle}</h2>
          <p>{copy.feedbackBody}</p>
        </div>
        <div className="home-proof-list">
          <Link href={localizePath('/feedback', locale)}>
            <span>{copy.feedbackCta}</span>
          </Link>
          <Link href={localizePath('/beta', locale)}>
            <span>{dict.nav.beta}</span>
          </Link>
        </div>
      </section>

      <section className="home-section home-section--final">
        <div>
          <span>{dict.home.roleKicker}</span>
          <h2>{copy.teacherTitle}</h2>
          <p>{copy.teacherBody}</p>
        </div>
        <div className="home-proof-list">
          {dict.home.roles.map((role) => (
            <Link href={localizePath(role.href, locale)} key={role.role}>
              <span>{role.action}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
