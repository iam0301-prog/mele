"""瑪雅視覺：旋轉的銀河印記 + 神諭板"""
from .common import COMMON_KEYFRAMES, PALETTE, oracle_backdrop


SEAL_COLOR_MAP = {
    "red": ("#c94a3f", "#ffd1c9"),
    "white": ("#efe7d2", "#fff9e8"),
    "blue": ("#2f7fd3", "#c9e7ff"),
    "yellow": ("#d9aa32", "#fff0a6"),
}

SEAL_SLUGS = [
    "red-dragon",
    "white-wind",
    "blue-night",
    "yellow-seed",
    "red-serpent",
    "white-worldbridger",
    "blue-hand",
    "yellow-star",
    "red-moon",
    "white-dog",
    "blue-monkey",
    "yellow-human",
    "red-skywalker",
    "white-wizard",
    "blue-eagle",
    "yellow-warrior",
    "red-earth",
    "white-mirror",
    "blue-storm",
    "yellow-sun",
]


def _seal_idx(seal: dict) -> int:
    try:
        return int(seal.get("idx") or seal.get("sealNum") or 0)
    except (TypeError, ValueError):
        return 0


def _seal_colors(seal: dict) -> tuple[str, str]:
    color_name = str(seal.get("en", "")).split(" ", 1)[0].lower()
    return SEAL_COLOR_MAP.get(color_name, (PALETTE["accent"], "#fff7cc"))


def _seal_mark(idx: int, fill: str, line: str, spark: str) -> str:
    common = f'stroke="{line}" stroke-linecap="round" stroke-linejoin="round"'
    if idx == 1:
        return f"""
          <path d="M50 18c17 10 25 23 25 39 0 16-12 28-28 28-12 0-22-8-22-20 0-9 7-16 16-16 7 0 12 5 12 11 0 5-4 9-9 9" fill="{fill}" fill-opacity="0.62" {common} stroke-width="4"/>
          <path d="M48 28c-15 11-20 26-13 42M58 28c10 12 10 29-1 42" fill="none" {common} stroke-width="4"/>"""
    if idx == 2:
        return f"""
          <path d="M18 38h45c9 0 12-13 3-17-5-2-10 1-11 6" fill="none" {common} stroke-width="6"/>
          <path d="M23 52h55c10 0 13 14 3 19-6 3-12-1-13-7" fill="none" {common} stroke-width="6"/>
          <path d="M30 66h26" fill="none" {common} stroke-width="6"/>"""
    if idx == 3:
        return f"""
          <path d="M58 18a31 31 0 1 0 16 55 25 25 0 1 1-16-55Z" fill="{fill}" fill-opacity="0.72"/>
          <circle cx="38" cy="34" r="2" fill="{spark}"/><circle cx="47" cy="58" r="1.8" fill="{spark}"/><circle cx="68" cy="42" r="1.6" fill="{spark}"/>"""
    if idx == 4:
        return f"""
          <path d="M50 78V43M33 78h34" fill="none" {common} stroke-width="5"/>
          <path d="M50 43c-13-2-22-11-24-25 14 1 24 10 24 25Z" fill="{fill}" fill-opacity="0.72" {common} stroke-width="3"/>
          <path d="M51 48c15-1 26-10 29-25-16 0-27 9-29 25Z" fill="{fill}" fill-opacity="0.72" {common} stroke-width="3"/>"""
    if idx == 5:
        return f"""
          <path d="M57 18c-21 8-12 24 0 30 17 9 14 30-10 35" fill="none" {common} stroke-width="7"/>
          <path d="M45 28l16-5M43 70l-15 6" fill="none" {common} stroke-width="4"/>
          <circle cx="59" cy="17" r="3" fill="{spark}"/>"""
    if idx == 6:
        return f"""
          <path d="M24 70c5-23 17-34 26-34s21 11 26 34" fill="none" {common} stroke-width="5"/>
          <path d="M31 70c3-14 11-22 19-22s16 8 19 22" fill="none" {common} stroke-width="4"/>
          <path d="M50 20v54M24 70h52" fill="none" {common} stroke-width="4"/>
          <circle cx="50" cy="28" r="3" fill="{spark}"/>"""
    if idx == 7:
        return f"""
          <path d="M34 77c-8-13-8-28-1-38l5 10V24c0-4 7-4 7 0v23-29c0-5 8-5 8 0v30-24c0-5 8-5 8 0v29l5-13c4 2 5 7 3 12L58 77Z" fill="{fill}" fill-opacity="0.68" {common} stroke-width="3"/>
          <path d="M38 49l8 9 13-17" fill="none" {common} stroke-width="5"/>"""
    if idx == 8:
        return f"""
          <path d="m50 15 8 24 25 1-20 15 7 25-20-14-21 14 8-25-20-15 25-1Z" fill="{fill}" fill-opacity="0.72" {common} stroke-width="3"/>
          <circle cx="50" cy="50" r="17" fill="none" {common} stroke-width="4"/>"""
    if idx == 9:
        return f"""
          <path d="M58 18a31 31 0 1 0 13 55 26 26 0 1 1-13-55Z" fill="{fill}" fill-opacity="0.72"/>
          <path d="M39 66c9 8 19 8 28 0" fill="none" {common} stroke-width="4"/>
          <path d="M50 34c9 10 9 18 0 25-9-7-9-15 0-25Z" fill="{spark}" fill-opacity="0.8"/>"""
    if idx == 10:
        return f"""
          <path d="M50 78S24 62 24 39c0-17 20-22 26-7 6-15 26-10 26 7 0 23-26 39-26 39Z" fill="{fill}" fill-opacity="0.72" {common} stroke-width="3"/>
          <path d="M34 47h32M50 32v36" fill="none" {common} stroke-width="4"/>"""
    if idx == 11:
        return f"""
          <path d="M50 24c16 0 23 18 11 28-8 7-21 3-21-8 0-8 9-13 16-8" fill="none" {common} stroke-width="7"/>
          <path d="M32 59c8 14 25 17 38 5M29 35c-6 11-5 24 4 34" fill="none" {common} stroke-width="4"/>
          <circle cx="70" cy="30" r="2" fill="{spark}"/><circle cx="26" cy="54" r="2" fill="{spark}"/>"""
    if idx == 12:
        return f"""
          <circle cx="50" cy="27" r="8" fill="none" {common} stroke-width="5"/>
          <path d="M50 37v35M30 49h40M39 80l11-8 11 8" fill="none" {common} stroke-width="5"/>
          <path d="M31 28c7-10 31-10 38 0" fill="none" {common} stroke-width="4"/>"""
    if idx == 13:
        return f"""
          <path d="M25 74V29l25-12 25 12v45" fill="none" {common} stroke-width="5"/>
          <path d="M35 68h30M40 56h20M44 44h12M50 18v52" fill="none" {common} stroke-width="4"/>
          <circle cx="50" cy="18" r="3" fill="{spark}"/>"""
    if idx == 14:
        return f"""
          <path d="m50 14 30 36-30 36-30-36Z" fill="{fill}" fill-opacity="0.5" {common} stroke-width="3"/>
          <circle cx="50" cy="50" r="16" fill="none" {common} stroke-width="4"/>
          <path d="M34 50h32M50 34v32" fill="none" {common} stroke-width="4"/>"""
    if idx == 15:
        return f"""
          <path d="M50 56c-15-21-30-25-39-21 7 16 20 27 39 21Z" fill="{fill}" fill-opacity="0.68" {common} stroke-width="3"/>
          <path d="M50 56c15-21 30-25 39-21-7 16-20 27-39 21Z" fill="{fill}" fill-opacity="0.68" {common} stroke-width="3"/>
          <path d="M50 31v42M35 72h30" fill="none" {common} stroke-width="4"/>
          <circle cx="50" cy="49" r="4" fill="{spark}"/>"""
    if idx == 16:
        return f"""
          <path d="M50 16 75 28v18c0 17-10 28-25 38-15-10-25-21-25-38V28Z" fill="{fill}" fill-opacity="0.68" {common} stroke-width="3"/>
          <path d="M50 27v46M37 42h26M38 59h24" fill="none" {common} stroke-width="4"/>
          <circle cx="50" cy="27" r="3" fill="{spark}"/>"""
    if idx == 17:
        return f"""
          <circle cx="50" cy="50" r="29" fill="none" {common} stroke-width="4"/>
          <path d="M50 17v66M17 50h66M29 71l42-42" fill="none" {common} stroke-width="4"/>
          <path d="m50 25 8 25-8 25-8-25Z" fill="{fill}" fill-opacity="0.68" {common} stroke-width="3"/>"""
    if idx == 18:
        return f"""
          <path d="m50 15 28 35-28 35-28-35Z" fill="{fill}" fill-opacity="0.52" {common} stroke-width="3"/>
          <path d="M34 50h32M50 26v48M38 34l24 32M62 34 38 66" fill="none" {common} stroke-width="4"/>"""
    if idx == 19:
        return f"""
          <path d="M56 14 29 52h19l-5 34 29-43H53Z" fill="{fill}" fill-opacity="0.72" {common} stroke-width="3"/>
          <path d="M29 29c-10 11-11 29-1 41M72 29c10 11 11 29 1 41" fill="none" {common} stroke-width="4"/>
          <circle cx="75" cy="23" r="2" fill="{spark}"/>"""
    return f"""
      <circle cx="50" cy="50" r="20" fill="{fill}" fill-opacity="0.72" {common} stroke-width="3"/>
      <path d="M50 13v14M50 73v14M13 50h14M73 50h14M24 24l10 10M66 66l10 10M76 24 66 34M34 66 24 76" fill="none" {common} stroke-width="4"/>
      <circle cx="50" cy="50" r="31" fill="none" {common} stroke-width="3"/>"""


def seal_glyph(seal: dict, cx: float, cy: float, scale: float = 0.42, hero: bool = False) -> str:
    idx = _seal_idx(seal)
    slug = SEAL_SLUGS[idx - 1] if 1 <= idx <= len(SEAL_SLUGS) else SEAL_SLUGS[0]
    size = 116 * scale
    x = cx - size / 2
    y = cy - size / 2
    class_name = f"maya-totem-image maya-totem-image--{idx}"
    if hero:
        class_name += " maya-totem-image--hero"
    return f"""
      <image class="{class_name}" href="/maya/totems/{slug}.png" x="{x:.2f}" y="{y:.2f}" width="{size:.2f}" height="{size:.2f}" preserveAspectRatio="xMidYMid meet"/>"""


def render(data: dict) -> dict:
    seal = data["seal"]
    tone = data["tone"]
    kin = data["kin"]
    oracle = data["oracle"]
    starroot = data.get("starroot") or {}
    classic = starroot.get("classicTzolkin") or {}
    haab = starroot.get("haab") or {}
    long_count = starroot.get("longCount") or {}
    moon = starroot.get("thirteenMoon") or {}

    # 用元素配色
    color_map = {"火": "#C53030", "土": "#B7791F", "風": "#718096", "水": "#2C5282"}
    main_color = color_map.get(seal["element"], PALETTE["accent"])

    def cell(x, y, role, k_info, is_self=False):
        if not k_info:
            return ""
        bg = main_color if is_self else "rgba(0,0,0,0.25)"
        stroke = main_color if is_self else PALETTE["accent_dim"]
        return f"""
        <g class="fadein">
          <rect x="{x}" y="{y}" width="104" height="92" rx="14" fill="{bg}" stroke="{stroke}" stroke-width="{2 if is_self else 1}"/>
          <text x="{x+52}" y="{y+17}" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.74)" letter-spacing="2">{role}</text>
          {seal_glyph(k_info['seal'], x + 52, y + 48, 0.42)}
          <text x="{x+52}" y="{y+84}" text-anchor="middle" font-size="16" fill="{PALETTE['accent']}" font-weight="700">Kin {k_info['kin']}</text>
        </g>"""

    crosscheck_rows = [
        ("Dreamspell", f"Kin {kin} / {tone['en']} {seal['en']}"),
        ("傳統 Tzolkin", classic.get("label", "未提供")),
        ("Haab", haab.get("label", "未提供")),
        ("Long Count", long_count.get("starrootLabel") or long_count.get("label", "未提供")),
        ("13 Moon", moon.get("label", "未提供")),
    ]
    crosscheck_svg = "".join(
        f"""
        <g>
          <text x="88" y="{612 + i * 26}" font-size="10" fill="rgba(255,255,255,0.52)" letter-spacing="1.4">{label.upper()}</text>
          <text x="248" y="{612 + i * 26}" font-size="14" fill="rgba(255,255,255,0.9)">{value}</text>
        </g>"""
        for i, (label, value) in enumerate(crosscheck_rows)
    )

    svg = f"""
<svg viewBox="0 0 600 760" xmlns="http://www.w3.org/2000/svg">
{COMMON_KEYFRAMES}
{oracle_backdrop(600, 760, "馬雅曆盤", "MAYA KIN ORACLE")}
<defs>
  <radialGradient id="kinGrad" cx="50%" cy="50%">
    <stop offset="0%" stop-color="{main_color}" stop-opacity="0.9"/>
    <stop offset="100%" stop-color="#3a2a0a"/>
  </radialGradient>
</defs>

<!-- 旋轉外環（13 音調等分） -->
<g style="transform-origin: 300px 130px; animation: spin 80s linear infinite;">
  {''.join(f'<line x1="300" y1="{40+i}" x2="300" y2="{50+i}" stroke="{PALETTE["accent"]}" stroke-width="2" transform="rotate({i*360/13} 300 130)"/>' for i in range(13))}
</g>

<!-- 中央 Kin 球 -->
<circle cx="300" cy="130" r="80" fill="url(#kinGrad)" class="glow"/>
{seal_glyph(seal, 300, 130, 1.04, hero=True)}
<text x="300" y="120" text-anchor="middle" font-size="36" fill="white" font-weight="600">Kin {kin}</text>
<text x="300" y="148" text-anchor="middle" font-size="14" fill="white" letter-spacing="2">{tone['zh']} {seal['zh']}</text>

<text x="300" y="245" text-anchor="middle" font-size="14" fill="{PALETTE['accent']}" letter-spacing="3">命運神諭板</text>
<text x="300" y="263" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.5)" letter-spacing="3">ORACLE BOARD</text>

<!-- 神諭板：上=指引、右=支持、左=挑戰、下=隱藏推動力、中=本命 -->
<!-- 採對稱 20px 縫的十字佈局；五格大小完全一致 (100×80)、距中心皆 100px -->
<!-- 中心點 (300, 380)；20px 間距形成完美十字 -->
{cell(250, 280, '指引', oracle.get('guide'))}
{cell(130, 380, '挑戰', oracle.get('antipode'))}
{cell(250, 380, '本命', oracle.get('self'), is_self=True)}
{cell(370, 380, '支持', oracle.get('analog'))}
{cell(250, 480, '隱藏推動力', oracle.get('occult'))}

<g class="fadein">
  <rect x="58" y="575" width="484" height="145" rx="14" fill="rgba(0,0,0,0.22)" stroke="{PALETTE['accent_dim']}" stroke-width="1"/>
  <text x="300" y="596" text-anchor="middle" font-size="12" fill="{PALETTE['accent']}" letter-spacing="3">STARROOT 對照欄位</text>
  {crosscheck_svg}
</g>
</svg>"""

    speech = (
        f"你的瑪雅印記是 Kin {kin}，{tone['zh']} {seal['zh']}。"
        f"圖騰元素屬{seal['element']}，音調力量是{tone['power']}。"
        f"傳統馬雅曆對照為 Tzolkin {classic.get('label', '未提供')}、"
        f"Haab {haab.get('label', '未提供')}、Long Count {long_count.get('starrootLabel') or long_count.get('label', '未提供')}。"
    )
    return {"svg": svg, "html": None,
            "palette": [main_color, PALETTE["accent"]],
            "animations": [], "speech": speech}
