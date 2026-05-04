"""八字視覺：4 柱昇起 + 五行能量條 + 十神標記"""
from .common import COMMON_KEYFRAMES, PALETTE, oracle_backdrop

WUXING_COLOR = {
    "木": PALETTE["wuxing_mu"], "火": PALETTE["wuxing_huo"],
    "土": PALETTE["wuxing_tu"], "金": PALETTE["wuxing_jin"],
    "水": PALETTE["wuxing_shui"],
}


def render(data: dict) -> dict:
    pillars = data["pillars"]
    wuxing_counts = data["wuxing"]["counts"]
    nayin = data["nayin"]
    shishen = data.get("shishen", {})
    day_master = data["dayMaster"]

    # 4 柱：年、月、日、時
    pillar_keys = ["year", "month", "day", "time"]
    pillar_titles = ["年柱", "月柱", "日柱（日主）", "時柱"]

    pillars_svg = ""
    for i, (key, title) in enumerate(zip(pillar_keys, pillar_titles)):
        x = 60 + i * 130
        gan, zhi = pillars[key]
        from .common import PALETTE as P
        is_day = key == "day"
        stroke = P["accent"] if is_day else P["accent_dim"]
        sw = "2" if is_day else "1"
        ss = shishen.get(key, "")
        pillars_svg += f"""
        <g class="fadein" style="animation-delay:{i*0.15}s">
          <rect x="{x}" y="80" width="100" height="170" rx="12" fill="rgba(0,0,0,0.25)" stroke="{stroke}" stroke-width="{sw}"/>
          <text x="{x+50}" y="105" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.65)" letter-spacing="2">{title}</text>
          <text x="{x+50}" y="160" text-anchor="middle" font-size="44" fill="{P['accent']}" font-weight="600">{gan}</text>
          <text x="{x+50}" y="210" text-anchor="middle" font-size="38" fill="{P['accent_light']}">{zhi}</text>
          <text x="{x+50}" y="232" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.5)">{nayin.get(key, '')}</text>
          {f'<text x="{x+50}" y="248" text-anchor="middle" font-size="9" fill="#F4A261">{ss}</text>' if ss else ''}
        </g>"""

    # 五行能量條
    total = sum(wuxing_counts.values()) or 1
    wuxing_svg = ""
    cur_x = 60
    bar_w = 460
    for el in ["木", "火", "土", "金", "水"]:
        c = wuxing_counts.get(el, 0)
        w = bar_w * c / total
        wuxing_svg += f"""
        <rect x="{cur_x}" y="290" width="{w}" height="32" fill="{WUXING_COLOR[el]}" class="fadein" style="animation-delay:{0.6 + ['木','火','土','金','水'].index(el)*0.1}s"/>
        <text x="{cur_x + w/2}" y="312" text-anchor="middle" font-size="13" fill="white" font-weight="600">{el} {c}</text>
        """
        cur_x += w

    # 日主標記
    day_master_color = WUXING_COLOR.get(data["dayMasterWuxing"], PALETTE["accent"])
    yin_yang = data["dayMasterYinYang"]

    svg = f"""
<svg viewBox="0 0 600 420" xmlns="http://www.w3.org/2000/svg">
{COMMON_KEYFRAMES}
{oracle_backdrop(600, 420, "你的八字", "FOUR PILLARS ORACLE")}

{pillars_svg}

<text x="300" y="280" text-anchor="middle" font-size="11" fill="{PALETTE['accent']}" letter-spacing="3">五行能量分布</text>
{wuxing_svg}

<g class="fadein" style="animation-delay:1.4s">
<text x="60" y="365" font-size="12" fill="rgba(255,255,255,0.6)">日主：</text>
<rect x="100" y="350" width="34" height="34" rx="6" fill="{day_master_color}"/>
<text x="117" y="374" text-anchor="middle" font-size="20" fill="white" font-weight="600">{day_master}</text>
<text x="148" y="372" font-size="13" fill="rgba(255,255,255,0.85)">{yin_yang}{data['dayMasterWuxing']}（{yin_yang}干）</text>
</g>
</svg>"""

    speech = (
        f"你的八字四柱：年柱{pillars['year'][0]}{pillars['year'][1]}、月柱{pillars['month'][0]}{pillars['month'][1]}、"
        f"日柱{pillars['day'][0]}{pillars['day'][1]}、時柱{pillars['time'][0]}{pillars['time'][1]}。"
        f"日主{day_master}屬{data['dayMasterWuxing']}，"
        f"五行統計木{wuxing_counts['木']}、火{wuxing_counts['火']}、土{wuxing_counts['土']}、"
        f"金{wuxing_counts['金']}、水{wuxing_counts['水']}。"
    )
    return {"svg": svg, "html": None,
            "palette": [WUXING_COLOR[el] for el in ["木", "火", "土", "金", "水"]],
            "animations": [], "speech": speech}
