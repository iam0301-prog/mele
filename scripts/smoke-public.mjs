const siteArg = process.argv[2] || process.env.MELE_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const apiArg = process.argv[3] || process.env.MELE_PUBLIC_API_URL;

const requiredPaths = [
  '/',
  '/zh-TW',
  '/en',
  '/vi',
  '/id',
  '/ja',
  '/ko',
  '/zh-TW/account/login',
  '/zh-TW/daily',
  '/zh-TW/tools',
  '/zh-TW/tools/tarot',
  '/zh-TW/tools/maya',
  '/zh-TW/tools/bazi',
  '/zh-TW/tools/humandesign',
  '/zh-TW/teachers',
  '/zh-TW/teachers/apply',
  '/teacher-portal',
  '/admin/launch',
  '/manifest.json',
  '/sitemap.xml',
  '/robots.txt',
  '/favicon.ico',
];

let passed = 0;
let failed = 0;

function usage() {
  console.error('Usage: npm run ops:smoke:public -- https://your-web-url.com [https://your-api-url.com]');
  console.error('Or set MELE_PUBLIC_SITE_URL and optional MELE_PUBLIC_API_URL.');
}

function normalizeUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return null;
  }
}

function ok(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`OK   ${name}${detail ? ` - ${detail}` : ''}`);
    return;
  }
  failed += 1;
  console.log(`FAIL ${name}${detail ? ` - ${detail}` : ''}`);
}

async function readResponse(url, init) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    return { response, text };
  } finally {
    clearTimeout(timer);
  }
}

const siteUrl = normalizeUrl(siteArg);
const apiUrl = normalizeUrl(apiArg);

if (!siteUrl) {
  usage();
  process.exit(1);
}

console.log(`\n=== MELE public smoke test: ${siteUrl} ===\n`);

for (const path of requiredPaths) {
  try {
    const { response, text } = await readResponse(`${siteUrl}${path}`);
    const expectedStatus = path === '/' ? [200, 307, 308] : [200];
    ok(`${path} returns expected status`, expectedStatus.includes(response.status), `HTTP ${response.status}`);
    if (response.ok && path.endsWith('.json')) {
      ok(`${path} returns JSON-ish body`, text.trim().startsWith('{') || text.trim().startsWith('['));
    }
    if (response.ok && path === '/zh-TW') {
      ok('/zh-TW renders the MELE brand', text.includes('MELE'));
      ok('/zh-TW does not expose the retired Sea Star wording', !text.includes('海底之星') && !text.includes('Sea Star'));
    }
  } catch (error) {
    ok(`${path} is reachable`, false, error.message);
  }
}

try {
  const { response, text } = await readResponse(`${siteUrl}/api/calc/numerology`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ year: 1990, month: 5, day: 15 }),
  });
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    // Body details are reported below.
  }
  ok('Next.js /api/calc proxy returns numerology', response.status === 200 && body?.tool === 'numerology', `HTTP ${response.status}`);
  ok('Numerology proxy returns render payload', Boolean(body?.render?.svg || body?.render?.html));
} catch (error) {
  ok('Next.js /api/calc proxy is reachable', false, error.message);
}

if (apiUrl) {
  try {
    const { response, text } = await readResponse(`${apiUrl}/ready`, {
      headers: { Origin: siteUrl },
    });
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      // Body details are reported below.
    }
    ok('Python API /ready returns 200', response.status === 200, `HTTP ${response.status}`);
    ok('Python API allows the web origin through CORS', response.headers.get('access-control-allow-origin') === siteUrl);
    ok('Python API exposes rate-limit readiness', Boolean(body?.rate_limit?.max_requests_per_tool));
  } catch (error) {
    ok('Python API /ready is reachable', false, error.message);
  }
}

console.log('\n============================');
console.log(`Public smoke test: ${passed} passed / ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
