# 驗證報告：瑪雅曆 (Mayan Tzolkin / Dreamspell)

**模組**：`packages/calc/src/maya.js`
**測試**：`packages/calc/tests/maya.test.js`

## 演算法
- **體系**：Dreamspell（José Argüelles，當代靈性派；非考古學 GMT correlation）
- **錨點**：1987-07-26 (UTC) = Kin 34 (8 Wizard / 銀河星系 白巫師)
- **公式**：`kin = ((34 - 1 + diff_days) % 260 + 260) % 260 + 1`
- **閏日規則**：預設忽略 Feb 29（Day Out of Time），使其與 Feb 28 同 Kin；可選 `includeLeapDay: true` 讓 Feb 29 推進

## 測試結果

| 類別 | 通過 / 總數 |
|---|---|
| 資料完整性（20 印記 × 13 音調 = 260 唯一）| 3 / 3 |
| 輸入驗證 | 2 / 2 |
| 黃金測試 | 13 / 13 |
| 一致性 | 1 / 1 |
| 260 循環性質 | 3 / 3 |
| 神諭板（Oracle）| 5 / 5 |
| **合計** | **27 / 27 ✅** |

## 獨立驗證來源

| 案例 | 驗證來源 |
|---|---|
| 1987-07-26 = Kin 34 | Dreamspell 錨點定義 |
| 1987-07-25 = Kin 33 | 錨點 - 1（數學） |
| 1987-07-27 = Kin 35 | 錨點 + 1（數學） |
| 2012-12-21 = Kin 207 | 公開歷史對照（馬雅末日） |
| 2013-07-26 = Kin 164 | Yellow Galactic Seed Year 起始 |
| 1988-04-12 = Kin 34 | 一個 260 循環回到錨點（數學）|

## 神諭板（Oracle Board）數學驗證
- **Antipode 挑戰**：seal 差 10、tone 相同 ✓
- **Occult 隱藏**：seals 和 = 21、tones 和 = 14 ✓
- **Guide 引導**：tone 為磁性 (1) 時 guide = self ✓
- **Analog 支持**：對應表已建檔

## 邊界覆蓋
- ✅ 錨點當日、前後一天
- ✅ 跨多個閏年（1900、2000、2024）
- ✅ Feb 29 雙模式（預設合併、可選分流）
- ✅ 未來日期（2030-12-31）
- ✅ 過去日期（1900-01-01）
- ✅ 一致性 100 次迭代

## 已知問題
無。
