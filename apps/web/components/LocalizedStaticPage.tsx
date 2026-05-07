import Link from 'next/link';
import { localizePath, type Locale } from '@/lib/i18n/config';

type StaticPageCopy = {
  kicker: string;
  title: string;
  body: string;
  sections: Array<{ title: string; body: string }>;
  primary: string;
  secondary: string;
};

export function LocalizedStaticPage({
  locale,
  copy,
  primaryHref,
  secondaryHref,
}: {
  locale: Locale;
  copy: StaticPageCopy;
  primaryHref: string;
  secondaryHref: string;
}) {
  return (
    <main className="home-page min-h-screen">
      <section className="home-hero">
        <div className="home-hero__content">
          <div className="home-beta-badge">{copy.kicker}</div>
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
          <div className="home-hero__actions">
            <Link href={localizePath(primaryHref, locale)} className="mele-btn-primary">
              {copy.primary}
            </Link>
            <Link href={localizePath(secondaryHref, locale)} className="mele-btn-secondary">
              {copy.secondary}
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-quick-grid">
          {copy.sections.map((section) => (
            <article key={section.title} className="home-quick-card">
              <span>{copy.kicker}</span>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
