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
