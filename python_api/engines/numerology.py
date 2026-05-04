"""
靈數 Numerology — Pythagorean / Hans Decoz 派
保留大師數 11/22/33
"""
MASTER_NUMBERS = {11, 22, 33}


def sum_digits(n: int) -> int:
    return sum(int(c) for c in str(abs(n)))


def reduce_with_master(n: int) -> int:
    cur = n
    while cur > 9 and cur not in MASTER_NUMBERS:
        cur = sum_digits(cur)
    return cur


MEANINGS = {
    1: ("領導者", "獨立、開創、自我主導。挑戰：易自我中心、過度逞強。"),
    2: ("協調者", "敏感、合作、和諧。挑戰：猶豫、易受他人情緒影響。"),
    3: ("表達者", "創意、溝通、樂觀。挑戰：分散、缺乏專注。"),
    4: ("建造者", "務實、穩定、紀律。挑戰：固執、抗拒改變。"),
    5: ("探險者", "自由、變化、體驗。挑戰：難以承諾、躁動。"),
    6: ("照護者", "責任、家庭、付出。挑戰：過度承擔、犧牲自我。"),
    7: ("思考者", "靈性、洞察、獨處。挑戰：疏離、過度分析。"),
    8: ("實踐者", "權力、財富、成就。挑戰：物質執著、控制慾。"),
    9: ("完成者", "博愛、智慧、收尾。挑戰：理想化、放手困難。"),
    11: ("直覺大師", "高敏、靈感、啟發他人。挑戰：高壓、神經緊張。"),
    22: ("建造大師", "宏觀、實踐、改變世界格局。挑戰：壓力極大、自我懷疑。"),
    33: ("療癒大師", "無私、犧牲、教導療癒。挑戰：耗竭、邊界模糊。"),
}


def calculate(year: int, month: int, day: int) -> dict:
    yr = reduce_with_master(year)
    mr = reduce_with_master(month)
    dr = reduce_with_master(day)
    total = yr + mr + dr
    life_path = reduce_with_master(total)
    birth_day = reduce_with_master(day)
    name_lp, desc_lp = MEANINGS.get(life_path, ("", ""))
    name_bd, desc_bd = MEANINGS.get(birth_day, ("", ""))

    return {
        "lifePath": life_path,
        "birthDay": birth_day,
        "isMaster": life_path in MASTER_NUMBERS,
        "isBirthDayMaster": birth_day in MASTER_NUMBERS,
        "breakdown": {
            "yearReduced": yr,
            "monthReduced": mr,
            "dayReduced": dr,
            "total": total,
        },
        "lifePathArchetype": {"name": name_lp, "desc": desc_lp},
        "birthDayArchetype": {"name": name_bd, "desc": desc_bd},
    }
