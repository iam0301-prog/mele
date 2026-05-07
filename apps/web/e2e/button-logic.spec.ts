import { expect, test } from '@playwright/test';

const locales = ['zh-TW', 'en', 'vi', 'id', 'ja', 'ko'] as const;
const toolSlugs = ['numerology', 'maya', 'bazi', 'tarot', 'runes', 'astro', 'ziwei', 'humandesign'] as const;
const localizedPublicRoutes = locales.flatMap((locale) => [
  `/${locale}`,
  `/${locale}/beta`,
  `/${locale}/spiritual`,
  `/${locale}/tools`,
  ...toolSlugs.map((tool) => `/${locale}/tools/${tool}`),
  `/${locale}/teachers`,
  `/${locale}/teachers/apply`,
  `/${locale}/account/login`,
  `/${locale}/legal/privacy`,
  `/${locale}/legal/tos`,
  `/${locale}/legal/disclaimer`,
]);

const publicRoutes = [
  ...localizedPublicRoutes,
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

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function sameOriginPath(href: string) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return null;
  const url = new URL(href, 'http://127.0.0.1');
  if (url.origin !== 'http://127.0.0.1') return null;
  return `${url.pathname}${url.search}`;
}

test.describe('Button and link logic', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('mele_cookie_consent_v1', 'accepted');
    });
  });

  test('root entry respects browser language when no locale was chosen yet', async ({ request }) => {
    const cases = [
      ['en-US,en;q=0.9', '/en'],
      ['vi-VN,vi;q=0.9,en;q=0.7', '/vi'],
      ['id-ID,id;q=0.9,en;q=0.7', '/id'],
      ['ja-JP,ja;q=0.9,en;q=0.7', '/ja'],
      ['ko-KR,ko;q=0.9,en;q=0.7', '/ko'],
    ] as const;

    for (const [acceptLanguage, expectedPath] of cases) {
      const response = await request.get('/', {
        headers: { 'accept-language': acceptLanguage, cookie: 'mele-locale=' },
        maxRedirects: 0,
        failOnStatusCode: false,
      });
      expect(response.status(), acceptLanguage).toBe(307);
      expect(response.headers().location, acceptLanguage).toBe(expectedPath);
    }
  });

  test('all localized release routes respond before any button sends users there', async ({ request }) => {
    test.setTimeout(120_000);
    const failures: string[] = [];

    await Promise.all(
      unique(publicRoutes).map(async (route) => {
        const response = await request.get(route, { failOnStatusCode: false });
        if (response.status() >= 400) failures.push(`${route} -> ${response.status()}`);
      }),
    );

    expect(failures).toEqual([]);
  });

  test('core public pages expose named buttons and non-broken same-origin links', async ({ page, request }) => {
    test.setTimeout(240_000);
    const brokenLinks = new Set<string>();
    const linkSources = new Map<string, string>();

    for (const route of unique(publicRoutes)) {
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

      const malformedControls = await page.locator('a,button').evaluateAll((controls) =>
        controls
          .filter((control) => {
            const rect = control.getBoundingClientRect();
            const style = window.getComputedStyle(control);
            return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
          })
          .map((control) => control.textContent?.replace(/\s+/g, ' ').trim() ?? '')
          .filter((text) => /\?{3,}/.test(text) || /EnglishEnglish|繁體中文繁體中文|日本語日本語|한국어한국어/.test(text)),
      );
      expect(malformedControls, `${route} has malformed visible button/link labels`).toEqual([]);

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

  test('localized home CTA and menu links keep users in the selected market', async ({ page }) => {
    test.setTimeout(120_000);

    for (const locale of locales) {
      await page.goto(`/${locale}`, { waitUntil: 'domcontentloaded' });

      for (const href of [
        `/${locale}/beta`,
        `/${locale}/daily`,
        `/${locale}/tools/tarot`,
        `/${locale}/teachers`,
      ]) {
        await expect(page.locator(`.home-hero__actions a[href="${href}"]`), `${locale} hero ${href}`).toBeVisible();
      }

      const menuButton = page.locator('button[aria-controls="mobile-header-menu"]');
      await expect(menuButton, `${locale} menu button`).toBeVisible();
      await menuButton.click();
      const menu = page.locator('#mobile-header-menu');
      await expect(menu).toBeVisible();

      for (const href of [
        `/${locale}/beta`,
        `/${locale}/tools`,
        `/${locale}/daily`,
        `/${locale}/mobile`,
        `/${locale}/ar`,
        `/${locale}/teachers`,
        `/${locale}/legal/disclaimer`,
        `/${locale}/account/login`,
        `/${locale}/teachers/apply`,
      ]) {
        await expect(menu.locator(`a[href="${href}"]`), `${locale} menu ${href}`).toBeVisible();
      }

      for (const nextLocale of locales) {
        await expect(menu.locator(`a[href="/${nextLocale}"]`), `${locale} language ${nextLocale}`).toBeVisible();
      }
    }
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
    await expect(page.getByRole('heading', { name: 'Guidance Directory' })).toBeVisible();
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
    await expect(page.locator('.mobile-match h1')).toHaveText('諮詢引導', { timeout: 15000 });

    await page.getByRole('button', { name: 'AR' }).click();
    await expect(page.getByText('AR 養分空間')).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: '老師' }).click();
    await expect(page.locator('.mobile-teacher-gateway h1')).toHaveText('老師中心', { timeout: 15000 });

    await page.getByRole('button', { name: '每日' }).click();
    await expect(page.getByRole('heading', { name: '今日養分' })).toBeVisible({ timeout: 15000 });
  });
});
