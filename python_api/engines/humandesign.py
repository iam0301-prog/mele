"""
人類圖 Human Design — Ra Uru Hu 系統（透過 Node.js sweph subprocess）

  - Personality (意識)：出生瞬間 13 個天體位置
  - Design (潛意識)：出生前太陽走完 88° 的時刻 13 個天體位置
  - 26 個閘門啟動 → 9 中心 → 36 通道 → 5 類型 + Profile + 內在權威

完整算法在 _sweph_helper.cjs（與占星共用 Node.js sweph 子程序）
"""
import json
import subprocess
import os
from pathlib import Path

HELPER = str(Path(__file__).resolve().parents[1] / "_sweph_helper.cjs")


# ============================================================
# 常數（給 renderer 用，與 _sweph_helper.cjs 同步）
# ============================================================

# 64 閘門 → 9 中心對應表 (Ra Uru Hu)
GATE_TO_CENTER = {
    # Head 頂輪
    64: 'Head', 61: 'Head', 63: 'Head',
    # Ajna 邏輯
    47: 'Ajna', 24: 'Ajna', 4: 'Ajna', 17: 'Ajna', 43: 'Ajna', 11: 'Ajna',
    # Throat 喉嚨
    62: 'Throat', 23: 'Throat', 56: 'Throat', 16: 'Throat', 20: 'Throat',
    31: 'Throat', 8: 'Throat', 33: 'Throat', 35: 'Throat', 12: 'Throat', 45: 'Throat',
    # G Center 自我
    7: 'G', 1: 'G', 13: 'G', 25: 'G', 10: 'G', 15: 'G', 2: 'G', 46: 'G',
    # Heart 意志
    21: 'Heart', 40: 'Heart', 26: 'Heart', 51: 'Heart',
    # Sacral 薦骨
    34: 'Sacral', 5: 'Sacral', 14: 'Sacral', 29: 'Sacral',
    59: 'Sacral', 9: 'Sacral', 3: 'Sacral', 42: 'Sacral', 27: 'Sacral',
    # Solar Plexus 情緒
    6: 'SolarPlexus', 37: 'SolarPlexus', 22: 'SolarPlexus', 36: 'SolarPlexus',
    30: 'SolarPlexus', 55: 'SolarPlexus', 49: 'SolarPlexus',
    # Spleen 脾
    48: 'Spleen', 57: 'Spleen', 44: 'Spleen', 50: 'Spleen', 32: 'Spleen', 28: 'Spleen', 18: 'Spleen',
    # Root 根
    53: 'Root', 60: 'Root', 52: 'Root', 19: 'Root', 39: 'Root', 41: 'Root',
    58: 'Root', 38: 'Root', 54: 'Root',
}

CENTERS = ['Head', 'Ajna', 'Throat', 'G', 'Heart', 'Sacral', 'SolarPlexus', 'Spleen', 'Root']
MOTORS = ['Heart', 'Sacral', 'SolarPlexus', 'Root']


def calculate(year: int, month: int, day: int, hour: int, minute: int = 0,
              timezone: float = 8.0) -> dict:
    """
    人類圖計算

    Args:
        year/month/day: 國曆生日
        hour/minute: 出生時間（24h 制本地時間）
        timezone: 時區（小時數，台灣 = 8）

    Returns:
        type / profile / authority / strategy
        personalityBodies / designBodies (各 13 個天體)
        designTime（潛意識時間）
        definedCenters / undefinedCenters / definedChannels / activatedGates
    """
    if not os.path.exists(HELPER):
        raise RuntimeError(f"sweph helper not found at {HELPER}")

    args = {
        "tool": "humandesign",
        "year": year, "month": month, "day": day,
        "hour": hour, "minute": minute,
        "timezone": timezone,
    }

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
        raise RuntimeError("Node.js 未安裝或不在 PATH。人類圖計算需要 Node.js。")

    if result.returncode != 0:
        try:
            err = json.loads(result.stderr)
            raise RuntimeError(f"人類圖計算錯誤：{err.get('error', result.stderr)}")
        except json.JSONDecodeError:
            raise RuntimeError(f"sweph helper 失敗：{result.stderr or result.stdout}")

    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"無法解析 sweph 輸出：{e}\n前 500 字：{result.stdout[:500]}")
