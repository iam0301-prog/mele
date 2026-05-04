"""紫微視覺：12 宮位 4×4 排盤（iztro 資料格式）"""
from .common import COMMON_KEYFRAMES, PALETTE, oracle_backdrop

# 12 地支在 4×4 grid 的位置（傳統紫微盤）
GRID_POS = {
    "巳": (0, 0), "午": (1, 0), "未": (2, 0), "申": (3, 0),
    "辰": (0, 1),                                            "酉": (3, 1),
    "卯": (0, 2),                                            "戌": (3, 2),
    "寅": (0, 3), "丑": (1, 3), "子": (2, 3), "亥": (3, 3),
}


def render(data: dict) -> dict:
    palaces = data.get("palaces", [])
    if not palaces:
        return {"svg": "", "html": None, "palette": [], "animations": [], "speech": ""}

    cell_w, cell_h = 160, 145
    margin = 20

    cells_svg = ""
    by_branch = {p["earthlyBranch"]: p for p in palaces}

    for branch, (col, row) in GRID_POS.items():
        p = by_branch.get(branch)
        if not p:
            continue
        x = margin + col * cell_w
        y = margin + row * cell_h
        is_life = p.get("name") == "命宮"
        is_body = p.get("name") == "身宮"
        bg = "rgba(201,162,39,0.18)" if is_life else "rgba(255,255,255,0.03)"
        stroke = PALETTE["accent"] if is_life else PALETTE["accent_dim"]
        sw = "2" if is_life else "1"

        # 14 主星
        major_stars = p.get("majorStars", [])
        stars_svg = ""
        for i, s in enumerate(major_stars[:4]):  # 最多顯示 4 個
            star_y = y + 38 + i * 16
            brightness = s.get("brightness", "")
            mutagen = s.get("mutagen", "")
            br_text = f"({brightness})" if brightness else ""
            mu_text = f" {mutagen}化" if mutagen else ""
            stars_svg += f"""<text x="{x+10}" y="{star_y}" font-size="12" fill="{PALETTE['accent_light']}">{s['name']}{br_text}{mu_text}</text>"""

        # 輔星（小）
        minor_stars = p.get("minorStars", [])[:3]
        minors_text = ' '.join(s["name"] for s in minor_stars)
        minor_svg = ""
        if minors_text:
            minor_svg = f'<text x="{x+10}" y="{y+cell_h-22}" font-size="9" fill="rgba(255,255,255,0.5)">{minors_text}</text>'

        # 干支標示（右下角）
        hs = p.get("heavenlyStem", "")
        gz = f"{hs}{branch}"

        cells_svg += f"""
        <g class="fadein" style="animation-delay:{(col+row)*0.05}s">
        <rect x="{x}" y="{y}" width="{cell_w-4}" height="{cell_h-4}" rx="6"
              fill="{bg}" stroke="{stroke}" stroke-width="{sw}"/>
        <text x="{x+10}" y="{y+20}" font-size="13" fill="{PALETTE['accent']}" letter-spacing="1">{p['name']}</text>
        {f'<text x="{x+cell_w-30}" y="{y+20}" font-size="9" fill="#F4A261">身宮</text>' if is_body and not is_life else ''}
        {stars_svg}
        {minor_svg}
        <text x="{x+cell_w-12}" y="{y+cell_h-10}" text-anchor="end" font-size="11" fill="rgba(255,255,255,0.55)">{gz}</text>
        </g>
        """

    # 中央資訊
    cx, cy = margin + 2 * cell_w, margin + 2 * cell_h
    lunar_date_str = data.get("lunarDate", "")
    if isinstance(lunar_date_str, dict):
        lunar_date_str = f"{lunar_date_str.get('year','')}年{lunar_date_str.get('month','')}月{lunar_date_str.get('day','')}日"

    soul = data.get("soul", "")
    body = data.get("body", "")
    five_class = data.get("fiveElementsClass", "")
    time_label = data.get("time", "")
    chinese_date = data.get("chineseDate", "")

    center_svg = f"""
    <rect x="{cx-cell_w}" y="{cy-cell_h}" width="{cell_w*2-4}" height="{cell_h*2-4}" rx="10"
          fill="rgba(0,0,0,0.45)" stroke="{PALETTE['accent']}" stroke-width="1.5"/>
    <text x="{cx}" y="{cy-cell_h+30}" text-anchor="middle" font-size="14" fill="{PALETTE['accent']}" letter-spacing="3">紫微命盤</text>
    <text x="{cx}" y="{cy-cell_h+55}" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.75)">{chinese_date}</text>
    <text x="{cx}" y="{cy-cell_h+80}" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.7)">五行局　{five_class}</text>
    <text x="{cx}" y="{cy-cell_h+102}" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.7)">命主 {soul}　身主 {body}</text>
    <text x="{cx}" y="{cy-cell_h+124}" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.7)">時辰 {time_label}</text>
    <text x="{cx}" y="{cy-cell_h+146}" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.5)">{lunar_date_str}</text>
    """

    width = margin * 2 + cell_w * 4
    height = margin * 2 + cell_h * 4
    svg = f"""
<svg viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">
{COMMON_KEYFRAMES}
{oracle_backdrop(width, height, "紫微斗數", "TWELVE PALACES ORACLE")}
{cells_svg}
{center_svg}
</svg>"""

    speech = f"你的紫微命盤：{five_class}，命主{soul}、身主{body}。"
    return {
        "svg": svg,
        "html": None,
        "palette": [PALETTE["accent"], PALETTE["accent_light"]],
        "animations": [],
        "speech": speech,
    }
