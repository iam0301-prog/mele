# 官方參考站交叉比對報告 - 2026-05-09

本報告使用公開人物資料，逐筆比對 MELE API 與使用者指定參考站。

## 總覽

| 項目 | 參考站 | 結果 | 備註 |
|---|---|---:|---|
| 瑪雅曆 | https://www.starroot.com/cgi/daycalc.pl | 10 / 10 | 自動抓取 Starroot HTML 並比對 Kin / Tzolkin / Haab / Long Count / 13 Moon |
| 紫微斗數 | https://www.suanming.com.tw/tool/ziwei | 5 / 5 | 自動 POST 表單並比對命主 / 身主 / 五行局 / 命宮 / 主星 |
| 人類圖 | https://humandesignasia.org/get-your-chart/ | manual_fixture_required | 偵測到 Turnstile 時不自動送出，需人工截圖建立基準 |

## 瑪雅曆 / Starroot

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

## 紫微斗數 / 算命網

| 人物 | 日期時間 | 五行局 | 命主 | 身主 | 命宮 | 命宮主星 | 結果 |
|---|---|---|---|---|---|---|---|
| Steve Jobs | 1955-02-24 20:00 | 金四局 | 武曲 | 天相 | 辛巳 | 廉貞、貪狼 | PASS |
| Albert Einstein | 1879-03-14 12:00 | 金四局 | 文曲 | 天同 | 癸酉 | 紫微、貪狼 | PASS |
| Marilyn Monroe | 1926-06-01 10:00 | 土五局 | 貪狼 | 天梁 | 庚子 | 七殺 | PASS |
| John Lennon | 1940-10-09 18:00 | 火六局 | 巨門 | 文昌 | 己丑 | 無十四主星 | PASS |
| Princess Diana | 1961-07-01 20:00 | 火六局 | 廉貞 | 天相 | 丙申 | 武曲、天相 | PASS |

## 人類圖 / Human Design Asia

- 表單偵測：有
- Turnstile / 人機驗證：有，不能自動提交
- 建議：請人工建立 10 組 Human Design Asia 截圖 fixture，再比對 Type、Strategy、Authority、Profile、Centers、Gates。

## 原始 JSON

- D:/mele/.tmp/reference-crosschecks/reference-crosscheck-2026-05-09.json

