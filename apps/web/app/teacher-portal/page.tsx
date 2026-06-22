import { redirect } from 'next/navigation';
import Link from 'next/link';
import { headers } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_HEADER, isLocale, localizePath, type Locale } from '@/lib/i18n';
import {
  getTeacherCopy,
  localizeDemoService,
  localizeDemoTeacher,
  teacherLocaleTag,
  type TeacherCopy,
} from '@/lib/i18n/teacher-copy';
import { TeacherBriefWorkbench, type TeacherWorkbenchCard } from '@/components/TeacherBriefWorkbench';
import { createClient } from '@/lib/supabase/server';
import { buildTeacherReadingBrief, type TeacherReadingBrief } from '@/lib/member-unlocks';
import {
  buildDailyConsultationBrief,
  buildTeacherConsultationBrief,
  type TeacherBriefDraft,
} from '@/lib/teacher-consultation-briefs';
import { getServerTestUser } from '@/lib/test-auth-server';
import type { CalcResponse, CalcTool } from '@/lib/api';
import type { Teacher } from '@/types/db';

type TeacherBriefCard = {
  id: string;
  scheduledAt: string | null;
  status: string;
  brief: TeacherReadingBrief;
};

type BookingRow = {
  id: string;
  customer_id: string;
  status: string;
  amount_ntd: number;
  scheduled_at: string;
  customer_question: string | null;
  chart_tool: string | null;
  chart_data: Record<string, unknown> | null;
};

type ChartRecordRow = {
  id: string;
  user_id: string | null;
  tool: string;
  output_data: Record<string, unknown>;
  created_at: string;
};

type ConsultationBriefRow = {
  booking_id: string;
  generated_brief: Record<string, unknown> | null;
  teacher_overrides: Record<string, unknown> | null;
  status: string | null;
  updated_at: string | null;
};

const CALC_TOOLS: CalcTool[] = ['numerology', 'maya', 'bazi', 'ziwei', 'tarot', 'runes', 'astro', 'humandesign'];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function hasKeys(value: Record<string, unknown>) {
  return Object.keys(value).length > 0;
}

function normalizeTool(value: unknown): CalcTool | null {
  return typeof value === 'string' && CALC_TOOLS.includes(value as CalcTool) ? value as CalcTool : null;
}

function calcResponseFrom(tool: CalcTool, data: Record<string, unknown>, input: Record<string, unknown> = {}): CalcResponse {
  return {
    tool,
    version: 'teacher-workbench',
    computed_at: new Date().toISOString(),
    input,
    data,
    render: {},
  };
}

function bookingToCalcResponse(booking: BookingRow, chartRecord?: ChartRecordRow): CalcResponse {
  const bookingPayload = asRecord(booking.chart_data);
  const recordPayload = asRecord(chartRecord?.output_data);
  const payload = hasKeys(bookingPayload) ? bookingPayload : recordPayload;
  const tool =
    normalizeTool(booking.chart_tool) ??
    normalizeTool(chartRecord?.tool) ??
    normalizeTool(payload.tool) ??
    'numerology';
  const input = {
    ...asRecord(payload.input),
    question: booking.customer_question ?? asRecord(payload.input).question ?? '',
  };
  const data = hasKeys(asRecord(payload.data)) ? asRecord(payload.data) : payload;

  return {
    ...calcResponseFrom(tool, data, input),
    version: typeof payload.version === 'string' ? payload.version : 'teacher-workbench',
    computed_at: typeof payload.computed_at === 'string' ? payload.computed_at : new Date().toISOString(),
    render: asRecord(payload.render) as CalcResponse['render'],
  };
}

function makeWorkbenchCards(
  bookings: BookingRow[],
  chartByUser: Map<string, ChartRecordRow>,
  draftByBooking: Map<string, ConsultationBriefRow> = new Map(),
  locale: Locale = DEFAULT_LOCALE,
): TeacherWorkbenchCard[] {
  return bookings.slice(0, 8).map((booking, index) => {
    const result = bookingToCalcResponse(booking, chartByUser.get(booking.customer_id));
    const saved = draftByBooking.get(booking.id);
    const brief = buildTeacherConsultationBrief({
      result,
      customerQuestion: booking.customer_question,
      locale,
    });
    const customerLabel = booking.customer_question
      ? booking.customer_question.slice(0, 18)
      : locale === 'zh-TW' ? `預約客人 ${index + 1}` : `Client ${index + 1}`;

    return {
      id: `booking-${booking.id}`,
      bookingId: booking.id,
      status: booking.status,
      scheduledAt: booking.scheduled_at,
      customerLabel,
      brief,
      draft: saved?.teacher_overrides as TeacherBriefDraft | undefined,
      savedStatus: saved?.status ?? null,
    };
  });
}

function makeDemoCalcResponse(tool: CalcTool, data: Record<string, unknown>, question: string): CalcResponse {
  return calcResponseFrom(tool, data, { question });
}

const DEMO_WORKBENCH_QUESTIONS: Record<Locale, Record<string, string>> = {
  'zh-TW': {
    bazi: '想問主題：事業 / 工作\n目前卡點：一直猶豫要不要轉職\n這次想帶走：知道怎麼判斷下一步\n客人補充：我想知道今年是否適合轉職，也想理解自己反覆猶豫的原因。',
    ziwei: '想問主題：自我定位\n目前卡點：不知道自己適合被看見的位置\n這次想帶走：找到比較舒服的角色\n客人補充：我想知道自己適合被看見的角色，以及事業方向。',
    astro: '想問主題：感情 / 關係\n目前卡點：常覺得自己很矛盾\n這次想帶走：理解情緒需求\n客人補充：我在關係裡常覺得自己很矛盾，想知道怎麼理解情緒需求。',
    humandesign: '想問主題：自我 / 能量\n目前卡點：很容易被別人的節奏帶走\n這次想帶走：知道怎麼回到自己的節奏\n客人補充：我想知道為什麼自己很容易被別人的節奏帶走。',
    maya: '想問主題：年度方向\n目前卡點：不知道今年的主題是什麼\n這次想帶走：面對挑戰的角度\n客人補充：我想理解今年的生命主題，以及如何面對挑戰。',
    numerology: '想問主題：個人成長\n目前卡點：同樣模式一直重複\n這次想帶走：知道自己可以怎麼調整\n客人補充：我想知道自己的反覆模式與成長方向。',
    tarot: '想問主題：感情 / 關係\n目前卡點：不確定對方是不是認真\n這次想帶走：看清楚目前互動\n客人補充：我想看近期感情狀態，對方到底是不是認真的。',
    runes: '想問主題：下一步選擇\n目前卡點：不知道要保守還是主動\n這次想帶走：一個可以行動的提醒\n客人補充：我想知道下一步該保守一點，還是主動推進。',
    daily: '每日儀式開場',
    dailyQuestion: '今天我需要什麼提醒？',
  },
  en: {
    bazi: 'Topic: Career / work\nCurrent block: I keep hesitating about changing jobs\nTakeaway: A way to judge the next step\nClient note: I want to know whether this year is suitable for a job change and why I keep hesitating.',
    ziwei: 'Topic: Self-positioning\nCurrent block: I do not know what role fits me\nTakeaway: A role that feels more comfortable\nClient note: I want to understand the role where I can be seen and my career direction.',
    astro: 'Topic: Relationship\nCurrent block: I often feel contradictory\nTakeaway: Understand my emotional needs\nClient note: I want to understand why I feel split in relationships.',
    humandesign: 'Topic: Self / energy\nCurrent block: I easily follow other people’s rhythm\nTakeaway: A way back to my own rhythm\nClient note: I want to know why I am so easily carried by others.',
    maya: 'Topic: Year direction\nCurrent block: I do not know this year’s theme\nTakeaway: A new way to face challenges\nClient note: I want to understand my life theme this year.',
    numerology: 'Topic: Personal growth\nCurrent block: The same pattern keeps repeating\nTakeaway: A practical adjustment\nClient note: I want to understand my repeated pattern and growth direction.',
    tarot: 'Topic: Relationship\nCurrent block: I cannot tell whether the other person is serious\nTakeaway: See the current interaction clearly\nClient note: I want to read the recent relationship state.',
    runes: 'Topic: Next step\nCurrent block: I do not know whether to stay cautious or move forward\nTakeaway: One actionable reminder\nClient note: I want to know the next step.',
    daily: 'Daily ritual opener',
    dailyQuestion: 'What reminder do I need today?',
  },
  vi: {
    bazi: 'Chủ đề muốn hỏi: Sự nghiệp / công việc\nĐiểm đang kẹt: Tôi cứ do dự có nên đổi việc không\nMuốn mang về: Cách phán đoán bước tiếp theo\nGhi chú của khách: Tôi muốn biết năm nay có hợp đổi việc không và vì sao mình cứ do dự.',
    ziwei: 'Chủ đề muốn hỏi: Định vị bản thân\nĐiểm đang kẹt: Tôi không biết vai nào thật sự hợp với mình\nMuốn mang về: Một vai trò thoải mái hơn\nGhi chú của khách: Tôi muốn hiểu vị trí mình có thể được nhìn thấy và hướng sự nghiệp.',
    astro: 'Chủ đề muốn hỏi: Quan hệ\nĐiểm đang kẹt: Tôi thường thấy mình mâu thuẫn\nMuốn mang về: Hiểu nhu cầu cảm xúc\nGhi chú của khách: Tôi muốn hiểu vì sao trong quan hệ mình hay bị kéo hai hướng.',
    humandesign: 'Chủ đề muốn hỏi: Bản thân / năng lượng\nĐiểm đang kẹt: Tôi dễ bị nhịp của người khác cuốn đi\nMuốn mang về: Cách quay về nhịp của mình\nGhi chú của khách: Tôi muốn biết vì sao mình dễ bị người khác dẫn nhịp.',
    maya: 'Chủ đề muốn hỏi: Hướng đi năm nay\nĐiểm đang kẹt: Tôi không biết chủ đề năm nay là gì\nMuốn mang về: Góc nhìn mới khi đối diện thử thách\nGhi chú của khách: Tôi muốn hiểu chủ đề linh hồn của năm nay.',
    numerology: 'Chủ đề muốn hỏi: Trưởng thành cá nhân\nĐiểm đang kẹt: Cùng một mẫu hình cứ lặp lại\nMuốn mang về: Một điều chỉnh thực tế\nGhi chú của khách: Tôi muốn hiểu mẫu hình lặp lại và hướng trưởng thành.',
    tarot: 'Chủ đề muốn hỏi: Quan hệ\nĐiểm đang kẹt: Tôi không biết người kia có nghiêm túc không\nMuốn mang về: Nhìn rõ tương tác hiện tại\nGhi chú của khách: Tôi muốn xem trạng thái tình cảm gần đây.',
    runes: 'Chủ đề muốn hỏi: Bước tiếp theo\nĐiểm đang kẹt: Tôi không biết nên giữ lại hay chủ động\nMuốn mang về: Một lời nhắc có thể hành động\nGhi chú của khách: Tôi muốn biết bước tiếp theo.',
    daily: 'Mở đầu nghi thức hằng ngày',
    dailyQuestion: 'Hôm nay tôi cần lời nhắc nào?',
  },
  id: {
    bazi: 'Topik yang ingin ditanya: Karier / kerja\nBagian yang macet: Saya terus ragu apakah perlu pindah kerja\nYang ingin dibawa pulang: Cara menilai langkah berikutnya\nCatatan klien: Saya ingin tahu apakah tahun ini cocok untuk pindah kerja dan mengapa saya terus ragu.',
    ziwei: 'Topik yang ingin ditanya: Posisi diri\nBagian yang macet: Saya tidak tahu peran apa yang cocok\nYang ingin dibawa pulang: Peran yang terasa lebih nyaman\nCatatan klien: Saya ingin memahami peran yang membuat saya terlihat dan arah karier.',
    astro: 'Topik yang ingin ditanya: Relasi\nBagian yang macet: Saya sering merasa kontradiktif\nYang ingin dibawa pulang: Memahami kebutuhan emosi\nCatatan klien: Saya ingin mengerti mengapa dalam relasi saya terasa terbelah.',
    humandesign: 'Topik yang ingin ditanya: Diri / energi\nBagian yang macet: Saya mudah terbawa ritme orang lain\nYang ingin dibawa pulang: Cara kembali ke ritme sendiri\nCatatan klien: Saya ingin tahu mengapa saya mudah mengikuti orang lain.',
    maya: 'Topik yang ingin ditanya: Arah tahun ini\nBagian yang macet: Saya tidak tahu tema tahun ini\nYang ingin dibawa pulang: Cara baru menghadapi tantangan\nCatatan klien: Saya ingin memahami tema hidup tahun ini.',
    numerology: 'Topik yang ingin ditanya: Pertumbuhan pribadi\nBagian yang macet: Pola yang sama terus berulang\nYang ingin dibawa pulang: Penyesuaian praktis\nCatatan klien: Saya ingin memahami pola berulang dan arah pertumbuhan.',
    tarot: 'Topik yang ingin ditanya: Relasi\nBagian yang macet: Saya tidak yakin apakah dia serius\nYang ingin dibawa pulang: Melihat interaksi saat ini dengan jelas\nCatatan klien: Saya ingin membaca kondisi hubungan terbaru.',
    runes: 'Topik yang ingin ditanya: Langkah berikutnya\nBagian yang macet: Saya tidak tahu harus hati-hati atau maju\nYang ingin dibawa pulang: Satu pengingat yang bisa dilakukan\nCatatan klien: Saya ingin tahu langkah berikutnya.',
    daily: 'Pembuka ritual harian',
    dailyQuestion: 'Pengingat apa yang saya butuhkan hari ini?',
  },
  ja: {
    bazi: '相談テーマ：仕事 / キャリア\n今つまずいている点：転職するかずっと迷っている\n持ち帰りたいこと：次の一歩を判断する方法\n相談者メモ：今年転職に向いているのか、なぜ迷い続けるのか知りたい。',
    ziwei: '相談テーマ：自己定位\n今つまずいている点：自分に合う役割が分からない\n持ち帰りたいこと：より心地よい役割\n相談者メモ：自分が見られやすい役割と仕事の方向性を知りたい。',
    astro: '相談テーマ：関係性\n今つまずいている点：自分の中で矛盾を感じやすい\n持ち帰りたいこと：感情のニーズを理解すること\n相談者メモ：関係の中でなぜ揺れやすいのか知りたい。',
    humandesign: '相談テーマ：自己 / エネルギー\n今つまずいている点：相手のペースに流されやすい\n持ち帰りたいこと：自分のリズムに戻る方法\n相談者メモ：なぜ人のリズムに引っ張られやすいのか知りたい。',
    maya: '相談テーマ：今年の方向性\n今つまずいている点：今年のテーマが分からない\n持ち帰りたいこと：挑戦に向き合う視点\n相談者メモ：今年の生命テーマを理解したい。',
    numerology: '相談テーマ：自己成長\n今つまずいている点：同じパターンが繰り返される\n持ち帰りたいこと：実践できる調整\n相談者メモ：繰り返すパターンと成長方向を知りたい。',
    tarot: '相談テーマ：関係性\n今つまずいている点：相手が本気か分からない\n持ち帰りたいこと：今のやり取りを整理すること\n相談者メモ：最近の恋愛状態を見たい。',
    runes: '相談テーマ：次の一歩\n今つまずいている点：慎重に行くか進むか迷っている\n持ち帰りたいこと：行動できる一つのヒント\n相談者メモ：次の一歩を知りたい。',
    daily: '今日の儀式の導入',
    dailyQuestion: '今日必要なメッセージは何ですか？',
  },
  ko: {
    bazi: '질문 주제: 커리어 / 일\n현재 막힌 지점: 이직해야 할지 계속 망설인다\n가져가고 싶은 것: 다음 단계를 판단하는 방법\n고객 메모: 올해 이직이 맞는지, 왜 계속 망설이는지 알고 싶다.',
    ziwei: '질문 주제: 자기 위치\n현재 막힌 지점: 나에게 맞는 역할을 모르겠다\n가져가고 싶은 것: 더 편안한 역할\n고객 메모: 내가 잘 보일 수 있는 역할과 일의 방향을 알고 싶다.',
    astro: '질문 주제: 관계\n현재 막힌 지점: 내 안에서 모순을 자주 느낀다\n가져가고 싶은 것: 감정적 욕구 이해\n고객 메모: 관계에서 왜 자꾸 흔들리는지 알고 싶다.',
    humandesign: '질문 주제: 자기 / 에너지\n현재 막힌 지점: 타인의 리듬에 쉽게 끌려간다\n가져가고 싶은 것: 내 리듬으로 돌아오는 방법\n고객 메모: 왜 다른 사람의 속도에 쉽게 끌리는지 알고 싶다.',
    maya: '질문 주제: 올해 방향\n현재 막힌 지점: 올해의 주제를 모르겠다\n가져가고 싶은 것: 도전을 바라보는 관점\n고객 메모: 올해의 삶의 주제를 이해하고 싶다.',
    numerology: '질문 주제: 개인 성장\n현재 막힌 지점: 같은 패턴이 계속 반복된다\n가져가고 싶은 것: 실천 가능한 조정\n고객 메모: 반복 패턴과 성장 방향을 알고 싶다.',
    tarot: '질문 주제: 관계\n현재 막힌 지점: 상대가 진심인지 모르겠다\n가져가고 싶은 것: 현재 상호작용을 명확히 보기\n고객 메모: 최근 연애 상태를 보고 싶다.',
    runes: '질문 주제: 다음 단계\n현재 막힌 지점: 조심해야 할지 추진해야 할지 모르겠다\n가져가고 싶은 것: 행동 가능한 알림\n고객 메모: 다음 단계를 알고 싶다.',
    daily: '오늘의 의식 시작',
    dailyQuestion: '오늘 나에게 필요한 메시지는 무엇인가요?',
  },
};

function demoQuestion(locale: Locale, key: keyof typeof DEMO_WORKBENCH_QUESTIONS['zh-TW']) {
  return (DEMO_WORKBENCH_QUESTIONS[locale] ?? DEMO_WORKBENCH_QUESTIONS[DEFAULT_LOCALE])[key];
}

function makeDemoWorkbenchCards(locale: Locale = DEFAULT_LOCALE): TeacherWorkbenchCard[] {
  const now = Date.now();
  const demoItems: Array<{
    id: string;
    result: CalcResponse;
    question: string;
    scheduledAt: string;
  }> = [
    {
      id: 'demo-bazi',
      question: demoQuestion(locale, 'bazi'),
      scheduledAt: new Date(now + 86400000).toISOString(),
      result: makeDemoCalcResponse('bazi', {
        dayMaster: '丁火',
        pillars: ['丙子', '庚寅', '丁酉', '甲辰'],
        wuxing: { 木: 2, 火: 2, 土: 1, 金: 2, 水: 1 },
      }, demoQuestion(locale, 'bazi')),
    },
    {
      id: 'demo-ziwei',
      question: demoQuestion(locale, 'ziwei'),
      scheduledAt: new Date(now + 86400000 * 2).toISOString(),
      result: makeDemoCalcResponse('ziwei', {
        mingGong: '午宮',
        shenGong: '事業宮',
        mainStars: ['紫微', '天府', '左輔'],
      }, demoQuestion(locale, 'ziwei')),
    },
    {
      id: 'demo-astro',
      question: demoQuestion(locale, 'astro'),
      scheduledAt: new Date(now + 86400000 * 3).toISOString(),
      result: makeDemoCalcResponse('astro', {
        sun: '雙魚座',
        moon: '獅子座',
        ascendant: '天秤座',
        midheaven: '巨蟹座',
      }, demoQuestion(locale, 'astro')),
    },
    {
      id: 'demo-hd',
      question: demoQuestion(locale, 'humandesign'),
      scheduledAt: new Date(now + 86400000 * 4).toISOString(),
      result: makeDemoCalcResponse('humandesign', {
        type: '顯示生產者',
        authority: '情緒權威',
        profile: '6/2',
        strategy: '等待回應，然後告知',
        activatedGates: [
          { gate: 37, line: 6, source: '人格太陽' },
          { gate: 40, line: 2, source: '人格地球' },
          { gate: 23, line: 4, source: '設計水星' },
          { gate: 28, line: 3, source: '設計火星' },
        ],
        definedChannels: [[37, 40]],
        gates: ['37', '40', '23', '28'],
        channels: ['37-40'],
      }, demoQuestion(locale, 'humandesign')),
    },
    {
      id: 'demo-maya',
      question: demoQuestion(locale, 'maya'),
      scheduledAt: new Date(now + 86400000 * 5).toISOString(),
      result: makeDemoCalcResponse('maya', {
        kin: 52,
        tone: '宇宙',
        seal: '黃人',
        guide: '黃戰士',
        analog: '藍手',
        antipode: '白風',
        occult: '紅月',
      }, demoQuestion(locale, 'maya')),
    },
    {
      id: 'demo-numerology',
      question: demoQuestion(locale, 'numerology'),
      scheduledAt: new Date(now + 86400000 * 6).toISOString(),
      result: makeDemoCalcResponse('numerology', {
        lifePath: 4,
        birthDay: 15,
        lifePathArchetype: '建築師',
      }, demoQuestion(locale, 'numerology')),
    },
    {
      id: 'demo-tarot',
      question: demoQuestion(locale, 'tarot'),
      scheduledAt: new Date(now + 86400000 * 7).toISOString(),
      result: makeDemoCalcResponse('tarot', {
        cards: [{
          spread_position: '現在',
          position: 'upright',
          card: {
            name_zh: '女祭司',
            upright: { text: '傾聽直覺與沉默訊息。' },
            keywords: ['直覺', '等待', '內在訊息'],
          },
        }],
      }, demoQuestion(locale, 'tarot')),
    },
    {
      id: 'demo-runes',
      question: demoQuestion(locale, 'runes'),
      scheduledAt: new Date(now + 86400000 * 8).toISOString(),
      result: makeDemoCalcResponse('runes', {
        meta: { material: 'crystal' },
        runes: [{
          spread_position: '提醒',
          position: 'reversed',
          rune: {
            zh: 'Fehu',
            reversed: { text: '資源需要重新整理，先確認什麼是真的有價值。' },
            keywords: ['資源', '價值', '整理'],
          },
        }],
      }, demoQuestion(locale, 'runes')),
    },
  ];

  const dailyTarot = buildDailyConsultationBrief({
    kind: 'daily_tarot',
    result: makeDemoCalcResponse('tarot', {
      cards: [{
        spread_position: '今日訊息',
        position: 'upright',
        card: {
          name_zh: '星星',
          upright: { text: '先讓希望重新進來，再決定下一步。' },
          keywords: ['希望', '修復', '方向'],
        },
      }],
    }, demoQuestion(locale, 'dailyQuestion')),
    date: '2026-05-09',
    locale,
  });
  const dailyRune = buildDailyConsultationBrief({
    kind: 'daily_runes',
    result: makeDemoCalcResponse('runes', {
      meta: { material: 'wood' },
      runes: [{
        spread_position: '今日訊息',
        position: 'upright',
        rune: {
          zh: 'Ansuz',
          upright: { text: '把話說清楚，訊息會帶來新的理解。' },
          keywords: ['溝通', '訊息', '理解'],
        },
      }],
    }, demoQuestion(locale, 'dailyQuestion')),
    date: '2026-05-09',
    locale,
  });
  const dailyStone = buildDailyConsultationBrief({
    kind: 'daily_stone',
    result: makeDemoCalcResponse('runes', {
      meta: { material: 'stone' },
      runes: [{
        spread_position: '今日石訊息',
        position: 'upright',
        rune: {
          zh: 'Laguz',
          upright: { text: '先讓情緒流動，不要急著立刻定案。' },
          keywords: ['情緒', '流動', '直覺'],
        },
      }],
    }, demoQuestion(locale, 'dailyQuestion')),
    date: '2026-05-09',
    locale,
  });

  return [
    ...demoItems.map((item, index) => ({
      id: item.id,
      bookingId: null,
      status: 'demo',
      scheduledAt: item.scheduledAt,
      customerLabel: item.question.slice(0, 18),
      brief: buildTeacherConsultationBrief({
        result: item.result,
        customerQuestion: item.question,
        locale,
      }),
      draft: null,
      savedStatus: null,
    })),
    ...[dailyTarot, dailyRune, dailyStone].map((brief, index) => ({
      id: `demo-daily-${index + 1}`,
      bookingId: null,
      status: 'demo',
      scheduledAt: new Date(now + 86400000 * (9 + index)).toISOString(),
      customerLabel: demoQuestion(locale, 'daily'),
      brief,
      draft: null,
      savedStatus: null,
    })),
  ];
}

function TeacherMemberBriefPanel({
  cards,
  copy,
  statusLabels,
  localeTag,
  demoMode = false,
}: {
  cards: TeacherBriefCard[];
  copy: TeacherCopy['portal']['memberBrief'];
  statusLabels: TeacherCopy['statusLabels'];
  localeTag: string;
  demoMode?: boolean;
}) {
  return (
    <section className="teacher-member-brief" aria-label={copy.aria}>
      <div className="teacher-member-brief__header">
        <span>{copy.kicker}</span>
        <h2>{copy.title}</h2>
        <p>
          {copy.body}
        </p>
      </div>
      {cards.length === 0 && (
        <div className="teacher-member-brief__empty">
          {copy.empty}
        </div>
      )}
      {cards.length > 0 && (
        <div className="teacher-member-brief__grid">
          {cards.map((card) => (
            <article key={card.id} className="teacher-member-brief__item">
              <div className="teacher-member-brief__meta">
                <span>{statusLabels[card.status] ?? card.status}</span>
                {card.scheduledAt && <time>{new Date(card.scheduledAt).toLocaleString(localeTag)}</time>}
              </div>
              <h3>{card.brief.title}</h3>
              <p>{card.brief.summary}</p>
              <dl>
                {card.brief.items.map((item) => (
                  <div key={`${card.id}-${item.label}`}>
                    <dt>{item.label}</dt>
                    <dd>{item.body}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      )}
      {demoMode && (
        <p className="teacher-member-brief__note">
          {copy.demoNote}
        </p>
      )}
    </section>
  );
}

function TeacherReadingAssistPanel({
  cards,
  copy,
}: {
  cards: TeacherBriefCard[];
  copy: TeacherCopy['portal']['assist'];
}) {
  const primary = cards[0];
  const question = primary?.brief.items.find((item) => item.label === '所問')?.body ?? primary?.brief.summary;
  const chart = primary?.brief.items.find((item) => item.label === '所附')?.body;
  const prep = primary?.brief.items.find((item) => item.label === '老師備註')?.body;

  return (
    <section className="teacher-member-brief teacher-reading-assist" aria-label={copy.aria}>
      <div className="teacher-member-brief__header">
        <span>{copy.kicker}</span>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
      </div>

      {!primary && <div className="teacher-member-brief__empty">{copy.empty}</div>}

      {primary && (
        <div className="teacher-member-brief__grid">
          <article className="teacher-member-brief__item">
            <div className="teacher-member-brief__meta"><span>{copy.questionTitle}</span></div>
            <h3>{primary.brief.title}</h3>
            <p>{question}</p>
          </article>
          <article className="teacher-member-brief__item">
            <div className="teacher-member-brief__meta"><span>{copy.chartTitle}</span></div>
            <p>{chart}</p>
          </article>
          <article className="teacher-member-brief__item">
            <div className="teacher-member-brief__meta"><span>{copy.prepTitle}</span></div>
            <p>{prep}</p>
          </article>
        </div>
      )}

      <div className="teacher-member-brief__grid">
        {[
          [copy.openingTitle, copy.openingQuestions],
          [copy.boundaryTitle, copy.boundaries],
          [copy.transitTitle, copy.transitPrompts],
        ].map(([title, items]) => (
          <article key={title as string} className="teacher-member-brief__item">
            <h3>{title as string}</h3>
            <ul>
              {(items as string[]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function TeacherPortalReadiness({
  teacher,
  activeServiceCount,
  pendingActionCount,
  isFreeTestMode,
  copy,
  locale,
  demoMode = false,
}: {
  teacher: Teacher;
  activeServiceCount: number;
  pendingActionCount: number;
  isFreeTestMode: boolean;
  copy: TeacherCopy['portal'];
  locale: Locale;
  demoMode?: boolean;
}) {
  const profileReady = Boolean(
    teacher.display_name &&
    teacher.title &&
    teacher.intro_short &&
    (teacher.specialties || []).length > 0,
  );
  const contactReady = Boolean(teacher.line_url || teacher.instagram || teacher.facebook || teacher.website);
  const items = [
    {
      title: copy.readiness.items.profile[0],
      body: profileReady ? copy.readiness.items.profile[1] : copy.readiness.items.profile[2],
      done: profileReady,
    },
    {
      title: copy.readiness.items.services[0],
      body: activeServiceCount > 0 ? copy.readiness.items.services[1](activeServiceCount) : copy.readiness.items.services[2],
      done: activeServiceCount > 0,
    },
    {
      title: copy.readiness.items.bookings[0],
      body: pendingActionCount > 0 ? copy.readiness.items.bookings[1](pendingActionCount) : copy.readiness.items.bookings[2],
      done: pendingActionCount === 0,
    },
    {
      title: copy.readiness.items.testMode[0],
      body: isFreeTestMode ? copy.readiness.items.testMode[1] : copy.readiness.items.testMode[2],
      done: isFreeTestMode,
    },
    {
      title: copy.readiness.items.contact[0],
      body: contactReady ? copy.readiness.items.contact[1] : copy.readiness.items.contact[2],
      done: contactReady,
    },
  ];
  const completed = items.filter((item) => item.done).length;

  return (
    <section className="teacher-readiness" aria-label={copy.readiness.aria}>
      <div className="teacher-readiness__header">
        <span>{copy.readiness.kicker}</span>
        <h2>{copy.readiness.title(completed, items.length)}</h2>
        <p>{copy.readiness.body}</p>
      </div>
      <div className="teacher-readiness__progress" aria-hidden="true">
        <i style={{ width: `${completed / items.length * 100}%` }} />
      </div>
      <div className="teacher-readiness__grid">
        {items.map((item) => (
          <article key={item.title} className={`teacher-readiness__item${item.done ? ' is-complete' : ''}`}>
            <strong>{item.done ? copy.readiness.ok : copy.readiness.todo}</strong>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
      <div className="teacher-readiness__actions">
        <Link href={demoMode ? localizePath('/teachers', locale) : localizePath(`/teachers/${teacher.id}`, locale)}>{copy.publicPage}</Link>
        <Link href={localizePath('/account/mybookings', locale)}>{copy.bookings}</Link>
      </div>
    </section>
  );
}

const demoTeacher: Teacher = {
  id: 'demo-teacher',
  user_id: '00000000-0000-4000-8000-000000000001',
  status: 'active',
  display_name: '測試老師',
  avatar_url: null,
  title: '塔羅與八字測試顧問',
  intro_short: '用來檢查老師後台、預約與服務呈現的本機測試資料。',
  intro_long: null,
  quote: '先把流程走順，再把正式資料接上。',
  specialties: ['塔羅', '八字', '自我探索'],
  consultation_style: 'structured',
  line_url: 'https://line.me',
  instagram: null,
  facebook: null,
  threads: null,
  youtube: null,
  website: 'https://mele.local',
  rating: 4.9,
  total_reviews: 12,
  cases_count: 36,
  commission_rate: 0.2,
  approved_at: new Date().toISOString(),
  paused_at: null,
  suspended_at: null,
  suspended_reason: null,
  admin_script: null,
  created_at: new Date().toISOString(),
};

type TeacherPortalPageProps = {
  searchParams?: Promise<{ teacher_id?: string | string[] }>;
};

export default async function TeacherPortalPage({ searchParams }: TeacherPortalPageProps) {
  const requestHeaders = await headers();
  const headerLocale = requestHeaders.get(LOCALE_HEADER);
  const locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE;
  const copy = getTeacherCopy(locale);
  const localeTag = teacherLocaleTag(locale);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const testUser = user ? null : await getServerTestUser();
  if (!user && !testUser) redirect(localizePath('/account/login?return=/teacher-portal', locale));

  if (testUser) {
    const localizedDemoTeacher = localizeDemoTeacher(demoTeacher, locale);
    const demoBookings = [
      { id: 'demo-1', status: 'confirmed', amount_ntd: 0, scheduled_at: new Date(Date.now() + 86400000).toISOString() },
      { id: 'demo-2', status: 'completed', amount_ntd: 0, scheduled_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    ];
    const demoServices = [
      { id: 'service-1', name: '測試塔羅諮詢', duration_minutes: 30, price_ntd: 0, is_active: true },
      { id: 'service-2', name: '測試八字初談', duration_minutes: 45, price_ntd: 0, is_active: true },
    ].map((service) => localizeDemoService(service, locale));
    const pendingActionCount = demoBookings.filter((b) => ['paid', 'confirmed'].includes(b.status)).length;
    const demoBriefCards: TeacherBriefCard[] = [
      {
        id: 'demo-brief-1',
        status: 'confirmed',
        scheduledAt: demoBookings[0].scheduled_at,
        brief: buildTeacherReadingBrief({
          customerQuestion: '我想知道今年是否適合轉職，也想理解自己反覆猶豫的原因。',
          chartTool: '塔羅',
          chartData: { mainCard: '審判', focus: '轉職', transit: '流年轉折', concern: '猶豫' },
        }),
      },
    ];
    const demoWorkbenchCards = makeDemoWorkbenchCards(locale);

    return (
      <div className="container mx-auto max-w-5xl px-5 pb-10 pt-24">
        <header className="text-center pb-6">
          <div className="text-accent tracking-[0.5em] text-sm mb-3 opacity-70">◆ ◆ ◆</div>
          <h1 className="font-serif text-3xl tracking-widest mb-1">{copy.portal.title}</h1>
          <div className="mele-subtitle">{copy.portal.subtitle}</div>
          <p className="mt-3 text-white/70 text-sm">{localizedDemoTeacher.display_name} · {copy.portal.demoMode}</p>
        </header>

        <div className="teacher-portal-mode-banner mb-5 rounded-lg border border-accent-dim bg-accent/[0.08] p-4 text-sm leading-relaxed text-white/72">
          <strong className="text-accent">示範模式</strong>：{copy.portal.demoNotice}
        </div>

        <TeacherBriefWorkbench cards={demoWorkbenchCards} demoMode locale={locale} />

        <TeacherPortalReadiness
          teacher={localizedDemoTeacher}
          activeServiceCount={demoServices.filter((service) => service.is_active).length}
          pendingActionCount={pendingActionCount}
          isFreeTestMode
          copy={copy.portal}
          locale={locale}
          demoMode
        />

        <TeacherMemberBriefPanel
          cards={demoBriefCards}
          copy={copy.portal.memberBrief}
          statusLabels={copy.statusLabels}
          localeTag={localeTag}
          demoMode
        />

        <TeacherReadingAssistPanel cards={demoBriefCards} copy={copy.portal.assist} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="mele-card text-center !p-5">
            <div className="font-serif text-3xl text-accent">1</div>
            <div className="text-xs text-white/70 tracking-widest mt-2">{copy.portal.stats.upcoming}</div>
          </div>
          <div className="mele-card text-center !p-5">
            <div className="font-serif text-3xl text-accent">1</div>
            <div className="text-xs text-white/70 tracking-widest mt-2">{copy.portal.stats.completed}</div>
          </div>
          <div className="mele-card text-center !p-5">
            <div className="font-serif text-3xl text-accent">4.90</div>
            <div className="text-xs text-white/70 tracking-widest mt-2">{copy.portal.stats.rating}</div>
          </div>
          <div className="mele-card text-center !p-5">
            <div className="font-serif text-3xl text-accent">{demoServices.length}</div>
            <div className="text-xs text-white/70 tracking-widest mt-2">{copy.portal.stats.services}</div>
          </div>
        </div>

        <div className="mele-card">
          <div className="mele-section-title">{copy.portal.recentTitle}</div>
          <div className="mele-section-subtitle">{copy.portal.recentSubtitle}</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-accent text-xs tracking-widest border-b border-accent-dim">
                  <th className="py-3 px-3 text-left">{copy.portal.tableTime}</th>
                  <th className="py-3 px-3 text-left">{copy.portal.tableStatus}</th>
                  <th className="py-3 px-3 text-left">{copy.portal.tableAmount}</th>
                  <th className="py-3 px-3 text-left">{copy.portal.tableReminder}</th>
                </tr>
              </thead>
              <tbody>
                {demoBookings.map((b) => (
                  <tr key={b.id} className="border-b border-accent-dim/30">
                    <td className="py-3 px-3 text-xs">{new Date(b.scheduled_at).toLocaleString(localeTag)}</td>
                    <td className="py-3 px-3 text-xs">{copy.statusLabels[b.status] ?? b.status}</td>
                    <td className="py-3 px-3">{copy.portal.freeTest}</td>
                    <td className="py-3 px-3 text-xs text-white/62">
                      {['paid', 'confirmed'].includes(b.status) ? copy.portal.paidReminder : copy.portal.noAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mele-card mt-6">
          <div className="mele-section-title">{copy.portal.serviceTitle(demoServices.length)}</div>
          <div className="mele-section-subtitle">{copy.portal.serviceSubtitle}</div>
          {demoServices.map((s) => (
            <div key={s.id} className="flex justify-between items-center border-b border-accent-dim/30 py-3">
              <div>
                <div className="text-sm">{s.name}</div>
                <div className="text-xs text-white/60">{s.duration_minutes} min · {copy.portal.freeTest}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-xs bg-success/30 text-success">{copy.portal.active}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) redirect(localizePath('/account/login?return=/teacher-portal', locale));

  const params = searchParams ? await searchParams : {};
  const requestedTeacherId = Array.isArray(params.teacher_id) ? params.teacher_id[0] : params.teacher_id;
  const { data: admin } = await supabase.from('admins').select('role').eq('user_id', user.id).maybeSingle();

  let teacherQuery = supabase.from('teachers').select('*');
  if (admin && requestedTeacherId) {
    teacherQuery = teacherQuery.eq('id', requestedTeacherId);
  } else if (admin) {
    teacherQuery = teacherQuery.order('approved_at', { ascending: false, nullsFirst: false }).limit(1);
  } else {
    teacherQuery = teacherQuery.eq('user_id', user.id);
  }

  const { data: teacher } = await teacherQuery.maybeSingle();

  if (!teacher) {
    return (
      <div className="container mx-auto max-w-2xl px-5 pb-16 pt-24 text-center">
        <div className="mele-card">
          <div className="font-serif text-2xl text-accent mb-3">
            {admin ? '目前沒有可代看的老師' : copy.portal.noTeacherTitle}
          </div>
          <p className="text-white/70 mb-5">
            {admin ? '請先到老師申請審核完成上架，或到老師資料調整確認老師狀態。' : copy.portal.noTeacherBody}
          </p>
          <Link
            href={admin ? '/admin/teachers' : localizePath('/teachers/apply', locale)}
            className="mele-btn-primary inline-block"
          >
            {admin ? '前往老師資料調整' : copy.portal.applyCta}
          </Link>
        </div>
      </div>
    );
  }

  const t = teacher as Teacher;
  const isAdminViewingTeacher = Boolean(admin && t.user_id !== user.id);

  // 取得統計與「需要老師準備」的有效未來預約；備課工作台不混入取消、退款、未付款或已完成紀錄。
  const nowIso = new Date().toISOString();
  const [bookings, activeBookings, services, reviews] = await Promise.all([
    supabase.from('bookings').select('id, customer_id, status, amount_ntd, scheduled_at, customer_question, chart_tool, chart_data')
      .eq('teacher_id', t.id)
      .order('scheduled_at', { ascending: false })
      .limit(10),
    supabase.from('bookings').select('id, customer_id, status, amount_ntd, scheduled_at, customer_question, chart_tool, chart_data')
      .eq('teacher_id', t.id)
      .in('status', ['paid', 'confirmed'])
      .gte('scheduled_at', nowIso)
      .order('scheduled_at', { ascending: true })
      .limit(10),
    supabase.from('teacher_services').select('*').eq('teacher_id', t.id).order('display_order'),
    supabase.from('reviews').select('rating').eq('teacher_id', t.id).eq('is_visible', true),
  ]);

  const bookingRows = (bookings.data || []) as BookingRow[];
  const activeBookingRows = (activeBookings.data || []) as BookingRow[];
  const briefSourceRows = activeBookingRows.length ? activeBookingRows : bookingRows.filter((booking) => ['paid', 'confirmed'].includes(booking.status));
  const customerIds = Array.from(new Set(briefSourceRows.map((booking) => booking.customer_id).filter(Boolean)));
  const chartRecords = customerIds.length
    ? await supabase
      .from('chart_records')
      .select('id, user_id, tool, output_data, created_at')
      .in('user_id', customerIds)
      .order('created_at', { ascending: false })
      .limit(30)
    : { data: [] };
  const draftRows = briefSourceRows.length
    ? await supabase
      .from('teacher_consultation_briefs')
      .select('booking_id, generated_brief, teacher_overrides, status, updated_at')
      .in('booking_id', briefSourceRows.map((booking) => booking.id))
    : { data: [] };
  const chartByUser = new Map<string, ChartRecordRow>();
  for (const record of (chartRecords.data || []) as ChartRecordRow[]) {
    const userId = typeof record.user_id === 'string' ? record.user_id : '';
    if (userId && !chartByUser.has(userId)) chartByUser.set(userId, record);
  }
  const draftByBooking = new Map<string, ConsultationBriefRow>();
  for (const row of (draftRows.data || []) as ConsultationBriefRow[]) {
    if (row.booking_id) draftByBooking.set(row.booking_id, row);
  }
  const teacherBriefCards: TeacherBriefCard[] = briefSourceRows.slice(0, 3).map((booking) => ({
    id: booking.id,
    status: booking.status,
    scheduledAt: booking.scheduled_at,
    brief: buildTeacherReadingBrief({
      customerQuestion: booking.customer_question,
      chartTool: booking.chart_tool,
      chartData: booking.chart_data,
      chartRecord: chartByUser.get(booking.customer_id),
    }),
  }));
  const teacherWorkbenchCards = makeWorkbenchCards(briefSourceRows, chartByUser, draftByBooking, locale);

  const upcomingCount = activeBookingRows.length;
  const completedCount = bookingRows.filter((b) => b.status === 'completed').length;
  const pendingActionCount = activeBookingRows.length;
  const activeServiceCount = (services.data || []).filter((service) => service.is_active).length;
  const isFreeTestMode = process.env.NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE === 'true';
  const avgRating = reviews.data?.length
    ? (reviews.data.reduce((s, r) => s + r.rating, 0) / reviews.data.length).toFixed(2)
    : '—';

  return (
    <div className="container mx-auto max-w-5xl px-5 pb-10 pt-24">
      <header className="text-center pb-6">
        <div className="text-accent tracking-[0.5em] text-sm mb-3 opacity-70">◆ ◆ ◆</div>
        <h1 className="font-serif text-3xl tracking-widest mb-1">{copy.portal.title}</h1>
        <div className="mele-subtitle">{copy.portal.subtitle}</div>
        <p className="mt-3 text-white/70 text-sm">{t.display_name} · {t.title ?? ''}</p>
      </header>

      {isAdminViewingTeacher ? (
        <div className="teacher-portal-mode-banner mb-5 rounded-lg border border-accent bg-accent/[0.08] p-4 text-sm leading-relaxed text-white/76">
          <strong className="text-accent">管理員代看模式</strong>：你正在代看「{t.display_name}」的老師後台。這裡會顯示該老師的預約、會員問題、解盤脈絡與服務前準備內容。
        </div>
      ) : (
        <div className="teacher-portal-mode-banner mb-5 rounded-lg border border-success/40 bg-success/[0.08] p-4 text-sm leading-relaxed text-white/76">
          <strong className="text-success">老師本人模式</strong>：你正在查看自己的預約、會員問題、解盤脈絡與服務前準備內容。
        </div>
      )}

      <TeacherBriefWorkbench cards={teacherWorkbenchCards} locale={locale} />

      <TeacherPortalReadiness
        teacher={t}
        activeServiceCount={activeServiceCount}
        pendingActionCount={pendingActionCount}
        isFreeTestMode={isFreeTestMode}
        copy={copy.portal}
        locale={locale}
      />

      <TeacherMemberBriefPanel
        cards={teacherBriefCards}
        copy={copy.portal.memberBrief}
        statusLabels={copy.statusLabels}
        localeTag={localeTag}
      />

      <TeacherReadingAssistPanel cards={teacherBriefCards} copy={copy.portal.assist} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="mele-card text-center !p-5">
          <div className="font-serif text-3xl text-accent">{upcomingCount}</div>
          <div className="text-xs text-white/70 tracking-widest mt-2">{copy.portal.stats.upcoming}</div>
        </div>
        <div className="mele-card text-center !p-5">
          <div className="font-serif text-3xl text-accent">{completedCount}</div>
          <div className="text-xs text-white/70 tracking-widest mt-2">{copy.portal.stats.completed}</div>
        </div>
        <div className="mele-card text-center !p-5">
          <div className="font-serif text-3xl text-accent">{avgRating}</div>
          <div className="text-xs text-white/70 tracking-widest mt-2">{copy.portal.stats.rating}</div>
        </div>
        <div className="mele-card text-center !p-5">
          <div className="font-serif text-3xl text-accent">{services.data?.length ?? 0}</div>
          <div className="text-xs text-white/70 tracking-widest mt-2">{copy.portal.stats.services}</div>
        </div>
      </div>

      <div className="mele-card">
        <div className="mele-section-title">{copy.portal.recentTitle}</div>
        <div className="mele-section-subtitle">{copy.portal.recentSubtitle}</div>
        <div className="mb-4 rounded-lg border border-accent-dim bg-white/[0.035] p-4 text-sm text-white/72">
          {copy.portal.pendingNotice(pendingActionCount)}
        </div>
        {bookingRows.length === 0 && (
          <div className="text-center py-8 text-white/60">{copy.portal.noBookings}</div>
        )}
        {bookingRows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-accent text-xs tracking-widest border-b border-accent-dim">
                  <th className="py-3 px-3 text-left">{copy.portal.tableTime}</th>
                  <th className="py-3 px-3 text-left">{copy.portal.tableStatus}</th>
                  <th className="py-3 px-3 text-left">{copy.portal.tableAmount}</th>
                  <th className="py-3 px-3 text-left">{copy.portal.tableReminder}</th>
                </tr>
              </thead>
              <tbody>
                {bookingRows.map((b) => (
                  <tr key={b.id} className="border-b border-accent-dim/30">
                    <td className="py-3 px-3 text-xs">{new Date(b.scheduled_at).toLocaleString(localeTag)}</td>
                    <td className="py-3 px-3 text-xs">{copy.statusLabels[b.status] ?? b.status}</td>
                    <td className="py-3 px-3 text-xs text-success">{copy.portal.freeTest}</td>
                    <td className="py-3 px-3 text-xs text-white/62">
                      {['paid', 'confirmed'].includes(b.status) ? copy.portal.paidReminder : copy.portal.noAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mele-card mt-6">
        <div className="mele-section-title">{copy.portal.serviceTitle(services.data?.length ?? 0)}</div>
        <div className="mele-section-subtitle">{copy.portal.serviceSubtitle}</div>
        {services.data?.map((s) => (
          <div key={s.id} className="flex justify-between items-center border-b border-accent-dim/30 py-3">
            <div>
              <div className="text-sm">{s.name}</div>
              <div className="text-xs text-white/60">{s.duration_minutes} min · {copy.portal.freeTest}</div>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs ${s.is_active ? 'bg-success/30 text-success' : 'bg-white/10 text-white/60'}`}>
              {s.is_active ? copy.portal.active : copy.portal.inactive}
            </span>
          </div>
        ))}
        <p className="text-xs text-white/50 mt-4">
          {copy.portal.serviceFootnote}
        </p>
      </div>
    </div>
  );
}
