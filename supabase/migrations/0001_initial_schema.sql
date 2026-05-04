-- =====================================================================
-- 命理媒介中心 — 初始資料庫 Schema
-- =====================================================================
-- 日期：2026-04-27
-- 對應：Supabase (PostgreSQL 15+)
-- 啟用 UUID + Row Level Security

-- ---------- Extensions ----------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================================
-- 1. profiles — 客戶資料（延伸 auth.users）
-- =====================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  line_user_id text unique,                -- LINE login 用
  birth_date date,
  birth_time time,                          -- 出生時間（本地時）
  birth_location text,                      -- 文字地名
  birth_lat numeric(8,5),                   -- 緯度
  birth_lon numeric(8,5),                   -- 經度
  birth_timezone text,                      -- e.g. 'Asia/Taipei'
  gender text check (gender in ('男','女','其他','未填')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_line_user_id on public.profiles(line_user_id);

-- =====================================================================
-- 2. teacher_applications — 老師申請表（審核流程入口）
-- =====================================================================
create type teacher_status as enum (
  'pending',      -- 已送出、未審
  'reviewing',    -- 審核中
  'revision',     -- 需補件
  'rejected',     -- 拒絕
  'interview',    -- 試講中
  'contracted',   -- 已簽約
  'active',       -- 上架中
  'paused',       -- 暫停接案（老師主動）
  'suspended'     -- 停權（管理員強制）
);

create table public.teacher_applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status teacher_status not null default 'pending',

  -- 基本資料
  legal_name text not null,                 -- 真實姓名
  display_name text not null,               -- 對外顯示名稱
  birth_date date,
  email text not null,
  phone text not null,
  address text,

  -- 專業資料
  specialties text[] not null,              -- 專長領域 (e.g. ['八字','紫微','塔羅'])
  years_of_experience int,
  intro_short text not null,                -- 30 字內自介
  intro_long text,                          -- 長版介紹
  quote text,                               -- 一句話格言

  -- 上傳檔案（Supabase Storage URLs）
  id_doc_front_url text,                    -- 證件正面
  id_doc_back_url text,                     -- 證件背面
  cert_urls text[],                          -- 證書/結業證明
  portfolio_urls text[],                     -- 作品/案例
  intro_video_url text,                     -- 自介影片

  -- 社群連結
  line_url text,
  instagram text,
  facebook text,
  threads text,
  youtube text,
  website text,

  -- 試講
  interview_video_url text,
  interview_score_pro int check (interview_score_pro between 1 and 5),
  interview_score_express int check (interview_score_express between 1 and 5),
  interview_score_warmth int check (interview_score_warmth between 1 and 5),
  interview_notes text,

  -- 簽約
  commission_rate numeric(4,3) default 0.200,  -- 抽成比例（預設 20%，正式比例以合約為準）
  agreed_terms_at timestamptz,

  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_id uuid references auth.users(id),
  reviewer_notes text,                      -- 內部審核註記

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_teacher_apps_status on public.teacher_applications(status);
create index idx_teacher_apps_user on public.teacher_applications(user_id);

-- =====================================================================
-- 3. teachers — 老師上架資料（status active 才會 join 顯示在前台）
-- =====================================================================
create table public.teachers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  application_id uuid references public.teacher_applications(id),
  status teacher_status not null default 'pending',

  -- 公開資料
  display_name text not null,
  avatar_url text,
  title text,                               -- 頭銜，如「資深紫微老師」
  intro_short text,
  intro_long text,
  quote text,
  specialties text[] not null,
  consultation_style text,                  -- 諮詢風格

  -- 社群
  line_url text,
  instagram text,
  facebook text,
  threads text,
  youtube text,
  website text,

  -- 統計（自動計算）
  rating numeric(3,2) default 0,            -- 平均評分
  total_reviews int default 0,
  cases_count int default 0,                -- 完成的諮詢次數

  commission_rate numeric(4,3) default 0.200,

  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  paused_at timestamptz,
  suspended_at timestamptz,
  suspended_reason text,

  -- 後台專用：諮詢腳本（只有老師自己看得到）
  admin_script text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_teachers_status on public.teachers(status);
create index idx_teachers_specialties on public.teachers using gin(specialties);

-- =====================================================================
-- 4. teacher_services — 老師服務項目
-- =====================================================================
create table public.teacher_services (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  name text not null,                       -- 例「紫微全盤詳解」
  description text,
  duration_minutes int not null,            -- 30 / 60 / 90...
  price_ntd int not null,                   -- 價格（新台幣，元為單位）
  is_active boolean not null default true,
  display_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_services_teacher on public.teacher_services(teacher_id) where is_active;

-- =====================================================================
-- 5. teacher_availability — 老師可預約時段
-- =====================================================================
-- 兩種模式：
--   (a) 週循環模式：day_of_week (0=Sun..6=Sat) 設定每週固定時段
--   (b) 特定日期模式：specific_date 設定某日的特殊時段（覆蓋週循環）
create table public.teacher_availability (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  day_of_week int check (day_of_week between 0 and 6),
  specific_date date,
  start_time time not null,
  end_time time not null,
  timezone text not null default 'Asia/Taipei',
  is_blocked boolean not null default false, -- true = 該時段封鎖（休假）
  created_at timestamptz not null default now(),
  check ((day_of_week is not null) or (specific_date is not null))
);

create index idx_availability_teacher on public.teacher_availability(teacher_id);

-- =====================================================================
-- 6. bookings — 預約
-- =====================================================================
create type booking_status as enum (
  'pending',        -- 已建立、待付款
  'paid',           -- 已付款、待諮詢
  'confirmed',      -- 老師已確認
  'in_progress',    -- 諮詢進行中
  'completed',      -- 完成
  'cancelled_customer',  -- 客戶取消
  'cancelled_teacher',   -- 老師取消
  'refunded',       -- 退款完成
  'no_show'         -- 客戶未出席
);

create table public.bookings (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references auth.users(id),
  teacher_id uuid not null references public.teachers(id),
  service_id uuid not null references public.teacher_services(id),

  scheduled_at timestamptz not null,
  duration_minutes int not null,
  timezone text not null default 'Asia/Taipei',

  status booking_status not null default 'pending',

  -- 金額
  amount_ntd int not null,
  platform_fee_ntd int not null,
  teacher_amount_ntd int not null,
  payment_provider text,                    -- 'ecpay' | 'newebpay' | etc
  payment_id text,
  paid_at timestamptz,

  -- 諮詢前準備
  customer_question text,                   -- 客戶提問
  chart_tool text,                          -- 'bazi' | 'ziwei' | etc - 自動排盤工具
  chart_data jsonb,                         -- 排盤結果，老師打開即看到

  -- 諮詢進行
  meeting_url text,                         -- LINE / Zoom / Google Meet
  started_at timestamptz,
  completed_at timestamptz,

  -- 取消 / 退款
  cancelled_at timestamptz,
  cancellation_reason text,
  refunded_at timestamptz,
  refund_amount_ntd int,

  -- 諮詢後補充（諮詢結束 7 天內可問 1 個免費追問）
  followup_question text,
  followup_answer text,
  followup_used_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_bookings_customer on public.bookings(customer_id);
create index idx_bookings_teacher on public.bookings(teacher_id);
create index idx_bookings_status_scheduled on public.bookings(status, scheduled_at);

-- =====================================================================
-- 7. reviews — 客戶評價
-- =====================================================================
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  customer_id uuid not null references auth.users(id),
  teacher_id uuid not null references public.teachers(id),

  rating int not null check (rating between 1 and 5),
  comment text,
  is_anonymous boolean not null default false,  -- 靜默模式（評價但不顯示客戶）
  is_visible boolean not null default true,     -- admin 可隱藏不當評論

  created_at timestamptz not null default now()
);

create index idx_reviews_teacher_visible on public.reviews(teacher_id) where is_visible;

-- =====================================================================
-- 8. chart_records — 排盤紀錄（免費簡易版）
-- =====================================================================
create type chart_tool as enum (
  'numerology', 'maya', 'bazi', 'tarot', 'runes',
  'astro', 'ziwei', 'humandesign'
);

create table public.chart_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,  -- 未登入也允許
  tool chart_tool not null,
  input_data jsonb not null,
  output_data jsonb not null,
  created_at timestamptz not null default now()
);

create index idx_chart_records_user on public.chart_records(user_id) where user_id is not null;
create index idx_chart_records_tool on public.chart_records(tool);

-- =====================================================================
-- 9. teacher_review_log — 老師狀態變更稽核日誌
-- =====================================================================
create table public.teacher_review_log (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid references public.teachers(id) on delete cascade,
  application_id uuid references public.teacher_applications(id) on delete cascade,
  reviewer_id uuid references auth.users(id),
  action text not null,                     -- 'submit' | 'review' | 'approve' | 'reject' | 'request_revision' | 'suspend' | 'pause' | 'resume'
  old_status teacher_status,
  new_status teacher_status,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_review_log_teacher on public.teacher_review_log(teacher_id, created_at desc);

-- =====================================================================
-- 10. admins — 管理員（有審核權限的人）
-- =====================================================================
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'reviewer',    -- 'super' | 'reviewer' | 'moderator'
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 11. notifications — 站內通知
-- =====================================================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,                       -- 'booking_reminder' | 'booking_confirmed' | 'review_request' | 'teacher_status_change' | etc
  title text not null,
  body text,
  link text,                                -- 點擊後跳轉
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_unread on public.notifications(user_id, created_at desc) where read_at is null;

-- =====================================================================
-- updated_at 自動更新 trigger
-- =====================================================================
create or replace function public.tg_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.tg_set_updated_at();
create trigger trg_teacher_apps_updated before update on public.teacher_applications
  for each row execute function public.tg_set_updated_at();
create trigger trg_teachers_updated before update on public.teachers
  for each row execute function public.tg_set_updated_at();
create trigger trg_services_updated before update on public.teacher_services
  for each row execute function public.tg_set_updated_at();
create trigger trg_bookings_updated before update on public.bookings
  for each row execute function public.tg_set_updated_at();
