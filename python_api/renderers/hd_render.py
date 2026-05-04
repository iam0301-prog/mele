"""Human Design BodyGraph renderer with Chinese labels and visible gates."""

from html import escape

from engines.explanations import GATE_MEANINGS
from .common import COMMON_KEYFRAMES, PALETTE, oracle_backdrop


GATE_TO_CENTER = {
    64: "Head", 61: "Head", 63: "Head",
    47: "Ajna", 24: "Ajna", 4: "Ajna", 17: "Ajna", 43: "Ajna", 11: "Ajna",
    62: "Throat", 23: "Throat", 56: "Throat", 16: "Throat", 20: "Throat",
    31: "Throat", 8: "Throat", 33: "Throat", 35: "Throat", 12: "Throat", 45: "Throat",
    7: "G", 1: "G", 13: "G", 25: "G", 10: "G", 15: "G", 2: "G", 46: "G",
    21: "Heart", 40: "Heart", 26: "Heart", 51: "Heart",
    34: "Sacral", 5: "Sacral", 14: "Sacral", 29: "Sacral",
    59: "Sacral", 9: "Sacral", 3: "Sacral", 42: "Sacral", 27: "Sacral",
    6: "SolarPlexus", 37: "SolarPlexus", 22: "SolarPlexus", 36: "SolarPlexus",
    30: "SolarPlexus", 55: "SolarPlexus", 49: "SolarPlexus",
    48: "Spleen", 57: "Spleen", 44: "Spleen", 50: "Spleen", 32: "Spleen", 28: "Spleen", 18: "Spleen",
    53: "Root", 60: "Root", 52: "Root", 19: "Root", 39: "Root", 41: "Root", 58: "Root", 38: "Root", 54: "Root",
}


CHANNELS = [
    (64, 47), (61, 24), (63, 4),
    (17, 62), (43, 23), (11, 56),
    (16, 48), (20, 57), (20, 10), (20, 34), (31, 7), (8, 1),
    (33, 13), (35, 36), (12, 22), (45, 21),
    (25, 51), (10, 34), (10, 57), (15, 5), (2, 14), (46, 29),
    (40, 37), (26, 44),
    (34, 57), (59, 6), (9, 52), (3, 60), (42, 53), (27, 50),
    (30, 41), (55, 39), (49, 19),
    (32, 54), (28, 38), (18, 58),
]


CENTER_META = {
    "Head": {"label": "頭頂", "shape": "triangle_up", "x": 360, "y": 148, "size": 76, "defined": "#d8c077"},
    "Ajna": {"label": "邏輯", "shape": "triangle_down", "x": 360, "y": 282, "size": 76, "defined": "#aeb7c2"},
    "Throat": {"label": "喉嚨", "shape": "square", "x": 360, "y": 424, "size": 78, "defined": "#6ab7c7"},
    "G": {"label": "G中心", "shape": "diamond", "x": 360, "y": 582, "size": 80, "defined": "#d7b15d"},
    "Heart": {"label": "意志", "shape": "triangle_left", "x": 505, "y": 600, "size": 56, "defined": "#c85b3f"},
    "Sacral": {"label": "薦骨", "shape": "square", "x": 360, "y": 742, "size": 78, "defined": "#cf8b35"},
    "SolarPlexus": {"label": "情緒", "shape": "triangle_right", "x": 522, "y": 760, "size": 76, "defined": "#ba7bd1"},
    "Spleen": {"label": "脾臟", "shape": "triangle_left", "x": 198, "y": 760, "size": 76, "defined": "#82b366"},
    "Root": {"label": "根部", "shape": "square", "x": 360, "y": 942, "size": 78, "defined": "#b94e4e"},
}


CENTER_GATE_SIDES = {
    "Head": {"bottom": [64, 61, 63]},
    "Ajna": {"top": [47, 24, 4], "bottom": [17, 43, 11]},
    "Throat": {"top": [62, 23, 56], "left": [16, 20, 31], "right": [8, 33, 35], "bottom": [12, 45]},
    "G": {"top": [7, 1, 13], "left": [25, 10], "right": [15, 2], "bottom": [46]},
    "Heart": {"top": [21], "left": [40], "right": [26], "bottom": [51]},
    "Sacral": {"top": [34, 5, 14, 29], "left": [59, 9], "right": [3, 42], "bottom": [27]},
    "SolarPlexus": {"top": [6, 37, 22], "left": [36, 30], "right": [55], "bottom": [49]},
    "Spleen": {"top": [48, 57], "right": [44, 50], "bottom": [32, 28, 18]},
    "Root": {"top": [53, 60, 52], "left": [19, 39], "right": [41, 58], "bottom": [38, 54]},
}


TYPE_LABELS = {
    "Reflector": "反映者",
    "Manifestor": "顯示者",
    "Generator": "生產者",
    "Manifesting Generator": "顯示生產者",
    "Projector": "投射者",
}


AUTHORITY_LABELS = {
    "Emotional": "情緒權威",
    "Sacral": "薦骨權威",
    "Splenic": "脾臟權威",
    "Ego (Heart)": "意志權威",
    "Self-Projected": "自我投射權威",
    "Lunar": "月亮權威",
    "Mental (Outer)": "環境權威",
}


PLANET_LABELS = {
    "sun": "太陽",
    "earth": "地球",
    "moon": "月亮",
    "northNode": "北交點",
    "southNode": "南交點",
    "mercury": "水星",
    "venus": "金星",
    "mars": "火星",
    "jupiter": "木星",
    "saturn": "土星",
    "uranus": "天王星",
    "neptune": "海王星",
    "pluto": "冥王星",
}


def _zh_type(value: str) -> str:
    return TYPE_LABELS.get(value, value or "未判定")


def _zh_authority(value: str) -> str:
    return AUTHORITY_LABELS.get(value, value or "未判定")


def _center_path(center: dict) -> str:
    s = center["size"] / 2
    x = center["x"]
    y = center["y"]
    shape = center["shape"]
    if shape == "triangle_up":
        return f"M{x - s},{y + s} L{x + s},{y + s} L{x},{y - s} Z"
    if shape == "triangle_down":
        return f"M{x - s},{y - s} L{x + s},{y - s} L{x},{y + s} Z"
    if shape == "triangle_left":
        return f"M{x - s},{y} L{x + s},{y - s} L{x + s},{y + s} Z"
    if shape == "triangle_right":
        return f"M{x + s},{y} L{x - s},{y - s} L{x - s},{y + s} Z"
    if shape == "diamond":
        return f"M{x},{y - s} L{x + s},{y} L{x},{y + s} L{x - s},{y} Z"
    return f"M{x - s},{y - s} h{s * 2} v{s * 2} h{-s * 2} Z"


def _spread_slots(values: list[int], start: float, end: float) -> list[float]:
    if len(values) == 1:
        return [(start + end) / 2]
    step = (end - start) / (len(values) - 1)
    return [start + step * i for i in range(len(values))]


def _gate_positions() -> dict[int, tuple[float, float]]:
    positions: dict[int, tuple[float, float]] = {}
    offset = 18
    for center_name, sides in CENTER_GATE_SIDES.items():
        meta = CENTER_META[center_name]
        half = meta["size"] / 2
        x = meta["x"]
        y = meta["y"]
        for side, gates in sides.items():
            if side in ("top", "bottom"):
                xs = _spread_slots(gates, x - half + 10, x + half - 10)
                gy = y - half - offset if side == "top" else y + half + offset
                for gate, gx in zip(gates, xs):
                    positions[gate] = (gx, gy)
            else:
                ys = _spread_slots(gates, y - half + 10, y + half - 10)
                gx = x - half - offset if side == "left" else x + half + offset
                for gate, gy in zip(gates, ys):
                    positions[gate] = (gx, gy)
    return positions


def _activation_records(data: dict) -> dict[int, list[dict]]:
    records: dict[int, list[dict]] = {}
    for layer_label, key in (("人格", "personalityBodies"), ("設計", "designBodies")):
        for body_key, body in (data.get(key) or {}).items():
            gate = body.get("gate")
            if gate is None:
                continue
            records.setdefault(int(gate), []).append({
                "layer": layer_label,
                "planet": PLANET_LABELS.get(body_key, body_key),
                "line": body.get("line"),
            })
    return records


def _fmt_line(value) -> str:
    if value is None:
        return ""
    return f"{value}線"


def _render_gate_cards(active_gates: list[int], records: dict[int, list[dict]]) -> str:
    if not active_gates:
        return ""

    cards = []
    for gate in active_gates:
        center = CENTER_META[GATE_TO_CENTER.get(gate, "")]["label"]
        gate_title, gate_copy = GATE_MEANINGS.get(
            gate,
            ("能量主題", "這個閘門描述一種被啟動的能量，需要放回你的類型、策略與權威下理解。"),
        )
        body_rows = []
        for record in records.get(gate, []):
            line = _fmt_line(record.get("line"))
            line_text = f" / {escape(line)}" if line else ""
            body_rows.append(
                f"<span>{escape(record['layer'])}・{escape(record['planet'])}{line_text}</span>"
            )
        body_html = "".join(body_rows) or "<span>此閘門被啟動</span>"
        cards.append(
            """
<div class="hd-gate-card">
  <div class="hd-gate-number">第 {gate} 閘門｜{gate_title}</div>
  <div class="hd-gate-center">{center}</div>
  <div class="hd-gate-copy">{gate_copy}</div>
  <div class="hd-gate-sources">{body_html}</div>
</div>
""".format(
                gate=gate,
                gate_title=escape(gate_title),
                center=escape(center),
                gate_copy=escape(gate_copy),
                body_html=body_html,
            )
        )

    template = """
<style>
.hd-detail-panel {
  margin-top: 18px;
  padding: 18px;
  border: 1px solid rgba(201, 162, 39, .22);
  background: rgba(8, 12, 18, .72);
  border-radius: 10px;
}
.hd-detail-title {
  color: #E8C547;
  font-weight: 700;
  letter-spacing: .08em;
  margin-bottom: 6px;
}
.hd-detail-copy {
  color: rgba(255, 255, 255, .62);
  font-size: 12px;
  line-height: 1.8;
  margin-bottom: 14px;
}
.hd-gate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
  gap: 10px;
}
.hd-gate-card {
  border: 1px solid rgba(232, 197, 71, .2);
  background: rgba(255, 255, 255, .045);
  border-radius: 8px;
  padding: 10px;
  min-height: 92px;
}
.hd-gate-number {
  color: #F5D76E;
  font-size: 15px;
  font-weight: 700;
}
.hd-gate-center {
  color: rgba(255, 255, 255, .72);
  font-size: 12px;
  margin-top: 2px;
}
.hd-gate-copy {
  color: rgba(255, 255, 255, .78);
  font-size: 12px;
  line-height: 1.7;
  margin-top: 8px;
}
.hd-gate-sources {
  display: grid;
  gap: 3px;
  color: rgba(255, 255, 255, .62);
  font-size: 11px;
  line-height: 1.45;
  margin-top: 8px;
}
</style>
<section class="hd-detail-panel">
  <div class="hd-detail-title">啟動閘門明細</div>
  <div class="hd-detail-copy">每張卡片列出該閘門所在中心，以及它來自人格或設計層的哪一顆行星。</div>
  <div class="hd-gate-grid">__CARDS__</div>
</section>
"""
    return template.replace("__CARDS__", "".join(cards))


def render(data: dict) -> dict:
    defined = set(data.get("definedCenters") or [])
    active_gates = sorted(int(g) for g in (data.get("activatedGates") or []))
    active_set = set(active_gates)
    defined_channels = {tuple(sorted(pair)) for pair in (data.get("definedChannels") or [])}
    type_label = _zh_type(data.get("type", ""))
    profile = data.get("profile", "")
    authority_label = _zh_authority(data.get("authority", ""))
    strategy = data.get("strategy", "")

    positions = _gate_positions()
    records = _activation_records(data)

    channel_svg = []
    for g1, g2 in CHANNELS:
        if g1 not in positions or g2 not in positions:
            continue
        x1, y1 = positions[g1]
        x2, y2 = positions[g2]
        is_defined = tuple(sorted((g1, g2))) in defined_channels
        is_half = (g1 in active_set) ^ (g2 in active_set)
        stroke = PALETTE["accent_light"] if is_defined else "rgba(255,255,255,.22)"
        width = 4 if is_defined else 2.2
        opacity = ".9" if is_defined else (".42" if is_half else ".2")
        dash = "" if is_defined else (' stroke-dasharray="8 9"' if is_half else "")
        channel_svg.append(
            f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
            f'stroke="{stroke}" stroke-width="{width}" opacity="{opacity}" stroke-linecap="round"{dash}/>'
        )

    centers_svg = []
    for name, meta in CENTER_META.items():
        is_defined = name in defined
        fill = meta["defined"] if is_defined else "rgba(255,255,255,.045)"
        stroke = PALETTE["accent_light"] if is_defined else "rgba(255,255,255,.22)"
        text_fill = "#111827" if is_defined else "rgba(255,255,255,.68)"
        cls = ' class="glow"' if is_defined else ""
        centers_svg.append(
            f'<path d="{_center_path(meta)}" fill="{fill}" stroke="{stroke}" stroke-width="2.2"{cls}/>'
        )
        centers_svg.append(
            f'<text x="{meta["x"]}" y="{meta["y"] + 5}" text-anchor="middle" '
            f'font-size="14" fill="{text_fill}" font-weight="700">{escape(meta["label"])}</text>'
        )

    gates_svg = []
    for gate in sorted(GATE_TO_CENTER):
        x, y = positions[gate]
        active = gate in active_set
        fill = PALETTE["accent_light"] if active else "#101723"
        stroke = "#fff2b8" if active else "rgba(255,255,255,.28)"
        text_fill = "#10131a" if active else "rgba(255,255,255,.72)"
        radius = 8.2 if active else 7.2
        font_size = 7.2 if gate >= 10 else 7.8
        cls = ' class="pulse"' if active else ""
        gates_svg.append(
            f'<g data-gate="{gate}">'
            f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="1.4"{cls}/>'
            f'<text x="{x:.1f}" y="{y + 2.9:.1f}" text-anchor="middle" font-size="{font_size}" '
            f'fill="{text_fill}" font-weight="700" stroke="rgba(5,7,11,.38)" stroke-width=".45" paint-order="stroke">{gate}</text>'
            f'</g>'
        )

    defined_list = "、".join(CENTER_META[c]["label"] for c in CENTER_META if c in defined) or "無定義中心"

    svg = f"""
<svg viewBox="0 0 720 1160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="人類圖能量圖">
{COMMON_KEYFRAMES}
{oracle_backdrop(720, 1160, "人類圖能量圖", "BODYGRAPH ORACLE")}
<defs>
  <radialGradient id="hd-bg" cx="50%" cy="12%" r="78%">
    <stop offset="0%" stop-color="#16253a"/>
    <stop offset="55%" stop-color="#0b111c"/>
    <stop offset="100%" stop-color="#05070b"/>
  </radialGradient>
</defs>
<text x="360" y="82" text-anchor="middle" font-size="11" fill="rgba(255,255,255,.58)" letter-spacing="1">64閘門 / 36通道 / 9大中心</text>

<g opacity=".98">
{''.join(channel_svg)}
</g>
<g>
{''.join(centers_svg)}
</g>
<g>
{''.join(gates_svg)}
</g>

<g class="fadein" style="animation-delay:.35s">
  <rect x="70" y="1074" width="580" height="62" rx="8" fill="rgba(0,0,0,.48)" stroke="{PALETTE['accent_dim']}"/>
  <line x1="250" y1="1084" x2="250" y2="1126" stroke="rgba(201,162,39,.22)"/>
  <line x1="470" y1="1084" x2="470" y2="1126" stroke="rgba(201,162,39,.22)"/>
  <text x="160" y="1098" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.52)" letter-spacing="1.5">類型</text>
  <text x="160" y="1120" text-anchor="middle" font-size="12" fill="{PALETTE['accent_light']}">{escape(str(type_label))}</text>
  <text x="360" y="1098" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.52)" letter-spacing="1.5">人生角色</text>
  <text x="360" y="1120" text-anchor="middle" font-size="13" fill="{PALETTE['accent_light']}">{escape(str(profile))}</text>
  <text x="580" y="1098" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.52)" letter-spacing="1.5">內在權威</text>
  <text x="580" y="1120" text-anchor="middle" font-size="11.5" fill="{PALETTE['accent_light']}">{escape(str(authority_label))}</text>
</g>
</svg>"""

    html = _render_gate_cards(active_gates, records)
    speech = (
        f"你的人類圖類型是 {type_label}，人生角色是 {profile}，內在權威是 {authority_label}。"
        f"這張圖目前點亮 {len(active_gates)} 個閘門、{len(defined_channels)} 條完整通道；"
        f"定義中心為 {defined_list}。策略：{strategy}"
    )

    return {
        "svg": svg,
        "html": html,
        "palette": [PALETTE["accent"], PALETTE["accent_light"], "#6ab7c7", "#ba7bd1"],
        "animations": [],
        "speech": speech,
    }
