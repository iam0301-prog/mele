// Smoke test: verify all installed libraries can be imported and used
console.log('=== Smoke Test for Mele Libraries ===\n');

// 1. lunar-javascript (BaZi + lunar conversion)
try {
  const { Solar } = await import('lunar-javascript');
  const solar = Solar.fromYmdHms(1955, 2, 24, 19, 15, 0);
  const lunar = solar.getLunar();
  const bazi = lunar.getEightChar();
  console.log('[OK] lunar-javascript:');
  console.log('  Steve Jobs 1955-02-24 19:15');
  console.log('  Year:', bazi.getYear());
  console.log('  Month:', bazi.getMonth());
  console.log('  Day:', bazi.getDay());
  console.log('  Hour:', bazi.getTime());
} catch (e) {
  console.log('[FAIL] lunar-javascript:', e.message);
}

console.log();

// 2. iztro (Ziwei Doushu)
try {
  const { astro } = await import('iztro');
  const astrolabe = astro.bySolar('1955-2-24', 7, '男', true, 'zh-TW');
  console.log('[OK] iztro:');
  console.log('  Solar date:', astrolabe.solarDate);
  console.log('  Lunar date:', astrolabe.lunarDate);
  console.log('  Soul:', astrolabe.soul);
  console.log('  Body:', astrolabe.body);
} catch (e) {
  console.log('[FAIL] iztro:', e.message);
}

console.log();

// 3. astronomia (pure JS astronomy)
try {
  const julian = await import('astronomia/julian');
  const jd = julian.CalendarGregorianToJD(1955, 2, 24);
  console.log('[OK] astronomia:');
  console.log('  Julian Day for 1955-02-24:', jd);
} catch (e) {
  console.log('[FAIL] astronomia:', e.message);
}

console.log();

// 4. sweph (Swiss Ephemeris)
try {
  const sweph = (await import('sweph')).default;
  const jd = sweph.julday(1955, 2, 24, 19.25, sweph.constants.SE_GREG_CAL);
  console.log('[OK] sweph:');
  console.log('  Julian Day UT:', jd);
  // Try to get sun position with Moshier (no data files needed)
  const flags = sweph.constants.SEFLG_MOSEPH;
  const result = sweph.calc_ut(jd, sweph.constants.SE_SUN, flags);
  console.log('  Sun longitude:', result.data[0].toFixed(4), 'deg');
  console.log('  (Expected ~ 335 deg = Pisces for late Feb)');
} catch (e) {
  console.log('[FAIL] sweph:', e.message);
}

console.log();

// 5. tz-lookup
try {
  const tzlookup = (await import('tz-lookup')).default;
  const tz = tzlookup(25.0330, 121.5654); // Taipei
  console.log('[OK] tz-lookup:');
  console.log('  Taipei timezone:', tz);
} catch (e) {
  console.log('[FAIL] tz-lookup:', e.message);
}

console.log();

// 6. @supabase/supabase-js (just import, no connection)
try {
  const { createClient } = await import('@supabase/supabase-js');
  console.log('[OK] @supabase/supabase-js: createClient available');
} catch (e) {
  console.log('[FAIL] @supabase/supabase-js:', e.message);
}

console.log('\n=== Done ===');
