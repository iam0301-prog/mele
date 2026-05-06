import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NumerologyPage from '@/app/tools/numerology/page';
import MayaPage from '@/app/tools/maya/page';
import BaziPage from '@/app/tools/bazi/page';
import AstroPage from '@/app/tools/astro/page';
import ZiweiPage from '@/app/tools/ziwei/page';
import HumanDesignPage from '@/app/tools/humandesign/page';
import TarotPage from '@/app/tools/tarot/page';
import RunesPage from '@/app/tools/runes/page';
import { LOCALES, buildLocalizedMetadata, getDictionary, isLocale, type Locale } from '@/lib/i18n';
import { getToolPageCopy } from '@/lib/i18n/tool-page-copy';

const TOOL_PAGES = {
  numerology: NumerologyPage,
  maya: MayaPage,
  bazi: BaziPage,
  astro: AstroPage,
  ziwei: ZiweiPage,
  humandesign: HumanDesignPage,
  tarot: TarotPage,
  runes: RunesPage,
} as const;

type ToolSlug = keyof typeof TOOL_PAGES;

interface PageProps {
  params: Promise<{ locale: string; tool: string }>;
}

function isToolSlug(value: string): value is ToolSlug {
  return value in TOOL_PAGES;
}

async function resolveParams(params: PageProps['params']) {
  const { locale, tool } = await params;
  if (!isLocale(locale) || !isToolSlug(tool)) return null;
  return { locale, tool };
}

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    (Object.keys(TOOL_PAGES) as ToolSlug[]).map((tool) => ({ locale, tool })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await resolveParams(params);
  if (!resolved) return {};

  const dictionary = await getDictionary(resolved.locale);
  const copy = getToolPageCopy(resolved.locale, resolved.tool);

  return buildLocalizedMetadata({
    locale: resolved.locale,
    dictionary,
    pathname: `/tools/${resolved.tool}`,
    title: `${copy.title} | ${dictionary.meta.siteName}`,
    description: copy.description,
  });
}

export default async function LocalizedToolPage({ params }: PageProps) {
  const resolved = await resolveParams(params);
  if (!resolved) notFound();

  const Page = TOOL_PAGES[resolved.tool];
  return <Page />;
}
