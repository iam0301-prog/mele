-- =====================================================================
-- 老師申請：保存個人網站並帶入上架老師資料
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
  values (v_app_id, 'submit', 'pending', '申請送出');

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
