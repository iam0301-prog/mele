import { expect, test } from '@playwright/test';

const teacherHeadings = [
  ['en', 'Guidance Directory'],
  ['vi', 'Danh mục hướng dẫn'],
  ['id', 'Direktori Panduan'],
  ['ja', '相談ガイド一覧'],
  ['ko', '상담 가이드 목록'],
] as const;

test.describe('Teacher multilingual surfaces', () => {
  test.describe.configure({ mode: 'serial', timeout: 90_000 });

  test('teacher directory uses the active market language', async ({ page }) => {
    for (const [locale, heading] of teacherHeadings) {
      await page.goto(`/${locale}/teachers`, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
      await expect(page.getByText('諮詢老師入口')).toHaveCount(0);
      await expect(page.locator(`a[href="/${locale}/teachers/apply"]`).first()).toBeVisible();
    }
  });

  test('teacher detail and application pages are localized', async ({ page }) => {
    await page.goto('/en/teachers/demo-tarot-luna', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Back to guidance directory')).toBeVisible();
    await expect(page.getByText('Services', { exact: true })).toBeVisible();
    await expect(page.getByText('Back to guide flow').first()).toBeVisible();
    await expect(page.getByText('返回諮詢老師入口')).toHaveCount(0);

    await page.goto('/en/teachers/apply', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Guide Application', exact: true })).toBeVisible();
    await expect(page.getByText('Sign in / Sign up')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' }).first()).toBeVisible();
    await expect(page.getByText('老師申請')).toHaveCount(0);
  });

  test('teacher portal exposes a localized reading assist workspace', async ({ page }) => {
    await page.goto('/account/login?return=/account/charts', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: '使用本機測試帳號' }).click();
    await expect(page).toHaveURL(/\/account\/charts$/);

    await page.goto('/en/teacher-portal', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Guide Workspace' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Reading Assist' })).toBeVisible();
    await expect(page.getByText('Suggested opening questions')).toBeVisible();
    await expect(page.getByText('老師後台')).toHaveCount(0);
  });
});
