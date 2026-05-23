# MELE 免費公開測試部署狀態

最後更新：2026-05-23

## 目前策略

MELE 先上架為「免費公開測試版」。這一階段不啟用正式付款流程，重點是讓外部測試者可以開正式網址、註冊/登入、使用工具、測每日儀式、回報手機流程與內容理解問題。

## 必須維持的前端設定

```env
NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE=true
NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=false
NEXT_PUBLIC_ENABLE_LINE_LOGIN=false
NEXT_PUBLIC_LINE_OAUTH_PROVIDER=custom:line
```

正式前端仍必須填：

```env
NEXT_PUBLIC_SUPABASE_URL=[REDACTED]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[REDACTED]
NEXT_PUBLIC_SITE_URL=https://你的正式或測試前端網址
MELE_API_URL=https://你的 Python API 網址
```

## Python API 設定

```env
MELE_ALLOWED_ORIGINS=https://你的正式或測試前端網址
MELE_RATE_LIMIT_MAX_REQUESTS=90
MELE_RATE_LIMIT_WINDOW_SECONDS=60
MELE_HEAVY_MAX_CONCURRENCY=4
MELE_TRUST_PROXY_HEADERS=true
```

## 已完成的資料庫狀態

Supabase remote migrations 已對齊到：

- 0001-0016
- 0013 teacher consultation briefs
- 0014 admin teacher operations
- 0015 locked member point economy
- 0016 teacher portal admin chart access

公開測試階段可先不部署/不啟用：

- ECPay checkout/webhook 正式收款
- LINE daily push
- Google / LINE OAuth

## 上架測試 No-Go

以下任一項不符合就不要發給外部測試者：

- `NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE` 不是 `true`
- `MELE_API_URL` 指向 localhost
- `NEXT_PUBLIC_SITE_URL` 指向 localhost
- Python API `/ready` 不是 200
- `npm run ops:smoke:public -- <web-url> <api-url>` 失敗
- 註冊信完全收不到，且 Supabase Auth Logs 沒有成功寄信紀錄
- Google 或 LINE 按鈕被打開，但 provider 尚未設定完成

## 之後切正式收費時才做

- 把 `NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE=false`
- 設定/驗證 ECPay production 或 sandbox keys
- 部署並測通 `ecpay-checkout`、`ecpay-webhook`
- 做付款成功、失敗、取消、退款 smoke test
- 再決定是否開 Google / LINE 登入
