# MELE 上線後 5 分鐘 Smoke Test

最後更新：2026-05-06

> 部署完成後，照下面 11 步驗證。**全綠才能把網址公開給朋友**。
> 任何一條失敗，先停下來看 `DEPLOY_CHECKLIST.md` 的 9 個風險點。

把下面 `<VERCEL>` 換成你的 Vercel 正式網址，`<API>` 換成 Render 的 Python API 網址。

---

## A. 基礎健康（90 秒）

### 1. Python API `/ready`

```bash
curl -s https://<API>/ready | head -c 200
```

期望：JSON `{"status":"ready", "version":"...", "allowed_origins":[...]}`，
而且 `allowed_origins` 裡**有你的 Vercel URL**。

❌ 如果 `allowed_origins` 只有 localhost → 你忘了在 Render 設 `MELE_ALLOWED_ORIGINS`。

### 2. Python API `/health`

```bash
curl -s https://<API>/health
```

期望：`{"status":"ok", "engines":[...8 個工具], "ar_ready":true}`。

### 3. 前端首頁

開 `https://<VERCEL>/`。期望看到「海底之星 MELE」首頁，不是 Vercel 的 404 或 build error 頁。

### 4. 前端 → API rewrite

開 `https://<VERCEL>/api/calc/numerology` 直接 GET（瀏覽器網址列）。
期望：404 或 405（因為是 POST endpoint）—— 重點是**不能是 CORS error 或 502**。
這代表 Vercel 的 `rewrites()` 確實打到了 Render。

---

## B. 8 個排盤工具（2 分鐘）

開以下 URL，每個都隨便輸入一組生日，按計算，要看到結果頁、不能 500。

| # | URL | 期望看到 |
|---|---|---|
| 1 | `/tools/numerology` | 生命靈數結果（不需登入） |
| 2 | `/tools/maya` | 瑪雅 KIN 號 |
| 3 | `/tools/bazi` | 八字四柱 |
| 4 | `/tools/tarot` | 抽到的塔羅牌（每次重整都會換） |
| 5 | `/tools/runes` | 盧恩石 |
| 6 | `/tools/astro` | 占星圖（這個吃 Swiss Ephemeris，最容易踩雷） |
| 7 | `/tools/ziwei` | 紫微命盤（吃 Node iztro subprocess） |
| 8 | `/tools/humandesign` | 人類圖（吃 Node + Python） |

❌ 如果第 6/7/8 出 500 → 99% 是 Render 沒選 Docker，請看 CHECKLIST P0 第 1 條。

---

## C. 註冊 + 登入（90 秒）

### 5. Email 註冊

1. `/account/login` → 切到「註冊」。
2. 用一個你能收信的 email 註冊。
3. 期望：跳出「請查收驗證信」訊息。

### 6. 收到驗證信

打開信件，點連結。
期望：跳回 `https://<VERCEL>/auth/callback?code=...`，再自動 redirect 進 `/`，右上有你的 email。

❌ 跳到 localhost → Supabase 的 Site URL 還沒改，看 ENV_MATRIX 第 4 節。
❌ 跳到 `/auth/callback?error=auth_failed` → Redirect URLs 沒加，同上。

### 7. 重新登入

登出 → 用同一個 email 登入。期望：直接登入成功，不再要驗證。

---

## D. 會員點數 + 預約（60 秒）

### 8. 每日領點

1. 登入後 → `/account` → 找到「每日領 200 點」按鈕。
2. 點下去。
3. 期望：點數從 0 → 200。
4. 再點一次：應該被擋住「今日已領」。

❌ 點下去沒反應/錯誤 → 檢查 `0009_member_points_unlocks.sql` 是否真的跑過。

### 9. 工具解鎖深度解讀

1. 隨便進一個工具（例如 `/tools/bazi`）算一次。
2. 結果頁應該有「解鎖深度解讀（消耗 100 點）」。
3. 點下去 → 點數 200 → 100，深度內容展開。

### 10. 預約老師（免費測試模式）

1. `/teachers` 找一個老師（封閉測試應該已經有 demo 老師）。
2. 點預約 → 選時段 → 提交。
3. 因為 `NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE=true`，會跳過 ECPay，直接顯示「預約成功（免費測試模式）」。

❌ 卡在 ECPay 付款頁 → flag 沒生效，到 Vercel 看環境變數，並重 Deploy（取消 cache）。

---

## E. 老師後台 + Admin（30 秒）

### 11. 老師後台 + Admin 後台

- 用 super admin 帳號（在 Step 0 設過的）登入。
- 右上角應該看到「★ 後台」。
- 點進去 `/admin` → 能看到老師申請列表、預約清單。
- `/admin/launch` 上線檢查表 → 多數欄位應該已綠色或可勾。

---

## 全綠後做的事

1. 把 `NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE=true` **這個決定寫下來**——
   - 如果只發給認識的朋友：保留 true。
   - 如果要丟到任何公開頻道：改 false，否則陌生人會無限佔老師時段。
2. 把 Vercel URL 與 Render URL 寫進你個人筆記。
3. 設一個 UptimeRobot（免費）監控 `/ready` 每 5 分鐘 ping 一次。
4. 之後每次推 commit，Vercel 會自動 deploy；Render Blueprint 目前設為 `autoDeploy: true`，Python API 也會跟著 main 更新。

---

## 失敗排查口訣

```
工具 500   →  Render 不是 Docker，或 MELE_API_URL 設錯
畫面空白   →  Vercel build 失敗，或 NEXT_PUBLIC_SUPABASE_URL 沒設
CORS 錯誤  →  Render 的 MELE_ALLOWED_ORIGINS 沒包含 Vercel URL
信點了沒反應 →  Supabase Site URL / Redirect URLs 沒對齊
登入後沒「★ 後台」 →  忘了把 admin 寫進 public.admins
免費跳過金流不生效 →  flag 改了但沒 redeploy（重 build）
```
