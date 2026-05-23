# MELE 本機封測 Smoke Test — 2026-05-17

## 結論

目前本機 production 版封測測試通過，可以進入人工手機測試與正式測試網址部署。

## 測試環境

- Web: http://localhost:3006
- Python API: http://127.0.0.1:8015
- Web 啟動模式: Next production `npm --prefix apps/web run start`
- API 啟動模式: FastAPI / uvicorn
- Playwright: Chromium desktop + mobile

## 已執行測試

### 1. Public smoke

指令：

```bash
npm run ops:smoke:public -- http://127.0.0.1:3006 http://127.0.0.1:8015
```

結果：

- 30 passed / 0 failed
- 首頁、多語系、登入、每日儀式、工具頁、老師頁、老師申請、老師後台、admin launch、manifest、sitemap、robots、favicon 均可連線
- Next.js `/api/calc/numerology` proxy 可正常回傳
- Python API `/ready` 可正常回傳，CORS origin 正常

### 2. Playwright E2E

指令：

```bash
npm run test:e2e
```

結果：

- 42 passed / 0 failed
- Desktop + mobile 均通過
- 覆蓋：
  - 首頁與工具入口
  - 多語系路由
  - 手機選單與語言切換
  - 生命靈數 golden path
  - 空表單 validation
  - 封測首頁 task board / 點數文案 / 視覺資產
  - 本機測試登入後的會員解讀庫與老師後台入口
  - 每日塔羅 / 每日盧恩選擇
  - 塔羅抽牌入口
  - 老師多語系頁面與老師工作台

### 3. 手動 smoke script

指令：

```bash
PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64 \
LD_LIBRARY_PATH=/home/iam03/mele/.playwright-libs/root/usr/lib/x86_64-linux-gnu \
node tmp/closed-beta-manual-smoke.mjs
```

結果：

- OK manual smoke
- Desktop / mobile 核心頁面 required text 通過
- 無 console error / page error
- 生命靈數空送出 validation 通過

截圖輸出：

- `/home/iam03/mele/tmp/tmp/test-screenshots/desktop-_zh-TW.png`
- `/home/iam03/mele/tmp/tmp/test-screenshots/mobile-_zh-TW.png`
- `/home/iam03/mele/tmp/tmp/test-screenshots/desktop-_zh-TW_tools_numerology.png`
- `/home/iam03/mele/tmp/tmp/test-screenshots/mobile-_zh-TW_tools_numerology.png`
- `/home/iam03/mele/tmp/tmp/test-screenshots/desktop-_zh-TW_tools_tarot.png`
- `/home/iam03/mele/tmp/tmp/test-screenshots/mobile-_zh-TW_tools_tarot.png`
- `/home/iam03/mele/tmp/tmp/test-screenshots/desktop-_zh-TW_daily.png`
- `/home/iam03/mele/tmp/tmp/test-screenshots/mobile-_zh-TW_daily.png`
- `/home/iam03/mele/tmp/tmp/test-screenshots/desktop-_zh-TW_account_login.png`
- `/home/iam03/mele/tmp/tmp/test-screenshots/mobile-_zh-TW_account_login.png`

## 測試中發現並已排除的狀況

1. 使用 `127.0.0.1` 時，Next RSC prefetch 會因 `.env.local` 的 site URL 指向 `localhost:3006` 產生跨 origin console error。
   - 解法：人工瀏覽與手動 smoke 統一使用 `http://localhost:3006`。
   - public smoke 用 HTTP request 跑 `127.0.0.1` 仍通過。

2. 未登入狀態進入 `/zh-TW/teacher-portal` 與 `/zh-TW/admin/launch` 會被導到登入入口。
   - 判定正常，代表保護頁沒有裸露。

## 目前可人工測試 URL

- 首頁：http://localhost:3006/zh-TW
- 登入：http://localhost:3006/zh-TW/account/login
- 每日儀式：http://localhost:3006/zh-TW/daily
- 工具列表：http://localhost:3006/zh-TW/tools
- 生命靈數：http://localhost:3006/zh-TW/tools/numerology
- 塔羅：http://localhost:3006/zh-TW/tools/tarot
- 老師列表：http://localhost:3006/zh-TW/teachers
- 老師申請：http://localhost:3006/zh-TW/teachers/apply
- 老師後台：http://localhost:3006/zh-TW/teacher-portal

## 剩餘人工檢查

- 用真手機打開 `http://localhost:3006/zh-TW` 或部署後網址，檢查實際滑動手感與字距。
- 用真 Supabase 測試帳號走：註冊、驗證信、登入、領點、解鎖。
- 若要測正式 OAuth，需先確認 Supabase / Google / LINE callback URL 已設定正式網址。
- 若要測正式金流，需確認 ECPay production key；若只是封測，可先使用免費預約測試模式。
