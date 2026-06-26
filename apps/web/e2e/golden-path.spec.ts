import { test, expect } from '@playwright/test';

function isLocalBaseURL(baseURL: unknown) {
  const hostname = new URL(String(baseURL ?? 'http://127.0.0.1')).hostname;
  return ['localhost', '127.0.0.1', '::1'].includes(hostname);
}

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
    await expect(page.getByText('Back to tools hub')).toBeVisible();

    await page.goto('/en/tools/tarot', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Tarot Reading' })).toBeVisible();
    await expect(page.getByText('Deck style', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Draw cards' })).toBeVisible();
  });
});

test.describe('Public beta premium flows', () => {
  test('homepage exposes the public beta task board, points economy, and visual assets', async ({ page }) => {
    await page.goto('/zh-TW');

    await expect(page.getByRole('heading', { name: 'MELE' })).toBeVisible();
    await expect(page.getByLabel('公開測試首頁')).toBeVisible();
    await expect(page.getByText('八種命理入口可直接開始')).toBeVisible();
    await expect(page.getByText('每日儀式保留一點儀式感')).toBeVisible();
    await expect(page.getByText('老師是選項，不是必須')).toBeVisible();
    await expect(page.getByAltText('大海波賽頓塔羅卡面')).toBeVisible();
    await expect(page.getByAltText('瑪雅黃色人圖騰')).toBeVisible();
  });

  test('local beta auth opens the member archive and teacher portal', async ({ page }, testInfo) => {
    test.setTimeout(60_000);

    await page.goto('/zh-TW/account/login?return=/zh-TW/account/charts');

    if (!isLocalBaseURL(testInfo.project.use.baseURL)) {
      await expect(page.getByRole('button', { name: '使用本機測試帳號' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: '登入' }).first()).toBeVisible();
      return;
    }

    await page.getByRole('button', { name: '使用本機測試帳號' }).click();
    await expect(page).toHaveURL(/\/zh-TW\/account\/charts$/);
    await expect(page.getByRole('heading', { name: '會員解讀庫' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('公測期免費體驗')).toBeVisible();
    await expect(page.getByText(/流日、流月、流年均可直接查看/).first()).toBeVisible();

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
    await expect(page.getByText(/每天只能選擇塔羅或盧恩|每日可在塔羅與盧恩之間擇一/).first()).toBeVisible();
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
