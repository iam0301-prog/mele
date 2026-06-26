"""八字視覺：四柱、藏干十神、五行能量條、日主旺衰"""

from .common import COMMON_KEYFRAMES, PALETTE, oracle_backdrop

WUXING_COLOR = {
    "木": PALETTE["wuxing_mu"],
    "火": PALETTE["wuxing_huo"],
    "土": PALETTE["wuxing_tu"],
    "金": PALETTE["wuxing_jin"],
    "水": PALETTE["wuxing_shui"],
}

SHISHEN_TRAD = {
    "劫财": "劫財", "伤官": "傷官", "偏财": "偏財",
    "正财": "正財", "七杀": "七殺",
}
CS_TRAD = {
    "长生": "長生", "冠带": "冠帶", "临官": "臨官",
    "养": "養", "绝": "絕",
}


def _ss(text: str) -> str:
    """簡體十神 -> 繁體"""
    return SHISHEN_TRAD.get(text, text)


def _cs(text: str) -> str:
    """簡體十二長生 -> 繁體"""
    return CS_TRAD.get(text, text)


def render(data: dict) -> dict:
    pillars = data["pillars"]
    wuxing_counts = data["wuxing"]["counts"]
    nayin = data["nayin"]
    shishen_gan = data.get("shishen", {})
    hidden_stems = data.get("hiddenStems", {})
    chang_sheng = data.get("changSheng", {})
    strength = data.get("strength", {})
    day_master = data["dayMaster"]

    # ── 四柱 SVG（含藏干 + 長生）──
    pillar_keys = ["year", "month", "day", "time"]
    pillar_titles = ["年柱", "月柱", "日柱（日主）", "時柱"]

    pillars_svg = ""
    for i, (key, title) in enumerate(zip(pillar_keys, pillar_titles, strict=False)):
        x = 60 + i * 130
        gan, zhi = pillars[key]
        from .common import PALETTE as P

        is_day = key == "day"
        stroke = P["accent"] if is_day else P["accent_dim"]
        sw = "2" if is_day else "1"
        ss_text = _ss(shishen_gan.get(key, "")) if not is_day else ""

        # 藏干（本氣優先）
        stems = hidden_stems.get(key, [])
        cang_text = " ".join(
            f"{s['gan']}({_ss(s['shishen'])})"
            for s in stems[:2]  # 最多顯示本氣+中氣
        )

        # 十二長生
        cs = chang_sheng.get(key, "")

        pillars_svg += f"""
        <g class="fadein" style="animation-delay:{i * 0.15}s">
          <rect x="{x}" y="70" width="100" height="195" rx="12" fill="rgba(0,0,0,0.25)" stroke="{stroke}" stroke-width="{sw}"/>
          <text x="{x + 50}" y="93" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.65)" letter-spacing="2">{title}</text>
          <text x="{x + 50}" y="148" text-anchor="middle" font-size="44" fill="{P["accent"]}" font-weight="600">{gan}</text>
          <text x="{x + 50}" y="196" text-anchor="middle" font-size="38" fill="{P["accent_light"]}">{zhi}</text>
          <text x="{x + 50}" y="216" text-anchor="middle" font-size="8.5" fill="rgba(255,255,255,0.45)">{nayin.get(key, "")}</text>
          {f'<text x="{x + 50}" y="230" text-anchor="middle" font-size="8.5" fill="#F4A261">{ss_text}</text>' if ss_text else ""}
          {f'<text x="{x + 50}" y="244" text-anchor="middle" font-size="7.5" fill="rgba(255,206,120,0.75)">{cang_text}</text>' if cang_text else ""}
          {f'<text x="{x + 50}" y="258" text-anchor="middle" font-size="7.5" fill="rgba(180,255,180,0.6)">{_cs(cs)}</text>' if cs else ""}
        </g>"""

    # ── 五行能量條 ──
    total = sum(wuxing_counts.values()) or 1
    wuxing_svg = ""
    cur_x = 60
    bar_w = 460
    for el in ["木", "火", "土", "金", "水"]:
        c = wuxing_counts.get(el, 0)
        w = bar_w * c / total
        wuxing_svg += f"""
        <rect x="{cur_x}" y="288" width="{w}" height="28" fill="{WUXING_COLOR[el]}" class="fadein" style="animation-delay:{0.6 + ["木", "火", "土", "金", "水"].index(el) * 0.1}s"/>
        <text x="{cur_x + w / 2}" y="307" text-anchor="middle" font-size="12" fill="white" font-weight="600">{el} {c}</text>
        """
        cur_x += w

    # ── 日主資訊列 ──
    day_master_color = WUXING_COLOR.get(data["dayMasterWuxing"], PALETTE["accent"])
    yin_yang = data["dayMasterYinYang"]
    strength_val = strength.get("strength", "")
    month_state = strength.get("monthState", "")
    strength_str = f"{strength_val}·月令{month_state}" if strength_val and month_state else strength_val

    svg = f"""
<svg viewBox="0 0 600 430" xmlns="http://www.w3.org/2000/svg">
{COMMON_KEYFRAMES}
{oracle_backdrop(600, 430, "你的八字", "FOUR PILLARS ORACLE")}

{pillars_svg}

<text x="300" y="278" text-anchor="middle" font-size="10" fill="{PALETTE["accent"]}" letter-spacing="3">五行分布（天干＋地支）</text>
{wuxing_svg}

<g class="fadein" style="animation-delay:1.3s">
<text x="60" y="345" font-size="11" fill="rgba(255,255,255,0.55)">日主：</text>
<rect x="98" y="331" width="30" height="30" rx="5" fill="{day_master_color}"/>
<text x="113" y="352" text-anchor="middle" font-size="18" fill="white" font-weight="600">{day_master}</text>
<text x="140" y="350" font-size="12" fill="rgba(255,255,255,0.85)">{yin_yang}{data["dayMasterWuxing"]}</text>
{f'<text x="60" y="370" font-size="10" fill="rgba(255,206,100,0.8)">{strength_str}</text>' if strength_str else ""}
</g>
</svg>"""

    speech = (
        f"你的八字四柱：年柱{pillars['year'][0]}{pillars['year'][1]}、"
        f"月柱{pillars['month'][0]}{pillars['month'][1]}、"
        f"日柱{pillars['day'][0]}{pillars['day'][1]}、"
        f"時柱{pillars['time'][0]}{pillars['time'][1]}。"
        f"日主{day_master}屬{data['dayMasterWuxing']}，{strength_val}。"
        f"五行統計木{wuxing_counts['木']}火{wuxing_counts['火']}土{wuxing_counts['土']}"
        f"金{wuxing_counts['金']}水{wuxing_counts['水']}。"
    )
    return {
        "svg": svg,
        "html": None,
        "palette": [WUXING_COLOR[el] for el in ["木", "火", "土", "金", "水"]],
        "animations": [],
        "speech": speech,
    }
