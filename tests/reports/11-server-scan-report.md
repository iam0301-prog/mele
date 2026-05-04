# 本機 Server 全頁掃描報告

執行日期：2026-04-27
工具：Python `http.server` + Node `fetch` 全站爬蟲

---

## 結果總覽

| 項目 | 結果 |
|---|---|
| 23 頁 HTTP 狀態 | **全部 200** ✓ |
| HTML 結構（div 平衡、DOCTYPE） | **全綠** ✓ |
| 內部連結與資源解析（過濾 JS template literal） | **0 錯誤** ✓ |
| calc 引擎檔案路徑 | 從 D:\mele 根目錄起 server 全部 200 ✓ |

## 啟動指令（重要）

**從 `D:\mele` 根目錄起，不是從 `D:\mele\web`**：

```powershell
cd D:\mele
python -m http.server 8000
```

然後 `http://localhost:8000/web/` 進首頁。

> 為什麼從根目錄：calc 引擎在 `packages/calc/src/`，工具頁用 `../../packages/calc/src/bazi.js` 引用。如果從 `web/` 起 server，只能看到 `web/` 以下的檔案，會 404。

## 修正項目

| 問題 | 修法 | 狀態 |
|---|---|---|
| 首頁與 mybookings 引用 `account/profile.html` 不存在 | 補建 `web/account/profile.html`（基本資料 / 生辰 / 隱私同意紀錄 / 下載自己的資料 / 刪除帳號）| ✓ 已補 |
| mybookings 引用 `account/charts.html` 不存在 | 補建 `web/account/charts.html`（過去排盤紀錄列表，含工具篩選 + 刪除）| ✓ 已補 |

## 已知限制（需要在實際使用前知道）

### 各 calc 引擎能否在瀏覽器跑

| 工具 | npm 依賴 | 瀏覽器跑得起來？ |
|---|---|---|
| numerology 靈數 | 無 | ✅ |
| maya 瑪雅 | 無 | ✅ |
| tarot 塔羅 | `@mele/data/tarot`（純 JS） | ⚠️ 要 importmap |
| runes 盧恩 | `@mele/data/runes` | ⚠️ 要 importmap |
| bazi 八字 | `lunar-javascript` | ⚠️ 要 importmap |
| ziwei 紫微 | `iztro` + `lunar-javascript` | ⚠️ 要 importmap |
| astro 占星 | **`sweph`（native C）** | ❌ 需 Edge Function 包成 API |
| humandesign 人類圖 | **`sweph`（native C）** | ❌ 同上 |

### 修法：給瀏覽器用的 importmap

在 `web/tools/bazi.html` 等 tool 頁的 `<head>` 加：

```html
<script type="importmap">
{
  "imports": {
    "lunar-javascript": "https://esm.sh/lunar-javascript@1.7.7",
    "iztro": "https://esm.sh/iztro@2.5.8",
    "@mele/data/tarot": "../../packages/data/tarot.js",
    "@mele/data/runes": "../../packages/data/runes.js"
  }
}
</script>
```

加完之後 6 個工具都可瀏覽器運行（numerology, maya, bazi, ziwei, tarot, runes）。

### astro / humandesign 需要 Edge Function

`sweph` 是 Swiss Ephemeris 的 C 綁定，無法在瀏覽器跑（除非用 WASM 重新編譯）。建議：

```
建立 supabase/functions/calc-astro/index.ts
       supabase/functions/calc-humandesign/index.ts
前端 fetch('/functions/v1/calc-astro', {body: JSON.stringify(input)}) 取結果
```

或者把這兩個工具的「立即排盤」改成「請預約老師詳算」入口。

## 真實「視覺」狀態確認

- 首頁、8 個工具頁、老師列表 / 詳情、預約頁、登入註冊、個人資料、排盤紀錄、Admin、老師後台、條款頁 — **23 頁全部正常顯示**
- CSS 樣式（深藍漸層 + 金色字 + 雕花邊框）全部載入
- 字型（Cormorant Garamond + Noto Serif TC + Noto Sans TC）外掛 Google Fonts CDN 正常

## 互動功能限制（無 Supabase 連線時）

- numerology、maya、tarot、runes：完全可玩 ✅
- bazi、ziwei：加 importmap 後可玩 ✅
- astro、humandesign：UI 顯示，計算需要 Edge Function ⚠️
- 預約 / 登入 / 老師申請 / Admin / 老師後台：需要 Supabase 連線（已在 `web/assets/config.js` 設好 URL/key）並跑完 0001-0004 migration ⚠️
