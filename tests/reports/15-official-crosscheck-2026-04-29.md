# Official / Authoritative Cross-Check Report

Date: 2026-04-29

## Sources Used

- Hong Kong Observatory, 2024 almanac and 24 solar terms pages:
  - https://www.hko.gov.hk/en/gts/astronomy/Solar_Term.htm
  - https://www.hko.gov.hk/tc/gts/astron2024/files/2024SolarTerms24.pdf
  - Solar terms are defined by solar longitude at 15-degree intervals.
  - 2024 major solar-term times are published in Hong Kong Time.
- HKO notes that its solar-term astronomical data is based on HM Nautical Almanac Office and United States Naval Observatory data.
- NASA/JPL Horizons documentation confirms Horizons is the official JPL API surface for solar-system ephemerides:
  - https://ssd.jpl.nasa.gov/horizons/
- PyPI `lunar_python` 1.4.8 confirms the package is a Solar/Chinese Lunar calendar library, released 2025-11-05:
  - https://pypi.org/project/lunar-python/
- iztro.com documents the Zi Wei Dou Shu library used by the helper process and its multilingual output support:
  - https://docs.iztro.com/
- U.S. Games Systems states Rider-Waite is a 78-card tarot deck, originally published in 1909:
  - https://www.usgamesinc.com/Tarot_and_Inspiration/rider-waite-tarot-card-deck.html
- Unicode Runic chart confirms the official Runic block range is U+16A0 to U+16FF:
  - https://www.unicode.org/charts/PDF/U16A0.pdf

## Cross-Checks Performed

| Feature | External reference | Local result | Status |
|---|---|---:|---|
| Astrology / solar longitude | HKO 2024 solar terms: 春分 0°, 夏至 90°, 秋分 180°, 冬至 270°, 立春 315° | Max absolute difference: 0.0003° | PASS |
| BaZi year boundary | HKO: 2024 立春 occurs 2024-02-04 16:27 HKT at solar longitude 315° | 2024-02-04 16:00 => 癸卯, 17:00 => 甲辰 | PASS |
| BaZi dependency | PyPI `lunar_python` 1.4.8 is the current library package for Solar/Chinese Lunar calculations | Added `lunar-python==1.4.8` to Python requirements | PASS |
| Zi Wei | iztro official documentation describes the astrolabe library and Traditional Chinese output support | Endpoint returns 12 palaces and localized output | PASS |
| Tarot | U.S. Games Systems describes Rider-Waite as a 78-card deck | Local deck count: 78 | PASS |
| Runes | Unicode Runic block U+16A0-U+16FF contains the runic characters used for display | Local Elder Futhark set count: 24, glyphs in Unicode Runic block | PASS |
| Numerology | No single governing official source exists; checked deterministic Pythagorean digit-reduction rules in local golden tests | 1990-05-15 life path: 3 | PASS with source limitation |
| Maya Dreamspell | No public standards body / official machine-readable data found for all Kin mappings; checked documented local anchors and 260-day cycle properties | 1987-07-26 Kin 34, 2012-12-21 Kin 207 | PASS with source limitation |
| Human Design | No open official machine-readable authority table found; checked structural invariants from the system model | 64 gates, 9 centers, 26 activations model | PASS with source limitation |

## Exact HKO Solar-Term Comparison

| HKO event | HKO longitude | API Sun longitude | Difference |
|---|---:|---:|---:|
| 2024-02-04 16:27 HKT 立春 | 315° | 314.9999° | 0.0001° |
| 2024-03-20 11:06 HKT 春分 | 0° | 359.9997° | 0.0003° |
| 2024-06-21 04:51 HKT 夏至 | 90° | 90.0000° | 0.0000° |
| 2024-09-22 20:44 HKT 秋分 | 180° | 180.0002° | 0.0002° |
| 2024-12-21 17:21 HKT 冬至 | 270° | 270.0003° | 0.0003° |

## Notes

- Tarot, numerology, Dreamspell, runes, and Human Design are tradition/system datasets rather than government-standard datasets. Where there is no official machine-readable source, I used publisher/library/standards-body references plus deterministic invariants.
- The strongest external numerical validation is the astronomy/solar-term check, because it compares against HKO almanac values derived from HM Nautical Almanac Office and United States Naval Observatory data.
