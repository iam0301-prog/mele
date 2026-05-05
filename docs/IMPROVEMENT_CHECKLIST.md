# MELE 改進清單

最後更新：2026-04-30

這份清單只保留「目前仍有意義」的工作。已完成或已重寫的舊 placeholder 項目不再列為待辦，避免誤導工程、產品與投資人。

## 目前狀態

已完成：

- Next.js App Router 前端與 35 個路由。
- Python FastAPI 計算服務。
- 八個命理工具的基本計算與結果呈現。
- 結果頁個人化摘要、下一步建議與 AR 區塊。
- 手機版每日塔羅/盧恩與風格/材質選擇。
- 法務三頁：隱私權政策、服務條款、免責聲明。
- 註冊同意條款、免責聲明、年齡/監護人確認。
- 忘記密碼重設信。
- Cookie 與必要資料使用提示。
- 會員資料權利請求入口：匯出、更正、刪除、停止特定使用。
- 平台抽成預設調整為 20%。
- 結構檢查、API smoke、type-check、production build。

## P0：公開收費前必修

| 項目 | 目前狀態 | 下一步 |
|---|---|---|
| Supabase production migrations | 未實際雲端驗證 | 套用 `0001-0010`，截圖留存 |
| RLS 實測 | 靜態檢查通過，雲端未逐頁測 | 用會員/老師/admin 三種帳號測權限 |
| ECPay sandbox | 程式存在，完整流程未實測 | 跑付款、webhook、回跳、重送 webhook |
| 律師審閱 | 產品草案已補 | 找律師審 privacy/tos/disclaimer/老師合約 |
| Python API 正式部署 | 本機可跑 | 部署 Railway/Render/Fly.io/VM，測 subprocess |
| Sentry / uptime monitor | 未接 | 至少接前端與 API error |
| KYC Storage private | 文件要求已補 | 在 Supabase production 驗證 bucket 權限 |
| 真機 AR | 本機與 fallback 已做 | iPhone Safari、LINE WebView、Android Chrome 實測 |
| 素材授權 | 登錄表已建 | 補 GLB、卡面、石面、字體授權來源 |

## P1：公開公測前應補

| 項目 | 原因 |
|---|---|
| Playwright e2e | 避免手動測漏首頁、工具、登入、預約、付款 |
| 帳號刪除/匿名化自動化 | 目前已有請求入口，但仍需後台處理與自動化刪除流程 |
| Cookie 細項同意管理 | 目前只有必要提示；若接 Analytics/Sentry/行銷追蹤，需要可選擇同意 |
| 老師未出席後台流程 | 平台信任與退款判斷需要紀錄 |
| 退款/申訴 UI | 使用者遇到爭議不能只靠人工私訊 |
| LINE WebView QA 表 | LINE 入口很重要，不能只測 Chrome |
| 文本審稿 | 塔羅、盧恩、馬雅、八字、人類圖需降低模板感 |
| 高緯度占星 fallback | Placidus 在高緯度可能失效 |

## P2：成長期

| 項目 | 目的 |
|---|---|
| 多人生日資料 | 讓使用者替伴侶、家人、小孩保存資料 |
| 我的所有命盤 Dashboard | 集中查看八個工具與歷史結果 |
| 7 日每日儀式回顧 | 增加留存與陪伴感 |
| 個人化老師推薦 | 從結果頁導向合適老師 |
| 分享圖 / 短網址 | IG / Threads / LINE 擴散 |
| PDF 報告 | 付費報告與諮詢後摘要 |
| Redis cache / queue | 多 instance 與百人級使用 |
| App 包裝 | Capacitor / iOS / Android |

## 技術債

| 問題 | 建議 |
|---|---|
| `globals.css` 過大 | 逐步拆成 component CSS 或 Tailwind layer |
| root `package.json` 仍有舊 workspace 描述 | 若不再使用 `packages/*`，移除或改為實際 workspace |
| 前端缺單元與 e2e | 先補 5 條最關鍵路徑 |
| in-memory rate limit/cache | 公開測試前可用，正式多 instance 改 Redis |
| Node subprocess cold call | 用 cache、worker、併發限制與 API autoscaling 控制 |

## 參考文件

- [發布驗收清單](RELEASE_READINESS.md)
- [上線風險登錄表](LAUNCH_RISK_REGISTER.md)
- [部署 Runbook](DEPLOYMENT_RUNBOOK.md)
- [法務與個資 SOP](LEGAL_COMPLIANCE_SOP.md)
- [付款、退款與申訴 SOP](PAYMENT_REFUND_DISPUTE_SOP.md)
- [素材與授權登錄表](ASSET_LICENSE_REGISTER.md)
- [演算法驗證登錄表](ALGORITHM_VALIDATION_REGISTER.md)
- [監控與 QA 計畫](OBSERVABILITY_AND_QA.md)
