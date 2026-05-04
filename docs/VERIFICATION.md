# MELE 驗證機制

最後更新：2026-04-30

## 1. 驗證目標

MELE 的驗證分成四類，不可以混在一起看：

1. 工程可跑：型別、build、路由、API 是否正常。
2. 演算法正確：同一輸入是否得到合理且可重現的結果。
3. 產品可用：手機、結果頁、AR、每日儀式是否清楚。
4. 上線可營運：法務、金流、資料、監控、部署是否可承擔真實使用者。

目前自動化測試可以證明第 1 類與部分第 2 類；第 3、4 類仍需要真機、雲端與人工驗證。

## 2. 現行自動化驗證

| 指令 | 驗證範圍 | 通過標準 |
|---|---|---|
| `npm run type-check` | Next.js TypeScript | 無型別錯誤 |
| `npm test` | 結構檢查 + Python API smoke | `verify-structure` 與 `verify-python-api` 全通過 |
| `npm run build` | Production build | 35 個路由可成功 build |
| `npm run test:sql` | Supabase SQL 靜態檢查 | migrations 可解析並通過 PGlite 檢查 |
| `npm run test:python` | Python 單元測試 | 透過 `requirements-dev.txt` 與可配置 `PYTHON` 執行 pytest |

## 3. 演算法驗證分級

| 工具 | 現況 | 必須保留的限制說明 |
|---|---|---|
| 生命靈數 | 公式型，可重現 | 流派差異小，但文本需避免過度個人化承諾 |
| 馬雅 | 已有多源比對與 oracle 修正 | Maya Guide / Oracle 樣本不足處需列入灰區 |
| 八字 | `lunar-python` 轉換，支援真太陽時經度修正 | 若未納入均時差，需註明可能有分鐘級誤差 |
| 紫微 | 使用 `iztro`，部分四柱用 `lunar-python` 修正 | 需確認主星 placement 是否受內部 lunar date 影響 |
| 占星 | `sweph` 計算 | 高緯度 Placidus 可能失效，需 fallback 策略 |
| 人類圖 / Human Design | `sweph` + commonly cited gate mapping | 非所有 IHDS/Jovian 流派唯一版本 |
| 塔羅 | 資料庫 + seed 抽取 | 牌義文本來源、命理師審稿與版權需建檔 |
| 盧恩 | 資料庫 + seed 抽取 | 符文名稱、材質、文本來源與授權需建檔 |

## 4. 第三方交叉驗證要求

正式公開前，每個確定性工具至少需要：

- 10 組固定人物或公開案例。
- 每組記錄輸入、時區、出生地、資料來源。
- 至少 2 個第三方來源或官方工具交叉比對。
- 若第三方來源互相矛盾，記錄採用規則與原因。

不得只寫「官方一致」，必須留可重跑的測試或人工驗證表。

## 5. 視覺與 AR 驗證

AR 不能只看桌面瀏覽器。

必測裝置：

- iPhone Safari。
- iPhone LINE in-app browser。
- Android Chrome。
- Android LINE in-app browser。
- 桌面 Chrome。

必測項目：

- 塔羅 AR 是否顯示本次抽到的牌名、正逆位與視覺風格。
- 盧恩 AR 是否顯示本次抽到的符文、材質與正逆位。
- 人類圖、八字、紫微、占星、馬雅、靈數是否只在結果頁顯示 AR，不在首頁亂入。
- iOS 若沒有 USDZ，不得宣稱原生 AR 完成，只能宣稱 3D 預覽與 fallback。

## 6. 上線驗證證據

每一次準備發布都應留下：

- 指令輸出：type-check、test、build。
- API ready 截圖或 response。
- Supabase migrations 套用截圖。
- ECPay sandbox 交易編號、webhook log、付款結果頁截圖。
- LINE LIFF / Push 測試紀錄。
- 手機真機截圖。
- 若有素材更新，附授權來源與檔案清單。

## 7. 不可宣稱事項

未完成前不得對外宣稱：

- 「已通過律師審核」：除非真的有律師書面審閱。
- 「iPhone 原生 AR 已完成」：除非 USDZ / Reality 與 iPhone Safari 已測過。
- 「所有算法官方一致」：除非每個工具都有可追溯交叉驗證。
- 「可正式收費上線」：除非金流、退款、刷退、申訴、資料刪除流程皆演練完成。
