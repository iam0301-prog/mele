import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const PORT = Number(process.env.MELE_TEST_PORT || 8125);
let baseUrl = `http://127.0.0.1:${PORT}`;
const PYTHON =
  process.env.MELE_PYTHON ||
  resolve(process.platform === 'win32'
    ? 'python_api/venv/Scripts/python.exe'
    : 'python_api/venv/bin/python');

if (!existsSync(PYTHON)) {
  console.error(`Python executable not found: ${PYTHON}`);
  process.exit(1);
}

let passed = 0;
let failed = 0;

function check(name, ok, detail = '') {
  if (ok) {
    passed += 1;
    console.log(`  \x1b[32mOK\x1b[0m ${name}${detail ? ` - ${detail}` : ''}`);
  } else {
    failed += 1;
    console.log(`  \x1b[31mFAIL\x1b[0m ${name}${detail ? ` - ${detail}` : ''}`);
  }
}

async function request(path, payload) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: payload ? 'POST' : 'GET',
    headers: payload ? { 'Content-Type': 'application/json' } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { response, body };
}

async function waitForHealth() {
  for (let i = 0; i < 30; i += 1) {
    try {
      const { response } = await request('/health');
      if (response.ok) return true;
    } catch {
      // Server is still starting.
    }
    await delay(500);
  }
  return false;
}

let server = null;
let stderr = '';

try {
  server = spawn(PYTHON, ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', String(PORT)], {
    cwd: 'python_api',
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });
} catch (error) {
  baseUrl = process.env.MELE_API_URL || 'http://127.0.0.1:8015';
  stderr = `Could not spawn local API (${error.code || error.message}); using existing API at ${baseUrl}.`;
  console.warn(stderr);
}

try {
  console.log('\n=== Python FastAPI endpoint verification ===\n');
  const healthReady = await waitForHealth();
  check('/health is reachable', healthReady);
  if (!healthReady) {
    console.error(stderr);
    process.exit(1);
  }

  const readyCheck = await request('/ready');
  check('/ready is reachable', readyCheck.response.status === 200);
  check('/ready exposes cache status', Boolean(readyCheck.body?.cache?.numerology));
  check('/ready exposes rate limit status', Boolean(readyCheck.body?.rate_limit?.max_requests_per_tool));
  check('/ready default CORS includes Vercel production origin', readyCheck.body?.allowed_origins?.includes('https://mele-chi.vercel.app'));

  const corsReady = await fetch(`${baseUrl}/ready`, {
    headers: { Origin: 'https://mele-chi.vercel.app' },
  });
  check('/ready allows Vercel production origin through CORS', corsReady.headers.get('access-control-allow-origin') === 'https://mele-chi.vercel.app');

  const cases = [
    ['numerology', { year: 1990, month: 5, day: 15 }, (data) => data.lifePath === 3 && data.birthDay === 6],
    ['maya', { year: 1990, month: 5, day: 15 }, (data) => data.kin === 17],
    ['bazi', { year: 1990, month: 5, day: 15, hour: 12, minute: 0 }, (data) => data.pillars?.year?.join('') === '庚午' && Object.values(data.wuxing?.counts || {}).reduce((a, b) => a + b, 0) === 8],
    ['ziwei', { year: 1990, month: 5, day: 15, hour: 12, minute: 0, gender: '男' }, (data) => Array.isArray(data.palaces) && data.palaces.length === 12],
    ['tarot', { count: 3, reversed: true, spread: 'three_card', seed: 42 }, (data) => data.cards?.length === 3],
    ['runes', { count: 3, reversed: true, seed: 42 }, (data) => data.runes?.length === 3],
    ['astro', { year: 1990, month: 5, day: 15, hour: 12, minute: 0, timezone: 8, latitude: 25.033, longitude: 121.5654 }, (data) => Object.keys(data.planets || {}).length >= 10 && data.houses?.length === 12],
    ['humandesign', { year: 1990, month: 5, day: 15, hour: 12, minute: 0, timezone: 8 }, (data) => Boolean(data.type) && data.definedCenters?.length + data.undefinedCenters?.length === 9],
  ];

  for (const [tool, payload, validate] of cases) {
    const { response, body } = await request(`/api/v1/calc/${tool}`, payload);
    check(`${tool} returns HTTP 200`, response.status === 200, response.status !== 200 ? JSON.stringify(body).slice(0, 160) : '');
    if (!response.ok) continue;

    const hasShell = ['tool', 'version', 'computed_at', 'input', 'data', 'render'].every((key) => key in body);
    check(`${tool} has standard response shell`, hasShell);
    check(`${tool} data passes fixed-case check`, validate(body.data));
    check(`${tool} render.svg present`, Boolean(body.render?.svg));
    check(`${tool} render.html present`, Boolean(body.render?.html));
    check(`${tool} render.speech present`, Boolean(body.render?.speech));
    if (tool === 'humandesign') {
      check('humandesign render shows gate nodes', body.render?.svg?.includes('data-gate="64"') && body.render?.svg?.includes('data-gate="1"'));
      check('humandesign render labels full bodygraph system', body.render?.svg?.includes('64閘門 / 36通道 / 9大中心'));
      check('humandesign render includes activated gate details', body.render?.html?.includes('hd-gate-grid'));
      const gateCircles = [...body.render.svg.matchAll(/<g data-gate="\d+"><circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)]
        .map((match) => ({ x: Number(match[1]), y: Number(match[2]), r: Number(match[3]) }));
      let minClearance = Infinity;
      for (let i = 0; i < gateCircles.length; i += 1) {
        for (let j = i + 1; j < gateCircles.length; j += 1) {
          const a = gateCircles[i];
          const b = gateCircles[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          minClearance = Math.min(minClearance, distance - a.r - b.r);
        }
      }
      check('humandesign gate circles avoid visual overlap', minClearance >= 2.4, `min clearance ${minClearance.toFixed(1)}px`);
    }
  }

  const friendlyPayloadCases = [
    ['numerology', { birth_date: '1990-05-15' }],
    ['maya', { birth_date: '1990-05-15' }],
    ['bazi', { birth_date: '1990-05-15', birth_time: '12:00' }],
    ['ziwei', { birth_date: '1990-05-15', birth_time: '12:00', gender: '男' }],
    ['astro', { birth_date: '1990-05-15', birth_time: '12:00', timezone: 'Asia/Taipei', latitude: 25.033, longitude: 121.5654 }],
    ['humandesign', { birth_date: '1990-05-15', birth_time: '12:00', timezone: 'Asia/Taipei' }],
  ];

  for (const [tool, payload] of friendlyPayloadCases) {
    const { response, body } = await request(`/api/v1/calc/${tool}`, payload);
    check(`${tool} accepts birth_date/birth_time payload`, response.status === 200, response.status !== 200 ? JSON.stringify(body).slice(0, 160) : '');
  }

  console.log('\n============================');
  console.log(`Python API verification: \x1b[32m${passed} passed\x1b[0m / \x1b[31m${failed} failed\x1b[0m`);
  process.exit(failed > 0 ? 1 : 0);
} finally {
  if (server) server.kill();
}
