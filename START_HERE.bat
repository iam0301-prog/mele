@echo off
chcp 65001 >nul
title Mele Launcher
cd /d %~dp0

echo.
echo ===============================================
echo   Mele Divination Center - One-click launcher
echo ===============================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found in PATH
    echo.
    echo Please install Python from:
    echo   https://www.python.org/downloads/
    echo.
    echo IMPORTANT: check "Add Python to PATH" during install,
    echo then RESTART your computer.
    echo.
    pause
    start https://www.python.org/downloads/
    exit /b 1
)

echo [OK] Python detected:
python --version
echo.

echo [1/3] Starting Python API on port 8000...
echo       (first run installs packages, takes 1-2 min)
start "Mele API (port 8000)" cmd /k "cd /d %~dp0python_api && call start.bat"

echo       waiting 8 seconds for API to boot...
timeout /t 8 /nobreak >nul

echo [2/3] Starting frontend server on port 8001...
start "Mele Web (port 8001)" cmd /k "cd /d %~dp0 && python -m http.server 8001"

timeout /t 3 /nobreak >nul

echo [3/3] Opening browser...
start http://localhost:8001/web/

echo.
echo ===============================================
echo   READY! If browser did not open, paste:
echo.
echo   Main page:   http://localhost:8001/web/
echo   AR mode:     http://localhost:8001/web/ar/
echo   API docs:    http://localhost:8000/docs
echo ===============================================
echo.
echo To stop everything: close both Mele cmd windows.
echo To start again: just double-click this file.
echo.
pause
