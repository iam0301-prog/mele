# 驗證總覽

最後更新：2026-04-27

## 全體測試狀況：178 / 178 ✅

| # | 工具 | 模組 | 測試數 | 演算庫 | 報告 |
|---|---|---|---|---|---|
| 1 | 靈數 | `numerology.js` | 33 | 純 JS | [01](01-numerology.md) |
| 2 | 瑪雅 Kin | `maya.js` | 27 | 純 JS（Dreamspell 公式）| [02](02-maya.md) |
| 3 | 八字 (NEW) | `bazi.js` | 26 | lunar-javascript | [03](03-bazi.md) |
| 4 | 塔羅 + 盧恩 | `tarot.js` + `runes.js` | 30 | 純 JS（Fisher-Yates + crypto）| [04](04-tarot-runes.md) |
| 5 | 占星 | `astro.js` | 22 | sweph (Swiss Ephemeris) | [05](05-astro.md) |
| 6 | 紫微斗數 | `ziwei.js` | 19 | iztro + lunar-javascript（補正八字）| [06](06-ziwei.md) |
| 7 | 人類圖 | `humandesign.js` | 21 | sweph (Swiss Ephemeris) | [07](07-humandesign.md) |

## 演算法分類

### 確定性工具（同一輸入必同一輸出）
靈數、瑪雅、八字、占星、紫微、人類圖 — 全部通過 100 次以上一致性測試。

### 隨機性工具（每次抽牌應隨機）
塔羅、盧恩 — 通過分布健康度（10000 / 5000 次抽牌覆蓋率 100%、正逆位 50/50）+ 種子重現性測試。

## 獨立驗證來源

| 工具 | 公開對照來源 |
|---|---|
| 靈數 | Hans Decoz / Dan Millman 主流派演算法 |
| 瑪雅 | Dreamspell 錨點 1987-07-26 = Kin 34；公開馬雅末日 2012-12-21 = Kin 207 |
| 八字 | 萬年曆 1900-01-01 日柱甲戌、Steve Jobs 1955-02-24 公開記載 |
| 占星 | Astro.com Steve Jobs 公開本命盤、節氣天文事件 |
| 紫微 | iztro 標準庫 + 命宮手算 + 與 BaZi 模組八字交叉驗證 |
| 人類圖 | 數學性質驗證（88° 屬性）+ Ra Uru Hu Mandala 順序 |

## 收費 / 商業考量
- 所有計算 logic 將部署在 **Supabase Edge Functions（後端）**，避免前端被改
- 客戶免費使用簡易版（引流）；老師付費深度諮詢
- 所有 8 個工具的詳細解讀（fortune teller content）由老師後台維護
