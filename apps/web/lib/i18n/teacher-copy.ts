import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import type { Teacher, TeacherService } from '@/types/db';

type SpecialtyOption = { value: string; label: string };

export type TeacherCopy = {
  statusLabels: Record<string, string>;
  specialties: SpecialtyOption[];
  directory: {
    kicker: string;
    title: string;
    subtitle: string;
    body: string;
    guidanceCta: string;
    applyCta: string;
    loading: string;
    demoNotice: string;
    emptyTitle: string;
    emptyAction: string;
    detailAction: string;
    fallbackTitle: string;
    fallbackBody: string;
    ratingUnit: string;
    reviewsUnit: string;
    casesUnit: string;
  };
  detail: {
    back: string;
    demoNotice: string;
    fallbackTitle: string;
    ratingSuffix: string;
    reviewCaseText: (reviews: number, cases: number) => string;
    fallbackIntro: string;
    fitTitle: string;
    fitBody: string;
    styleTitle: string;
    styleFallback: string;
    safetyTitle: string;
    safetyBody: string;
    servicesTitle: string;
    servicesSubtitle: string;
    minutes: string;
    serviceNote: string;
    guideBack: string;
    book: string;
    unavailableTitle: string;
    unavailableBody: string;
    reviewsTitle: string;
    reviewsSubtitle: string;
    anonymous: string;
    noComment: string;
  };
  apply: {
    statusLabels: Record<string, string>;
    unauthTitle: string;
    authSubtitle: string;
    unauthBody: string;
    signIn: string;
    signUp: string;
    email: string;
    password: string;
    passwordMin: string;
    passwordTooShort: string;
    signupSuccess: string;
    authing: string;
    authLoadFailed: string;
    authUnexpectedError: string;
    existingTitle: string;
    existingSubtitle: string;
    submittedAt: string;
    reviewerNotes: string;
    home: string;
    formTitle: string;
    formSubtitle: string;
    formBody: string;
    legalName: string;
    displayName: string;
    displayPlaceholder: string;
    phone: string;
    specialtyLabel: string;
    introShort: string;
    introLong: string;
    introLongPlaceholder: string;
    quote: string;
    quotePlaceholder: string;
    docsKicker: string;
    idFront: string;
    idBack: string;
    videoUrl: string;
    videoPlaceholder: string;
    socialsKicker: string;
    lineUrl: string;
    website: string;
    submitNoticeTitle: string;
    submitNoticeItems: string[];
    submit: string;
    submitting: string;
    requiredSpecialty: string;
    requiredFields: string;
    submittedSuccess: string;
    checklist: {
      aria: string;
      kicker: string;
      title: string;
      body: string;
      progress: (done: number, total: number) => string;
      ok: string;
      todo: string;
      portal: string;
      directory: string;
      items: Array<{ title: string; doneBody: string; todoBody: string }>;
    };
  };
  portal: {
    title: string;
    subtitle: string;
    demoMode: string;
    demoNotice: string;
    noTeacherTitle: string;
    noTeacherBody: string;
    applyCta: string;
    publicPage: string;
    bookings: string;
    readiness: {
      aria: string;
      kicker: string;
      title: (done: number, total: number) => string;
      body: string;
      ok: string;
      todo: string;
      items: {
        profile: [string, string, string];
        services: [string, (count: number) => string, string];
        bookings: [string, (count: number) => string, string];
        testMode: [string, string, string];
        contact: [string, string, string];
      };
    };
    memberBrief: {
      aria: string;
      kicker: string;
      title: string;
      body: string;
      empty: string;
      demoNote: string;
    };
    assist: {
      aria: string;
      kicker: string;
      title: string;
      body: string;
      questionTitle: string;
      chartTitle: string;
      prepTitle: string;
      openingTitle: string;
      boundaryTitle: string;
      transitTitle: string;
      empty: string;
      openingQuestions: string[];
      boundaries: string[];
      transitPrompts: string[];
    };
    stats: {
      upcoming: string;
      completed: string;
      rating: string;
      services: string;
    };
    recentTitle: string;
    recentSubtitle: string;
    pendingNotice: (count: number) => string;
    noBookings: string;
    tableTime: string;
    tableStatus: string;
    tableAmount: string;
    tableReminder: string;
    freeTest: string;
    paidReminder: string;
    noAction: string;
    serviceTitle: (count: number) => string;
    serviceSubtitle: string;
    active: string;
    inactive: string;
    serviceFootnote: string;
  };
  demoTeachers: Record<string, Partial<Teacher>>;
  demoServices: Record<string, Partial<TeacherService>>;
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (...args: never[]) => unknown
    ? T[K]
    : T[K] extends readonly unknown[]
      ? T[K]
      : T[K] extends object
        ? DeepPartial<T[K]>
        : T[K];
};

const specialtyValues = ['全部', '八字', '紫微', '塔羅', '盧恩', '占星', '人類圖', '生命靈數', '馬雅'] as const;

const zhSpecialties = ['全部', '八字', '紫微', '塔羅', '盧恩', '占星', '人類圖', '生命靈數', '馬雅'];
const enSpecialties = ['All', 'Bazi', 'Zi Wei', 'Tarot', 'Runes', 'Astrology', 'Human Design', 'Numerology', 'Maya'];
const viSpecialties = ['Tất cả', 'Bát Tự', 'Tử Vi', 'Tarot', 'Rune', 'Chiêm tinh', 'Human Design', 'Thần số học', 'Maya'];
const idSpecialties = ['Semua', 'Bazi', 'Zi Wei', 'Tarot', 'Rune', 'Astrologi', 'Human Design', 'Numerologi', 'Maya'];
const jaSpecialties = ['すべて', '四柱推命', '紫微斗数', 'タロット', 'ルーン', '占星術', 'ヒューマンデザイン', '数秘術', 'マヤ暦'];
const koSpecialties = ['전체', '사주', '자미두수', '타로', '룬', '점성술', '휴먼디자인', '수비학', '마야'];

function specialties(labels: string[]): SpecialtyOption[] {
  return specialtyValues.map((value, index) => ({ value, label: labels[index] ?? value }));
}

const commonStatus = {
  pending: '待付款',
  paid: '已付款',
  confirmed: '已確認',
  in_progress: '進行中',
  completed: '已完成',
  cancelled_customer: '客戶取消',
  cancelled_teacher: '老師取消',
  refunded: '已退款',
  no_show: '未出席',
};

export const teacherCopies: Record<Locale, TeacherCopy> = {
  'zh-TW': {
    statusLabels: commonStatus,
    specialties: specialties(zhSpecialties),
    directory: {
      kicker: 'GUIDANCE DIRECTORY',
      title: '諮詢老師入口',
      subtitle: 'OUR READERS',
      body: 'MELE 的核心是讓使用者先透過工具理解自己；若需要更深的對話，可以在這裡依專長瀏覽老師、服務風格與評價。',
      guidanceCta: '進入諮詢引導',
      applyCta: '我是老師，申請加入',
      loading: '正在讀取老師名單...',
      demoNotice: '目前資料庫尚未上架正式老師，以下顯示本機示範老師，方便測試諮詢引導、老師詳情與服務呈現。正式上線後會自動改用 Supabase 內的真實老師資料。',
      emptyTitle: '目前沒有符合條件的上架老師。',
      emptyAction: '申請成為 MELE 諮詢老師',
      detailAction: '查看老師詳情',
      fallbackTitle: '自我探索諮詢老師',
      fallbackBody: '查看老師介紹、專長與可預約服務。',
      ratingUnit: '分',
      reviewsUnit: '則評價',
      casesUnit: '次案例',
    },
    detail: {
      back: '返回諮詢老師入口',
      demoNotice: '這是本機示範老師，用來確認前台諮詢引導、老師詳情與服務卡片的完整體驗；正式上線後會顯示 Supabase 審核通過的真實老師。',
      fallbackTitle: '自我探索諮詢老師',
      ratingSuffix: '分',
      reviewCaseText: (reviews, cases) => `（${reviews} 則評價 · ${cases} 次諮詢）`,
      fallbackIntro: '這位老師尚未補上完整介紹。預約前可先查看服務項目與評價。',
      fitTitle: '適合對象',
      fitBody: '適合想把問題講清楚、需要專業視角整理方向的人。',
      styleTitle: '諮詢方式',
      styleFallback: '以線上諮詢為主，老師會依你的問題與命盤資料準備解讀。',
      safetyTitle: '平台保障',
      safetyBody: '付款、取消、退款與評價都在平台內留存，降低私下交易風險。',
      servicesTitle: '服務項目',
      servicesSubtitle: 'SERVICES',
      minutes: '分鐘',
      serviceNote: '預約前請確認這項服務符合你的問題類型。付款後可在「我的諮詢」查看狀態與管理紀錄。',
      guideBack: '回到引導',
      book: '預約',
      unavailableTitle: '尚未開放預約',
      unavailableBody: '這位老師目前沒有公開服務項目。你可以先回到諮詢老師入口查看其他老師，或稍後再回來確認。',
      reviewsTitle: '客戶評價',
      reviewsSubtitle: 'REVIEWS',
      anonymous: '匿名',
      noComment: '這位使用者沒有留下文字評價。',
    },
    apply: {
      statusLabels: {
        pending: '⏳ 待審核',
        reviewing: '👀 審核中',
        revision: '📝 需補件',
        rejected: '✗ 已拒絕',
        interview: '🎤 試講中',
        contracted: '✓ 已簽約',
        active: '★ 已上架',
      },
      unauthTitle: '老師申請',
      authSubtitle: 'SIGN IN / SIGN UP',
      unauthBody: '先建立帳號才能送出申請',
      signIn: '登入',
      signUp: '建立帳號',
      email: 'Email',
      password: '密碼（至少 6 字）',
      passwordMin: '密碼至少 6 字',
      passwordTooShort: '密碼至少 6 字',
      signupSuccess: '註冊成功 ✦ 請查收 Email',
      authing: '處理中...',
      authLoadFailed: '登入狀態讀取失敗，請重新整理後再試一次。',
      authUnexpectedError: '登入流程暫時異常，請稍後再試一次。',
      existingTitle: '你的申請',
      existingSubtitle: 'YOUR APPLICATION',
      submittedAt: '送出於',
      reviewerNotes: '審核回覆',
      home: '回首頁',
      formTitle: '老師申請表',
      formSubtitle: 'APPLICATION FORM',
      formBody: '審核流程：申請 → 初審 → 試講 → 簽約 → 上架。約 7-14 天。',
      legalName: '真實姓名 *',
      displayName: '對外顯示名 *',
      displayPlaceholder: '例：星辰老師',
      phone: '聯絡電話 *',
      specialtyLabel: '專長領域 *（可複選）',
      introShort: '30 字內自介 *',
      introLong: '長版介紹',
      introLongPlaceholder: '為什麼想成為命理老師、你的特色、可以幫助什麼樣的人...',
      quote: '一句格言',
      quotePlaceholder: '例：真正的理解，會讓人更有力量做選擇',
      docsKicker: '證件 / 影片',
      idFront: '證件正面（身分證 / 護照）',
      idBack: '證件背面',
      videoUrl: '3 分鐘自介影片連結',
      videoPlaceholder: 'https://youtu.be/...',
      socialsKicker: '社群連結（讓客戶找到你）',
      lineUrl: 'LINE 加好友連結',
      website: '個人網站',
      submitNoticeTitle: '送出前請確認',
      submitNoticeItems: ['7-14 天審核（含試講）', '審核期間我們會通過 Email 與你聯繫', '上架後可在後台自助管理時段、價格、服務項目', '平台抽成預設 10%，會在簽約時最終確認'],
      submit: '送出申請',
      submitting: '送出中…',
      requiredSpecialty: '請選至少一個專長',
      requiredFields: '請填寫必填欄位',
      submittedSuccess: '申請已送出 ✦',
      checklist: {
        aria: '申請前自我檢查',
        kicker: '申請前自我檢查',
        title: '老師申請流程更清楚',
        body: '送出前先看這四項；送出後可以到老師後台看狀態，不用猜審核進度。',
        progress: (done, total) => `完成 ${done} / ${total}`,
        ok: 'OK',
        todo: '待補',
        portal: '查看老師後台',
        directory: '先看目前老師頁',
        items: [
          { title: '登入會員帳號', doneBody: '已登入，可以綁定申請。', todoBody: '申請會綁定你的 MELE 帳號，方便後續查看審核進度。' },
          { title: '專長與短自介', doneBody: '專長與短自介已具備。', todoBody: '至少選一個專長，並用 30 字內說清楚你適合幫誰解決什麼問題。' },
          { title: '證件與自介影片', doneBody: '已有審核素材。', todoBody: '證件用於平台審核；自介影片可先用連結補上，讓審核更快判斷風格。' },
          { title: '可聯絡管道', doneBody: '已有可聯絡管道。', todoBody: 'LINE 或社群連結能讓平台在補件、試講與上架前快速聯繫你。' },
        ],
      },
    },
    portal: {
      title: '老師後台',
      subtitle: 'TEACHER PORTAL',
      demoMode: '本機測試模式',
      demoNotice: '目前使用本機測試帳號，所以這裡顯示示範老師資料。正式老師資料會在 Supabase 登入與 Email 驗證信修好後，依你的帳號讀取。',
      noTeacherTitle: '您還不是上架老師',
      noTeacherBody: '想成為 MELE 諮詢老師？歡迎送出申請。',
      applyCta: '送出申請',
      publicPage: '查看公開頁',
      bookings: '查看我的諮詢',
      readiness: {
        aria: '後台準備度',
        kicker: '後台準備度',
        title: (done, total) => `${done} / ${total} 項已完成`,
        body: '這裡把老師後台最容易漏掉的營運事項整理成清單，測試網站時可以一項一項驗。',
        ok: 'OK',
        todo: '待確認',
        items: {
          profile: ['公開頁完整度', '名稱、頭銜、簡介與專長已具備，客人能快速判斷是否適合。', '請補齊頭銜、短介紹與專長，公開頁才會像一位可信任的老師。'],
          services: ['服務項目已設定', (count) => `目前有 ${count} 個上架服務，可承接預約。`, '請先請平台管理員設定服務名稱、時長與測試期價格。'],
          bookings: ['預約處理節奏', (count) => `有 ${count} 筆諮詢需要留意，請在諮詢前主動確認問題。`, '目前沒有待處理預約，可以先檢查服務介紹與聯絡方式。'],
          testMode: ['測試模式提醒', '目前為免費測試期，先用真實流程驗證預約與通知，不向客人收費。', '正式收費模式下，請先確認金流、取消政策與客服回覆節奏。'],
          contact: ['聯絡資訊', '已有 LINE 或社群連結，平台能在補件與諮詢前快速聯繫。', '建議至少補 LINE 或一個公開社群，減少預約前溝通落差。'],
        },
      },
      memberBrief: {
        aria: '會員詳解備忘',
        kicker: 'MEMBER CONTEXT',
        title: '會員詳解備忘',
        body: '會員前台先看簡易解釋；深入解釋、流日、流月、流年會以點數或付費解鎖。老師端在諮詢前可先看會員提問與盤面脈絡，使解讀有本可循。',
        empty: '尚未有可讀取的會員盤面。待會員預約並附上提問或排盤資料後，這裡會整理成老師用備忘卡。',
        demoNote: '本機測試模式僅示範資料結構；正式會員付點數解鎖後，後台會依預約與排盤紀錄銜接。',
      },
      assist: {
        aria: '輔助解盤工作台',
        kicker: 'READING ASSIST',
        title: '輔助解盤工作台',
        body: '把會員提問、盤面線索、諮詢界線與延伸問題整理在一起，老師可以更快進入狀況，也不會把工具結果講成絕對命定。',
        questionTitle: '會員主問',
        chartTitle: '盤面線索',
        prepTitle: '會前整理',
        openingTitle: '建議開場提問',
        boundaryTitle: '解讀界線',
        transitTitle: '流日 / 流月 / 流年延伸',
        empty: '目前沒有可整理的預約資料。會員預約並附上問題後，這裡會自動生成輔助解盤卡。',
        openingQuestions: ['這次你最想帶走的一個答案是什麼？', '這個問題最近在哪個生活場景最常出現？', '如果今天只做一個小行動，你願意先從哪裡開始？'],
        boundaries: ['先確認會員問題，不急著下結論。', '以工具為參照，不以吉凶恐嚇或保證結果。', '遇到醫療、法律、投資問題時，引導會員尋求專業人士。'],
        transitPrompts: ['流日：適合給一個今日可執行提醒。', '流月：適合整理本月重複出現的主題。', '流年：適合放進年度節奏與長期選擇。'],
      },
      stats: { upcoming: '待諮詢', completed: '已完成', rating: '平均評分', services: '服務項目' },
      recentTitle: '最近預約',
      recentSubtitle: 'RECENT BOOKINGS',
      pendingNotice: (count) => `目前有 ${count} 筆需要留意的諮詢。請確認已付款與已確認的預約時間，並在諮詢前透過 LINE 或站內訊息與客人確認問題。`,
      noBookings: '還沒有預約',
      tableTime: '時間',
      tableStatus: '狀態',
      tableAmount: '金額',
      tableReminder: '提醒',
      freeTest: '免費測試',
      paidReminder: '請確認諮詢前聯繫',
      noAction: '無需立即處理',
      serviceTitle: (count) => `服務項目（${count}）`,
      serviceSubtitle: 'SERVICES',
      active: '上架中',
      inactive: '已下架',
      serviceFootnote: '服務新增、價格調整與時段管理會進入下一階段後台功能；目前可先由平台管理員協助設定，避免老師端操作不完整造成錯單。',
    },
    demoTeachers: {},
    demoServices: {},
  },
  en: {
    statusLabels: {
      pending: 'Pending payment',
      paid: 'Paid',
      confirmed: 'Confirmed',
      in_progress: 'In progress',
      completed: 'Completed',
      cancelled_customer: 'Cancelled by member',
      cancelled_teacher: 'Cancelled by guide',
      refunded: 'Refunded',
      no_show: 'No show',
    },
    specialties: specialties(enSpecialties),
    directory: {
      kicker: 'GUIDANCE DIRECTORY',
      title: 'Guidance Directory',
      subtitle: 'OUR GUIDES',
      body: 'MELE helps members understand themselves through tools first. When they want a deeper conversation, they can browse guides by specialty, style, and trust signals here.',
      guidanceCta: 'Start guided flow',
      applyCta: 'Apply as a guide',
      loading: 'Loading guides...',
      demoNotice: 'No approved production guides are available yet, so demo guides are shown for closed-beta testing. Production will automatically use approved Supabase guide records.',
      emptyTitle: 'No active guides match this filter yet.',
      emptyAction: 'Apply as a MELE guide',
      detailAction: 'View guide profile',
      fallbackTitle: 'Self-discovery guide',
      fallbackBody: 'View the guide profile, specialties, and available sessions.',
      ratingUnit: 'rating',
      reviewsUnit: 'reviews',
      casesUnit: 'cases',
    },
    detail: {
      back: 'Back to guidance directory',
      demoNotice: 'This is a demo guide for testing the consultation flow, guide detail page, and service cards. Production will show approved Supabase guide records.',
      fallbackTitle: 'Self-discovery guide',
      ratingSuffix: 'rating',
      reviewCaseText: (reviews, cases) => `(${reviews} reviews · ${cases} sessions)`,
      fallbackIntro: 'This guide has not added a full introduction yet. Review services and ratings before booking.',
      fitTitle: 'Best for',
      fitBody: 'Members who want to clarify a real question and receive a structured outside perspective.',
      styleTitle: 'Session style',
      styleFallback: 'Online-first sessions. The guide prepares from the member question and attached chart context.',
      safetyTitle: 'Platform safety',
      safetyBody: 'Payment, cancellation, refunds, and reviews stay on platform to reduce private-transaction risk.',
      servicesTitle: 'Services',
      servicesSubtitle: 'SERVICES',
      minutes: 'min',
      serviceNote: 'Before booking, confirm this service fits your question. After booking, manage status and records in My Consultations.',
      guideBack: 'Back to guide flow',
      book: 'Book this session',
      unavailableTitle: 'Booking not open yet',
      unavailableBody: 'This guide has no public services yet. Return to the directory or check again later.',
      reviewsTitle: 'Member Reviews',
      reviewsSubtitle: 'REVIEWS',
      anonymous: 'Anonymous',
      noComment: 'This member did not leave a written review.',
    },
    apply: {
      statusLabels: {
        pending: 'Pending review',
        reviewing: 'Under review',
        revision: 'Needs revision',
        rejected: 'Rejected',
        interview: 'Trial session',
        contracted: 'Contracted',
        active: 'Published',
      },
      unauthTitle: 'Guide Application',
      authSubtitle: 'Sign in / Sign up',
      unauthBody: 'Create or sign in to an account before submitting an application.',
      signIn: 'Sign in',
      signUp: 'Create account',
      email: 'Email',
      password: 'Password (at least 6 characters)',
      passwordMin: 'Password must be at least 6 characters',
      passwordTooShort: 'Password must be at least 6 characters',
      signupSuccess: 'Account created. Please check your email.',
      authing: 'Processing...',
      authLoadFailed: 'Could not load your sign-in state. Refresh and try again.',
      authUnexpectedError: 'Sign-in is temporarily unavailable. Please try again shortly.',
      existingTitle: 'Your Application',
      existingSubtitle: 'YOUR APPLICATION',
      submittedAt: 'Submitted on',
      reviewerNotes: 'Review notes',
      home: 'Back home',
      formTitle: 'Guide Application',
      formSubtitle: 'APPLICATION FORM',
      formBody: 'Flow: apply -> first review -> trial session -> contract -> publish. Estimated 7-14 days.',
      legalName: 'Legal name *',
      displayName: 'Public display name *',
      displayPlaceholder: 'Example: Luna Guide',
      phone: 'Contact phone *',
      specialtyLabel: 'Specialties * (choose one or more)',
      introShort: 'Short intro within 30 characters *',
      introLong: 'Long introduction',
      introLongPlaceholder: 'Why do you want to guide members, what is your style, and who can you help?',
      quote: 'Signature quote',
      quotePlaceholder: 'Example: A clear reading returns you to choice.',
      docsKicker: 'Documents / Video',
      idFront: 'ID / passport front',
      idBack: 'ID back',
      videoUrl: '3-minute intro video URL',
      videoPlaceholder: 'https://youtu.be/...',
      socialsKicker: 'Social links',
      lineUrl: 'LINE add-friend URL',
      website: 'Personal website',
      submitNoticeTitle: 'Before submitting',
      submitNoticeItems: ['Review takes 7-14 days including a trial session.', 'We will contact you by email during review.', 'After publishing, schedule, pricing, and services can be managed in the guide workspace.', 'Default platform fee is 10% and will be finalized in contract.'],
      submit: 'Submit application',
      submitting: 'Submitting...',
      requiredSpecialty: 'Choose at least one specialty',
      requiredFields: 'Please fill in all required fields',
      submittedSuccess: 'Application submitted',
      checklist: {
        aria: 'Pre-application checklist',
        kicker: 'Pre-application checklist',
        title: 'A clearer guide application path',
        body: 'Check these four items before submitting. After submission, use the guide workspace to track progress.',
        progress: (done, total) => `${done} / ${total} complete`,
        ok: 'OK',
        todo: 'Needed',
        portal: 'Open guide workspace',
        directory: 'View guide directory',
        items: [
          { title: 'Member account', doneBody: 'Signed in and ready to bind the application.', todoBody: 'The application is tied to your MELE account for progress tracking.' },
          { title: 'Specialty and short intro', doneBody: 'Specialty and short intro are ready.', todoBody: 'Choose at least one specialty and describe who you help in one clear line.' },
          { title: 'ID and intro video', doneBody: 'Review material is attached.', todoBody: 'ID is for platform review. A video link helps us understand your style faster.' },
          { title: 'Contact channel', doneBody: 'Contact channel is ready.', todoBody: 'LINE or a public social link helps the platform contact you during review.' },
        ],
      },
    },
    portal: {
      title: 'Guide Workspace',
      subtitle: 'GUIDE PORTAL',
      demoMode: 'local test mode',
      demoNotice: 'You are using a local test account, so demo guide data is shown. Production will load guide records from your Supabase account after login and email confirmation are configured.',
      noTeacherTitle: 'You are not an active guide yet',
      noTeacherBody: 'Want to become a MELE guide? Submit an application first.',
      applyCta: 'Submit application',
      publicPage: 'View public profile',
      bookings: 'View my consultations',
      readiness: {
        aria: 'Workspace readiness',
        kicker: 'Workspace readiness',
        title: (done, total) => `${done} / ${total} ready`,
        body: 'This checklist gathers the operations most often missed before beta testing with real members.',
        ok: 'OK',
        todo: 'Check',
        items: {
          profile: ['Public profile', 'Name, title, intro, and specialties are ready for members to evaluate fit.', 'Add a title, short intro, and specialties so the public page feels trustworthy.'],
          services: ['Services configured', (count) => `${count} active services are ready for booking.`, 'Ask an admin to set service name, duration, and beta pricing first.'],
          bookings: ['Booking rhythm', (count) => `${count} consultations need attention before session time.`, 'No pending bookings now. Review services and contact details.'],
          testMode: ['Beta mode', 'Free test mode is on, so use the full booking flow without charging members.', 'For paid mode, confirm payments, cancellation policy, and support response rhythm first.'],
          contact: ['Contact details', 'LINE or social links are present for review and pre-session communication.', 'Add at least LINE or one public social channel.'],
        },
      },
      memberBrief: {
        aria: 'Member context brief',
        kicker: 'MEMBER CONTEXT',
        title: 'Member Context Brief',
        body: 'Members see beginner readings first. Deeper readings, daily, monthly, and yearly transits can be unlocked with points or paid access. Guides can review the question and chart context before a session.',
        empty: 'No member chart context yet. When a member books and attaches a question or chart, this area becomes guide-ready briefing cards.',
        demoNote: 'Local test mode only demonstrates the data shape. Production will connect member unlocks, bookings, and chart records.',
      },
      assist: {
        aria: 'Reading assist workspace',
        kicker: 'READING ASSIST',
        title: 'Reading Assist',
        body: 'Member question, chart signals, session boundaries, and follow-up prompts are arranged together so guides can prepare without turning tool output into fixed fate.',
        questionTitle: 'Member question',
        chartTitle: 'Chart signals',
        prepTitle: 'Pre-session focus',
        openingTitle: 'Suggested opening questions',
        boundaryTitle: 'Reading boundaries',
        transitTitle: 'Daily / Monthly / Yearly extensions',
        empty: 'No booking context is ready yet. When a member books with a question, assist cards will be generated here.',
        openingQuestions: ['What is the one answer you most want to leave with today?', 'Where has this pattern shown up most clearly in daily life?', 'If we choose one small action for today, where would you be willing to begin?'],
        boundaries: ['Clarify the member question before interpreting.', 'Use tools as references, not fear-based certainty or guarantees.', 'For medical, legal, or investment issues, guide the member to qualified professionals.'],
        transitPrompts: ['Daily: give one practical reminder for today.', 'Monthly: name the recurring theme of this month.', 'Yearly: connect the reading to longer pacing and choices.'],
      },
      stats: { upcoming: 'Upcoming', completed: 'Completed', rating: 'Avg rating', services: 'Services' },
      recentTitle: 'Recent Bookings',
      recentSubtitle: 'RECENT BOOKINGS',
      pendingNotice: (count) => `${count} consultations need attention. Confirm paid or confirmed booking times and check in with members before the session.`,
      noBookings: 'No bookings yet',
      tableTime: 'Time',
      tableStatus: 'Status',
      tableAmount: 'Amount',
      tableReminder: 'Reminder',
      freeTest: 'Free beta',
      paidReminder: 'Confirm pre-session contact',
      noAction: 'No action needed',
      serviceTitle: (count) => `Services (${count})`,
      serviceSubtitle: 'SERVICES',
      active: 'Active',
      inactive: 'Inactive',
      serviceFootnote: 'Service creation, pricing, and schedule management will be a later workspace feature. For now, admins can help configure services to avoid booking mistakes.',
    },
    demoTeachers: {
      'demo-tarot-luna': {
        display_name: 'Luna',
        title: 'Tarot and relationship guide',
        intro_short: 'Helps with love, boundaries, and self-worth through gentle but clear tarot reading.',
        intro_long: 'Luna helps members turn emotional confusion into a few clear questions, then reads card images, spread positions, and the current situation to find the next choice.',
        quote: 'A good reading does not decide your life for you; it helps you see what you are choosing.',
        consultation_style: 'Gentle support, clear structure, and practical next steps',
      },
      'demo-bazi-shen': {
        display_name: 'Shen',
        title: 'Bazi and yearly strategy guide',
        intro_short: 'Best for career direction, yearly pacing, and turning a chart into a practical plan.',
        intro_long: 'Shen reads day master, five elements, luck cycles, and current questions, then translates them into career, cooperation, finance, and life rhythm advice.',
        quote: 'A chart is not a limit. It is a map of how your effort works.',
        consultation_style: 'Direct, structured, strategic',
      },
      'demo-human-iris': {
        display_name: 'Iris',
        title: 'Human Design and inner rhythm guide',
        intro_short: 'Helps members understand type, strategy, authority, and personal energy rhythm.',
        intro_long: 'Iris translates Human Design type, authority, profile, and gates into daily language, often pairing it with runes or Maya oracle prompts.',
        quote: 'True guidance returns you to your body instead of making you depend on answers.',
        consultation_style: 'Ritual, gentle support, body-based awareness',
      },
    },
    demoServices: {
      'demo-service-tarot-60': { name: 'Tarot relationship clarity · 60 min', description: 'For love, ambiguity, boundaries, self-worth, and next steps.' },
      'demo-service-bazi-90': { name: 'Bazi yearly strategy · 90 min', description: 'For career shifts, collaboration, yearly direction, and long-term planning.' },
      'demo-service-human-60': { name: 'Human Design energy reading · 60 min', description: 'For type, strategy, authority, gates, and everyday energy patterns.' },
      'service-1': { name: 'Beta tarot consultation', description: 'Demo service for testing guide workspace and pre-session reading assist.' },
      'service-2': { name: 'Beta Bazi consultation', description: 'Demo service for testing guide workspace and member context briefs.' },
    },
  },
  vi: {} as TeacherCopy,
  id: {} as TeacherCopy,
  ja: {} as TeacherCopy,
  ko: {} as TeacherCopy,
};

function inherit(locale: Locale, overrides: DeepPartial<TeacherCopy>): TeacherCopy {
  void locale;
  const base = teacherCopies.en;
  return {
    ...base,
    ...overrides,
    statusLabels: { ...base.statusLabels, ...(overrides.statusLabels ?? {}) } as Record<string, string>,
    directory: { ...base.directory, ...(overrides.directory ?? {}) },
    detail: { ...base.detail, ...(overrides.detail ?? {}) },
    apply: {
      ...base.apply,
      ...(overrides.apply ?? {}),
      checklist: {
        ...base.apply.checklist,
        ...(overrides.apply?.checklist ?? {}),
        items: overrides.apply?.checklist?.items ?? base.apply.checklist.items,
      },
    } as TeacherCopy['apply'],
    portal: {
      ...base.portal,
      ...(overrides.portal ?? {}),
      readiness: {
        ...base.portal.readiness,
        ...(overrides.portal?.readiness ?? {}),
        items: {
          ...base.portal.readiness.items,
          ...(overrides.portal?.readiness?.items ?? {}),
        },
      },
      memberBrief: { ...base.portal.memberBrief, ...(overrides.portal?.memberBrief ?? {}) },
      assist: { ...base.portal.assist, ...(overrides.portal?.assist ?? {}) },
      stats: { ...base.portal.stats, ...(overrides.portal?.stats ?? {}) },
    },
    specialties: overrides.specialties ?? base.specialties,
    demoTeachers: { ...base.demoTeachers, ...(overrides.demoTeachers ?? {}) } as Record<string, Partial<Teacher>>,
    demoServices: { ...base.demoServices, ...(overrides.demoServices ?? {}) } as Record<string, Partial<TeacherService>>,
  };
}

teacherCopies.vi = inherit('vi', {
  statusLabels: {
    pending: 'Chờ thanh toán',
    paid: 'Đã thanh toán',
    confirmed: 'Đã xác nhận',
    in_progress: 'Đang diễn ra',
    completed: 'Hoàn tất',
    cancelled_customer: 'Thành viên hủy',
    cancelled_teacher: 'Guide hủy',
    refunded: 'Đã hoàn tiền',
    no_show: 'Vắng mặt',
  },
  specialties: specialties(viSpecialties),
  directory: {
    kicker: 'GUIDANCE DIRECTORY',
    title: 'Danh mục hướng dẫn',
    subtitle: 'GUIDES',
    body: 'MELE giúp thành viên hiểu bản thân qua công cụ trước. Khi cần trò chuyện sâu hơn, bạn có thể tìm guide theo chuyên môn, phong cách và độ tin cậy.',
    guidanceCta: 'Bắt đầu luồng gợi ý',
    applyCta: 'Đăng ký làm guide',
    loading: 'Đang tải danh sách guide...',
    demoNotice: 'Chưa có guide chính thức. Đang hiển thị guide thử nghiệm để kiểm tra giao diện. Khi ra mắt sẽ dùng dữ liệu thật từ Supabase.',
    emptyTitle: 'Chưa có guide phù hợp với bộ lọc này.',
    emptyAction: 'Đăng ký làm guide MELE',
    detailAction: 'Xem hồ sơ guide',
    fallbackTitle: 'Guide khám phá bản thân',
    fallbackBody: 'Xem hồ sơ, chuyên môn và các buổi có thể đặt lịch.',
    ratingUnit: 'điểm',
    reviewsUnit: 'đánh giá',
    casesUnit: 'buổi',
  },
  detail: {
    back: 'Quay lại danh mục hướng dẫn',
    demoNotice: 'Đây là guide thử nghiệm để kiểm tra giao diện. Khi ra mắt sẽ hiển thị guide đã được xét duyệt.',
    fallbackTitle: 'Guide khám phá bản thân',
    ratingSuffix: 'điểm',
    reviewCaseText: (reviews, cases) => `(${reviews} đánh giá · ${cases} buổi)`,
    fallbackIntro: 'Guide này chưa cập nhật giới thiệu đầy đủ. Hãy xem dịch vụ và đánh giá trước khi đặt lịch.',
    fitTitle: 'Phù hợp với ai',
    fitBody: 'Những người muốn làm rõ câu hỏi thực sự và cần góc nhìn bên ngoài có cấu trúc.',
    styleTitle: 'Hình thức tư vấn',
    styleFallback: 'Tư vấn trực tuyến là chủ yếu. Guide chuẩn bị dựa trên câu hỏi và dữ liệu lá số bạn cung cấp.',
    safetyTitle: 'An toàn từ nền tảng',
    safetyBody: 'Thanh toán, hủy, hoàn tiền và đánh giá đều được lưu trên nền tảng để giảm rủi ro giao dịch riêng.',
    servicesTitle: 'Dịch vụ',
    servicesSubtitle: 'SERVICES',
    minutes: 'phút',
    serviceNote: 'Trước khi đặt, hãy xác nhận dịch vụ này phù hợp với câu hỏi của bạn. Sau khi đặt, quản lý trong Tư vấn của tôi.',
    guideBack: 'Quay lại luồng gợi ý',
    book: 'Đặt buổi này',
    unavailableTitle: 'Chưa mở đặt lịch',
    unavailableBody: 'Guide này chưa có dịch vụ công khai. Quay lại danh mục hoặc thử lại sau.',
    reviewsTitle: 'Đánh giá thành viên',
    reviewsSubtitle: 'REVIEWS',
    anonymous: 'Ẩn danh',
    noComment: 'Thành viên này không để lại đánh giá bằng chữ.',
  },
  apply: {
    statusLabels: {
      pending: 'Chờ xét duyệt',
      reviewing: 'Đang xét duyệt',
      revision: 'Cần bổ sung',
      rejected: 'Bị từ chối',
      interview: 'Buổi thử',
      contracted: 'Đã ký hợp đồng',
      active: 'Đã lên trang',
    },
    unauthTitle: 'Đăng ký làm guide',
    authSubtitle: 'Đăng nhập / Đăng ký',
    unauthBody: 'Hãy tạo hoặc đăng nhập tài khoản trước khi gửi đơn.',
    signIn: 'Đăng nhập',
    signUp: 'Tạo tài khoản',
    email: 'Email',
    password: 'Mật khẩu (ít nhất 6 ký tự)',
    passwordMin: 'Mật khẩu phải có ít nhất 6 ký tự',
    passwordTooShort: 'Mật khẩu phải có ít nhất 6 ký tự',
    signupSuccess: 'Tạo tài khoản thành công. Vui lòng kiểm tra email.',
    authing: 'Đang xử lý...',
    authLoadFailed: 'Không tải được trạng thái đăng nhập. Hãy làm mới trang và thử lại.',
    authUnexpectedError: 'Đăng nhập tạm thời không khả dụng. Vui lòng thử lại sau.',
    existingTitle: 'Đơn đăng ký của bạn',
    existingSubtitle: 'YOUR APPLICATION',
    submittedAt: 'Gửi lúc',
    reviewerNotes: 'Nhận xét từ người xét duyệt',
    home: 'Về trang chủ',
    formTitle: 'Đăng ký làm guide',
    formSubtitle: 'APPLICATION FORM',
    formBody: 'Quy trình: đăng ký → xét duyệt → buổi thử → hợp đồng → lên trang. Khoảng 7–14 ngày.',
    legalName: 'Họ tên thật *',
    displayName: 'Tên hiển thị công khai *',
    displayPlaceholder: 'Ví dụ: Luna Guide',
    phone: 'Số điện thoại liên hệ *',
    specialtyLabel: 'Chuyên môn * (chọn một hoặc nhiều)',
    introShort: 'Giới thiệu ngắn trong 30 ký tự *',
    introLong: 'Giới thiệu dài',
    introLongPlaceholder: 'Tại sao bạn muốn trở thành guide, phong cách của bạn là gì và bạn có thể giúp ai?',
    quote: 'Câu ngạn ngữ đặc trưng',
    quotePlaceholder: 'Ví dụ: Một buổi đọc tốt giúp bạn thấy rõ lựa chọn của mình.',
    docsKicker: 'Giấy tờ / Video',
    idFront: 'Mặt trước CMND / hộ chiếu',
    idBack: 'Mặt sau CMND',
    videoUrl: 'Link video giới thiệu 3 phút',
    videoPlaceholder: 'https://youtu.be/...',
    socialsKicker: 'Liên kết mạng xã hội',
    lineUrl: 'Link kết bạn LINE',
    website: 'Website cá nhân',
    submitNoticeTitle: 'Trước khi gửi, lưu ý',
    submitNoticeItems: [
      'Xét duyệt mất 7–14 ngày, bao gồm buổi thử.',
      'Chúng tôi sẽ liên hệ qua email trong quá trình xét duyệt.',
      'Sau khi lên trang, bạn có thể tự quản lý lịch, dịch vụ trong không gian guide.',
    ],
    submit: 'Gửi đơn',
    submitting: 'Đang gửi...',
    requiredSpecialty: 'Vui lòng chọn ít nhất một chuyên môn',
    requiredFields: 'Vui lòng điền đầy đủ các mục bắt buộc',
    submittedSuccess: 'Đã gửi đơn đăng ký',
    checklist: {
      aria: 'Danh sách kiểm tra trước khi đăng ký',
      kicker: 'Danh sách kiểm tra trước khi đăng ký',
      title: 'Lộ trình đăng ký guide rõ ràng hơn',
      body: 'Kiểm tra bốn mục này trước khi gửi. Sau khi gửi, dùng không gian guide để theo dõi tiến độ.',
      progress: (done, total) => `${done} / ${total} hoàn tất`,
      ok: 'OK',
      todo: 'Cần làm',
      portal: 'Mở không gian guide',
      directory: 'Xem danh mục guide',
      items: [
        { title: 'Tài khoản thành viên', doneBody: 'Đã đăng nhập và sẵn sàng liên kết đơn.', todoBody: 'Đơn sẽ gắn với tài khoản MELE của bạn để theo dõi tiến độ.' },
        { title: 'Chuyên môn và giới thiệu ngắn', doneBody: 'Chuyên môn và giới thiệu ngắn đã sẵn sàng.', todoBody: 'Chọn ít nhất một chuyên môn và mô tả bạn giúp được ai trong một dòng rõ ràng.' },
        { title: 'CMND và video giới thiệu', doneBody: 'Tài liệu xét duyệt đã đính kèm.', todoBody: 'CMND dùng để xét duyệt. Link video giúp chúng tôi hiểu phong cách của bạn nhanh hơn.' },
        { title: 'Kênh liên hệ', doneBody: 'Kênh liên hệ đã sẵn sàng.', todoBody: 'LINE hoặc mạng xã hội công khai giúp nền tảng liên hệ bạn trong quá trình xét duyệt.' },
      ],
    },
  },
  portal: {
    title: 'Không gian Guide',
    subtitle: 'GUIDE PORTAL',
    demoMode: 'chế độ thử cục bộ',
    demoNotice: 'Bạn đang dùng tài khoản thử cục bộ nên hiển thị dữ liệu guide mẫu. Khi ra mắt chính thức sẽ tải dữ liệu từ tài khoản Supabase của bạn.',
    noTeacherTitle: 'Bạn chưa phải guide đang hoạt động',
    noTeacherBody: 'Muốn trở thành guide MELE? Hãy gửi đơn đăng ký.',
    applyCta: 'Gửi đơn',
    publicPage: 'Xem hồ sơ công khai',
    bookings: 'Xem tư vấn của tôi',
    readiness: {
      aria: 'Mức độ sẵn sàng',
      kicker: 'Mức độ sẵn sàng',
      title: (done, total) => `${done} / ${total} sẵn sàng`,
      body: 'Checklist này gom các việc vận hành dễ bị bỏ sót trước beta.',
      ok: 'OK',
      todo: 'Cần kiểm tra',
      items: {
        profile: ['Hồ sơ công khai', 'Tên, tiêu đề, giới thiệu và chuyên môn đã sẵn sàng để thành viên đánh giá.', 'Thêm tiêu đề, giới thiệu ngắn và chuyên môn để trang công khai trông đáng tin hơn.'],
        services: ['Dịch vụ đã thiết lập', (count) => `${count} dịch vụ đang hoạt động và sẵn sàng nhận đặt lịch.`, 'Nhờ admin thiết lập tên dịch vụ, thời lượng và giá thử nghiệm trước.'],
        bookings: ['Nhịp xử lý đặt lịch', (count) => `${count} buổi tư vấn cần chú ý trước giờ hẹn.`, 'Chưa có đặt lịch đang chờ. Hãy kiểm tra mô tả dịch vụ và thông tin liên hệ.'],
        testMode: ['Chế độ thử nghiệm', 'Đang ở chế độ thử miễn phí, hãy dùng toàn bộ quy trình đặt lịch mà không thu phí thành viên.', 'Khi chuyển sang chế độ thu phí, hãy xác nhận thanh toán, chính sách hủy và nhịp hỗ trợ trước.'],
        contact: ['Thông tin liên hệ', 'Đã có LINE hoặc mạng xã hội để liên hệ trong quá trình xét duyệt và trước buổi tư vấn.', 'Thêm ít nhất LINE hoặc một kênh mạng xã hội công khai.'],
      },
    },
    memberBrief: {
      aria: 'Tóm tắt bối cảnh thành viên',
      kicker: 'MEMBER CONTEXT',
      title: 'Tóm tắt bối cảnh thành viên',
      body: 'Thành viên xem giải thích cơ bản trước. Giải thích sâu hơn, ngày lưu, tháng lưu, năm lưu sẽ mở khóa bằng điểm hoặc trả phí. Guide có thể xem câu hỏi và bối cảnh lá số trước buổi tư vấn.',
      empty: 'Chưa có dữ liệu lá số thành viên. Khi thành viên đặt lịch và đính kèm câu hỏi hoặc lá số, thông tin sẽ được tổng hợp thành phiếu tóm tắt cho guide.',
      demoNote: 'Chế độ thử cục bộ chỉ minh họa cấu trúc dữ liệu. Khi ra mắt sẽ kết nối với điểm mở khóa, đặt lịch và hồ sơ lá số của thành viên.',
    },
    assist: {
      aria: 'Bàn làm việc hỗ trợ giải đọc',
      kicker: 'READING ASSIST',
      title: 'Hỗ trợ giải đọc',
      body: 'Câu hỏi thành viên, tín hiệu lá số, giới hạn buổi tư vấn và câu hỏi mở rộng được tổng hợp để guide chuẩn bị tốt hơn mà không biến kết quả công cụ thành số phận cố định.',
      questionTitle: 'Câu hỏi chính của thành viên',
      chartTitle: 'Tín hiệu lá số',
      prepTitle: 'Chuẩn bị trước buổi tư vấn',
      openingTitle: 'Câu hỏi mở đầu gợi ý',
      boundaryTitle: 'Ranh giới giải đọc',
      transitTitle: 'Mở rộng ngày / tháng / năm',
      empty: 'Chưa có dữ liệu đặt lịch. Khi thành viên đặt lịch kèm câu hỏi, phiếu hỗ trợ sẽ tự động tạo ở đây.',
      openingQuestions: [
        'Câu trả lời nào bạn muốn mang về nhất hôm nay?',
        'Vấn đề này thường xuất hiện nhất trong hoàn cảnh nào trong cuộc sống của bạn?',
        'Nếu chỉ chọn một hành động nhỏ hôm nay, bạn sẵn lòng bắt đầu từ đâu?',
      ],
      boundaries: [
        'Làm rõ câu hỏi thành viên trước khi diễn giải.',
        'Dùng công cụ như tài liệu tham chiếu, không dùng để gây sợ hãi hay đảm bảo kết quả.',
        'Với vấn đề y tế, pháp lý hoặc đầu tư, hướng dẫn thành viên tìm chuyên gia phù hợp.',
      ],
      transitPrompts: [
        'Ngày lưu: đưa ra một nhắc nhở thực tế cho hôm nay.',
        'Tháng lưu: đặt tên cho chủ đề lặp lại của tháng này.',
        'Năm lưu: kết nối bài đọc với nhịp dài hạn và các lựa chọn.',
      ],
    },
    stats: { upcoming: 'Sắp tới', completed: 'Hoàn tất', rating: 'Điểm TB', services: 'Dịch vụ' },
    recentTitle: 'Lịch đặt gần đây',
    recentSubtitle: 'RECENT BOOKINGS',
    pendingNotice: (count) => `${count} buổi tư vấn cần chú ý. Xác nhận thời gian đặt lịch đã thanh toán và liên hệ thành viên trước buổi hẹn.`,
    noBookings: 'Chưa có lịch đặt',
    tableTime: 'Thời gian',
    tableStatus: 'Trạng thái',
    tableAmount: 'Số tiền',
    tableReminder: 'Nhắc nhở',
    freeTest: 'Beta miễn phí',
    paidReminder: 'Xác nhận liên hệ trước buổi',
    noAction: 'Không cần xử lý ngay',
    serviceTitle: (count) => `Dịch vụ (${count})`,
    serviceSubtitle: 'SERVICES',
    active: 'Đang mở',
    inactive: 'Đã tắt',
    serviceFootnote: 'Thêm dịch vụ, điều chỉnh giá và quản lý lịch sẽ là tính năng tiếp theo. Hiện tại nhờ admin hỗ trợ thiết lập để tránh sai sót đặt lịch.',
  },
});

teacherCopies.id = inherit('id', {
  statusLabels: {
    pending: 'Menunggu pembayaran',
    paid: 'Sudah dibayar',
    confirmed: 'Terkonfirmasi',
    in_progress: 'Sedang berlangsung',
    completed: 'Selesai',
    cancelled_customer: 'Dibatalkan member',
    cancelled_teacher: 'Dibatalkan guide',
    refunded: 'Sudah direfund',
    no_show: 'Tidak hadir',
  },
  specialties: specialties(idSpecialties),
  directory: {
    kicker: 'GUIDANCE DIRECTORY',
    title: 'Direktori Panduan',
    subtitle: 'GUIDES',
    body: 'MELE membantu member memahami diri melalui alat terlebih dahulu. Jika ingin percakapan lebih mendalam, kamu bisa mencari guide berdasarkan spesialisasi, gaya, dan kepercayaan.',
    guidanceCta: 'Mulai alur panduan',
    applyCta: 'Daftar sebagai guide',
    loading: 'Memuat daftar guide...',
    demoNotice: 'Belum ada guide resmi. Menampilkan guide contoh untuk pengujian antarmuka. Saat diluncurkan akan menggunakan data nyata dari Supabase.',
    emptyTitle: 'Belum ada guide yang cocok dengan filter ini.',
    emptyAction: 'Daftar sebagai guide MELE',
    detailAction: 'Lihat profil guide',
    fallbackTitle: 'Guide eksplorasi diri',
    fallbackBody: 'Lihat profil, spesialisasi, dan sesi yang tersedia.',
    ratingUnit: 'rating',
    reviewsUnit: 'ulasan',
    casesUnit: 'sesi',
  },
  detail: {
    back: 'Kembali ke direktori panduan',
    demoNotice: 'Ini adalah guide contoh untuk menguji antarmuka. Saat diluncurkan akan menampilkan guide yang sudah disetujui.',
    fallbackTitle: 'Guide eksplorasi diri',
    ratingSuffix: 'rating',
    reviewCaseText: (reviews, cases) => `(${reviews} ulasan · ${cases} sesi)`,
    fallbackIntro: 'Guide ini belum menambahkan perkenalan lengkap. Tinjau layanan dan ulasan sebelum memesan.',
    fitTitle: 'Paling cocok untuk',
    fitBody: 'Member yang ingin memperjelas pertanyaan nyata dan mendapatkan perspektif luar yang terstruktur.',
    styleTitle: 'Gaya sesi',
    styleFallback: 'Sesi online sebagai prioritas. Guide mempersiapkan diri dari pertanyaan member dan konteks bagan kelahiran.',
    safetyTitle: 'Keamanan platform',
    safetyBody: 'Pembayaran, pembatalan, refund, dan ulasan tersimpan di platform untuk mengurangi risiko transaksi langsung.',
    servicesTitle: 'Layanan',
    servicesSubtitle: 'SERVICES',
    minutes: 'menit',
    serviceNote: 'Sebelum memesan, pastikan layanan ini sesuai pertanyaanmu. Setelah memesan, kelola status di Konsultasi Saya.',
    guideBack: 'Kembali ke alur panduan',
    book: 'Pesan sesi ini',
    unavailableTitle: 'Pemesanan belum dibuka',
    unavailableBody: 'Guide ini belum memiliki layanan publik. Kembali ke direktori atau coba lagi nanti.',
    reviewsTitle: 'Ulasan Member',
    reviewsSubtitle: 'REVIEWS',
    anonymous: 'Anonim',
    noComment: 'Member ini tidak meninggalkan ulasan tertulis.',
  },
  apply: {
    statusLabels: {
      pending: 'Menunggu review',
      reviewing: 'Sedang direview',
      revision: 'Perlu revisi',
      rejected: 'Ditolak',
      interview: 'Sesi percobaan',
      contracted: 'Sudah kontrak',
      active: 'Tayang',
    },
    unauthTitle: 'Pendaftaran Guide',
    authSubtitle: 'Masuk / Daftar',
    unauthBody: 'Buat atau masuk ke akun sebelum mengirim aplikasi.',
    signIn: 'Masuk',
    signUp: 'Buat akun',
    email: 'Email',
    password: 'Kata sandi (minimal 6 karakter)',
    passwordMin: 'Kata sandi minimal 6 karakter',
    passwordTooShort: 'Kata sandi minimal 6 karakter',
    signupSuccess: 'Akun berhasil dibuat. Silakan cek emailmu.',
    authing: 'Memproses...',
    authLoadFailed: 'Gagal memuat status login. Muat ulang halaman dan coba lagi.',
    authUnexpectedError: 'Login sementara tidak tersedia. Silakan coba lagi nanti.',
    existingTitle: 'Aplikasimu',
    existingSubtitle: 'YOUR APPLICATION',
    submittedAt: 'Dikirim pada',
    reviewerNotes: 'Catatan reviewer',
    home: 'Kembali ke beranda',
    formTitle: 'Pendaftaran Guide',
    formSubtitle: 'APPLICATION FORM',
    formBody: 'Alur: daftar → review awal → sesi percobaan → kontrak → tayang. Perkiraan 7–14 hari.',
    legalName: 'Nama lengkap *',
    displayName: 'Nama tampil publik *',
    displayPlaceholder: 'Contoh: Luna Guide',
    phone: 'Nomor telepon *',
    specialtyLabel: 'Spesialisasi * (pilih satu atau lebih)',
    introShort: 'Perkenalan singkat maks 30 karakter *',
    introLong: 'Perkenalan panjang',
    introLongPlaceholder: 'Mengapa ingin jadi guide, gaya konsultasimu, dan siapa yang bisa kamu bantu?',
    quote: 'Kutipan khas',
    quotePlaceholder: 'Contoh: Pembacaan yang baik mengembalikanmu pada pilihan.',
    docsKicker: 'Dokumen / Video',
    idFront: 'KTP / paspor bagian depan',
    idBack: 'KTP bagian belakang',
    videoUrl: 'Link video perkenalan 3 menit',
    videoPlaceholder: 'https://youtu.be/...',
    socialsKicker: 'Tautan media sosial',
    lineUrl: 'Tautan tambah teman LINE',
    website: 'Website pribadi',
    submitNoticeTitle: 'Sebelum mengirim',
    submitNoticeItems: [
      'Review membutuhkan 7–14 hari, termasuk sesi percobaan.',
      'Kami akan menghubungimu melalui email selama proses review.',
      'Setelah tayang, jadwal, harga, dan layanan bisa dikelola di ruang kerja guide.',
    ],
    submit: 'Kirim aplikasi',
    submitting: 'Mengirim...',
    requiredSpecialty: 'Pilih minimal satu spesialisasi',
    requiredFields: 'Lengkapi semua kolom wajib',
    submittedSuccess: 'Aplikasi berhasil dikirim',
    checklist: {
      aria: 'Daftar periksa sebelum mendaftar',
      kicker: 'Daftar periksa sebelum mendaftar',
      title: 'Jalur pendaftaran guide yang lebih jelas',
      body: 'Periksa empat hal ini sebelum mengirim. Setelah mengirim, gunakan ruang kerja guide untuk memantau progres.',
      progress: (done, total) => `${done} / ${total} selesai`,
      ok: 'OK',
      todo: 'Perlu dilengkapi',
      portal: 'Buka ruang kerja guide',
      directory: 'Lihat direktori guide',
      items: [
        { title: 'Akun member', doneBody: 'Sudah masuk dan siap menghubungkan aplikasi.', todoBody: 'Aplikasi akan terhubung ke akun MELE-mu untuk memantau progres.' },
        { title: 'Spesialisasi dan perkenalan singkat', doneBody: 'Spesialisasi dan perkenalan singkat sudah siap.', todoBody: 'Pilih minimal satu spesialisasi dan jelaskan siapa yang bisa kamu bantu dalam satu kalimat.' },
        { title: 'KTP dan video perkenalan', doneBody: 'Materi review sudah dilampirkan.', todoBody: 'KTP untuk review platform. Link video membantu kami memahami gayamu lebih cepat.' },
        { title: 'Saluran kontak', doneBody: 'Saluran kontak sudah siap.', todoBody: 'LINE atau media sosial publik membantu platform menghubungimu selama review.' },
      ],
    },
  },
  portal: {
    title: 'Ruang Kerja Guide',
    subtitle: 'GUIDE PORTAL',
    demoMode: 'mode tes lokal',
    demoNotice: 'Kamu menggunakan akun tes lokal sehingga data guide contoh ditampilkan. Saat diluncurkan, data akan dimuat dari akun Supabase-mu.',
    noTeacherTitle: 'Kamu belum menjadi guide aktif',
    noTeacherBody: 'Ingin menjadi guide MELE? Kirimkan aplikasimu terlebih dahulu.',
    applyCta: 'Kirim aplikasi',
    publicPage: 'Lihat profil publik',
    bookings: 'Lihat konsultasi saya',
    readiness: {
      aria: 'Kesiapan ruang kerja',
      kicker: 'Kesiapan ruang kerja',
      title: (done, total) => `${done} / ${total} siap`,
      body: 'Checklist ini mengumpulkan hal operasional yang sering terlewat sebelum beta.',
      ok: 'OK',
      todo: 'Perlu diperiksa',
      items: {
        profile: ['Profil publik', 'Nama, judul, perkenalan, dan spesialisasi sudah siap untuk dievaluasi member.', 'Tambahkan judul, perkenalan singkat, dan spesialisasi agar profil terlihat terpercaya.'],
        services: ['Layanan sudah diatur', (count) => `${count} layanan aktif siap menerima pemesanan.`, 'Minta admin untuk mengatur nama layanan, durasi, dan harga beta terlebih dahulu.'],
        bookings: ['Ritme penanganan booking', (count) => `${count} konsultasi perlu diperhatikan sebelum sesi.`, 'Belum ada booking yang menunggu. Tinjau deskripsi layanan dan informasi kontak.'],
        testMode: ['Mode beta', 'Mode tes gratis aktif, gunakan alur booking lengkap tanpa membebankan biaya ke member.', 'Untuk mode berbayar, konfirmasi pembayaran, kebijakan pembatalan, dan ritme dukungan terlebih dahulu.'],
        contact: ['Informasi kontak', 'LINE atau media sosial sudah ada untuk komunikasi selama review dan sebelum sesi.', 'Tambahkan minimal LINE atau satu media sosial publik.'],
      },
    },
    memberBrief: {
      aria: 'Ringkasan konteks member',
      kicker: 'MEMBER CONTEXT',
      title: 'Ringkasan Konteks Member',
      body: 'Member melihat pembacaan dasar terlebih dahulu. Pembacaan lebih dalam, transit harian, bulanan, dan tahunan bisa dibuka dengan poin atau akses berbayar. Guide bisa meninjau pertanyaan dan konteks bagan kelahiran sebelum sesi.',
      empty: 'Belum ada konteks bagan kelahiran member. Saat member memesan dan melampirkan pertanyaan atau bagan kelahiran, area ini akan menjadi kartu ringkasan siap pakai.',
      demoNote: 'Mode tes lokal hanya mendemonstrasikan struktur data. Saat diluncurkan akan terhubung dengan pembukaan poin, booking, dan catatan bagan kelahiran member.',
    },
    assist: {
      aria: 'Ruang kerja asisten pembacaan',
      kicker: 'READING ASSIST',
      title: 'Asisten Pembacaan',
      body: 'Pertanyaan member, sinyal bagan kelahiran, batasan sesi, dan prompt lanjutan disusun bersama agar guide bisa mempersiapkan diri tanpa mengubah hasil alat menjadi takdir yang pasti.',
      questionTitle: 'Pertanyaan member',
      chartTitle: 'Sinyal bagan kelahiran',
      prepTitle: 'Fokus pra-sesi',
      openingTitle: 'Pertanyaan pembuka yang disarankan',
      boundaryTitle: 'Batasan pembacaan',
      transitTitle: 'Ekstensi harian / bulanan / tahunan',
      empty: 'Belum ada konteks booking. Saat member memesan dengan pertanyaan, kartu asisten akan dibuat di sini.',
      openingQuestions: [
        'Jawaban apa yang paling ingin kamu bawa pulang hari ini?',
        'Di mana pola ini paling jelas muncul dalam kehidupan sehari-hari?',
        'Jika kita pilih satu tindakan kecil untuk hari ini, dari mana kamu mau mulai?',
      ],
      boundaries: [
        'Klarifikasi pertanyaan member sebelum menafsirkan.',
        'Gunakan alat sebagai referensi, bukan untuk menakut-nakuti atau memberikan jaminan.',
        'Untuk masalah medis, hukum, atau investasi, arahkan member ke profesional yang tepat.',
      ],
      transitPrompts: [
        'Harian: berikan satu pengingat praktis untuk hari ini.',
        'Bulanan: sebut tema yang berulang bulan ini.',
        'Tahunan: hubungkan pembacaan dengan ritme jangka panjang dan pilihan hidup.',
      ],
    },
    stats: { upcoming: 'Akan datang', completed: 'Selesai', rating: 'Rating rata-rata', services: 'Layanan' },
    recentTitle: 'Booking Terbaru',
    recentSubtitle: 'RECENT BOOKINGS',
    pendingNotice: (count) => `${count} konsultasi perlu diperhatikan. Konfirmasi waktu booking yang sudah dibayar dan hubungi member sebelum sesi.`,
    noBookings: 'Belum ada booking',
    tableTime: 'Waktu',
    tableStatus: 'Status',
    tableAmount: 'Jumlah',
    tableReminder: 'Pengingat',
    freeTest: 'Beta gratis',
    paidReminder: 'Konfirmasi kontak pra-sesi',
    noAction: 'Tidak perlu tindakan segera',
    serviceTitle: (count) => `Layanan (${count})`,
    serviceSubtitle: 'SERVICES',
    active: 'Aktif',
    inactive: 'Nonaktif',
    serviceFootnote: 'Penambahan layanan, penyesuaian harga, dan manajemen jadwal akan hadir sebagai fitur ruang kerja berikutnya. Saat ini minta bantuan admin untuk menghindari kesalahan pemesanan.',
  },
});

teacherCopies.ja = inherit('ja', {
  statusLabels: {
    pending: 'お支払い待ち',
    paid: '支払い済み',
    confirmed: '確定済み',
    in_progress: 'セッション中',
    completed: '完了',
    cancelled_customer: 'メンバーがキャンセル',
    cancelled_teacher: 'ガイドがキャンセル',
    refunded: '返金済み',
    no_show: '無断欠席',
  },
  specialties: specialties(jaSpecialties),
  directory: {
    kicker: 'GUIDANCE DIRECTORY',
    title: '相談ガイド一覧',
    subtitle: 'GUIDES',
    body: 'MELE はまずツールで自分を深く知る場所です。もっと話を聞きたいときだけ、専門分野・スタイル・信頼できる実績からガイドを探せます。',
    guidanceCta: '相談ガイドへ進む',
    applyCta: 'ガイドとして申請する',
    loading: 'ガイドを読み込み中...',
    demoNotice: '正式なガイドはまだ登録されていません。インターフェース確認用のデモガイドを表示しています。リリース後は Supabase の実際のデータに切り替わります。',
    emptyTitle: 'この条件に合うガイドはまだいません。',
    emptyAction: 'MELE ガイドとして申請する',
    detailAction: 'プロフィールを見る',
    fallbackTitle: '自己探求ガイド',
    fallbackBody: 'ガイドのプロフィール、専門分野、予約可能なセッションを確認できます。',
    ratingUnit: '点',
    reviewsUnit: '件のレビュー',
    casesUnit: '件のセッション',
  },
  detail: {
    back: '相談ガイド一覧へ戻る',
    demoNotice: 'これはインターフェース確認用のデモガイドです。リリース後は審査済みのガイドが表示されます。',
    fallbackTitle: '自己探求ガイド',
    ratingSuffix: '点',
    reviewCaseText: (reviews, cases) => `（${reviews} 件のレビュー · ${cases} 件のセッション）`,
    fallbackIntro: 'このガイドはまだ詳しい自己紹介を追加していません。予約前にサービスとレビューをご確認ください。',
    fitTitle: 'こんな方に向いています',
    fitBody: '本当の悩みを整理して、客観的な視点から方向性を見つけたい方。',
    styleTitle: 'セッションのスタイル',
    styleFallback: 'オンライン中心のセッションです。ガイドはあなたの質問と提供された命盤データをもとに準備します。',
    safetyTitle: 'プラットフォームの安全な仕組み',
    safetyBody: '支払い・キャンセル・返金・レビューはすべてプラットフォーム内で管理され、直接取引のリスクを軽減します。',
    servicesTitle: 'サービス',
    servicesSubtitle: 'SERVICES',
    minutes: '分',
    serviceNote: '予約前に、このサービスがあなたの質問に合っているか確認してください。予約後は「マイ相談」でステータスと記録を管理できます。',
    guideBack: 'ガイド導線へ戻る',
    book: 'このセッションを予約',
    unavailableTitle: 'まだ予約を受け付けていません',
    unavailableBody: 'このガイドにはまだ公開サービスがありません。一覧に戻るか、後でもう一度ご確認ください。',
    reviewsTitle: 'メンバーのレビュー',
    reviewsSubtitle: 'REVIEWS',
    anonymous: '匿名',
    noComment: 'このメンバーはテキストによるレビューを残していません。',
  },
  apply: {
    statusLabels: {
      pending: '審査待ち',
      reviewing: '審査中',
      revision: '追加書類が必要',
      rejected: '不採用',
      interview: 'トライアルセッション',
      contracted: '契約済み',
      active: '掲載中',
    },
    unauthTitle: 'ガイド申請',
    authSubtitle: 'ログイン / 新規登録',
    unauthBody: '申請前にアカウントを作成するか、ログインしてください。',
    signIn: 'ログイン',
    signUp: 'アカウントを作成',
    email: 'メールアドレス',
    password: 'パスワード（6文字以上）',
    passwordMin: 'パスワードは6文字以上で入力してください',
    passwordTooShort: 'パスワードは6文字以上で入力してください',
    signupSuccess: 'アカウントを作成しました。メールをご確認ください。',
    authing: '処理中...',
    authLoadFailed: 'ログイン状態を読み込めませんでした。ページを再読み込みしてもう一度お試しください。',
    authUnexpectedError: 'ログインが一時的にご利用いただけません。しばらくしてからもう一度お試しください。',
    existingTitle: 'あなたの申請',
    existingSubtitle: 'YOUR APPLICATION',
    submittedAt: '送信日',
    reviewerNotes: '審査担当者のコメント',
    home: 'ホームに戻る',
    formTitle: 'ガイド申請フォーム',
    formSubtitle: 'APPLICATION FORM',
    formBody: '流れ：申請 → 一次審査 → トライアルセッション → 契約 → 掲載。目安は7〜14日です。',
    legalName: '氏名（本名）*',
    displayName: '表示名 *',
    displayPlaceholder: '例：Luna ガイド',
    phone: '電話番号 *',
    specialtyLabel: '専門分野 *（複数選択可）',
    introShort: '30文字以内の自己紹介 *',
    introLong: '詳しい自己紹介',
    introLongPlaceholder: 'ガイドになりたい理由、スタイル、サポートできる方について...',
    quote: 'お気に入りの言葉',
    quotePlaceholder: '例：良いリーディングは、あなた自身が選択に戻るきっかけをつくります。',
    docsKicker: '書類 / 動画',
    idFront: '身分証明書の表面（マイナンバーカード / パスポート）',
    idBack: '身分証明書の裏面',
    videoUrl: '3分の自己紹介動画リンク',
    videoPlaceholder: 'https://youtu.be/...',
    socialsKicker: 'SNSリンク',
    lineUrl: 'LINE 友だち追加リンク',
    website: '個人ウェブサイト',
    submitNoticeTitle: '送信前にご確認ください',
    submitNoticeItems: [
      '審査にはトライアルセッションを含め7〜14日かかります。',
      '審査期間中はメールでご連絡します。',
      '掲載後はガイドのワークスペースでスケジュール・サービス・価格を自己管理できます。',
    ],
    submit: '申請を送信',
    submitting: '送信中...',
    requiredSpecialty: '専門分野を少なくとも一つ選択してください',
    requiredFields: '必須項目を入力してください',
    submittedSuccess: '申請を送信しました',
    checklist: {
      aria: '申請前チェックリスト',
      kicker: '申請前チェックリスト',
      title: 'ガイド申請の流れがより明確に',
      body: '送信前にこの4項目を確認してください。送信後はガイドワークスペースで進捗を確認できます。',
      progress: (done, total) => `${done} / ${total} 完了`,
      ok: 'OK',
      todo: '未完了',
      portal: 'ガイドワークスペースを開く',
      directory: 'ガイド一覧を見る',
      items: [
        { title: 'メンバーアカウント', doneBody: 'ログイン済み。申請に紐付けられます。', todoBody: '申請はあなたの MELE アカウントに紐付けられ、進捗確認に使用されます。' },
        { title: '専門分野と短い自己紹介', doneBody: '専門分野と短い自己紹介が準備できています。', todoBody: '専門分野を一つ以上選び、サポートできる方を一文で明確に説明してください。' },
        { title: '身分証と自己紹介動画', doneBody: '審査用の資料が添付されています。', todoBody: '身分証はプラットフォームの審査に使用します。動画リンクがあると審査がスムーズに進みます。' },
        { title: '連絡手段', doneBody: '連絡手段が準備できています。', todoBody: 'LINE または公開SNSがあると、審査中にプラットフォームからスムーズにご連絡できます。' },
      ],
    },
  },
  portal: {
    title: 'ガイドワークスペース',
    subtitle: 'GUIDE PORTAL',
    demoMode: 'ローカルテストモード',
    demoNotice: 'ローカルテストアカウントを使用しているため、デモガイドのデータが表示されています。正式リリース後はあなたの Supabase アカウントからデータを読み込みます。',
    noTeacherTitle: 'まだ公開ガイドではありません',
    noTeacherBody: 'MELE のガイドになりませんか？まず申請を送信してください。',
    applyCta: '申請を送信',
    publicPage: '公開ページを見る',
    bookings: 'マイ相談を見る',
    readiness: {
      aria: 'ワークスペースの準備状況',
      kicker: 'ワークスペースの準備状況',
      title: (done, total) => `${done} / ${total} 完了`,
      body: 'ベータテスト前に見落としやすい運用項目をまとめています。',
      ok: 'OK',
      todo: '要確認',
      items: {
        profile: ['公開プロフィール', '名前・肩書き・自己紹介・専門分野が揃っており、メンバーが適性を判断できます。', '肩書き・短い自己紹介・専門分野を追加して、公開ページを信頼できる内容にしてください。'],
        services: ['サービスの設定', (count) => `${count} 件のサービスが予約受付中です。`, 'まず管理者にサービス名・時間・ベータ価格の設定を依頼してください。'],
        bookings: ['予約への対応ペース', (count) => `${count} 件の相談がセッション前に要確認です。`, '待機中の予約はありません。サービス説明と連絡先を確認してください。'],
        testMode: ['ベータモード', '無料テストモード中です。メンバーに費用をかけずに予約フロー全体を検証してください。', '有料モードでは、支払い・キャンセルポリシー・サポート対応のペースを事前に確認してください。'],
        contact: ['連絡先情報', '審査やセッション前の連絡のために LINE または SNS が設定されています。', '少なくとも LINE または公開 SNS アカウントを一つ追加してください。'],
      },
    },
    memberBrief: {
      aria: 'メンバーコンテキストメモ',
      kicker: 'MEMBER CONTEXT',
      title: 'メンバーコンテキストメモ',
      body: 'メンバーはまず基本的な解説を確認します。より深い解説や流日・流月・流年の情報はポイントまたは有料でアクセスできます。ガイドはセッション前にメンバーの質問と命盤の文脈を確認できます。',
      empty: 'まだメンバーの命盤データがありません。メンバーが予約と質問・命盤データを送ると、ここにガイド用のサマリーカードが作成されます。',
      demoNote: 'ローカルテストモードではデータ構造のみを示しています。正式リリース後はメンバーのポイント開放・予約・命盤記録と連携します。',
    },
    assist: {
      aria: '解釈アシストワークスペース',
      kicker: 'READING ASSIST',
      title: '解釈アシスト',
      body: 'メンバーの質問・命盤のシグナル・セッションの範囲・発展的な問いをまとめて整理し、ガイドがツールの結果を絶対的な運命として伝えることなく準備できるようにします。',
      questionTitle: 'メンバーのメイン質問',
      chartTitle: '命盤のシグナル',
      prepTitle: 'セッション前の整理',
      openingTitle: 'おすすめの導入質問',
      boundaryTitle: '解釈の範囲',
      transitTitle: '流日 / 流月 / 流年の展開',
      empty: 'まだ予約のコンテキストがありません。メンバーが質問付きで予約すると、アシストカードがここに自動生成されます。',
      openingQuestions: [
        '今日一番持ち帰りたい答えは何ですか？',
        'このテーマが日常の中で最もよく現れる場面はどこですか？',
        '今日一つだけ小さな行動を選ぶとしたら、どこから始めますか？',
      ],
      boundaries: [
        '解釈する前にメンバーの質問を明確にしてください。',
        'ツールは参照として使い、恐怖を煽ったり結果を保証したりしないでください。',
        '医療・法律・投資に関する問題は、専門家への相談を促してください。',
      ],
      transitPrompts: [
        '流日：今日実践できる一つのリマインダーを伝えましょう。',
        '流月：今月繰り返し現れているテーマを言語化しましょう。',
        '流年：読み解きを長期的なリズムと選択に結びつけましょう。',
      ],
    },
    stats: { upcoming: '予定', completed: '完了', rating: '平均評価', services: 'サービス' },
    recentTitle: '最近の予約',
    recentSubtitle: 'RECENT BOOKINGS',
    pendingNotice: (count) => `${count} 件の相談が要確認です。支払い済みまたは確定済みの予約時間を確認し、セッション前にメンバーと連絡を取ってください。`,
    noBookings: 'まだ予約はありません',
    tableTime: '日時',
    tableStatus: 'ステータス',
    tableAmount: '金額',
    tableReminder: '確認事項',
    freeTest: '無料ベータ',
    paidReminder: 'セッション前の連絡を確認',
    noAction: '対応不要',
    serviceTitle: (count) => `サービス（${count}）`,
    serviceSubtitle: 'SERVICES',
    active: '公開中',
    inactive: '非公開',
    serviceFootnote: 'サービスの追加・価格調整・スケジュール管理は今後のワークスペース機能として追加予定です。現在は管理者に設定を依頼することで、予約ミスを防げます。',
  },
});

teacherCopies.ko = inherit('ko', {
  statusLabels: {
    pending: '결제 대기',
    paid: '결제 완료',
    confirmed: '확정됨',
    in_progress: '세션 진행 중',
    completed: '완료',
    cancelled_customer: '회원 취소',
    cancelled_teacher: '가이드 취소',
    refunded: '환불 완료',
    no_show: '무단 불참',
  },
  specialties: specialties(koSpecialties),
  directory: {
    kicker: 'GUIDANCE DIRECTORY',
    title: '상담 가이드 목록',
    subtitle: 'GUIDES',
    body: 'MELE는 먼저 도구로 자신을 깊이 이해하는 플랫폼입니다. 더 깊은 대화가 필요할 때 전문 분야, 스타일, 신뢰 요소를 보고 가이드를 선택할 수 있습니다.',
    guidanceCta: '상담 흐름 시작',
    applyCta: '가이드 신청하기',
    loading: '가이드 목록을 불러오는 중...',
    demoNotice: '정식 가이드가 아직 없습니다. 인터페이스 확인을 위한 데모 가이드를 표시하고 있습니다. 정식 출시 후에는 Supabase의 실제 데이터로 전환됩니다.',
    emptyTitle: '이 조건에 맞는 가이드가 아직 없습니다.',
    emptyAction: 'MELE 가이드 신청하기',
    detailAction: '가이드 프로필 보기',
    fallbackTitle: '자기 탐색 가이드',
    fallbackBody: '가이드 프로필, 전문 분야, 예약 가능한 세션을 확인하세요.',
    ratingUnit: '점',
    reviewsUnit: '개의 후기',
    casesUnit: '회 세션',
  },
  detail: {
    back: '상담 가이드 목록으로 돌아가기',
    demoNotice: '인터페이스 확인을 위한 데모 가이드입니다. 정식 출시 후에는 심사를 통과한 가이드가 표시됩니다.',
    fallbackTitle: '자기 탐색 가이드',
    ratingSuffix: '점',
    reviewCaseText: (reviews, cases) => `(후기 ${reviews}개 · 세션 ${cases}회)`,
    fallbackIntro: '이 가이드는 아직 자세한 소개를 등록하지 않았습니다. 예약 전 서비스와 후기를 먼저 확인해 주세요.',
    fitTitle: '이런 분께 맞습니다',
    fitBody: '진짜 질문을 정리하고 구조적인 외부 시각이 필요한 분에게 적합합니다.',
    styleTitle: '세션 방식',
    styleFallback: '온라인 세션 중심입니다. 가이드는 회원의 질문과 제출한 명반 데이터를 바탕으로 준비합니다.',
    safetyTitle: '플랫폼 안전 장치',
    safetyBody: '결제, 취소, 환불, 후기는 모두 플랫폼 내에 기록되어 개인 거래의 위험을 줄입니다.',
    servicesTitle: '서비스',
    servicesSubtitle: 'SERVICES',
    minutes: '분',
    serviceNote: '예약 전 이 서비스가 내 질문 유형에 맞는지 확인해 주세요. 예약 후 "나의 상담"에서 상태와 기록을 관리할 수 있습니다.',
    guideBack: '상담 흐름으로 돌아가기',
    book: '이 세션 예약',
    unavailableTitle: '아직 예약을 받지 않습니다',
    unavailableBody: '이 가이드는 아직 공개 서비스가 없습니다. 목록으로 돌아가거나 나중에 다시 확인해 주세요.',
    reviewsTitle: '회원 후기',
    reviewsSubtitle: 'REVIEWS',
    anonymous: '익명',
    noComment: '이 회원은 텍스트 후기를 남기지 않았습니다.',
  },
  apply: {
    statusLabels: {
      pending: '심사 대기',
      reviewing: '심사 중',
      revision: '추가 서류 필요',
      rejected: '불합격',
      interview: '시범 세션',
      contracted: '계약 완료',
      active: '공개 중',
    },
    unauthTitle: '가이드 신청',
    authSubtitle: '로그인 / 회원가입',
    unauthBody: '신청하기 전에 계정을 만들거나 로그인해 주세요.',
    signIn: '로그인',
    signUp: '계정 만들기',
    email: '이메일',
    password: '비밀번호 (6자 이상)',
    passwordMin: '비밀번호는 6자 이상이어야 합니다',
    passwordTooShort: '비밀번호는 6자 이상이어야 합니다',
    signupSuccess: '계정이 생성되었습니다. 이메일을 확인해 주세요.',
    authing: '처리 중...',
    authLoadFailed: '로그인 상태를 불러올 수 없습니다. 페이지를 새로고침하고 다시 시도해 주세요.',
    authUnexpectedError: '로그인이 일시적으로 불가능합니다. 잠시 후 다시 시도해 주세요.',
    existingTitle: '내 신청 현황',
    existingSubtitle: 'YOUR APPLICATION',
    submittedAt: '제출 일시',
    reviewerNotes: '심사 담당자 코멘트',
    home: '홈으로 돌아가기',
    formTitle: '가이드 신청서',
    formSubtitle: 'APPLICATION FORM',
    formBody: '절차: 신청 → 1차 심사 → 시범 세션 → 계약 → 공개. 약 7~14일 소요됩니다.',
    legalName: '실명 *',
    displayName: '공개 표시 이름 *',
    displayPlaceholder: '예: Luna 가이드',
    phone: '연락처 *',
    specialtyLabel: '전문 분야 * (복수 선택 가능)',
    introShort: '30자 이내 자기소개 *',
    introLong: '상세 소개',
    introLongPlaceholder: '가이드가 되고 싶은 이유, 본인의 스타일, 어떤 분을 도울 수 있는지...',
    quote: '대표 문구',
    quotePlaceholder: '예: 좋은 리딩은 당신이 스스로 선택으로 돌아오게 합니다.',
    docsKicker: '서류 / 영상',
    idFront: '신분증 앞면 (주민등록증 / 여권)',
    idBack: '신분증 뒷면',
    videoUrl: '3분 자기소개 영상 링크',
    videoPlaceholder: 'https://youtu.be/...',
    socialsKicker: 'SNS 링크',
    lineUrl: 'LINE 친구 추가 링크',
    website: '개인 웹사이트',
    submitNoticeTitle: '제출 전 확인 사항',
    submitNoticeItems: [
      '심사는 시범 세션 포함 7~14일이 소요됩니다.',
      '심사 기간 중 이메일로 연락드립니다.',
      '공개 후에는 가이드 워크스페이스에서 일정, 서비스, 가격을 직접 관리할 수 있습니다.',
    ],
    submit: '신청 제출',
    submitting: '제출 중...',
    requiredSpecialty: '전문 분야를 하나 이상 선택해 주세요',
    requiredFields: '필수 항목을 모두 입력해 주세요',
    submittedSuccess: '신청이 접수되었습니다',
    checklist: {
      aria: '신청 전 체크리스트',
      kicker: '신청 전 체크리스트',
      title: '가이드 신청 절차가 더 명확해집니다',
      body: '제출 전 이 4가지를 확인하세요. 제출 후에는 가이드 워크스페이스에서 진행 상황을 확인할 수 있습니다.',
      progress: (done, total) => `${done} / ${total} 완료`,
      ok: 'OK',
      todo: '필요',
      portal: '가이드 워크스페이스 열기',
      directory: '가이드 목록 보기',
      items: [
        { title: '회원 계정', doneBody: '로그인되어 신청과 연결할 준비가 됐습니다.', todoBody: '신청은 내 MELE 계정에 연결되어 진행 상황을 추적하는 데 사용됩니다.' },
        { title: '전문 분야와 짧은 자기소개', doneBody: '전문 분야와 짧은 자기소개가 준비됐습니다.', todoBody: '전문 분야를 하나 이상 선택하고, 어떤 분을 어떻게 돕는지 한 줄로 명확히 설명해 주세요.' },
        { title: '신분증과 자기소개 영상', doneBody: '심사 자료가 첨부됐습니다.', todoBody: '신분증은 플랫폼 심사에 사용됩니다. 영상 링크가 있으면 스타일을 더 빠르게 파악할 수 있습니다.' },
        { title: '연락 채널', doneBody: '연락 채널이 준비됐습니다.', todoBody: 'LINE 또는 공개 SNS가 있으면 심사 중 플랫폼에서 원활하게 연락드릴 수 있습니다.' },
      ],
    },
  },
  portal: {
    title: '가이드 워크스페이스',
    subtitle: 'GUIDE PORTAL',
    demoMode: '로컬 테스트 모드',
    demoNotice: '로컬 테스트 계정을 사용 중이라 데모 가이드 데이터가 표시됩니다. 정식 출시 후에는 Supabase 계정에서 가이드 데이터를 불러옵니다.',
    noTeacherTitle: '아직 활성 가이드가 아닙니다',
    noTeacherBody: 'MELE 가이드가 되고 싶으신가요? 먼저 신청서를 제출해 주세요.',
    applyCta: '신청 제출',
    publicPage: '공개 프로필 보기',
    bookings: '나의 상담 보기',
    readiness: {
      aria: '워크스페이스 준비 현황',
      kicker: '워크스페이스 준비 현황',
      title: (done, total) => `${done} / ${total} 준비됨`,
      body: '베타 테스트 전 놓치기 쉬운 운영 항목을 모았습니다.',
      ok: 'OK',
      todo: '확인 필요',
      items: {
        profile: ['공개 프로필', '이름, 직함, 소개, 전문 분야가 갖춰져 있어 회원이 적합도를 판단할 수 있습니다.', '직함, 짧은 소개, 전문 분야를 추가하여 공개 페이지가 신뢰감 있게 보이도록 해 주세요.'],
        services: ['서비스 설정', (count) => `${count}개의 활성 서비스가 예약을 받을 준비가 됐습니다.`, '관리자에게 서비스 이름, 시간, 베타 가격 설정을 먼저 요청해 주세요.'],
        bookings: ['예약 처리 리듬', (count) => `${count}건의 상담이 세션 전 확인이 필요합니다.`, '대기 중인 예약이 없습니다. 서비스 설명과 연락처를 점검해 주세요.'],
        testMode: ['베타 모드', '무료 테스트 모드입니다. 회원에게 비용 없이 전체 예약 흐름을 검증해 보세요.', '유료 모드로 전환 시 결제, 취소 정책, 고객 응대 리듬을 먼저 확인해 주세요.'],
        contact: ['연락처 정보', '심사 및 세션 전 연락을 위한 LINE 또는 SNS가 등록되어 있습니다.', '최소 LINE 또는 공개 SNS 채널 하나를 추가해 주세요.'],
      },
    },
    memberBrief: {
      aria: '회원 맥락 요약',
      kicker: 'MEMBER CONTEXT',
      title: '회원 맥락 요약',
      body: '회원은 먼저 기본 해석을 확인합니다. 더 깊은 해석, 일운·월운·연운은 포인트 또는 유료로 열람 가능합니다. 가이드는 세션 전 회원의 질문과 명반 맥락을 미리 확인할 수 있습니다.',
      empty: '아직 회원 명반 데이터가 없습니다. 회원이 예약하고 질문이나 명반 데이터를 첨부하면 여기에 가이드용 요약 카드가 생성됩니다.',
      demoNote: '로컬 테스트 모드는 데이터 구조만 보여줍니다. 정식 출시 후에는 회원의 포인트 잠금 해제, 예약, 명반 기록과 연동됩니다.',
    },
    assist: {
      aria: '해석 보조 워크스페이스',
      kicker: 'READING ASSIST',
      title: '해석 보조',
      body: '회원의 질문, 명반 신호, 세션 경계, 심화 질문을 한 곳에 정리해 가이드가 도구 결과를 절대적 운명으로 전달하지 않으면서 더 잘 준비할 수 있도록 돕습니다.',
      questionTitle: '회원의 주요 질문',
      chartTitle: '명반 신호',
      prepTitle: '세션 전 정리',
      openingTitle: '추천 시작 질문',
      boundaryTitle: '해석 경계',
      transitTitle: '일운 / 월운 / 연운 심화',
      empty: '아직 예약 맥락이 없습니다. 회원이 질문과 함께 예약하면 여기에 보조 카드가 자동 생성됩니다.',
      openingQuestions: [
        '오늘 가장 가져가고 싶은 답이 무엇인가요?',
        '이 패턴이 일상에서 가장 자주 나타나는 상황은 언제인가요?',
        '오늘 작은 행동 하나를 선택한다면 어디서부터 시작하고 싶으신가요?',
      ],
      boundaries: [
        '해석하기 전에 회원의 질문을 먼저 명확히 해 주세요.',
        '도구는 참조로만 활용하고, 두려움을 유발하거나 결과를 보장하지 마세요.',
        '의료, 법률, 투자 문제는 전문가에게 안내해 주세요.',
      ],
      transitPrompts: [
        '일운: 오늘 실천할 수 있는 행동 하나를 알려주세요.',
        '월운: 이달에 반복되는 주제를 정리해 주세요.',
        '연운: 장기적 리듬과 선택에 연결해 해석해 주세요.',
      ],
    },
    stats: { upcoming: '예정', completed: '완료', rating: '평균 평점', services: '서비스' },
    recentTitle: '최근 예약',
    recentSubtitle: 'RECENT BOOKINGS',
    pendingNotice: (count) => `${count}건의 상담을 확인해 주세요. 결제 완료 또는 확정된 예약 시간을 확인하고 세션 전 회원과 소통해 주세요.`,
    noBookings: '아직 예약이 없습니다',
    tableTime: '시간',
    tableStatus: '상태',
    tableAmount: '금액',
    tableReminder: '알림',
    freeTest: '무료 베타',
    paidReminder: '세션 전 연락 확인',
    noAction: '즉시 처리 불필요',
    serviceTitle: (count) => `서비스 (${count})`,
    serviceSubtitle: 'SERVICES',
    active: '공개 중',
    inactive: '비공개',
    serviceFootnote: '서비스 추가, 가격 조정, 일정 관리는 향후 워크스페이스 기능으로 추가될 예정입니다. 현재는 관리자에게 설정을 요청하여 예약 오류를 방지하세요.',
  },
});

const specialtyAliases: Record<string, string> = {
  all: '全部',
  bazi: '八字',
  'bazi chart': '八字',
  'four pillars': '八字',
  ziwei: '紫微',
  'zi wei': '紫微',
  'zi wei dou shu': '紫微',
  tarot: '塔羅',
  runes: '盧恩',
  rune: '盧恩',
  astrology: '占星',
  astro: '占星',
  humandesign: '人類圖',
  'human design': '人類圖',
  numerology: '生命靈數',
  maya: '馬雅',
  'maya calendar': '馬雅',
  'mayan tzolkin': '馬雅',
};

export function getTeacherCopy(locale: Locale): TeacherCopy {
  return teacherCopies[locale] ?? teacherCopies[DEFAULT_LOCALE];
}

export function normalizeSpecialtyFilter(value: string | null | undefined) {
  const raw = (value ?? '').trim();
  if (!raw) return '全部';
  if ((specialtyValues as readonly string[]).includes(raw)) return raw;
  const lower = raw.toLowerCase();
  return specialtyAliases[lower] ?? raw;
}

export function specialtyLabel(locale: Locale, value: string) {
  const copy = getTeacherCopy(locale);
  return copy.specialties.find((item) => item.value === value)?.label ?? value;
}

export function localizeDemoTeacher(teacher: Teacher, locale: Locale): Teacher {
  const translated = getTeacherCopy(locale).demoTeachers[teacher.id];
  return translated ? { ...teacher, ...translated } : teacher;
}

export function localizeDemoService<T extends Pick<TeacherService, 'id'>>(service: T, locale: Locale): T {
  const translated = getTeacherCopy(locale).demoServices[service.id];
  return translated ? { ...service, ...translated } as T : service;
}

export function teacherLocaleTag(locale: Locale) {
  if (locale === 'zh-TW') return 'zh-TW';
  if (locale === 'vi') return 'vi-VN';
  if (locale === 'id') return 'id-ID';
  if (locale === 'ja') return 'ja-JP';
  if (locale === 'ko') return 'ko-KR';
  return 'en';
}
