# Starroot Celebrity Crosscheck - 2026-04-29

Date checked: 2026-04-29

Reference pages:
- Starroot Mayan Oracle date viewer: https://www.starroot.com/cgi/daycalc.pl
- Steve Jobs birth date source: Britannica and Wikipedia list February 24, 1955.
- Taylor Swift birth date source: Wikipedia lists December 13, 1989.
- Elon Musk birth date source: Britannica and Wikipedia list June 28, 1971.
- Barack Obama birth date source: Wikipedia lists August 4, 1961.
- Beyonce birth date source: Wikipedia/Wikimedia Commons list September 4, 1981.

Notes:
- Starroot's Dreamspell table displays tone + seal name; the app stores the full Dreamspell color + tone + seal label.
- The comparison below checks Kin, Dreamspell, traditional Tzolkin, Haab, Long Count, and 13 Moon.
- These are date-only Maya calculations. Birth time and birth place are not required for this tool.

## Results

| Person | Gregorian date | Starroot / app Kin | App Dreamspell | Starroot Dreamspell table | Tzolkin | Haab | Long Count | 13 Moon |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| Steve Jobs | 1955-02-24 | 162 | Rhythmic White Wind | Rhythmic Wind | 9 Ajaw | 13 Pax | 12.17.1.6.0 | moon:8 day:18 |
| Taylor Swift | 1989-12-13 | 124 | Resonant Yellow Seed | Resonant Seed | 6 Chuwen | 9 Mak | 12.18.16.11.11 | moon:6 day:1 |
| Elon Musk | 1971-06-28 | 146 | Electric White WorldBridger | Electric WorldBridger | 10 Lamat | 16 Sotz' | 12.17.17.16.8 | moon:13 day:2 |
| Barack Obama | 1961-08-04 | 173 | Self-Existing Red Skywalker | Self-Existing Skywalker | 9 B'en | 11 Xul | 12.17.7.15.13 | moon:1 day:10 |
| Beyonce | 1981-09-04 | 224 | Electric Yellow Seed | Electric Seed | 13 Muluk | 7 Mol | 12.18.8.4.9 | moon:2 day:13 |

## Starroot URLs Used

- Steve Jobs: https://www.starroot.com/cgi/daycalc.pl?fday=24&fmonth=2&fyear=1955
- Taylor Swift: https://www.starroot.com/cgi/daycalc.pl?fday=13&fmonth=12&fyear=1989
- Elon Musk: https://www.starroot.com/cgi/daycalc.pl?fday=28&fmonth=6&fyear=1971
- Barack Obama: https://www.starroot.com/cgi/daycalc.pl?fday=4&fmonth=8&fyear=1961
- Beyonce: https://www.starroot.com/cgi/daycalc.pl?fday=4&fmonth=9&fyear=1981

## Verification

- Added regression coverage in `python_api/tests/test_maya_oracle.py`.
- Local Maya engine matched the five Starroot date pages on Kin, Tzolkin, Haab, Long Count, and 13 Moon.
