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

const TOOL_GROUPS = [
  { key: 'self', slugs: ['numerology', 'humandesign', 'maya'], zh: ['認識自己', '看見性格、天賦與做決定的方式'], en: ['Understand yourself', 'Personality, strengths, and how you decide'] },
  { key: 'life', slugs: ['astro', 'bazi', 'ziwei'], zh: ['理解人生脈絡', '把長期模式、關係與人生階段放回完整盤面'], en: ['See the bigger pattern', 'Long-term patterns, relationships, and life stages'] },
  { key: 'now', slugs: ['tarot', 'runes'], zh: ['解開眼前的問題', '帶著一個具體問題，整理現在最值得注意的方向'], en: ['Untangle what is happening now', 'Bring one question and find the direction that matters now'] },
] as const;

// 雜誌目錄式工具列表文案。改任何 key 都要六語言一起補齊，且不可出現金額/點數/付費字眼。
const toolsCopy = {
  'zh-TW': {
    kicker: 'TOOL MAP',
    title: '從這幾個工具開始探索',
    body: '不用一次打開所有工具。建議先從生命靈數、塔羅這兩個入門工具開始，找到感興趣的再慢慢深入完整目錄。',
    featuredKicker: '精選入門',
    featuredNumerologyDesc: '只需要出生日期，最快看懂自己的節奏。',
    featuredTarotDesc: '寫下一個問題，抽牌看看此刻的自己。',
    directoryKicker: '依需求選擇',
    directoryTitle: '先找到問題，再選工具',
    teacherKicker: '需要更深入時',
    teacherTitle: '需要時，找老師',
    teacherBody: '工具是自我探索的起點。老師是選項，不是必須；你可以只用工具，不找老師。',
    teacherAction: '瀏覽老師',
  },
  en: {
    kicker: 'TOOL MAP',
    title: 'Start exploring from here',
    body: 'No need to open everything at once. Start with numerology and tarot, then explore the full directory when something resonates.',
    featuredKicker: 'Start here',
    featuredNumerologyDesc: 'Just your birth date — the fastest way to see your own rhythm.',
    featuredTarotDesc: 'Write down a question, then draw cards to see where you are now.',
    directoryKicker: 'CHOOSE BY NEED',
    directoryTitle: 'Start with the question, not the system',
    teacherKicker: 'For when you want more',
    teacherTitle: 'Find a guide, if you need one',
    teacherBody: 'Tools are where self-discovery begins. Guides are optional, never required — you can always use tools alone.',
    teacherAction: 'Browse guides',
  },
  vi: {
    kicker: 'TOOL MAP',
    title: 'Bắt đầu khám phá từ đây',
    body: 'Không cần mở hết mọi công cụ một lúc. Hãy bắt đầu với thần số học và tarot, rồi khám phá mục lục đầy đủ khi có điều gì chạm đến bạn.',
    featuredKicker: 'Bắt đầu ở đây',
    featuredNumerologyDesc: 'Chỉ cần ngày sinh — cách nhanh nhất để thấy nhịp điệu của chính mình.',
    featuredTarotDesc: 'Viết ra một câu hỏi, rồi rút bài để xem con người bạn lúc này.',
    directoryKicker: 'CONTENTS',
    directoryTitle: 'Mục lục đầy đủ — tám lối vào',
    teacherKicker: 'Khi cần thêm chiều sâu',
    teacherTitle: 'Cần thì tìm chuyên gia',
    teacherBody: 'Công cụ là điểm khởi đầu để tự khám phá. Chuyên gia là lựa chọn, không phải bắt buộc — bạn luôn có thể chỉ dùng công cụ.',
    teacherAction: 'Xem danh sách chuyên gia',
  },
  id: {
    kicker: 'TOOL MAP',
    title: 'Mulai eksplorasi dari sini',
    body: 'Tidak perlu membuka semua alat sekaligus. Mulai dari numerologi dan tarot, lalu jelajahi daftar lengkap saat ada yang beresonansi.',
    featuredKicker: 'Mulai di sini',
    featuredNumerologyDesc: 'Cukup tanggal lahir — cara tercepat melihat ritme dirimu.',
    featuredTarotDesc: 'Tuliskan satu pertanyaan, lalu tarik kartu untuk melihat dirimu saat ini.',
    directoryKicker: 'CONTENTS',
    directoryTitle: 'Daftar lengkap — delapan pintu masuk',
    teacherKicker: 'Saat butuh lebih dalam',
    teacherTitle: 'Cari pemandu jika perlu',
    teacherBody: 'Alat adalah titik awal eksplorasi diri. Pemandu adalah pilihan, bukan keharusan — kamu selalu bisa hanya memakai alat.',
    teacherAction: 'Lihat daftar pemandu',
  },
  ja: {
    kicker: 'TOOL MAP',
    title: 'ここから探索を始めましょう',
    body: '一度にすべて開く必要はありません。まず数秘術とタロットから始めて、気になったら完全な目次を見てみてください。',
    featuredKicker: 'まずはここから',
    featuredNumerologyDesc: '生年月日だけで、自分のリズムを一番早く知る方法。',
    featuredTarotDesc: '質問を書き出して、カードを引いて今の自分を見てみましょう。',
    directoryKicker: 'CONTENTS',
    directoryTitle: '全ツール目次——8つの入口',
    teacherKicker: 'もっと深く知りたいときは',
    teacherTitle: '必要なときにガイドを探す',
    teacherBody: 'ツールは自己探索の出発点です。ガイドは選択肢であり、必須ではありません——いつでもツールだけ使うこともできます。',
    teacherAction: 'ガイドを見る',
  },
  ko: {
    kicker: 'TOOL MAP',
    title: '여기서부터 탐색을 시작하세요',
    body: '한 번에 모든 도구를 열 필요는 없어요. 먼저 수비학과 타로부터 시작하고, 공감되는 부분이 있으면 전체 목차를 살펴보세요.',
    featuredKicker: '여기서 시작',
    featuredNumerologyDesc: '생년월일만 있으면 가장 빠르게 나의 리듬을 볼 수 있어요.',
    featuredTarotDesc: '질문 하나를 적고, 카드를 뽑아 지금의 나를 살펴보세요.',
    directoryKicker: 'CONTENTS',
    directoryTitle: '전체 목차 — 여덟 개의 입구',
    teacherKicker: '더 깊이 알고 싶을 때',
    teacherTitle: '필요할 때 가이드 찾기',
    teacherBody: '도구는 자기 탐색의 출발점입니다. 가이드는 선택지이지 필수가 아닙니다 — 언제든 도구만 사용해도 괜찮아요.',
    teacherAction: '가이드 보기',
  },
} as const;

function getToolsCopy(locale: Locale) {
  if (locale in toolsCopy) {
    return toolsCopy[locale as keyof typeof toolsCopy];
  }
  return toolsCopy['zh-TW'];
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
  const copy = getToolsCopy(locale);
  const tools = dict.home.tools;
  const numerology = tools.find((tool) => tool.slug === 'numerology');
  const tarot = tools.find((tool) => tool.slug === 'tarot');
  const groupedTools = TOOL_GROUPS.map((group) => ({
    ...group,
    label: locale === 'zh-TW' ? group.zh : group.en,
    tools: group.slugs.map((slug) => tools.find((tool) => tool.slug === slug)).filter(Boolean),
  }));

  return (
    <main className="mag-tools-page">
      <section className="mag-tools-page__section mag-tools-page__head" aria-label={dict.nav.tools}>
        <span className="mag-label">{copy.kicker}</span>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>

        <div className="mag-tools-page__featured" aria-label={copy.featuredKicker}>
          {numerology && (
            <Link href={localizePath(`/tools/${numerology.slug}`, locale)} className="mag-tools-page__featured-card">
              <span className="mag-label">{copy.featuredKicker}</span>
              <strong>{numerology.name}</strong>
              <p>{copy.featuredNumerologyDesc}</p>
            </Link>
          )}
          {tarot && (
            <Link href={localizePath(`/tools/${tarot.slug}`, locale)} className="mag-tools-page__featured-card">
              <span className="mag-label">{copy.featuredKicker}</span>
              <strong>{tarot.name}</strong>
              <p>{copy.featuredTarotDesc}</p>
            </Link>
          )}
        </div>
      </section>

      <section className="mag-tools-page__section" aria-label={copy.directoryTitle}>
        <span className="mag-label">{copy.directoryKicker}</span>
        <h2>{copy.directoryTitle}</h2>
        <div className="tool-needs-grid">
          {groupedTools.map((group, groupIndex) => (
            <section key={group.key} className="tool-needs-group" aria-labelledby={`tool-group-${group.key}`}>
              <div className="tool-needs-group__head">
                <span aria-hidden="true">{String(groupIndex + 1).padStart(2, '0')}</span>
                <div>
                  <h3 id={`tool-group-${group.key}`}>{group.label[0]}</h3>
                  <p>{group.label[1]}</p>
                </div>
              </div>
              <ul>
                {group.tools.map((tool) => tool && (
                  <li key={tool.slug}>
                    <Link href={localizePath(`/tools/${tool.slug}`, locale)}>
                      <span><b>{tool.name}</b><small>{tool.desc}</small></span>
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="mag-tools-page__section mag-tools-page__strip" aria-label={copy.teacherTitle}>
        <div>
          <span className="mag-label">{copy.teacherKicker}</span>
          <h2>{copy.teacherTitle}</h2>
          <p>{copy.teacherBody}</p>
        </div>
        <Link href={localizePath('/teachers', locale)}>{copy.teacherAction}</Link>
      </section>
    </main>
  );
}
