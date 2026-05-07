# MELE 100 分封測上線外部設定表

這份文件只放「程式碼以外」的最後設定。程式端請先跑：

```powershell
$env:MELE_API_URL='http://127.0.0.1:8015'; npm.cmd run release:check
```

## 1. Supabase Auth

| 項目 | 正確狀態 | 驗證方式 |
| --- | --- | --- |
| Site URL | 正式前端網址，例如 `https://your-domain.com` | 註冊信與忘記密碼信點擊後不會回 localhost |
| Redirect URLs | `https://your-domain.com/auth/callback`、`https://your-domain.com/**`、`http://127.0.0.1:3006/auth/callback` | Email、Google、LINE 都能回到 MELE |
| Email provider | Email signup 開啟，Confirm email 依封測策略開啟 | 新信箱註冊後 Auth Logs 有寄信紀錄 |
| Custom SMTP | 已設定 Resend 或正式 SMTP | Gmail、Yahoo、iCloud 至少各測一次 |
| Email templates | Confirm signup、Reset password 連到 `/auth/callback` | 信件內連結不是 localhost |

## 2. Google Login

| 項目 | 正確狀態 | 驗證方式 |
| --- | --- | --- |
| Google OAuth Client | Authorized redirect URI 有 `https://<project-ref>.supabase.co/auth/v1/callback` | Google 不再出現 redirect_uri_mismatch |
| Supabase Provider | Authentication -> Providers -> Google 已填 Client ID / Secret 並開啟 | `npm run ops:check-auth` 顯示 Google 可用 |
| Vercel env | `NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=true` | 登入頁 Google 按鈕可點 |

## 3. LINE Login / LIFF

| 項目 | 正確狀態 | 驗證方式 |
| --- | --- | --- |
| LINE Login Channel | Callback URL 有 `https://<project-ref>.supabase.co/auth/v1/callback` | LINE 授權後回到 MELE |
| Supabase Custom OAuth | Provider id 與 `NEXT_PUBLIC_LINE_OAUTH_PROVIDER` 一致，預設 `custom:line` | 不出現 provider not found |
| LIFF App | Endpoint URL 指向正式前端網址 | LINE 內建瀏覽器可開每日儀式 |
| Vercel env | `NEXT_PUBLIC_ENABLE_LINE_LOGIN=true`、`NEXT_PUBLIC_LIFF_ID=<liff-id>` | 登入頁 LINE 按鈕可點，LIFF panel 可初始化 |

## 4. Render Python API

| 項目 | 正確狀態 | 驗證方式 |
| --- | --- | --- |
| Runtime | Docker，不是 Native Python | `/ready` 回 200，紫微/人類圖不因 Node subprocess 失敗 |
| CORS | `MELE_ALLOWED_ORIGINS=https://your-domain.com`，多網域逗號分隔且不要尾端斜線 | 前端工具不出現 CORS error |
| Rate limit | `MELE_RATE_LIMIT_MAX_REQUESTS=90`、`MELE_RATE_LIMIT_WINDOW_SECONDS=60` | `/ready` 顯示正確設定 |
| Proxy IP | `MELE_TRUST_PROXY_HEADERS=true` | Render 後方限流使用真實 client IP |

## 5. Vercel Frontend

| 項目 | 正確狀態 | 驗證方式 |
| --- | --- | --- |
| Root Directory | 保持 repo root `./` | build 使用根目錄 `npm run build` |
| `MELE_API_URL` | 指向 Render API HTTPS URL | `/api/calc/numerology` 能代理到 API |
| `NEXT_PUBLIC_SITE_URL` | 指向正式前端網址 | sitemap、OAuth、信件連結皆用正式網域 |
| Free booking flag | 封測可暫時 `true`；公開宣傳前改 `false` | `/admin/launch` 有明確提示 |
| Redeploy | 改任何 `NEXT_PUBLIC_*` 後取消 build cache 重新 deploy | 瀏覽器看到新設定 |

## 6. Smoke Test

正式網址上線後至少跑這些路徑：

```text
/zh-TW
/en
/vi/account/login
/zh-TW/daily
/zh-TW/tools/tarot
/zh-TW/tools/maya
/zh-TW/tools/bazi
/zh-TW/tools/humandesign
/zh-TW/teachers/apply
/teacher-portal
/admin/launch
```

每一項都要確認：

- 頁面不是 404、不是 client-side exception。
- 語言切換不會出現亂碼或重複字。
- 工具結果能產生初階解釋。
- 需要登入的頁面能正確導到登入，登入後能回原頁。
- Email / Google / LINE 任一登入錯誤都要有可理解訊息。

## No-Go

任何一項符合就先不要公開：

- 收不到註冊信，且 Supabase Auth Logs 沒有成功寄信紀錄。
- Google 或 LINE 按鈕對外開啟，但 callback 無法回到 MELE。
- Render `/ready` 不是 200。
- 前端工具頁出現 CORS 或 500。
- `SUPABASE_SERVICE_ROLE_KEY` 出現在 Vercel、前端 env 或 repo。
- `NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE=true` 卻開始正式收費宣傳。
