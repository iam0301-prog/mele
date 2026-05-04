# Starroot Maya Crosscheck - 2026-04-29

Date checked: 2026-04-29

Reference:
- Starroot Mayan Oracle page: https://www.starroot.com/cgi/daycalc.pl

Scope:
- Starroot is an external reference site, not a government/academic authority.
- It combines Dreamspell fields with traditional Mayan calendar fields, so the app now preserves both categories separately.
- Date handling here treats the Gregorian date as a calendar date, matching Starroot's default date page display.

## Starroot Values

For Wednesday, April 29, 2026, Starroot displays:

- Dreamspell: Kin 141, Spectral Red Dragon
- Guide: Red Dragon
- Analog: White Mirror
- Antipode: Blue Monkey
- Occult: Yellow Sun, Electric tone
- Mayan Tzolkin: 6 Kab'an
- Haab: 10 Wo'
- Long Count: 0.0.13.9.17, plus 1 elapsed 13-baktun cycle
- 13 Moon Calendar: moon:10 day:26

## Local Engine Values

`python_api.engines.maya.calculate(2026, 4, 29)` now returns:

- Dreamspell: Kin 141, Spectral Red Dragon
- Oracle:
  - self: Kin 141, Spectral Red Dragon
  - guide: Kin 141, Spectral Red Dragon
  - analog: Kin 258, Spectral White Mirror
  - antipode: Kin 11, Spectral Blue Monkey
  - occult: Kin 120, Electric Yellow Sun
- Starroot-style crosscheck:
  - classicTzolkin.label: 6 Kab'an
  - haab.label: 10 Wo'
  - longCount.label: 13.0.13.9.17
  - longCount.starrootLabel: 0.0.13.9.17
  - longCount.starrootCycle: 1
  - thirteenMoon.label: moon:10 day:26

## Additional Reference Dates

The same formulas were tested against additional Starroot reference dates:

- 2026-04-15:
  - Dreamspell: Kin 127, Planetary Blue Hand
  - Tzolkin: 5 Ak'b'al
  - Haab: 16 Pop
  - Long Count: 0.0.13.9.3
  - 13 Moon: moon:10 day:12
- 2025-10-13:
  - Dreamspell: Kin 203, Galactic Blue Night
  - Tzolkin: 3 Kawak
  - Haab: 17 Yax
  - Long Count: 0.0.12.17.19
  - 13 Moon: moon:3 day:24

## Implementation Notes

- `python_api/engines/maya.py` now adds a `starroot` block containing Dreamspell, traditional Tzolkin, Haab, Long Count, and 13 Moon fields.
- `python_api/renderers/maya_render.py` now shows a Starroot comparison panel inside the Maya result SVG.
- `python_api/tests/test_maya_oracle.py` now includes Starroot crosscheck assertions for the dates above.

## Verification

- `python_api/tests/test_maya_oracle.py`: passed.
- `npm test`: passed, 168 structure checks and 44 Python API endpoint checks.
- Local API restarted at `http://127.0.0.1:8015`; Maya endpoint now returns the new `data.starroot` block.
