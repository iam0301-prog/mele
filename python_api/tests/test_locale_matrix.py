"""T7：八工具 × 六語言自動驗收腳本。

單獨執行：
    cd D:\\mele\\python_api
    .\\venv\\Scripts\\python.exe -m pytest tests/test_locale_matrix.py -v

驗證項目：
    (a) 8 支 API × 6 個 locale 都回 200
    (b) locale=en 時，render.html 的中文字元比例低於門檻（heuristic：非塔羅/盧恩已完成
        英文化的引擎要求嚴格；尚未英文化的引擎因為有安全網退回中文，只驗證「有安全網、
        不會 500」，並記錄在 KNOWN_NOT_YET_TRANSLATED 供之後逐一拔掉）
    (c) locale=zh-TW 的結果與不帶 locale 完全一致（不變）
    (d) 回應內容（render.html + JSON 全文字串化）不含合規違禁字：付費、價格、點數、
        加LINE、預約老師
"""

from __future__ import annotations

import json
import re
import socket
import sys
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import uvicorn  # noqa: E402

from main import app  # noqa: E402


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


_PORT = _free_port()
_BASE_URL = f"http://127.0.0.1:{_PORT}"


@pytest.fixture(scope="module", autouse=True)
def _live_server():
    config = uvicorn.Config(app, host="127.0.0.1", port=_PORT, log_level="error")
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    for _ in range(100):
        try:
            urllib.request.urlopen(f"{_BASE_URL}/health", timeout=1)
            break
        except Exception:
            time.sleep(0.1)
    else:
        raise RuntimeError("測試用 API server 啟動逾時")
    yield
    server.should_exit = True
    thread.join(timeout=5)


class _Client:
    def post(self, path: str, params: dict, json_body: dict):
        query = "&".join(f"{k}={v}" for k, v in params.items() if v is not None)
        url = f"{_BASE_URL}{path}?{query}"
        data = json.dumps(json_body).encode()
        req = urllib.request.Request(
            url, data=data, headers={"Content-Type": "application/json"}, method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                return _Resp(resp.status, resp.read())
        except urllib.error.HTTPError as e:
            return _Resp(e.code, e.read())


class _Resp:
    def __init__(self, status_code: int, body: bytes):
        self.status_code = status_code
        self._body = body

    def json(self):
        return json.loads(self._body)

    @property
    def text(self):
        return self._body.decode(errors="replace")


client = _Client()

LOCALES = ["zh-TW", "en", "vi", "id", "ja", "ko"]

BANNED_WORDS = ["付費", "價格", "點數", "加LINE", "加 LINE", "預約老師"]

CJK_RE = re.compile(r"[一-鿿]")

# 目前尚未完成英文化的引擎（安全網會退回中文，屬預期行為，不算失敗）
# 下一輪把某引擎英文化做完後，記得把它從這個集合移除。
# 注意：humandesign 的 render.html 實際上是 renderers/hd_render.py 產生的（見任務清單
# 「重要架構發現」一節），不是走 explanations.py 的 EXPLAINER 分支，所以即使
# explain_humandesign 已英文化，目前使用者實際看到的 html 仍是 hd_render.py 出的中文。
# 下一輪把 hd_render.py 也做 locale 分支後，才能把 humandesign 從這個集合移除。
KNOWN_NOT_YET_TRANSLATED_FOR_EN = {"bazi", "tarot", "humandesign"}

CASES: dict[str, dict] = {
    "numerology": {"year": 1990, "month": 5, "day": 15},
    "maya": {"year": 1990, "month": 5, "day": 15},
    "bazi": {"year": 1990, "month": 5, "day": 15, "hour": 12, "minute": 0},
    "ziwei": {"year": 1990, "month": 5, "day": 15, "hour": 12, "minute": 0, "gender": "female"},
    "tarot": {"count": 3, "reversed_enabled": True, "spread": "past-present-future", "seed": 42},
    "runes": {"count": 3, "reversed_enabled": True, "seed": 42},
    "astro": {
        "year": 1990,
        "month": 5,
        "day": 15,
        "hour": 12,
        "minute": 0,
        "timezone": 8.0,
        "latitude": 25.033,
        "longitude": 121.5654,
    },
    "humandesign": {"year": 1990, "month": 5, "day": 15, "hour": 12, "minute": 0, "timezone": 8.0},
}


def _call(tool: str, payload: dict, locale: str | None) -> dict:
    url = f"/api/v1/calc/{tool}"
    params = {"detail": "full"}
    if locale is not None:
        params["locale"] = locale
    resp = client.post(url, params=params, json_body=payload)
    assert resp.status_code == 200, f"{tool} locale={locale} 回傳 {resp.status_code}: {resp.text[:500]}"
    return resp.json()


def _cjk_ratio(text: str) -> float:
    if not text:
        return 0.0
    letters = re.findall(r"\S", text)
    if not letters:
        return 0.0
    cjk = CJK_RE.findall(text)
    return len(cjk) / max(len(letters), 1)


@pytest.mark.parametrize("tool", list(CASES.keys()))
@pytest.mark.parametrize("locale", LOCALES)
def test_locale_returns_200(tool: str, locale: str) -> None:
    """(a) 每支 API 每個 locale 都要回 200，不能出錯。"""
    body = _call(tool, CASES[tool], locale)
    assert body["render"]["html"], f"{tool} locale={locale} render.html 是空的"


@pytest.mark.parametrize("tool", list(CASES.keys()))
def test_zh_tw_matches_default(tool: str) -> None:
    """(c) locale=zh-TW 與不帶 locale 結果一致（不能因為加了 locale 參數就變了行為）。"""
    with_locale = _call(tool, CASES[tool], "zh-TW")
    without_locale = _call(tool, CASES[tool], None)
    assert with_locale["render"]["html"] == without_locale["render"]["html"]
    assert with_locale["data"] == without_locale["data"]


@pytest.mark.parametrize("tool", list(CASES.keys()))
def test_en_is_mostly_english_or_known_gap(tool: str) -> None:
    """(b) locale=en 時中文字元比例要低；尚未英文化的引擎先記錄、不當失敗。"""
    body = _call(tool, CASES[tool], "en")
    html = body["render"]["html"]
    ratio = _cjk_ratio(html)
    if tool in KNOWN_NOT_YET_TRANSLATED_FOR_EN:
        # 已知安全網退回中文，先只驗證「有內容、沒有 500」；留 xfail 提醒下一輪要拔掉。
        pytest.xfail(f"{tool} 尚未完成英文化，locale=en 目前透過安全網退回中文（中文字元比例 {ratio:.0%}）")
    assert ratio < 0.15, f"{tool} locale=en 中文字元比例 {ratio:.0%}，看起來還沒英文化乾淨：{html[:300]}"


@pytest.mark.parametrize("tool", list(CASES.keys()))
@pytest.mark.parametrize("locale", LOCALES)
def test_no_banned_compliance_words(tool: str, locale: str) -> None:
    """(d) 回應內容不能出現合規違禁字（付費相關話術）。"""
    body = _call(tool, CASES[tool], locale)
    full_text = json.dumps(body, ensure_ascii=False)
    for word in BANNED_WORDS:
        assert word not in full_text, f"{tool} locale={locale} 出現違禁字：{word}"
