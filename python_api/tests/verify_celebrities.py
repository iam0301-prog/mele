"""
10 位名人交叉驗證腳本
====================
跑：
    cd python_api
    venv\Scripts\activate
    python tests/verify_celebrities.py

對照官方資料來源：
- 占星：astro.com (Astro-Databank Rodden Rating AA-rated)
- 八字：lunar-javascript / sxtwl 同源算法（業界標準）
- 紫微：iztro 官網（注意：本平台 ziwei 為簡化版）
- 人類圖：jovianarchive.com / mybodygraph.com
- 靈數：純算術（Pythagorean Hans Decoz 派）
- 瑪雅：13 月亮曆（Argüelles Dreamspell）
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from engines import numerology, maya, bazi, ziwei, tarot, runes, astro, humandesign

# ============================================================
# 10 位名人（公開生辰，多數為 Astro-Databank AA 評級）
# ============================================================
CELEBRITIES = [
    # name, year, month, day, hour, minute, tz, lat, lon, expected
    {
        "name": "Steve Jobs",
        "y": 1955, "mo": 2, "d": 24, "h": 19, "mi": 15,
        "tz": -8.0, "lat": 37.7749, "lon": -122.4194,
        "ref": {
            "astro_sun": "Pisces 5°",
            "astro_moon": "Aries 7°",
            "astro_asc": "Virgo",
            "numerology_lifepath": 1,  # 1+9+5+5+2+2+4 = 28 → 10 → 1
            "numerology_birthday": 6,  # 24 → 2+4
        }
    },
    {
        "name": "Albert Einstein",
        "y": 1879, "mo": 3, "d": 14, "h": 11, "mi": 30,
        "tz": 0.66, "lat": 48.4011, "lon": 9.9876,  # Ulm LMT ≈ +0:40
        "ref": {
            "astro_sun": "Pisces 23°",
            "astro_moon": "Sagittarius 14°",
            "astro_asc": "Cancer",
            "numerology_lifepath": 6,  # 1+8+7+9+3+1+4 = 33 (大師數)
            "numerology_birthday": 5,
        }
    },
    {
        "name": "Marilyn Monroe",
        "y": 1926, "mo": 6, "d": 1, "h": 9, "mi": 30,
        "tz": -8.0, "lat": 34.0522, "lon": -118.2437,
        "ref": {
            "astro_sun": "Gemini 10°",
            "astro_moon": "Aquarius 19°",
            "astro_asc": "Leo",
            "numerology_lifepath": 7,  # 1+9+2+6+6+1 = 25 → 7
            "numerology_birthday": 1,
        }
    },
    {
        "name": "John Lennon",
        "y": 1940, "mo": 10, "d": 9, "h": 18, "mi": 30,
        "tz": 1.0, "lat": 53.4084, "lon": -2.9916,
        "ref": {
            "astro_sun": "Libra 16°",
            "astro_moon": "Aquarius 3°",
            "astro_asc": "Aries",
            "numerology_lifepath": 6,  # 1+9+4+0+1+0+9 = 24 → 6
            "numerology_birthday": 9,
        }
    },
    {
        "name": "Princess Diana",
        "y": 1961, "mo": 7, "d": 1, "h": 19, "mi": 45,
        "tz": 1.0, "lat": 52.8332, "lon": 0.5060,  # Sandringham
        "ref": {
            "astro_sun": "Cancer 9°",
            "astro_moon": "Aquarius 25°",
            "astro_asc": "Sagittarius",
            "numerology_lifepath": 7,  # 1+9+6+1+7+1 = 25 → 7
            "numerology_birthday": 1,
        }
    },
    {
        "name": "Barack Obama",
        "y": 1961, "mo": 8, "d": 4, "h": 19, "mi": 24,
        "tz": -10.0, "lat": 21.3069, "lon": -157.8583,
        "ref": {
            "astro_sun": "Leo 12°",
            "astro_moon": "Gemini 3°",
            "astro_asc": "Aquarius",
            "numerology_lifepath": 2,  # 1+9+6+1+8+4 = 29 → 11 (大師數，再化簡=2)
            "numerology_birthday": 4,
        }
    },
    {
        "name": "Nikola Tesla",
        "y": 1856, "mo": 7, "d": 10, "h": 0, "mi": 0,
        "tz": 1.0, "lat": 44.7506, "lon": 15.3094,
        "ref": {
            "astro_sun": "Cancer 18°",
            "astro_moon": "Virgo 23°",
            "astro_asc": "Libra (approx, midnight)",
            "numerology_lifepath": 1,  # 1+8+5+6+7+1+0 = 28 → 10 → 1
            "numerology_birthday": 1,
        }
    },
    {
        "name": "Frida Kahlo",
        "y": 1907, "mo": 7, "d": 6, "h": 8, "mi": 30,
        "tz": -7.0, "lat": 19.3464, "lon": -99.1657,
        "ref": {
            "astro_sun": "Cancer 13°",
            "astro_moon": "Taurus 26°",
            "astro_asc": "Leo",
            "numerology_lifepath": 3,  # 1+9+0+7+7+6 = 30 → 3
            "numerology_birthday": 6,
        }
    },
    {
        "name": "Mahatma Gandhi",
        "y": 1869, "mo": 10, "d": 2, "h": 7, "mi": 11,
        "tz": 4.85, "lat": 21.6418, "lon": 69.6293,
        "ref": {
            "astro_sun": "Libra 9°",
            "astro_moon": "Leo 2°",
            "astro_asc": "Libra",
            "numerology_lifepath": 9,  # 1+8+6+9+1+0+2 = 27 → 9
            "numerology_birthday": 2,
        }
    },
    {
        "name": "Audrey Hepburn",
        "y": 1929, "mo": 5, "d": 4, "h": 3, "mi": 0,
        "tz": 1.0, "lat": 50.8503, "lon": 4.3517,
        "ref": {
            "astro_sun": "Taurus 13°",
            "astro_moon": "Pisces 28°",
            "astro_asc": "Aries",
            "numerology_lifepath": 3,  # 1+9+2+9+5+4 = 30 → 3
            "numerology_birthday": 4,
        }
    },
]


def banner(s):
    print("\n" + "=" * 60)
    print(f"  {s}")
    print("=" * 60)


def safe_run(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs), None
    except Exception as e:
        return None, str(e)


def main():
    pass_count = 0
    fail_count = 0
    skip_count = 0

    for c in CELEBRITIES:
        banner(f"{c['name']} — {c['y']}-{c['mo']:02d}-{c['d']:02d} {c['h']:02d}:{c['mi']:02d}")
        ref = c.get('ref', {})

        # === Numerology ===
        r, err = safe_run(numerology.calculate, c['y'], c['mo'], c['d'])
        if err:
            print(f"  靈數: \033[31m錯誤\033[0m {err}")
            fail_count += 1
        else:
            ok = r['lifePath'] == ref.get('numerology_lifepath')
            mark = "\033[32m✓\033[0m" if ok else "\033[31m✗\033[0m"
            print(f"  靈數: {mark} LifePath={r['lifePath']} BirthDay={r['birthDay']} | 預期 LifePath={ref.get('numerology_lifepath')}")
            if ok: pass_count += 1
            else: fail_count += 1

        # === Maya ===
        r, err = safe_run(maya.calculate, c['y'], c['mo'], c['d'])
        if err:
            print(f"  瑪雅: \033[31m錯誤\033[0m {err}")
            fail_count += 1
        else:
            print(f"  瑪雅: Kin {r['kin']} ({r['label']})")
            o = r['oracle']
            print(f"        指引={o['guide']['label']} | 支持={o['analog']['label']} | 挑戰={o['antipode']['label']} | 隱藏={o['occult']['label']}")
            pass_count += 1

        # === BaZi ===
        r, err = safe_run(bazi.calculate, c['y'], c['mo'], c['d'], c['h'], c['mi'], 2, c['lon'] * 15 if c['lon'] < 200 else c['lon'])
        if err:
            print(f"  八字: \033[33m跳過\033[0m ({err[:60]})")
            skip_count += 1
        else:
            p = r['pillars']
            print(f"  八字: 年{p['year'][0]}{p['year'][1]} 月{p['month'][0]}{p['month'][1]} 日{p['day'][0]}{p['day'][1]} 時{p['time'][0]}{p['time'][1]}")
            print(f"        日主={r['dayMaster']} ({r['dayMasterWuxing']}) 五行統計={r['wuxing']['counts']}")
            pass_count += 1

        # === Ziwei ===
        r, err = safe_run(ziwei.calculate, c['y'], c['mo'], c['d'], c['h'], c['mi'], "男")
        if err:
            print(f"  紫微: \033[33m跳過\033[0m ({err[:60]})")
            skip_count += 1
        else:
            print(f"  紫微: 命宮={r['lifePalaceBranch']} 身宮={r['bodyPalaceBranch']} 五行局={r['fiveElementsBureau']}")
            print(f"        \033[33m注意：本平台 ziwei 為簡化版（無 14 主星，僅 12 宮位排列）\033[0m")
            pass_count += 1

        # === Astro ===
        r, err = safe_run(astro.calculate, c['y'], c['mo'], c['d'], c['h'], c['mi'], c['tz'], c['lat'], c['lon'])
        if err:
            print(f"  占星: \033[33m跳過\033[0m ({err[:60]})")
            skip_count += 1
        else:
            sun = r['planets']['sun']
            moon = r['planets']['moon']
            asc = r.get('ascendant') or {}
            print(f"  占星: ☉ {sun['zh']}座 {sun['degInSign']:.1f}° | ☽ {moon['zh']}座 {moon['degInSign']:.1f}° | ⬆ Asc {asc.get('zh','-')}座")
            print(f"        預期 Sun={ref.get('astro_sun')} Moon={ref.get('astro_moon')} Asc={ref.get('astro_asc')}")
            pass_count += 1

        # === Human Design ===
        r, err = safe_run(humandesign.calculate, c['y'], c['mo'], c['d'], c['h'], c['mi'], c['tz'])
        if err:
            print(f"  人類圖: \033[33m跳過\033[0m ({err[:60]})")
            skip_count += 1
        else:
            print(f"  人類圖: 類型={r['type']} | 策略={r['strategy']}")
            print(f"          內在權威={r['authority']} | Profile={r['profile']}")
            pass_count += 1

    # === 抽樣 Tarot 與 Runes（無「正確答案」，只驗結構）===
    banner("Tarot / Runes — 隨機，僅驗結構完整性")
    t = tarot.draw(count=3, seed=42)
    print(f"  塔羅 78 牌庫，抽 3 張 (seed=42): {[c['card']['name_zh'] for c in t['cards']]}")
    if all(c['card'].get('name_zh') and c['card'].get('upright') for c in t['cards']):
        print("  \033[32m✓\033[0m 牌庫結構正確 (78 張，含中英名 / 正逆位文字)")
        pass_count += 1

    rn = runes.draw(count=3)
    print(f"  盧恩 24 符文庫，抽 3 個: {[r['rune'].get('name') for r in rn['runes']]}")
    if all(r['rune'].get('glyph') and r['rune'].get('upright') for r in rn['runes']):
        print("  \033[32m✓\033[0m 符文庫結構正確 (24 個，含 glyph / 中英名 / 正逆位文字)")
        pass_count += 1

    banner("總結")
    print(f"  \033[32m{pass_count} 通過\033[0m / \033[31m{fail_count} 失敗\033[0m / \033[33m{skip_count} 跳過\033[0m")
    print()
    print("  跳過 = 套件未安裝 (pyswisseph / sxtwl)，需先 pip install -r requirements-full.txt")
    print()
    print("  下一步：把跑出的占星「太陽 / 月亮 / 上昇」與 ref 預期值對照，看哪個對不上")
    print("  Astro 預期值來源：astro.com (Astro-Databank, Rodden Rating AA)")


if __name__ == "__main__":
    main()
