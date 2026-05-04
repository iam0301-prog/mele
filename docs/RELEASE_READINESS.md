# MELE 發布驗收清單

最後更新：2026-04-30

## 1. 發布分級

| 等級 | 可做什麼 | 不可做什麼 |
|---|---|---|
| 本機測試 | 開發者與內部檢查 | 不對外收費、不蒐集真實 KYC |
| 封閉內測 | 邀請少量熟人試用 | 不公開宣傳、不正式收費 |
| 公開公測 | 開放一般使用者試用 | 金流若未演練，不收費 |
| 正式收費 | 可上架老師與收費 | 必須完成法務、金流、部署、監控 |

## 2. 本機必過

```bash
npm run type-check
npm test
npm run build
npm run test:sql
npm run test:python
```

驗收：

- TypeScript 無錯。
- 結構檢查全通過。
- Python API smoke 全通過。
- Next.js production build 成功。
- `/ready` 回 200。

## 3. 封閉內測前 P0

- 法務頁可讀：`/legal/privacy`、`/legal/tos`、`/legal/disclaimer`。
- 註冊頁有條款同意、免責聲明、年齡/監護人確認。
- 忘記密碼可寄出重設信。
- Cookie 與必要資料使用提示可見。
- 會員可在 `/account/privacy` 提出資料匯出、更正、刪除或停止使用請求。
- 八個工具頁可以完成一次計算。
- 手機版 `/mobile` 可用。
- 每日塔羅/盧恩可用，並且 AR 只在結果後出現。
- 內測者清楚知道素材、AR、算法仍在驗證中。

## 4. 公開公測前 P0

- Supabase production project 已套用 `supabase/migrations/0001-0005`。
- Supabase Auth redirect URLs 已加入正式網域與 `/auth/callback`。
- `npm run ops:check-auth` 通過，並用真實信箱完成註冊驗證信、重新寄送驗證信、忘記密碼信。
- Supabase Auth Logs 可以查到寄信成功或失敗原因；公開公測前建議完成 SMTP。
- Google Auth Provider 已開啟並完成一次真實 OAuth 登入。
- LINE custom OAuth provider `custom:line` 已開啟，並在 LINE App 內建瀏覽器完成一次登入。
- RLS 已逐頁測：會員只能看自己資料、老師只能看自己預約、admin 才能看全站。
- Python API 部署在可執行 Python + Node subprocess 的環境，不是 Vercel Serverless。
- `MELE_API_URL` 指向正式 API。
- Sentry 或等價錯誤監控已接。
- Uptime monitor 已監控首頁與 `/ready`。
- 若接 Analytics、行銷追蹤或非必要 cookie，需升級為細項同意管理。
- iPhone Safari、iPhone LINE WebView、Android Chrome、Android LINE WebView 都測過。
- AR 若沒有 USDZ，不對外宣稱 iPhone 原生 AR 完成。

## 5. 正式收費前 P0

- 律師審閱隱私權政策、服務條款、免責聲明、老師合約與退款規則。
- ECPay sandbox 完整走通：建立訂單、付款成功、webhook 入帳、回跳結果頁。
- webhook 重送不會重複入帳。
- 退款、刷退、申訴、老師未出席 SOP 已演練。
- 老師 KYC Storage bucket 是 private。
- KYC 文件清除排程有 log。
- 金流撥款 hold 期間與平台抽成已寫入合約。
- 素材與 3D 模型商用授權已登錄。

## 6. 文件必備清單

公開前以下文件需存在並更新：

- [架構文件](ARCHITECTURE.md)
- [驗證機制](VERIFICATION.md)
- [上線風險登錄表](LAUNCH_RISK_REGISTER.md)
- [法務與個資 SOP](LEGAL_COMPLIANCE_SOP.md)
- [付款、退款與申訴 SOP](PAYMENT_REFUND_DISPUTE_SOP.md)
- [部署 Runbook](DEPLOYMENT_RUNBOOK.md)
- [素材與授權登錄表](ASSET_LICENSE_REGISTER.md)
- [演算法驗證登錄表](ALGORITHM_VALIDATION_REGISTER.md)
- [監控與 QA 計畫](OBSERVABILITY_AND_QA.md)

## 7. No-Go 條件

遇到以下任何一項，不發布：

- `npm run build` 失敗。
- `/ready` 失敗。
- 註冊驗證信、重寄驗證信或忘記密碼信無法送達真實信箱。
- Google/LINE 登入按鈕已對外開啟但 OAuth callback 無法完成。
- ECPay webhook 簽章驗證失敗。
- Supabase RLS 未啟用。
- 法務頁缺頁或亂碼。
- 使用者可未同意條款就註冊。
- 老師 KYC bucket 是 public。
- iOS / Android 手機主要流程無法操作。
- 付款後 booking 狀態不會更新。
- 無法說明 AR 模型或牌義文本的授權來源。

## 8. 發布證據

每次發布建立一份 release note，至少附：

- 測試指令與結果。
- 部署版本或 commit。
- API `/ready` 結果。
- Supabase migration 狀態。
- 金流 sandbox 或 staging 測試證據。
- 手機真機截圖。
- 已知風險與 rollback plan。
