-- ============================================================
-- 建立 Storage Buckets 並設定 RLS policies
-- ============================================================
-- 注意:這個 SQL 只負責建 policies。
-- Buckets 本身建議用 Dashboard → Storage → 「Create a new bucket」UI 建,
-- 因為 Dashboard UI 會幫你正確設定 public/private 屬性。
--
-- 要建的 3 個 bucket:
--   1. avatars            (Public)   - 使用者頭像
--   2. teacher-docs       (Private)  - 老師認證文件
--   3. teacher-portfolio  (Public)   - 老師作品集

-- ============================================================
-- avatars policies
-- ============================================================
-- 任何人都可以「讀」avatars
drop policy if exists "Public read avatars" on storage.objects;
create policy "Public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- 登入使用者只能上傳到「自己的 user id 資料夾」
drop policy if exists "Users upload own avatar" on storage.objects;
create policy "Users upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update own avatar" on storage.objects;
create policy "Users update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete own avatar" on storage.objects;
create policy "Users delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- teacher-portfolio policies
-- ============================================================
drop policy if exists "Public read teacher portfolio" on storage.objects;
create policy "Public read teacher portfolio"
  on storage.objects for select
  using (bucket_id = 'teacher-portfolio');

drop policy if exists "Teachers upload own portfolio" on storage.objects;
create policy "Teachers upload own portfolio"
  on storage.objects for insert
  with check (
    bucket_id = 'teacher-portfolio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Teachers update own portfolio" on storage.objects;
create policy "Teachers update own portfolio"
  on storage.objects for update
  using (
    bucket_id = 'teacher-portfolio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Teachers delete own portfolio" on storage.objects;
create policy "Teachers delete own portfolio"
  on storage.objects for delete
  using (
    bucket_id = 'teacher-portfolio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- teacher-docs policies (Private — 只老師本人和 admin 能看)
-- ============================================================
drop policy if exists "Teachers read own docs" on storage.objects;
create policy "Teachers read own docs"
  on storage.objects for select
  using (
    bucket_id = 'teacher-docs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.admins where user_id = auth.uid()
      )
    )
  );

drop policy if exists "Teachers upload own docs" on storage.objects;
create policy "Teachers upload own docs"
  on storage.objects for insert
  with check (
    bucket_id = 'teacher-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
