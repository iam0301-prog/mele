@echo off
cd /d D:\mele\apps\web
set MELE_API_URL=http://127.0.0.1:8015
D:\node.exe node_modules\next\dist\bin\next start --hostname 127.0.0.1 --port 3006
