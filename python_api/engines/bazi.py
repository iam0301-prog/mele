"""
八字 BaZi — 使用 lunar-python（純 Python，無需 C++ Build Tools）

lunar-python 是 6tail 的 lunar-javascript 同源 Python 移植，
標準農曆 / 八字 / 節氣計算庫，與 sxtwl 等價但不需要編譯。

裝法：pip install lunar-python
"""
from datetime import datetime
from typing import Optional

GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

WUXING_GAN = {"甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土",
              "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水"}
WUXING_ZHI = {"子": "水", "丑": "土", "寅": "木", "卯": "木", "辰": "土",
              "巳": "火", "午": "火", "未": "土", "申": "金", "酉": "金",
              "戌": "土", "亥": "水"}

YIN_YANG_GAN = {"甲": "陽", "丙": "陽", "戊": "陽", "庚": "陽", "壬": "陽",
                "乙": "陰", "丁": "陰", "己": "陰", "辛": "陰", "癸": "陰"}

# 60 甲子納音（簡表）
NAYIN_TABLE = {
    "甲子": "海中金", "乙丑": "海中金", "丙寅": "爐中火", "丁卯": "爐中火",
    "戊辰": "大林木", "己巳": "大林木", "庚午": "路旁土", "辛未": "路旁土",
    "壬申": "劍鋒金", "癸酉": "劍鋒金", "甲戌": "山頭火", "乙亥": "山頭火",
    "丙子": "澗下水", "丁丑": "澗下水", "戊寅": "城牆土", "己卯": "城牆土",
    "庚辰": "白臘金", "辛巳": "白臘金", "壬午": "楊柳木", "癸未": "楊柳木",
    "甲申": "泉中水", "乙酉": "泉中水", "丙戌": "屋上土", "丁亥": "屋上土",
    "戊子": "霹靂火", "己丑": "霹靂火", "庚寅": "松柏木", "辛卯": "松柏木",
    "壬辰": "長流水", "癸巳": "長流水", "甲午": "沙中金", "乙未": "沙中金",
    "丙申": "山下火", "丁酉": "山下火", "戊戌": "平地木", "己亥": "平地木",
    "庚子": "壁上土", "辛丑": "壁上土", "壬寅": "金箔金", "癸卯": "金箔金",
    "甲辰": "覆燈火", "乙巳": "覆燈火", "丙午": "天河水", "丁未": "天河水",
    "戊申": "大驛土", "己酉": "大驛土", "庚戌": "釵釧金", "辛亥": "釵釧金",
    "壬子": "桑柘木", "癸丑": "桑柘木", "甲寅": "大溪水", "乙卯": "大溪水",
    "丙辰": "沙中土", "丁巳": "沙中土", "戊午": "天上火", "己未": "天上火",
    "庚申": "石榴木", "辛酉": "石榴木", "壬戌": "大海水", "癸亥": "大海水",
}

# 十神（以日干為主）
SHISHEN = {
    "甲": {"甲": "比肩", "乙": "劫財", "丙": "食神", "丁": "傷官", "戊": "偏財",
           "己": "正財", "庚": "七殺", "辛": "正官", "壬": "偏印", "癸": "正印"},
    "乙": {"乙": "比肩", "甲": "劫財", "丁": "食神", "丙": "傷官", "己": "偏財",
           "戊": "正財", "辛": "七殺", "庚": "正官", "癸": "偏印", "壬": "正印"},
    "丙": {"丙": "比肩", "丁": "劫財", "戊": "食神", "己": "傷官", "庚": "偏財",
           "辛": "正財", "壬": "七殺", "癸": "正官", "甲": "偏印", "乙": "正印"},
    "丁": {"丁": "比肩", "丙": "劫財", "己": "食神", "戊": "傷官", "辛": "偏財",
           "庚": "正財", "癸": "七殺", "壬": "正官", "乙": "偏印", "甲": "正印"},
    "戊": {"戊": "比肩", "己": "劫財", "庚": "食神", "辛": "傷官", "壬": "偏財",
           "癸": "正財", "甲": "七殺", "乙": "正官", "丙": "偏印", "丁": "正印"},
    "己": {"己": "比肩", "戊": "劫財", "辛": "食神", "庚": "傷官", "癸": "偏財",
           "壬": "正財", "乙": "七殺", "甲": "正官", "丁": "偏印", "丙": "正印"},
    "庚": {"庚": "比肩", "辛": "劫財", "壬": "食神", "癸": "傷官", "甲": "偏財",
           "乙": "正財", "丙": "七殺", "丁": "正官", "戊": "偏印", "己": "正印"},
    "辛": {"辛": "比肩", "庚": "劫財", "癸": "食神", "壬": "傷官", "乙": "偏財",
           "甲": "正財", "丁": "七殺", "丙": "正官", "己": "偏印", "戊": "正印"},
    "壬": {"壬": "比肩", "癸": "劫財", "甲": "食神", "乙": "傷官", "丙": "偏財",
           "丁": "正財", "戊": "七殺", "己": "正官", "庚": "偏印", "辛": "正印"},
    "癸": {"癸": "比肩", "壬": "劫財", "乙": "食神", "甲": "傷官", "丁": "偏財",
           "丙": "正財", "己": "七殺", "戊": "正官", "辛": "偏印", "庚": "正印"},
}


def true_solar_offset_minutes(longitude: float, standard_meridian: float = 120.0) -> float:
    """每 15 度經度差 = 1 小時時差"""
    return (longitude - standard_meridian) * 4.0


def calculate(year: int, month: int, day: int, hour: int, minute: int = 0,
              sect: int = 2, longitude: Optional[float] = None,
              standard_meridian: Optional[float] = None) -> dict:
    """
    八字計算（用 lunar-python，無需 C++ 編譯）

    立春為年柱邊界、節氣為月柱邊界、子時派別由 sect 控制。

    真太陽時校正：
        若 longitude 指定 → 用 standard_meridian 校正
        standard_meridian 預設值 = round(longitude/15)*15（自動從經度推時區子午線）
        台灣可直接傳 longitude=121.5；美西可傳 longitude=-122.4 不需指定 meridian。
    """
    try:
        from lunar_python import Solar
    except ImportError:
        raise RuntimeError(
            "八字計算需要 lunar-python 套件。請執行：pip install lunar-python"
        )

    # 真太陽時校正
    if longitude is not None:
        # 自動推算當地標準時區子午線：每 15° 一個時區
        if standard_meridian is None:
            standard_meridian = round(longitude / 15) * 15
        offset = true_solar_offset_minutes(longitude, standard_meridian)
        total_min = hour * 60 + minute + int(offset)
        day_offset = total_min // (24 * 60)
        total_min %= (24 * 60)
        hour = total_min // 60
        minute = total_min % 60
        if day_offset:
            from datetime import date as _d, timedelta
            adj = _d(year, month, day) + timedelta(days=day_offset)
            year, month, day = adj.year, adj.month, adj.day

    solar = Solar.fromYmdHms(year, month, day, hour, minute, 0)
    lunar = solar.getLunar()
    ec = lunar.getEightChar()
    ec.setSect(sect)

    pillars = {
        "year":  [ec.getYearGan(),  ec.getYearZhi()],
        "month": [ec.getMonthGan(), ec.getMonthZhi()],
        "day":   [ec.getDayGan(),   ec.getDayZhi()],
        "time":  [ec.getTimeGan(),  ec.getTimeZhi()],
    }

    # 五行統計
    counts = {"木": 0, "火": 0, "土": 0, "金": 0, "水": 0}
    for g, z in pillars.values():
        counts[WUXING_GAN[g]] += 1
        counts[WUXING_ZHI[z]] += 1

    nayin = {
        "year":  ec.getYearNaYin(),
        "month": ec.getMonthNaYin(),
        "day":   ec.getDayNaYin(),
        "time":  ec.getTimeNaYin(),
    }

    day_master = pillars["day"][0]
    shishen = {
        "year":  SHISHEN[day_master].get(pillars["year"][0]),
        "month": SHISHEN[day_master].get(pillars["month"][0]),
        "time":  SHISHEN[day_master].get(pillars["time"][0]),
    }

    return {
        "pillars": pillars,
        "dayMaster": day_master,
        "dayMasterYinYang": YIN_YANG_GAN[day_master],
        "dayMasterWuxing": WUXING_GAN[day_master],
        "wuxing": {
            "counts": counts,
            "missing": [k for k, v in counts.items() if v == 0],
            "strongest": max(counts, key=lambda k: counts[k]),
        },
        "nayin": nayin,
        "shishen": shishen,
        "additional": {
            "mingGong": ec.getMingGong(),
            "shenGong": ec.getShenGong(),
            "taiYuan": ec.getTaiYuan(),
            "taiXi": ec.getTaiXi(),
        },
        "lunarDate": {
            "year": lunar.getYear(),
            "month": lunar.getMonth(),
            "day": lunar.getDay(),
            "isLeapMonth": lunar.getMonth() < 0,
        },
        "meta": {
            "sect": sect,
            "longitudeAdjusted": longitude is not None,
        },
    }
