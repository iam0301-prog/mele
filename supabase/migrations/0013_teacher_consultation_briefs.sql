-- 0013_teacher_consultation_briefs.sql
-- Teacher-only consultation prep drafts.
--
-- Generated chart data remains in chart_records / bookings.chart_data. This
-- table stores the teacher-facing brief and the teacher's editable overrides.

create table if not exists public.teacher_consultation_briefs (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  generated_brief jsonb not null default '{}'::jsonb,
  teacher_overrides jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'ready', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (booking_id)
);

create index if not exists idx_teacher_consultation_briefs_booking
  on public.teacher_consultation_briefs(booking_id);

create index if not exists idx_teacher_consultation_briefs_teacher
  on public.teacher_consultation_briefs(teacher_id, updated_at desc);

alter table public.teacher_consultation_briefs enable row level security;

drop policy if exists "teacher_consultation_briefs_teacher_select" on public.teacher_consultation_briefs;
create policy "teacher_consultation_briefs_teacher_select" on public.teacher_consultation_briefs
  for select using (
    teacher_id in (
      select id from public.teachers where user_id = auth.uid()
    )
  );

drop policy if exists "teacher_consultation_briefs_teacher_insert" on public.teacher_consultation_briefs;
create policy "teacher_consultation_briefs_teacher_insert" on public.teacher_consultation_briefs
  for insert with check (
    teacher_id in (
      select id from public.teachers where user_id = auth.uid()
    )
    and exists (
      select 1
      from public.bookings b
      where b.id = booking_id
        and b.teacher_id = teacher_id
        and b.customer_id = customer_id
    )
  );

drop policy if exists "teacher_consultation_briefs_teacher_update" on public.teacher_consultation_briefs;
create policy "teacher_consultation_briefs_teacher_update" on public.teacher_consultation_briefs
  for update using (
    teacher_id in (
      select id from public.teachers where user_id = auth.uid()
    )
  ) with check (
    teacher_id in (
      select id from public.teachers where user_id = auth.uid()
    )
    and exists (
      select 1
      from public.bookings b
      where b.id = booking_id
        and b.teacher_id = teacher_id
        and b.customer_id = customer_id
    )
  );

drop policy if exists "teacher_consultation_briefs_admin_all" on public.teacher_consultation_briefs;
create policy "teacher_consultation_briefs_admin_all" on public.teacher_consultation_briefs
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

grant select, insert, update on public.teacher_consultation_briefs to authenticated;

drop trigger if exists trg_teacher_consultation_briefs_updated on public.teacher_consultation_briefs;
create trigger trg_teacher_consultation_briefs_updated
before update on public.teacher_consultation_briefs
for each row execute function public.tg_set_updated_at();

create or replace function public.save_teacher_consultation_brief(
  p_booking_id uuid,
  p_generated_brief jsonb,
  p_teacher_overrides jsonb default '{}'::jsonb,
  p_status text default 'draft'
)
returns public.teacher_consultation_briefs
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_is_teacher boolean;
  v_row public.teacher_consultation_briefs;
begin
  if p_status not in ('draft', 'ready', 'archived') then
    raise exception 'invalid brief status';
  end if;

  select *
  into v_booking
  from public.bookings
  where id = p_booking_id;

  if not found then
    raise exception 'booking not found';
  end if;

  select exists (
    select 1
    from public.teachers t
    where t.id = v_booking.teacher_id
      and t.user_id = auth.uid()
  )
  into v_is_teacher;

  if not v_is_teacher and not public.is_admin(auth.uid()) then
    raise exception 'not allowed';
  end if;

  insert into public.teacher_consultation_briefs (
    booking_id,
    teacher_id,
    customer_id,
    generated_brief,
    teacher_overrides,
    status
  )
  values (
    v_booking.id,
    v_booking.teacher_id,
    v_booking.customer_id,
    coalesce(p_generated_brief, '{}'::jsonb),
    coalesce(p_teacher_overrides, '{}'::jsonb),
    p_status
  )
  on conflict (booking_id) do update
    set generated_brief = excluded.generated_brief,
        teacher_overrides = excluded.teacher_overrides,
        status = excluded.status,
        updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.save_teacher_consultation_brief(uuid, jsonb, jsonb, text) to authenticated;
