# MELE 監控與 QA 計畫

最後更新：2026-04-30

## 1. 目標

公開測試後，不能靠使用者截圖回報才知道壞掉。MELE 需要基本監控、錯誤追蹤、效能觀察與真機 QA。

## 2. 上線前 QA

必測流程：

- 首頁到八個工具頁。
- 每個工具至少算一筆。
- 結果頁：摘要、詳細解析、AR、下一步 CTA。
- 手機版每日塔羅與每日盧恩。
- LINE 登入與每日推播設定。
- 老師列表、老師詳情、預約、付款頁。
- 法務頁、登入、忘記密碼。

必測裝置：

- iPhone Safari。
- iPhone LINE WebView。
- Android Chrome。
- Android LINE WebView。
- Desktop Chrome。

## 3. 自動化測試缺口

目前已有：

- 結構檢查。
- API smoke。
- TypeScript type-check。
- Production build。

仍缺：

- Playwright e2e。
- 前端 component/unit tests。
- ECPay sandbox 自動回歸測試。
- LINE LIFF 真機測試紀錄。
- AR 真機截圖或影片驗收。

## 4. 監控建議

| 工具 | 用途 | P0/P1 |
|---|---|---|
| Sentry | 前端與 API exception | P0 |
| Vercel Analytics / Plausible | 頁面流量與轉換 | P1 |
| API request id | 追查單筆錯誤 | P0 |
| Supabase logs | Auth、DB、Edge Function | P0 |
| Uptime monitor | `/ready` 與首頁可用性 | P0 |

## 5. 不應記錄的資料

錯誤 log 不應包含：

- 完整生日與出生時間。
- 證件、電話、地址。
- 付款卡號或金流敏感資訊。
- 使用者私密問題全文。
- OAuth token、LINE token、service role key。

## 6. 事件命名建議

產品分析事件：

- `tool_started`
- `tool_completed`
- `daily_tarot_drawn`
- `daily_rune_drawn`
- `ar_opened`
- `teacher_profile_viewed`
- `booking_started`
- `payment_started`
- `payment_completed`
- `support_thread_created`

每個事件只放必要欄位，例如 tool、status、device、browser，不放敏感內容。

## 7. 發布後每日檢查

公開測試前 14 天，每天檢查：

- API error rate。
- `/ready` uptime。
- ECPay webhook failure。
- LINE Push failure。
- 使用者申訴。
- 老師未出席。
- AR 載入失敗比例。
- 新註冊、完成解盤、預約轉換。
