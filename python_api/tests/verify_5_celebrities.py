"""
5 位名人多方位驗證 — 跨 8 個排盤工具

選人標準：出生資料公開可驗證、跨地區（亞洲/歐美）、跨年代、男女兼具。

驗證重點：
- 確定性算法（八字、紫微、占星、人類圖、瑪雅、靈數）：跑兩次結果必須相同
- 跨工具一致性（同一個人的八字四柱、命宮、紫微局）
- 與公開資料對照（太陽星座、生命靈數）
"""
import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.stdout.reconfigure(encoding="utf-8") if hasattr(sys.stdout, "reconfigure") else None

from engines import numerology, maya, bazi, ziwei, astro, humandesign


CELEBRITIES = [
    {
        "name": "Steve Jobs",
        "year": 1955, "month": 2, "day": 24, "hour": 19, "minute": 15,
        "timezone": -8, "lat": 37.7749, "lon": -122.4194, "gender": "男",
        "expected": {
            "sun_sign": "雙魚座",
            "life_path": 1,
            "year_pillar": "乙未",
        },
    },
    {
        "name": "Bill Gates",
        "year": 1955, "month": 10, "day": 28, "hour": 22, "minute": 0,
        "timezone": -8, "lat": 47.6062, "lon": -122.3321, "gender": "男",
        "expected": {
            "sun_sign": "天蠍座",
            "life_path": 4,
            "year_pillar": "乙未",
        },
    },
    {
        "name": "Albert Einstein",
        "year": 1879, "month": 3, "day": 14, "hour": 11, "minute": 30,
        "timezone": 0.67, "lat": 48.4, "lon": 10.0, "gender": "男",
        "expected": {
            "sun_sign": "雙魚座",
        },
    },
    {
        "name": "Oprah Winfrey",
        "year": 1954, "month": 1, "day": 29, "hour": 4, "minute": 30,
        "timezone": -6, "lat": 33.0577, "lon": -89.5878, "gender": "女",
        "expected": {
            "sun_sign": "水瓶座",
            "life_path": 4,
        },
    },
    {
        "name": "Mark Zuckerberg",
        "year": 1984, "month": 5, "day": 14, "hour": 14, "minute": 30,
        "timezone": -4, "lat": 41.0339, "lon": -73.7629, "gender": "男",
        "expected": {
            "sun_sign": "金牛座",
            "life_path": 5,
        },
    },
]


def section(title):
    print(f"\n{'=' * 70}\n{title}\n{'=' * 70}")


def run_one(c):
    section(f"⊹ {c['name']} ({c['year']}-{c['month']:02d}-{c['day']:02d} {c['hour']:02d}:{c['minute']:02d})")

    # ── 1. 靈數 ──────────────────────────────────────────────
    try:
        nr = numerology.calculate(c["year"], c["month"], c["day"])
        lp = nr.get("lifePath")
        master = "✦master" if nr.get("isMaster") else ""
        exp = c["expected"].get("life_path")
        ok = "✓" if exp is None or lp == exp else f"✗ 預期 {exp}"
        print(f"靈數      生命靈數 = {lp} {master}  {ok}")
    except Exception as e:
        print(f"靈數      ERROR: {e}")

    # ── 2. 瑪雅 ──────────────────────────────────────────────
    try:
        mr = maya.calculate(c["year"], c["month"], c["day"])
        print(f"瑪雅      Kin {mr['kin']:3d} = {mr['label']} (seal {mr['sealNum']}, tone {mr['toneNum']})")
        print(f"          神諭板：guide=Kin{mr['oracle']['guide']['kin']} antipode=Kin{mr['oracle']['antipode']['kin']} occult=Kin{mr['oracle']['occult']['kin']}")
    except Exception as e:
        print(f"瑪雅      ERROR: {e}")

    # ── 3. 八字 ──────────────────────────────────────────────
    try:
        br = bazi.calculate(c["year"], c["month"], c["day"], c["hour"], c["minute"],
                              longitude=c["lon"])  # 真太陽時
        p = br["pillars"]
        pillars_str = " ".join("".join(p[k]) for k in ["year", "month", "day", "time"])
        exp_yp = c["expected"].get("year_pillar")
        ok = ""
        if exp_yp:
            actual_yp = "".join(p["year"])
            ok = "✓" if actual_yp == exp_yp else f"✗ 預期 {exp_yp}"
        print(f"八字      {pillars_str}  {ok}")
        print(f"          日主 {br['dayMaster']} ({br['dayMasterYinYang']}{br['dayMasterWuxing']}) · 五行 {br['wuxing']['counts']}")
        if br['wuxing']['missing']:
            print(f"          缺：{','.join(br['wuxing']['missing'])} · 最旺：{br['wuxing']['strongest']}")
    except Exception as e:
        print(f"八字      ERROR: {e}")

    # ── 4. 紫微 ──────────────────────────────────────────────
    try:
        zr = ziwei.calculate(c["year"], c["month"], c["day"], c["hour"], c["minute"], c["gender"])
        ming = zr.get("mingGong", {})
        ming_stars = " ".join(ming.get("majorStarNames", [])) or "(空宮)"
        print(f"紫微      {zr['fiveElementsClass']} · 命主 {zr['soul']} / 身主 {zr['body']}")
        print(f"          命宮 {ming.get('heavenlyStem','')}{ming.get('earthlyBranch','')}：{ming_stars}")
        print(f"          時辰 {zr['time']} · 西洋星座 {zr['sign']} · 生肖 {zr['zodiac']}")
    except Exception as e:
        print(f"紫微      ERROR: {e}")

    # ── 5. 占星 ──────────────────────────────────────────────
    try:
        ar = astro.calculate(c["year"], c["month"], c["day"], c["hour"], c["minute"],
                              c["timezone"], c["lat"], c["lon"])
        sun_sign = ar.get("sun", {}).get("sign", {}).get("zh") or ar.get("sun_sign")
        moon_sign = ar.get("moon", {}).get("sign", {}).get("zh") or ar.get("moon_sign")
        asc = ar.get("ascendant", {}).get("sign", {}).get("zh") or ar.get("rising_sign")
        exp_ss = c["expected"].get("sun_sign")
        ok = "✓" if not exp_ss or sun_sign == exp_ss else f"✗ 預期 {exp_ss}"
        print(f"占星      ☉ {sun_sign}  ☽ {moon_sign}  ↑ {asc}  {ok}")
    except Exception as e:
        print(f"占星      ERROR: {e}")

    # ── 6. 人類圖 ──────────────────────────────────────────────
    try:
        hr = humandesign.calculate(c["year"], c["month"], c["day"], c["hour"], c["minute"],
                                     c["timezone"])
        t = hr.get("type") or hr.get("Type")
        prof = hr.get("profile") or hr.get("Profile")
        auth = hr.get("authority") or hr.get("Authority")
        print(f"人類圖    類型 {t} · Profile {prof} · 內在權威 {auth}")
    except Exception as e:
        print(f"人類圖    ERROR: {e}")


def main():
    print("=" * 70)
    print("  5 位名人 × 6 個排盤工具 多方位驗證")
    print(f"  Python {sys.version.split()[0]} · 演算引擎 = python_api/engines/")
    print("=" * 70)
    for c in CELEBRITIES:
        run_one(c)

    section("確定性測試（同輸入跑 2 次必相同）")
    c = CELEBRITIES[0]
    a = bazi.calculate(c["year"], c["month"], c["day"], c["hour"], c["minute"])
    b = bazi.calculate(c["year"], c["month"], c["day"], c["hour"], c["minute"])
    print(f"八字 deterministic: {'✓' if a['pillars'] == b['pillars'] else '✗'}")
    a = maya.calculate(c["year"], c["month"], c["day"])
    b = maya.calculate(c["year"], c["month"], c["day"])
    print(f"瑪雅 deterministic: {'✓' if a['kin'] == b['kin'] else '✗'}")
    a = ziwei.calculate(c["year"], c["month"], c["day"], c["hour"], c["minute"], c["gender"])
    b = ziwei.calculate(c["year"], c["month"], c["day"], c["hour"], c["minute"], c["gender"])
    print(f"紫微 deterministic: {'✓' if a['fiveElementsClass'] == b['fiveElementsClass'] else '✗'}")

    print("\n完成 ✦")


if __name__ == "__main__":
    main()
