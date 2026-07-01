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
  numerology: { zh: '推薦入門', en: 'Start here', level: 'ready' },
  tarot: { zh: '推薦入門', en: 'Start here', level: 'ready' },
  maya: { zh: '立即使用', en: 'Available', level: 'ready' },
  runes: { zh: '立即使用', en: 'Available', level: 'ready' },
  humandesign: { zh: '立即使用', en: 'Available', level: 'ready' },
  bazi: { zh: '立即使用', en: 'Available', level: 'ready' },
  astro: { zh: '立即使用', en: 'Available', level: 'ready' },
  ziwei: { zh: '立即使用', en: 'Available', level: 'ready' },
} as const;

type ToolSlug = keyof typeof betaStatusBySlug;

const toolsBetaCopy = {
  'zh-TW': {
    kicker: 'TOOL MAP',
    title: '從這幾個工具開始探索',
    body: '不用一次打開所有工具。建議先從生命靈數、塔羅或每日儀式進入，找到感興趣的再慢慢深入。',
    primary: '探索生命靈數',
    secondary: '試抽塔羅',
    daily: '每日儀式',
    boardTitle: '今天的探索建議',
    boardItems: ['先跑一個不需要出生時間的工具', '確認結果是否看得懂、有沒有下一步', '再深入解讀或找老師細聊'],
    gridTitle: '工具一覽',
    gridBody: '所有工具免費使用，建議從最容易上手的開始探索。',
    feedbackTitle: '使用有感，歡迎告訴我們',
    feedbackBody: '文字看不懂、按鈕不明顯、手機太擠、結果太空泛，或登入保存不順，都歡迎告知。',
    feedbackCta: '意見回報',
    teacherTitle: '老師諮詢保留，作為深入對話的選項',
    teacherBody: '工具是自我探索的起點。老師入口保留給想深聊的人，你可以先用工具探索，再決定是否進一步諮詢。',
  },
  en: {
    kicker: 'TOOL MAP',
    title: 'Start exploring from here',
    body: 'No need to open everything at once. Start with numerology, tarot, or the daily ritual — then go deeper where it resonates.',
    primary: 'Explore numerology',
    secondary: 'Try tarot',
    daily: 'Daily ritual',
    boardTitle: 'Where to start today',
    boardItems: ['Start with a tool that does not need birth time', 'Check whether the result is readable and has a next step', 'Then go deeper or connect with a guide'],
    gridTitle: 'All tools',
    gridBody: 'All tools are free. Start with the ones that feel most relevant and go from there.',
    feedbackTitle: 'If something feels off, let us know',
    feedbackBody: 'Unclear text, hidden buttons, cramped mobile layout, generic results, or login issues — any feedback helps.',
    feedbackCta: 'Leave feedback',
    teacherTitle: 'Guides are available for deeper conversations',
    teacherBody: 'Tools are where self-discovery begins. Guide sessions are for when you want to go deeper — explore the tools at your own pace first.',
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
