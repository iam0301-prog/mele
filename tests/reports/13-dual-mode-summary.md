# 雙模式呈現完成總結

執行日期：2026-04-27
兩種會員體驗：**手機 / 電腦版（PWA）** + **AR 立體呈現（WebXR）**，打同一組 Python API。

---

## 模式 A：手機 / 電腦版（PWA）

### 加強項目
- `web/manifest.json` — Web App Manifest，可「加入主畫面」
- `web/assets/icon-192.svg` / `icon-512.svg` — 應用圖示（金色「命」字）
- `web/sw.js` — Service Worker（離線快取 + 靜態資源 stale-while-revalidate）
- `web/index.html` 增補：
  - `<meta theme-color>` / `apple-touch-icon` / `apple-mobile-web-app-capable`
  - 雙模式入口按鈕（網頁體驗 / AR 立體呈現）
  - 註冊 Service Worker
  - 手機版 RWD（@media max-width 640px）：tools-grid 2 欄、字級縮放、user-bar 縮小

### 使用體驗
- iOS Safari：點分享 → 加入主畫面，全螢幕無瀏覽器列、保留導航手勢
- Android Chrome：彈出「安裝 App」提示
- 桌面 Chrome：網址列右側出現安裝圖示
- 離線時可看靜態頁（運算需要連 Python API，這個本來就需要連線）

### 入口
`https://你的網址/` → 首頁有兩個大按鈕

---

## 模式 B：AR 立體呈現（WebXR + A-Frame）

### 檔案
- `web/ar/index.html` — AR 工具選擇頁（8 個工具卡片）+ 裝置支援偵測
- `web/ar/scene.html` — 統一 A-Frame 場景（依 `?tool=...` 參數呈現對應工具）

### 技術選型
- **A-Frame 1.5.0** — Mozilla 開源，Three.js 上層的宣告式 HTML 框架
- **WebXR API** — Chrome / Safari / Edge 的標準 AR/VR 介面
- **CDN 載入**（jsdelivr），無需本機安裝 npm

### 流程
1. 點 `web/ar/` 選擇工具 → 進 `scene.html?tool=xxx`
2. 填生辰資料（與網頁版同樣的表單）
3. 按「進入 AR ›」→ 呼叫 `POST /api/v1/calc/xxx`
4. 回傳的 `render.svg` 轉 base64 data URL，貼在 A-Frame `<a-image>` 上
5. 主命盤緩慢旋轉（60 秒一圈）
6. `render.palette` 自動建 6 顆環繞發光球（命盤周圍上下浮動）
7. 底部 HUD：
   - **🔊 朗讀**：`render.speech` 用 Web Speech API TTS 朗讀
   - **重置視角**：回到預設拍攝角度
   - **找老師深聊**：跳轉媒合頁
8. 偵測到 `immersive-ar` 支援時，自動加「⊹ 進入 AR」按鈕（觸發手機後鏡頭沉浸式 AR）

### 自動 fallback
- 不支援 WebXR 的裝置（如桌面 Chrome）→ 自動退化成 3D 預覽（滑鼠拖曳轉視角）
- 支援 WebXR 但只有 VR、不支援 AR → 仍可進入 3D 場景，banner 提示

### 入口
`https://你的網址/ar/` 或從首頁「AR 立體呈現」按鈕

---

## 統一的後端：Python FastAPI

兩種模式都打同一組端點：

```
POST /api/v1/calc/numerology
POST /api/v1/calc/maya
POST /api/v1/calc/bazi
POST /api/v1/calc/ziwei
POST /api/v1/calc/tarot
POST /api/v1/calc/runes
POST /api/v1/calc/astro
POST /api/v1/calc/humandesign
```

回應一致：`{tool, version, computed_at, input, data, render: {svg, html, palette, animations, speech}}`

**未來 iOS / Android 原生 App 也用同一組端點**，AR 客戶端取 `data` 自行用 RealityKit / ARCore 渲染、用 `palette` 配材質、用 `speech` 給 TTS。

---

## 完整啟動流程（你的電腦）

### 1. 啟動 Python API
```powershell
cd D:\mele\python_api
start.bat       # Windows 雙擊就好
```
或：
```bash
cd D:\mele\python_api
./run.sh        # Linux/macOS
```
API 在 `http://localhost:8000`，文件在 `http://localhost:8000/docs`。

### 2. 啟動前端 server
```powershell
cd D:\mele
python -m http.server 8001
```
**注意：要從 D:\mele 根目錄起，不是從 web/，否則 packages/ 會 404。**

### 3. 訪問
- 手機 / 電腦版：`http://localhost:8001/web/`
- AR 模式：`http://localhost:8001/web/ar/`
- API 文件：`http://localhost:8000/docs`

### 4. 手機測試 AR
讓手機與電腦在同一 Wi-Fi，用 PowerShell `ipconfig` 找電腦 IP（如 192.168.1.10），手機開 `http://192.168.1.10:8001/web/ar/`

> AR 需要 HTTPS 才能用 WebXR 完整 immersive-ar。本機測試 fallback 為 3D 預覽。
> 部署到 Vercel / Netlify / Cloudflare Pages 後自動有 HTTPS，手機就能完整 AR。

---

## 已完成檔案清單（雙模式相關）

```
web/
├── manifest.json                    ← PWA 配置
├── sw.js                            ← Service Worker
├── index.html                       ← 加雙模式入口 + PWA tags + RWD
├── assets/
│   ├── icon-192.svg                 ← App 圖示
│   ├── icon-512.svg                 ← App 圖示（高解析）
│   └── mele-api.js                  ← 共用 API client
└── ar/
    ├── index.html                   ← AR 工具選擇 + 裝置支援偵測
    └── scene.html                   ← A-Frame AR 場景（8 工具共用）
```

---

## 後續可加值

- [ ] AR 更精緻 3D 模型（替代現在用 SVG 平面貼圖）— 為各工具設計專屬 3D 物件
- [ ] 8th Wall / Niantic Lightship 接 marker-based AR（不需 WebXR 也能用）
- [ ] 原生 iOS App 用 SwiftUI + RealityKit 接同一 API
- [ ] 原生 Android App 用 Jetpack Compose + ARCore 接同一 API
- [ ] AR 結果可截圖分享（Web Share API）
- [ ] 離線預載 calc 引擎（PWA 加 Background Sync）
