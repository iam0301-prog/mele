-- =====================================================================
-- KYC 文件 90 天自動清除 — pg_cron 排程
-- =====================================================================
-- 日期：2026-05-04
-- 目的：法遵 / 個資法 — 老師申請被 reject 且 reviewed_at 超過 90 天時，
--      自動把 id_doc_front_url / id_doc_back_url / cert_urls 清空。
-- 依賴：0004_p0_fixes.sql 已建立 public.purge_old_kyc_docs()
-- 注意：pg_cron 在 Supabase Cloud 可用，自架請先 CREATE EXTENSION pg_cron。
--      若環境無 pg_cron 也不會中斷其他 migration，IF EXISTS 守住。

create extension if not exists pg_cron;

-- 紀錄每次清除的稽核表（供管理員查看）
create table if not exists public.kyc_purge_log (
  id uuid primary key default gen_random_uuid(),
  ran_at timestamptz not null default now(),
  purged_count int not null,
  notes text
);

alter table public.kyc_purge_log enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'kyc_purge_log' and policyname = 'kyc_purge_log_admin_select'
  ) then
    create policy "kyc_purge_log_admin_select"
      on public.kyc_purge_log for select
      using (public.is_admin(auth.uid()));
  end if;
end $$;

-- 包一層 wrapper：執行 purge + 寫稽核
create or replace function public.run_kyc_purge_job() returns int as $$
declare
  v_count int;
begin
  v_count := public.purge_old_kyc_docs();
  insert into public.kyc_purge_log (purged_count, notes)
  values (v_count, 'pg_cron daily 03:15 UTC');
  return v_count;
end;
$$ language plpgsql security definer;

-- 排程：每日 03:15 UTC（台灣 11:15）執行一次
-- 若已存在同名 job 則先 unschedule（避免重複建立）
do $$
begin
  if exists (select 1 from cron.job where jobname = 'kyc_purge_daily') then
    perform cron.unschedule('kyc_purge_daily');
  end if;
  perform cron.schedule(
    'kyc_purge_daily',
    '15 3 * * *',
    $job$ select public.run_kyc_purge_job(); $job$
  );
exception
  -- 若該環境無 pg_cron extension（自架未啟用），略過排程但保留函式
  when undefined_table then
    raise notice 'pg_cron not installed; skip scheduling. Run run_kyc_purge_job() manually.';
  when undefined_function then
    raise notice 'pg_cron functions missing; skip scheduling.';
end $$;
