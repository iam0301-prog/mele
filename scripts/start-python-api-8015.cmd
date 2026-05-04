@echo off
cd /d D:\mele\python_api
set PYTHONPATH=D:\mele\.py312-packages;D:\mele\python_api
set PYTHONIOENCODING=utf-8
C:\Users\iam03\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8015
