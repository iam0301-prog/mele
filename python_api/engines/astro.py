"""
西洋占星 — Swiss Ephemeris (透過 Node.js sweph subprocess)

為什麼用 subprocess：
  - Python pyswisseph 在 Windows + Python 3.13 沒有預編譯 wheel
  - 編譯需要 Microsoft C++ Build Tools (~6GB)
  - Node.js sweph 已 prebuilt、立即可用
  - 與紫微 (iztro) 同模式、保證一致

精度等同 Astro.com 業界標準（Moshier 內建演算法、太陽月亮 ~10 arc-sec）
"""
import json
import subprocess
import os
from pathlib import Path
from typing import Optional

HELPER = str(Path(__file__).resolve().parents[1] / "_sweph_helper.cjs")


def calculate(year: int, month: int, day: int, hour: int, minute: int = 0,
              timezone: float = 8.0,
              latitude: Optional[float] = None,
              longitude: Optional[float] = None,
              house_system: str = "P") -> dict:
    """
    西洋占星本命盤

    Args:
        year/month/day: 國曆生日
        hour/minute: 出生時間（24h 制本地時間）
        timezone: 時區（小時數，台灣 = 8）
        latitude: 緯度（北緯正、南緯負）— 計算上升宮位需要
        longitude: 經度（東經正、西經負）
        house_system: 宮位系統 P=Placidus (預設) / K=Koch / W=WholeSign / E=Equal
    """
    if not os.path.exists(HELPER):
        raise RuntimeError(f"sweph helper not found at {HELPER}")

    args = {
        "tool": "astro",
        "year": year, "month": month, "day": day,
        "hour": hour, "minute": minute,
        "timezone": timezone,
        "house": house_system,
    }
    if latitude is not None:
        args["lat"] = latitude
    if longitude is not None:
        args["lon"] = longitude

    try:
        result = subprocess.run(
            ["node", HELPER, json.dumps(args)],
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=15,
            check=False,
        )
    except FileNotFoundError:
        raise RuntimeError("Node.js 未安裝或不在 PATH。占星計算需要 Node.js。")

    if result.returncode != 0:
        try:
            err = json.loads(result.stderr)
            raise RuntimeError(f"占星計算錯誤：{err.get('error', result.stderr)}")
        except json.JSONDecodeError:
            raise RuntimeError(f"sweph helper 失敗：{result.stderr or result.stdout}")

    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"無法解析 sweph 輸出：{e}\n前 500 字：{result.stdout[:500]}")
