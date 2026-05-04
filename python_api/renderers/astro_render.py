"""占星視覺：本命星盤輪 + 行星定位（sweph 資料格式）"""
import math
from .common import COMMON_KEYFRAMES, PALETTE, oracle_backdrop


def render(data: dict) -> dict:
    planets = data["planets"]
    houses = data.get("houses", [])
    ascendant = data.get("ascendant") or {}
    midheaven = data.get("midheaven") or {}

    cx, cy, R_outer, R_inner, R_planet = 300, 300, 240, 180, 215

    sign_zh = ["牡羊", "金牛", "雙子", "巨蟹", "獅子", "處女",
               "天秤", "天蠍", "射手", "摩羯", "水瓶", "雙魚"]
    sign_sym = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"]

    # 12 星座外環
    sign_ring = ""
    for i in range(12):
        angle = i * 30
        x1 = cx + R_outer * math.cos(math.radians(180 - angle))
        y1 = cy + R_outer * math.sin(math.radians(180 - angle))
        x2 = cx + R_inner * math.cos(math.radians(180 - angle))
        y2 = cy + R_inner * math.sin(math.radians(180 - angle))
        sign_ring += f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{PALETTE["accent_dim"]}" stroke-width="0.8"/>'
        mid = i * 30 + 15
        sx = cx + (R_outer - 25) * math.cos(math.radians(180 - mid))
        sy = cy + (R_outer - 25) * math.sin(math.radians(180 - mid))
        sign_ring += f'<text x="{sx:.1f}" y="{sy:.1f}" text-anchor="middle" font-size="20" fill="{PALETTE["accent_light"]}" dominant-baseline="middle">{sign_sym[i]}</text>'
        sign_ring += f'<text x="{sx:.1f}" y="{sy+18:.1f}" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.5)">{sign_zh[i]}</text>'

    # 12 宮位線
    house_ring = ""
    if houses:
        for h in houses:
            angle = h.get("longitude", 0)
            x = cx + R_inner * math.cos(math.radians(180 - angle))
            y = cy + R_inner * math.sin(math.radians(180 - angle))
            house_ring += f'<line x1="{cx}" y1="{cy}" x2="{x:.1f}" y2="{y:.1f}" stroke="{PALETTE["accent_dim"]}" stroke-width="0.5" stroke-dasharray="2,2"/>'

    # 行星標記（sweph helper 回傳：p.zh / p.symbol / p.longitude / p.sign.zh / p.sign.degInSign / p.retrograde）
    planets_svg = ""
    for idx, (key, p) in enumerate(planets.items()):
        angle = p.get("longitude", 0)
        radius = R_planet - (idx % 3) * 12
        x = cx + radius * math.cos(math.radians(180 - angle))
        y = cy + radius * math.sin(math.radians(180 - angle))
        symbol = p.get("symbol", "·")
        retro_marker = (
            f'<text x="{x+13:.1f}" y="{y-8:.1f}" text-anchor="middle" font-size="8" fill="#ff8a8a">℞</text>'
            if p.get("retrograde") else ""
        )
        planets_svg += f"""
        <g class="fadein" style="animation-delay:{idx*0.08}s">
          <circle cx="{x:.1f}" cy="{y:.1f}" r="14" fill="rgba(13,27,42,0.85)" stroke="{PALETTE['accent']}" stroke-width="1"/>
          <text x="{x:.1f}" y="{y+4:.1f}" text-anchor="middle" font-size="14" fill="{PALETTE['accent_light']}">{symbol}</text>
          {retro_marker}
        </g>"""

    # 中央資訊（行星本身有 zh、其 sign 也有 zh、要用 sign.zh）
    sun = planets.get("sun", {})
    moon = planets.get("moon", {})
    sun_sign = (sun.get("sign") or {})
    moon_sign = (moon.get("sign") or {})
    asc_sign = (ascendant.get("sign") or {})
    mc_sign = (midheaven.get("sign") or {})

    sun_label = f"{sun_sign.get('zh','?')} {sun_sign.get('degInSign', 0):.1f}°"
    moon_label = f"{moon_sign.get('zh','?')} {moon_sign.get('degInSign', 0):.1f}°"
    asc_label = f"{asc_sign.get('zh','?')} {asc_sign.get('degInSign', 0):.1f}°" if asc_sign else "—"
    mc_label = f"{mc_sign.get('zh','?')} {mc_sign.get('degInSign', 0):.1f}°" if mc_sign else "—"

    svg = f"""
<svg viewBox="0 0 600 620" xmlns="http://www.w3.org/2000/svg">
{COMMON_KEYFRAMES}
{oracle_backdrop(600, 620, "占星星盤", "NATAL CHART ORACLE")}
<defs>
  <radialGradient id="centerGrad" cx="50%" cy="50%">
    <stop offset="0%" stop-color="rgba(201,162,39,0.15)"/>
    <stop offset="100%" stop-color="rgba(13,27,42,0)"/>
  </radialGradient>
</defs>
<circle cx="{cx}" cy="{cy}" r="{R_outer}" fill="none" stroke="{PALETTE['accent']}" stroke-width="1"/>
<circle cx="{cx}" cy="{cy}" r="{R_inner}" fill="url(#centerGrad)" stroke="{PALETTE['accent_dim']}" stroke-width="0.5"/>

<g style="transform-origin: {cx}px {cy}px; animation: spin 200s linear infinite;">
  {sign_ring}
</g>

{house_ring}
{planets_svg}

<text x="{cx}" y="{cy-40}" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.55)" letter-spacing="2">YOUR NATAL CHART</text>
<text x="{cx}" y="{cy-15}" text-anchor="middle" font-size="14" fill="{PALETTE['accent']}" letter-spacing="3">本命星盤</text>
<text x="{cx}" y="{cy+10}" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.78)">☉ {sun_label}　☽ {moon_label}</text>
<text x="{cx}" y="{cy+30}" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.7)">↑ Asc {asc_label}</text>
<text x="{cx}" y="{cy+48}" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.6)">⊕ MC {mc_label}</text>
</svg>"""

    speech = (
        f"你的太陽在{sun_sign.get('zh','?')}座 {sun_sign.get('degInSign', 0):.1f} 度，"
        f"月亮在{moon_sign.get('zh','?')}座 {moon_sign.get('degInSign', 0):.1f} 度，"
        f"上升星座是{asc_sign.get('zh','?')}。"
    )
    return {"svg": svg, "html": None,
            "palette": [PALETTE["accent"], PALETTE["accent_light"]],
            "animations": [], "speech": speech}
