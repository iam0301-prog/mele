-- =====================================================================
-- Source: 0001_initial_schema.sql
-- =====================================================================
-- =====================================================================
-- ?賜?慦?銝剖? ????鞈?摨?Schema
-- =====================================================================
-- ?交?嚗?026-04-27
-- 撠?嚗upabase (PostgreSQL 15+)
-- ? UUID + Row Level Security

-- ---------- Extensions ----------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================================
-- 1. profiles ??摰Ｘ鞈?嚗辣隡?auth.users嚗?-- =====================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  line_user_id text unique,                -- LINE login ??  birth_date date,
  birth_time time,                          -- ?箇???嚗?唳?嚗?  birth_location text,                      -- ???啣?
  birth_lat numeric(8,5),                   -- 蝺臬漲
  birth_lon numeric(8,5),                   -- 蝬漲
  birth_timezone text,                      -- e.g. 'Asia/Taipei'
  gender text check (gender in ('??,'憟?,'?嗡?','?芸‵')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_line_user_id on public.profiles(line_user_id);

-- =====================================================================
-- 2. teacher_applications ???葦?唾?銵剁?撖拇瘚??亙嚗?-- =====================================================================
create type teacher_status as enum (
  'pending',      -- 撌脤?撖?  'reviewing',    -- 撖拇銝?  'revision',     -- ?鋆辣
  'rejected',     -- ??
  'interview',    -- 閰西?銝?  'contracted',   -- 撌脩偷蝝?  'active',       -- 銝銝?  'paused',       -- ?怠??交?嚗葦銝餃?嚗?  'suspended'     -- ??嚗恣?撘瑕嚗?);

create table public.teacher_applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status teacher_status not null default 'pending',

  -- ?箸鞈?
  legal_name text not null,                 -- ?祕憪?
  display_name text not null,               -- 撠?憿舐內?迂
  birth_date date,
  email text not null,
  phone text not null,
  address text,

  -- 撠平鞈?
  specialties text[] not null,              -- 撠?? (e.g. ['?怠?','蝝怠凝','憛?'])
  years_of_experience int,
  intro_short text not null,                -- 30 摮?芯?
  intro_long text,                          -- ?瑞?隞晶
  quote text,                               -- 銝?亥店?潸?

  -- 銝瑼?嚗upabase Storage URLs嚗?  id_doc_front_url text,                    -- 霅辣甇?
  id_doc_back_url text,                     -- 霅辣?
  cert_urls text[],                          -- 霅/蝯平霅?
  portfolio_urls text[],                     -- 雿?/獢?
  intro_video_url text,                     -- ?芯?敶梁?

  -- 蝷曄黎???
  line_url text,
  instagram text,
  facebook text,
  threads text,
  youtube text,
  website text,

  -- 閰西?
  interview_video_url text,
  interview_score_pro int check (interview_score_pro between 1 and 5),
  interview_score_express int check (interview_score_express between 1 and 5),
  interview_score_warmth int check (interview_score_warmth between 1 and 5),
  interview_notes text,

  -- 蝪賜?
  commission_rate numeric(4,3) default 0.200,  -- ?賣?瘥?嚗?閮?20%嚗迤撘?靘誑???箸?嚗?  agreed_terms_at timestamptz,

  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_id uuid references auth.users(id),
  reviewer_notes text,                      -- ?折撖拇閮餉?

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_teacher_apps_status on public.teacher_applications(status);
create index idx_teacher_apps_user on public.teacher_applications(user_id);

-- =====================================================================
-- 3. teachers ???葦銝鞈?嚗tatus active ?? join 憿舐內?典??堆?
-- =====================================================================
create table public.teachers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  application_id uuid references public.teacher_applications(id),
  status teacher_status not null default 'pending',

  -- ?祇?鞈?
  display_name text not null,
  avatar_url text,
  title text,                               -- ?剝?嚗???瘛梁換敺株葦??  intro_short text,
  intro_long text,
  quote text,
  specialties text[] not null,
  consultation_style text,                  -- 隢株岷憸冽

  -- 蝷曄黎
  line_url text,
  instagram text,
  facebook text,
  threads text,
  youtube text,
  website text,

  -- 蝯梯?嚗??蝞?
  rating numeric(3,2) default 0,            -- 撟喳?閰?
  total_reviews int default 0,
  cases_count int default 0,                -- 摰??垣閰Ｘ活??
  commission_rate numeric(4,3) default 0.200,

  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  paused_at timestamptz,
  suspended_at timestamptz,
  suspended_reason text,

  -- 敺撠嚗垣閰Ｚ?穿??芣??葦?芸楛???堆?
  admin_script text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_teachers_status on public.teachers(status);
create index idx_teachers_specialties on public.teachers using gin(specialties);

-- =====================================================================
-- 4. teacher_services ???葦???
-- =====================================================================
create table public.teacher_services (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  name text not null,                       -- 靘換敺桀?方底閫??  description text,
  duration_minutes int not null,            -- 30 / 60 / 90...
  price_ntd int not null,                   -- ?寞嚗?啣馳嚗??箏雿?
  is_active boolean not null default true,
  display_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_services_teacher on public.teacher_services(teacher_id) where is_active;

-- =====================================================================
-- 5. teacher_availability ???葦?舫?蝝?畾?-- =====================================================================
-- ?拍車璅∪?嚗?--   (a) ?勗儐?唳芋撘?day_of_week (0=Sun..6=Sat) 閮剖?瘥勗摰?畾?--   (b) ?孵??交?璅∪?嚗pecific_date 閮剖???畾?畾蛛?閬??勗儐?堆?
create table public.teacher_availability (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  day_of_week int check (day_of_week between 0 and 6),
  specific_date date,
  start_time time not null,
  end_time time not null,
  timezone text not null default 'Asia/Taipei',
  is_blocked boolean not null default false, -- true = 閰脫?畾萄???隡?嚗?  created_at timestamptz not null default now(),
  check ((day_of_week is not null) or (specific_date is not null))
);

create index idx_availability_teacher on public.teacher_availability(teacher_id);

-- =====================================================================
-- 6. bookings ????
-- =====================================================================
create type booking_status as enum (
  'pending',        -- 撌脣遣蝡?隞狡
  'paid',           -- 撌脖?甈整?隢株岷
  'confirmed',      -- ?葦撌脩Ⅱ隤?  'in_progress',    -- 隢株岷?脰?銝?  'completed',      -- 摰?
  'cancelled_customer',  -- 摰Ｘ??
  'cancelled_teacher',   -- ?葦??
  'refunded',       -- ?甈曉???  'no_show'         -- 摰Ｘ?芸撣?);

create table public.bookings (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references auth.users(id),
  teacher_id uuid not null references public.teachers(id),
  service_id uuid not null references public.teacher_services(id),

  scheduled_at timestamptz not null,
  duration_minutes int not null,
  timezone text not null default 'Asia/Taipei',

  status booking_status not null default 'pending',

  -- ??
  amount_ntd int not null,
  platform_fee_ntd int not null,
  teacher_amount_ntd int not null,
  payment_provider text,                    -- 'ecpay' | 'newebpay' | etc
  payment_id text,
  paid_at timestamptz,

  -- 隢株岷????  customer_question text,                   -- 摰Ｘ??
  chart_tool text,                          -- 'bazi' | 'ziwei' | etc - ?芸??撌亙
  chart_data jsonb,                         -- ?蝯?嚗葦???喟???
  -- 隢株岷?脰?
  meeting_url text,                         -- LINE / Zoom / Google Meet
  started_at timestamptz,
  completed_at timestamptz,

  -- ?? / ?甈?  cancelled_at timestamptz,
  cancellation_reason text,
  refunded_at timestamptz,
  refund_amount_ntd int,

  -- 隢株岷敺???隢株岷蝯? 7 憭拙?臬? 1 ??鞎餉蕭??
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
-- 7. reviews ??摰Ｘ閰
-- =====================================================================
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  customer_id uuid not null references auth.users(id),
  teacher_id uuid not null references public.teachers(id),

  rating int not null check (rating between 1 and 5),
  comment text,
  is_anonymous boolean not null default false,  -- ??璅∪?嚗??嫣?銝＊蝷箏恥?塚?
  is_visible boolean not null default true,     -- admin ?舫???嗉?隢?
  created_at timestamptz not null default now()
);

create index idx_reviews_teacher_visible on public.reviews(teacher_id) where is_visible;

-- =====================================================================
-- 8. chart_records ???蝝???祥蝪⊥???
-- =====================================================================
create type chart_tool as enum (
  'numerology', 'maya', 'bazi', 'tarot', 'runes',
  'astro', 'ziwei', 'humandesign'
);

create table public.chart_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,  -- ?芰?乩??迂
  tool chart_tool not null,
  input_data jsonb not null,
  output_data jsonb not null,
  created_at timestamptz not null default now()
);

create index idx_chart_records_user on public.chart_records(user_id) where user_id is not null;
create index idx_chart_records_tool on public.chart_records(tool);

-- =====================================================================
-- 9. teacher_review_log ???葦????渡里?豢隤?-- =====================================================================
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
-- 10. admins ??蝞∠??∴??祟?豢???鈭綽?
-- =====================================================================
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'reviewer',    -- 'super' | 'reviewer' | 'moderator'
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 11. notifications ??蝡?
-- =====================================================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,                       -- 'booking_reminder' | 'booking_confirmed' | 'review_request' | 'teacher_status_change' | etc
  title text not null,
  body text,
  link text,                                -- 暺?敺歲頧?  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_unread on public.notifications(user_id, created_at desc) where read_at is null;

-- =====================================================================
-- updated_at ?芸??湔 trigger
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


-- =====================================================================
-- Source: 0002_rls_policies.sql
-- =====================================================================
-- =====================================================================
-- Row Level Security Policies
-- =====================================================================
-- ??嚗?--   - 摰Ｘ?舐??芸楛?????隞????active ?葦?閬??對?
--   - ?葦?舐??芸楛??????+ ?芸楛鋡恍?蝝?摰Ｘ?箸鞈?
--   - 蝞∠??∪????
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

-- ?芸楛霈撖怨撌?create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_self_insert" on public.profiles
  for insert with check (auth.uid() = id);

-- 蝞∠??∪霈?券
create policy "profiles_admin_select" on public.profiles
  for select using (public.is_admin(auth.uid()));

-- ?葦?航?????撌晞?摰Ｘ profile
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

-- ?祇?霈嚗ctive ????葦?典??create policy "teachers_public_select_active" on public.teachers
  for select using (status = 'active');

-- ?葦?芸楛霈撖?create policy "teachers_self_all" on public.teachers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 蝞∠??∪甈?create policy "teachers_admin_all" on public.teachers
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

-- 摰Ｘ?撌梁?
create policy "bookings_customer_self" on public.bookings
  for select using (auth.uid() = customer_id);

-- ?葦?撌梁?
create policy "bookings_teacher_self" on public.bookings
  for select using (
    teacher_id in (select id from public.teachers where user_id = auth.uid())
  );

-- 摰Ｘ?湔嚗??芸楛??嚗?
-- ?葦?湔嚗??芸楛??

-- 蝞∠???create policy "bookings_admin_all" on public.bookings
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
-- chart_records (?祥?蝝??
-- ============================================================
alter table public.chart_records enable row level security;

-- 撖怠嚗?亦?嗅神?芸楛??餃銋撖恬?user_id = null嚗?create policy "chart_records_insert" on public.chart_records
  for insert with check (auth.uid() = user_id or user_id is null);

-- 霈嚗撌梁?
create policy "chart_records_self_select" on public.chart_records
  for select using (auth.uid() = user_id);

-- ?葦?航?摰Ｘ???斤????撌梁?摰Ｘ嚗?create policy "chart_records_teacher_select" on public.chart_records
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

-- ?葦?航???芸楛??log
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


-- =====================================================================
-- Source: 0003_workflow_functions.sql
-- =====================================================================
-- =====================================================================
-- 璆剖?瘚??賢?
-- =====================================================================

-- ---------- submit_teacher_application ----------
-- ?葦??唾?嚗ending ???
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
  values (v_app_id, 'submit', 'pending', '?唾??');

  return v_app_id;
end;
$$ language plpgsql security definer;

-- ---------- review_teacher_application ----------
-- 蝞∠??∪祟?賂??孵? / ?? / ?鋆辣 / ?脣閰西?
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
  -- 甈?瑼Ｘ
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

  -- ??唾?鈭?  insert into public.notifications (user_id, type, title, body)
  values (
    v_user_id,
    'teacher_status_change',
    case p_action
      when 'approve' then '?? ?葦?唾?撖拇??'
      when 'reject' then '?葦?唾??芷?'
      when 'request_revision' then '隢?隞?
      when 'interview' then '隢??岫雓?
      when 'review' then '撖拇銝?
    end,
    p_notes
  );
end;
$$ language plpgsql security definer;

-- ---------- activate_teacher ----------
-- ?葦甇??銝嚗? contracted ??active嚗???遣蝡?teachers 蝝??create or replace function public.activate_teacher(p_application_id uuid)
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
-- 蝞∠??∪?甈葦
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
-- ?芸??湔?葦閰?嚗rigger on reviews嚗?create or replace function public.tg_update_teacher_rating()
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
-- ?芸?閮? platform_fee ??teacher_amount
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


-- =====================================================================
-- Source: 0004_p0_fixes.sql
-- =====================================================================
-- =====================================================================
-- 0004 ??P0 銝??餅???撘?-- =====================================================================
-- 1) ?????脰風
-- 2) cancel_booking ?芸??甈?-- 3) confirm_payment嚗?瘚?webhook ?剁?
-- 4) 閰?隢?auto trigger
-- 5) cases_count ?甈曉???-- 6) support_threads 摰Ｘ?撌亙
-- 7) bookings.settlement_id 蝯?
-- 8) profiles ?梁? / 璇狡??蝝??-- 9) v_teacher_open_slots view
-- =====================================================================

-- ---------- 1. profiles ?梁???甈? ----------
alter table public.profiles
  add column if not exists privacy_consent_at timestamptz,
  add column if not exists tos_consent_at timestamptz,
  add column if not exists privacy_consent_version text,
  add column if not exists marketing_opt_in boolean not null default false;

-- ---------- 2. bookings 鋆?蝞?雿?----------
alter table public.bookings
  add column if not exists settlement_id uuid,
  add column if not exists privacy_consent_at timestamptz,
  add column if not exists no_refund_consent boolean not null default false,
  add column if not exists dispute_status text check (dispute_status in ('none','open','resolved')) default 'none';

-- ---------- 3. ?????脰風嚗??葦??畾萎??舫?銴? ----------
-- 撌脫?蝡???嚗??怠?瘨??甈?no_show嚗???雿
create unique index if not exists uniq_booking_teacher_slot
  on public.bookings(teacher_id, scheduled_at)
  where status in ('pending','paid','confirmed','in_progress','completed');

-- ---------- 4. settlements 蝯??寞活銵?----------
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

-- ---------- 5. support_threads 摰Ｘ?撌亙 ----------
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
  is_internal boolean not null default false,  -- admin ?折?酉
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
-- 蝯阡?瘚?webhook ?澆嚗ervice_role嚗???booking 敺?pending ??paid
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

  -- ?摰Ｘ
  insert into public.notifications (user_id, type, title, body, link)
  select customer_id, 'booking_paid', '??隞狡??', '?函???撌脩Ⅱ隤??葦撠隢株岷??24 撠??舐鼠?具?,
         '/account/mybookings.html'
    from public.bookings where id = p_booking_id;

  -- ??葦
  insert into public.notifications (user_id, type, title, body, link)
  select t.user_id, 'booking_new', '?? ?圈?蝝歇隞狡', '隢??蝝底?蒂皞?隢株岷??,
         '/teacher-portal/bookings.html'
    from public.bookings b join public.teachers t on t.id = b.teacher_id
   where b.id = p_booking_id;
end;
$$ language plpgsql security definer;

-- ---------- 7. cancel_booking嚗 24h ?甈曇??? ----------
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
    select customer_id, 'booking_paid', '?祥皜祈岫??撌脫?蝡?,
           '?桀?蝬脩?皜祈岫???嗉祥嚗?蝝歇?湔????,
           '/account/mybookings'
      from public.bookings
     where id = v_booking_id;

    insert into public.notifications (user_id, type, title, body, link)
    select t.user_id, 'booking_new', '?啁??祥皜祈岫??',
           '雿輻?歇撱箇?皜祈岫??鞎駁?蝝?隢?葦敺?亦???,
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

  -- ???輻?嚗?  --   ?葦?? / admin ?? ??100% ?甈?  --   摰Ｘ??嚗?  --     ?芯?甈?(pending) ???湔??嚗?甈?  --     >= 24h ???券
  --     < 24h  ??50% ?
  --     撌脤?憪???0% ?
  if v_is_teacher and not v_is_customer and not v_is_admin then
    v_refund_pct := 1.0;
    v_new_status := 'cancelled_teacher';
  elsif v_is_admin and not v_is_customer and not v_is_teacher then
    v_refund_pct := 1.0;
    v_new_status := 'cancelled_teacher';
  else
    -- 摰Ｘ??嚗???航葦嚗??誑摰Ｘ頨思遢??嚗?    v_new_status := 'cancelled_customer';
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

  -- ??
  insert into public.notifications (user_id, type, title, body)
  values
    (v_b.customer_id, 'booking_cancelled',
      case when v_refund > 0 then '??撌脣?瘨??甈?NT$' || v_refund || '嚗? else '??撌脣?瘨? end,
      p_reason),
    ((select user_id from public.teachers where id = v_b.teacher_id), 'booking_cancelled',
      '??撌脣?瘨?, p_reason);

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

  -- ?潸??寥?隢???7 憭拙?鞎餉蕭????
  insert into public.notifications (user_id, type, title, body, link)
  values (v_b.customer_id, 'review_request', '??蝯西葦銝????,
    '隢株岷撌脣??迭餈?銝??對?銝血??7 憭拙? 1 ??鞎餉蕭??,
    '/account/mybookings.html?id=' || p_booking_id);
end;
$$ language plpgsql security definer;

-- ---------- 8b. update_booking_followup嚗蕭?韏?RPC嚗?----------
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

-- ---------- 9. cases_count ?甈曉???----------
create or replace function public.tg_update_cases_count()
returns trigger as $$
begin
  -- ?脣 completed ??+1
  if new.status = 'completed' and (old.status is null or old.status <> 'completed') then
    update public.teachers set cases_count = cases_count + 1 where id = new.teacher_id;
  end if;
  -- 敺?completed ??refunded/cancelled ??-1
  if old.status = 'completed' and new.status in ('refunded','cancelled_customer','cancelled_teacher') then
    update public.teachers set cases_count = greatest(cases_count - 1, 0) where id = new.teacher_id;
  end if;
  return null;
end;
$$ language plpgsql;

-- ---------- 10. v_teacher_open_slots嚗?蝡臬???挾 view嚗?----------
-- ??weekly + specific_date + is_blocked + 撌脰◤?? ?券?文像
-- 蝯行靘?30 憭拍??舫?蝝?30/60 ?? slot
create or replace view public.v_teacher_busy as
  select teacher_id, scheduled_at as start_at,
         scheduled_at + (duration_minutes || ' minutes')::interval as end_at
    from public.bookings
   where status in ('pending','paid','confirmed','in_progress','completed');

-- ---------- 11. helper: ?漱摰Ｘ?撌亙 ----------
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

  -- ????admin嚗陛?????admin嚗?  insert into public.notifications (user_id, type, title, body, link)
  select user_id, 'support_new', '?? ?啣恥?極?殷?' || p_subject, p_body,
         '/admin/index.html?tab=support&id=' || v_id
    from public.admins;

  return v_id;
end;
$$ language plpgsql security definer;

-- ---------- 12. 敺蝯梯? view ----------
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

-- ---------- 13. 靽???璇狡甇瑕嚗?澆?閬?霅? ----------
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

-- ---------- 14. KYC ?辣靽????芸?皜 ----------
-- ?葦??paused/suspended/rejected 頞? 90 憭抬???隞?URL 皜征
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


-- =====================================================================
-- Source: 0005_daily_ritual_center.sql
-- =====================================================================
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
  question text not null default '隞??',
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


-- =====================================================================
-- Source: 0006_match_sessions.sql
-- =====================================================================
-- 0006_match_sessions.sql
-- ???芸??賜?慦?蝝??靽?雿輻??慦?蝑???銵???敺???葦??
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


-- =====================================================================
-- Source: 0007_auth_signup_mirror.sql
-- =====================================================================
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
      when 'female' then '憟?
      when 'male' then '??
      when 'other' then '?嗡?'
      when 'not_specified' then '?芸‵'
      when '憟? then '憟?
      when '?? then '??
      when '?嗡?' then '?嗡?'
      else '?芸‵'
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


-- =====================================================================
-- Source: 0008_teacher_website_application.sql
-- =====================================================================
-- =====================================================================
-- ?葦?唾?嚗?摮犖蝬脩?銝血葆?乩??嗉葦鞈?
-- =====================================================================

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
  p_youtube text,
  p_website text default null
)
returns uuid as $$
declare
  v_app_id uuid;
begin
  insert into public.teacher_applications (
    user_id, legal_name, display_name, email, phone,
    specialties, intro_short, intro_long, quote,
    id_doc_front_url, id_doc_back_url, intro_video_url,
    line_url, instagram, facebook, threads, youtube, website
  ) values (
    auth.uid(), p_legal_name, p_display_name, p_email, p_phone,
    p_specialties, p_intro_short, p_intro_long, p_quote,
    p_id_doc_front_url, p_id_doc_back_url, p_intro_video_url,
    p_line_url, p_instagram, p_facebook, p_threads, p_youtube, p_website
  )
  returning id into v_app_id;

  insert into public.teacher_review_log (application_id, action, new_status, notes)
  values (v_app_id, 'submit', 'pending', '?唾??');

  return v_app_id;
end;
$$ language plpgsql security definer;

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
    specialties, line_url, instagram, facebook, threads, youtube, website,
    commission_rate, approved_at, approved_by
  ) values (
    v_app.user_id, p_application_id, 'active'::teacher_status,
    v_app.display_name, v_app.intro_short, v_app.intro_long, v_app.quote,
    v_app.specialties, v_app.line_url, v_app.instagram, v_app.facebook,
    v_app.threads, v_app.youtube, v_app.website, v_app.commission_rate,
    now(), auth.uid()
  )
  returning id into v_teacher_id;

  update public.teacher_applications set status = 'active' where id = p_application_id;

  insert into public.teacher_review_log (teacher_id, application_id, reviewer_id, action, old_status, new_status)
  values (v_teacher_id, p_application_id, auth.uid(), 'activate', 'contracted', 'active');

  return v_teacher_id;
end;
$$ language plpgsql security definer;


-- =====================================================================
-- Source: 0009_member_points_unlocks.sql
-- =====================================================================
-- =====================================================================
-- Member point economy: daily claims, one daily draw, paid unlocks
-- =====================================================================

create table if not exists public.member_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance int not null default 0 check (balance >= 0),
  lifetime_earned int not null default 0 check (lifetime_earned >= 0),
  lifetime_spent int not null default 0 check (lifetime_spent >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null check (amount > 0),
  direction text not null check (direction in ('credit', 'debit')),
  reason text not null,
  reference_type text,
  reference_id text,
  balance_after int not null check (balance_after >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_point_claims (
  user_id uuid not null references auth.users(id) on delete cascade,
  claim_date date not null,
  amount int not null default 200 check (amount > 0),
  created_at timestamptz not null default now(),
  primary key (user_id, claim_date)
);

create table if not exists public.content_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  unlock_type text not null check (unlock_type in ('deep_reading', 'transit_day', 'transit_month', 'transit_year')),
  tool chart_tool not null,
  scope_key text not null,
  cost_points int not null default 100 check (cost_points > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, unlock_type, tool, scope_key)
);

alter table public.daily_draws
  drop constraint if exists uniq_daily_draws_user_date_choice;

alter table public.daily_draws
  add constraint uniq_daily_draws_user_date_choice unique (user_id, draw_date);

create index if not exists idx_point_transactions_user_created
  on public.point_transactions(user_id, created_at desc);

create index if not exists idx_content_unlocks_user_scope
  on public.content_unlocks(user_id, unlock_type, tool, scope_key);

alter table public.member_wallets enable row level security;
alter table public.point_transactions enable row level security;
alter table public.daily_point_claims enable row level security;
alter table public.content_unlocks enable row level security;

create policy "member_wallets_self_select" on public.member_wallets
  for select using (auth.uid() = user_id);
create policy "member_wallets_admin_all" on public.member_wallets
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "point_transactions_self_select" on public.point_transactions
  for select using (auth.uid() = user_id);
create policy "point_transactions_admin_all" on public.point_transactions
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "daily_point_claims_self_select" on public.daily_point_claims
  for select using (auth.uid() = user_id);
create policy "daily_point_claims_admin_all" on public.daily_point_claims
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "content_unlocks_self_select" on public.content_unlocks
  for select using (auth.uid() = user_id);
create policy "content_unlocks_admin_all" on public.content_unlocks
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create trigger trg_member_wallets_updated
before update on public.member_wallets
for each row execute function public.tg_set_updated_at();

create or replace function public.ensure_member_wallet(p_user_id uuid)
returns public.member_wallets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet public.member_wallets;
begin
  insert into public.member_wallets (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select *
    into v_wallet
    from public.member_wallets
   where user_id = p_user_id;

  return v_wallet;
end;
$$;

create or replace function public.claim_daily_points(
  p_claim_date date default (timezone('Asia/Taipei', now())::date),
  p_daily_amount int default 200
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_inserted_count int := 0;
  v_wallet public.member_wallets;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_daily_amount <= 0 then
    raise exception 'daily_amount_must_be_positive';
  end if;

  perform public.ensure_member_wallet(v_user_id);

  insert into public.daily_point_claims (user_id, claim_date, amount)
  values (v_user_id, p_claim_date, p_daily_amount)
  on conflict (user_id, claim_date) do nothing;

  get diagnostics v_inserted_count = row_count;

  if v_inserted_count > 0 then
    update public.member_wallets
       set balance = balance + p_daily_amount,
           lifetime_earned = lifetime_earned + p_daily_amount
     where user_id = v_user_id
     returning * into v_wallet;

    insert into public.point_transactions (
      user_id, amount, direction, reason, reference_type, reference_id, balance_after, metadata
    ) values (
      v_user_id, p_daily_amount, 'credit', 'daily_claim', 'daily_point_claim', p_claim_date::text,
      v_wallet.balance, jsonb_build_object('claim_date', p_claim_date)
    );
  else
    select *
      into v_wallet
      from public.member_wallets
     where user_id = v_user_id;
  end if;

  return jsonb_build_object(
    'claimed', v_inserted_count > 0,
    'amount', case when v_inserted_count > 0 then p_daily_amount else 0 end,
    'balance', v_wallet.balance,
    'claim_date', p_claim_date
  );
end;
$$;

create or replace function public.unlock_content(
  p_unlock_type text,
  p_tool chart_tool,
  p_scope_key text,
  p_cost int default 100,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet public.member_wallets;
  v_existing public.content_unlocks;
  v_unlock public.content_unlocks;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_cost <= 0 then
    raise exception 'cost_must_be_positive';
  end if;

  if p_unlock_type not in ('deep_reading', 'transit_day', 'transit_month', 'transit_year') then
    raise exception 'invalid_unlock_type';
  end if;

  if nullif(trim(p_scope_key), '') is null then
    raise exception 'scope_key_required';
  end if;

  perform public.ensure_member_wallet(v_user_id);

  select *
    into v_existing
    from public.content_unlocks
   where user_id = v_user_id
     and unlock_type = p_unlock_type
     and tool = p_tool
     and scope_key = p_scope_key;

  if found then
    select *
      into v_wallet
      from public.member_wallets
     where user_id = v_user_id;

    return jsonb_build_object(
      'unlocked', true,
      'already_unlocked', true,
      'balance', v_wallet.balance,
      'unlock_id', v_existing.id
    );
  end if;

  select *
    into v_wallet
    from public.member_wallets
   where user_id = v_user_id
   for update;

  if v_wallet.balance < p_cost then
    raise exception 'insufficient_points';
  end if;

  update public.member_wallets
     set balance = balance - p_cost,
         lifetime_spent = lifetime_spent + p_cost
   where user_id = v_user_id
   returning * into v_wallet;

  insert into public.content_unlocks (
    user_id, unlock_type, tool, scope_key, cost_points, metadata
  ) values (
    v_user_id, p_unlock_type, p_tool, p_scope_key, p_cost, p_metadata
  )
  returning * into v_unlock;

  insert into public.point_transactions (
    user_id, amount, direction, reason, reference_type, reference_id, balance_after, metadata
  ) values (
    v_user_id, p_cost, 'debit', p_unlock_type, 'content_unlock', v_unlock.id::text,
    v_wallet.balance, jsonb_build_object('tool', p_tool, 'scope_key', p_scope_key) || p_metadata
  );

  return jsonb_build_object(
    'unlocked', true,
    'already_unlocked', false,
    'balance', v_wallet.balance,
    'unlock_id', v_unlock.id
  );
end;
$$;

grant execute on function public.claim_daily_points(date, int) to authenticated;
grant execute on function public.unlock_content(text, chart_tool, text, int, jsonb) to authenticated;


-- =====================================================================
-- Source: 0010_kyc_auto_purge_cron.sql
-- =====================================================================
-- =====================================================================
-- KYC ?辣 90 憭抵??????pg_cron ??
-- =====================================================================
-- ?交?嚗?026-05-04
-- ?桃?嚗???/ ??瘜????葦?唾?鋡?reject 銝?reviewed_at 頞? 90 憭拇?嚗?--      ?芸???id_doc_front_url / id_doc_back_url / cert_urls 皜征??-- 靘陷嚗?004_p0_fixes.sql 撌脣遣蝡?public.purge_old_kyc_docs()
-- 瘜冽?嚗g_cron ??Supabase Cloud ?舐嚗?嗉???CREATE EXTENSION pg_cron??--      ?亦憓 pg_cron 銋??葉?瑕隞?migration嚗F EXISTS 摰???
create extension if not exists pg_cron;

-- 蝝??甈⊥??斤?蝔賣銵剁?靘恣??亦?嚗?create table if not exists public.kyc_purge_log (
  id uuid primary key default gen_random_uuid(),
  ran_at timestamptz not null default now(),
  purged_count int not null,
  notes text
);

alter table public.kyc_purge_log enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'kyc_purge_log' and policyname = 'kyc_purge_log_admin_select'
  ) then
    create policy "kyc_purge_log_admin_select"
      on public.kyc_purge_log for select
      using (public.is_admin(auth.uid()));
  end if;
end $$;

-- ??撅?wrapper嚗銵?purge + 撖怎里??create or replace function public.run_kyc_purge_job() returns int as $$
declare
  v_count int;
begin
  v_count := public.purge_old_kyc_docs();
  insert into public.kyc_purge_log (purged_count, notes)
  values (v_count, 'pg_cron daily 03:15 UTC');
  return v_count;
end;
$$ language plpgsql security definer;

-- ??嚗???03:15 UTC嚗??11:15嚗銵?甈?-- ?亙歇摮?? job ?? unschedule嚗??銴遣蝡?
do $$
begin
  if exists (select 1 from cron.job where jobname = 'kyc_purge_daily') then
    perform cron.unschedule('kyc_purge_daily');
  end if;
  perform cron.schedule(
    'kyc_purge_daily',
    '15 3 * * *',
    $job$ select public.run_kyc_purge_job(); $job$
  );
exception
  -- ?亥府?啣???pg_cron extension嚗?嗆?嚗??仿???雿??撘?  when undefined_table then
    raise notice 'pg_cron not installed; skip scheduling. Run run_kyc_purge_job() manually.';
  when undefined_function then
    raise notice 'pg_cron functions missing; skip scheduling.';
end $$;


-- =====================================================================
-- Source: 0011_admin_member_ops.sql
-- =====================================================================
-- =====================================================================
-- Admin member operations: wallet adjustments and profile maintenance
-- =====================================================================

create or replace function public.admin_adjust_member_points(
  p_user_id uuid,
  p_mode text,
  p_amount int,
  p_reason text,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_wallet public.member_wallets;
  v_mode text := lower(trim(coalesce(p_mode, '')));
  v_reason text := trim(coalesce(p_reason, ''));
  v_delta int := 0;
  v_direction text;
  v_transaction_id uuid;
begin
  if v_admin_id is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_admin(v_admin_id) then
    raise exception 'forbidden: not admin';
  end if;

  if p_user_id is null then
    raise exception 'member_required';
  end if;

  if v_mode not in ('credit', 'debit', 'set') then
    raise exception 'invalid_adjustment_mode';
  end if;

  if nullif(v_reason, '') is null then
    raise exception 'reason_required';
  end if;

  if p_amount is null or p_amount < 0 or (v_mode in ('credit', 'debit') and p_amount <= 0) then
    raise exception 'invalid_amount';
  end if;

  perform public.ensure_member_wallet(p_user_id);

  select *
    into v_wallet
    from public.member_wallets
   where user_id = p_user_id
   for update;

  if not found then
    raise exception 'wallet_not_found';
  end if;

  if v_mode = 'credit' then
    v_delta := p_amount;
  elsif v_mode = 'debit' then
    v_delta := -p_amount;
  else
    v_delta := p_amount - v_wallet.balance;
  end if;

  if v_delta = 0 then
    return jsonb_build_object(
      'adjusted', false,
      'mode', v_mode,
      'delta', 0,
      'balance', v_wallet.balance
    );
  end if;

  if v_wallet.balance + v_delta < 0 then
    raise exception 'insufficient_points';
  end if;

  if v_delta > 0 then
    update public.member_wallets
       set balance = balance + v_delta,
           lifetime_earned = lifetime_earned + v_delta
     where user_id = p_user_id
     returning * into v_wallet;

    v_direction := 'credit';
  else
    update public.member_wallets
       set balance = balance + v_delta,
           lifetime_spent = lifetime_spent + abs(v_delta)
     where user_id = p_user_id
     returning * into v_wallet;

    v_direction := 'debit';
  end if;

  insert into public.point_transactions (
    user_id,
    amount,
    direction,
    reason,
    reference_type,
    reference_id,
    balance_after,
    metadata
  ) values (
    p_user_id,
    abs(v_delta),
    v_direction,
    'admin_adjustment:' || v_reason,
    'admin_adjustment',
    v_admin_id::text,
    v_wallet.balance,
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object(
      'admin_user_id', v_admin_id,
      'mode', v_mode,
      'reason', v_reason,
      'delta', v_delta
    )
  )
  returning id into v_transaction_id;

  return jsonb_build_object(
    'adjusted', true,
    'mode', v_mode,
    'direction', v_direction,
    'delta', v_delta,
    'amount', abs(v_delta),
    'balance', v_wallet.balance,
    'transaction_id', v_transaction_id
  );
end;
$$;

create or replace function public.admin_update_member_profile(
  p_user_id uuid,
  p_display_name text default null,
  p_bio text default null,
  p_birth_date date default null,
  p_birth_time time default null,
  p_birth_location text default null,
  p_birth_timezone text default null,
  p_gender text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_profile public.profiles;
  v_gender text := nullif(trim(coalesce(p_gender, '')), '');
begin
  if v_admin_id is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_admin(v_admin_id) then
    raise exception 'forbidden: not admin';
  end if;

  if p_user_id is null then
    raise exception 'member_required';
  end if;

  if v_gender is not null and v_gender not in ('??, '憟?, '?嗡?', '?芸‵') then
    raise exception 'invalid_gender';
  end if;

  update public.profiles
     set display_name = nullif(trim(coalesce(p_display_name, '')), ''),
         bio = nullif(trim(coalesce(p_bio, '')), ''),
         birth_date = p_birth_date,
         birth_time = p_birth_time,
         birth_location = nullif(trim(coalesce(p_birth_location, '')), ''),
         birth_timezone = nullif(trim(coalesce(p_birth_timezone, '')), ''),
         gender = coalesce(v_gender, '?芸‵'),
         updated_at = now()
   where id = p_user_id
   returning * into v_profile;

  if not found then
    raise exception 'profile_not_found';
  end if;

  return v_profile;
end;
$$;

grant execute on function public.admin_adjust_member_points(uuid, text, int, text, jsonb) to authenticated;
grant execute on function public.admin_update_member_profile(uuid, text, text, date, time, text, text, text) to authenticated;


-- =====================================================================
-- Source: 0012_beta_tester_ops.sql
-- =====================================================================
-- =====================================================================
-- Closed beta tester operations: invite tracking and admin notes
-- =====================================================================

create table if not exists public.beta_testers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'invited'
    check (status in ('invited', 'onboarded', 'active', 'paused', 'done', 'blocked')),
  segment text not null default 'general',
  invite_code text not null,
  invite_source text,
  preferred_contact text,
  notes text,
  feedback_summary text,
  invited_at timestamptz not null default now(),
  onboarded_at timestamptz,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_beta_testers_status
  on public.beta_testers(status, updated_at desc);

create index if not exists idx_beta_testers_invite_code
  on public.beta_testers(invite_code);

alter table public.beta_testers enable row level security;

create policy "beta_testers_admin_all" on public.beta_testers
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "beta_testers_self_select" on public.beta_testers
  for select using (auth.uid() = user_id);

create trigger trg_beta_testers_updated
before update on public.beta_testers
for each row execute function public.tg_set_updated_at();

create or replace function public.admin_upsert_beta_tester(
  p_user_id uuid,
  p_status text default 'active',
  p_segment text default 'general',
  p_invite_code text default null,
  p_invite_source text default null,
  p_preferred_contact text default null,
  p_notes text default null,
  p_feedback_summary text default null,
  p_last_contacted_at timestamptz default null
)
returns public.beta_testers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_status text := lower(trim(coalesce(p_status, 'active')));
  v_segment text := coalesce(nullif(trim(coalesce(p_segment, '')), ''), 'general');
  v_invite_code text := nullif(trim(coalesce(p_invite_code, '')), '');
  v_existing public.beta_testers;
  v_result public.beta_testers;
begin
  if v_admin_id is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_admin(v_admin_id) then
    raise exception 'forbidden: not admin';
  end if;

  if p_user_id is null then
    raise exception 'member_required';
  end if;

  if v_status not in ('invited', 'onboarded', 'active', 'paused', 'done', 'blocked') then
    raise exception 'invalid_beta_tester_status';
  end if;

  if not exists(select 1 from auth.users where id = p_user_id) then
    raise exception 'auth_user_not_found';
  end if;

  select *
    into v_existing
    from public.beta_testers
   where user_id = p_user_id;

  v_invite_code := coalesce(
    v_invite_code,
    v_existing.invite_code,
    'manual-' || lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  );

  insert into public.beta_testers (
    user_id,
    status,
    segment,
    invite_code,
    invite_source,
    preferred_contact,
    notes,
    feedback_summary,
    invited_at,
    onboarded_at,
    last_contacted_at
  ) values (
    p_user_id,
    v_status,
    v_segment,
    v_invite_code,
    nullif(trim(coalesce(p_invite_source, '')), ''),
    nullif(trim(coalesce(p_preferred_contact, '')), ''),
    nullif(trim(coalesce(p_notes, '')), ''),
    nullif(trim(coalesce(p_feedback_summary, '')), ''),
    now(),
    case when v_status in ('onboarded', 'active') then now() else null end,
    p_last_contacted_at
  )
  on conflict (user_id) do update
     set status = excluded.status,
         segment = excluded.segment,
         invite_code = excluded.invite_code,
         invite_source = excluded.invite_source,
         preferred_contact = excluded.preferred_contact,
         notes = excluded.notes,
         feedback_summary = excluded.feedback_summary,
         onboarded_at = coalesce(
           public.beta_testers.onboarded_at,
           case when excluded.status in ('onboarded', 'active') then now() else excluded.onboarded_at end
         ),
         last_contacted_at = coalesce(excluded.last_contacted_at, public.beta_testers.last_contacted_at)
  returning * into v_result;

  return v_result;
end;
$$;

create or replace function public.handle_new_beta_tester()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_invite_code text := nullif(trim(coalesce(v_meta->>'beta_invite_code', '')), '');
begin
  if v_invite_code is null then
    return new;
  end if;

  insert into public.beta_testers (
    user_id,
    status,
    segment,
    invite_code,
    invite_source,
    preferred_contact,
    notes,
    invited_at,
    onboarded_at
  ) values (
    new.id,
    'onboarded',
    coalesce(nullif(trim(coalesce(v_meta->>'beta_segment', '')), ''), 'invite'),
    v_invite_code,
    'signup',
    nullif(trim(coalesce(v_meta->>'preferred_contact', '')), ''),
    'signup invite code: ' || v_invite_code,
    now(),
    now()
  )
  on conflict (user_id) do update
     set status = case
           when public.beta_testers.status in ('blocked', 'done') then public.beta_testers.status
           else 'onboarded'
         end,
         segment = excluded.segment,
         invite_code = excluded.invite_code,
         invite_source = excluded.invite_source,
         preferred_contact = coalesce(excluded.preferred_contact, public.beta_testers.preferred_contact),
         onboarded_at = coalesce(public.beta_testers.onboarded_at, now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_beta_tester on auth.users;
create trigger on_auth_user_created_beta_tester
  after insert on auth.users
  for each row execute function public.handle_new_beta_tester();

grant execute on function public.admin_upsert_beta_tester(uuid, text, text, text, text, text, text, text, timestamptz) to authenticated;

