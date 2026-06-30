import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  LOCALES,
  isLocale,
  localizePath,
  type Locale,
} from '@/lib/i18n/config';

type PageProps = {
  params: Promise<{ locale: string }>;
};

async function resolveLocale(paramsPromise: PageProps['params']): Promise<Locale> {
  const { locale } = await paramsPromise;
  return isLocale(locale) ? locale : 'zh-TW';
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const metaCopy: Record<string, { title: string; description: string }> = {
  'zh-TW': {
    title: 'MELE',
    description: 'MELE 是免費的自我探索工具平台。八種命理工具直接用，從每日儀式到深入解讀，幫你多一個看自己的角度。',
  },
  en: {
    title: 'MELE',
    description: 'MELE is a free self-discovery platform. Eight astrology and self-exploration tools — from daily rituals to in-depth readings, giving you another angle on yourself.',
  },
  vi: {
    title: 'MELE',
    description: 'MELE là nền tảng khám phá bản thân miễn phí. Tám công cụ tự khám phá — từ nghi thức hằng ngày đến giải thích chuyên sâu, thêm một góc nhìn về chính bạn.',
  },
  id: {
    title: 'MELE',
    description: 'MELE adalah platform eksplorasi diri gratis. Delapan alat eksplorasi diri — dari ritual harian hingga pembacaan mendalam, memberimu sudut pandang baru tentang dirimu.',
  },
  ja: {
    title: 'MELE',
    description: 'MELEは無料の自己探索ツールプラットフォームです。8つのツールをすぐに使い始められます——毎日の儀式から深い解説まで、自分を見るもう一つの角度を。',
  },
  ko: {
    title: 'MELE',
    description: 'MELE는 무료 자기 탐색 도구 플랫폼입니다. 여덟 가지 도구를 바로 사용할 수 있습니다 — 매일 리추얼부터 심층 해석까지, 나를 바라보는 또 하나의 시각.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const meta = metaCopy[locale] ?? metaCopy['zh-TW'];
  return {
    title: meta.title,
    description: meta.description,
  };
}

const homeCopy = {
  'zh-TW': {
    reportIssue: '意見回饋',
    eyebrow: '免費自我探索工具',
    title: '先整理自己，再決定下一步。',
    body: '一個讓你先整理自己、再決定下一步的工具平台。從每日儀式、命理探索到深入解讀，陪你多一個看自己的角度。需要的時候，再找老師深聊。',
    primary: '開始每日儀式',
    secondary: '看全部工具',
    tarot: '試抽塔羅',
    teacher: '需要時找老師',
    secondaryRoutesLabel: '其他入口',
    points: '八種命理工具，免費直接用',
    unlock: '每日儀式，保留一點儀式感',
    teacherNote: '老師是選項，不是必須',
    previewTitle: '三步開始認識自己',
    previewSubtitle: '不需要先搞懂，做一遍就有感',
    steps: ['選一個工具，看看說什麼', '開啟延伸解讀，多一個角度', '有共鳴，再往下探索'],
    promiseTitle: '三個理由從這裡開始',
    promises: [
      {
        label: '免費直用',
        title: '八種工具，不需要先搞懂',
        body: '生命靈數、人類圖、每日塔羅……八種入口都能直接試，不需要帳號，也不需要預先了解每個系統。',
      },
      {
        label: '先看再說',
        title: '先認識自己，再決定要不要深入',
        body: '工具結果是你認識自己的起點。有興趣的方向，再往下看延伸解讀或預約老師。',
      },
      {
        label: '老師是選項',
        title: '不偏袒，老師你自己挑',
        body: '老師排序依評價與上線狀態等客觀條件呈現，平台不推特定老師。你隨時可以只用工具，不找老師。',
      },
    ],
    noticeTitle: '使用說明',
    noticeBody: 'MELE 是自我理解與娛樂性工具，不取代醫療、法律、投資或心理治療建議。工具結果僅供自我探索參考，不構成任何診斷或醫療建議。若有身心不適，請尋求專業醫療或心理協助。',
    philosophyKicker: 'OUR APPROACH',
    philosophyTitle: '我們在做的事，其實很簡單',
    philosophyBody: '我們不替你下結論，只是多給你一個看自己的角度。工具結果是參考，不是替你下定論；老師是選項，不是必須。你隨時可以只用工具、不找老師。平台上的老師誰排在前面，由評價與上線狀態等客觀條件決定，排序依公開規則呈現，平台不偏袒特定老師。',
    finalTitle: '準備好就從最短路線開始',
    finalBody: '建議先跑「每日儀式 → 一個工具 → 有感就繼續看」這條線。給自己五分鐘，試試看。',
  },
  en: {
    reportIssue: 'Feedback',
    eyebrow: 'Free self-discovery tools',
    title: 'Understand yourself first. Then decide what comes next.',
    body: 'A platform for self-discovery before your next move. From daily rituals and astrology to in-depth readings — one more angle on yourself. Find a guide when you need one.',
    primary: 'Start daily ritual',
    secondary: 'See all tools',
    tarot: 'Try tarot',
    teacher: 'Find a guide if needed',
    secondaryRoutesLabel: 'Other entry points',
    points: 'Eight self-discovery tools, free to use',
    unlock: 'Daily ritual — a moment of intention each day',
    teacherNote: 'Guides are optional, never forced',
    previewTitle: 'Three steps to know yourself',
    previewSubtitle: 'No need to understand everything — just try one loop',
    steps: ['Pick a tool and see what it says', 'Open the extended reading for more depth', 'Explore further when something resonates'],
    promiseTitle: 'Three reasons to start here',
    promises: [
      {
        label: 'Free to use',
        title: 'Eight tools, no sign-up required',
        body: 'Numerology, Human Design, daily tarot and more. All eight tools are open to try directly — no account needed, no system to learn upfront.',
      },
      {
        label: 'See first',
        title: 'Know yourself before going deeper',
        body: 'Tool results are a starting point, not a conclusion. If something resonates, explore the extended reading or connect with a guide.',
      },
      {
        label: 'Guides are optional',
        title: 'No pressure — guides are your choice',
        body: 'Guide rankings are based on objective factors like ratings and activity status. The platform does not favour any guide. You can always use tools alone.',
      },
    ],
    noticeTitle: 'How to use MELE',
    noticeBody: 'MELE is for self-discovery and entertainment. It does not replace medical, legal, investment, or therapy advice. Tool results are for personal reflection only and do not constitute any medical recommendation. If you have physical or mental health concerns, please seek professional help.',
    finalTitle: 'Ready? Start with the shortest path.',
    finalBody: 'Try the daily ritual → one tool → keep exploring if something resonates. Five minutes is enough to start.',
  },
  vi: {
    reportIssue: 'Phản hồi',
    eyebrow: 'Công cụ tự khám phá bản thân miễn phí',
    title: 'Hiểu bản thân trước, rồi quyết định bước tiếp theo.',
    body: 'Một nền tảng công cụ giúp bạn sắp xếp lại bản thân trước khi đưa ra quyết định. Từ nghi thức hằng ngày, khám phá bản đồ năng lượng đến giải thích chuyên sâu — thêm một góc nhìn về chính mình. Khi cần, hãy tìm chuyên gia để trò chuyện sâu hơn.',
    primary: 'Bắt đầu nghi thức hằng ngày',
    secondary: 'Xem tất cả công cụ',
    tarot: 'Thử rút tarot',
    teacher: 'Tìm chuyên gia khi cần',
    secondaryRoutesLabel: 'Lối vào khác',
    points: 'Tám công cụ tự khám phá, dùng ngay miễn phí',
    unlock: 'Nghi thức hằng ngày — một chút ý nghĩa mỗi ngày',
    teacherNote: 'Chuyên gia là lựa chọn, không phải bắt buộc',
    previewTitle: 'Ba bước để hiểu bản thân',
    previewSubtitle: 'Không cần hiểu hết — chỉ cần thử một vòng',
    steps: ['Chọn một công cụ, xem nó nói gì', 'Mở giải thích mở rộng để có thêm góc nhìn', 'Tiếp tục khám phá khi có điều gì đó chạm đến bạn'],
    promiseTitle: 'Ba lý do để bắt đầu từ đây',
    promises: [
      {
        label: 'Miễn phí',
        title: 'Tám công cụ, dùng ngay không cần đăng ký',
        body: 'Thần số học, Human Design, tarot hằng ngày... Tám công cụ đều có thể thử trực tiếp, không cần tài khoản, không cần hiểu trước mỗi hệ thống.',
      },
      {
        label: 'Xem trước',
        title: 'Hiểu bản thân trước, rồi quyết định đi sâu',
        body: 'Kết quả công cụ là điểm khởi đầu, không phải kết luận. Nếu có điều gì chạm đến bạn, hãy tiếp tục xem giải thích chuyên sâu hoặc tìm chuyên gia.',
      },
      {
        label: 'Chuyên gia là lựa chọn',
        title: 'Không thiên vị — bạn tự chọn chuyên gia',
        body: 'Thứ hạng chuyên gia dựa trên đánh giá và trạng thái hoạt động khách quan. Nền tảng không ưu tiên chuyên gia nào. Bạn luôn có thể chỉ dùng công cụ mà không cần tìm chuyên gia.',
      },
    ],
    noticeTitle: 'Hướng dẫn sử dụng',
    noticeBody: 'MELE là công cụ tự hiểu bản thân và giải trí, không thay thế tư vấn y tế, pháp lý, đầu tư hay tâm lý. Kết quả công cụ chỉ mang tính tham khảo cho việc tự khám phá, không cấu thành bất kỳ khuyến nghị y tế nào. Nếu có vấn đề sức khỏe tâm thần hoặc thể chất, hãy tìm đến chuyên gia y tế hoặc tâm lý.',
    philosophyKicker: 'OUR APPROACH',
    philosophyTitle: 'Điều chúng tôi đang làm, thật ra rất đơn giản',
    philosophyBody: 'Chúng tôi không kết luận thay bạn, chỉ cung cấp thêm một góc nhìn về chính mình. Kết quả công cụ là tham khảo, không phải phán quyết; chuyên gia là lựa chọn, không phải bắt buộc. Bạn luôn có thể chỉ dùng công cụ mà không cần tìm chuyên gia. Thứ hạng của chuyên gia trên nền tảng do đánh giá và trạng thái hoạt động quyết định — xếp hạng theo quy tắc công khai, nền tảng không thiên vị bất kỳ chuyên gia nào.',
    finalTitle: 'Sẵn sàng thì bắt đầu từ con đường ngắn nhất',
    finalBody: 'Gợi ý chạy theo lộ trình: nghi thức hằng ngày → một công cụ → nếu có cảm xúc thì tiếp tục xem. Cho mình năm phút, thử xem sao.',
  },
  id: {
    reportIssue: 'Beri masukan',
    eyebrow: 'Alat eksplorasi diri gratis',
    title: 'Kenali dirimu dulu, lalu putuskan langkah berikutnya.',
    body: 'Platform alat yang membantumu merapikan diri sebelum mengambil keputusan. Dari ritual harian, eksplorasi diri, hingga pembacaan mendalam — satu sudut pandang tambahan tentang dirimu. Ketika perlu, cari pemandu untuk ngobrol lebih dalam.',
    primary: 'Mulai ritual harian',
    secondary: 'Lihat semua alat',
    tarot: 'Coba tarot',
    teacher: 'Cari pemandu jika perlu',
    secondaryRoutesLabel: 'Pintu masuk lain',
    points: 'Delapan alat eksplorasi diri, langsung mulai gratis',
    unlock: 'Ritual harian — momen kecil yang berarti setiap hari',
    teacherNote: 'Pemandu adalah pilihan, bukan keharusan',
    previewTitle: 'Tiga langkah mengenal diri',
    previewSubtitle: 'Tidak perlu memahami segalanya — coba satu putaran dulu',
    steps: ['Pilih satu alat, lihat apa yang dikatakan', 'Buka bacaan lanjutan untuk sudut pandang lebih', 'Telusuri lebih jauh jika ada yang beresonansi'],
    promiseTitle: 'Tiga alasan untuk mulai di sini',
    promises: [
      {
        label: 'Gratis',
        title: 'Delapan alat, langsung mulai tanpa daftar',
        body: 'Numerologi, Human Design, tarot harian... Semua delapan alat bisa dicoba langsung tanpa akun, tanpa harus memahami setiap sistem terlebih dahulu.',
      },
      {
        label: 'Lihat dulu',
        title: 'Kenali diri dulu, baru putuskan mau lebih dalam',
        body: 'Hasil alat adalah titik awal, bukan kesimpulan. Jika ada yang beresonansi, lanjutkan dengan bacaan mendalam atau temui pemandu.',
      },
      {
        label: 'Pemandu adalah pilihan',
        title: 'Tidak memihak — kamu pilih sendiri',
        body: 'Peringkat pemandu ditentukan oleh ulasan dan status aktif secara objektif. Platform tidak mengutamakan pemandu mana pun. Kamu bisa kapan saja hanya memakai alat saja.',
      },
    ],
    noticeTitle: 'Cara menggunakan MELE',
    noticeBody: 'MELE adalah alat memahami diri dan hiburan, bukan pengganti saran medis, hukum, investasi, atau terapi psikologi. Hasil alat hanya untuk referensi eksplorasi diri, bukan rekomendasi medis. Jika ada masalah kesehatan fisik atau mental, segera cari bantuan profesional.',
    philosophyKicker: 'OUR APPROACH',
    philosophyTitle: 'Yang kami lakukan, sebenarnya sangat sederhana',
    philosophyBody: 'Kami tidak menyimpulkan untukmu, hanya memberi satu sudut pandang tambahan tentang dirimu. Hasil alat adalah referensi, bukan vonis; pemandu adalah pilihan, bukan keharusan. Kamu bisa kapan saja hanya memakai alat tanpa mencari pemandu. Peringkat pemandu di platform ditentukan oleh ulasan dan status aktif — urutan berdasarkan aturan yang transparan, platform tidak memihak pemandu mana pun.',
    finalTitle: 'Siap? Mulai dari jalur terpendek',
    finalBody: 'Disarankan mengikuti alur: ritual harian → satu alat → jika ada resonansi, lanjutkan. Beri dirimu lima menit, coba dulu.',
  },
  ja: {
    reportIssue: 'フィードバック',
    eyebrow: '無料の自己探索ツール',
    title: 'まず自分を整理して、それから次の一歩を決める。',
    body: '自分を整理してから次のステップを決めるためのツールプラットフォームです。毎日の儀式、自己探索、深い解説まで——自分をもう一つの角度から見るきっかけになります。必要なときは、ガイドに深く話しかけてみてください。',
    primary: '毎日の儀式を始める',
    secondary: 'すべてのツールを見る',
    tarot: 'タロットを試す',
    teacher: '必要なときにガイドを探す',
    secondaryRoutesLabel: 'その他の入口',
    points: '8つの自己探索ツール、無料ですぐに使える',
    unlock: '毎日の儀式——小さな節目を作る',
    teacherNote: 'ガイドは選択肢であり、必須ではありません',
    previewTitle: '自分を知る3ステップ',
    previewSubtitle: 'すべてを理解しなくていい——まず一周してみよう',
    steps: ['ひとつのツールを選んで何を言うか見る', '詳細解説を開いてもう一つの角度を得る', '気になることがあれば、さらに探ってみる'],
    promiseTitle: 'ここから始める3つの理由',
    promises: [
      {
        label: '無料で使える',
        title: '8つのツール、登録なしで試せる',
        body: '数秘術、ヒューマンデザイン、毎日のタロット……8つのツール入口はすべてアカウントなしで試せます。各システムを事前に理解する必要もありません。',
      },
      {
        label: 'まず見てみる',
        title: 'まず自分を知り、深入りするか決める',
        body: 'ツールの結果は出発点です。気になったことがあれば、詳細解説を見るかガイドに相談してみてください。',
      },
      {
        label: 'ガイドは選択肢',
        title: '偏りなし——ガイドは自分で選ぶ',
        body: 'ガイドの順位は評価や活動状況などの客観的な条件で決まります。特定のガイドを優遇することはありません。ツールだけ使うことももちろんできます。',
      },
    ],
    noticeTitle: '使い方について',
    noticeBody: 'MELEは自己理解とエンターテインメントのためのツールであり、医療、法律、投資、または心理療法の代替にはなりません。ツールの結果は自己探索の参考にのみ使用できます。心身に不調がある場合は、専門の医療機関や心理の専門家にご相談ください。',
    philosophyKicker: 'OUR APPROACH',
    philosophyTitle: '私たちがやっていること、実はとてもシンプルです',
    philosophyBody: '私たちはあなたの代わりに結論を出しません。ただ、自分を見るもう一つの角度を提供するだけです。ツールの結果は参考であり、判断ではありません。ガイドは選択肢であり、必須ではありません。いつでもツールだけ使って、ガイドを探さなくてもかまいません。プラットフォーム上のガイドの順位は、評価やオンライン状態などの客観的な条件によって決まります。順位は公開ルールに基づいており、特定のガイドを優遇することはありません。',
    finalTitle: '準備ができたら、最短ルートから始めましょう',
    finalBody: '「毎日の儀式 → ひとつのツール → 気になったら続けて見る」というルートから試すことをお勧めします。5分間、試してみてください。',
  },
  ko: {
    reportIssue: '피드백 보내기',
    eyebrow: '무료 자기 탐색 도구',
    title: '먼저 자신을 정리하고, 그 다음 방향을 결정하세요.',
    body: '나를 먼저 정리한 후 다음 선택을 결정하기 위한 도구 플랫폼입니다. 매일 리추얼, 자기 탐색부터 심층 해석까지 — 나를 바라보는 하나의 시각을 더해드립니다. 필요할 때 가이드를 찾아 깊이 대화해 보세요.',
    primary: '데일리 리추얼 시작하기',
    secondary: '모든 도구 보기',
    tarot: '타로 뽑아보기',
    teacher: '필요할 때 가이드 찾기',
    secondaryRoutesLabel: '다른 입구',
    points: '여덟 가지 자기 탐색 도구, 무료로 바로 시작',
    unlock: '매일 리추얼 — 하루의 작은 의식',
    teacherNote: '가이드는 선택지이지, 필수가 아닙니다',
    previewTitle: '나를 알아가는 세 단계',
    previewSubtitle: '모두 이해하지 않아도 돼요 — 한 번 돌아보면 충분해요',
    steps: ['도구 하나를 골라 무엇을 말하는지 확인', '심층 해석을 열어 또 다른 시각 얻기', '공감되는 부분이 있으면 더 탐색해 보기'],
    promiseTitle: '여기서 시작해야 할 세 가지 이유',
    promises: [
      {
        label: '무료 사용',
        title: '여덟 가지 도구, 가입 없이 바로 시작',
        body: '수비학, 휴먼디자인, 매일 타로... 여덟 가지 도구 모두 계정 없이 바로 사용할 수 있습니다. 각 시스템을 미리 이해할 필요도 없습니다.',
      },
      {
        label: '먼저 보기',
        title: '나를 먼저 알고, 더 깊이 볼지 결정해요',
        body: '도구 결과는 시작점입니다. 공감되는 부분이 있다면 심층 해석을 보거나 가이드와 상담해 보세요.',
      },
      {
        label: '가이드는 선택',
        title: '편애 없이 — 가이드는 내가 직접 고르세요',
        body: '가이드 순위는 평가와 활동 상태 등 객관적 조건에 의해 결정됩니다. 특정 가이드를 우대하지 않습니다. 언제든 도구만 사용하고 가이드를 찾지 않아도 됩니다.',
      },
    ],
    noticeTitle: '사용 안내',
    noticeBody: 'MELE는 자기 이해와 엔터테인먼트 도구로, 의료, 법률, 투자 또는 심리 상담을 대체하지 않습니다. 도구 결과는 자기 탐색을 위한 참고용이며, 어떠한 의학적 권고도 구성하지 않습니다. 신체적·정신적 불편이 있으시면 전문 의료 또는 심리 전문가의 도움을 받으세요.',
    philosophyKicker: 'OUR APPROACH',
    philosophyTitle: '우리가 하는 일, 사실 아주 단순해요',
    philosophyBody: '우리는 당신 대신 결론을 내리지 않아요. 그저 자신을 바라보는 하나의 시각을 더해드릴 뿐입니다. 도구 결과는 참고이지 판단이 아니고, 가이드는 선택지이지 필수가 아닙니다. 언제든지 도구만 사용하고 가이드를 찾지 않아도 됩니다. 플랫폼 내 가이드 순위는 평가와 활동 상태 등 객관적인 조건에 의해 결정되며, 공개 규칙에 따라 표시됩니다. 특정 가이드를 편애하지 않습니다.',
    finalTitle: '준비가 되었다면 가장 짧은 경로에서 시작하세요',
    finalBody: '「매일 리추얼 → 도구 하나 → 공감되면 계속 보기」 이 흐름으로 먼저 시작해 보세요. 5분만 내어 한번 해보세요.',
  },
} as const;

function getHomeCopy(locale: Locale) {
  if (locale in homeCopy) {
    return homeCopy[locale as keyof typeof homeCopy];
  }
  return homeCopy['zh-TW'];
}

export default async function LocalizedHomePage({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const copy = getHomeCopy(locale);

  return (
    <main className="beta2-home">
      <section className="beta2-hero" aria-label="MELE 首頁">
        <div className="beta2-hero__copy">
          <p className="beta2-eyebrow">{copy.eyebrow}</p>
          <h1>MELE</h1>
          <h2>{copy.title}</h2>
          <p>{copy.body}</p>

          <div className="beta2-actions home-hero__actions">
            <Link href={localizePath('/daily', locale)} className="beta2-primary">
              {copy.primary}
            </Link>
            <Link href={localizePath('/tools', locale)} className="beta2-secondary">
              {copy.secondary}
            </Link>
          </div>

          <nav className="home-route-links" aria-label={copy.secondaryRoutesLabel}>
            <Link href={localizePath('/tools/tarot', locale)}>
              {copy.tarot}
            </Link>
            <Link href={localizePath('/teachers', locale)}>
              {copy.teacher}
            </Link>
          </nav>

          <div className="beta2-trust home-trust-list" aria-label="平台特色">
            <span>{copy.points}</span>
            <span>{copy.unlock}</span>
            <span>{copy.teacherNote}</span>
          </div>
        </div>

        <div className="beta2-visual" aria-label="首頁主要視覺">
          <div className="beta2-card-stack" aria-hidden="true">
            <Image
              src="/tarot/cards/ocean_poseidon/19.webp"
              alt="大海波賽頓塔羅卡面"
              width={260}
              height={390}
              priority
              className="beta2-tarot"
            />
            <Image
              src="/maya/totems/yellow-human.png"
              alt="瑪雅黃色人圖騰"
              width={112}
              height={112}
              className="beta2-glyph"
            />
          </div>

          <div className="beta2-phone" aria-label={copy.previewTitle}>
            <div className="beta2-phone__top">
              <span>{copy.previewTitle}</span>
            </div>
            <p>{copy.previewSubtitle}</p>
            <ol>
              {copy.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="beta2-path" aria-label={copy.promiseTitle}>
        {copy.promises.map((promise, index) => (
          <article key={promise.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{promise.title}</h3>
            <p>{promise.body}</p>
            <span className="beta2-path-note">{promise.label}</span>
          </article>
        ))}
      </section>

      {locale !== 'en' && 'philosophyTitle' in copy && (
        <section className="beta2-path" aria-label={copy.philosophyTitle}>
          <article>
            <span className="beta2-path-note">{copy.philosophyKicker}</span>
            <h3>{copy.philosophyTitle}</h3>
            <p>{copy.philosophyBody}</p>
          </article>
        </section>
      )}

      <section className="beta2-notice" aria-label={copy.noticeTitle}>
        <div>
          <span>{copy.noticeTitle}</span>
          <p>{copy.noticeBody}</p>
        </div>
        <Link href={localizePath('/feedback', locale)}>{copy.reportIssue}</Link>
      </section>

      <section className="beta2-final-cta" aria-label={copy.finalTitle}>
        <div>
          <h2>{copy.finalTitle}</h2>
          <p>{copy.finalBody}</p>
        </div>
        <Link href={localizePath('/daily', locale)} className="beta2-primary">
          {copy.primary}
        </Link>
      </section>
    </main>
  );
}
