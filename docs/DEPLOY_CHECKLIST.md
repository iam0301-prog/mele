# MELE 上線檢查 + 風險清單

最後更新：2026-05-06
產品總監交叉印證版（搭配 `DEPLOY_ENV_MATRIX.md`、`DEPLOY_SMOKE_TEST.md`）

> 結論：**程式碼已可上線封閉測試**。在按下 Vercel + Render 部署之前，請先看完下面 9 個風險點，並照「最短部署路線」順序執行。

---

## 1. 9 個必須留意的風險點（依嚴重度排序）

### P0 — 不修會直接壞掉

1. **Render 必須選 Docker，不能選 Python runtime**
   - 為什麼：`python_api/Dockerfile` 同時安裝 Python 與 Node。紫微（iztro）、八字（lunar-javascript）、占星與人類圖渲染都靠 Node subprocess。
   - 若選 Render 的 Native Python，會 `npm install` 失敗或 Node 不存在，工具會在 production 靜默掛掉（health 看起來 OK，但 `/api/v1/calc/ziwei` 會 500）。
   - 做法：Render → New → **Web Service → Docker** → 連 GitHub `iam0301-prog/mele` → Root Directory 填 `python_api`。`render.yaml` 已宣告 `env: docker`、`rootDir: python_api`、`healthCheckPath: /ready`，可直接吃。

2. **Vercel Root Directory 維持 repo root，不要按 Vercel 推薦的 `apps/web`**
   - 為什麼：根目錄 `package.json` 的 `build` 是 `npm --prefix apps/web run build`；`outputFileTracingRoot` 也指 repoRoot。若 Vercel 自動判定為 `apps/web`，monorepo trace 會錯掉、`@/lib/...` 解析有可能受影響。
   - 做法：Vercel Import 時，Framework Preset 選 **Next.js**，但 Root Directory **保留 `./`**。Build Command 用 `npm run build`，Install Command 用 `npm install`，Output Directory 留空（Next 自動）。

3. **`MELE_API_URL` 必須在 Vercel **第一次 deploy 前** 設定**
   - 為什麼：`apps/web/next.config.mjs` 在 production build 沒拿到 `MELE_API_URL` 會直接 `throw`，整個部署中斷。
   - 做法：先在 Render 建好 Python API、拿到正式 URL（例如 `https://mele-api.onrender.com`），再到 Vercel 設環境變數，再 trigger 部署。順序：**Render → 拿 URL → Vercel 設 env → Vercel deploy**。

4. **CORS：`MELE_ALLOWED_ORIGINS` 沒設 = 正式網站打 API 會被擋**
   - 為什麼：`python_api/main.py` 預設 origins 只允許 localhost。沒在 Render 設這個環境變數，瀏覽器一律 CORS error。
   - 做法：Render 環境變數加 `MELE_ALLOWED_ORIGINS=https://你的-vercel-網址`，多網址用逗號分隔，**不要結尾斜線**。

5. **`MELE_RATE_LIMIT_PER_MINUTE` 是錯的環境變數名**
   - 為什麼：`.env.example` 與舊 runbook 都寫 `MELE_RATE_LIMIT_PER_MINUTE=60`，**但程式實際讀的是 `MELE_RATE_LIMIT_MAX_REQUESTS` 與 `MELE_RATE_LIMIT_WINDOW_SECONDS`**（在 `python_api/main.py` 第 93-94 行）。
   - 做法：Render 環境變數設：
     - `MELE_RATE_LIMIT_MAX_REQUESTS=90`
     - `MELE_RATE_LIMIT_WINDOW_SECONDS=60`
   - 如果想之後修 `.env.example` 的拼字錯誤可以另外提一個 commit，但**部署當下用上面兩個正確的名稱就好**。

### P1 — 會讓你以為一切正常但其實不對

6. **NEXT_PUBLIC_* 改值後必須 redeploy，不只是 redeploy 而是重 build**
   - 為什麼：所有 `NEXT_PUBLIC_*` 在 build 時被內嵌進 client bundle。在 Vercel 改了值卻沒按 Redeploy，瀏覽器看到的還是舊值。
   - 做法：每次改完 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SITE_URL` 等，到 Deployments → 點最新 deployment 右上 ... → **Redeploy**（記得**取消 Use existing Build Cache**）。

7. **Supabase migrations 0001-0010 必須先全部跑完，再上線**
   - 為什麼：repo 有 10 個 migrations，包含 `0009_member_points_unlocks.sql`（會員點數核心）、`0010_kyc_auto_purge_cron.sql`（KYC 排程）。少跑任何一個，會員點數扣款 / 老師申請 / 預約 SQL function 會炸。
   - 做法：Supabase Dashboard → SQL Editor → 依序貼 0001 → 0010 → Run。完成後跑 `npm run ops:check-auth` 確認設定。

8. **Supabase Auth Redirect URL 一定要兩條都加**
   - 為什麼：少了正式網址，OAuth/Email 驗證信點下去會跳到 localhost。
   - 做法：Supabase → Authentication → URL Configuration：
     - **Site URL**：`https://你的-vercel-網址`
     - **Redirect URLs**（兩條都要）：
       - `https://你的-vercel-網址/auth/callback`
       - `http://127.0.0.1:3006/auth/callback`（保留本機開發用）

### P2 — 流程上要先想清楚

9. **`NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE=true` = 公開讓任何人跳過金流**
   - 為什麼：這個 flag 在 `apps/web/app/account/book/page.tsx`、`apps/web/app/account/payment/[id]/page.tsx`、`apps/web/app/teacher-portal/page.tsx` 都生效，會讓預約直接跳過 ECPay。
   - 做法：
     - 封閉內測（只發給認識的朋友）→ `true` 沒問題。
     - 一旦你把網址公開（社群、新聞、SEO 收錄），**必須改 `false`**。否則陌生人可以無限免費佔老師時段。
     - 建議在 `/admin/launch` 上線檢查表勾過再公開。

---

## 2. 最短部署路線（90 分鐘可完成）

> 順序很重要，跳順序會卡關。

```
Step 0  Supabase project + 跑 0001-0010 migrations
        ↓
Step 1  Render：Docker 部署 python_api（拿到 API URL）
        ↓
Step 2  Vercel：Import GitHub repo → 設環境變數 → Deploy
        ↓
Step 3  回 Supabase 加 redirect URLs
        ↓
Step 4  回 Render 的 MELE_ALLOWED_ORIGINS 補上 Vercel URL → 重啟
        ↓
Step 5  跑 DEPLOY_SMOKE_TEST.md 的 5 分鐘驗證
```

### Step 0：Supabase（已做過可跳）

1. 建 project（Region 選 ap-northeast-1 / Singapore，看你目標客戶）。
2. SQL Editor 依序貼 `supabase/migrations/0001_initial_schema.sql` 到 `0010_kyc_auto_purge_cron.sql`。
3. 把自己設 super admin：
   ```sql
   insert into public.admins (user_id, role)
   select id, 'super' from auth.users where email = 'iam0301@gmail.com';
   ```
4. 拷貝 Project URL 與 anon public key 備用。

### Step 1：Render（Python API）

1. https://render.com → New + → **Web Service** → Connect `iam0301-prog/mele`。
2. 設定：
   - Name：`mele-api`（或你想要的）
   - Region：Singapore（看 Supabase 在哪選近的）
   - Branch：`main`
   - **Root Directory**：`python_api`
   - **Runtime**：**Docker**（**不要** Python！）
   - Plan：Starter（$7/月，免費 plan 會睡眠導致首次請求等 30 秒）
   - Health Check Path：`/ready`
3. Environment 先填這幾個（先用佔位，等 Vercel 上完再回來補 origins）：
   - `MELE_ALLOWED_ORIGINS=http://localhost:3000`（暫存，Step 4 補正）
   - `MELE_RATE_LIMIT_MAX_REQUESTS=90`
   - `MELE_RATE_LIMIT_WINDOW_SECONDS=60`
   - `MELE_HEAVY_MAX_CONCURRENCY=4`
4. Create Web Service → 等 build 完（第一次約 5-8 分鐘）。
5. 開 `https://mele-api.onrender.com/ready`，要看到 JSON `{"status":"ready", ...}`。

### Step 2：Vercel（Next.js 前端）

1. https://vercel.com → Add New → Project → Import `iam0301-prog/mele`。
2. Framework Preset：**Next.js**（自動偵測）。
3. **Root Directory：`./`（保留）**。Build Command：`npm run build`（沿用根目錄 script）。Install Command：`npm install`。Output Directory：留空。
4. Environment Variables（Production + Preview 都勾）：
   ```
   NEXT_PUBLIC_SUPABASE_URL=<Step 0 拿到的 Project URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<Step 0 拿到的 anon public key>
   NEXT_PUBLIC_SITE_URL=<暫填 https://mele.vercel.app，等 Vercel 給你正式網址後再改>
   MELE_API_URL=<Step 1 拿到的 Render URL，例如 https://mele-api.onrender.com>
   NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE=true
   NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=false
   NEXT_PUBLIC_ENABLE_LINE_LOGIN=false
   NEXT_PUBLIC_LINE_OAUTH_PROVIDER=custom:line
   NEXT_PUBLIC_LIFF_ID=
   ```
5. Deploy。
6. 拿到 `https://mele-xxx.vercel.app`，回 Vercel Settings → Environment Variables 把 `NEXT_PUBLIC_SITE_URL` 改成這個正式網址 → Deployments → Redeploy（**取消 use cache**）。

### Step 3：Supabase Auth Redirect

1. Authentication → URL Configuration：
   - Site URL：`https://你的-vercel-網址`
   - Redirect URLs（Add URL 兩次）：
     - `https://你的-vercel-網址/auth/callback`
     - `http://127.0.0.1:3006/auth/callback`
2. Save。

### Step 4：Render 補 CORS

1. Render → mele-api → Environment → 編輯 `MELE_ALLOWED_ORIGINS`：
   ```
   https://你的-vercel-網址
   ```
   多網址用逗號，不要結尾斜線。
2. Save → 自動 redeploy。
3. 重 curl `/ready`，回應裡 `allowed_origins` 應該已經包含正式網址。

### Step 5：5 分鐘 smoke test

照 `DEPLOY_SMOKE_TEST.md` 跑一遍。沒過任何一條都先暫停公開。

---

## 3. 部署不該做的事

- **不要**把 ECPay 環境變數設到 Vercel。ECPay webhook 是 Supabase Edge Function 在處理，密鑰留在 Supabase secrets。
- **不要**把 `SUPABASE_SERVICE_ROLE_KEY` 設到 Vercel 任何 env（即使是非 NEXT_PUBLIC_ 也不要）。前端只能用 anon key。
- **不要**為了快，在 Render 用 Free plan。它會睡眠，首次請求會等 30 秒，朋友以為塔羅當了。$7/月 Starter 才適合測試。
- **不要**把 `NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE=true` 一直開著就上正式宣傳。

---

## 4. 上線後 24 小時內要監控

| 項目 | 怎麼監控 | 紅線 |
|---|---|---|
| `/ready` 健康檢查 | UptimeRobot / Render Logs | 連續 3 次失敗 |
| Vercel build status | Vercel Dashboard | build 失敗 |
| Supabase Auth 寄信 | Authentication → Logs | bounce / 寄不出 |
| Python API 5xx | Render Logs | 連續多次 |
| 前台塔羅 / 八字 / 紫微實際打 API | 自己 / 朋友每隔幾小時開一次 | 出 500 或 CORS |

---

## 5. 簽核

- [ ] Step 0 Supabase migrations 0001-0010 完成
- [ ] Step 1 Render `/ready` 回 200
- [ ] Step 2 Vercel build 成功
- [ ] Step 3 Supabase Redirect URLs 已加
- [ ] Step 4 Render CORS origins 已包含 Vercel URL
- [ ] Step 5 smoke test 全綠
- [ ] 我已決定要不要保留 `NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE=true`（封閉內測 OK，公開要關）

簽核人：________________  日期：________________
