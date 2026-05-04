// 對本機 server 跑 HTTP 掃描，找：
// 1) 404 (連結 / 資源)
// 2) HTML 結構錯誤（未閉合 tag）
// 3) script src / module import 是否能解析
// 4) 內部超連結是否指向存在的檔案

import { existsSync, readFileSync } from 'fs';
import { join, dirname, resolve } from 'path';

const BASE = 'http://localhost:8765';
const ROOT = '/tmp/melesite/web';

let issues = [];
const issue = (severity, page, msg) => {
  issues.push({ severity, page, msg });
  const c = severity === 'ERR' ? '\x1b[31m' : severity === 'WARN' ? '\x1b[33m' : '\x1b[36m';
  console.log(`  ${c}[${severity}]\x1b[0m ${page}: ${msg}`);
};

const PAGES = [
  '/',
  '/tools/numerology.html', '/tools/maya.html', '/tools/bazi.html',
  '/tools/tarot.html', '/tools/runes.html', '/tools/astro.html',
  '/tools/ziwei.html', '/tools/humandesign.html',
  '/account/login.html', '/account/book.html', '/account/mybookings.html',
  '/teachers/', '/teachers/index.html', '/teachers/detail.html', '/teachers/apply.html',
  '/teacher-portal/', '/admin/',
  '/legal/privacy.html', '/legal/tos.html',
];

async function fetchHttp(path) {
  const r = await fetch(BASE + path);
  return { status: r.status, body: await r.text() };
}

console.log('\n=== 1. 所有頁面 HTTP 狀態 ===\n');
for (const p of PAGES) {
  const { status, body } = await fetchHttp(p);
  if (status !== 200 && status !== 301 && status !== 302) {
    issue('ERR', p, `HTTP ${status}`);
  } else {
    console.log(`  \x1b[32m${status}\x1b[0m ${p} (${body.length} bytes)`);
  }
}

console.log('\n=== 2. HTML 結構基本檢查 ===\n');
for (const p of PAGES) {
  if (!p.endsWith('.html') && p !== '/' && !p.endsWith('/')) continue;
  const { status, body } = await fetchHttp(p);
  if (status !== 200) continue;

  // 基本標籤平衡
  const opens = (body.match(/<div\b/g) || []).length;
  const closes = (body.match(/<\/div>/g) || []).length;
  if (Math.abs(opens - closes) > 0) issue('WARN', p, `<div> 開合不平衡: open ${opens} / close ${closes}`);

  // script tag 存在
  if (body.includes('<script') && !body.includes('</script>')) issue('ERR', p, 'script 未閉合');

  // doctype
  if (!/<!DOCTYPE\s+html/i.test(body) && (p.endsWith('.html') || p === '/')) issue('WARN', p, '缺 DOCTYPE');

  // viewport
  if (!body.includes('viewport')) issue('WARN', p, '缺 viewport meta');

  // 中文 charset
  if (body.includes('zh-TW') && !body.includes('UTF-8')) issue('WARN', p, '中文頁面缺 UTF-8');
}

console.log('\n=== 3. 連結與資源解析 ===\n');
for (const p of PAGES) {
  if (!p.endsWith('.html') && !p.endsWith('/') && p !== '/') continue;
  const { status, body } = await fetchHttp(p);
  if (status !== 200) continue;

  // 抓所有 href / src（排除外部 https 與 # 錨點）
  const refs = new Set();
  for (const m of body.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (u.startsWith('http') || u.startsWith('#') || u.startsWith('mailto:') || u.startsWith('javascript:') || u.startsWith('data:')) continue;
    refs.add(u);
  }
  // import statements
  for (const m of body.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    const u = m[1];
    if (u.startsWith('http')) continue;
    refs.add(u);
  }

  for (const u of refs) {
    // 把 ?query 與 #frag 拿掉
    const path = u.split('?')[0].split('#')[0];
    if (!path) continue;
    // 解析相對路徑
    const pageDir = p.endsWith('/') ? p : dirname(p) + '/';
    let resolvedUrl;
    if (path.startsWith('/')) resolvedUrl = path;
    else resolvedUrl = resolve(pageDir, path).replace(/^\\/, '/');

    // fetch 試試
    try {
      const r = await fetch(BASE + resolvedUrl, { method: 'HEAD' });
      if (r.status >= 400) issue('ERR', p, `${u} → HTTP ${r.status}`);
    } catch (e) {
      issue('ERR', p, `${u} → ${e.message}`);
    }
  }
}

console.log('\n=== 4. 計算函式 import 路徑檢查 ===\n');
const TOOL_PAGES = ['numerology', 'maya', 'bazi', 'tarot', 'runes', 'astro', 'ziwei', 'humandesign'];
for (const t of TOOL_PAGES) {
  const file = join(ROOT, 'tools', `${t}.html`);
  if (!existsSync(file)) { issue('ERR', t, '檔案不存在'); continue; }
  const html = readFileSync(file, 'utf-8');
  if (!html.includes(`packages/calc/src/${t}.js`)) {
    issue('WARN', `tools/${t}.html`, `缺對 packages/calc/src/${t}.js 的 import`);
  }
}

// 統計
console.log('\n============================');
const errs = issues.filter(i => i.severity === 'ERR').length;
const warns = issues.filter(i => i.severity === 'WARN').length;
console.log(`Server 掃描：\x1b[31m${errs} 個錯誤\x1b[0m / \x1b[33m${warns} 個警告\x1b[0m`);
console.log('============================\n');
process.exit(errs > 0 ? 1 : 0);
