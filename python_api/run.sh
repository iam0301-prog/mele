#!/bin/bash
# Linux / macOS 一鍵啟動
set -e
cd "$(dirname "$0")"

echo "=== 命理媒介中心 Python API 啟動 ==="

if [ ! -d "venv" ]; then
  echo "[初次設定] 建立虛擬環境..."
  python3 -m venv venv
fi

source venv/bin/activate

if ! python -c "import fastapi" 2>/dev/null; then
  echo "[初次設定] 安裝套件中..."
  pip install -r requirements.txt
fi

echo ""
echo "=== 啟動中 ==="
echo "API:  http://localhost:8000"
echo "文件: http://localhost:8000/docs"
echo ""

exec python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
