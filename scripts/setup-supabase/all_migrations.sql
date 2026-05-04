-- =====================================================================
-- Mele Supabase Schema (combined migrations 0001~0007)
-- Generated from supabase/migrations for SQL Editor setup.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0001_initial_schema.sql
-- ---------------------------------------------------------------------
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


-- ---------------------------------------------------------------------
-- 0002_rls_policies.sql
-- ---------------------------------------------------------------------
-- =====================================================================
-- Row Level Security Policies
-- =====================================================================
-- 原則：
--   - 客戶可看自己的所有資料、其他公開資料（active 老師、可見評價）
--   - 老師可看自己的所有資料 + 自己被預約的客戶基本資料
--   - 管理員可看一切

-- ---------- helper: is_admin ----------
create or replace function public.is_admin(uid uuid)
returns boolean as $$
  select exists(select 1 from public.admins where user_id = uid)
$$ language sql stable security definer;

-- ---------- helper: is_teacher ----------
create or replace function public.is_teacher(uid uuid)
returns boolean as $$
  select exists(select 1 from public.teachers where user_id = uid and status = 'active')
$$ language sql stable security definer;

-- ============================================================
-- profiles
-- ============================================================
alter table public.profiles enable row level security;

-- 自己讀寫自己
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_self_insert" on public.profiles
  for insert with check (auth.uid() = id);

-- 管理員可讀全部
create policy "profiles_admin_select" on public.profiles
  for select using (public.is_admin(auth.uid()));

-- 老師可讀「曾預約過自己」的客戶 profile
create policy "profiles_teacher_select_customers" on public.profiles
  for select using (
    public.is_teacher(auth.uid())
    and id in (
      select customer_id from public.bookings
       where teacher_id in (select id from public.teachers where user_id = auth.uid())
    )
  );

-- ============================================================
-- teacher_applications
-- ============================================================
alter table public.teacher_applications enable row level security;

create policy "applications_self_all" on public.teacher_applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "applications_admin_all" on public.teacher_applications
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ============================================================
-- teachers
-- ============================================================
alter table public.teachers enable row level security;

-- 公開讀：active 狀態的老師全公開
create policy "teachers_public_select_active" on public.teachers
  for select using (status = 'active');

-- 老師自己讀寫
create policy "teachers_self_all" on public.teachers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 管理員全權
create policy "teachers_admin_all" on public.teachers
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ============================================================
-- teacher_services
-- ============================================================
alter table public.teacher_services enable row level security;

create policy "services_public_select_active" on public.teacher_services
  for select using (
    is_active and
    teacher_id in (select id from public.teachers where status = 'active')
  );

create policy "services_teacher_self_all" on public.teacher_services
  for all using (
    teacher_id in (select id from public.teachers where user_id = auth.uid())
  ) with check (
    teacher_id in (select id from public.teachers where user_id = auth.uid())
  );

create policy "services_admin_all" on public.teacher_services
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ============================================================
-- teacher_availability
-- ============================================================
alter table public.teacher_availability enable row level security;

create policy "availability_public_select" on public.teacher_availability
  for select using (
    teacher_id in (select id from public.teachers where status = 'active')
  );

create policy "availability_teacher_self_all" on public.teacher_availability
  for all using (
    teacher_id in (select id from public.teachers where user_id = auth.uid())
  ) with check (
    teacher_id in (select id from public.teachers where user_id = auth.uid())
  );

-- ============================================================
-- bookings
-- ============================================================
alter table public.bookings enable row level security;

-- 客戶看自己的
create policy "bookings_customer_self" on public.bookings
  for select using (auth.uid() = customer_id);

-- 老師看自己的
create policy "bookings_teacher_self" on public.bookings
  for select using (
    teacher_id in (select id from public.teachers where user_id = auth.uid())
  );

-- 客戶更新（限自己取消）

-- 老師更新（限自己的）

-- 管理員
create policy "bookings_admin_all" on public.bookings
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ============================================================
-- reviews
-- ============================================================
alter table public.reviews enable row level security;

create policy "reviews_public_select_visible" on public.reviews
  for select using (is_visible);

create policy "reviews_customer_insert" on public.reviews
  for insert with check (auth.uid() = customer_id);

create policy "reviews_customer_self" on public.reviews
  for select using (auth.uid() = customer_id);

create policy "reviews_admin_all" on public.reviews
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ============================================================
-- chart_records (免費排盤紀錄)
-- ============================================================
alter table public.chart_records enable row level security;

-- 寫入：登入用戶寫自己的、未登入也可寫（user_id = null）
create policy "chart_records_insert" on public.chart_records
  for insert with check (auth.uid() = user_id or user_id is null);

-- 讀：自己的
create policy "chart_records_self_select" on public.chart_records
  for select using (auth.uid() = user_id);

-- 老師可讀客戶的排盤紀錄（限自己的客戶）
create policy "chart_records_teacher_select" on public.chart_records
  for select using (
    public.is_teacher(auth.uid())
    and user_id in (
      select customer_id from public.bookings
       where teacher_id in (select id from public.teachers where user_id = auth.uid())
    )
  );

-- ============================================================
-- teacher_review_log
-- ============================================================
alter table public.teacher_review_log enable row level security;

create policy "review_log_admin_all" on public.teacher_review_log
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- 老師可讀關於自己的 log
create policy "review_log_self_select" on public.teacher_review_log
  for select using (
    teacher_id in (select id from public.teachers where user_id = auth.uid())
    or application_id in (select id from public.teacher_applications where user_id = auth.uid())
  );

-- ============================================================
-- admins
-- ============================================================
alter table public.admins enable row level security;

create policy "admins_self_select" on public.admins
  for select using (auth.uid() = user_id);

create policy "admins_super_all" on public.admins
  for all using (
    exists(select 1 from public.admins where user_id = auth.uid() and role = 'super')
  );

-- ============================================================
-- notifications
-- ============================================================
alter table public.notifications enable row level security;

create policy "notifications_self_all" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------
-- 0003_workflow_functions.sql
-- ---------------------------------------------------------------------
-- =====================================================================
-- 業務流程函式
-- =====================================================================

-- ---------- submit_teacher_application ----------
-- 老師送出申請（pending 狀態）
create or replace function public.submit_teacher_application(
  p_legal_name text,
  p_display_name text,
  p_email text,
  p_phone text,
  p_specialties text[],
  p_intro_short text,
  p_intro_long text,
  p_quote text,
  p_id_doc_front_url text,
  p_id_doc_back_url text,
  p_intro_video_url text,
  p_line_url text,
  p_instagram text,
  p_facebook text,
  p_threads text,
  p_youtube text
)
returns uuid as $$
declare
  v_app_id uuid;
begin
  insert into public.teacher_applications (
    user_id, legal_name, display_name, email, phone,
    specialties, intro_short, intro_long, quote,
    id_doc_front_url, id_doc_back_url, intro_video_url,
    line_url, instagram, facebook, threads, youtube
  ) values (
    auth.uid(), p_legal_name, p_display_name, p_email, p_phone,
    p_specialties, p_intro_short, p_intro_long, p_quote,
    p_id_doc_front_url, p_id_doc_back_url, p_intro_video_url,
    p_line_url, p_instagram, p_facebook, p_threads, p_youtube
  )
  returning id into v_app_id;

  insert into public.teacher_review_log (application_id, action, new_status, notes)
  values (v_app_id, 'submit', 'pending', '申請送出');

  return v_app_id;
end;
$$ language plpgsql security definer;

-- ---------- review_teacher_application ----------
-- 管理員審核：批准 / 拒絕 / 需補件 / 進入試講
create or replace function public.review_teacher_application(
  p_application_id uuid,
  p_action text,                 -- 'approve' | 'reject' | 'request_revision' | 'interview'
  p_notes text default null,
  p_commission_rate numeric default 0.20
)
returns void as $$
declare
  v_old_status teacher_status;
  v_new_status teacher_status;
  v_user_id uuid;
begin
  -- 權限檢查
  if not public.is_admin(auth.uid()) then
    raise exception 'forbidden: not admin';
  end if;

  select status, user_id into v_old_status, v_user_id
  from public.teacher_applications where id = p_application_id;

  if not found then
    raise exception 'application not found';
  end if;

  v_new_status := case p_action
    when 'approve' then 'contracted'::teacher_status
    when 'reject' then 'rejected'::teacher_status
    when 'request_revision' then 'revision'::teacher_status
    when 'interview' then 'interview'::teacher_status
    when 'review' then 'reviewing'::teacher_status
    else null
  end;

  if v_new_status is null then
    raise exception 'invalid action: %', p_action;
  end if;

  update public.teacher_applications
     set status = v_new_status,
         reviewer_id = auth.uid(),
         reviewer_notes = coalesce(p_notes, reviewer_notes),
         reviewed_at = now(),
         commission_rate = case when p_action = 'approve' then p_commission_rate else commission_rate end
   where id = p_application_id;

  insert into public.teacher_review_log (application_id, reviewer_id, action, old_status, new_status, notes)
  values (p_application_id, auth.uid(), p_action, v_old_status, v_new_status, p_notes);

  -- 通知申請人
  insert into public.notifications (user_id, type, title, body)
  values (
    v_user_id,
    'teacher_status_change',
    case p_action
      when 'approve' then '🎉 老師申請審核通過'
      when 'reject' then '老師申請未通過'
      when 'request_revision' then '請補件'
      when 'interview' then '請安排試講'
      when 'review' then '審核中'
    end,
    p_notes
  );
end;
$$ language plpgsql security definer;

-- ---------- activate_teacher ----------
-- 老師正式上架（從 contracted → active），需先建立 teachers 紀錄
create or replace function public.activate_teacher(p_application_id uuid)
returns uuid as $$
declare
  v_teacher_id uuid;
  v_app record;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'forbidden: not admin';
  end if;

  select * into v_app from public.teacher_applications where id = p_application_id;
  if v_app.status <> 'contracted' then
    raise exception 'application not in contracted status';
  end if;

  insert into public.teachers (
    user_id, application_id, status, display_name, intro_short, intro_long, quote,
    specialties, line_url, instagram, facebook, threads, youtube,
    commission_rate, approved_at, approved_by
  ) values (
    v_app.user_id, p_application_id, 'active'::teacher_status,
    v_app.display_name, v_app.intro_short, v_app.intro_long, v_app.quote,
    v_app.specialties, v_app.line_url, v_app.instagram, v_app.facebook,
    v_app.threads, v_app.youtube, v_app.commission_rate,
    now(), auth.uid()
  )
  returning id into v_teacher_id;

  update public.teacher_applications set status = 'active' where id = p_application_id;

  insert into public.teacher_review_log (teacher_id, application_id, reviewer_id, action, old_status, new_status)
  values (v_teacher_id, p_application_id, auth.uid(), 'activate', 'contracted', 'active');

  return v_teacher_id;
end;
$$ language plpgsql security definer;

-- ---------- suspend_teacher ----------
-- 管理員停權老師
create or replace function public.suspend_teacher(p_teacher_id uuid, p_reason text)
returns void as $$
declare
  v_old teacher_status;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'forbidden';
  end if;

  select status into v_old from public.teachers where id = p_teacher_id;

  update public.teachers
     set status = 'suspended', suspended_at = now(), suspended_reason = p_reason
   where id = p_teacher_id;

  insert into public.teacher_review_log (teacher_id, reviewer_id, action, old_status, new_status, notes)
  values (p_teacher_id, auth.uid(), 'suspend', v_old, 'suspended', p_reason);
end;
$$ language plpgsql security definer;

-- ---------- update_teacher_rating ----------
-- 自動更新老師評分（trigger on reviews）
create or replace function public.tg_update_teacher_rating()
returns trigger as $$
begin
  update public.teachers t
     set rating = (
       select round(avg(rating)::numeric, 2)
         from public.reviews
        where teacher_id = coalesce(new.teacher_id, old.teacher_id) and is_visible
     ),
     total_reviews = (
       select count(*) from public.reviews
        where teacher_id = coalesce(new.teacher_id, old.teacher_id) and is_visible
     )
   where id = coalesce(new.teacher_id, old.teacher_id);
  return null;
end;
$$ language plpgsql;

create trigger trg_reviews_update_rating
  after insert or update or delete on public.reviews
  for each row execute function public.tg_update_teacher_rating();

-- ---------- update_teacher_cases_count ----------
create or replace function public.tg_update_cases_count()
returns trigger as $$
begin
  if new.status = 'completed' and (old.status is null or old.status <> 'completed') then
    update public.teachers set cases_count = cases_count + 1 where id = new.teacher_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger trg_bookings_cases_count
  after insert or update on public.bookings
  for each row execute function public.tg_update_cases_count();

-- ---------- compute booking amounts ----------
-- 自動計算 platform_fee 與 teacher_amount
create or replace function public.tg_compute_booking_amounts()
returns trigger as $$
declare
  v_rate numeric;
begin
  if new.amount_ntd is not null then
    select commission_rate into v_rate from public.teachers where id = new.teacher_id;
    new.platform_fee_ntd := round(new.amount_ntd * coalesce(v_rate, 0.20));
    new.teacher_amount_ntd := new.amount_ntd - new.platform_fee_ntd;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_bookings_compute
  before insert on public.bookings
  for each row execute function public.tg_compute_booking_amounts();


-- ---------------------------------------------------------------------
-- 0004_p0_fixes.sql
-- ---------------------------------------------------------------------
-- =====================================================================
-- 0004 — P0 上線阻擋項補強
-- =====================================================================
-- 1) 雙重預約防護
-- 2) cancel_booking 自動退款
-- 3) confirm_payment（金流 webhook 用）
-- 4) 評價邀請 auto trigger
-- 5) cases_count 退款反扣
-- 6) support_threads 客服工單
-- 7) bookings.settlement_id 結算
-- 8) profiles 隱私 / 條款同意紀錄
-- 9) v_teacher_open_slots view
-- =====================================================================

-- ---------- 1. profiles 隱私同意欄位 ----------
alter table public.profiles
  add column if not exists privacy_consent_at timestamptz,
  add column if not exists tos_consent_at timestamptz,
  add column if not exists privacy_consent_version text,
  add column if not exists marketing_opt_in boolean not null default false;

-- ---------- 2. bookings 補結算欄位 ----------
alter table public.bookings
  add column if not exists settlement_id uuid,
  add column if not exists privacy_consent_at timestamptz,
  add column if not exists no_refund_consent boolean not null default false,
  add column if not exists dispute_status text check (dispute_status in ('none','open','resolved')) default 'none';

-- ---------- 3. 雙重預約防護（同老師同時段不可重複） ----------
-- 已成立的預約（不含取消/退款/no_show）才參與佔用
create unique index if not exists uniq_booking_teacher_slot
  on public.bookings(teacher_id, scheduled_at)
  where status in ('pending','paid','confirmed','in_progress','completed');

-- ---------- 4. settlements 結算批次表 ----------
create table if not exists public.settlements (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  total_amount_ntd int not null default 0,
  total_platform_fee_ntd int not null default 0,
  total_teacher_amount_ntd int not null default 0,
  bookings_count int not null default 0,
  status text not null default 'pending' check (status in ('pending','paid','failed')),
  paid_at timestamptz,
  payout_method text,
  payout_reference text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_settlements_teacher on public.settlements(teacher_id, period_end desc);

alter table public.settlements enable row level security;
create policy "settlements_admin_all" on public.settlements
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "settlements_teacher_self_select" on public.settlements
  for select using (
    teacher_id in (select id from public.teachers where user_id = auth.uid())
  );

-- ---------- 5. support_threads 客服工單 ----------
create table if not exists public.support_threads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  category text not null check (category in ('booking','payment','dispute','teacher','other')),
  subject text not null,
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  assigned_admin_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists idx_support_status on public.support_threads(status, priority desc, created_at desc);

create table if not exists public.support_messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references public.support_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  body text not null,
  is_internal boolean not null default false,  -- admin 內部備註
  created_at timestamptz not null default now()
);
create index if not exists idx_support_msg_thread on public.support_messages(thread_id, created_at);

alter table public.support_threads enable row level security;
alter table public.support_messages enable row level security;

create policy "support_self_select" on public.support_threads
  for select using (auth.uid() = user_id);
create policy "support_self_insert" on public.support_threads
  for insert with check (auth.uid() = user_id);
create policy "support_admin_all" on public.support_threads
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "support_msg_thread_member" on public.support_messages
  for select using (
    thread_id in (select id from public.support_threads where user_id = auth.uid())
    or public.is_admin(auth.uid())
  );
create policy "support_msg_insert_member" on public.support_messages
  for insert with check (
    sender_id = auth.uid()
    and (
      public.is_admin(auth.uid())
      or thread_id in (select id from public.support_threads where user_id = auth.uid())
    )
    and (not is_internal or public.is_admin(auth.uid()))
  );

-- updated_at trigger
drop trigger if exists trg_support_updated on public.support_threads;
create trigger trg_support_updated before update on public.support_threads
  for each row execute function public.tg_set_updated_at();

-- ---------- 6. confirm_payment ----------
-- 給金流 webhook 呼叫（service_role）：把 booking 從 pending → paid
create or replace function public.confirm_payment(
  p_booking_id uuid,
  p_provider text,
  p_payment_id text,
  p_paid_amount int
) returns void as $$
declare
  v_amount int;
  v_status booking_status;
begin
  select amount_ntd, status into v_amount, v_status
    from public.bookings where id = p_booking_id for update;

  if not found then
    raise exception 'booking not found: %', p_booking_id;
  end if;

  if v_status not in ('pending') then
    raise notice 'booking % already in status %, skip', p_booking_id, v_status;
    return;
  end if;

  if p_paid_amount <> v_amount then
    raise exception 'paid amount % does not match expected %', p_paid_amount, v_amount;
  end if;

  update public.bookings
     set status = 'paid',
         payment_provider = p_provider,
         payment_id = p_payment_id,
         paid_at = now()
   where id = p_booking_id;

  -- 通知客戶
  insert into public.notifications (user_id, type, title, body, link)
  select customer_id, 'booking_paid', '✅ 付款成功', '您的預約已確認，老師將於諮詢前 24 小時聯繫您。',
         '/account/mybookings.html'
    from public.bookings where id = p_booking_id;

  -- 通知老師
  insert into public.notifications (user_id, type, title, body, link)
  select t.user_id, 'booking_new', '🔔 新預約已付款', '請查看預約詳情並準備諮詢。',
         '/teacher-portal/bookings.html'
    from public.bookings b join public.teachers t on t.id = b.teacher_id
   where b.id = p_booking_id;
end;
$$ language plpgsql security definer;

-- ---------- 7. cancel_booking（含 24h 退款規則） ----------
-- ---------- 6a. create_booking_request ----------
create or replace function public.create_booking_request(
  p_teacher_id uuid,
  p_service_id uuid,
  p_scheduled_at timestamptz,
  p_customer_question text,
  p_chart_tool text default null,
  p_chart_data jsonb default null,
  p_free_test_mode boolean default false
) returns uuid as $$
declare
  v_service record;
  v_booking_id uuid;
begin
  if auth.uid() is null then
    raise exception 'auth required';
  end if;

  if length(trim(coalesce(p_customer_question, ''))) < 1 then
    raise exception 'customer question is required';
  end if;

  select s.id, s.teacher_id, s.duration_minutes, s.price_ntd
    into v_service
    from public.teacher_services s
    join public.teachers t on t.id = s.teacher_id
   where s.id = p_service_id
     and s.teacher_id = p_teacher_id
     and s.is_active = true
     and t.status = 'active';

  if not found then
    raise exception 'service not available';
  end if;

  insert into public.bookings (
    customer_id,
    teacher_id,
    service_id,
    scheduled_at,
    duration_minutes,
    amount_ntd,
    customer_question,
    chart_tool,
    chart_data,
    status,
    payment_provider,
    payment_id,
    paid_at
  ) values (
    auth.uid(),
    p_teacher_id,
    p_service_id,
    p_scheduled_at,
    v_service.duration_minutes,
    v_service.price_ntd,
    trim(p_customer_question),
    nullif(p_chart_tool, ''),
    p_chart_data,
    case when p_free_test_mode then 'confirmed'::booking_status else 'pending'::booking_status end,
    case when p_free_test_mode then 'free_test' else null end,
    case when p_free_test_mode then 'free_test:' || gen_random_uuid()::text else null end,
    case when p_free_test_mode then now() else null end
  )
  returning id into v_booking_id;

  if p_free_test_mode then
    insert into public.notifications (user_id, type, title, body, link)
    select customer_id, 'booking_paid', '免費測試預約已成立',
           '目前網站測試期不收費，預約已直接成立。',
           '/account/mybookings'
      from public.bookings
     where id = v_booking_id;

    insert into public.notifications (user_id, type, title, body, link)
    select t.user_id, 'booking_new', '新的免費測試預約',
           '使用者已建立測試期免費預約，請至老師後台查看。',
           '/teacher-portal/bookings.html'
      from public.bookings b
      join public.teachers t on t.id = b.teacher_id
     where b.id = v_booking_id;
  end if;

  return v_booking_id;
end;
$$ language plpgsql security definer;

create or replace function public.cancel_booking(
  p_booking_id uuid,
  p_reason text
) returns jsonb as $$
declare
  v_b record;
  v_hours_until numeric;
  v_refund_pct numeric;
  v_refund int;
  v_is_customer boolean;
  v_is_teacher boolean;
  v_is_admin boolean;
  v_new_status booking_status;
begin
  select * into v_b from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'booking not found'; end if;

  v_is_customer := (v_b.customer_id = auth.uid());
  v_is_teacher  := exists (select 1 from public.teachers where id = v_b.teacher_id and user_id = auth.uid());
  v_is_admin    := public.is_admin(auth.uid());

  if not (v_is_customer or v_is_teacher or v_is_admin) then
    raise exception 'forbidden';
  end if;

  if v_b.status in ('completed','cancelled_customer','cancelled_teacher','refunded','no_show') then
    raise exception 'booking cannot be cancelled in current status: %', v_b.status;
  end if;

  v_hours_until := extract(epoch from (v_b.scheduled_at - now())) / 3600.0;

  -- 取消政策：
  --   老師取消 / admin 取消 → 100% 退款
  --   客戶取消：
  --     未付款 (pending) → 直接取消，無退款
  --     >= 24h → 全退
  --     < 24h  → 50% 退
  --     已開始 → 0% 退
  if v_is_teacher and not v_is_customer and not v_is_admin then
    v_refund_pct := 1.0;
    v_new_status := 'cancelled_teacher';
  elsif v_is_admin and not v_is_customer and not v_is_teacher then
    v_refund_pct := 1.0;
    v_new_status := 'cancelled_teacher';
  else
    -- 客戶取消（含同時是老師，但我們以客戶身份處理）
    v_new_status := 'cancelled_customer';
    if v_b.status = 'pending' then
      v_refund_pct := 0;
    elsif v_b.status = 'in_progress' then
      v_refund_pct := 0;
    elsif v_hours_until >= 24 then
      v_refund_pct := 1.0;
    elsif v_hours_until > 0 then
      v_refund_pct := 0.5;
    else
      v_refund_pct := 0;
    end if;
  end if;

  v_refund := round(coalesce(v_b.amount_ntd, 0) * v_refund_pct);

  update public.bookings
     set status = case when v_refund > 0 then 'refunded'::booking_status else v_new_status end,
         cancelled_at = now(),
         cancellation_reason = p_reason,
         refund_amount_ntd = v_refund,
         refunded_at = case when v_refund > 0 then now() else null end
   where id = p_booking_id;

  -- 通知雙方
  insert into public.notifications (user_id, type, title, body)
  values
    (v_b.customer_id, 'booking_cancelled',
      case when v_refund > 0 then '預約已取消（退款 NT$' || v_refund || '）' else '預約已取消' end,
      p_reason),
    ((select user_id from public.teachers where id = v_b.teacher_id), 'booking_cancelled',
      '預約已取消', p_reason);

  return jsonb_build_object(
    'cancelled', true,
    'refund_amount_ntd', v_refund,
    'refund_pct', v_refund_pct,
    'new_status', case when v_refund > 0 then 'refunded' else v_new_status end
  );
end;
$$ language plpgsql security definer;

-- ---------- 8. complete_booking + auto review request ----------
create or replace function public.complete_booking(p_booking_id uuid)
returns void as $$
declare v_b record; v_is_teacher boolean;
begin
  select * into v_b from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'booking not found'; end if;
  v_is_teacher := exists (select 1 from public.teachers where id = v_b.teacher_id and user_id = auth.uid());
  if not (v_is_teacher or public.is_admin(auth.uid())) then raise exception 'forbidden'; end if;
  if v_b.status not in ('paid','confirmed','in_progress') then
    raise exception 'cannot complete from status %', v_b.status;
  end if;

  update public.bookings set status='completed', completed_at = now() where id = p_booking_id;

  -- 發評價邀請（含 7 天免費追問提醒）
  insert into public.notifications (user_id, type, title, body, link)
  values (v_b.customer_id, 'review_request', '✨ 給老師一個鼓勵',
    '諮詢已完成。歡迎留下評價，並可在 7 天內提出 1 個免費追問。',
    '/account/mybookings.html?id=' || p_booking_id);
end;
$$ language plpgsql security definer;

-- ---------- 8b. update_booking_followup（追問只走 RPC） ----------
create or replace function public.update_booking_followup(
  p_booking_id uuid,
  p_question text
) returns void as $$
declare
  v_b record;
begin
  select * into v_b from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'booking not found'; end if;

  if not (v_b.customer_id = auth.uid() or public.is_admin(auth.uid())) then
    raise exception 'forbidden';
  end if;

  if v_b.status <> 'completed' then
    raise exception 'followup is only available after completion';
  end if;

  if v_b.followup_question is not null then
    raise exception 'followup already used';
  end if;

  if length(trim(coalesce(p_question, ''))) < 1 then
    raise exception 'followup question is required';
  end if;

  update public.bookings
     set followup_question = trim(p_question),
         followup_used_at = now()
   where id = p_booking_id;
end;
$$ language plpgsql security definer;

-- ---------- 9. cases_count 退款反扣 ----------
create or replace function public.tg_update_cases_count()
returns trigger as $$
begin
  -- 進入 completed → +1
  if new.status = 'completed' and (old.status is null or old.status <> 'completed') then
    update public.teachers set cases_count = cases_count + 1 where id = new.teacher_id;
  end if;
  -- 從 completed → refunded/cancelled → -1
  if old.status = 'completed' and new.status in ('refunded','cancelled_customer','cancelled_teacher') then
    update public.teachers set cases_count = greatest(cases_count - 1, 0) where id = new.teacher_id;
  end if;
  return null;
end;
$$ language plpgsql;

-- ---------- 10. v_teacher_open_slots（前端可預約時段 view） ----------
-- 把 weekly + specific_date + is_blocked + 已被預約 全部攤平
-- 給未來 30 天的可預約 30/60 分鐘 slot
create or replace view public.v_teacher_busy as
  select teacher_id, scheduled_at as start_at,
         scheduled_at + (duration_minutes || ' minutes')::interval as end_at
    from public.bookings
   where status in ('pending','paid','confirmed','in_progress','completed');

-- ---------- 11. helper: 提交客服工單 ----------
create or replace function public.create_support_thread(
  p_category text,
  p_subject text,
  p_body text,
  p_booking_id uuid default null
) returns uuid as $$
declare v_id uuid;
begin
  insert into public.support_threads (user_id, booking_id, category, subject, priority)
  values (auth.uid(), p_booking_id, p_category, p_subject,
    case when p_category in ('payment','dispute') then 'high' else 'normal' end)
  returning id into v_id;

  insert into public.support_messages (thread_id, sender_id, body)
  values (v_id, auth.uid(), p_body);

  -- 通知所有 admin（簡化：抓全部 admin）
  insert into public.notifications (user_id, type, title, body, link)
  select user_id, 'support_new', '🆘 新客服工單：' || p_subject, p_body,
         '/admin/index.html?tab=support&id=' || v_id
    from public.admins;

  return v_id;
end;
$$ language plpgsql security definer;

-- ---------- 12. 後台統計 view ----------
create or replace view public.v_admin_stats as
  select
    (select count(*) from public.teacher_applications where status = 'pending') as pending_apps,
    (select count(*) from public.teacher_applications where status in ('reviewing','interview','revision')) as in_review_apps,
    (select count(*) from public.teachers where status = 'active') as active_teachers,
    (select count(*) from public.bookings where status = 'paid') as paid_unconfirmed,
    (select count(*) from public.bookings where status = 'completed') as total_completed,
    (select count(*) from public.support_threads where status in ('open','in_progress')) as open_tickets,
    (select count(*) from public.reviews where rating <= 2 and is_visible) as low_reviews,
    (select coalesce(sum(platform_fee_ntd), 0) from public.bookings where status in ('completed','refunded')) as total_platform_revenue;

-- ---------- 13. 保留同意條款歷史（用於合規舉證） ----------
create table if not exists public.consent_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null check (consent_type in ('privacy','tos','marketing','no_refund')),
  consent_version text not null,
  ip_address inet,
  user_agent text,
  consented_at timestamptz not null default now()
);
create index if not exists idx_consent_log_user on public.consent_log(user_id, consent_type);

alter table public.consent_log enable row level security;
create policy "consent_self_select" on public.consent_log for select using (auth.uid() = user_id);
create policy "consent_self_insert" on public.consent_log for insert with check (auth.uid() = user_id);
create policy "consent_admin_select" on public.consent_log for select using (public.is_admin(auth.uid()));

-- ---------- 14. KYC 文件保留期限自動清除 ----------
-- 老師若 paused/suspended/rejected 超過 90 天，把證件 URL 清空
create or replace function public.purge_old_kyc_docs() returns int as $$
declare v_count int;
begin
  with purged as (
    update public.teacher_applications
       set id_doc_front_url = null,
           id_doc_back_url = null,
           cert_urls = null
     where status in ('rejected')
       and reviewed_at < now() - interval '90 days'
       and (id_doc_front_url is not null or id_doc_back_url is not null or cert_urls is not null)
    returning 1
  ) select count(*) into v_count from purged;
  return v_count;
end;
$$ language plpgsql security definer;


-- ---------------------------------------------------------------------
-- 0005_daily_ritual_center.sql
-- ---------------------------------------------------------------------
-- =====================================================================
-- Daily ritual center: LINE-linked daily readings, daily draws, AR assets
-- =====================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'daily_draw_tool') then
    create type daily_draw_tool as enum ('tarot', 'runes');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'ar_asset_kind') then
    create type ar_asset_kind as enum ('plate', 'card', 'stone', 'bodygraph');
  end if;
end $$;

do $$
begin
  if exists (select 1 from pg_type where typname = 'ar_asset_kind')
     and not exists (
       select 1
         from pg_enum e
         join pg_type t on t.oid = e.enumtypid
        where t.typname = 'ar_asset_kind'
          and e.enumlabel = 'bodygraph'
     ) then
    alter type ar_asset_kind add value 'bodygraph';
  end if;
end $$;

create table if not exists public.daily_readings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reading_date date not null,
  locale text not null default 'zh-TW',
  source_tools chart_tool[] not null default array[]::chart_tool[],
  signals jsonb not null default '{}'::jsonb,
  summary text not null,
  sections jsonb not null default '[]'::jsonb,
  ritual_prompt text,
  created_at timestamptz not null default now(),
  unique (user_id, reading_date, locale)
);

create table if not exists public.daily_draws (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  draw_date date not null,
  tool daily_draw_tool not null,
  seed text not null,
  question text not null default '今日指引',
  result_data jsonb not null,
  render_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, draw_date, tool)
);

create table if not exists public.ar_assets (
  id uuid primary key default uuid_generate_v4(),
  tool chart_tool not null,
  asset_kind ar_asset_kind not null,
  title text not null,
  glb_url text,
  usdz_url text,
  poster_url text,
  palette text[] not null default array[]::text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tool, asset_kind, title)
);

create table if not exists public.line_user_links (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  line_user_id text not null unique,
  display_name text,
  picture_url text,
  push_enabled boolean not null default true,
  daily_push_hour int not null default 8 check (daily_push_hour between 0 and 23),
  last_pushed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_daily_readings_user_date on public.daily_readings(user_id, reading_date desc);
create index if not exists idx_daily_draws_user_date on public.daily_draws(user_id, draw_date desc);
create index if not exists idx_ar_assets_tool_kind on public.ar_assets(tool, asset_kind) where is_active;
create index if not exists idx_line_user_links_push on public.line_user_links(push_enabled, daily_push_hour);

alter table public.daily_readings enable row level security;
alter table public.daily_draws enable row level security;
alter table public.ar_assets enable row level security;
alter table public.line_user_links enable row level security;

create policy "daily_readings_self_select" on public.daily_readings
  for select using (auth.uid() = user_id);
create policy "daily_readings_self_insert" on public.daily_readings
  for insert with check (auth.uid() = user_id);
create policy "daily_readings_self_update" on public.daily_readings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_readings_admin_all" on public.daily_readings
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "daily_draws_self_select" on public.daily_draws
  for select using (auth.uid() = user_id);
create policy "daily_draws_self_insert" on public.daily_draws
  for insert with check (auth.uid() = user_id);
create policy "daily_draws_admin_all" on public.daily_draws
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "ar_assets_public_select_active" on public.ar_assets
  for select using (is_active);
create policy "ar_assets_admin_all" on public.ar_assets
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "line_links_self_select" on public.line_user_links
  for select using (auth.uid() = user_id);
create policy "line_links_self_insert" on public.line_user_links
  for insert with check (auth.uid() = user_id);
create policy "line_links_self_update" on public.line_user_links
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "line_links_admin_all" on public.line_user_links
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create trigger trg_line_user_links_updated
before update on public.line_user_links
for each row execute function public.tg_set_updated_at();

insert into public.ar_assets (tool, asset_kind, title, glb_url, usdz_url, palette)
values
  ('ziwei', 'plate', 'Bronze Zi Wei Plate', '/ar/astral-plate.glb', '/ar/astral-plate.usdz', array['#0B1020', '#C9A227', '#8B1E2D']),
  ('astro', 'plate', 'Lapis Zodiac Plate', '/ar/astral-plate.glb', '/ar/astral-plate.usdz', array['#07111F', '#214A7A', '#D6B85A']),
  ('tarot', 'card', 'Gilded Daily Tarot Card', '/ar/tarot-card.glb', '/ar/tarot-card.usdz', array['#16100B', '#B78628', '#F2E3B6']),
  ('runes', 'stone', 'Obsidian Rune Stone', '/ar/rune-stone.glb', '/ar/rune-stone.usdz', array['#0E1116', '#A68A64', '#C9A227']),
  ('bazi', 'plate', 'Four Pillar Bronze Tablet', '/ar/astral-plate.glb', '/ar/astral-plate.usdz', array['#120D08', '#B87333', '#E8C547']),
  ('humandesign', 'bodygraph', 'Human Design BodyGraph Relief', '/ar/human-design-bodygraph.glb', '/ar/human-design-bodygraph.usdz', array['#07111F', '#C9A227', '#E8C547'])
on conflict (tool, asset_kind, title) do nothing;


-- ---------------------------------------------------------------------
-- 0006_match_sessions.sql
-- ---------------------------------------------------------------------
-- 0006_match_sessions.sql
-- 手機優先命理媒合紀錄：保存使用者的媒合答案、排行榜與最後選擇的老師。

create table if not exists public.match_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,
  ranked_results jsonb not null,
  selected_teacher_id uuid references public.teachers(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_match_sessions_user_created
  on public.match_sessions(user_id, created_at desc);

alter table public.match_sessions enable row level security;

drop policy if exists "match_sessions_self_select" on public.match_sessions;
create policy "match_sessions_self_select" on public.match_sessions
  for select using (user_id = auth.uid());

drop policy if exists "match_sessions_self_insert" on public.match_sessions;
create policy "match_sessions_self_insert" on public.match_sessions
  for insert with check (user_id = auth.uid());

drop policy if exists "match_sessions_self_update" on public.match_sessions;
create policy "match_sessions_self_update" on public.match_sessions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "match_sessions_admin_select" on public.match_sessions;
create policy "match_sessions_admin_select" on public.match_sessions
  for select using (public.is_admin(auth.uid()));


-- ---------------------------------------------------------------------
-- 0007_auth_signup_mirror.sql
-- ---------------------------------------------------------------------
-- =====================================================================
-- 0007 auth signup mirror
-- =====================================================================
-- Supabase Auth may require email confirmation. In that mode signUp()
-- creates auth.users but does not return a session, so browser-side writes
-- to profiles/consent_log are blocked by RLS. Mirror safe signup metadata
-- from auth.users into public tables in a security definer trigger.

create or replace function public.handle_new_auth_user()
returns trigger as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_consent_version text := nullif(v_meta->>'consent_version', '');
  v_privacy_at timestamptz := coalesce(nullif(v_meta->>'privacy_consent_at', '')::timestamptz, now());
  v_tos_at timestamptz := coalesce(nullif(v_meta->>'tos_consent_at', '')::timestamptz, now());
begin
  insert into public.profiles (
    id,
    display_name,
    birth_date,
    birth_time,
    birth_location,
    birth_lat,
    birth_lon,
    birth_timezone,
    gender,
    privacy_consent_at,
    tos_consent_at,
    privacy_consent_version,
    marketing_opt_in
  ) values (
    new.id,
    coalesce(nullif(v_meta->>'display_name', ''), new.email),
    nullif(v_meta->>'birth_date', '')::date,
    nullif(v_meta->>'birth_time', '')::time,
    nullif(v_meta->>'birth_location', ''),
    nullif(v_meta->>'birth_lat', '')::numeric,
    nullif(v_meta->>'birth_lon', '')::numeric,
    coalesce(nullif(v_meta->>'birth_timezone', ''), 'Asia/Taipei'),
    case lower(coalesce(nullif(v_meta->>'gender', ''), ''))
      when 'female' then '女'
      when 'male' then '男'
      when 'other' then '其他'
      when 'not_specified' then '未填'
      when '女' then '女'
      when '男' then '男'
      when '其他' then '其他'
      else '未填'
    end,
    case when v_consent_version is not null then v_privacy_at else null end,
    case when v_consent_version is not null then v_tos_at else null end,
    v_consent_version,
    coalesce(nullif(v_meta->>'marketing_opt_in', '')::boolean, false)
  )
  on conflict (id) do update
     set display_name = excluded.display_name,
         birth_date = excluded.birth_date,
         birth_time = excluded.birth_time,
         birth_location = excluded.birth_location,
         birth_lat = excluded.birth_lat,
         birth_lon = excluded.birth_lon,
         birth_timezone = excluded.birth_timezone,
         gender = excluded.gender,
         privacy_consent_at = coalesce(excluded.privacy_consent_at, public.profiles.privacy_consent_at),
         tos_consent_at = coalesce(excluded.tos_consent_at, public.profiles.tos_consent_at),
         privacy_consent_version = coalesce(excluded.privacy_consent_version, public.profiles.privacy_consent_version),
         marketing_opt_in = excluded.marketing_opt_in;

  if v_consent_version is not null then
    insert into public.consent_log (user_id, consent_type, consent_version, consented_at)
    select new.id, 'privacy', v_consent_version, v_privacy_at
    where not exists (
      select 1 from public.consent_log
       where user_id = new.id and consent_type = 'privacy' and consent_version = v_consent_version
    );

    insert into public.consent_log (user_id, consent_type, consent_version, consented_at)
    select new.id, 'tos', v_consent_version, v_tos_at
    where not exists (
      select 1 from public.consent_log
       where user_id = new.id and consent_type = 'tos' and consent_version = v_consent_version
    );
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public, auth;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

