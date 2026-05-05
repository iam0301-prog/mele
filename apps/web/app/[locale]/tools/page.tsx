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
  const featuredTools = dict.home.tools.slice(0, 4);

  return (
    <main className="home-page min-h-screen">
      <section className="home-hero">
        <div className="home-hero__content">
          <div className="home-beta-badge">{dict.home.toolsKicker}</div>
          <h1>{dict.home.toolsTitle}</h1>
          <p>{dict.home.toolsBody}</p>
          <div className="home-hero__actions">
            <Link href={localizePath('/tools/numerology', locale)} className="mele-btn-primary">
              {dict.home.tools.find((tool) => tool.slug === 'numerology')?.name ?? 'Numerology'}
            </Link>
            <Link href={localizePath('/tools/humandesign', locale)} className="mele-btn-secondary">
              {dict.home.tools.find((tool) => tool.slug === 'humandesign')?.name ?? 'Human Design'}
            </Link>
            <Link href={localizePath('/daily', locale)} className="home-ghost-link">
              {dict.nav.daily}
            </Link>
          </div>
        </div>

        <aside className="home-oracle-console" aria-label={dict.home.toolsTitle}>
          <div className="home-oracle-console__header">
            <span>{dict.home.badge}</span>
            <strong>{dict.home.console.title}</strong>
          </div>
          <ol className="home-oracle-console__tasks">
            {featuredTools.map((tool, index) => (
              <li key={tool.slug}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>
                  <strong className="text-accent-light">{tool.name}</strong>
                  <br />
                  {tool.desc}
                </p>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="home-section">
        <div className="home-section__header">
          <span>{dict.home.toolsKicker}</span>
          <h2>{dict.nav.tools}</h2>
          <p>{dict.home.toolsBody}</p>
        </div>
        <div className="home-quick-grid" aria-label={dict.nav.tools}>
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
          <span>{dict.home.roleKicker}</span>
          <h2>{dict.home.roleTitle}</h2>
          <p>{dict.home.roleBody}</p>
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
