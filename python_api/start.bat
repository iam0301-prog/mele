@echo off
chcp 65001 >nul
title Mele Python API
cd /d %~dp0

echo.
echo === Mele Python API ===
echo.

REM venv
if not exist venv (
    echo [setup] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] python venv failed
        pause
        exit /b 1
    )
)

call venv\Scripts\activate.bat

REM packages
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo [setup] Installing packages, please wait 1-2 min...
    pip install --upgrade pip
    pip install -r requirements.txt
    if errorlevel 1 (
        echo.
        echo [ERROR] pip install failed.
        echo Check your network or firewall, then run this file again.
        pause
        exit /b 1
    )
)

echo.
echo === Starting server ===
echo API:  http://localhost:8000
echo Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop.
echo.

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
