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
