@echo off
REM ============================================================
REM Mele Supabase 自動設定腳本 (Windows)
REM ============================================================
REM 雙擊此檔可執行。或從 PowerShell / CMD 跑:
REM   D:\mele\scripts\setup-supabase\RUN_THIS.bat

setlocal EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0..\..\"

echo.
echo ===============================================================
echo   Mele Supabase 自動設定工具
echo ===============================================================
echo.

REM ---------- 檢查 Supabase CLI ----------
echo [1/5] 檢查 Supabase CLI...
if not exist "node_modules\.bin\supabase.cmd" (
    if not exist "node_modules\.bin\supabase" (
        echo.
        echo   未找到 Supabase CLI。先跑 npm install...
        call npm install
    )
)
echo   ✓ Supabase CLI 已就緒
echo.

REM ---------- 詢問 project ref ----------
echo [2/5] 連結到你的 Supabase 雲端專案
echo.
echo   你需要的是 project ref(專案網址中間那段)。
echo   例如: 網址 https://abcdefg.supabase.co 的 ref 就是 "abcdefg"
echo.
echo   .env.local 裡目前是: abahcdwotwqnulsmwvsw
echo.
set /p PROJECT_REF="請輸入 project ref (Enter 用 abahcdwotwqnulsmwvsw): "
if "!PROJECT_REF!"=="" set PROJECT_REF=abahcdwotwqnulsmwvsw

echo.
echo   即將連結到: https://!PROJECT_REF!.supabase.co
echo.

REM ---------- 登入 Supabase CLI ----------
echo [3/5] 登入 Supabase CLI(會開瀏覽器)...
echo   如果已經登入過會直接跳過
call npx supabase login
if errorlevel 1 (
    echo.
    echo   ✗ 登入失敗。請手動執行: npx supabase login
    pause
    exit /b 1
)
echo   ✓ 已登入
echo.

REM ---------- 連結專案 ----------
echo [4/5] 連結本地專案到雲端...
call npx supabase link --project-ref !PROJECT_REF!
if errorlevel 1 (
    echo.
    echo   ✗ 連結失敗。可能原因:
    echo     - project ref 錯誤
    echo     - 你的帳號沒有此專案的權限
    echo     - 此專案不存在(需要先到 supabase.com 建立)
    pause
    exit /b 1
)
echo   ✓ 已連結
echo.

REM ---------- 推送 migrations ----------
echo [5/5] 推送 5 個 migrations 到雲端...
echo.
echo   這會在你的雲端資料庫建立所有資料表。
echo   如果之前已經跑過,可能會看到 "already exists" 錯誤(安全的)。
echo.
set /p CONFIRM="確認要繼續嗎? (y/N): "
if /i not "!CONFIRM!"=="y" (
    echo   已取消。
    pause
    exit /b 0
)

call npx supabase db push
if errorlevel 1 (
    echo.
    echo   ✗ 推送失敗。常見原因:
    echo     - 資料表已存在 → 用 Dashboard 的 SQL Editor 手動處理
    echo     - 網路問題 → 重試
    echo.
    echo   備案:打開 scripts\setup-supabase\all_migrations.sql,
    echo         複製內容到 https://supabase.com/dashboard 的 SQL Editor 跑
    pause
    exit /b 1
)

echo.
echo ===============================================================
echo   ✅ Migrations 套用完成!
echo ===============================================================
echo.
echo   接下來還要做的:
echo.
echo   1. 到 Dashboard 把自己設成 admin:
echo      開 scripts\setup-supabase\setup_admin.sql
echo      把 YOUR_EMAIL_HERE 換成你的 email,貼到 SQL Editor 跑
echo.
echo   2. 建立 Storage buckets(去 Dashboard → Storage):
echo      - avatars (Public)
echo      - teacher-docs (Private)
echo      - teacher-portfolio (Public)
echo      然後跑 scripts\setup-supabase\setup_storage_buckets.sql
echo.
echo   3. 啟動本地專案測試:
echo      cd apps\web ^&^& npm run dev
echo      開 http://localhost:3000 試試看
echo.
pause
