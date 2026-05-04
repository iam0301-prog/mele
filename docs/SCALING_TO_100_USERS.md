# MELE 百人級使用規劃

目標：讓 MELE 可以支撐「數十到數百位客人同一天試用」的情境，同時保持手機版清楚、AR 呈現穩定、命理計算正確，避免上線後每個問題都需要人工救火。

## 1. 產品原則

MELE 不是一般命盤工具，而是「命理媒介中心」。客人進來後應該清楚知道三件事：

- 我現在正在使用哪一種系統：塔羅、盧恩、紫微、八字、占星、人類圖、馬雅、靈數。
- 我得到的結果代表什麼：盤面或牌面下方必須有易讀解釋，不只給圖。
- 我下一步可以做什麼：保存結果、每日儀式、找老師、進一步解盤。

百人級試用時，最重要的是降低疑惑與重複客服：

- 每個功能都要有「輸入說明、結果摘要、深度解釋、AR 呈現、下一步 CTA」。
- 手機版先於桌面版驗收，因為 LINE 入口與 AR 都主要發生在手機。
- AR 不能只是裝飾，必須出現在解盤結果後，並承載牌面、石面、盤面資訊。

## 2. 架構配置

建議正式測試架構：

- Frontend：Vercel 或同等級 Node hosting，跑 Next.js production build。
- Calculation API：獨立 FastAPI service，不與 Next.js 混在同一個 runtime。
- Database/Auth：Supabase Postgres + Auth + RLS。
- Edge jobs：Supabase Edge Functions 處理 ECPay webhook、LINE Daily Push、排程任務。
- Asset delivery：AR models、卡面、石面、盤面素材放 CDN 或 Supabase Storage public bucket。

原因：

- 命理計算有 Python / Node subprocess / Swiss Ephemeris 等重型工作，應和前端分離。
- 前端流量尖峰不應拖垮計算 API。
- LINE Push、付款 webhook、每日儀式不能依賴使用者開著網頁。

## 3. 目前已落實的穩定性

本輪已完成：

- Python API 支援 `birth_date` / `birth_time` 友善輸入格式，降低前端表單轉換錯誤。
- 紫微性別輸入可接受 `男/女` 與 `male/female`，避免跨端格式不一致。
- CORS 補上本機 3006 / 3007，方便正式測試與備援 port。
- 計算 API 加入 LRU 快取，重複生日資料不會每次重算。
- 八字、紫微、占星、人類圖等重型計算加入併發限制，避免多人同時使用時 CPU / subprocess 被打爆。
- 計算改走 background thread，避免單一慢計算阻塞整個 FastAPI event loop。
- 新增本機啟動腳本：
  - `scripts/start-python-api-8015.cmd`
  - `scripts/start-web-3006.cmd`

## 4. 容量規劃

封閉測試 50 人：

- 單台 API 即可。
- LRU 快取 2048 筆足夠。
- 重型計算同時限制 4-8 個，其他 request 等待。
- AR asset 先用靜態檔即可。

公開測試 100-300 人：

- API 至少 2 個 worker / instance。
- 將 in-memory LRU 升級為 Redis / Upstash，跨 instance 共用快取。
- 對 tarot / runes / daily ritual 加入每人每日限制，避免惡意刷新。
- 所有 POST API 加 rate limit：同 IP 每分鐘 30 次，同 user 每分鐘 20 次。
- 加 request id 與 error logging，方便定位「哪個工具、哪個 payload、哪種裝置」出錯。

正式商用 300+ 人：

- API autoscaling。
- Redis cache + queue。
- ECPay webhook 寫入 idempotency key，避免重複付款通知造成狀態錯亂。
- LINE Push 使用排程批次與重試佇列。
- AR assets 全部走 CDN，並壓縮模型大小。

## 5. 資料與金流不可妥協項

上線前 P0：

- Supabase 5 個 migrations 必須套到正式 project。
- RLS policy 必須逐頁測試：會員只能看自己的資料，老師只能看自己的預約，admin 才能看全部。
- ECPay sandbox 必須走完完整流程：建立訂單、付款成功、webhook 入帳、回跳結果頁。
- webhook 必須可重複接收同一筆訂單，不可重複加帳。
- LINE Login / LIFF redirect URL 必須同時測 Safari、Chrome、LINE 內建瀏覽器。

## 6. 前端體驗標準

每一個命理工具頁都應有同一套資訊架構：

- 上方：工具名稱、適合使用情境、資料來源提醒。
- 輸入區：日期、時間、地點、性別等欄位要中文化，並給預設範例。
- 結果區：先給 3 行摘要，再給盤面 / 牌面。
- 解釋區：分成「你現在可以看什麼」、「這代表什麼」、「可以怎麼運用」。
- AR 區：只在結果出來後出現，且要對應該次結果內容。
- 下一步：保存、每日提醒、預約老師、分享。

手機版硬性要求：

- 任何卡片文字不得被壓縮到不可讀。
- 表格在手機上要改成 stacked cards。
- AR 按鈕要顯示裝置支援狀態。
- LINE 內建瀏覽器若不能開 AR，要提示改用 Safari / Chrome。

## 7. 監控與驗證

每次 release 前必跑：

- `npm test`
- `npm run test:sql`
- `cd apps/web && npm run type-check`
- `cd apps/web && npm run build`
- API smoke：8 個工具都要回 200，且 `render.html` 與 `render.svg` 不可空。

建議新增監控：

- `/health`：服務活著。
- `/ready`：依賴可用，例如 Python packages、node subprocess、資料庫連線。
- 每個 calc endpoint 記錄 latency p50 / p95。
- 付款 webhook error rate。
- LINE Push 成功率。
- AR 按鈕點擊率與失敗率。

## 8. 近期執行順序

第一階段：可穩定試用

- 完成 API 快取與併發保護。
- 修完所有明顯亂碼、壓縮文字、手機排版。
- 每個工具補完整中文摘要與解釋。
- 讓 8 個工具都能用同一套輸入體驗。

第二階段：可封閉公測

- Supabase migrations 套用正式 project。
- ECPay sandbox 完整測通。
- LINE LIFF 登入、保存每日儀式、推播測通。
- 手機實機測 iPhone Safari、Android Chrome、LINE browser。

第三階段：可公開收費

- Redis 快取與 rate limit。
- webhook idempotency。
- 錯誤監控與告警。
- AR assets CDN 化。
- 老師後台與 admin 後台補齊營運功能。

## 9. 驗收標準

封閉測試前：

- 8 個工具 API 全部 200。
- 8 個工具手機版可完成輸入與查看結果。
- 塔羅、盧恩、至少 2 個盤面工具有結果後 AR 呈現。
- 付款與預約至少 sandbox 跑通 1 次。

公開測試前：

- 30 分鐘內模擬 100 位使用者不出現 5xx 尖峰。
- API p95 小於 2.5 秒；重型工具 p95 小於 5 秒。
- 手機版主要頁面沒有文字重疊。
- LINE 內建瀏覽器不空白、不卡死，AR 不支援時有明確 fallback。

正式商用前：

- 付款、預約、退款、老師審核、評價全流程可追蹤。
- 每日推播失敗可重試。
- 隱私權、服務條款、個資刪除流程完整。
- 所有素材授權與商用權確認完成。
