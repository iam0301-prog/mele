# MELE Python API

這是 MELE 的命理計算服務。它和 Next.js 前端分開部署，原因是八字、紫微、人類圖、占星等工具需要較重的 Python/Node 計算環境，不適合放在 Vercel serverless 裡硬跑。

## 本機啟動

Windows：

```powershell
cd D:\mele\python_api
.\venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8015
```

macOS / Linux：

```bash
cd python_api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8015
```

健康檢查：

```bash
curl http://127.0.0.1:8015/ready
```

## 為什麼 API 需要 Node

以下工具會透過 Python subprocess 呼叫 Node helper：

| 工具 | Helper | Node 套件 |
| --- | --- | --- |
| 紫微斗數 | `_iztro_helper.cjs` | `iztro` |
| 西洋占星 | `_sweph_helper.cjs` | `sweph` |
| 人類圖 | `_sweph_helper.cjs` | `sweph` |

所以正式 Docker image 會同時安裝 Python dependencies 與 `python_api/package.json` 內的 Node dependencies。

## Docker

從 repo root 建議這樣 build：

```powershell
docker build -t mele-api -f python_api/Dockerfile python_api
docker run --rm -p 8015:8000 -e MELE_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3006 mele-api
```

正式平台通常會提供 `PORT`，Dockerfile 會自動使用 `${PORT:-8000}`。

## 必要環境變數

| 名稱 | 建議值 | 說明 |
| --- | --- | --- |
| `MELE_ALLOWED_ORIGINS` | `https://your-domain.com` | CORS 白名單，正式環境不要用萬用字元 |
| `MELE_RATE_LIMIT_MAX_REQUESTS` | `90` | 每個 IP/工具在窗口內最多請求數 |
| `MELE_RATE_LIMIT_WINDOW_SECONDS` | `60` | rate limit 時間窗口 |
| `MELE_HEAVY_MAX_CONCURRENCY` | `4` | 重型計算併發上限，預留給後續 semaphore/queue |

## 部署建議

可選：

1. Railway：使用 `railway.json`，Dockerfile path 指到 `python_api/Dockerfile`。
2. Render：使用 repo root 的 `render.yaml`，服務 rootDir 是 `python_api`。
3. Fly.io / VM：直接用 Dockerfile。

部署完成後一定要驗：

```bash
curl https://your-api-domain.com/ready
```

再用前端跑一次：

1. `/tools/bazi`
2. `/tools/ziwei`
3. `/tools/astro`
4. `/tools/humandesign`

這四個最能驗出 Python + Node + subprocess 是否真的完整。

## 測試

從 repo root：

```powershell
npm run test:api
```

如果本機 sandbox 不允許測試腳本啟動 API，它會改用 `MELE_API_URL` 或 `http://127.0.0.1:8015` 上已經在跑的 API。

### Python pytest 重建環境

不要依賴已提交的 `python_api\venv` launcher；它會綁定建立當下的本機路徑，在其他工作區可能無法啟動。建議從 repo root 用一次性的乾淨 venv：

```powershell
cd D:\mele
py -3.12 -m venv .venv-pytest
.\.venv-pytest\Scripts\python.exe -m pip install -r python_api\requirements-dev.txt
$env:PYTHON = "$PWD\.venv-pytest\Scripts\python.exe"
npm run test:python
```

若沒有安裝 `py -3.12`，可改用可用的 `python -m venv .venv-pytest`，但請先確認版本符合部署環境。
