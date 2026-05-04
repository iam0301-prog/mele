# MELE Backend Blueprint

最後更新：2026-05-03

這份文件定義 MELE 後端的完整目標架構。它補足 `ARCHITECTURE.md` 的高層說明，讓工程、營運與未來交接者知道每個後端區塊負責什麼、資料如何流動、上線前怎麼驗收。

## 1. 後端邊界

MELE 後端不是單一服務，而是四個邊界清楚的系統：

| 系統 | 負責 | 不負責 |
| --- | --- | --- |
| Supabase Auth | 註冊、登入、Email 驗證、OAuth、session | 複雜商業流程與 service role 操作 |
| Supabase Postgres | 會員、老師、預約、評價、每日儀式、支援單、稽核 | 重型命理計算 |
| Supabase Edge Functions | 金流 checkout/webhook、LINE daily push、需要 service role 的小型任務 | 長時間 Python/Node subprocess 計算 |
| Python FastAPI | 八個工具的排盤、解釋資料、SVG/HTML render | 會員權限、付款狀態、老師審核 |

核心原則：前端只拿 public anon key；service role 只放在 Edge Functions 或受信任後端。

## 2. Auth 與會員資料

### 註冊

1. 前端呼叫 `supabase.auth.signUp`。
2. Auth metadata 帶入 display name、出生資料、條款同意版本。
3. Supabase Auth 建立 `auth.users`。
4. `0007_auth_signup_mirror.sql` trigger 將 metadata 寫入 `profiles` 與 `consent_log`。
5. 使用者完成 Email 驗證後，`/auth/callback` 交換 session。

### 重寄驗證信

登入頁使用 `supabase.auth.resend({ type: 'signup' })`。這只對已建立、尚未確認的 signup 有效。若信件未到，依 [Supabase Auth Email Runbook](SUPABASE_AUTH_EMAIL_RUNBOOK.md) 檢查。

### Google / LINE OAuth

Google 與 LINE 都導回 `/auth/callback` 交換 session。Google 使用 Supabase 內建 Google provider；LINE 使用 Supabase custom OAuth provider，預設 provider id 是 `custom:line`。設定細節以 [Google and LINE Login Runbook](OAUTH_LOGIN_RUNBOOK.md) 為準。

### 權限模型

- 一般會員只讀寫自己的 `profiles`、`daily_*`、`support_threads`、`bookings`。
- 老師只看與自己 teacher id 關聯的預約、訊息與審核資料。
- 管理員透過 `public.admins` 與 RPC 操作審核、停權、啟用。
- 付款、退款、老師審核狀態不可由前端直接 update 表欄位，必須走 RPC 或 Edge Function。

## 3. 資料庫模組

| 模組 | 主要資料表/RPC | 上線前驗收 |
| --- | --- | --- |
| 會員 | `profiles`, `consent_log`, `support_threads` | RLS 自己可讀、他人不可讀；條款版本可追溯 |
| 老師 | `teacher_applications`, `teachers`, `teacher_review_log` | pending -> active 完整走通；每次審核有 log |
| 預約 | `bookings`, `booking_messages`, `reviews` | 建立、取消、完成、評價都走 RPC |
| 金流 | `payments`, `refunds`, `confirm_payment` | webhook 重送不重複入帳 |
| 每日儀式 | `daily_readings`, `daily_draws`, `line_user_links` | 一日一次限制與 LINE push 權限 |
| 支援 | `support_threads`, `support_messages` | 使用者可開單；admin 可回覆與內部備註 |

## 4. API 設計

### Next.js

Next.js 負責 UI、session-aware pages、proxy `/api/calc/*` 到 FastAPI。正式環境 `MELE_API_URL` 必須是 HTTPS API URL，缺少時應 fail fast。

### Python FastAPI

FastAPI 是命理計算唯一真實來源：

- `/ready`：健康檢查。
- `/api/v1/calc/numerology`
- `/api/v1/calc/maya`
- `/api/v1/calc/bazi`
- `/api/v1/calc/tarot`
- `/api/v1/calc/runes`
- `/api/v1/calc/astro`
- `/api/v1/calc/ziwei`
- `/api/v1/calc/humandesign`

安全要求：

- CORS 使用 `MELE_ALLOWED_ORIGINS` allowlist。
- rate limit 預設依 `request.client.host`，只有設定 trusted proxy 時才信任 forwarded headers。
- 全域 500 回 generic error，完整錯誤只記 server logs。
- 重型計算受 `MELE_HEAVY_MAX_CONCURRENCY` 限制。

## 5. Edge Functions

| Function | 觸發 | 權限 | 驗收 |
| --- | --- | --- | --- |
| `ecpay-checkout` | 會員建立付款表單 | 使用者 JWT + service role 查訂單 | 僅 pending booking 可付款 |
| `ecpay-webhook` | ECPay server callback | no-verify-jwt + CheckMacValue | 簽章正確才 confirm_payment |
| `line-daily-push` | 排程或人工觸發 | service role + LINE token | 只推給 linked 且 push_enabled 的使用者 |

Edge Function CORS 必須使用 `MELE_WEB_URL` / `MELE_ALLOWED_ORIGINS`，不可 wildcard。

## 6. Storage

| Bucket | Public | 用途 | 要求 |
| --- | --- | --- | --- |
| `avatars` | Yes | 使用者與老師頭像 | 限本人更新自己的 avatar path |
| `teacher-docs` | No | KYC、證照、審核文件 | public 禁止；定期清除 |
| `teacher-portfolio` | Yes | 老師作品集圖片 | 老師本人可管理 |
| `ar-assets` 或 CDN | Yes | GLB/USDZ/卡牌素材 | 有商用授權紀錄 |

## 7. 觀測與稽核

公開公測前最低要求：

- 前端與 API exception：Sentry 或等價服務。
- API health：監控 `/ready`。
- Supabase：Auth Logs、Edge Function Logs、Postgres error logs。
- 金流：保存 webhook request id、MerchantTradeNo、booking id、CheckMacValue 驗證結果。
- 審核：老師狀態改變必寫 `teacher_review_log`。

## 8. 測試矩陣

| 層級 | 指令/方式 | 覆蓋 |
| --- | --- | --- |
| 結構 | `npm run test:structure` | 路由、文件、風險控制、關鍵程式碼 token |
| SQL | `npm run test:sql` | schema/RLS/RPC 靜態與 PGlite 邏輯 |
| Python | `npm run test:python` | FastAPI endpoints 與演算法回歸 |
| 部署 | `npm run test:deployment` | env、Docker、runbook、CI |
| Auth 診斷 | `npm run ops:check-auth` | Supabase public Auth settings |
| 發布 | `npm run release:check` | 上述主要驗證與 build |

## 9. 分階段落地

### Phase 1：本機與封閉測試

- 免費排盤與免費預約測試模式可用。
- Email 註冊、重寄驗證信、忘記密碼走通。
- 老師申請、管理員審核、老師後台可演示。
- `teacher-docs` 暫不收真實 KYC。

### Phase 2：公開公測

- 正式 Supabase Auth URL Configuration 與 SMTP 完成。
- Python API 部署到 Railway/Render/Fly.io/VM。
- Sentry、uptime monitor、Auth Logs 檢查流程完成。
- 金流仍可關閉或保留 sandbox，不對外收費。

### Phase 3：正式收費

- ECPay sandbox 全流程完成後切 production。
- 退款、申訴、老師未出席 SOP 演練。
- KYC private storage 與清除排程有 log。
- 合約、條款、抽成、撥款 hold 期間完成法務確認。

## 10. 當前缺口

截至 2026-05-03，最需要補人工或雲端證據的地方：

- Supabase Auth Redirect URLs 與 SMTP 實際設定截圖/紀錄。
- 以真實信箱完成一次 signup confirmation 與 password reset。
- Supabase production migrations 實際套用狀態。
- ECPay sandbox 建單、付款、webhook、回跳。
- 手機 LINE WebView 登入與排盤驗收。
- Sentry 或等價監控尚未看到 production 事件。
