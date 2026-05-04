"""塔羅視覺：古典牌面、牌陣排列與風格化卡面。"""
from html import escape
from pathlib import Path

from .common import COMMON_KEYFRAMES, PALETTE, oracle_backdrop

TAROT_ART_ROOT = Path(__file__).resolve().parents[2] / "apps" / "web" / "public" / "tarot" / "cards"
TAROT_ART_WEB_ROOT = "/tarot/cards"


SPREAD_LABELS = {
    "three_card": ["過去", "現在", "未來"],
    "celtic": ["核心", "橫越", "根源", "近因", "遠因", "近果", "自我", "環境", "希望/恐懼", "結果"],
    "horseshoe": ["過去", "現在", "未來", "建議", "外力", "障礙", "結果"],
    "single": ["今日訊息"],
    "past-present-future": ["過去", "現在", "未來"],
    "situation-action-outcome": ["現況", "建議行動", "可能結果"],
    "cross": ["核心", "橫越", "根源", "近因", "遠因"],
}

STYLE_META = {
    "forest_athena": {
        "title": "森林雅典娜",
        "bg1": "#163124",
        "bg2": "#07100C",
        "accent": "#BFD48A",
        "soft": "#5D875B",
        "caption": "智慧森林",
    },
    "ocean_poseidon": {
        "title": "大海波賽頓",
        "bg1": "#0A3D58",
        "bg2": "#04101B",
        "accent": "#9FE3F2",
        "soft": "#2F8FAE",
        "caption": "深海神諭",
    },
    "ancient_pharaoh": {
        "title": "古老法老風",
        "bg1": "#42250F",
        "bg2": "#070504",
        "accent": "#E6B85A",
        "soft": "#9B5B23",
        "caption": "法老神殿",
    },
}


def _style(style: str | None) -> dict:
    return STYLE_META.get(style or "", STYLE_META["ocean_poseidon"])


def _tarot_art_url(style_key: str, card: dict) -> str | None:
    card_id = str(card.get("id", card.get("number", ""))).strip()
    if not card_id:
        return None
    for ext in ("webp", "png", "jpg", "jpeg"):
        asset_path = TAROT_ART_ROOT / style_key / f"{card_id}.{ext}"
        if asset_path.exists():
            return f"{TAROT_ART_WEB_ROOT}/{style_key}/{card_id}.{ext}"
    return None


RANKS = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"]

PIP_COUNTS = {
    "Ace": 1,
    "Two": 2,
    "Three": 3,
    "Four": 4,
    "Five": 5,
    "Six": 6,
    "Seven": 7,
    "Eight": 8,
    "Nine": 9,
    "Ten": 10,
    "Page": 3,
    "Knight": 4,
    "Queen": 5,
    "King": 6,
}


def _rank(card: dict) -> str:
    name_en = str(card.get("name_en") or "")
    for rank in RANKS:
        if name_en == rank or name_en.startswith(f"{rank} "):
            return rank
    return ""


def _pip_positions(cx: float, top: float, count: int) -> list[tuple[float, float]]:
    columns = {
        1: [(0, 40)],
        2: [(0, 22), (0, 62)],
        3: [(0, 18), (-18, 58), (18, 58)],
        4: [(-20, 20), (20, 20), (-20, 62), (20, 62)],
        5: [(-22, 18), (22, 18), (0, 42), (-22, 66), (22, 66)],
        6: [(-24, 16), (24, 16), (-24, 42), (24, 42), (-24, 68), (24, 68)],
        7: [(-25, 14), (25, 14), (0, 31), (-25, 48), (25, 48), (-15, 70), (15, 70)],
        8: [(-25, 14), (25, 14), (-25, 34), (25, 34), (-25, 54), (25, 54), (-25, 74), (25, 74)],
        9: [(-28, 13), (0, 13), (28, 13), (-28, 36), (0, 36), (28, 36), (-28, 59), (0, 59), (28, 59)],
        10: [(-28, 11), (0, 11), (28, 11), (-28, 32), (0, 32), (28, 32), (-28, 53), (0, 53), (28, 53), (0, 76)],
    }
    return [(cx + dx, top + dy) for dx, dy in columns.get(count, columns[3])]


def _suit_glyph(px: float, py: float, suit: str, style_key: str, uid: str, index: int, accent: str, soft: str) -> str:
    if suit == "swords":
        if style_key == "forest_athena":
            return f"""<path d="M{px} {py-12} C{px-7} {py-2} {px-5} {py+8} {px} {py+14} C{px+5} {py+8} {px+7} {py-2} {px} {py-12} Z" fill="none" stroke="{accent}" stroke-width="1.6"/><path d="M{px-8} {py+2} C{px-2} {py-2} {px+2} {py+6} {px+8} {py+2}" fill="none" stroke="{soft}" stroke-width="1.4"/>"""
        if style_key == "ocean_poseidon":
            return f"""<path d="M{px} {py-14} L{px+4} {py+10} L{px} {py+16} L{px-4} {py+10} Z" fill="url(#{uid}-gold)" opacity=".82"/><circle cx="{px+7}" cy="{py-6}" r="1.6" fill="#D7FAFF" opacity=".72"/>"""
        return f"""<path d="M{px} {py-14} L{px+5} {py+12} H{px-5} Z" fill="url(#{uid}-gold)" opacity=".9"/><path d="M{px-8} {py+1} H{px+8}" stroke="{accent}" stroke-width="1.4"/>"""
    if suit == "cups":
        if style_key == "forest_athena":
            return f"""<path d="M{px-8} {py-8} C{px-9} {py+6} {px+9} {py+6} {px+8} {py-8} Z" fill="none" stroke="{accent}" stroke-width="1.6"/><path d="M{px-5} {py+8} H{px+5}" stroke="{soft}" stroke-width="1.4"/>"""
        if style_key == "ocean_poseidon":
            return f"""<path d="M{px-9} {py-6} C{px-7} {py+8} {px+7} {py+8} {px+9} {py-6}" fill="rgba(159,227,242,0.18)" stroke="{accent}" stroke-width="1.5"/><circle cx="{px}" cy="{py+1}" r="3.3" fill="#D7FAFF" opacity=".68"/>"""
        return f"""<path d="M{px-9} {py-8} H{px+9} L{px+5} {py+8} H{px-5} Z" fill="rgba(230,184,90,0.18)" stroke="{accent}" stroke-width="1.5"/><path d="M{px-7} {py+11} H{px+7}" stroke="#77B7C7" stroke-width="1.4"/>"""
    if suit == "wands":
        if style_key == "forest_athena":
            return f"""<path d="M{px-2} {py+14} L{px+4} {py-14}" stroke="{accent}" stroke-width="3" stroke-linecap="round"/><path d="M{px+2} {py-4} C{px+12} {py-8} {px+10} {py+2} {px+2} {py+1}" fill="{soft}" opacity=".78"/>"""
        if style_key == "ocean_poseidon":
            return f"""<path d="M{px} {py+14} C{px-6} {py+2} {px+8} {py-2} {px+1} {py-14}" fill="none" stroke="{accent}" stroke-width="3" stroke-linecap="round"/><path d="M{px-7} {py+2} C{px-15} {py-6} {px-5} {py-8} {px-2} {py-1}" fill="{soft}" opacity=".68"/>"""
        return f"""<path d="M{px-2} {py+14} L{px+3} {py-14}" stroke="url(#{uid}-gold)" stroke-width="3" stroke-linecap="round"/><circle cx="{px+4}" cy="{py-13}" r="5" fill="{accent}" opacity=".42"/>"""
    if style_key == "ocean_poseidon":
        return f"""<circle cx="{px}" cy="{py}" r="9" fill="rgba(215,250,255,0.16)" stroke="{accent}" stroke-width="1.5"/><circle cx="{px}" cy="{py}" r="3.5" fill="#F4EAD2" opacity=".72"/>"""
    if style_key == "ancient_pharaoh":
        return f"""<rect x="{px-8}" y="{py-8}" width="16" height="16" rx="3" fill="rgba(230,184,90,0.18)" stroke="{accent}" stroke-width="1.5" transform="rotate(45 {px} {py})"/><circle cx="{px}" cy="{py}" r="3" fill="#77B7C7" opacity=".82"/>"""
    return f"""<circle cx="{px}" cy="{py}" r="9" fill="rgba(191,212,138,0.18)" stroke="{accent}" stroke-width="1.5"/><path d="M{px-7} {py+3} C{px-2} {py-8} {px+2} {py-8} {px+7} {py+3}" fill="none" stroke="{soft}" stroke-width="1.4"/>"""


def _suit_art(x: float, y: float, w: float, h: float, style_key: str, uid: str, card: dict) -> str:
    meta = _style(style_key)
    cx = x + w / 2
    top = y + 54
    suit = str(card.get("arcana") or "major")
    rank = _rank(card)
    count = PIP_COUNTS.get(rank, 3)
    glyphs = "\n".join(
        _suit_glyph(px, py, suit, style_key, uid, index, meta["accent"], meta["soft"])
        for index, (px, py) in enumerate(_pip_positions(cx, top, count))
    )

    if rank in {"Page", "Knight", "Queen", "King"}:
        crown = {
            "Page": f"""<path d="M{cx-18} {top+18} H{cx+18} L{cx} {top-2} Z" fill="none" stroke="{meta['accent']}" stroke-width="1.8"/>""",
            "Knight": f"""<path d="M{cx-28} {top+30} C{cx-7} {top+8} {cx+19} {top+12} {cx+30} {top+34}" fill="none" stroke="{meta['accent']}" stroke-width="2.2"/><circle cx="{cx-18}" cy="{top+34}" r="4" fill="{meta['accent']}"/>""",
            "Queen": f"""<path d="M{cx-25} {top+24} L{cx-12} {top+7} L{cx} {top+24} L{cx+12} {top+7} L{cx+25} {top+24}" fill="none" stroke="{meta['accent']}" stroke-width="2"/>""",
            "King": f"""<path d="M{cx-27} {top+25} L{cx-17} {top+6} L{cx-5} {top+24} L{cx+7} {top+6} L{cx+18} {top+24} L{cx+27} {top+9}" fill="none" stroke="{meta['accent']}" stroke-width="2"/>""",
        }[rank]
        return f"""{crown}<g opacity=".86">{glyphs}</g>"""

    return f"""<g>{glyphs}</g>"""


def _major_art(x: float, y: float, w: float, h: float, style_key: str, uid: str, card: dict) -> str:
    meta = _style(style_key)
    cx = x + w / 2
    top = y + 54
    name = str(card.get("name_en") or "")

    def star(px: float, py: float, r: float = 14) -> str:
        return f"""<path d="M{px} {py-r} L{px+3.6} {py-3.6} L{px+r} {py} L{px+3.6} {py+3.6} L{px} {py+r} L{px-3.6} {py+3.6} L{px-r} {py} L{px-3.6} {py-3.6} Z" fill="url(#{uid}-gold)" opacity=".9"/>"""

    motifs = {
        "The Fool": f"""<path d="M{cx-32} {top+76} C{cx-12} {top+52} {cx+10} {top+46} {cx+33} {top+28}" fill="none" stroke="{meta['accent']}" stroke-width="3"/><circle cx="{cx-22}" cy="{top+62}" r="7" fill="#F4EAD2"/><path d="M{cx+20} {top+22} L{cx+36} {top+22} L{cx+28} {top+4} Z" fill="none" stroke="{meta['soft']}" stroke-width="2"/>""",
        "The Magician": f"""<rect x="{cx-30}" y="{top+48}" width="60" height="16" rx="3" fill="rgba(244,234,210,0.16)" stroke="{meta['accent']}" stroke-width="1.5"/><circle cx="{cx-18}" cy="{top+34}" r="5" fill="{meta['accent']}"/><path d="M{cx-3} {top+34} H{cx+7} M{cx+2} {top+29} V{top+39}" stroke="{meta['accent']}" stroke-width="2"/><path d="M{cx+18} {top+27} L{cx+25} {top+40} H{cx+11} Z" fill="none" stroke="{meta['accent']}" stroke-width="1.5"/>""",
        "The High Priestess": f"""<path d="M{cx-28} {top+12} V{top+82} M{cx+28} {top+12} V{top+82}" stroke="{meta['accent']}" stroke-width="3"/><path d="M{cx-16} {top+24} C{cx+4} {top+10} {cx+22} {top+34} {cx+4} {top+48}" fill="none" stroke="#F4EAD2" stroke-width="2"/>""",
        "The Empress": f"""<path d="M{cx} {top+18} C{cx-30} {top+48} {cx-17} {top+78} {cx} {top+86} C{cx+17} {top+78} {cx+30} {top+48} {cx} {top+18} Z" fill="rgba(244,234,210,0.12)" stroke="{meta['accent']}" stroke-width="2"/><circle cx="{cx}" cy="{top+46}" r="12" fill="url(#{uid}-gold)" opacity=".7"/>""",
        "The Emperor": f"""<path d="M{cx-30} {top+80} V{top+18} H{cx+30} V{top+80}" fill="none" stroke="{meta['accent']}" stroke-width="3"/><path d="M{cx-20} {top+35} H{cx+20} M{cx-20} {top+55} H{cx+20}" stroke="{meta['soft']}" stroke-width="2"/>""",
        "The Hierophant": f"""<path d="M{cx-28} {top+84} V{top+26} C{cx-28} {top+4} {cx+28} {top+4} {cx+28} {top+26} V{top+84}" fill="none" stroke="{meta['accent']}" stroke-width="2.4"/><path d="M{cx} {top+18} V{top+60} M{cx-12} {top+34} H{cx+12}" stroke="#F4EAD2" stroke-width="2"/>""",
        "The Lovers": f"""<circle cx="{cx-18}" cy="{top+44}" r="13" fill="rgba(244,234,210,0.13)" stroke="{meta['accent']}" stroke-width="2"/><circle cx="{cx+18}" cy="{top+44}" r="13" fill="rgba(244,234,210,0.13)" stroke="{meta['accent']}" stroke-width="2"/><path d="M{cx} {top+10} V{top+78}" stroke="{meta['soft']}" stroke-width="1.5" opacity=".7"/>""",
        "The Chariot": f"""<path d="M{cx-32} {top+66} L{cx} {top+22} L{cx+32} {top+66} Z" fill="none" stroke="{meta['accent']}" stroke-width="2.3"/><circle cx="{cx-19}" cy="{top+73}" r="6" fill="{meta['soft']}"/><circle cx="{cx+19}" cy="{top+73}" r="6" fill="{meta['soft']}"/>""",
        "Strength": f"""<path d="M{cx-26} {top+50} C{cx-26} {top+22} {cx+26} {top+22} {cx+26} {top+50} C{cx+26} {top+78} {cx-26} {top+78} {cx-26} {top+50} Z" fill="none" stroke="{meta['accent']}" stroke-width="2.2"/><path d="M{cx-18} {top+18} C{cx-5} {top+8} {cx+5} {top+8} {cx+18} {top+18}" fill="none" stroke="#F4EAD2" stroke-width="2"/>""",
        "The Hermit": f"""<path d="M{cx} {top+20} V{top+84}" stroke="{meta['accent']}" stroke-width="2.6"/><path d="M{cx-15} {top+30} H{cx+15} L{cx+8} {top+50} H{cx-8} Z" fill="rgba(244,234,210,0.18)" stroke="#F4EAD2" stroke-width="1.6"/>""",
        "Wheel of Fortune": f"""<circle cx="{cx}" cy="{top+48}" r="32" fill="none" stroke="{meta['accent']}" stroke-width="2.3"/><circle cx="{cx}" cy="{top+48}" r="13" fill="none" stroke="{meta['soft']}" stroke-width="2"/><path d="M{cx} {top+16} V{top+80} M{cx-32} {top+48} H{cx+32} M{cx-22} {top+26} L{cx+22} {top+70} M{cx+22} {top+26} L{cx-22} {top+70}" stroke="{meta['accent']}" stroke-width="1.2" opacity=".72"/>""",
        "Justice": f"""<path d="M{cx} {top+12} V{top+84} M{cx-30} {top+28} H{cx+30}" stroke="{meta['accent']}" stroke-width="2.2"/><path d="M{cx-22} {top+28} L{cx-34} {top+56} H{cx-10} Z M{cx+22} {top+28} L{cx+10} {top+56} H{cx+34} Z" fill="none" stroke="#F4EAD2" stroke-width="1.5"/>""",
        "The Hanged Man": f"""<path d="M{cx-30} {top+16} H{cx+30}" stroke="{meta['accent']}" stroke-width="2.2"/><path d="M{cx} {top+16} V{top+72}" stroke="{meta['soft']}" stroke-width="1.8"/><path d="M{cx-18} {top+56} L{cx} {top+82} L{cx+18} {top+56}" fill="none" stroke="#F4EAD2" stroke-width="2"/>""",
        "Death": f"""<path d="M{cx-26} {top+82} V{top+34} C{cx-26} {top+12} {cx+26} {top+12} {cx+26} {top+34} V{top+82}" fill="none" stroke="{meta['accent']}" stroke-width="2.2"/><path d="M{cx-18} {top+52} C{cx-4} {top+38} {cx+8} {top+38} {cx+20} {top+52}" fill="none" stroke="#F4EAD2" stroke-width="1.8"/>""",
        "Temperance": f"""<path d="M{cx-28} {top+24} C{cx-24} {top+48} {cx-12} {top+64} {cx+2} {top+78}" fill="none" stroke="{meta['accent']}" stroke-width="3"/><path d="M{cx+28} {top+24} C{cx+24} {top+48} {cx+12} {top+64} {cx-2} {top+78}" fill="none" stroke="#F4EAD2" stroke-width="2"/>""",
        "The Devil": f"""<path d="M{cx-26} {top+72} C{cx-8} {top+38} {cx+8} {top+38} {cx+26} {top+72}" fill="none" stroke="{meta['accent']}" stroke-width="2.4"/><path d="M{cx-30} {top+40} C{cx-10} {top+56} {cx+10} {top+56} {cx+30} {top+40}" fill="none" stroke="{meta['soft']}" stroke-width="2"/>""",
        "The Tower": f"""<path d="M{cx-18} {top+84} L{cx-11} {top+22} H{cx+16} L{cx+23} {top+84} Z" fill="rgba(244,234,210,0.1)" stroke="{meta['accent']}" stroke-width="2"/><path d="M{cx+18} {top+10} L{cx-2} {top+42} H{cx+11} L{cx-12} {top+82}" fill="none" stroke="#F4EAD2" stroke-width="2.2"/>""",
        "The Star": f"""{star(cx, top+28, 15)}<path d="M{cx-30} {top+75} C{cx-12} {top+60} {cx+12} {top+88} {cx+30} {top+72}" fill="none" stroke="{meta['accent']}" stroke-width="2.4"/>""",
        "The Moon": f"""<path d="M{cx-4} {top+12} C{cx-28} {top+24} {cx-23} {top+62} {cx+4} {top+74} C{cx-8} {top+54} {cx-8} {top+32} {cx-4} {top+12} Z" fill="url(#{uid}-gold)" opacity=".82"/><path d="M{cx-30} {top+84} C{cx-12} {top+62} {cx+12} {top+62} {cx+30} {top+84}" fill="none" stroke="{meta['soft']}" stroke-width="2"/>""",
        "The Sun": f"""<circle cx="{cx}" cy="{top+42}" r="24" fill="url(#{uid}-gold)" opacity=".9"/><path d="M{cx} {top+6} V{top+18} M{cx} {top+66} V{top+82} M{cx-36} {top+42} H{cx-24} M{cx+24} {top+42} H{cx+36}" stroke="#F4EAD2" stroke-width="2"/>""",
        "Judgement": f"""<path d="M{cx-28} {top+30} L{cx+18} {top+16} L{cx+24} {top+38} L{cx-20} {top+52} Z" fill="rgba(244,234,210,0.14)" stroke="{meta['accent']}" stroke-width="2"/><path d="M{cx-24} {top+62} C{cx-8} {top+80} {cx+8} {top+80} {cx+24} {top+62}" fill="none" stroke="#F4EAD2" stroke-width="2"/>""",
        "The World": f"""<ellipse cx="{cx}" cy="{top+48}" rx="30" ry="38" fill="none" stroke="{meta['accent']}" stroke-width="2.4"/><path d="M{cx-18} {top+20} C{cx} {top+4} {cx+18} {top+20} {cx+18} {top+48} C{cx+18} {top+76} {cx} {top+92} {cx-18} {top+76} C{cx-31} {top+62} {cx-31} {top+34} {cx-18} {top+20}" fill="none" stroke="{meta['soft']}" stroke-width="1.8"/>""",
    }
    return motifs.get(name, f"""{star(cx, top+34, 12)}<circle cx="{cx}" cy="{top+54}" r="30" fill="none" stroke="{meta['accent']}" stroke-width="2"/>""")


def _world_art(x: float, y: float, w: float, h: float, style_key: str, uid: str) -> str:
    meta = _style(style_key)
    cx = x + w / 2
    top = y + 54
    if style_key == "ocean_poseidon":
        return f"""
        <path d="M{x+24} {top+76} C{x+44} {top+66} {x+66} {top+88} {x+88} {top+76} C{x+104} {top+68} {x+116} {top+76} {x+w-18} {top+70}" fill="none" stroke="{meta['soft']}" stroke-width="2.4" opacity=".52"/>
        <circle cx="{x+34}" cy="{top+20}" r="2" fill="#D7FAFF" opacity=".6"/>
        <circle cx="{x+w-30}" cy="{top+52}" r="1.8" fill="#D7FAFF" opacity=".55"/>
        <path d="M{cx} {top+82} L{cx+3.5} {top+90} L{cx+12} {top+94} L{cx+3.5} {top+98} L{cx} {top+106} L{cx-3.5} {top+98} L{cx-12} {top+94} L{cx-3.5} {top+90} Z" fill="#F4EAD2" opacity=".78"/>"""
    if style_key == "ancient_pharaoh":
        return f"""
        <path d="M{x+24} {top+86} H{x+w-24} M{x+34} {top+72} H{x+w-34}" stroke="{meta['accent']}" stroke-width="2" opacity=".45"/>
        <path d="M{x+24} {top+84} V{top+18} M{x+w-24} {top+84} V{top+18}" stroke="{meta['soft']}" stroke-width="4" opacity=".35"/>
        <circle cx="{cx}" cy="{top+18}" r="12" fill="url(#{uid}-gold)" opacity=".52"/>"""
    return f"""
        <path d="M{x+24} {top+84} C{x+44} {top+62} {x+62} {top+92} {cx} {top+74} C{x+92} {top+92} {x+104} {top+62} {x+w-24} {top+84}" fill="none" stroke="{meta['soft']}" stroke-width="2.4" opacity=".5"/>
        <path d="M{x+24} {top+28} C{x+44} {top+12} {x+50} {top+38} {x+35} {top+58} M{x+w-22} {top+24} C{x+w-45} {top+16} {x+w-42} {top+46} {x+w-30} {top+62}" fill="none" stroke="{meta['accent']}" stroke-width="1.8" opacity=".38"/>
        <circle cx="{cx+22}" cy="{top+14}" r="8" fill="#F4EAD2" opacity=".48"/>"""


def _card_art(x: float, y: float, w: float, h: float, style_key: str, uid: str, card: dict, draw: dict) -> str:
    image_url = _tarot_art_url(style_key, card)
    if image_url:
        visual_title = escape(str(
            draw.get("visual_cue")
            or draw.get("visual_scene")
            or card.get("name_zh")
            or card.get("name_en")
            or "Tarot card illustration"
        ))
        return f"""
      <g class="tarot-scene tarot-scene--illustration tarot-scene--{style_key}">
        <title>{visual_title}</title>
        <clipPath id="{uid}-art-clip">
          <rect x="{x+17}" y="{y+38}" width="{w-34}" height="{h-88}" rx="8"/>
        </clipPath>
        <image href="{image_url}" x="{x+17}" y="{y+38}" width="{w-34}" height="{h-88}" preserveAspectRatio="xMidYMid slice" clip-path="url(#{uid}-art-clip)"/>
        <rect x="{x+17}" y="{y+38}" width="{w-34}" height="{h-88}" rx="8" fill="none" stroke="rgba(244,234,210,0.46)" stroke-width="1"/>
      </g>"""

    arcana = str(card.get("arcana") or "major")
    motif = _major_art(x, y, w, h, style_key, uid, card) if arcana == "major" else _suit_art(x, y, w, h, style_key, uid, card)
    world = _world_art(x, y, w, h, style_key, uid)
    cx = x + w / 2
    top = y + 54
    visual_title = escape(str(
        draw.get("visual_cue")
        or draw.get("visual_scene")
        or card.get("name_zh")
        or card.get("name_en")
        or "Tarot card scene"
    ))
    return f"""
      <g class="tarot-scene tarot-scene--{style_key} tarot-scene--{arcana}">
        <title>{visual_title}</title>
        <rect x="{x+17}" y="{y+38}" width="{w-34}" height="{h-88}" rx="8" fill="url(#{uid}-scene)" stroke="rgba(244,234,210,0.34)" stroke-width="1"/>
        <circle cx="{cx}" cy="{top+45}" r="38" fill="none" stroke="rgba(244,234,210,0.22)" stroke-width="1.2"/>
        <circle cx="{x+33}" cy="{y+58}" r="1.3" fill="#F4EAD2"/>
        <circle cx="{x+w-38}" cy="{y+70}" r="1.1" fill="#F4EAD2"/>
        <circle cx="{x+w-30}" cy="{y+120}" r="1.2" fill="#E8C547"/>
        {world}
        {motif}
      </g>"""


def render(data: dict, tarot_style: str | None = None) -> dict:
    cards = data["cards"]
    spread = data["meta"]["spread"]
    labels = SPREAD_LABELS.get(spread, [f"第 {i+1} 張" for i in range(len(cards))])
    style_key = tarot_style or data.get("meta", {}).get("tarot_style") or "ocean_poseidon"
    meta = _style(style_key)

    n = len(cards)
    card_w, card_h, gap = 164, 284, 34
    width = max(600, n * card_w + (n - 1) * gap + 80)
    height = 500

    cards_svg = ""
    for i, c in enumerate(cards):
        card = c["card"]
        is_rev = c["position"] == "reversed"
        x = 40 + i * (card_w + gap)
        y = 86
        cx = x + card_w / 2
        cy = y + card_h / 2
        uid = f"tarot-{i}"
        rotate = f'transform="rotate(180 {cx} {cy})"' if is_rev else ""
        meaning = card.get("reversed" if is_rev else "upright", {})
        draw_keywords = c.get("keywords", [])
        keywords = draw_keywords[:3] if isinstance(draw_keywords, list) and draw_keywords else []
        if not keywords:
            keywords = meaning.get("keywords", [])[:3] if isinstance(meaning, dict) else []
        zh = escape(str(card.get("name_zh") or card.get("zh") or ""))
        en = escape(str(card.get("name_en") or ""))
        number = escape(str(card.get("id", card.get("number", i + 1))))
        label = escape(labels[i] if i < len(labels) else "")
        status = "逆位" if is_rev else "正位"
        status_color = "#FFB0A6" if is_rev else "#A7F3D0"
        keyword_text = escape(" · ".join(keywords))

        cards_svg += f"""
        <g class="fadein" style="animation-delay:{i*0.22}s">
          <defs>
            <linearGradient id="{uid}-card" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="{meta['bg1']}"/>
              <stop offset="58%" stop-color="#0D1B2A"/>
              <stop offset="100%" stop-color="{meta['bg2']}"/>
            </linearGradient>
            <linearGradient id="{uid}-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFF0B8"/>
              <stop offset="48%" stop-color="{meta['accent']}"/>
              <stop offset="100%" stop-color="#8A6516"/>
            </linearGradient>
            <radialGradient id="{uid}-scene" cx="50%" cy="36%" r="70%">
              <stop offset="0%" stop-color="{meta['soft']}" stop-opacity=".72"/>
              <stop offset="58%" stop-color="{meta['bg1']}" stop-opacity=".68"/>
              <stop offset="100%" stop-color="{meta['bg2']}" stop-opacity=".95"/>
            </radialGradient>
          </defs>
          <g style="transform-origin:{cx}px {cy}px;animation:flip 0.8s ease-out {i*0.22+0.18}s both" {rotate}>
            <rect x="{x}" y="{y}" width="{card_w}" height="{card_h}" rx="12" fill="url(#{uid}-card)" stroke="url(#{uid}-gold)" stroke-width="2.2"/>
            <rect x="{x+9}" y="{y+9}" width="{card_w-18}" height="{card_h-18}" rx="9" fill="none" stroke="rgba(244,234,210,0.32)" stroke-width="1"/>
            <path d="M{x+22} {y+24} H{x+48} M{x+card_w-48} {y+24} H{x+card_w-22} M{x+22} {y+card_h-24} H{x+48} M{x+card_w-48} {y+card_h-24} H{x+card_w-22}" stroke="{meta['accent']}" stroke-width="1.4" opacity=".78"/>
            <text x="{cx}" y="{y+31}" text-anchor="middle" font-size="18" fill="#F4EAD2" letter-spacing="2">{number}</text>
            {_card_art(x, y, card_w, card_h, style_key, uid, card, c)}
            <rect x="{x+20}" y="{y+218}" width="{card_w-40}" height="32" rx="7" fill="rgba(244,234,210,0.84)" stroke="{meta['accent']}" stroke-width=".8"/>
            <text x="{cx}" y="{y+239}" text-anchor="middle" font-size="14" fill="#142033" font-weight="700">{zh}</text>
            <text x="{cx}" y="{y+266}" text-anchor="middle" font-size="9" fill="rgba(244,234,210,0.72)" letter-spacing=".5">{en}</text>
          </g>
          <text x="{cx}" y="406" text-anchor="middle" font-size="14" fill="{PALETTE['accent_light']}" letter-spacing="3">{label}</text>
          <text x="{cx}" y="431" text-anchor="middle" font-size="12" fill="{status_color}" letter-spacing="2">{status}</text>
          <text x="{cx}" y="460" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.68)">{keyword_text}</text>
        </g>"""

    svg = f"""
<svg viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="塔羅牌陣結果">
{COMMON_KEYFRAMES}
{oracle_backdrop(width, height, "塔羅牌陣", meta["title"])}
{cards_svg}
</svg>"""

    speech_parts = []
    for i, c in enumerate(cards):
        is_rev = c["position"] == "reversed"
        speech_parts.append(f"{labels[i] if i < len(labels) else f'第{i+1}張'}：{c['card'].get('name_zh', c['card'].get('zh',''))}{'逆位' if is_rev else '正位'}")
    speech = "你抽到的牌是：" + "；".join(speech_parts) + "。"

    return {
        "svg": svg,
        "html": None,
        "palette": [meta["accent"], meta["soft"], PALETTE["accent_light"]],
        "animations": [],
        "speech": speech,
    }
