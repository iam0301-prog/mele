# MELE 環境變數對照表（Vercel + Render + Supabase）

最後更新：2026-05-06
產品總監版（與 `DEPLOY_CHECKLIST.md` 搭配）

> 這份表把 `.env.example` 與實際程式碼讀的環境變數**逐一對照**，並標示要設到哪個平台、是 PUBLIC 還是 SECRET。
> 直接照欄位設定，不需再回頭翻 README。

---

## 1. Vercel（Next.js 前端）

| 變數 | 範例值 | PUBLIC？ | 必填？ | 用途 |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxxxxxxx.supabase.co` | ✅ | ✅ | Supabase client SDK 連線 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | ✅ | ✅ | Supabase anon role JWT |
| `NEXT_PUBLIC_SITE_URL` | `https://mele.vercel.app` | ✅ | ✅ | OAuth callback / Email 連結基底 |
| `MELE_API_URL` | `https://mele-api.onrender.com` | ❌ | ✅ | server-side proxy 到 Python API（**沒設 production build 會直接 throw**） |
| `NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE` | `true` | ✅ | ✅ | 跳過 ECPay。**封閉內測 true、公開後 false** |
| `NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN` | `false` | ✅ | ✅ | 還沒接 Google OAuth 先 false |
| `NEXT_PUBLIC_ENABLE_LINE_LOGIN` | `false` | ✅ | ✅ | 還沒接 LINE login 先 false |
| `NEXT_PUBLIC_LINE_OAUTH_PROVIDER` | `custom:line` | ✅ | ⚠️ | LINE 登入 provider 名稱，預設 `custom:line` |
| `NEXT_PUBLIC_LIFF_ID` | （空） | ✅ | ⚠️ | LIFF App ID，沒接 LINE 留空即可 |

### 一鍵複製給 Vercel（Bulk import 格式）

> Vercel → Project Settings → Environment Variables → ... → Import .env

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
MELE_API_URL=
NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE=true
NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=false
NEXT_PUBLIC_ENABLE_LINE_LOGIN=false
NEXT_PUBLIC_LINE_OAUTH_PROVIDER=custom:line
NEXT_PUBLIC_LIFF_ID=
```

⚠️ **改完任何 `NEXT_PUBLIC_*`** 都要重新 Deploy（取消 build cache）。

---

## 2. Render（Python FastAPI）

| 變數 | 範例值 | 必填？ | 用途 |
|---|---|---|---|
| `MELE_ALLOWED_ORIGINS` | `https://mele.vercel.app` | ✅ | CORS。多網址逗號分隔，**不要尾端斜線** |
| `MELE_RATE_LIMIT_MAX_REQUESTS` | `90` | ⚠️ | 單一工具每時間窗最大請求數。預設 90 |
| `MELE_RATE_LIMIT_WINDOW_SECONDS` | `60` | ⚠️ | 時間窗（秒）。預設 60 |
| `MELE_HEAVY_MAX_CONCURRENCY` | `4` | ⚠️ | 重型計算（紫微 / 人類圖）併發上限 |
| `MELE_TRUST_PROXY_HEADERS` | `true` | ⚠️ | Render 在 proxy 後面，要設 true 才能正確抓 client IP 做限流 |
| `PYTHONPATH` | `python_api` | 🟢 | Dockerfile 已 `WORKDIR /app`，通常不用設 |
| `PORT` | （Render 自動注入） | 🟢 | Dockerfile 用 `${PORT:-8000}`，**不要自己設**，會與 Render 衝突 |

### ⚠️ 命名陷阱

舊文件寫 `MELE_RATE_LIMIT_PER_MINUTE=60` 是**錯的**，程式不會讀。
正確是上面兩個 `MAX_REQUESTS` + `WINDOW_SECONDS`。

### 一鍵複製給 Render

> Render → Service → Environment → Add Environment Variable

```env
MELE_ALLOWED_ORIGINS=https://你的-vercel-網址
MELE_RATE_LIMIT_MAX_REQUESTS=90
MELE_RATE_LIMIT_WINDOW_SECONDS=60
MELE_HEAVY_MAX_CONCURRENCY=4
MELE_TRUST_PROXY_HEADERS=true
```

---

## 3. Supabase（之後接 Edge Function 才需要）

下面這組**目前不會立刻用到**（你還沒開金流、還沒接 LINE Daily Push），但建議先在 Supabase secrets 預留位置，未來解鎖時不用再到處找。

```bash
# 在本機跑
supabase secrets set \
  SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... \
  MELE_WEB_URL=https://你的-vercel-網址 \
  ECPAY_MERCHANT_ID=2000132 \
  ECPAY_HASH_KEY=... \
  ECPAY_HASH_IV=... \
  ECPAY_CHECKOUT_URL=https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5 \
  ECPAY_RETURN_URL=https://xxxxxxxxxxxxx.functions.supabase.co/ecpay-webhook \
  ECPAY_CLIENT_BACK_URL=https://你的-vercel-網址/account/payment/result \
  LINE_CHANNEL_ACCESS_TOKEN=...
```

⚠️ `SUPABASE_SERVICE_ROLE_KEY` **絕對不能**進 Vercel 任何 env。它能跳過 RLS。

---

## 4. Supabase Dashboard 設定（不是環境變數，但很容易漏）

| 位置 | 要做什麼 |
|---|---|
| Authentication → URL Configuration → Site URL | 改成 `https://你的-vercel-網址` |
| Authentication → URL Configuration → Redirect URLs | 加 `https://你的-vercel-網址/auth/callback` 與 `http://127.0.0.1:3006/auth/callback` |
| Authentication → Providers → Email | Confirm email = enabled |
| Authentication → Email Templates | Confirm signup / Magic Link / Reset Password 三個都要確認連結是 `{{ .SiteURL }}/auth/callback` |
| Storage → Buckets | `teacher-kyc` 設 private（如果還沒建，等 KYC 流程再開） |
| Database → Migrations | `supabase/migrations/0001`–`0010` 全跑完 |

---

## 5. 快速對照表（哪個值放哪裡）

```
┌──────────────────────────────────┬─────────┬─────────┬──────────┐
│ 變數                              │ Vercel  │ Render  │ Supabase │
├──────────────────────────────────┼─────────┼─────────┼──────────┤
│ NEXT_PUBLIC_SUPABASE_URL          │   ✅     │         │          │
│ NEXT_PUBLIC_SUPABASE_ANON_KEY     │   ✅     │         │          │
│ NEXT_PUBLIC_SITE_URL              │   ✅     │         │          │
│ MELE_API_URL                      │   ✅     │         │          │
│ NEXT_PUBLIC_ENABLE_*              │   ✅     │         │          │
│ MELE_ALLOWED_ORIGINS              │         │   ✅     │          │
│ MELE_RATE_LIMIT_MAX_REQUESTS      │         │   ✅     │          │
│ MELE_RATE_LIMIT_WINDOW_SECONDS    │         │   ✅     │          │
│ MELE_HEAVY_MAX_CONCURRENCY        │         │   ✅     │          │
│ MELE_TRUST_PROXY_HEADERS          │         │   ✅     │          │
│ SUPABASE_SERVICE_ROLE_KEY         │  ❌絕對  │         │   ✅     │
│ ECPAY_*                           │         │         │   ✅     │
│ LINE_CHANNEL_ACCESS_TOKEN         │         │         │   ✅     │
└──────────────────────────────────┴─────────┴─────────┴──────────┘
```
