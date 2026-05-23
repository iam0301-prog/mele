"""Numerology engine.

This calculator keeps the common master numbers 11 / 22 / 33, but also returns
their single-digit base numbers so the UI can show both schools clearly.
"""

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
    11: ("靈感型協調者", "11 是 2 的高敏感版本：直覺強、感受細，容易接收到很多靈感，也更需要穩定情緒與界線。"),
    22: ("實踐型建造者", "22 是 4 的放大版本：有把願景落地的能力，但要避免把所有責任都扛在自己身上。"),
    33: ("療癒型守護者", "33 是 6 的放大版本：很適合陪伴、教學與照顧，但要先學會不犧牲自己。"),
}


def calculate(year: int, month: int, day: int) -> dict:
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

    return {
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
            f"你的主數以 {display_number(life_path)} 呈現。"
            if is_master
            else f"你的主數是 {life_path}。"
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
    }
