# Google and LINE Login Runbook

最後更新：2026-05-03

這份文件把 MELE 的 Google / LINE 登入與註冊設定收斂成一條路徑。前端已經走 Supabase OAuth callback；真正會決定是否可登入的是 Supabase Auth Provider、第三方 OAuth client 與 Redirect URLs。

## 1. 共用 Callback

MELE 所有 Auth 流程共用：

```text
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
```

Supabase Dashboard -> Authentication -> URL Configuration 必須允許：

```text
http://localhost:3000/**
https://your-domain.com/**
```

## 2. Google Login

1. 到 Google Cloud Console 建立 OAuth Client。
2. Authorized JavaScript origins 加入：
   - `http://localhost:3000`
   - `https://your-domain.com`
3. Authorized redirect URI 加入 Supabase 提供的 callback URL，格式通常是：
   - `https://<project-ref>.supabase.co/auth/v1/callback`
4. 到 Supabase Dashboard -> Authentication -> Providers -> Google。
5. 開啟 Google provider，貼上 Google client id / secret。
6. 本機 `.env.local` 可設定：

```env
NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=true
```

MELE 登入頁會讀 Supabase public Auth settings；如果 Supabase Google provider 還沒開，按鈕會維持「尚未啟用」。

## 3. LINE Login

目前 MELE 採用 Supabase custom OAuth provider，預設 provider 名稱是：

```env
NEXT_PUBLIC_LINE_OAUTH_PROVIDER=custom:line
```

設定流程：

1. 到 LINE Developers 建立 LINE Login channel。
2. Callback URL 加入 Supabase Auth callback：
   - `https://<project-ref>.supabase.co/auth/v1/callback`
3. 到 Supabase Dashboard -> Authentication -> Providers -> Custom OAuth。
4. 建立 provider，名稱使用 `line`，讓前端可用 `custom:line`。
5. 填入 LINE client id / secret。
6. Scopes 建議：

```text
openid profile email
```

7. 本機 `.env.local` 設定：

```env
NEXT_PUBLIC_ENABLE_LINE_LOGIN=true
NEXT_PUBLIC_LINE_OAUTH_PROVIDER=custom:line
```

注意：LINE email scope 可能不一定回傳使用者 email，產品上不能假設 LINE 使用者一定有 email。

## 4. 診斷

執行：

```powershell
npm run ops:check-auth
```

這會確認：

- Email provider。
- Google provider public status。
- LINE 前端開關與 provider 名稱。
- 目前預期的 `/auth/callback`。

它不能讀取第三方 client secret，也不能驗證 custom OAuth provider 是否真的存在；這部分要看 Supabase Dashboard。

## 5. 驗收

本機測試：

1. `npm run ops:check-auth`。
2. 登入頁看到 Google 狀態已開。
3. 點 Google 登入後能回到 `/auth/callback`，再回到原本的 `return` 頁。
4. LINE 開關打開後，點 LINE 登入能導到 LINE 授權頁。
5. LINE 授權後能回 MELE 並建立 Supabase session。

正式站驗收：

1. 使用正式網域跑 Google。
2. 使用 LINE App 內建瀏覽器跑 LINE。
3. 使用 Safari / Chrome 各跑一次。
4. Supabase Auth Logs 中能看到 provider login success。
5. Header 顯示使用者已登入，會員頁不再導回 `/account/login`。

## 6. 常見錯誤

| 狀況 | 通常原因 | 修正 |
| --- | --- | --- |
| Google 按鈕尚未啟用 | Supabase Google provider 沒開 | 到 Authentication -> Providers -> Google 開啟 |
| Google 顯示 redirect_uri_mismatch | Google Console redirect URI 少 Supabase callback | 加入 `https://<project-ref>.supabase.co/auth/v1/callback` |
| LINE 點擊後 provider not found | Supabase custom provider 名稱不是 `line` | 統一成 `custom:line` 或更新 `NEXT_PUBLIC_LINE_OAUTH_PROVIDER` |
| LINE 授權後沒有 email | LINE scope 或使用者沒有提供 email | 改用 LINE user id 作識別，email 作選填 |
| 回 MELE 後 auth_failed | Supabase Redirect URLs 沒允許 MELE `/auth/callback` | URL Configuration 加入正式網域與 localhost wildcard |
