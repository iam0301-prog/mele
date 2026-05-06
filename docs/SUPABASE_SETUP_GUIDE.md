# Supabase 白話設定指南

最後更新：2026-05-01

這份文件是給第一次設定 Supabase 的人看的。目標是把資料庫、登入、老師審核、預約、付款 webhook、每日 LINE 推播所需的 Supabase 部分一次準備好。

## 你要先知道的三種鑰匙

| 名稱 | 放哪裡 | 可不可以給前端 |
| --- | --- | --- |
| Project URL | Vercel、`apps/web/.env.local`、Edge Functions | 可以 |
| anon public key | Vercel、`apps/web/.env.local` | 可以，這本來就是公開前端 key |
| service_role key | 只放 Supabase Edge Function secrets 或可信任後端 | 不可以，絕對不要放到 `NEXT_PUBLIC_*` |

如果你不確定某個 key 能不能貼給前端，先當作不能。

## 第 1 關：建立或打開 Supabase 專案

1. 打開 Supabase Dashboard。
2. 建立新專案，建議名稱 `mele-prod`。
3. Region 建議選 Tokyo / Northeast Asia，台灣使用者延遲較低。
4. Database password 請用 Supabase 產生的強密碼，另外保存。這不是網站登入密碼。
5. 專案建好後，到 Project Settings -> API。
6. 複製 Project URL 與 anon public key。

## 第 2 關：填前端環境變數

本機測試時，複製：

```powershell
Copy-Item apps\web\.env.local.example apps\web\.env.local
```

然後打開 `apps/web/.env.local`，填入：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
MELE_API_URL=http://127.0.0.1:8015
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_LIFF_ID=
```

正式站放到 Vercel 時，Vercel Project Settings -> Environment Variables 也要填同一組公開值。

## 第 3 關：把資料庫 schema 推上 Supabase

建議用 Supabase CLI，因為比較不容易貼錯。

```powershell
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push --dry-run
npx supabase db push
```

`--dry-run` 是預演，先看會做什麼。沒有奇怪錯誤後，再跑真正的 `supabase db push`。

如果你真的不想用 CLI，也可以到 Supabase Dashboard -> SQL Editor，依序貼上並執行：

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_rls_policies.sql`
3. `supabase/migrations/0003_workflow_functions.sql`
4. `supabase/migrations/0004_p0_fixes.sql`
5. `supabase/migrations/0005_daily_ritual_center.sql`
6. `supabase/migrations/0006_match_sessions.sql`
7. `supabase/migrations/0007_auth_signup_mirror.sql`
8. `supabase/migrations/0008_teacher_website_application.sql`
9. `supabase/migrations/0009_member_points_unlocks.sql`
10. `supabase/migrations/0010_kyc_auto_purge_cron.sql`
11. `supabase/migrations/0011_admin_member_ops.sql`
12. `supabase/migrations/0012_beta_tester_ops.sql`

跑完後到 Table Editor，確認至少看得到 `profiles`、`teachers`、`bookings`、`support_threads`、`daily_readings`、`daily_draws`、`line_user_links`。

## 第 4 關：建立第一個管理員

1. Dashboard -> Authentication -> Users。
2. Add user。
3. 輸入你的 email 和密碼。
4. 勾選 Auto Confirm User，避免第一個管理員卡在收信。
5. 建立後回到 SQL Editor。
6. 把下面的 email 改成你的登入 email 後執行：

```sql
insert into public.admins (user_id, role)
select id, 'super'
from auth.users
where email = 'your-email@example.com'
on conflict (user_id) do update set role = 'super';
```

確認：

```sql
select a.role, u.email
from public.admins a
join auth.users u on u.id = a.user_id;
```

## 第 5 關：建立 Storage buckets

Dashboard -> Storage -> Create bucket，建立：

| Bucket | Public | 用途 |
| --- | --- | --- |
| `avatars` | Yes | 使用者與老師頭像 |
| `teacher-docs` | No | 老師審核文件，必須私有 |
| `teacher-portfolio` | Yes | 老師作品集圖片 |

建立後，可以用 `scripts/setup-supabase/setup_storage_buckets.sql` 補 storage policy。

## 第 6 關：部署 Edge Functions

```powershell
npx supabase functions deploy ecpay-checkout
npx supabase functions deploy ecpay-webhook --no-verify-jwt
npx supabase functions deploy line-daily-push
```

接著設定 secrets。以下是範例，不要把正式 secrets commit 到 git。

```powershell
npx supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
npx supabase secrets set MELE_WEB_URL=https://your-domain.com
npx supabase secrets set ECPAY_MERCHANT_ID=your-merchant-id
npx supabase secrets set ECPAY_HASH_KEY=your-hash-key
npx supabase secrets set ECPAY_HASH_IV=your-hash-iv
npx supabase secrets set ECPAY_CHECKOUT_URL=https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5
npx supabase secrets set ECPAY_RETURN_URL=https://your-project-ref.functions.supabase.co/ecpay-webhook
npx supabase secrets set ECPAY_CLIENT_BACK_URL=https://your-domain.com/account/payment/result
npx supabase secrets set LINE_CHANNEL_ACCESS_TOKEN=your-line-channel-access-token
```

## 第 7 關：Auth 設定

Dashboard -> Authentication -> URL Configuration：

| 項目 | 本機 | 正式站 |
| --- | --- | --- |
| Site URL | `http://localhost:3000` | `https://your-domain.com` |
| Redirect URLs | `http://localhost:3000/**` | `https://your-domain.com/**` |

正式上線前建議打開 Email confirmations。這樣可以降低假帳號、刷評價、惡意預約。

本機先跑公開設定診斷：

```powershell
npm run ops:check-auth
```

這會確認遠端 Supabase project 的 signup 與 Email provider 是否開啟，並列出目前專案預期的 `/auth/callback`。它不能讀取 SMTP 與寄信 log，所以使用者沒有收到驗證信時，請照 [Supabase Auth Email Runbook](SUPABASE_AUTH_EMAIL_RUNBOOK.md) 檢查 Dashboard -> Authentication -> Logs、Users、SMTP 與 Redirect URLs。

公開公測前必須用真實信箱驗收：

1. 新註冊收到 confirmation email。
2. 登入頁「重新寄送驗證信」可以寄出。
3. 忘記密碼信可以寄出。
4. 三種 email link 都會回到 `/auth/callback` 並導向正確會員頁。

Google 與 LINE 登入請接著照 [Google and LINE Login Runbook](OAUTH_LOGIN_RUNBOOK.md) 設定。前端已使用 Supabase OAuth callback；Google 需要 Supabase Auth Providers 開啟 Google，LINE 使用 custom OAuth provider，預設名稱 `custom:line`。

## 第 8 關：驗收

本機先跑：

```powershell
npm run ops:check-auth
npm run test:deployment
npm run test:sql
npm run type-check
npm test
npm run build
```

正式站上線前，至少手動確認：

1. 可以註冊、登入、登出。
2. `/account/privacy` 可以送出資料權利申請。
3. 一個工具可以成功排盤。
4. `/daily` 可以抽每日塔羅與盧恩。
5. ECPay sandbox 可以建立付款頁，付款後 webhook 更新 booking。
6. LINE LIFF 可以登入，`line_user_links` 有資料。
7. `/admin/launch` 沒有阻擋上線的 P0 紅燈。

## 常見錯誤

| 狀況 | 通常原因 | 解法 |
| --- | --- | --- |
| Invalid API key | anon key 貼錯，或 URL/key 不同專案 | 回 Dashboard -> Project Settings -> API 重新複製 |
| 登入後看不到 admin | `public.admins` 沒有你的 user id | 重跑第 4 關 SQL |
| Payment webhook 沒反應 | Edge Function 沒部署或 ECPay return URL 錯 | 檢查 function logs 與 `ECPAY_RETURN_URL` |
| LINE 推播失敗 | token 沒設、使用者沒綁 LINE、push_enabled=false | 檢查 secrets 與 `line_user_links` |
| RLS permission denied | policy 未推上或使用錯角色測試 | 重跑 migrations，並用一般帳號測一次 |
| 收不到註冊驗證信 | Redirect URLs 未允許、SMTP 未設定、寄信 rate limit、信箱 bounce 或使用者已 confirmed | 跑 `npm run ops:check-auth`，再看 Auth Logs、Users 與 SMTP；詳見 `docs/SUPABASE_AUTH_EMAIL_RUNBOOK.md` |
