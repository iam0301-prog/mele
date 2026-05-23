import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE_PATH = resolve(ROOT, 'tests/fixtures/reference-crosschecks.json');
const OUT_DIR = resolve(ROOT, '.tmp/reference-crosschecks');
const REPORT_DIR = resolve(ROOT, 'tests/reports');
const MELE_API_URL = process.env.MELE_API_URL || 'http://127.0.0.1:8015';

const STARROOT_URL = 'https://www.starroot.com/cgi/daycalc.pl';
const SUANMING_ZIWEI_URL = 'https://www.suanming.com.tw/tool/ziwei';
const HUMAN_DESIGN_ASIA_URL = 'https://humandesignasia.org/get-your-chart/';

const ZIWEI_MAIN_STARS = [
  '紫微',
  '天機',
  '太陽',
  '武曲',
  '天同',
  '廉貞',
  '天府',
  '太陰',
  '貪狼',
  '巨門',
  '天相',
  '天梁',
  '七殺',
  '破軍',
];

function assertOk(condition, message) {
  if (!condition) throw new Error(message);
}

function splitDate(date) {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day };
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchText(url, init) {
  const response = await fetch(url, {
    ...init,
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 MELE reference crosscheck',
      ...(init?.headers || {}),
    },
  });
  const text = await response.text();
  assertOk(response.ok, `Fetch failed ${response.status} for ${url}`);
  return text;
}

async function meleCalc(tool, payload) {
  const response = await fetch(`${MELE_API_URL}/api/v1/calc/${tool}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  assertOk(response.ok, `MELE ${tool} failed ${response.status}: ${JSON.stringify(body).slice(0, 300)}`);
  return body.data;
}

function normalizeDreamspell(value) {
  return String(value || '')
    .replace(/\b(Red|White|Blue|Yellow)\b/g, '')
    .replace(/\bWorld-Bridger\b/gi, 'WorldBridger')
    .replace(/\bWorld\s+Bridger\b/gi, 'WorldBridger')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function localDateStamp() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function parseStarroot(html) {
  const kinMatch = html.match(/\bKin\s+(\d+)\b/i);
  const sealTitle = html.match(/<img\s+name="seal"[\s\S]*?title="([^"]+)"/i);
  const toneSealMatch = sealTitle?.[1]?.match(/Tone\s+(\d+)\s+([A-Za-z-]+)[\s\S]*?-\s*-\s*([^()]+?)\s*\(/);
  const tzolkinMatch = html.match(/<b>\s*(\d+)\s*<br>\s*([A-Za-z']+)\s*<br>\s*<\/b>/i);
  const haabMatch = html.match(/<b>\s*(\d+)\s*<br>\s*([A-Za-z']+)\s*<\/b>\s*<br>\s*<font/i);
  const longCountMatch = html.match(/<i>Long Count<\/i>\s*<b>([^<]+)<\/b>/i);
  const moonMatch = html.match(/13 Moon Calendar(?:<\/i>)?[:\s]*<\/?[^>]*>*\s*<b>?([^<"]*moon:\d+\s+day:\d+)/i);

  return {
    kin: kinMatch ? Number(kinMatch[1]) : null,
    dreamspell: toneSealMatch ? `${toneSealMatch[2]} ${toneSealMatch[3]}`.replace(/\s+/g, ' ') : null,
    tzolkin: tzolkinMatch ? `${tzolkinMatch[1]} ${tzolkinMatch[2]}` : null,
    haab: haabMatch ? `${haabMatch[1]} ${haabMatch[2]}` : null,
    longCount: longCountMatch?.[1]?.trim() || null,
    moon: moonMatch?.[1]?.trim().replace(/\s+/g, ' ') || null,
  };
}

async function checkMayaCase(testCase) {
  const { year, month, day } = splitDate(testCase.date);
  const remoteUrl = `${STARROOT_URL}?fday=${day}&fmonth=${month}&fyear=${year}`;
  const [remoteHtml, local] = await Promise.all([
    fetchText(remoteUrl),
    meleCalc('maya', { year, month, day }),
  ]);
  const remote = parseStarroot(remoteHtml);
  const localComparable = {
    kin: local.kin,
    dreamspell: local.starroot?.dreamspell?.label,
    tzolkin: local.starroot?.classicTzolkin?.label,
    haab: local.starroot?.haab?.label,
    longCount: local.starroot?.longCount?.starrootLabel || local.starroot?.longCount?.label,
    moon: local.starroot?.thirteenMoon?.label,
  };
  const checks = {
    kin: remote.kin === localComparable.kin,
    dreamspell: normalizeDreamspell(remote.dreamspell) === normalizeDreamspell(localComparable.dreamspell),
    tzolkin: remote.tzolkin === localComparable.tzolkin,
    haab: remote.haab === localComparable.haab,
    longCount: remote.longCount === localComparable.longCount,
    moon: remote.moon === localComparable.moon,
  };
  return {
    ...testCase,
    source: remoteUrl,
    ok: Object.values(checks).every(Boolean),
    checks,
    remote,
    local: localComparable,
  };
}

function parseSuanmingZiwei(html) {
  const text = stripHtml(html);
  const infoMatch = text.match(/命主\s*:\s*(\S+)\s+身主\s*:\s*(\S+)\s+([金木水火土][一二三四五六七八九十]+局)/);
  const palaceBlocks = html.split(/<div class="gong"/i);
  const mingBlock = palaceBlocks.find((block) => block.includes('命宫') || block.includes('命宮')) || '';
  const mingText = stripHtml(mingBlock);
  const stemBranch = mingText.match(/([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/u)?.[1] || null;
  const majorStars = ZIWEI_MAIN_STARS.filter((star) => new RegExp(`<span class="xingA">${star}</span>`).test(mingBlock));

  return {
    soul: infoMatch?.[1] || null,
    body: infoMatch?.[2] || null,
    fiveElementsClass: infoMatch?.[3] || null,
    mingStemBranch: stemBranch,
    mingMajor: majorStars,
  };
}

async function checkZiweiCase(testCase) {
  const { year, month, day } = splitDate(testCase.date);
  const sex = testCase.gender === 'female' ? '0' : '1';
  const gender = testCase.gender === 'female' ? '女' : '男';
  const form = new URLSearchParams({
    sex,
    date_type: '1',
    year: String(year),
    month: String(month),
    day: String(day),
    hour: String(testCase.hour),
  });

  const [remoteHtml, local] = await Promise.all([
    fetchText(SUANMING_ZIWEI_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form,
    }),
    meleCalc('ziwei', { year, month, day, hour: testCase.hour, minute: testCase.minute || 0, gender }),
  ]);
  const remote = parseSuanmingZiwei(remoteHtml);
  const localComparable = {
    fiveElementsClass: local.fiveElementsClass,
    soul: local.soul,
    body: local.body,
    mingStemBranch: `${local.mingGong?.heavenlyStem || ''}${local.mingGong?.earthlyBranch || ''}`,
    mingMajor: local.mingGong?.majorStarNames || [],
  };
  const checks = {
    fiveElementsClass: remote.fiveElementsClass === localComparable.fiveElementsClass,
    soul: remote.soul === localComparable.soul,
    body: remote.body === localComparable.body,
    mingStemBranch: remote.mingStemBranch === localComparable.mingStemBranch,
    mingMajor: remote.mingMajor.join('|') === localComparable.mingMajor.join('|'),
  };
  return {
    ...testCase,
    source: SUANMING_ZIWEI_URL,
    ok: Object.values(checks).every(Boolean),
    checks,
    remote,
    local: localComparable,
  };
}

async function probeHumanDesignAsia() {
  const html = await fetchText(HUMAN_DESIGN_ASIA_URL);
  const requiredFields = [
    'chart_name',
    'chart_year',
    'chart_month',
    'chart_day',
    'chart_hour',
    'chart_minute',
    'chart_country',
    'chart_city',
  ];
  return {
    source: HUMAN_DESIGN_ASIA_URL,
    formDetected: html.includes('id="chart_form"'),
    turnstileDetected: html.includes('cf-turnstile') || html.includes('turnstile'),
    requiredFields: Object.fromEntries(requiredFields.map((field) => [field, html.includes(`name="${field}"`)])),
    status: html.includes('cf-turnstile') || html.includes('turnstile') ? 'manual_fixture_required' : 'automatable',
  };
}

function passCount(items) {
  return `${items.filter((item) => item.ok).length} / ${items.length}`;
}

function mdRow(cells) {
  return `| ${cells.map((cell) => String(cell ?? '').replace(/\|/g, '/')).join(' | ')} |`;
}

function buildReport(result) {
  const lines = [];
  lines.push(`# 官方參考站交叉比對報告 - ${result.date}`);
  lines.push('');
  lines.push('本報告使用公開人物資料，逐筆比對 MELE API 與使用者指定參考站。');
  lines.push('');
  lines.push('## 總覽');
  lines.push('');
  lines.push('| 項目 | 參考站 | 結果 | 備註 |');
  lines.push('|---|---|---:|---|');
  lines.push(mdRow(['瑪雅曆', STARROOT_URL, passCount(result.maya), '自動抓取 Starroot HTML 並比對 Kin / Tzolkin / Haab / Long Count / 13 Moon']));
  lines.push(mdRow(['紫微斗數', SUANMING_ZIWEI_URL, passCount(result.ziwei), '自動 POST 表單並比對命主 / 身主 / 五行局 / 命宮 / 主星']));
  lines.push(mdRow(['人類圖', HUMAN_DESIGN_ASIA_URL, result.humandesign.status, '偵測到 Turnstile 時不自動送出，需人工截圖建立基準']));
  lines.push('');
  lines.push('## 瑪雅曆 / Starroot');
  lines.push('');
  lines.push('| 人物 | 日期 | Kin | Dreamspell | Tzolkin | Haab | Long Count | 13 Moon | 結果 |');
  lines.push('|---|---|---:|---|---|---|---|---|---|');
  for (const item of result.maya) {
    lines.push(mdRow([item.name, item.date, item.local.kin, item.local.dreamspell, item.local.tzolkin, item.local.haab, item.local.longCount, item.local.moon, item.ok ? 'PASS' : 'FAIL']));
  }
  lines.push('');
  lines.push('## 紫微斗數 / 算命網');
  lines.push('');
  lines.push('| 人物 | 日期時間 | 五行局 | 命主 | 身主 | 命宮 | 命宮主星 | 結果 |');
  lines.push('|---|---|---|---|---|---|---|---|');
  for (const item of result.ziwei) {
    lines.push(mdRow([
      item.name,
      `${item.date} ${String(item.hour).padStart(2, '0')}:00`,
      item.local.fiveElementsClass,
      item.local.soul,
      item.local.body,
      item.local.mingStemBranch,
      item.local.mingMajor.join('、') || '無十四主星',
      item.ok ? 'PASS' : 'FAIL',
    ]));
  }
  lines.push('');
  lines.push('## 人類圖 / Human Design Asia');
  lines.push('');
  lines.push(`- 表單偵測：${result.humandesign.formDetected ? '有' : '無'}`);
  lines.push(`- Turnstile / 人機驗證：${result.humandesign.turnstileDetected ? '有，不能自動提交' : '未偵測到'}`);
  lines.push(`- 建議：請人工建立 10 組 Human Design Asia 截圖 fixture，再比對 Type、Strategy、Authority、Profile、Centers、Gates。`);
  lines.push('');
  lines.push('## 原始 JSON');
  lines.push('');
  lines.push(`- ${result.jsonPath}`);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function main() {
  const fixture = JSON.parse(await readFile(FIXTURE_PATH, 'utf8'));
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(REPORT_DIR, { recursive: true });

  const maya = [];
  for (const testCase of fixture.maya) {
    maya.push(await checkMayaCase(testCase));
  }

  const ziwei = [];
  for (const testCase of fixture.ziwei) {
    ziwei.push(await checkZiweiCase(testCase));
  }

  const humandesign = await probeHumanDesignAsia();
  const date = localDateStamp();
  const jsonPath = resolve(OUT_DIR, `reference-crosscheck-${date}.json`).replace(/\\/g, '/');
  const result = { date, generatedAt: new Date().toISOString(), sources: { STARROOT_URL, SUANMING_ZIWEI_URL, HUMAN_DESIGN_ASIA_URL }, maya, ziwei, humandesign, jsonPath };
  await writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  const report = buildReport(result);
  const reportPath = resolve(REPORT_DIR, `22-reference-crosscheck-${date}.md`);
  await writeFile(reportPath, report, 'utf8');

  const ok = [...maya, ...ziwei].every((item) => item.ok);
  console.log(`Maya: ${passCount(maya)}`);
  console.log(`Ziwei: ${passCount(ziwei)}`);
  console.log(`Human Design Asia: ${humandesign.status}`);
  console.log(`Report: ${reportPath}`);
  if (!ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
