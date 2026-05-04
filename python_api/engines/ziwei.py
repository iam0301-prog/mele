"""
紫微斗數 — 透過 subprocess 呼叫 Node.js 的 iztro 套件

為什麼這樣：
  - 紫微斗數演算法龐大複雜（60 甲子納音、紫微/天府兩系、60+ 輔星、4 化、長生十二神...）
  - iztro 是 TypeScript 紫微斗數標準庫，已有完整實作 + 測試
  - 直接 Python 重寫成本高、容易出錯
  - 用 subprocess 呼叫保證與業界標準一致

要求：
  - Node.js 18+
  - mele 根目錄已 npm install iztro

回傳資料結構：見 _iztro_helper.js
"""
import json
import subprocess
import os
from pathlib import Path

from .bazi import calculate as bazi_calculate

# Helper script 路徑（與本檔同目錄的上一層）
HELPER = str(Path(__file__).resolve().parents[1] / "_iztro_helper.cjs")


def calculate(year: int, month: int, day: int, hour: int, minute: int = 0,
              gender: str = "男", sect: int = 2, fix_leap: bool = True) -> dict:
    """
    計算紫微斗數命盤

    Args:
        year/month/day: 國曆生日
        hour: 時鐘小時 (0-23)
        minute: 分鐘（紫微只精確到時辰，但保留欄位）
        gender: '男' / '女'
        sect: 子時派別。1=傳統（晚子時歸次日）、2=現代（晚子時仍當日，預設）
        fix_leap: 閏月修正
    """
    if gender not in ("男", "女"):
        raise ValueError(f"gender must be '男' or '女', got {gender!r}")

    args = {
        "year": year,
        "month": month,
        "day": day,
        "hour": hour,
        "gender": gender,
        "sect": sect,
        "fixLeap": fix_leap,
    }

    if not os.path.exists(HELPER):
        raise RuntimeError(f"iztro helper not found at {HELPER}")

    try:
        result = subprocess.run(
            ["node", HELPER, json.dumps(args, ensure_ascii=False)],
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=15,
            check=False,
        )
    except FileNotFoundError:
        raise RuntimeError("Node.js 未安裝或不在 PATH 中。紫微計算需要 Node.js。")

    if result.returncode != 0:
        try:
            err = json.loads(result.stderr)
            raise RuntimeError(f"iztro 計算錯誤：{err.get('error', result.stderr)}")
        except json.JSONDecodeError:
            raise RuntimeError(f"iztro helper 失敗：{result.stderr or result.stdout}")

    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"無法解析 iztro 輸出：{e}\n輸出前 500 字：{result.stdout[:500]}")

    # 修正 chineseDate：iztro 用農曆月推月柱（錯）→ 用我方 BaZi 模組（節氣月）覆蓋
    try:
        bazi_data = bazi_calculate(year, month, day, hour, minute,
                                    sect=sect, longitude=None)
        if "pillars" in bazi_data:
            p = bazi_data["pillars"]
            corrected = " ".join([
                "".join(p["year"]),  # ['乙','未'] → '乙未'
                "".join(p["month"]),
                "".join(p["day"]),
                "".join(p["time"]),
            ])
            data["chineseDateRaw"] = data.get("chineseDate")
            data["chineseDate"] = corrected
            data["bazi"] = bazi_data  # 順手把完整八字資料附上
    except Exception as e:
        data["bazi_error"] = str(e)

    return data
