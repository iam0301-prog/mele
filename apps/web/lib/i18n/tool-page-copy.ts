import { DEFAULT_LOCALE, type Locale } from './config';

export type ToolPageSlug =
  | 'numerology'
  | 'maya'
  | 'bazi'
  | 'ziwei'
  | 'tarot'
  | 'runes'
  | 'astro'
  | 'humandesign';

export type Choice = {
  value: string;
  label: string;
  desc?: string;
  count?: number;
};

export type ToolPageCopy = {
  title: string;
  subtitle: string;
  description: string;
  spec: string;
  dateHint?: string;
  unknownTimeHint?: string;
  validation: {
    dateRequired?: string;
    dateTimeRequired?: string;
    questionRequired?: string;
  };
  submit: {
    idle: string;
    loading: string;
    demo?: string;
  };
  loadingLabel: string;
  autofillFields?: string[];
  question?: {
    label: string;
    placeholder: string;
    hint: string;
    resultLabel: string;
  };
  spreadLabel?: string;
  spreads?: Choice[];
  reversedLabel?: string;
  styleLabel?: string;
  tarotStyles?: Choice[];
  materialLabel?: string;
  materials?: Choice[];
  birth?: {
    dateLabel?: string;
    timeLabel?: string;
    genderLabel?: string;
    female?: string;
    male?: string;
    trueSolarLabel?: string;
    locationNote?: string;
  };
  visualNote?: {
    kicker: string;
    title: string;
    body: string;
    action: string;
  };
};

type ToolLocaleCopy = {
  shell: {
    backLabel: string;
    eyebrow: string;
  };
  consult: {
    title: string;
    body: string;
    action: string;
  };
  autofill: {
    icon: string;
    fallbackFields: string;
    text: string;
    action: string;
  };
  feedback: {
    loadingKicker: string;
    loadingBody: string;
    errorTitle: string;
    errorHint: string;
  };
  tools: Record<ToolPageSlug, ToolPageCopy>;
};

const zhTools: Record<ToolPageSlug, ToolPageCopy> = {
  numerology: {
    title: '生命靈數',
    subtitle: 'LIFE PATH NUMBER',
    description: '用出生日期計算生命靈數、生日數與主數 11 / 22 / 33，快速看見你的天賦傾向、人生課題與行動風格。',
    spec: '生命靈數',
    dateHint: '生命靈數只需要出生日期，不需要出生時間。',
    validation: { dateRequired: '請先選擇出生日期。' },
    submit: { idle: '開始解讀', loading: '計算中...' },
    loadingLabel: '正在計算生命靈數...',
    autofillFields: ['出生日期'],
  },
  maya: {
    title: '馬雅曆 Kin',
    subtitle: 'MAYAN TZOLKIN',
    description: '以 260 天 Tzolkin 與 Dreamspell 系統計算你的 Kin、調性、圖騰與五方力量，協助理解天賦節奏與每日能量。',
    spec: '馬雅曆',
    dateHint: '馬雅 Kin 會依出生日期換算，不需要出生時間。',
    validation: { dateRequired: '請先選擇出生日期。' },
    submit: { idle: '查詢 Kin', loading: '計算 Kin 中...' },
    loadingLabel: '正在整理你的馬雅 Kin 與圖騰...',
  },
  bazi: {
    title: '八字排盤',
    subtitle: '四柱、五行與十神',
    description: '依出生年月日時排出年柱、月柱、日柱、時柱，並整理五行分布、日主與十神脈絡，適合看性格底色與人生運勢結構。',
    spec: '八字',
    unknownTimeHint: '八字對出生時辰敏感。若暫時不知道精準時間，可以先用 12:00 試排，但正式解讀建議確認出生證明或戶籍資料。',
    validation: { dateTimeRequired: '請先填寫出生日期與時間。' },
    submit: { idle: '排出八字', loading: '正在排八字...' },
    loadingLabel: '正在排出四柱、五行與十神...',
    autofillFields: ['出生日期', '出生時間', '出生地'],
    birth: { trueSolarLabel: '使用真太陽時校正' },
  },
  ziwei: {
    title: '紫微斗數',
    subtitle: 'ZIWEI DOUSHU',
    description: '依出生年月日時排出十二宮、主星與命宮結構，適合觀察人生主軸、事業、人際、感情與長期運勢配置。',
    spec: '紫微斗數',
    unknownTimeHint: '紫微斗數會依出生時辰安命宮與排星曜。若暫時不知道精準時間，可以先用 12:00 試排，但正式解讀建議確認出生時間。',
    validation: { dateTimeRequired: '請先填寫出生日期與時間。' },
    submit: { idle: '開始排盤', loading: '排盤中...' },
    loadingLabel: '正在排出紫微命盤與主星...',
    autofillFields: ['出生日期', '出生時間', '性別'],
    birth: { genderLabel: '性別', female: '女', male: '男' },
  },
  tarot: {
    title: '塔羅牌解讀',
    subtitle: '三種藝術風格與 AR 牌面',
    description: '輸入清楚的問題，選擇你喜歡的牌組風格與牌陣。結果會呈現牌義、位置、正逆位與 AR 卡面資訊。',
    spec: '塔羅',
    validation: { questionRequired: '請先輸入想詢問的問題。' },
    submit: { idle: '開始抽牌', loading: '正在抽牌...' },
    loadingLabel: '正在洗牌並整理牌面訊息...',
    question: {
      label: '想詢問的問題 *',
      placeholder: '例如：我目前的感情狀態，需要看見什麼？',
      hint: '問題越具體，解讀越容易聚焦。建議一次只問一個主題。',
      resultLabel: '你的問題',
    },
    styleLabel: '牌組風格',
    tarotStyles: [
      { value: 'forest_athena', label: '森林女神', desc: '柔和、療癒、帶有森林與女神意象。' },
      { value: 'ocean_poseidon', label: '海神星辰', desc: '深海、星光、帶有流動與直覺感。' },
      { value: 'ancient_pharaoh', label: '古埃及法老', desc: '金色、神殿、帶有命運與儀式感。' },
    ],
    spreadLabel: '牌陣',
    spreads: [
      { value: 'three_card', label: '三張牌：過去 / 現在 / 未來', count: 3 },
      { value: 'celtic', label: '凱爾特十字：完整議題脈絡', count: 10 },
      { value: 'horseshoe', label: '馬蹄牌陣：局勢與建議', count: 7 },
      { value: 'single', label: '單張牌：今日提醒', count: 1 },
    ],
    reversedLabel: '啟用逆位',
  },
  runes: {
    title: '盧恩符文解讀',
    subtitle: '三種材質與 AR 石面',
    description: '盧恩適合詢問行動方向、阻礙、資源與內在訊息。選擇石面、木頭或水晶材質後，結果會以符文石與 AR 形式呈現。',
    spec: '盧恩',
    validation: { questionRequired: '請先輸入想詢問的問題。' },
    submit: { idle: '開始抽符文', loading: '正在抽取符文...' },
    loadingLabel: '正在抽取符文並整理訊息...',
    question: {
      label: '想詢問的問題 *',
      placeholder: '例如：今天我最需要留意的行動提醒是什麼？',
      hint: '盧恩適合看當下局勢與行動提醒，問題保持簡潔會更清楚。',
      resultLabel: '你的問題',
    },
    materialLabel: '盧恩材質',
    materials: [
      { value: 'stone', label: '石面', desc: '穩定、厚實，適合看阻礙與現實課題。' },
      { value: 'wood', label: '木頭', desc: '溫暖、自然，適合看成長與關係流動。' },
      { value: 'crystal', label: '水晶', desc: '清透、敏銳，適合看直覺與能量提醒。' },
    ],
    spreadLabel: '符文數量',
    spreads: [
      { value: 'single', label: '單符文：今日提醒', count: 1 },
      { value: 'three', label: '三符文：過去 / 現在 / 未來', count: 3 },
      { value: 'five', label: '五符文：問題、阻礙、資源、建議、結果', count: 5 },
    ],
    reversedLabel: '啟用逆位',
  },
  astro: {
    title: '西洋占星命盤',
    subtitle: 'NATAL CHART',
    description: '以出生時間與地點計算太陽、月亮、上升、行星宮位與主要相位，協助理解性格核心、情緒模式與生命發展方向。',
    spec: '占星',
    unknownTimeHint: '占星命盤的上升與宮位非常依賴出生時間。若不確定，可先用 12:00 查看行星星座，正式諮詢前建議再確認時間。',
    validation: { dateTimeRequired: '請先填寫出生日期與時間。' },
    submit: { idle: '開始排盤', loading: '正在繪製命盤...' },
    loadingLabel: '正在計算星體位置與宮位...',
    autofillFields: ['出生日期', '出生時間', '出生地'],
    birth: { locationNote: '可先使用預設城市；若要更精準，可用 Google Maps 查詢經緯度後填入。' },
  },
  humandesign: {
    title: '人類圖',
    subtitle: 'BodyGraph、類型、權威、人生角色與啟動閘門',
    description: '輸入出生日期與時間後，系統會計算你的人類圖 BodyGraph，整理類型、內在權威、人生角色、中心、通道與啟動閘門。',
    spec: '人類圖',
    unknownTimeHint: '人類圖非常依賴出生時間。如果不知道準確時間，可以先用 12:00 測試，但正式解讀建議回頭校正時間。',
    validation: { dateTimeRequired: '請先填寫出生日期與時間；不知道時間時可先用 12:00 測試。' },
    submit: { idle: '產生人類圖', loading: '正在產生人類圖...', demo: '填入測試資料' },
    loadingLabel: '正在計算 BodyGraph、中心與閘門...',
    autofillFields: ['出生日期', '出生時間'],
    visualNote: {
      kicker: '視覺展示',
      title: '目前先採用穩定 2D BodyGraph',
      body: '人類圖先以清楚可讀的 2D BodyGraph 呈現中心、通道與啟動閘門；正式 AR / 3D 模型完成後再開放。',
      action: '前往視覺展示',
    },
  },
};

const enTools: Record<ToolPageSlug, ToolPageCopy> = {
  numerology: {
    title: 'Numerology',
    subtitle: 'LIFE PATH NUMBER',
    description: 'Calculate your life path, birthday number, and master numbers 11 / 22 / 33 from your birth date.',
    spec: 'Numerology',
    dateHint: 'Numerology only needs your birth date.',
    validation: { dateRequired: 'Please choose your birth date first.' },
    submit: { idle: 'Start reading', loading: 'Calculating...' },
    loadingLabel: 'Calculating your numerology map...',
    autofillFields: ['Birth date'],
  },
  maya: {
    title: 'Maya Calendar Kin',
    subtitle: 'MAYAN TZOLKIN',
    description: 'Use the 260-day Tzolkin and Dreamspell system to calculate your Kin, tone, seal, and oracle relationships.',
    spec: 'Maya Calendar',
    dateHint: 'Maya Kin is calculated from your birth date only.',
    validation: { dateRequired: 'Please choose your birth date first.' },
    submit: { idle: 'Find my Kin', loading: 'Calculating Kin...' },
    loadingLabel: 'Preparing your Maya Kin and oracle board...',
  },
  bazi: {
    title: 'Bazi Chart',
    subtitle: 'FOUR PILLARS, FIVE ELEMENTS, TEN GODS',
    description: 'Build your four pillars from birth date and time, then read the five-element structure and day-master pattern.',
    spec: 'Bazi',
    unknownTimeHint: 'Bazi is sensitive to birth time. Use 12:00 for a first test, then confirm the exact time for a formal reading.',
    validation: { dateTimeRequired: 'Please enter both birth date and time.' },
    submit: { idle: 'Generate Bazi', loading: 'Generating Bazi...' },
    loadingLabel: 'Building your four pillars and element map...',
    autofillFields: ['Birth date', 'Birth time', 'Birth place'],
    birth: { trueSolarLabel: 'Use true solar time correction' },
  },
  ziwei: {
    title: 'Zi Wei Dou Shu',
    subtitle: 'TWELVE PALACES AND MAIN STARS',
    description: 'Generate a Zi Wei chart to review life focus, career, relationships, emotion, and long-term patterns.',
    spec: 'Zi Wei Dou Shu',
    unknownTimeHint: 'Zi Wei depends on the birth hour. Use 12:00 for a first test, then confirm the exact birth time.',
    validation: { dateTimeRequired: 'Please enter both birth date and time.' },
    submit: { idle: 'Generate chart', loading: 'Generating chart...' },
    loadingLabel: 'Arranging the palaces and main stars...',
    autofillFields: ['Birth date', 'Birth time', 'Gender'],
    birth: { genderLabel: 'Gender', female: 'Female', male: 'Male' },
  },
  tarot: {
    title: 'Tarot Reading',
    subtitle: 'THREE ART STYLES AND VISUAL CARDS',
    description: 'Ask a clear question, choose a deck style and spread, then receive positions, upright/reversed states, and card meanings.',
    spec: 'Tarot',
    validation: { questionRequired: 'Please enter a question first.' },
    submit: { idle: 'Draw cards', loading: 'Drawing cards...' },
    loadingLabel: 'Shuffling and arranging your cards...',
    question: {
      label: 'Your question *',
      placeholder: 'Example: What should I understand about my current relationship pattern?',
      hint: 'One clear topic per reading gives the cards a sharper focus.',
      resultLabel: 'Your question',
    },
    styleLabel: 'Deck style',
    tarotStyles: [
      { value: 'forest_athena', label: 'Forest Athena', desc: 'Soft, healing, forest-goddess atmosphere.' },
      { value: 'ocean_poseidon', label: 'Ocean Poseidon', desc: 'Deep ocean, starlight, intuition and flow.' },
      { value: 'ancient_pharaoh', label: 'Ancient Pharaoh', desc: 'Gold, temples, fate and ritual presence.' },
    ],
    spreadLabel: 'Spread',
    spreads: [
      { value: 'three_card', label: 'Three cards: Past / Present / Future', count: 3 },
      { value: 'celtic', label: 'Celtic Cross: full issue map', count: 10 },
      { value: 'horseshoe', label: 'Horseshoe: situation and advice', count: 7 },
      { value: 'single', label: 'Single card: daily message', count: 1 },
    ],
    reversedLabel: 'Allow reversed cards',
  },
  runes: {
    title: 'Rune Reading',
    subtitle: 'THREE MATERIALS AND VISUAL STONES',
    description: 'Ask about action, obstacles, resources, or an inner message. Choose stone, wood, or crystal for the rune material.',
    spec: 'Runes',
    validation: { questionRequired: 'Please enter a question first.' },
    submit: { idle: 'Draw runes', loading: 'Drawing runes...' },
    loadingLabel: 'Drawing runes and preparing the message...',
    question: {
      label: 'Your question *',
      placeholder: 'Example: What action reminder do I need today?',
      hint: 'Runes work best with a concise question about the present situation.',
      resultLabel: 'Your question',
    },
    materialLabel: 'Rune material',
    materials: [
      { value: 'stone', label: 'Stone', desc: 'Grounded and steady, good for practical obstacles.' },
      { value: 'wood', label: 'Wood', desc: 'Warm and organic, good for growth and relationships.' },
      { value: 'crystal', label: 'Crystal', desc: 'Clear and sensitive, good for intuition and energy.' },
    ],
    spreadLabel: 'Rune count',
    spreads: [
      { value: 'single', label: 'Single rune: daily message', count: 1 },
      { value: 'three', label: 'Three runes: Past / Present / Future', count: 3 },
      { value: 'five', label: 'Five runes: issue, obstacle, resource, advice, outcome', count: 5 },
    ],
    reversedLabel: 'Allow reversed runes',
  },
  astro: {
    title: 'Western Astrology Chart',
    subtitle: 'NATAL CHART',
    description: 'Calculate Sun, Moon, Ascendant, houses, planets, and major aspects from birth time and location.',
    spec: 'Astrology',
    unknownTimeHint: 'Ascendant and houses depend heavily on birth time. Use 12:00 as a first test, then confirm before a formal reading.',
    validation: { dateTimeRequired: 'Please enter both birth date and time.' },
    submit: { idle: 'Generate chart', loading: 'Drawing chart...' },
    loadingLabel: 'Calculating planets, houses, and angles...',
    autofillFields: ['Birth date', 'Birth time', 'Birth place'],
    birth: { locationNote: 'Use a preset city first, or enter exact latitude and longitude for better accuracy.' },
  },
  humandesign: {
    title: 'Human Design',
    subtitle: 'BODYGRAPH, TYPE, AUTHORITY, PROFILE, AND GATES',
    description: 'Calculate your BodyGraph, type, inner authority, profile, centers, channels, and activated gates from birth data.',
    spec: 'Human Design',
    unknownTimeHint: 'Human Design is time-sensitive. Use 12:00 for a first test, then correct the birth time for a formal reading.',
    validation: { dateTimeRequired: 'Please enter birth date and time; use 12:00 if you only want to test.' },
    submit: { idle: 'Generate BodyGraph', loading: 'Generating BodyGraph...', demo: 'Use demo data' },
    loadingLabel: 'Calculating BodyGraph, centers, and gates...',
    autofillFields: ['Birth date', 'Birth time'],
    visualNote: {
      kicker: 'Visual stage',
      title: 'Stable 2D BodyGraph first',
      body: 'The Human Design experience currently uses a readable 2D BodyGraph. AR / 3D models will open after the model quality is ready.',
      action: 'Open visual stage',
    },
  },
};

const localeCopies: Record<Locale, ToolLocaleCopy> = {
  'zh-TW': {
    shell: { backLabel: '回到身心靈入口', eyebrow: '神諭工具實驗室' },
    consult: {
      title: '想讓結果變成真正可用的提醒？',
      body: '免費工具適合先看方向；若你想把結果放進感情、工作、人生選擇或長期運勢裡理解，可以帶著這份結果找老師深入解讀。',
      action: '找 {label} 老師',
    },
    autofill: {
      icon: '✓',
      fallbackFields: '常用出生資料',
      text: '已從個人資料帶入 {fields}，你仍可在本頁調整後再送出。',
      action: '編輯資料',
    },
    feedback: {
      loadingKicker: 'READING IN PROGRESS',
      loadingBody: '系統正在整理盤面與解讀素材，請稍候片刻。',
      errorTitle: '計算失敗',
      errorHint: '請稍後再試，或確認 API 服務是否正在運行。',
    },
    tools: zhTools,
  },
  en: {
    shell: { backLabel: 'Back to spiritual hub', eyebrow: 'ORACLE TOOL LAB' },
    consult: {
      title: 'Want to turn this result into usable guidance?',
      body: 'Free tools are a first map. If you want to connect the result to love, work, life choices, or timing, bring it to a teacher for a deeper reading.',
      action: 'Find a {label} teacher',
    },
    autofill: {
      icon: '✓',
      fallbackFields: 'profile data',
      text: 'We filled {fields} from your profile. You can still adjust the fields before submitting.',
      action: 'Edit profile',
    },
    feedback: {
      loadingKicker: 'READING IN PROGRESS',
      loadingBody: 'The system is preparing your chart and reading material. Please wait a moment.',
      errorTitle: 'Reading failed',
      errorHint: 'Try again later, or confirm that the API service is running.',
    },
    tools: enTools,
  },
  vi: {
    shell: { backLabel: 'Về cổng tâm linh', eyebrow: 'PHÒNG THỬ CÔNG CỤ' },
    consult: {
      title: 'Muốn biến kết quả thành lời nhắc hữu ích?',
      body: 'Công cụ miễn phí giúp bạn xem hướng ban đầu. Nếu muốn đọc sâu về tình cảm, công việc, lựa chọn sống hoặc thời vận, hãy mang kết quả này đến giáo viên.',
      action: 'Tìm giáo viên {label}',
    },
    autofill: {
      icon: '✓',
      fallbackFields: 'hồ sơ',
      text: 'Chúng tôi đã điền {fields} từ hồ sơ của bạn. Bạn vẫn có thể chỉnh trước khi gửi.',
      action: 'Sửa hồ sơ',
    },
    feedback: {
      loadingKicker: 'ĐANG GIẢI ĐỌC',
      loadingBody: 'Hệ thống đang chuẩn bị lá số và nội dung giải thích. Vui lòng chờ một chút.',
      errorTitle: 'Không thể giải đọc',
      errorHint: 'Hãy thử lại sau hoặc kiểm tra dịch vụ API.',
    },
    tools: {
      ...enTools,
      numerology: { ...enTools.numerology, title: 'Thần số học', spec: 'Thần số học', submit: { idle: 'Bắt đầu giải đọc', loading: 'Đang tính...' } },
      maya: { ...enTools.maya, title: 'Lịch Maya Kin', spec: 'Lịch Maya', submit: { idle: 'Tìm Kin của tôi', loading: 'Đang tính Kin...' } },
      bazi: { ...enTools.bazi, title: 'Lá số Bát Tự', spec: 'Bát Tự', submit: { idle: 'Lập Bát Tự', loading: 'Đang lập Bát Tự...' } },
      ziwei: { ...enTools.ziwei, title: 'Tử Vi Đẩu Số', spec: 'Tử Vi', birth: { genderLabel: 'Giới tính', female: 'Nữ', male: 'Nam' } },
      tarot: { ...enTools.tarot, title: 'Bài Tarot', spec: 'Tarot', submit: { idle: 'Rút bài', loading: 'Đang rút bài...' } },
      runes: { ...enTools.runes, title: 'Giải Rune', spec: 'Rune', submit: { idle: 'Rút Rune', loading: 'Đang rút Rune...' } },
      astro: { ...enTools.astro, title: 'Lá số chiêm tinh Tây phương', spec: 'Chiêm tinh' },
      humandesign: { ...enTools.humandesign, title: 'Human Design', spec: 'Human Design' },
    },
  },
  id: {
    shell: { backLabel: 'Kembali ke hub spiritual', eyebrow: 'LAB ALAT ORAKEL' },
    consult: {
      title: 'Ingin mengubah hasil ini menjadi panduan yang berguna?',
      body: 'Alat gratis memberi peta awal. Untuk mengaitkan hasil dengan relasi, kerja, pilihan hidup, atau waktu, bawalah ke guru untuk bacaan lebih dalam.',
      action: 'Cari guru {label}',
    },
    autofill: {
      icon: '✓',
      fallbackFields: 'profil',
      text: 'Kami mengisi {fields} dari profil Anda. Anda masih bisa mengubahnya sebelum mengirim.',
      action: 'Ubah profil',
    },
    feedback: {
      loadingKicker: 'SEDANG MEMBACA',
      loadingBody: 'Sistem sedang menyiapkan chart dan bahan pembacaan. Mohon tunggu sebentar.',
      errorTitle: 'Pembacaan gagal',
      errorHint: 'Coba lagi nanti, atau pastikan layanan API berjalan.',
    },
    tools: {
      ...enTools,
      numerology: { ...enTools.numerology, title: 'Numerologi', spec: 'Numerologi' },
      maya: { ...enTools.maya, title: 'Kalender Maya Kin', spec: 'Kalender Maya' },
      bazi: { ...enTools.bazi, title: 'Bagan Bazi', spec: 'Bazi' },
      ziwei: { ...enTools.ziwei, title: 'Zi Wei Dou Shu', spec: 'Zi Wei', birth: { genderLabel: 'Gender', female: 'Perempuan', male: 'Laki-laki' } },
      tarot: { ...enTools.tarot, title: 'Pembacaan Tarot', spec: 'Tarot' },
      runes: { ...enTools.runes, title: 'Pembacaan Rune', spec: 'Rune' },
      astro: { ...enTools.astro, title: 'Bagan Astrologi Barat', spec: 'Astrologi' },
      humandesign: { ...enTools.humandesign, title: 'Human Design', spec: 'Human Design' },
    },
  },
  ja: {
    shell: { backLabel: 'スピリチュアル入口へ戻る', eyebrow: 'オラクルツールラボ' },
    consult: {
      title: 'この結果を実用的な助言にしたいですか？',
      body: '無料ツールは最初の地図です。恋愛、仕事、人生の選択、時期読みまで深めたい場合は、この結果を先生に持っていけます。',
      action: '{label} の先生を探す',
    },
    autofill: {
      icon: '✓',
      fallbackFields: 'プロフィール',
      text: 'プロフィールから {fields} を入力しました。送信前にこのページで調整できます。',
      action: 'プロフィール編集',
    },
    feedback: {
      loadingKicker: '鑑定中',
      loadingBody: 'チャートと解説素材を準備しています。少しお待ちください。',
      errorTitle: '鑑定に失敗しました',
      errorHint: '後ほど再試行するか、API サービスを確認してください。',
    },
    tools: {
      ...enTools,
      numerology: { ...enTools.numerology, title: '数秘術', spec: '数秘術', submit: { idle: '鑑定を始める', loading: '計算中...' } },
      maya: { ...enTools.maya, title: 'マヤ暦 Kin', spec: 'マヤ暦', submit: { idle: 'Kin を調べる', loading: 'Kin を計算中...' } },
      bazi: { ...enTools.bazi, title: '四柱推命', spec: '四柱推命', submit: { idle: '命式を作成', loading: '作成中...' } },
      ziwei: { ...enTools.ziwei, title: '紫微斗数', spec: '紫微斗数', birth: { genderLabel: '性別', female: '女性', male: '男性' } },
      tarot: { ...enTools.tarot, title: 'タロット鑑定', spec: 'タロット', submit: { idle: 'カードを引く', loading: 'カードを引いています...' } },
      runes: { ...enTools.runes, title: 'ルーン鑑定', spec: 'ルーン', submit: { idle: 'ルーンを引く', loading: 'ルーンを引いています...' } },
      astro: { ...enTools.astro, title: '西洋占星術チャート', spec: '占星術' },
      humandesign: { ...enTools.humandesign, title: 'ヒューマンデザイン', spec: 'ヒューマンデザイン' },
    },
  },
  ko: {
    shell: { backLabel: '영성 허브로 돌아가기', eyebrow: '오라클 도구 실험실' },
    consult: {
      title: '이 결과를 실제 안내로 바꾸고 싶나요?',
      body: '무료 도구는 첫 지도입니다. 사랑, 일, 삶의 선택, 흐름까지 깊게 보고 싶다면 이 결과를 선생님에게 가져가세요.',
      action: '{label} 선생님 찾기',
    },
    autofill: {
      icon: '✓',
      fallbackFields: '프로필',
      text: '프로필에서 {fields} 정보를 채웠습니다. 제출 전에 이 페이지에서 수정할 수 있습니다.',
      action: '프로필 수정',
    },
    feedback: {
      loadingKicker: '리딩 진행 중',
      loadingBody: '차트와 리딩 자료를 준비하고 있습니다. 잠시만 기다려 주세요.',
      errorTitle: '리딩 실패',
      errorHint: '잠시 후 다시 시도하거나 API 서비스 상태를 확인해 주세요.',
    },
    tools: {
      ...enTools,
      numerology: { ...enTools.numerology, title: '생명수 numerology', spec: '생명수', submit: { idle: '리딩 시작', loading: '계산 중...' } },
      maya: { ...enTools.maya, title: '마야력 Kin', spec: '마야력', submit: { idle: 'Kin 찾기', loading: 'Kin 계산 중...' } },
      bazi: { ...enTools.bazi, title: '사주 팔자', spec: '사주', submit: { idle: '사주 생성', loading: '생성 중...' } },
      ziwei: { ...enTools.ziwei, title: '자미두수', spec: '자미두수', birth: { genderLabel: '성별', female: '여성', male: '남성' } },
      tarot: { ...enTools.tarot, title: '타로 리딩', spec: '타로', submit: { idle: '카드 뽑기', loading: '카드 뽑는 중...' } },
      runes: { ...enTools.runes, title: '룬 리딩', spec: '룬', submit: { idle: '룬 뽑기', loading: '룬 뽑는 중...' } },
      astro: { ...enTools.astro, title: '서양 점성술 차트', spec: '점성술' },
      humandesign: { ...enTools.humandesign, title: '휴먼 디자인', spec: '휴먼 디자인' },
    },
  },
};

export function getToolLocaleCopy(locale: Locale): ToolLocaleCopy {
  return localeCopies[locale] ?? localeCopies[DEFAULT_LOCALE];
}

export function getToolPageCopy(locale: Locale, tool: ToolPageSlug): ToolPageCopy {
  return getToolLocaleCopy(locale).tools[tool] ?? localeCopies[DEFAULT_LOCALE].tools[tool];
}
