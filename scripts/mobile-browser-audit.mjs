import { existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const webRequire = createRequire(new URL('../apps/web/package.json', import.meta.url));

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = webRequire('playwright'));
}

const baseUrl = process.env.MELE_AUDIT_BASE_URL || 'http://127.0.0.1:3006';
const outDir = process.env.MELE_AUDIT_OUT_DIR || 'D:/mele/.tmp';
const routes = [
  '/mobile',
  '/daily',
  '/teachers',
  '/tools/tarot',
  '/tools/runes',
  '/tools/humandesign',
  '/teacher-portal?demo=1',
];
const chromeCandidates = [
  process.env.MELE_CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function routeName(route, prefix = 'load') {
  const name =
    route === '/'
      ? 'home'
      : route
          .replace(/[^a-z0-9]+/gi, '-')
          .replace(/^-+|-+$/g, '');
  return `audit-mobile-${prefix}-${name || 'home'}.png`;
}

function findBrowser() {
  return chromeCandidates.find((candidate) => existsSync(candidate));
}

function isIgnorableLocalRscNoise(text) {
  if (!baseUrl.includes('127.0.0.1:3006') && !baseUrl.includes('localhost:3006')) return false;
  if (
    text.includes('http://localhost:3006/zh-TW') &&
    text.includes('http://127.0.0.1:3006/?_rsc=')
  ) {
    return true;
  }
  if (text.includes('Failed to fetch RSC payload for http://127.0.0.1:3006/.')) return true;
  if (text.trim() === 'Failed to load resource: net::ERR_FAILED') return true;
  return false;
}

async function measure(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const scrollWidth = Math.max(root.scrollWidth, body?.scrollWidth || 0);
    const clientWidth = Math.max(root.clientWidth, body?.clientWidth || 0);
    const text = body?.innerText || '';
    const bodyFont = body ? window.getComputedStyle(body).fontFamily : '';

    return {
      path: location.pathname + location.search + location.hash,
      textLength: text.length,
      styleSheetCount: document.styleSheets.length,
      bodyFont,
      rawLooking: bodyFont.includes('Times New Roman') || bodyFont.trim().toLowerCase() === 'serif',
      appError: text.includes('Application error'),
      nextError: text.includes('__next_error__'),
      scrollWidth,
      clientWidth,
      horizontalOverflow: scrollWidth > clientWidth + 4,
      nativeDateInputs: document.querySelectorAll('input[type="date"]').length,
      nativeTimeInputs: document.querySelectorAll('input[type="time"]').length,
      birthSelects: document.querySelectorAll('.birth-inputs__select').length,
      hasReadingStage: Boolean(
        document.querySelector('#reading-ar-stage, .tool-result, .tool-result-section, .reading-result, .oracle-result-stage'),
      ),
      hasMemberResonance:
        Boolean(document.querySelector('.member-resonance')) &&
        document.querySelectorAll('.member-resonance__grid article').length >= 3,
      hasBeginnerGuide:
        Boolean(document.querySelector('.beginner-guide')) &&
        document.querySelectorAll('.beginner-guide__item').length >= 3,
      hasActionPath: Boolean(document.querySelector('.member-action-path')),
      hasTeacherWorkbench: Boolean(document.querySelector('.teacher-workbench')),
      teacherSourceButtons: document.querySelectorAll('.teacher-workbench__rail button').length,
      teacherActionButtons: document.querySelectorAll('.teacher-workbench__actions button').length,
      visibleAlerts: Array.from(document.querySelectorAll('[role="alert"], .tool-error, .mele-error'))
        .map((node) => node.textContent?.trim())
        .filter(Boolean)
        .slice(0, 3),
    };
  });
}

async function clickIfPresent(locator, timeout = 5000) {
  if ((await locator.count()) === 0) return false;
  await locator.first().click({ timeout });
  await wait(300);
  return true;
}

async function gotoStable(page, route) {
  if (page.url() !== 'about:blank') {
    await page.goto('about:blank', { waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {});
    await wait(250);
  }
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await wait(900);
}

async function snapshot(page, route, prefix) {
  const metrics = await measure(page);
  await page.screenshot({ path: join(outDir, routeName(route, prefix)), fullPage: true });
  return metrics;
}

async function loadRoute(page, route, errors) {
  await gotoStable(page, route);
  return {
    route,
    phase: 'load',
    ...(await snapshot(page, route, 'load')),
    pageErrors: errors.splice(0),
  };
}

async function submitTextTool(page, route, visualSelector, visualIndex, errors) {
  await gotoStable(page, route);

  const textareas = page.locator('textarea');
  if ((await textareas.count()) > 0) {
    await textareas.first().fill('clarity for the next three months', { timeout: 10000 });
  }

  if (visualSelector) {
    const options = page.locator(visualSelector);
    const count = await options.count();
    if (count > visualIndex) {
      await options.nth(visualIndex).click({ timeout: 10000 });
      await wait(500);
    }
  }

  const submits = page.locator('button[type="submit"], .mele-btn-primary');
  const submitCount = await submits.count();
  if (submitCount > 0) {
    await submits.first().click({ timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await wait(9000);
  }

  return {
    route,
    phase: 'submit',
    submitted: submitCount > 0,
    ...(await snapshot(page, route, 'submit')),
    pageErrors: errors.splice(0),
  };
}

async function submitHumanDesign(page, errors) {
  const route = '/tools/humandesign';
  await gotoStable(page, route);

  const selects = page.locator('.birth-inputs__select');
  const selectCount = await selects.count();
  if (selectCount >= 5) {
    await selects.nth(0).selectOption('1996');
    await selects.nth(1).selectOption('3');
    await selects.nth(2).selectOption('1');
    await selects.nth(3).selectOption('19');
    await selects.nth(4).selectOption('23');
  }

  const submits = page.locator('button[type="submit"], .mele-btn-primary');
  const submitCount = await submits.count();
  if (submitCount > 0) {
    await submits.first().click({ timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await wait(11000);
  }

  return {
    route,
    phase: 'submit',
    submitted: submitCount > 0,
    selectCount,
    ...(await snapshot(page, route, 'submit')),
    pageErrors: errors.splice(0),
  };
}

async function clickTeacherPortal(page, errors) {
  const route = '/teacher-portal?demo=1';
  await gotoStable(page, route);

  const headerMenu = page.locator('header button').first();
  const openedMenu = await clickIfPresent(headerMenu);
  let closedMenu = false;
  if (openedMenu) {
    closedMenu = await clickIfPresent(headerMenu);
  }

  const sourceButtons = page.locator('.teacher-workbench__rail button');
  const sourceCount = await sourceButtons.count();
  let clickedSources = 0;
  for (let index = 0; index < sourceCount; index += 1) {
    await sourceButtons.nth(index).click({ timeout: 8000 });
    clickedSources += 1;
    await wait(120);
  }

  const actionButtons = page.locator('.teacher-workbench__actions button');
  const actionCount = await actionButtons.count();
  let clickedActions = 0;
  for (let index = 0; index < actionCount; index += 1) {
    await actionButtons.nth(index).click({ timeout: 8000 });
    clickedActions += 1;
    await wait(120);
  }

  return {
    route,
    phase: 'teacher-click',
    openedMenu,
    closedMenu,
    clickedSources,
    clickedActions,
    ...(await snapshot(page, route, 'teacher-click')),
    pageErrors: errors.splice(0),
  };
}

function summarize(results) {
  return results.map((result) => {
    const baseOk =
      !result.appError &&
      !result.nextError &&
      !result.horizontalOverflow &&
      !result.rawLooking &&
      result.styleSheetCount > 0 &&
      result.pageErrors.length === 0;
    const submitOk =
      result.phase !== 'submit' ||
      (result.submitted && result.hasReadingStage && result.hasMemberResonance && result.hasBeginnerGuide && result.hasActionPath);
    const teacherOk =
      result.phase !== 'teacher-click' ||
      (result.hasTeacherWorkbench &&
        result.clickedSources >= 8 &&
        result.clickedActions >= 2 &&
        result.openedMenu &&
        result.closedMenu);

    return {
      route: result.route,
      phase: result.phase,
      ok: baseOk && submitOk && teacherOk,
      submitted: result.submitted ?? null,
      hasReadingStage: result.hasReadingStage,
      hasMemberResonance: result.hasMemberResonance,
      hasBeginnerGuide: result.hasBeginnerGuide,
      hasActionPath: result.hasActionPath,
      hasTeacherWorkbench: result.hasTeacherWorkbench,
      clickedSources: result.clickedSources ?? null,
      clickedActions: result.clickedActions ?? null,
      width: `${result.scrollWidth}/${result.clientWidth}`,
      styleSheetCount: result.styleSheetCount,
      rawLooking: result.rawLooking,
      appError: result.appError,
      nextError: result.nextError,
      horizontalOverflow: result.horizontalOverflow,
      birthSelects: result.birthSelects,
      nativeDateInputs: result.nativeDateInputs,
      nativeTimeInputs: result.nativeTimeInputs,
      visibleAlerts: result.visibleAlerts,
      pageErrors: result.pageErrors,
    };
  });
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const executablePath = findBrowser();
  if (!executablePath) {
    console.log(JSON.stringify({ status: 'blocked', reason: 'No local Chrome or Edge executable was found.' }, null, 2));
    return;
  }

  const errors = [];
  const browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await context.addCookies([
    {
      name: 'mele_test_auth_v1',
      value: '1',
      domain: new URL(baseUrl).hostname,
      path: '/',
    },
  ]);
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('mele_cookie_consent_v1', 'accepted');
      window.navigator.serviceWorker?.getRegistrations?.().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
    } catch {
      // Some browser contexts block storage access during init; the UI is still tested.
    }
  });
  const page = await context.newPage();

  page.on('pageerror', (error) => errors.push(`PAGEERROR ${error.message}`.slice(0, 500)));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (text.includes('favicon') || text.includes('404')) return;
    if (isIgnorableLocalRscNoise(text)) return;
    errors.push(text.slice(0, 500));
  });
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (url.includes('hot-update')) return;
    if (!url.includes('/_next/static') && !url.includes('/assets/') && !url.includes('/ar/')) return;
    errors.push(`REQUESTFAILED ${url} ${request.failure()?.errorText || ''}`.slice(0, 500));
  });
  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('hot-update')) return;
    if (response.status() < 400) return;
    if (!url.includes('/_next/static') && !url.includes('/assets/') && !url.includes('/ar/')) return;
    errors.push(`HTTP ${response.status()} ${url}`.slice(0, 500));
  });

  const results = [];
  for (const route of routes) {
    results.push(await loadRoute(page, route, errors));
  }

  results.push(await submitTextTool(page, '/tools/tarot', '.tarot-style-grid button', 1, errors));
  results.push(await submitTextTool(page, '/tools/runes', '.rune-material-grid button', 2, errors));
  results.push(await submitHumanDesign(page, errors));
  results.push(await clickTeacherPortal(page, errors));
  results.push(await loadRoute(page, '/', errors));

  await browser.close();
  const summary = summarize(results);
  const failed = summary.filter((item) => !item.ok);
  console.log(JSON.stringify({ status: failed.length ? 'failed' : 'passed', failed: failed.length, summary }, null, 2));
  process.exitCode = failed.length ? 1 : 0;
}

main().catch((error) => {
  console.log(JSON.stringify({
    status: 'blocked',
    reason: String(error?.message || error).slice(0, 800),
  }, null, 2));
  process.exitCode = 2;
});
