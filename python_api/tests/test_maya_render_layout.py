from engines import maya
from renderers import maya_render


def _cell_snippet(svg: str, x: int, y: int) -> str:
    start = svg.index(f'<rect x="{x}" y="{y}"')
    return svg[start:start + 2200]


def test_maya_oracle_board_places_challenge_left_and_hidden_force_bottom():
    data = maya.calculate(2000, 1, 1)
    svg = maya_render.render(data)["svg"]

    left_cell = _cell_snippet(svg, 130, 380)
    bottom_cell = _cell_snippet(svg, 250, 480)

    assert "挑戰" in left_cell
    assert f"Kin {data['oracle']['antipode']['kin']}" in left_cell
    assert "隱藏推動力" in bottom_cell
    assert f"Kin {data['oracle']['occult']['kin']}" in bottom_cell


def test_maya_oracle_board_uses_png_totem_art_for_each_oracle_position():
    data = maya.calculate(2000, 1, 1)
    svg = maya_render.render(data)["svg"]

    assert "maya-seal-glyph" not in svg
    assert svg.count('class="maya-totem-image maya-totem-image--') >= 6
    assert svg.count('href="/maya/totems/') >= 6

    for x, y in [(250, 280), (130, 380), (250, 380), (370, 380), (250, 480)]:
        cell_svg = _cell_snippet(svg, x, y)
        assert "maya-totem-image" in cell_svg
        assert ".png" in cell_svg

    assert f'maya-totem-image--{data["sealNum"]}' in svg
