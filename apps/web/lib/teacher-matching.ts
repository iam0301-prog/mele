import type {
  MatchAnswers,
  MatchBudget,
  MatchStyle,
  MatchTool,
  MatchTopic,
  Teacher,
  TeacherMatchResult,
  TeacherService,
} from '@/types/db';

export const MATCH_TOPICS: Array<{ value: MatchTopic; label: string; hint: string; keywords: string[] }> = [
  { value: 'love', label: '感情', hint: '曖昧、關係、復合、婚姻', keywords: ['感情', '關係', '愛情', '婚姻', '伴侶', '復合', '曖昧'] },
  { value: 'career', label: '事業', hint: '工作、轉職、創業、財運', keywords: ['事業', '工作', '轉職', '創業', '職涯', '財運', '收入'] },
  { value: 'family', label: '家庭', hint: '親子、原生家庭、家人互動', keywords: ['家庭', '家人', '親子', '父母', '小孩', '原生家庭'] },
  { value: 'self', label: '自我', hint: '天賦、卡關、內在整理', keywords: ['自我', '天賦', '卡關', '內在', '方向', '迷惘'] },
  { value: 'year', label: '年度方向', hint: '流年、未來一年、重大選擇', keywords: ['年度', '流年', '未來', '選擇', '規劃', '運勢'] },
  { value: 'spiritual', label: '靈性探索', hint: '能量、夢境、直覺、靈魂課題', keywords: ['靈性', '能量', '夢境', '直覺', '靈魂', '課題'] },
];

export const MATCH_TOOLS: Array<{ value: MatchTool; label: string; specialties: string[] }> = [
  { value: 'bazi', label: '八字', specialties: ['八字', '四柱', '五行'] },
  { value: 'ziwei', label: '紫微', specialties: ['紫微', '紫微斗數'] },
  { value: 'tarot', label: '塔羅', specialties: ['塔羅', '塔羅牌'] },
  { value: 'runes', label: '盧恩', specialties: ['盧恩', '符文'] },
  { value: 'astro', label: '占星', specialties: ['占星', '星盤', '西洋占星'] },
  { value: 'humandesign', label: '人類圖', specialties: ['人類圖'] },
  { value: 'maya', label: '馬雅', specialties: ['馬雅', '馬雅曆', 'Maya'] },
  { value: 'numerology', label: '生命靈數', specialties: ['生命靈數', '靈數', '數字'] },
  { value: 'unsure', label: '我不確定', specialties: [] },
];

export const MATCH_STYLES: Array<{ value: MatchStyle; label: string; keywords: string[] }> = [
  { value: 'gentle', label: '溫柔陪伴', keywords: ['溫柔', '陪伴', '傾聽', '療癒', '支持'] },
  { value: 'direct', label: '直接點破', keywords: ['直接', '點破', '犀利', '清楚', '直白'] },
  { value: 'structured', label: '結構分析', keywords: ['結構', '分析', '理性', '邏輯', '系統'] },
  { value: 'ritual', label: '神秘儀式感', keywords: ['儀式', '神秘', '直覺', '能量', '牌卡'] },
  { value: 'action', label: '行動建議', keywords: ['行動', '落地', '建議', '策略', '執行'] },
];

export const MATCH_BUDGETS: Array<{ value: MatchBudget; label: string; min: number; max: number }> = [
  { value: 'under_1000', label: 'NT$1000 以下', min: 0, max: 1000 },
  { value: '1000_2000', label: 'NT$1000-2000', min: 1000, max: 2000 },
  { value: 'over_2000', label: 'NT$2000 以上', min: 2000, max: 999999 },
];

export const MATCH_DURATIONS = [30, 60, 90] as const;

const TOPIC_TOOLS: Record<MatchTopic, MatchTool[]> = {
  love: ['tarot', 'ziwei', 'astro', 'humandesign'],
  career: ['bazi', 'ziwei', 'astro', 'numerology'],
  family: ['bazi', 'ziwei', 'humandesign', 'tarot'],
  self: ['humandesign', 'numerology', 'maya', 'astro'],
  year: ['bazi', 'ziwei', 'astro', 'maya'],
  spiritual: ['tarot', 'runes', 'maya', 'humandesign'],
};

export function defaultMatchAnswers(): MatchAnswers {
  return {
    topic: 'love',
    tool: 'tarot',
    style: 'gentle',
    budget: '1000_2000',
    duration: 60,
    question: '',
  };
}

function normalize(value: string | null | undefined) {
  return (value || '').toLowerCase();
}

function textIncludesAny(text: string, keywords: string[]) {
  const source = normalize(text);
  return keywords.some((keyword) => source.includes(normalize(keyword)));
}

function teacherText(teacher: Teacher) {
  return [
    teacher.display_name,
    teacher.title,
    teacher.intro_short,
    teacher.intro_long,
    teacher.quote,
    teacher.consultation_style,
    ...(teacher.specialties || []),
  ].filter(Boolean).join(' ');
}

function specialtyScore(teacher: Teacher, answers: MatchAnswers) {
  const specialtyText = (teacher.specialties || []).join(' ');
  const preferredTools = answers.tool === 'unsure' ? TOPIC_TOOLS[answers.topic] : [answers.tool];
  const exact = preferredTools.some((tool) => {
    const meta = MATCH_TOOLS.find((item) => item.value === tool);
    return meta ? textIncludesAny(specialtyText, meta.specialties) : false;
  });
  if (exact) return 40;

  const topicRelated = TOPIC_TOOLS[answers.topic].some((tool) => {
    const meta = MATCH_TOOLS.find((item) => item.value === tool);
    return meta ? textIncludesAny(specialtyText, meta.specialties) : false;
  });
  return topicRelated ? 24 : Math.min((teacher.specialties || []).length * 4, 12);
}

function styleScore(teacher: Teacher, answers: MatchAnswers) {
  const style = MATCH_STYLES.find((item) => item.value === answers.style);
  if (!style) return 0;
  if (textIncludesAny(teacherText(teacher), style.keywords)) return 20;
  if (teacher.consultation_style || teacher.intro_short || teacher.intro_long) return 10;
  return 4;
}

function serviceInBudget(service: TeacherService, budget: MatchBudget) {
  const range = MATCH_BUDGETS.find((item) => item.value === budget) ?? MATCH_BUDGETS[1];
  return service.price_ntd >= range.min && service.price_ntd <= range.max;
}

function serviceDistance(service: TeacherService, answers: MatchAnswers) {
  const range = MATCH_BUDGETS.find((item) => item.value === answers.budget) ?? MATCH_BUDGETS[1];
  const targetPrice = Math.min(Math.max(service.price_ntd, range.min), range.max);
  const priceDistance = Math.abs(service.price_ntd - targetPrice) / 100;
  const durationDistance = Math.abs(service.duration_minutes - answers.duration) / 10;
  return priceDistance + durationDistance;
}

function pickService(services: TeacherService[], answers: MatchAnswers) {
  const active = services.filter((service) => service.is_active !== false);
  if (!active.length) return null;
  return [...active].sort((a, b) => serviceDistance(a, answers) - serviceDistance(b, answers))[0] ?? null;
}

function priceScore(service: TeacherService | null, answers: MatchAnswers) {
  if (!service) return 0;
  const budget = serviceInBudget(service, answers.budget) ? 8 : 3;
  const duration = service.duration_minutes === answers.duration ? 7 : Math.abs(service.duration_minutes - answers.duration) <= 30 ? 4 : 1;
  return budget + duration;
}

function trustScore(teacher: Teacher) {
  const rating = Number(teacher.rating || 0);
  const ratingScore = Math.min(Math.max(rating, 0), 5) / 5 * 7;
  const reviewScore = Math.min(Number(teacher.total_reviews || 0), 30) / 30 * 4;
  const caseScore = Math.min(Number(teacher.cases_count || 0), 80) / 80 * 4;
  return Math.round(ratingScore + reviewScore + caseScore);
}

function keywordScore(teacher: Teacher, answers: MatchAnswers) {
  const topic = MATCH_TOPICS.find((item) => item.value === answers.topic);
  const questionWords = answers.question.split(/[，。！？,.!?\s]+/).filter((word) => word.length >= 2);
  const keywords = [...(topic?.keywords ?? []), ...questionWords];
  if (!keywords.length) return 0;
  return textIncludesAny(teacherText(teacher), keywords) ? 10 : 0;
}

export function scoreTeacherMatch(
  teacher: Teacher,
  services: TeacherService[],
  answers: MatchAnswers,
): TeacherMatchResult {
  const service = pickService(services, answers);
  const scoreParts = {
    specialty: specialtyScore(teacher, answers),
    style: styleScore(teacher, answers),
    price: priceScore(service, answers),
    trust: trustScore(teacher),
    keyword: keywordScore(teacher, answers),
  };
  const score = Math.min(100, Math.round(Object.values(scoreParts).reduce((sum, value) => sum + value, 0)));
  const result: TeacherMatchResult = {
    teacher,
    service,
    score,
    reasons: [],
    scoreParts,
    closest: false,
  };
  return { ...result, reasons: buildMatchReasons(result, answers).slice(0, 3) };
}

export function buildMatchReasons(result: TeacherMatchResult, answers: MatchAnswers): string[] {
  const reasons: string[] = [];
  const toolLabel = MATCH_TOOLS.find((item) => item.value === answers.tool)?.label;
  const topicLabel = MATCH_TOPICS.find((item) => item.value === answers.topic)?.label;
  const styleLabel = MATCH_STYLES.find((item) => item.value === answers.style)?.label;

  if (result.scoreParts.specialty >= 40 && toolLabel && answers.tool !== 'unsure') {
    reasons.push(`擅長${toolLabel}，符合你想看的命理形式。`);
  } else if (result.scoreParts.specialty >= 24 && topicLabel) {
    reasons.push(`專長與${topicLabel}議題接近，是目前最適合的方向。`);
  }

  if (result.scoreParts.style >= 20 && styleLabel) {
    reasons.push(`諮詢語氣偏向${styleLabel}，符合你的互動偏好。`);
  } else if (result.scoreParts.style >= 10) {
    reasons.push('老師介紹完整，適合先透過詳情頁確認諮詢感受。');
  }

  if (result.service && result.scoreParts.price >= 12) {
    reasons.push(`有 ${result.service.duration_minutes} 分鐘服務，價格符合你的預算區間。`);
  } else if (result.service) {
    reasons.push('有可預約服務，可依時間與預算再做最後確認。');
  }

  if (result.scoreParts.trust >= 10) {
    reasons.push(`累積 ${result.teacher.cases_count || 0} 次案例與 ${result.teacher.total_reviews || 0} 則評價，信任度較高。`);
  }

  if (result.scoreParts.keyword >= 10) {
    reasons.push('老師介紹與你的問題關鍵字有呼應。');
  }

  if (!reasons.length) reasons.push('目前資料有限，但這位老師是現有名單中相對接近的選擇。');
  return reasons;
}

export function rankTeacherMatches(
  teachers: Teacher[],
  services: TeacherService[],
  answers: MatchAnswers,
): TeacherMatchResult[] {
  const byTeacher = new Map<string, TeacherService[]>();
  for (const service of services) {
    const list = byTeacher.get(service.teacher_id) ?? [];
    list.push(service);
    byTeacher.set(service.teacher_id, list);
  }

  const ranked = teachers
    .map((teacher) => scoreTeacherMatch(teacher, byTeacher.get(teacher.id) ?? [], answers))
    .sort((a, b) => b.score - a.score || Number(b.teacher.rating || 0) - Number(a.teacher.rating || 0));

  if (ranked.length && ranked[0].score < 70) ranked[0] = { ...ranked[0], closest: true };
  return ranked;
}

export function serializeMatchResults(results: TeacherMatchResult[]) {
  return results.map((item) => ({
    teacher_id: item.teacher.id,
    service_id: item.service?.id ?? null,
    score: item.score,
    reasons: item.reasons,
  }));
}
