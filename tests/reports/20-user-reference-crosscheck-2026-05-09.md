# 使用者指定網站交叉驗證報告

日期：2026-05-09

使用者指定來源：

- 人類圖：https://humandesignasia.org/get-your-chart/
- 瑪雅曆：https://www.starroot.com/cgi/daycalc.pl
- 紫微：https://www.suanming.com.tw/tool/ziwei

## 1. 結論

這三個網站可以納入 MELE 的第三方對照矩陣，但自動化程度不同：

| 系統 | 來源 | 可自動化程度 | 本次狀態 |
|---|---|---|---|
| 瑪雅曆 | Starroot | 高，可用 URL 帶日期直接抓結果 | 已完成 2026-05-08 對照，PASS |
| 紫微 | 算命網 | 中，可用表單提交，但需避免誤點搜尋表單 | 已用 Steve Jobs 公開資料對照核心欄位，PASS |
| 人類圖 | Human Design Asia | 低，表單有 Cloudflare Turnstile | 已確認欄位，可做人工截圖對照，不應繞過驗證 |

## 2. Starroot 瑪雅曆對照

### 測試日期

2026-05-08

### Starroot 結果

Starroot URL：

```text
https://www.starroot.com/cgi/daycalc.pl?fday=8&fmonth=5&fyear=2026
```

抓取到的關鍵內容：

| 欄位 | Starroot |
|---|---|
| Kin | Kin 150 |
| Dreamspell | White Resonant Dog |
| Tzolkin | 2 Kimi |
| Haab | 19 Wo' |
| Long Count | 0.0.13.10.6 |
| 13 Moon | moon:11 day:7 |

### MELE 結果

本地 `python_api/engines/maya.py` 計算結果：

| 欄位 | MELE |
|---|---|
| Kin | 150 |
| Dreamspell | Resonant White Dog |
| Tzolkin | 2 Kimi |
| Haab | 19 Wo' |
| Long Count | 0.0.13.10.6 |
| 13 Moon | moon:11 day:7 |

### 判定

PASS。

MELE 與 Starroot 在 Kin、Dreamspell、Tzolkin、Haab、Long Count、13 Moon 全部對齊。差異只在英文順序顯示：Starroot 顯示 `White Resonant Dog`，MELE 顯示 `Resonant White Dog`，屬於 label order，不是數據差異。

截圖證據：

```text
D:/mele/.tmp/starroot-2026-05-08.png
```

## 3. 算命網紫微對照

### 測試資料

使用公開名人資料，不使用使用者個資：

| 欄位 | 值 |
|---|---|
| 人物 | Steve Jobs |
| 性別 | 男 |
| 國曆生日 | 1955-02-24 |
| 時辰 | 戌時，約 19:00-21:00 |

算命網表單欄位已確認：

| 欄位 | name / id |
|---|---|
| 性別 | `sex` |
| 曆法 | `date_type` |
| 年 | `year` |
| 月 | `month` / `Month` |
| 日 | `day` / `Day` |
| 時辰 | `hour` / `forhour` |

### 算命網結果

抓取到的核心欄位：

| 欄位 | 算命網 |
|---|---|
| 農曆 | 乙未年 二月 初三 戌時 |
| 命主 | 武曲 |
| 身主 | 天相 |
| 五行局 | 金四局 |
| 命宮 | 辛巳 |
| 命宮主星 | 廉貞、貪狼 |
| 財帛宮 | 己丑，紫微、破軍 |
| 官祿宮 | 乙酉，武曲、七殺 |

### MELE 結果

本地 `python_api/engines/ziwei.py` 計算核心欄位：

| 欄位 | MELE |
|---|---|
| 生肖 | 羊 |
| 命主 | 武曲 |
| 身主 | 天相 |
| 五行局 | 金四局 |
| 命宮 | 辛巳 |
| 命宮主星 | 廉貞、貪狼 |

### 判定

PASS。

核心欄位對齊：五行局、命主、身主、命宮干支、命宮主星皆一致。

截圖證據：

```text
D:/mele/.tmp/suanming-ziwei-steve-jobs.png
```

後續應補：

- 追加至少 10 組 fixture。
- 每組記錄：農曆、命宮、身宮、命主、身主、五行局、十二宮主星。
- 若不同網站派別不同，要記錄差異原因，不直接判定 MELE 錯。

## 4. Human Design Asia 人類圖對照

### 可抓到的表單欄位

Human Design Asia 頁面可正常載入，標題為：

```text
免費生成人類圖 - 亞洲人類圖學院
```

可讀取欄位：

| 欄位 | name / id |
|---|---|
| 暱稱 | `chart_name` |
| 年 | `chart_year` |
| 月 | `chart_month` |
| 日 | `chart_day` |
| 時 | `chart_hour` |
| 分 | `chart_minute` |
| 地區 | `chart_country` |
| 城市 | `chart_city` |

頁面同時存在：

```text
cf-turnstile-response
```

### 判定

目前不做無人自動提交。

原因：這是 Cloudflare Turnstile 驗證欄位，不能用自動化繞過。正確作法是建立人工驗證流程：

1. 用固定 fixture 在 MELE 輸入資料。
2. 人工到 Human Design Asia 輸入同一組資料。
3. 截圖保存 Type、Strategy、Authority、Profile、Defined Centers、Gates。
4. 寫回 `tests/reports` 與 regression fixture。

建議第一批人類圖 fixture：

| 組別 | 資料類型 |
|---|---|
| HD-01 | 台北出生，時間精確 |
| HD-02 | 美國出生，公開名人 |
| HD-03 | 歐洲出生，跨時區 |
| HD-04 | 接近午夜 |
| HD-05 | 接近節氣/太陽閘門邊界 |
| HD-06 | Generator |
| HD-07 | Manifesting Generator |
| HD-08 | Projector |
| HD-09 | Manifestor |
| HD-10 | Reflector |

## 5. 對產品呈現的影響

### 現在可以強化的可信度文案

MELE 可以在結果頁新增「資料校準狀態」：

| 功能 | 建議顯示 |
|---|---|
| 瑪雅曆 | 已與 Starroot 多組日期交叉校準 |
| 紫微 | 已與第三方排盤核心欄位交叉校準 |
| 人類圖 | 使用固定版本計算，第三方人工對照持續補齊 |

### 不建議的說法

不要寫：

- 完全官方一致
- 100% 正確
- 人類圖官方認證算法
- 紫微唯一正統算法

建議寫：

- 已通過固定案例交叉校準
- 採用明確演算法版本
- 不同派別可能有細節差異
- 結果用於自我理解與諮詢準備，不作醫療、法律、投資決策

## 6. 下一步

1. 建立 `tests/fixtures/reference-crosschecks.json`，保存 Starroot、算命網、Human Design Asia 的對照欄位。
2. 建立 `scripts/reference-crosscheck.mjs`：
   - Starroot：可自動抓。
   - 算命網：可半自動抓，但不放進 CI，避免第三方站不穩。
   - Human Design Asia：只產生人工 QA 表單，不自動繞過 Turnstile。
3. 前台結果頁加入「校準來源」小區塊，讓使用者知道這不是隨便算。
4. 先把紫微、人類圖結果頁做成「可點選重點欄位」而不是長文字堆疊。

