"""
瑪雅 Tzolkin Dreamspell
錨點 1987-07-26 (UTC) = Kin 34 (8 Wizard / 8 白巫師)
"""
from datetime import date

ANCHOR = date(1987, 7, 26)
ANCHOR_KIN = 34

SOLAR_SEALS = [
    {"idx": 1, "zh": "紅龍", "en": "Red Dragon", "element": "火"},
    {"idx": 2, "zh": "白風", "en": "White Wind", "element": "風"},
    {"idx": 3, "zh": "藍夜", "en": "Blue Night", "element": "水"},
    {"idx": 4, "zh": "黃種子", "en": "Yellow Seed", "element": "土"},
    {"idx": 5, "zh": "紅蛇", "en": "Red Serpent", "element": "火"},
    {"idx": 6, "zh": "白世界橋", "en": "White Worldbridger", "element": "風"},
    {"idx": 7, "zh": "藍手", "en": "Blue Hand", "element": "水"},
    {"idx": 8, "zh": "黃星星", "en": "Yellow Star", "element": "土"},
    {"idx": 9, "zh": "紅月", "en": "Red Moon", "element": "火"},
    {"idx": 10, "zh": "白狗", "en": "White Dog", "element": "風"},
    {"idx": 11, "zh": "藍猴", "en": "Blue Monkey", "element": "水"},
    {"idx": 12, "zh": "黃人", "en": "Yellow Human", "element": "土"},
    {"idx": 13, "zh": "紅天行者", "en": "Red Skywalker", "element": "火"},
    {"idx": 14, "zh": "白巫師", "en": "White Wizard", "element": "風"},
    {"idx": 15, "zh": "藍鷹", "en": "Blue Eagle", "element": "水"},
    {"idx": 16, "zh": "黃戰士", "en": "Yellow Warrior", "element": "土"},
    {"idx": 17, "zh": "紅地球", "en": "Red Earth", "element": "火"},
    {"idx": 18, "zh": "白鏡", "en": "White Mirror", "element": "風"},
    {"idx": 19, "zh": "藍風暴", "en": "Blue Storm", "element": "水"},
    {"idx": 20, "zh": "黃太陽", "en": "Yellow Sun", "element": "土"},
]

GALACTIC_TONES = [
    {"idx": 1, "zh": "磁性", "en": "Magnetic", "power": "目的"},
    {"idx": 2, "zh": "月亮", "en": "Lunar", "power": "挑戰"},
    {"idx": 3, "zh": "電力", "en": "Electric", "power": "服務"},
    {"idx": 4, "zh": "自我存在", "en": "Self-Existing", "power": "形式"},
    {"idx": 5, "zh": "超頻", "en": "Overtone", "power": "光輝"},
    {"idx": 6, "zh": "韻律", "en": "Rhythmic", "power": "平等"},
    {"idx": 7, "zh": "共振", "en": "Resonant", "power": "頻道"},
    {"idx": 8, "zh": "銀河星系", "en": "Galactic", "power": "和諧"},
    {"idx": 9, "zh": "太陽", "en": "Solar", "power": "意圖"},
    {"idx": 10, "zh": "行星", "en": "Planetary", "power": "顯化"},
    {"idx": 11, "zh": "光譜", "en": "Spectral", "power": "解放"},
    {"idx": 12, "zh": "水晶", "en": "Crystal", "power": "合作"},
    {"idx": 13, "zh": "宇宙", "en": "Cosmic", "power": "存在"},
]

CLASSIC_TZOLKIN_SEALS = [
    {"idx": 1, "name": "Imix'", "zh": "鱷魚 / 紅龍"},
    {"idx": 2, "name": "Ik'", "zh": "風"},
    {"idx": 3, "name": "Ak'b'al", "zh": "夜"},
    {"idx": 4, "name": "K'an", "zh": "種子"},
    {"idx": 5, "name": "Chikchan", "zh": "蛇"},
    {"idx": 6, "name": "Kimi", "zh": "死亡 / 世界橋"},
    {"idx": 7, "name": "Manik'", "zh": "鹿 / 手"},
    {"idx": 8, "name": "Lamat", "zh": "星星"},
    {"idx": 9, "name": "Muluk", "zh": "月亮 / 水"},
    {"idx": 10, "name": "Ok", "zh": "狗"},
    {"idx": 11, "name": "Chuwen", "zh": "猴"},
    {"idx": 12, "name": "Eb'", "zh": "人 / 道路"},
    {"idx": 13, "name": "B'en", "zh": "蘆葦 / 天行者"},
    {"idx": 14, "name": "Ix", "zh": "巫師 / 美洲豹"},
    {"idx": 15, "name": "Men", "zh": "鷹"},
    {"idx": 16, "name": "Kib'", "zh": "戰士 / 禿鷹"},
    {"idx": 17, "name": "Kab'an", "zh": "地球"},
    {"idx": 18, "name": "Etz'nab'", "zh": "鏡"},
    {"idx": 19, "name": "Kawak", "zh": "風暴"},
    {"idx": 20, "name": "Ajaw", "zh": "太陽 / 主"},
]

HAAB_MONTHS = [
    {"idx": 0, "name": "Pop", "zh": "Pop"},
    {"idx": 1, "name": "Wo'", "zh": "Wo'"},
    {"idx": 2, "name": "Sip", "zh": "Sip"},
    {"idx": 3, "name": "Sotz'", "zh": "Sotz'"},
    {"idx": 4, "name": "Sek", "zh": "Sek"},
    {"idx": 5, "name": "Xul", "zh": "Xul"},
    {"idx": 6, "name": "Yaxk'in'", "zh": "Yaxk'in'"},
    {"idx": 7, "name": "Mol", "zh": "Mol"},
    {"idx": 8, "name": "Ch'en", "zh": "Ch'en"},
    {"idx": 9, "name": "Yax", "zh": "Yax"},
    {"idx": 10, "name": "Sak'", "zh": "Sak'"},
    {"idx": 11, "name": "Keh", "zh": "Keh"},
    {"idx": 12, "name": "Mak", "zh": "Mak"},
    {"idx": 13, "name": "K'ank'in", "zh": "K'ank'in"},
    {"idx": 14, "name": "Muwan'", "zh": "Muwan'"},
    {"idx": 15, "name": "Pax", "zh": "Pax"},
    {"idx": 16, "name": "K'ayab'", "zh": "K'ayab'"},
    {"idx": 17, "name": "Kumk'u", "zh": "Kumk'u"},
    {"idx": 18, "name": "Wayeb'", "zh": "Wayeb'"},
]

LONG_COUNT_13_BAKTUN = date(2012, 12, 21)
LONG_COUNT_13_BAKTUN_DAYS = 13 * 144000


def count_leap_days(start: date, end: date) -> int:
    """Dreamspell 規則：跳過 2/29"""
    if start > end:
        return -count_leap_days(end, start)
    count = 0
    for y in range(start.year, end.year + 1):
        leap = (y % 4 == 0 and y % 100 != 0) or (y % 400 == 0)
        if not leap:
            continue
        feb29 = date(y, 2, 29)
        if start <= feb29 <= end:
            count += 1
    return count


def kin_info(kin: int) -> dict:
    seal_num = ((kin - 1) % 20) + 1
    tone_num = ((kin - 1) % 13) + 1
    return {
        "kin": kin,
        "sealNum": seal_num,
        "toneNum": tone_num,
        "seal": SOLAR_SEALS[seal_num - 1],
        "tone": GALACTIC_TONES[tone_num - 1],
        "label": f"{GALACTIC_TONES[tone_num - 1]['zh']} {SOLAR_SEALS[seal_num - 1]['zh']}",
    }


def days_since_13_baktun(target: date) -> int:
    return (target - LONG_COUNT_13_BAKTUN).days


def long_count_info(target: date) -> dict:
    """GMT correlation, with Starroot-style post-2012 cycle display."""
    total = LONG_COUNT_13_BAKTUN_DAYS + days_since_13_baktun(target)
    if total < 0:
        raise ValueError("Long Count cross-check does not support dates before the Long Count epoch")

    baktun = total // 144000
    rem = total % 144000
    katun = rem // 7200
    rem %= 7200
    tun = rem // 360
    rem %= 360
    uinal = rem // 20
    kin = rem % 20

    cycle = baktun // 13
    star_baktun = baktun % 13
    return {
        "totalDays": total,
        "baktun": baktun,
        "katun": katun,
        "tun": tun,
        "uinal": uinal,
        "kin": kin,
        "label": f"{baktun}.{katun}.{tun}.{uinal}.{kin}",
        "starrootCycle": cycle,
        "starrootLabel": f"{star_baktun}.{katun}.{tun}.{uinal}.{kin}",
    }


def classic_tzolkin_info(target: date) -> dict:
    diff = days_since_13_baktun(target)
    # 2012-12-21 is widely cross-referenced as 4 Ajaw.
    tone_num = ((diff + 3) % 13) + 1
    seal_num = ((diff + 19) % 20) + 1
    seal = CLASSIC_TZOLKIN_SEALS[seal_num - 1]
    return {
        "toneNum": tone_num,
        "sealNum": seal_num,
        "seal": seal,
        "label": f"{tone_num} {seal['name']}",
    }


def haab_info(target: date) -> dict:
    diff = days_since_13_baktun(target)
    # 2012-12-21 is 3 K'ank'in in the traditional Haab count.
    haab_index = (13 * 20 + 3 + diff) % 365
    if haab_index >= 360:
        month_idx = 18
        day_num = haab_index - 360
    else:
        month_idx = haab_index // 20
        day_num = haab_index % 20
    month = HAAB_MONTHS[month_idx]
    return {
        "day": day_num,
        "monthNum": month_idx,
        "month": month,
        "label": f"{day_num} {month['name']}",
    }


def thirteen_moon_info(target: date) -> dict:
    start = date(target.year, 7, 26)
    if target < start:
        start = date(target.year - 1, 7, 26)
    diff = (target - start).days

    if diff == 364:
        return {"moon": None, "day": None, "label": "Day Out of Time", "dayOutOfTime": True}
    if diff > 364:
        diff = 0

    moon = diff // 28 + 1
    day = diff % 28 + 1
    return {"moon": moon, "day": day, "label": f"moon:{moon} day:{day}", "dayOutOfTime": False}


def starroot_crosscheck(target: date) -> dict:
    return {
        "dreamspell": None,  # filled by calculate()
        "classicTzolkin": classic_tzolkin_info(target),
        "haab": haab_info(target),
        "longCount": long_count_info(target),
        "thirteenMoon": thirteen_moon_info(target),
        "source": "Starroot Mayan Oracle cross-check format",
    }


def find_kin(seal: int, tone: int) -> int | None:
    for k in range(1, 261):
        if ((k - 1) % 20) + 1 == seal and ((k - 1) % 13) + 1 == tone:
            return k
    return None


# Argüelles Dreamspell 標準對應表
# Analog (支持) 配對 — 官方 Foundation for the Law of Time 標準
# 規則：seal 1-18 兩兩配對 sum=19；seal 19↔20 配對
# 例：Wind (2) ↔ Earth (17)、Dragon (1) ↔ Mirror (18)
# 驗證來源：Kin 162 (White Wind) 官方 Analog = Red Earth
ANALOG_TABLE = {
    1: 18,   # Dragon  ↔ Mirror
    2: 17,   # Wind    ↔ Earth
    3: 16,   # Night   ↔ Warrior
    4: 15,   # Seed    ↔ Eagle
    5: 14,   # Serpent ↔ Wizard
    6: 13,   # Worldbridger ↔ Skywalker
    7: 12,   # Hand    ↔ Human
    8: 11,   # Star    ↔ Monkey
    9: 10,   # Moon    ↔ Dog
    10: 9, 11: 8, 12: 7, 13: 6, 14: 5, 15: 4, 16: 3, 17: 2, 18: 1,
    19: 20,  # Storm   ↔ Sun
    20: 19,
}


def calculate_oracle(kin: int) -> dict:
    """
    Galactic Mayan Cross — 5 kin oracle
    遵循 José Argüelles' Dreamspell（與 JS 版本一致、與 Pacal Votan Oracle 對齊）

    公式（業界標準）：
      指引 (Guide):    seal_offset = (tone-1)*4 mod 20，同 tone
                        例：tone 1/6/11 偏移 0 → guide = self
      支持 (Analog):   依 ANALOG_TABLE 配對（多數 seal_a + seal_b = 20）
                        同 tone
      挑戰 (Antipode): seal + 10 mod 20，同 tone
      隱藏 (Occult):   seal_b = 21 - seal_a，tone_b = 14 - tone_a
                        即 kin_self + kin_occult = 261
    """
    seal_num = ((kin - 1) % 20) + 1
    tone_num = ((kin - 1) % 13) + 1

    # 指引 (Guide) — 官方 Argüelles Pacal Votan Oracle
    # 規則：guide 與 self 同色族 (Red/White/Blue/Yellow)、tone 相同
    #   依 tone 在 5 位置循環，每個 tone 對應一個「家族內位置位移」
    # 表格由公開資料反推（Kin 52, 100, 162, 260 等多重交叉驗證）：
    #   tone_mod (tone-1)%5 → guide 在同色族的位移
    #     0 (tone 1, 6, 11) → +0  (self-guided)
    #     1 (tone 2, 7, 12) → +3
    #     2 (tone 3, 8, 13) → +1
    #     3 (tone 4, 9)     → +4
    #     4 (tone 5, 10)    → +2
    GUIDE_FAMILY_OFFSET = {0: 0, 1: 3, 2: 1, 3: 4, 4: 2}
    color_index = (seal_num - 1) % 4         # 0=紅 1=白 2=藍 3=黃
    self_pos = (seal_num - 1) // 4           # 0..4 在同色族裡的位置
    tone_mod = (tone_num - 1) % 5
    guide_pos = (self_pos + GUIDE_FAMILY_OFFSET[tone_mod]) % 5
    guide_seal = color_index + 1 + guide_pos * 4

    # 支持 (Analog) — 業界標準：Earth Family 配對表
    analog_seal = ANALOG_TABLE[seal_num]

    # 挑戰 (Antipode) — seal + 10 mod 20
    antipode_seal = ((seal_num - 1 + 10) % 20) + 1

    # 隱藏 (Occult) — 鏡像對稱
    occult_seal = 21 - seal_num
    if occult_seal <= 0:
        occult_seal += 20
    occult_tone = 14 - tone_num
    if occult_tone <= 0:
        occult_tone += 13

    return {
        "self": kin,
        "guide": find_kin(guide_seal, tone_num),
        "analog": find_kin(analog_seal, tone_num),
        "antipode": find_kin(antipode_seal, tone_num),
        "occult": find_kin(occult_seal, occult_tone),
    }


def calculate(year: int, month: int, day: int, include_leap_day: bool = False) -> dict:
    target = date(year, month, day)
    diff = (target - ANCHOR).days
    if not include_leap_day:
        diff -= count_leap_days(ANCHOR, target)
    kin = ((ANCHOR_KIN - 1 + diff) % 260) + 1
    info = kin_info(kin)
    oracle = calculate_oracle(kin)
    starroot = starroot_crosscheck(target)
    starroot["dreamspell"] = {
        "kin": kin,
        "tone": info["tone"]["en"],
        "seal": info["seal"]["en"].replace("Worldbridger", "WorldBridger"),
        "label": f"{info['tone']['en']} {info['seal']['en'].replace('Worldbridger', 'WorldBridger')}",
    }
    return {
        **info,
        "oracle": {k: kin_info(v) if v else None for k, v in oracle.items()},
        "starroot": starroot,
    }
