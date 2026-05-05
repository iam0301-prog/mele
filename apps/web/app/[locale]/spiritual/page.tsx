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

const SECTION_KEYS = [
  ['freeTests', 'freeTestsBody'],
  ['persona', 'personaBody'],
  ['articles', 'articlesBody'],
  ['video', 'videoBody'],
  ['social', 'socialBody'],
  ['teacherCta', 'teacherCtaBody'],
] as const;

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
  const market = dictionary.markets.items.find((item) => item.locale === locale);

  return buildLocalizedMetadata({
    locale,
    dictionary,
    pathname: '/spiritual',
    title: market ? `${market.name} | ${dictionary.meta.siteName}` : dictionary.meta.title,
    description: market?.body ?? dictionary.markets.page.heroBody,
  });
}

export default async function SpiritualMarketPage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const dict = await getDictionary(locale);
  const market = dict.markets.items.find((item) => item.locale === locale) ?? dict.markets.items[0];
  const page = dict.markets.page;
  const toolLabel = (slug: string) => dict.home.tools.find((tool) => tool.slug === slug)?.name ?? slug;
  const quickLinks = [
    { href: '/daily', label: dict.nav.daily },
    { href: '/tools/numerology', label: toolLabel('numerology') },
    { href: '/tools/humandesign', label: toolLabel('humandesign') },
    { href: '/tools/tarot', label: toolLabel('tarot') },
    { href: '/teachers', label: page.teacherCtaButton },
  ];

  return (
    <main className="home-page min-h-screen">
      <section className="home-hero">
        <div className="home-hero__content">
          <div className="home-beta-badge">{page.kicker}</div>
          <h1>{market.name}</h1>
          <p>{page.heroBody}</p>
          <div className="home-hero__actions">
            <Link href={localizePath('/tools/numerology', locale)} className="mele-btn-primary">
              {page.primaryCta}
            </Link>
            <Link href={localizePath('/teachers', locale)} className="mele-btn-secondary">
              {page.teacherCtaButton}
            </Link>
          </div>
        </div>

        <aside className="home-oracle-console" aria-label={page.heroTitle}>
          <div className="home-oracle-console__header">
            <span>{market.status}</span>
            <strong>{page.heroTitle}</strong>
          </div>
          <ol className="home-oracle-console__tasks">
            {SECTION_KEYS.slice(0, 3).map(([titleKey, bodyKey], index) => (
              <li key={titleKey}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>
                  <strong className="text-accent-light">{page[titleKey]}</strong>
                  <br />
                  {page[bodyKey]}
                </p>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="home-section">
        <div className="home-section__header">
          <span>{page.kicker}</span>
          <h2>{page.heroTitle}</h2>
          <p>{market.body}</p>
        </div>
        <div className="home-tool-grid">
          {SECTION_KEYS.map(([titleKey, bodyKey]) => (
            <article key={titleKey} className="home-tool-card">
              <em>{page.kicker}</em>
              <h3>{page[titleKey]}</h3>
              <p>{page[bodyKey]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__header">
          <span>{dict.home.toolsKicker}</span>
          <h2>{dict.home.toolsTitle}</h2>
          <p>{dict.home.toolsBody}</p>
        </div>
        <div className="home-quick-grid" aria-label={dict.home.toolsTitle}>
          {dict.home.tools.map((tool) => (
            <Link href={localizePath(`/tools/${tool.slug}`, locale)} key={tool.slug} className="home-quick-card">
              <span>{tool.tag}</span>
              <h3>{tool.name}</h3>
              <p>{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section home-section--final">
        <div>
          <span>{dict.home.finalKicker}</span>
          <h2>{page.teacherCta}</h2>
          <p>{page.teacherCtaBody}</p>
        </div>
        <div className="home-proof-list">
          {quickLinks.map((item) => (
            <Link href={localizePath(item.href, locale)} key={item.href}>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
