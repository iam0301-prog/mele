# MELE 現況問題、官網數據交叉驗證與呈現升級報告

日期：2026-05-08

## 1. 本次結論

MELE 目前已可做封閉測試，主要計算 API、SQL、型別與手機路由 smoke test 都通過。不過若目標是「比其他命理網站更有質感」，仍不能直接對外宣稱完整商用或完整 AR。最大差距不在功能數量，而在三件事：

1. 官方/權威資料驗證還要補成可重跑的報告矩陣，尤其紫微、人類圖、八字細節與占星高緯度。
2. 手機結果頁資訊太長，視覺層級與對比仍不穩，部分區塊有「很豐富但不好消化」的感覺。
3. AR/3D 曾經讓使用者覺得像未完成品，因此現階段應以精緻 2D 盤面/牌面/石面為主，真 AR 只在資產、授權、iOS/Android 真機驗收完成後再升級。

## 2. 本機驗證證據

### ops:verify

`npm.cmd run ops:verify` 已通過：

| 類別 | 結果 |
|---|---:|
| Structure verification | 432 passed / 0 failed |
| Python API verification | 64 passed / 0 failed |
| P0 SQL verification | 59 passed / 0 failed |
| Free booking SQL verification | 7 passed / 0 failed |
| Auth signup SQL verification | 13 passed / 0 failed |

注意：本機 `python_api/venv/Scripts/python.exe` 目前無法啟動，驗證腳本已 fallback 到現有 `http://127.0.0.1:8015` API。這不影響目前測試結果，但正式交接前建議重建 venv 或統一使用專案指定 Python runtime。

### 手機寬度瀏覽器驗證

以 `http://localhost:3006`、430px 手機寬度測試：

| 頁面 | 載入 | 橫向爆版 | Application error |
|---|---|---|---|
| `/mobile` | PASS | 無 | 無 |
| `/daily` | PASS | 無 | 無 |
| `/teachers` | PASS | 無 | 無 |
| `/tools/tarot` | PASS | 無 | 無 |
| `/tools/runes` | PASS | 無 | 無 |
| `/tools/humandesign` | PASS | 無 | 無 |

互動測試：

| 功能 | 結果 |
|---|---|
| 塔羅送出 | PASS，產出結果區 |
| 盧恩送出 | PASS，產出結果區 |
| 人類圖送出 | PASS，產出結果區 |

若使用 `127.0.0.1:3006`，本機會出現 `127.0.0.1` 與 `localhost` 混用造成的 RSC/CORS console noise。建議本機 QA 統一使用 `http://localhost:3006`，或之後調整 middleware / local redirect 策略。

## 3. 官網與權威資料交叉驗證

### 瑪雅曆 / Starroot

Starroot Mayan Oracle 是目前最直接可對照的公開日期頁。2026-05-08 交叉結果：

| 欄位 | MELE 本地計算 | Starroot |
|---|---|---|
| Dreamspell Kin | 150 | 150 |
| Dreamspell | Resonant White Dog | Resonant White Dog |
| Traditional Tzolkin | 2 Kimi | 2 Kimi |
| Haab | 19 Wo' | 19 Wo' |
| Long Count | 0.0.13.10.6 | 0.0.13.10.6 |
| 13 Moon | moon:11 day:7 | moon:11 day:7 |

已保留的 regression：

| 日期 / 人物 | MELE / Starroot 結果 |
|---|---|
| 2026-04-15 | Kin 127, Planetary Blue Hand, 5 Ak'b'al, 16 Pop |
| 2025-10-13 | Kin 203, Galactic Blue Night, 3 Kawak, 17 Yax |
| Steve Jobs, 1955-02-24 | Kin 162, Rhythmic White Wind |
| Taylor Swift, 1989-12-13 | Kin 124, Resonant Yellow Seed |
| Elon Musk, 1971-06-28 | Kin 146, Electric White WorldBridger |
| Barack Obama, 1961-08-04 | Kin 173, Self-Existing Red Skywalker |
| Beyonce, 1981-09-04 | Kin 224, Electric Yellow Seed |

本次也直接執行 `python_api/tests/test_maya_oracle.py`，結果為 `All Maya tests passed [OK]`。

### 占星 / 節氣 / 八字邊界

香港天文台資料說明二十四節氣與太陽黃經有固定角度關係，春分為 0 度、夏至 90 度、秋分 180 度、冬至 270 度；既有報告用 2024 年 HKO 節氣時間比對本地太陽黃經，最大差異約 0.0003 度。

已驗證重點：

| 項目 | 狀態 |
|---|---|
| 2024 立春 315 度邊界 | PASS |
| 立春前後八字年柱切換 | PASS |
| 占星太陽黃經與 HKO 節氣 | PASS |

仍需補強：

- 八字真太陽時目前主要處理經度差，還應補「均時差」選項或明確標註。
- 占星 Placidus 宮位在高緯度可能失效，需加 Whole Sign fallback。

### 塔羅 / Rider-Waite 牌庫

U.S. Games Systems 的 Rider-Waite 牌組資料可驗證 78 張牌組基礎。MELE 目前可驗證：

| 項目 | 狀態 |
|---|---|
| 牌庫 78 張 | PASS |
| deterministic seed 抽牌 | PASS |
| 三種視覺風格 | PASS |

仍需補強：

- 牌義與解讀文本需要明確標註來源：命理老師原創、內部撰寫或 AI 輔助後人工審稿。
- 不應引用或模仿仍受保護的商業牌組插畫。

### 盧恩 / Unicode

Unicode 官方 Runic block 為 U+16A0 到 U+16FF。MELE 目前 Elder Futhark 24 顆符文落在 Runic block，並支援 deterministic seed 抽符文。

仍需補強：

- 符文牌義與中文解讀需要人工審稿。
- 石面、木頭、水晶材質若要正式商用，需要素材授權登錄。

### 紫微 / 人類圖

這兩項沒有單一政府或公開 machine-readable 官方標準，不能用「完全官方一致」這種說法。

建議定位：

| 功能 | 對外說法 |
|---|---|
| 紫微 | 依所選演算法版本與農曆資料產生盤面，並提供派別差異說明 |
| 人類圖 | 使用公開常見錨點與 Swiss Ephemeris 類天文計算，提供系統版本註記 |

仍需補強：

- 紫微至少建立 10 組與指定排盤站/命理師手動確認的 fixture。
- 人類圖至少建立 10 組 Type、Profile、Authority、Centers、Gates fixture，並標註採用哪個系統版本。

## 4. 目前最主要問題

### P0：會影響是否可對外收費

1. Supabase production migrations、RLS、KYC bucket 權限仍需雲端實測截圖。
2. Google / LINE OAuth 需要外部後台正式啟用與 callback 驗證。
3. ECPay sandbox 尚需完整走一次付款、webhook、回跳、重送 webhook。
4. 素材授權表仍有 GLB / 3D / 卡面來源待確認，不可正式商用。
5. iOS USDZ / Android Scene Viewer / LINE WebView 真機 AR 尚未完成正式驗收。

### P1：會影響使用者覺得是否高級

1. 手機工具頁第一屏仍偏空、部分金色文字在淺底上對比不足。
2. 結果頁太長，應改成「摘要、盤面、解析、下一步」分段折疊，不要全部一次堆出來。
3. 人類圖、紫微、馬雅需要更像「有導覽的盤面」，不能只像資料表。
4. 目前 AR 區塊應改名為「立體視覺 / 互動盤面」，等真機 AR 完成後再升級文案。
5. 塔羅與盧恩的視覺已比早期好，但仍要把卡面/石面與解讀更緊密綁定，讓使用者一眼知道「這就是我剛抽到的」。

### P2：會影響長期成長

1. 每個工具缺「官方比對狀態」前台標記，使用者不知道可信度從哪來。
2. 缺「我的歷史命盤」作為回訪中心。
3. 缺分享圖、PDF、小結卡，社群擴散力不足。
4. `globals.css` 過大，長期維護成本高。
5. 前端 e2e 測試仍不足，應把手機主要流程正式納入 `release:check`。

## 5. 要比其他網站更好的呈現方向

其他命理站常見問題是「資料很多、解釋很散、視覺像表格」。MELE 要贏，不能只靠更多文字，應該用以下架構：

1. 第一眼：一句話告訴使用者今天或此命盤的核心主題。
2. 第二眼：一張漂亮且可讀的 2D 盤面、牌面或石面。
3. 第三眼：三個重點解釋，避免一進來就長篇大論。
4. 第四眼：可展開的深度解析，會員點數或老師諮詢再往下接。
5. 第五眼：保存、分享、找老師，讓結果變成下一步行動。

建議先做「精緻 2D 可讀版本」當主介面：

| 功能 | 第一優先呈現 |
|---|---|
| 塔羅 | 本次抽到的三張牌大圖、正逆位、位置意義、重點一句話 |
| 盧恩 | 三顆石面大圖、符文刻痕、材質、今日提醒 |
| 馬雅 | Kin 圖騰主卡 + Oracle 五力圖 + Starroot 對照表 |
| 人類圖 | 2D BodyGraph + 點選中心/通道/閘門說明 |
| 紫微 | 十二宮盤面 + 命宮/身宮/主星優先導覽 |
| 八字 | 四柱卡 + 五行流動圖 + 日主性格與今日建議 |
| 占星 | 星盤輪 + 太陽/月亮/上升三核心 |
| 生命靈數 | 數字主卡 + 人格傾向 + 行動建議 |

## 6. 建議下一步

1. 建立 `verify:official` 腳本，把 Starroot、HKO、牌庫、Unicode、固定 fixtures 統一輸出成一份日期報告。
2. 先重修手機工具頁與結果頁視覺：對比、欄位高度、折疊層級、底部導覽遮擋。
3. 把 AR 文案暫時降級為「立體視覺預覽」，移除讓使用者期待真 AR 的字眼。
4. 補紫微與人類圖的官方/第三方 fixture，不再只用結構測試。
5. 將真機測試拆成 iPhone Safari、iPhone LINE、Android Chrome、Android LINE 四張驗收表。

