"""
塔羅 — 78 張 Rider-Waite，加密級隨機 (secrets) + 種子可重現 (random.Random)
"""
import secrets
import random
import json
from pathlib import Path
from functools import lru_cache

DATA_FILE = Path(__file__).parent.parent / "data" / "tarot.json"
STYLE_DATA_FILE = Path(__file__).parent.parent / "data" / "tarot_style_interpretations.json"
DEFAULT_TAROT_STYLE = "ocean_poseidon"
TAROT_STYLES = {"forest_athena", "ocean_poseidon", "ancient_pharaoh"}


def load_deck() -> list[dict]:
    if DATA_FILE.exists():
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    # fallback：簡化牌庫（22 大阿爾克那）
    return [
        {"id": i, "name_en": n[0], "name_zh": n[1], "arcana": "major",
         "upright": {"keywords": n[2], "text": n[3]},
         "reversed": {"keywords": n[4], "text": n[5]}}
        for i, n in enumerate([
            ("The Fool", "愚者", ["新開始", "純真", "冒險"], "踏出第一步，相信宇宙會接住你。",
             ["魯莽", "猶豫", "錯失"], "停下檢視，這個機會真的對嗎？"),
            ("The Magician", "魔術師", ["顯化", "技能", "意志"], "你已具備所需資源，動手吧。",
             ["欺騙", "未發揮", "操控"], "誠實面對自己的能力，避免自欺。"),
            # ... 其他大牌
        ], start=0)
    ]


def normalize_style(style: str | None) -> str:
    return style if style in TAROT_STYLES else DEFAULT_TAROT_STYLE


@lru_cache(maxsize=1)
def load_style_interpretations() -> dict:
    if STYLE_DATA_FILE.exists():
        return json.loads(STYLE_DATA_FILE.read_text(encoding="utf-8"))
    return {}


def apply_style_interpretations(data: dict, tarot_style: str | None = None) -> dict:
    style_key = normalize_style(tarot_style)
    style_data = load_style_interpretations().get(style_key, {})

    for draw in data.get("cards", []):
        card = draw.get("card") or {}
        card_id = str(card.get("id", draw.get("drawIndex", "")))
        interpretation = style_data.get(card_id)
        if not interpretation:
            continue

        position = draw.get("position") if draw.get("position") in ("upright", "reversed") else "upright"
        positioned = interpretation.get(position) or {}
        draw["meaning"] = positioned.get("text") or draw.get("meaning")
        draw["keywords"] = positioned.get("keywords") or draw.get("keywords") or []
        draw["style"] = style_key
        draw["visual_scene"] = interpretation.get("scene")
        draw["visual_cue"] = interpretation.get("visual_cue")
        draw["style_interpretation"] = {
            "style": style_key,
            "scene": interpretation.get("scene"),
            "visual_cue": interpretation.get("visual_cue"),
            "upright": interpretation.get("upright"),
            "reversed": interpretation.get("reversed"),
        }

    data.setdefault("meta", {})["tarot_style"] = style_key
    return data


def shuffle_indices(n: int, rng: random.Random | None = None) -> list[int]:
    arr = list(range(n))
    if rng is None:
        # Fisher-Yates with secrets
        for i in range(n - 1, 0, -1):
            j = secrets.randbelow(i + 1)
            arr[i], arr[j] = arr[j], arr[i]
    else:
        rng.shuffle(arr)
    return arr


def draw(count: int = 3, reversed_enabled: bool = True,
         spread: str = "three_card", seed: int | None = None,
         tarot_style: str | None = None) -> dict:
    deck = load_deck()
    n = len(deck)
    if count < 1 or count > n:
        raise ValueError(f"count must be 1-{n}")
    rng = random.Random(seed) if seed is not None else None
    indices = shuffle_indices(n, rng)[:count]
    cards = []
    for idx in indices:
        is_reversed = (
            (rng.random() < 0.5) if rng else (secrets.randbelow(2) == 0)
        ) if reversed_enabled else False
        cards.append({
            "card": deck[idx],
            "position": "reversed" if is_reversed else "upright",
            "drawIndex": idx,
        })
    data = {
        "cards": cards,
        "meta": {"count": count, "reversedEnabled": reversed_enabled,
                 "spread": spread, "seeded": seed is not None},
    }
    return apply_style_interpretations(data, tarot_style)
