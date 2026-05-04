import type { Teacher, TeacherService } from '@/types/db';

const createdAt = '2026-01-01T00:00:00.000Z';

export const DEMO_TEACHERS: Teacher[] = [
  {
    id: 'demo-tarot-luna',
    user_id: 'demo-user-luna',
    status: 'active',
    display_name: '月澄',
    avatar_url: null,
    title: '塔羅與關係議題解讀師',
    intro_short: '擅長感情、關係界線與自我價值整理，用溫柔但清楚的方式陪你看見問題核心。',
    intro_long:
      '月澄的解讀風格偏向溫柔陪伴與具體行動。她會先協助你把混亂的感受整理成幾個清楚問題，再透過塔羅牌面、牌陣位置與當下情境，找出你真正需要面對的選擇。',
    quote: '好的解牌不是替你決定人生，而是讓你更清楚自己正在選什麼。',
    specialties: ['塔羅', '感情', '自我探索', '行動建議'],
    consultation_style: '溫柔陪伴、清楚整理、帶回可執行的小步驟',
    line_url: null,
    instagram: null,
    facebook: null,
    threads: null,
    youtube: null,
    website: null,
    rating: 4.9,
    total_reviews: 38,
    cases_count: 126,
    commission_rate: 0.2,
    approved_at: createdAt,
    paused_at: null,
    suspended_at: null,
    suspended_reason: null,
    admin_script: null,
    created_at: createdAt,
  },
  {
    id: 'demo-bazi-shen',
    user_id: 'demo-user-shen',
    status: 'active',
    display_name: '沈曜',
    avatar_url: null,
    title: '八字與年度策略顧問',
    intro_short: '擅長八字、事業方向與年度節奏，適合想把命盤轉成實際規劃的人。',
    intro_long:
      '沈曜會從日主、五行分布、大運流年與當前問題切入，把命理語言翻成職涯、合作、財務與生活節奏的具體建議。風格直接、結構化，適合需要做決策的人。',
    quote: '命盤不是限制，而是一張看懂自己用力方式的地圖。',
    specialties: ['八字', '事業', '年度方向', '結構分析'],
    consultation_style: '直接點破、結構分析、重視策略與取捨',
    line_url: null,
    instagram: null,
    facebook: null,
    threads: null,
    youtube: null,
    website: null,
    rating: 4.8,
    total_reviews: 52,
    cases_count: 214,
    commission_rate: 0.2,
    approved_at: createdAt,
    paused_at: null,
    suspended_at: null,
    suspended_reason: null,
    admin_script: null,
    created_at: createdAt,
  },
  {
    id: 'demo-human-iris',
    user_id: 'demo-user-iris',
    status: 'active',
    display_name: '靛嵐',
    avatar_url: null,
    title: '人類圖與靈性探索引導師',
    intro_short: '擅長人類圖、馬雅與盧恩，適合想理解能量運作與內在節奏的人。',
    intro_long:
      '靛嵐會把人類圖類型、策略、權威與啟動閘門轉成容易理解的生活語言，也會搭配盧恩或馬雅神諭，協助你找到當下最適合的觀察方向。',
    quote: '真正的指引會讓你回到身體，而不是更依賴答案。',
    specialties: ['人類圖', '盧恩', '馬雅', '靈性探索'],
    consultation_style: '神秘儀式感、溫柔陪伴、重視身體感受',
    line_url: null,
    instagram: null,
    facebook: null,
    threads: null,
    youtube: null,
    website: null,
    rating: 4.7,
    total_reviews: 29,
    cases_count: 88,
    commission_rate: 0.2,
    approved_at: createdAt,
    paused_at: null,
    suspended_at: null,
    suspended_reason: null,
    admin_script: null,
    created_at: createdAt,
  },
];

export const DEMO_TEACHER_SERVICES: TeacherService[] = [
  {
    id: 'demo-service-tarot-60',
    teacher_id: 'demo-tarot-luna',
    name: '塔羅關係整理 60 分鐘',
    description: '適合感情、曖昧、關係界線、自我價值與下一步行動。',
    duration_minutes: 60,
    price_ntd: 1600,
    is_active: true,
    display_order: 1,
  },
  {
    id: 'demo-service-bazi-90',
    teacher_id: 'demo-bazi-shen',
    name: '八字年度策略 90 分鐘',
    description: '適合事業轉折、合作選擇、年度方向與長期規劃。',
    duration_minutes: 90,
    price_ntd: 2600,
    is_active: true,
    display_order: 1,
  },
  {
    id: 'demo-service-human-60',
    teacher_id: 'demo-human-iris',
    name: '人類圖能量解讀 60 分鐘',
    description: '適合理解類型、策略、權威、閘門與日常能量運作。',
    duration_minutes: 60,
    price_ntd: 1800,
    is_active: true,
    display_order: 1,
  },
];

export function isDemoTeacherId(id: string) {
  return id.startsWith('demo-');
}

export function getDemoTeacher(id: string) {
  return DEMO_TEACHERS.find((teacher) => teacher.id === id) ?? null;
}

export function getDemoTeacherServices(teacherId: string) {
  return DEMO_TEACHER_SERVICES.filter((service) => service.teacher_id === teacherId);
}
