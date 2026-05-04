"""盧恩視覺：材質化符文石、木牌與水晶面。"""
from html import escape

from .common import COMMON_KEYFRAMES, PALETTE, oracle_backdrop


MATERIAL_STYLE = {
    "stone": {
        "label": "石面",
        "fill1": "#4A4F58",
        "fill2": "#0A0D12",
        "stroke": "#B9B2A8",
        "rune_color": "#F5F5F4",
        "grain": "#DDD6CC",
    },
    "wood": {
        "label": "木頭",
        "fill1": "#8A552A",
        "fill2": "#201007",
        "stroke": "#D39A56",
        "rune_color": "#FFE0A0",
        "grain": "#F4C57F",
    },
    "crystal": {
        "label": "水晶",
        "fill1": "#73C6E4",
        "fill2": "#172A52",
        "stroke": "#B4ECFF",
        "rune_color": "#E7FBFF",
        "grain": "#DDF8FF",
    },
}

SPREAD_LABELS = {
    "single": ["神諭訊息"],
    "three": ["過去 / 根源", "現在 / 課題", "未來 / 建議"],
    "five": ["起點 / 狀態", "阻力 / 盲點", "力量 / 支援", "轉化 / 行動", "結果 / 指引"],
}


def _stone_shape(x: float, y: float, w: float, h: float) -> str:
    return (
        f"M{x+w*0.1} {y+h*0.5} "
        f"C{x+w*0.07} {y+h*0.18} {x+w*0.34} {y+h*0.03} {x+w*0.6} {y+h*0.08} "
        f"C{x+w*0.92} {y+h*0.14} {x+w*0.98} {y+h*0.38} {x+w*0.9} {y+h*0.68} "
        f"C{x+w*0.8} {y+h*0.98} {x+w*0.4} {y+h*0.98} {x+w*0.18} {y+h*0.78} "
        f"C{x+w*0.1} {y+h*0.7} {x+w*0.08} {y+h*0.6} {x+w*0.1} {y+h*0.5} Z"
    )


def render(data: dict) -> dict:
    runes = data["runes"]
    meta = data.get("meta", {})
    material = meta.get("material", "stone")
    spread = meta.get("spread") or ({1: "single", 3: "three", 5: "five"}.get(len(runes), "custom"))
    style = MATERIAL_STYLE.get(material, MATERIAL_STYLE["stone"])
    labels = SPREAD_LABELS.get(spread, [f"第 {i+1} 枚" for i in range(len(runes))])

    n = len(runes)
    stone_w, stone_h, gap = 142, 178, 32
    width = max(620, n * stone_w + (n - 1) * gap + 80)
    height = 390

    stones_svg = ""
    for i, r in enumerate(runes):
        rune = r["rune"]
        is_rev = r["position"] == "reversed"
        x = 40 + i * (stone_w + gap)
        y = 92
        cx = x + stone_w / 2
        cy = y + stone_h / 2
        uid = f"rune-{i}"
        rotate = f'transform="rotate(180 {cx} {cy})"' if is_rev else ""
        path = _stone_shape(x, y, stone_w, stone_h)
        label = escape(labels[i] if i < len(labels) else "")
        glyph = escape(str(rune.get("glyph") or rune.get("symbol") or "ᚠ"))
        name = escape(str(rune.get("name") or ""))
        zh = escape(str(rune.get("zh") or ""))
        status = "逆位" if is_rev else "正位"
        status_color = "#FFB0A6" if is_rev else "#A7F3D0"

        if material == "wood":
            texture = f"""
            <path d="M{x+26} {y+62} C{x+56} {y+48} {x+91} {y+74} {x+118} {y+56}" fill="none" stroke="{style['grain']}" opacity=".28" stroke-width="2"/>
            <path d="M{x+24} {y+108} C{x+58} {y+90} {x+95} {y+124} {x+121} {y+102}" fill="none" stroke="{style['grain']}" opacity=".24" stroke-width="2"/>"""
        elif material == "crystal":
            texture = f"""
            <path d="M{x+28} {y+34} L{x+62} {y+154} M{x+86} {y+24} L{x+42} {y+142} M{x+116} {y+70} L{x+73} {y+166}" stroke="{style['grain']}" opacity=".34" stroke-width="1.4"/>
            <polygon points="{x+78},{y+22} {x+104},{y+62} {x+70},{y+54}" fill="rgba(255,255,255,0.22)"/>"""
        else:
            texture = f"""
            <circle cx="{x+43}" cy="{y+50}" r="3" fill="{style['grain']}" opacity=".18"/>
            <circle cx="{x+103}" cy="{y+126}" r="4" fill="{style['grain']}" opacity=".14"/>
            <path d="M{x+30} {y+116} C{x+60} {y+102} {x+86} {y+122} {x+112} {y+108}" fill="none" stroke="{style['grain']}" opacity=".2" stroke-width="1.6"/>"""

        stones_svg += f"""
        <g class="fadein" style="animation-delay:{i*0.25}s">
          <defs>
            <linearGradient id="{uid}-mat" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="{style['fill1']}"/>
              <stop offset="64%" stop-color="{style['fill2']}"/>
              <stop offset="100%" stop-color="#030405"/>
            </linearGradient>
            <filter id="{uid}-shadow"><feDropShadow dx="0" dy="12" stdDeviation="8" flood-color="#000" flood-opacity=".42"/></filter>
          </defs>
          <path d="{path}" fill="url(#{uid}-mat)" stroke="{style['stroke']}" stroke-width="2.2" filter="url(#{uid}-shadow)"/>
          <path d="{path}" fill="none" stroke="rgba(244,234,210,0.16)" stroke-width="1" transform="translate(0 0) scale(.9)" transform-origin="{cx} {cy}"/>
          {texture}
          <ellipse cx="{x+54}" cy="{y+42}" rx="22" ry="13" fill="rgba(255,255,255,0.14)"/>
          <text x="{cx}" y="{cy+14}" text-anchor="middle" font-size="68" fill="{style['rune_color']}" font-weight="700" filter="url(#oracle-soft-glow)" {rotate}>{glyph}</text>
          <text x="{cx}" y="{cy+58}" text-anchor="middle" font-size="11" fill="rgba(244,234,210,0.72)" letter-spacing="1" {rotate}>{name}</text>
          <text x="{cx}" y="304" text-anchor="middle" font-size="13" fill="{PALETTE['accent_light']}" letter-spacing="3">{label}</text>
          <text x="{cx}" y="326" text-anchor="middle" font-size="11" fill="{status_color}" letter-spacing="2">{status}</text>
          <text x="{cx}" y="350" text-anchor="middle" font-size="13" fill="rgba(255,255,255,0.74)" letter-spacing="1">{zh}</text>
        </g>"""

    svg = f"""
<svg viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="盧恩抽石結果">
{COMMON_KEYFRAMES}
{oracle_backdrop(width, height, "盧恩抽石", style["label"])}
<text x="{width/2}" y="78" text-anchor="middle" font-size="11" fill="{style['stroke']}" letter-spacing="5" opacity=".82">{style['label']} · {spread.upper()}</text>
{stones_svg}
</svg>"""

    parts = []
    for i, r in enumerate(runes):
        is_rev = r["position"] == "reversed"
        parts.append(f"{labels[i] if i < len(labels) else f'第{i+1}枚'}：{r['rune'].get('name','')}{'逆位' if is_rev else '正位'}")
    speech = f"用{style['label']}抽到的符文是：" + "；".join(parts) + "。"

    return {
        "svg": svg,
        "html": None,
        "palette": [style["stroke"], style["rune_color"]],
        "animations": [],
        "speech": speech,
    }
