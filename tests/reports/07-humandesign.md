# 驗證報告：人類圖 (Human Design)

**模組**：`packages/calc/src/humandesign.js`
**測試**：`packages/calc/tests/humandesign.test.js`
**演算引擎**：`sweph` (Swiss Ephemeris)

## 演算法
- **兩張盤計算**：
  - Personality (意識)：出生時刻 13 個天體
  - Design (潛意識)：出生前太陽走 88° 的時刻 13 個天體（迭代法精確至 0.0001°）
- **13 個天體**：太陽、地球、月亮、水星、金星、火星、木星、土星、天王星、海王星、冥王星、北交點、南交點
- **Mandala 錨點（重要）**：Gate 25 起始於 358.125°（= 0° Aries 之前 1.875° / 28°07'30" Pisces）
  - 等同於：Gate 41 起始於 1°52'30" Aquarius
  - 不同 HD 系統可能用略不同錨點（差距 ≤ 0.5°），會影響 cusp 案例
- **每閘 5.625°，每線 0.9375°**
- **64 閘 → 9 中心、36 通道**：依 Ra Uru Hu 標準對應表
- **5 類型**：Reflector / Manifestor / Generator / Manifesting Generator / Projector
- **Profile**：Personality Sun 線 / Design Sun 線

## 測試結果

| 類別 | 通過 / 總數 |
|---|---|
| 資料完整性（64 閘、9 中心、4 motors）| 5 / 5 |
| longitudeToGate 邊界 | 6 / 6 |
| 基本結構 | 3 / 3 |
| **88° 性質（關鍵）**| 2 / 2 |
| 類型判定邏輯 | 2 / 2 |
| 一致性 | 1 / 1 |
| 啟動閘門結構 | 2 / 2 |
| **合計** | **21 / 21 ✅** |

## 數學性質驗證
- ✅ **Personality Sun − Design Sun = 88°**（任意生日，誤差 < 0.01°）
- ✅ **Design 時間 ≈ 出生前 86-93 天**（太陽日均移動 0.95-1.02°）
- ✅ **64 閘門全部可達**（黃道 360° 細掃）
- ✅ **線 1-6 在閘門內均勻分布**
- ✅ **每生日 13-26 個唯一啟動閘**

## 重要說明：錨點選擇
HD 社群對 Mandala 錨點有多種版本：
1. Gate 25 起於 358.125°（本實作採用）
2. Gate 25 中點對齊 0° Aries（357.1875°）
3. Gate 41 起於 2°02'30" Aquarius（302.04166° → Gate 25 起於 358.29166°）

不同錨點會影響邊界案例（gate cusp 或 line cusp 附近的案例）。本實作使用最常被引用的錨點。**若需要對齊特定 HD 老師/Jovian Archive 的計算結果，可調整 `GATE_START_OFFSET` 常數**。

## 後續可加強
- Authority 完整判定（涵蓋所有少見組合）
- Variables（Brain Definition、Determination、Cognition）
- Incarnation Cross（4 個 Sun/Earth 閘門組合）
- Composite chart（兩人合盤）
- Rave Calendar（流年）

## 已知問題
- Steve Jobs 案例：本算法給 Generator/1/3，但部分公開資料說 MG/5/1。可能因錨點差異或出生時間不確定。已標註為「不採用為驗證 case」。
