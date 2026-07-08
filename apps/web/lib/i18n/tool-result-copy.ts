import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import type { CalcTool } from '@/lib/api';

/** 占卜結果頁所有寫死的靜態 UI 文字，抽成 i18n 結構 */
export type ToolResultCopy = {
  /** AR 視覺展示載入中區塊 */
  arLoading: {
    kicker: string;
    title: string;
    body: string;
  };

  /** 人類圖結果頁改版：第一屏重點卡 + 第二屏 BodyGraph 深底區的文字（只有人類圖用到） */
  hdPlanar: {
    factsKicker: string;
    factsTitle: string;
    factsBody: string;
    scrollHint: string;
    stageKicker: string;
    stageTitle: string;
    stageBody: string;
    legendOn: string;
    legendOff: string;
    frameLabel: string;
    frameNote: string;
    /** 身體對照層切換鈕 */
    bodyToggleGraph: string;
    bodyToggleBody: string;
    /** 中心/通道詳解卡共用文字 */
    stateDefined: string;
    stateUndefined: string;
    bodyPartLabel: string;
    closeLabel: string;
    dailyLabel: string;
    /** 通道清單區 */
    channelsTitle: string;
    channelsHint: string;
    channelsEmpty: string;
    gateLabel: string;
    circuitLabel: string;
    circuitIndividual: string;
    circuitTribal: string;
    circuitCollective: string;
    circuitDisclaimer: string;
    /** 沒有全部寫詳解的其餘通道，用這個樣板帶入閘門編號 */
    channelGenericName: string; // {gate1} / {gate2} 佔位
    channelGenericTrait: string; // {gate1} / {gate2} 佔位
    channelGenericDaily: string;
    /** 九大中心：身體部位對照＋白話卡 */
    centers: Record<
      'Head' | 'Ajna' | 'Throat' | 'G' | 'Heart' | 'Sacral' | 'SolarPlexus' | 'Spleen' | 'Root',
      { label: string; bodyPart: string; meaning: string; definedTip: string; undefinedTip: string }
    >;
    /** 常見通道完整白話（14 條），key 為 sorted "gate1-gate2" */
    channels: Record<string, { name: string; trait: string; daily: string }>;
  };

  /** MemberResonancePanel */
  resonance: {
    questionPrefix: string;
    understandPrefix: string;
  };

  /** ResultInsightPanel */
  insight: {
    memberNoteKicker: string;
    memberNoteTitle: string;
    memberNoteEmpty: string;
    memberNoteCount: string; // 含 {count} 佔位符
    cardSubtitleFallback: string;
    cardExpand: string;
    cardCollapse: string;
    cardResonate: string;
    cardResonated: string;
    expandAll: string; // 含 {count}
    collapseAll: string;
  };

  /** PersonalReadingPanel */
  personalReading: {
    thisReminder: string;
    setReminder: string;
    reminderSet: string;
  };

  /** ResultGamePanel */
  game: {
    kicker: string;
    title: string;
    plainNote: string;
    arLink: string;
    stepPrefix: string;
  };

  /** ResultNextSteps */
  nextSteps: {
    kicker: string;
    title: string;
    bookTeacher: string;
    viewHistory: string;
  };

  /** MemberActionPath */
  actionPath: {
    kicker: string;
    title: string;
    body: string;
    saveTitle: string;
    saveLabel: string;
    dailyTitle: string;
    dailyBody: string;
    dailyLabel: string;
    consultTitle: string;
    consultBody: string;
    consultLabel: string;
    footerSave: string;
    footerConsult: string;
  };

  /** PointUnlockPanel */
  unlock: {
    kicker: string;
    title: string;
    body: string;
    memberStatusLabel: string;
    memberLoggedIn: string;
    memberPending: string;
    memberGuest: string;
    guestBody: string;
    guestLogin: string;
    dailyTitle: string;
    dailyDone: string;
    dailyPending: string;
    claimBtn: string;
    claimedBtn: string;
    claimingBtn: string;
    alreadyViewed: string;
    loadingContent: string;
    viewBtn: string; // 含 {label}
    loadBtn: string;
    noticeAlreadyUnlocked: string; // 含 {label}
    noticeUnlocked: string; // 含 {label}
  };

  /** MEMBER_UNLOCK_OPTIONS 各選項的六語言文字 */
  unlockOptions: Record<
    'deep_reading' | 'transit_day' | 'transit_month' | 'transit_year',
    { label: string; title: string; body: string }
  >;

  /** 各工具的「下一步建議」（三條），六語言版本 */
  nextStepsTools: Record<CalcTool, Array<{ title: string; body: string }>>;

  /** ZiweiPlainGuide */
  ziweiGuide: {
    kicker: string;
    title: string;
    body: string;
    noMajorStar: string;
    mingGongLabel: string;
    shenGongLabel: string;
    wuxingLabel: string;
    mingGongDesc: string;
    shenGongDesc: string;
    wuxingDesc: string;
    questionRoutes: Array<{ topic: string; palace: string; body: string }>;
  };

  /** 空狀態 - 宮位無主星 */
  palaceNoStar: string;

  /** 免責聲明 */
  disclaimer: string;

  /** ToolError / ToolLoading */
  error: {
    title: string;
    apiHint: string;
  };
  loading: {
    label: string;
  };

  /** 錯誤訊息 */
  notices: {
    insufficientPoints: string;
    notAuthenticated: string;
    generic: string;
    claimSuccess: string;
    claimAlready: string;
    signInFirst: string;
  };

  /** MayaOracleBoard：五圖騰神諭盤（本命/導引/類比/對立/隱藏） */
  mayaOracle: {
    eyebrow: string;
    title: string;
    subtitle: string;
    heroLabel: string; // 「本命圖騰」
    roles: {
      self: string;
      guide: string;
      analog: string;
      antipode: string;
      occult: string;
    };
    bodies: {
      self: string;
      guide: string;
      analog: string;
      antipode: string;
      occult: string;
    };
    crosscheck: {
      dreamspell: string;
      tzolkin: string;
      haab: string;
      longCount: string;
      thirteenMoon: string;
    };
  };
};

const zhTW: ToolResultCopy = {
  arLoading: {
    kicker: 'VISUAL RESULT STAGE',
    title: '正在整理視覺結果展示',
    body: '這裡會用穩定的 2D 盤面、牌面或石面呈現結果；AR / 3D 正式版完成後再開放。',
  },
  hdPlanar: {
    factsKicker: '三秒看懂自己',
    factsTitle: '先看這幾件事，再進 BodyGraph',
    factsBody: '不用先搞懂九大能量中心和六十四道閘門，才知道自己是誰。',
    scrollHint: '往下看完整身體圖與能量中心',
    stageKicker: '深入查看',
    stageTitle: 'BodyGraph 退居第二層',
    stageBody: '完整盤面保留深色襯底的沉靜感；已定義的中心會標示出來，想深入哪裡再往下看。',
    legendOn: '已定義中心——穩定、可靠的能量來源',
    legendOff: '未定義中心——向外接收，容易被放大',
    frameLabel: 'BodyGraph',
    frameNote: '先看這張圖，不用一次看懂所有閘門',
    bodyToggleGraph: '看能量圖',
    bodyToggleBody: '對照身體部位',
    stateDefined: '已定義（穩定運作）',
    stateUndefined: '未定義（隨場合變動）',
    bodyPartLabel: '身體部位',
    closeLabel: '關閉',
    dailyLabel: '日常怎麼感受',
    channelsTitle: '你的已定義通道',
    channelsHint: '每一條發光的線都是一項穩定運作的天賦。點清單或點圖上的線，看它在說什麼。',
    channelsEmpty: '目前沒有偵測到已定義通道，代表你的能量流動方式主要由其他中心組成，不是缺陷。',
    gateLabel: '閘門',
    circuitLabel: '所屬迴路（簡化分類）',
    circuitIndividual: '個體迴路——做自己、活出獨特性',
    circuitTribal: '部落迴路——支持、資源與親密關係',
    circuitCollective: '集體迴路——分享、邏輯與經驗傳遞',
    circuitDisclaimer: '迴路分類為簡化教學版本，方便辨認線條群組，並非嚴謹學術迴路理論，僅供初學參考。',
    channelGenericName: '第 {gate1} 閘門與第 {gate2} 閘門組成的通道',
    channelGenericTrait: '第 {gate1}、{gate2} 兩個閘門穩定連結成一條通道，代表這股能量在你身上持續運作，而非偶爾出現。',
    channelGenericDaily: '留意這兩個閘門的主題什麼時候出現在你的選擇裡，那通常就是你可以信任的固定天賦。',
    centers: {
      Head: { label: '頭頂', bodyPart: '頭頂／囟門', meaning: '靈感與提問的來源，負責產生想法與疑問，不負責解答。', definedTip: '腦中冒出念頭時先別急著回答，讓問題多停留一下，答案通常在安靜之後才浮現。', undefinedTip: '容易被別人的疑問感染而過度思考。先問自己：這是我的疑問，還是別人的？' },
      Ajna: { label: '眉心', bodyPart: '眉心／前額', meaning: '負責思考、分析與下定論，是大腦的邏輯處理中心。', definedTip: '你對事情容易有固定看法，這是天賦；偶爾讓別人的角度進來透氣。', undefinedTip: '想法容易今天一個明天一個，允許自己說「我還在想」。' },
      Throat: { label: '喉嚨', bodyPart: '喉嚨', meaning: '表達與行動的出口，能量最終要通過這裡被說出來或做出來。', definedTip: '你說出口的話通常特別有份量，留意自己最容易「被聽見」的場合。', undefinedTip: '容易忍不住搶話。想講話時先深呼吸，看看是不是真的非說不可。' },
      G: { label: 'G中心', bodyPart: '胸口／心臟一帶', meaning: '身份認同、方向感與愛的中心，決定你往哪走、你是誰。', definedTip: '你對自己是誰、要往哪走通常很篤定，大方帶著這份篤定往前走。', undefinedTip: '容易因為身邊的人不同而覺得自己也不一樣，方向感浮動是正常的。' },
      Heart: { label: '心／意志', bodyPart: '胸口偏右／心臟', meaning: '意志力、自我價值與說到做到的能力，也管物質資源的驅動力。', definedTip: '你天生說到做到，小心別為了證明自己而過度承諾。', undefinedTip: '容易對自己太嚴格，其實你不需要靠證明自己來獲得價值。' },
      Sacral: { label: '薦骨', bodyPart: '下腹／薦骨', meaning: '純粹的生命動力與工作能量，用聲音回應要或不要。', definedTip: '做決定前留意肚子的直覺反應，比想法更準。', undefinedTip: '容易做超過自己負荷的事而不自覺，累了就該停。' },
      SolarPlexus: { label: '太陽神經叢', bodyPart: '胃／橫膈膜一帶', meaning: '情緒波動的中心，也是通往情緒清晰的必經之路。', definedTip: '你的真相不在當下，重大決定先睡一晚再拍板。', undefinedTip: '容易把別人的情緒吸收進來，心情忽然變化時先問這是誰的情緒。' },
      Spleen: { label: '脾臟', bodyPart: '上腹／脾臟一帶', meaning: '身體的直覺雷達，掌管恐懼、免疫與當下的安全感判斷。', definedTip: '你的直覺很準，通常一閃而過，抓住第一反應就對了。', undefinedTip: '容易因為一點風吹草動就緊張，先問這個怕是不是舊的習慣反應。' },
      Root: { label: '根部', bodyPart: '尾椎／骨盆底', meaning: '腎上腺素與壓力的引擎，推動你把事情完成的原始動力。', definedTip: '你能承受的壓力量比較大，適度緊迫感反而讓你更有效率。', undefinedTip: '容易被截止日期壓得喘不過氣，提醒自己不是所有的急都要現在處理。' },
    },
    channels: {
      '20-34': { name: '喉嚨—薦骨｜魅力之道', trait: '把身體的直覺行動力，直接轉成能被看見的表達與魅力。', daily: '想到就去做的衝動很準，但先確認薦骨真的有回應，不是頭腦在搶快。' },
      '20-57': { name: '喉嚨—脾臟｜直覺意識之道', trait: '把當下的直覺，用最快速度變成清楚的表達。', daily: '第一時間說出口的直覺判斷通常最準，別讓自己想太久才開口。' },
      '10-20': { name: '喉嚨—G中心｜覺醒之道', trait: '把「我是誰」的篤定，變成看得見的行動與存在感。', daily: '想清楚自己是誰之後直接活出來，不用等別人認可。' },
      '34-57': { name: '薦骨—脾臟｜力量之道', trait: '把生命動力和直覺結合，成為一種穩定又有存在感的力量。', daily: '身體覺得對、直覺也覺得安全時，那件事就值得全力去做。' },
      '2-14': { name: 'G中心—薦骨｜脈動之道', trait: '方向感搭配穩定的動力，一步步把資源帶到對的地方。', daily: '先確定方向對了，再讓身體的動力接手執行，不用急著一次到位。' },
      '10-34': { name: 'G中心—薦骨｜探索之道', trait: '忠於自己的信念，並用身體的動力去實踐它。', daily: '別為了配合別人而妥協核心信念，你的動力是用來活出自己認同的事。' },
      '25-51': { name: 'G中心—意志中心｜發起之道', trait: '帶著愛與衝勁去開創新局，即使會有點衝擊。', daily: '遇到需要「第一個跳下去」的時刻，你比別人更適合。' },
      '21-45': { name: '喉嚨—意志中心｜金錢線', trait: '掌控資源與物質的能力，天生適合管理與分配。', daily: '談錢、談資源分配時，你的判斷通常比想像中準，不用不好意思。' },
      '6-59': { name: '薦骨—太陽神經叢｜親密之道', trait: '用情緒的起伏去尋找真正親密、能穿越防備的連結。', daily: '想拉近關係時，先讓情緒週期沉澱，別在高點或低點硬要親近。' },
      '30-41': { name: '太陽神經叢—根部｜渴望之道', trait: '對新經驗與夢想有源源不絕的渴望，也容易有情緒張力。', daily: '渴望本身沒有錯，先讓情緒清晰，再決定要不要真的行動。' },
      '39-55': { name: '太陽神經叢—根部｜情緒表達之道', trait: '情緒起伏本身就是一種挑撥與創造的能量，會刺激旁人反應。', daily: '心情低落不代表出了問題，那可能只是情緒週期正常的一部分。' },
      '19-49': { name: '太陽神經叢—根部｜敏感需求之道', trait: '對群體的需求與情感連結特別敏感，重視被接納的感覺。', daily: '感覺被排除在外時，先確認是真實發生，還是舊的敏感在反應。' },
      '26-44': { name: '意志中心—脾臟｜投降之道', trait: '憑直覺判斷該相信誰、該把資源交給誰。', daily: '對人的第一直覺印象通常很準，別急著用邏輯說服自己相反。' },
      '37-40': { name: '意志中心—太陽神經叢｜社群之道', trait: '用情緒週期建立一個彼此支持、有歸屬感的社群或家。', daily: '重要的承諾先讓情緒沉澱過一輪，再決定要不要真的答應。' },
    },
  },
  resonance: {
    questionPrefix: '帶去問老師：',
    understandPrefix: '你可以先這樣理解',
  },
  insight: {
    memberNoteKicker: 'MEMBER NOTE',
    memberNoteTitle: '把有感的訊息收進本次解讀',
    memberNoteEmpty: '點開一張卡，留下真正有共鳴的訊息。',
    memberNoteCount: '已標記 {count} 張，預約老師時可以回頭看。',
    cardSubtitleFallback: '解讀卡片',
    cardExpand: '展開解讀',
    cardCollapse: '收起解讀',
    cardResonate: '這張有共鳴',
    cardResonated: '已加入本次筆記',
    expandAll: '展開全部 {count} 個重點',
    collapseAll: '收合重點卡片',
  },
  personalReading: {
    thisReminder: '本次提醒',
    setReminder: '設為提醒',
    reminderSet: '已設為提醒',
  },
  game: {
    kicker: 'READING MAP',
    title: '這份結果怎麼看？',
    plainNote: '不用一次讀完所有名詞。先照三步抓主軸：先看核心摘要，再看視覺盤面，最後選一個今天可以練習的提醒。',
    arLink: '看視覺盤面',
    stepPrefix: 'STEP',
  },
  nextSteps: {
    kicker: 'READING FLOW',
    title: '接下來可以這樣看',
    bookTeacher: '預約老師解讀',
    viewHistory: '查看我的解讀紀錄',
  },
  actionPath: {
    kicker: 'MEMBER ONBOARDING',
    title: '下一步很清楚，會員才會留下來',
    body: '看完結果後，先保存、再回訪、最後把有感的問題交給老師深度解讀。',
    saveTitle: '保存這次解讀',
    saveLabel: '登入並保存',
    dailyTitle: '回到每日儀式',
    dailyBody: '明天回來抽一張每日牌或盧恩，讓網站有持續陪伴感，而不是一次性工具。',
    dailyLabel: '今日儀式',
    consultTitle: '找老師深度解讀',
    consultBody: '如果某張卡或某個命盤重點很有感，可以直接帶著問題找適合的老師。',
    consultLabel: '找老師深度解讀',
    footerSave: '保存這次解讀',
    footerConsult: '找老師深度解讀',
  },
  unlock: {
    kicker: 'MEMBER EXTENDED',
    title: '延伸解讀',
    body: '登入會員後可查看深入解釋、流日、流月、流年等延伸解讀。免費工具本身就完整，延伸內容是選項。',
    memberStatusLabel: '會員狀態',
    memberLoggedIn: '已登入',
    memberPending: '...',
    memberGuest: '-',
    guestBody: '登入會員後可查看延伸解讀，每項工具的流日、流月、流年都會保存在你的會員紀錄。',
    guestLogin: '登入查看',
    dailyTitle: '每日儀式',
    dailyDone: '今天已完成每日簽到。',
    dailyPending: '完成每日儀式可開啟今日延伸解讀。',
    claimBtn: '完成每日簽到',
    claimedBtn: '今日已完成',
    claimingBtn: '處理中...',
    alreadyViewed: '已查看',
    loadingContent: '載入中...',
    viewBtn: '查看{label}',
    loadBtn: '載入內容',
    noticeAlreadyUnlocked: '{label}已經可以查看。',
    noticeUnlocked: '{label}內容已載入。',
  },
  ziweiGuide: {
    kicker: '紫微白話導讀',
    title: '先看這三件事，再進十二宮',
    body: '紫微不是一次把全部宮位背起來，而是先抓主軸，再依照你真正想問的問題看對應宮位。',
    noMajorStar: '暫無主星，需看對宮與三方四正。',
    mingGongLabel: '命宮',
    shenGongLabel: '身宮',
    wuxingLabel: '五行局',
    mingGongDesc: '命宮像人生主軸，代表你習慣怎麼面對世界，以及別人第一眼容易感受到的氣質。',
    shenGongDesc: '身宮像落地方式，表示你長大後更常用哪種方式做選擇、承擔責任與累積人生。',
    wuxingDesc: '五行局像命盤底色，幫你理解整張盤的節奏，不是吉凶判決，而是運作方式。',
    questionRoutes: [
      { topic: '感情', palace: '夫妻宮', body: '看關係模式、相處安全感與伴侶互動。' },
      { topic: '事業', palace: '官祿宮', body: '看工作風格、職涯方向與適合投入的位置。' },
      { topic: '財務', palace: '財帛宮', body: '看賺錢方式、資源流動與金錢壓力。' },
      { topic: '家庭', palace: '田宅 / 父母 / 兄弟', body: '看家族支持、居住安全感與親近關係。' },
      { topic: '外界', palace: '遷移宮', body: '看出外發展、合作機會與環境變動。' },
    ],
  },
  palaceNoStar: '暫無主星，需看對宮與三方四正。',
  disclaimer: '工具結果僅供自我探索參考，不構成任何診斷、治療、醫療或心理專業建議。若有身心不適，請尋求專業醫療或心理協助。',
  error: {
    title: '解讀失敗',
    apiHint: '請確認後端 API 正在執行，或稍後重新送出一次。',
  },
  loading: {
    label: '正在整理解讀...',
  },
  notices: {
    insufficientPoints: '目前無法查看，請明天再回來或先完成每日儀式。',
    notAuthenticated: '請先登入會員，再查看延伸內容。',
    generic: '操作暫時失敗，請稍後再試。',
    claimSuccess: '今日簽到完成，可以繼續查看延伸內容。',
    claimAlready: '今天已完成簽到，明天再回來。',
    signInFirst: '請先完成今日簽到再查看延伸內容。',
  },
  unlockOptions: {
    deep_reading: {
      label: '深入解釋',
      title: '查看本次完整解釋',
      body: '查看更完整的白話解讀：優勢、卡點、目前最該注意的地方，以及今天可以做的一個小行動。',
    },
    transit_day: {
      label: '流日',
      title: '查看今天的流日視角',
      body: '查看今天適合怎麼使用這份結果：哪裡可以前進、哪裡先不要急，避免把情緒當成答案。',
    },
    transit_month: {
      label: '流月',
      title: '查看本月流月解讀',
      body: '查看本月主題：適合累積什麼、要避開什麼消耗，以及每週可以檢查的方向。',
    },
    transit_year: {
      label: '流年',
      title: '查看今年流年解讀',
      body: '查看今年大方向：哪些事值得長期投入、哪些慣性要調整，幫你把一年拆成可走的階段。',
    },
  },
  nextStepsTools: {
    numerology: [
      { title: '先看核心數字', body: '生命靈數先看生命數、生日數與原型，再回頭理解你常用的行動模式。' },
      { title: '把數字轉成行動方向', body: '核心數字背後有具體的行為傾向——看解讀裡「今天可以做的一件事」那段，找一個今天能用的提醒。' },
      { title: '補充生活情境', body: '若要深入職涯、關係或年度主題，可以帶著結果預約老師深談。' },
    ],
    maya: [
      { title: '先看一句命中感', body: '不要先研究名詞。先看「你順的時候怎麼動、卡住時怎麼反應」那段，有刺中再往下看。' },
      { title: '再看神諭板怎麼借力', body: '本命是主軸，指引是下一步，支持是補給，挑戰是卡點，隱藏力量是低潮裡會冒出的資源。看清楚五個位置的角色分工。' },
      { title: '今天只做一個小實驗', body: '把結果轉成一個 24 小時內能做的動作：說一句話、放掉一件事、整理一個界線，觀察自己的感受與回饋。' },
    ],
    bazi: [
      { title: '先看日主與五行', body: '日主代表你站在世界中的基本質地，五行分布則看資源與壓力來源。' },
      { title: '看四柱的時間層次', body: '年柱看早期與外界、月柱看工作環境、日柱看自己與關係、時柱看後續發展——每柱都在描述不同人生場景。' },
      { title: '再看實際議題', body: '八字很適合延伸到事業節奏、關係互動與長期決策。' },
    ],
    ziwei: [
      { title: '先看命宮身宮', body: '命宮像人生主軸，身宮像實際落地方式，再搭配主星理解性格。' },
      { title: '從你真正想問的問題切入', body: '看感情就找夫妻宮，看工作就找官祿宮，看錢就找財帛宮——不要一次讀完全部，先從有感的問題切入。' },
      { title: '挑一個宮位深看', body: '不要一次讀完全部，先從事業、感情或財務其中一個問題切入。' },
    ],
    tarot: [
      { title: '先看問題與位置', body: '塔羅要先回到你問的問題，再看每張牌落在過去、現在或未來的位置。' },
      { title: '看牌面與正逆位', body: '視覺展示會顯示牌名、正逆位、關鍵字與你選的牌組風格。' },
      { title: '把答案化成行動', body: '最後整理成今天能做的一步，不要只停在觀察。' },
    ],
    runes: [
      { title: '先看符文與正逆位', body: '盧恩訊息通常直接，先看符文主題，再看它提醒的是阻礙或資源。' },
      { title: '理解符文的關鍵字', body: '每個盧恩符文有正位與逆位兩種訊息重點，把關鍵字對照今天的狀況，找最有感的那一條。' },
      { title: '留下今日行動句', body: '把結果整理成一句今天可執行的提醒，最容易養成回訪習慣。' },
    ],
    astro: [
      { title: '先看太陽月亮上升', body: '太陽看核心意志，月亮看情緒需求，上升看外在應對方式。' },
      { title: '理解三個主要星位的互動', body: '太陽、月亮、上升三個落點同時看，就能大致抓到「你想要什麼、你需要什麼、你讓人看到什麼」這三層的差距與協調。' },
      { title: '再看宮位與相位', body: '想深入解讀人生事件時，再進一步看宮位與相位互動。' },
    ],
    humandesign: [
      { title: '先看類型與權威', body: '類型決定互動方式，內在權威決定你如何做決策。' },
      { title: '看 BodyGraph 找已啟動的中心', body: '顏色塗滿的中心是你穩定的能量中心；空白的中心是你容易被外部影響的地方——先找到這個分野。' },
      { title: '挑啟動閘門深讀', body: '先從已啟動閘門挑三個最有感的主題，不需要一次讀完全部。' },
    ],
  },
  mayaOracle: {
    eyebrow: 'MAYA ORACLE',
    title: '五圖騰神諭盤',
    subtitle: '你的本命圖騰之外，還有四股力量：導引、支持、對立、隱藏。看清楚五個位置的角色分工。',
    heroLabel: '本命圖騰',
    roles: { self: '本命', guide: '導引', analog: '支持', antipode: '對立', occult: '隱藏' },
    bodies: {
      self: '你的核心主軸，日常最自然使用的能量。',
      guide: '卡住時可以借力的方向，先問下一步怎麼做比較像自己。',
      analog: '你的補給站，需要支持時先把這股力量找回來。',
      antipode: '看似對立的力量，其實是提醒你把反面能力練成熟。',
      occult: '低潮或意外裡才會浮現的暗線資源，通常在放鬆控制時出現。',
    },
    crosscheck: {
      dreamspell: 'Dreamspell',
      tzolkin: '傳統 Tzolkin',
      haab: 'Haab',
      longCount: 'Long Count',
      thirteenMoon: '13 Moon',
    },
  },
};

const en: ToolResultCopy = {
  arLoading: {
    kicker: 'VISUAL RESULT STAGE',
    title: 'Preparing the visual result stage',
    body: 'Results will appear as a clear 2D chart, card layout, or stone face. The full AR / 3D experience will open when it is ready.',
  },
  hdPlanar: {
    factsKicker: 'Know yourself in 3 seconds',
    factsTitle: 'Start with these, then explore the BodyGraph',
    factsBody: 'You do not need to understand nine centers and 64 gates before knowing who you are.',
    scrollHint: 'Scroll down for the full BodyGraph and energy centers',
    stageKicker: 'Go deeper',
    stageTitle: 'The BodyGraph moves to the second screen',
    stageBody: 'The full chart keeps its calm dark ground. Defined centers are marked — explore whichever one you want next.',
    legendOn: 'Defined center — a stable, reliable source of energy',
    legendOff: 'Undefined center — open to the outside, easily amplified',
    frameLabel: 'BodyGraph',
    frameNote: 'Start with this chart — no need to read every gate at once',
    bodyToggleGraph: 'View energy chart',
    bodyToggleBody: 'Match to body parts',
    stateDefined: 'Defined (running steadily)',
    stateUndefined: 'Undefined (shifts with context)',
    bodyPartLabel: 'Body part',
    closeLabel: 'Close',
    dailyLabel: 'How to notice it day to day',
    channelsTitle: 'Your defined channels',
    channelsHint: 'Every glowing line is a talent that runs steadily. Tap the list or a line on the chart to see what it means.',
    channelsEmpty: 'No defined channels were detected — your energy flows mainly through other centers, which is not a flaw.',
    gateLabel: 'Gates',
    circuitLabel: 'Circuit group (simplified)',
    circuitIndividual: 'Individual circuit — being yourself, living your own way',
    circuitTribal: 'Tribal circuit — support, resources, and closeness',
    circuitCollective: 'Collective circuit — sharing, logic, and passing on experience',
    circuitDisclaimer: 'Circuit grouping is a simplified teaching layer to help you tell line groups apart — not strict circuit theory, for beginner reference only.',
    channelGenericName: 'Channel of Gate {gate1} and Gate {gate2}',
    channelGenericTrait: 'Gates {gate1} and {gate2} are steadily linked into one channel, meaning this energy runs continuously in you rather than only sometimes.',
    channelGenericDaily: 'Notice when the themes of these two gates show up in your choices — that is usually a fixed talent you can trust.',
    centers: {
      Head: { label: 'Head', bodyPart: 'Top of the head / crown', meaning: 'The source of inspiration and questions — it generates ideas, not answers.', definedTip: 'When a thought pops up, do not rush to answer it. Let the question sit; the answer usually arrives after some quiet.', undefinedTip: 'You can easily catch other people’s questions and overthink them. Ask yourself: is this my question, or someone else’s?' },
      Ajna: { label: 'Ajna', bodyPart: 'Forehead / brow', meaning: 'Handles thinking, analysis, and forming conclusions — the brain’s logic center.', definedTip: 'You tend to hold fixed views, which is a gift; let other perspectives in once in a while.', undefinedTip: 'Your opinions may shift day to day. It is fine to say "I am still thinking about it."' },
      Throat: { label: 'Throat', bodyPart: 'Throat', meaning: 'The outlet for expression and action — all energy eventually passes through here to be said or done.', definedTip: 'What you say usually carries real weight. Notice which settings make you most likely to be heard.', undefinedTip: 'You may jump in and talk over others. When the urge hits, breathe first and check if it truly needs saying now.' },
      G: { label: 'G Center', bodyPart: 'Chest / around the heart', meaning: 'Identity, direction, and love — it decides where you go and who you are.', definedTip: 'You are usually clear on who you are and where you are headed — walk that certainty boldly.', undefinedTip: 'You may feel like a different person around different people. A shifting sense of direction is normal for you.' },
      Heart: { label: 'Heart / Will', bodyPart: 'Right side of the chest / heart', meaning: 'Willpower, self-worth, and following through — it also drives material resources.', definedTip: 'You naturally follow through on your word; watch for over-promising just to prove yourself.', undefinedTip: 'You may be too hard on yourself. You do not need to prove your worth to have it.' },
      Sacral: { label: 'Sacral', bodyPart: 'Lower belly / sacrum', meaning: 'Pure life force and working energy — it answers "yes" or "no" through sound.', definedTip: 'Before deciding, notice your gut’s instant reaction — it is more reliable than your thoughts.', undefinedTip: 'You may take on more than you can sustain without noticing. When you are tired, that is the signal to stop.' },
      SolarPlexus: { label: 'Solar Plexus', bodyPart: 'Stomach / diaphragm area', meaning: 'The center of emotional waves — the path to emotional clarity.', definedTip: 'Your truth is not in the present moment. Sleep on big decisions before you commit.', undefinedTip: 'You may absorb other people’s emotions as your own. When your mood shifts suddenly, ask whose feeling it really is.' },
      Spleen: { label: 'Spleen', bodyPart: 'Upper abdomen / spleen area', meaning: 'The body’s intuitive radar — governs fear, immunity, and in-the-moment safety.', definedTip: 'Your instinct is accurate and usually flashes by once — catch that first read.', undefinedTip: 'You may tense up over small disturbances. Ask first: is this fear real right now, or an old habit reacting?' },
      Root: { label: 'Root', bodyPart: 'Tailbone / pelvic floor', meaning: 'The engine of adrenaline and pressure — the raw drive that gets things done.', definedTip: 'You can handle more pressure than most; a bit of urgency actually makes you more efficient.', undefinedTip: 'Deadlines can feel suffocating. Remind yourself that not every urgent feeling needs handling right now.' },
    },
    channels: {
      '20-34': { name: 'Throat—Sacral | The Channel of Charisma', trait: 'Turns gut-level instinctive action directly into expression and charisma other people can see.', daily: 'The urge to act the moment you feel it is usually right — just confirm the sacral truly responded, not your head racing ahead.' },
      '20-57': { name: 'Throat—Spleen | The Channel of the Brainwave', trait: 'Turns in-the-moment intuition into clear expression at top speed.', daily: 'The instinctive read you voice right away is usually the most accurate — do not overthink before speaking.' },
      '10-20': { name: 'Throat—G Center | The Channel of Awakening', trait: 'Turns certainty about who you are into visible action and presence.', daily: 'Once you are clear on who you are, live it out directly — you do not need anyone’s approval first.' },
      '34-57': { name: 'Sacral—Spleen | The Channel of Power', trait: 'Combines life force with instinct into a steady, felt-presence kind of power.', daily: 'When your body feels right and your gut feels safe, that is worth committing to fully.' },
      '2-14': { name: 'G Center—Sacral | The Channel of the Beat', trait: 'Pairs a sense of direction with steady drive to bring resources where they belong, step by step.', daily: 'Get the direction right first, then let your body’s drive take over — no need to rush to the finish.' },
      '10-34': { name: 'G Center—Sacral | The Channel of Exploration', trait: 'Stays true to your own convictions and uses body-level drive to live them out.', daily: 'Do not compromise your core convictions just to fit in — your drive exists to live out what you believe.' },
      '25-51': { name: 'G Center—Heart | The Channel of Initiation', trait: 'Breaks new ground with love and drive, even when it stirs things up a little.', daily: 'When a moment calls for "someone has to go first," you are often better suited than most.' },
      '21-45': { name: 'Throat—Heart | The Money Line', trait: 'A natural ability to control and manage resources and material matters.', daily: 'When money or resource decisions come up, your judgment is usually sound — do not second-guess it out of shyness.' },
      '6-59': { name: 'Sacral—Solar Plexus | The Channel of Mating', trait: 'Uses emotional waves to find real intimacy that can move past people’s defenses.', daily: 'When you want to get closer to someone, let the emotional wave settle first — do not force closeness at a high or low point.' },
      '30-41': { name: 'Solar Plexus—Root | The Channel of Recognition', trait: 'A steady pull toward new experience and dreams, which can also bring emotional tension.', daily: 'Wanting more is not a flaw — get emotional clarity first, then decide whether to actually act.' },
      '39-55': { name: 'Solar Plexus—Root | The Channel of Emoting', trait: 'Emotional swings themselves are a provocative, creative energy that stirs reactions in others.', daily: 'A low mood does not mean something is wrong — it may just be a normal part of your emotional wave.' },
      '19-49': { name: 'Solar Plexus—Root | The Channel of Synthesis', trait: 'Especially sensitive to a group’s needs and emotional bonds — values feeling accepted.', daily: 'When you feel left out, check whether it is really happening, or an old sensitivity reacting.' },
      '26-44': { name: 'Heart—Spleen | The Channel of Surrender', trait: 'An instinctive read on who to trust and who to hand resources to.', daily: 'Your first gut impression of people is usually accurate — do not talk yourself out of it with logic.' },
      '37-40': { name: 'Heart—Solar Plexus | The Channel of Community', trait: 'Builds a mutually supportive, belonging-filled community or family through emotional cycles.', daily: 'Let an important commitment settle through one emotional cycle before you actually say yes.' },
    },
  },
  resonance: {
    questionPrefix: 'Ask your teacher: ',
    understandPrefix: 'A useful way to start',
  },
  insight: {
    memberNoteKicker: 'MEMBER NOTE',
    memberNoteTitle: 'Collect the messages that resonate',
    memberNoteEmpty: 'Open a card and mark the ones that feel true.',
    memberNoteCount: '{count} marked — come back to these when you meet your teacher.',
    cardSubtitleFallback: 'Reading card',
    cardExpand: 'Open reading',
    cardCollapse: 'Close reading',
    cardResonate: 'This resonates',
    cardResonated: 'Added to this session',
    expandAll: 'Show all {count} cards',
    collapseAll: 'Collapse cards',
  },
  personalReading: {
    thisReminder: 'Your reminder',
    setReminder: 'Set as reminder',
    reminderSet: 'Reminder set',
  },
  game: {
    kicker: 'READING MAP',
    title: 'How to read this result',
    plainNote: 'No need to read every term at once. Follow three steps: read the key summary, view the visual chart, then pick one reminder to try today.',
    arLink: 'View visual chart',
    stepPrefix: 'STEP',
  },
  nextSteps: {
    kicker: 'READING FLOW',
    title: 'What to do next',
    bookTeacher: 'Book a teacher',
    viewHistory: 'View my reading history',
  },
  actionPath: {
    kicker: 'MEMBER ONBOARDING',
    title: 'Three clear next steps',
    body: 'Save first, revisit later, then bring your most resonant question to a teacher for a deeper session.',
    saveTitle: 'Save this reading',
    saveLabel: 'Log in and save',
    dailyTitle: 'Return to daily ritual',
    dailyBody: 'Come back tomorrow for a daily card or rune so the platform stays a steady companion, not a one-time tool.',
    dailyLabel: 'Daily ritual',
    consultTitle: 'Book a deeper reading',
    consultBody: 'If a card or chart section really lands, bring that question to a teacher for a focused session.',
    consultLabel: 'Find a teacher',
    footerSave: 'Save this reading',
    footerConsult: 'Find a teacher',
  },
  unlock: {
    kicker: 'MEMBER EXTENDED',
    title: 'Extended readings',
    body: 'Log in to access in-depth explanations and daily, monthly, and yearly extended readings. The free tool is already complete — this is optional.',
    memberStatusLabel: 'Member status',
    memberLoggedIn: 'Logged in',
    memberPending: '...',
    memberGuest: '—',
    guestBody: 'Log in to view extended readings. Daily, monthly, and yearly insights for every tool will be saved to your member account.',
    guestLogin: 'Log in to view',
    dailyTitle: 'Daily ritual',
    dailyDone: 'Daily check-in done for today.',
    dailyPending: 'Complete the daily ritual to unlock extended readings for today.',
    claimBtn: 'Complete daily check-in',
    claimedBtn: 'Done for today',
    claimingBtn: 'Processing...',
    alreadyViewed: 'Viewed',
    loadingContent: 'Loading...',
    viewBtn: 'View {label}',
    loadBtn: 'Load content',
    noticeAlreadyUnlocked: '{label} is already available.',
    noticeUnlocked: '{label} content loaded.',
  },
  ziweiGuide: {
    kicker: 'Zi Wei Plain Guide',
    title: 'Look at these three things before the twelve palaces',
    body: 'Zi Wei is not about memorising all twelve palaces at once. Start with the main axis, then go to the palace that matches your real question.',
    noMajorStar: 'No major star. Check the opposite palace and the four major triangles.',
    mingGongLabel: 'Life Palace',
    shenGongLabel: 'Body Palace',
    wuxingLabel: 'Five-Element Cycle',
    mingGongDesc: 'The Life Palace is your personal axis — it shows how you naturally meet the world and the impression others tend to get at first glance.',
    shenGongDesc: 'The Body Palace reveals your landing style — how you make decisions, take on responsibility, and build your life as you grow.',
    wuxingDesc: 'The Five-Element Cycle is the undertone of the chart. It helps you understand the chart\'s rhythm, not as a verdict of luck or misfortune but as the way energy moves.',
    questionRoutes: [
      { topic: 'Relationships', palace: 'Spouse Palace', body: 'Relationship patterns, emotional safety, and partner dynamics.' },
      { topic: 'Career', palace: 'Career Palace', body: 'Work style, career direction, and where to invest energy.' },
      { topic: 'Finance', palace: 'Wealth Palace', body: 'How you earn, resource flow, and financial pressure.' },
      { topic: 'Family', palace: 'Property / Parents / Siblings', body: 'Family support, sense of home, and close relationships.' },
      { topic: 'External', palace: 'Migration Palace', body: 'Development outside home, partnerships, and environmental shifts.' },
    ],
  },
  palaceNoStar: 'No major star. Check the opposite palace and the four major triangles.',
  disclaimer: 'Results are for self-exploration only and do not constitute any diagnosis, treatment, medical, or professional psychological advice. If you are experiencing physical or mental distress, please seek professional medical or psychological support.',
  error: {
    title: 'Reading failed',
    apiHint: 'Please confirm the backend API is running, or try submitting again later.',
  },
  loading: {
    label: 'Preparing your reading...',
  },
  notices: {
    insufficientPoints: 'Unable to view right now. Come back tomorrow or complete the daily ritual first.',
    notAuthenticated: 'Please log in to view extended content.',
    generic: 'Something went wrong. Please try again.',
    claimSuccess: 'Daily check-in complete. You can now view extended content.',
    claimAlready: 'Already checked in today. Come back tomorrow.',
    signInFirst: 'Please complete the daily ritual before viewing extended content.',
  },
  unlockOptions: {
    deep_reading: {
      label: 'Deep reading',
      title: 'View the full reading',
      body: 'Read a fuller plain-language interpretation: strengths, stuck points, what to watch right now, and one small action for today.',
    },
    transit_day: {
      label: 'Daily transit',
      title: "View today's daily transit",
      body: 'See how to use this result today: where to move forward, where to slow down, and how to avoid letting emotions call the shots.',
    },
    transit_month: {
      label: 'Monthly transit',
      title: "View this month's transit reading",
      body: "See this month's theme: what to build steadily, what drains to avoid, and a direction to check in with each week.",
    },
    transit_year: {
      label: 'Yearly transit',
      title: "View this year's transit reading",
      body: "See the big picture for the year: what's worth long-term investment, which habits to shift, and how to break the year into walkable stages.",
    },
  },
  nextStepsTools: {
    numerology: [
      { title: 'Start with the core numbers', body: 'Look at your Life Path number, Birthday number, and archetype first — then go back to understand your usual patterns of action.' },
      { title: 'Translate the numbers into a direction', body: "Each core number carries a specific behavioural tendency. Find the 'one thing to try today' in the reading and pick one reminder you can actually use." },
      { title: 'Bring in a life context', body: 'If you want to explore career, relationships, or a yearly theme, bring these results to a teacher for a deeper conversation.' },
    ],
    maya: [
      { title: 'Find the line that lands', body: "Don't start with the terminology. Find the part that describes how you move when things flow — and how you react when stuck. If it resonates, read on." },
      { title: 'See how the oracle board works together', body: 'Your birth seal is the main axis. Guidance is your next step, Support is your resource, Challenge is the stuck point, and Hidden Power is what surfaces in low moments. Notice how the five roles divide the work.' },
      { title: 'Run one small experiment today', body: 'Translate the result into one action within the next 24 hours: say something, let something go, set a boundary. Notice what shifts in how you feel.' },
    ],
    bazi: [
      { title: 'Start with Day Master and Five Elements', body: 'Your Day Master shows your core quality in relation to the world. The Five Element balance reveals where your resources and pressures come from.' },
      { title: 'Read the Four Pillars as time layers', body: 'Year Pillar covers early life and the outside world, Month Pillar covers work environment, Day Pillar covers self and relationships, Hour Pillar covers longer-term development — each describes a different life scene.' },
      { title: 'Connect it to a real situation', body: "Ba Zi works well for career timing, relationship dynamics, and long-term decisions. Bring a specific question to make it practical." },
    ],
    ziwei: [
      { title: 'Start with Life Palace and Body Palace', body: 'The Life Palace is your main axis; the Body Palace is how that energy lands in practice. Pair them with the major star to understand your character.' },
      { title: 'Enter from the question you actually have', body: 'Relationships → Spouse Palace. Career → Career Palace. Money → Wealth Palace. Start with the area that matters most right now instead of reading every palace at once.' },
      { title: 'Pick one palace to go deep', body: "Don't try to read everything at once. Start with the palace that matches your current question — career, relationships, or finances." },
    ],
    tarot: [
      { title: 'Return to your question and position', body: 'Go back to what you asked, then look at where each card sits — past, present, or future.' },
      { title: 'Read the card face and orientation', body: 'The display shows card names, upright or reversed orientation, key words, and the deck style you chose.' },
      { title: 'Turn the answer into one action', body: 'Finish by identifying one step you can take today. The reading is most useful when it moves you forward.' },
    ],
    runes: [
      { title: 'Start with the rune and its orientation', body: "Rune messages tend to be direct. Look at the core theme first, then see whether it's pointing to an obstacle or a resource." },
      { title: 'Match the keywords to your day', body: 'Each rune has upright and reversed keyword sets. Hold the one that fits your current situation and let it guide your focus — not as a prediction but as a frame.' },
      { title: 'Write one action sentence for today', body: 'Distil the result into a single reminder you can act on today. That habit builds the most natural reason to return.' },
    ],
    astro: [
      { title: 'Start with Sun, Moon, and Ascendant', body: 'Sun shows core intent, Moon shows emotional needs, Ascendant shows how you meet the outside world.' },
      { title: 'Notice the gap between the three', body: 'Reading Sun, Moon, and Ascendant together reveals the difference between what you want, what you need, and what others see — and where those layers align or pull apart.' },
      { title: 'Then look at houses and aspects', body: 'When you want to understand specific life events more precisely, go deeper into house placements and planetary aspects.' },
    ],
    humandesign: [
      { title: 'Start with Type and Authority', body: 'Your Type shapes how you engage with the world; your Inner Authority guides how you make decisions that feel right.' },
      { title: 'Find your defined centres in the BodyGraph', body: 'Coloured centres are your consistent energy sources; white centres are where you are most influenced by others. Spotting that boundary is the foundation for everything else.' },
      { title: 'Pick three activated gates to explore', body: "Choose the three activated gates that resonate most strongly. There's no need to work through everything at once." },
    ],
  },
  mayaOracle: {
    eyebrow: 'MAYA ORACLE',
    title: 'The Five-Kin Oracle',
    subtitle: 'Beyond your birth Kin, four more forces shape your day: Guide, Analog, Antipode and Occult. Here is how each one works.',
    heroLabel: 'Birth Kin',
    roles: { self: 'Self', guide: 'Guide', analog: 'Analog', antipode: 'Antipode', occult: 'Occult' },
    bodies: {
      self: 'Your core rhythm — the energy you use most naturally, day to day.',
      guide: 'The direction to borrow when you feel stuck: ask what the next small step would look like.',
      analog: 'Your support station. When you need backup, this is the energy to return to.',
      antipode: 'A seeming opposite — a reminder to mature the very quality it seems to challenge.',
      occult: 'A hidden resource that surfaces in low moments or surprises, usually when you loosen control.',
    },
    crosscheck: {
      dreamspell: 'Dreamspell',
      tzolkin: 'Traditional Tzolkin',
      haab: 'Haab',
      longCount: 'Long Count',
      thirteenMoon: '13 Moon',
    },
  },
};

const vi: ToolResultCopy = {
  arLoading: {
    kicker: 'VISUAL RESULT STAGE',
    title: 'Đang chuẩn bị giai đoạn trực quan',
    body: 'Kết quả sẽ hiển thị dưới dạng sơ đồ 2D rõ ràng, bố cục bài, hoặc mặt đá. AR / 3D đầy đủ sẽ mở khi sẵn sàng.',
  },
  hdPlanar: {
    factsKicker: 'Hiểu bản thân trong 3 giây',
    factsTitle: 'Xem những điều này trước, rồi mới vào BodyGraph',
    factsBody: 'Không cần hiểu 9 trung tâm năng lượng và 64 cổng mới biết mình là ai.',
    scrollHint: 'Cuộn xuống để xem toàn bộ BodyGraph và các trung tâm năng lượng',
    stageKicker: 'Xem sâu hơn',
    stageTitle: 'BodyGraph lùi xuống màn hình thứ hai',
    stageBody: 'Biểu đồ đầy đủ vẫn giữ nền tối tĩnh lặng; các trung tâm đã định hình sẽ được đánh dấu — muốn tìm hiểu chỗ nào thì xem tiếp.',
    legendOn: 'Trung tâm đã định hình — nguồn năng lượng ổn định, đáng tin cậy',
    legendOff: 'Trung tâm chưa định hình — tiếp nhận từ bên ngoài, dễ bị khuếch đại',
    frameLabel: 'BodyGraph',
    frameNote: 'Xem biểu đồ này trước, không cần đọc hết mọi cổng cùng lúc',
    bodyToggleGraph: 'Xem biểu đồ năng lượng',
    bodyToggleBody: 'Đối chiếu bộ phận cơ thể',
    stateDefined: 'Đã định nghĩa (hoạt động ổn định)',
    stateUndefined: 'Chưa định nghĩa (thay đổi theo hoàn cảnh)',
    bodyPartLabel: 'Bộ phận cơ thể',
    closeLabel: 'Đóng',
    dailyLabel: 'Cách cảm nhận mỗi ngày',
    channelsTitle: 'Các kênh đã định nghĩa của bạn',
    channelsHint: 'Mỗi đường sáng là một tài năng hoạt động ổn định. Bấm vào danh sách hoặc vào đường trên biểu đồ để xem ý nghĩa.',
    channelsEmpty: 'Chưa phát hiện kênh nào được định nghĩa — năng lượng của bạn chủ yếu chảy qua các trung tâm khác, đây không phải là điểm yếu.',
    gateLabel: 'Cổng',
    circuitLabel: 'Nhóm mạch (đã đơn giản hoá)',
    circuitIndividual: 'Mạch cá nhân — là chính mình, sống theo cách riêng',
    circuitTribal: 'Mạch bộ lạc — hỗ trợ, nguồn lực và sự gắn kết',
    circuitCollective: 'Mạch tập thể — chia sẻ, logic và truyền kinh nghiệm',
    circuitDisclaimer: 'Cách phân nhóm mạch chỉ là bản đơn giản hoá để dễ nhận diện nhóm đường, không phải lý thuyết mạch học thuật chặt chẽ, chỉ để tham khảo cho người mới.',
    channelGenericName: 'Kênh nối Cổng {gate1} và Cổng {gate2}',
    channelGenericTrait: 'Cổng {gate1} và {gate2} kết nối ổn định thành một kênh, nghĩa là năng lượng này hoạt động liên tục ở bạn chứ không chỉ thỉnh thoảng xuất hiện.',
    channelGenericDaily: 'Để ý xem chủ đề của hai cổng này xuất hiện khi nào trong lựa chọn của bạn — đó thường là tài năng cố định bạn có thể tin tưởng.',
    centers: {
      Head: { label: 'Đỉnh đầu', bodyPart: 'Đỉnh đầu / thóp', meaning: 'Nguồn cảm hứng và câu hỏi — tạo ra ý tưởng, không phải câu trả lời.', definedTip: 'Khi có ý nghĩ xuất hiện, đừng vội trả lời. Để câu hỏi lắng lại, câu trả lời thường đến sau khoảng lặng.', undefinedTip: 'Bạn dễ bị lây câu hỏi của người khác rồi suy nghĩ quá nhiều. Hãy tự hỏi: đây là câu hỏi của mình hay của người khác?' },
      Ajna: { label: 'Ajna (Trán)', bodyPart: 'Trán / giữa hai lông mày', meaning: 'Phụ trách suy nghĩ, phân tích và đưa ra kết luận — trung tâm logic của não bộ.', definedTip: 'Bạn dễ có quan điểm cố định, đó là món quà; thỉnh thoảng hãy để góc nhìn của người khác lọt vào.', undefinedTip: 'Suy nghĩ của bạn có thể đổi mỗi ngày, cứ để mình nói "tôi vẫn đang suy nghĩ".' },
      Throat: { label: 'Cổ họng', bodyPart: 'Cổ họng', meaning: 'Lối ra của biểu đạt và hành động — mọi năng lượng cuối cùng đều đi qua đây để được nói ra hoặc làm ra.', definedTip: 'Lời bạn nói thường có trọng lượng thật sự, hãy để ý những lúc bạn dễ được lắng nghe nhất.', undefinedTip: 'Bạn dễ chen lời người khác. Khi muốn nói, hãy hít thở sâu và xem có thật sự cần nói ngay không.' },
      G: { label: 'Trung tâm G', bodyPart: 'Ngực / vùng tim', meaning: 'Bản dạng, phương hướng và tình yêu — quyết định bạn đi đâu và bạn là ai.', definedTip: 'Bạn thường chắc chắn về mình là ai, đi hướng nào — cứ tự tin bước đi với sự chắc chắn đó.', undefinedTip: 'Bạn có thể cảm thấy khác đi khi ở cạnh người khác nhau, cảm giác phương hướng thay đổi là bình thường với bạn.' },
      Heart: { label: 'Tim / Ý chí', bodyPart: 'Bên phải ngực / vùng tim', meaning: 'Ý chí, giá trị bản thân và khả năng làm được điều đã nói — cũng chi phối nguồn lực vật chất.', definedTip: 'Bạn vốn nói được làm được, chỉ cần cẩn thận đừng hứa quá mức chỉ để chứng minh bản thân.', undefinedTip: 'Bạn dễ khắt khe với chính mình. Thật ra bạn không cần chứng minh mới có giá trị.' },
      Sacral: { label: 'Xương cùng', bodyPart: 'Bụng dưới / xương cùng', meaning: 'Năng lượng sống thuần khiết và sức làm việc — trả lời "có" hoặc "không" bằng âm thanh.', definedTip: 'Trước khi quyết định, hãy chú ý phản ứng bản năng ở bụng — nó chính xác hơn suy nghĩ.', undefinedTip: 'Bạn dễ ôm việc quá sức mà không nhận ra, mệt rồi thì nên dừng.' },
      SolarPlexus: { label: 'Đám rối dương', bodyPart: 'Vùng dạ dày / cơ hoành', meaning: 'Trung tâm của các đợt sóng cảm xúc — con đường dẫn tới sự rõ ràng cảm xúc.', definedTip: 'Sự thật của bạn không nằm ở hiện tại, hãy ngủ một đêm trước khi quyết định việc lớn.', undefinedTip: 'Bạn dễ hấp thụ cảm xúc của người khác. Khi tâm trạng đột nhiên thay đổi, hãy hỏi đó là cảm xúc của ai.' },
      Spleen: { label: 'Lá lách', bodyPart: 'Vùng bụng trên / lá lách', meaning: 'Radar bản năng của cơ thể — quản lý nỗi sợ, miễn dịch và cảm giác an toàn tức thời.', definedTip: 'Trực giác của bạn rất chuẩn, thường chỉ lóe lên một lần, hãy nắm lấy phản ứng đầu tiên đó.', undefinedTip: 'Bạn dễ căng thẳng vì chuyện nhỏ. Hãy tự hỏi nỗi sợ này là thật hay chỉ là thói quen cũ.' },
      Root: { label: 'Gốc', bodyPart: 'Xương cụt / đáy chậu', meaning: 'Động cơ của adrenaline và áp lực — sức đẩy nguyên bản giúp bạn hoàn thành việc.', definedTip: 'Bạn chịu được áp lực nhiều hơn người khác, một chút gấp gáp lại giúp bạn hiệu quả hơn.', undefinedTip: 'Deadline dễ khiến bạn ngộp thở, hãy nhắc mình không phải việc gấp nào cũng cần xử lý ngay.' },
    },
    channels: {
      '20-34': { name: 'Cổ họng—Xương cùng | Kênh Sức hút', trait: 'Chuyển hành động bản năng của cơ thể trực tiếp thành biểu đạt và sức hút mà người khác nhìn thấy.', daily: 'Cảm giác muốn làm ngay thường đúng, nhưng hãy chắc là xương cùng thật sự phản hồi chứ không phải đầu óc đang vội.' },
      '20-57': { name: 'Cổ họng—Lá lách | Kênh Sóng não', trait: 'Biến trực giác tức thời thành lời nói rõ ràng với tốc độ nhanh nhất.', daily: 'Nhận định bản năng bạn nói ra ngay thường là chính xác nhất, đừng nghĩ quá lâu trước khi nói.' },
      '10-20': { name: 'Cổ họng—Trung tâm G | Kênh Thức tỉnh', trait: 'Biến sự chắc chắn về bản thân thành hành động và sự hiện diện có thể thấy được.', daily: 'Khi đã rõ mình là ai, hãy sống đúng như vậy, không cần chờ ai công nhận.' },
      '34-57': { name: 'Xương cùng—Lá lách | Kênh Sức mạnh', trait: 'Kết hợp năng lượng sống với trực giác thành một sức mạnh ổn định, có sự hiện diện.', daily: 'Khi cơ thể thấy đúng và trực giác thấy an toàn, việc đó đáng để dồn hết sức làm.' },
      '2-14': { name: 'Trung tâm G—Xương cùng | Kênh Nhịp đập', trait: 'Kết hợp phương hướng với động lực ổn định để đưa nguồn lực đến đúng nơi, từng bước một.', daily: 'Xác định đúng hướng trước, rồi để động lực cơ thể tiếp quản, không cần vội đến đích ngay.' },
      '10-34': { name: 'Trung tâm G—Xương cùng | Kênh Khám phá', trait: 'Trung thành với niềm tin của mình và dùng động lực cơ thể để thực hiện nó.', daily: 'Đừng thoả hiệp niềm tin cốt lõi chỉ để hợp với người khác, động lực của bạn là để sống đúng điều mình tin.' },
      '25-51': { name: 'Trung tâm G—Tim | Kênh Khởi xướng', trait: 'Mở đường mới bằng tình yêu và sự thôi thúc, dù có thể gây xáo trộn.', daily: 'Khi cần "người đầu tiên dấn thân", bạn thường phù hợp hơn người khác.' },
      '21-45': { name: 'Cổ họng—Tim | Đường Tiền bạc', trait: 'Khả năng kiểm soát nguồn lực và vật chất, sinh ra để quản lý và phân bổ.', daily: 'Khi bàn chuyện tiền bạc, phân bổ nguồn lực, phán đoán của bạn thường chuẩn hơn bạn nghĩ, đừng ngại.' },
      '6-59': { name: 'Xương cùng—Đám rối dương | Kênh Giao phối', trait: 'Dùng sự lên xuống của cảm xúc để tìm sự thân mật thật sự, vượt qua phòng thủ của người khác.', daily: 'Khi muốn gần gũi hơn, hãy để chu kỳ cảm xúc lắng xuống, đừng ép thân mật lúc đỉnh điểm hay thấp điểm.' },
      '30-41': { name: 'Đám rối dương—Gốc | Kênh Công nhận', trait: 'Khao khát trải nghiệm mới và ước mơ không ngừng, cũng dễ mang căng thẳng cảm xúc.', daily: 'Khao khát không phải là sai, hãy để cảm xúc rõ ràng trước rồi mới quyết định có hành động thật hay không.' },
      '39-55': { name: 'Đám rối dương—Gốc | Kênh Biểu lộ cảm xúc', trait: 'Sự lên xuống cảm xúc chính là năng lượng khơi gợi, sáng tạo, kích thích phản ứng từ người khác.', daily: 'Tâm trạng thấp không có nghĩa là có gì sai, đó có thể chỉ là một phần bình thường của chu kỳ cảm xúc.' },
      '19-49': { name: 'Đám rối dương—Gốc | Kênh Tổng hợp', trait: 'Đặc biệt nhạy với nhu cầu và sự gắn kết cảm xúc của nhóm, coi trọng cảm giác được chấp nhận.', daily: 'Khi cảm thấy bị bỏ rơi, hãy kiểm tra xem điều đó có thật hay chỉ là sự nhạy cảm cũ đang phản ứng.' },
      '26-44': { name: 'Tim—Lá lách | Kênh Đầu hàng', trait: 'Phán đoán bản năng nên tin ai, nên giao nguồn lực cho ai.', daily: 'Ấn tượng bản năng đầu tiên về một người thường chính xác, đừng vội dùng logic để phủ nhận nó.' },
      '37-40': { name: 'Tim—Đám rối dương | Kênh Cộng đồng', trait: 'Xây dựng một cộng đồng hay gia đình hỗ trợ lẫn nhau, có cảm giác thuộc về qua các chu kỳ cảm xúc.', daily: 'Hãy để lời hứa quan trọng lắng qua một chu kỳ cảm xúc trước khi thật sự nhận lời.' },
    },
  },
  resonance: {
    questionPrefix: 'Hỏi giáo viên: ',
    understandPrefix: 'Cách bắt đầu hữu ích',
  },
  insight: {
    memberNoteKicker: 'GHI CHÚ HỘI VIÊN',
    memberNoteTitle: 'Thu thập những thông điệp có cộng hưởng',
    memberNoteEmpty: 'Mở một thẻ và đánh dấu những cái cảm thấy đúng.',
    memberNoteCount: 'Đã đánh dấu {count} thẻ — quay lại xem khi gặp giáo viên.',
    cardSubtitleFallback: 'Thẻ giải đọc',
    cardExpand: 'Mở giải đọc',
    cardCollapse: 'Đóng giải đọc',
    cardResonate: 'Điều này có cộng hưởng',
    cardResonated: 'Đã thêm vào phiên này',
    expandAll: 'Hiện tất cả {count} thẻ',
    collapseAll: 'Thu gọn thẻ',
  },
  personalReading: {
    thisReminder: 'Nhắc nhở của bạn',
    setReminder: 'Đặt làm nhắc nhở',
    reminderSet: 'Đã đặt nhắc nhở',
  },
  game: {
    kicker: 'BẢN ĐỒ ĐỌC',
    title: 'Cách đọc kết quả này',
    plainNote: 'Không cần đọc mọi thuật ngữ ngay. Theo ba bước: đọc tóm tắt chính, xem sơ đồ trực quan, rồi chọn một nhắc nhở để thử hôm nay.',
    arLink: 'Xem sơ đồ trực quan',
    stepPrefix: 'BƯỚC',
  },
  nextSteps: {
    kicker: 'LUỒNG ĐỌC',
    title: 'Tiếp theo nên làm gì',
    bookTeacher: 'Đặt lịch với giáo viên',
    viewHistory: 'Xem lịch sử giải đọc',
  },
  actionPath: {
    kicker: 'HƯỚNG DẪN HỘI VIÊN',
    title: 'Ba bước tiếp theo rõ ràng',
    body: 'Lưu trước, xem lại sau, rồi mang câu hỏi ấn tượng nhất đến giáo viên để có buổi sâu hơn.',
    saveTitle: 'Lưu lần đọc này',
    saveLabel: 'Đăng nhập và lưu',
    dailyTitle: 'Quay lại nghi lễ hàng ngày',
    dailyBody: 'Quay lại ngày mai rút bài hoặc rune hàng ngày để nền tảng là người bạn đồng hành ổn định.',
    dailyLabel: 'Nghi lễ hàng ngày',
    consultTitle: 'Đặt buổi đọc sâu hơn',
    consultBody: 'Nếu một thẻ hoặc phần sơ đồ thực sự ấn tượng, mang câu hỏi đó đến giáo viên.',
    consultLabel: 'Tìm giáo viên',
    footerSave: 'Lưu lần đọc này',
    footerConsult: 'Tìm giáo viên',
  },
  unlock: {
    kicker: 'MỞ RỘNG HỘI VIÊN',
    title: 'Đọc mở rộng',
    body: 'Đăng nhập để truy cập giải thích chuyên sâu và đọc mở rộng theo ngày, tháng, năm. Công cụ miễn phí đã đầy đủ — đây là tùy chọn.',
    memberStatusLabel: 'Trạng thái hội viên',
    memberLoggedIn: 'Đã đăng nhập',
    memberPending: '...',
    memberGuest: '—',
    guestBody: 'Đăng nhập để xem đọc mở rộng. Thông tin hàng ngày, hàng tháng, hàng năm sẽ được lưu vào tài khoản hội viên.',
    guestLogin: 'Đăng nhập để xem',
    dailyTitle: 'Nghi lễ hàng ngày',
    dailyDone: 'Đã hoàn thành check-in hôm nay.',
    dailyPending: 'Hoàn thành nghi lễ hàng ngày để mở khóa đọc mở rộng.',
    claimBtn: 'Hoàn thành check-in hàng ngày',
    claimedBtn: 'Đã xong hôm nay',
    claimingBtn: 'Đang xử lý...',
    alreadyViewed: 'Đã xem',
    loadingContent: 'Đang tải...',
    viewBtn: 'Xem {label}',
    loadBtn: 'Tải nội dung',
    noticeAlreadyUnlocked: '{label} đã có thể xem.',
    noticeUnlocked: 'Nội dung {label} đã được tải.',
  },
  ziweiGuide: {
    kicker: 'Hướng Dẫn Tử Vi',
    title: 'Xem ba điều này trước mười hai cung',
    body: 'Tử Vi không phải thuộc lòng tất cả mười hai cung. Bắt đầu với trục chính, rồi đi đến cung phù hợp câu hỏi thực của bạn.',
    noMajorStar: 'Không có chính tinh. Kiểm tra cung đối diện và tứ chính tam hợp.',
    mingGongLabel: 'Mệnh Cung',
    shenGongLabel: 'Thân Cung',
    wuxingLabel: 'Ngũ Hành Cục',
    mingGongDesc: 'Mệnh Cung như trục chính cuộc đời — thể hiện cách bạn quen đối mặt với thế giới và ấn tượng người khác dễ cảm nhận ngay từ cái nhìn đầu tiên.',
    shenGongDesc: 'Thân Cung như cách tiếp đất — cho thấy bạn ngày càng dùng phong cách nào để ra quyết định, gánh vác trách nhiệm và tích lũy cuộc sống.',
    wuxingDesc: 'Ngũ Hành Cục như nền tảng của lá số — giúp bạn hiểu nhịp điệu của toàn bộ lá số, không phải là phán quyết về may rủi mà là cách năng lượng vận hành.',
    questionRoutes: [
      { topic: 'Tình cảm', palace: 'Phu Thê Cung', body: 'Mô hình quan hệ, an toàn cảm xúc và năng động bạn đời.' },
      { topic: 'Sự nghiệp', palace: 'Quan Lộc Cung', body: 'Phong cách làm việc, hướng sự nghiệp và nơi đầu tư năng lượng.' },
      { topic: 'Tài chính', palace: 'Tài Bạch Cung', body: 'Cách kiếm tiền, dòng chảy tài nguyên và áp lực tài chính.' },
      { topic: 'Gia đình', palace: 'Điền Trạch / Phụ Mẫu / Huynh Đệ', body: 'Hỗ trợ gia đình, cảm giác nhà và các mối quan hệ thân thiết.' },
      { topic: 'Bên ngoài', palace: 'Thiên Di Cung', body: 'Phát triển bên ngoài, hợp tác và thay đổi môi trường.' },
    ],
  },
  palaceNoStar: 'Không có chính tinh. Kiểm tra cung đối diện và tứ chính tam hợp.',
  disclaimer: 'Kết quả chỉ để tham khảo tự khám phá, không cấu thành bất kỳ chẩn đoán, điều trị, lời khuyên y tế hoặc tâm lý chuyên nghiệp nào. Nếu bạn gặp khó khăn về thể chất hoặc tinh thần, hãy tìm kiếm sự hỗ trợ chuyên nghiệp.',
  error: {
    title: 'Giải đọc thất bại',
    apiHint: 'Vui lòng xác nhận backend API đang chạy, hoặc thử gửi lại sau.',
  },
  loading: {
    label: 'Đang chuẩn bị giải đọc...',
  },
  notices: {
    insufficientPoints: 'Không thể xem ngay. Quay lại ngày mai hoặc hoàn thành nghi lễ hàng ngày trước.',
    notAuthenticated: 'Vui lòng đăng nhập để xem nội dung mở rộng.',
    generic: 'Có lỗi xảy ra. Vui lòng thử lại.',
    claimSuccess: 'Check-in hàng ngày hoàn thành. Bạn có thể xem nội dung mở rộng.',
    claimAlready: 'Đã check-in hôm nay. Quay lại ngày mai.',
    signInFirst: 'Vui lòng hoàn thành nghi lễ hàng ngày trước khi xem nội dung mở rộng.',
  },
  unlockOptions: {
    deep_reading: {
      label: 'Đọc sâu',
      title: 'Xem toàn bộ giải thích',
      body: 'Đọc giải thích đầy đủ hơn: điểm mạnh, điểm kẹt, điều cần chú ý hiện tại và một hành động nhỏ cho hôm nay.',
    },
    transit_day: {
      label: 'Vận ngày',
      title: 'Xem vận ngày hôm nay',
      body: 'Xem cách sử dụng kết quả này hôm nay: nơi có thể tiến, nơi nên từ từ, tránh để cảm xúc quyết định.',
    },
    transit_month: {
      label: 'Vận tháng',
      title: 'Xem vận tháng này',
      body: 'Xem chủ đề tháng này: nên tích lũy gì, tránh tiêu hao gì và hướng kiểm tra mỗi tuần.',
    },
    transit_year: {
      label: 'Vận năm',
      title: 'Xem vận năm nay',
      body: 'Xem bức tranh lớn của năm: điều gì đáng đầu tư dài hạn, thói quen nào cần điều chỉnh.',
    },
  },
  nextStepsTools: {
    numerology: [
      { title: 'Bắt đầu với các con số cốt lõi', body: 'Xem số Đường Đời, số Ngày Sinh và nguyên mẫu trước — rồi quay lại hiểu các kiểu hành động thường dùng của bạn.' },
      { title: 'Chuyển con số thành hướng hành động', body: 'Mỗi con số cốt lõi có xu hướng hành vi cụ thể. Tìm phần "một việc có thể làm hôm nay" trong kết quả và chọn một lời nhắc thực sự có thể áp dụng.' },
      { title: 'Kết nối với bối cảnh thực tế', body: 'Nếu muốn khám phá sự nghiệp, các mối quan hệ hoặc chủ đề năm, hãy mang kết quả này đến gặp thầy để trao đổi sâu hơn.' },
    ],
    maya: [
      { title: 'Tìm câu chạm đúng tim', body: 'Đừng bắt đầu bằng thuật ngữ. Tìm đoạn mô tả cách bạn vận động khi thuận — và phản ứng khi kẹt. Nếu cộng hưởng, hãy đọc tiếp.' },
      { title: 'Xem cách bảng thần chú kết nối', body: 'Mệnh là trục chính, Hướng dẫn là bước tiếp, Hỗ trợ là nguồn lực, Thách thức là điểm kẹt, Sức mạnh ẩn là thứ nổi lên lúc khó khăn. Chú ý cách năm vai trò phân chia công việc.' },
      { title: 'Chỉ làm một thử nghiệm nhỏ hôm nay', body: 'Biến kết quả thành một hành động trong 24 giờ: nói điều gì đó, buông bỏ điều gì đó, thiết lập một ranh giới. Quan sát cảm nhận và phản hồi của bạn.' },
    ],
    bazi: [
      { title: 'Bắt đầu với Nhật Chủ và Ngũ Hành', body: 'Nhật Chủ cho thấy chất lượng cốt lõi của bạn. Phân bố Ngũ Hành cho thấy nguồn lực và áp lực từ đâu đến.' },
      { title: 'Đọc Tứ Trụ như các lớp thời gian', body: 'Năm trụ nói về đầu đời và thế giới bên ngoài, Tháng trụ về môi trường làm việc, Ngày trụ về bản thân và các mối quan hệ, Giờ trụ về sự phát triển lâu dài — mỗi trụ mô tả một cảnh đời khác nhau.' },
      { title: 'Kết nối với tình huống thực tế', body: 'Bát Tự phù hợp để khám phá nhịp điệu sự nghiệp, động lực mối quan hệ và quyết định dài hạn. Hãy mang câu hỏi cụ thể để đi sâu hơn.' },
    ],
    ziwei: [
      { title: 'Bắt đầu với Mệnh Cung và Thân Cung', body: 'Mệnh Cung là trục chính; Thân Cung là cách năng lượng đó thể hiện trong thực tế. Kết hợp với chính tinh để hiểu tính cách.' },
      { title: 'Vào từ câu hỏi bạn thực sự có', body: 'Tình cảm → Phu Thê Cung. Sự nghiệp → Quan Lộc Cung. Tiền bạc → Tài Bạch Cung. Bắt đầu với lĩnh vực quan trọng nhất hiện tại thay vì đọc hết tất cả cung.' },
      { title: 'Chọn một cung để đi sâu', body: 'Đừng cố đọc tất cả mọi thứ cùng lúc. Bắt đầu với cung phù hợp với câu hỏi hiện tại của bạn — sự nghiệp, các mối quan hệ hoặc tài chính.' },
    ],
    tarot: [
      { title: 'Quay lại câu hỏi và vị trí', body: 'Nhớ lại điều bạn hỏi, rồi xem mỗi lá bài nằm ở đâu — quá khứ, hiện tại hay tương lai.' },
      { title: 'Đọc mặt bài và chiều hướng', body: 'Màn hình hiển thị tên lá bài, xuôi hay ngược, từ khóa và phong cách bộ bài bạn chọn.' },
      { title: 'Biến câu trả lời thành hành động', body: 'Kết thúc bằng cách xác định một bước bạn có thể thực hiện hôm nay. Bài đọc hữu ích nhất khi nó giúp bạn tiến về phía trước.' },
    ],
    runes: [
      { title: 'Bắt đầu với rune và chiều hướng', body: 'Thông điệp rune thường trực tiếp. Xem chủ đề cốt lõi trước, rồi xem nó đang chỉ ra trở ngại hay nguồn lực.' },
      { title: 'Kết hợp từ khóa với ngày hôm nay', body: 'Mỗi rune có bộ từ khóa xuôi và ngược. Giữ từ khóa phù hợp với tình huống hiện tại của bạn và để nó dẫn hướng tập trung — không phải như dự đoán mà như một khung nhìn.' },
      { title: 'Viết một câu hành động cho hôm nay', body: 'Cô đọng kết quả thành một lời nhắc bạn có thể thực hiện hôm nay. Thói quen đó xây dựng lý do tự nhiên nhất để quay lại.' },
    ],
    astro: [
      { title: 'Bắt đầu với Mặt Trời, Mặt Trăng và Ascendant', body: 'Mặt Trời cho thấy ý chí cốt lõi, Mặt Trăng cho thấy nhu cầu cảm xúc, Ascendant cho thấy cách bạn gặp gỡ thế giới bên ngoài.' },
      { title: 'Chú ý khoảng cách giữa ba yếu tố', body: 'Đọc Mặt Trời, Mặt Trăng và Ascendant cùng nhau cho thấy sự khác biệt giữa những gì bạn muốn, cần và những gì người khác thấy — và những lớp đó hòa hợp hay kéo căng ở đâu.' },
      { title: 'Rồi xem cung và khía cạnh', body: 'Khi muốn hiểu chính xác hơn các sự kiện trong cuộc sống, hãy đi sâu vào vị trí cung và các khía cạnh hành tinh.' },
    ],
    humandesign: [
      { title: 'Bắt đầu với Loại và Thẩm quyền', body: 'Loại của bạn định hình cách bạn tương tác với thế giới; Thẩm quyền Nội tâm hướng dẫn cách bạn ra quyết định cảm thấy đúng.' },
      { title: 'Tìm các trung tâm đã xác định trong BodyGraph', body: 'Các trung tâm có màu là nguồn năng lượng ổn định của bạn; các trung tâm trắng là nơi bạn dễ bị ảnh hưởng bởi người khác nhất. Phân biệt ranh giới đó là nền tảng cho mọi thứ khác.' },
      { title: 'Chọn ba cổng được kích hoạt để khám phá', body: 'Chọn ba cổng được kích hoạt mà bạn cộng hưởng mạnh nhất. Không cần phải xem qua tất cả mọi thứ cùng một lúc.' },
    ],
  },
  mayaOracle: {
    eyebrow: 'MAYA ORACLE',
    title: 'Bàn Thần Dụ Ngũ Ấn',
    subtitle: 'Ngoài Kin bản mệnh, còn bốn nguồn lực khác định hình ngày của bạn: Dẫn Dắt, Hỗ Trợ, Đối Lập và Ẩn Giấu. Đây là vai trò của từng vị trí.',
    heroLabel: 'Kin Bản Mệnh',
    roles: { self: 'Bản Mệnh', guide: 'Dẫn Dắt', analog: 'Hỗ Trợ', antipode: 'Đối Lập', occult: 'Ẩn Giấu' },
    bodies: {
      self: 'Nhịp điệu cốt lõi của bạn — nguồn năng lượng bạn dùng tự nhiên nhất mỗi ngày.',
      guide: 'Hướng đi để mượn khi bạn bế tắc: hãy hỏi bước nhỏ tiếp theo sẽ như thế nào.',
      analog: 'Trạm tiếp sức của bạn. Khi cần hỗ trợ, đây là nguồn năng lượng để quay về.',
      antipode: 'Một sự đối lập bề ngoài — lời nhắc để trưởng thành chính phẩm chất mà nó dường như thách thức.',
      occult: 'Nguồn lực ẩn giấu xuất hiện trong lúc thấp điểm hoặc bất ngờ, thường khi bạn buông bớt kiểm soát.',
    },
    crosscheck: {
      dreamspell: 'Dreamspell',
      tzolkin: 'Tzolkin Truyền Thống',
      haab: 'Haab',
      longCount: 'Long Count',
      thirteenMoon: '13 Moon',
    },
  },
};

const id: ToolResultCopy = {
  arLoading: {
    kicker: 'VISUAL RESULT STAGE',
    title: 'Menyiapkan tahap visual',
    body: 'Hasil akan ditampilkan sebagai diagram 2D yang jelas, tata letak kartu, atau permukaan batu. AR / 3D lengkap akan dibuka saat siap.',
  },
  hdPlanar: {
    factsKicker: 'Kenali dirimu dalam 3 detik',
    factsTitle: 'Lihat ini dulu, baru masuk ke BodyGraph',
    factsBody: 'Tidak perlu memahami 9 pusat energi dan 64 gerbang lebih dulu untuk tahu siapa dirimu.',
    scrollHint: 'Gulir ke bawah untuk BodyGraph lengkap dan pusat energi',
    stageKicker: 'Lihat lebih dalam',
    stageTitle: 'BodyGraph mundur ke layar kedua',
    stageBody: 'Bagan lengkap tetap dengan latar gelap yang tenang; pusat yang sudah terdefinisi ditandai — lihat mana pun yang ingin kamu dalami.',
    legendOn: 'Pusat terdefinisi — sumber energi yang stabil dan bisa diandalkan',
    legendOff: 'Pusat belum terdefinisi — terbuka ke luar, mudah diperbesar',
    frameLabel: 'BodyGraph',
    frameNote: 'Lihat bagan ini dulu, tidak perlu membaca semua gerbang sekaligus',
    bodyToggleGraph: 'Lihat bagan energi',
    bodyToggleBody: 'Cocokkan ke bagian tubuh',
    stateDefined: 'Terdefinisi (berjalan stabil)',
    stateUndefined: 'Belum terdefinisi (berubah sesuai situasi)',
    bodyPartLabel: 'Bagian tubuh',
    closeLabel: 'Tutup',
    dailyLabel: 'Cara merasakannya sehari-hari',
    channelsTitle: 'Kanal yang sudah terdefinisi',
    channelsHint: 'Setiap garis yang menyala adalah bakat yang berjalan stabil. Ketuk daftar atau garis di bagan untuk melihat artinya.',
    channelsEmpty: 'Belum terdeteksi kanal yang terdefinisi — energimu mengalir terutama lewat pusat lain, ini bukan kekurangan.',
    gateLabel: 'Gerbang',
    circuitLabel: 'Kelompok sirkuit (disederhanakan)',
    circuitIndividual: 'Sirkuit individu — menjadi diri sendiri, hidup dengan caramu sendiri',
    circuitTribal: 'Sirkuit suku — dukungan, sumber daya, dan kedekatan',
    circuitCollective: 'Sirkuit kolektif — berbagi, logika, dan meneruskan pengalaman',
    circuitDisclaimer: 'Pengelompokan sirkuit ini versi sederhana untuk memudahkan mengenali kelompok garis, bukan teori sirkuit akademis yang ketat, hanya referensi untuk pemula.',
    channelGenericName: 'Kanal Gerbang {gate1} dan Gerbang {gate2}',
    channelGenericTrait: 'Gerbang {gate1} dan {gate2} terhubung stabil menjadi satu kanal, artinya energi ini berjalan terus-menerus pada dirimu, bukan hanya sesekali.',
    channelGenericDaily: 'Perhatikan kapan tema dari kedua gerbang ini muncul dalam pilihanmu — biasanya itulah bakat tetap yang bisa kamu percaya.',
    centers: {
      Head: { label: 'Kepala', bodyPart: 'Ubun-ubun / puncak kepala', meaning: 'Sumber inspirasi dan pertanyaan — menghasilkan gagasan, bukan jawaban.', definedTip: 'Saat sebuah pikiran muncul, jangan buru-buru menjawabnya. Biarkan pertanyaan itu mengendap, jawabannya biasanya datang setelah hening.', undefinedTip: 'Kamu mudah tertular pertanyaan orang lain lalu terlalu banyak berpikir. Tanyakan pada diri sendiri: ini pertanyaanku atau pertanyaan orang lain?' },
      Ajna: { label: 'Ajna', bodyPart: 'Dahi / antara alis', meaning: 'Mengurus pemikiran, analisis, dan kesimpulan — pusat logika otak.', definedTip: 'Kamu cenderung punya pandangan tetap, itu anugerah; sesekali beri ruang untuk sudut pandang orang lain.', undefinedTip: 'Pikiranmu bisa berubah setiap hari, biarkan dirimu bilang "aku masih mikir".' },
      Throat: { label: 'Tenggorokan', bodyPart: 'Tenggorokan', meaning: 'Pintu keluar ekspresi dan tindakan — semua energi akhirnya lewat sini untuk diucapkan atau dilakukan.', definedTip: 'Kata-katamu biasanya punya bobot nyata, perhatikan situasi mana kamu paling mudah didengar.', undefinedTip: 'Kamu mudah memotong pembicaraan orang. Saat ingin bicara, tarik napas dulu, lihat apa memang perlu diucapkan sekarang.' },
      G: { label: 'Pusat G', bodyPart: 'Dada / area jantung', meaning: 'Identitas, arah, dan cinta — menentukan ke mana kamu pergi dan siapa dirimu.', definedTip: 'Kamu biasanya yakin siapa dirimu dan ke mana arahmu — jalani kepastian itu dengan percaya diri.', undefinedTip: 'Kamu bisa merasa berbeda di dekat orang yang berbeda, rasa arah yang berubah-ubah itu wajar untukmu.' },
      Heart: { label: 'Jantung / Kehendak', bodyPart: 'Sisi kanan dada / jantung', meaning: 'Kemauan, harga diri, dan kemampuan menepati janji — juga mengatur dorongan sumber daya material.', definedTip: 'Kamu memang menepati ucapanmu, hati-hati jangan sampai terlalu banyak berjanji hanya untuk membuktikan diri.', undefinedTip: 'Kamu bisa terlalu keras pada diri sendiri. Sebenarnya kamu tidak perlu membuktikan diri untuk punya nilai.' },
      Sacral: { label: 'Sakral', bodyPart: 'Perut bawah / sakrum', meaning: 'Tenaga hidup murni dan energi kerja — menjawab "ya" atau "tidak" lewat suara.', definedTip: 'Sebelum memutuskan, perhatikan reaksi naluri di perutmu — itu lebih akurat daripada pikiran.', undefinedTip: 'Kamu bisa mengambil pekerjaan melebihi kemampuanmu tanpa sadar. Kalau sudah lelah, itu tandanya harus berhenti.' },
      SolarPlexus: { label: 'Solar Plexus', bodyPart: 'Area lambung / diafragma', meaning: 'Pusat gelombang emosi — jalan menuju kejernihan emosi.', definedTip: 'Kebenaranmu tidak ada di saat ini. Tidurkan dulu semalam sebelum memutuskan hal besar.', undefinedTip: 'Kamu mudah menyerap emosi orang lain. Saat suasana hati tiba-tiba berubah, tanyakan itu emosi siapa.' },
      Spleen: { label: 'Limpa', bodyPart: 'Area perut atas / limpa', meaning: 'Radar naluriah tubuh — mengatur rasa takut, imunitas, dan rasa aman saat ini.', definedTip: 'Nalurimu sangat akurat, biasanya hanya berkelebat sekali, tangkap reaksi pertama itu.', undefinedTip: 'Kamu mudah tegang karena hal kecil. Tanyakan dulu, rasa takut ini nyata sekarang atau reaksi kebiasaan lama.' },
      Root: { label: 'Root', bodyPart: 'Tulang ekor / dasar panggul', meaning: 'Mesin adrenalin dan tekanan — dorongan mentah yang membuatmu menyelesaikan sesuatu.', definedTip: 'Kamu bisa menahan tekanan lebih besar dari orang lain, sedikit rasa mendesak justru membuatmu lebih efisien.', undefinedTip: 'Tenggat waktu bisa terasa mencekik. Ingatkan diri bahwa tidak semua yang terasa mendesak harus ditangani sekarang.' },
    },
    channels: {
      '20-34': { name: 'Tenggorokan—Sakral | Kanal Karisma', trait: 'Mengubah tindakan naluriah tubuh langsung menjadi ekspresi dan karisma yang terlihat orang lain.', daily: 'Dorongan untuk langsung bertindak biasanya benar, tapi pastikan dulu sakralmu memang merespons, bukan pikiranmu yang buru-buru.' },
      '20-57': { name: 'Tenggorokan—Limpa | Kanal Gelombang Otak', trait: 'Mengubah intuisi saat itu juga menjadi ucapan yang jelas dengan sangat cepat.', daily: 'Penilaian naluriah yang langsung kamu ucapkan biasanya paling akurat, jangan terlalu lama berpikir sebelum bicara.' },
      '10-20': { name: 'Tenggorokan—Pusat G | Kanal Kebangkitan', trait: 'Mengubah kepastian tentang siapa dirimu menjadi tindakan dan kehadiran yang terlihat.', daily: 'Setelah yakin siapa dirimu, jalani langsung, tidak perlu menunggu persetujuan orang lain.' },
      '34-57': { name: 'Sakral—Limpa | Kanal Kekuatan', trait: 'Menggabungkan tenaga hidup dan naluri menjadi kekuatan yang stabil dan penuh kehadiran.', daily: 'Saat tubuh merasa benar dan naluri merasa aman, hal itu pantas dikerjakan sepenuh hati.' },
      '2-14': { name: 'Pusat G—Sakral | Kanal Denyut', trait: 'Memadukan rasa arah dengan dorongan stabil untuk membawa sumber daya ke tempat yang tepat, langkah demi langkah.', daily: 'Pastikan arahnya benar dulu, baru biarkan dorongan tubuhmu mengambil alih, tidak perlu buru-buru sekaligus selesai.' },
      '10-34': { name: 'Pusat G—Sakral | Kanal Eksplorasi', trait: 'Setia pada keyakinanmu sendiri dan mewujudkannya lewat dorongan tubuh.', daily: 'Jangan mengorbankan keyakinan inti hanya untuk menyesuaikan diri, dorongan tubuhmu ada untuk menjalani apa yang kamu yakini.' },
      '25-51': { name: 'Pusat G—Jantung | Kanal Inisiasi', trait: 'Membuka jalan baru dengan cinta dan dorongan, meski bisa sedikit mengejutkan.', daily: 'Saat butuh "orang pertama yang melangkah", kamu sering lebih cocok dari kebanyakan orang.' },
      '21-45': { name: 'Tenggorokan—Jantung | Garis Uang', trait: 'Kemampuan alami mengendalikan dan mengelola sumber daya serta hal material.', daily: 'Saat membahas uang atau pembagian sumber daya, penilaianmu biasanya lebih tepat dari perkiraanmu, tak perlu ragu.' },
      '6-59': { name: 'Sakral—Solar Plexus | Kanal Perkawinan', trait: 'Menggunakan gelombang emosi untuk mencari keintiman sejati yang bisa menembus pertahanan orang lain.', daily: 'Saat ingin lebih dekat, biarkan gelombang emosi mengendap dulu, jangan memaksakan kedekatan di titik tertinggi atau terendah.' },
      '30-41': { name: 'Solar Plexus—Root | Kanal Pengakuan', trait: 'Dorongan tanpa henti untuk pengalaman baru dan mimpi, yang juga bisa membawa ketegangan emosi.', daily: 'Keinginan itu bukan kesalahan, biarkan emosi jernih dulu, baru putuskan apakah benar-benar akan bertindak.' },
      '39-55': { name: 'Solar Plexus—Root | Kanal Ekspresi Emosi', trait: 'Naik turunnya emosi itu sendiri adalah energi yang memancing dan mencipta, memicu reaksi orang lain.', daily: 'Suasana hati yang turun bukan berarti ada yang salah, itu mungkin hanya bagian normal dari gelombang emosimu.' },
      '19-49': { name: 'Solar Plexus—Root | Kanal Sintesis', trait: 'Sangat peka terhadap kebutuhan dan ikatan emosi kelompok — menghargai rasa diterima.', daily: 'Saat merasa disingkirkan, cek dulu apakah itu benar-benar terjadi, atau kepekaan lama yang bereaksi.' },
      '26-44': { name: 'Jantung—Limpa | Kanal Penyerahan', trait: 'Penilaian naluriah tentang siapa yang bisa dipercaya dan siapa yang pantas diberi sumber daya.', daily: 'Kesan naluriah pertamamu tentang seseorang biasanya akurat, jangan buru-buru membantahnya dengan logika.' },
      '37-40': { name: 'Jantung—Solar Plexus | Kanal Komunitas', trait: 'Membangun komunitas atau keluarga yang saling mendukung dan penuh rasa memiliki lewat siklus emosi.', daily: 'Biarkan komitmen penting mengendap satu siklus emosi dulu sebelum benar-benar mengiyakan.' },
    },
  },
  resonance: {
    questionPrefix: 'Tanyakan ke guru: ',
    understandPrefix: 'Cara mulai yang berguna',
  },
  insight: {
    memberNoteKicker: 'CATATAN ANGGOTA',
    memberNoteTitle: 'Kumpulkan pesan yang beresonansi',
    memberNoteEmpty: 'Buka satu kartu dan tandai yang terasa benar.',
    memberNoteCount: '{count} ditandai — kembali ke sini saat bertemu guru.',
    cardSubtitleFallback: 'Kartu bacaan',
    cardExpand: 'Buka bacaan',
    cardCollapse: 'Tutup bacaan',
    cardResonate: 'Ini beresonansi',
    cardResonated: 'Ditambahkan ke sesi ini',
    expandAll: 'Tampilkan semua {count} kartu',
    collapseAll: 'Ciutkan kartu',
  },
  personalReading: {
    thisReminder: 'Pengingat Anda',
    setReminder: 'Jadikan pengingat',
    reminderSet: 'Pengingat sudah diatur',
  },
  game: {
    kicker: 'PETA BACAAN',
    title: 'Cara membaca hasil ini',
    plainNote: 'Tidak perlu membaca semua istilah sekaligus. Ikuti tiga langkah: baca ringkasan utama, lihat diagram visual, lalu pilih satu pengingat untuk dicoba hari ini.',
    arLink: 'Lihat diagram visual',
    stepPrefix: 'LANGKAH',
  },
  nextSteps: {
    kicker: 'ALUR BACAAN',
    title: 'Apa yang harus dilakukan selanjutnya',
    bookTeacher: 'Pesan guru',
    viewHistory: 'Lihat riwayat bacaan',
  },
  actionPath: {
    kicker: 'ORIENTASI ANGGOTA',
    title: 'Tiga langkah jelas berikutnya',
    body: 'Simpan dulu, kunjungi lagi nanti, lalu bawa pertanyaan paling berkesan ke guru untuk sesi yang lebih dalam.',
    saveTitle: 'Simpan bacaan ini',
    saveLabel: 'Masuk dan simpan',
    dailyTitle: 'Kembali ke ritual harian',
    dailyBody: 'Kembali besok untuk kartu atau rune harian agar platform menjadi teman tetap, bukan alat sekali pakai.',
    dailyLabel: 'Ritual harian',
    consultTitle: 'Pesan bacaan lebih dalam',
    consultBody: 'Jika sebuah kartu atau bagian diagram benar-benar mendarat, bawa pertanyaan itu ke guru.',
    consultLabel: 'Cari guru',
    footerSave: 'Simpan bacaan ini',
    footerConsult: 'Cari guru',
  },
  unlock: {
    kicker: 'DIPERLUAS ANGGOTA',
    title: 'Bacaan diperluas',
    body: 'Masuk untuk mengakses penjelasan mendalam dan bacaan harian, bulanan, dan tahunan yang diperluas. Alat gratis sudah lengkap — ini opsional.',
    memberStatusLabel: 'Status anggota',
    memberLoggedIn: 'Masuk',
    memberPending: '...',
    memberGuest: '—',
    guestBody: 'Masuk untuk melihat bacaan diperluas. Wawasan harian, bulanan, dan tahunan akan disimpan ke akun anggota Anda.',
    guestLogin: 'Masuk untuk melihat',
    dailyTitle: 'Ritual harian',
    dailyDone: 'Check-in harian selesai untuk hari ini.',
    dailyPending: 'Selesaikan ritual harian untuk membuka bacaan diperluas.',
    claimBtn: 'Selesaikan check-in harian',
    claimedBtn: 'Selesai untuk hari ini',
    claimingBtn: 'Memproses...',
    alreadyViewed: 'Sudah dilihat',
    loadingContent: 'Memuat...',
    viewBtn: 'Lihat {label}',
    loadBtn: 'Muat konten',
    noticeAlreadyUnlocked: '{label} sudah tersedia.',
    noticeUnlocked: 'Konten {label} dimuat.',
  },
  ziweiGuide: {
    kicker: 'Panduan Zi Wei',
    title: 'Lihat tiga hal ini sebelum dua belas istana',
    body: 'Zi Wei bukan tentang menghafal semua dua belas istana sekaligus. Mulai dengan sumbu utama, lalu pergi ke istana yang sesuai pertanyaan nyata Anda.',
    noMajorStar: 'Tidak ada bintang utama. Periksa istana berlawanan dan empat segitiga utama.',
    mingGongLabel: 'Istana Kehidupan',
    shenGongLabel: 'Istana Raga',
    wuxingLabel: 'Siklus Lima Elemen',
    mingGongDesc: 'Istana Kehidupan adalah sumbu utama hidup Anda — menunjukkan cara Anda biasa menghadapi dunia dan kesan yang mudah dirasakan orang lain saat pertama kali bertemu Anda.',
    shenGongDesc: 'Istana Raga adalah cara Anda mendarat — menunjukkan gaya yang makin sering Anda gunakan saat membuat keputusan, memikul tanggung jawab, dan menumpuk pengalaman hidup.',
    wuxingDesc: 'Siklus Lima Elemen adalah warna dasar peta nasib Anda — membantu Anda memahami ritme seluruh peta, bukan sebagai vonis baik-buruk melainkan sebagai cara energi bekerja.',
    questionRoutes: [
      { topic: 'Hubungan', palace: 'Istana Pasangan', body: 'Pola hubungan, keamanan emosional, dan dinamika pasangan.' },
      { topic: 'Karier', palace: 'Istana Karier', body: 'Gaya kerja, arah karier, dan di mana menginvestasikan energi.' },
      { topic: 'Keuangan', palace: 'Istana Kekayaan', body: 'Cara mendapat penghasilan, aliran sumber daya, dan tekanan keuangan.' },
      { topic: 'Keluarga', palace: 'Properti / Orang Tua / Saudara', body: 'Dukungan keluarga, rasa rumah, dan hubungan dekat.' },
      { topic: 'Eksternal', palace: 'Istana Migrasi', body: 'Pengembangan di luar rumah, kemitraan, dan pergeseran lingkungan.' },
    ],
  },
  palaceNoStar: 'Tidak ada bintang utama. Periksa istana berlawanan dan empat segitiga utama.',
  disclaimer: 'Hasil hanya untuk eksplorasi diri dan tidak merupakan diagnosis, perawatan, saran medis, atau psikologis profesional apa pun. Jika Anda mengalami kesulitan fisik atau mental, carilah dukungan profesional.',
  error: {
    title: 'Bacaan gagal',
    apiHint: 'Harap konfirmasi backend API sedang berjalan, atau coba kirim ulang nanti.',
  },
  loading: {
    label: 'Menyiapkan bacaan Anda...',
  },
  notices: {
    insufficientPoints: 'Tidak dapat melihat sekarang. Kembali besok atau selesaikan ritual harian terlebih dahulu.',
    notAuthenticated: 'Harap masuk untuk melihat konten diperluas.',
    generic: 'Terjadi kesalahan. Silakan coba lagi.',
    claimSuccess: 'Check-in harian selesai. Anda dapat melihat konten diperluas.',
    claimAlready: 'Sudah check-in hari ini. Kembali besok.',
    signInFirst: 'Harap selesaikan ritual harian sebelum melihat konten diperluas.',
  },
  unlockOptions: {
    deep_reading: {
      label: 'Bacaan mendalam',
      title: 'Lihat penjelasan lengkap',
      body: 'Baca interpretasi bahasa sederhana yang lebih lengkap: kekuatan, titik macet, apa yang perlu diperhatikan sekarang, dan satu tindakan kecil untuk hari ini.',
    },
    transit_day: {
      label: 'Transit harian',
      title: 'Lihat transit harian hari ini',
      body: 'Lihat cara menggunakan hasil ini hari ini: di mana bisa maju, di mana harus pelan, dan hindari membiarkan emosi mengambil keputusan.',
    },
    transit_month: {
      label: 'Transit bulanan',
      title: 'Lihat bacaan transit bulan ini',
      body: 'Lihat tema bulan ini: apa yang perlu dibangun secara bertahap, apa yang perlu dihindari, dan arah untuk diperiksa setiap minggu.',
    },
    transit_year: {
      label: 'Transit tahunan',
      title: 'Lihat bacaan transit tahun ini',
      body: 'Lihat gambaran besar tahun ini: apa yang layak investasi jangka panjang, kebiasaan mana yang perlu disesuaikan.',
    },
  },
  nextStepsTools: {
    numerology: [
      { title: 'Mulai dengan angka inti', body: 'Lihat Angka Jalur Kehidupan, Angka Hari Lahir, dan arketipe dulu — lalu kembali untuk memahami pola tindakan yang biasa Anda gunakan.' },
      { title: 'Ubah angka menjadi arah tindakan', body: 'Setiap angka inti memiliki kecenderungan perilaku spesifik. Temukan bagian "satu hal yang bisa dilakukan hari ini" dalam hasil dan pilih pengingat yang benar-benar bisa diterapkan.' },
      { title: 'Hubungkan dengan konteks nyata', body: 'Jika ingin menjelajahi karier, hubungan, atau tema tahunan, bawa hasil ini ke guru untuk percakapan yang lebih mendalam.' },
    ],
    maya: [
      { title: 'Temukan kalimat yang tepat sasaran', body: 'Jangan mulai dengan istilah. Temukan bagian yang menggambarkan cara Anda bergerak saat lancar — dan bereaksi saat terjebak. Jika beresonansi, lanjutkan membaca.' },
      { title: 'Lihat cara papan oracle bekerja bersama', body: 'Kelahiran adalah sumbu utama, Panduan adalah langkah berikutnya, Dukungan adalah sumber daya, Tantangan adalah titik macet, Kekuatan Tersembunyi adalah yang muncul di saat sulit. Perhatikan bagaimana lima peran membagi pekerjaan.' },
      { title: 'Lakukan satu percobaan kecil hari ini', body: 'Ubah hasil menjadi satu tindakan dalam 24 jam: katakan sesuatu, lepaskan sesuatu, tetapkan batas. Perhatikan perasaan dan umpan balik Anda.' },
    ],
    bazi: [
      { title: 'Mulai dengan Tuan Hari dan Lima Elemen', body: 'Tuan Hari menunjukkan kualitas inti Anda. Distribusi Lima Elemen menunjukkan dari mana sumber daya dan tekanan Anda berasal.' },
      { title: 'Baca Empat Pilar sebagai lapisan waktu', body: 'Pilar Tahun mencakup masa awal dan dunia luar, Pilar Bulan mencakup lingkungan kerja, Pilar Hari mencakup diri dan hubungan, Pilar Jam mencakup perkembangan jangka panjang — masing-masing menggambarkan adegan kehidupan yang berbeda.' },
      { title: 'Hubungkan dengan situasi nyata', body: 'Ba Zi cocok untuk mengeksplorasi ritme karier, dinamika hubungan, dan keputusan jangka panjang. Bawa pertanyaan spesifik untuk lebih mendalam.' },
    ],
    ziwei: [
      { title: 'Mulai dengan Istana Kehidupan dan Istana Raga', body: 'Istana Kehidupan adalah sumbu utama; Istana Raga adalah cara energi itu mendarat dalam praktik. Padukan dengan bintang utama untuk memahami karakter.' },
      { title: 'Masuk dari pertanyaan yang benar-benar Anda miliki', body: 'Hubungan → Istana Pasangan. Karier → Istana Karier. Uang → Istana Kekayaan. Mulai dari area yang paling penting saat ini alih-alih membaca setiap istana sekaligus.' },
      { title: 'Pilih satu istana untuk diperdalam', body: 'Jangan coba membaca semuanya sekaligus. Mulailah dengan istana yang sesuai pertanyaan Anda saat ini — karier, hubungan, atau keuangan.' },
    ],
    tarot: [
      { title: 'Kembali ke pertanyaan dan posisi', body: 'Ingat apa yang Anda tanyakan, lalu lihat di mana setiap kartu berada — masa lalu, sekarang, atau masa depan.' },
      { title: 'Baca wajah kartu dan orientasinya', body: 'Layar menampilkan nama kartu, tegak atau terbalik, kata kunci, dan gaya deck yang Anda pilih.' },
      { title: 'Ubah jawaban menjadi satu tindakan', body: 'Akhiri dengan mengidentifikasi satu langkah yang bisa Anda ambil hari ini. Bacaan paling berguna ketika mendorong Anda maju.' },
    ],
    runes: [
      { title: 'Mulai dengan rune dan orientasinya', body: 'Pesan rune cenderung langsung. Lihat tema inti dulu, lalu apakah menunjuk ke hambatan atau sumber daya.' },
      { title: 'Cocokkan kata kunci dengan hari ini', body: 'Setiap rune memiliki set kata kunci tegak dan terbalik. Pegang yang sesuai dengan situasi Anda saat ini dan biarkan itu memandu fokus Anda — bukan sebagai prediksi melainkan sebagai kerangka.' },
      { title: 'Tulis satu kalimat tindakan untuk hari ini', body: 'Rangkum hasil menjadi satu pengingat yang bisa Anda lakukan hari ini. Kebiasaan itu membangun alasan paling alami untuk kembali.' },
    ],
    astro: [
      { title: 'Mulai dengan Matahari, Bulan, dan Ascendant', body: 'Matahari menunjukkan niat inti, Bulan menunjukkan kebutuhan emosional, Ascendant menunjukkan cara Anda menghadapi dunia luar.' },
      { title: 'Perhatikan kesenjangan antara ketiganya', body: 'Membaca Matahari, Bulan, dan Ascendant bersama mengungkap perbedaan antara apa yang Anda inginkan, butuhkan, dan apa yang dilihat orang lain — dan di mana lapisan-lapisan itu selaras atau saling tarik.' },
      { title: 'Lalu lihat rumah dan aspek', body: 'Saat ingin memahami peristiwa kehidupan tertentu dengan lebih tepat, perdalam penempatan rumah dan aspek planet.' },
    ],
    humandesign: [
      { title: 'Mulai dengan Tipe dan Otoritas', body: 'Tipe Anda membentuk cara Anda terlibat dengan dunia; Otoritas Batin membimbing cara membuat keputusan yang terasa tepat.' },
      { title: 'Temukan pusat yang terdefinisi di BodyGraph', body: 'Pusat berwarna adalah sumber energi konsisten Anda; pusat putih adalah tempat Anda paling mudah dipengaruhi orang lain. Melihat batas itu adalah fondasi untuk segalanya.' },
      { title: 'Pilih tiga gerbang aktif untuk dijelajahi', body: 'Pilih tiga gerbang aktif yang paling beresonansi kuat. Tidak perlu mengerjakan semuanya sekaligus.' },
    ],
  },
  mayaOracle: {
    eyebrow: 'MAYA ORACLE',
    title: 'Papan Nujum Lima Kin',
    subtitle: 'Selain Kin kelahiran Anda, ada empat kekuatan lain yang membentuk hari Anda: Panduan, Pendukung, Penentang, dan Tersembunyi. Berikut peran masing-masing.',
    heroLabel: 'Kin Kelahiran',
    roles: { self: 'Diri', guide: 'Panduan', analog: 'Pendukung', antipode: 'Penentang', occult: 'Tersembunyi' },
    bodies: {
      self: 'Irama inti Anda — energi yang paling alami Anda gunakan sehari-hari.',
      guide: 'Arah yang bisa dipinjam saat Anda buntu: tanyakan seperti apa langkah kecil berikutnya.',
      analog: 'Stasiun pendukung Anda. Saat butuh bantuan, kembalilah ke energi ini.',
      antipode: 'Sebuah penentang yang tampak — pengingat untuk mematangkan kualitas yang seolah ia tentang.',
      occult: 'Sumber daya tersembunyi yang muncul saat titik rendah atau kejutan, biasanya ketika Anda melepas kendali.',
    },
    crosscheck: {
      dreamspell: 'Dreamspell',
      tzolkin: 'Tzolkin Tradisional',
      haab: 'Haab',
      longCount: 'Long Count',
      thirteenMoon: '13 Moon',
    },
  },
};

const ja: ToolResultCopy = {
  arLoading: {
    kicker: 'VISUAL RESULT STAGE',
    title: 'ビジュアル結果ステージを準備しています',
    body: '結果は明確な 2D チャート、カードレイアウト、またはストーン面として表示されます。フル AR / 3D は準備ができ次第公開されます。',
  },
  hdPlanar: {
    factsKicker: '3秒で自分がわかる',
    factsTitle: 'まずここを見てから、BodyGraph へ',
    factsBody: '9つのエネルギーセンターと64のゲートを理解しなくても、自分が誰かはわかります。',
    scrollHint: '下にスクロールすると完全な BodyGraph とエネルギーセンターが見られます',
    stageKicker: 'さらに深く',
    stageTitle: 'BodyGraph は第二画面に',
    stageBody: '全体図は落ち着いた暗い背景のまま。定義されたセンターには印が付きます——気になるところから見てください。',
    legendOn: '定義済みセンター——安定して頼れるエネルギー源',
    legendOff: '未定義センター——外に開かれ、増幅されやすい',
    frameLabel: 'BodyGraph',
    frameNote: 'まずこの図から。すべてのゲートを一度に読む必要はありません',
    bodyToggleGraph: 'エネルギー図を見る',
    bodyToggleBody: '身体の部位と照らし合わせる',
    stateDefined: '定義済み（安定して機能）',
    stateUndefined: '未定義（状況によって変わる）',
    bodyPartLabel: '身体の部位',
    closeLabel: '閉じる',
    dailyLabel: '日常での感じ方',
    channelsTitle: '定義されているチャンネル',
    channelsHint: '光っている線はすべて、安定して働く才能です。リストか図の線をタップして意味を見てみましょう。',
    channelsEmpty: '定義されたチャンネルは見つかりませんでした。これはエネルギーが主に他のセンターを通って流れているという意味で、欠点ではありません。',
    gateLabel: 'ゲート',
    circuitLabel: '回路グループ（簡易分類）',
    circuitIndividual: '個人回路——自分らしく、自分のやり方で生きる',
    circuitTribal: '部族回路——支え合い、資源、親密さ',
    circuitCollective: '集合回路——共有し、論理を伝え、経験を受け渡す',
    circuitDisclaimer: 'この回路分類は線のグループを見分けやすくするための簡易版で、厳密な回路理論ではありません。初心者向けの参考としてご覧ください。',
    channelGenericName: 'ゲート{gate1}とゲート{gate2}のチャンネル',
    channelGenericTrait: 'ゲート{gate1}と{gate2}が安定してつながり、一つのチャンネルになっています。このエネルギーはたまにではなく、あなたの中で継続的に働いています。',
    channelGenericDaily: 'この二つのゲートのテーマが自分の選択の中でいつ現れるか意識してみましょう。それが信頼できる固定的な才能です。',
    centers: {
      Head: { label: 'ヘッド', bodyPart: '頭頂部', meaning: 'インスピレーションと問いの源。答えではなく、問いを生み出します。', definedTip: '考えが浮かんだらすぐ答えを出そうとせず、少しそのままにしておきましょう。答えは静けさの後にやってくることが多いです。', undefinedTip: '他人の疑問に影響されて考えすぎてしまいがちです。「これは自分の疑問？それとも誰かの？」と自問してみましょう。' },
      Ajna: { label: 'アジナ', bodyPart: '眉間・額', meaning: '思考、分析、結論づけを担当する、脳の論理センターです。', definedTip: '物事に対して固定した見方を持ちやすいのは才能です。時には他の視点も受け入れてみましょう。', undefinedTip: '考えが日によって変わりやすいタイプ。「まだ考え中」と言ってもいいのです。' },
      Throat: { label: 'スロート', bodyPart: '喉', meaning: '表現と行動の出口。エネルギーは最終的にここを通って言葉や行動になります。', definedTip: 'あなたの言葉には本当に重みがあります。自分が最も「聞いてもらえる」場面を意識してみましょう。', undefinedTip: 'つい人の話に割り込みがち。話したくなったら一呼吸おいて、本当に今言う必要があるか確かめましょう。' },
      G: { label: 'Gセンター', bodyPart: '胸・心臓のあたり', meaning: 'アイデンティティ、方向性、愛のセンター。あなたがどこへ向かい、誰であるかを決めます。', definedTip: '自分が誰で、どこへ向かうかがはっきりしていることが多いはず。その確信を堂々と持って進みましょう。', undefinedTip: '周りの人によって自分が違って見えることがありますが、方向性が揺れ動くのはあなたにとって自然なことです。' },
      Heart: { label: 'ハート／意志', bodyPart: '胸の右寄り・心臓のあたり', meaning: '意志力、自己価値、有言実行の力。物質的な資源への原動力でもあります。', definedTip: '生まれつき有言実行できるタイプ。自分を証明するために約束しすぎないよう気をつけましょう。', undefinedTip: '自分に厳しくなりがちですが、証明しなくても価値はすでにあります。' },
      Sacral: { label: 'セイクラル', bodyPart: '下腹部・仙骨のあたり', meaning: '純粋な生命力と働くエネルギー。声で「イエス」「ノー」を伝えます。', definedTip: '決める前にお腹の直感的な反応に注目しましょう。考えるより正確です。', undefinedTip: '無自覚に自分の許容量を超えてしまいがち。疲れを感じたら、それが止めるサインです。' },
      SolarPlexus: { label: 'ソーラープレクサス', bodyPart: '胃・横隔膜のあたり', meaning: '感情の波のセンターで、感情的な明晰さへの通り道です。', definedTip: 'あなたの真実は「今」にはありません。大きな決断は一晩寝かせてから決めましょう。', undefinedTip: '他人の感情を自分のものとして吸収しがち。気分が急に変わったら、それが誰の感情か確かめてみましょう。' },
      Spleen: { label: 'スプリーン', bodyPart: '上腹部・脾臓のあたり', meaning: '身体の直感レーダー。恐れ、免疫、今この瞬間の安全感を司ります。', definedTip: 'あなたの直感はとても正確ですが、一瞬で消えてしまいます。最初の反応をつかみましょう。', undefinedTip: 'ちょっとしたことで緊張しがち。「この恐れは今本当にあるものか、それとも古い習慣的な反応か」を確かめましょう。' },
      Root: { label: 'ルート', bodyPart: '尾てい骨・骨盤底', meaning: 'アドレナリンとプレッシャーのエンジン。物事をやり遂げる原動力です。', definedTip: '人より多くのプレッシャーに耐えられます。適度な緊張感がむしろ効率を上げてくれます。', undefinedTip: '締め切りに息苦しさを感じがちですが、すべての急ぎが今すぐ対応すべきものとは限りません。' },
    },
    channels: {
      '20-34': { name: 'スロート—セイクラル｜カリスマのチャンネル', trait: '身体の直感的な行動力を、そのまま見える形の表現とカリスマに変える。', daily: '「やりたい」と思ったらすぐ動く感覚は正確なことが多いですが、頭が先走っていないか、セイクラルが本当に応えているか確認しましょう。' },
      '20-57': { name: 'スロート—スプリーン｜ブレインウェーブのチャンネル', trait: 'その場の直感を最速で明確な言葉に変える。', daily: 'とっさに口から出た直感的な判断が一番正確なことが多いので、考えすぎずに言葉にしてみましょう。' },
      '10-20': { name: 'スロート—Gセンター｜覚醒のチャンネル', trait: '「自分は誰か」という確信を、目に見える行動と存在感に変える。', daily: '自分が誰かはっきりしたら、そのまま行動に移しましょう。誰かの承認を待つ必要はありません。' },
      '34-57': { name: 'セイクラル—スプリーン｜パワーのチャンネル', trait: '生命力と直感を組み合わせ、安定した存在感のある力にする。', daily: '身体がしっくりきて、直感も安全だと感じるなら、それは全力で取り組む価値があることです。' },
      '2-14': { name: 'Gセンター—セイクラル｜ビートのチャンネル', trait: '方向感覚と安定した原動力を組み合わせ、一歩ずつ資源を正しい場所へ運ぶ。', daily: 'まず方向が正しいか確認し、あとは身体の原動力に任せましょう。一気に完璧を目指す必要はありません。' },
      '10-34': { name: 'Gセンター—セイクラル｜探求のチャンネル', trait: '自分の信念に忠実であり、それを身体の原動力で実践する。', daily: '周りに合わせるために核となる信念を曲げないでください。あなたの原動力は自分の信じることを生きるためのものです。' },
      '25-51': { name: 'Gセンター—ハート｜イニシエーションのチャンネル', trait: '愛と勢いで新しい局面を切り開く。多少の衝撃を伴うこともあります。', daily: '「誰かが最初に飛び込むべき」という場面では、あなたは他の人より向いていることが多いです。' },
      '21-45': { name: 'スロート—ハート｜マネーライン', trait: '資源や物質をコントロールし、管理・配分する生まれ持った力。', daily: 'お金や資源の配分を話すとき、あなたの判断は思っているより的確なので、遠慮しなくて大丈夫です。' },
      '6-59': { name: 'セイクラル—ソーラープレクサス｜メイティングのチャンネル', trait: '感情の波を使って、防御を越えた本当の親密さを見つける。', daily: '距離を縮めたいときは感情の波が落ち着くのを待ちましょう。感情の高低差の激しいタイミングで無理に近づかないこと。' },
      '30-41': { name: 'ソーラープレクサス—ルート｜リコグニションのチャンネル', trait: '新しい経験や夢への尽きない渇望があり、感情的な緊張も伴いやすい。', daily: 'その渇望自体は悪いことではありません。まず感情を明確にしてから、本当に行動するか決めましょう。' },
      '39-55': { name: 'ソーラープレクサス—ルート｜エモーティングのチャンネル', trait: '感情の起伏そのものが、周りを刺激し創造性を生むエネルギーになる。', daily: '気分が落ち込んでいても何か問題があるわけではなく、感情の波の正常な一部であることが多いです。' },
      '19-49': { name: 'ソーラープレクサス—ルート｜シンセシスのチャンネル', trait: '集団のニーズや感情的なつながりに特に敏感で、受け入れられている感覚を大切にする。', daily: '疎外感を覚えたときは、それが本当に起きていることか、古い敏感さが反応しているだけかを確かめましょう。' },
      '26-44': { name: 'ハート—スプリーン｜サレンダーのチャンネル', trait: '誰を信じ、誰に資源を託すべきか、直感的に判断する。', daily: '人に対する最初の直感的な印象はたいてい正確なので、論理で無理に打ち消さないようにしましょう。' },
      '37-40': { name: 'ハート—ソーラープレクサス｜コミュニティのチャンネル', trait: '感情のサイクルを通じて、支え合い、居場所を感じられるコミュニティや家庭を築く。', daily: '大事な約束は感情のサイクルを一巡させてから、本当に引き受けるか決めましょう。' },
    },
  },
  resonance: {
    questionPrefix: '先生に聞く: ',
    understandPrefix: 'まずこう理解してみてください',
  },
  insight: {
    memberNoteKicker: 'メンバーノート',
    memberNoteTitle: '響いたメッセージを集めましょう',
    memberNoteEmpty: 'カードを開いて、真実と感じるものをマークしてください。',
    memberNoteCount: '{count} 件マーク済み — 先生に会う時に戻ってみましょう。',
    cardSubtitleFallback: 'リーディングカード',
    cardExpand: 'リーディングを開く',
    cardCollapse: 'リーディングを閉じる',
    cardResonate: '響きます',
    cardResonated: 'このセッションに追加済み',
    expandAll: 'すべての {count} 枚を表示',
    collapseAll: 'カードをたたむ',
  },
  personalReading: {
    thisReminder: 'あなたへのリマインダー',
    setReminder: 'リマインダーに設定',
    reminderSet: '設定済み',
  },
  game: {
    kicker: 'リーディングマップ',
    title: 'この結果の読み方',
    plainNote: '全ての用語を一度に読む必要はありません。3 ステップで: キーサマリーを読む、ビジュアルチャートを見る、今日試すリマインダーを一つ選ぶ。',
    arLink: 'ビジュアルチャートを見る',
    stepPrefix: 'ステップ',
  },
  nextSteps: {
    kicker: 'リーディングフロー',
    title: '次にすること',
    bookTeacher: '先生を予約する',
    viewHistory: 'リーディング履歴を見る',
  },
  actionPath: {
    kicker: 'メンバーオンボーディング',
    title: '3 つの明確な次のステップ',
    body: 'まず保存し、後で見直し、最も響いた質問を先生に持っていきましょう。',
    saveTitle: 'このリーディングを保存',
    saveLabel: 'ログインして保存',
    dailyTitle: 'デイリーリチュアルに戻る',
    dailyBody: '明日戻ってデイリーカードやルーンを引き、プラットフォームを一度きりのツールではなく安定した伴走者にしましょう。',
    dailyLabel: 'デイリーリチュアル',
    consultTitle: '深いリーディングを予約',
    consultBody: 'カードやチャートの一部が心に刺さったら、その質問を先生に持っていきましょう。',
    consultLabel: '先生を探す',
    footerSave: 'このリーディングを保存',
    footerConsult: '先生を探す',
  },
  unlock: {
    kicker: 'メンバー拡張',
    title: '拡張リーディング',
    body: 'ログインして詳細な説明と日次・月次・年次の拡張リーディングにアクセスできます。無料ツールは既に完全です — これはオプションです。',
    memberStatusLabel: 'メンバーステータス',
    memberLoggedIn: 'ログイン中',
    memberPending: '...',
    memberGuest: '—',
    guestBody: 'ログインして拡張リーディングを閲覧。毎日・毎月・毎年のインサイトはメンバーアカウントに保存されます。',
    guestLogin: 'ログインして閲覧',
    dailyTitle: 'デイリーリチュアル',
    dailyDone: '本日のチェックイン完了。',
    dailyPending: 'デイリーリチュアルを完了して拡張リーディングを解放してください。',
    claimBtn: 'デイリーチェックインを完了',
    claimedBtn: '本日分完了',
    claimingBtn: '処理中...',
    alreadyViewed: '閲覧済み',
    loadingContent: '読み込み中...',
    viewBtn: '{label} を閲覧',
    loadBtn: 'コンテンツを読み込む',
    noticeAlreadyUnlocked: '{label} はすでに閲覧可能です。',
    noticeUnlocked: '{label} コンテンツを読み込みました。',
  },
  ziweiGuide: {
    kicker: '紫微斗数ガイド',
    title: '12 の宮に入る前にこの 3 つを見てください',
    body: '紫微斗数は 12 宮すべてを一度に覚えることではありません。まずメインの軸から始め、次に実際の質問に合う宮に進みましょう。',
    noMajorStar: '主星なし。対宮と四正三合を確認してください。',
    mingGongLabel: '命宮',
    shenGongLabel: '身宮',
    wuxingLabel: '五行局',
    mingGongDesc: '命宮は人生の主軸です。あなたが世界とどのように向き合うかの習慣と、他者が第一印象で感じやすい雰囲気を示します。',
    shenGongDesc: '身宮は着地の方法です。成長するにつれてより多く使うようになる意思決定や責任の担い方、人生の積み上げ方のスタイルを表します。',
    wuxingDesc: '五行局は命盤の地色です。命盤全体のリズムを理解するためのもので、吉凶の判決ではなく、エネルギーの働き方です。',
    questionRoutes: [
      { topic: '恋愛', palace: '夫妻宮', body: '関係パターン、感情的な安全、パートナーの動態。' },
      { topic: '仕事', palace: '官禄宮', body: '仕事スタイル、キャリアの方向、エネルギーを投資する場所。' },
      { topic: '財務', palace: '財帛宮', body: '稼ぎ方、リソースの流れ、財務的なプレッシャー。' },
      { topic: '家族', palace: '田宅 / 父母 / 兄弟', body: '家族のサポート、ホームの感覚、親しい関係。' },
      { topic: '外部', palace: '遷移宮', body: '外での発展、パートナーシップ、環境の変化。' },
    ],
  },
  palaceNoStar: '主星なし。対宮と四正三合を確認してください。',
  disclaimer: '結果は自己探求のためのみであり、いかなる診断、治療、医療上または専門的な心理的アドバイスも構成しません。身体的または精神的な苦痛を経験している場合は、専門的なサポートを求めてください。',
  error: {
    title: 'リーディング失敗',
    apiHint: 'バックエンド API が実行中か確認するか、後ほど再送信してください。',
  },
  loading: {
    label: 'リーディングを準備しています...',
  },
  notices: {
    insufficientPoints: 'ただいまご覧いただけません。明日戻るか、デイリーリチュアルを先に完了してください。',
    notAuthenticated: '拡張コンテンツを閲覧するにはログインしてください。',
    generic: 'エラーが発生しました。もう一度お試しください。',
    claimSuccess: 'デイリーチェックイン完了。拡張コンテンツを閲覧できます。',
    claimAlready: '本日はすでにチェックイン済みです。明日また来てください。',
    signInFirst: '拡張コンテンツを閲覧する前にデイリーリチュアルを完了してください。',
  },
  unlockOptions: {
    deep_reading: {
      label: '詳細リーディング',
      title: '完全な解説を見る',
      body: 'より完全な平易な解説を読む: 強み、詰まりポイント、今注意すべきこと、今日できる小さなアクション。',
    },
    transit_day: {
      label: '日次トランジット',
      title: '今日の日次トランジットを見る',
      body: '今日この結果をどう活かすか: どこで前進できるか、どこでペースを落とすか、感情に判断させないために。',
    },
    transit_month: {
      label: '月次トランジット',
      title: '今月のトランジットリーディングを見る',
      body: '今月のテーマ: 着実に積み上げるべきこと、消耗を避けること、毎週チェックする方向性。',
    },
    transit_year: {
      label: '年次トランジット',
      title: '今年のトランジットリーディングを見る',
      body: '今年の全体像: 長期投資に値するもの、調整すべき習慣、年を歩きやすい段階に分ける方法。',
    },
  },
  nextStepsTools: {
    numerology: [
      { title: 'まずコアナンバーから', body: 'ライフパスナンバー、バースデーナンバー、アーキタイプを先に見てから、普段の行動パターンへ戻りましょう。' },
      { title: '数字を行動の方向に変換する', body: 'コアナンバーにはそれぞれ具体的な行動傾向があります。結果の「今日できることひとつ」という部分を見つけて、実際に使えるリマインダーを選んでください。' },
      { title: 'リアルなテーマに結びつける', body: 'キャリア・関係・年のテーマを深く探りたいなら、この結果を持って先生に相談してみましょう。' },
    ],
    maya: [
      { title: '刺さる一文を見つける', body: '用語から入らないで。「調子がいいときどう動くか、詰まるとどう反応するか」の部分を先に読んで、響いたら続けましょう。' },
      { title: 'オラクルボードのつながりを見る', body: '本命が主軸、ガイダンスが次の一歩、サポートが補給、チャレンジが詰まり、ヒドゥンパワーが低潮期に現れるもの。5つの役割がどう仕事を分担しているかに注目しましょう。' },
      { title: '今日ひとつだけ小さな実験を', body: '結果を 24 時間以内にできる行動に変えましょう：何か言う、手放す、境界を整える。自分の感覚やフィードバックをそのまま観察してください。' },
    ],
    bazi: [
      { title: 'まず日主と五行から', body: '日主は世界に対するあなたの基本的な質を示します。五行の分布はリソースとプレッシャーの出どころを教えてくれます。' },
      { title: '四柱を時間の層として読む', body: '年柱は幼少期と外の世界、月柱は仕事環境、日柱は自分と関係、時柱は長期的な発展を表します——それぞれが異なる人生のシーンを描いています。' },
      { title: '実際の場面と結びつける', body: '八字はキャリアのリズム、関係の動き、長期的な意思決定の探求に向いています。具体的な問いを持ってくると深く読めます。' },
    ],
    ziwei: [
      { title: 'まず命宮と身宮から', body: '命宮は人生の主軸、身宮はそのエネルギーが実際に着地する方法。主星と組み合わせて性格を理解しましょう。' },
      { title: '本当に持っている問いから入る', body: '恋愛 → 夫妻宮。仕事 → 官禄宮。お金 → 財帛宮。すべての宮位を一度に読もうとせず、今最も重要な領域から始めましょう。' },
      { title: '一つの宮位を深く読む', body: '全部一度に読もうとしないで。今の問い（キャリア・関係・財務）に合う宮位から始めましょう。' },
    ],
    tarot: [
      { title: '問いと位置に戻る', body: '何を聞いたかを思い出してから、各カードがどの位置（過去・現在・未来）にあるかを見ましょう。' },
      { title: 'カードの絵柄と向きを読む', body: '画面にはカード名、正逆位、キーワード、選んだデッキスタイルが表示されます。' },
      { title: '答えを一つの行動に変える', body: '今日できる一歩を特定して終わりましょう。リーディングは前へ進む力になってこそ役立ちます。' },
    ],
    runes: [
      { title: 'まずルーンと向きから', body: 'ルーンのメッセージはたいてい直接的です。まずコアテーマを見て、障害を指しているのかリソースを指しているのかを確認しましょう。' },
      { title: 'キーワードを今日に当てはめる', body: 'ルーンには正位と逆位のキーワードセットがあります。今の状況に合う方を選んで焦点の指針にしてみましょう——予言ではなく視点として。' },
      { title: '今日の行動文を一つ書く', body: '結果を今日実行できるひとつのリマインダーに凝縮しましょう。その習慣が自然な再訪の動機になります。' },
    ],
    astro: [
      { title: 'まず太陽・月・アセンダントから', body: '太陽はコアの意志、月は感情的なニーズ、アセンダントは外の世界との出会い方を示します。' },
      { title: '三つの間のずれに気づく', body: '太陽・月・アセンダントを一緒に読むと、「望んでいること・必要としていること・他者に見えていること」の三層の差と重なりが見えてきます。' },
      { title: 'それからハウスとアスペクトへ', body: 'より具体的な人生の出来事を理解したいときに、ハウスの配置と惑星アスペクトを深く見ていきましょう。' },
    ],
    humandesign: [
      { title: 'まずタイプと権威から', body: 'タイプは世界との関わり方を形作り、内なる権威は自分らしい意思決定の方法を示します。' },
      { title: 'BodyGraph で定義されたセンターを見つける', body: '色が塗られたセンターがあなたの安定したエネルギー源、白いセンターは外から最も影響を受けやすい場所です。その境界を見極めることが他のすべての土台になります。' },
      { title: '共鳴する3つのゲートを選んで深く読む', body: '最も強く響いた活性化ゲートを3つ選びましょう。すべてを一度にこなす必要はありません。' },
    ],
  },
  mayaOracle: {
    eyebrow: 'MAYA ORACLE',
    title: '五つの刻印オラクル盤',
    subtitle: '本命キン以外にも、あなたの一日を形作る4つの力があります。導き・支持・対立・隠された力。それぞれの役割を見てみましょう。',
    heroLabel: '本命キン',
    roles: { self: '本命', guide: '導き', analog: '支持', antipode: '対立', occult: '隠された力' },
    bodies: {
      self: 'あなたの核となるリズム。日常で最も自然に使うエネルギーです。',
      guide: '行き詰まったときに借りる方向。次の小さな一歩は何かと問いかけてみましょう。',
      analog: 'あなたの補給地点。支えが必要なときはこのエネルギーに戻りましょう。',
      antipode: '一見対立するように見える力。実はその裏にある資質を成熟させるための合図です。',
      occult: '低調な時や予期せぬ出来事の中で現れる隠れた資源。コントロールを緩めたときに表れやすいものです。',
    },
    crosscheck: {
      dreamspell: 'Dreamspell',
      tzolkin: '伝統的ツォルキン',
      haab: 'Haab',
      longCount: 'Long Count',
      thirteenMoon: '13 Moon',
    },
  },
};

const ko: ToolResultCopy = {
  arLoading: {
    kicker: 'VISUAL RESULT STAGE',
    title: '비주얼 결과 스테이지 준비 중',
    body: '결과는 명확한 2D 차트, 카드 레이아웃 또는 돌 면으로 표시됩니다. 전체 AR / 3D는 준비되면 열립니다.',
  },
  hdPlanar: {
    factsKicker: '3초 만에 나를 이해하기',
    factsTitle: '이것부터 보고, BodyGraph로 들어가세요',
    factsBody: '9개 에너지 센터와 64개 게이트를 먼저 이해하지 않아도 내가 누구인지 알 수 있어요.',
    scrollHint: '아래로 스크롤하면 전체 BodyGraph와 에너지 센터를 볼 수 있어요',
    stageKicker: '더 깊이 보기',
    stageTitle: 'BodyGraph는 두 번째 화면으로',
    stageBody: '전체 차트는 차분한 어두운 배경을 유지합니다. 정의된 센터는 표시되니, 더 알고 싶은 곳부터 살펴보세요.',
    legendOn: '정의된 센터 — 안정적이고 믿을 수 있는 에너지원',
    legendOff: '미정의 센터 — 외부로 열려 있어 쉽게 증폭됨',
    frameLabel: 'BodyGraph',
    frameNote: '먼저 이 그림부터 보세요. 모든 게이트를 한 번에 읽을 필요는 없어요',
    bodyToggleGraph: '에너지 차트 보기',
    bodyToggleBody: '신체 부위와 비교하기',
    stateDefined: '정의됨 (안정적으로 작동)',
    stateUndefined: '정의되지 않음 (상황에 따라 달라짐)',
    bodyPartLabel: '신체 부위',
    closeLabel: '닫기',
    dailyLabel: '일상에서 느끼는 법',
    channelsTitle: '정의된 채널',
    channelsHint: '빛나는 선 하나하나가 안정적으로 작동하는 재능이에요. 목록이나 그림의 선을 눌러 어떤 의미인지 확인해 보세요.',
    channelsEmpty: '정의된 채널이 감지되지 않았어요. 에너지가 주로 다른 센터를 통해 흐른다는 뜻이며, 단점이 아니에요.',
    gateLabel: '게이트',
    circuitLabel: '회로 그룹 (단순화 분류)',
    circuitIndividual: '개인 회로——자기다움, 자신만의 방식으로 살기',
    circuitTribal: '부족 회로——지지, 자원, 친밀함',
    circuitCollective: '집단 회로——공유, 논리, 경험 전달',
    circuitDisclaimer: '회로 분류는 선 그룹을 쉽게 구분하기 위한 단순화 버전이며, 엄격한 학술적 회로 이론이 아니라 입문자를 위한 참고용입니다.',
    channelGenericName: '게이트 {gate1}과(와) 게이트 {gate2}로 이루어진 채널',
    channelGenericTrait: '게이트 {gate1}과 {gate2}가 안정적으로 연결되어 하나의 채널을 이룹니다. 이 에너지는 가끔이 아니라 당신 안에서 지속적으로 작동해요.',
    channelGenericDaily: '이 두 게이트의 주제가 당신의 선택 속에서 언제 나타나는지 살펴보세요. 그것이 보통 믿을 수 있는 고정된 재능이에요.',
    centers: {
      Head: { label: '헤드', bodyPart: '정수리', meaning: '영감과 질문의 원천으로, 답이 아니라 생각과 질문을 만들어냅니다.', definedTip: '머릿속에 생각이 떠올라도 서둘러 답하지 마세요. 질문을 잠시 머물게 하면 답은 보통 고요함 뒤에 옵니다.', undefinedTip: '남의 의문에 쉽게 전염되어 생각이 많아지기 쉬워요. "이건 내 질문일까, 남의 질문일까?"를 먼저 물어보세요.' },
      Ajna: { label: '아즈나', bodyPart: '미간·이마', meaning: '생각, 분석, 결론을 담당하는 두뇌의 논리 센터입니다.', definedTip: '고정된 관점을 갖기 쉬운데 이는 재능이에요. 가끔은 다른 사람의 시각도 받아들여 보세요.', undefinedTip: '생각이 날마다 바뀌기 쉬워요. "아직 생각 중이야"라고 말해도 괜찮습니다.' },
      Throat: { label: '스로트', bodyPart: '목', meaning: '표현과 행동의 출구로, 모든 에너지가 결국 여기를 거쳐 말이나 행동이 됩니다.', definedTip: '당신이 하는 말은 보통 정말 무게가 있어요. 자신이 가장 잘 들리는 상황을 눈여겨보세요.', undefinedTip: '남의 말을 끊고 끼어들기 쉬워요. 말하고 싶을 때 먼저 숨을 고르고 정말 지금 말해야 하는지 확인하세요.' },
      G: { label: 'G 센터', bodyPart: '가슴·심장 부근', meaning: '정체성, 방향, 사랑의 센터로 당신이 어디로 가고 누구인지를 결정합니다.', definedTip: '자신이 누구이고 어디로 가는지 대체로 확신이 있어요. 그 확신을 당당하게 가지고 나아가세요.', undefinedTip: '주변 사람에 따라 다른 사람처럼 느껴질 수 있어요. 방향감이 흔들리는 건 당신에게 자연스러운 일이에요.' },
      Heart: { label: '하트·의지', bodyPart: '가슴 오른쪽·심장 부근', meaning: '의지력, 자기 가치, 말한 대로 해내는 능력이며 물질 자원의 원동력이기도 합니다.', definedTip: '원래 말한 대로 해내는 사람이에요. 자신을 증명하려고 과하게 약속하지 않도록 조심하세요.', undefinedTip: '자신에게 너무 엄격해지기 쉬워요. 사실 증명하지 않아도 이미 가치가 있습니다.' },
      Sacral: { label: '사크랄', bodyPart: '아랫배·천골 부근', meaning: '순수한 생명력과 일하는 에너지로, 소리로 "예/아니오"를 답합니다.', definedTip: '결정하기 전에 배 속 본능적 반응에 주목하세요. 생각보다 더 정확합니다.', undefinedTip: '자각 없이 감당 못할 만큼 일을 떠맡기 쉬워요. 지치면 그게 멈추라는 신호예요.' },
      SolarPlexus: { label: '솔라 플렉서스', bodyPart: '위·횡격막 부근', meaning: '감정 파동의 센터이자 감정적 명료함으로 가는 통로입니다.', definedTip: '당신의 진실은 지금 이 순간에 있지 않아요. 중요한 결정은 하룻밤 재운 뒤 내리세요.', undefinedTip: '남의 감정을 자기 것처럼 흡수하기 쉬워요. 기분이 갑자기 바뀌면 이게 누구의 감정인지 물어보세요.' },
      Spleen: { label: '스플린', bodyPart: '윗배·비장 부근', meaning: '몸의 직관 레이더로 두려움, 면역, 지금 이 순간의 안전감을 관장합니다.', definedTip: '당신의 직감은 매우 정확하지만 대개 순간적으로 스쳐 지나가요. 그 첫 반응을 잡으세요.', undefinedTip: '작은 일에도 긴장하기 쉬워요. 이 두려움이 지금 실제인지, 오래된 습관적 반응인지 먼저 확인하세요.' },
      Root: { label: '루트', bodyPart: '꼬리뼈·골반 바닥', meaning: '아드레날린과 압박의 엔진으로, 일을 끝까지 해내는 원초적 추진력입니다.', definedTip: '남보다 더 많은 압박을 견딜 수 있어요. 약간의 긴박감이 오히려 효율을 높여줍니다.', undefinedTip: '마감이 숨 막히게 느껴지기 쉬워요. 모든 급한 일이 지금 당장 처리해야 하는 건 아니라는 걸 기억하세요.' },
    },
    channels: {
      '20-34': { name: '스로트—사크랄 | 카리스마 채널', trait: '몸의 본능적 행동력을 눈에 보이는 표현과 카리스마로 곧바로 바꿉니다.', daily: '하고 싶다는 충동은 대개 정확하지만, 머리가 앞서가는 게 아니라 사크랄이 정말 반응했는지 먼저 확인하세요.' },
      '20-57': { name: '스로트—스플린 | 브레인웨이브 채널', trait: '그 순간의 직관을 가장 빠르게 명확한 말로 바꿉니다.', daily: '바로 입 밖으로 나온 직관적 판단이 대개 가장 정확하니, 너무 오래 생각하지 말고 말해 보세요.' },
      '10-20': { name: '스로트—G 센터 | 각성 채널', trait: '자신이 누구인지에 대한 확신을 눈에 보이는 행동과 존재감으로 바꿉니다.', daily: '자신이 누구인지 분명해지면 바로 그대로 살아보세요. 누군가의 인정을 기다릴 필요가 없습니다.' },
      '34-57': { name: '사크랄—스플린 | 파워 채널', trait: '생명력과 직관을 결합해 안정적이면서도 존재감 있는 힘을 만듭니다.', daily: '몸이 맞다고 느끼고 직관도 안전하다고 느낄 때, 그 일은 전력을 다할 가치가 있습니다.' },
      '2-14': { name: 'G 센터—사크랄 | 비트 채널', trait: '방향감과 안정적인 추진력을 결합해 자원을 한 걸음씩 알맞은 곳으로 옮깁니다.', daily: '먼저 방향이 맞는지 확인하고, 그다음은 몸의 추진력에 맡기세요. 한 번에 완벽하게 할 필요는 없어요.' },
      '10-34': { name: 'G 센터—사크랄 | 탐험 채널', trait: '자신의 신념에 충실하며 몸의 추진력으로 그것을 실천합니다.', daily: '남에게 맞추려고 핵심 신념을 타협하지 마세요. 당신의 추진력은 스스로 믿는 것을 살아내기 위한 것이에요.' },
      '25-51': { name: 'G 센터—하트 | 이니시에이션 채널', trait: '사랑과 추진력으로 새로운 국면을 열며, 다소 충격을 줄 수도 있습니다.', daily: '"누군가 먼저 뛰어들어야 하는" 순간에는 당신이 남들보다 더 잘 맞는 경우가 많아요.' },
      '21-45': { name: '스로트—하트 | 머니 라인', trait: '자원과 물질을 통제하고 관리·분배하는 타고난 능력입니다.', daily: '돈이나 자원 분배를 이야기할 때 당신의 판단은 생각보다 정확하니 망설이지 않아도 됩니다.' },
      '6-59': { name: '사크랄—솔라 플렉서스 | 메이팅 채널', trait: '감정의 오르내림을 이용해 방어를 넘어서는 진짜 친밀함을 찾습니다.', daily: '가까워지고 싶을 때는 감정 주기가 가라앉기를 기다리세요. 감정이 최고조이거나 바닥일 때 억지로 다가가지 마세요.' },
      '30-41': { name: '솔라 플렉서스—루트 | 인식 채널', trait: '새로운 경험과 꿈에 대한 끝없는 갈망이 있으며, 감정적 긴장도 동반하기 쉽습니다.', daily: '갈망 자체는 잘못이 아니에요. 먼저 감정을 명확히 하고 나서 정말 행동할지 결정하세요.' },
      '39-55': { name: '솔라 플렉서스—루트 | 감정 표현 채널', trait: '감정의 기복 자체가 주변을 자극하고 창조하는 에너지가 됩니다.', daily: '기분이 가라앉는다고 뭔가 잘못된 건 아니에요. 감정 주기의 정상적인 한 부분일 수 있어요.' },
      '19-49': { name: '솔라 플렉서스—루트 | 종합 채널', trait: '집단의 필요와 정서적 유대에 특히 민감하며, 받아들여지는 느낌을 소중히 여깁니다.', daily: '소외감을 느낄 때는 그것이 실제로 일어난 일인지, 오래된 예민함이 반응하는 것인지 확인하세요.' },
      '26-44': { name: '하트—스플린 | 항복 채널', trait: '누구를 믿고 누구에게 자원을 맡길지 본능적으로 판단합니다.', daily: '사람에 대한 첫 직감적 인상은 대개 정확하니, 논리로 서둘러 반박하지 마세요.' },
      '37-40': { name: '하트—솔라 플렉서스 | 커뮤니티 채널', trait: '감정의 주기를 통해 서로 지지하고 소속감을 느낄 수 있는 공동체나 가족을 만듭니다.', daily: '중요한 약속은 감정 주기를 한 번 거친 뒤에 정말 받아들일지 결정하세요.' },
    },
  },
  resonance: {
    questionPrefix: '선생님께 물어보세요: ',
    understandPrefix: '이렇게 시작하면 좋아요',
  },
  insight: {
    memberNoteKicker: '멤버 노트',
    memberNoteTitle: '공명하는 메시지를 모으세요',
    memberNoteEmpty: '카드를 열고 진실하다고 느끼는 것을 표시하세요.',
    memberNoteCount: '{count}개 표시됨 — 선생님을 만날 때 다시 확인하세요.',
    cardSubtitleFallback: '리딩 카드',
    cardExpand: '리딩 열기',
    cardCollapse: '리딩 닫기',
    cardResonate: '공명합니다',
    cardResonated: '이 세션에 추가됨',
    expandAll: '전체 {count}개 카드 표시',
    collapseAll: '카드 접기',
  },
  personalReading: {
    thisReminder: '나의 알림',
    setReminder: '알림으로 설정',
    reminderSet: '설정 완료',
  },
  game: {
    kicker: '리딩 맵',
    title: '이 결과 읽는 방법',
    plainNote: '모든 용어를 한 번에 읽을 필요는 없습니다. 세 단계를 따라가세요: 핵심 요약 읽기, 비주얼 차트 보기, 오늘 시도할 알림 하나 선택.',
    arLink: '비주얼 차트 보기',
    stepPrefix: '단계',
  },
  nextSteps: {
    kicker: '리딩 흐름',
    title: '다음에 할 일',
    bookTeacher: '선생님 예약',
    viewHistory: '리딩 기록 보기',
  },
  actionPath: {
    kicker: '멤버 온보딩',
    title: '세 가지 명확한 다음 단계',
    body: '먼저 저장하고, 나중에 다시 방문하고, 가장 인상 깊은 질문을 선생님에게 가져가 더 깊은 세션을 받으세요.',
    saveTitle: '이 리딩 저장',
    saveLabel: '로그인하고 저장',
    dailyTitle: '일일 의식으로 돌아가기',
    dailyBody: '내일 돌아와 일일 카드나 룬을 뽑아 플랫폼을 일회성 도구가 아닌 안정적인 동반자로 만드세요.',
    dailyLabel: '일일 의식',
    consultTitle: '더 깊은 리딩 예약',
    consultBody: '카드나 차트 섹션이 정말 와닿았다면, 그 질문을 선생님에게 가져가세요.',
    consultLabel: '선생님 찾기',
    footerSave: '이 리딩 저장',
    footerConsult: '선생님 찾기',
  },
  unlock: {
    kicker: '멤버 확장',
    title: '확장 리딩',
    body: '로그인하여 심층 설명과 일간, 월간, 연간 확장 리딩에 액세스하세요. 무료 도구는 이미 완전합니다 — 이것은 선택 사항입니다.',
    memberStatusLabel: '멤버 상태',
    memberLoggedIn: '로그인됨',
    memberPending: '...',
    memberGuest: '—',
    guestBody: '로그인하여 확장 리딩을 볼 수 있습니다. 일간, 월간, 연간 인사이트는 멤버 계정에 저장됩니다.',
    guestLogin: '로그인하여 보기',
    dailyTitle: '일일 의식',
    dailyDone: '오늘의 체크인 완료.',
    dailyPending: '일일 의식을 완료하여 확장 리딩을 열어보세요.',
    claimBtn: '일일 체크인 완료',
    claimedBtn: '오늘 완료',
    claimingBtn: '처리 중...',
    alreadyViewed: '이미 봄',
    loadingContent: '로딩 중...',
    viewBtn: '{label} 보기',
    loadBtn: '콘텐츠 불러오기',
    noticeAlreadyUnlocked: '{label}은 이미 볼 수 있습니다.',
    noticeUnlocked: '{label} 콘텐츠가 로드되었습니다.',
  },
  ziweiGuide: {
    kicker: '자미두수 가이드',
    title: '12궁에 들어가기 전에 세 가지를 보세요',
    body: '자미두수는 모든 12궁을 한 번에 외우는 것이 아닙니다. 주 축부터 시작한 후 실제 질문에 맞는 궁으로 이동하세요.',
    noMajorStar: '주성 없음. 반대 궁과 사정삼합을 확인하세요.',
    mingGongLabel: '명궁',
    shenGongLabel: '신궁',
    wuxingLabel: '오행국',
    mingGongDesc: '명궁은 인생의 주축과 같습니다. 당신이 세상을 대하는 습관과 타인이 처음에 쉽게 느끼는 분위기를 나타냅니다.',
    shenGongDesc: '신궁은 착지 방식과 같습니다. 성장하면서 점점 더 자주 사용하게 되는 선택 방식, 책임 수용, 인생 축적의 방법을 보여줍니다.',
    wuxingDesc: '오행국은 명반의 바탕색입니다. 명반 전체의 리듬을 이해하는 데 도움을 주며, 길흉의 판결이 아니라 에너지가 작용하는 방식입니다.',
    questionRoutes: [
      { topic: '연애', palace: '부처궁', body: '관계 패턴, 감정 안전, 파트너 역학.' },
      { topic: '커리어', palace: '관록궁', body: '업무 스타일, 커리어 방향, 에너지를 투자할 곳.' },
      { topic: '재정', palace: '재백궁', body: '수입 방식, 자원 흐름, 재정 압박.' },
      { topic: '가족', palace: '전택 / 부모 / 형제', body: '가족 지원, 집의 감각, 친밀한 관계.' },
      { topic: '외부', palace: '천이궁', body: '집 밖에서의 발전, 파트너십, 환경 변화.' },
    ],
  },
  palaceNoStar: '주성 없음. 반대 궁과 사정삼합을 확인하세요.',
  disclaimer: '결과는 자기 탐구용으로만 사용되며, 진단, 치료, 의료 또는 전문적인 심리적 조언을 구성하지 않습니다. 신체적 또는 정신적 어려움을 겪고 있다면 전문적인 지원을 구하세요.',
  error: {
    title: '리딩 실패',
    apiHint: '백엔드 API가 실행 중인지 확인하거나 나중에 다시 제출해 보세요.',
  },
  loading: {
    label: '리딩 준비 중...',
  },
  notices: {
    insufficientPoints: '지금 볼 수 없습니다. 내일 다시 오거나 먼저 일일 의식을 완료하세요.',
    notAuthenticated: '확장 콘텐츠를 보려면 로그인하세요.',
    generic: '오류가 발생했습니다. 다시 시도해 주세요.',
    claimSuccess: '일일 체크인 완료. 확장 콘텐츠를 볼 수 있습니다.',
    claimAlready: '오늘 이미 체크인했습니다. 내일 다시 오세요.',
    signInFirst: '확장 콘텐츠를 보기 전에 일일 의식을 완료하세요.',
  },
  unlockOptions: {
    deep_reading: {
      label: '심층 리딩',
      title: '전체 해석 보기',
      body: '더 완전한 쉬운 언어 해석 읽기: 강점, 막힌 지점, 지금 주의할 것, 오늘 할 수 있는 작은 행동.',
    },
    transit_day: {
      label: '일간 트랜짓',
      title: '오늘의 일간 트랜짓 보기',
      body: '오늘 이 결과를 어떻게 활용할지: 어디서 앞으로 나아갈 수 있고, 어디서 천천히 해야 하며, 감정이 결정을 내리지 않도록.',
    },
    transit_month: {
      label: '월간 트랜짓',
      title: '이번 달 트랜짓 리딩 보기',
      body: '이번 달 주제: 꾸준히 쌓을 것, 소모를 피할 것, 매주 확인할 방향.',
    },
    transit_year: {
      label: '연간 트랜짓',
      title: '올해 트랜짓 리딩 보기',
      body: '올해 큰 그림: 장기 투자할 가치가 있는 것, 조정해야 할 습관, 한 해를 걷기 좋은 단계로 나누는 방법.',
    },
  },
  nextStepsTools: {
    numerology: [
      { title: '핵심 숫자부터 시작', body: '생명수, 생일수, 원형을 먼저 보고 — 평소 행동 패턴으로 돌아가 이해하세요.' },
      { title: '숫자를 행동 방향으로 전환하기', body: '각 핵심 숫자에는 구체적인 행동 경향이 있습니다. 결과의 "오늘 할 수 있는 한 가지" 부분을 찾아 실제로 활용할 수 있는 알림을 선택하세요.' },
      { title: '실제 상황과 연결', body: '커리어, 관계, 연간 주제를 더 탐구하고 싶다면, 이 결과를 가지고 선생님과 깊은 대화를 나눠보세요.' },
    ],
    maya: [
      { title: '공명하는 문장 찾기', body: '용어부터 시작하지 마세요. 잘 흘러갈 때 어떻게 움직이는지, 막힐 때 어떻게 반응하는지 설명하는 부분을 먼저 읽고 공명하면 계속 읽어보세요.' },
      { title: '오라클 보드가 어떻게 연결되는지 보기', body: '출생 인장은 주축, 가이드는 다음 단계, 서포트는 자원, 도전은 막힌 지점, 숨겨진 힘은 힘든 순간에 떠오르는 것. 다섯 역할이 어떻게 역할을 나누는지 주목하세요.' },
      { title: '오늘 작은 실험 하나만', body: '결과를 24시간 내 실행 가능한 행동 하나로 바꿔보세요: 뭔가 말하거나, 뭔가 내려놓거나, 경계 하나를 정하세요. 자신의 느낌과 반응을 그대로 관찰해보세요.' },
    ],
    bazi: [
      { title: '일주와 오행부터 시작', body: '일주는 세상에서 당신의 기본적인 질을 나타냅니다. 오행 분포는 자원과 압박이 어디서 오는지 알려줍니다.' },
      { title: '사주를 시간의 층위로 읽기', body: '년주는 초기와 외부 세계, 월주는 업무 환경, 일주는 자신과 관계, 시주는 장기적 발전을 다룹니다 — 각 기둥은 다른 인생 장면을 묘사합니다.' },
      { title: '실제 상황과 연결', body: '사주는 커리어 리듬, 관계 역학, 장기 결정 탐구에 잘 맞습니다. 구체적인 질문을 가져오면 더 깊이 읽을 수 있습니다.' },
    ],
    ziwei: [
      { title: '명궁과 신궁부터 시작', body: '명궁은 주축, 신궁은 그 에너지가 실제로 착지하는 방식. 주성과 결합해 성격을 이해하세요.' },
      { title: '실제로 가진 질문에서 진입하기', body: '연애 → 부처궁. 커리어 → 관록궁. 돈 → 재백궁. 모든 궁위를 한 번에 읽으려 하지 말고 지금 가장 중요한 영역부터 시작하세요.' },
      { title: '한 궁위를 골라 깊이 읽기', body: '한 번에 모두 읽으려 하지 마세요. 지금 질문(커리어, 관계, 재정)에 맞는 궁위부터 시작하세요.' },
    ],
    tarot: [
      { title: '질문과 위치로 돌아가기', body: '무엇을 물었는지 떠올리고, 각 카드가 어느 위치(과거, 현재, 미래)에 있는지 보세요.' },
      { title: '카드 면과 방향 읽기', body: '화면에 카드 이름, 정방향/역방향, 키워드, 선택한 덱 스타일이 표시됩니다.' },
      { title: '답을 행동 하나로 바꾸기', body: '오늘 할 수 있는 한 걸음을 찾아 마무리하세요. 리딩은 앞으로 나아가게 할 때 가장 유용합니다.' },
    ],
    runes: [
      { title: '룬과 방향부터 시작', body: '룬 메시지는 대체로 직접적입니다. 핵심 테마를 먼저 보고, 장애물을 가리키는지 자원을 가리키는지 확인하세요.' },
      { title: '키워드를 오늘에 대입하기', body: '각 룬에는 정방향과 역방향 키워드 세트가 있습니다. 지금 상황에 맞는 것을 선택해 집중의 방향으로 삼아보세요 — 예언이 아니라 관점으로서.' },
      { title: '오늘의 실행 문장 하나 쓰기', body: '결과를 오늘 실행 가능한 리마인더 하나로 압축하세요. 그 습관이 자연스러운 재방문 동기가 됩니다.' },
    ],
    astro: [
      { title: '태양, 달, 어센던트부터 시작', body: '태양은 핵심 의지, 달은 감정적 필요, 어센던트는 외부 세계와 만나는 방식을 보여줍니다.' },
      { title: '세 가지 사이의 간극 주목하기', body: '태양, 달, 어센던트를 함께 읽으면 원하는 것, 필요한 것, 타인에게 보이는 것의 차이와 그 층위들이 어디서 맞닿고 어디서 서로 당기는지 드러납니다.' },
      { title: '그 다음 하우스와 어스펙트 보기', body: '특정 인생 사건을 더 정확하게 이해하고 싶을 때, 하우스 배치와 행성 어스펙트를 깊이 살펴보세요.' },
    ],
    humandesign: [
      { title: '타입과 권위부터 시작', body: '타입은 세계와 관계 맺는 방식을 형성하고, 내면 권위는 자신에게 맞는 결정 방법을 안내합니다.' },
      { title: 'BodyGraph에서 정의된 센터 찾기', body: '색칠된 센터는 당신의 일관된 에너지 원천, 흰 센터는 타인에게 가장 영향받기 쉬운 곳입니다. 그 경계를 파악하는 것이 다른 모든 것의 토대가 됩니다.' },
      { title: '공명하는 게이트 3개 골라 탐구', body: '가장 강하게 공명하는 활성화된 게이트 3개를 선택하세요. 모든 것을 한 번에 다룰 필요는 없습니다.' },
    ],
  },
  mayaOracle: {
    eyebrow: 'MAYA ORACLE',
    title: '다섯 킨 오라클 보드',
    subtitle: '탄생 킨 외에도 하루를 만드는 네 가지 힘이 있습니다: 안내, 지지, 대립, 숨겨진 힘. 각 위치의 역할을 살펴보세요.',
    heroLabel: '탄생 킨',
    roles: { self: '본명', guide: '안내', analog: '지지', antipode: '대립', occult: '숨겨진 힘' },
    bodies: {
      self: '당신의 핵심 리듬 — 일상에서 가장 자연스럽게 쓰는 에너지입니다.',
      guide: '막힐 때 빌려올 방향. 다음 작은 한 걸음이 무엇일지 스스로에게 물어보세요.',
      analog: '당신의 보급소입니다. 지지가 필요할 때 이 에너지로 돌아오세요.',
      antipode: '겉보기엔 대립하는 힘이지만, 사실은 그 반대되는 자질을 성숙시키라는 신호입니다.',
      occult: '저점이나 뜻밖의 순간에 드러나는 숨은 자원. 대개 통제를 내려놓을 때 나타납니다.',
    },
    crosscheck: {
      dreamspell: 'Dreamspell',
      tzolkin: '전통 촐킨',
      haab: 'Haab',
      longCount: 'Long Count',
      thirteenMoon: '13 Moon',
    },
  },
};

const allCopies: Record<Locale, ToolResultCopy> = {
  'zh-TW': zhTW,
  en,
  vi,
  id,
  ja,
  ko,
};

export function getToolResultCopy(locale: Locale): ToolResultCopy {
  return allCopies[locale] ?? allCopies[DEFAULT_LOCALE];
}
