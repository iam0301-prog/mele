# 8 工具 × 10 名人 交叉驗證報告

執行日期：2026-04-27
驗證腳本：`python_api/tests/verify_celebrities.py`

---

## 驗證標的（10 位公眾人物，多數為 Astro-Databank Rodden Rating AA 等級資料）

| # | 姓名 | 出生日期 | 出生時間 | 出生地 | 來源 |
|---|------|----------|----------|--------|------|
| 1 | Steve Jobs | 1955-02-24 | 19:15 PST | San Francisco | astro.com AA |
| 2 | Albert Einstein | 1879-03-14 | 11:30 LMT | Ulm, Germany | astro.com AA |
| 3 | Marilyn Monroe | 1926-06-01 | 09:30 PST | Los Angeles | astro.com AA |
| 4 | John Lennon | 1940-10-09 | 18:30 BST | Liverpool, UK | astro.com AA |
| 5 | Princess Diana | 1961-07-01 | 19:45 BST | Sandringham, UK | astro.com AA |
| 6 | Barack Obama | 1961-08-04 | 19:24 AHST | Honolulu, HI | astro.com AA |
| 7 | Nikola Tesla | 1856-07-10 | 00:00 LMT | Smiljan, Croatia | astro.com 自報 |
| 8 | Frida Kahlo | 1907-07-06 | 08:30 LMT | Coyoacán, Mexico | astro.com AA |
| 9 | Mahatma Gandhi | 1869-10-02 | 07:11 LMT | Porbandar, India | astro.com B |
| 10 | Audrey Hepburn | 1929-05-04 | 03:00 CET | Brussels | astro.com AA |

---

## 結果總表

### ① 靈數 Numerology — **10/10 通過 ✓**

| 名人 | LifePath | BirthDay | 結果 |
|---|---|---|---|
| Steve Jobs | 1 | 6 | ✓ |
| Einstein | 6 (生命路徑數 33 大師數化簡為 6) | 5 | ✓ |
| Marilyn Monroe | 7 | 1 | ✓ |
| John Lennon | 6 | 9 | ✓ |
| Princess Diana | 7 | 1 | ✓ |
| Obama | 2 | 4 | ✓ |
| Tesla | 1 | 1 | ✓ |
| Frida Kahlo | 3 | 6 | ✓ |
| Gandhi | 9 | 2 | ✓ |
| Audrey Hepburn | 3 | 4 | ✓ |

**結論**：純算術引擎完全準確，可信。

---

### ② 瑪雅 Maya — **公式已修正 ✓**

| 名人 | Kin | 銀河印記 |
|---|---|---|
| Steve Jobs | Kin 196 | 太陽 黃戰士 |
| Einstein | Kin 222 | 韻律 白風 |
| Marilyn Monroe | Kin 33 | 共振 紅天行者 |
| John Lennon | Kin 114 | 行星 白巫師 |
| Princess Diana | Kin 139 | 太陽 藍風暴 |
| Obama | Kin 173 | 自我存在 紅天行者 |
| Tesla | Kin 43 | 自我存在 藍夜 |
| Frida Kahlo | Kin 194 | 水晶 白巫師 |
| Gandhi | Kin 192 | 行星 黃人 |
| Audrey Hepburn | Kin 101 | 行星 紅龍 |

**修正記錄**：原本「支持」「挑戰」「指引」三個位置公式錯誤（用了英文 Dreamspell 命名習慣，但華人 13 月亮曆名稱對應的是不同公式）。

修正後驗證：
- nung 1996/3/1 → 13 宇宙黃人 ✓
- 指引：黃戰士 ✓
- 支持：白風 ✓
- 挑戰：藍手 ✓
- 隱藏：紅月 ✓

**Gandhi 是 Kin 192（行星黃人）**，神諭板與你的相同（同樣是黃人為本命）。

---

### ③ 八字 BaZi — 需要 sxtwl，本機可跑

引擎用 **sxtwl 2.0.7**（壽星天文曆，6tail 維護，與 lunar-javascript 同源 C++）。
這是業界最廣泛使用的中文農曆 / 八字計算庫，原始算法經中科院驗證。

**手動交叉驗證建議**：
1. 訪問 [元亨利貞網](http://www.china95.net/paipan/bazi/index.asp) 或 [玄空命理線上排盤](http://destiny.to)
2. 用相同生辰
3. 比對年月日時 4 柱

對名人，因為許多西方名人沒有「精確時辰」（多為 GMT 半小時整點），預期可能因子時邊界差 1 個時辰柱。

**Steve Jobs 1955-02-24 19:15 (PST=GMT-8) 換算 GMT 1955-02-25 03:15**：
- 在中國時區轉成 1955-02-25 11:15 CST
- 預期八字（lunar-javascript 算）：年 乙未、月 戊寅、日 庚午、時 壬午
- 你本地跑 API 應該得到相同結果

---

### ④ 紫微斗數 Ziwei — **本平台目前為簡化版** ⚠️

**本實作侷限**：
- ✓ 有命宮 / 身宮
- ✓ 12 宮位排列
- ✓ 五行局
- ✗ **沒有 14 主星安星**
- ✗ 沒有六十甲子完整對照
- ✗ 沒有大限 / 流年

**為什麼**：完整紫微算法（紫微在子丑寅卯辰巳午未申酉戌亥逐宮排，按五行局起紫微，再依六甲子定主星）需要實作 200+ 行邏輯，目前 ziwei.py 只有 100 行。

**建議**：
1. **短期**：頁面顯示「紫微基本盤，完整 14 主星請預約老師」，主推諮詢入口
2. **長期**：移植 [iztro Python 版](https://github.com/SylarLong/iztro) 或自己寫完整 plus 60 輔星

---

### ⑤ 西洋占星 Astro — 需 pyswisseph，本機可跑

引擎用 **pyswisseph 2.10.3**，是 Swiss Ephemeris 官方 Python 綁定。
Swiss Ephemeris 是 astro.com（Astrodienst）使用的同一個天文曆，誤差 < 10 角秒。

**Princess Diana 預期值**（astro.com）：
- ☉ Sun: Cancer 9°37' (in 7th house)
- ☽ Moon: Aquarius 25°02' (in 2nd house)
- ⬆ Asc: Sagittarius 18°24'
- ☿ Mercury: Cancer 3°
- ♀ Venus: Taurus 24°
- ♂ Mars: Virgo 1°

**Steve Jobs 預期值**（astro.com）：
- ☉ Sun: Pisces 5°
- ☽ Moon: Aries 7°
- ⬆ Asc: Virgo 25°
- 太陽宮位：6th
- 月亮宮位：7th

**Marilyn Monroe**：
- ☉ Sun: Gemini 10°26'
- ☽ Moon: Aquarius 19°
- ⬆ Asc: Leo 13°
- ♀ Venus: Aries 28°

**驗證方法**：
1. 打開 http://localhost:8001/web/tools/astro.html
2. 填 Diana 的生辰：1961-07-01 19:45，緯度 52.83，經度 0.51，時區 +1
3. 比對結果是否與上面 Diana 的官方值一致（誤差應 < 1°）

---

### ⑥ 人類圖 Human Design — 需 pyswisseph

引擎用同一個 pyswisseph，計算意識（Personality）+ 潛意識（Design = 太陽前 88°）26 個閘門。

**Steve Jobs 預期值**（jovianarchive.com）：
- 類型：**Generator**（生產者）
- Profile：**6/2** 或 **6/3**（不同來源略異）
- 內在權威：**Sacral**（薦骨）

**驗證方法**：
1. 打開 http://localhost:8001/web/tools/humandesign.html
2. 填 Steve Jobs 1955-02-24 19:15，時區 -8
3. 應該看到 Type = Generator，Profile = 6/3 (或 6/2)

如果結果是 Manifestor 或 Reflector，那就是計算出問題；如果是 Projector，可能是 motor-to-throat 判定錯誤。

---

### ⑦⑧ Tarot / Runes — **隨機抽牌，無「正確答案」**

驗證重點是**牌庫資料完整性**：
- 塔羅 78 張：22 大阿爾克那 + 56 小阿爾克那（權杖/聖杯/寶劍/錢幣 各 14 張）✓
- 盧恩 24 個：Elder Futhark 完整字母 ✓
- seed 一致性：相同 seed 抽出相同牌組 ✓
- 正逆位 50/50 隨機 ✓

每張牌 / 符文都有：中文名、英文名、關鍵字（5 個）、正位文字、逆位文字。

---

## 整體結論

| 工具 | 數據準確度 | 動畫品質 | 建議 |
|---|---|---|---|
| 靈數 | ✅ 100% | 7/10 | 數據可信，動畫可加大師數特效 |
| 瑪雅 | ✅ 已修正 | 7/10 | 新公式驗證通過 |
| 八字 | 🟡 待你本機跑 | 6/10 | 演算法用業界標準，柱位呈現可加干支關係連線 |
| 紫微 | 🟠 簡化版 | 5/10 | **需大改**：補完 14 主星，否則建議改成「諮詢用簡圖」並導流老師 |
| 占星 | 🟡 待你本機跑 | 8/10 | 用 Swiss Ephemeris，理論上 = astro.com，動畫 OK |
| 人類圖 | 🟡 待你本機跑 | 7/10 | 通道發光動畫 OK，可補閘門點擊展開 |
| 塔羅 | ✅ 牌庫完整 | 8/10 | 翻牌動畫不錯 |
| 盧恩 | ✅ 牌庫完整 | 7/10 | 石頭浮現動畫 OK |

---

## 你現在要做的事

### 1. 重啟 API（讓 Maya 修正生效）
在 `Mele API` 那個 cmd 視窗按 Ctrl+C，然後：
```
python -m uvicorn main:app --reload --port 8000
```

或直接重跑 `START_HERE.bat`（會自動重啟）。

### 2. 重新測 Maya
http://localhost:8001/web/tools/maya.html
填 1996/3/1 → 應該看到：
- 本命：宇宙 黃人
- 指引：宇宙 黃戰士
- 支持：宇宙 白風
- 挑戰：宇宙 藍手
- 隱藏：磁性 紅月

### 3. 跑全 10 名人驗證腳本
```
cd D:\mele\python_api
venv\Scripts\activate
python tests/verify_celebrities.py
```

### 4. 重點手動比對占星
打開 astro.html，輸入 **Princess Diana** 1961-07-01 19:45 / 52.83° / 0.51° / 時區+1
- 太陽應該在巨蟹 9° 左右
- 月亮應該在水瓶 25° 左右
- 上昇應該在射手座

如果差超過 1°，告訴我哪個行星差多少，我來修。

---

## 下一步建議

P0（馬上做）：
- [ ] 重啟 API 確認 Maya 修正生效
- [ ] 跑 10 名人腳本，列出 4 個需 sxtwl/pyswisseph 工具的實際輸出，貼回來給我比對

P1（找老師後再加強）：
- [ ] 紫微 14 主星完整安星
- [ ] 動畫品質提升（你說「動畫不行」，請告訴我哪幾個工具動畫看起來假/醜，我加強）

---

## Sources

- [Princess Diana - Astro-Databank](https://www.astro.com/astro-databank/Diana,_Princess_of_Wales)
- [Princess Diana Birth Chart Analysis - Revellia](https://www.revellia.com/diana-princess-of-wales-comprehensive-birth-chart-analysis/)
- [Steve Jobs Birth Chart - Astrotheme](https://www.astrotheme.com/astrology/Steve_Jobs)
- [Steve Jobs Human Design](https://flowwithhumandesign.com/chart/steve-jobs-human-design/)
- [Steve Jobs - Astro-Databank](https://www.astro.com/astro-databank/Jobs,_Steve)
