# 命理媒介中心 (Mele)

> 客戶免費簡易排盤 → 想要詳解就預約平台老師。
> 收費僅維持網站運作，不以營利為目標。

## 架構（2026-04-28 重整版）

```
mele/
├── apps/web/             # Next.js 14 前端 (TypeScript + Tailwind + PWA)
│   ├── app/              # App Router 路由 (8 工具 + 老師媒合 + 帳號 + 後台 + 老師後台 + AR + 法務)
│   ├── components/       # React 元件
│   ├── lib/              # API client + Supabase clients
│   └── public/           # PWA manifest + Service Worker
│
├── python_api/           # Python FastAPI 算法後端
│   ├── engines/          # 8 個排盤算法（唯一真實來源）
│   ├── renderers/        # SVG + HTML 渲染器
│   └── tests/            # pytest
│
├── supabase/             # 資料庫 / 認證 / Storage
│   ├── migrations/       # PostgreSQL schema + RLS + workflow functions
│   └── functions/        # Edge Functions (ECPay webhook 等)
│
├── archive/              # 舊版（純 HTML + JS calc，已淘汰）
├── docs/                 # 架構與驗證文件
└── tests/reports/        # 8 個工具的驗證報告
```

## 技術棧

| 層 | 技術 | 為什麼 |
|---|---|---|
| 前端 | Next.js 14 + TypeScript + Tailwind | App Router、SSR、PWA、最大生態 |
| UI/UX | Tailwind + 自訂 mele-* 元件 | 設計系統一致、bundle 小 |
| 後端算法 | Python FastAPI | Swiss Ephemeris、lunar、iztro 都是 Python 友善 |
| 認證 + DB | Supabase | RLS、Auth、Storage、Realtime 全包 |
| 金流 | 綠界 ECPay (webhook) | 支援台灣常用支付 |
| 部署 | Vercel + Railway + Supabase Cloud | 免運維 |
| 行動 | PWA → 之後 Capacitor → App Store | 漸進式升級 |

## 8 個排盤工具

| 工具 | Python 引擎 | 演算庫 | 驗證報告 |
|---|---|---|---|
| 靈數 | `engines/numerology.py` | 純算 (Pythagorean) | [01](tests/reports/01-numerology.md) |
| 瑪雅 | `engines/maya.py` | Dreamspell 公式 | [02](tests/reports/02-maya.md) |
| 八字 | `engines/bazi.py` | lunar-python | [03](tests/reports/03-bazi.md) |
| 塔羅+盧恩 | `engines/tarot.py` + `runes.py` | crypto random | [04](tests/reports/04-tarot-runes.md) |
| 占星 | `engines/astro.py` | pyswisseph | [05](tests/reports/05-astro.md) |
| 紫微斗數 | `engines/ziwei.py` | iztro + lunar-python | [06](tests/reports/06-ziwei.md) |
| 人類圖 | `engines/humandesign.py` | pyswisseph | [07](tests/reports/07-humandesign.md) |

## 開始開發

請看 [HOW_TO_RUN.md](HOW_TO_RUN.md)。簡版：
```bash
# 終端 1
cd python_api && uvicorn main:app --reload --port 8000

# 終端 2
cd apps/web && npm install && npm run dev
```

開 http://localhost:3000

## 後端與 Auth 驗收

- 後端完整規劃：[Backend Blueprint](docs/BACKEND_BLUEPRINT.md)
- Supabase 設定指南：[Supabase 白話設定指南](docs/SUPABASE_SETUP_GUIDE.md)
- 驗證信排查：[Supabase Auth Email Runbook](docs/SUPABASE_AUTH_EMAIL_RUNBOOK.md)
- Google / LINE 登入：[Google and LINE Login Runbook](docs/OAUTH_LOGIN_RUNBOOK.md)

本機檢查 Supabase Auth 公開設定：

```bash
npm run ops:check-auth
```

## 老師審核流程（5 階段）

```
pending → reviewing → revision (補件)
       → interview → contracted → active (上架)
       → rejected (終端) / paused / suspended
```

每次狀態變更寫入 `teacher_review_log`（稽核日誌），管理員與老師雙方可查。

## 客戶體驗特色

- ✅ 8 個排盤工具免費使用
- ✅ 預約自動帶簡易排盤 → 老師打開即看到
- ✅ 免費追問 1 次（諮詢結束 7 天內）
- ✅ 靜默評價（評但不顯示客戶名）
- ✅ 24h 取消全退、24h 內 50%、開始後不退
- ✅ PWA 可加到手機主畫面，類 App 體驗

## 收費模式

| 項目 | 政策 |
|---|---|
| 排盤工具 | 永久免費 |
| 老師預約 | 老師自訂價（30-90 分鐘 NT$ 800-3000） |
| 平台抽成 | 預設 10%（業界平均 20-30%） |
| 退款 | 24h 全退、24h 內 50%、開始後不退、老師取消 100% 退 |
| 付款 | 綠界 ECPay 串接（信用卡 / ATM / LINE Pay 等） |

## 商業模式定位

> 「收費只為了讓網站運作，不以營利為目標。」

- 平台不賣廣告、不操作演算法推薦、不偏袒任一老師
- 老師審核重質不重量（5 階段 + 試講）
- 客戶資料不外流，KYC 文件 90 天自動清除

## 下一步

- [ ] 串接 LINE LIFF 小程式
- [ ] Capacitor 包裝上 App Store / Google Play
- [ ] 老師後台增加自助管理服務 / 時段
- [ ] 諮詢結束自動寄重點摘要 PDF
- [ ] AR 諮詢室（WebXR + Babylon.js）
- [x] e2e 測試（Playwright：首頁、每日儀式、會員解讀庫、老師後台、工具主路徑）
- [ ] 月結批次（pg_cron 自動撥款）

## License

私有專案，未經授權禁止使用。
