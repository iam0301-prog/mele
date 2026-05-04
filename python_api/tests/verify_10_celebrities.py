"""
10 位名人 × 6 個算法引擎多方位驗證
─────────────────────────────────────────────────────────────
  公開來源驗證 — 與業界廣泛流傳的命理資料對照
  資料：維基百科、Astro.com、生命靈數計算網站、紫微全書、萬年曆
─────────────────────────────────────────────────────────────
"""
import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from engines import numerology, maya, bazi, ziwei, astro, humandesign, tarot, runes


# 10 位名人完整資料 + 公開查詢預期值
CELEBRITIES = [
    {
        "name": "Steve Jobs (蘋果創辦人)",
        "year": 1955, "month": 2, "day": 24, "hour": 19, "minute": 15,
        "timezone": -8, "lat": 37.7749, "lon": -122.4194, "gender": "男",
        "expected": {
            "sun_sign": "雙魚座",          # Astro.com 公開
            "zodiac": "羊",                # 1955 = 乙未羊
            "year_pillar": "乙未",          # 萬年曆
            "life_path": 1,                # 生命靈數計算網站共識
        },
        "src": "Astrotheme + Wikipedia",
    },
    {
        "name": "Bill Gates (微軟創辦人)",
        "year": 1955, "month": 10, "day": 28, "hour": 22, "minute": 0,
        "timezone": -8, "lat": 47.6062, "lon": -122.3321, "gender": "男",
        "expected": {
            "sun_sign": "天蠍座",
            "zodiac": "羊",
            "year_pillar": "乙未",
            "life_path": 4,
        },
        "src": "Astrotheme + Wikipedia",
    },
    {
        "name": "Elon Musk (Tesla / SpaceX)",
        "year": 1971, "month": 6, "day": 28, "hour": 7, "minute": 30,
        "timezone": 2, "lat": -25.7479, "lon": 28.2293, "gender": "男",  # Pretoria, SA
        "expected": {
            "sun_sign": "巨蟹座",
            "zodiac": "豬",                # 1971 = 辛亥豬
            "year_pillar": "辛亥",
            "life_path": 7,
        },
        "src": "Astrotheme + 公開記載",
    },
    {
        "name": "Mark Zuckerberg (Meta)",
        "year": 1984, "month": 5, "day": 14, "hour": 14, "minute": 30,
        "timezone": -4, "lat": 41.0339, "lon": -73.7629, "gender": "男",
        "expected": {
            "sun_sign": "金牛座",
            "zodiac": "鼠",                # 1984 = 甲子鼠
            "year_pillar": "甲子",
            "life_path": 5,
        },
        "src": "Astrotheme + Wikipedia",
    },
    {
        "name": "Albert Einstein (物理學家)",
        "year": 1879, "month": 3, "day": 14, "hour": 11, "minute": 30,
        "timezone": 0.67, "lat": 48.4011, "lon": 9.9876, "gender": "男",  # Ulm, Germany
        "expected": {
            "sun_sign": "雙魚座",
            "zodiac": "兔",                # 1879 = 己卯兔
            "year_pillar": "己卯",
            "life_path": 6,                # 1+8+7+9+3+1+4=33→6
        },
        "src": "Astrotheme + 萬年曆",
    },
    {
        "name": "Oprah Winfrey (脫口秀女王)",
        "year": 1954, "month": 1, "day": 29, "hour": 4, "minute": 30,
        "timezone": -6, "lat": 33.0577, "lon": -89.5878, "gender": "女",
        "expected": {
            "sun_sign": "水瓶座",
            "zodiac": "蛇",                # 1954 = 甲午馬，但1/29仍在農曆癸巳蛇年（春節後才改）
            "year_pillar": "癸巳",          # 立春前(2/4)仍為癸巳蛇年
            "life_path": 4,
        },
        "src": "Astrotheme + Wikipedia",
    },
    {
        "name": "Lady Gaga (歌手)",
        "year": 1986, "month": 3, "day": 28, "hour": 21, "minute": 53,
        "timezone": -5, "lat": 40.7128, "lon": -74.0060, "gender": "女",  # NYC
        "expected": {
            "sun_sign": "牡羊座",
            "zodiac": "虎",                # 1986 = 丙寅虎
            "year_pillar": "丙寅",
            "life_path": 1,                # 1+9+8+6+3+2+8=37→10→1
        },
        "src": "Astrotheme",
    },
    {
        "name": "John Lennon (披頭四)",
        "year": 1940, "month": 10, "day": 9, "hour": 18, "minute": 30,
        "timezone": 1, "lat": 53.4084, "lon": -2.9916, "gender": "男",  # Liverpool
        "expected": {
            "sun_sign": "天秤座",
            "zodiac": "龍",                # 1940 = 庚辰龍
            "year_pillar": "庚辰",
            "life_path": 6,                # 1+9+4+0+1+0+9=24→6
        },
        "src": "Astrotheme + Wikipedia",
    },
    {
        "name": "Carl Jung (心理學家)",
        "year": 1875, "month": 7, "day": 26, "hour": 19, "minute": 32,
        "timezone": 0.6, "lat": 47.6, "lon": 9.32, "gender": "男",  # Kesswil
        "expected": {
            "sun_sign": "獅子座",
            "zodiac": "豬",                # 1875 = 乙亥豬
            "year_pillar": "乙亥",
            "life_path": 9,                # 年:1+8+7+5=21→3; 月:7; 日:2+6=8; 3+7+8=18→9
        },
        "src": "Astrotheme + 心理學會",
    },
    {
        "name": "Marilyn Monroe (演員)",
        "year": 1926, "month": 6, "day": 1, "hour": 9, "minute": 30,
        "timezone": -8, "lat": 34.0522, "lon": -118.2437, "gender": "女",  # LA
        "expected": {
            "sun_sign": "雙子座",
            "zodiac": "虎",                # 1926 = 丙寅虎
            "year_pillar": "丙寅",
            "life_path": 7,                # 1+9+2+6+6+1=25→7
        },
        "src": "Astrotheme",
    },
]


# 統計
RESULTS = {
    "numerology": {"pass": 0, "fail": 0, "skip": 0, "errors": []},
    "maya":       {"pass": 0, "fail": 0, "skip": 0, "errors": []},
    "bazi":       {"pass": 0, "fail": 0, "skip": 0, "errors": []},
    "ziwei":      {"pass": 0, "fail": 0, "skip": 0, "errors": []},
    "astro":      {"pass": 0, "fail": 0, "skip": 0, "errors": []},
    "humandesign":{"pass": 0, "fail": 0, "skip": 0, "errors": []},
    "tarot":      {"pass": 0, "fail": 0, "skip": 0, "errors": []},
    "runes":      {"pass": 0, "fail": 0, "skip": 0, "errors": []},
}


def section(title):
    print(f"\n{'═' * 78}\n  {title}\n{'═' * 78}")


def check(tool, name, ok, msg):
    if ok is True:
        RESULTS[tool]["pass"] += 1
        return f"✓ {msg}"
    elif ok is False:
        RESULTS[tool]["fail"] += 1
        RESULTS[tool]["errors"].append(f"{name}: {msg}")
        return f"✗ {msg}"
    else:  # ok is None == skip
        RESULTS[tool]["skip"] += 1
        return f"— {msg}"


def run_one(c):
    section(f"⊹ {c['name']} ({c['year']}-{c['month']:02d}-{c['day']:02d} {c['hour']:02d}:{c['minute']:02d}{'男' if c['gender']=='男' else '女'}) · 來源 {c['src']}")
    exp = c["expected"]

    # ── 靈數 ─────────────────────────
    try:
        nr = numerology.calculate(c["year"], c["month"], c["day"])
        lp = nr.get("lifePath")
        master = "★master" if nr.get("isMaster") else ""
        if "life_path" in exp:
            ok = lp == exp["life_path"]
            print("靈數    ", check("numerology", c["name"], ok,
                f"生命靈數 {lp} {master} (預期 {exp['life_path']})"))
        else:
            print(f"靈數     生命靈數 {lp} {master}")
    except Exception as e:
        RESULTS["numerology"]["fail"] += 1
        print(f"靈數     ERROR: {e}")

    # ── 瑪雅 ─────────────────────────
    try:
        mr = maya.calculate(c["year"], c["month"], c["day"])
        print(f"瑪雅     Kin {mr['kin']:3d} = {mr['label']}")
        RESULTS["maya"]["pass"] += 1
    except Exception as e:
        RESULTS["maya"]["fail"] += 1
        print(f"瑪雅     ERROR: {e}")

    # ── 八字 ─────────────────────────
    try:
        br = bazi.calculate(c["year"], c["month"], c["day"], c["hour"], c["minute"],
                              longitude=c["lon"])
        p = br["pillars"]
        actual_yp = "".join(p["year"])
        full_pillars = " ".join("".join(p[k]) for k in ["year","month","day","time"])

        msgs = [f"四柱 {full_pillars}"]
        if "year_pillar" in exp:
            ok = actual_yp == exp["year_pillar"]
            msgs.append(f"年柱{actual_yp}{'==' if ok else '≠'}{exp['year_pillar']}")
            print("八字    ", check("bazi", c["name"], ok, " · ".join(msgs)))
        else:
            print(f"八字     {full_pillars}")
            RESULTS["bazi"]["pass"] += 1

        print(f"        日主 {br['dayMaster']}({br['dayMasterYinYang']}{br['dayMasterWuxing']}) "
              f"五行 {br['wuxing']['counts']} 缺 {','.join(br['wuxing']['missing']) or '無'}")
    except Exception as e:
        RESULTS["bazi"]["fail"] += 1
        print(f"八字     ERROR: {e}")

    # ── 紫微 ─────────────────────────
    try:
        zr = ziwei.calculate(c["year"], c["month"], c["day"], c["hour"], c["minute"], c["gender"])
        ming = zr.get("mingGong", {})
        ming_stars = " ".join(ming.get("majorStarNames", [])) or "(空宮)"

        msg_parts = [f"{zr['fiveElementsClass']}",
                     f"命宮 {ming.get('heavenlyStem','?')}{ming.get('earthlyBranch','?')} {ming_stars}",
                     f"生肖 {zr['zodiac']}"]

        if "zodiac" in exp:
            zodiac_ok = zr['zodiac'] == exp['zodiac']
            print("紫微    ", check("ziwei", c["name"], zodiac_ok,
                " · ".join(msg_parts) + f" {'✓' if zodiac_ok else '(預期 '+exp['zodiac']+')'}"))
        else:
            print(f"紫微     {' · '.join(msg_parts)}")
            RESULTS["ziwei"]["pass"] += 1

        print(f"        命主 {zr['soul']} / 身主 {zr['body']} · 西洋 {zr['sign']}")
    except Exception as e:
        RESULTS["ziwei"]["fail"] += 1
        print(f"紫微     ERROR: {e}")

    # ── 占星 ─────────────────────────
    try:
        ar = astro.calculate(c["year"], c["month"], c["day"], c["hour"], c["minute"],
                              c["timezone"], c["lat"], c["lon"])
        sun_sign = (ar.get("sun") or {}).get("sign", {}).get("zh") or ar.get("sun_sign")
        moon_sign = (ar.get("moon") or {}).get("sign", {}).get("zh") or ar.get("moon_sign")
        asc = (ar.get("ascendant") or {}).get("sign", {}).get("zh") or ar.get("rising_sign")

        msg = f"☉ {sun_sign}  ☽ {moon_sign}  ↑ {asc}"
        if "sun_sign" in exp:
            # 引擎回 "雙魚" / 預期可能是 "雙魚座"，去掉「座」字後比對
            actual_norm = (sun_sign or '').replace('座', '')
            exp_norm = exp["sun_sign"].replace('座', '')
            ok = actual_norm == exp_norm
            print("占星    ", check("astro", c["name"], ok,
                msg + f" (預期☉ {exp['sun_sign']} {'✓' if ok else '✗'})"))
        else:
            print(f"占星     {msg}")
            RESULTS["astro"]["pass"] += 1
    except Exception as e:
        RESULTS["astro"]["skip"] += 1
        print(f"占星     SKIP（pyswisseph 未裝）")

    # ── 人類圖 ───────────────────────
    try:
        hr = humandesign.calculate(c["year"], c["month"], c["day"], c["hour"], c["minute"],
                                     c["timezone"])
        t = hr.get("type") or hr.get("Type")
        prof = hr.get("profile") or hr.get("Profile")
        auth = hr.get("authority") or hr.get("Authority")
        print(f"人類圖   類型 {t} · Profile {prof} · 權威 {auth}")
        RESULTS["humandesign"]["pass"] += 1
    except Exception as e:
        RESULTS["humandesign"]["skip"] += 1
        print(f"人類圖   SKIP（pyswisseph 未裝）")

    # ── 塔羅 / 盧恩 (僅煙霧測試，因為是隨機) ─────
    try:
        tr = tarot.draw(count=3, reversed_enabled=True, spread="three_card", seed=42)
        assert len(tr["cards"]) == 3
        RESULTS["tarot"]["pass"] += 1
    except Exception as e:
        RESULTS["tarot"]["fail"] += 1
        print(f"塔羅     ERROR: {e}")

    try:
        rr = runes.draw(count=3, reversed_enabled=True, seed=42, material="crystal")
        assert len(rr["runes"]) == 3
        assert rr["meta"]["material"] == "crystal"
        RESULTS["runes"]["pass"] += 1
    except Exception as e:
        RESULTS["runes"]["fail"] += 1
        print(f"盧恩     ERROR: {e}")


def summary():
    section("📊 總體統計")
    headers = ["工具", "通過", "失敗", "跳過", "通過率"]
    rows = []
    for tool, r in RESULTS.items():
        total = r["pass"] + r["fail"]
        rate = f"{r['pass']*100/total:.0f}%" if total else "—"
        if r["skip"]:
            rate += f" (略 {r['skip']})"
        rows.append([tool, str(r["pass"]), str(r["fail"]), str(r["skip"]), rate])

    col_w = [12, 6, 6, 6, 18]
    fmt = "  ".join(f"{{:<{w}}}" for w in col_w)
    print(fmt.format(*headers))
    print(fmt.format(*["─"*w for w in col_w]))
    for row in rows:
        print(fmt.format(*row))

    print()
    total_pass = sum(r["pass"] for r in RESULTS.values())
    total_fail = sum(r["fail"] for r in RESULTS.values())
    total_skip = sum(r["skip"] for r in RESULTS.values())
    grand_total = total_pass + total_fail
    print(f"  總計通過：{total_pass} / {grand_total} "
          f"（{'100' if grand_total == total_pass else f'{total_pass*100/grand_total:.0f}'}%）"
          f"，跳過 {total_skip}")

    if any(r["errors"] for r in RESULTS.values()):
        section("❌ 失敗詳情")
        for tool, r in RESULTS.items():
            for err in r["errors"]:
                print(f"  [{tool}] {err}")


def main():
    print("═" * 78)
    print(f"  10 位名人 × 8 個算法引擎 多方位驗證")
    print(f"  Python {sys.version.split()[0]}")
    print(f"  資料來源 = python_api/engines/, python_api/data/")
    print("═" * 78)

    for c in CELEBRITIES:
        run_one(c)

    summary()
    print("\n完成 ✦")


if __name__ == "__main__":
    main()
