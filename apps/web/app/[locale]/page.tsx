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
    title: 'MELE 公開測試',
    description: 'MELE 公開測試入口：先免費試工具、完成每日儀式、查看延伸解讀，回報正式上線前最需要改善的地方。',
  },
  en: {
    title: 'MELE Public Beta',
    description: 'A public beta self-discovery flow: try free tools, complete daily rituals, explore deeper readings, and tell us what should improve before launch.',
  },
  vi: {
    title: 'MELE Thử nghiệm công khai',
    description: 'Nền tảng thử nghiệm MELE: thử công cụ miễn phí, hoàn thành nghi thức hằng ngày, xem giải thích chuyên sâu và cho chúng tôi biết điều cần cải thiện trước khi ra mắt.',
  },
  id: {
    title: 'MELE Uji Publik',
    description: 'Platform uji publik MELE: coba alat gratis, selesaikan ritual harian, lihat bacaan mendalam, dan beri tahu kami apa yang perlu diperbaiki sebelum peluncuran.',
  },
  ja: {
    title: 'MELE 公開テスト',
    description: '公開テスト入口：無料ツールを試し、毎日の儀式を完了し、詳細解説を確認して、正式リリース前に改善すべき点をお知らせください。',
  },
  ko: {
    title: 'MELE 공개 테스트',
    description: 'MELE 공개 테스트 플랫폼: 무료 도구를 사용해보고, 데일리 리추얼을 완료하고, 심층 해석을 확인한 뒤 정식 출시 전 개선이 필요한 부분을 알려주세요.',
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
    reportIssue: '回報問題',
    eyebrow: '公測進行中 ｜ 自我理解工具',
    title: '先整理自己，再決定下一步。',
    body: '一個讓你先整理自己、再決定下一步的工具平台。從每日儀式、命理探索到深入解讀，陪你多一個看自己的角度。需要的時候，再找老師深聊。',
    primary: '開始每日儀式',
    secondary: '看全部工具',
    tarot: '試抽塔羅',
    beta: '測試任務清單',
    teacher: '需要時找老師',
    secondaryRoutesLabel: '其他入口',
    points: '八種命理入口可直接開始',
    unlock: '每日儀式保留一點儀式感',
    teacherNote: '老師是選項，不是必須',
    previewTitle: '自我探索任務台',
    previewSubtitle: '先認識自己，再決定要不要深入',
    steps: ['基本工具了解自己', '開啟延伸說明', '需要時找老師'],
    promiseTitle: '公測中先承諾這三件事',
    promises: [
      {
        label: '公測進行中',
        title: '先跑一輪，再慢慢完善',
        body: '這個階段最重要的事是：你用得順不順、看不看得懂。有任何卡住或看不懂的地方，請告訴我們。',
      },
      {
        label: '工具優先',
        title: '先認識自己，再決定要不要深入',
        body: '從生命靈數、人類圖到每日塔羅，八種工具入口都可以直接開始，不需要先搞懂每一個系統。',
      },
      {
        label: '手機優先',
        title: '以真實使用者的手機流程為準',
        body: '公開測試最重視手機版是否太擠、按鈕是否明顯、登入與保存紀錄是否讓人卡住。',
      },
    ],
    testerTitle: '今天請你幫忙測這 4 件事',
    testerBody: '不用全部功能都玩完。只要照順序跑一輪，我們就能知道哪裡需要改善。',
    testerItems: ['一個工具是否看得懂', '每日儀式是否有回訪理由', '延伸說明是否夠清楚', '哪個按鈕或字讓你猶豫'],
    noticeTitle: '測試提醒',
    noticeBody: 'MELE 是自我理解與娛樂性工具，不取代醫療、法律、投資或心理治療建議。工具結果僅供自我探索參考，不構成任何診斷或醫療建議。若有身心不適，請尋求專業醫療或心理協助。',
    philosophyKicker: 'OUR APPROACH',
    philosophyTitle: '我們在做的事，其實很簡單',
    philosophyBody: '我們不替你下結論，只是多給你一個看自己的角度。工具結果是參考，不是替你下定論；老師是選項，不是必須。你隨時可以只用工具、不找老師。平台上的老師誰排在前面，由評價與上線狀態等客觀條件決定，排序依公開規則呈現，平台不偏袒特定老師。',
    finalTitle: '準備好就從最短路線開始',
    finalBody: '建議先跑「每日儀式 → 一個工具 → 有感就繼續看」這條線。給自己五分鐘，試試看。',
  },
  en: {
    reportIssue: 'Report issue',
    eyebrow: 'PUBLIC BETA · testing now',
    title: 'Try one tool first, then tell us what feels unclear.',
    body: 'MELE is now in public beta. You can start with free tools, daily rituals, tarot, numerology, and extended readings while we improve copy, mobile flow, guidance, and trust before launch.',
    primary: 'Start public beta',
    secondary: 'See all tools',
    tarot: 'Try tarot',
    beta: 'Testing checklist',
    teacher: 'Find a guide if needed',
    secondaryRoutesLabel: 'Other beta routes',
    points: 'Eight self-discovery tools, free to try',
    unlock: 'Extended readings available after daily ritual',
    teacherNote: 'Guides are optional, never forced',
    previewTitle: 'Public beta flow',
    previewSubtitle: 'Finish the first feedback loop in 3 minutes',
    steps: ['Try a free tool', 'Complete daily ritual', 'Report friction'],
    promiseTitle: 'What this beta promises',
    promises: [
      {
        label: 'Honest status',
        title: 'We will not pretend this is final',
        body: 'Some reading copy, payment flows, and guide tools are still being tuned. The site should make the testing state clear instead of pushing uncertain purchases.',
      },
      {
        label: 'Free first',
        title: 'Feel the tool before going deeper',
        body: 'The first goal is readability, return intent, and a clear next step, so core tools and daily loops are open for testing first.',
      },
      {
        label: 'Mobile-first',
        title: 'Real phone friction matters most',
        body: 'Public beta feedback should focus on cramped mobile screens, unclear buttons, login friction, and saved-record trust.',
      },
    ],
    testerTitle: 'Please test these 4 things today',
    testerBody: 'You do not need to try every feature. One clean loop tells us whether the product is close to public-ready.',
    testerItems: ['Whether one free tool is readable', 'Whether the daily ritual gives a reason to return', 'Whether extended readings feel clear after login', 'Which button or sentence makes you hesitate'],
    noticeTitle: 'Testing note',
    noticeBody: 'MELE is for self-discovery and entertainment. It does not replace medical, legal, investment, or therapy advice. During public beta, if payment, login, or saved data looks wrong, stop repeating the action and report it.',
    finalTitle: 'Start with the shortest path',
    finalBody: 'Use the daily ritual → one tool → explore or report loop. It reveals real problems better than opening every tool at once.',
  },
  vi: {
    reportIssue: 'Báo cáo vấn đề',
    eyebrow: 'Đang thử nghiệm công khai ｜ Công cụ tự hiểu bản thân',
    title: 'Hiểu bản thân trước, rồi quyết định bước tiếp theo.',
    body: 'Một nền tảng công cụ giúp bạn sắp xếp lại bản thân trước khi đưa ra quyết định. Từ nghi thức hằng ngày, khám phá bản đồ năng lượng đến giải thích chuyên sâu — thêm một góc nhìn về chính mình. Khi cần, hãy tìm chuyên gia để trò chuyện sâu hơn.',
    primary: 'Bắt đầu nghi thức hằng ngày',
    secondary: 'Xem tất cả công cụ',
    tarot: 'Thử rút tarot',
    beta: 'Danh sách nhiệm vụ thử nghiệm',
    teacher: 'Tìm chuyên gia khi cần',
    secondaryRoutesLabel: 'Lối vào khác',
    points: 'Tám công cụ khám phá bản thân, bắt đầu ngay',
    unlock: 'Nghi thức hằng ngày giữ lại chút ý nghĩa mỗi ngày',
    teacherNote: 'Chuyên gia là lựa chọn, không phải bắt buộc',
    previewTitle: 'Bảng nhiệm vụ tự khám phá',
    previewSubtitle: 'Hiểu bản thân trước, rồi mới quyết định đi sâu',
    steps: ['Dùng công cụ cơ bản để hiểu bản thân', 'Mở giải thích mở rộng', 'Tìm chuyên gia khi cần'],
    promiseTitle: 'Ba điều cam kết trong giai đoạn thử nghiệm',
    promises: [
      {
        label: 'Đang thử nghiệm',
        title: 'Chạy thử một vòng, rồi dần hoàn thiện',
        body: 'Điều quan trọng nhất lúc này là: bạn dùng có thuận không, có hiểu không. Chỗ nào bị kẹt hoặc khó hiểu, hãy cho chúng tôi biết.',
      },
      {
        label: 'Công cụ trước tiên',
        title: 'Hiểu bản thân trước, rồi quyết định có đi sâu không',
        body: 'Từ thần số học, Human Design đến tarot hằng ngày — tám công cụ đều có thể bắt đầu ngay, không cần hiểu hết từng hệ thống.',
      },
      {
        label: 'Ưu tiên điện thoại',
        title: 'Lấy trải nghiệm điện thoại của người dùng thực làm chuẩn',
        body: 'Thử nghiệm công khai chú trọng nhất: màn hình điện thoại có chật không, nút bấm có rõ không, đăng nhập và lưu dữ liệu có bị vướng không.',
      },
    ],
    testerTitle: 'Hôm nay nhờ bạn kiểm tra 4 điều này',
    testerBody: 'Không cần dùng hết tất cả tính năng. Chỉ cần chạy theo thứ tự một lượt, chúng tôi sẽ biết chỗ nào cần cải thiện.',
    testerItems: ['Một công cụ có dễ hiểu không', 'Nghi thức hằng ngày có lý do để quay lại không', 'Giải thích mở rộng có đủ rõ không', 'Nút hoặc chữ nào khiến bạn do dự'],
    noticeTitle: 'Lưu ý thử nghiệm',
    noticeBody: 'MELE là công cụ tự hiểu bản thân và giải trí, không thay thế tư vấn y tế, pháp lý, đầu tư hay tâm lý. Kết quả công cụ chỉ mang tính tham khảo cho việc tự khám phá, không cấu thành bất kỳ khuyến nghị y tế nào. Nếu có vấn đề sức khỏe tâm thần hoặc thể chất, hãy tìm đến chuyên gia y tế hoặc tâm lý.',
    philosophyKicker: 'OUR APPROACH',
    philosophyTitle: 'Điều chúng tôi đang làm, thật ra rất đơn giản',
    philosophyBody: 'Chúng tôi không kết luận thay bạn, chỉ cung cấp thêm một góc nhìn về chính mình. Kết quả công cụ là tham khảo, không phải phán quyết; chuyên gia là lựa chọn, không phải bắt buộc. Bạn luôn có thể chỉ dùng công cụ mà không cần tìm chuyên gia. Thứ hạng của chuyên gia trên nền tảng do đánh giá và trạng thái hoạt động quyết định — xếp hạng theo quy tắc công khai, nền tảng không thiên vị bất kỳ chuyên gia nào.',
    finalTitle: 'Sẵn sàng thì bắt đầu từ con đường ngắn nhất',
    finalBody: 'Gợi ý chạy theo lộ trình: nghi thức hằng ngày → một công cụ → nếu có cảm xúc thì tiếp tục xem. Cho mình năm phút, thử xem sao.',
  },
  id: {
    reportIssue: 'Laporkan masalah',
    eyebrow: 'Uji Publik Berlangsung ｜ Alat Memahami Diri',
    title: 'Kenali dirimu dulu, lalu putuskan langkah berikutnya.',
    body: 'Platform alat yang membantumu merapikan diri sebelum mengambil keputusan. Dari ritual harian, eksplorasi diri, hingga pembacaan mendalam — satu sudut pandang tambahan tentang dirimu. Ketika perlu, cari pemandu untuk ngobrol lebih dalam.',
    primary: 'Mulai ritual harian',
    secondary: 'Lihat semua alat',
    tarot: 'Coba tarot',
    beta: 'Daftar tugas uji',
    teacher: 'Cari pemandu jika perlu',
    secondaryRoutesLabel: 'Pintu masuk lain',
    points: 'Delapan alat eksplorasi diri, langsung mulai',
    unlock: 'Ritual harian menjaga makna setiap hari',
    teacherNote: 'Pemandu adalah pilihan, bukan keharusan',
    previewTitle: 'Papan tugas eksplorasi diri',
    previewSubtitle: 'Kenali dirimu dulu, baru putuskan mau lebih dalam',
    steps: ['Pakai alat dasar untuk memahami diri', 'Buka penjelasan lanjutan', 'Cari pemandu jika perlu'],
    promiseTitle: 'Tiga hal yang kami janjikan selama uji publik',
    promises: [
      {
        label: 'Sedang diuji',
        title: 'Jalankan satu putaran, lalu perbaiki perlahan',
        body: 'Yang paling penting saat ini: apakah kamu nyaman menggunakannya, apakah kamu mengerti. Jika ada yang macet atau tidak jelas, tolong beri tahu kami.',
      },
      {
        label: 'Alat lebih dulu',
        title: 'Kenali diri dulu, baru putuskan mau lebih dalam',
        body: 'Dari numerologi, Human Design hingga tarot harian — delapan pintu alat bisa langsung dimulai tanpa harus memahami setiap sistem terlebih dahulu.',
      },
      {
        label: 'Utamakan ponsel',
        title: 'Patokan pengalaman ponsel pengguna nyata',
        body: 'Uji publik mengutamakan: apakah tampilan ponsel terlalu padat, apakah tombol jelas, apakah login dan penyimpanan data membuat pengalaman terganggu.',
      },
    ],
    testerTitle: 'Tolong uji 4 hal ini hari ini',
    testerBody: 'Tidak perlu mencoba semua fitur. Cukup jalankan satu putaran berurutan, kami akan tahu mana yang perlu diperbaiki.',
    testerItems: ['Apakah satu alat mudah dipahami', 'Apakah ritual harian punya alasan untuk kembali', 'Apakah penjelasan lanjutan cukup jelas', 'Tombol atau kata mana yang membuatmu ragu'],
    noticeTitle: 'Catatan uji coba',
    noticeBody: 'MELE adalah alat memahami diri dan hiburan, bukan pengganti saran medis, hukum, investasi, atau terapi psikologi. Hasil alat hanya untuk referensi eksplorasi diri, bukan rekomendasi medis. Jika ada masalah kesehatan fisik atau mental, segera cari bantuan profesional.',
    philosophyKicker: 'OUR APPROACH',
    philosophyTitle: 'Yang kami lakukan, sebenarnya sangat sederhana',
    philosophyBody: 'Kami tidak menyimpulkan untukmu, hanya memberi satu sudut pandang tambahan tentang dirimu. Hasil alat adalah referensi, bukan vonis; pemandu adalah pilihan, bukan keharusan. Kamu bisa kapan saja hanya memakai alat tanpa mencari pemandu. Peringkat pemandu di platform ditentukan oleh ulasan dan status aktif — urutan berdasarkan aturan yang transparan, platform tidak memihak pemandu mana pun.',
    finalTitle: 'Siap? Mulai dari jalur terpendek',
    finalBody: 'Disarankan mengikuti alur: ritual harian → satu alat → jika ada resonansi, lanjutkan. Beri dirimu lima menit, coba dulu.',
  },
  ja: {
    reportIssue: '問題を報告',
    eyebrow: '公開テスト中 ｜ 自己理解ツール',
    title: 'まず自分を整理して、それから次の一歩を決める。',
    body: '自分を整理してから次のステップを決めるためのツールプラットフォームです。毎日の儀式、自己探索、深い解説まで——自分をもう一つの角度から見るきっかけになります。必要なときは、ガイドに深く話しかけてみてください。',
    primary: '毎日の儀式を始める',
    secondary: 'すべてのツールを見る',
    tarot: 'タロットを試す',
    beta: 'テストタスク一覧',
    teacher: '必要なときにガイドを探す',
    secondaryRoutesLabel: 'その他の入口',
    points: '8つの自己探索ツール、すぐに始められる',
    unlock: '毎日の儀式で小さな節目を作る',
    teacherNote: 'ガイドは選択肢であり、必須ではありません',
    previewTitle: '自己探索タスクボード',
    previewSubtitle: 'まず自分を知り、それから深入りするか決める',
    steps: ['基本ツールで自分を理解する', '詳細解説を開く', '必要なときにガイドを探す'],
    promiseTitle: '公開テスト中に約束する三つのこと',
    promises: [
      {
        label: 'テスト進行中',
        title: 'まず一周して、その後ゆっくり改善する',
        body: 'この段階で一番大切なのは：使いやすいかどうか、理解できるかどうかです。詰まったり分からない部分があれば、ぜひ教えてください。',
      },
      {
        label: 'ツール優先',
        title: 'まず自分を知り、深入りするか決める',
        body: '数秘術、ヒューマンデザインから毎日のタロットまで——8つのツール入口は、各システムを事前に理解しなくてもすぐに始められます。',
      },
      {
        label: 'スマホ優先',
        title: '実際のユーザーのスマホ体験を基準にする',
        body: '公開テストで最も重視するのは：スマホ画面が窮屈でないか、ボタンが分かりやすいか、ログインとデータ保存がスムーズかどうかです。',
      },
    ],
    testerTitle: '今日は4つのことを確認してください',
    testerBody: 'すべての機能を試す必要はありません。順番に一周するだけで、どこを改善すべきか分かります。',
    testerItems: ['一つのツールが分かりやすいか', '毎日の儀式に再訪する理由があるか', '詳細解説が十分に明確か', 'どのボタンや文言で迷ったか'],
    noticeTitle: 'テスト注意事項',
    noticeBody: 'MELEは自己理解とエンターテインメントのためのツールであり、医療、法律、投資、または心理療法の代替にはなりません。ツールの結果は自己探索の参考にのみ使用できます。心身に不調がある場合は、専門の医療機関や心理の専門家にご相談ください。',
    philosophyKicker: 'OUR APPROACH',
    philosophyTitle: '私たちがやっていること、実はとてもシンプルです',
    philosophyBody: '私たちはあなたの代わりに結論を出しません。ただ、自分を見るもう一つの角度を提供するだけです。ツールの結果は参考であり、判断ではありません。ガイドは選択肢であり、必須ではありません。いつでもツールだけ使って、ガイドを探さなくてもかまいません。プラットフォーム上のガイドの順位は、評価やオンライン状態などの客観的な条件によって決まります。順位は公開ルールに基づいており、特定のガイドを優遇することはありません。',
    finalTitle: '準備ができたら、最短ルートから始めましょう',
    finalBody: '「毎日の儀式 → ひとつのツール → 気になったら続けて見る」というルートから試すことをお勧めします。5分間、試してみてください。',
  },
  ko: {
    reportIssue: '문제 신고',
    eyebrow: '공개 테스트 진행 중 ｜ 자기 이해 도구',
    title: '먼저 자신을 정리하고, 그 다음 방향을 결정하세요.',
    body: '나를 먼저 정리한 후 다음 선택을 결정하기 위한 도구 플랫폼입니다. 매일 리추얼, 자기 탐색부터 심층 해석까지 — 나를 바라보는 하나의 시각을 더해드립니다. 필요할 때 가이드를 찾아 깊이 대화해 보세요.',
    primary: '데일리 리추얼 시작하기',
    secondary: '모든 도구 보기',
    tarot: '타로 뽑아보기',
    beta: '테스트 할 일 목록',
    teacher: '필요할 때 가이드 찾기',
    secondaryRoutesLabel: '다른 입구',
    points: '여덟 가지 자기 탐색 도구, 바로 시작 가능',
    unlock: '매일 리추얼로 하루의 작은 의식을 만든다',
    teacherNote: '가이드는 선택지이지, 필수가 아닙니다',
    previewTitle: '자기 탐색 태스크 보드',
    previewSubtitle: '나를 먼저 알고, 그 다음 깊이 볼지 결정해요',
    steps: ['기본 도구로 나를 이해하기', '심층 해석 열기', '필요할 때 가이드 찾기'],
    promiseTitle: '공개 테스트 기간 동안 약속하는 세 가지',
    promises: [
      {
        label: '테스트 진행 중',
        title: '한 번 돌아보고, 천천히 개선해 나가요',
        body: '이 단계에서 가장 중요한 건: 사용이 편한지, 이해할 수 있는지입니다. 막히거나 이해가 안 되는 부분이 있으면 알려주세요.',
      },
      {
        label: '도구 우선',
        title: '나를 먼저 알고, 더 깊이 볼지 결정해요',
        body: '수비학, 휴먼디자인부터 매일 타로까지 — 여덟 가지 도구 입구 모두 각 시스템을 미리 이해하지 않아도 바로 시작할 수 있습니다.',
      },
      {
        label: '모바일 우선',
        title: '실제 사용자의 모바일 경험을 기준으로 해요',
        body: '공개 테스트에서 가장 중시하는 것: 모바일 화면이 너무 빽빽하지 않은지, 버튼이 명확한지, 로그인과 기록 저장이 원활한지입니다.',
      },
    ],
    testerTitle: '오늘 이 4가지를 확인해 주세요',
    testerBody: '모든 기능을 다 써볼 필요 없어요. 순서대로 한 번만 돌아보면 어디를 개선해야 할지 알 수 있습니다.',
    testerItems: ['도구 하나가 이해하기 쉬운지', '매일 리추얼에 다시 올 이유가 있는지', '심층 해석이 충분히 명확한지', '어떤 버튼이나 문구에서 망설였는지'],
    noticeTitle: '테스트 안내',
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
      <section className="beta2-hero" aria-label="MELE 公開測試首頁">
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
            <Link href={localizePath('/beta', locale)}>
              {copy.beta}
            </Link>
            <Link href={localizePath('/teachers', locale)}>
              {copy.teacher}
            </Link>
          </nav>

          <div className="beta2-trust home-trust-list" aria-label="公開測試規則">
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
              <strong>Beta</strong>
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

      <section className="beta2-public-panel" aria-label={copy.testerTitle}>
        <div>
          <span className="beta2-panel-kicker">PUBLIC TEST BRIEF</span>
          <h2>{copy.testerTitle}</h2>
          <p>{copy.testerBody}</p>
        </div>
        <ol>
          {copy.testerItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
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
