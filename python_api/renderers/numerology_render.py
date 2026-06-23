"""Premium SVG renderer for numerology results."""

from html import escape

from .common import COMMON_KEYFRAMES, PALETTE, oracle_backdrop


def render(data: dict) -> dict:
    life_path = data["lifePath"]
    life_path_display = data.get("lifePathDisplay") or str(life_path)
    birth_day_display = data.get("birthDayDisplay") or str(data["birthDay"])
    is_master = data["isMaster"]
    breakdown = data["breakdown"]
    archetype = data["lifePathArchetype"]
    note = data.get("calculationNote") or ""

    fill_main = "#C53030" if is_master else PALETTE["accent"]
    fill_sub = "#E74C3C" if is_master else PALETTE["accent_light"]
    master_badge = (
        '<text x="300" y="82" text-anchor="middle" font-size="14" fill="#fff" letter-spacing="3">大師數，也可看作底色數</text>'
        if is_master
        else ""
    )

    svg = f"""
<svg viewBox="0 0 600 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="生命靈數結果">
{COMMON_KEYFRAMES}
{oracle_backdrop(600, 460, "生命靈數", "NUMEROLOGY ORACLE")}
<defs>
  <radialGradient id="numGrad" cx="50%" cy="40%">
    <stop offset="0%" stop-color="{fill_sub}"/>
    <stop offset="100%" stop-color="{fill_main}"/>
  </radialGradient>
  <filter id="softGlow"><feGaussianBlur stdDeviation="6"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<g class="fadein">
  <circle cx="300" cy="160" r="102" fill="url(#numGrad)" filter="url(#softGlow)" class="glow"/>
  <text x="300" y="183" text-anchor="middle" font-size="82" font-weight="700" fill="white">{escape(life_path_display)}</text>
  {master_badge}
</g>
<g class="fadein" style="animation-delay:.4s">
  <text x="300" y="286" text-anchor="middle" font-size="22" fill="{PALETTE["accent"]}" letter-spacing="3">{escape(archetype["name"])}</text>
  <foreignObject x="62" y="302" width="476" height="72">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:'Noto Sans TC';font-size:13px;color:rgba(255,255,255,0.86);text-align:center;line-height:1.8">
      {escape(archetype["desc"])}
    </div>
  </foreignObject>
</g>
<g class="fadein" style="animation-delay:.8s">
  <line x1="92" y1="392" x2="508" y2="392" stroke="{PALETTE["accent_dim"]}" stroke-dasharray="3,3"/>
  <text x="300" y="420" text-anchor="middle" font-size="13" fill="rgba(255,255,255,0.68)" letter-spacing="1">
    年 {breakdown["yearReduced"]} + 月 {breakdown["monthReduced"]} + 日 {breakdown["dayReduced"]} = {breakdown["total"]} -> {escape(life_path_display)}
  </text>
  <circle cx="120" cy="438" r="14" fill="rgba(255,255,255,0.05)" stroke="{PALETTE["accent_dim"]}"/>
  <text x="120" y="443" text-anchor="middle" font-size="11" fill="{PALETTE["accent"]}">{escape(birth_day_display)}</text>
  <text x="168" y="443" text-anchor="start" font-size="11" fill="rgba(255,255,255,0.58)">生日數</text>
  <text x="300" y="448" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.52)">{escape(note)}</text>
</g>
</svg>"""

    speech = (
        f"你的生命靈數是 {life_path_display}，原型是{archetype['name']}。"
        f"{archetype['desc']} 生日數是 {birth_day_display}。"
    )
    return {
        "svg": svg,
        "html": None,
        "palette": [fill_main, fill_sub, PALETTE["accent"]],
        "animations": [
            {"target": "main_circle", "type": "fadeIn", "duration": 0.8},
            {"target": "archetype_label", "type": "fadeIn", "duration": 0.8, "delay": 0.4},
            {"target": "breakdown", "type": "fadeIn", "duration": 0.8, "delay": 0.8},
        ],
        "speech": speech,
    }
