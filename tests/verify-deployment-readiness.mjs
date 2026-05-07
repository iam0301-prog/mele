import { existsSync, readFileSync } from 'node:fs';

let passed = 0;
let failed = 0;

function ok(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  \x1b[32mOK\x1b[0m ${name}${detail ? ` - ${detail}` : ''}`);
    return;
  }
  failed += 1;
  console.log(`  \x1b[31mFAIL\x1b[0m ${name}${detail ? ` - ${detail}` : ''}`);
}

function read(file) {
  return existsSync(file) ? readFileSync(file, 'utf8') : '';
}

console.log('\n=== Deployment readiness files ===\n');

const rootEnv = read('.env.example');
const webEnv = read('apps/web/.env.local.example');
const supabaseGuide = read('docs/SUPABASE_SETUP_GUIDE.md');
const authEmailRunbook = read('docs/SUPABASE_AUTH_EMAIL_RUNBOOK.md');
const oauthRunbook = read('docs/OAUTH_LOGIN_RUNBOOK.md');
const backendBlueprint = read('docs/BACKEND_BLUEPRINT.md');
const deployRunbook = read('docs/DEPLOYMENT_RUNBOOK.md');
const goLiveExternalSettings = read('docs/GO_LIVE_EXTERNAL_SETTINGS.md');
const setupReadme = read('scripts/setup-supabase/README.md');
const setupAllMigrations = read('scripts/setup-supabase/all_migrations.sql');
const authCheckScript = read('scripts/check-supabase-auth.mjs');
const configureAuthScript = read('scripts/configure-supabase-auth.mjs');
const pythonDockerfile = read('python_api/Dockerfile');
const pythonRequirementsDev = read('python_api/requirements-dev.txt');
const pythonPackage = read('python_api/package.json');
const pythonReadme = read('python_api/README.md');
const pythonPytestRunner = read('scripts/run-python-pytest.mjs');
const renderYaml = read('render.yaml');
const railwayJson = read('railway.json');
const ciWorkflow = read('.github/workflows/ci.yml');
const e2eSpec = read('apps/web/e2e/golden-path.spec.ts');
const playwrightConfig = read('apps/web/playwright.config.ts');
const webE2eRunner = read('scripts/run-web-e2e.mjs');
const webPackage = JSON.parse(read('apps/web/package.json') || '{}');
const webLayout = read('apps/web/app/layout.tsx');
const localizedBetaPage = read('apps/web/app/[locale]/beta/page.tsx');
const sitemapRoute = read('apps/web/app/sitemap.ts');
const nextConfig = read('apps/web/next.config.mjs');
const pkg = JSON.parse(read('package.json') || '{}');

for (const file of [
  '.env.example',
  'apps/web/.env.local.example',
  'docs/SUPABASE_SETUP_GUIDE.md',
  'docs/SUPABASE_AUTH_EMAIL_RUNBOOK.md',
  'docs/OAUTH_LOGIN_RUNBOOK.md',
  'docs/BACKEND_BLUEPRINT.md',
  'docs/DEPLOYMENT_RUNBOOK.md',
  'docs/GO_LIVE_EXTERNAL_SETTINGS.md',
  'scripts/setup-supabase/README.md',
  'scripts/check-supabase-auth.mjs',
  'scripts/configure-supabase-auth.mjs',
  'python_api/Dockerfile',
  'python_api/.dockerignore',
  'python_api/package.json',
  'python_api/requirements-dev.txt',
  'scripts/run-python-pytest.mjs',
  'scripts/run-web-e2e.mjs',
  'render.yaml',
  'railway.json',
  '.github/workflows/ci.yml',
]) {
  ok(`${file} exists`, existsSync(file));
}

console.log('\n=== Environment examples ===\n');

for (const key of [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_LIFF_ID',
  'NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN',
  'NEXT_PUBLIC_ENABLE_LINE_LOGIN',
  'NEXT_PUBLIC_LINE_OAUTH_PROVIDER',
  'NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE',
  'MELE_API_URL',
  'MELE_ALLOWED_ORIGINS',
  'MELE_RATE_LIMIT_MAX_REQUESTS',
  'MELE_RATE_LIMIT_WINDOW_SECONDS',
  'MELE_HEAVY_MAX_CONCURRENCY',
  'MELE_TRUST_PROXY_HEADERS',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ECPAY_MERCHANT_ID',
  'ECPAY_HASH_KEY',
  'ECPAY_HASH_IV',
  'LINE_CHANNEL_ACCESS_TOKEN',
]) {
  ok(`root .env.example documents ${key}`, rootEnv.includes(`${key}=`));
}

for (const key of [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_LIFF_ID',
  'NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN',
  'NEXT_PUBLIC_ENABLE_LINE_LOGIN',
  'NEXT_PUBLIC_LINE_OAUTH_PROVIDER',
  'NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE',
  'MELE_API_URL',
]) {
  ok(`web env example documents ${key}`, webEnv.includes(`${key}=`));
}

ok('web env warns against frontend secrets', webEnv.includes('never in NEXT_PUBLIC'));
ok('root env warns not to commit real secrets', rootEnv.includes('do not commit real secrets'));

console.log('\n=== Supabase and deployment docs ===\n');

for (const token of [
  'supabase login',
  'supabase link --project-ref',
  'supabase db push --dry-run',
  'supabase db push',
  'supabase functions deploy ecpay-checkout',
  'supabase functions deploy ecpay-webhook --no-verify-jwt',
  'supabase functions deploy line-daily-push',
  '0009_member_points_unlocks.sql',
  '0010_kyc_auto_purge_cron.sql',
  '0011_admin_member_ops.sql',
  '0012_beta_tester_ops.sql',
  'SUPABASE_SERVICE_ROLE_KEY',
  'teacher-docs',
  'service_role',
  'npm run ops:check-auth',
  'Supabase Auth Email Runbook',
  'Google and LINE Login Runbook',
]) {
  ok(`Supabase guide covers ${token}`, supabaseGuide.includes(token));
}

for (const token of [
  'supabase.auth.resend',
  'Redirect URLs',
  'SMTP',
  'Authentication -> Logs',
  '重新寄送驗證信',
  'No-Go',
]) {
  ok(`auth email runbook covers ${token}`, authEmailRunbook.includes(token));
}

for (const token of [
  'Google Cloud Console',
  'LINE Developers',
  'custom:line',
  'Supabase Auth callback',
  'NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN',
  'NEXT_PUBLIC_ENABLE_LINE_LOGIN',
]) {
  ok(`OAuth runbook covers ${token}`, oauthRunbook.includes(token));
}

for (const token of [
  'Supabase Auth',
  'Supabase Postgres',
  'Supabase Edge Functions',
  'Python FastAPI',
  '0007_auth_signup_mirror.sql',
  'custom:line',
  'ops:check-auth',
]) {
  ok(`backend blueprint covers ${token}`, backendBlueprint.includes(token));
}

for (const token of [
  'Vercel',
  'Railway',
  'Render',
  'Fly.io',
  'Python FastAPI',
  '12 個 migrations',
  'Supabase',
  'ECPay',
  'LINE',
  'Rollback',
  'Smoke Test',
  'ops:check-auth',
  '驗證信',
  'custom:line',
]) {
  ok(`deployment runbook covers ${token}`, deployRunbook.includes(token));
}

for (const token of [
  'Supabase Auth',
  'Google Login',
  'LINE Login / LIFF',
  'Render Python API',
  'Vercel Frontend',
  'Smoke Test',
  'No-Go',
  'MELE_RATE_LIMIT_MAX_REQUESTS',
  'MELE_TRUST_PROXY_HEADERS',
  'SUPABASE_SERVICE_ROLE_KEY',
]) {
  ok(`go-live external settings covers ${token}`, goLiveExternalSettings.includes(token));
}

for (const token of [
  'all_migrations.sql',
  'setup_admin.sql',
  'setup_storage_buckets.sql',
  'SQL Editor',
  'Table Editor',
  'ops:check-auth',
]) {
  ok(`setup helper README covers ${token}`, setupReadme.includes(token));
}

for (const token of [
  '0012_beta_tester_ops.sql',
  'beta_testers',
  'admin_upsert_beta_tester',
]) {
  ok(`setup all_migrations includes ${token}`, setupAllMigrations.includes(token));
}

for (const token of [
  '/auth/v1/settings',
  'disable_signup',
  'external?.email',
  'mailer_autoconfirm',
  'expectedCallback',
  'NEXT_PUBLIC_LINE_OAUTH_PROVIDER',
]) {
  ok(`auth diagnostic script checks ${token}`, authCheckScript.includes(token));
}

for (const token of [
  'mailer_templates_confirmation_content',
  'ENGLISH VERSION',
  'Confirm your MELE account',
  'Reset your MELE password',
  'Log in to MELE',
]) {
  ok(`auth configure script templates include ${token}`, configureAuthScript.includes(token));
}

console.log('\n=== Python API deployment ===\n');

for (const token of [
  'FROM node:22-bookworm-slim',
  'python3-venv',
  'npm install --omit=dev',
  'pip install -r requirements.txt',
  'HEALTHCHECK',
  '/ready',
  '${PORT:-8000}',
]) {
  ok(`Python Dockerfile covers ${token}`, pythonDockerfile.includes(token));
}

for (const dep of ['iztro', 'sweph', 'tz-lookup']) {
  ok(`python_api package includes ${dep}`, pythonPackage.includes(`"${dep}"`));
}

for (const token of [
  'Railway',
  'Render',
  'Docker',
  'MELE_ALLOWED_ORIGINS',
  'requirements-dev.txt',
  '_iztro_helper.cjs',
  '_sweph_helper.cjs',
]) {
  ok(`Python API README covers ${token}`, pythonReadme.includes(token));
}

ok('Python dev requirements include runtime requirements', pythonRequirementsDev.includes('-r requirements.txt'));
ok('Python dev requirements include pytest', /pytest==\d+\.\d+\.\d+/.test(pythonRequirementsDev));
ok('Python pytest runner falls back to python_api venv', pythonPytestRunner.includes("'python_api', 'venv'"));
ok('Python pytest runner supports bundled Codex Python', pythonPytestRunner.includes('codex-primary-runtime'));

ok('Render blueprint uses python_api rootDir', renderYaml.includes('rootDir: python_api'));
ok('Render blueprint has /ready health check', renderYaml.includes('healthCheckPath: /ready'));
ok('Render blueprint auto-deploys API updates from main', renderYaml.includes('autoDeploy: true'));
ok('Render blueprint allows production Vercel origin', renderYaml.includes('MELE_ALLOWED_ORIGINS') && renderYaml.includes('https://mele-chi.vercel.app'));
ok('Railway config points at API Dockerfile', railwayJson.includes('"dockerfilePath": "python_api/Dockerfile"'));
ok('Railway config has /ready health check', railwayJson.includes('"healthcheckPath": "/ready"'));

console.log('\n=== CI workflow ===\n');

for (const token of [
  'actions/setup-node@v4',
  'node-version: 22',
  'cache-dependency-path',
  'apps/web/package-lock.json',
  'actions/setup-python@v5',
  'python-version: "3.12"',
  'npm ci',
  'pip install -r python_api/requirements-dev.txt',
  'npm run type-check',
  'npm test',
  'npm run test:python',
  'npm run test:sql',
  'npm run test:deployment',
  'npm run test:secrets',
  'npm run build',
]) {
  ok(`CI workflow covers ${token}`, ciWorkflow.includes(token));
}

console.log('\n=== Package commands ===\n');

ok('package exposes test:deployment', pkg.scripts?.['test:deployment'] === 'node tests/verify-deployment-readiness.mjs');
ok('package exposes test:secrets', pkg.scripts?.['test:secrets'] === 'node tests/verify-secrets.mjs');
ok('package exposes test:python', pkg.scripts?.['test:python'] === 'node scripts/run-python-pytest.mjs');
ok('package exposes release-grade test:e2e runner', pkg.scripts?.['test:e2e'] === 'node scripts/run-web-e2e.mjs');
ok('package exposes ops:check-auth', pkg.scripts?.['ops:check-auth'] === 'node scripts/check-supabase-auth.mjs');
ok('package exposes release:check', typeof pkg.scripts?.['release:check'] === 'string');
ok('release:check includes type-check', pkg.scripts?.['release:check']?.includes('type-check'));
ok('release:check includes test:e2e', pkg.scripts?.['release:check']?.includes('test:e2e'));
ok('release:check includes test:python', pkg.scripts?.['release:check']?.includes('test:python'));
ok('release:check includes test:sql', pkg.scripts?.['release:check']?.includes('test:sql'));
ok('release:check includes test:deployment', pkg.scripts?.['release:check']?.includes('test:deployment'));
ok('release:check includes test:secrets', pkg.scripts?.['release:check']?.includes('test:secrets'));
ok('release:check includes build', pkg.scripts?.['release:check']?.includes('build'));

for (const token of [
  'PLAYWRIGHT_USE_BUILD',
  'npm run start -- --port',
  'npm run dev -- --port',
]) {
  ok(`Playwright config supports ${token}`, playwrightConfig.includes(token));
}

for (const token of [
  "['run', 'build']",
  'PLAYWRIGHT_USE_BUILD',
  'findAvailablePort',
  'Using available Playwright port',
  "['--prefix', 'apps/web', 'run', 'test:e2e'",
]) {
  ok(`web E2E runner covers ${token}`, webE2eRunner.includes(token));
}

ok('web package includes sharp for production images', Boolean(webPackage.dependencies?.sharp));
ok('web lint uses ESLint CLI instead of deprecated next lint', webPackage.scripts?.lint === 'eslint . --max-warnings=0');
ok('web package pins safe PostCSS override', webPackage.overrides?.postcss === '8.5.12');
ok('web package targets patched Next 15 line', /^\^15\.5\.15/.test(webPackage.dependencies?.next || ''));
ok('web package targets patched Playwright', /^\^1\.59\.1/.test(webPackage.devDependencies?.['@playwright/test'] || ''));
ok('layout avoids build-time Google font network fetches', !webLayout.includes('next/font/google'));
ok('Next config sets outputFileTracingRoot for multiple lockfiles', nextConfig.includes('outputFileTracingRoot'));
ok('localized beta entry exists for tester invite flow', localizedBetaPage.includes('dictionary.beta') && localizedBetaPage.includes("mode: 'signup'"));
ok('sitemap includes localized beta entry', sitemapRoute.includes("'/beta'") && sitemapRoute.includes('buildAlternateLanguages'));

console.log('\n=== Browser e2e coverage ===\n');

for (const token of [
  '封閉測試任務台',
  '今日可領 200 點',
  '會員付 100 點解鎖',
  '老師只作為進一步諮詢選項',
  '/account/charts',
  '/teacher-portal',
  '每日儀式中心',
  '抽今日塔羅',
  '抽今日盧恩',
  '塔羅牌解讀',
  '開始抽牌',
]) {
  ok(`Playwright spec covers ${token}`, e2eSpec.includes(token));
}

console.log('\n============================');
console.log(`Deployment readiness: \x1b[32m${passed} passed\x1b[0m / \x1b[31m${failed} failed\x1b[0m`);
process.exit(failed > 0 ? 1 : 0);
