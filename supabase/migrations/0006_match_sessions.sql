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
