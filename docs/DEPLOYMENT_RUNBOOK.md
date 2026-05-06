# MELE 部署 Runbook

最後更新：2026-05-01

MELE 不是單一 Vercel 專案。它有前端、Python 計算 API、Supabase、Edge Functions、LINE、ECPay。正式上線時要分開部署，才不會把能跑本機的東西誤以為能跑正式環境。

## 正式架構

```text
使用者手機/電腦
  -> Vercel: Next.js 前端
  -> Python FastAPI: 命理計算服務，建議 Railway / Render / Fly.io / VM
  -> Supabase: Auth、Database、Storage
  -> Supabase Edge Functions: ECPay webhook、LINE daily push
```

重要提醒：Python FastAPI 不能只丟到 Vercel serverless。這個專案會用到 Python package、Swiss Ephemeris、Node subprocess，請部署到真正可長時間執行的 API host。

## 服務與建議平台

| 區塊 | 建議平台 | 備註 |
| --- | --- | --- |
| Next.js 前端 | Vercel | 最適合 App Router 與 PWA |
| Python FastAPI | Railway / Render / Fly.io / VM | 需要 `/ready`、持久 process、可安裝 Python dependencies |
| Database/Auth/Storage | Supabase | 需跑 11 個 migrations 與 RLS |
| Payment/LINE jobs | Supabase Edge Functions | ECPay webhook 與 LINE push |
| Error monitoring | Sentry | 上線後必要 |
| Analytics | Vercel Analytics 或 PostHog | 看使用漏斗與轉換 |

## 環境變數

前端 Vercel：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_LIFF_ID=
NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=
NEXT_PUBLIC_ENABLE_LINE_LOGIN=
NEXT_PUBLIC_LINE_OAUTH_PROVIDER=custom:line
MELE_API_URL=
```

Python FastAPI：

```env
PYTHONPATH=python_api
MELE_ALLOWED_ORIGINS=https://your-domain.com
MELE_RATE_LIMIT_PER_MINUTE=60
MELE_HEAVY_MAX_CONCURRENCY=4
```

Supabase Edge Functions：

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
MELE_WEB_URL=
ECPAY_MERCHANT_ID=
ECPAY_HASH_KEY=
ECPAY_HASH_IV=
ECPAY_CHECKOUT_URL=
ECPAY_RETURN_URL=
ECPAY_CLIENT_BACK_URL=
LINE_CHANNEL_ACCESS_TOKEN=
```

## 部署順序

1. Supabase 建 project。
2. 跑 migrations。
3. 建 Storage buckets。
4. 建第一個 super admin。
5. 部署 Python FastAPI，確認 `/ready` 回 200。
6. 部署 Supabase Edge Functions。
7. 設 Edge Function secrets。
8. 部署 Vercel 前端，`MELE_API_URL` 指向正式 Python API。
9. 設 Supabase Auth redirect URLs、Email provider 與 SMTP。
10. 做 smoke test。

## Python API 驗收

API host 部署後，確認：

```powershell
curl https://your-api-domain.com/ready
```

應回 200。接著用前端跑一個塔羅、八字、人類圖，確認不是只有首頁可開。

需要注意：

1. `python_api/requirements.txt` 必須包含 `lunar-python`。
2. API host 要能使用 Node 相關依賴，因為紫微、人類圖、占星會透過 subprocess 使用 JS package。
3. 不要開無限制併發，先用 `MELE_HEAVY_MAX_CONCURRENCY=4`。
4. 高流量再加 Redis cache，避免同一組生日重複計算。

## Vercel 前端驗收

部署前先本機跑：

```powershell
npm run release:check
```

Vercel 設定：

1. Root Directory 可維持 repo root，build command 用 `npm run build`。
2. Output 由 Next.js 自動處理。
3. `MELE_API_URL` 必須是正式 API URL，例如 `https://api.your-domain.com`。
4. `NEXT_PUBLIC_SITE_URL` 必須是正式前端 URL。

## Supabase 驗收

至少檢查：

1. Table Editor 看得到 migrations 產生的主要資料表。
2. RLS 是 enabled。
3. 一般使用者不能讀 admin-only 資料。
4. `teacher-docs` 是 private bucket。
5. `npm run ops:check-auth` 通過。
6. Auth Site URL 與 Redirect URLs 包含正式網域與 `/auth/callback`。
7. 真實信箱可以收到註冊驗證信、重新寄送驗證信與忘記密碼信。
8. Google provider 已開啟，Google OAuth 能登入並回到 MELE。
9. LINE custom provider `custom:line` 已設定，LINE Login 能登入並回到 MELE。
10. Auth Logs 能查到寄信成功或失敗原因，SMTP 設定已完成或明確標記為封閉測試暫用。
11. Edge Function logs 沒有 secrets missing。
12. `ecpay-webhook` 用 sandbox 付款測過。
13. `line-daily-push` 能送測試訊息。

## Smoke Test

每次正式部署後跑這張清單：

1. `/` 首頁 200。
2. `/account/login` 可註冊、登入、忘記密碼寄信。
3. `/account/profile` 可儲存生日資料。
4. `/account/privacy` 可送資料權利申請。
5. `/tools/tarot` 可抽牌，結果頁有 AR 區塊。
6. `/tools/runes` 可抽盧恩，結果頁有 AR 區塊。
7. `/tools/bazi` 可排八字，不回 400。
8. `/tools/humandesign` 閘門不互相壓到。
9. `/daily` 每日塔羅與盧恩都有一日一次限制。
10. `/teachers` 老師列表可開。
11. `/account/book` 可建立預約並導到付款頁。
12. `/admin/launch` 可供管理者看上線檢查。

## Rollback

前端：

1. 到 Vercel Deployments。
2. 選上一個穩定版本。
3. Promote to Production。

Python API：

1. Railway / Render / Fly.io 回上一個 release。
2. 確認 `/ready`。
3. Vercel 不必改，只要 API domain 沒變。

Supabase：

1. 避免在 production 直接做破壞性 migration。
2. 每個 destructive migration 都要先寫 rollback SQL。
3. 付款與會員相關 migration 先在 staging project 跑。

## No-Go 條件

出現以下任一項，不建議公開上線：

1. `npm run release:check` 沒過。
2. Python API `/ready` 不是 200。
3. Supabase migrations 沒跑完。
4. Supabase Auth 驗證信或忘記密碼信無法寄達真實信箱。
5. Google 或 LINE 登入若已對外露出按鈕，卻無法完成 OAuth callback。
6. ECPay sandbox 沒跑過完整付款。
7. 隱私權、服務條款、免責聲明缺任一頁。
8. `teacher-docs` 是 public。
9. `SUPABASE_SERVICE_ROLE_KEY` 出現在前端 env 或 repo。
10. 手機 LINE WebView 無法完成登入或基本排盤。
