import type { Metadata } from 'next';
import Link from 'next/link';
import { isLocale, localizePath, type Locale } from '@/lib/i18n';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tool?: string; title?: string; summary?: string; source?: string }>;
};

const TOOL_NAMES: Record<string, Record<Locale, string>> = {
  numerology: { 'zh-TW': '生命靈數', en: 'Numerology', vi: 'Thần số học', id: 'Numerologi', ja: '数秘術', ko: '생명수' },
  maya: { 'zh-TW': '馬雅曆', en: 'Maya Calendar', vi: 'Lịch Maya', id: 'Kalender Maya', ja: 'マヤ暦', ko: '마야력' },
  bazi: { 'zh-TW': '八字', en: 'Bazi', vi: 'Bát Tự', id: 'Bazi', ja: '四柱推命', ko: '사주' },
  ziwei: { 'zh-TW': '紫微斗數', en: 'Zi Wei', vi: 'Tử Vi', id: 'Zi Wei', ja: '紫微斗数', ko: '자미두수' },
  tarot: { 'zh-TW': '塔羅', en: 'Tarot', vi: 'Tarot', id: 'Tarot', ja: 'タロット', ko: '타로' },
  runes: { 'zh-TW': '盧恩符文', en: 'Runes', vi: 'Rune', id: 'Rune', ja: 'ルーン', ko: '룬' },
  astro: { 'zh-TW': '占星', en: 'Astrology', vi: 'Chiêm tinh', id: 'Astrologi', ja: '占星術', ko: '점성술' },
  humandesign: { 'zh-TW': '人類圖', en: 'Human Design', vi: 'Human Design', id: 'Human Design', ja: 'ヒューマンデザイン', ko: '휴먼디자인' },
};

const SHARE_COPY: Record<Locale, {
  insightFrom: (toolName: string) => string;
  defaultTitle: string;
  defaultSummary: string;
  privacyNote: string;
  cta: string;
  noSignup: string;
}> = {
  'zh-TW': {
    insightFrom: (toolName) => `來自 ${toolName} 的發現`,
    defaultTitle: '一個值得多看一眼的自己',
    defaultSummary: '有人透過 MELE 整理出一個新的自我理解角度。',
    privacyNote: '這是一段匿名摘要，不包含生日、出生時間、地點或完整個人結果。',
    cta: '產生我的結果',
    noSignup: '不需要先懂命理，也不必先註冊。',
  },
  en: {
    insightFrom: (toolName) => `An insight from ${toolName}`,
    defaultTitle: 'A part of yourself worth noticing',
    defaultSummary: 'Someone found a new angle on themselves with MELE.',
    privacyNote: 'This anonymous preview contains no birth date, time, location, or full personal result.',
    cta: 'Create my result',
    noSignup: 'No prior knowledge or sign-up required.',
  },
  vi: {
    insightFrom: (toolName) => `Một phát hiện từ ${toolName}`,
    defaultTitle: 'Một phần con người bạn đáng để nhìn kỹ hơn',
    defaultSummary: 'Có người đã tìm ra một góc nhìn mới về bản thân qua MELE.',
    privacyNote: 'Đây là bản tóm tắt ẩn danh, không chứa ngày sinh, giờ sinh, nơi sinh hay kết quả cá nhân đầy đủ.',
    cta: 'Tạo kết quả của tôi',
    noSignup: 'Không cần hiểu biết trước, cũng không cần đăng ký.',
  },
  id: {
    insightFrom: (toolName) => `Sebuah temuan dari ${toolName}`,
    defaultTitle: 'Bagian dari dirimu yang layak diperhatikan',
    defaultSummary: 'Seseorang menemukan sudut pandang baru tentang dirinya lewat MELE.',
    privacyNote: 'Ini pratinjau anonim, tidak berisi tanggal lahir, jam, tempat lahir, atau hasil pribadi lengkap.',
    cta: 'Buat hasilku',
    noSignup: 'Tidak perlu pengetahuan sebelumnya atau pendaftaran.',
  },
  ja: {
    insightFrom: (toolName) => `${toolName}からの発見`,
    defaultTitle: 'もっと見つめる価値のある自分',
    defaultSummary: '誰かがMELEを通じて自分自身への新しい視点を見つけました。',
    privacyNote: 'これは匿名の抜粋で、生年月日・出生時間・出生地・個人の完全な結果は含まれていません。',
    cta: '自分の結果を作成する',
    noSignup: '事前知識も登録も必要ありません。',
  },
  ko: {
    insightFrom: (toolName) => `${toolName}에서 온 발견`,
    defaultTitle: '한 번 더 눈여겨볼 만한 나의 모습',
    defaultSummary: '누군가 MELE를 통해 자신을 이해하는 새로운 시각을 찾았어요.',
    privacyNote: '이것은 익명 요약본으로, 생년월일·출생 시간·장소나 전체 개인 결과는 포함되지 않아요.',
    cta: '내 결과 만들기',
    noSignup: '사전 지식이나 회원가입이 필요하지 않아요.',
  },
};

function safeText(value: string | undefined, fallback: string, max = 180) {
  const text = (value ?? '').replace(/[<>\r\n]/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, max) : fallback;
}

export const metadata: Metadata = {
  title: '一個來自 MELE 的自我發現',
  robots: { index: false, follow: true },
};

export default async function SharedInsightPage({ params, searchParams }: Props) {
  const route = await params;
  const query = await searchParams;
  const locale: Locale = isLocale(route.locale) ? route.locale : 'zh-TW';
  const copy = SHARE_COPY[locale] ?? SHARE_COPY['zh-TW'];
  const tool = query.tool && TOOL_NAMES[query.tool] ? query.tool : 'numerology';
  const toolName = TOOL_NAMES[tool][locale] ?? TOOL_NAMES[tool]['zh-TW'];
  const title = safeText(query.title, copy.defaultTitle, 90);
  const summary = safeText(query.summary, copy.defaultSummary);

  return (
    <main className="shared-insight">
      <section className="shared-insight__card" aria-labelledby="shared-insight-title">
        <div className="shared-insight__mark" aria-hidden="true"><span>MELE</span><i /></div>
        <span className="mag-label">{copy.insightFrom(toolName)}</span>
        <h1 id="shared-insight-title">{title}</h1>
        <blockquote>{summary}</blockquote>
        <p>{copy.privacyNote}</p>
        <Link href={`${localizePath(`/tools/${tool}`, locale)}?source=shared-insight`}>
          {copy.cta}
        </Link>
        <small>{copy.noSignup}</small>
      </section>
    </main>
  );
}
