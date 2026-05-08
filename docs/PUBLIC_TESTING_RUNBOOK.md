# MELE 公開測試上線 Runbook

最後更新：2026-05-08

這份文件是給「先免費分享給朋友測試」使用。目標不是立刻收費，而是讓外部使用者可以打開正式網址、註冊登入、使用工具、回報體驗。

## 上線架構

```text
使用者
  -> Vercel 前端：Next.js 多語系網站
  -> Render / Railway API：Python FastAPI 計算服務
  -> Supabase：Auth、會員、點數、老師申請、資料庫
  -> Supabase Edge Functions：付款與 LINE 推播，封測可先關閉付款
```

## Vercel 前端設定

Vercel 建議設定：

```text
Framework Preset: Next.js
Root Directory: apps/web
Install Command: npm ci
Build Command: npm run build
Output Directory: 留空，交給 Next.js
Node.js Version: 22
```

前端環境變數：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 anon public key
NEXT_PUBLIC_SITE_URL=https://你的-vercel-網址
MELE_API_URL=https://你的-python-api-網址
NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=false
NEXT_PUBLIC_ENABLE_LINE_LOGIN=false
NEXT_PUBLIC_LINE_OAUTH_PROVIDER=custom:line
NEXT_PUBLIC_LIFF_ID=
NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE=true
```

封測期間建議先把 `NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE=true`，讓老師預約流程不用接 ECPay 就能測試。

## Python API 設定

Render / Railway 使用 `python_api/Dockerfile`。健康檢查路徑：

```text
/ready
```

API 環境變數：

```env
MELE_ALLOWED_ORIGINS=https://你的-vercel-網址
MELE_RATE_LIMIT_MAX_REQUESTS=90
MELE_RATE_LIMIT_WINDOW_SECONDS=60
MELE_HEAVY_MAX_CONCURRENCY=4
MELE_TRUST_PROXY_HEADERS=true
```

API 部署後先開：

```powershell
curl.exe https://你的-python-api-網址/ready
```

看到 `200` 後，再把 `MELE_API_URL` 填回 Vercel。

## Supabase 必填設定

Authentication -> URL Configuration：

```text
Site URL: https://你的-vercel-網址
Redirect URLs:
  https://你的-vercel-網址/auth/callback
  https://你的-vercel-網址/**
  http://127.0.0.1:3006/auth/callback
```

Authentication -> Providers：

```text
Email: Enabled
Confirm email: Enabled
Google: 等 Google Cloud callback 完成後再開
LINE: 等 LINE Developers callback 完成後再開
```

Email SMTP：

```text
寄件信箱不要只用測試 inbox 當寄件者。
寄件網域或 SMTP 未驗證時，Yahoo / Gmail 可能收到空信、延遲或進垃圾信。
每次改 SMTP 或 Email template 都要按 Save。
```

## 部署後 Smoke Test

前端與 API 都部署完成後，在本機執行：

```powershell
npm.cmd run ops:smoke:public -- https://你的-vercel-網址 https://你的-python-api-網址
```

這會檢查：

- 多語系首頁是否 200
- 登入、每日儀式、主要工具、老師申請、老師後台、管理啟動頁是否可開
- `sitemap.xml`、`robots.txt`、`manifest.json`、`favicon.ico` 是否存在
- `/api/calc/numerology` 是否能從前端代理到 Python API
- Python `/ready` 是否允許正式前端網域 CORS

## No-Go

以下任一項沒過，不建議丟給外部測試者：

- `npm run release:check` 失敗
- `npm run ops:smoke:public -- <web> <api>` 失敗
- Supabase confirmation email 收不到，或點開後沒有導回 MELE
- Google / LINE 按鈕開啟但 provider 還沒設定完成
- `MELE_API_URL` 指到 localhost
- `NEXT_PUBLIC_SITE_URL` 還是 localhost
- API `/ready` 不是 200
- 前端出現 `Application error`
- 會員點數、每日抽卡、解鎖內容只靠前端狀態

## 給測試者的公開流程

可以先請測試者依序測：

1. 開首頁，切換語言。
2. 註冊帳號，收驗證信。
3. 登入後領每日 200 點。
4. 使用塔羅、瑪雅曆、生命靈數、人類圖。
5. 嘗試每日儀式：塔羅或盧恩擇一。
6. 申請老師，確認表單能送出。
7. 回報手機版是否看得懂、是否有卡住、是否願意付點數看深入解讀。
