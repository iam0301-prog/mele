// 共用資料庫型別（與 supabase/migrations 對齊）

export type TeacherStatus =
  | 'pending' | 'reviewing' | 'revision' | 'rejected'
  | 'interview' | 'contracted' | 'active' | 'paused' | 'suspended';

export interface Teacher {
  id: string;
  user_id: string;
  status: TeacherStatus;
  display_name: string;
  avatar_url: string | null;
  title: string | null;
  intro_short: string | null;
  intro_long: string | null;
  quote: string | null;
  specialties: string[];
  consultation_style: string | null;
  line_url: string | null;
  instagram: string | null;
  facebook: string | null;
  threads: string | null;
  youtube: string | null;
  website: string | null;
  rating: number;
  total_reviews: number;
  cases_count: number;
  commission_rate: number;
  approved_at: string | null;
  paused_at: string | null;
  suspended_at: string | null;
  suspended_reason: string | null;
  admin_script: string | null;
  created_at: string;
}

export interface TeacherService {
  id: string;
  teacher_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_ntd: number;
  is_active: boolean;
  display_order: number;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  teacher_id: string;
  rating: number;
  comment: string | null;
  is_anonymous: boolean;
  is_visible: boolean;
  created_at: string;
}

export interface TeacherApplication {
  id: string;
  user_id: string;
  status: TeacherStatus;
  legal_name: string;
  display_name: string;
  email: string;
  phone: string;
  specialties: string[];
  intro_short: string;
  intro_long: string | null;
  quote: string | null;
  id_doc_front_url: string | null;
  id_doc_back_url: string | null;
  intro_video_url: string | null;
  line_url: string | null;
  instagram: string | null;
  facebook: string | null;
  threads: string | null;
  youtube: string | null;
  reviewer_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  commission_rate: number;
}

export type DailyDrawTool = 'tarot' | 'runes';
export type ArAssetKind = 'plate' | 'card' | 'stone' | 'bodygraph';

export interface DailyReading {
  id: string;
  user_id: string;
  reading_date: string;
  locale: string;
  source_tools: string[];
  signals: Record<string, unknown>;
  summary: string;
  sections: Array<{ title: string; body: string }>;
  ritual_prompt: string | null;
  created_at: string;
}

export interface DailyDraw {
  id: string;
  user_id: string;
  draw_date: string;
  tool: DailyDrawTool;
  seed: string;
  question: string;
  result_data: Record<string, unknown>;
  render_data: Record<string, unknown>;
  created_at: string;
}

export type ContentUnlockType = 'deep_reading' | 'transit_day' | 'transit_month' | 'transit_year';
export type PointTransactionDirection = 'credit' | 'debit';
export type AdminPointAdjustmentMode = 'credit' | 'debit' | 'set';
export type ChartTool = 'numerology' | 'maya' | 'bazi' | 'ziwei' | 'tarot' | 'runes' | 'astro' | 'humandesign';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  line_user_id: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_location: string | null;
  birth_lat: number | null;
  birth_lon: number | null;
  birth_timezone: string | null;
  gender: '男' | '女' | '其他' | '未填' | null;
  created_at: string;
  updated_at: string;
}

export interface MemberWallet {
  user_id: string;
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  created_at: string;
  updated_at: string;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  amount: number;
  direction: PointTransactionDirection;
  reason: string;
  reference_type: string | null;
  reference_id: string | null;
  balance_after: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DailyPointClaim {
  user_id: string;
  claim_date: string;
  amount: number;
  created_at: string;
}

export interface ContentUnlock {
  id: string;
  user_id: string;
  unlock_type: ContentUnlockType;
  tool: ChartTool;
  scope_key: string;
  cost_points: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ArAsset {
  id: string;
  tool: string;
  asset_kind: ArAssetKind;
  title: string;
  glb_url: string | null;
  usdz_url: string | null;
  poster_url: string | null;
  palette: string[];
  is_active: boolean;
  created_at: string;
}

export interface LineUserLink {
  id: string;
  user_id: string;
  line_user_id: string;
  display_name: string | null;
  picture_url: string | null;
  push_enabled: boolean;
  daily_push_hour: number;
  last_pushed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type MatchTopic = 'love' | 'career' | 'family' | 'self' | 'year' | 'spiritual';
export type MatchTool = 'bazi' | 'ziwei' | 'tarot' | 'runes' | 'astro' | 'humandesign' | 'maya' | 'numerology' | 'unsure';
export type MatchStyle = 'gentle' | 'direct' | 'structured' | 'ritual' | 'action';
export type MatchBudget = 'under_1000' | '1000_2000' | 'over_2000';
export type MatchDuration = 30 | 60 | 90;

export interface MatchAnswers {
  topic: MatchTopic;
  tool: MatchTool;
  style: MatchStyle;
  budget: MatchBudget;
  duration: MatchDuration;
  question: string;
}

export interface TeacherMatchResult {
  teacher: Teacher;
  service: TeacherService | null;
  score: number;
  reasons: string[];
  scoreParts: {
    specialty: number;
    style: number;
    price: number;
    trust: number;
    keyword: number;
  };
  closest: boolean;
}

export interface MatchSession {
  id: string;
  user_id: string;
  answers: MatchAnswers;
  ranked_results: Array<{
    teacher_id: string;
    service_id: string | null;
    score: number;
    reasons: string[];
  }>;
  selected_teacher_id: string | null;
  created_at: string;
}
