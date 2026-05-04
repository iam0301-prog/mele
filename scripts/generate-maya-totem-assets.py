from __future__ import annotations

from dataclasses import dataclass
from math import cos, pi, sin, sqrt
from pathlib import Path
from random import Random

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "apps" / "web" / "public" / "maya" / "totems"
CONTACT_SHEET = ROOT / "tmp" / "maya-totems-contact-sheet.png"
SIZE = 512
SCALE = 2
CANVAS = SIZE * SCALE


@dataclass(frozen=True)
class Totem:
    idx: int
    slug: str
    color: str
    accent: str
    secondary: str


TOTEMS = [
    Totem(1, "red-dragon", "#d84d43", "#ffb178", "#ffd8bf"),
    Totem(2, "white-wind", "#eee4cf", "#8ed9e5", "#fff7df"),
    Totem(3, "blue-night", "#3579c6", "#a58ae7", "#cce9ff"),
    Totem(4, "yellow-seed", "#dfb640", "#8fce72", "#fff2a3"),
    Totem(5, "red-serpent", "#df4b42", "#f7a15d", "#ffd1bf"),
    Totem(6, "white-worldbridger", "#eee5d5", "#b5d9e4", "#fff9ea"),
    Totem(7, "blue-hand", "#3f8bd0", "#82d6d6", "#d7f5ff"),
    Totem(8, "yellow-star", "#e2bd3f", "#e8dd80", "#fff4ad"),
    Totem(9, "red-moon", "#d94f47", "#78c7d9", "#ffd6c9"),
    Totem(10, "white-dog", "#f0e8d7", "#d99bb7", "#fffaf0"),
    Totem(11, "blue-monkey", "#4381c9", "#c58ee8", "#d3f0ff"),
    Totem(12, "yellow-human", "#dfb642", "#f0d87a", "#fff3b6"),
    Totem(13, "red-skywalker", "#d94b41", "#ffb35f", "#ffd3bf"),
    Totem(14, "white-wizard", "#f0e7d6", "#a9d7de", "#fffaf0"),
    Totem(15, "blue-eagle", "#397dcc", "#7ed0e3", "#d4ecff"),
    Totem(16, "yellow-warrior", "#e0b943", "#f0d274", "#fff2a5"),
    Totem(17, "red-earth", "#d94f43", "#9fd07a", "#ffd5c8"),
    Totem(18, "white-mirror", "#eee6d7", "#a8dce3", "#fffaf0"),
    Totem(19, "blue-storm", "#397ccd", "#b190eb", "#cfeaff"),
    Totem(20, "yellow-sun", "#e1ba3f", "#ffe27a", "#fff3a6"),
]


def hex_to_rgba(color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    color = color.lstrip("#")
    return tuple(int(color[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def mix(a: str, b: str, t: float, alpha: int = 255) -> tuple[int, int, int, int]:
    ar, ag, ab, _ = hex_to_rgba(a)
    br, bg, bb, _ = hex_to_rgba(b)
    return (
        int(ar + (br - ar) * t),
        int(ag + (bg - ag) * t),
        int(ab + (bb - ab) * t),
        alpha,
    )


def sc(value: float) -> int:
    return int(round(value * SCALE))


def box(x0: float, y0: float, x1: float, y1: float) -> tuple[int, int, int, int]:
    return sc(x0), sc(y0), sc(x1), sc(y1)


def pts(points: list[tuple[float, float]]) -> list[tuple[int, int]]:
    return [(sc(x), sc(y)) for x, y in points]


def radial_disc(totem: Totem) -> Image.Image:
    img = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    cx = cy = SIZE / 2
    max_r = CANVAS * 0.46
    rng = Random(totem.idx * 101)

    for step in range(92, 0, -1):
        t = step / 92
        radius = (max_r / SCALE) * t
        color = mix("#07101b", totem.color, (1 - t) * 0.74, alpha=int(220 + (1 - t) * 32))
        d.ellipse(box(cx - radius, cy - radius, cx + radius, cy + radius), fill=color)

    for _ in range(340):
        angle = rng.random() * pi * 2
        radius = sqrt(rng.random()) * (max_r / SCALE) * 0.92
        x = cx + cos(angle) * radius
        y = cy + sin(angle) * radius
        alpha = rng.randint(14, 46)
        size = rng.uniform(0.6, 1.8)
        d.ellipse(box(x - size, y - size, x + size, y + size), fill=hex_to_rgba(totem.secondary, alpha))

    return img


def draw_base(totem: Totem) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    shadow = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse(box(72, 78, 440, 452), fill=(0, 0, 0, 95))
    shadow = shadow.filter(ImageFilter.GaussianBlur(sc(24)))
    img.alpha_composite(shadow)

    glow = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse(box(56, 56, 456, 456), fill=hex_to_rgba(totem.color, 54))
    glow = glow.filter(ImageFilter.GaussianBlur(sc(22)))
    img.alpha_composite(glow)
    img.alpha_composite(radial_disc(totem))

    d = ImageDraw.Draw(img)
    d.ellipse(box(62, 62, 450, 450), outline=hex_to_rgba(totem.accent, 210), width=sc(8))
    d.ellipse(box(86, 86, 426, 426), outline=hex_to_rgba("#f5df8a", 86), width=sc(2))
    d.ellipse(box(118, 118, 394, 394), outline=hex_to_rgba(totem.secondary, 56), width=sc(2))

    for i in range(20):
        angle = i * pi / 10
        r0 = 205 if i % 2 else 188
        r1 = 214
        x0 = 256 + cos(angle) * r0
        y0 = 256 + sin(angle) * r0
        x1 = 256 + cos(angle) * r1
        y1 = 256 + sin(angle) * r1
        d.line(pts([(x0, y0), (x1, y1)]), fill=hex_to_rgba(totem.accent, 125), width=sc(2))

    return img, d


def draw_curve(d: ImageDraw.ImageDraw, points: list[tuple[float, float]], fill: str, width: int = 12, alpha: int = 245) -> None:
    d.line(pts(points), fill=hex_to_rgba(fill, alpha), width=sc(width), joint="curve")


def star_points(cx: float, cy: float, outer: float, inner: float, count: int = 8) -> list[tuple[float, float]]:
    out = []
    for i in range(count * 2):
        radius = outer if i % 2 == 0 else inner
        angle = -pi / 2 + i * pi / count
        out.append((cx + cos(angle) * radius, cy + sin(angle) * radius))
    return out


def draw_motif(totem: Totem, d: ImageDraw.ImageDraw) -> None:
    c = totem.accent
    s = totem.secondary
    w = "#fff4d2"
    if totem.idx == 1:
        draw_curve(d, [(275, 116), (352, 154), (374, 246), (326, 326), (238, 344), (176, 288), (190, 218), (252, 204), (286, 242), (259, 282)], c, 18)
        draw_curve(d, [(244, 144), (208, 204), (213, 301), (275, 366)], s, 7, 170)
        d.ellipse(box(294, 150, 316, 172), fill=hex_to_rgba(w, 220))
    elif totem.idx == 2:
        draw_curve(d, [(116, 202), (286, 202), (338, 140), (388, 184), (342, 226)], c, 15)
        draw_curve(d, [(130, 266), (330, 266), (390, 328), (328, 374), (284, 324)], s, 15)
        draw_curve(d, [(166, 326), (248, 326)], w, 8, 190)
    elif totem.idx == 3:
        d.pieslice(box(154, 112, 390, 388), 75, 290, fill=hex_to_rgba(c, 218))
        d.pieslice(box(218, 110, 450, 390), 75, 290, fill=hex_to_rgba("#07101b", 238))
        for x, y, r in [(198, 168, 8), (276, 206, 6), (230, 304, 7), (338, 278, 5)]:
            d.ellipse(box(x - r, y - r, x + r, y + r), fill=hex_to_rgba(s, 225))
    elif totem.idx == 4:
        draw_curve(d, [(256, 372), (256, 288), (256, 206)], c, 12)
        d.ellipse(box(138, 118, 266, 246), fill=hex_to_rgba(c, 190), outline=hex_to_rgba(w, 170), width=sc(4))
        d.ellipse(box(248, 152, 388, 292), fill=hex_to_rgba(s, 185), outline=hex_to_rgba(w, 150), width=sc(4))
        d.line(pts([(182, 188), (256, 246), (338, 210)]), fill=hex_to_rgba(w, 170), width=sc(5))
    elif totem.idx == 5:
        draw_curve(d, [(308, 112), (204, 150), (245, 236), (326, 274), (296, 366), (178, 396)], c, 22)
        draw_curve(d, [(225, 164), (292, 136), (252, 348), (190, 380)], s, 8, 165)
        d.ellipse(box(318, 98, 340, 120), fill=hex_to_rgba(w, 235))
    elif totem.idx == 6:
        d.arc(box(118, 180, 394, 422), 180, 360, fill=hex_to_rgba(c, 238), width=sc(14))
        d.arc(box(160, 224, 352, 422), 180, 360, fill=hex_to_rgba(s, 210), width=sc(10))
        d.line(pts([(256, 126), (256, 404), (132, 404), (380, 404)]), fill=hex_to_rgba(w, 180), width=sc(7))
        d.ellipse(box(236, 134, 276, 174), fill=hex_to_rgba(c, 220))
    elif totem.idx == 7:
        d.rounded_rectangle(box(190, 194, 318, 372), radius=sc(42), fill=hex_to_rgba(c, 202), outline=hex_to_rgba(w, 150), width=sc(5))
        for x in [178, 214, 250, 286, 322]:
            d.rounded_rectangle(box(x, 120, x + 28, 252), radius=sc(16), fill=hex_to_rgba(s, 210))
        draw_curve(d, [(200, 290), (242, 332), (322, 220)], w, 10, 210)
    elif totem.idx == 8:
        d.polygon(pts(star_points(256, 250, 148, 60, 8)), fill=hex_to_rgba(c, 210), outline=hex_to_rgba(w, 160))
        d.ellipse(box(198, 192, 314, 308), outline=hex_to_rgba(s, 225), width=sc(10))
    elif totem.idx == 9:
        d.pieslice(box(150, 112, 382, 390), 70, 292, fill=hex_to_rgba(c, 215))
        d.pieslice(box(216, 112, 444, 392), 70, 292, fill=hex_to_rgba("#07101b", 238))
        d.polygon(pts([(256, 170), (286, 246), (256, 324), (226, 246)]), fill=hex_to_rgba(s, 210))
        d.arc(box(176, 284, 336, 376), 20, 160, fill=hex_to_rgba(w, 170), width=sc(7))
    elif totem.idx == 10:
        d.pieslice(box(128, 132, 258, 292), 105, 350, fill=hex_to_rgba(c, 215))
        d.pieslice(box(254, 132, 384, 292), 190, 435, fill=hex_to_rgba(c, 215))
        d.polygon(pts([(138, 230), (374, 230), (256, 394)]), fill=hex_to_rgba(c, 215))
        d.line(pts([(184, 254), (328, 254), (256, 154), (256, 356)]), fill=hex_to_rgba(s, 205), width=sc(9))
    elif totem.idx == 11:
        d.arc(box(142, 126, 370, 354), 205, 590, fill=hex_to_rgba(c, 238), width=sc(20))
        d.arc(box(202, 178, 318, 294), 205, 590, fill=hex_to_rgba(s, 220), width=sc(13))
        for x, y in [(166, 320), (346, 158), (362, 318), (150, 164)]:
            d.ellipse(box(x - 12, y - 12, x + 12, y + 12), fill=hex_to_rgba(w, 205))
    elif totem.idx == 12:
        d.ellipse(box(224, 114, 288, 178), outline=hex_to_rgba(c, 235), width=sc(12))
        d.line(pts([(256, 184), (256, 356), (158, 242), (354, 242), (208, 382), (256, 356), (304, 382)]), fill=hex_to_rgba(c, 232), width=sc(13), joint="curve")
        d.arc(box(144, 112, 368, 244), 205, 335, fill=hex_to_rgba(s, 205), width=sc(8))
    elif totem.idx == 13:
        d.polygon(pts([(256, 94), (374, 158), (374, 386), (138, 386), (138, 158)]), outline=hex_to_rgba(c, 235), fill=hex_to_rgba(c, 68))
        d.line(pts([(256, 104), (256, 372), (176, 338), (336, 338), (198, 284), (314, 284), (220, 230), (292, 230)]), fill=hex_to_rgba(w, 205), width=sc(9))
        d.ellipse(box(236, 96, 276, 136), fill=hex_to_rgba(s, 230))
    elif totem.idx == 14:
        d.polygon(pts([(256, 82), (406, 256), (256, 430), (106, 256)]), fill=hex_to_rgba(c, 150), outline=hex_to_rgba(w, 170))
        d.ellipse(box(182, 182, 330, 330), outline=hex_to_rgba(s, 230), width=sc(11))
        d.line(pts([(178, 256), (334, 256), (256, 178), (256, 334)]), fill=hex_to_rgba(c, 245), width=sc(10))
    elif totem.idx == 15:
        d.polygon(pts([(256, 270), (76, 176), (122, 312)]), fill=hex_to_rgba(c, 198), outline=hex_to_rgba(w, 130))
        d.polygon(pts([(256, 270), (436, 176), (390, 312)]), fill=hex_to_rgba(c, 198), outline=hex_to_rgba(w, 130))
        d.line(pts([(256, 132), (256, 374), (194, 386), (318, 386)]), fill=hex_to_rgba(s, 225), width=sc(10))
        d.ellipse(box(232, 234, 280, 282), fill=hex_to_rgba(w, 205))
    elif totem.idx == 16:
        d.polygon(pts([(256, 92), (386, 154), (386, 260), (256, 418), (126, 260), (126, 154)]), fill=hex_to_rgba(c, 190), outline=hex_to_rgba(w, 155))
        d.line(pts([(256, 138), (256, 374), (188, 216), (324, 216), (190, 292), (322, 292)]), fill=hex_to_rgba(s, 225), width=sc(11))
    elif totem.idx == 17:
        d.ellipse(box(126, 126, 386, 386), outline=hex_to_rgba(c, 236), width=sc(12))
        d.line(pts([(256, 102), (256, 410), (102, 256), (410, 256), (160, 352), (352, 160)]), fill=hex_to_rgba(s, 215), width=sc(9))
        d.polygon(pts([(256, 148), (300, 256), (256, 364), (212, 256)]), fill=hex_to_rgba(c, 185))
    elif totem.idx == 18:
        d.polygon(pts([(256, 88), (392, 256), (256, 424), (120, 256)]), fill=hex_to_rgba(c, 150), outline=hex_to_rgba(w, 180))
        d.line(pts([(178, 256), (334, 256), (256, 132), (256, 380), (194, 190), (318, 322), (318, 190), (194, 322)]), fill=hex_to_rgba(s, 220), width=sc(8))
    elif totem.idx == 19:
        d.polygon(pts([(282, 86), (154, 286), (246, 286), (214, 430), (370, 210), (276, 210)]), fill=hex_to_rgba(c, 220), outline=hex_to_rgba(w, 150))
        d.arc(box(92, 118, 420, 420), 130, 235, fill=hex_to_rgba(s, 200), width=sc(9))
        d.arc(box(92, 118, 420, 420), 310, 55, fill=hex_to_rgba(s, 200), width=sc(9))
    else:
        d.ellipse(box(176, 176, 336, 336), fill=hex_to_rgba(c, 215), outline=hex_to_rgba(w, 170), width=sc(7))
        for i in range(12):
            angle = i * pi / 6
            d.line(pts([(256 + cos(angle) * 98, 256 + sin(angle) * 98), (256 + cos(angle) * 176, 256 + sin(angle) * 176)]), fill=hex_to_rgba(s, 230), width=sc(8))
        d.ellipse(box(120, 120, 392, 392), outline=hex_to_rgba(c, 180), width=sc(5))


def render_totem(totem: Totem) -> Image.Image:
    img, d = draw_base(totem)
    draw_motif(totem, d)
    highlight = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    hd = ImageDraw.Draw(highlight)
    hd.ellipse(box(132, 100, 330, 260), fill=(255, 255, 255, 22))
    highlight = highlight.filter(ImageFilter.GaussianBlur(sc(10)))
    img.alpha_composite(highlight)
    return img.resize((SIZE, SIZE), Image.Resampling.LANCZOS)


def build_contact_sheet(images: list[tuple[Totem, Image.Image]]) -> Image.Image:
    tile = 180
    cols = 5
    rows = 4
    sheet = Image.new("RGBA", (cols * tile, rows * tile), (6, 12, 22, 255))
    for i, (_, image) in enumerate(images):
        x = (i % cols) * tile
        y = (i // cols) * tile
        thumb = image.resize((148, 148), Image.Resampling.LANCZOS)
        sheet.alpha_composite(thumb, (x + 16, y + 16))
    return sheet


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    CONTACT_SHEET.parent.mkdir(parents=True, exist_ok=True)
    rendered = []
    for totem in TOTEMS:
        image = render_totem(totem)
        image.save(OUT_DIR / f"{totem.slug}.png", optimize=True)
        rendered.append((totem, image))
    build_contact_sheet(rendered).save(CONTACT_SHEET, optimize=True)
    print(f"generated {len(rendered)} totems in {OUT_DIR}")
    print(CONTACT_SHEET)


if __name__ == "__main__":
    main()
