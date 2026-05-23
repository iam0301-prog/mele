const { chromium } = require('playwright');

const pages = [
  '/zh-TW/tools',
  '/zh-TW/feedback',
  '/zh-TW/tools/numerology',
];
const viewports = [
  { name: 'desktop', width: 1440, height: 1100 },
  { name: 'mobile', width: 390, height: 1200, isMobile: true },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: Boolean(viewport.isMobile) });
    for (const path of pages) {
      const page = await context.newPage();
      const messages = [];
      page.on('console', (msg) => {
        if (['error', 'warning'].includes(msg.type())) messages.push(`${msg.type()}: ${msg.text()}`);
      });
      page.on('pageerror', (err) => messages.push(`pageerror: ${err.message}`));
      const response = await page.goto(`http://127.0.0.1:3006${path}`, { waitUntil: 'networkidle', timeout: 30000 });
      const title = await page.title();
      const h1 = await page.locator('h1').first().textContent().catch(() => '');
      const ctas = await page.locator('a,button').evaluateAll((els) => els.slice(0, 18).map((el) => (el.textContent || '').trim()).filter(Boolean));
      const screenshot = `/tmp/mele-${viewport.name}-${path.replace(/[^a-z0-9]+/gi, '-')}.png`;
      await page.screenshot({ path: screenshot, fullPage: true });
      results.push({ viewport: viewport.name, path, status: response && response.status(), title, h1, warningCount: messages.length, messages: messages.slice(0, 6), screenshot, ctas: ctas.slice(0, 10) });
      await page.close();
    }
    await context.close();
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})();
