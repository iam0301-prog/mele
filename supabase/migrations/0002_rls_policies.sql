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
