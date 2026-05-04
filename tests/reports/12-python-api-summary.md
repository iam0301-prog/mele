# Python API 落實總結

執行日期：2026-04-27

## 完成項目

### 後端
- `python_api/main.py` — FastAPI 入口，8 個 `/api/v1/calc/*` 端點 + `/health` + `/docs`
- `python_api/models.py` — Pydantic v2 schemas（請求 + 統一回應外殼）
- `python_api/engines/` — 8 個計算引擎
  - `numerology.py` 純 Python，含大師數（11/22/33）偵測
  - `maya.py` 純 Python，260 Kin + 5 kin 神諭板
  - `bazi.py` 用 sxtwl（lunar-javascript 同源）
  - `ziwei.py` 簡化 12 宮位 + 命/身宮
  - `tarot.py` secrets 加密級隨機，seed 可重現
  - `runes.py` 同上，24 Elder Futhark
  - `astro.py` pyswisseph，10 行星 + 12 宮位
  - `humandesign.py` pyswisseph，26 啟動 + 9 中心 + 5 類型
- `python_api/renderers/` — 8 個活靈活現 SVG 渲染器
  - 每個都含 CSS `@keyframes` 動畫（fadeIn / spin / pulse / flip / drawLine / glow）
  - 輸出 `palette`（給 AR 材質）+ `speech`（給 TTS 旁白）+ `animations`（時間軸）
- `python_api/data/tarot.json` — 78 張完整 Rider-Waite（從 JS 自動萃取）
- `python_api/data/runes.json` — 24 個 Elder Futhark
- `python_api/data/build_data.py` — 一次性 JS→JSON 轉換腳本

### 前端串接
- `web/assets/mele-api.js` — 共用 API client（calc / mountResult / showLoading / showError / recordChart）
- `web/assets/config.js` — 加 `apiUrl` 設定
- 8 個 tool 頁全部改用 `import { calc } from '../assets/mele-api.js'` 打 Python API：
  - 顯示載入過場動畫
  - SVG 結果淡入
  - 失敗顯示友善錯誤
  - 自動寫入 Supabase chart_records

### 部署
- `python_api/requirements.txt` — fastapi 0.115 / uvicorn / pydantic 2 / pyswisseph / sxtwl
- `python_api/start.bat` — Windows 雙擊啟動，自動建 venv + 裝套件
- `python_api/run.sh` — Linux/macOS 一鍵啟動
- `python_api/Dockerfile` — 容器部署

### AR / Mobile 整備
- `python_api/AR_API_SPEC.md` — 完整 API 規格 + 各端點 schema + Swift / Unity / C# 範例
- 自動 OpenAPI（FastAPI 內建）at `/docs` 與 `/openapi.json`
- 統一回應外殼：`{tool, version, computed_at, input, data, render: {svg, html, palette, animations, speech}}`
- AR 取 `data` 自行 3D 渲染、用 `palette` 配材質、用 `speech` 給 TTS
- CORS 已開（部署時建議鎖網域）

## 測試

### 純 Python 引擎測試（不需 native libs）
**23 / 23 通過**
- numerology：lifePath / birthDay / 大師數偵測 / SVG 含 fadeIn / palette / speech
- maya：kin 範圍 / seal+tone / 5 oracle kin / SVG 含 spin
- tarot：78 張完整 / seed 一致性 / 抽 1-10 張 / SVG 含 flip
- runes：24 個完整 / 抽 3 / 5 個 / SVG 渲染
- 邊界：count=0 / 超過牌數 → 拋 ValueError

### 需要 native libs 才能跑（pyswisseph / sxtwl）
- bazi、ziwei、astro、humandesign：在你電腦 `pip install -r requirements.txt` 後跑
  `python tests/test_endpoints.py` 一次驗證

## 啟動

**Python API**（雙擊 Windows 上的 `python_api/start.bat`）：
- API：http://localhost:8000
- 互動測試：http://localhost:8000/docs

**前端**（從 D:\mele 根目錄起 server）：
```powershell
cd D:\mele
python -m http.server 8001
```
然後 `http://localhost:8001/web/`

兩個 server 同時跑，前端 `config.js` 已設好打 `localhost:8000`。

## 架構圖

```
[會員瀏覽器]              [未來 AR app / iOS / Android]
      │                            │
      └────────  HTTP/JSON  ───────┘
                     │
                     ▼
        Python FastAPI (port 8000)
        ┌──────────────────────────┐
        │  /api/v1/calc/{tool}     │
        │  ├ engines/  (純計算)    │
        │  └ renderers/ (SVG+CSS)  │
        └──────────────────────────┘
                     │
                     ▼
        Supabase (用戶 / 老師 / 預約)
```

## 下一步建議

- [ ] Python API 部署到 Railway / Render（免費 tier 足夠初期）
- [ ] 加 rate limiting（slowapi 或 Cloudflare）
- [ ] AR app 開發時，OpenAPI 直接 `swift-openapi-generator` 或 `openapi-generator` 產 client SDK
- [ ] 把 ziwei 換成 py-iztro 或寫完整 14 主星規則
- [ ] 各 tool 頁加上「分享圖片下載」（用 SVG → PNG）
