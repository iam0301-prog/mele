import { expect, test } from '@playwright/test';

const publicRoutes = [
  '/zh-TW',
  '/en',
  '/vi',
  '/id',
  '/ja',
  '/ko',
  '/en/spiritual',
  '/en/tools',
  '/en/tools/numerology',
  '/en/tools/maya',
  '/en/tools/bazi',
  '/en/tools/tarot',
  '/en/tools/runes',
  '/en/tools/astro',
  '/en/tools/ziwei',
  '/en/tools/humandesign',
  '/daily',
  '/mobile',
  '/teachers',
  '/teachers/apply',
  '/account/login',
  '/legal/privacy',
  '/legal/tos',
  '/legal/disclaimer',
];

function sameOriginPath(href: string) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return null;
  const url = new URL(href, 'http://127.0.0.1');
  if (url.origin !== 'http://127.0.0.1') return null;
  return `${url.pathname}${url.search}`;
}

test.describe('Button and link logic', () => {
  test('core public pages expose named buttons and non-broken same-origin links', async ({ page, request }) => {
    test.setTimeout(120_000);
    const brokenLinks = new Set<string>();
    const linkSources = new Map<string, string>();

    for (const route of publicRoutes) {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), route).toBeLessThan(400);

      const unnamedButtons = await page.locator('button').evaluateAll((buttons) =>
        buttons
          .filter((button) => {
            const rect = button.getBoundingClientRect();
            const style = window.getComputedStyle(button);
            return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
          })
          .map((button) => ({
            text: button.textContent?.replace(/\s+/g, ' ').trim() ?? '',
            ariaLabel: button.getAttribute('aria-label') ?? '',
            title: button.getAttribute('title') ?? '',
            outer: button.outerHTML.slice(0, 160),
          }))
          .filter((button) => !button.text && !button.ariaLabel && !button.title),
      );
      expect(unnamedButtons, `${route} has unnamed visible buttons`).toEqual([]);

      const hrefs = await page.locator('a[href]').evaluateAll((links) =>
        Array.from(new Set(links.map((link) => link.getAttribute('href') ?? ''))),
      );

      for (const href of hrefs) {
        const path = sameOriginPath(href);
        if (!path) continue;
        if (path.startsWith('/account/book?')) continue;
        if (!linkSources.has(path)) linkSources.set(path, route);
      }
    }

    const paths = [...linkSources.keys()];
    for (let index = 0; index < paths.length; index += 8) {
      const chunk = paths.slice(index, index + 8);
      const results = await Promise.all(
        chunk.map(async (path) => {
          const linkResponse = await request.get(path, { failOnStatusCode: false });
          return { path, status: linkResponse.status() };
        }),
      );

      for (const result of results) {
        if (result.status >= 400) {
          brokenLinks.add(`${linkSources.get(result.path)} -> ${result.path} (${result.status})`);
        }
      }
    }

    expect([...brokenLinks]).toEqual([]);
  });

  test('right-side header menu routes and language switching preserve the current page', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: 'Menu' }).click();
    const menu = page.locator('#mobile-header-menu');
    await expect(menu).toBeVisible();

    await menu.locator('a[href="/en/tools"]').click();
    await expect(page).toHaveURL(/\/en\/tools$/);
    await expect(page.getByRole('heading', { name: 'Understand yourself before going deeper' })).toBeVisible();

    await page.getByRole('button', { name: 'Menu' }).click();
    await page.locator('#mobile-header-menu a[href="/vi/tools"]').click();
    await expect(page).toHaveURL(/\/vi\/tools$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Understand yourself before going deeper' })).toBeVisible();
  });

  test('homepage CTAs and tool cards lead to their intended flows', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    await page.locator('a[href="/en/daily"]').click();
    await expect(page).toHaveURL(/\/en\/daily$/);
    await expect(page.getByRole('heading', { name: '每日儀式中心' })).toBeVisible();

    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await page.locator('a[href="/en/tools/tarot"]').first().click();
    await expect(page).toHaveURL(/\/en\/tools\/tarot$/);
    await expect(page.getByRole('heading', { name: 'Tarot Reading' })).toBeVisible();

    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await page.locator('a[href="/en/teachers"]').click();
    await expect(page).toHaveURL(/\/en\/teachers$/);
    await expect(page.getByRole('heading', { name: '諮詢老師入口' })).toBeVisible();
  });

  test('tool submit buttons surface validation before calling calculators', async ({ page }) => {
    const cases = [
      ['/en/tools/numerology', 'Start reading', 'Please choose your birth date first.'],
      ['/en/tools/maya', 'Find my Kin', 'Please choose your birth date first.'],
      ['/en/tools/bazi', 'Generate Bazi', 'Please enter both birth date and time.'],
      ['/en/tools/tarot', 'Draw cards', 'Please enter a question first.'],
      ['/en/tools/runes', 'Draw runes', 'Please enter a question first.'],
      ['/en/tools/astro', 'Generate chart', 'Please enter both birth date and time.'],
      ['/en/tools/ziwei', 'Generate chart', 'Please enter both birth date and time.'],
      ['/en/tools/humandesign', 'Generate BodyGraph', 'Please enter birth date and time; use 12:00 if you only want to test.'],
    ] as const;

    for (const [route, buttonName, validationText] of cases) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: buttonName }).click();
      await expect(page.getByText(validationText, { exact: false }).first()).toBeVisible();
    }
  });

  test('mobile app tabbar buttons switch sections without navigation errors', async ({ page }) => {
    await page.goto('/mobile', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: '引導' }).click();
    await expect(page.getByRole('heading', { name: '諮詢引導' })).toBeVisible();

    await page.getByRole('button', { name: 'AR' }).click();
    await expect(page.getByText('AR 養分空間')).toBeVisible();

    await page.getByRole('button', { name: '老師' }).click();
    await expect(page.getByRole('heading', { name: '老師中心' })).toBeVisible();

    await page.getByRole('button', { name: '每日' }).click();
    await expect(page.getByRole('heading', { name: '今日養分' })).toBeVisible();
  });
});
