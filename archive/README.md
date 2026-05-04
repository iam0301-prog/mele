# Archive — 已淘汰的程式碼

此目錄保留舊版本參考用，**不再維護**。新功能請改去 `apps/web/`（Next.js）。

## 內容

### `packages-calc-js/`
JavaScript 版本的 8 個排盤工具計算邏輯，原放於 `packages/calc/`。

**為什麼淘汰**：與 `python_api/engines/` 重複，造成兩邊算法不同步（曾在瑪雅曆神諭板出 bug）。
唯一真實來源（Single Source of Truth）已改為 Python FastAPI。

**保留價值**：
- 178/178 vitest 黃金測試（可作為 Python 端的 reference）
- 部分純前端用案例（AR demo 不需要後端時）
- 算法說明清晰、易閱讀

### `web-static-legacy/`
原本的純靜態 HTML 前端。已被 `apps/web/`（Next.js）完整取代。

**保留價值**：
- 對照 Next.js 頁面與原版 HTML 行為
- 還原原始設計細節時的參考

## 何時刪除？
建議在 Next.js 版本上線、跑滿 1-2 個月、客戶反饋穩定後，永久刪除此 archive 目錄。
