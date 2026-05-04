"""
從 packages/data/*.js 萃取出 JSON，給 Python engines 用。
跑一次：python data/build_data.py
"""
import re
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent
JS_TAROT = ROOT / "packages" / "data" / "tarot.js"
JS_RUNES = ROOT / "packages" / "data" / "runes.js"

OUT_TAROT = Path(__file__).parent / "tarot.json"
OUT_RUNES = Path(__file__).parent / "runes.json"


def parse_js_array(js_text: str, var_name: str) -> list[dict]:
    """從 'export const X = [...]' 把 array 字面量摳出來，轉成 Python list[dict]"""
    # 找到 [ ... ] 主體
    pattern = rf"export\s+const\s+{var_name}\s*=\s*\["
    m = re.search(pattern, js_text)
    if not m:
        raise ValueError(f"找不到 export const {var_name}")
    start = m.end() - 1  # 對齊到 [
    depth = 0
    end = None
    in_str = False
    str_ch = None
    for i in range(start, len(js_text)):
        ch = js_text[i]
        if in_str:
            if ch == "\\":
                continue
            if ch == str_ch:
                in_str = False
        else:
            if ch in ('"', "'", "`"):
                in_str = True
                str_ch = ch
            elif ch == "[":
                depth += 1
            elif ch == "]":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
    if end is None:
        raise ValueError("未閉合的陣列")
    body = js_text[start:end]
    # 轉成 JSON：JS object key 不加引號 → 加上
    body = re.sub(r"([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:", r'\1"\2":', body)
    return json.loads(body)


def build():
    if JS_TAROT.exists():
        tarot = parse_js_array(JS_TAROT.read_text(encoding="utf-8"), "TAROT")
        # 統一欄位名給 Python engine
        cleaned = []
        for c in tarot:
            cleaned.append({
                "id": c.get("num"),
                "number": c.get("num"),
                "name_zh": c.get("name"),
                "name_en": c.get("en"),
                "arcana": c.get("arcana"),
                "symbol": c.get("symbol"),
                "upright": {
                    "keywords": c.get("keywords", []),
                    "text": c.get("upright", ""),
                },
                "reversed": {
                    "keywords": c.get("keywords", []),
                    "text": c.get("reversed", ""),
                },
                "script": c.get("script"),
            })
        OUT_TAROT.write_text(json.dumps(cleaned, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"✓ tarot.json 寫入 {len(cleaned)} 張牌")
    else:
        print(f"⚠ 找不到 {JS_TAROT}")

    if JS_RUNES.exists():
        runes = parse_js_array(JS_RUNES.read_text(encoding="utf-8"), "RUNES")
        cleaned = []
        for r in runes:
            cleaned.append({
                "glyph": r.get("glyph") or r.get("symbol"),
                "name": r.get("name"),
                "zh": r.get("zh") or r.get("nameZh"),
                "meaning": r.get("meaning"),
                "element": r.get("element"),
                "upright": r.get("upright") if isinstance(r.get("upright"), dict) else {
                    "keywords": r.get("keywords", []),
                    "text": r.get("upright", "") or r.get("meaning", ""),
                },
                "reversed": r.get("reversed") if isinstance(r.get("reversed"), dict) else {
                    "keywords": r.get("keywords", []),
                    "text": r.get("reversed", ""),
                },
            })
        OUT_RUNES.write_text(json.dumps(cleaned, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"✓ runes.json 寫入 {len(cleaned)} 個符文")
    else:
        print(f"⚠ 找不到 {JS_RUNES}")


if __name__ == "__main__":
    build()
