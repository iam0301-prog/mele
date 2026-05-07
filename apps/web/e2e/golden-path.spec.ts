import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('mele_cookie_consent_v1', 'accepted');
  });
});

// 黃金路徑：訪客 → 進入生命靈數 → 填日期 → 取得結果
test.describe('Golden path: numerology', () => {
  test.beforeEach(async ({ page }) => {
    // 攔截 calc API，回固定假資料；e2e 不依賴 Python 後端
    await page.route('**/api/calc/numerology', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tool: 'numerology',
          version: 'v1',
          computed_at: '2026-05-04T00:00:00Z',
          input: { year: 1990, month: 6, day: 15 },
          data: {
            lifePath: 4,
            birthDay: 15,
            lifePathArchetype: '建造者',
          },
          render: {
            html: '<section data-testid="numerology-render">建造者 · 主數 4</section>',
            speech: '生命靈數 4 — 建造者',
          },
        }),
      });
    });
  });

  test('visitor can submit a numerology reading and see the result', async ({ page }) => {
    await page.goto('/zh-TW/tools/numerology');

    await expect(page.getByRole('heading', { name: '生命靈數' })).toBeVisible();

    await page.getByRole('combobox', { name: /年/ }).selectOption('1990');
    await page.getByRole('combobox', { name: /月/ }).selectOption('6');
    await page.getByRole('combobox', { name: /日/ }).selectOption('15');
    await expect(page.getByText('1990 年 06 月 15 日').first()).toBeVisible();

    await page.getByRole('button', { name: /開始解讀/ }).click();

    // 結果區塊出現
    await expect(page.locator('.tool-result-card--numerology')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/數字命理初步認識自己|生命數與生日數|建造者/).first()).toBeVisible();
  });

  test('shows error toast when submitting empty form', async ({ page }) => {
    await page.goto('/zh-TW/tools/numerology');
    await page.getByRole('button', { name: /開始解讀/ }).click();
    await expect(page.getByText('請先選擇出生日期。')).toBeVisible();
  });
});

test.describe('Smoke: home and tools index', () => {
  test('homepage loads', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
  });

  test('all 8 tool routes return 2xx', async ({ page }) => {
    test.setTimeout(60_000);

    const tools = ['numerology', 'maya', 'bazi', 'tarot', 'runes', 'astro', 'ziwei', 'humandesign'];
    for (const tool of tools) {
      const res = await page.goto(`/tools/${tool}`, { waitUntil: 'domcontentloaded' });
      expect(res?.status(), `tool=${tool}`).toBeLessThan(400);
    }
  });

  test('localized market pages expose all 8 tool entrances', async ({ page }) => {
    const tools = ['numerology', 'maya', 'bazi', 'tarot', 'runes', 'astro', 'ziwei', 'humandesign'];

    for (const locale of ['en', 'vi', 'id', 'ja', 'ko']) {
      await page.goto(`/${locale}/spiritual`, { waitUntil: 'domcontentloaded' });
      for (const tool of tools) {
        await expect(page.locator(`a[href="/${locale}/tools/${tool}"]`).first(), `${locale}/${tool}`).toBeVisible();
      }
    }
  });

  test('localized tools lobby exposes all 8 tool entrances', async ({ page }) => {
    const tools = ['numerology', 'maya', 'bazi', 'tarot', 'runes', 'astro', 'ziwei', 'humandesign'];

    for (const locale of ['zh-TW', 'en', 'vi', 'id', 'ja', 'ko']) {
      await page.goto(`/${locale}/tools`, { waitUntil: 'domcontentloaded' });
      for (const tool of tools) {
        await expect(page.locator(`a[href="/${locale}/tools/${tool}"]`).first(), `${locale}/tools/${tool}`).toBeVisible();
      }
    }
  });

  test('localized tool pages translate their visible shell and form controls', async ({ page }) => {
    await page.goto('/en/tools/maya', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Maya Calendar Kin' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Find my Kin' })).toBeVisible();
    await expect(page.getByText('Back to spiritual hub')).toBeVisible();

    await page.goto('/en/tools/tarot', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Tarot Reading' })).toBeVisible();
    await expect(page.getByText('Deck style', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Draw cards' })).toBeVisible();
  });
});

test.describe('Closed beta premium flows', () => {
  test('homepage exposes the beta task board, points economy, and visual assets', async ({ page }) => {
    await page.goto('/zh-TW');

    await expect(page.getByRole('heading', { name: 'MELE' })).toBeVisible();
    await expect(page.getByLabel('封閉測試任務台')).toBeVisible();
    await expect(page.getByText('今日可領 200 點')).toBeVisible();
    await expect(page.getByText('會員付 100 點解鎖')).toBeVisible();
    await expect(page.getByLabel('封閉測試任務台').getByText('老師只作為進一步諮詢選項')).toBeVisible();
    await expect(page.getByAltText('大海波賽頓塔羅卡面')).toBeVisible();
    await expect(page.getByAltText('瑪雅黃色人圖騰')).toBeVisible();
  });

  test('local beta auth opens the member archive and teacher portal', async ({ page }) => {
    await page.goto('/zh-TW/account/login?return=/zh-TW/account/charts');

    await page.getByRole('button', { name: '使用本機測試帳號' }).click();
    await expect(page).toHaveURL(/\/zh-TW\/account\/charts$/);
    await expect(page.getByRole('heading', { name: '會員解讀庫' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('每天可領 200 點')).toBeVisible();
    await expect(page.getByText('流日、流月、流年')).toBeVisible();

    await page.goto('/zh-TW/teacher-portal');
    await expect(page.getByRole('heading', { name: '老師後台' })).toBeVisible();
    await expect(page.getByText('測試老師 · 本機測試模式')).toBeVisible();
    await expect(page.getByRole('heading', { name: '會員詳解備忘', exact: true })).toBeVisible();
  });

  test('daily ritual makes the one-a-day tarot or rune choice obvious', async ({ page }) => {
    await page.goto('/zh-TW/daily');

    await expect(page.getByRole('heading', { name: '每日儀式中心' })).toBeVisible();
    await expect(page.getByRole('button', { name: /抽今日塔羅|查看今日塔羅/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /抽今日盧恩|查看今日盧恩/ })).toBeVisible();
    await expect(page.getByText('每日可在塔羅與盧恩之間擇一')).toBeVisible();
  });

  test('tarot page exposes style selection and the draw entry point', async ({ page }) => {
    await page.goto('/zh-TW/tools/tarot');

    await expect(page.getByRole('heading', { name: '塔羅牌解讀' })).toBeVisible();
    await expect(page.getByText('森林女神')).toBeVisible();
    await expect(page.getByText('海神星辰')).toBeVisible();
    await expect(page.getByText('古埃及法老')).toBeVisible();
    await expect(page.getByRole('button', { name: '開始抽牌' })).toBeVisible();
  });
});
