# 官方規格 / 官網資料交叉驗證報告

日期：2026-04-29  
範圍：上線營運規格、AR、付款、LINE/Supabase 登入、命理計算資料

## 結論

目前程式端已完成「可部署骨架」並通過本機測試；正式上線前仍需要填入外部平台金鑰、正式網域與 iOS USDZ 素材。

命理計算中，占星與節氣/八字邊界可用官方天文資料做強驗證；塔羅、盧恩可用出版/標準資料驗證牌庫與字元；靈數、瑪雅 Dreamspell、人類圖沒有單一官方機器可讀資料源，因此採「權威/公開資料 + 演算法不變量」交叉驗證。

## 官方規格來源

- LINE Developers：LIFF Endpoint URL 必須使用 HTTPS；LIFF URL 格式為 `https://liff.line.me/{liffId}`，LIFF app 需執行 `liff.init()`。
- LINE Developers：Messaging API push message 使用 `https://api.line.me/v2/bot/message/push`，需要 channel access token。
- Supabase Docs：OAuth / passwordless `redirectTo` 必須在 Redirect URLs allow list；production 建議設定精準正式網址。
- ECPay Developers：AioCheckOut V5 使用 stage / production URL；`EncryptType=1` 代表 SHA256；CheckMacValue 必須排除自身、排序、加 HashKey/HashIV、URL encode、轉小寫、SHA256、轉大寫。
- ECPay Developers：付款通知回呼需回應 `1|OK`，且 ClientBackURL 只是返回商店，不代表付款結果。
- Apple Developer：AR Quick Look 的輸入格式為 `.usdz` 或 `.reality`。
- Google `<model-viewer>`：AR 支援 `webxr`、`scene-viewer`、`quick-look`；`ios-src` 可指定 `.usdz` 或 `.reality`。
- HKO 香港天文台：24 節氣將黃道 360 度分為 24 等分，每 15 度一節氣，春分為太陽黃經 0 度，夏至 90 度，秋分 180 度，冬至 270 度。
- Unicode：Runic block 為 U+16A0 到 U+16FF。

## 上線規格驗證

| 模組 | 官方要求 | 本地實作 | 狀態 |
|---|---|---|---|
| LINE LIFF | HTTPS Endpoint URL、LIFF ID、`liff.init()` | `LineLiffPanel` 載入 LINE LIFF SDK、使用 `NEXT_PUBLIC_LIFF_ID`、呼叫 `liff.init()` | PASS，需正式 LIFF ID |
| LINE 綁定 | 取得 LINE profile 後保存 user id | 寫入 `line_user_links.line_user_id/display_name/picture_url` | PASS，需真實 LIFF 測試 |
| LINE 推播 | Messaging API push endpoint + channel token | `supabase/functions/line-daily-push` 使用 push endpoint 與 `LINE_CHANNEL_ACCESS_TOKEN` | PASS，需部署排程 |
| Supabase OAuth | production redirect URL 要在 allow list | `/auth/callback` + login `redirectTo` 已存在；README 已列設定 | PASS，需 Dashboard 設定 |
| 綠界建立訂單 | AioCheckOut V5 POST、stage/prod URL、SHA256 CheckMacValue | `ecpay-checkout` 產生 form fields、`EncryptType=1`、`CheckMacValue` | PASS，需真實 MerchantID/HashKey/HashIV |
| 綠界回呼 | 驗證 CheckMacValue、成功回 `1|OK`、不可只信 ClientBackURL | `ecpay-webhook` 驗證 CheckMacValue、呼叫 `confirm_payment`、回 `1|OK`；已修正空白 `+` 編碼 | PASS |
| 付款回頁 | ClientBackURL 不代表付款結果 | `/account/payment/result` 文案明確說明等待背景通知 | PASS |
| AR Android/Web | `<model-viewer>` AR modes | 使用 `ar-modes="webxr scene-viewer quick-look"` 與 GLB | PASS |
| AR iOS | Quick Look 需 `.usdz` 或 `.reality` | 程式已加 `ios-src`；`public/ar` 目前尚未放 USDZ | PARTIAL，需匯出 USDZ |

## 命理資料驗證

| 功能 | 官網/權威資料 | 本地驗證 | 狀態 |
|---|---|---|---|
| 占星 | HKO 節氣太陽黃經、NASA/JPL/Swiss Ephemeris 類天文曆可交叉 | 2024 春分/夏至/秋分/冬至與 HKO 黃經差小於 0.0003 度；API 10 行星 + 12 宮位 | PASS |
| 八字 | 節氣邊界依太陽黃經，HKO 可驗立春 315 度 | 2024 立春前後年柱切換通過；`lunar-python==1.4.8` 已列 requirements | PASS |
| 紫微 | 無政府官方標準；以 iztro 文件/12 宮結構與本地八字交叉 | API 回 12 宮、中文化輸出、與八字資料同源 | PASS with limitation |
| 塔羅 | Rider-Waite 牌系為 78 張 | 本地牌庫 78 張、抽牌 seed deterministic | PASS |
| 盧恩 | Unicode Runic block U+16A0-U+16FF | Elder Futhark 24 顆，glyph 落在 Runic block | PASS |
| 靈數 | 無單一官方標準；Pythagorean digit reduction 為流派規則 | 固定案例與邊界測試通過 | PASS with limitation |
| 瑪雅 Dreamspell | 無單一官方 machine-readable 標準 | 260 日循環、不變量與既有 anchors 測試通過 | PASS with limitation |
| 人類圖 | 無開放官方 machine-readable 權威表 | 64 閘門、36 通道、9 中心、人格/設計行星模型結構通過 | PASS with limitation |

## 本次本機驗證結果

- `npm test`：167 structure checks + 44 Python API checks，全數通過。
- `npm run type-check`：通過。
- `npm run build`：通過。
- 本機站台 `http://127.0.0.1:3006/` 已回 200。

## 上線前仍需人工/外部平台完成

1. LINE Developers 建立正式 channel / LIFF App，取得 `NEXT_PUBLIC_LIFF_ID`。
2. LINE Messaging API channel access token 設到 Supabase secret。
3. Supabase Auth Redirect URLs 加入正式網域與 `/auth/callback`。
4. 綠界正式 MerchantID / HashKey / HashIV / ReturnURL 設到 Supabase secrets。
5. 匯出四個 iOS AR 檔：`tarot-card.usdz`、`rune-stone.usdz`、`astral-plate.usdz`、`human-design-bodygraph.usdz`。
6. 用真實手機測 LINE 內 LIFF、Safari Quick Look、Android Scene Viewer。
