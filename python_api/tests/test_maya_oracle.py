"""
Maya Oracle 黃金測試
與 JS 版本 (packages/calc/src/maya.js) 對齊；遵循 Argüelles' Dreamspell 標準。
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from engines.maya import calculate_oracle, kin_info, calculate, ANALOG_TABLE


# 與 JS 對齊的黃金預期值（直接從 JS 跑出來的結果）
# 格式：kin -> {guide, analog, antipode, occult}
GOLDEN_ORACLE = {
    # 對齊官方 Argüelles Pacal Votan Oracle，多重交叉驗證 (galacticark, soultivation, timewaves)
    1:   {"guide":   1, "analog": 118, "antipode": 131, "occult": 260},  # 磁性紅龍
    34:  {"guide": 138, "analog": 125, "antipode": 164, "occult": 227},  # 銀河白巫師
    100: {"guide": 256, "analog": 139, "antipode": 230, "occult": 161},  # 太陽黃太陽
    207: {"guide": 259, "analog":  12, "antipode":  77, "occult":  54},  # 水晶藍手
    260: {"guide": 104, "analog":  39, "antipode": 130, "occult":   1},  # 宇宙黃太陽
}


def test_oracle_golden():
    """Oracle 5 個位置必須與 Argüelles 標準一致"""
    for kin, expected in GOLDEN_ORACLE.items():
        o = calculate_oracle(kin)
        assert o["self"] == kin
        for pos in ("guide", "analog", "antipode", "occult"):
            assert o[pos] == expected[pos], (
                f"Kin {kin} {pos}: expected {expected[pos]}, got {o[pos]}"
            )


def test_occult_property():
    """Occult: kin_self + kin_occult = 261"""
    for kin in [1, 34, 100, 130, 207, 260]:
        o = calculate_oracle(kin)
        assert kin + o["occult"] == 261


def test_antipode_seal_diff_10():
    """Antipode: seal 差 10、同 tone"""
    for kin in [1, 34, 100, 207]:
        o = calculate_oracle(kin)
        self_seal = ((kin - 1) % 20) + 1
        ant_seal = ((o["antipode"] - 1) % 20) + 1
        diff = abs(self_seal - ant_seal)
        # diff = 10 (mod 20)
        assert diff == 10
        # tone 相同
        assert ((kin - 1) % 13) + 1 == ((o["antipode"] - 1) % 13) + 1


def test_analog_table_completeness():
    """Analog 表必須涵蓋全部 1-20"""
    assert len(ANALOG_TABLE) == 20
    for k in range(1, 21):
        assert k in ANALOG_TABLE
        assert 1 <= ANALOG_TABLE[k] <= 20


def test_analog_symmetric():
    """Analog 應該對稱：analog(analog(k)) = k"""
    for seal in range(1, 21):
        partner = ANALOG_TABLE[seal]
        assert ANALOG_TABLE[partner] == seal, (
            f"Asymmetric pair: {seal} -> {partner} -> {ANALOG_TABLE[partner]}"
        )


def test_guide_for_magnetic_tone_is_self():
    """tone 1 (磁性) 的 Guide 永遠是自己"""
    # tone 1 的 Kin: 1, 14, 27, 40, ..., 261-13=248 (跳到 1)
    for kin in [1, 14, 27, 40, 53, 66, 79, 92, 105, 118, 131, 144, 157, 170, 183, 196, 209, 222, 235, 248]:
        o = calculate_oracle(kin)
        assert o["guide"] == kin, f"Kin {kin}: guide should be self, got {o['guide']}"


def test_guide_same_color_family():
    """Guide 必與 Self 同色族 (Red/White/Blue/Yellow)"""
    for kin in [1, 34, 52, 100, 162, 207, 260]:
        o = calculate_oracle(kin)
        self_color = ((kin - 1) % 20) % 4   # 0..3
        guide_seal = ((o["guide"] - 1) % 20) + 1
        guide_color = (guide_seal - 1) % 4
        assert self_color == guide_color, (
            f"Kin {kin}: guide color mismatch (self {self_color}, guide {guide_color})"
        )


def test_guide_oracle_known_kins():
    """Guide 必符合官方公開記載"""
    # 來源：galacticark, soultivation, timewaves
    expected_guide_seal = {
        52:  16,   # Yellow Cosmic Human → guide Yellow Warrior
        162: 2,    # White Rhythmic Wind → guide White Wind (self)
        260: 4,    # Yellow Cosmic Sun → guide Yellow Seed (Flowering)
        9:   5,    # Red Solar Moon → guide Red Serpent
        100: 16,   # Yellow Solar Sun → guide Yellow Warrior (Intelligence)
        121: 17,   # Red Self-Existing Dragon → guide Red Earth (Navigation)
    }
    for kin, exp_seal in expected_guide_seal.items():
        o = calculate_oracle(kin)
        actual_seal = ((o["guide"] - 1) % 20) + 1
        assert actual_seal == exp_seal, (
            f"Kin {kin}: guide seal expected {exp_seal}, got {actual_seal}"
        )


def test_anchor_kin():
    """1987-07-26 必為 Kin 34（錨點定義）"""
    r = calculate(1987, 7, 26)
    assert r["kin"] == 34


def test_known_dates():
    """已知歷史日期"""
    # 馬雅末日（公開歷史對照）
    assert calculate(2012, 12, 21)["kin"] == 207
    # Yellow Galactic Seed Year start
    assert calculate(2013, 7, 26)["kin"] == 164


def test_starroot_crosscheck_current_date():
    """Starroot Mayan Oracle: 2026-04-29."""
    r = calculate(2026, 4, 29)
    s = r["starroot"]
    assert s["dreamspell"]["kin"] == 141
    assert s["dreamspell"]["label"] == "Spectral Red Dragon"
    assert s["classicTzolkin"]["label"] == "6 Kab'an"
    assert s["haab"]["label"] == "10 Wo'"
    assert s["longCount"]["label"] == "13.0.13.9.17"
    assert s["longCount"]["starrootLabel"] == "0.0.13.9.17"
    assert s["longCount"]["starrootCycle"] == 1
    assert s["thirteenMoon"]["moon"] == 10
    assert s["thirteenMoon"]["day"] == 26


def test_starroot_crosscheck_reference_dates():
    """Starroot Mayan Oracle reference dates from public pages/search snippets."""
    apr_15 = calculate(2026, 4, 15)["starroot"]
    assert apr_15["dreamspell"]["kin"] == 127
    assert apr_15["dreamspell"]["label"] == "Planetary Blue Hand"
    assert apr_15["classicTzolkin"]["label"] == "5 Ak'b'al"
    assert apr_15["haab"]["label"] == "16 Pop"
    assert apr_15["longCount"]["starrootLabel"] == "0.0.13.9.3"
    assert apr_15["thirteenMoon"]["label"] == "moon:10 day:12"

    oct_13 = calculate(2025, 10, 13)["starroot"]
    assert oct_13["dreamspell"]["kin"] == 203
    assert oct_13["dreamspell"]["label"] == "Galactic Blue Night"
    assert oct_13["classicTzolkin"]["label"] == "3 Kawak"
    assert oct_13["haab"]["label"] == "17 Yax"
    assert oct_13["longCount"]["starrootLabel"] == "0.0.12.17.19"
    assert oct_13["thirteenMoon"]["label"] == "moon:3 day:24"


def test_starroot_crosscheck_celebrity_birthdays():
    """Five public celebrity birthdays cross-checked against Starroot pages."""
    cases = [
        {
            "name": "Steve Jobs",
            "date": (1955, 2, 24),
            "kin": 162,
            "dreamspell": "Rhythmic White Wind",
            "tzolkin": "9 Ajaw",
            "haab": "13 Pax",
            "long_count": "12.17.1.6.0",
            "thirteen_moon": "moon:8 day:18",
        },
        {
            "name": "Taylor Swift",
            "date": (1989, 12, 13),
            "kin": 124,
            "dreamspell": "Resonant Yellow Seed",
            "tzolkin": "6 Chuwen",
            "haab": "9 Mak",
            "long_count": "12.18.16.11.11",
            "thirteen_moon": "moon:6 day:1",
        },
        {
            "name": "Elon Musk",
            "date": (1971, 6, 28),
            "kin": 146,
            "dreamspell": "Electric White WorldBridger",
            "tzolkin": "10 Lamat",
            "haab": "16 Sotz'",
            "long_count": "12.17.17.16.8",
            "thirteen_moon": "moon:13 day:2",
        },
        {
            "name": "Barack Obama",
            "date": (1961, 8, 4),
            "kin": 173,
            "dreamspell": "Self-Existing Red Skywalker",
            "tzolkin": "9 B'en",
            "haab": "11 Xul",
            "long_count": "12.17.7.15.13",
            "thirteen_moon": "moon:1 day:10",
        },
        {
            "name": "Beyonce",
            "date": (1981, 9, 4),
            "kin": 224,
            "dreamspell": "Electric Yellow Seed",
            "tzolkin": "13 Muluk",
            "haab": "7 Mol",
            "long_count": "12.18.8.4.9",
            "thirteen_moon": "moon:2 day:13",
        },
    ]

    for case in cases:
        y, m, d = case["date"]
        result = calculate(y, m, d)
        starroot = result["starroot"]

        assert result["kin"] == case["kin"], case["name"]
        assert starroot["dreamspell"]["label"] == case["dreamspell"], case["name"]
        assert starroot["classicTzolkin"]["label"] == case["tzolkin"], case["name"]
        assert starroot["haab"]["label"] == case["haab"], case["name"]
        assert starroot["longCount"]["starrootLabel"] == case["long_count"], case["name"]
        assert starroot["thirteenMoon"]["label"] == case["thirteen_moon"], case["name"]


def test_determinism():
    """同一輸入必同一輸出"""
    r1 = calculate(1990, 5, 15)
    r2 = calculate(1990, 5, 15)
    assert r1 == r2


if __name__ == "__main__":
    import sys
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    test_oracle_golden()
    test_occult_property()
    test_antipode_seal_diff_10()
    test_analog_table_completeness()
    test_analog_symmetric()
    test_guide_for_magnetic_tone_is_self()
    test_guide_same_color_family()
    test_guide_oracle_known_kins()
    test_anchor_kin()
    test_known_dates()
    test_starroot_crosscheck_current_date()
    test_starroot_crosscheck_reference_dates()
    test_starroot_crosscheck_celebrity_birthdays()
    test_determinism()
    print("All Maya tests passed [OK]")
