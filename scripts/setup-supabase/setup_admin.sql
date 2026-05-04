-- ============================================================
-- 設定第一個 Super Admin
-- ============================================================
-- 使用方式:
-- 1. 先去 Supabase Dashboard → Authentication → Users
--    用「Add user → Create new user」建一個帳號(勾 Auto Confirm User)
-- 2. 把下面的 'YOUR_EMAIL_HERE' 換成你剛建的 email
-- 3. 貼到 SQL Editor 執行

insert into public.admins (user_id, role)
select id, 'super' from auth.users where email = 'YOUR_EMAIL_HERE'
on conflict (user_id) do update set role = excluded.role;

-- 驗證:應該看到一筆 role=super 的紀錄
select a.role, u.email, a.created_at
from public.admins a
join auth.users u on u.id = a.user_id;
