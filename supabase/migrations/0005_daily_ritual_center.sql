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
  question text not null default '今日指引',
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
