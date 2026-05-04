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
