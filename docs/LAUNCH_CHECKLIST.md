# Mele 上線檢查清單

> 從「技術 ready」走到「對外開店」的逐項打勾清單。
> 配套文件：[RELEASE_READINESS.md](RELEASE_READINESS.md)、[DEPLOYMENT_RUNBOOK.md](DEPLOYMENT_RUNBOOK.md)、[CUSTOMER_SUPPORT_SOP.md](CUSTOMER_SUPPORT_SOP.md)、[TEACHER_CONTRACT_TEMPLATE.md](TEACHER_CONTRACT_TEMPLATE.md)

最後更新：2026-05-23

---

## 🧑‍💼 「只有你能做」的事（外部服務 / 真實互動）

下列項目需要實際服務帳號、真實人類或法律專業——**Claude 無法代為執行**：

- [ ] **ECPay 商家帳號**：申請、驗證、串接沙箱
- [ ] **Supabase 正式 project**：建立、設定 RLS、跑 migrations
- [ ] **DNS + domain**：購買、設定 A/CNAME、HTTPS
- [ ] **LINE Developers 帳號**：建 channel、設定 OAuth callback
- [ ] **Google Cloud OAuth client**：建立、設定 redirect URI
- [ ] **GitHub Secrets**：填入 Vercel token、Supabase service key 等
- [ ] **找律師審法務文件**：privacy / ToS / disclaimer / 老師合約
- [ ] **真實老師招募**：至少 2 位走完 5 階段審核
- [ ] **真實使用者測試**：5 位陌生人跑完黃金路徑
- [ ] **客服信箱**：設定 support@ / privacy@ / legal@
- [ ] **Email domain SPF/DKIM/DMARC**：寄信不進垃圾郵件

下面的 P0 / P1 清單，**Claude 已完成的會以 ✅ 標記**。

---

## 🎯 上架等級定義

| 等級 | 對象 | 條件 |
|---|---|---|
| **L1 自用** | 你自己 / 開發中 | 全部測試綠、`npm run dev` 跑得起來 |
| **L2 封測** | 邀請制 10-50 人 | P0 全綠、有 LINE 群可即時回報 |
| **L3 公開** | 對外 Google index、社群可分享 | P0 + P1 全綠、法務頁面律師看過 |
| **L4 商業營運** | 真實老師抽成、客服 SOP | L3 + 真實老師上架 + 客服 SLA |

---

## 🔴 P0 — 上 L2 封測前必做

### 後端 / 服務連通

- [ ] **ECPay 沙箱跑完整流程**：建單 → 跳轉付款頁 → webhook 回呼 → `confirm_payment` 把 booking 改 paid → 通知 customer + teacher
  - 文件：[PAYMENT_REFUND_DISPUTE_SOP.md](PAYMENT_REFUND_DISPUTE_SOP.md)
  - 驗收：`supabase/functions/ecpay-webhook` 在沙箱實際被呼叫一次
- [ ] **Supabase 正式 project 部署**：跑 0001-0010 全部 migration、確認 RLS policy 沒少
  - 用 `supabase db push` 或 dashboard 手動套用
  - 驗收：dashboard 看 11 個 table + 93 條 policy + 10+ 個 RPC function
- [ ] **pg_cron 在雲端排程實測**：手動觸發 `run_kyc_purge_job()` 一次，確認 `kyc_purge_log` 有寫入
  - 注意 Supabase Free tier 沒 pg_cron，要 Pro tier
- [ ] **LINE OAuth callback URL 在 production domain 重設**：custom:line provider 的 redirect URI 要包含 prod domain
  - 文件：[OAUTH_LOGIN_RUNBOOK.md](OAUTH_LOGIN_RUNBOOK.md)
  - 驗收：在 production domain 跑一次 LINE 登入成功
- [ ] **Google OAuth callback URL 同上**：Google Cloud Console → OAuth 2.0 client → Authorized redirect URIs 加 prod domain
  - 驗收：在 production domain 跑一次 Google 登入成功

### 真實資料驗證

- [ ] **至少 1 個真實老師走完 5 階段審核**：pending → reviewing → interview → contracted → active
  - 同時驗證 `teacher_review_log` 稽核紀錄是否正確寫入
- [ ] **黃金路徑端到端跑通一次**：訪客註冊 → 點數領 → 工具排盤 → 解鎖深解 → 預約老師 → 付款 → 老師接受 → 諮詢 → 評價 → 取消測試
  - 任一步卡住就回頭修
- [ ] **手機 PWA install + 使用測試**：iOS Safari + Android Chrome 各跑一次
  - 加到主畫面、icon 正常、Service Worker 快取生效、離線降級訊息出現

### 環境變數

- [ ] `MELE_API_URL` = Railway prod URL（FastAPI）
- [ ] `MELE_ALLOWED_ORIGINS` = prod domain（不含 trailing slash）
- [ ] `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`（**只在 server side**，never NEXT_PUBLIC_）
- [ ] `ECPAY_HASH_KEY` + `ECPAY_HASH_IV`（Supabase Edge Function secrets）
- [ ] `NEXT_PUBLIC_ENABLE_LINE_LOGIN=true` + `NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=true`
- [ ] `NEXT_PUBLIC_LINE_OAUTH_PROVIDER=custom:line`
- [ ] **關閉** `NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE`（test mode 不可上 prod）
- [ ] 跑 `npm run ops:check-auth` 確認設定齊全

### CI/CD

- [ ] GitHub repo Secrets：`VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`
- [ ] GitHub repo Variables：`VERCEL_DEPLOY_ENABLED=true`
- [ ] Push 到 main 觸發 `.github/workflows/ci.yml` 的 deploy-prod job 成功
- [ ] Vercel domain 接 DNS（CNAME / A record）+ HTTPS 憑證自動發

---

## 🟡 P1 — 上 L3 公開前必做

### 文案 / 內容完整度

- [x] **生命靈數 v1 文案** ✅（4 個版本 × 9 個數字 = 36 條）
- [x] **馬雅曆 v1 文案** ✅（20 圖騰 × teaser_friend + full_master 6 區塊 = 40 條）
- [x] **八字文案 v1** ✅（10 天干 + 12 地支 + 五行平衡，commit eb890e3；engine 接線 commit 6308e63 — `explain_bazi` 已實際讀取 bazi.yaml）
- [x] **塔羅文案 v1（大牌）** ✅（22 大牌 × 正逆位 × 6 區塊 voice，python_api/data/copy/tarot.yaml）；78 張小牌待補
  - ⚠️ **engine 尚未接線**：`explain_tarot` 目前仍只讀 `data.cards`，未讀 tarot.yaml → 文案還沒到使用者眼前。需比照 `_bazi_copy`/`explain_bazi` 補上 `_tarot_copy` 接線
- [ ] **盧恩文案 v1**：24 符文 × 正逆位
- [ ] **占星文案 v1**：太陽 / 月亮 / 上升 × 12 星座 + 行星宮位重點
- [ ] **紫微文案 v1**：14 主星 + 命宮 + 大運基本詮釋
- [ ] **人類圖文案 v1**：64 閘門 + 9 中心 + 5 類型 + 4 內在權威

### 老師後台 UI

- [x] **Voice tab UI（生命靈數）** ✅（scholar / friend / master 可切換）
- [ ] 其他 7 個工具同步補（馬雅 master voice 已寫好，UI 接上即可）

### 監控 / 觀測

- [x] **Sentry stub** ✅（`lib/observability.ts` + `main.py` 已接 hook，填 DSN 即啟用）
- [ ] **Sentry DSN 申請 + 填入** env：`NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_DSN`
- [ ] **真實安裝 @sentry/nextjs**：`npm --prefix apps/web install @sentry/nextjs`，stub 轉真實 SDK
- [ ] **Logflare / Better Stack** 接 Supabase 日誌
- [ ] **Vercel Analytics** 開（免費 plan 也有基礎）
- [ ] **Uptime Robot** 監 `/health` + `/ready` 每 5 分鐘 ping 一次

### 法務 / 合規

- [x] **隱私政策 v0 草案** ✅（含 cookie / 保存期限 / 個資法權利章節）
- [x] **服務條款 v0 草案** ✅（含退款具體時點 / 抽成 10% / 撥款週期）
- [x] **免責聲明 v0 草案** ✅（含緊急電話 1995/1925/119/110/113）
- [x] **老師合約 v0 模板** ✅（`docs/TEACHER_CONTRACT_TEMPLATE.md`，11 條 + 2 附錄）
- [ ] **三份法務文件 + 老師合約** 找律師審過、定稿
- [ ] **Cookie consent banner**（已有 `mele_cookie_consent_v1`）UI 真的顯示且能拒絕
- [ ] **KYC 90 天自動清除** 在實環境跑一次手動驗證

### SEO / 流量

- [x] **robots.txt** ✅
- [x] **sitemap.xml** ✅（自動列 8 工具 × 6 locales + legal/teachers/daily 等）
- [x] **每頁 metadata** ✅（title / description / og + twitter card 完整）
- [x] **JSON-LD structured data** ✅（Organization + WebSite + SearchAction）
- [x] **404 / error 頁** ✅（`app/not-found.tsx` + `app/error.tsx`）
- [ ] **Google Search Console** 認證 + 提交 sitemap
- [ ] **Vercel domain canonical** 設好（www vs apex 二選一）
- [ ] **OG image** × 6 語系（社群分享預覽圖）

### Email / 通知

- [ ] **Supabase Auth Email Template 客製化**：歡迎信、驗證信、重設密碼信
  - 預設模板長得像釣魚信，會被歸到 spam
- [ ] **發信 domain SPF / DKIM / DMARC** 設好（避免進垃圾郵件）
- [ ] **LINE Messaging API webhook** 接好（諮詢前 24h 提醒）

### 真實測試

- [ ] **5 位陌生使用者**（非朋友）跑黃金路徑，收集 3 大痛點
- [ ] **2 位真實命理師** 上架走完審核 + 接 1 場諮詢
- [x] **客服 SOP 文件化** ✅（`docs/CUSTOMER_SUPPORT_SOP.md`，含 6 種模板回覆）
- [ ] **客服信箱** 真實能收信（待設定 support@mele.tw）

---

## 🟢 P2 — 可延後（不擋 L3）

- [ ] AR / WebXR 諮詢室 demo
- [ ] Capacitor 包 iOS / Android app store
- [ ] 月結批次撥款（pg_cron 自動分潤給老師）
- [ ] 老師自助管理時段（不用透過管理員開）
- [ ] 諮詢結束自動寄重點摘要 PDF（需 LLM 串接）
- [ ] AI 追問功能（諮詢結束 7 天內免費追問 1 次的 AI 輔助版）
- [ ] 多語系 OG image
- [ ] A/B 測試框架（GrowthBook / PostHog）

---

## ⚠️ Anti-launch 雷區（別碰）

- ❌ **沒律師看過就公開接客**：個資法 + 消保法直接套你
- ❌ **沒備援的單一 Supabase project**：免費 plan 被 ddos = 全站掛
- ❌ **真實老師沒簽合約**：抽成發生爭議沒法律依據
- ❌ **客服信箱沒人看**：第一封投訴信被忽略 = PTT 苦主文
- ❌ **未驗證的 ECPay 直接收錢**：金流出錯 = 個資外洩風險

---

## 📅 建議節奏

```
W0（今天）   → 跑全套 release:check，標 L1 通過
W1-W2       → 攻 P0 七件事（後端 + 真實資料 + 環境變數 + CI/CD）
W2 週末     → 邀請 10 人封測（L2 達成）
W3-W6       → 攻 P1（文案 7 工具 + 監控 + 法務 + SEO + 真實測試）
W7          → 律師審完法務文件
W7-W8       → L3 對外公開（控制流量、看監控）
M3+         → 真實老師收費（L4）
```

---

## 🔗 相關文件

- [RELEASE_READINESS.md](RELEASE_READINESS.md) — 6 階段釋出原則
- [DEPLOYMENT_RUNBOOK.md](DEPLOYMENT_RUNBOOK.md) — Vercel + Railway + Supabase 部署步驟
- [OBSERVABILITY_AND_QA.md](OBSERVABILITY_AND_QA.md) — Sentry / Logflare 接線
- [LEGAL_COMPLIANCE_SOP.md](LEGAL_COMPLIANCE_SOP.md) — 法務 SOP
- [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md) — Supabase 白話設定
- [OAUTH_LOGIN_RUNBOOK.md](OAUTH_LOGIN_RUNBOOK.md) — Google / LINE 登入接線
- [PAYMENT_REFUND_DISPUTE_SOP.md](PAYMENT_REFUND_DISPUTE_SOP.md) — 退費 SOP
