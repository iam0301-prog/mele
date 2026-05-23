# 多人第三方交叉驗證報告

日期：2026-05-09

本報告延伸 `20-user-reference-crosscheck-2026-05-09.md`，依使用者要求增加多位公開人物案例，確認 MELE 與指定第三方網站是否存在數據落差。

指定來源：

- Starroot Mayan Oracle：https://www.starroot.com/cgi/daycalc.pl
- 算命網紫微：https://www.suanming.com.tw/tool/ziwei
- Human Design Asia：https://humandesignasia.org/get-your-chart/

## 1. 本次結論

| 系統 | 測試人數 | 對照欄位 | 結果 |
|---|---:|---|---|
| 瑪雅曆 / Starroot | 10 | Kin、Dreamspell、Tzolkin、Haab、Long Count、13 Moon | 10 / 10 PASS |
| 紫微 / 算命網 | 5 | 五行局、命主、身主、命宮干支、命宮主星 | 5 / 5 PASS |
| 人類圖 / Human Design Asia | 0 自動提交 | 表單欄位已確認 | 需人工截圖，不繞過 Turnstile |

結論：目前新增案例沒有發現 MELE 與 Starroot / 算命網在核心欄位上的計算落差。人類圖仍需人工 fixture，不能做無人自動提交。

## 2. Starroot 瑪雅曆 10 人對照

Starroot 顯示 Dreamspell 時有時省略顏色，例如 `Rhythmic Wind`，MELE 顯示完整 `Rhythmic White Wind`。本報告把這視為同一組結果，因為 Kin、調性、圖騰與其他曆法欄位一致。

| 人物 | 日期 | Kin | Dreamspell | Tzolkin | Haab | Long Count | 13 Moon | 結果 |
|---|---|---:|---|---|---|---|---|---|
| Steve Jobs | 1955-02-24 | 162 | Rhythmic White Wind | 9 Ajaw | 13 Pax | 12.17.1.6.0 | moon:8 day:18 | PASS |
| Taylor Swift | 1989-12-13 | 124 | Resonant Yellow Seed | 6 Chuwen | 9 Mak | 12.18.16.11.11 | moon:6 day:1 | PASS |
| Elon Musk | 1971-06-28 | 146 | Electric White WorldBridger | 10 Lamat | 16 Sotz' | 12.17.17.16.8 | moon:13 day:2 | PASS |
| Barack Obama | 1961-08-04 | 173 | Self-Existing Red Skywalker | 9 B'en | 11 Xul | 12.17.7.15.13 | moon:1 day:10 | PASS |
| Beyonce | 1981-09-04 | 224 | Electric Yellow Seed | 13 Muluk | 7 Mol | 12.18.8.4.9 | moon:2 day:13 | PASS |
| Audrey Hepburn | 1929-05-04 | 101 | Planetary Red Dragon | 7 B'en | 11 Pop | 12.15.15.2.13 | moon:11 day:3 | PASS |
| Princess Diana | 1961-07-01 | 139 | Solar Blue Storm | 1 Kawak | 17 Sotz' | 12.17.7.13.19 | moon:13 day:5 | PASS |
| Albert Einstein | 1879-03-14 | 260 | Cosmic Yellow Sun | 11 Ajaw | 13 Pax | 12.13.4.5.0 | moon:9 day:8 | PASS |
| Marilyn Monroe | 1926-06-01 | 74 | Solar White Wizard | 5 Chikchan | 18 Wo' | 12.15.12.3.5 | moon:12 day:3 | PASS |
| John Lennon | 1940-10-09 | 114 | Planetary White Wizard | 10 Muluk | 12 Ch'en | 12.16.6.13.9 | moon:3 day:20 | PASS |

驗證證據：

```text
D:/mele/.tmp/expanded-reference-crosscheck-2026-05-09.json
```

## 3. 算命網紫微 5 人對照

算命網只要求性別、國曆/農曆、年月日與時辰，未要求出生地與時區。本次使用公開名人出生資料，將時間轉成對應時辰送入算命網與 MELE。

| 人物 | 日期 / 時辰 | 五行局 | 命主 | 身主 | 命宮 | 命宮主星 | 結果 |
|---|---|---|---|---|---|---|---|
| Steve Jobs | 1955-02-24 戌時 | 金四局 | 武曲 | 天相 | 辛巳 | 廉貞、貪狼 | PASS |
| Albert Einstein | 1879-03-14 午時 | 金四局 | 文曲 | 天同 | 癸酉 | 紫微、貪狼 | PASS |
| Marilyn Monroe | 1926-06-01 巳時 | 土五局 | 貪狼 | 天梁 | 庚子 | 七殺 | PASS |
| John Lennon | 1940-10-09 酉時 | 火六局 | 巨門 | 文昌 | 己丑 | 無十四主星 | PASS |
| Princess Diana | 1961-07-01 戌時 | 火六局 | 廉貞 | 天相 | 丙申 | 武曲、天相 | PASS |

驗證證據：

```text
D:/mele/.tmp/expanded-ziwei-crosscheck-2026-05-09.json
```

## 4. 人類圖下一步

Human Design Asia 的表單已確認，但存在 Cloudflare Turnstile：

```text
cf-turnstile-response
```

因此不應做無人自動提交，也不應嘗試繞過。下一步應建立 10 組人工截圖 fixture：

| 編號 | 類型 | 應保存欄位 |
|---|---|---|
| HD-01 | 台灣出生，時間精確 | Type、Strategy、Authority、Profile、Centers、Gates |
| HD-02 | 美國公開人物 | Type、Strategy、Authority、Profile、Centers、Gates |
| HD-03 | 歐洲公開人物 | Type、Strategy、Authority、Profile、Centers、Gates |
| HD-04 | 接近午夜 | Type、Strategy、Authority、Profile、Centers、Gates |
| HD-05 | 接近閘門邊界 | Type、Strategy、Authority、Profile、Centers、Gates |
| HD-06 | Generator | Type、Strategy、Authority、Profile、Centers、Gates |
| HD-07 | Manifesting Generator | Type、Strategy、Authority、Profile、Centers、Gates |
| HD-08 | Projector | Type、Strategy、Authority、Profile、Centers、Gates |
| HD-09 | Manifestor | Type、Strategy、Authority、Profile、Centers、Gates |
| HD-10 | Reflector | Type、Strategy、Authority、Profile、Centers、Gates |

## 5. 對產品的建議

可以在 MELE 結果頁加入一個小型「校準狀態」區塊：

| 工具 | 建議文案 |
|---|---|
| 瑪雅曆 | 已與 Starroot 多組公開日期交叉校準 |
| 紫微 | 已與第三方紫微排盤核心欄位交叉校準 |
| 人類圖 | 已確認第三方對照流程，人工 fixture 補齊中 |

仍不建議使用「100% 正確」、「唯一官方」、「完全一致」這類文案。比較好的說法是：

> 本結果已通過固定案例交叉校準；不同流派或網站可能因時區、曆法、派別設定而有細節差異。

