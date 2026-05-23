import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { DailyPointsClaim } from '@/components/DailyPointsClaim';
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
    pathname: '/',
  });
}

export default async function LocalizedHomePage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const dict = await getDictionary(locale);
  const { home, markets } = dict;

  return (
    <main className="home-page min-h-screen">
      <section className="home-hero">
        <div className="home-hero__content">
          <div className="home-beta-badge">{home.badge}</div>
          <div>
            <h1>{home.title}</h1>
            <p className="home-hero__subtitle">{home.subtitle}</p>
          </div>
          <p className="home-hero__description">{home.description}</p>
          {/* Primary CTA — Daily ritual is the engagement loop, get it big & alone first. */}
          <div className="home-hero__primary-cta">
            <Link
              href={localizePath('/daily', locale)}
              className="mele-btn-primary !text-base !px-7 !py-3.5 shadow-[0_0_24px_rgba(212,175,55,0.25)] hover:shadow-[0_0_32px_rgba(212,175,55,0.4)] transition-shadow"
            >
              ✨ {home.actions.daily}
            </Link>
            {locale === 'zh-TW' && (
              <p className="mt-2 text-xs tracking-wide text-white/55">
                新訪客建議從每日儀式開始：免費抽今日塔羅或盧恩，登入後再領 200 點。
              </p>
            )}
          </div>
          {/* Secondary actions — give space to choose path without competing with primary */}
          <div className="home-hero__actions">
            <Link href={localizePath('/tools/tarot', locale)} className="mele-btn-secondary">
              {home.actions.tarot}
            </Link>
            <Link href={localizePath('/teachers', locale)} className="home-ghost-link">
              {home.actions.teachers}
            </Link>
            <Link
              href={localizePath('/beta', locale)}
              className="home-ghost-link text-xs opacity-75 hover:opacity-100"
            >
              {dict.nav.beta} →
            </Link>
          </div>
        </div>

        <div className="home-oracle-console" aria-label={home.console.ariaLabel}>
          <div className="home-oracle-console__header">
            <span>{home.console.label}</span>
            <strong>{home.console.title}</strong>
          </div>
          <div className="home-oracle-console__visuals" aria-label={home.subtitle}>
            <Image
              src="/tarot/cards/ocean_poseidon/19.webp"
              alt={home.console.tarotAlt}
              width={240}
              height={360}
              className="home-oracle-console__card"
              priority
            />
            <Image
              src="/maya/totems/yellow-human.png"
              alt={home.console.mayaAlt}
              width={132}
              height={132}
              className="home-oracle-console__totem"
            />
          </div>
          <ol className="home-oracle-console__tasks">
            {home.console.tasks.map((task, index) => (
              <li key={task}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{task}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {locale === 'zh-TW' && (
        <section className="home-section" aria-label="會員每日點數">
          <div className="mx-auto max-w-2xl">
            <DailyPointsClaim returnPath={localizePath('/', locale)} />
          </div>
        </section>
      )}

      <section className="home-proof-strip" aria-label={home.subtitle}>
        {home.stats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.hint}</p>
          </article>
        ))}
      </section>

      <section className="home-section home-section--markets">
        <div className="home-section__header">
          <span>{home.marketsKicker}</span>
          <h2>{home.marketsTitle}</h2>
          <p>{home.marketsBody}</p>
        </div>
        <div className="home-market-grid">
          {markets.items.map((market) => (
            <Link href={market.href} key={market.locale} className="home-market-card" hrefLang={market.locale}>
              <em>{market.status}</em>
              <span>
                <strong>{market.name}</strong>
                <small>{market.body}</small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__header">
          <span>{home.toolsKicker}</span>
          <h2>{home.toolsTitle}</h2>
          <p>{home.toolsBody}</p>
        </div>
        <div className="home-quick-grid">
          {home.tools.map((tool) => (
            <Link href={localizePath(`/tools/${tool.slug}`, locale)} key={tool.slug} className="home-quick-card">
              <span>{tool.tag}</span>
              <h3>{tool.name}</h3>
              <p>{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__header">
          <span>{home.roleKicker}</span>
          <h2>{home.roleTitle}</h2>
          <p>{home.roleBody}</p>
        </div>
        <div className="home-role-lanes">
          {home.roles.map((lane) => (
            <article key={lane.role}>
              <span>{lane.role}</span>
              <h3>{lane.title}</h3>
              <p>{lane.body}</p>
              <Link href={localizePath(lane.href, locale)}>{lane.action}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-section--final">
        <div>
          <span>{home.finalKicker}</span>
          <h2>{home.finalTitle}</h2>
          <p>{home.finalBody}</p>
        </div>
        <div className="home-proof-list">
          {home.proof.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
