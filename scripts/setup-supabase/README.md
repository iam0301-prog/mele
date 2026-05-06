# Supabase 快速設定包

這個資料夾是給「不想一個一個找 SQL 檔」的人用的。正式做法請先看 `docs/SUPABASE_SETUP_GUIDE.md`。

## 檔案用途

| 檔案 | 用途 |
| --- | --- |
| `all_migrations.sql` | 把 12 個 migrations 合成一份，適合貼到 Supabase SQL Editor |
| `setup_admin.sql` | 建立第一個 super admin，使用前要把 email 改成你的 |
| `setup_storage_buckets.sql` | 建立 Storage policies |
| `RUN_THIS.bat` | Windows CLI 輔助流程，會提示你輸入 Supabase project ref |

## 最白話流程

1. 打開 Supabase Dashboard。
2. 建立或選擇你的 MELE project。
3. 到 SQL Editor。
4. 打開 `all_migrations.sql`，全選、複製、貼到 SQL Editor，按 Run。
5. 到 Table Editor，確認出現 `profiles`、`teachers`、`bookings`、`daily_readings` 等資料表。
6. 到 Authentication -> Users，新增你的管理員帳號。
7. 打開 `setup_admin.sql`，把 `YOUR_EMAIL_HERE` 改成你的 email，貼到 SQL Editor 執行。
8. 到 Storage，建立 `avatars`、`teacher-docs`、`teacher-portfolio` 三個 bucket。
9. 打開 `setup_storage_buckets.sql`，貼到 SQL Editor 執行。
10. 到 Authentication -> URL Configuration，設定 Site URL 與 Redirect URLs。
11. 回到本機跑 `npm run ops:check-auth`，再用真實信箱測註冊驗證信、重新寄送驗證信與忘記密碼信。

## 用 CLI 的流程

```powershell
cd D:\mele
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push --dry-run
npx supabase db push
```

Edge Functions：

```powershell
npx supabase functions deploy ecpay-checkout
npx supabase functions deploy ecpay-webhook --no-verify-jwt
npx supabase functions deploy line-daily-push
```

Auth 診斷：

```powershell
npm run ops:check-auth
```

如果使用者沒有收到驗證信，照 `docs/SUPABASE_AUTH_EMAIL_RUNBOOK.md` 檢查 Authentication -> Users、Logs、SMTP 與 Redirect URLs。

## 安全提醒

1. `service_role` key 不可以放進 `apps/web/.env.local`。
2. `teacher-docs` bucket 必須是 private。
3. 正式上線前要用 ECPay sandbox 完成一次付款。
4. 正式上線前要確認 `/admin/launch` 沒有 P0 紅燈。
