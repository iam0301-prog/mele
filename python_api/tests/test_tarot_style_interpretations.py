import json
from pathlib import Path

from engines import tarot


ROOT = Path(__file__).resolve().parents[1]
DECK = json.loads((ROOT / "data" / "tarot.json").read_text(encoding="utf-8"))
STYLE_DATA = json.loads((ROOT / "data" / "tarot_style_interpretations.json").read_text(encoding="utf-8"))
STYLES = {"forest_athena", "ocean_poseidon", "ancient_pharaoh"}


def test_tarot_style_data_is_complete():
    assert set(STYLE_DATA) == STYLES
    deck_ids = {str(card["id"]) for card in DECK}

    for style_key, entries in STYLE_DATA.items():
        assert set(entries) == deck_ids, style_key
        for card_id, interpretation in entries.items():
            assert interpretation.get("scene"), (style_key, card_id)
            assert interpretation.get("visual_cue"), (style_key, card_id)
            for position in ("upright", "reversed"):
                positioned = interpretation.get(position) or {}
                assert positioned.get("text"), (style_key, card_id, position)
                assert positioned.get("keywords"), (style_key, card_id, position)


def test_same_seed_same_cards_but_style_specific_meanings():
    draws = {
        style: tarot.draw(count=3, reversed_enabled=True, spread="three_card", seed=42, tarot_style=style)
        for style in STYLES
    }
    names_by_style = {
        style: [draw["card"]["name_zh"] for draw in data["cards"]]
        for style, data in draws.items()
    }
    assert len({tuple(names) for names in names_by_style.values()}) == 1

    first_meanings = {style: data["cards"][0]["meaning"] for style, data in draws.items()}
    first_interpretations = {
        style: data["cards"][0]["style_interpretation"]["scene"]
        for style, data in draws.items()
    }
    assert len(set(first_meanings.values())) == len(STYLES)
    assert len(set(first_interpretations.values())) == len(STYLES)


def test_unknown_tarot_style_falls_back_to_ocean():
    data = tarot.draw(count=1, reversed_enabled=False, spread="single", seed=58, tarot_style="unknown")
    draw = data["cards"][0]

    assert data["meta"]["tarot_style"] == "ocean_poseidon"
    assert draw["style"] == "ocean_poseidon"
    assert draw["meaning"]
    assert draw["keywords"]
    assert draw["style_interpretation"]["style"] == "ocean_poseidon"
