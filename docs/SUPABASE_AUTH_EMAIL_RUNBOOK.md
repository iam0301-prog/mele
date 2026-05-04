# Supabase Auth Email Runbook

最後更新：2026-05-03

這份 runbook 專門處理 MELE 的註冊驗證信、重寄驗證信、忘記密碼信與 OAuth callback。它的目標是讓「使用者沒有收到信」可以被快速定位，而不是在前端、Supabase、信箱之間來回猜。

## 1. MELE 的 Auth 資料流

```text
登入/註冊頁
  -> supabase.auth.signUp(...)
  -> Supabase Auth 建立 auth.users
  -> Supabase 寄出 confirmation email
  -> 使用者點信件連結
  -> /auth/callback?next=...
  -> exchangeCodeForSession()
  -> 導回會員頁或原本要去的頁面
```

重寄驗證信走：

```text
登入頁輸入 email
  -> supabase.auth.resend({ type: 'signup', email })
  -> Supabase 對尚未確認的 signup 重新寄信
```

忘記密碼走：

```text
登入頁輸入 email
  -> supabase.auth.resetPasswordForEmail(email)
  -> /auth/callback?next=/account/profile
```

## 2. 本機可自動檢查的項目

執行：

```powershell
npm run ops:check-auth
```

這會讀取 `apps/web/.env.local`，用 anon public key 呼叫 Supabase 公開 Auth settings，確認：

- `NEXT_PUBLIC_SUPABASE_URL` 與 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 有填。
- 遠端 project 可連線。
- Signup 沒有被關閉。
- Email provider 有開。
- Email confirmation 是否需要驗證。
- 目前 `NEXT_PUBLIC_SITE_URL` 對應的 callback URL。

這個腳本不會讀取 service role，也不會修改雲端設定。

## 3. Dashboard 必查項目

到 Supabase Dashboard -> Authentication -> URL Configuration：

| 項目 | 本機測試 | 正式站 |
| --- | --- | --- |
| Site URL | `http://localhost:3000` | `https://your-domain.com` |
| Redirect URLs | `http://localhost:3000/**` | `https://your-domain.com/**` |

MELE 目前實際使用的 callback 是：

```text
http://localhost:3000/auth/callback
```

正式站則會是：

```text
https://your-domain.com/auth/callback
```

若有自訂 Email Templates，確認連結使用 `{{ .RedirectTo }}` 而不是只使用 `{{ .SiteURL }}`。MELE 在 `signUp`、`resend`、`resetPasswordForEmail` 都會傳 redirect/callback；模板若忽略 `RedirectTo`，信件可能導回錯誤網址。

## 4. 使用者說沒有收到驗證信時

先判斷 UI 狀態：

1. 註冊後是否看到「確認信已寄出」。
2. 登入頁輸入同一個 email 後，按「重新寄送驗證信」是否看到成功 toast。
3. 若 Supabase 回錯誤，直接記錄錯誤訊息。

再到 Dashboard -> Authentication -> Users：

1. 搜尋該 email。
2. 若使用者不存在，代表 signup 沒成功送到 Supabase。
3. 若使用者存在且已 confirmed，請使用者直接登入。
4. 若使用者存在但未 confirmed，按 resend confirmation 或請使用者在網站按「重新寄送驗證信」。

最後到 Authentication -> Logs：

1. 搜尋該 email 或 signup 時間。
2. 檢查是否有 `rate limit`、`email send failed`、`SMTP`、`bounce`、`redirect not allowed`。
3. 若 Supabase 顯示已寄出但使用者沒收到，請檢查垃圾信件、促銷分類、公司信箱 quarantine 或 bounce suppression。

## 5. SMTP 建議

封閉測試可以先用 Supabase 預設寄信，但公開公測前建議改成自有 SMTP，否則容易遇到品牌辨識低、寄送額度與送達率限制。

建議：

- 使用 SendGrid、Mailgun、Postmark、AWS SES 或等級相近的 SMTP。
- From email 使用正式網域，例如 `no-reply@your-domain.com`。
- 設定 SPF、DKIM、DMARC。
- 測試 Gmail、Yahoo、Outlook、公司信箱各一封。
- Auth Logs 保留至少一份成功註冊與忘記密碼的截圖或紀錄。

## 6. No-Go

以下任一項未完成，不建議公開公測：

- `npm run ops:check-auth` 失敗。
- Dashboard Redirect URLs 沒有包含本機與正式站 callback。
- Email provider 未啟用。
- 未能用真實信箱完成註冊驗證。
- 忘記密碼信不能寄出或 callback 失敗。
- Auth Logs 無法查到寄信成功/失敗原因。

## 7. 目前專案狀態

截至 2026-05-03，本機程式碼已具備：

- `signUp` 送出 `emailRedirectTo`。
- `/auth/callback` 交換 session 後導回 `next`。
- 登入頁可重新寄送 signup confirmation email。
- 忘記密碼信走同一個 callback。
- `0007_auth_signup_mirror.sql` 會在 email confirmation 前先鏡射必要 profile/consent metadata，避免未確認帳號沒有基本資料。

仍需人工或雲端權限確認：

- Supabase Dashboard 的 URL Configuration 實際值。
- SMTP 是否已設定。
- 單一使用者 email 是否 bounce、rate limited 或已 confirmed。
