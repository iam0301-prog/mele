# 如何執行 命理媒介中心

> ⚠ 注意：專案結構在 2026-04-28 重整。舊的 `web/` 與 `packages/calc/` 已搬到 `archive/` 不再維護。

## 新架構（Next.js + Python FastAPI + Supabase）

```
mele/
├── apps/web/          # Next.js 14 前端 ← 主入口
├── python_api/        # Python FastAPI 算法後端
├── supabase/          # 資料庫 schema + RLS + workflow
├── archive/           # 舊版（純 HTML + JS calc）
└── docs/
```

## 第一次啟動（5 分鐘）

### 1. 確認環境
```bash
node --version    # >= 20
python --version  # >= 3.11
```

### 2. 啟動 Python 後端
```bash
cd python_api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
驗證：開 http://localhost:8000/docs 應該看到 FastAPI 自動文件。

### 3. 啟動 Next.js 前端（另開一個終端）
```bash
cd apps/web
npm install   # 第一次需要
npm run dev
```
驗證：開 http://localhost:3000 應該看到首頁。

### 4. （首次）跑 Supabase migrations
- 開 https://supabase.com → 你的專案 → SQL Editor → New Query
- 依序貼入並 Run：
  1. `supabase/migrations/0001_initial_schema.sql`
  2. `supabase/migrations/0002_rls_policies.sql`
  3. `supabase/migrations/0003_workflow_functions.sql`
  4. `supabase/migrations/0004_p0_fixes.sql`（如有）
- 把自己設成 super admin（換成你的 Email）：
  ```sql
  insert into public.admins (user_id, role)
  select id, 'super' from auth.users where email = '<你的-email>';
  ```

### 5. 測試流程
- 首頁 → 點任何排盤工具（不需登入）
- 註冊帳號（/account/login）
- 登入後右上會看到「★ 後台」（因你是 super admin）
- 模擬：用另一個帳號去 /teachers/apply 送出老師申請 → 切回 super admin 帳號去 /admin/applications 審核

## 部署到 Production

### 前端：Vercel（推薦，免費）
```bash
cd apps/web
npx vercel
# 設定環境變數：
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   MELE_API_URL=https://api.your-domain.com
#   NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 後端：Railway / Fly.io / Render
```bash
cd python_api
# Dockerfile 範例
cat > Dockerfile <<EOF
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV MELE_ALLOWED_ORIGINS="https://your-domain.com"
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
EOF
```

### Supabase：本身就是雲端、不用部署
- 免費 tier（500MB DB / 1GB storage / 50K MAU）對初期足夠
- 升級 Pro $25/月 = 8GB DB / 100GB storage / 100K MAU

## 常用指令

```bash
# 前端
cd apps/web
npm run dev          # 開發模式
npm run build        # 生產 build
npm run type-check   # 純 TypeScript 檢查
npm run lint         # ESLint

# 後端
cd python_api
uvicorn main:app --reload --port 8000   # 開發
uvicorn main:app --host 0.0.0.0 --port 8000   # 部署

# 後端測試
python tests/test_maya_oracle.py
python -m pytest tests/   # 如裝 pytest
```

## 疑難排解

### 前端跳「Python API 是否啟動？」
→ 確認 `uvicorn` 跑在 :8000、開 http://localhost:8000/docs 有反應

### 「無法登入」
→ 確認 Supabase migrations 已跑、Auth 在 Supabase Dashboard 已啟用 Email provider

### 「老師申請送出失敗」
→ 多半是 Storage bucket 沒建。在 Supabase Dashboard → Storage → New bucket → 取名 `teacher-docs` (private)、`avatars` (public)

### Next.js Build 錯誤
→ `cd apps/web && rm -rf .next node_modules && npm install && npm run build`

## 架構圖

```
[使用者 Browser/PWA]
        ↓
[Next.js (Vercel)] ←→ [Supabase Auth + DB + Storage]
        ↓ rewrites /api/calc/*
[Python FastAPI (Railway)] ←→ [計算引擎 (8 工具)]
```

## 為什麼這樣設計？

1. **Next.js 在最前**：負責 SEO、路由、伺服器端渲染、PWA、使用者介面
2. **Python FastAPI 在後**：專注算法（Swiss Ephemeris、lunar、iztro 都是 Python 友善）
3. **Supabase 處理身分 + 資料**：免去自己架資料庫、寫 auth 的麻煩，RLS 比寫 backend 邏輯更穩
4. **Next.js 把 /api/calc/* 代理到 Python**：前端永遠同源、沒 CORS 麻煩
5. **PWA**：手機可加到主畫面、像 App、之後要包 Capacitor 上 App Store 也順
