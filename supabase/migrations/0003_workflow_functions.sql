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
