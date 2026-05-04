"""共用視覺常數 — 跟 web/assets/style.css 同調色"""

PALETTE = {
    "primary": "#0D1B2A",
    "primary_light": "#1E2D45",
    "accent": "#C9A227",
    "accent_light": "#E8C547",
    "accent_dim": "rgba(201,162,39,0.3)",
    "wuxing_mu": "#2D6A4F",   # 木
    "wuxing_huo": "#C53030",  # 火
    "wuxing_tu": "#B7791F",   # 土
    "wuxing_jin": "#718096",  # 金
    "wuxing_shui": "#2C5282", # 水
}

# 共用動畫 keyframes 給 SVG 內嵌
COMMON_KEYFRAMES = """
<defs><style><![CDATA[
@keyframes fadeIn { from {opacity:0;transform:translateY(8px);} to {opacity:1;transform:translateY(0);} }
@keyframes spin { from {transform:rotate(0deg);} to {transform:rotate(360deg);} }
@keyframes pulse { 0%,100% {opacity:.5;} 50% {opacity:1;} }
@keyframes drawLine { from {stroke-dashoffset:1000;} to {stroke-dashoffset:0;} }
@keyframes flip { 0% {transform:rotateY(0deg);} 50% {transform:rotateY(90deg);} 100% {transform:rotateY(0deg);} }
@keyframes glow { 0%,100% {filter:drop-shadow(0 0 4px #C9A227);} 50% {filter:drop-shadow(0 0 14px #E8C547);} }
.fadein { animation: fadeIn .8s ease-out both; }
.glow { animation: glow 3s ease-in-out infinite; }
.pulse { animation: pulse 2s ease-in-out infinite; }
text { font-family: 'Noto Serif TC', 'PingFang TC', 'Microsoft JhengHei', serif; }
]]></style></defs>
"""


def oracle_backdrop(width: int | float, height: int | float, title: str = "", subtitle: str = "") -> str:
    """Shared ornate background for calculator SVG results."""
    title_svg = ""
    if title:
        title_svg = f"""
  <text x="{width/2}" y="42" text-anchor="middle" font-size="20" fill="{PALETTE['accent_light']}" letter-spacing="5">{title}</text>
  <text x="{width/2}" y="60" text-anchor="middle" font-size="9" fill="rgba(244,234,210,0.55)" letter-spacing="3">{subtitle}</text>"""

    return f"""
<defs>
  <radialGradient id="oracle-bg" cx="50%" cy="24%" r="76%">
    <stop offset="0%" stop-color="#1E2D45"/>
    <stop offset="55%" stop-color="#0D1B2A"/>
    <stop offset="100%" stop-color="#05070C"/>
  </radialGradient>
  <linearGradient id="oracle-gold" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#F6E7A8"/>
    <stop offset="42%" stop-color="#C9A227"/>
    <stop offset="100%" stop-color="#8A6516"/>
  </linearGradient>
  <filter id="oracle-soft-glow">
    <feGaussianBlur stdDeviation="3" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<rect x="0" y="0" width="{width}" height="{height}" rx="18" fill="url(#oracle-bg)"/>
<path d="M24 24 H{width-24} V{height-24} H24 Z" fill="none" stroke="rgba(201,162,39,0.52)" stroke-width="1.4"/>
<path d="M38 38 H{width-38} V{height-38} H38 Z" fill="none" stroke="rgba(244,234,210,0.18)" stroke-width="1"/>
<path d="M54 22 C70 40 70 56 54 74 M{width-54} 22 C{width-70} 40 {width-70} 56 {width-54} 74 M54 {height-22} C70 {height-40} 70 {height-56} 54 {height-74} M{width-54} {height-22} C{width-70} {height-40} {width-70} {height-56} {width-54} {height-74}" fill="none" stroke="rgba(201,162,39,0.42)" stroke-width="1.2"/>
<g opacity="0.72">
  <circle cx="76" cy="82" r="1.3" fill="#E8C547"/>
  <circle cx="{width-82}" cy="86" r="1.2" fill="#E8C547"/>
  <circle cx="{width*0.22}" cy="{height-70}" r="1.1" fill="#F4EAD2"/>
  <circle cx="{width*0.72}" cy="{height-88}" r="1.3" fill="#F4EAD2"/>
  <path d="M{width/2-14} 25 H{width/2+14} M{width/2} 11 V39" stroke="#C9A227" stroke-width="1"/>
  <circle cx="{width/2}" cy="25" r="7" fill="none" stroke="#C9A227" stroke-width="1"/>
</g>
{title_svg}
"""
