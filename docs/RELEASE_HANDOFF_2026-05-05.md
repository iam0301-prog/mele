# 海底之星 MELE 發布交付手冊

更新日期：2026-05-05

## 目前交付狀態

這版已整理成可交付的封閉測試候選版本。程式碼已推到 GitHub 分支：

```text
codex-release-ready-hardening
```

建立 PR：

```text
https://github.com/iam0301-prog/mele/pull/new/codex-release-ready-hardening
```

GitHub connector 目前沒有建立 PR 權限，所以需要用上面的連結手動建立 PR。

## 已完成

- 前端升級到 Next.js 15.5.15，並補上 production image 所需的 sharp。
- 修正 Next.js 15 server cookies/headers async API 相容性。
- 移除 build 時抓 Google Fonts 的外部網路依賴。
- E2E 改成先 build，再用 next start 測正式產物。
- 清掉 apps/web 錯誤的 root package 循環依賴。
- 品牌統一為「海底之星 MELE」。
- 後台發布檢查表補齊 0001-0012 migrations。
- 發布文件同步到 0001-0012，包含會員點數、KYC 自動清除、管理員會員操作與封測名單。
- CI npm cache 同時追蹤 root 與 apps/web lockfile。

## 驗證結果

```text
npm.cmd run release:check：通過
npm.cmd audit：0 vulnerabilities
npm.cmd --prefix apps/web audit：0 vulnerabilities
npm.cmd --prefix apps/web run lint：通過
E2E：16 passed
Structure：338 passed
Deployment readiness：183 passed
Secret scan：9 passed
Production build：通過，36 routes generated
```

## 目前評分

```text
封閉測試發布：94 / 100
正式公開收費：78 / 100
```

扣分原因主要是外部服務必須到正式雲端與真機驗證，本機無法完全替代。

## 回家後最短路線

1. 打開 GitHub PR 連結並建立 draft PR。
2. 確認 GitHub Actions 是否全綠。
3. 把前端部署到 Vercel。
4. 把 Python API 部署到 Railway、Render、Fly.io 或 VM。
5. 在 Vercel 設定 production env：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_LIFF_ID
NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN
NEXT_PUBLIC_ENABLE_LINE_LOGIN
NEXT_PUBLIC_LINE_OAUTH_PROVIDER
NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE
MELE_API_URL
```

6. 在 Python API host 設定：

```text
MELE_ALLOWED_ORIGINS
MELE_RATE_LIMIT_MAX_REQUESTS
MELE_RATE_LIMIT_WINDOW_SECONDS
MELE_HEAVY_MAX_CONCURRENCY
MELE_TRUST_PROXY_HEADERS
```

7. 在 Supabase 設定：

```text
Site URL
Redirect URLs
SMTP
Google provider
LINE custom provider
ECPay edge function secrets
LINE_CHANNEL_ACCESS_TOKEN
```

## 上線前必測

- Email 註冊驗證信。
- 重新寄送驗證信。
- 忘記密碼信。
- Google 登入。
- LINE 登入。
- 老師申請。
- 會員點數每日領取 200 點。
- 100 點解鎖詳解、流日、流月、流年。
- 免費預約流程。
- ECPay sandbox 付款流程。
- ECPay webhook 入帳。
- iPhone Safari。
- Android Chrome。
- LINE 內建瀏覽器。

## 發布判斷

可以先做封閉測試，不建議直接公開收費。

正式收費前必須完成：

- ECPay sandbox 與正式設定。
- Supabase Email / OAuth 實信測試。
- 正式 API `/ready` uptime monitor。
- Sentry 或同等錯誤監控。
- 手機真機 QA。
