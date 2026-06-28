"""Numerology engine — Pythagorean system.

Keeps master numbers 11 / 22 / 33 throughout.
Returns single-digit bases alongside so the UI can show both schools clearly.

Added in v2: Personal Year, four Pinnacles, four Challenges, Pinnacle age ranges.
"""

from datetime import date

MASTER_NUMBERS = {11, 22, 33}


def sum_digits(n: int) -> int:
    return sum(int(c) for c in str(abs(n)))


def reduce_to_single(n: int) -> int:
    cur = n
    while cur > 9:
        cur = sum_digits(cur)
    return cur


def reduce_with_master(n: int) -> int:
    cur = n
    while cur > 9 and cur not in MASTER_NUMBERS:
        cur = sum_digits(cur)
    return cur


def display_number(value: int) -> str:
    base = reduce_to_single(value)
    return f"{value}/{base}" if value in MASTER_NUMBERS else str(value)


MEANINGS = {
    1: ("開創者", "重視自主、方向與主導權，遇到事情時常先想：我要怎麼開始。"),
    2: ("協調者", "敏感、重視關係與氣氛，擅長讀懂別人的感受，也容易被關係牽動。"),
    3: ("表達者", "透過語言、創意與分享整理自己，越能說清楚，越能找回力量。"),
    4: ("建造者", "需要結構、秩序與可落地的方法，適合把想法一步步做成成果。"),
    5: ("探索者", "需要變化、自由與新鮮感，卡住時通常不是不努力，而是空間太窄。"),
    6: ("守護者", "重視責任、關係與照顧，容易把別人的需求放到自己前面。"),
    7: ("研究者", "需要理解事情背後的原因，適合深度學習、觀察與建立自己的答案。"),
    8: ("管理者", "關心成就、資源與現實結果，適合練習權力、金錢與責任的平衡。"),
    9: ("整合者", "看重意義、包容與完成，人生常在學習放下、整理與服務更大的方向。"),
    11: (
        "靈感型協調者",
        "11 是 2 的高敏感版本：直覺強、感受細，容易接收到很多靈感，也更需要穩定情緒與界線。",
    ),
    22: ("實踐型建造者", "22 是 4 的放大版本：有把願景落地的能力，但要避免把所有責任都扛在自己身上。"),
    33: ("療癒型守護者", "33 是 6 的放大版本：很適合陪伴、教學與照顧，但要先學會不犧牲自己。"),
}


# ── 巔峰數含義（畢氏靈數標準詮釋）──
PINNACLE_MEANINGS = {
    1: "以主動開創為主題的人生階段，適合建立個人方向、承擔領導位置。",
    2: "以合作與關係為主題，重要轉折常透過夥伴、談判或情感連結發生。",
    3: "以表達與創意為主題，透過溝通、創作或社交拓展影響力的時期。",
    4: "以扎實建造為主題，適合累積基礎、建立系統，走捷徑反而繞遠。",
    5: "以變動與自由為主題，環境、職涯或關係可能有明顯的轉折與更新。",
    6: "以責任與照顧為主題，家庭、感情或社群角色是這段時間的主軸。",
    7: "以深化與反思為主題，適合內省、研究或靈性探索，獨處時間有益。",
    8: "以資源與成就為主題，財務、事業與現實影響力進入較關鍵的測試期。",
    9: "以完成與整合為主題，清理舊模式、結束舊關係，為下一循環騰出空間。",
    11: "11/2 大師巔峰：靈感與感召的高壓期，直覺強但情緒管理同等重要。",
    22: "22/4 大師巔峰：把大型願景落地成真實影響力的關鍵建造期。",
    33: "33/6 大師巔峰：透過照顧與服務影響更多人，也要先照顧好自身根基。",
}

# ── 挑戰數含義 ──
CHALLENGE_MEANINGS = {
    0: "挑戰數 0：各方向均需自律，沒有單一明顯短板，反而更需要主動為自己設定標準。",
    1: "挑戰在過度依賴與過度強勢之間取得平衡，學習獨立而不孤立、主導而不強迫。",
    2: "挑戰在情緒敏感與關係過度配合之間保持自我，學習合作的同時說出清楚需求。",
    3: "挑戰在表達的誠實度，容易用忙碌或玩笑迴避真感受，需要練習把話說到位。",
    4: "挑戰在過度控制與逃避責任之間，需要在秩序和彈性之間找到可持續的中間點。",
    5: "挑戰在分散注意力與害怕承諾，需要在自由中培養對真正重要事物的穩定專注。",
    6: "挑戰在過度付出與責任感超載，需要在照顧他人的同時保護自身的界線。",
    7: "挑戰在過度懷疑或自我封閉，需要在分析理解之外，也接受部分的不確定性。",
    8: "挑戰在資源與權力的使用方式，需要學習讓成就為更大目標服務而非只圖個人佔有。",
}

# ── 流年數含義（純九年循環，1–9，不保留大師數）──
PERSONAL_YEAR_MEANINGS = {
    1: "流年 1：九年大循環的起點。適合啟動新計畫、確立個人方向，主動行動比等待更有效。",
    2: "流年 2：耐心與關係年。建立連結、推進合作；急著衝刺容易適得其反，重點在調頻。",
    3: "流年 3：表達與擴展年。社交、創作、溝通能量旺，適合讓想法被更多人看見。",
    4: "流年 4：建造與落地年。適合夯實基礎、整理系統；這一年做的工事，是未來的底氣。",
    5: "流年 5：變動與自由年。環境、人際或方向可能有轉折，適合擁抱彈性而非死守舊局。",
    6: "流年 6：責任與照顧年。家庭、感情或社群議題浮出；承擔有回報，但要留意邊界。",
    7: "流年 7：反思與內省年。適合深化專業、靈性或內在整理；急著外擴反而容易走偏。",
    8: "流年 8：豐收與資源年。財務、職涯有機會顯化成果，關鍵是有策略地投入而非躁進。",
    9: "流年 9：完成與清場年。放下不再適合的人事物，整理一個九年大循環，為 1 年鋪路。",
}


def _calc_pinnacles(month_reduced: int, day_reduced: int, year_reduced: int) -> list[int]:
    """四個巔峰數（畢氏靈數標準公式）"""
    p1 = reduce_with_master(month_reduced + day_reduced)
    p2 = reduce_with_master(day_reduced + year_reduced)
    p3 = reduce_with_master(p1 + p2)
    p4 = reduce_with_master(month_reduced + year_reduced)
    return [p1, p2, p3, p4]


def _calc_challenges(month: int, day: int, year: int) -> list[int]:
    """四個挑戰數（差值，化簡至單一數字不保留大師數）
    注：巔峰數為和，可出現大師數；挑戰數為差，屬不同流派慣例，化簡至 0–8。
    """
    ms = reduce_to_single(month)
    ds = reduce_to_single(day)
    ys = reduce_to_single(year)
    c1 = abs(ds - ms)
    c2 = abs(ys - ds)
    c3 = abs(c1 - c2)
    c4 = abs(ms - ys)
    return [c1, c2, c3, c4]


def _calc_personal_year(month: int, day: int, current_year: int | None = None) -> int:
    """流年數 = 純九年循環（1–9），不保留大師數，與 PERSONAL_YEAR_MEANINGS 保持一致"""
    if current_year is None:
        current_year = date.today().year
    ms = reduce_to_single(month)
    ds = reduce_to_single(day)
    ys = reduce_to_single(current_year)
    return reduce_to_single(ms + ds + ys)


def _pinnacle_age_ranges(life_path_base: int) -> list[dict]:
    """四個巔峰的年齡分界（第一巔峰結束年齡 = 36 - 生命靈數底色數）"""
    end1 = 36 - life_path_base
    end2 = end1 + 9
    end3 = end1 + 18
    return [
        {"index": 1, "startAge": 0, "endAge": end1},
        {"index": 2, "startAge": end1 + 1, "endAge": end2},
        {"index": 3, "startAge": end2 + 1, "endAge": end3},
        {"index": 4, "startAge": end3 + 1, "endAge": None},
    ]


def calculate(year: int, month: int, day: int) -> dict:
    # ── 基礎計算 ──
    year_reduced = reduce_with_master(year)
    month_reduced = reduce_with_master(month)
    day_reduced = reduce_with_master(day)
    total = year_reduced + month_reduced + day_reduced
    life_path = reduce_with_master(total)
    life_path_reduced = reduce_to_single(life_path)
    birth_day = reduce_with_master(day)
    birth_day_reduced = reduce_to_single(birth_day)

    name_lp, desc_lp = MEANINGS.get(life_path, ("生命節奏", "這個數字代表你一生反覆練習的核心節奏。"))
    name_bd, desc_bd = MEANINGS.get(birth_day, ("生日天賦", "生日數代表你自然帶出的能力與表達方式。"))
    is_master = life_path in MASTER_NUMBERS
    is_birth_day_master = birth_day in MASTER_NUMBERS

    # ── 流年數（使用系統當前年份）──
    current_year = date.today().year
    personal_year = _calc_personal_year(month, day, current_year)
    personal_year_display = display_number(personal_year)
    # S1：優先查精確值，再 fallback 底色數，確保空值不出現
    personal_year_meaning = PERSONAL_YEAR_MEANINGS.get(
        personal_year,
        PERSONAL_YEAR_MEANINGS.get(reduce_to_single(personal_year), ""),
    )

    # ── 四個巔峰數 ──
    pinnacle_numbers = _calc_pinnacles(month_reduced, day_reduced, year_reduced)
    age_ranges = _pinnacle_age_ranges(life_path_reduced)
    pinnacles = []
    for i, (pnum, ages) in enumerate(zip(pinnacle_numbers, age_ranges, strict=False)):
        pname, pdesc = MEANINGS.get(pnum, ("", ""))
        end_str = str(ages["endAge"]) if ages["endAge"] is not None else "之後"
        pinnacles.append(
            {
                "index": i + 1,
                "number": pnum,
                "display": display_number(pnum),
                "archetype": pname,
                "startAge": ages["startAge"],
                "endAge": ages["endAge"],
                "ageLabel": f"{ages['startAge']}–{end_str} 歲",
                "meaning": PINNACLE_MEANINGS.get(pnum, pdesc),
            }
        )

    # ── 四個挑戰數 ──
    challenge_numbers = _calc_challenges(month, day, year)
    # 挑戰數年齡區間同巔峰數
    challenges = []
    for i, (cnum, ages) in enumerate(zip(challenge_numbers, age_ranges, strict=False)):
        end_str = str(ages["endAge"]) if ages["endAge"] is not None else "之後"
        challenges.append(
            {
                "index": i + 1,
                "number": cnum,
                "ageLabel": f"{ages['startAge']}–{end_str} 歲",
                "meaning": CHALLENGE_MEANINGS.get(cnum, ""),
            }
        )

    # ── 組合洞察：生命靈數 × 生日數 ──
    lp_base = life_path_reduced
    bd_base = birth_day_reduced
    if lp_base == bd_base:
        combo_note = f"主數與生日數底色相同（都是 {lp_base}），能量集中，容易走得深，需注意避免過度單一。"
    elif {lp_base, bd_base} <= {1, 4, 7}:
        combo_note = "主數與生日數同屬建構型（1/4/7），邏輯性強、重視結構，行動力是優勢，彈性是功課。"
    elif {lp_base, bd_base} <= {2, 5, 8}:
        combo_note = "主數與生日數同屬感應型（2/5/8），感受細膩、擅長關係，需留意情緒邊界不過度吸收外部壓力。"
    elif {lp_base, bd_base} <= {3, 6, 9}:
        combo_note = "主數與生日數同屬表達型（3/6/9），創意與照顧能量充沛，容易為他人付出超出自己的餘裕。"
    else:
        combo_note = (
            f"主數 {life_path}（{name_lp}）與生日數 {birth_day}（{name_bd}）屬不同族群，"
            f"代表日常能力與人生主題存在互補張力——生日數是練習場，主數是目的地。"
        )

    return {
        # ── 原有欄位 ──
        "lifePath": life_path,
        "lifePathReduced": life_path_reduced,
        "lifePathDisplay": display_number(life_path),
        "birthDay": birth_day,
        "birthDayReduced": birth_day_reduced,
        "birthDayDisplay": display_number(birth_day),
        "isMaster": is_master,
        "isBirthDayMaster": is_birth_day_master,
        "masterNumber": life_path if is_master else None,
        "baseNumber": life_path_reduced,
        "calculationMethod": "保留大師數派：11 / 22 / 33 會保留，同時標示最後化簡的底色。",
        "calculationNote": (
            f"你的主數以 {display_number(life_path)} 呈現。" if is_master else f"你的主數是 {life_path}。"
        ),
        "breakdown": {
            "yearReduced": year_reduced,
            "monthReduced": month_reduced,
            "dayReduced": day_reduced,
            "total": total,
            "formula": f"{year_reduced} + {month_reduced} + {day_reduced} = {total} -> {display_number(life_path)}",
        },
        "lifePathArchetype": {"name": name_lp, "desc": desc_lp},
        "birthDayArchetype": {"name": name_bd, "desc": desc_bd},
        # ── 新增欄位 ──
        "personalYear": personal_year,
        "personalYearDisplay": personal_year_display,
        "personalYearCalendarYear": current_year,
        "personalYearMeaning": personal_year_meaning,
        "pinnacles": pinnacles,
        "challenges": challenges,
        "comboNote": combo_note,
    }
