import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3006);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const chromiumLaunchOptions = chromiumExecutablePath
  ? {
      executablePath: chromiumExecutablePath,
      args: ['--disable-crash-reporter', '--disable-crashpad'],
    }
  : undefined;
const isCI = !!process.env.CI;
const useProductionServer = isCI || process.env.PLAYWRIGHT_USE_BUILD === 'true';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : 1,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: chromiumExecutablePath ? 'off' : 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        launchOptions: chromiumLaunchOptions,
      },
    },
    {
      name: 'chromium-mobile',
      use: {
        ...devices['Pixel 7'],
        launchOptions: chromiumLaunchOptions,
      },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: useProductionServer
          ? `npm run start -- --port ${PORT}`
          : `npm run dev -- --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: !isCI && !useProductionServer,
        timeout: 120_000,
        env: {
          MELE_API_URL: 'http://127.0.0.1:8015',
          NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE: 'true',
        },
      },
});
