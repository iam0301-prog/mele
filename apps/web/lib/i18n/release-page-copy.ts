import { DEFAULT_LOCALE, type Locale } from './config';

type DailyCopy = {
  kicker: string;
  title: string;
  body: string;
  tarot: string;
  runes: string;
  tarotDone: string;
  runesDone: string;
  oneChoice: string;
  resultTitle: string;
  resultHint: string;
  loading: string;
  error: string;
  cards: Array<{ title: string; body: string }>;
};

type MobileCopy = {
  kicker: string;
  title: string;
  body: string;
  primary: string;
  secondary: string;
  panels: Array<{ title: string; body: string; href: string; action: string }>;
};

type LoginCopy = {
  kicker: string;
  title: string;
  body: string;
  signIn: string;
  signUp: string;
  email: string;
  password: string;
  displayName: string;
  consent: string;
  age: string;
  submitSignIn: string;
  submitSignUp: string;
  reset: string;
  resend: string;
  localTest: string;
  socialTitle: string;
  google: string;
  line: string;
  disabled: string;
  validation: {
    emailPassword: string;
    displayName: string;
    consent: string;
    age: string;
    emailDelivery: string;
    existingAccount: string;
    authCallback: string;
    emailConfirmedLoginRequired: string;
    authProviderSetup: string;
  };
  successSignIn: string;
  successSignUp: string;
  confirmationSent: string;
  resetSent: string;
};

type StaticCopy = {
  kicker: string;
  title: string;
  body: string;
  sections: Array<{ title: string; body: string }>;
  primary: string;
  secondary: string;
};

type ReleaseCopy = {
  daily: DailyCopy;
  mobile: MobileCopy;
  login: LoginCopy;
  ar: StaticCopy;
  legal: {
    privacy: StaticCopy;
    tos: StaticCopy;
    disclaimer: StaticCopy;
  };
};

type StaticPatch = Partial<Omit<StaticCopy, 'sections'>> & { sections?: StaticCopy['sections'] };
type ReleasePatch = {
  daily?: Partial<Omit<DailyCopy, 'cards'>> & { cards?: DailyCopy['cards'] };
  mobile?: Partial<Omit<MobileCopy, 'panels'>> & { panels?: MobileCopy['panels'] };
  login?: Partial<Omit<LoginCopy, 'validation'>> & { validation?: Partial<LoginCopy['validation']> };
  ar?: StaticPatch;
  legal?: {
    privacy?: StaticPatch;
    tos?: StaticPatch;
    disclaimer?: StaticPatch;
  };
};

const en: ReleaseCopy = {
  daily: {
    kicker: 'DAILY ORACLE',
    title: 'Daily ritual center',
    body: 'Choose one daily tarot or rune reading. The result is saved in this browser for today so the ritual stays clear instead of becoming endless refreshing.',
    tarot: 'Draw daily tarot',
    runes: 'Draw daily rune',
    tarotDone: 'View tarot result',
    runesDone: 'View rune result',
    oneChoice: 'You can choose tarot or runes once per day. Come back tomorrow for a new ritual.',
    resultTitle: "Today's reading",
    resultHint: 'Use this as a simple reflection cue, not a fixed prediction.',
    loading: "Preparing today's reading...",
    error: 'The reading could not be completed. Please try again.',
    cards: [
      { title: 'Focus', body: 'Name the one thing that needs your attention today.' },
      { title: 'Boundary', body: 'Do not let every signal become your task.' },
      { title: 'Action', body: 'Choose one small action you can complete before the day ends.' },
    ],
  },
  mobile: {
    kicker: 'MOBILE COMPANION',
    title: 'A simple daily companion for self-discovery',
    body: 'The mobile experience is built for daily return: draw one card or rune, review saved readings, and move to a guide only when deeper support is needed.',
    primary: 'Start daily ritual',
    secondary: 'Explore tools',
    panels: [
      { title: 'Daily return loop', body: 'One daily choice, a daily ritual, and extended readings to keep your exploration simple and consistent.', href: '/daily', action: 'Open ritual' },
      { title: 'Self-discovery tools', body: 'Numerology, Human Design, tarot, runes, Maya, Bazi, Zi Wei, and astrology — all free to explore.', href: '/tools', action: 'Open tools' },
      { title: 'Guide handoff', body: 'Guides appear after users understand their own context, not before.', href: '/teachers', action: 'Find guidance' },
    ],
  },
  login: {
    kicker: 'ACCOUNT PORTAL',
    title: 'Log in or create your account',
    body: 'Save readings, access extended views, and prepare context before meeting a guide.',
    signIn: 'Log in',
    signUp: 'Sign up',
    email: 'Email',
    password: 'Password',
    displayName: 'Display name',
    consent: 'I agree to the privacy policy and terms.',
    age: 'I confirm I am allowed to use this service.',
    submitSignIn: 'Log in',
    submitSignUp: 'Create account',
    reset: 'Send password reset email',
    resend: 'Resend confirmation email',
    localTest: 'Use local test account',
    socialTitle: 'Social login',
    google: 'Continue with Google',
    line: 'Continue with LINE',
    disabled: 'Not enabled yet',
    validation: {
      emailPassword: 'Please enter an email and a password with at least 6 characters.',
      displayName: 'Please enter a display name.',
      consent: 'Please agree to the privacy policy and terms.',
      age: 'Please confirm age eligibility.',
      emailDelivery: 'The confirmation email could not be sent. Please try signing in, resend confirmation, or contact support while we check SMTP settings.',
      existingAccount: 'This email may already be registered. Try signing in or resend the confirmation email.',
      authCallback: 'Login callback failed. Please check the provider setup or try email login.',
      emailConfirmedLoginRequired: 'Your email may already be confirmed. Please log in with the email and password you used to sign up.',
      authProviderSetup: 'This login method is not ready yet. Please use email login for now.',
    },
    successSignIn: 'Logged in.',
    successSignUp: 'Please check your inbox to confirm your email.',
    confirmationSent: 'Confirmation email sent. Please check inbox and spam.',
    resetSent: 'Password reset email sent.',
  },
  ar: {
    kicker: 'VISUAL EXPERIENCE',
    title: 'A visual reading you can actually follow',
    body: 'Charts, cards, and key points unfold beside the reading so the experience feels alive without hiding the meaning.',
    primary: 'Try tarot',
    secondary: 'Open daily ritual',
    sections: [
      { title: 'Readable before spectacular', body: 'Every result should be easy to understand before it becomes immersive.' },
      { title: 'Tool-specific visuals', body: 'Cards, runes, totems, charts, and bodygraph surfaces should each feel distinct.' },
      { title: 'Built for real devices', body: 'The stage stays fast and readable across phones, tablets, and video consultations.' },
    ],
  },
  legal: {
    privacy: {
      kicker: 'PRIVACY',
      title: 'Privacy and data use',
      body: 'MELE stores only the information needed for accounts, readings, member records, guide bookings, and service safety.',
      primary: 'Open account',
      secondary: 'Back home',
      sections: [
        { title: 'Account data', body: 'Email, profile, birth data, and consent records support login and reading features.' },
        { title: 'Reading data', body: 'Saved readings and extended views help members review their own archive.' },
        { title: 'Control', body: 'Members can request data export, correction, or deletion through the account privacy page.' },
      ],
    },
    tos: {
      kicker: 'TERMS',
      title: 'Service terms',
      body: 'MELE is a self-discovery and guidance platform. Readings are reflective tools and are not medical, legal, financial, or emergency advice.',
      primary: 'Explore tools',
      secondary: 'Back home',
      sections: [
        { title: 'Use respectfully', body: 'Do not misuse the platform, scrape private data, or impersonate another person.' },
        { title: 'Ongoing improvements', body: 'Some features may continue to evolve as the platform grows.' },
        { title: 'Guide services', body: 'Guide sessions should be handled with clear scope, consent, and respectful communication.' },
      ],
    },
    disclaimer: {
      kicker: 'DISCLAIMER',
      title: 'Reflection, not certainty',
      body: 'MELE readings help users organize thoughts and notice choices. They should not be treated as guaranteed predictions.',
      primary: 'Start exploring free',
      secondary: 'Find guidance',
      sections: [
        { title: 'No professional replacement', body: 'Readings do not replace professional medical, legal, financial, or psychological support.' },
        { title: 'Personal agency', body: 'Users remain responsible for decisions made after reading the content.' },
        { title: 'Emergency situations', body: 'For urgent safety or health matters, contact local emergency or professional services.' },
      ],
    },
  },
};

const zh: ReleaseCopy = {
  daily: {
    kicker: '每日神諭',
    title: '每日儀式中心',
    body: '每天只選一次塔羅或盧恩。結果會保存在此瀏覽器中，讓儀式回到觀照，而不是反覆重抽。',
    tarot: '抽今日塔羅',
    runes: '抽今日盧恩',
    tarotDone: '查看塔羅結果',
    runesDone: '查看盧恩結果',
    oneChoice: '每日可在塔羅與盧恩之間擇一，明日再開新局。',
    resultTitle: '今日提示',
    resultHint: '把它當成整理心念的提示，不必視為固定預言。',
    loading: '正在準備今日提示...',
    error: '今日提示未能完成，請稍後再試。',
    cards: [
      { title: '定心', body: '先說出今日最需要被看見的一件事。' },
      { title: '界線', body: '不是每個訊號都需要立刻變成你的任務。' },
      { title: '行動', body: '選一個今日結束前可以完成的小步驟。' },
    ],
  },
  mobile: {
    kicker: '手機版',
    title: '把自我理解放進每日節奏',
    body: '手機版為日常回訪而設計：每日抽牌、保存紀錄、完成每日儀式，當需要更深支持時再交給老師。',
    primary: '開始每日儀式',
    secondary: '查看全部工具',
    panels: [
      { title: '每日回訪', body: '每日一次選擇、完成儀式、查看延伸解讀，讓探索節奏簡單可持續。', href: '/daily', action: '開啟儀式' },
      { title: '多元工具', body: '生命靈數、人類圖、塔羅、盧恩、瑪雅、八字、紫微與占星，都可先做初階理解。', href: '/tools', action: '查看工具' },
      { title: '老師銜接', body: '老師媒合應該出現在使用者理解自己之後，協助他把問題帶進諮詢。', href: '/teachers', action: '尋找老師' },
    ],
  },
  login: {
    kicker: '會員入口',
    title: '登入或建立帳號',
    body: '保存解讀、查看延伸內容，也能在諮詢前整理好自己的問題與命盤脈絡。',
    signIn: '登入',
    signUp: '註冊',
    email: 'Email',
    password: '密碼',
    displayName: '顯示名稱',
    consent: '我同意隱私權政策與服務條款。',
    age: '我確認自己符合使用本服務的年齡與所在地規範。',
    submitSignIn: '登入',
    submitSignUp: '建立帳號',
    reset: '寄送密碼重設信',
    resend: '重寄認證信',
    localTest: '使用本機測試帳號',
    socialTitle: '社群登入',
    google: '使用 Google 繼續',
    line: '使用 LINE 繼續',
    disabled: '尚未啟用',
    validation: {
      emailPassword: '請輸入 Email，且密碼至少 6 個字元。',
      displayName: '請輸入顯示名稱。',
      consent: '請先同意隱私權政策與服務條款。',
      age: '請確認使用資格。',
      emailDelivery: '驗證信目前寄送失敗。請先確認是否已註冊，或稍後重寄驗證信；我們正在檢查 SMTP 寄信設定。',
      existingAccount: '這個 Email 可能已經註冊過。請改用登入，或按「重寄認證信」。',
      authCallback: '登入回跳失敗，請確認 Google / LINE 或 Supabase Redirect URL 設定。',
      emailConfirmedLoginRequired: 'Email 可能已完成驗證，但這個瀏覽器沒有原本的註冊登入狀態。請直接用剛才註冊的 Email 與密碼登入。',
      authProviderSetup: '這個登入方式尚未完整啟用，請先使用 Email 登入。',
    },
    successSignIn: '已登入。',
    successSignUp: '請到信箱收取認證信。',
    confirmationSent: '已寄出認證信，請檢查收件匣與垃圾信件。',
    resetSent: '已寄出密碼重設信。',
  },
  ar: {
    kicker: '視覺體驗',
    title: '看得懂，也有揭曉感的動態解盤',
    body: '盤面、牌卡與重點會跟著閱讀順序展開；不用安裝 App，也不必等待大型模型載入。',
    primary: '試抽塔羅',
    secondary: '開啟每日儀式',
    sections: [
      { title: '先看懂，再驚豔', body: '每個結果都要先能被理解，再談沉浸效果。' },
      { title: '各工具獨立視覺', body: '牌卡、盧恩、圖騰、命盤與人類圖，都應有自己的 2D 呈現。' },
      { title: '適合真實裝置', body: '手機、平板與視訊諮詢都能穩定呈現，不用依賴高效能 3D。' },
    ],
  },
  legal: {
    privacy: {
      kicker: '隱私權',
      title: '隱私與資料使用',
      body: 'MELE 只保存帳號、解讀、會員紀錄、老師預約與服務安全所需資料。',
      primary: '前往帳號',
      secondary: '回首頁',
      sections: [
        { title: '帳號資料', body: 'Email、個人資料、出生資料與同意紀錄，用於登入與解讀功能。' },
        { title: '解讀資料', body: '保存的解讀與延伸內容紀錄，協助會員回看自己的探索歷程。' },
        { title: '資料控制', body: '會員可在帳號隱私頁要求匯出、更正或刪除資料。' },
      ],
    },
    tos: {
      kicker: '服務條款',
      title: '服務使用條款',
      body: 'MELE 是自我探索與引導平台，解讀內容用於整理思緒，不構成醫療、法律、財務或緊急建議。',
      primary: '查看工具',
      secondary: '回首頁',
      sections: [
        { title: '尊重使用', body: '請勿濫用平台、擷取私人資料，或冒用他人身分。' },
        { title: '持續優化', body: '平台上線後，部分功能與內容仍會持續調整改善。' },
        { title: '老師服務', body: '老師諮詢需維持清楚範圍、同意與尊重溝通。' },
      ],
    },
    disclaimer: {
      kicker: '免責聲明',
      title: '這是映照，不是定論',
      body: 'MELE 的解讀協助使用者整理狀態與看見選擇，不應被視為必然預言。',
      primary: '開始免費探索',
      secondary: '尋找老師',
      sections: [
        { title: '不取代專業', body: '解讀不可取代醫療、法律、財務或心理專業協助。' },
        { title: '保有選擇權', body: '使用者仍需為自己的判斷與行動負責。' },
        { title: '緊急情況', body: '若涉及安全或健康急迫狀況，請聯絡所在地緊急服務或專業人員。' },
      ],
    },
  },
};

function withCopy(base: ReleaseCopy, patch: ReleasePatch): ReleaseCopy {
  return {
    daily: {
      ...base.daily,
      ...patch.daily,
      cards: patch.daily?.cards ?? base.daily.cards,
    },
    mobile: {
      ...base.mobile,
      ...patch.mobile,
      panels: patch.mobile?.panels ?? base.mobile.panels,
    },
    login: {
      ...base.login,
      ...patch.login,
      validation: {
        ...base.login.validation,
        ...patch.login?.validation,
      },
    },
    ar: {
      ...base.ar,
      ...patch.ar,
      sections: patch.ar?.sections ?? base.ar.sections,
    },
    legal: {
      privacy: {
        ...base.legal.privacy,
        ...patch.legal?.privacy,
        sections: patch.legal?.privacy?.sections ?? base.legal.privacy.sections,
      },
      tos: {
        ...base.legal.tos,
        ...patch.legal?.tos,
        sections: patch.legal?.tos?.sections ?? base.legal.tos.sections,
      },
      disclaimer: {
        ...base.legal.disclaimer,
        ...patch.legal?.disclaimer,
        sections: patch.legal?.disclaimer?.sections ?? base.legal.disclaimer.sections,
      },
    },
  };
}

const releaseCopy: Record<Locale, ReleaseCopy> = {
  'zh-TW': zh,
  en,
  vi: withCopy(en, {
    daily: {
      kicker: 'THÔNG ĐIỆP HẰNG NGÀY',
      title: 'Trung tâm nghi thức mỗi ngày',
      body: 'Mỗi ngày chọn một lá tarot hoặc một rune. Kết quả được lưu trong trình duyệt để bạn quan sát rõ hơn thay vì rút lại liên tục.',
      tarot: 'Rút tarot hôm nay',
      runes: 'Rút rune hôm nay',
      tarotDone: 'Xem kết quả tarot',
      runesDone: 'Xem kết quả rune',
      oneChoice: 'Mỗi ngày chỉ chọn tarot hoặc rune một lần. Ngày mai hãy quay lại cho nghi thức mới.',
      resultTitle: 'Gợi ý hôm nay',
      loading: 'Đang chuẩn bị gợi ý hôm nay...',
    },
    mobile: {
      kicker: 'PHIÊN BẢN DI ĐỘNG',
      title: 'Một người bạn đồng hành mỗi ngày',
      body: 'Trải nghiệm di động giúp người dùng quay lại, rút bài hoặc rune, xem lại kết quả đã lưu và tìm chuyên gia khi cần hỗ trợ sâu hơn.',
      primary: 'Bắt đầu nghi thức',
      secondary: 'Khám phá công cụ',
    },
    login: {
      kicker: 'TÀI KHOẢN',
      title: 'Đăng nhập hoặc tạo tài khoản',
      body: 'Lưu kết quả, xem nội dung mở rộng và chuẩn bị bối cảnh trước khi gặp chuyên gia.',
      signIn: 'Đăng nhập',
      signUp: 'Đăng ký',
      displayName: 'Tên hiển thị',
      password: 'Mật khẩu',
      submitSignIn: 'Đăng nhập',
      submitSignUp: 'Tạo tài khoản',
      reset: 'Gửi email đặt lại mật khẩu',
      resend: 'Gửi lại email xác nhận',
      localTest: 'Dùng tài khoản thử nghiệm',
      socialTitle: 'Đăng nhập mạng xã hội',
      disabled: 'Chưa bật',
    },
    ar: {
      kicker: 'TRẢI NGHIỆM HÌNH ẢNH',
      title: 'Ưu tiên kết quả 2D rõ ràng',
      body: 'Biểu đồ, lá bài và điểm chính mở theo trình tự đọc, nhanh và rõ trên thiết bị thật.',
      primary: 'Thử tarot',
      secondary: 'Mở nghi thức ngày',
    },
    legal: {
      privacy: { kicker: 'QUYỀN RIÊNG TƯ', title: 'Quyền riêng tư và dữ liệu', secondary: 'Về trang chủ' },
      tos: { kicker: 'ĐIỀU KHOẢN', title: 'Điều khoản dịch vụ', secondary: 'Về trang chủ' },
      disclaimer: { kicker: 'TUYÊN BỐ', title: 'Phản chiếu, không phải định mệnh', secondary: 'Tìm chuyên gia' },
    },
  }),
  id: withCopy(en, {
    daily: {
      kicker: 'ORAKEL HARIAN',
      title: 'Pusat ritual harian',
      body: 'Pilih satu tarot atau rune setiap hari. Hasilnya disimpan di browser agar ritual tetap jernih, bukan sekadar mengulang undian.',
      tarot: 'Tarik tarot hari ini',
      runes: 'Tarik rune hari ini',
      tarotDone: 'Lihat hasil tarot',
      runesDone: 'Lihat hasil rune',
      oneChoice: 'Setiap hari hanya bisa memilih tarot atau rune satu kali. Kembali besok untuk ritual baru.',
      resultTitle: 'Petunjuk hari ini',
      loading: 'Menyiapkan petunjuk hari ini...',
    },
    mobile: {
      kicker: 'PENDAMPING MOBILE',
      title: 'Pendamping harian untuk mengenal diri',
      body: 'Pengalaman mobile membantu pengguna kembali setiap hari, menarik kartu atau rune, meninjau hasil, dan mencari pembimbing saat perlu dukungan lebih dalam.',
      primary: 'Mulai ritual harian',
      secondary: 'Jelajahi alat',
    },
    login: {
      kicker: 'PORTAL AKUN',
      title: 'Masuk atau buat akun',
      body: 'Simpan bacaan, akses tampilan mendalam, dan siapkan konteks sebelum bertemu pembimbing.',
      signIn: 'Masuk',
      signUp: 'Daftar',
      displayName: 'Nama tampilan',
      password: 'Kata sandi',
      submitSignIn: 'Masuk',
      submitSignUp: 'Buat akun',
      reset: 'Kirim email reset kata sandi',
      resend: 'Kirim ulang email konfirmasi',
      localTest: 'Gunakan akun uji lokal',
      socialTitle: 'Login sosial',
      disabled: 'Belum aktif',
    },
    ar: {
      kicker: 'PENGALAMAN VISUAL',
      title: 'Mulai dari tampilan 2D yang stabil',
      body: 'Diagram, kartu, dan poin utama terbuka mengikuti alur bacaan, cepat dan jelas di perangkat nyata.',
      primary: 'Coba tarot',
      secondary: 'Buka ritual harian',
    },
    legal: {
      privacy: { kicker: 'PRIVASI', title: 'Privasi dan penggunaan data', secondary: 'Kembali' },
      tos: { kicker: 'SYARAT', title: 'Syarat layanan', secondary: 'Kembali' },
      disclaimer: { kicker: 'PENAFIAN', title: 'Refleksi, bukan kepastian', secondary: 'Cari pembimbing' },
    },
  }),
  ja: withCopy(en, {
    daily: {
      kicker: '毎日のオラクル',
      title: 'デイリー儀式センター',
      body: '毎日タロットかルーンを一度だけ選びます。結果はこのブラウザに保存され、何度も引き直すより観察に戻れます。',
      tarot: '今日のタロットを引く',
      runes: '今日のルーンを引く',
      tarotDone: 'タロット結果を見る',
      runesDone: 'ルーン結果を見る',
      oneChoice: '一日に選べるのはタロットかルーンのどちらか一回です。明日また新しい儀式へ。',
      resultTitle: '今日の示唆',
      loading: '今日の示唆を準備しています...',
    },
    mobile: {
      kicker: 'モバイル版',
      title: '自己理解のための毎日の伴走',
      body: 'モバイル体験では、毎日の一枚、保存した結果の確認、必要な時だけガイドにつながる流れを整えます。',
      primary: '毎日の儀式を始める',
      secondary: 'ツールを見る',
    },
    login: {
      kicker: 'アカウント',
      title: 'ログインまたはベータ登録',
      body: '結果を保存し、詳細な表示を確認し、ガイド相談前に文脈を整えます。',
      signIn: 'ログイン',
      signUp: '登録',
      displayName: '表示名',
      password: 'パスワード',
      submitSignIn: 'ログイン',
      submitSignUp: 'アカウント作成',
      reset: 'パスワード再設定メール',
      resend: '確認メールを再送',
      localTest: 'ローカルテストアカウントを使う',
      socialTitle: 'ソーシャルログイン',
      disabled: '未設定',
    },
    ar: {
      kicker: 'ビジュアル体験',
      title: '安定した2D結果を優先',
      body: 'チャート、カード、要点が読む順番に展開し、実際の端末でも速く明確に表示されます。',
      primary: 'タロットを試す',
      secondary: '毎日の儀式へ',
    },
    legal: {
      privacy: { kicker: 'プライバシー', title: 'プライバシーとデータ利用', secondary: 'ホームへ' },
      tos: { kicker: '規約', title: 'サービス利用規約', secondary: 'ホームへ' },
      disclaimer: { kicker: '免責', title: '内省であり、断定ではありません', secondary: 'ガイドを探す' },
    },
  }),
  ko: withCopy(en, {
    daily: {
      kicker: '데일리 오라클',
      title: '매일 의식 센터',
      body: '하루에 타로 또는 룬 하나만 선택합니다. 결과는 이 브라우저에 저장되어 반복 뽑기보다 관찰에 집중하게 합니다.',
      tarot: '오늘의 타로 뽑기',
      runes: '오늘의 룬 뽑기',
      tarotDone: '타로 결과 보기',
      runesDone: '룬 결과 보기',
      oneChoice: '하루에 타로 또는 룬 중 하나만 선택할 수 있습니다. 내일 새 의식으로 돌아오세요.',
      resultTitle: '오늘의 메시지',
      loading: '오늘의 메시지를 준비하는 중...',
    },
    mobile: {
      kicker: '모바일 동반자',
      title: '자기 이해를 위한 매일의 동반자',
      body: '모바일 경험은 매일 돌아와 한 장을 뽑고, 저장된 해석을 확인하며, 더 깊은 도움이 필요할 때 가이드와 연결되도록 돕습니다.',
      primary: '매일 의식 시작',
      secondary: '도구 둘러보기',
    },
    login: {
      kicker: '계정 포털',
      title: '로그인 또는 베타 계정 만들기',
      body: '해석을 저장하고, 심층 보기를 열고, 가이드 상담 전 맥락을 준비하세요.',
      signIn: '로그인',
      signUp: '가입',
      displayName: '표시 이름',
      password: '비밀번호',
      submitSignIn: '로그인',
      submitSignUp: '계정 만들기',
      reset: '비밀번호 재설정 메일 보내기',
      resend: '확인 메일 다시 보내기',
      localTest: '로컬 테스트 계정 사용',
      socialTitle: '소셜 로그인',
      disabled: '아직 활성화되지 않음',
    },
    ar: {
      kicker: '비주얼 경험',
      title: '안정적인 2D 결과를 먼저',
      body: '차트, 카드, 핵심 내용이 읽는 순서대로 펼쳐지고 실제 기기에서도 빠르고 선명하게 보여요.',
      primary: '타로 체험',
      secondary: '매일 의식 열기',
    },
    legal: {
      privacy: { kicker: '개인정보', title: '개인정보와 데이터 사용', secondary: '홈으로' },
      tos: { kicker: '약관', title: '서비스 약관', secondary: '홈으로' },
      disclaimer: { kicker: '면책', title: '성찰이지 확정은 아닙니다', secondary: '가이드 찾기' },
    },
  }),
};

export function getReleasePageCopy(locale: Locale): ReleaseCopy {
  return releaseCopy[locale] ?? releaseCopy[DEFAULT_LOCALE];
}
