#!/bin/bash
# Mac / Linux 一鍵啟動
set -e
cd "$(dirname "$0")"

echo ""
echo "  ◆ ◆ ◆"
echo ""
echo "  命理媒介中心 — 一鍵啟動"
echo ""
echo "==============================================="

# 檢查 Python
if ! command -v python3 &> /dev/null; then
    echo "  [X] 找不到 python3"
    echo "     macOS: brew install python"
    echo "     Linux: sudo apt install python3 python3-venv"
    exit 1
fi

echo "  [v] $(python3 --version)"
echo ""
echo "  [1/3] 啟動 Python API..."

# 開新 terminal 跑 API（嘗試多種終端機）
if command -v osascript &> /dev/null; then
    # macOS
    osascript -e "tell application \"Terminal\" to do script \"cd '$(pwd)/python_api' && bash run.sh\""
elif command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c "cd '$(pwd)/python_api' && bash run.sh; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -hold -e "cd '$(pwd)/python_api' && bash run.sh" &
else
    # fallback：背景跑
    (cd python_api && bash run.sh) &
fi

sleep 8

echo "  [2/3] 啟動前端 server..."
if command -v osascript &> /dev/null; then
    osascript -e "tell application \"Terminal\" to do script \"cd '$(pwd)' && python3 -m http.server 8001\""
elif command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c "cd '$(pwd)' && python3 -m http.server 8001; exec bash"
else
    python3 -m http.server 8001 &
fi

sleep 3

echo "  [3/3] 開啟瀏覽器..."
URL="http://localhost:8001/web/"
if command -v open &> /dev/null; then open "$URL"
elif command -v xdg-open &> /dev/null; then xdg-open "$URL"
fi

echo ""
echo "==============================================="
echo "  啟動完成！"
echo "  主網頁    http://localhost:8001/web/"
echo "  AR 模式   http://localhost:8001/web/ar/"
echo "  API 文件  http://localhost:8000/docs"
echo "==============================================="
