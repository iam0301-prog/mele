"""
八字 BaZi — 使用 lunar-python（純 Python，無需 C++ Build Tools）

lunar-python 是 6tail 的 lunar-javascript 同源 Python 移植，
標準農曆 / 八字 / 節氣計算庫，與 sxtwl 等價但不需要編譯。

裝法：pip install lunar-python
"""

GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

# 各地支藏干的本氣（正氣/司令），用於穩定判定藏干主次
# 本氣：代表地支本身五行的天干，影響力最強
ZHI_BENCI = {
    "子": "癸",  # 子屬水，本氣癸（子只藏癸一干）
    "丑": "己",  # 丑屬土，本氣己
    "寅": "甲",  # 寅屬木，本氣甲
    "卯": "乙",  # 卯屬木，本氣乙
    "辰": "戊",  # 辰屬土，本氣戊
    "巳": "丙",  # 巳屬火，本氣丙
    "午": "丁",  # 午屬火，本氣丁
    "未": "己",  # 未屬土，本氣己
    "申": "庚",  # 申屬金，本氣庚
    "酉": "辛",  # 酉屬金，本氣辛
    "戌": "戊",  # 戌屬土，本氣戊
    "亥": "壬",  # 亥屬水，本氣壬
}

WUXING_GAN = {
    "甲": "木",
    "乙": "木",
    "丙": "火",
    "丁": "火",
    "戊": "土",
    "己": "土",
    "庚": "金",
    "辛": "金",
    "壬": "水",
    "癸": "水",
}
WUXING_ZHI = {
    "子": "水",
    "丑": "土",
    "寅": "木",
    "卯": "木",
    "辰": "土",
    "巳": "火",
    "午": "火",
    "未": "土",
    "申": "金",
    "酉": "金",
    "戌": "土",
    "亥": "水",
}

YIN_YANG_GAN = {
    "甲": "陽",
    "丙": "陽",
    "戊": "陽",
    "庚": "陽",
    "壬": "陽",
    "乙": "陰",
    "丁": "陰",
    "己": "陰",
    "辛": "陰",
    "癸": "陰",
}

# 60 甲子納音（簡表）
NAYIN_TABLE = {
    "甲子": "海中金",
    "乙丑": "海中金",
    "丙寅": "爐中火",
    "丁卯": "爐中火",
    "戊辰": "大林木",
    "己巳": "大林木",
    "庚午": "路旁土",
    "辛未": "路旁土",
    "壬申": "劍鋒金",
    "癸酉": "劍鋒金",
    "甲戌": "山頭火",
    "乙亥": "山頭火",
    "丙子": "澗下水",
    "丁丑": "澗下水",
    "戊寅": "城牆土",
    "己卯": "城牆土",
    "庚辰": "白臘金",
    "辛巳": "白臘金",
    "壬午": "楊柳木",
    "癸未": "楊柳木",
    "甲申": "泉中水",
    "乙酉": "泉中水",
    "丙戌": "屋上土",
    "丁亥": "屋上土",
    "戊子": "霹靂火",
    "己丑": "霹靂火",
    "庚寅": "松柏木",
    "辛卯": "松柏木",
    "壬辰": "長流水",
    "癸巳": "長流水",
    "甲午": "沙中金",
    "乙未": "沙中金",
    "丙申": "山下火",
    "丁酉": "山下火",
    "戊戌": "平地木",
    "己亥": "平地木",
    "庚子": "壁上土",
    "辛丑": "壁上土",
    "壬寅": "金箔金",
    "癸卯": "金箔金",
    "甲辰": "覆燈火",
    "乙巳": "覆燈火",
    "丙午": "天河水",
    "丁未": "天河水",
    "戊申": "大驛土",
    "己酉": "大驛土",
    "庚戌": "釵釧金",
    "辛亥": "釵釧金",
    "壬子": "桑柘木",
    "癸丑": "桑柘木",
    "甲寅": "大溪水",
    "乙卯": "大溪水",
    "丙辰": "沙中土",
    "丁巳": "沙中土",
    "戊午": "天上火",
    "己未": "天上火",
    "庚申": "石榴木",
    "辛酉": "石榴木",
    "壬戌": "大海水",
    "癸亥": "大海水",
}

# 十神（以日干為主）
SHISHEN = {
    "甲": {
        "甲": "比肩",
        "乙": "劫財",
        "丙": "食神",
        "丁": "傷官",
        "戊": "偏財",
        "己": "正財",
        "庚": "七殺",
        "辛": "正官",
        "壬": "偏印",
        "癸": "正印",
    },
    "乙": {
        "乙": "比肩",
        "甲": "劫財",
        "丁": "食神",
        "丙": "傷官",
        "己": "偏財",
        "戊": "正財",
        "辛": "七殺",
        "庚": "正官",
        "癸": "偏印",
        "壬": "正印",
    },
    "丙": {
        "丙": "比肩",
        "丁": "劫財",
        "戊": "食神",
        "己": "傷官",
        "庚": "偏財",
        "辛": "正財",
        "壬": "七殺",
        "癸": "正官",
        "甲": "偏印",
        "乙": "正印",
    },
    "丁": {
        "丁": "比肩",
        "丙": "劫財",
        "己": "食神",
        "戊": "傷官",
        "辛": "偏財",
        "庚": "正財",
        "癸": "七殺",
        "壬": "正官",
        "乙": "偏印",
        "甲": "正印",
    },
    "戊": {
        "戊": "比肩",
        "己": "劫財",
        "庚": "食神",
        "辛": "傷官",
        "壬": "偏財",
        "癸": "正財",
        "甲": "七殺",
        "乙": "正官",
        "丙": "偏印",
        "丁": "正印",
    },
    "己": {
        "己": "比肩",
        "戊": "劫財",
        "辛": "食神",
        "庚": "傷官",
        "癸": "偏財",
        "壬": "正財",
        "乙": "七殺",
        "甲": "正官",
        "丁": "偏印",
        "丙": "正印",
    },
    "庚": {
        "庚": "比肩",
        "辛": "劫財",
        "壬": "食神",
        "癸": "傷官",
        "甲": "偏財",
        "乙": "正財",
        "丙": "七殺",
        "丁": "正官",
        "戊": "偏印",
        "己": "正印",
    },
    "辛": {
        "辛": "比肩",
        "庚": "劫財",
        "癸": "食神",
        "壬": "傷官",
        "乙": "偏財",
        "甲": "正財",
        "丁": "七殺",
        "丙": "正官",
        "己": "偏印",
        "戊": "正印",
    },
    "壬": {
        "壬": "比肩",
        "癸": "劫財",
        "甲": "食神",
        "乙": "傷官",
        "丙": "偏財",
        "丁": "正財",
        "戊": "七殺",
        "己": "正官",
        "庚": "偏印",
        "辛": "正印",
    },
    "癸": {
        "癸": "比肩",
        "壬": "劫財",
        "乙": "食神",
        "甲": "傷官",
        "丁": "偏財",
        "丙": "正財",
        "己": "七殺",
        "戊": "正官",
        "辛": "偏印",
        "庚": "正印",
    },
}

# 神煞查表（以年支或日支推）
# 桃花：看年支或日支所在三合局的敗地
TAOHUA = {
    "子": "酉", "丑": "午", "寅": "卯", "卯": "子",
    "辰": "酉", "巳": "午", "午": "卯", "未": "子",
    "申": "酉", "酉": "午", "戌": "卯", "亥": "子",
}
# 驛馬：寅申巳亥互換，子午卯酉各推
YIMA = {
    "寅": "申", "午": "申", "戌": "申",
    "申": "寅", "子": "寅", "辰": "寅",
    "巳": "亥", "酉": "亥", "丑": "亥",
    "亥": "巳", "卯": "巳", "未": "巳",
}
# 天乙貴人：以日干查（陽貴在上、陰貴在下，共兩地支）
TIANYI = {
    "甲": ["丑", "未"], "戊": ["丑", "未"], "庚": ["丑", "未"],
    "乙": ["子", "申"], "己": ["子", "申"],
    "丙": ["亥", "酉"], "丁": ["亥", "酉"],
    "壬": ["卯", "巳"], "癸": ["卯", "巳"],
    "辛": ["午", "寅"],
}
# 華蓋：以年支推
HUAGAI = {
    "子": "辰", "丑": "丑", "寅": "戌", "卯": "未",
    "辰": "辰", "巳": "丑", "午": "戌", "未": "未",
    "申": "辰", "酉": "丑", "戌": "戌", "亥": "未",
}
# 將星：以年支推（三合局的帝旺之地）
JIANGXING = {
    "子": "子", "午": "午", "卯": "卯", "酉": "酉",
    "寅": "午", "午_2": "午", "戌": "午",
    "申": "子", "子_2": "子", "辰": "子",
    "亥": "卯", "卯_2": "卯", "未": "卯",
    "巳": "酉", "酉_2": "酉", "丑": "酉",
}

# 五行旺衰：日主五行在各月令的旺相休囚死
# 月支 -> 日主五行 -> 旺衰狀態
WANG_XIANG_TABLE = {
    "寅": {"木": "旺", "火": "相", "土": "死", "金": "囚", "水": "休"},
    "卯": {"木": "旺", "火": "相", "土": "死", "金": "囚", "水": "休"},
    "辰": {"木": "相", "火": "死", "土": "旺", "金": "休", "水": "囚"},
    "巳": {"木": "死", "火": "旺", "土": "相", "金": "囚", "水": "休"},
    "午": {"木": "死", "火": "旺", "土": "相", "金": "囚", "水": "休"},
    "未": {"木": "死", "火": "相", "土": "旺", "金": "休", "水": "囚"},
    "申": {"木": "囚", "火": "死", "土": "休", "金": "旺", "水": "相"},
    "酉": {"木": "囚", "火": "死", "土": "休", "金": "旺", "水": "相"},
    "戌": {"木": "囚", "火": "休", "土": "旺", "金": "相", "水": "死"},
    "亥": {"木": "相", "火": "囚", "土": "死", "金": "休", "水": "旺"},
    "子": {"木": "相", "火": "囚", "土": "死", "金": "休", "水": "旺"},
    "丑": {"木": "囚", "火": "休", "土": "旺", "金": "相", "水": "死"},
}

# 簡繁轉換對照（lunar-python 部分 API 回傳簡體字）
_SIMP_TO_TRAD: dict[str, str] = {
    # 十神
    "劫财": "劫財", "伤官": "傷官", "偏财": "偏財",
    "正财": "正財", "七杀": "七殺",
    # 十二長生
    "长生": "長生", "冠带": "冠帶", "临官": "臨官",
    "养": "養", "绝": "絕",
    # 納音（60 甲子 30 種音，12 種含簡體字，統一用 NAYIN_TABLE 的名稱）
    "杨柳木": "楊柳木", "白蜡金": "白臘金",
    "剑锋金": "劍鋒金", "山头火": "山頭火", "涧下水": "澗下水",
    "炉中火": "爐中火", "覆灯火": "覆燈火", "钗钏金": "釵釧金",
    "长流水": "長流水", "霹雳火": "霹靂火", "大驿土": "大驛土",
    "城头土": "城牆土",   # lunar-python 用城頭土，NAYIN_TABLE 用城牆土，統一後者
}


def _to_trad(s: object) -> str:
    """将 lunar-python 回傳的簡體字轉為繁體，未命中者原字回傳。"""
    text = str(s) if s is not None else ""
    return _SIMP_TO_TRAD.get(text, text)


# 十神格局意義（給解讀用）
SHISHEN_PATTERN_MEANING = {
    "正官": "循規有序，適合體制內或有規範架構的工作，重視名聲與責任",
    "七殺": "有魄力、抗壓強，適合競爭環境，需注意壓力過大時的衝動反應",
    "正印": "有學習力與庇護緣，適合教育、研究，但需注意過度依賴",
    "偏印": "思維獨特、直覺強，適合創意或靈性領域，需留意孤立傾向",
    "正財": "踏實務實，重視穩定收入，適合長期積累，但對風險較保守",
    "偏財": "財運靈活，善於開拓機會，適合業務或理財，但消費模式波動",
    "食神": "才藝豐富、有口福，善於創作與表達，生活享受感強",
    "傷官": "才華外露、個性鮮明，有創新力，與權威的關係需要刻意經營",
    "比肩": "獨立自主，有主見，喜自力完成，需留意與同輩的競爭",
    "劫財": "行動力強、善於資源整合，但對金錢的得失較大起大落",
}


def true_solar_offset_minutes(longitude: float, standard_meridian: float = 120.0) -> float:
    """每 15 度經度差 = 1 小時時差"""
    return (longitude - standard_meridian) * 4.0


def _compute_shensha(day_gan: str, year_zhi: str, day_zhi: str, all_zhi: list[str]) -> list[dict]:
    """計算常見神煞：天乙貴人、桃花、驛馬、華蓋"""
    zhi_set = set(all_zhi)
    result = []

    # 天乙貴人（以日干查，看四柱地支是否命中）
    tianyi_zhis = TIANYI.get(day_gan, [])
    hit_tianyi = [z for z in tianyi_zhis if z in zhi_set]
    if hit_tianyi:
        result.append({
            "name": "天乙貴人",
            "hit": True,
            "zhi": hit_tianyi,
            "desc": "貴人扶助力較強，重要時刻易遇到關鍵助緣。"
        })

    # 桃花：年支與日支各自查，命中的都報（非互斥）
    # 同一目標地支若同時由年支和日支推算，合併來源標籤
    taohua_hits: list[str] = []
    taohua_hit_bases: dict[str, list[str]] = {}  # 目標地支 -> [來源標籤]
    for base_zhi, base_label in ((year_zhi, "年支"), (day_zhi, "日支")):
        target = TAOHUA.get(base_zhi)
        if target and target in zhi_set:
            if target not in taohua_hit_bases:
                taohua_hits.append(target)
                taohua_hit_bases[target] = []
            taohua_hit_bases[target].append(base_label)
    if taohua_hits:
        bases_str = "、".join(
            "、".join(taohua_hit_bases[t]) for t in taohua_hits
        )
        result.append({
            "name": "桃花",
            "hit": True,
            "zhi": taohua_hits,
            "desc": f"命盤含桃花（{bases_str}推）：人際魅力強，感情易有機緣，需留意情感的分寸。"
        })

    # 驛馬：年支與日支各自查，命中的都報（非互斥）
    yima_hits: list[str] = []
    yima_hit_bases: dict[str, list[str]] = {}
    for base_zhi, base_label in ((year_zhi, "年支"), (day_zhi, "日支")):
        target = YIMA.get(base_zhi)
        if target and target in zhi_set:
            if target not in yima_hit_bases:
                yima_hits.append(target)
                yima_hit_bases[target] = []
            yima_hit_bases[target].append(base_label)
    if yima_hits:
        bases_str = "、".join(
            "、".join(yima_hit_bases[t]) for t in yima_hits
        )
        result.append({
            "name": "驛馬",
            "hit": True,
            "zhi": yima_hits,
            "desc": f"命盤含驛馬（{bases_str}推）：善於移動、遷徙、出差，生涯中變動機率較高。"
        })

    # 華蓋（以年支推）
    huagai_zhi = HUAGAI.get(year_zhi)
    if huagai_zhi and huagai_zhi in zhi_set:
        result.append({
            "name": "華蓋",
            "hit": True,
            "zhi": [huagai_zhi],
            "desc": "命盤含華蓋：藝術、靈性傾向明顯，適合創作或研究型工作，孤獨感也相對較強。"
        })

    return result


def _assess_strength(day_wuxing: str, month_zhi: str, gan_list: list[str], zhi_list: list[str]) -> dict:
    """
    評估日主強弱（得令 + 得地 + 得勢）

    得令：月支五行生扶日主
    得地：日支（坐支）五行生扶日主
    得勢：四柱中生扶日主的干支數量佔多數

    強弱標準：
      旺/相 = 得令；囚/休/死 = 失令
      生扶數 >= 3 = 偏強；<= 1 = 偏弱
    """
    month_state = WANG_XIANG_TABLE.get(month_zhi, {}).get(day_wuxing, "")

    # 得令判斷
    de_ling = month_state in ("旺", "相")

    # 生扶日主的五行：比劫（同）+ 印星（生）
    SHENG_FU = {
        "木": {"木", "水"},  # 水生木，木比木
        "火": {"火", "木"},
        "土": {"土", "火"},
        "金": {"金", "土"},
        "水": {"水", "金"},
    }
    support_set = SHENG_FU.get(day_wuxing, set())

    # 克洩日主的五行：官殺（克我）+ 食傷（我生/洩）+ 財（我克/耗）
    # 木：金克木（官殺）、火為木生（食傷）、土為木克（財）
    # 火：水克火（官殺）、土為火生（食傷）、金為火克（財）
    # 土：木克土（官殺）、金為土生（食傷）、水為土克（財）
    # 金：火克金（官殺）、水為金生（食傷）、木為金克（財）
    # 水：土克水（官殺）、木為水生（食傷）、火為水克（財）
    KEMU = {
        "木": {"金", "火", "土"},
        "火": {"水", "土", "金"},
        "土": {"木", "金", "水"},
        "金": {"火", "水", "木"},
        "水": {"土", "木", "火"},
    }
    drain_set = KEMU.get(day_wuxing, set())

    support_count = 0
    drain_count = 0
    for g in gan_list:
        wx = WUXING_GAN.get(g, "")
        if wx in support_set:
            support_count += 1
        elif wx in drain_set:
            drain_count += 1
    for z in zhi_list:
        wx = WUXING_ZHI.get(z, "")
        if wx in support_set:
            support_count += 1
        elif wx in drain_set:
            drain_count += 1

    # 得地：日支是否生扶日主
    day_zhi_wx = WUXING_ZHI.get(zhi_list[2], "") if len(zhi_list) > 2 else ""
    de_di = day_zhi_wx in support_set

    # 得勢：全盤生扶多於克洩
    de_shi = support_count > drain_count

    # 綜合判斷
    if de_ling and (de_di or de_shi):
        strength = "身強"
        strength_desc = f"日主得月令（{month_state}），且盤中生扶力較充足，初步傾向身強。用神方向可考慮洩秀（食傷）或財官，需合參全局確認。"
    elif de_ling:
        strength = "中和偏強"
        strength_desc = f"日主得月令（{month_state}），整體初步傾向偏強。可考慮食傷洩秀或財星，仍需觀察三合刑衝。"
    elif not de_ling and not de_di and not de_shi:
        strength = "身弱"
        strength_desc = f"日主失令（{month_state}），盤中生扶不足，初步傾向身弱。用神方向可考慮印星或比劫扶身，需合參全局確認。"
    else:
        strength = "中和偏弱"
        strength_desc = f"日主失令（{month_state}），但仍有部分生扶。初步傾向偏弱，用神以印比為參考，仍需觀察月令與大運。"

    return {
        "monthState": month_state,
        "deLing": de_ling,
        "deDi": de_di,
        "deShiScore": {"support": support_count, "drain": drain_count},
        "strength": strength,
        "desc": strength_desc,
    }


def _determine_pattern(
    day_master: str,
    day_wuxing: str,
    month_hidden_ss: list[str],  # 月支藏干十神（本氣在前）
    strength: str,
) -> dict:
    """
    傳統八字取格：以月支藏干本氣的十神為格，本氣不透天干時看中氣。

    傳統格局八格：
      正官格、七殺格（偏官格）、正印格、偏印格（梟印格）、
      正財格、偏財格、食神格、傷官格
    比劫在月支時稱建祿格或月劫格（非普通格）。
    """
    # 過濾掉空值，取月支藏干十神
    valid_ss = [ss for ss in month_hidden_ss if ss]
    dominant = valid_ss[0] if valid_ss else ""  # 本氣優先

    # 繁體統一
    TRAD = {
        "劫财": "劫財", "伤官": "傷官", "偏财": "偏財",
        "正财": "正財", "七杀": "七殺",
    }
    dominant = TRAD.get(dominant, dominant)

    pattern_map = {
        "正官": "正官格",
        "七殺": "七殺格（偏官格）",
        "正印": "正印格",
        "偏印": "偏印格（梟印格）",
        "正財": "正財格",
        "偏財": "偏財格",
        "食神": "食神格",
        "傷官": "傷官格",
        "比肩": "建祿格（月令比肩）",
        "劫財": "月劫格（月令劫財）",
    }
    pattern_name = pattern_map.get(dominant, f"{dominant}格" if dominant else "待定")
    meaning = SHISHEN_PATTERN_MEANING.get(dominant, "")

    # 用神建議（基於身強弱）
    if "強" in strength:
        yong_shen_hint = "初步傾向：身強宜洩（食傷）、制（官殺）或耗（財），需合參全局再定用神。"
    else:
        yong_shen_hint = "初步傾向：身弱宜生（印）或扶（比劫），避官殺財之重壓，仍需合參月令與三合確認。"

    return {
        "name": pattern_name,
        "dominant_shishen": dominant,
        "meaning": meaning,
        "yongShenHint": yong_shen_hint,
    }


def calculate(
    year: int,
    month: int,
    day: int,
    hour: int,
    minute: int = 0,
    sect: int = 2,
    longitude: float | None = None,
    standard_meridian: float | None = None,
    is_male: bool | None = None,
) -> dict:
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
    except ImportError as e:
        raise RuntimeError("八字計算需要 lunar-python 套件。請執行：pip install lunar-python") from e

    # 真太陽時校正
    if longitude is not None:
        if standard_meridian is None:
            standard_meridian = round(longitude / 15) * 15
        offset = true_solar_offset_minutes(longitude, standard_meridian)
        total_min = hour * 60 + minute + int(offset)
        day_offset = total_min // (24 * 60)
        total_min %= 24 * 60
        hour = total_min // 60
        minute = total_min % 60
        if day_offset:
            from datetime import date as _d
            from datetime import timedelta

            adj = _d(year, month, day) + timedelta(days=day_offset)
            year, month, day = adj.year, adj.month, adj.day

    solar = Solar.fromYmdHms(year, month, day, hour, minute, 0)
    lunar = solar.getLunar()
    ec = lunar.getEightChar()
    ec.setSect(sect)

    pillars = {
        "year": [ec.getYearGan(), ec.getYearZhi()],
        "month": [ec.getMonthGan(), ec.getMonthZhi()],
        "day": [ec.getDayGan(), ec.getDayZhi()],
        "time": [ec.getTimeGan(), ec.getTimeZhi()],
    }

    # ── 五行統計（天干 + 地支）──
    counts = {"木": 0, "火": 0, "土": 0, "金": 0, "水": 0}
    for g, z in pillars.values():
        counts[WUXING_GAN[g]] += 1
        counts[WUXING_ZHI[z]] += 1

    # 納音：直接查本地 NAYIN_TABLE（全繁體，不依賴 lunar-python 的簡體回傳）
    nayin = {
        key: NAYIN_TABLE.get(pillars[key][0] + pillars[key][1], "")
        for key in ("year", "month", "day", "time")
    }

    day_master = pillars["day"][0]
    day_wuxing = WUXING_GAN[day_master]

    # ── 天干十神 ──
    shishen_gan = {
        "year": ec.getYearShiShenGan(),
        "month": ec.getMonthShiShenGan(),
        "time": ec.getTimeShiShenGan(),
    }

    # ── 地支藏干 + 藏干十神 ──
    hidden_stems = {}
    shishen_zhi = {}
    for key, get_cang, get_ss_zhi in [
        ("year", ec.getYearHideGan, ec.getYearShiShenZhi),
        ("month", ec.getMonthHideGan, ec.getMonthShiShenZhi),
        ("day", ec.getDayHideGan, ec.getDayShiShenZhi),
        ("time", ec.getTimeHideGan, ec.getTimeShiShenZhi),
    ]:
        cang = get_cang()  # list of str
        ss = get_ss_zhi()  # list of str
        # 組合成 [{gan, shishen, role}, ...]
        # 本氣由 ZHI_BENCI 查表決定（不依賴 library 回傳順序），其餘依序為中氣/餘氣
        zhi_char = pillars[key][1]
        benci_gan = ZHI_BENCI.get(zhi_char, "")
        pairs = []
        role_counter = 0  # 追蹤非本氣的計數
        benci_assigned = False
        for i, g in enumerate(cang):
            if g == benci_gan and not benci_assigned:
                role = "本氣"
                benci_assigned = True
            else:
                role_counter += 1
                role = "中氣" if role_counter == 1 else "餘氣"
            pairs.append({
                "gan": g,
                "shishen": ss[i] if i < len(ss) else "",
                "role": role,
            })
        # 若本氣未命中（理論上不應發生），退回按順序分配
        if not benci_assigned and pairs:
            pairs[0]["role"] = "本氣"
        hidden_stems[key] = pairs
        shishen_zhi[key] = ss

    # ── 十二長生 ──
    chang_sheng = {
        "year": ec.getYearDiShi(),
        "month": ec.getMonthDiShi(),
        "day": ec.getDayDiShi(),
        "time": ec.getTimeDiShi(),
    }

    # ── 大運 ──
    yun_data = None
    # is_male：預設按年干陰陽判斷（陽年男命、陰年女命常見順逆）
    # 若呼叫者沒指定，API 不知道性別，給男命預設
    _is_male = True if is_male is None else is_male
    try:
        yun = ec.getYun(_is_male, sect)
        start_year = yun.getStartYear()
        start_month = yun.getStartMonth()
        is_forward = yun.isForward()
        da_yun_list = yun.getDaYun()

        steps = []
        for dy in da_yun_list[1:9]:  # 跳過幼年空白格，取前8步
            gz = dy.getGanZhi()
            if not gz:
                continue
            gan = gz[0] if len(gz) >= 1 else ""
            zhi = gz[1] if len(gz) >= 2 else ""
            steps.append({
                "ganZhi": gz,
                "gan": gan,
                "zhi": zhi,
                "shishenGan": SHISHEN.get(day_master, {}).get(gan, ""),
                "startAge": dy.getStartAge(),
                "endAge": dy.getEndAge(),
                "startYear": dy.getStartYear(),
                "endYear": dy.getEndYear(),
            })

        yun_data = {
            "startAge": start_year,
            "startMonth": start_month,
            "isForward": is_forward,
            "steps": steps,
        }
    except Exception:
        yun_data = None

    # ── 神煞 ──
    all_zhi = [pillars["year"][1], pillars["month"][1], pillars["day"][1], pillars["time"][1]]
    shensha = _compute_shensha(day_master, pillars["year"][1], pillars["day"][1], all_zhi)

    # ── 日主強弱 ──
    all_gan = [pillars["year"][0], pillars["month"][0], pillars["day"][0], pillars["time"][0]]
    month_zhi = pillars["month"][1]
    strength_data = _assess_strength(day_wuxing, month_zhi, all_gan, all_zhi)

    # ── 格局 ──
    # 傳統取格：月支藏干本氣十神為主（本氣在 hidden_stems["month"][0]）
    month_hidden_ss = [s.get("shishen", "") for s in hidden_stems.get("month", [])]
    pattern_data = _determine_pattern(day_master, day_wuxing, month_hidden_ss, strength_data["strength"])

    # ── 簡繁轉換（lunar-python 部分回傳簡體，統一轉繁體後再回傳）──
    nayin = {k: _to_trad(v) for k, v in nayin.items()}
    chang_sheng = {k: _to_trad(v) for k, v in chang_sheng.items()}
    shishen_gan = {k: _to_trad(v) for k, v in shishen_gan.items()}
    shishen_zhi = {k: [_to_trad(s) for s in v] for k, v in shishen_zhi.items()}
    for _key in hidden_stems:
        for _stem in hidden_stems[_key]:
            _stem["shishen"] = _to_trad(_stem["shishen"])
    if yun_data:
        for _step in yun_data.get("steps", []):
            _step["shishenGan"] = _to_trad(_step["shishenGan"])

    return {
        "pillars": pillars,
        "dayMaster": day_master,
        "dayMasterYinYang": YIN_YANG_GAN[day_master],
        "dayMasterWuxing": day_wuxing,
        "wuxing": {
            "counts": counts,
            "missing": [k for k, v in counts.items() if v == 0],
            "strongest": max(counts, key=lambda k: counts[k]),
        },
        "nayin": nayin,
        "shishen": shishen_gan,
        "hiddenStems": hidden_stems,
        "shishenZhi": shishen_zhi,
        "changSheng": chang_sheng,
        "daYun": yun_data,
        "shensha": shensha,
        "strength": strength_data,
        "pattern": pattern_data,
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
            "isMale": _is_male,
        },
    }
