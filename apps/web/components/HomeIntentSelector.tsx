'use client';

import Link from 'next/link';
import { useState } from 'react';
import { localizePath, type Locale } from '@/lib/i18n/config';

type IntentKey = 'self' | 'stuck' | 'relationships' | 'timing' | 'unsure';

type IntentOption = {
  key: IntentKey;
  label: string;
  result: string;
  tool: string;
  slug: string;
  meta: string;
};

const COPY: Record<Locale, {
  kicker: string;
  title: string;
  body: string;
  recommendation: string;
  start: string;
  allTools: string;
  options: IntentOption[];
}> = {
  'zh-TW': {
    kicker: '先選問題，不必先懂工具',
    title: '你現在最想了解哪一件事？',
    body: '選一個最接近的狀況，我們只推薦一條最短路線。',
    recommendation: '適合你的起點',
    start: '從這裡開始',
    allTools: '我想自己看全部工具',
    options: [
      { key: 'self', label: '性格與天賦', result: '先看見你的核心節奏，不需要出生時間。', tool: '生命靈數', slug: 'numerology', meta: '只需生日 · 約 60 秒' },
      { key: 'stuck', label: '一件事卡住了', result: '把問題縮小，先看此刻最需要注意的方向。', tool: '塔羅', slug: 'tarot', meta: '帶著一個問題 · 約 90 秒' },
      { key: 'relationships', label: '感情與人際', result: '從關係模式與互動慣性開始，比直接猜答案更有用。', tool: '人類圖', slug: 'humandesign', meta: '生日、時間、地點 · 約 3 分鐘' },
      { key: 'timing', label: '近期方向', result: '整理近期課題與可行動的下一步。', tool: '盧恩符文', slug: 'runes', meta: '帶著一個方向 · 約 60 秒' },
      { key: 'unsure', label: '我還不知道', result: '從資料最少、最好理解的入口開始。', tool: '生命靈數', slug: 'numerology', meta: '只需生日 · 約 60 秒' },
    ],
  },
  en: {
    kicker: 'Choose a question, not a system', title: 'What do you want to understand right now?', body: 'Pick the closest situation. We will suggest one clear starting point.', recommendation: 'Your starting point', start: 'Start here', allTools: 'Browse every tool',
    options: [
      { key: 'self', label: 'Personality and strengths', result: 'See your core rhythm without needing a birth time.', tool: 'Numerology', slug: 'numerology', meta: 'Birth date only · about 60 sec' },
      { key: 'stuck', label: 'I feel stuck', result: 'Narrow the question and notice what matters now.', tool: 'Tarot', slug: 'tarot', meta: 'Bring one question · about 90 sec' },
      { key: 'relationships', label: 'Love and relationships', result: 'Start with your interaction and decision patterns.', tool: 'Human Design', slug: 'humandesign', meta: 'Birth details · about 3 min' },
      { key: 'timing', label: 'What comes next', result: 'Find the current theme and one practical next step.', tool: 'Runes', slug: 'runes', meta: 'Bring one direction · about 60 sec' },
      { key: 'unsure', label: 'Help me choose', result: 'Begin with the clearest tool that asks for the least data.', tool: 'Numerology', slug: 'numerology', meta: 'Birth date only · about 60 sec' },
    ],
  },
  vi: {
    kicker: 'Chọn câu hỏi trước, chưa cần hiểu công cụ', title: 'Bạn đang muốn hiểu điều gì nhất lúc này?', body: 'Chọn tình huống gần nhất, MELE sẽ gợi ý một hướng đi ngắn nhất.', recommendation: 'Điểm bắt đầu phù hợp với bạn', start: 'Bắt đầu từ đây', allTools: 'Tôi muốn tự xem tất cả công cụ',
    options: [
      { key: 'self', label: 'Tính cách và thế mạnh', result: 'Nhìn thấy nhịp điệu cốt lõi của bạn, không cần giờ sinh.', tool: 'Thần số học', slug: 'numerology', meta: 'Chỉ cần ngày sinh · khoảng 60 giây' },
      { key: 'stuck', label: 'Đang bế tắc một chuyện', result: 'Thu hẹp vấn đề, xem điều cần chú ý nhất lúc này.', tool: 'Tarot', slug: 'tarot', meta: 'Mang theo một câu hỏi · khoảng 90 giây' },
      { key: 'relationships', label: 'Tình cảm và các mối quan hệ', result: 'Bắt đầu từ khuôn mẫu tương tác, thay vì đoán mò câu trả lời.', tool: 'Human Design', slug: 'humandesign', meta: 'Ngày sinh, giờ sinh, nơi sinh · khoảng 3 phút' },
      { key: 'timing', label: 'Hướng đi sắp tới', result: 'Tổng hợp chủ đề gần đây và bước tiếp theo có thể làm ngay.', tool: 'Rune', slug: 'runes', meta: 'Mang theo một hướng đi · khoảng 60 giây' },
      { key: 'unsure', label: 'Tôi cũng chưa biết', result: 'Bắt đầu từ công cụ cần ít dữ liệu nhất, dễ hiểu nhất.', tool: 'Thần số học', slug: 'numerology', meta: 'Chỉ cần ngày sinh · khoảng 60 giây' },
    ],
  },
  id: {
    kicker: 'Pilih pertanyaannya dulu, bukan alatnya', title: 'Apa yang paling ingin kamu pahami sekarang?', body: 'Pilih situasi yang paling dekat, kami akan menyarankan satu titik awal yang jelas.', recommendation: 'Titik awal yang cocok untukmu', start: 'Mulai dari sini', allTools: 'Saya ingin lihat semua alat sendiri',
    options: [
      { key: 'self', label: 'Kepribadian dan bakat', result: 'Lihat ritme intimu tanpa perlu jam lahir.', tool: 'Numerologi', slug: 'numerology', meta: 'Cukup tanggal lahir · sekitar 60 detik' },
      { key: 'stuck', label: 'Sedang mentok di satu hal', result: 'Persempit masalahnya, lihat apa yang paling perlu diperhatikan sekarang.', tool: 'Tarot', slug: 'tarot', meta: 'Bawa satu pertanyaan · sekitar 90 detik' },
      { key: 'relationships', label: 'Cinta dan hubungan', result: 'Mulai dari pola interaksi dan kebiasaanmu, bukan menebak-nebak jawaban.', tool: 'Human Design', slug: 'humandesign', meta: 'Tanggal, jam, tempat lahir · sekitar 3 menit' },
      { key: 'timing', label: 'Arah ke depan', result: 'Rangkum tema saat ini dan satu langkah nyata berikutnya.', tool: 'Rune', slug: 'runes', meta: 'Bawa satu arah · sekitar 60 detik' },
      { key: 'unsure', label: 'Saya belum tahu', result: 'Mulai dari alat yang paling mudah dipahami dan butuh data paling sedikit.', tool: 'Numerologi', slug: 'numerology', meta: 'Cukup tanggal lahir · sekitar 60 detik' },
    ],
  },
  ja: {
    kicker: 'ツールより先に、悩みを選ぶ', title: '今いちばん知りたいことは何ですか？', body: '近い状況を一つ選ぶと、最短の入口を一つご提案します。', recommendation: 'あなたに合う入口', start: 'ここから始める', allTools: '自分で全ツールを見る',
    options: [
      { key: 'self', label: '性格と強み', result: '出生時間なしで、あなたの核となるリズムを知る。', tool: '数秘術', slug: 'numerology', meta: '生年月日のみ · 約60秒' },
      { key: 'stuck', label: '物事が行き詰まっている', result: '問題を絞り込み、今いちばん注意すべき方向を見る。', tool: 'タロット', slug: 'tarot', meta: '質問を一つ用意 · 約90秒' },
      { key: 'relationships', label: '恋愛と人間関係', result: '答えを推測するより、関係のパターンから見ていく。', tool: 'ヒューマンデザイン', slug: 'humandesign', meta: '生年月日・時間・場所 · 約3分' },
      { key: 'timing', label: '直近の方向性', result: '今のテーマと、次に取れる具体的な一歩を整理する。', tool: 'ルーン', slug: 'runes', meta: '方向性を一つ用意 · 約60秒' },
      { key: 'unsure', label: 'まだよく分からない', result: '必要な情報が一番少なく、分かりやすい入口から始める。', tool: '数秘術', slug: 'numerology', meta: '生年月日のみ · 約60秒' },
    ],
  },
  ko: {
    kicker: '도구보다 먼저 고민을 선택하세요', title: '지금 가장 알고 싶은 것은 무엇인가요?', body: '가장 가까운 상황을 하나 고르면, 가장 짧은 시작점을 추천해 드려요.', recommendation: '나에게 맞는 시작점', start: '여기서 시작하기', allTools: '전체 도구 직접 둘러보기',
    options: [
      { key: 'self', label: '성격과 재능', result: '태어난 시간 없이도 나의 핵심 리듬을 확인해요.', tool: '생명수', slug: 'numerology', meta: '생년월일만 · 약 60초' },
      { key: 'stuck', label: '한 가지 일이 막혀 있어요', result: '문제를 좁혀서 지금 가장 주의할 방향을 확인해요.', tool: '타로', slug: 'tarot', meta: '질문 하나 준비 · 약 90초' },
      { key: 'relationships', label: '연애와 인간관계', result: '답을 짐작하기보다 관계 패턴부터 살펴봐요.', tool: '휴먼디자인', slug: 'humandesign', meta: '생년월일·시간·장소 · 약 3분' },
      { key: 'timing', label: '요즘의 방향', result: '최근 주제를 정리하고 실천 가능한 다음 한 걸음을 찾아요.', tool: '룬', slug: 'runes', meta: '방향 하나 준비 · 약 60초' },
      { key: 'unsure', label: '아직 잘 모르겠어요', result: '필요한 정보가 가장 적고 이해하기 쉬운 도구부터 시작해요.', tool: '생명수', slug: 'numerology', meta: '생년월일만 · 약 60초' },
    ],
  },
};

export default function HomeIntentSelector({ locale }: { locale: Locale }) {
  const copy = COPY[locale] ?? COPY['zh-TW'];
  const [selected, setSelected] = useState<IntentOption | null>(null);

  return (
    <section className="intent-finder" id="intent-finder" aria-labelledby="intent-finder-title">
      <div className="intent-finder__intro">
        <span className="mag-label">{copy.kicker}</span>
        <h2 id="intent-finder-title">{copy.title}</h2>
        <p>{copy.body}</p>
      </div>

      <div className="intent-finder__options" role="list" aria-label={copy.title}>
        {copy.options.map((option) => (
          <button
            key={option.key}
            type="button"
            className={selected?.key === option.key ? 'is-selected' : ''}
            aria-pressed={selected?.key === option.key}
            onClick={() => setSelected(option)}
          >
            <span>{option.label}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        ))}
      </div>

      <div className={`intent-finder__result${selected ? ' is-visible' : ''}`} aria-live="polite">
        {selected && (
          <>
            <span className="mag-label">{copy.recommendation}</span>
            <h3>{selected.tool}</h3>
            <p>{selected.result}</p>
            <small>{selected.meta}</small>
            <Link href={localizePath(`/tools/${selected.slug}`, locale)}>{copy.start}</Link>
          </>
        )}
      </div>

      <Link className="intent-finder__all" href={localizePath('/tools', locale)}>{copy.allTools}</Link>
    </section>
  );
}
