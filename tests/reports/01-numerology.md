# 驗證報告：靈數 (Numerology)

**模組**：`packages/calc/src/numerology.js`
**測試**：`packages/calc/tests/numerology.test.js`
**黃金資料**：`packages/calc/tests/golden/numerology.golden.json`
**最後更新**：2026-04-27

## 演算法
- **派系**：Pythagorean (component-reduction)
- **規則**：年/月/日各自先化簡到單位數，保留大師數 (11/22/33)；三者相加再化簡，保留大師數
- **依據**：Hans Decoz / Dan Millman 主流派
- **特性**：100% 確定性（同一輸入必同一輸出）

## 測試結果

| 類別 | 通過 / 總數 |
|---|---|
| 內部 helper（sumDigits / reduceWithMaster）| 5 / 5 |
| 輸入驗證（year/month/day 邊界）| 4 / 4 |
| 黃金測試（已知名人 + 邊界）| 22 / 22 |
| 一致性（同輸入 100 次）| 1 / 1 |
| 黃金套件容量 ≥ 20 | 1 / 1 |
| **合計** | **33 / 33 ✅** |

## 黃金測試案例摘要

| ID | 案例 | 輸入 | 生命靈數 | 天賦數 |
|---|---|---|---|---|
| n-001 | Steve Jobs | 1955-02-24 | 1 | 6 |
| n-002 | Bill Gates | 1955-10-28 | 4 | 1 |
| n-003 | Mark Zuckerberg | 1984-05-14 | 5 | 5 |
| n-004 | Elon Musk | 1971-06-28 | 7 | 1 |
| n-005 | Day master 22 | 1979-11-22 | 5 | **22** |
| n-009 | Leap day → day master 11 | 2024-02-29 | 3 | **11** |
| n-010 | Final master 11 | 2030-03-03 | **11** | 3 |
| n-016 | Triple master 11 → 33 | 2009-11-29 | **33** | **11** |
| n-019 | Final master 11 | 2025-01-01 | **11** | 1 |
| n-020 | Final master 22 | 1979-08-15 | **22** | 6 |

（完整 22 組見 golden JSON）

## 邊界覆蓋
- ✅ 大師數 11、22、33 全部出現（component + final）
- ✅ 閏年 2/29
- ✅ 非閏年 2/29 → 拋例外
- ✅ 月底 31 / 30 日驗證
- ✅ 整數 / 浮點 / 負值輸入 → 拋例外
- ✅ 一致性測試（同輸入 100 次必相同）

## 已知問題
無。
