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
      quotePlaceholder: '例：宇宙從不為難準備好的靈魂',
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
  specialties: specialties(viSpecialties),
  directory: {
    title: 'Danh mục hướng dẫn',
    subtitle: 'GUIDES',
    body: 'MELE giúp thành viên hiểu bản thân bằng công cụ trước. Khi cần trò chuyện sâu hơn, họ có thể xem guide theo chuyên môn, phong cách và tín hiệu tin cậy.',
    guidanceCta: 'Bắt đầu luồng gợi ý',
    applyCta: 'Đăng ký làm guide',
    loading: 'Đang tải guide...',
    detailAction: 'Xem hồ sơ guide',
    emptyTitle: 'Chưa có guide phù hợp bộ lọc này.',
  },
  detail: {
    back: 'Quay lại danh mục hướng dẫn',
    servicesTitle: 'Dịch vụ',
    minutes: 'phút',
    book: 'Đặt buổi này',
    guideBack: 'Quay lại luồng gợi ý',
    unavailableTitle: 'Chưa mở đặt lịch',
    reviewsTitle: 'Đánh giá thành viên',
  },
  apply: {
    unauthTitle: 'Đăng ký làm guide',
    authSubtitle: 'Đăng nhập / Đăng ký',
    unauthBody: 'Hãy tạo hoặc đăng nhập tài khoản trước khi gửi đơn.',
    signIn: 'Đăng nhập',
    signUp: 'Tạo tài khoản',
    formTitle: 'Đăng ký làm guide',
    formBody: 'Quy trình: đăng ký -> xét duyệt đầu -> buổi thử -> hợp đồng -> lên trang. Khoảng 7-14 ngày.',
    submit: 'Gửi đơn',
    submitting: 'Đang gửi...',
    requiredSpecialty: 'Vui lòng chọn ít nhất một chuyên môn',
    requiredFields: 'Vui lòng điền các mục bắt buộc',
    checklist: {
      ...teacherCopies.en.apply.checklist,
      title: 'Lộ trình đăng ký guide rõ ràng hơn',
      body: 'Kiểm tra bốn mục này trước khi gửi. Sau khi gửi, dùng không gian guide để theo dõi tiến độ.',
      portal: 'Mở không gian guide',
      directory: 'Xem danh mục guide',
    },
  },
  portal: {
    title: 'Không gian Guide',
    demoMode: 'chế độ thử cục bộ',
    noTeacherTitle: 'Bạn chưa phải guide đang hoạt động',
    applyCta: 'Gửi đơn',
    publicPage: 'Xem hồ sơ công khai',
    readiness: { ...teacherCopies.en.portal.readiness, title: (done, total) => `${done} / ${total} sẵn sàng`, body: 'Checklist này gom các việc vận hành dễ bị bỏ sót trước beta.' },
    memberBrief: { ...teacherCopies.en.portal.memberBrief, title: 'Tóm tắt bối cảnh thành viên' },
    assist: {
      ...teacherCopies.en.portal.assist,
      title: 'Hỗ trợ giải đọc',
      openingTitle: 'Câu hỏi mở đầu gợi ý',
      boundaryTitle: 'Ranh giới giải đọc',
      transitTitle: 'Mở rộng ngày / tháng / năm',
    },
    stats: { upcoming: 'Sắp tới', completed: 'Hoàn tất', rating: 'Điểm TB', services: 'Dịch vụ' },
    recentTitle: 'Lịch đặt gần đây',
    noBookings: 'Chưa có lịch đặt',
    tableTime: 'Thời gian',
    tableStatus: 'Trạng thái',
    tableAmount: 'Số tiền',
    tableReminder: 'Nhắc nhở',
    freeTest: 'Beta miễn phí',
    active: 'Đang mở',
    inactive: 'Đã tắt',
  },
});

teacherCopies.id = inherit('id', {
  specialties: specialties(idSpecialties),
  directory: {
    title: 'Direktori Panduan',
    subtitle: 'GUIDES',
    body: 'MELE membantu member memahami diri lewat alat terlebih dahulu. Jika perlu percakapan lebih dalam, mereka bisa melihat panduan berdasarkan spesialisasi, gaya, dan sinyal kepercayaan.',
    guidanceCta: 'Mulai alur panduan',
    applyCta: 'Daftar sebagai guide',
    loading: 'Memuat guide...',
    detailAction: 'Lihat profil guide',
    emptyTitle: 'Belum ada guide yang cocok dengan filter ini.',
  },
  detail: { back: 'Kembali ke direktori panduan', servicesTitle: 'Layanan', minutes: 'menit', book: 'Pesan sesi ini', guideBack: 'Kembali ke alur panduan', reviewsTitle: 'Ulasan member' },
  apply: {
    unauthTitle: 'Pendaftaran Guide',
    authSubtitle: 'Masuk / Daftar',
    unauthBody: 'Buat atau masuk ke akun sebelum mengirim aplikasi.',
    signIn: 'Masuk',
    signUp: 'Buat akun',
    formTitle: 'Pendaftaran Guide',
    formBody: 'Alur: daftar -> review awal -> sesi coba -> kontrak -> tayang. Perkiraan 7-14 hari.',
    submit: 'Kirim aplikasi',
    submitting: 'Mengirim...',
    requiredSpecialty: 'Pilih minimal satu spesialisasi',
    requiredFields: 'Lengkapi semua kolom wajib',
  },
  portal: {
    title: 'Ruang Kerja Guide',
    demoMode: 'mode tes lokal',
    noTeacherTitle: 'Anda belum menjadi guide aktif',
    applyCta: 'Kirim aplikasi',
    publicPage: 'Lihat profil publik',
    readiness: { ...teacherCopies.en.portal.readiness, title: (done, total) => `${done} / ${total} siap`, body: 'Checklist ini mengumpulkan hal operasional yang sering terlewat sebelum beta.' },
    memberBrief: { ...teacherCopies.en.portal.memberBrief, title: 'Ringkasan Konteks Member' },
    assist: { ...teacherCopies.en.portal.assist, title: 'Asisten Pembacaan', openingTitle: 'Pertanyaan pembuka yang disarankan' },
    stats: { upcoming: 'Akan datang', completed: 'Selesai', rating: 'Rating rata-rata', services: 'Layanan' },
    recentTitle: 'Booking Terbaru',
    noBookings: 'Belum ada booking',
    tableTime: 'Waktu',
    tableStatus: 'Status',
    tableAmount: 'Jumlah',
    tableReminder: 'Pengingat',
    freeTest: 'Beta gratis',
    active: 'Aktif',
    inactive: 'Nonaktif',
  },
});

teacherCopies.ja = inherit('ja', {
  specialties: specialties(jaSpecialties),
  directory: {
    title: '相談ガイド一覧',
    subtitle: 'GUIDES',
    body: 'MELE はまずツールで自分を理解する場所です。より深く話したいときだけ、専門・スタイル・信頼材料からガイドを探せます。',
    guidanceCta: '相談ガイドへ進む',
    applyCta: 'ガイドとして申請',
    loading: 'ガイドを読み込み中...',
    detailAction: 'プロフィールを見る',
    emptyTitle: 'この条件に合うガイドはまだいません。',
  },
  detail: { back: '相談ガイド一覧へ戻る', servicesTitle: 'サービス', minutes: '分', book: 'このセッションを予約', guideBack: 'ガイド導線へ戻る', reviewsTitle: 'メンバー評価' },
  apply: {
    unauthTitle: 'ガイド申請',
    authSubtitle: 'ログイン / 登録',
    unauthBody: '申請前にアカウントを作成、またはログインしてください。',
    signIn: 'ログイン',
    signUp: 'アカウント作成',
    formTitle: 'ガイド申請',
    formBody: '流れ：申請 → 一次確認 → 試しセッション → 契約 → 掲載。目安は 7-14 日です。',
    submit: '申請を送信',
    submitting: '送信中...',
    requiredSpecialty: '専門分野を少なくとも一つ選んでください',
    requiredFields: '必須項目を入力してください',
  },
  portal: {
    title: 'ガイドワークスペース',
    demoMode: 'ローカルテストモード',
    noTeacherTitle: 'まだ公開ガイドではありません',
    applyCta: '申請を送信',
    publicPage: '公開ページを見る',
    readiness: { ...teacherCopies.en.portal.readiness, title: (done, total) => `${done} / ${total} 完了`, body: 'ベータ前に見落としやすい運用項目をまとめています。' },
    memberBrief: { ...teacherCopies.en.portal.memberBrief, title: 'メンバー文脈メモ' },
    assist: { ...teacherCopies.en.portal.assist, title: '解釈アシスト', openingTitle: 'おすすめの導入質問' },
    stats: { upcoming: '予定', completed: '完了', rating: '平均評価', services: 'サービス' },
    recentTitle: '最近の予約',
    noBookings: '予約はまだありません',
    tableTime: '時間',
    tableStatus: '状態',
    tableAmount: '金額',
    tableReminder: '確認',
    freeTest: '無料ベータ',
    active: '公開中',
    inactive: '非公開',
  },
});

teacherCopies.ko = inherit('ko', {
  specialties: specialties(koSpecialties),
  directory: {
    title: '상담 가이드 목록',
    subtitle: 'GUIDES',
    body: 'MELE는 먼저 도구로 자신을 이해하는 플랫폼입니다. 더 깊은 대화가 필요할 때만 전문 분야, 스타일, 신뢰 요소를 보고 가이드를 선택할 수 있습니다.',
    guidanceCta: '상담 흐름 시작',
    applyCta: '가이드 신청',
    loading: '가이드를 불러오는 중...',
    detailAction: '가이드 프로필 보기',
    emptyTitle: '이 조건에 맞는 가이드가 아직 없습니다.',
  },
  detail: { back: '상담 가이드 목록으로 돌아가기', servicesTitle: '서비스', minutes: '분', book: '이 세션 예약', guideBack: '상담 흐름으로 돌아가기', reviewsTitle: '회원 후기' },
  apply: {
    unauthTitle: '가이드 신청',
    authSubtitle: '로그인 / 가입',
    unauthBody: '신청 전 계정을 만들거나 로그인해 주세요.',
    signIn: '로그인',
    signUp: '계정 만들기',
    formTitle: '가이드 신청',
    formBody: '절차: 신청 → 1차 검토 → 시범 세션 → 계약 → 공개. 약 7-14일이 걸립니다.',
    submit: '신청 제출',
    submitting: '제출 중...',
    requiredSpecialty: '전문 분야를 하나 이상 선택해 주세요',
    requiredFields: '필수 항목을 입력해 주세요',
  },
  portal: {
    title: '가이드 워크스페이스',
    demoMode: '로컬 테스트 모드',
    noTeacherTitle: '아직 활성 가이드가 아닙니다',
    applyCta: '신청 제출',
    publicPage: '공개 프로필 보기',
    readiness: { ...teacherCopies.en.portal.readiness, title: (done, total) => `${done} / ${total} 준비됨`, body: '베타 테스트 전 놓치기 쉬운 운영 항목을 모았습니다.' },
    memberBrief: { ...teacherCopies.en.portal.memberBrief, title: '회원 맥락 브리프' },
    assist: { ...teacherCopies.en.portal.assist, title: '해석 보조', openingTitle: '추천 시작 질문' },
    stats: { upcoming: '예정', completed: '완료', rating: '평균 평점', services: '서비스' },
    recentTitle: '최근 예약',
    noBookings: '아직 예약이 없습니다',
    tableTime: '시간',
    tableStatus: '상태',
    tableAmount: '금액',
    tableReminder: '알림',
    freeTest: '무료 베타',
    active: '공개 중',
    inactive: '비공개',
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
