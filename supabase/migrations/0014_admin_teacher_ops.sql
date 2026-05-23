-- =====================================================================
-- Admin teacher operations: profile maintenance and status management
-- =====================================================================

create or replace function public.admin_update_teacher_status(
  p_teacher_id uuid,
  p_status public.teacher_status,
  p_reason text default null
)
returns public.teachers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_old_status public.teacher_status;
  v_teacher public.teachers;
  v_reason text := nullif(trim(coalesce(p_reason, '')), '');
begin
  if v_admin_id is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_admin(v_admin_id) then
    raise exception 'forbidden: not admin';
  end if;

  if p_teacher_id is null then
    raise exception 'teacher_required';
  end if;

  if p_status not in ('active', 'paused', 'suspended') then
    raise exception 'invalid_teacher_status';
  end if;

  select status
    into v_old_status
    from public.teachers
   where id = p_teacher_id;

  if not found then
    raise exception 'teacher_not_found';
  end if;

  if p_status = 'suspended' and v_reason is null then
    raise exception 'reason_required';
  end if;

  update public.teachers
     set status = p_status,
         paused_at = case when p_status = 'paused' then now() else null end,
         suspended_at = case when p_status = 'suspended' then now() else null end,
         suspended_reason = case when p_status = 'suspended' then v_reason else null end,
         updated_at = now()
   where id = p_teacher_id
   returning * into v_teacher;

  insert into public.teacher_review_log (teacher_id, reviewer_id, action, old_status, new_status, notes)
  values (
    p_teacher_id,
    v_admin_id,
    case
      when p_status = 'active' then 'activate_teacher_status'
      when p_status = 'paused' then 'pause_teacher'
      else 'suspend_teacher'
    end,
    v_old_status,
    p_status,
    v_reason
  );

  return v_teacher;
end;
$$;

create or replace function public.admin_update_teacher_profile(
  p_teacher_id uuid,
  p_display_name text,
  p_title text default null,
  p_intro_short text default null,
  p_intro_long text default null,
  p_quote text default null,
  p_specialties text[] default '{}'::text[],
  p_consultation_style text default null,
  p_line_url text default null,
  p_instagram text default null,
  p_facebook text default null,
  p_threads text default null,
  p_youtube text default null,
  p_website text default null,
  p_commission_rate numeric default null,
  p_admin_script text default null
)
returns public.teachers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_teacher public.teachers;
  v_display_name text := nullif(trim(coalesce(p_display_name, '')), '');
  v_specialties text[] := coalesce(p_specialties, '{}'::text[]);
begin
  if v_admin_id is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_admin(v_admin_id) then
    raise exception 'forbidden: not admin';
  end if;

  if p_teacher_id is null then
    raise exception 'teacher_required';
  end if;

  if v_display_name is null then
    raise exception 'display_name_required';
  end if;

  if cardinality(v_specialties) = 0 then
    raise exception 'specialties_required';
  end if;

  if p_commission_rate is not null and (p_commission_rate < 0 or p_commission_rate > 0.5) then
    raise exception 'invalid_commission_rate';
  end if;

  update public.teachers
     set display_name = v_display_name,
         title = nullif(trim(coalesce(p_title, '')), ''),
         intro_short = nullif(trim(coalesce(p_intro_short, '')), ''),
         intro_long = nullif(trim(coalesce(p_intro_long, '')), ''),
         quote = nullif(trim(coalesce(p_quote, '')), ''),
         specialties = v_specialties,
         consultation_style = nullif(trim(coalesce(p_consultation_style, '')), ''),
         line_url = nullif(trim(coalesce(p_line_url, '')), ''),
         instagram = nullif(trim(coalesce(p_instagram, '')), ''),
         facebook = nullif(trim(coalesce(p_facebook, '')), ''),
         threads = nullif(trim(coalesce(p_threads, '')), ''),
         youtube = nullif(trim(coalesce(p_youtube, '')), ''),
         website = nullif(trim(coalesce(p_website, '')), ''),
         commission_rate = coalesce(p_commission_rate, commission_rate),
         admin_script = nullif(trim(coalesce(p_admin_script, '')), ''),
         updated_at = now()
   where id = p_teacher_id
   returning * into v_teacher;

  if not found then
    raise exception 'teacher_not_found';
  end if;

  insert into public.teacher_review_log (teacher_id, reviewer_id, action, old_status, new_status, notes)
  values (p_teacher_id, v_admin_id, 'update_teacher_profile', v_teacher.status, v_teacher.status, 'profile updated by admin');

  return v_teacher;
end;
$$;

grant execute on function public.admin_update_teacher_status(uuid, public.teacher_status, text) to authenticated;
grant execute on function public.admin_update_teacher_profile(uuid, text, text, text, text, text, text[], text, text, text, text, text, text, text, numeric, text) to authenticated;
