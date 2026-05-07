import Image from 'next/image';
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
  searchParams?: Promise<{ invite?: string; segment?: string }>;
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

async function resolveLocale(params: PageProps['params']): Promise<Locale> {
  const { locale } = await params;
  return isLocale(locale) ? locale : 'zh-TW';
}

function betaSignupHref(locale: Locale, invite = 'closed-beta', segment = 'closed-beta') {
  const params = new URLSearchParams({
    mode: 'signup',
    invite,
    segment,
    return: localizePath('/account/charts', locale),
  });
  return `${localizePath('/account/login', locale)}?${params.toString()}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);

  return buildLocalizedMetadata({
    locale,
    dictionary,
    pathname: '/beta',
    title: dictionary.beta.seoTitle,
    description: dictionary.beta.seoDescription,
  });
}

export default async function BetaEntryPage({ params, searchParams }: PageProps) {
  const locale = await resolveLocale(params);
  const query = await searchParams;
  const inviteCode = query?.invite?.trim() || 'closed-beta';
  const segment = query?.segment?.trim() || 'closed-beta';
  const dict = await getDictionary(locale);
  const beta = dict.beta;
  const signupHref = betaSignupHref(locale, inviteCode, segment);

  return (
    <main className="home-page min-h-screen">
      <section className="home-hero">
        <div className="home-hero__content">
          <div className="home-beta-badge">{beta.badge}</div>
          <h1>{beta.title}</h1>
          <p>{beta.description}</p>
          <div className="home-hero__actions">
            <Link href={signupHref} className="mele-btn-primary">
              {beta.primaryCta}
            </Link>
            <Link href={localizePath('/tools', locale)} className="mele-btn-secondary">
              {beta.secondaryCta}
            </Link>
            <Link href={localizePath('/daily', locale)} className="home-ghost-link">
              {beta.dailyCta}
            </Link>
          </div>
          <p className="text-xs text-white/48">{beta.inviteNote}</p>
        </div>

        <aside className="home-oracle-console" aria-label={beta.panelTitle}>
          <div className="home-oracle-console__header">
            <span>{beta.panelLabel}</span>
            <strong>{beta.panelTitle}</strong>
          </div>
          <div className="home-oracle-console__visuals" aria-label={beta.panelTitle}>
            <Image
              src="/tarot/cards/ocean_poseidon/1.webp"
              alt={dict.home.console.tarotAlt}
              width={240}
              height={360}
              className="home-oracle-console__card"
              priority
            />
            <Image
              src="/maya/totems/yellow-human.png"
              alt={dict.home.console.mayaAlt}
              width={132}
              height={132}
              className="home-oracle-console__totem"
            />
          </div>
          <ol className="home-oracle-console__tasks">
            {beta.panelItems.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{item}</p>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="home-proof-strip" aria-label={beta.rulesTitle}>
        {beta.rules.map((rule) => (
          <article key={rule.label}>
            <span>{rule.label}</span>
            <strong>{rule.value}</strong>
            <p>{rule.body}</p>
          </article>
        ))}
      </section>

      <section className="home-section home-section--split">
        <div className="home-beta-mission">
          <span>{beta.questsTitle}</span>
          <h2>{beta.questsTitle}</h2>
          <p>{beta.questsBody}</p>
          <div className="home-beta-mission__actions">
            <Link href={signupHref}>{beta.primaryCta}</Link>
            <Link href={localizePath('/account/login', locale)}>{dict.nav.login}</Link>
          </div>
        </div>
        <div className="home-beta-roadmap">
          {beta.quests.map((quest, index) => (
            <article key={quest.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{quest.title}</h3>
                <p>{quest.body}</p>
                <div className="mt-3">
                  <Link href={localizePath(quest.href, locale)} className="home-ghost-link">
                    {quest.action}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-section--final">
        <div>
          <span>FEEDBACK</span>
          <h2>{beta.feedbackTitle}</h2>
          <p>{beta.feedbackBody}</p>
        </div>
        <div className="home-proof-list">
          {beta.proof.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
