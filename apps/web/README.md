# 命理媒介中心 — Next.js 前端

Next.js 14 (App Router) + TypeScript + Tailwind + Supabase + PWA。

## 目錄結構

```
apps/web/
├── app/                     # Next.js App Router pages
│   ├── layout.tsx           # 根 layout (header + footer + PWA)
│   ├── page.tsx             # 首頁
│   ├── globals.css          # Tailwind + 共用樣式
│   ├── tools/               # 8 個排盤工具
│   │   ├── numerology/page.tsx
│   │   ├── maya/page.tsx
│   │   ├── bazi/page.tsx
│   │   ├── ziwei/page.tsx
│   │   ├── tarot/page.tsx
│   │   ├── runes/page.tsx
│   │   ├── astro/page.tsx
│   │   └── humandesign/page.tsx
│   ├── teachers/            # 老師媒合
│   │   ├── page.tsx         # 列表
│   │   ├── [id]/page.tsx    # 詳細頁
│   │   └── apply/page.tsx   # 申請表
│   ├── account/             # 客戶帳號
│   │   ├── login/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── charts/page.tsx
│   │   ├── mybookings/page.tsx
│   │   └── book/page.tsx
│   ├── admin/               # 後台
│   │   ├── layout.tsx       # 權限守門 + tab 導覽
│   │   ├── page.tsx         # 統計
│   │   ├── applications/page.tsx
│   │   ├── teachers/page.tsx
│   │   ├── bookings/page.tsx
│   │   └── reviews/page.tsx
│   ├── teacher-portal/page.tsx
│   ├── ar/page.tsx
│   ├── legal/{privacy,tos}/page.tsx
│   └── auth/callback/route.ts  # OAuth callback
├── components/              # React 共用元件
│   ├── Header.tsx           # Server component (auth 狀態)
│   ├── HeaderUserMenu.tsx   # Client component (登出)
│   ├── Footer.tsx
│   ├── ToastProvider.tsx    # Toast 通知系統
│   ├── ToolShell.tsx        # 工具頁外殼 + CTA
│   ├── ToolResult.tsx       # SVG 結果渲染
│   └── ServiceWorkerRegister.tsx
├── lib/
│   ├── api.ts               # Python FastAPI client (calc())
│   └── supabase/
│       ├── client.ts        # 瀏覽器 client
│       ├── server.ts        # SSR client
│       └── middleware.ts    # session refresh
├── types/
│   └── db.ts                # 資料庫型別
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # Service Worker
│   └── icons/               # PWA icons (需自行產出 8 種尺寸)
├── middleware.ts            # 跨頁 session refresh
├── next.config.mjs          # rewrites Python API
├── tailwind.config.ts
├── tsconfig.json
└── .env.local               # 環境變數（不 commit）
```

## 開發

```bash
# 1. 啟動 Python API（另一個終端）
cd ../../python_api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 2. 啟動 Next.js
cd apps/web
npm install
npm run dev
# 開啟 http://localhost:3000
```

## 環境變數（.env.local）

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxx
MELE_API_URL=http://localhost:8000      # 開發：localhost；部署：你的 API domain
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_LIFF_ID=1234567890-AbCdEfGh # LINE LIFF App ID
```

## API 路由設計

前端永遠呼叫 `/api/calc/{tool}` 相對路徑。Next.js `rewrites()` 會：
- 開發：proxy 到 `http://localhost:8000/api/v1/calc/{tool}`
- 部署：proxy 到 `MELE_API_URL/api/v1/calc/{tool}`

好處：前端永遠同源、不會踩 CORS、環境切換無痛。

## PWA

- `public/manifest.json` 已配置（短名「命理中心」、theme #0D1B2A）
- `public/sw.js` 提供 network-first（HTML/API）+ cache-first（靜態）策略
- 使用者可從手機瀏覽器「加到主畫面」
- 離線可用（已快取的頁面）

⚠ 需自行產出 8 個尺寸的 PWA icon 至 `public/icons/`（見該目錄 README）。

## 部署

### Vercel（推薦）
```bash
vercel
# 設定 env vars: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / MELE_API_URL
```

### Cloudflare Pages
```bash
npm run build
# 上傳 .next/ 到 Cloudflare Pages
```

### Build 驗證
```bash
npm run build         # 確認沒有 type error
npm run type-check    # 純型別檢查
```

## 上線營運補件

### LINE / LIFF

1. 在 LINE Developers 建立 LINE Login channel 與 LIFF App。
2. LIFF Endpoint URL 設為正式站點，例如 `https://your-domain.com/daily`。
3. Supabase Auth 的 LINE Provider 開啟後，Callback URL 設為：
   `https://<project-ref>.supabase.co/auth/v1/callback`
4. Vercel/正式環境設定 `NEXT_PUBLIC_LIFF_ID`。
5. 若要每日推播，部署：
   ```bash
   supabase functions deploy line-daily-push --no-verify-jwt
   ```
   並設定 secrets：`LINE_CHANNEL_ACCESS_TOKEN`、`MELE_WEB_URL`、`SUPABASE_SERVICE_ROLE_KEY`。
6. 在 Supabase Scheduled Functions 或外部 cron 每小時呼叫 `line-daily-push`。

### 綠界付款

1. 部署付款建立與 webhook：
   ```bash
   supabase functions deploy ecpay-checkout
   supabase functions deploy ecpay-webhook --no-verify-jwt
   ```
2. 設定 secrets：`ECPAY_MERCHANT_ID`、`ECPAY_HASH_KEY`、`ECPAY_HASH_IV`、`ECPAY_CHECKOUT_URL`、`ECPAY_RETURN_URL`、`MELE_WEB_URL`、`SUPABASE_SERVICE_ROLE_KEY`。
3. 測試付款時先用綠界測試 URL；正式切換到 production URL 前，務必完成金額、訂單狀態、重複 webhook 檢查。

### AR 素材

目前 `public/ar` 已有 `.glb`，Android/Web 3D 可用。程式目前不再把 `ios-src` 指到缺失的檔案，避免 iPhone 使用者點 AR 時遇到 404；沒有專用 `ios-src` 時，model-viewer 會嘗試由 GLB 產生 Quick Look 資產。

正式上架前仍建議匯出專用 `.usdz` 或 `.reality`：

- `tarot-card.usdz`
- `rune-stone.usdz`
- `astral-plate.usdz`
- `human-design-bodygraph.usdz`

等專用檔案齊全後，再把 `ios-src` 接回對應檔案，並用 iPhone Safari 實機驗收。

## 測試

目前 Next.js 端尚無自動測試。算法測試在 `python_api/tests/`。
建議加入：
- E2E：Playwright（測試使用者流程）
- 元件：Vitest + Testing Library
