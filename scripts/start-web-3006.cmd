@echo off
cd /d D:\mele\apps\web
if "%MELE_API_URL%"=="" set MELE_API_URL=http://127.0.0.1:8015
if "%NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE%"=="" set NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE=true
set NEXT_TELEMETRY_DISABLED=1
set NODE_EXE=D:\node.exe
if not exist "%NODE_EXE%" set NODE_EXE=node.exe

if /I "%MELE_WEB_MODE%"=="start" goto start

"%NODE_EXE%" node_modules\next\dist\bin\next dev --hostname 127.0.0.1 --port 3006
goto end

:start
"%NODE_EXE%" node_modules\next\dist\bin\next start --hostname 127.0.0.1 --port 3006

:end
