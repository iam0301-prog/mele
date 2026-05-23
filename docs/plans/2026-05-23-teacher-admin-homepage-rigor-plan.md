# MELE 老師後台、申請審核、首頁互動嚴謹化計畫

> For Hermes: Use `dogfood` + `writing-plans` + visible browser verification before claiming completion. Do not report UI work as complete unless desktop and mobile screenshots prove the change is visible.

Goal: 把 MELE 從「看起來有功能」整理成「每個像按鈕的東西都有明確行為、老師審核流程可操作、老師後台權限與測試帳號清楚、主頁不再有假互動感」。

Architecture: 先建立產品審核標準與測試矩陣，再分區修正。所有後台操作要透過 Supabase RPC / RLS，不從前端直接改敏感表。首頁與公開頁面以真實使用者視角檢查「能不能點、點了去哪、不能點為什麼」。

Tech Stack: Next.js App Router, Supabase Auth / RLS / RPC, TypeScript, Playwright / existing e2e, browser visual QA.

---

## 0. 這次我前面漏掉的問題

我前面只回答「老師申請審核流程」是不夠的，因為它沒有把整個營運閉環想完整：

1. 老師測試帳號要如何登入老師後台。
2. 管理員如何判斷一位申請者是否能進入審核、面談、補件、通過、上架。
3. 老師上架後，資料、服務、排程、暫停/停權、測試預約如何處理。
4. 老師後台到底是示範資料、本人資料，還是管理員代看資料。
5. 主頁與公開頁很多卡片、文字、膠囊標籤看起來像按鈕，但沒有互動或沒有明確 affordance。
6. UI 改完不能只跑測試，要實際打開頁面看桌機與手機畫面。

這份計畫要補上這些漏洞。

---

## 1. 現況盤點（依目前程式碼）

### 1.1 老師申請審核已存在，但需要補強

主要檔案：
- `apps/web/app/admin/applications/page.tsx`
- `supabase/migrations/0003_workflow_functions.sql`
- `supabase/migrations/0008_teacher_website_application.sql`
- `supabase/migrations/0014_admin_teacher_ops.sql`

目前已有：
- `/admin/applications` 申請列表
- 可篩選狀態：pending / reviewing / revision / rejected / interview / contracted / active / paused / suspended
- Modal 查看申請者資料、介紹、連結、附件
- RPC `review_teacher_application`
- RPC `activate_teacher`
- 通過後狀態走向 contracted，正式上架才進 teachers

缺口：
- 缺少清楚「審核 SOP」提示，管理員不知道下一步該按哪個。
- 「審核通過」其實是進入 contracted，不是立即上架，按鈕文字容易誤解。
- 沒有「審核檢查清單」：身份、專長、社群、影片、服務價格、合約、測試預約。
- 補件與拒絕需要備註，但 UI 沒有強制提醒。
- 沒有顯示審核歷史 log。
- 上架後沒有要求建立至少一個服務項目，可能出現老師已 active 但無法被預約。

### 1.2 老師管理頁已存在，但還不像正式營運工具

主要檔案：
- `apps/web/app/admin/teachers/page.tsx`
- `supabase/migrations/0014_admin_teacher_ops.sql`

目前已有：
- `/admin/teachers` 老師列表
- 可調整公開資料、專長、社群連結、佣金、admin_script
- 可 active / paused / suspended
- 可從老師卡片連去 `/teacher-portal?teacher_id=...`

缺口：
- 沒有服務項目管理：名稱、時間、價格、是否上架。
- 沒有排程 / 可預約時段管理。
- 暫停原因目前用 prompt，不夠正式，也不利於手機/後台操作。
- 代看老師後台使用 query `teacher_id`，需要確認只有 admin 可以這樣代看，老師本人不能亂看別人。
- 缺少「此老師目前是否可被使用者找到 / 預約」的明確狀態。

### 1.3 老師後台已存在，但角色界線需要更清楚

主要檔案：
- `apps/web/app/teacher-portal/page.tsx`
- `apps/web/components/TeacherBriefWorkbench.tsx`
- `apps/web/lib/teacher-consultation-briefs.ts`

目前已有：
- `/teacher-portal`
- demo workbench cards
- 預約問題、命盤/工具資料、老師諮詢 brief
- 多語系內容

缺口：
- 首次進入時沒有清楚分辨：示範模式 / 老師本人 / 管理員代看。
- 老師測試帳號如果沒有 teacher record，可能只看到 demo，會誤以為後台正常。
- 缺少「老師測試帳號」建立/驗證流程。
- 老師後台應該顯示：我的預約、待準備、今日/未來、已完成、會員問題、解盤摘要、老師備註草稿、儲存狀態。
- 若沒有預約，應該提供空狀態與測試資料入口，而不是讓人不知道是否壞掉。

### 1.4 首頁與公開頁的互動審核不足

主要檔案：
- `apps/web/app/[locale]/page.tsx`
- `apps/web/app/globals.css`
- 相關公開頁：`/tools`, `/daily`, `/beta`, `/teachers`, `/teachers/apply`, `/feedback`

目前首頁有 Link 按鈕：
- 開始公開測試 -> `/daily`
- 看全部工具 -> `/tools`
- 試抽塔羅 -> `/tools/tarot`
- 測試任務清單 -> `/beta`
- 需要時找老師 -> `/teachers`
- 回報問題 -> `/feedback`

缺口：
- 部分卡片/文字/數字/膠囊標籤可能被設計成像可點擊，但其實只是文字。
- 如果是純資訊卡，要降低按鈕感；如果看起來像按鈕，就應該做成 Link/button。
- 需要做全站「假按鈕」盤點，不只首頁。
- 手機版更容易把卡片誤認為可點，需要特別測。

---

## 2. 產品審核標準：以後不能只看測試通過

每次 UI / 後台改動完成前，必須通過下面 6 類檢查：

1. 功能檢查
   - 每個主要按鈕點下去有明確結果。
   - 不能操作的項目要清楚標「尚未開放 / 示範 / 需登入 / 需管理員」。
   - 表單錯誤要顯示人看得懂的中文。

2. 權限檢查
   - 未登入不能進 admin / teacher-portal 敏感資料。
   - 非 admin 不能看 `/admin`。
   - 老師只能看自己的預約與 brief。
   - admin 可以代看老師後台，但畫面要清楚標示「管理員代看」。

3. 資料閉環檢查
   - 老師申請 -> 審核 -> 面談/補件 -> contracted -> active -> teachers record。
   - active 老師至少要有一個 active service，否則前台不可宣稱可預約。
   - 預約要能連到老師後台 brief。

4. UX / 視覺檢查
   - 看起來像按鈕就要能點；不能點就不要設計成按鈕。
   - 桌機與手機都要截圖確認。
   - 首屏要看得出下一步，不要一堆像 CTA 的文字互相競爭。

5. 文案檢查
   - 面向使用者都用繁體中文。
   - 測試版不能假裝正式營運。
   - 金流、老師諮詢、資料保存未完全上線時要講清楚。

6. 證據檢查
   - 每個重要頁面保存桌機 + 手機 screenshot。
   - 檢查 console error。
   - 跑 `npm.cmd run test:structure` 與 `npm.cmd run type-check`。
   - 重要改動前跑 `npm.cmd run release:check` 或至少說明未跑原因。

---

## 3. 老師申請審核 SOP（給管理員）

### 狀態定義

1. pending：新申請，尚未看。
2. reviewing：資料正在審核。
3. revision：要求補件。
4. interview：安排面談 / 試講。
5. rejected：拒絕。
6. contracted：通過審核、待簽約或待正式上架。
7. active：正式上架。
8. paused：老師暫停接案。
9. suspended：平台停權。

### 建議操作流程

1. 進入 `/admin/applications`。
2. 篩選「待審核」。
3. 打開申請者。
4. 檢查：
   - 真實姓名、Email、電話是否完整。
   - 專長是否具體，不是只有籠統詞。
   - 短介紹是否能給使用者安全感。
   - 長介紹是否無誇大療效、保證結果、醫療/投資承諾。
   - 身分證/附件是否存在且能打開。
   - 自介影片/社群連結是否能打開。
   - 是否適合先放入公開測試。
5. 若資料不足：填備註 -> 要求補件。
6. 若需要真人確認：填備註 -> 安排面談。
7. 若不適合：填原因 -> 拒絕。
8. 若通過：設定佣金 -> 標為「待簽約/待上架」。
9. 完成合約與服務設定後：正式上架。
10. 上架後到 `/admin/teachers` 檢查公開資料與服務項目。

### UI 必須補上的提示

- 把「審核通過」改成「通過，進入待簽約/待上架」。
- `contracted` 狀態才顯示「正式上架」。
- 補件 / 拒絕 / 面談必填備註或至少強提醒。
- Modal 補一個「審核檢查清單」。
- 顯示該申請的 review log。

---

## 4. 老師測試帳號與測試資料設計

### 4.1 需要至少三種測試身份

1. Admin 測試帳號
   - 用途：看 `/admin`、審核申請、代看老師後台。
   - 必須存在 `admins` record。

2. Teacher 測試帳號
   - 用途：老師本人登入 `/teacher-portal`。
   - 必須存在 `teachers.user_id = auth.users.id`。
   - 狀態至少一位 active、一位 paused。

3. Member 測試帳號
   - 用途：送出預約、產生問題、命盤資料、解鎖記錄。
   - 必須有 profile / booking / chart_records / member_wallet。

### 4.2 要建立一個 seed / fixture

新增或整理：
- `supabase/seed.sql` 或 `scripts/setup-supabase/seed_teacher_portal_test_data.sql`
- `scripts/verify-teacher-portal-fixtures.mjs`

測試資料至少包含：
- active teacher
- active service：30 或 60 分鐘、測試價
- paid booking：未來日期
- completed booking：過去日期
- customer_question
- chart_tool / chart_data
- consultation_briefs 若已有資料表則建立一筆草稿

### 4.3 老師後台首頁應清楚顯示模式

畫面上方必須有 banner：
- 「示範模式：目前沒有連到真實老師帳號」
- 「老師本人模式：你正在查看自己的預約」
- 「管理員代看模式：你正在查看 XXX 老師後台」

---

## 5. 老師後台應該補上的功能

### P0：公開測試前必做

1. 模式 banner：demo / teacher / admin impersonation。
2. 權限檢查：老師不能用 query 參數看別人。
3. 空狀態：沒有預約時顯示原因與下一步。
4. 預約卡片資訊完整：時間、狀態、客人問題、工具/命盤來源。
5. 老師備註草稿：可儲存，顯示保存成功/失敗。
6. 手機版可讀：卡片不爆版，主要按鈕可點。

### P1：開始邀請外部老師前必做

1. 老師服務項目管理。
2. 老師可預約時段管理。
3. 預約完成/取消流程。
4. 老師後台教學：第一次進入看到「如何準備諮詢」。
5. 通知：新預約 / 取消 / 補充問題。

### P2：正式收費前必做

1. 金流與拆帳狀態。
2. 老師收益報表。
3. 評價管理與爭議流程。
4. 合約/稅務/發票資料流程。

---

## 6. 首頁與全站「假按鈕」修正策略

### 6.1 分類規則

每個視覺元素分成三類：

1. Action：會改變頁面或送出資料，用 `<button>`。
2. Navigation：會跳頁，用 `<Link>` / `<a>`。
3. Information：只是資訊，不可設計成按鈕外觀。

### 6.2 首頁立即修正方向

針對 `apps/web/app/[locale]/page.tsx` 與 CSS：

1. Hero CTA 保留 2 個主要動作即可：
   - 開始公開測試
   - 看全部工具
2. 次要入口改成「路線卡」或普通文字連結：
   - 試抽塔羅
   - 測試任務清單
   - 需要時找老師
3. `beta2-trust` 的膠囊標籤若不可點，要降低 hover/按鈕感。
4. `promise` 卡片如果不可點，不要 hover 得像按鈕。
5. 若 `PUBLIC TEST BRIEF` 卡片像互動卡，補上實際「開始測這 4 件事」連結或降低互動感。
6. 手機版 CTA 不要超過 2 個主要按鈕，避免使用者不知道要按哪個。

### 6.3 全站盤點頁面

必測：
- `/zh-TW`
- `/zh-TW/tools`
- `/zh-TW/daily`
- `/zh-TW/beta`
- `/zh-TW/teachers`
- `/zh-TW/teachers/apply`
- `/zh-TW/teacher-portal`
- `/admin`
- `/admin/applications`
- `/admin/teachers`

檢查：
- 所有 cursor pointer 的元素是否真的可操作。
- 所有 `<button>` 是否有 onClick / submit 行為。
- 所有 `<a>` / `<Link>` 是否 href 有效。
- console 是否有 error。
- 手機版按鈕是否足夠大、間距足夠。

---

## 7. 實作任務拆分

### Task 1: 建立互動元素審核腳本

Objective: 找出看起來可點、實際可能不可點的元素。

Files:
- Create: `scripts/audit-interactive-elements.mjs`
- Modify/Test: `package.json` optional script `ops:audit:interactive`

驗證：
- 對首頁與 admin/teacher 相關頁跑 Playwright/DOM 掃描。
- 輸出：元素文字、tag、role、href、onClick、cursor style。

### Task 2: 首頁 CTA 與資訊卡視覺分層

Objective: 讓首頁「可點」和「不可點」一眼分得出來。

Files:
- Modify: `apps/web/app/[locale]/page.tsx`
- Modify: `apps/web/app/globals.css`

驗證：
- 桌機 screenshot。
- 手機 screenshot。
- 點擊所有 CTA。
- 確認沒有讓純文字看起來像按鈕。

### Task 3: 老師申請審核 Modal 補 SOP 與檢查清單

Objective: 管理員打開申請時知道下一步怎麼審。

Files:
- Modify: `apps/web/app/admin/applications/page.tsx`

內容：
- 審核檢查清單。
- 按鈕文字調整。
- 補件/拒絕/面談備註提醒。
- 顯示目前狀態可做哪些事。

驗證：
- pending / reviewing / revision / interview / contracted 各狀態 UI。
- 補件與拒絕無備註時的行為。

### Task 4: 老師申請審核歷史 log

Objective: 管理員能看到每次審核操作留下的紀錄。

Files:
- Modify: `apps/web/app/admin/applications/page.tsx`
- Possibly add type for `teacher_review_log`

驗證：
- 打開申請 Modal 能看到 action / old_status / new_status / notes / time。

### Task 5: 老師測試資料 seed 與驗證腳本

Objective: 確保老師後台不是只有 demo，能用真帳號測。

Files:
- Create: `scripts/setup-supabase/seed_teacher_portal_test_data.sql`
- Create: `scripts/verify-teacher-portal-fixtures.mjs`

驗證：
- 至少一位 active teacher。
- 至少一個 service。
- 至少一筆未來預約。
- 老師後台可讀到該預約。

### Task 6: 老師後台模式 banner 與權限整理

Objective: 使用者知道目前看的是真資料、demo、還是 admin 代看。

Files:
- Modify: `apps/web/app/teacher-portal/page.tsx`
- Modify: `apps/web/components/TeacherBriefWorkbench.tsx` if needed

驗證：
- 未登入：導向登入或只看安全 demo。
- 老師本人：顯示本人模式。
- admin with `teacher_id`：顯示管理員代看。
- 非 admin 帶別人 teacher_id：拒絕或忽略。

### Task 7: 老師後台空狀態與測試說明

Objective: 沒有預約不再像壞掉。

Files:
- Modify: `apps/web/app/teacher-portal/page.tsx`
- Modify: `apps/web/components/TeacherBriefWorkbench.tsx`

驗證：
- 無 booking 顯示「目前沒有預約」與下一步。
- demo 模式顯示「這是示範資料」。

### Task 8: 老師服務項目管理 MVP

Objective: active 老師至少能設定服務，避免上架但不可預約。

Files:
- Modify: `apps/web/app/admin/teachers/page.tsx`
- Possibly create RPC migration for admin service CRUD
- Supabase table: `teacher_services`

驗證：
- 新增 / 修改 / 停用服務。
- 前台老師列表與預約入口能讀到 active service。

### Task 9: 增加 E2E / structure tests

Objective: 把這次漏掉的點變成測試。

Files:
- Modify: `apps/web/e2e/teacher-i18n.spec.ts`
- Add: `apps/web/e2e/admin-teacher-workflow.spec.ts`
- Modify: `tests/verify-structure.mjs`

驗證：
- 老師申請頁存在關鍵 SOP 文案。
- 老師後台存在模式 banner。
- 首頁主要 CTA href 正確。
- 不應出現未處理的 console error。

### Task 10: 視覺 QA 報告

Objective: 實際看過桌機/手機畫面再回報。

Files:
- Create: `dogfood-output/mele-teacher-admin-homepage/report.md`
- Screenshots under: `dogfood-output/mele-teacher-admin-homepage/screenshots/`

必含：
- 首頁桌機/手機。
- 老師後台桌機/手機。
- 老師申請審核 modal。
- 老師管理頁。
- issue list 與修正狀態。

---

## 8. 驗證命令

Focused checks:

```powershell
npm.cmd run test:structure
npm.cmd run type-check
```

Web tests:

```powershell
npm.cmd run test:web
npm.cmd run test:e2e
```

Important release check:

```powershell
npm.cmd run release:check
```

If build needs local API:

```powershell
$env:MELE_API_URL='http://127.0.0.1:8015'; npm.cmd run build
```

Browser/visual verification:
- Open `/zh-TW`
- Open `/zh-TW/teacher-portal`
- Open `/admin/applications`
- Open `/admin/teachers`
- Capture desktop + mobile screenshots
- Check browser console after navigation and after clicks

---

## 9. 完成定義

這次不能只說「我覺得可以」。完成必須滿足：

1. 首頁沒有明顯假按鈕。
2. 老師申請流程的每個狀態與下一步清楚。
3. 老師測試帳號/測試資料路徑清楚。
4. 老師後台清楚標示 demo / teacher / admin mode。
5. 至少跑過 `test:structure` 與 `type-check`。
6. 至少截圖驗證首頁與老師後台的桌機、手機版。
7. 若有不能完成的部分，明確列為 blocking issue，不用漂亮話包裝。

---

## 10. 建議執行順序

第一輪先做 P0，不碰金流與拆帳：

1. Task 2 首頁假按鈕與 CTA 整理。
2. Task 3 老師申請審核 SOP。
3. Task 6 老師後台模式與權限。
4. Task 7 老師後台空狀態。
5. Task 9 補測試。
6. Task 10 實際視覺 QA。

第二輪才做：

1. Task 4 審核 log。
2. Task 5 測試資料 seed。
3. Task 8 服務項目管理。

原因：公開測試前最重要的是不要誤導使用者與管理者；服務項目與 seed 可以跟著老師測試帳號一起補，但主頁假按鈕與後台模式混淆要先修。
