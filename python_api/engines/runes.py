"""
盧恩 Elder Futhark — 24 古英語符文
"""
import secrets
import random
import json
from pathlib import Path

DATA_FILE = Path(__file__).parent.parent / "data" / "runes.json"


def load_runes() -> list[dict]:
    if DATA_FILE.exists():
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    # fallback：完整 24 Elder Futhark
    glyphs = [
        ("ᚠ", "Fehu", "費胡", "財富", ["財富", "豐盛", "成功"], "資源豐沛，懂得分享更得回報。",
         ["損失", "貪婪", "停滯"], "回頭檢視自己對於擁有的執著。"),
        ("ᚢ", "Uruz", "烏魯茲", "原始力量", ["力量", "野性", "健康"], "原始的生命力被喚醒，行動吧。",
         ["軟弱", "病痛", "虛耗"], "需要休息恢復，不是現在硬撐的時候。"),
        ("ᚦ", "Thurisaz", "瑟里薩茲", "突破", ["門檻", "防禦", "突破"], "一道考驗來臨，跨過它你會更強。",
         ["拖延", "傷害", "輕率"], "這次最好暫緩，不要硬碰硬。"),
        ("ᚨ", "Ansuz", "安蘇茲", "訊息", ["神諭", "智慧", "啟發"], "傾聽，重要的訊息會自己出現。",
         ["錯誤訊息", "誤解", "失語"], "懷疑你聽到的，再做交叉驗證。"),
        ("ᚱ", "Raidho", "萊德霍", "旅程", ["旅程", "節奏", "命運"], "前往該去的地方，路會展開。",
         ["延遲", "迷路", "不順"], "暫停一下，不必急著上路。"),
        ("ᚲ", "Kenaz", "肯納茲", "啟示火炬", ["創意", "知識", "靈感"], "靈光一閃，把它記下來、做出來。",
         ["黯淡", "枯竭", "失明"], "創意低谷，去散步、看別人作品。"),
        ("ᚷ", "Gebo", "格伯", "禮物", ["禮物", "夥伴", "交換"], "一段平等的關係將開花結果。",
         ["失衡", "依賴", "犧牲"], "這段關係付出與得到不對稱了。"),
        ("ᚹ", "Wunjo", "溫久", "喜悅", ["喜悅", "和諧", "成就"], "回報來了，享受這份甜美。",
         ["疏離", "失望", "延後"], "預期落空，但別否定整段努力。"),
        ("ᚺ", "Hagalaz", "哈格拉茲", "破壞", ["崩解", "考驗", "重生"], "舊的必須先碎，新的才生得出來。",
         ["停滯不前", "餘波", "創傷"], "事件已經過去，現在是修復期。"),
        ("ᚾ", "Nauthiz", "瑙西茲", "需要", ["匱乏", "限制", "意志"], "限制反而讓你看清真正所需。",
         ["逃避", "怨懟", "壓抑"], "正視內在的不足，那是成長起點。"),
        ("ᛁ", "Isa", "伊薩", "冰", ["靜止", "凍結", "停滯"], "現在不該動，等冰融了再說。",
         ["緩慢解凍", "鬆動", "冷卻"], "事情正在緩慢轉變，給它時間。"),
        ("ᛃ", "Jera", "耶拉", "豐收", ["收穫", "週期", "正義"], "你種下的開始結果。",
         ["欠收", "錯過", "等不到"], "今年不豐收，回顧種子下對地方了嗎。"),
        ("ᛇ", "Eihwaz", "艾瓦茲", "紫杉樹", ["轉化", "防衛", "韌性"], "穿越生死轉化，你會有不同的根。",
         ["阻礙", "停滯", "弱化"], "暫停成長，內化目前累積的就好。"),
        ("ᛈ", "Perthro", "佩斯洛", "命運杯", ["神秘", "命運", "賭注"], "未知的力量正在運作，相信過程。",
         ["謎團", "錯失機會", "意外失敗"], "別過度賭注，這次未知偏負向。"),
        ("ᛉ", "Algiz", "艾爾吉茲", "保護", ["守護", "直覺", "高我"], "你被保護著，依直覺前行。",
         ["脆弱", "輕信", "失防"], "提高警覺，不該完全敞開的時候。"),
        ("ᛊ", "Sowilo", "索維洛", "太陽", ["勝利", "活力", "光明"], "陽光普照，行動會有結果。",
         ["過熱", "傲慢", "誤導"], "成功之後別衝過頭，留意他人感受。"),
        ("ᛏ", "Tiwaz", "提瓦茲", "戰士", ["勇氣", "正義", "犧牲"], "為原則挺身，即使代價高昂。",
         ["不公", "退縮", "無謂犧牲"], "重新審視這場仗值不值得打。"),
        ("ᛒ", "Berkano", "貝爾卡諾", "新生", ["生長", "母性", "創造"], "新的事物從你心中誕生。",
         ["停滯", "家庭問題", "拖延"], "需要休息與滋養，不是再生產。"),
        ("ᛖ", "Ehwaz", "艾瓦茲", "夥伴關係", ["合作", "信任", "進展"], "對的夥伴出現，一起前進。",
         ["不和", "失約", "停滯"], "夥伴之間需要重新對焦。"),
        ("ᛗ", "Mannaz", "曼納茲", "人性", ["自我", "社群", "智慧"], "在群體中做自己，整合與分享。",
         ["孤立", "敵意", "誤解"], "處理一段冷掉的人際關係。"),
        ("ᛚ", "Laguz", "拉古茲", "水", ["流動", "直覺", "潛意識"], "順流而行，相信內在的聲音。",
         ["阻塞", "迷失", "情緒淹沒"], "情緒高漲時不做重大決定。"),
        ("ᛜ", "Ingwaz", "印瓦茲", "孵化", ["完成", "整合", "潛能"], "一個階段圓滿，新的循環待開。",
         ["不完整", "停滯", "中斷"], "差最後一哩，再加把勁就完成。"),
        ("ᛞ", "Dagaz", "達加茲", "黎明", ["突破", "覺醒", "希望"], "黑暗結束，新的可能性來臨。",
         ["未醒", "錯失曙光", "拖延"], "已經到改變的時刻，別再睡了。"),
        ("ᛟ", "Othala", "歐塔拉", "傳承", ["家族", "根源", "遺產"], "你從祖先處得到的力量正在發揮。",
         ["束縛", "成見", "包袱"], "祖先模式正在限制你，是時候放下。"),
    ]
    return [
        {"glyph": g, "name": n, "zh": z, "meaning": meaning,
         "upright": {"keywords": uk, "text": ut},
         "reversed": {"keywords": rk, "text": rt}}
        for g, n, z, meaning, uk, ut, rk, rt in glyphs
    ]


def shuffle_indices(n: int, rng: random.Random | None = None) -> list[int]:
    arr = list(range(n))
    if rng is None:
        for i in range(n - 1, 0, -1):
            j = secrets.randbelow(i + 1)
            arr[i], arr[j] = arr[j], arr[i]
    else:
        rng.shuffle(arr)
    return arr


def draw(count: int = 3, reversed_enabled: bool = True,
         seed: int | None = None,
         spread: str | None = None,
         material: str = "stone") -> dict:
    runes = load_runes()
    n = len(runes)
    if count < 1 or count > n:
        raise ValueError(f"count must be 1-{n}")
    rng = random.Random(seed) if seed is not None else None
    indices = shuffle_indices(n, rng)[:count]
    drawn = []
    for idx in indices:
        is_reversed = (
            (rng.random() < 0.5) if rng else (secrets.randbelow(2) == 0)
        ) if reversed_enabled else False
        drawn.append({
            "rune": runes[idx],
            "position": "reversed" if is_reversed else "upright",
            "drawIndex": idx,
        })
    return {
        "runes": drawn,
        "meta": {
            "count": count,
            "seeded": seed is not None,
            "spread": spread or {1: "single", 3: "three", 5: "five"}.get(count, "custom"),
            "material": material,
        },
    }
