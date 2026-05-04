"""FastAPI calculation service for MELE.

The calculation API is kept separate from the Next.js frontend because several
engines are CPU-heavy or call subprocess/native libraries. Every calculator
returns the same response shell for web, mobile, and AR clients:
`tool`, `version`, `computed_at`, `input`, `data`, and `render`.
"""

from __future__ import annotations

import asyncio
import os
import traceback
from copy import deepcopy
from datetime import datetime, timezone
from functools import lru_cache
from time import monotonic
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse

from engines import astro, bazi, explanations, humandesign, maya, numerology, runes, tarot, ziwei
from models import (
    AstroRequest,
    BaziRequest,
    CalcResponse,
    HumanDesignRequest,
    MayaRequest,
    NumerologyRequest,
    RenderBundle,
    RunesRequest,
    TarotRequest,
    ZiweiRequest,
)
from renderers import (
    astro_render,
    bazi_render,
    hd_render,
    maya_render,
    numerology_render,
    runes_render,
    tarot_render,
    ziwei_render,
)


API_VERSION = "1.0.0"
ENGINES = ["numerology", "maya", "bazi", "ziwei", "tarot", "runes", "astro", "humandesign"]

app = FastAPI(
    title="MELE 命理媒介中心 API",
    description=(
        "八字、紫微、占星、人類圖、馬雅曆、塔羅、盧恩與靈數計算 API。\n\n"
        "- `data` 提供結構化結果，給 web/mobile/AR client 使用。\n"
        "- `render.svg` 提供可直接嵌入的視覺盤面。\n"
        "- `render.html` 提供中文解釋內容。\n"
        "- `render.palette` 與 `render.animations` 提供 AR/native 呈現提示。"
    ),
    version=API_VERSION,
    contact={"name": "MELE"},
)


# Local defaults are for development and device testing. Production should set
# MELE_ALLOWED_ORIGINS="https://example.com,https://www.example.com".
_default_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3006",
    "http://localhost:3007",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3006",
    "http://127.0.0.1:3007",
]
_env_origins = os.environ.get("MELE_ALLOWED_ORIGINS", "").strip()
allowed_origins = (
    [origin.strip() for origin in _env_origins.split(",") if origin.strip()]
    if _env_origins
    else _default_origins
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


RATE_LIMIT_WINDOW_SECONDS = int(os.environ.get("MELE_RATE_LIMIT_WINDOW_SECONDS", "60"))
RATE_LIMIT_MAX_REQUESTS = int(os.environ.get("MELE_RATE_LIMIT_MAX_REQUESTS", "90"))
TRUST_PROXY_HEADERS = os.environ.get("MELE_TRUST_PROXY_HEADERS", "").lower() in {"1", "true", "yes"}
_rate_buckets: dict[str, list[float]] = {}


def _client_key(request: Request) -> str:
    # Only trust proxy-provided IPs when trusted proxy infrastructure is configured to
    # strip or rewrite these headers before traffic reaches the app.
    if TRUST_PROXY_HEADERS:
        forwarded_for = request.headers.get("x-forwarded-for", "")
        forwarded_ip = forwarded_for.split(",")[0].strip()
        if forwarded_ip:
            return forwarded_ip
    return request.client.host if request.client else "unknown"


@app.middleware("http")
async def rate_limit_calc_requests(request: Request, call_next):
    if not request.url.path.startswith("/api/v1/calc/"):
        return await call_next(request)

    client_ip = _client_key(request)
    key = f"{client_ip}:{request.url.path}"
    now = monotonic()
    window_start = now - RATE_LIMIT_WINDOW_SECONDS
    bucket = [ts for ts in _rate_buckets.get(key, []) if ts >= window_start]

    if len(bucket) >= RATE_LIMIT_MAX_REQUESTS:
        _rate_buckets[key] = bucket
        return JSONResponse(
            status_code=429,
            content={
                "error": "rate_limited",
                "message": "請稍候再試。為了維持多人同時使用的穩定度，每個工具都有短時間請求上限。",
                "retry_after_seconds": RATE_LIMIT_WINDOW_SECONDS,
            },
        )

    bucket.append(now)
    _rate_buckets[key] = bucket
    return await call_next(request)


EXPLAINER = {
    "numerology": explanations.explain_numerology,
    "maya": explanations.explain_maya,
    "bazi": explanations.explain_bazi,
    "ziwei": explanations.explain_ziwei,
    "astro": explanations.explain_astro,
    "humandesign": explanations.explain_humandesign,
    "tarot": explanations.explain_tarot,
    "runes": explanations.explain_runes,
}


def wrap(tool: str, request_input: dict, data: dict, render_bundle: dict, detail: str = "teaser") -> CalcResponse:
    """Normalize every calculator result into the public API response shell."""

    if tool in EXPLAINER and not render_bundle.get("html"):
        try:
            try:
                render_bundle["html"] = EXPLAINER[tool](data, detail=detail)
            except TypeError:
                render_bundle["html"] = EXPLAINER[tool](data)
        except Exception:
            traceback.print_exc()
            render_bundle["html"] = ""

    return CalcResponse(
        tool=tool,
        version=API_VERSION,
        computed_at=datetime.now(timezone.utc),
        input=request_input,
        data=data,
        render=RenderBundle(**render_bundle),
    )


def safe_call(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs)
    except HTTPException:
        raise
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail={"error": str(exc), "type": type(exc).__name__}) from exc


@lru_cache(maxsize=2048)
def _cached_numerology(year: int, month: int, day: int) -> dict:
    return numerology.calculate(year, month, day)


@lru_cache(maxsize=2048)
def _cached_maya(year: int, month: int, day: int, include_leap_day: bool) -> dict:
    return maya.calculate(year, month, day, include_leap_day)


@lru_cache(maxsize=2048)
def _cached_bazi(
    year: int,
    month: int,
    day: int,
    hour: int,
    minute: int,
    sect: int,
    longitude: Optional[float],
) -> dict:
    return bazi.calculate(year, month, day, hour, minute, sect, longitude)


@lru_cache(maxsize=2048)
def _cached_ziwei(year: int, month: int, day: int, hour: int, minute: int, gender: str) -> dict:
    return ziwei.calculate(year, month, day, hour, minute, gender)


@lru_cache(maxsize=2048)
def _cached_astro(
    year: int,
    month: int,
    day: int,
    hour: int,
    minute: int,
    tz: float,
    latitude: float,
    longitude: float,
    house_system: str,
) -> dict:
    return astro.calculate(year, month, day, hour, minute, tz, latitude, longitude, house_system)


@lru_cache(maxsize=2048)
def _cached_humandesign(year: int, month: int, day: int, hour: int, minute: int, tz: float) -> dict:
    return humandesign.calculate(year, month, day, hour, minute, tz)


_CALC_LIMITS = {
    "numerology": asyncio.Semaphore(24),
    "maya": asyncio.Semaphore(24),
    "bazi": asyncio.Semaphore(8),
    "ziwei": asyncio.Semaphore(4),
    "astro": asyncio.Semaphore(4),
    "humandesign": asyncio.Semaphore(4),
    "tarot": asyncio.Semaphore(16),
    "runes": asyncio.Semaphore(16),
}


async def run_calc(tool: str, fn, *args):
    semaphore = _CALC_LIMITS[tool]
    async with semaphore:
        data = await asyncio.to_thread(safe_call, fn, *args)
    return deepcopy(data)


def _cache_status():
    return {
        "numerology": _cached_numerology.cache_info()._asdict(),
        "maya": _cached_maya.cache_info()._asdict(),
        "bazi": _cached_bazi.cache_info()._asdict(),
        "ziwei": _cached_ziwei.cache_info()._asdict(),
        "astro": _cached_astro.cache_info()._asdict(),
        "humandesign": _cached_humandesign.cache_info()._asdict(),
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"error": "internal_server_error"},
    )


DetailQuery = Literal["teaser", "full"]


@app.post("/api/v1/calc/numerology", response_model=CalcResponse, tags=["Calc"])
async def calc_numerology(req: NumerologyRequest, detail: DetailQuery = Query("teaser")):
    """靈數：生命靈數、生日數與核心傾向。"""

    data = await run_calc("numerology", _cached_numerology, req.year, req.month, req.day)
    return wrap("numerology", req.model_dump(), data, numerology_render.render(data), detail=detail)


@app.post("/api/v1/calc/maya", response_model=CalcResponse, tags=["Calc"])
async def calc_maya(req: MayaRequest, detail: DetailQuery = Query("teaser")):
    """馬雅曆：Kin、Seal、Tone 與 oracle 關係。"""

    data = await run_calc("maya", _cached_maya, req.year, req.month, req.day, req.include_leap_day)
    return wrap("maya", req.model_dump(), data, maya_render.render(data), detail=detail)


@app.post("/api/v1/calc/bazi", response_model=CalcResponse, tags=["Calc"])
async def calc_bazi(req: BaziRequest, detail: DetailQuery = Query("teaser")):
    """八字：四柱、五行分布與日主觀察。"""

    data = await run_calc(
        "bazi",
        _cached_bazi,
        req.year,
        req.month,
        req.day,
        req.hour,
        req.minute,
        req.sect,
        req.longitude,
    )
    return wrap("bazi", req.model_dump(), data, bazi_render.render(data), detail=detail)


@app.post("/api/v1/calc/ziwei", response_model=CalcResponse, tags=["Calc"])
async def calc_ziwei(req: ZiweiRequest, detail: DetailQuery = Query("teaser")):
    """紫微斗數：十二宮、主星與命盤結構。"""

    data = await run_calc("ziwei", _cached_ziwei, req.year, req.month, req.day, req.hour, req.minute, req.gender)
    return wrap("ziwei", req.model_dump(), data, ziwei_render.render(data), detail=detail)


@app.post("/api/v1/calc/tarot", response_model=CalcResponse, tags=["Calc"])
async def calc_tarot(req: TarotRequest, detail: DetailQuery = Query("teaser")):
    """塔羅：抽牌、正逆位與牌陣位置。"""

    data = await run_calc("tarot", tarot.draw, req.count, req.reversed_enabled, req.spread, req.seed, req.tarot_style)
    return wrap("tarot", req.model_dump(), data, tarot_render.render(data, data.get("meta", {}).get("tarot_style")), detail=detail)


@app.post("/api/v1/calc/runes", response_model=CalcResponse, tags=["Calc"])
async def calc_runes(req: RunesRequest, detail: DetailQuery = Query("teaser")):
    """盧恩：Elder Futhark 抽石與材質呈現。"""

    data = await run_calc("runes", runes.draw, req.count, req.reversed_enabled, req.seed, req.spread, req.material or "stone")
    return wrap("runes", req.model_dump(), data, runes_render.render(data), detail=detail)


@app.post("/api/v1/calc/astro", response_model=CalcResponse, tags=["Calc"])
async def calc_astro(req: AstroRequest, detail: DetailQuery = Query("teaser")):
    """西洋占星：行星、宮位與上升點。"""

    data = await run_calc(
        "astro",
        _cached_astro,
        req.year,
        req.month,
        req.day,
        req.hour,
        req.minute,
        req.timezone,
        req.latitude,
        req.longitude,
        req.house_system,
    )
    return wrap("astro", req.model_dump(), data, astro_render.render(data), detail=detail)


@app.post("/api/v1/calc/humandesign", response_model=CalcResponse, tags=["Calc"])
async def calc_humandesign(req: HumanDesignRequest, detail: DetailQuery = Query("teaser")):
    """人類圖：類型、中心、閘門與通道。"""

    data = await run_calc(
        "humandesign",
        _cached_humandesign,
        req.year,
        req.month,
        req.day,
        req.hour,
        req.minute,
        req.timezone,
    )
    return wrap("humandesign", req.model_dump(), data, hd_render.render(data), detail=detail)


@app.get("/", response_class=HTMLResponse, tags=["Meta"])
async def root():
    return f"""<!DOCTYPE html>
<html lang="zh-TW"><head><meta charset="UTF-8"><title>MELE API</title>
<style>body{{font-family:system-ui,sans-serif;max-width:720px;margin:60px auto;padding:0 20px;color:#1f2937;line-height:1.8}}
code{{background:#f4f4f4;padding:2px 6px;border-radius:4px}}
a{{color:#9a7416}}</style>
</head><body>
<h1>MELE 命理媒介中心 API v{API_VERSION}</h1>
<p>提供 8 種命理工具的結構化計算、SVG 視覺盤面、中文解釋與 AR 呈現資料。</p>
<ul>
  <li><a href="/docs">/docs</a>：Swagger UI</li>
  <li><a href="/redoc">/redoc</a>：ReDoc</li>
  <li><a href="/health">/health</a>：服務健康檢查</li>
  <li><a href="/ready">/ready</a>：上線依賴與快取狀態</li>
</ul>
</body></html>"""


@app.get("/health", tags=["Meta"])
async def health():
    return {
        "status": "ok",
        "version": API_VERSION,
        "engines": ENGINES,
        "ar_ready": True,
    }


@app.get("/ready", tags=["Meta"])
async def ready():
    return {
        "status": "ready",
        "version": API_VERSION,
        "allowed_origins": allowed_origins,
        "rate_limit": {
            "window_seconds": RATE_LIMIT_WINDOW_SECONDS,
            "max_requests_per_tool": RATE_LIMIT_MAX_REQUESTS,
            "active_buckets": len(_rate_buckets),
        },
        "concurrency_limits": {tool: getattr(limit, "_value", None) for tool, limit in _CALC_LIMITS.items()},
        "cache": _cache_status(),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
