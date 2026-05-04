"""靈數視覺：脈動的數字球 + 拆解計算過程"""
from .common import COMMON_KEYFRAMES, PALETTE, oracle_backdrop


def render(data: dict) -> dict:
    lp = data["lifePath"]
    bd = data["birthDay"]
    is_master = data["isMaster"]
    bk = data["breakdown"]
    arche = data["lifePathArchetype"]

    fill_main = "#C53030" if is_master else PALETTE["accent"]
    fill_sub = "#E74C3C" if is_master else PALETTE["accent_light"]

    svg = f"""
<svg viewBox="0 0 600 460" xmlns="http://www.w3.org/2000/svg">
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
  <!-- 主數字球 -->
  <circle cx="300" cy="160" r="100" fill="url(#numGrad)" filter="url(#softGlow)" class="glow"/>
  <text x="300" y="190" text-anchor="middle" font-size="100" font-weight="700" fill="white">{lp}</text>
  {'<text x="300" y="80" text-anchor="middle" font-size="14" fill="#fff" letter-spacing="3">大師數</text>' if is_master else ''}
</g>
<g class="fadein" style="animation-delay:.4s">
  <text x="300" y="290" text-anchor="middle" font-size="22" fill="{PALETTE['accent']}" letter-spacing="3">{arche['name']}</text>
  <foreignObject x="60" y="305" width="480" height="60">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:'Noto Sans TC';font-size:13px;color:rgba(255,255,255,0.85);text-align:center;line-height:1.8">
      {arche['desc']}
    </div>
  </foreignObject>
</g>
<g class="fadein" style="animation-delay:.8s">
  <!-- 計算過程 -->
  <line x1="100" y1="395" x2="500" y2="395" stroke="{PALETTE['accent_dim']}" stroke-dasharray="3,3"/>
  <text x="300" y="425" text-anchor="middle" font-size="13" fill="rgba(255,255,255,0.6)" letter-spacing="1">
    年 {bk['yearReduced']} + 月 {bk['monthReduced']} + 日 {bk['dayReduced']} = {bk['total']} → {lp}
  </text>
  <circle cx="120" cy="440" r="14" fill="rgba(255,255,255,0.05)" stroke="{PALETTE['accent_dim']}"/>
  <text x="120" y="445" text-anchor="middle" font-size="12" fill="{PALETTE['accent']}">{bd}</text>
  <text x="120" y="463" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.5)">天賦數</text>
</g>
</svg>"""

    speech = (
        f"你的生命靈數是 {lp}，{arche['name']}。{arche['desc']}"
        f"天賦數 {bd}。"
    )
    return {
        "svg": svg, "html": None,
        "palette": [fill_main, fill_sub, PALETTE["accent"]],
        "animations": [
            {"target": "main_circle", "type": "fadeIn", "duration": 0.8},
            {"target": "archetype_label", "type": "fadeIn", "duration": 0.8, "delay": 0.4},
            {"target": "breakdown", "type": "fadeIn", "duration": 0.8, "delay": 0.8},
        ],
        "speech": speech,
    }
