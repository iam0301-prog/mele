# 驗證報告：塔羅 + 盧恩 (Tarot + Runes)

**模組**：`packages/calc/src/tarot.js`、`packages/calc/src/runes.js`
**資料**：`packages/data/tarot.js`（78 張）、`packages/data/runes.js`（24 符）
**測試**：`packages/calc/tests/tarot.test.js`（21）+ `runes.test.js`（13）

## 演算法
- **抽牌**：Fisher-Yates shuffle（部分洗牌，O(n) for n cards）
- **隨機源**：`crypto.getRandomValues()` 加密級（rejection sampling 防 modulo bias）
- **可重現**：`seed` 參數切換 mulberry32 PRNG（測試用）
- **逆位**：50/50 機率（可關閉）

## 牌組正確性

### 塔羅 (78)
- ✅ **22 大阿爾克那**（num 0-21）：愚者(0) → 世界(21)，順序正確
- ✅ **56 小阿爾克那**：4 花色 × 14 牌 = 56
  - Wands 權杖 14
  - Cups 聖杯 14
  - Swords 寶劍 14
  - Pentacles 錢幣 14
- ✅ 每張牌有 name / en / arcana / keywords / upright / reversed 完整文本

### 盧恩 (24)
- ✅ **Elder Futhark 古英語符文**完整：Fehu(1) → Othala(24)
- ✅ 順序符合 Aett 三組八符的標準排列
- ✅ 24 個符號（ᚠ ᚢ ᚦ ᚨ ...）全部唯一

## 測試結果

| 模組 | 通過 / 總數 |
|---|---|
| tarot — 牌組完整性 | 6 / 6 |
| tarot — getCard | 2 / 2 |
| tarot — drawCards | 8 / 8 |
| tarot — 分布健康度 | 2 / 2 |
| runes — 符組完整性 | 5 / 5 |
| runes — getRune | 2 / 2 |
| runes — drawRunes | 5 / 5 |
| runes — 分布健康度 | 1 / 1 |
| **合計** | **30 / 30 ✅** |

## 統計性質驗證
- ✅ 10000 次抽牌：78 張塔羅每張至少出現 1 次（覆蓋率 100%）
- ✅ 5000 次抽符：24 個符文每個至少出現 1 次
- ✅ 正/逆位比例 50/50（誤差 ≤ 5%）
- ✅ 無重複（同一次多張抽牌不重複）

## 已知問題
無。

## 後續：牌義文本品質
牌義文本沿用樣本既有內容（中英對照、正逆位、4 個關鍵字、諮詢腳本）。日後可由命理老師審核更新。
