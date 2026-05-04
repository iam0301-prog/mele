# MELE 命理媒介中心：AR 與手機版產品完善規劃

日期：2026-04-29  
角色：產品經理給工程、設計、3D、美術與 QA 的執行規格

更新狀態：2026-04-30 已完成第一輪落地，包括結果頁 AR 區塊、塔羅三風格、盧恩三材質、手機每日儀式選擇、AR fallback 與結果頁中文摘要。仍未完成的是 iOS USDZ 產線、真機 AR 驗收、每張牌/每顆石的正式商用級模型與完整素材授權登錄。

## 1. 產品結論

目前不建議進入可下載或正式上線階段。原因不是功能數量不夠，而是核心體驗尚未一致：

- 手機版與網頁版像兩套產品，使用者路徑、視覺層級、結果呈現不一致。
- AR 目前偏「展示模型」，還沒有完全變成「解盤當下的沉浸式結果」。
- iOS AR Quick Look 需要 USDZ 或 Reality 格式，目前仍缺正式 iOS AR 資產。
- 塔羅 AR 必須顯示抽到的卡面資訊，而不是只有一張通用卡牌模型。
- 每項命理功能需要有資料來源、測試 fixture、第三方交叉驗證報告與可重跑的驗證腳本。

產品定位要收斂成一句話：

> MELE 是一個以手機優先、LINE 登入為入口、每日儀式為留存、AR 立體解盤為差異化的命理媒介中心。

## 2. 正式上線前的不可妥協項

P0 必須完成：

- 手機首頁、每日頁、工具頁、結果頁要統一成同一套響應式流程。
- 所有 AR 必須只出現在「解盤結果」或「每日抽牌/抽石結果」的情境中；首頁只做入口，不放大型 AR 展示。
- 塔羅 AR 要能呈現本次抽到的牌名、正逆位、關鍵訊息、牌面視覺。
- 盧恩 AR 要能呈現本次抽到的符文、正逆位、石面刻痕、關鍵訊息。
- 人類圖 AR 要呈現該使用者的中心、通道與閘門狀態，不使用固定示意模型當作結果。
- 星盤 AR 要呈現該使用者的行星位置、宮位或至少主要星體環。
- iOS 必須有 USDZ 或 Reality fallback；Android/WebXR 使用 GLB。
- 每一項命理計算至少有 5 組 fixture 與交叉驗證紀錄。
- 手機實機驗收需覆蓋 iPhone Safari、LINE in-app browser、Android Chrome。

P1 應完成：

- 每項工具有 30 秒內看得懂的中文說明。
- 結果頁有「重點摘要、詳細解析、AR 呈現、儲存/分享/找老師」四段。
- LINE 登入後可保存生日資料、每日解盤、每日抽牌/抽石紀錄。
- 每日抽牌與抽石限制為每人每天一次，但允許查看歷史結果。
- 老師端可查看使用者授權後的基本盤與每日紀錄摘要。

P2 可延後：

- 多牌陣 AR 動畫。
- 進階付費報告 PDF。
- 老師直播或多人同步解盤。

## 3. 使用者旅程

### A. 新使用者手機進站

1. 看到今日儀式首頁，不先看到複雜工具列表。
2. 可選「今天抽一張塔羅」、「今天取一顆盧恩石」、「建立我的命盤」。
3. 第一次使用只要求必要資料：生日、時間、出生地、是否知道精確時間。
4. 結果先給短摘要，再引導看 AR。
5. 若要保存結果，提示 LINE 登入。

驗收標準：

- 手機第一屏只出現一個主行動。
- 44px 以上觸控目標。
- 使用者可在 3 步內完成每日抽牌。
- 不登入也能試用，但登入後能保存。

### B. 每日抽塔羅

1. 使用者點「抽今日塔羅」。
2. 後端回傳卡牌、正逆位、關鍵字、今日建議。
3. 結果頁顯示卡面插圖與中文解讀。
4. AR 顯示該張牌的立體卡牌，而不是固定通用卡。
5. 卡牌正面需有牌名、羅馬序號、正逆位狀態、核心象徵圖案。

驗收標準：

- 抽到「女祭司」時，AR 卡面要顯示女祭司，不可仍顯示通用卡。
- 正位與逆位在 AR 中方向不同，或有清楚正逆位標記。
- AR 載入失敗時，仍顯示 2D 牌面與完整解讀。

### C. 每日取盧恩

1. 使用者點「取今日盧恩」。
2. 結果回傳符文、正逆位、中文名、主題。
3. AR 顯示石面材質與刻痕符號。
4. 石頭顏色、刻痕光、符文位置與結果一致。

驗收標準：

- 抽到 Fehu 時，石面刻痕必須是 Fehu。
- 每個符文至少有可辨識 3D 刻痕，不只文字。
- 手機不能進 AR 時，顯示可旋轉 3D 預覽。

### D. 解盤工具結果

每個工具結果頁統一架構：

- 上方：結果摘要與主要標籤。
- 中段：可閱讀的中文解析。
- AR 區：只呈現與本次結果相關的盤面、牌面或石面。
- 下方：保存、分享、諮詢老師、重新輸入。

## 4. AR 技術策略

官方技術限制要寫進工程規格，避免誤判。

- WebXR 屬於有限支援與實驗性技術，且需要安全環境；正式環境必須使用 HTTPS。
- model-viewer 可用 `ar-modes="webxr scene-viewer quick-look"` 支援 WebXR、Android Scene Viewer 與 iOS Quick Look。
- iOS AR Quick Look 正式輸入格式是 `.usdz` 或 `.reality`。
- LINE in-app browser 對相機/AR 能力可能受限制，因此需要「開啟外部瀏覽器」fallback。

工程方案：

- `GLB`：所有平台的 3D 預覽與 Android AR 主格式。
- `USDZ`：iOS Safari / Quick Look 主格式。
- `2D fallback`：任何 AR 不支援時都要有高品質卡面/盤面。
- `Capability detection`：頁面需偵測 WebXR、Quick Look、Scene Viewer、LINE browser。
- `Result-bound asset`：AR 資產必須依結果生成或套材質，不使用通用模型。

## 5. 動態 AR 資產規格

### 塔羅卡

資料需求：

- card_id
- name_zh
- name_en
- arcana
- number
- suit
- position
- keywords
- short_message
- image_asset

3D 呈現需求：

- 厚卡身與金屬邊框。
- 卡面正面有該牌插圖。
- 卡面有中文牌名與英文牌名。
- 逆位時卡牌旋轉 180 度，並顯示逆位標記。
- 可點擊或切換「象徵、提醒、建議」三層資訊。

工程做法：

- 第一階段：以 Canvas 產生卡面貼圖，套到固定塔羅 GLB 的 front material。
- 第二階段：每次抽牌後產生 result-specific GLB。
- 第三階段：輸出 result-specific USDZ，支援 iOS 原生 AR。

### 盧恩石

資料需求：

- rune_id
- glyph
- name
- zh_name
- position
- keywords
- short_message
- stone_material

3D 呈現需求：

- 每顆石頭有不規則形狀。
- 符文是雕刻進石面，不是浮在上面的字。
- 正逆位影響石頭擺放角度與解讀標示。
- 可顯示關鍵字光環，但不能只靠文字。

工程做法：

- 第一階段：為 24 個 Elder Futhark 符文建立 glyph path 與 stone material presets。
- 第二階段：依符文生成石面刻痕 geometry。
- 第三階段：結果頁載入指定 rune GLB/USDZ。

### 人類圖

資料需求：

- type
- authority
- profile
- strategy
- defined_centers
- open_centers
- channels
- gates

3D 呈現需求：

- 中心是立體幾何，而非單純平面圖。
- 已定義中心用琺瑯或金屬高亮。
- 通道是有厚度的連線。
- 個別閘門可點選查看中文說明。

工程做法：

- 以同一套 bodygraph coordinate system 生成 SVG/Canvas/3D。
- 先完成 2D 正確性，再把中心、通道、閘門映射到 3D。
- AR 只顯示結果盤，不顯示通用示意盤。

### 星盤

資料需求：

- planets
- signs
- houses
- aspects
- ascendant
- midheaven

3D 呈現需求：

- 黃道十二宮外圈。
- 宮位圈與行星標記。
- 相位線可分層開關。
- 使用者可在 AR 中旋轉星盤。

工程做法：

- 用計算結果產生 zodiac layout。
- 2D 星盤與 3D 星盤使用同一份座標資料。
- 將行星 glyph、宮位線、相位線轉成 mesh 或貼圖。

## 6. 手機版與桌機版一致性

目前不要維護獨立 `/mobile` 作為主產品。建議改為：

- `/`：響應式今日入口。
- `/daily`：每日儀式與每日抽牌/抽石。
- `/tools/[tool]`：各工具輸入與結果。
- `/reading/[id]`：保存後的解盤結果。
- `/account`：LINE 登入、個人資料、歷史紀錄。
- `/teachers`：老師媒合。

手機規格：

- 底部導覽：今日、工具、紀錄、老師、我的。
- 結果頁避免大段卡片堆疊，改成摘要、分段、展開詳情。
- 所有生日時間輸入使用原生 date/time picker，加上「不知道出生時間」選項。
- 出生地要有搜尋、自動時區與手動修正。
- AR 區塊只在結果頁出現，且不可擠壓主要解讀。

桌機規格：

- 左側為輸入/工具選單，右側為結果。
- 結果可並排顯示文字與盤面。
- AR 作為結果的沉浸檢視，不作為首頁裝飾。

## 7. 資料驗證與可信度

命理產品的可信度不是靠文案，而是靠可重跑的驗證。

每個工具都要有：

- `golden fixtures`：固定輸入與預期輸出。
- `celebrity fixtures`：至少 5 組名人生日資料。
- `third-party crosscheck`：與至少 1 個可信站點或資料庫比對。
- `tolerance notes`：不同派別可能不同的地方要標註。
- `test report`：放在 `tests/reports` 並標日期。

功能驗證矩陣：

| 功能 | 必驗欄位 | 驗證方式 | 上線門檻 |
| --- | --- | --- | --- |
| 八字 | 年柱、月柱、日柱、時柱、節氣邊界 | lunar-python + 第三方排盤 | 20 組 fixture 全過 |
| 紫微 | 命宮、身宮、主星、四化 | 既有資料庫 + 第三方排盤 | 10 組 fixture 全過 |
| 占星 | 太陽、月亮、上升、宮位 | Swiss Ephemeris 或明確 ephemeris | 10 組 fixture，角度誤差標註 |
| 人類圖 | 類型、權威、中心、閘門 | 出生資料 + gate mapping | 10 組 fixture 全過 |
| 生命靈數 | 生命靈數、生日數、姓名數 | 公式測試 | 20 組 fixture 全過 |
| 馬雅曆 | Kin、調性、圖騰 | Starroot 等站點交叉 | 10 組 fixture 全過 |
| 塔羅 | 牌組、正逆位、seed 一致性 | deterministic seed 測試 | 相同 seed 結果固定 |
| 盧恩 | 符文、正逆位、seed 一致性 | deterministic seed 測試 | 相同 seed 結果固定 |

## 8. 工程任務拆解

### Sprint 1：手機體驗與流程收斂

- 移除首頁大型 AR 展示，改為今日入口與工具入口。
- 合併 `/mobile` 與主站響應式設計策略。
- 重做底部導覽與手機結果頁。
- 所有工具輸入改用同一個 `BirthInputs` 與地點元件。
- 結果頁統一成摘要、詳細、AR、行動按鈕。

完成定義：

- iPhone 寬度 390px 不溢出。
- Android 寬度 360px 不溢出。
- 桌機寬度 1440px 不空洞。
- 每個工具結果頁都能回到輸入、保存、分享。

### Sprint 2：AR 能力偵測與 fallback

- 建立 `ArCapabilityProvider`。
- 偵測 WebXR、Scene Viewer、Quick Look、LINE browser。
- 沒有 AR 時顯示 3D viewer。
- 3D viewer 也失敗時顯示 2D 高品質圖。
- LINE browser 顯示「用 Safari/Chrome 開啟 AR」。

完成定義：

- iPhone Safari 可進 Quick Look 或清楚顯示原因。
- Android Chrome 可進 Scene Viewer/WebXR。
- LINE 內建瀏覽器不空白、不卡死。
- AR 按鈕只有在可用時才顯示。

### Sprint 3：塔羅與盧恩結果綁定 AR

- 塔羅卡面依抽到的牌動態生成。
- 盧恩石依抽到的符文動態生成。
- 正逆位同步影響 2D、3D、AR 呈現。
- 結果頁 AR 文字與抽牌資料一致。

完成定義：

- 任意 5 張塔羅卡抽出後，3D 卡面都不同。
- 任意 5 個盧恩符文抽出後，石面刻痕都不同。
- 相同 seed 重跑結果一致。
- AR 載入失敗不影響解讀完成。

### Sprint 4：USDZ / iOS 完整支援

- 建立 GLB 到 USDZ 的轉檔流程。
- 每個靜態模型有對應 USDZ。
- 動態卡面與石面需有 iOS fallback 策略。
- 建立 iPhone Safari 實機測試腳本。

完成定義：

- `/ar/*.usdz` 不再 404。
- iPhone Safari 點 AR 可開啟 Quick Look。
- iOS fallback 顯示的卡面資訊與抽牌結果一致。

### Sprint 5：資料驗證與上線儀表板

- 把每項功能 fixture 補齊。
- 建立 `npm run verify:official` 或等效腳本。
- 管理後台顯示每項功能驗證狀態。
- 每次 build 產出測試報告。

完成定義：

- CI 不允許無測試通過。
- 每個工具都有資料驗證報告。
- launch checklist 裡 P0 都是綠燈。

## 9. 美術方向

風格關鍵字：

- 古老藝術
- 神秘學手稿
- 金屬浮雕
- 黑曜石、青金石、羊皮紙、琺瑯、星盤銅件
- 高對比但不刺眼
- 手機可讀，不追求過度裝飾

避免：

- 首頁塞滿裝飾性 AR。
- 只有字體與發光外框。
- 每個功能視覺風格不一致。
- 用英文當主體，中文只當補充。

設計系統：

- 一套中文標題階層。
- 一套卡面/石面/盤面材質語言。
- 一套結果摘要元件。
- 一套 AR 狀態元件：可啟動、僅 3D、需外部瀏覽器、不支援。

## 10. 風險與決策

需要產品決策：

- 是否先支援 Rider-Waite 風格塔羅，或先做自有抽象牌面？
- 塔羅牌面是否使用 AI 生成素材、手繪素材或授權素材？
- 是否接受 iOS 第一版用 3D 預覽 fallback，第二版再補完整 USDZ？
- LINE 登入是否為必須，或只在保存結果時要求？

建議決策：

- 第一版用自有抽象牌面，避免版權風險。
- LINE 登入放在保存與每日推播，不阻擋試用。
- AR 必須先綁結果資料，再追求動畫華麗度。
- iOS USDZ 列 P0，否則不要宣稱「手機 AR 完整支援」。

## 11. 參考官方文件

- model-viewer AR examples：https://modelviewer.dev/examples/augmentedreality/index.html
- model-viewer browser support：https://modelviewer.dev/index.html
- Apple AR Quick Look：https://developer.apple.com/documentation/ARKit/previewing-a-model-with-ar-quick-look
- MDN WebXR Device API：https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API
- LINE LIFF API reference：https://developers.line.biz/en/reference/liff/
