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
  scopeClassName,
}: {
  locale: Locale;
  copy: StaticPageCopy;
  primaryHref: string;
  secondaryHref: string;
  /** 額外包一層 scope class（例如 "mag-legal-page"），只給指定頁面套紙感樣式，
   * 不影響其他共用同一元件但沒傳這個 prop 的頁面（如 ar、mobile）。 */
  scopeClassName?: string;
}) {
  return (
    <main className={`home-page min-h-screen${scopeClassName ? ` ${scopeClassName}` : ''}`}>
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
