"""Readable result explanations for teaser/free and full/teacher modes."""

from __future__ import annotations

from html import escape
from typing import Iterable, Literal

DetailLevel = Literal["teaser", "full"]


def _text(value: object, fallback: str = "") -> str:
    if value is None:
        return fallback
    return escape(str(value)) or fallback


def _join(items: Iterable[object], sep: str = "、") -> str:
    return sep.join(_text(item) for item in items if item not in (None, ""))


def _line(body: str) -> str:
    return f"<div class='exp-line'>{body}</div>"


def _section(title: str) -> str:
    return f"<div class='exp-section'>{escape(title)}</div>"


def _wrap(parts: list[str], detail: DetailLevel) -> str:
    inner = "".join(parts)
    if detail == "teaser":
        cta = """
<div class='exp-paywall'>
  <div class='exp-paywall-title'>想看完整深度解讀？</div>
  <div class='exp-paywall-hint'>可預約老師，將此盤面延伸成關係、事業、流年與行動建議。</div>
  <a class='exp-paywall-btn' href='/teachers'>預約老師解盤</a>
</div>"""
        return f"<div class='explanation'>{inner}{cta}</div>"
    return f"<div class='explanation explanation-full'>{inner}</div>"


NUMEROLOGY_GUIDE = {
    1: "主題是開創與自我領導。你適合先把方向立起來，再邀請他人一起完成。",
    2: "主題是合作與感受力。你能讀懂關係中的細節，也需要練習清楚表達界線。",
    3: "主題是表達與創造。你的能量需要被說出、寫出或演出，才會真正流動。",
    4: "主題是秩序與建造。你適合把混亂整理成系統，也要避免把自己逼得太緊。",
    5: "主題是自由與變化。你需要流動、探索與新鮮感，但也要替承諾保留位置。",
    6: "主題是照顧與責任。你擅長讓人安心，但不要把所有人的功課都背到自己身上。",
    7: "主題是探索與洞察。你需要獨處、研究與精神深度，答案常在安靜中浮現。",
    8: "主題是資源與影響力。你適合管理、整合與放大價值，也要讓權力服務於願景。",
    9: "主題是慈悲與完成。你容易看見更大的圖像，人生功課是放下與成全。",
    11: "主題是 11/2：11 代表靈感與感召，2 是關係與感受力的底色。你的直覺強，但也需要清楚界線。",
    22: "主題是 22/4：22 代表大型建造力，4 是秩序與落地的底色。你適合把理想做成可執行的結構。",
    33: "主題是 33/6：33 代表療癒與服務，6 是照顧與責任的底色。你適合陪伴他人，也要先照顧自己。",
}


MAYA_SEAL_THEMES = {
    "龍": "主題是生命力、滋養與重新開始。你容易在照顧、建立基礎或開創新局時展現力量。",
    "風": "主題是呼吸、溝通與訊息流動。你需要把感受說清楚，也適合成為連結不同想法的人。",
    "夜": "主題是夢境、豐盛與內在安全感。你的答案常藏在直覺、想像與安靜的內在世界裡。",
    "種子": "主題是目標、萌芽與專注。當你願意給自己時間扎根，潛力會用很穩的方式長出來。",
    "蛇": "主題是本能、身體與生命熱度。你需要相信身體訊號，別把直覺壓成過度理性。",
    "世界橋": "主題是放下、轉換與橋接。你擅長讓舊階段結束，也能把彼此不同的人事物接起來。",
    "手": "主題是療癒、完成與技藝。你的力量在於親手處理問題，把抽象理解落成具體成果。",
    "星星": "主題是美感、和諧與秩序。你會被質感與比例吸引，也適合把混亂整理成優雅形式。",
    "月": "主題是情緒流動、淨化與敏感度。你需要讓感受有出口，越能流動就越能看清方向。",
    "狗": "主題是愛、忠誠與心的連結。你的成長常透過關係發生，重點是讓愛包含界線。",
    "猴": "主題是玩心、魔法與彈性。你適合用幽默和創意鬆動僵局，但別用玩笑逃開真感受。",
    "人": "主題是自由意志、智慧與選擇。你的人生課題是做出真正屬於自己的選擇。",
    "天行者": "主題是探索、空間與勇氣。你需要移動、拓展視野，透過經驗認識世界也認識自己。",
    "巫師": "主題是臨在、接收與信任。當你不急著控制結果，反而更容易與時機同步。",
    "鷹": "主題是視野、創造與大局。你能看見長線圖像，適合把遠景轉成可執行的設計。",
    "戰士": "主題是提問、勇氣與智慧。你天生會追問真相，越能誠實發問，越能找到自己的路。",
    "地球": "主題是同步、導航與落地。你需要聽懂環境給的訊號，讓身體與生活節奏一起帶路。",
    "鏡": "主題是真相、界線與映照。你容易照見事情的本質，也要練習溫柔地說出清楚界線。",
    "風暴": "主題是變革、釋放與重啟。混亂不是失控，而是舊能量正在被更新。",
    "太陽": "主題是生命光、覺察與溫暖。你適合把事情照亮，也要記得讓自己被光照顧。",
}

MAYA_TONE_THEMES = {
    "磁性": "啟動方式是吸引與定錨，先確認你真正想召喚的主題。",
    "月亮": "啟動方式是辨認兩極與挑戰，關鍵在於看見對比後做選擇。",
    "電力": "啟動方式是服務與連結，適合把靈感轉成能幫助他人的行動。",
    "自我存在": "啟動方式是定義與形式，請把模糊感受整理成清楚架構。",
    "超頻": "啟動方式是賦權與中心感，重點是把資源集中在真正重要的地方。",
    "韻律": "啟動方式是平衡與組織，當生活節奏穩定，能量就會自然展開。",
    "共振": "啟動方式是調頻與感應，請相信你對場域氣氛的敏銳度。",
    "銀河": "啟動方式是完整與一致，外在行動要對齊內在價值。",
    "太陽": "啟動方式是意圖與脈動，明確意圖會帶來下一步推力。",
    "行星": "啟動方式是顯化與完成，把洞見落地成看得見的成果。",
    "光譜": "啟動方式是釋放與解放，放下不再需要的角色會讓力量回來。",
    "水晶": "啟動方式是合作與分享，答案常在群體交流中變得完整。",
    "宇宙": "啟動方式是超越與整合，適合回顧一整個循環的成熟與禮物。",
}

MAYA_ORACLE_ROLES = {
    "self": ("本命核心", "這是你最主要的生命題目，描述你自然發光的方式。"),
    "guide": ("引導力量", "這股力量像內在指南針，適合用來判斷下一步要往哪裡走。"),
    "analog": ("支持力量", "這股力量是你的友軍與補給，當你卡住時可從這裡找回穩定感。"),
    "antipode": ("挑戰力量", "這股力量不是敵人，而是訓練場，會逼你看見尚未整合的反面能力。"),
    "occult": ("隱藏力量", "這股力量常在低谷或意外中出現，像潛意識送來的暗線禮物。"),
}


def _maya_theme(name: object) -> str:
    text = str(name or "")
    for key, value in MAYA_SEAL_THEMES.items():
        if key in text:
            return value
    return "這個圖騰代表你與世界互動的一種能量語言，重點是把象徵放回真實生活裡觀察。"


MAYA_MEMBER_READING = {
    "龍": ("你很容易成為把事情重新養起來的人，適合從建立基礎、照顧資源、讓一件事恢復生命力開始。", "要留意自己是不是又把所有人的需要都放在前面，忘了先問：我自己的根基穩不穩。"),
    "風": ("你需要把感受說清楚，越願意把話講明白，關係與選擇就越容易流動。", "卡住時不是因為你不會說，而是你可能說了很多外圍，真正重要的需求還沒有出口。"),
    "夜": ("你的內在世界很豐富，直覺、夢境與想像力常會比理性更早感覺到答案。", "要留意自己是不是把不安藏回心裡，讓別人看不見你真正需要什麼。"),
    "種子": ("你適合專注培養一件事，只要環境對了，成長會很紮實。", "卡住時容易一直等更好的時機，結果真正想發芽的事停太久。"),
    "蛇": ("你的身體感很強，喜歡、不喜歡、靠近或遠離，身體常比頭腦更早知道。", "要留意自己是不是壓住本能，直到最後用過度反應保護自己。"),
    "世界橋": ("你有讓舊階段結束、轉換關係位置、重新連接的能力。", "卡住時常是捨不得放下不適合的角色，停在中間地帶。"),
    "手": ("你適合親手處理問題，把理解落到修補、整理與完成。", "要留意自己是不是一直替別人完成本該由對方完成的事。"),
    "星星": ("你對美感、和諧與秩序敏感，能把混亂整理成讓人舒服的形式。", "卡住時可能為了維持好看或和平，忽略真正不舒服的地方。"),
    "月": ("你很會感覺情緒流動，能透過感受辨認什麼需要被清理或更新。", "要留意一時情緒浪潮，不要把它直接當成全部真相。"),
    "狗": ("你的核心在信任、忠誠與心的連結，關係品質會深深影響你的狀態。", "卡住時容易因為在乎而過度忍耐，或把忠誠變成不能離開。"),
    "猴": ("你有幽默、創意與打破僵局的能力，越放鬆越能找到新解法。", "要留意自己是不是用玩笑或轉移注意力避開真正脆弱的問題。"),
    "人": ("你的課題在選擇與自由意志，你需要感覺這個決定真的屬於自己。", "卡住時容易聽太多意見，最後失去自己的判斷。"),
    "天行者": ("你需要空間、經驗與探索，走出去會讓你更認識自己。", "要分辨自己想離開，是因為要拓展，還是因為不想面對眼前問題。"),
    "巫師": ("你有很強的臨在感，不急著控制時，反而更能感覺到時機。", "卡住時可能停在等待，少了把感覺落地的下一步。"),
    "鷹": ("你能看見大局與未來藍圖，適合把複雜狀況拉高一層重新設計。", "要留意自己是不是看得太遠，反而忽略眼前最需要處理的一步。"),
    "戰士": ("你適合透過提問找到真相，越能誠實面對問題，越能長出勇氣。", "卡住時容易用質疑保護自己，一直追問到不敢行動。"),
    "地球": ("你適合聽環境訊號與生活節奏，答案常透過身邊事件同步出現。", "要留意自己是不是太想找外在徵兆，反而忽略已經知道的感受。"),
    "鏡": ("你容易看見真相與界線，能把事情照得很清楚。", "卡住時容易太快切割或太銳利，讓清楚變成防衛。"),
    "風暴": ("你有更新與重啟的力量，混亂有時是在逼你離開不適合的舊模式。", "要留意自己是不是在變動中急著抓回控制，反而更累。"),
    "太陽": ("你有照亮事情、帶來清楚與溫暖的能力，適合把模糊處說明白。", "卡住時可能一直扮演明亮的人，卻沒有讓自己的需要被看見。"),
}


def _maya_member_reading(name: object) -> tuple[str, str]:
    text = str(name or "")
    for key, value in MAYA_MEMBER_READING.items():
        if key in text:
            return value
    return (
        "這個圖騰像你面對世界時常用的語氣，請先把它放回日常選擇、關係與壓力反應裡觀察。",
        "卡住時通常不是圖騰不好，而是這股力量被用得太急、太滿，或用在不適合的地方。",
    )


def _tone_theme(name: object) -> str:
    text = str(name or "")
    for key, value in MAYA_TONE_THEMES.items():
        if key in text:
            return value
    return "這個調性說明能量如何被啟動、組織與表達。"


def explain_numerology(data: dict, detail: DetailLevel = "teaser") -> str:
    lp = data.get("lifePath")
    lp_display = data.get("lifePathDisplay") or lp
    lp_reduced = data.get("lifePathReduced")
    bd = data.get("birthDay")
    bd_display = data.get("birthDayDisplay") or bd
    arche = data.get("lifePathArchetype") or {}
    bd_arche = data.get("birthDayArchetype") or {}
    is_master = data.get("isMaster")

    parts = [
        _line(
            f"你的生命靈數是 <strong>{_text(lp_display)}</strong>"
            f"{'（保留大師數，也看底色數）' if is_master else ''}，核心原型是 <strong>{_text(arche.get('name'))}</strong>。"
        ),
        _line(NUMEROLOGY_GUIDE.get(lp, _text(arche.get("desc"), "此數字代表你一生反覆練習的核心節奏。"))),
    ]

    if is_master and lp_reduced:
        parts.append(_line(
            f"所以如果別的網站把你算成 <strong>{_text(lp_reduced)}</strong>，不是誰錯誰對；"
            f"那是把大師數繼續化簡。本平台會顯示 <strong>{_text(lp_display)}</strong>，讓兩種派別都看得到。"
        ))

    if bd and bd != lp:
        parts.append(_line(f"生日數 <strong>{_text(bd_display)}</strong> 顯示你日常表現出的氣質：{_text(bd_arche.get('name'), '個人特質')}。"))

    if detail == "full":
        parts.extend([
            _section("深度解讀方向"),
            _line("觀察你在壓力下會如何做決定，能看見生命靈數的陰影面。"),
            _line("適合把此數字延伸到職涯角色、親密關係、財務模式與年度節奏。"),
        ])
    return _wrap(parts, detail)


def explain_maya(data: dict, detail: DetailLevel = "teaser") -> str:
    seal = data.get("seal") or {}
    tone = data.get("tone") or {}
    oracle = data.get("oracle") or {}
    seal_name = seal.get("zh") or seal.get("name") or seal.get("label")
    tone_name = tone.get("zh") or tone.get("name") or tone.get("label")
    gift, shadow = _maya_member_reading(seal_name)

    parts = [
        _line(f"你是 <strong>Kin {_text(data.get('kin'))}</strong>，能量名稱為 <strong>{_text(tone_name)}{_text(seal_name)}</strong>。"),
        _line(f"白話先看你本人：<strong>{_text(seal_name)}</strong> 不是稱號，而是在說你的慣用節奏。{_text(gift)}"),
        _line(f"如果這段有中，通常會中在卡點：{_text(shadow)}"),
        _line(f"銀河調性 <strong>{_text(tone_name)}</strong> 補充的是這股力量如何被啟動：{_tone_theme(tone_name)}"),
    ]

    parts.append(_section("馬雅神諭關係"))
    for key in ("guide", "analog", "antipode", "occult"):
        label, role_copy = MAYA_ORACLE_ROLES[key]
        item = oracle.get(key) or {}
        item_seal_obj = item.get("seal") or {}
        item_tone_obj = item.get("tone") or {}
        item_seal = item_seal_obj.get("zh") or item_seal_obj.get("name") or item_seal_obj.get("label")
        item_tone = item_tone_obj.get("zh") or item_tone_obj.get("name") or item_tone_obj.get("label")
        if item_seal:
            kin_text = f"Kin {_text(item.get('kin'))}，" if item.get("kin") else ""
            tone_text = f"{_text(item_tone)}" if item_tone else ""
            parts.append(_line(
                f"<strong>{label}</strong>：{kin_text}{tone_text}{_text(item_seal)}。"
                f"{role_copy}{_maya_member_reading(item_seal)[0]}"
            ))

    if detail == "full":
        starroot = data.get("starroot") or {}
        parts.extend([
            _section("跨曆法對照"),
            _line(f"Dreamspell / 13 Moon / 傳統卓爾金等對照可用來確認同一天在不同系統中的定位：{_text(starroot.get('dreamspell', {}).get('label'))}。"),
            _line("若要作為正式諮詢，建議同時說明所採用的曆法系統，避免使用者把不同流派混為一談。"),
        ])
    return _wrap(parts, detail)


WUXING_GUIDE = {
    "木": "木重視生長、規劃、學習與向上突破。木日主需要能持續伸展的環境，越有願景越有生命力。",
    "火": "火重視熱情、表達、曝光與直覺反應。火日主需要被看見、被點燃，也要練習讓熱度穩定而不過度燃燒。",
    "土": "土重視承接、穩定、責任與安全感。土日主擅長守住局面，但也要避免把所有壓力都吞下來。",
    "金": "金重視界線、規則、判斷與精準執行。金日主適合用標準與決斷力建立成果，也要保留柔軟度。",
    "水": "水重視流動、智慧、資源與情緒感受。水日主需要彈性與思考空間，越能流動越能聚集資源。",
}

DAY_MASTER_GUIDE = {
    "甲": "甲木像大樹，重視原則、成長與長期方向；適合用穩定累積建立影響力。",
    "乙": "乙木像藤花，柔韌、細膩、善於調整；你常能在限制中找到新的生長路徑。",
    "丙": "丙火像太陽，外放、照亮、帶動氣氛；重點是讓熱情服務於清楚目標。",
    "丁": "丁火像燭光，敏銳、細緻、能照亮細節；你需要被理解，也適合用溫度影響他人。",
    "戊": "戊土像高山，穩重、有承擔力；適合成為團隊的支點，但要避免過度固執。",
    "己": "己土像田園，包容、務實、能孕育成果；你適合慢慢養成，也要避免過度替人收拾。",
    "庚": "庚金像礦石，直接、果斷、有開創切割力；需要在剛強中練習精準與節制。",
    "辛": "辛金像珠玉，審美敏銳、講究品質；越能保護自己的價值，越能散發光澤。",
    "壬": "壬水像大海，視野廣、適應力強；適合處理複雜資訊與流動資源。",
    "癸": "癸水像雨露，細膩、感受深、能滲透細節；你的洞察常來自安靜觀察。",
}

PILLAR_ROLES = {
    "year": ("年柱", "家族背景、早年環境與外在人際印象"),
    "month": ("月柱", "社會角色、工作節奏與出生季節給日主的力量"),
    "day": ("日柱", "自我核心、親密關係與你最貼身的生活狀態"),
    "time": ("時柱", "長期願景、晚年方向、創造力與深層行動模式"),
}


def _safe_int(value: object) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def _wuxing_balance_lines(counts: dict, day_wuxing: object) -> list[str]:
    numeric = {str(name): _safe_int(count) for name, count in counts.items()}
    if not numeric:
        return []

    max_count = max(numeric.values())
    min_count = min(numeric.values())
    strong = [name for name, count in numeric.items() if count == max_count and count > 0]
    soft = [name for name, count in numeric.items() if count == min_count]
    missing = [name for name, count in numeric.items() if count == 0]
    day_count = numeric.get(str(day_wuxing), 0)

    lines = []
    if missing:
        lines.append(f"目前較缺席的五行是 <strong>{_join(missing)}</strong>，代表這些能量需要透過環境、習慣或合作關係來補足。")
    else:
        lines.append("五行沒有完全缺席，這表示命盤素材相對齊全；接下來重點不是補一個元素，而是看哪一股能量過強或過弱。")

    if strong:
        lines.append(f"最突出的五行是 <strong>{_join(strong)}</strong>，這些通常是你最常自然使用、也最容易過度使用的能量。")
    if soft and not missing:
        lines.append(f"相對較少的五行是 <strong>{_join(soft)}</strong>，可留意生活中是否較少出現它代表的支持方式。")
    if day_wuxing:
        if day_count >= 2:
            lines.append(f"日主五行 <strong>{_text(day_wuxing)}</strong> 在盤中有一定支援，表示自我能量不算孤單；真正要看的是季節、十神與大運如何牽動它。")
        else:
            lines.append(f"日主五行 <strong>{_text(day_wuxing)}</strong> 在盤中支援較少，容易需要透過休息、環境與關係來補回核心能量。")
    return lines


def explain_bazi(data: dict, detail: DetailLevel = "teaser") -> str:
    pillars = data.get("pillars") or {}
    counts = (data.get("wuxing") or {}).get("counts") or {}
    day_master = data.get("dayMaster")
    day_wuxing = data.get("dayMasterWuxing")
    day_yinyang = data.get("dayMasterYinYang")

    parts = [
        _line(f"你的日主是 <strong>{_text(day_yinyang)}{_text(day_wuxing)}（{_text(day_master)}）</strong>，這是八字解讀的核心入口。"),
        _line(DAY_MASTER_GUIDE.get(day_master, WUXING_GUIDE.get(day_wuxing, "日主代表你最核心的自我運作方式。"))),
        _section("四柱結構"),
    ]

    for key in ("year", "month", "day", "time"):
        label, role = PILLAR_ROLES[key]
        pillar = pillars.get(key) or []
        if pillar:
            parts.append(_line(f"{label}：<strong>{_join(pillar, '')}</strong>，主要看 {role}。"))

    if counts:
        parts.append(_section("五行分布"))
        parts.append(_line("五行計數：" + _join([f"{name}{count}" for name, count in counts.items()])))
        for line in _wuxing_balance_lines(counts, day_wuxing):
            parts.append(_line(line))

    if detail == "full":
        parts.extend([
            _section("深度解讀方向"),
            _line("下一層建議看月令、十神、格局、喜忌與大運流年，才能判斷事件發生的時間感，而不是只看五行數量。"),
            _line("正式解盤時，建議把五行強弱轉成具體建議：適合的工作節奏、溝通方式、休息模式、財務習慣與關係界線。"),
            _line("八字不是把人定型，而是看一個人在不同環境下會如何被啟動；同一張盤在不同年運中也會呈現不同面向。"),
        ])
    return _wrap(parts, detail)


def _star_name(star: object) -> str:
    if isinstance(star, dict):
        return _text(star.get("name") or star.get("nameZh") or star.get("label"))
    return _text(star)


def explain_ziwei(data: dict, detail: DetailLevel = "teaser") -> str:
    ming = data.get("mingGong") or {}
    palaces = data.get("palaces") or []
    soul = data.get("soul")
    body = data.get("body")
    five = data.get("fiveElementsClass")

    ming_name = ming.get("name") or ming.get("earthlyBranch") or ""
    ming_stars = ming.get("majorStarNames") or ming.get("majorStars") or []
    if not ming_stars and isinstance(palaces, list):
        for palace in palaces:
            if palace.get("name") == "命宮":
                ming_stars = palace.get("majorStarNames") or palace.get("majorStars") or []
                ming_name = ming_name or palace.get("earthlyBranch") or palace.get("name")
                break

    parts = [
        _line(f"你的紫微命盤以 <strong>{_text(five, '五行局')}</strong> 為結構背景，命主 <strong>{_text(soul)}</strong>、身主 <strong>{_text(body)}</strong>。"),
        _line(f"命宮位置：<strong>{_text(ming_name, '命宮')}</strong>，代表你面對人生舞台時最主要的展現方式。"),
    ]
    if ming_stars:
        parts.append(_line(f"命宮主要星曜：<strong>{_join(_star_name(star) for star in ming_stars)}</strong>。"))

    def palace_line(target: str, topic: str) -> str | None:
        if not isinstance(palaces, list):
            return None
        for palace in palaces:
            if palace.get("name") == target:
                stars = palace.get("majorStarNames") or palace.get("majorStars") or []
                star_text = _join(_star_name(star) for star in stars) or "暫無主星，需看對宮與三方四正"
                branch = _text(palace.get("earthlyBranch"))
                return f"{target}（{branch}）：{star_text}。這裡先看「{topic}」，如果這題最近很有感，就比泛泛看整張盤更值得先問。"
        return None

    parts.append(_section("先挑一個真的想問的題目"))
    for line in [
        palace_line("官祿", "工作定位、職涯方向與投入方式"),
        palace_line("夫妻", "關係模式、親密安全感與伴侶互動"),
        palace_line("財帛", "賺錢方式、資源流動與金錢壓力"),
    ]:
        if line:
            parts.append(_line(line))

    parts.append(_line("紫微不是一次把全部宮位背起來，而是先抓命宮主軸，再挑一個最有感的生活問題深看。老師解盤的價值，就在於把對宮、三方四正與流年一起合參。"))

    if detail == "full":
        for palace in palaces[:12]:
            stars = palace.get("majorStarNames") or palace.get("majorStars") or []
            star_text = _join(_star_name(star) for star in stars) or "無主星"
            parts.append(_line(f"<strong>{_text(palace.get('name'))}</strong>：{_text(palace.get('heavenlyStem'))}{_text(palace.get('earthlyBranch'))}，主星 {star_text}。"))
        parts.append(_line("正式諮詢時，建議把命宮、身宮、財帛、官祿、夫妻與遷移宮串成一條人生敘事，而不是逐宮孤立解讀。"))
    return _wrap(parts, detail)


def _sign_text(value: object) -> str:
    if not isinstance(value, dict):
        return _text(value)
    sign = value.get("sign")
    if isinstance(sign, dict):
        deg = sign.get("degInSign")
        deg_str = f"{round(float(deg), 1):.1f}度" if deg is not None else None
        return _join([sign.get("symbol"), sign.get("zh"), deg_str], " ")
    return _text(sign or value.get("zh") or value.get("label"))


ASTRO_MEMBER_READING = {
    "牡羊": ("需要直接感、行動感與能自己開路的空間", "容易還沒聽完就先衝出去"),
    "金牛": ("需要穩定、身體感與能慢慢累積的安全感", "容易明知道不適合也不想改變"),
    "雙子": ("需要理解、交流與資訊流動，說出來會幫你釐清自己", "容易想太多、分心太多，真正的感受反而被跳過"),
    "巨蟹": ("需要情感安全、歸屬感與能照顧自己的空間", "容易把過去感受帶進現在，用保護殼防衛"),
    "獅子": ("需要被看見、創造與真心投入，越真誠越有光", "容易太在意表現，怕不被肯定就不敢自然發揮"),
    "處女": ("需要把事情整理清楚，透過細節、修正與服務建立價值", "容易過度挑剔自己，一直修到不敢開始"),
    "天秤": ("需要關係中的平衡、互相理解與好好協調的空間", "容易為了和諧先放掉自己的立場"),
    "天蠍": ("需要深度、真相與真正可信任的連結，不適合只停在表面", "容易太警戒或太想掌控，反而更難放鬆"),
    "射手": ("需要意義、遠方與能讓視野打開的方向", "容易只想離開，卻沒有整理真正要追求的是什麼"),
    "摩羯": ("需要長期目標、責任感與能一步步建立成果的路線", "容易把自己逼太緊，用表現證明價值"),
    "水瓶": ("需要獨立思考、系統視角與跟一般規則保持距離的空間", "容易太抽離，知道很多卻不一定讓人靠近"),
    "雙魚": ("需要想像力、感受力與能讓心柔軟下來的空間", "容易界線模糊，把別人的情緒也當成自己的責任"),
}


def _astro_member_reading(point: object) -> tuple[str, str]:
    text = str(point or "")
    for key, value in ASTRO_MEMBER_READING.items():
        if key in text:
            return value
    return ("代表一種需要放回生活場景理解的慣用模式", "卡住時可能會過度補償或失去彈性")


def explain_astro(data: dict, detail: DetailLevel = "teaser") -> str:
    planets = data.get("planets") or {}
    sun = data.get("sun") or planets.get("sun") or {}
    moon = data.get("moon") or planets.get("moon") or {}
    asc = data.get("ascendant") or {}
    mc = data.get("midheaven") or {}
    sun_text = _sign_text(sun)
    moon_text = _sign_text(moon)
    asc_text = _sign_text(asc)
    sun_gift, sun_shadow = _astro_member_reading(sun_text)
    moon_gift, moon_shadow = _astro_member_reading(moon_text)
    asc_gift, asc_shadow = _astro_member_reading(asc_text)

    parts = [
        _line(f"太陽 <strong>{sun_text}</strong>：你想活出的方向通常{_text(sun_gift)}；卡住時{_text(sun_shadow)}。"),
        _line(f"月亮 <strong>{moon_text}</strong>：你真正需要的安全感通常{_text(moon_gift)}；壓力下{_text(moon_shadow)}。"),
        _line(f"上升 <strong>{asc_text}</strong>：別人第一眼接收到的你，常帶著「{_text(asc_gift)}」的氣質；但也可能{_text(asc_shadow)}。"),
        _line(f"天頂：<strong>{_sign_text(mc)}</strong>，代表事業形象、成就方向與社會角色。"),
        _line("如果你覺得自己內在需要、外在表現與人生方向不一致，這就很適合帶著星盤問老師，因為答案通常在宮位與相位的交叉處。"),
    ]
    if detail == "full":
        parts.extend([
            _section("深度解讀方向"),
            _line("下一層建議加入宮位與主要相位，確認一個人的內在需求如何落到工作、關係與生活場景。"),
            _line("若作為正式諮詢，請特別說明出生時間精準度，因為上升與宮位對時間非常敏感。"),
        ])
    return _wrap(parts, detail)


HD_TYPE_LABELS = {
    "Manifestor": "顯示者",
    "Generator": "生產者",
    "Manifesting Generator": "顯示生產者",
    "Projector": "投射者",
    "Reflector": "反映者",
}

HD_STRATEGY_LABELS = {
    "To Inform": "先告知再行動",
    "To Respond": "等待回應",
    "To Wait for the Invitation": "等待邀請",
    "To Wait a Lunar Cycle": "等待月亮週期",
    "Inform": "先告知再行動",
    "Respond": "等待回應",
    "Wait for Invitation": "等待邀請",
}

HD_AUTHORITY_LABELS = {
    "Emotional": "情緒權威",
    "Sacral": "薦骨權威",
    "Splenic": "脾臟權威",
    "Ego (Heart)": "意志權威",
    "Self-Projected": "自我投射權威",
    "Lunar": "月亮權威",
    "Mental (Outer)": "環境權威",
}

HD_CENTER_LABELS = {
    "Head": "頭頂中心",
    "Ajna": "邏輯中心",
    "Throat": "喉嚨中心",
    "G": "G 中心",
    "Heart": "意志中心",
    "Sacral": "薦骨中心",
    "SolarPlexus": "情緒中心",
    "Spleen": "脾臟中心",
    "Root": "根部中心",
}

HD_TYPE_GUIDE = {
    "Manifestor": "你的能量適合啟動事件。重點不是等所有人同意，而是在行動前清楚告知，減少阻力。",
    "Generator": "你的能量來自回應。當身體對某件事有明確回應時，投入會更穩；勉強主動追逐容易耗能。",
    "Manifesting Generator": "你同時需要回應與快速試錯。允許自己用非線性的方式前進，但重要行動前仍要先確認身體回應。",
    "Projector": "你的天賦在於看見系統與他人的運作。等待正確邀請不是被動，而是讓你的洞察被真正接住。",
    "Reflector": "你像環境的鏡子，適合透過時間觀察變化。重大決定不要急，讓一整個月亮週期幫你看清楚。",
}

HD_AUTHORITY_GUIDE = {
    "Emotional": "情緒權威需要時間，今天很想要或很不想要都不必立刻決定；等情緒波浪走過後，清晰度會更高。",
    "Sacral": "薦骨權威重視身體當下的嗯/不嗯。比起腦袋分析，你更需要聽見身體對問題的直接回應。",
    "Splenic": "脾臟權威通常很安靜、很瞬間。直覺只說一次，因此需要在身體放鬆時練習辨認它。",
    "Ego (Heart)": "意志權威要看你是否真的有承諾力與心力。不要為了證明自己而答應，只有真心想做才有力量。",
    "Self-Projected": "自我投射權威需要把話說出來。當你聽見自己的聲音，方向感會變得比較清楚。",
    "Lunar": "月亮權威需要時間與環境觀察。你不是慢，而是需要看見自己在不同日子裡的真實反應。",
    "Mental (Outer)": "環境權威需要合適場域與可信任的人作為回音壁；不是請別人決定，而是透過說話聽見自己。",
}

GATE_MEANINGS = {
    1: ("創造", "你有用獨特方式表達自己的力量；當不急著證明時，創造力會自然被看見。"),
    2: ("方向", "你對人生方向與資源接收很敏感，適合先確認內在感受再前進。"),
    3: ("起始混沌", "新循環開始時容易混亂，但你能把混亂整理成新的秩序。"),
    4: ("解答", "你會尋找邏輯答案，但也要辨認問題是否真的屬於你。"),
    5: ("節奏", "你需要穩定節奏與規律，節奏被打亂時能量容易消耗。"),
    6: ("情緒邊界", "關係中的親近與距離很重要，情緒清楚後再承諾會更穩。"),
    7: ("角色方向", "你容易在群體中感覺方向與角色，適合以服務整體的方式帶路。"),
    8: ("貢獻風格", "你透過個人風格帶來貢獻，越真實越容易吸引適合的舞台。"),
    9: ("專注", "你有細節專注力，適合把注意力放在少數真正重要的事情上。"),
    10: ("自我行為", "你的人生課題是活出真實自我，而不是只扮演別人期待的樣子。"),
    11: ("想法", "你腦中有很多故事與靈感，適合分享啟發，但不必每個想法都立刻執行。"),
    12: ("謹慎表達", "你的表達需要對的情緒與時機；狀態對了，話語會很有感染力。"),
    13: ("聆聽", "你容易承接別人的故事，適合成為理解者，也要保護自己的情緒容量。"),
    14: ("資源動能", "你有把能量投入資源與工作的能力，重點是投入真正有回應的方向。"),
    15: ("極端節奏", "你的節奏可能不固定，適合接納自己的變化，同時找到可持續的生活框架。"),
    16: ("技藝熱情", "你適合透過練習養成技能，熱情加上重複會變成真正的才華。"),
    17: ("觀點", "你擅長形成觀點與分類，但需要用溫和方式讓別人願意聽見。"),
    18: ("修正", "你能看見可改善之處，重點是讓批判變成修正，而不是變成挑剔。"),
    19: ("需求敏感", "你對歸屬、親密與資源需求敏感，適合誠實說出需要。"),
    20: ("當下", "你需要活在此刻，當身體在場時，表達與行動會更精準。"),
    21: ("掌控", "你需要在資源與責任中有掌控感，適合清楚談條件與界線。"),
    22: ("優雅情緒", "你的魅力與情緒狀態連動，狀態對了自然有吸引力。"),
    23: ("簡化", "你能把複雜洞見說得簡單，但需要等待他人準備好接收。"),
    24: ("反覆思考", "你會反覆咀嚼靈感，直到它變成可理解的答案。"),
    25: ("純真", "你的力量在於不帶條件的心與真誠，但也要學會保護自己。"),
    26: ("影響與說服", "你擅長包裝價值與說服他人，誠實會讓影響力更長久。"),
    27: ("照顧", "你有照顧與滋養的本能，也要記得先讓自己有足夠能量。"),
    28: ("生命意義", "你會追問值得不值得，當找到意義時能非常有韌性。"),
    29: ("承諾", "你有投入經驗的力量，但承諾前需要確認身體真的願意。"),
    30: ("渴望", "你容易被強烈渴望推動，適合把慾望看成方向訊號而不是命令。"),
    31: ("領導之聲", "你能透過表達帶領群體，但真正的領導需要被群體認可。"),
    32: ("延續", "你對可持續性和風險有敏銳度，適合判斷什麼值得長期投入。"),
    33: ("退隱回顧", "你需要時間消化經驗；退一步整理後，故事才會變成智慧。"),
    34: ("強大動能", "你有很強的生命動能，適合投入有回應的事，避免為了忙而忙。"),
    35: ("經驗變化", "你渴望新經驗，重點是讓每次變化都帶來成熟，而不是只追求刺激。"),
    36: ("情緒經驗", "你在未知與情緒波動中學習，越能放慢，越能穿越混亂。"),
    37: ("家庭與承諾", "你重視互惠、情感安全與承諾，關係中的公平會影響你的穩定感。"),
    38: ("奮戰", "你會為有意義的事情奮戰，先確認值得，力量才不會浪費。"),
    39: ("挑動", "你可能觸動他人的情緒或創意，目的不是挑釁，而是喚醒真正感受。"),
    40: ("獨立與休息", "你需要在承諾與獨處間取得平衡，休息會讓意志力回來。"),
    41: ("想像起點", "你是情緒經驗的起點，想像力會推動你走向新的故事。"),
    42: ("完成循環", "你適合把開始的事情走到完成，完成後才知道經驗真正帶來什麼。"),
    43: ("突破洞見", "你有突如其來的洞見，但需要等待對的時機與語言讓人聽懂。"),
    44: ("模式辨識", "你能感覺過去模式是否會重演，適合辨認人與合作的可靠度。"),
    45: ("資源管理", "你適合管理資源與分配價值，真正的安全感來自互惠而不是佔有。"),
    46: ("身體之愛", "你的成長透過身體與經驗發生，適合相信自己正在對的位置學習。"),
    47: ("理解壓力", "你會把混亂片段整理成理解，別急著在壓力中立刻得出結論。"),
    48: ("深度", "你有追求深度與專業的潛力，也要避免因覺得自己不夠好而停住。"),
    49: ("原則", "你對關係中的原則很敏感，當價值不合時會需要重新定義界線。"),
    50: ("價值守護", "你關心責任、照顧與倫理，適合建立讓人安心的規範。"),
    51: ("震撼啟動", "你可能透過突發事件被喚醒，真正的勇氣是回到心的方向。"),
    52: ("靜止", "你需要停下來集中能量；靜止不是沒進展，而是在累積定力。"),
    53: ("開始", "你有開啟新循環的壓力，開始前先確認是否有資源走完。"),
    54: ("野心", "你有向上提升的動力，適合把野心放進清楚合作與長期策略。"),
    55: ("豐盛情緒", "你的精神狀態影響豐盛感，情緒自由比外在擁有更重要。"),
    56: ("故事旅行", "你適合用故事、經驗與敘事啟發他人，分享前先消化自己的感受。"),
    57: ("直覺清明", "你有當下的生存直覺，越安靜越能聽見真正的身體訊號。"),
    58: ("生命喜悅", "你會想改善生活並追求活力，批判背後其實是想讓事情更好。"),
    59: ("親密破冰", "你能打開親密與合作的入口，也需要尊重自己與對方的界線。"),
    60: ("限制", "你會感覺到限制，但限制也能逼出新的形式與突破。"),
    61: ("內在真理", "你會追問不可見的真理，答案需要時間在內在慢慢成形。"),
    62: ("細節表達", "你能把細節說清楚，適合用精準語言讓抽象想法落地。"),
    63: ("懷疑", "你的懷疑能幫助檢查邏輯，重點是把懷疑變成驗證，而不是焦慮。"),
    64: ("未解之謎", "你腦中常有大量片段與疑問，需要時間讓靈感自己拼成意義。"),
}


def _hd_label(value: object, mapping: dict[str, str]) -> str:
    text = str(value or "")
    return mapping.get(text, text)


def _hd_center_label(value: object) -> str:
    text = str(value or "")
    return HD_CENTER_LABELS.get(text, text)


def explain_humandesign(data: dict, detail: DetailLevel = "teaser") -> str:
    defined = data.get("definedCenters") or []
    channels = data.get("definedChannels") or []
    gates = data.get("activatedGates") or []
    type_raw = data.get("type")
    authority_raw = data.get("authority")
    strategy_raw = data.get("strategy")
    type_label = _hd_label(type_raw, HD_TYPE_LABELS)
    authority_label = _hd_label(authority_raw, HD_AUTHORITY_LABELS)
    strategy_label = _hd_label(strategy_raw, HD_STRATEGY_LABELS)

    parts = [
        _line(f"你的類型是 <strong>{_text(type_label)}</strong>，策略是 <strong>{_text(strategy_label)}</strong>。"),
        _line(HD_TYPE_GUIDE.get(str(type_raw), "類型說明你和世界交換能量的方式，重點是把它落實到日常決策，而不是只記名稱。")),
        _line(f"內在權威：<strong>{_text(authority_label)}</strong>。{HD_AUTHORITY_GUIDE.get(str(authority_raw), '這是做重要決定時最需要信任的身體訊號。')}"),
        _line(f"人生角色 Profile：<strong>{_text(data.get('profile'))}</strong>，描述你學習、互動與被他人看見的方式。"),
    ]
    if defined:
        center_names = [_hd_center_label(center) for center in defined]
        parts.append(_line(f"已定義中心：<strong>{_join(center_names)}</strong>，代表較穩定、可持續輸出的能量。"))
    if channels:
        parts.append(_line(f"已定義通道：<strong>{_join(channels)}</strong>，可視為你較固定的天賦迴路。"))
    if gates:
        parts.append(_section("啟動閘門重點"))
        for raw_gate in gates[:8]:
            gate = _safe_int(raw_gate.get("gate") if isinstance(raw_gate, dict) else raw_gate)
            title, copy = GATE_MEANINGS.get(gate, ("能量主題", "這個閘門描述一種被啟動的能量，需放回你的類型、策略與權威下理解。"))
            parts.append(_line(f"<strong>第 {gate} 閘門｜{_text(title)}</strong>：{_text(copy)}"))

    if detail == "full":
        parts.extend([
            _section("深度解讀方向"),
            _line("人類圖最重要的是把策略與權威落實到生活決策，而不是只記住類型名稱。"),
            _line("下一層可針對未定義中心說明容易受環境放大的主題，協助使用者分辨什麼是自己、什麼是場域影響。"),
            _line("閘門不是單獨下結論用的，它需要和所在中心、通道、行星位置與人格/設計層一起閱讀。"),
        ])
    return _wrap(parts, detail)


def explain_tarot(data: dict, detail: DetailLevel = "teaser") -> str:
    cards = data.get("cards") or []
    parts = [_section("牌陣重點")]
    reversed_count = sum(1 for draw in cards if draw.get("position") == "reversed")
    parts.append(_line(f"本次抽出 {len(cards)} 張牌，其中 {reversed_count} 張逆位。請同時看牌名、位置與正逆位，不要只看單張牌。"))

    for index, draw in enumerate(cards, start=1):
        card = draw.get("card") or {}
        position = "逆位" if draw.get("position") == "reversed" else "正位"
        name = card.get("name_zh") or card.get("name_en") or f"第 {index} 張牌"
        meaning = draw.get("meaning")
        if not meaning:
            meaning_source = card.get("reversed") if position == "逆位" else card.get("upright")
            meaning = (meaning_source or {}).get("text")
        parts.append(_line(f"<strong>{index}. {_text(name)} / {position}</strong>：{_text(meaning, '這張牌指出當下需要被看見的主題。')}"))

    if detail == "full":
        parts.extend([
            _section("深度解牌方向"),
            _line("三張牌建議讀成一段時間線：過去如何形成現在，現在如何推動未來。"),
            _line("若是關係或職涯問題，建議補問：我能控制的是什麼？我需要放下的是什麼？下一步最小行動是什麼？"),
        ])
    return _wrap(parts, detail)


def explain_runes(data: dict, detail: DetailLevel = "teaser") -> str:
    runes = data.get("runes") or []
    material = (data.get("meta") or {}).get("material")
    parts = [
        _section("盧恩訊息"),
        _line(f"你本次抽出 {len(runes)} 顆符文{f'，材質為 {_text(material)}' if material else ''}。盧恩適合讀成提醒、阻力與下一步。"),
    ]

    for index, draw in enumerate(runes, start=1):
        rune = draw.get("rune") or {}
        position = "逆位" if draw.get("position") == "reversed" else "正位"
        name = rune.get("zh") or rune.get("name") or f"第 {index} 顆符文"
        meaning = draw.get("meaning")
        if not meaning:
            meaning_source = rune.get("reversed") if position == "逆位" else rune.get("upright")
            meaning = (meaning_source or {}).get("text")
        parts.append(_line(f"<strong>{_text(rune.get('glyph'))} {_text(name)} / {position}</strong>：{_text(meaning, '這顆符文提醒你留意當下事件背後的能量。')}"))

    if detail == "full":
        parts.extend([
            _section("深度解讀方向"),
            _line("若抽到逆位，不必視為壞事，它通常指出能量被卡住、延遲或需要重新校準。"),
            _line("建議把符文訊息轉成一個具體行動：今天要避免什麼、練習什麼、完成什麼。"),
        ])
    return _wrap(parts, detail)
