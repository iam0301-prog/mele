@echo off
cd /d D:\mele\python_api
set PYTHONPATH=D:\mele\.py312-packages;D:\mele\python_api
set PYTHONIOENCODING=utf-8
set PYTHON_EXE=C:\Users\iam03\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe
if not exist "%PYTHON_EXE%" set PYTHON_EXE=D:\mele\python_api\venv\Scripts\python.exe
"%PYTHON_EXE%" -m uvicorn main:app --host 127.0.0.1 --port 8015
