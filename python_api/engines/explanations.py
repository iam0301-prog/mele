"""Readable result explanations for teaser/free and full/teacher modes."""

from __future__ import annotations

from collections.abc import Iterable
from html import escape
from typing import Literal

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
        return f"<div class='explanation'>{inner}</div>"
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
    "龍": (
        "你很容易成為把事情重新養起來的人，適合從建立基礎、照顧資源、讓一件事恢復生命力開始。",
        "要留意自己是不是又把所有人的需要都放在前面，忘了先問：我自己的根基穩不穩。",
    ),
    "風": (
        "你需要把感受說清楚，越願意把話講明白，關係與選擇就越容易流動。",
        "卡住時不是因為你不會說，而是你可能說了很多外圍，真正重要的需求還沒有出口。",
    ),
    "夜": (
        "你的內在世界很豐富，直覺、夢境與想像力常會比理性更早感覺到答案。",
        "要留意自己是不是把不安藏回心裡，讓別人看不見你真正需要什麼。",
    ),
    "種子": (
        "你適合專注培養一件事，只要環境對了，成長會很紮實。",
        "卡住時容易一直等更好的時機，結果真正想發芽的事停太久。",
    ),
    "蛇": (
        "你的身體感很強，喜歡、不喜歡、靠近或遠離，身體常比頭腦更早知道。",
        "要留意自己是不是壓住本能，直到最後用過度反應保護自己。",
    ),
    "世界橋": (
        "你有讓舊階段結束、轉換關係位置、重新連接的能力。",
        "卡住時常是捨不得放下不適合的角色，停在中間地帶。",
    ),
    "手": (
        "你適合親手處理問題，把理解落到修補、整理與完成。",
        "要留意自己是不是一直替別人完成本該由對方完成的事。",
    ),
    "星星": (
        "你對美感、和諧與秩序敏感，能把混亂整理成讓人舒服的形式。",
        "卡住時可能為了維持好看或和平，忽略真正不舒服的地方。",
    ),
    "月": (
        "你很會感覺情緒流動，能透過感受辨認什麼需要被清理或更新。",
        "要留意一時情緒浪潮，不要把它直接當成全部真相。",
    ),
    "狗": (
        "你的核心在信任、忠誠與心的連結，關係品質會深深影響你的狀態。",
        "卡住時容易因為在乎而過度忍耐，或把忠誠變成不能離開。",
    ),
    "猴": (
        "你有幽默、創意與打破僵局的能力，越放鬆越能找到新解法。",
        "要留意自己是不是用玩笑或轉移注意力避開真正脆弱的問題。",
    ),
    "人": (
        "你的課題在選擇與自由意志，你需要感覺這個決定真的屬於自己。",
        "卡住時容易聽太多意見，最後失去自己的判斷。",
    ),
    "天行者": (
        "你需要空間、經驗與探索，走出去會讓你更認識自己。",
        "要分辨自己想離開，是因為要拓展，還是因為不想面對眼前問題。",
    ),
    "巫師": (
        "你有很強的臨在感，不急著控制時，反而更能感覺到時機。",
        "卡住時可能停在等待，少了把感覺落地的下一步。",
    ),
    "鷹": (
        "你能看見大局與未來藍圖，適合把複雜狀況拉高一層重新設計。",
        "要留意自己是不是看得太遠，反而忽略眼前最需要處理的一步。",
    ),
    "戰士": (
        "你適合透過提問找到真相，越能誠實面對問題，越能長出勇氣。",
        "卡住時容易用質疑保護自己，一直追問到不敢行動。",
    ),
    "地球": (
        "你適合聽環境訊號與生活節奏，答案常透過身邊事件同步出現。",
        "要留意自己是不是太想找外在徵兆，反而忽略已經知道的感受。",
    ),
    "鏡": ("你容易看見真相與界線，能把事情照得很清楚。", "卡住時容易太快切割或太銳利，讓清楚變成防衛。"),
    "風暴": (
        "你有更新與重啟的力量，混亂有時是在逼你離開不適合的舊模式。",
        "要留意自己是不是在變動中急著抓回控制，反而更累。",
    ),
    "太陽": (
        "你有照亮事情、帶來清楚與溫暖的能力，適合把模糊處說明白。",
        "卡住時可能一直扮演明亮的人，卻沒有讓自己的需要被看見。",
    ),
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

    # 新增欄位
    personal_year = data.get("personalYear")
    personal_year_display = data.get("personalYearDisplay") or str(personal_year or "")
    personal_year_meaning = data.get("personalYearMeaning") or ""
    personal_year_cal = data.get("personalYearCalendarYear") or ""
    pinnacles = data.get("pinnacles") or []
    challenges = data.get("challenges") or []
    combo_note = data.get("comboNote") or ""

    # ── 生命靈數核心 ──
    parts = [
        _line(
            f"你的生命靈數是 <strong>{_text(lp_display)}</strong>"
            f"{'（保留大師數，也看底色數）' if is_master else ''}，核心原型是 <strong>{_text(arche.get('name'))}</strong>。"
        ),
        _line(NUMEROLOGY_GUIDE.get(lp, _text(arche.get("desc"), "此數字代表你一生反覆練習的核心節奏。"))),
    ]

    if is_master and lp_reduced:
        parts.append(
            _line(
                f"其他平台把你算成 <strong>{_text(lp_reduced)}</strong> 不是誰錯誰對——"
                f"那是把大師數繼續化簡的做法。本平台保留 <strong>{_text(lp_display)}</strong>，兩種視角都可參考。"
            )
        )

    # ── 生日數 ──
    if bd and bd != lp:
        parts.append(
            _line(
                f"生日數 <strong>{_text(bd_display)}</strong>（{_text(bd_arche.get('name'), '個人特質')}）："
                f"{_text(bd_arche.get('desc'), '這是你日常最容易被感受到的能力與反應方式。')}"
            )
        )

    # ── 組合洞察 ──
    if combo_note:
        parts.append(_section("主數與生日數的互動"))
        parts.append(_line(_text(combo_note)))

    # ── 流年數 ──
    if personal_year and personal_year_meaning:
        # S5：personal_year_cal 是整數，直接嵌入不需 _text（避免雙 escape）
        parts.append(_section(f"{personal_year_cal} 個人流年"))
        parts.append(
            _line(f"<strong>{_text(personal_year_display)}</strong>：{_text(personal_year_meaning)}")
        )

    # ── 四個巔峰數 ──
    if pinnacles:
        parts.append(_section("人生四大巔峰（Pinnacles）"))
        parts.append(
            _line(
                "巔峰數描述人生各階段的外部主題，是命運給你的「場域」，不是個人意志。"
                "第一巔峰結束年齡 = 36 − 生命靈數底色。"
            )
        )
        for p in pinnacles:
            age_label = _text(p.get("ageLabel"))
            pnum = _text(p.get("display"))
            parch = _text(p.get("archetype"))
            meaning = _text(p.get("meaning"))
            parts.append(
                _line(
                    f"第 {p.get('index')} 巔峰 <strong>{pnum}</strong>（{age_label}）"
                    f"{'｜' + parch if parch else ''}：{meaning}"
                )
            )

    # ── 四個挑戰數 ──
    if challenges:
        parts.append(_section("人生四大挑戰（Challenges）"))
        parts.append(_line("挑戰數是巔峰期的內在功課：不是命運打擊，而是這段時期最需要整合的反面能力。"))
        for c in challenges:
            age_label = _text(c.get("ageLabel"))
            cnum = c.get("number")
            meaning = _text(c.get("meaning"))
            parts.append(_line(f"第 {c.get('index')} 挑戰 <strong>{cnum}</strong>（{age_label}）：{meaning}"))

    if detail == "full":
        parts.extend(
            [
                _section("進階解讀方向"),
                _line(
                    "回想最近一次重大選擇：你是急著掌控、過度配合、逃避表達，還是先退回分析？這比單看數字更能看出生命靈數的陰影面。"
                ),
                _line(
                    "把生命靈數用在職涯、親密關係與財務模式各問一個問題：「這個數字讓我在這裡過度發揮，還是根本沒有用到？」"
                ),
                _line(
                    "流年數每年轉換，搭配生命靈數判斷今年適合「主動推進」（流年 1/3/5/8）還是「整理收斂」（流年 2/4/7/9）。"
                ),
                _line(
                    "巔峰數是外部場域的主題（命運給的環境），挑戰數是內在功課（自己要整合的反面能力），兩者需要一起讀才完整。"
                ),
            ]
        )

    parts.append(
        _line("<small>本解讀以畢氏靈數象徵作為自我觀察的參考框架，不構成對未來的預測或保證。</small>")
    )

    return _wrap(parts, detail)


def explain_maya(data: dict, detail: DetailLevel = "teaser") -> str:
    seal = data.get("seal") or {}
    tone = data.get("tone") or {}
    oracle = data.get("oracle") or {}
    seal_name = seal.get("zh") or seal.get("name") or seal.get("label")
    tone_name = tone.get("zh") or tone.get("name") or tone.get("label")
    gift, shadow = _maya_member_reading(seal_name)

    parts = [
        _line(
            f"你是 <strong>Kin {_text(data.get('kin'))}</strong>，能量名稱為 <strong>{_text(tone_name)}{_text(seal_name)}</strong>。"
        ),
        _line(
            f"白話先看你本人：<strong>{_text(seal_name)}</strong> 不是稱號，而是在說你的慣用節奏。{_text(gift)}"
        ),
        _line(f"如果這段有中，通常會中在卡點：{_text(shadow)}"),
        _line(
            f"銀河調性 <strong>{_text(tone_name)}</strong> 補充的是這股力量如何被啟動：{_tone_theme(tone_name)}"
        ),
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
            parts.append(
                _line(
                    f"<strong>{label}</strong>：{kin_text}{tone_text}{_text(item_seal)}。"
                    f"{role_copy}{_maya_member_reading(item_seal)[0]}"
                )
            )

    if detail == "full":
        starroot = data.get("starroot") or {}
        parts.extend(
            [
                _section("跨曆法對照"),
                _line(
                    f"Dreamspell / 13 Moon / 傳統卓爾金等對照可用來確認同一天在不同系統中的定位：{_text(starroot.get('dreamspell', {}).get('label'))}。"
                ),
                _line("若要作為正式諮詢，建議同時說明所採用的曆法系統，避免使用者把不同流派混為一談。"),
            ]
        )
    return _wrap(parts, detail)


WUXING_GUIDE = {
    "木": "木的能量像春天萌芽的樹，喜歡往上長、往外探。你天生帶著向前的衝勁，適合在有空間伸展的環境裡工作與生活——越有方向感，你就越有力氣。",
    "火": "火的能量像燃起的光，需要被看見、被點燃。你適合把熱情投入真正在意的事，但也記得給自己補充能量，別讓火燒得太猛而忘了照顧自己。",
    "土": "土的能量像大地，穩穩承接一切。你擅長讓身邊的人有安全感，但也要留意自己是否把太多人的事情都攬在肩上——先讓自己站穩，才能真正撐住別人。",
    "金": "金的能量乾淨俐落，喜歡清楚的規則與界線。你適合用自己的標準與判斷力打造成果，偶爾也讓自己軟一點，不必凡事都那麼精準。",
    "水": "水的能量靈活又深邃，善於流動與感知。你需要彈性與思考的空間，不喜歡被硬框框住——給自己足夠的流動感，比較容易看見資源連結、找到前進的方向。",
}

DAY_MASTER_GUIDE = {
    "甲": "你的日主是甲木，重視原則，有長遠眼光與持續的意志力。適合以積累取代急衝，影響力隨時間自然長出來。",
    "乙": "你的日主是乙木，柔韌細膩，善於在各種限制裡找到屬於自己的出口，適應力強。",
    "丙": "你的日主是丙火，外放自然帶動氣氛，熱情是真實的。熱情連到清楚方向，走得更穩。",
    "丁": "你的日主是丁火，細膩溫暖，能照見別人不注意的細節，適合用自己的溫度默默影響他人。",
    "戊": "你的日主是戊土，穩重有承擔力，身邊的人容易在你這裡找到安全感。留意不要把所有人的重量都扛上身。",
    "己": "你的日主是己土，包容務實，能孕育成果，適合慢慢養出結果。需辨清哪些責任屬於自己。",
    "庚": "你的日主是庚金，直接、果斷，擅長切開混亂、找到重點。",
    "辛": "你的日主是辛金，審美敏銳、講究質感，有獨特眼光，重視核心價值的保護。",
    "壬": "你的日主是壬水，視野廣、流動力強，能快速吸收複雜資訊，適應各種環境。",
    "癸": "你的日主是癸水，細膩滲透，感受深刻，直覺常在安靜中浮現，重要決定宜合參現實情況再定。",
}

PILLAR_ROLES = {
    "year": ("年柱", "大環境、家族底色與外在氣質"),
    "month": ("月柱", "工作與社會角色的主要展現面，出生月令的能量底氣"),
    "day": ("日柱", "日主本身，最貼近內心與親密關係的部分"),
    "time": ("時柱", "內心渴望、長遠方向與晚年積累"),
}
# 八字進階概念：月令、十神、格局——幫助理解四柱之間的互動關係與整體格局強弱


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
        lines.append(f"盤中無 <strong>{_join(missing)}</strong>：對應十神在天干地支皆缺，需靠大運流年補足。")
    else:
        lines.append("五行齊全，重點看強弱偏差。")

    if strong:
        lines.append(f"<strong>{_join(strong)}</strong> 能量最旺（{max_count} 個），對應十神取用最易發揮。")
    if soft and not missing:
        lines.append(
            f"<strong>{_join(soft)}</strong> 相對偏弱（{min_count} 個），對應十神取用需靠大運或外環境補充。"
        )
    if day_wuxing:
        if day_count >= 2:
            lines.append(
                f"日主 <strong>{_text(day_wuxing)}</strong> 同類能量有 {day_count} 個（比劫較旺），根基較穩。"
            )
        else:
            lines.append(
                f"日主 <strong>{_text(day_wuxing)}</strong> 同類能量僅 {day_count} 個（比劫薄弱），宜印星或比劫大運扶持。"
            )
    return lines


def _bazi_shishen_label(ss: str) -> str:
    """十神名稱標準化（處理 lunar-python 回傳的簡體）"""
    mapping = {
        "比肩": "比肩",
        "劫财": "劫財",
        "食神": "食神",
        "伤官": "傷官",
        "偏财": "偏財",
        "正财": "正財",
        "七杀": "七殺",
        "正官": "正官",
        "偏印": "偏印",
        "正印": "正印",
        # 已是繁體直接過
        "劫財": "劫財",
        "傷官": "傷官",
        "偏財": "偏財",
        "正財": "正財",
        "七殺": "七殺",
    }
    return mapping.get(ss, ss)


SHISHEN_CHAR_DESC = {
    "比肩": "助身（獨立、平輩競合）",
    "劫財": "助身（積極、財帛起伏）",
    "食神": "洩秀（才藝、享受、創作）",
    "傷官": "洩秀（才華外露、官緣需留意）",
    "偏財": "我克（財活靈活、善開拓）",
    "正財": "我克（踏實、重穩定收入）",
    "七殺": "克我（魄力、壓力、競爭）",
    "正官": "克我（規範、責任、名譽）",
    "偏印": "生我（思維獨特、靈感直覺）",
    "正印": "生我（學習力、庇蔭緣）",
}

CHANG_SHENG_MEANING = {
    # 繁體
    "長生": "蓬勃初生，能量漸入佳境",
    "沐浴": "敏感活潑，需要在多樣化中找定位",
    "冠帶": "精力充沛，積極表現欲強",
    "臨官": "能力到位，事業運勢加強",
    "帝旺": "強盛旺極，但旺極易衰需留意過猛",
    "衰": "開始轉淡，適合收斂整頓",
    "病": "能量較弱，需謹慎保守",
    "死": "此處能量靜止，重在轉化而非衝刺",
    "墓": "收藏沉積，有時藏而後發",
    "絕": "斷而再生，適合澈底更新",
    "胎": "潛伏醞釀，蓄勢待發",
    "養": "滋養成長，根基穩固後再動",
    # 簡體（lunar-python 部分版本回傳格式）
    "长生": "蓬勃初生，能量漸入佳境",
    "冠带": "精力充沛，積極表現欲強",
    "临官": "能力到位，事業運勢加強",
    "养": "滋養成長，根基穩固後再動",
    "绝": "斷而再生，適合澈底更新",
}


def explain_bazi(data: dict, detail: DetailLevel = "teaser") -> str:
    pillars = data.get("pillars") or {}
    counts = (data.get("wuxing") or {}).get("counts") or {}
    day_master = data.get("dayMaster")
    day_wuxing = data.get("dayMasterWuxing")
    day_yinyang = data.get("dayMasterYinYang")
    hidden_stems = data.get("hiddenStems") or {}
    shishen_gan = data.get("shishen") or {}
    chang_sheng = data.get("changSheng") or {}
    da_yun = data.get("daYun") or {}
    shensha = data.get("shensha") or []
    strength = data.get("strength") or {}
    pattern = data.get("pattern") or {}

    # ── 日主核心 ──
    parts = [
        _line(
            f"你的日主是 <strong>{_text(day_yinyang)}{_text(day_wuxing)}（{_text(day_master)}）</strong>，"
            f"整張盤以日主為核心展開解讀。"
        ),
        _line(
            DAY_MASTER_GUIDE.get(
                day_master,
                WUXING_GUIDE.get(day_wuxing, "日主描述你最自然的能量運作方式，是解讀整張命盤的起點。"),
            )
        ),
    ]

    # ── 日主強弱 ──
    strength_val = _text(strength.get("strength"))
    strength_desc = _text(strength.get("desc"))
    if strength_val and strength_desc:
        parts.append(_section("日主強弱"))
        parts.append(_line(f"<strong>{strength_val}</strong>：{strength_desc}"))

    # ── 格局 ──
    pat_name = _text(pattern.get("name"))
    pat_meaning = _text(pattern.get("meaning"))
    yong_hint = _text(pattern.get("yongShenHint"))
    if pat_name:
        parts.append(_section("格局與用神傾向"))
        parts.append(_line(f"命盤以 <strong>{pat_name}</strong> 為主格。{pat_meaning}"))
        if yong_hint:
            parts.append(_line(f"用神方向：{yong_hint}"))

    # ── 四柱 + 天干十神 ──
    parts.append(_section("四柱天干十神"))
    for key in ("year", "month", "day", "time"):
        label, role = PILLAR_ROLES[key]
        pillar = pillars.get(key) or []
        if not pillar:
            continue
        gan, zhi = pillar[0], pillar[1]
        ss = _bazi_shishen_label(_text(shishen_gan.get(key, ""))) if key != "day" else "日主"
        cs = _text(chang_sheng.get(key, ""))
        cs_meaning = CHANG_SHENG_MEANING.get(cs, "")
        # 繁化十二長生名稱（lunar-python 回傳簡體，統一轉繁體）
        CS_TRAD = {
            "长生": "長生",
            "沐浴": "沐浴",
            "冠带": "冠帶",
            "临官": "臨官",
            "帝旺": "帝旺",
            "衰": "衰",
            "病": "病",
            "死": "死",
            "墓": "墓",
            "绝": "絕",
            "胎": "胎",
            "养": "養",
        }
        cs_display = CS_TRAD.get(cs, cs)
        ss_char = f"【{ss}】" if ss else ""
        cs_char = (
            f"長生：{cs_display}（{cs_meaning}）"
            if cs and cs_meaning
            else (f"長生：{cs_display}" if cs_display else "")
        )
        parts.append(
            _line(
                f"<strong>{label} {gan}{zhi}</strong> {ss_char}"
                f"{'　' if cs_char else ''}{cs_char}"
                f"　→ {role}。"
            )
        )

    # ── 地支藏干十神 ──
    parts.append(_section("地支藏干與藏干十神"))
    parts.append(
        _line(
            "地支內藏多個天干（稱藏干），藏干對應的十神是解盤的關鍵——"
            "尤其月支藏干反映「月令」的力量，決定日主是否得令。"
        )
    )
    for key in ("year", "month", "day", "time"):
        label = PILLAR_ROLES[key][0]
        pillar = pillars.get(key) or []
        zhi = pillar[1] if len(pillar) > 1 else ""
        stems = hidden_stems.get(key) or []
        if not stems:
            continue
        stem_parts = []
        for s in stems:
            g = _text(s.get("gan"))
            ss = _bazi_shishen_label(_text(s.get("shishen")))
            role_tag = _text(s.get("role"))
            if g and ss:
                stem_parts.append(f"{g}（{ss}·{role_tag}）")
        if stem_parts:
            parts.append(_line(f"<strong>{label}支 {zhi}</strong>：{' / '.join(stem_parts)}"))

    # ── 五行分布 ──
    if counts:
        parts.append(_section("五行分布"))
        count_display = _join([f"{name} {count}" for name, count in counts.items()])
        parts.append(_line(f"木火土金水：{count_display}（天干＋地支各計1）"))
        for line in _wuxing_balance_lines(counts, day_wuxing):
            parts.append(_line(line))

    # ── 神煞 ──
    if shensha:
        parts.append(_section("神煞"))
        for ss_item in shensha:
            name = _text(ss_item.get("name"))
            desc = _text(ss_item.get("desc"))
            zhi_hit = ss_item.get("zhi") or []
            zhi_str = "、".join(zhi_hit) if zhi_hit else ""
            if name and desc:
                parts.append(
                    _line(
                        f"<strong>{name}</strong>{'（命中地支：' + zhi_str + '）' if zhi_str else ''}：{desc}"
                    )
                )

    if detail == "full":
        # ── 大運 ──
        steps = da_yun.get("steps") or []
        if steps:
            start_age = da_yun.get("startAge")
            start_month_yun = da_yun.get("startMonth", "")
            direction = "順行" if da_yun.get("isForward") else "逆行"
            parts.append(_section("大運走勢"))
            age_str = str(start_age) if start_age is not None else "?"
            parts.append(
                _line(
                    f"起運：{age_str}歲{start_month_yun}個月，{direction}。"
                    f"大運每10年換一步，天干影響上半段，地支影響下半段。"
                )
            )
            for step in steps[:6]:
                gz = _text(step.get("ganZhi"))
                ss_gan = _bazi_shishen_label(_text(step.get("shishenGan")))
                s_age = step.get("startAge", "")
                e_age = step.get("endAge", "")
                s_year = step.get("startYear", "")
                if gz:
                    ss_str = f"（{ss_gan}）" if ss_gan else ""
                    parts.append(_line(f"<strong>{gz}</strong>{ss_str}　{s_age}—{e_age}歲　西元{s_year}年起"))

        parts.extend(
            [
                _section("解讀提醒"),
                _line(
                    "格局與用神需合參月令、三合、六合、刑衝破害才能確定。"
                    "大運流年的力量遠大於靜盤，同一張命盤在不同大運下表現差異很大。"
                ),
                _line("八字呈現的是傾向與課題，不是宿命。帶著真實問題去諮詢，比泛泛解盤更有價值。"),
            ]
        )

    parts.append(
        _line(
            "<small>本解讀以傳統命理象徵作為自我觀察的參考框架，不是醫療或心理診斷，也不構成對未來事件的預測或保證。</small>"
        )
    )
    return _wrap(parts, detail)


def _star_name(star: object) -> str:
    if isinstance(star, dict):
        return _text(star.get("name") or star.get("nameZh") or star.get("label"))
    return _text(star)


# 十二宮對應的人生領域
_PALACE_DOMAINS: dict[str, str] = {
    "命宮": "個性主軸、面對世界的方式",
    "兄弟": "手足資源、平輩往來",
    "夫妻": "感情模式、伴侶特質",
    "子女": "子女緣、創造力與桃花",
    "財帛": "財富來源、金錢流動",
    "疾厄": "身心健康、壓力模式",
    "遷移": "外出運、異地發展",
    "僕役": "人際資源、朋友部屬",
    "交友": "人際資源、朋友部屬",
    "官祿": "事業方向、職涯定位",
    "田宅": "家庭環境、不動產運",
    "福德": "精神生活、享受福氣",
    "父母": "父母緣、上位者互動",
}

# 生年四化含義（祿權科忌）
_MUTAGEN_MEANINGS: dict[str, str] = {
    "祿": "資源活水，財氣與人緣在此宮順暢流動",
    "權": "主導力強，掌控欲與野心在此宮明顯",
    "科": "名聲貴人，文書考試與社會評價在此宮得利",
    "忌": "執著課題，暗耗與阻礙的核心壓力在此宮",
}

# 主星廟旺利陷簡述（星曜強弱指標）
_BRIGHTNESS_DESC: dict[str, str] = {
    "廟": "廟",
    "旺": "旺",
    "得": "得地",
    "利": "利",
    "平": "平",
    "不": "不利",
    "陷": "落陷",
}

# 十四正曜一句話簡述（用於十二宮一覽）
_STAR_BRIEF: dict[str, str] = {
    "紫微": "主導格局，尊貴不從眾",
    "天機": "謀略靈動，善分析規畫",
    "太陽": "主動外放，帶動名氣人際",
    "武曲": "果斷行動，主財務決策",
    "天同": "平和享受，重生活品質",
    "廉貞": "行政決斷，主交際競爭",
    "天府": "穩健斂財，資源保守累積",
    "太陰": "細膩感性，財與家庭關係深",
    "貪狼": "多才多欲，桃花興趣廣博",
    "巨門": "深思好辯，口才溝通見長",
    "天相": "協調輔佐，重制度人際",
    "天梁": "清高蔭庇，善化解危機",
    "七殺": "衝勁強悍，開創行動力旺",
    "破軍": "求變破舊，耗散中創新",
}


def _star_display(star: object) -> str:
    """格式化主星名稱 + 廟旺陷標示（可選四化）"""
    if isinstance(star, dict):
        name = _text(star.get("name") or star.get("nameZh") or star.get("label"))
        brightness = _text(star.get("brightness", ""))
        mutagen = _text(star.get("mutagen", ""))
        parts: list[str] = [name]
        if brightness:
            parts.append(f"[{_BRIGHTNESS_DESC.get(brightness, brightness)}]")
        if mutagen:
            parts.append(f"（化{mutagen}）")
        return "".join(parts)
    return _text(star)


def explain_ziwei(data: dict, detail: DetailLevel = "teaser") -> str:
    ming = data.get("mingGong") or {}
    palaces = data.get("palaces") or []
    soul = data.get("soul")
    body = data.get("body")
    five = data.get("fiveElementsClass")

    # 命宮資訊
    ming_name = ming.get("name") or ming.get("earthlyBranch") or ""
    ming_stars: list = ming.get("majorStarNames") or ming.get("majorStars") or []
    ming_branch = ""
    if isinstance(palaces, list):
        for palace in palaces:
            if palace.get("name") == "命宮":
                if not ming_stars:
                    ming_stars = palace.get("majorStarNames") or palace.get("majorStars") or []
                ming_branch = _text(palace.get("earthlyBranch"))
                ming_name = ming_name or ming_branch or "命宮"
                break

    # 提取四化（優先從 API 回傳的 fourChanges，退而從 palaces.majorStars.mutagen 萃取）
    four_changes: list[dict] = data.get("fourChanges") or []  # type: ignore[assignment]
    if not four_changes and isinstance(palaces, list):
        for palace in palaces:
            for star in palace.get("majorStars") or []:
                if isinstance(star, dict) and star.get("mutagen"):
                    four_changes.append(
                        {
                            "mutagen": star["mutagen"],
                            "star": star.get("name", ""),
                            "palace": palace.get("name", ""),
                        }
                    )
            for star in palace.get("minorStars") or []:
                if isinstance(star, dict) and star.get("mutagen"):
                    four_changes.append(
                        {
                            "mutagen": star["mutagen"],
                            "star": star.get("name", ""),
                            "palace": palace.get("name", ""),
                        }
                    )

    # ── 命盤基本資訊 ──
    parts = [
        _line(
            f"命盤結構：<strong>{_text(five, '五行局')}</strong>，命主 <strong>{_text(soul)}</strong>、身主 <strong>{_text(body)}</strong>。"
        ),
        _line(
            f"命宮（{_text(ming_branch or ming_name, '命宮')}）主星："
            f"<strong>{_join(_star_name(s) for s in ming_stars) or '空宮（看對宮與三方）'}</strong>。"
            "命宮是整張盤的主軸，先確認這裡的星曜特質，再延伸讀其他宮位。"
        ),
    ]

    # ── 生年四化（核心）──
    if four_changes:
        parts.append(_section("生年四化"))
        # 依祿→權→科→忌排序
        _order = {"祿": 0, "權": 1, "科": 2, "忌": 3}
        sorted_fc = sorted(four_changes, key=lambda x: _order.get(x.get("mutagen", ""), 9))
        for fc in sorted_fc:
            m = _text(fc.get("mutagen", ""))
            star = _text(fc.get("star", ""))
            palace = _text(fc.get("palace", ""))
            meaning = _MUTAGEN_MEANINGS.get(m, "")
            domain = _PALACE_DOMAINS.get(palace, "")
            parts.append(
                _line(
                    f"<strong>化{m}：{star}星，落{palace}</strong>"
                    f"{'（' + domain + '）' if domain else ''}。"
                    f"{meaning}。"
                )
            )
        parts.append(_line("四化是紫微判斷核心：落宮決定這股能量在哪個生活領域最活躍，是讀盤的第一入口。"))

    # ── 十二宮完整列表 ──
    if isinstance(palaces, list) and palaces:
        parts.append(_section("十二宮一覽"))
        for palace in palaces[:12]:
            p_name = _text(palace.get("name"))
            branch = _text(palace.get("earthlyBranch"))
            stem = _text(palace.get("heavenlyStem"))
            stars = palace.get("majorStars") or []
            star_display = _join(_star_display(s) for s in stars) or "空宮"
            domain = _PALACE_DOMAINS.get(p_name, "")
            # 四化標記
            fc_tags = [
                f"化{fc['mutagen']}"
                for fc in four_changes
                if fc.get("palace") == p_name and fc.get("mutagen")
            ]
            fc_str = "".join(f"<em>【{tag}】</em>" for tag in fc_tags)
            # 主星一句話
            star_names = [_star_name(s) for s in stars[:2] if _star_name(s)]
            star_briefs = [_STAR_BRIEF[n] for n in star_names if n in _STAR_BRIEF]
            note_str = (
                "　→　" + "；".join(star_briefs)
                if star_briefs
                else ("　→　空宮，留意對宮借星" if not stars else "")
            )
            parts.append(
                _line(
                    f"<strong>{p_name}</strong>（{stem}{branch}）{fc_str}"
                    f"　{star_display}{note_str}" + (f"　<small>{domain}</small>" if domain else "")
                )
            )

    # ── 閱讀引導 ──
    parts.append(
        _line(
            "先挑一個真的想問的題目，確認你對哪個宮位最有感覺，再往三方四正延伸閱讀，"
            "會比一次看完十二宮更容易找到答案。"
            "有想深入的方向，帶著問題諮詢老師最有效率。"
        )
    )

    if detail == "full":
        parts.append(
            _line(
                "正式解盤建議把命宮、身宮、財帛、官祿、夫妻、遷移六宮串成人生主敘事，"
                "再以四化落宮確認各領域的能量強弱，流年則看大限與流曜的疊合。"
            )
        )

    parts.append(
        _line(
            "<small>本解讀以紫微斗數星曜象徵作為自我觀察的參考框架，不構成對未來的預測或保證，"
            "不提供醫療、法律或財務建議。</small>"
        )
    )

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


def _astro_sign_zh(planet_or_point: object) -> str:
    """從行星/宮點 dict 中取出星座中文名稱。"""
    if not isinstance(planet_or_point, dict):
        return ""
    sign = planet_or_point.get("sign") or {}
    if isinstance(sign, dict):
        return sign.get("zh") or ""
    return ""


def _astro_deg_str(planet_or_point: object) -> str:
    """取度數，格式化到小數 1 位。"""
    if not isinstance(planet_or_point, dict):
        return ""
    sign = planet_or_point.get("sign") or {}
    if isinstance(sign, dict):
        deg = sign.get("degInSign")
        if deg is not None:
            try:
                return f"{float(deg):.1f}°"
            except (TypeError, ValueError):
                pass
    return ""


def _astro_house_str(planet_data: object) -> str:
    """取宮位號碼，格式化。"""
    if not isinstance(planet_data, dict):
        return ""
    house = planet_data.get("house")
    if house is not None:
        return f"第{house}宮"
    return ""


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


# ── 太陽星座詳細解讀 ──────────────────────────────────────────
_SUN_SIGNS: dict[str, dict[str, str]] = {
    "牡羊": {
        "teaser_friend": "你有開路的衝勁，先行動後想清楚是你的節奏。卡住時容易衝過頭才回頭找隊友。",
        "core": "核心動力是第一感、主導權與開創行動；等待讓你耗能。",
        "shadow": "過度防衛或急於主控時，容易在開始之前就把別人推開。",
        "relationship": "關係模式：需要對方給空間讓你主導，適合主動提出而非等待靠近。",
        "growth": "學習在行動後停下來整合，才不會開了頭卻收不了尾。",
    },
    "金牛": {
        "teaser_friend": "你需要穩定與實質感，慢慢累積是你真正的強項。卡住時容易明知不適合也不動。",
        "core": "核心動力是安全感、美感與踏實累積；急迫讓你失去判斷。",
        "shadow": "固執或拖延出現時，通常底層是安全感不足。",
        "relationship": "關係模式：忠誠但需要對方先穩定，才能真正放鬆靠近。",
        "growth": "學習辨別「這是真正的需要」還是「只是習慣的安全感」。",
    },
    "雙子": {
        "teaser_friend": "你需要理解與交流，說清楚能幫你理清自己。卡住時容易分心，真正的感受被跳過。",
        "core": "核心動力是資訊交流、多角度思考與連結不同想法；無聊讓你流失能量。",
        "shadow": "過度分析或避開情感深度時，有時是因為真正的感受太重。",
        "relationship": "關係模式：需要智識刺激與話語交流，沉默讓你焦慮。",
        "growth": "學習讓真正重要的感受有出口，而不是一直換話題。",
    },
    "巨蟹": {
        "teaser_friend": "你需要歸屬感與情感安全，照顧他人是你的直覺。卡住時容易把過去帶進現在。",
        "core": "核心動力是情感連結、家的概念與保護本能；沒有根基讓你沒力氣。",
        "shadow": "過度保護或情緒化時，通常是界線不清，不是脆弱。",
        "relationship": "關係模式：需要被接住，也需要確認對方不會消失。",
        "growth": "學習從過去汲取力量，而不是讓過去定義現在。",
    },
    "獅子": {
        "teaser_friend": "你需要被看見與創造，越真誠越有光。卡住時容易太在意表現，反而不敢自然發揮。",
        "core": "核心動力是自我表達、創造力與真心投入；被忽略讓你失去活力。",
        "shadow": "需要認可的執著出現時，底層通常是對自我價值的懷疑。",
        "relationship": "關係模式：需要被欣賞與尊重，也需要展現真實的自己。",
        "growth": "學習不透過成就定義自我價值，而是從真實表達中找到光。",
    },
    "處女": {
        "teaser_friend": "你需要把事情整理清楚，能透過細節與服務建立價值。卡住時容易過度挑剔自己，修到不敢開始。",
        "core": "核心動力是精確、分析與實際服務；混亂讓你消耗能量。",
        "shadow": "完美主義出現時，有時是不相信「夠好的自己值得被接受」。",
        "relationship": "關係模式：透過做事表達愛，需要對方注意到細節背後的心意。",
        "growth": "學習接受「夠好」，把完善的衝動用在真正值得投入的地方。",
    },
    "天秤": {
        "teaser_friend": "你需要平衡與關係品質，和諧對你是真實需要。卡住時容易為了不衝突先放掉自己的立場。",
        "core": "核心動力是公平、美感與真正的互相理解；失衡讓你無法安定。",
        "shadow": "優柔寡斷或討好時，通常是還不確定自己真正要什麼。",
        "relationship": "關係模式：需要對等的付出，一旦感覺不公平就容易退縮。",
        "growth": "學習在照顧關係平衡的同時，也清楚知道自己站在哪裡。",
    },
    "天蠍": {
        "teaser_friend": "你需要深度與真相，停在表面讓你覺得被騙了。卡住時容易太警戒或太想掌控。",
        "core": "核心動力是真實連結、深層探索與掌握事情本質；表面讓你不信任。",
        "shadow": "控制欲或猜疑出現時，底層通常是對再次受傷的保護。",
        "relationship": "關係模式：需要真正的承諾與透明，一旦信任建立，非常忠誠。",
        "growth": "學習在保持洞察力的同時，允許自己真正放鬆下來。",
    },
    "射手": {
        "teaser_friend": "你需要意義、遠方與視野擴展。卡住時容易只想離開，卻沒整理真正要追求什麼。",
        "core": "核心動力是探索、自由與尋求更大的意義框架；限制讓你窒息。",
        "shadow": "承諾恐懼或過度樂觀出現時，有時是迴避深入一件事的不確定感。",
        "relationship": "關係模式：需要對方尊重自由，也需要共同的精神方向。",
        "growth": "學習把探索落地，把視野轉成可以真正走完的路線。",
    },
    "摩羯": {
        "teaser_friend": "你需要長期目標與責任感，一步步建立是你真正的節奏。卡住時容易把自己逼太緊。",
        "core": "核心動力是務實、責任與長期成就；沒有結構讓你焦慮。",
        "shadow": "過度工作或情感克制出現時，通常是不確定「放鬆是安全的」。",
        "relationship": "關係模式：忠誠且可靠，但需要對方理解你用行動表達的愛。",
        "growth": "學習讓自己享受已經建立的成果，而不是永遠只往下一個目標跑。",
    },
    "水瓶": {
        "teaser_friend": "你需要獨立思考與突破常規。卡住時容易太抽離，知道很多卻不讓人靠近。",
        "core": "核心動力是創新、系統思考與推動改變；被框住讓你變得疏離。",
        "shadow": "情感距離或固執己見出現時，有時是不相信情緒本身有價值。",
        "relationship": "關係模式：需要對等的尊重與思想上的共鳴，而不只是情緒依賴。",
        "growth": "學習讓心智的清明與真實的情感需求並存。",
    },
    "雙魚": {
        "teaser_friend": "你需要想像力與感受力，允許心柔軟下來。卡住時容易界線模糊，把別人的情緒也攬成自己的。",
        "core": "核心動力是同理共感、靈性連結與超越現實的想像力；太硬的框架讓你失去流動感。",
        "shadow": "逃避或犧牲自我出現時，底層通常是不相信自己的需要也值得被照顧。",
        "relationship": "關係模式：溫柔且深情，但需要清楚的界線保護自己不被吸乾。",
        "growth": "學習辨別哪些感受是自己的，哪些是接收了別人的。",
    },
}
_SUN_FALLBACK: dict[str, str] = {
    "teaser_friend": "你的太陽星座代表你想活出的方向與核心意志，需要放回生活場景才會真正有感。",
    "core": "核心動力藏在你自然感到充實的那些時刻。",
    "shadow": "過度使用或壓抑這股力量時，容易失去彈性。",
    "relationship": "關係模式：把這股能量帶進關係，看它如何影響你的表達與需求。",
    "growth": "學習讓這股力量成熟，而不是只在舒適區使用它。",
}

# ── 月亮星座詳細解讀 ──────────────────────────────────────────
_MOON_SIGNS: dict[str, dict[str, str]] = {
    "牡羊": {
        "teaser": "你的情緒需要即時出口，壓住感受反而讓你更急躁。",
        "need": "深層需要：當下的回應感與行動後的安全感。",
        "shadow": "壓力下容易直接反應，事後才意識到話說重了。",
        "focus": "練習在感受出現的第一秒先深呼吸，再決定怎麼表達。",
    },
    "金牛": {
        "teaser": "你的安全感來自穩定與身體舒適，突然的變化讓你難以承受。",
        "need": "深層需要：可預期的環境、感官滿足與緩慢移動的節奏。",
        "shadow": "壓力下容易停滯、過度享用或拒絕承認需要改變。",
        "focus": "允許自己有緩和的過渡期，變化不必是一刀切。",
    },
    "雙子": {
        "teaser": "你的情感需要語言出口，把感受說清楚反而會讓你好過。",
        "need": "深層需要：表達空間、思想交流與多面向的情感理解。",
        "shadow": "壓力下容易理性化情緒，或用說話填滿真正的空洞感。",
        "focus": "試著找一個真正可以讓你說完的人，而不是只是閒聊。",
    },
    "巨蟹": {
        "teaser": "情緒是核心引擎，你的感受真實且深刻，不是需要被管理的東西。",
        "need": "深層需要：情感的被接住感、歸屬與清楚的家的概念。",
        "shadow": "壓力下容易退縮、過度照顧他人或用過去的痛解釋現在。",
        "focus": "允許自己也被照顧，不是只有照顧別人你才有價值。",
    },
    "獅子": {
        "teaser": "你的情緒需要被看見與表達，壓抑感受讓你失去光芒。",
        "need": "深層需要：真誠的欣賞、情感上的在場感與被重視。",
        "shadow": "壓力下容易戲劇化反應或因為沒人注意而沮喪。",
        "focus": "先對自己真誠，才能讓外在的認可變成加分而非必需。",
    },
    "處女": {
        "teaser": "你的情感需要被理解與具體化，說不清楚讓你焦慮。",
        "need": "深層需要：事情能被整理清楚、對方能看見細節背後的心意。",
        "shadow": "壓力下容易批評自己或把情緒轉成待辦清單迴避感受。",
        "focus": "允許感受就是感受，不必立刻找到原因或解決方案。",
    },
    "天秤": {
        "teaser": "你的情感需要和諧與互相，失衡讓你非常不安。",
        "need": "深層需要：關係中的對等、美感環境與避免直接衝突的空間。",
        "shadow": "壓力下容易壓住自己的感受，去配合對方期待。",
        "focus": "學習讓自己的需要也出現在協調的清單上。",
    },
    "天蠍": {
        "teaser": "你的情感強烈且深層，輕描淡寫讓你感覺被誤解。",
        "need": "深層需要：真正可信任的連結、清楚的承諾與情感的真實深度。",
        "shadow": "壓力下容易猜疑、不信任或把感受壓到爆發才出來。",
        "focus": "允許分批說出感受，不必等到確定對方完全安全才開口。",
    },
    "射手": {
        "teaser": "你的情緒需要空間與樂觀感，悲傷讓你想馬上找出口。",
        "need": "深層需要：自由感、可以往前看的方向與情感的輕盈。",
        "shadow": "壓力下容易用幽默或哲理跳過真正需要被處理的感受。",
        "focus": "允許悲傷或失落停留一下，它不會讓你永遠困住。",
    },
    "摩羯": {
        "teaser": "你習慣把情緒管理好，但有時管理得太緊讓你找不回感受。",
        "need": "深層需要：被尊重的穩定連結與不需要表演堅強的空間。",
        "shadow": "壓力下容易情感疏離或用工作迴避感受。",
        "focus": "讓情感需要也是一種真實需要，和目標一樣值得被認真對待。",
    },
    "水瓶": {
        "teaser": "你習慣理性化情緒，有時不確定自己真正感受到什麼。",
        "need": "深層需要：被理解而不是被批判、可以保持獨特性的親密。",
        "shadow": "壓力下容易抽離或從群體角度分析自己的情緒。",
        "focus": "允許情緒不合邏輯，它本來就不是要被解釋的東西。",
    },
    "雙魚": {
        "teaser": "你對情感極度敏感，很容易感受到別人的狀態，也很難分清楚。",
        "need": "深層需要：情感上的接住、不必解釋就被理解的空間。",
        "shadow": "壓力下容易吸收他人情緒，把別人的痛當成自己的責任。",
        "focus": "先讓自己的感受有出口，再去感受別人的。",
    },
}
_MOON_FALLBACK: dict[str, str] = {
    "teaser": "月亮代表你的情感本能與真正的安全感需求，需要放回親密關係場景才會有感。",
    "need": "深層需要：被接住的感覺，以及可以展現真實情緒的空間。",
    "shadow": "壓力下容易壓抑或過度反應，取決於這份能量如何被使用。",
    "focus": "先辨認什麼情境讓你最安心，再從那裡延伸去建立情感支持。",
}

# ── 上升星座詳細解讀 ──────────────────────────────────────────
_RISING_SIGNS: dict[str, dict[str, str]] = {
    "牡羊": {
        "teaser": "第一印象是直接、有能量、不繞彎。你先行動，別人再理解。",
        "external": "外顯氣質：果敢、直率、快節奏，讓人覺得有話直說。",
        "mask": "面具底下：其實你也需要被接住，但你不習慣先等。",
        "adjustment": "讓人看見你有停下來聽的能力，會讓關係更穩固。",
    },
    "金牛": {
        "teaser": "第一印象是穩定、有質感、不急。你讓人覺得可以依靠。",
        "external": "外顯氣質：可信賴、有品味、腳踏實地，讓人有安全感。",
        "mask": "面具底下：你對改變其實比外表展現的更敏感。",
        "adjustment": "偶爾讓人看見你也有彈性，不全是厚重穩定。",
    },
    "雙子": {
        "teaser": "第一印象是靈活、有趣、話多。你很快讓人覺得輕鬆。",
        "external": "外顯氣質：機智、好奇、善變，容易讓人覺得你總有話說。",
        "mask": "面具底下：有時候說很多，是因為不確定安靜是安全的。",
        "adjustment": "讓人看見你停下來真正聽的時候，會讓連結更深。",
    },
    "巨蟹": {
        "teaser": "第一印象是溫暖、有照顧感、讓人想靠近。你讓空間變得舒適。",
        "external": "外顯氣質：溫柔、細心、有包容力，讓人覺得被照顧。",
        "mask": "面具底下：你的敏感比外表更強，也更需要被接住。",
        "adjustment": "允許自己有時候不必是那個照顧別人的人。",
    },
    "獅子": {
        "teaser": "第一印象是有存在感、自信、讓人注意到。你自然帶領空間裡的能量。",
        "external": "外顯氣質：有光、有溫度、表現力強，讓人覺得鼓舞。",
        "mask": "面具底下：你對「有沒有被真正看見」比外表更在乎。",
        "adjustment": "讓別人也感覺到舞台上有他們的位置，會讓你更受歡迎。",
    },
    "處女": {
        "teaser": "第一印象是細心、有條理、踏實。你讓事情變得比較清楚。",
        "external": "外顯氣質：謹慎、精準、有服務心，讓人覺得可以放心。",
        "mask": "面具底下：你對自己的批評比別人看到的更嚴格。",
        "adjustment": "讓人看見你在整理中也有彈性，不全是標準與挑剔。",
    },
    "天秤": {
        "teaser": "第一印象是優雅、好相處、漂亮。你自然讓人覺得跟你在一起很舒服。",
        "external": "外顯氣質：平衡、有禮、帶美感，讓人覺得與你互動很流暢。",
        "mask": "面具底下：你其實很清楚自己要什麼，只是不一定說出口。",
        "adjustment": "讓人看見你的立場，會讓你的和諧感更真實而非只是配合。",
    },
    "天蠍": {
        "teaser": "第一印象是神秘、有深度、目光犀利。你讓人覺得你在看穿他。",
        "external": "外顯氣質：強烈、專注、不輕易說話，讓人覺得你很有料。",
        "mask": "面具底下：你其實非常在意信任與連結，只是選擇先觀察。",
        "adjustment": "偶爾主動靠近，比等對方先解讀你更有效。",
    },
    "射手": {
        "teaser": "第一印象是樂觀、開闊、說話直。你讓人覺得世界還有很多可能。",
        "external": "外顯氣質：自由、正向、帶遠方感，讓人覺得充電了。",
        "mask": "面具底下：樂觀背後有時是不想讓別人看見你也有重的地方。",
        "adjustment": "讓人看見你也能認真停下來，才能建立深度關係。",
    },
    "摩羯": {
        "teaser": "第一印象是可靠、認真、有目標感。你讓人覺得交給你的事不會出問題。",
        "external": "外顯氣質：穩重、負責、有紀律，讓人覺得你是可以信賴的人。",
        "mask": "面具底下：你其實也想要輕鬆一點，只是不確定那是被允許的。",
        "adjustment": "讓別人看見你有放鬆的樣子，比一直可靠更讓人想靠近。",
    },
    "水瓶": {
        "teaser": "第一印象是獨特、有想法、不按牌理出牌。你讓人覺得這個人不一樣。",
        "external": "外顯氣質：前衛、理性、保持距離，讓人覺得想了解你。",
        "mask": "面具底下：你其實很在乎找到真正理解你的人，只是不輕易承認。",
        "adjustment": "讓人看見你也會在乎，才能突破獨特背後的孤立感。",
    },
    "雙魚": {
        "teaser": "第一印象是溫柔、夢幻、有點難捉摸。你讓人覺得你活在另一個世界。",
        "external": "外顯氣質：柔軟、感受力強、帶靈性感，讓人覺得你懂他們。",
        "mask": "面具底下：你其實需要很強的界線，才不會被任何人的氣場帶走。",
        "adjustment": "讓人看見你也有清楚的立場，會讓神秘感變成真正的深度。",
    },
}
_RISING_FALLBACK: dict[str, str] = {
    "teaser": "上升代表你進入世界的方式，別人常先看到這一層，而不是你真正的內在。",
    "external": "外顯氣質：這個位置描述你天生帶出的氣場與第一印象。",
    "mask": "面具底下：上升有時是一種保護色，真正的自我藏在太陽與月亮裡。",
    "adjustment": "當你讓真實的自己透出上升的濾鏡，反而更有吸引力。",
}

# ── 行星能量與星座修飾詞 ──────────────────────────────────────
_PLANET_ROLES: dict[str, str] = {
    "mercury": "思維溝通的能量",
    "venus": "愛與美感的能量",
    "mars": "行動與欲望的能量",
    "jupiter": "擴展與信念的能量",
    "saturn": "責任與紀律的能量",
    "uranus": "突破革新的能量",
    "neptune": "靈性直覺的能量",
    "pluto": "深層轉化的能量",
}
_PLANET_ZH: dict[str, str] = {
    "sun": "太陽",
    "moon": "月亮",
    "mercury": "水星",
    "venus": "金星",
    "mars": "火星",
    "jupiter": "木星",
    "saturn": "土星",
    "uranus": "天王星",
    "neptune": "海王星",
    "pluto": "冥王星",
}
_SIGN_MODIFIERS: dict[str, str] = {
    "牡羊": "主動直接地",
    "金牛": "穩定踏實地",
    "雙子": "靈活多面地",
    "巨蟹": "細膩保護地",
    "獅子": "熱情創造地",
    "處女": "分析服務地",
    "天秤": "平衡協調地",
    "天蠍": "深刻轉化地",
    "射手": "開放探索地",
    "摩羯": "務實負責地",
    "水瓶": "創新獨立地",
    "雙魚": "直覺感受地",
}
_HOUSE_AREAS: dict[int, str] = {
    1: "自我形象",
    2: "資源與價值觀",
    3: "溝通與學習",
    4: "家庭與根基",
    5: "創造與愛情",
    6: "日常習慣與工作",
    7: "關係與伴侶",
    8: "轉化與深層連結",
    9: "信念與遠景",
    10: "事業與公眾形象",
    11: "群體與未來目標",
    12: "潛意識與靈性",
}

# ── 相位類型解讀 ──────────────────────────────────────────────
_ASPECT_TYPES: dict[str, str] = {
    "合相": "兩星能量聚焦同向，高度強化，也需辨清是相輔還是過度融合",
    "對分相": "兩星能量形成對立軸，需要在兩極間找到整合與平衡",
    "三分相": "能量流動順暢，天生的協同資源或才能",
    "四分相": "兩星能量產生摩擦張力，是成長的壓力點也是推動力",
    "六分相": "能量互補，透過主動投入可發揮協同效果",
}

# 特定行星對的補充說明（用已排序的 tuple 作為 key）
_ASPECT_PAIR_NOTES: dict[tuple[str, str], str] = {
    ("moon", "sun"): "個人意志與情感本能的互動，直接影響內外一致性",
    ("mercury", "sun"): "思維方式與自我表達高度融合，適合用語言傳遞自我",
    ("sun", "venus"): "愛與美感跟自我認同的連結，影響如何吸引與被欣賞",
    ("mars", "sun"): "意志力與行動衝動的配合程度，強則果決，張力大則易過衝",
    ("jupiter", "sun"): "個人信念與成長方向的擴展力，樂觀有時過頭",
    ("saturn", "sun"): "自我實現與責任限制之間的張力，是長期成熟的關鍵",
    ("moon", "venus"): "情感需求與親密關係模式的連結，影響如何給愛與接受愛",
    ("mars", "moon"): "情緒衝動與行動反應的互動，壓力下容易直接引爆",
    ("moon", "saturn"): "情感安全感與自我要求的拉扯，情感可能過度克制",
    ("mars", "venus"): "愛欲能量的互動，影響吸引力與關係主動性",
    ("mars", "saturn"): "行動力與限制之間的張力，耐力型或容易受阻",
    ("jupiter", "saturn"): "擴展與收斂的節奏平衡，影響長期規劃的節奏",
    ("mercury", "saturn"): "思維與自我要求結合，細膩嚴謹但可能過度審查自己",
    ("jupiter", "mercury"): "想法擴張且樂觀，溝通廣但需注意落地執行",
    ("neptune", "sun"): "靈性理想與自我認同的交織，需辨清現實與投射",
    ("pluto", "sun"): "深層轉化驅力與意志力的強烈融合，能量強大且難以忽視",
    ("sun", "uranus"): "獨立突破的衝動與自我定義的張力",
    ("moon", "neptune"): "情感敏感與直覺力高度融合，界線容易模糊",
    ("moon", "pluto"): "情感深層且強烈，轉化常從最親密的連結開始",
}


def _planet_in_sign_desc(key: str, sign_zh: str, house: int | None) -> str:
    """生成行星在星座+宮位的簡短描述。"""
    role = _PLANET_ROLES.get(key, "此星的能量")
    modifier = _SIGN_MODIFIERS.get(sign_zh, "以此星座特有的方式")
    area = _HOUSE_AREAS.get(house, "") if house else ""
    if area:
        return f"{modifier}展現{role}，落在{area}的生活場域"
    return f"{modifier}展現{role}"


def explain_astro(data: dict, detail: DetailLevel = "teaser", **kwargs) -> str:
    """
    西洋占星完整解讀。
    kwargs 接受 voice 等擴充參數（目前保留不用）。
    """
    planets_raw = data.get("planets") or {}
    sun_data = data.get("sun") or planets_raw.get("sun") or {}
    moon_data = data.get("moon") or planets_raw.get("moon") or {}
    asc_data = data.get("ascendant") or {}
    mc_data = data.get("midheaven") or {}
    aspects_raw: list[dict] = data.get("aspects") or []
    houses_raw: list[dict] = data.get("houses") or []

    sun_sign = _astro_sign_zh(sun_data)
    moon_sign = _astro_sign_zh(moon_data)
    asc_sign = _astro_sign_zh(asc_data)

    sun_info = _SUN_SIGNS.get(sun_sign, _SUN_FALLBACK)
    moon_info = _MOON_SIGNS.get(moon_sign, _MOON_FALLBACK)
    asc_info = _RISING_SIGNS.get(asc_sign, _RISING_FALLBACK)

    sun_deg = _astro_deg_str(sun_data)
    moon_deg = _astro_deg_str(moon_data)
    asc_deg = _astro_deg_str(asc_data)
    sun_house = _astro_house_str(sun_data)
    moon_house = _astro_house_str(moon_data)

    parts: list[str] = []

    # ── 太陽 ──
    if detail == "teaser":
        parts.append(
            _line(
                f"太陽 <strong>{sun_sign or '—'} {sun_deg}{sun_house}</strong>：{_text(sun_info.get('teaser_friend'))}"
            )
        )
    else:
        parts.append(_section("太陽：核心意志"))
        parts.append(_line(f"<strong>{sun_sign or '—'} {sun_deg}{sun_house}</strong>"))
        parts.append(_line(_text(sun_info.get("core"))))
        parts.append(_line(_text(sun_info.get("shadow"))))
        parts.append(_section("關係模式"))
        parts.append(_line(_text(sun_info.get("relationship"))))
        parts.append(_line(_text(sun_info.get("growth"))))

    # ── 月亮 ──
    if detail == "teaser":
        parts.append(
            _line(
                f"月亮 <strong>{moon_sign or '—'} {moon_deg}{moon_house}</strong>：{_text(moon_info.get('teaser'))}"
            )
        )
    else:
        parts.append(_section("月亮：情感本能"))
        parts.append(_line(f"<strong>{moon_sign or '—'} {moon_deg}{moon_house}</strong>"))
        parts.append(_line(_text(moon_info.get("teaser"))))
        parts.append(_section("深層需要"))
        parts.append(_line(_text(moon_info.get("need"))))
        parts.append(_line(_text(moon_info.get("shadow"))))
        parts.append(_line(_text(moon_info.get("focus"))))

    # 月亮的安全感提示在 teaser/full 均顯示
    parts.append(_line("月亮說的是你真正需要的安全感——情感底色穩了，其他選擇才能真正看清楚。"))

    # ── 上升 ──
    if detail == "teaser":
        parts.append(
            _line(f"上升 <strong>{asc_sign or '—'} {asc_deg}</strong>：{_text(asc_info.get('teaser'))}")
        )
    else:
        parts.append(_section("上升：第一印象"))
        parts.append(_line(f"<strong>{asc_sign or '—'} {asc_deg}</strong>"))
        parts.append(_line(_text(asc_info.get("teaser"))))
        parts.append(_section("外顯氣質"))
        parts.append(_line(_text(asc_info.get("external"))))
        parts.append(_line(_text(asc_info.get("mask"))))  # 包含「面具底下」
        parts.append(_line(_text(asc_info.get("adjustment"))))

    # ── 天頂 ──
    mc_text = _sign_text(mc_data)
    if mc_text:
        parts.append(_line(f"天頂 <strong>{mc_text}</strong>：事業形象、公眾成就與社會角色的方向。"))

    # ── 其他行星位置 ──
    _OTHER_PLANETS = ["mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
    show_planets = _OTHER_PLANETS[:3] if detail == "teaser" else _OTHER_PLANETS
    planet_lines: list[str] = []
    for key in show_planets:
        p = planets_raw.get(key) or {}
        if not p:
            continue
        p_sign = _astro_sign_zh(p)
        p_deg = _astro_deg_str(p)
        p_house = _astro_house_str(p)
        p_zh = _text(p.get("zh")) or _PLANET_ZH.get(key, key)
        p_sym = _text(p.get("symbol"))
        retro = "℞ " if p.get("retrograde") else ""
        desc = _planet_in_sign_desc(key, p_sign, p.get("house"))
        planet_lines.append(
            _line(
                f"{p_sym} <strong>{p_zh}{' ' + retro if retro else ''}</strong>"
                f" {p_sign} {p_deg}{p_house}：{desc}。"
            )
        )
    if planet_lines:
        parts.append(_section("其他行星位置"))
        parts.extend(planet_lines)

    # ── 主要相位 ──
    _PERSONAL = {"sun", "moon", "mercury", "venus", "mars"}
    important = [
        a
        for a in aspects_raw
        if isinstance(a, dict) and (a.get("planet1") in _PERSONAL or a.get("planet2") in _PERSONAL)
    ]
    limit = 5 if detail == "teaser" else 15
    if important:
        parts.append(_section("主要相位"))
        for asp in important[:limit]:
            p1_key = asp.get("planet1", "")
            p2_key = asp.get("planet2", "")
            p1_zh = _text(asp.get("planet1Zh")) or _PLANET_ZH.get(p1_key, p1_key)
            p2_zh = _text(asp.get("planet2Zh")) or _PLANET_ZH.get(p2_key, p2_key)
            asp_type = _text(asp.get("type"))
            orb = asp.get("orb")
            try:
                orb_str = f"{float(orb):.1f}°" if orb is not None else ""
            except (TypeError, ValueError):
                orb_str = ""
            pair_key = tuple(sorted([p1_key, p2_key]))
            note = _ASPECT_PAIR_NOTES.get(pair_key, "") or _ASPECT_TYPES.get(asp_type, "")
            parts.append(
                _line(
                    f"<strong>{p1_zh} {asp_type} {p2_zh}</strong>"
                    f"{'（容許度 ' + orb_str + '）' if orb_str else ''}：{_text(note)}"
                )
            )

    # ── Full：宮位概覽 ──
    if detail == "full" and houses_raw:
        parts.append(_section("十二宮位星座"))
        for h in houses_raw[:12]:
            if not isinstance(h, dict):
                continue
            hnum = h.get("house")
            hsign = _astro_sign_zh(h)
            hsym = (h.get("sign") or {}).get("symbol", "") if isinstance(h.get("sign"), dict) else ""
            area = _HOUSE_AREAS.get(hnum, "")
            parts.append(
                _line(f"第 <strong>{hnum}</strong> 宮 {hsym}{hsign}" f"{'（' + area + '）' if area else ''}")
            )

    # ── 諮詢引導 ──
    parts.append(
        _line("帶著星盤問老師，把你看到有感的部分說出來；" "一場好的諮詢能讓抽象符號變成真正可以行動的地圖。")
    )

    # ── 合規聲明 ──
    parts.append(
        _line(
            "<small>以上解讀以星盤象徵作為自我觀察的參考框架，不構成預測、醫療診斷或任何形式的保證。"
            "出生時間精準度直接影響上升與宮位準確性。</small>"
        )
    )

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
        _line(
            f"你的類型是 <strong>{_text(type_label)}</strong>，策略是 <strong>{_text(strategy_label)}</strong>。"
        ),
        _line(
            HD_TYPE_GUIDE.get(
                str(type_raw), "類型說明你和世界交換能量的方式，重點是把它落實到日常決策，而不是只記名稱。"
            )
        ),
        _line(
            f"內在權威：<strong>{_text(authority_label)}</strong>。{HD_AUTHORITY_GUIDE.get(str(authority_raw), '這是做重要決定時最需要信任的身體訊號。')}"
        ),
        _line(
            f"人生角色 Profile：<strong>{_text(data.get('profile'))}</strong>，描述你學習、互動與被他人看見的方式。"
        ),
    ]
    if defined:
        center_names = [_hd_center_label(center) for center in defined]
        parts.append(
            _line(f"已定義中心：<strong>{_join(center_names)}</strong>，代表較穩定、可持續輸出的能量。")
        )
    if channels:
        parts.append(_line(f"已定義通道：<strong>{_join(channels)}</strong>，可視為你較固定的天賦迴路。"))
    if gates:
        parts.append(_section("啟動閘門重點"))
        for raw_gate in gates[:8]:
            gate = _safe_int(raw_gate.get("gate") if isinstance(raw_gate, dict) else raw_gate)
            title, copy = GATE_MEANINGS.get(
                gate, ("能量主題", "這個閘門描述一種被啟動的能量，需放回你的類型、策略與權威下理解。")
            )
            parts.append(_line(f"<strong>第 {gate} 閘門｜{_text(title)}</strong>：{_text(copy)}"))

    if detail == "full":
        parts.extend(
            [
                _section("深度解讀方向"),
                _line("人類圖最重要的是把策略與權威落實到生活決策，而不是只記住類型名稱。"),
                _line(
                    "下一層可針對未定義中心說明容易受環境放大的主題，協助使用者分辨什麼是自己、什麼是場域影響。"
                ),
                _line("閘門不是單獨下結論用的，它需要和所在中心、通道、行星位置與人格/設計層一起閱讀。"),
            ]
        )
    return _wrap(parts, detail)


def explain_tarot(data: dict, detail: DetailLevel = "teaser") -> str:
    cards = data.get("cards") or []
    parts = [_section("牌陣重點")]
    reversed_count = sum(1 for draw in cards if draw.get("position") == "reversed")
    parts.append(
        _line(
            f"本次抽出 {len(cards)} 張牌，其中 {reversed_count} 張逆位。請同時看牌名、位置與正逆位，不要只看單張牌。"
        )
    )

    for index, draw in enumerate(cards, start=1):
        card = draw.get("card") or {}
        position = "逆位" if draw.get("position") == "reversed" else "正位"
        name = card.get("name_zh") or card.get("name_en") or f"第 {index} 張牌"
        meaning = draw.get("meaning")
        if not meaning:
            meaning_source = card.get("reversed") if position == "逆位" else card.get("upright")
            meaning = (meaning_source or {}).get("text")
        parts.append(
            _line(
                f"<strong>{index}. {_text(name)} / {position}</strong>：{_text(meaning, '這張牌指出當下需要被看見的主題。')}"
            )
        )

    if detail == "full":
        parts.extend(
            [
                _section("深度解牌方向"),
                _line("三張牌建議讀成一段時間線：過去如何形成現在，現在如何推動未來。"),
                _line(
                    "若是關係或職涯問題，建議補問：我能控制的是什麼？我需要放下的是什麼？下一步最小行動是什麼？"
                ),
            ]
        )
    return _wrap(parts, detail)


def explain_runes(data: dict, detail: DetailLevel = "teaser") -> str:
    runes = data.get("runes") or []
    material = (data.get("meta") or {}).get("material")
    parts = [
        _section("盧恩訊息"),
        _line(
            f"你本次抽出 {len(runes)} 顆符文{f'，材質為 {_text(material)}' if material else ''}。盧恩適合讀成提醒、阻力與下一步。"
        ),
    ]

    for index, draw in enumerate(runes, start=1):
        rune = draw.get("rune") or {}
        position = "逆位" if draw.get("position") == "reversed" else "正位"
        name = rune.get("zh") or rune.get("name") or f"第 {index} 顆符文"
        meaning = draw.get("meaning")
        if not meaning:
            meaning_source = rune.get("reversed") if position == "逆位" else rune.get("upright")
            meaning = (meaning_source or {}).get("text")
        parts.append(
            _line(
                f"<strong>{_text(rune.get('glyph'))} {_text(name)} / {position}</strong>：{_text(meaning, '這顆符文提醒你留意當下事件背後的能量。')}"
            )
        )

    if detail == "full":
        parts.extend(
            [
                _section("深度解讀方向"),
                _line("若抽到逆位，不必視為壞事，它通常指出能量被卡住、延遲或需要重新校準。"),
                _line("建議把符文訊息轉成一個具體行動：今天要避免什麼、練習什麼、完成什麼。"),
            ]
        )
    return _wrap(parts, detail)
