import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';

let passed = 0;
let failed = 0;
let warned = 0;

function log(name, ok, detail = '') {
  if (ok) {
    passed += 1;
    console.log(`  \x1b[32mOK\x1b[0m ${name}${detail ? ` - ${detail}` : ''}`);
  } else {
    failed += 1;
    console.log(`  \x1b[31mFAIL\x1b[0m ${name}${detail ? ` - ${detail}` : ''}`);
  }
}

function warn(name, ok, detail = '') {
  if (ok) {
    passed += 1;
    console.log(`  \x1b[32mOK\x1b[0m ${name}${detail ? ` - ${detail}` : ''}`);
  } else {
    warned += 1;
    console.log(`  \x1b[33mWARN\x1b[0m ${name}${detail ? ` - ${detail}` : ''}`);
  }
}

const migrations = [
  'supabase/migrations/0001_initial_schema.sql',
  'supabase/migrations/0002_rls_policies.sql',
  'supabase/migrations/0003_workflow_functions.sql',
  'supabase/migrations/0004_p0_fixes.sql',
  'supabase/migrations/0005_daily_ritual_center.sql',
  'supabase/migrations/0006_match_sessions.sql',
  'supabase/migrations/0007_auth_signup_mirror.sql',
  'supabase/migrations/0008_teacher_website_application.sql',
  'supabase/migrations/0009_member_points_unlocks.sql',
  'supabase/migrations/0010_kyc_auto_purge_cron.sql',
  'supabase/migrations/0011_admin_member_ops.sql',
  'supabase/migrations/0012_beta_tester_ops.sql',
];

const pointMigrationFile = 'supabase/migrations/0009_member_points_unlocks.sql';
const kycPurgeMigrationFile = 'supabase/migrations/0010_kyc_auto_purge_cron.sql';
const adminMemberOpsMigrationFile = 'supabase/migrations/0011_admin_member_ops.sql';
const betaTesterOpsMigrationFile = 'supabase/migrations/0012_beta_tester_ops.sql';
const SQL = migrations
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');

console.log('\n=== Supabase schema structure ===\n');

for (const table of [
  'profiles',
  'teacher_applications',
  'teachers',
  'teacher_services',
  'teacher_availability',
  'bookings',
  'reviews',
  'chart_records',
  'teacher_review_log',
  'admins',
  'notifications',
  'settlements',
  'support_threads',
  'support_messages',
  'consent_log',
  'daily_readings',
  'daily_draws',
  'ar_assets',
  'line_user_links',
  'match_sessions',
  'member_wallets',
  'point_transactions',
  'daily_point_claims',
  'content_unlocks',
  'beta_testers',
]) {
  const re = new RegExp(`create\\s+table\\s+(if\\s+not\\s+exists\\s+)?public\\.${table}`, 'i');
  log(`table public.${table}`, re.test(SQL));
}

for (const type of ['teacher_status', 'booking_status', 'chart_tool', 'daily_draw_tool', 'ar_asset_kind']) {
  const re = new RegExp(`create\\s+type\\s+${type}\\s+as\\s+enum`, 'i');
  log(`enum ${type}`, re.test(SQL));
}

for (const column of [
  'privacy_consent_at',
  'tos_consent_at',
  'marketing_opt_in',
  'settlement_id',
  'no_refund_consent',
  'dispute_status',
]) {
  log(`critical column ${column}`, SQL.includes(column));
}

for (const fn of [
  'submit_teacher_application',
  'review_teacher_application',
  'activate_teacher',
  'suspend_teacher',
  'is_admin',
  'is_teacher',
  'confirm_payment',
  'create_booking_request',
  'handle_new_auth_user',
  'cancel_booking',
  'complete_booking',
  'update_booking_followup',
  'create_support_thread',
  'purge_old_kyc_docs',
  'claim_daily_points',
  'unlock_content',
  'admin_adjust_member_points',
  'admin_update_member_profile',
  'admin_upsert_beta_tester',
  'handle_new_beta_tester',
]) {
  const re = new RegExp(`create\\s+or\\s+replace\\s+function\\s+public\\.${fn}\\s*\\(`, 'i');
  log(`function public.${fn}`, re.test(SQL));
}

for (const trigger of [
  'trg_profiles_updated',
  'trg_bookings_updated',
  'trg_reviews_update_rating',
  'trg_bookings_cases_count',
  'trg_bookings_compute',
  'trg_support_updated',
  'on_auth_user_created',
  'on_auth_user_created_beta_tester',
]) {
  log(`trigger ${trigger}`, SQL.includes(trigger));
}

for (const index of [
  'uniq_booking_teacher_slot',
  'idx_bookings_status_scheduled',
  'idx_teachers_specialties',
  'idx_notifications_user_unread',
  'idx_support_status',
  'idx_consent_log_user',
  'idx_daily_readings_user_date',
  'idx_daily_draws_user_date',
  'idx_ar_assets_tool_kind',
  'idx_line_user_links_push',
  'idx_match_sessions_user_created',
  'idx_point_transactions_user_created',
  'idx_content_unlocks_user_scope',
  'uniq_daily_draws_user_date_choice',
]) {
  log(`index ${index}`, SQL.includes(index));
}

for (const view of ['v_admin_stats', 'v_teacher_busy']) {
  const re = new RegExp(`create\\s+or\\s+replace\\s+view\\s+public\\.${view}`, 'i');
  log(`view public.${view}`, re.test(SQL));
}

for (const policy of [
  'profiles_self_select',
  'profiles_admin_select',
  'teachers_public_select_active',
  'services_public_select_active',
  'bookings_customer_self',
  'bookings_teacher_self',
  'reviews_public_select_visible',
  'chart_records_self_select',
  'chart_records_teacher_select',
  'settlements_admin_all',
  'settlements_teacher_self_select',
  'support_self_select',
  'support_admin_all',
  'consent_self_insert',
  'daily_readings_self_select',
  'daily_draws_self_insert',
  'member_wallets_self_select',
  'point_transactions_self_select',
  'daily_point_claims_self_select',
  'content_unlocks_self_select',
  'beta_testers_admin_all',
  'beta_testers_self_select',
  'ar_assets_public_select_active',
  'line_links_self_update',
  'match_sessions_self_select',
  'match_sessions_self_insert',
  'match_sessions_self_update',
  'match_sessions_admin_select',
]) {
  log(`RLS policy ${policy}`, SQL.includes(`"${policy}"`));
}

log(
  'bookings direct updates are restricted to admin policy/RPC workflows',
  !SQL.includes('"bookings_customer_cancel"') &&
    !SQL.includes('"bookings_teacher_update"') &&
    !SQL.includes('"bookings_customer_insert"') &&
    SQL.includes('create_booking_request') &&
    SQL.includes('update_booking_followup') &&
    /create\s+policy\s+"bookings_admin_all"[\s\S]+for\s+all/i.test(SQL),
);

log('member points migration exists', existsSync(pointMigrationFile));
log('KYC purge cron migration exists', existsSync(kycPurgeMigrationFile));
log('admin member operations migration exists', existsSync(adminMemberOpsMigrationFile));
log('beta tester operations migration exists', existsSync(betaTesterOpsMigrationFile));
log(
  'member point economy uses 200 daily claim and 100 point unlocks',
  SQL.includes('p_daily_amount int default 200') &&
    SQL.includes('p_cost int default 100') &&
    SQL.includes('member_wallets') &&
    SQL.includes('point_transactions') &&
    SQL.includes('daily_point_claims') &&
    SQL.includes('content_unlocks'),
);
log(
  'daily draws are one tarot-or-rune choice per member per day',
  SQL.includes('uniq_daily_draws_user_date_choice') &&
    SQL.includes('unique (user_id, draw_date)'),
);

console.log('\n=== Next.js app structure ===\n');

const routeFiles = [
  'apps/web/app/page.tsx',
  'apps/web/app/account/login/page.tsx',
  'apps/web/app/account/book/page.tsx',
  'apps/web/app/account/charts/page.tsx',
  'apps/web/app/account/mybookings/page.tsx',
  'apps/web/app/account/payment/[id]/page.tsx',
  'apps/web/app/account/payment/result/page.tsx',
  'apps/web/app/account/profile/page.tsx',
  'apps/web/app/account/privacy/page.tsx',
  'apps/web/app/beta/page.tsx',
  'apps/web/app/admin/page.tsx',
  'apps/web/app/admin/applications/page.tsx',
  'apps/web/app/admin/bookings/page.tsx',
  'apps/web/app/admin/launch/page.tsx',
  'apps/web/app/admin/members/page.tsx',
  'apps/web/app/admin/reviews/page.tsx',
  'apps/web/app/admin/testers/page.tsx',
  'apps/web/app/admin/teachers/page.tsx',
  'apps/web/app/ar/page.tsx',
  'apps/web/app/daily/page.tsx',
  'apps/web/app/mobile/page.tsx',
  'apps/web/app/teacher-portal/page.tsx',
  'apps/web/app/teachers/page.tsx',
  'apps/web/app/teachers/apply/page.tsx',
  'apps/web/app/teachers/[id]/page.tsx',
  'apps/web/app/legal/privacy/page.tsx',
  'apps/web/app/legal/tos/page.tsx',
  'apps/web/app/legal/disclaimer/page.tsx',
  'apps/web/app/tools/numerology/page.tsx',
  'apps/web/app/tools/maya/page.tsx',
  'apps/web/app/tools/bazi/page.tsx',
  'apps/web/app/tools/tarot/page.tsx',
  'apps/web/app/tools/runes/page.tsx',
  'apps/web/app/tools/astro/page.tsx',
  'apps/web/app/tools/ziwei/page.tsx',
  'apps/web/app/tools/humandesign/page.tsx',
];

for (const file of routeFiles) {
  log(`route ${file}`, existsSync(file));
}

for (const file of [
  'apps/web/app/[locale]/layout.tsx',
  'apps/web/app/[locale]/page.tsx',
  'apps/web/app/[locale]/beta/page.tsx',
  'apps/web/app/[locale]/daily/page.tsx',
  'apps/web/app/[locale]/mobile/page.tsx',
  'apps/web/app/[locale]/ar/page.tsx',
  'apps/web/app/[locale]/spiritual/page.tsx',
  'apps/web/app/[locale]/tools/page.tsx',
  'apps/web/app/[locale]/account/login/page.tsx',
  'apps/web/app/[locale]/legal/privacy/page.tsx',
  'apps/web/app/[locale]/legal/tos/page.tsx',
  'apps/web/app/[locale]/legal/disclaimer/page.tsx',
  'apps/web/app/sitemap.ts',
  'apps/web/app/robots.ts',
  'apps/web/components/LanguageSwitcher.tsx',
  'apps/web/components/LocalizedDailyClient.tsx',
  'apps/web/components/LocalizedLoginClient.tsx',
  'apps/web/components/LocalizedStaticPage.tsx',
  'apps/web/lib/i18n/config.ts',
  'apps/web/lib/i18n/dictionaries.ts',
  'apps/web/lib/i18n/release-page-copy.ts',
  'apps/web/lib/i18n/seo.ts',
]) {
  log(`i18n file ${file}`, existsSync(file));
}

const requiredLocalizedTools = ['numerology', 'humandesign', 'tarot', 'runes', 'maya', 'bazi', 'ziwei', 'astro'];

function hasPlaceholderText(value) {
  if (typeof value === 'string') return /\?{2,}/.test(value);
  if (Array.isArray(value)) return value.some(hasPlaceholderText);
  if (value && typeof value === 'object') return Object.values(value).some(hasPlaceholderText);
  return false;
}

for (const locale of ['zh-TW', 'en', 'vi', 'id', 'ja', 'ko']) {
  const localeFile = `locales/${locale}/common.json`;
  const source = existsSync(localeFile) ? readFileSync(localeFile, 'utf8') : '';
  log(`locale common.json ${locale}`, source.includes('"meta"') && source.includes('"nav"') && source.includes('"markets"'));
  const dict = source ? JSON.parse(source) : {};
  log(`locale ${locale} has tools navigation label`, Boolean(dict.nav?.tools));
  log(
    `locale ${locale} has beta entrance copy`,
    Boolean(dict.nav?.beta && dict.beta?.primaryCta && dict.beta?.quests?.length === 3) &&
      !hasPlaceholderText(dict.nav?.beta) &&
      !hasPlaceholderText(dict.beta),
  );
  const toolSlugs = dict.home?.tools?.map((tool) => tool.slug) ?? [];
  log(`locale ${locale} exposes all eight tool entrances`, requiredLocalizedTools.every((tool) => toolSlugs.includes(tool)));
}

const i18nConfig = readFileSync('apps/web/lib/i18n/config.ts', 'utf8');
const i18nMiddleware = readFileSync('apps/web/middleware.ts', 'utf8');
const languageSwitcher = readFileSync('apps/web/components/LanguageSwitcher.tsx', 'utf8');
const sitemapRoute = readFileSync('apps/web/app/sitemap.ts', 'utf8');
log('i18n supports six market locales and default zh-TW', ['zh-TW', 'en', 'vi', 'id', 'ja', 'ko'].every((token) => i18nConfig.includes(token)) && i18nConfig.includes("DEFAULT_LOCALE: Locale = 'zh-TW'"));
log('locale labels are stable and not duplicated', ['\\u7e41\\u9ad4\\u4e2d\\u6587', 'English', 'Ti\\u1ebfng Vi\\u1ec7t', 'Bahasa Indonesia', '\\u65e5\\u672c\\u8a9e', '\\ud55c\\uad6d\\uc5b4'].every((token) => i18nConfig.includes(token)) && !/EnglishEnglish|\?{3,}/.test(i18nConfig));
log('language switcher preserves the current path', languageSwitcher.includes('switchLocaleInPathname') && languageSwitcher.includes('usePathname') && languageSwitcher.includes('useSearchParams'));
log('language switcher renders panel locale names once', !languageSwitcher.includes("className={variant === 'panel' ? '' : 'sr-only'}"));
log('middleware redirects root and rewrites localized legacy routes', i18nMiddleware.includes('pathname === \'/\'') && i18nMiddleware.includes('NextResponse.redirect') && i18nMiddleware.includes('NextResponse.rewrite') && i18nMiddleware.includes('LOCALE_HEADER'));
log('middleware detects browser language before defaulting to Traditional Chinese', i18nMiddleware.includes('localeFromAcceptLanguage') && i18nMiddleware.includes("tag.startsWith('en')") && i18nMiddleware.includes("tag.startsWith('vi')") && i18nMiddleware.includes("tag.startsWith('id')") && i18nMiddleware.includes("tag.startsWith('ja')") && i18nMiddleware.includes("tag.startsWith('ko')"));
log('middleware lets localized beta, market, and tools lobbies render natively', i18nMiddleware.includes("'/beta'") && i18nMiddleware.includes("'/spiritual'") && i18nMiddleware.includes("'/tools'"));
log('middleware lets localized release utility pages render natively', ["'/daily'", "'/mobile'", "'/ar'", "'/account/login'", "'/legal/privacy'", "'/legal/tos'", "'/legal/disclaimer'"].every((token) => i18nMiddleware.includes(token)));
log('sitemap emits localized hreflang alternates', sitemapRoute.includes('buildAlternateLanguages') && sitemapRoute.includes('alternates') && sitemapRoute.includes('languages'));
log('sitemap includes localized utility pages', ["'/daily'", "'/mobile'", "'/ar'", "'/legal/privacy'", "'/legal/tos'", "'/legal/disclaimer'"].every((token) => sitemapRoute.includes(token)));
const localizedMarketPage = readFileSync('apps/web/app/[locale]/spiritual/page.tsx', 'utf8');
const localizedToolsPage = readFileSync('apps/web/app/[locale]/tools/page.tsx', 'utf8');
const localizedBetaPage = readFileSync('apps/web/app/[locale]/beta/page.tsx', 'utf8');
log(
  'localized beta page routes invite testers into signup',
  [
    'dictionary.beta',
    'new URLSearchParams',
    'inviteCode',
    'segment',
    "mode: 'signup'",
    'betaSignupHref(locale, inviteCode, segment)',
    'home-beta-roadmap',
  ].every((token) => localizedBetaPage.includes(token)),
);
log('market page links numerology and human design quick paths', localizedMarketPage.includes("toolLabel('numerology')") && localizedMarketPage.includes("toolLabel('humandesign')"));
log('market page exposes all localized tool entrances', localizedMarketPage.includes('dict.home.tools.map') && localizedMarketPage.includes('`/tools/${tool.slug}`') && localizedMarketPage.includes('home-quick-grid'));
log('localized tools lobby exposes all calculator entrances', localizedToolsPage.includes('dict.home.tools.map') && localizedToolsPage.includes('dict.nav.tools') && localizedToolsPage.includes('`/tools/${tool.slug}`'));
log('sitemap includes the localized tools lobby', sitemapRoute.includes("'/tools'"));
log('sitemap includes the localized beta entry', sitemapRoute.includes("'/beta'"));

for (const tool of ['numerology', 'maya', 'bazi', 'tarot', 'runes', 'astro', 'ziwei', 'humandesign']) {
  const file = `apps/web/app/tools/${tool}/page.tsx`;
  const source = existsSync(file) ? readFileSync(file, 'utf8') : '';
  log(`tool page calls calc('${tool}')`, source.includes(`calc('${tool}'`));
}

const birthInputs = readFileSync('apps/web/components/BirthInputs.tsx', 'utf8');
log(
  'birth input component offers refined quick time controls',
  birthInputs.includes('quickTimes') &&
    birthInputs.includes('formatTimeDisplay') &&
    birthInputs.includes('birth-inputs__summary') &&
    birthInputs.includes('DateSegmentPicker') &&
    birthInputs.includes('TimeSegmentPicker') &&
    birthInputs.includes('birth-inputs__select-row') &&
    birthInputs.includes('birth-inputs__chips--time') &&
    birthInputs.includes('item.hint'),
);
log('birth input component offers timezone presets', birthInputs.includes('Taiwan / Hong Kong / Singapore') && birthInputs.includes('UTC'));
log('birth input component offers location presets', birthInputs.includes('Preset cities') && birthInputs.includes('Taipei') && birthInputs.includes('Singapore'));
const toolShell = readFileSync('apps/web/components/ToolShell.tsx', 'utf8');
const toolPageCopy = readFileSync('apps/web/lib/i18n/tool-page-copy.ts', 'utf8');
log('tool shell uses localized navigation and CTA copy', ['getToolLocaleCopy', "localizePath('/tools'", 'copy.shell.backLabel', '.consult'].every((token) => toolShell.includes(token) || toolPageCopy.includes(token)));
log('tool page copy includes translated tool surfaces', ['Maya Calendar Kin', 'Lịch Maya Kin', 'Kalender Maya Kin', 'マヤ暦 Kin', '마야력 Kin', '馬雅曆 Kin'].every((token) => toolPageCopy.includes(token)));

for (const tool of ['bazi', 'ziwei', 'astro', 'humandesign']) {
  const source = readFileSync(`apps/web/app/tools/${tool}/page.tsx`, 'utf8');
  log(`${tool} page uses shared birth date/time inputs`, source.includes('BirthDateTimeFields'));
}

for (const tool of ['numerology', 'maya']) {
  const source = readFileSync(`apps/web/app/tools/${tool}/page.tsx`, 'utf8');
  log(`${tool} page uses shared date-only input`, source.includes('DateOnlyField'));
}

const astroSource = readFileSync('apps/web/app/tools/astro/page.tsx', 'utf8');
log('astro page sends latitude/longitude schema', astroSource.includes('latitude: lat') && astroSource.includes('longitude: lon'));

const rpcChecks = [
  ['apps/web/app/admin/applications/page.tsx', 'review_teacher_application'],
  ['apps/web/app/admin/applications/page.tsx', 'activate_teacher'],
  ['apps/web/app/admin/members/page.tsx', 'admin_adjust_member_points'],
  ['apps/web/app/admin/members/page.tsx', 'admin_update_member_profile'],
  ['apps/web/app/admin/testers/page.tsx', 'admin_adjust_member_points'],
  ['apps/web/app/admin/testers/page.tsx', 'admin_upsert_beta_tester'],
  ['apps/web/app/admin/teachers/page.tsx', 'suspend_teacher'],
  ['apps/web/app/account/mybookings/page.tsx', 'cancel_booking'],
];

for (const [file, rpc] of rpcChecks) {
  const source = existsSync(file) ? readFileSync(file, 'utf8') : '';
  log(`${file} calls ${rpc}`, source.includes(`rpc('${rpc}'`) || source.includes(`rpc("${rpc}"`));
}

console.log('\n=== Auth, API, and edge integration ===\n');

const nextConfig = readFileSync('apps/web/next.config.mjs', 'utf8');
log('Next rewrite proxies /api/calc', nextConfig.includes('/api/calc/:path*') && nextConfig.includes('/api/v1/calc/:path*'));
log(
  'Next production build requires MELE_API_URL',
  nextConfig.includes('NODE_ENV') &&
    nextConfig.includes('MELE_API_URL') &&
    nextConfig.includes('throw new Error') &&
    !nextConfig.includes("process.env.MELE_API_URL || 'http://127.0.0.1:8015'"),
);
const appLayout = readFileSync('apps/web/app/layout.tsx', 'utf8');
const manifest = readFileSync('apps/web/public/manifest.json', 'utf8');
const serviceWorker = readFileSync('apps/web/public/sw.js', 'utf8');
log(
  'PWA manifest is app-ready Traditional Chinese',
  manifest.includes('"name": "MELE"') &&
    manifest.includes('"short_name": "MELE"') &&
    manifest.includes('自我探索 App') &&
    manifest.includes('"start_url": "/mobile"') &&
    manifest.includes('"display": "standalone"'),
);
log('PWA service worker precaches mobile app shell', serviceWorker.includes("'/mobile'") && serviceWorker.includes('CACHE_NAME') && serviceWorker.includes("caches.match('/mobile')"));
log('app metadata is localized and installable', appLayout.includes('generateMetadata') && appLayout.includes("manifest: '/manifest.json'") && appLayout.includes('applicationName: dictionary.meta.siteName') && appLayout.includes('buildLocalizedMetadata'));
log('layout renders cookie consent banner', appLayout.includes('CookieConsentBanner'));

const apiClient = readFileSync('apps/web/lib/api.ts', 'utf8');
log('API client render palette is string array', apiClient.includes('palette?: string[]'));
log('API client render animations is array', apiClient.includes('animations?: Record<string, unknown>[]'));
log('root package exposes release commands', (() => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  return ['build', 'type-check', 'test'].every((script) => Boolean(pkg.scripts?.[script]));
})());
log('root package no longer points at missing packages workspace', (() => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  return !pkg.workspaces;
})());
const requiredDocs = [
  'docs/ARCHITECTURE.md',
  'docs/BACKEND_BLUEPRINT.md',
  'docs/SUPABASE_AUTH_EMAIL_RUNBOOK.md',
  'docs/OAUTH_LOGIN_RUNBOOK.md',
  'docs/VERIFICATION.md',
  'docs/RELEASE_READINESS.md',
  'docs/LAUNCH_RISK_REGISTER.md',
  'docs/LEGAL_COMPLIANCE_SOP.md',
  'docs/PAYMENT_REFUND_DISPUTE_SOP.md',
  'docs/DEPLOYMENT_RUNBOOK.md',
  'docs/ASSET_LICENSE_REGISTER.md',
  'docs/ALGORITHM_VALIDATION_REGISTER.md',
  'docs/OBSERVABILITY_AND_QA.md',
];
log('release readiness documents exist', requiredDocs.every((file) => existsSync(file)));
const architectureDoc = readFileSync('docs/ARCHITECTURE.md', 'utf8');
const backendBlueprint = readFileSync('docs/BACKEND_BLUEPRINT.md', 'utf8');
const authEmailRunbook = readFileSync('docs/SUPABASE_AUTH_EMAIL_RUNBOOK.md', 'utf8');
const oauthRunbook = readFileSync('docs/OAUTH_LOGIN_RUNBOOK.md', 'utf8');
const verificationDoc = readFileSync('docs/VERIFICATION.md', 'utf8');
const readinessDoc = readFileSync('docs/RELEASE_READINESS.md', 'utf8');
log('architecture doc matches current FastAPI deployment', ['Python FastAPI', 'Node subprocess', '不要把整個產品假設成「只要 Vercel + Supabase 就能上線」', 'Backend Blueprint'].every((token) => architectureDoc.includes(token)));
log('backend blueprint defines service boundaries and rollout', ['Supabase Auth', 'Supabase Postgres', 'Supabase Edge Functions', 'Python FastAPI', 'Phase 1', 'Phase 3'].every((token) => backendBlueprint.includes(token)));
log('auth email runbook covers confirmation diagnostics', ['supabase.auth.resend', 'Redirect URLs', 'SMTP', 'Authentication -> Logs', '重新寄送驗證信'].every((token) => authEmailRunbook.includes(token)));
log('oauth runbook covers Google and LINE provider setup', ['Google Cloud Console', 'LINE Developers', 'custom:line', 'NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN', 'NEXT_PUBLIC_ENABLE_LINE_LOGIN'].every((token) => oauthRunbook.includes(token)));
log('verification doc records algorithm gray areas', ['Human Design', 'Maya Guide', '真太陽時', '不可宣稱事項'].every((token) => verificationDoc.includes(token)));
log('release readiness doc includes no-go and evidence gates', ['No-Go 條件', '發布證據', '正式收費前 P0', 'ops:check-auth'].every((token) => readinessDoc.includes(token)));
const legalSop = readFileSync('docs/LEGAL_COMPLIANCE_SOP.md', 'utf8');
const paymentSop = readFileSync('docs/PAYMENT_REFUND_DISPUTE_SOP.md', 'utf8');
const deployRunbook = readFileSync('docs/DEPLOYMENT_RUNBOOK.md', 'utf8');
const assetRegister = readFileSync('docs/ASSET_LICENSE_REGISTER.md', 'utf8');
const algorithmRegister = readFileSync('docs/ALGORITHM_VALIDATION_REGISTER.md', 'utf8');
const qaPlan = readFileSync('docs/OBSERVABILITY_AND_QA.md', 'utf8');
log('operational SOP docs cover legal payment deployment assets algorithms and QA', [
  legalSop.includes('個資權利請求流程') && legalSop.includes('未成年使用'),
  paymentSop.includes('刷退處理') && paymentSop.includes('老師未出席'),
  deployRunbook.includes('Python FastAPI') && deployRunbook.includes('Rollback'),
  assetRegister.includes('素材與授權登錄表') && assetRegister.includes('商用'),
  algorithmRegister.includes('灰色地帶') && algorithmRegister.includes('上線前最低門檻'),
  qaPlan.includes('Sentry') && qaPlan.includes('必測裝置'),
].every(Boolean));

const login = readFileSync('apps/web/app/account/login/page.tsx', 'utf8');
const localizedLoginClient = readFileSync('apps/web/components/LocalizedLoginClient.tsx', 'utf8');
const authCallback = readFileSync('apps/web/app/auth/callback/route.ts', 'utf8');
const accountPrivacyPage = readFileSync('apps/web/app/account/privacy/page.tsx', 'utf8');
const profilePage = readFileSync('apps/web/app/account/profile/page.tsx', 'utf8');
const chartsPage = readFileSync('apps/web/app/account/charts/page.tsx', 'utf8');
const teacherPortalPage = readFileSync('apps/web/app/teacher-portal/page.tsx', 'utf8');
const teacherCopy = readFileSync('apps/web/lib/i18n/teacher-copy.ts', 'utf8');
const testAuth = readFileSync('apps/web/lib/test-auth.ts', 'utf8');
const testAuthServer = readFileSync('apps/web/lib/test-auth-server.ts', 'utf8');
const headerUserMenu = readFileSync('apps/web/components/HeaderUserMenu.tsx', 'utf8');
const header = readFileSync('apps/web/components/Header.tsx', 'utf8');
const brandLogo = existsSync('apps/web/components/SeaStarLogo.tsx')
  ? readFileSync('apps/web/components/SeaStarLogo.tsx', 'utf8')
  : '';
const brandGlobalCss = readFileSync('apps/web/app/globals.css', 'utf8');
const agentGuide = existsSync('AGENTS.md') ? readFileSync('AGENTS.md', 'utf8') : '';
const cookieConsent = readFileSync('apps/web/components/CookieConsentBanner.tsx', 'utf8');
log('signup requires consent checkbox state', login.includes('agreed') && login.includes('!agreed'));
log('signup requires age confirmation', login.includes('ageConfirmed') && login.includes('未滿 13 歲不得自行註冊'));
log('login supports password reset email', login.includes('resetPasswordForEmail') && login.includes('忘記密碼'));
log('login supports resending signup confirmation email', login.includes("auth.resend") && login.includes("type: 'signup'") && login.includes('重新寄送驗證信') && login.includes('confirmationSending'));
log('signup explains already-registered confirmed emails', login.includes('data.user.identities.length === 0') && login.includes('可能已經註冊'));
log(
  'localized signup explains already-registered emails and email delivery failures',
  localizedLoginClient.includes('data.user.identities.length === 0') &&
    localizedLoginClient.includes('friendlyAuthError') &&
    localizedLoginClient.includes('emailDelivery') &&
    localizedLoginClient.includes('existingAccount'),
);
log('login supports beta invite signup metadata', ["search.get('invite')", "search.get('mode') === 'signup'", 'beta_invite_code', 'beta_segment'].every((token) => login.includes(token)));
log('local test auth is gated to localhost free test mode', testAuth.includes('NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE') && testAuth.includes('isLocalTestHost') && testAuth.includes('localhost'));
log('login offers local test auth fallback', login.includes('使用本機測試帳號') && login.includes('setClientTestAuth') && login.includes('canUseClientTestAuth'));
log('server header recognizes local test auth cookie', header.includes('getServerTestUser') && header.includes('testUser'));
log(
  'header uses compact MELE brand mark and right-side menu',
  header.includes('SeaStarLogo') &&
    brandLogo.includes('MELE') &&
    !brandLogo.includes('海底' + '之星') &&
    brandLogo.includes('sea-star-logo') &&
    header.includes('MobileHeaderMenu') &&
    !header.includes('LanguageSwitcher') &&
    brandGlobalCss.includes('.sea-star-logo'),
);
log(
  'agent handoff guide gives external workers a fast safe path',
  agentGuide.includes('MELE Agent Handoff') &&
    agentGuide.includes('Do not scan') &&
    agentGuide.includes('封測優先順序') &&
    agentGuide.includes('npm.cmd run release:check') &&
    agentGuide.includes('登入 / 註冊 / Email / Google / LINE') &&
    agentGuide.includes('會員點數') &&
    agentGuide.includes('老師後台'),
);
log('local test signout clears browser state', headerUserMenu.includes('clearClientTestAuth'));
log('charts page allows local test auth without Supabase session', chartsPage.includes('readClientTestUser') && chartsPage.includes('本機測試帳號'));
log(
  'teacher portal shows demo backend in local test auth',
  teacherPortalPage.includes('getServerTestUser') &&
    teacherPortalPage.includes('demoTeacher') &&
    teacherPortalPage.includes('copy.portal.demoNotice') &&
    teacherCopy.includes('本機測試模式'),
);
log('server test auth is restricted to local host cookie', testAuthServer.includes('cookies()') && testAuthServer.includes('headers()') && testAuthServer.includes('isLocalTestHost'));
log('social login providers use Supabase settings and env gates', ['NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN', 'NEXT_PUBLIC_ENABLE_LINE_LOGIN', 'NEXT_PUBLIC_LINE_OAUTH_PROVIDER', '/auth/v1/settings', 'custom:line'].every((token) => login.includes(token)));
log(
  'localized login providers use Supabase settings and env gates',
  ['NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN', 'NEXT_PUBLIC_ENABLE_LINE_LOGIN', 'NEXT_PUBLIC_LINE_OAUTH_PROVIDER', '/auth/v1/settings', 'custom:line', 'signInWithOAuth'].every((token) => localizedLoginClient.includes(token)),
);
log('auth callback rejects provider errors and unsafe next URLs', authCallback.includes('auth_callback_failed') && authCallback.includes('error_description') && authCallback.includes('startsWith(\'/\')') && authCallback.includes('!nextParam.startsWith(\'//\')'));
log('auth callback returns errors to the localized login page', authCallback.includes('localizedLoginUrl') && authCallback.includes("localizePath('/account/login'"));
log('account privacy page lets users request data rights', ['資料權利中心', 'create_support_thread', '匯出我的資料', '刪除帳號與資料', '停止特定使用'].every((token) => accountPrivacyPage.includes(token)));
log('profile and account menu expose data rights', profilePage.includes('/account/privacy') && headerUserMenu.includes('/account/privacy') && headerUserMenu.includes('labels?.dataRights'));
log('cookie consent explains local storage and links privacy policy', ['Cookie 與資料使用提示', 'localStorage', '/legal/privacy', 'mele_cookie_consent_v1'].every((token) => cookieConsent.includes(token)));
warn('signup records consent_log row', login.includes('consent_log'), 'recommended for audit completeness');
warn('signup writes privacy_consent_at', login.includes('privacy_consent_at'), 'recommended for audit completeness');
log(
  'signup sends profile consent metadata before email confirmation',
  login.includes('consent_version: CONSENT_VERSION') &&
    login.includes('privacy_consent_at: consentedAt') &&
    login.includes('tos_consent_at: consentedAt') &&
    login.includes('data.user && data.session'),
);
log(
  'signup confirmation links return through auth callback',
  login.includes('emailRedirectTo') &&
    login.includes('/auth/callback?next=') &&
    login.includes('encodeURIComponent(returnUrl)'),
);
log(
  'signup waits for email confirmation before protected return navigation',
  login.includes('signupNotice') &&
    login.includes('if (data.session)') &&
    login.includes('setMode(\'signin\')') &&
    !login.includes('setTimeout(() => router.push(returnUrl), 1500);'),
);
log(
  'password reset recovery exchanges session through auth callback',
  login.includes('resetPasswordForEmail') &&
    login.includes('next=${encodeURIComponent(\'/account/profile\')}') &&
    !login.includes('redirectTo: `${window.location.origin}/account/profile`'),
);
log(
  'login page surfaces auth callback failures',
  login.includes("search.get('error')") &&
    login.includes('auth_failed') &&
    login.includes('authError'),
);
const privacyPage = readFileSync('apps/web/app/legal/privacy/page.tsx', 'utf8');
const tosPage = readFileSync('apps/web/app/legal/tos/page.tsx', 'utf8');
const disclaimerPage = readFileSync('apps/web/app/legal/disclaimer/page.tsx', 'utf8');
const footer = readFileSync('apps/web/components/Footer.tsx', 'utf8');
log('legal pages cover privacy terms and disclaimer', ['隱私權政策', '資料保存與刪除', '兒少與監護人'].every((token) => privacyPage.includes(token)) && ['服務條款', '老師未出席', '平台預設抽成建議為 20%'].every((token) => tosPage.includes(token)) && ['免責聲明', '非醫療、法律、投資或心理治療建議'].every((token) => disclaimerPage.includes(token)));
log('footer links all legal pages', ['/legal/privacy', '/legal/tos', '/legal/disclaimer'].every((token) => footer.includes(token)));

const dailyPage = readFileSync('apps/web/app/daily/page.tsx', 'utf8');
log('daily ritual page persists daily_readings', dailyPage.includes('daily_readings') && dailyPage.includes('upsert'));
log('daily ritual page enforces daily_draws', dailyPage.includes('daily_draws') && dailyPage.includes('draw_date'));
log('daily ritual page supports guest local daily lock', dailyPage.includes('localDrawKey') && dailyPage.includes('localStorage'));
log('daily ritual page calls tarot and runes calculators', dailyPage.includes("drawDaily('tarot')") && dailyPage.includes("drawDaily('runes')"));
log(
  'daily ritual page lets members choose only one daily draw',
  dailyPage.includes('selectedDailyDraw') &&
    dailyPage.includes('hasAnyDailyDraw') &&
    dailyPage.includes('今天已選擇') &&
    dailyPage.includes('每天只能選擇塔羅或盧恩其中一種'),
);
log('daily ritual page shows AR after a draw result', dailyPage.includes('ToolResultSection') && dailyPage.includes('activeResult.tool') && dailyPage.includes('showAr='));
log('daily ritual page includes LINE LIFF panel', dailyPage.includes('LineLiffPanel'));
log('daily ritual page has clean Chinese user guidance', ['每日儀式中心', '每日塔羅', '每日盧恩', '抽到後才進入 AR 呈現', '每日功能怎麼使用'].every((token) => dailyPage.includes(token)));

const linePanel = readFileSync('apps/web/components/LineLiffPanel.tsx', 'utf8');
log('LINE LIFF panel loads official SDK', linePanel.includes('static.line-scdn.net/liff') && linePanel.includes('NEXT_PUBLIC_LIFF_ID'));
log('LINE LIFF panel upserts line_user_links', linePanel.includes("from('line_user_links')") && linePanel.includes('line_user_id'));
log('LINE LIFF panel manages push settings', linePanel.includes('push_enabled') && linePanel.includes('daily_push_hour'));

const rootHomePage = readFileSync('apps/web/app/page.tsx', 'utf8');
const homePage = readFileSync('apps/web/app/[locale]/page.tsx', 'utf8');
const zhCommon = readFileSync('locales/zh-TW/common.json', 'utf8');
const homeGlobalCss = readFileSync('apps/web/app/globals.css', 'utf8');
log('home page does not render AR stage directly', !homePage.includes('ArRelicStage'));
log('root home redirects to default Traditional Chinese locale', rootHomePage.includes("redirect(defaultCanonicalPath())"));
log(
  'localized home has clear Traditional Chinese self-discovery positioning',
  zhCommon.includes('MELE｜多元自我理解工具平台') &&
    zhCommon.includes('多元自我理解工具') &&
    zhCommon.includes('先理解自己，再決定要不要深入') &&
    zhCommon.includes('八種命理入口') &&
    !zhCommon.includes('海底' + '之星') &&
    !zhCommon.includes('老師' + '媒合'),
);
log(
  'localized home presents premium closed-beta command center',
  [
    'getDictionary',
    'markets.items',
    'home.roles',
    '封閉測試任務台',
    '今日可領 200 點',
    '會員付 100 點解鎖',
    '老師只作為進一步諮詢選項',
  ].every((token) => homePage.includes(token) || zhCommon.includes(token)) &&
  [
    'home-hero',
    'home-oracle-console',
    'home-tool-grid',
    "from 'next/image'",
    '/tarot/cards/ocean_poseidon/19.webp',
    '/maya/totems/yellow-human.png',
  ].every((token) => homePage.includes(token)) &&
    [
      '.home-hero',
      '.home-oracle-console',
      '.home-proof-strip',
      '.home-tool-grid',
      '.home-tool-card',
      '.home-role-lanes',
    ].every((token) => homeGlobalCss.includes(token)),
);

const mobileHeaderMenu = readFileSync('apps/web/components/MobileHeaderMenu.tsx', 'utf8');
log('header uses route-driven mobile drawer navigation', header.includes('MobileHeaderMenu') && mobileHeaderMenu.includes('usePathname') && mobileHeaderMenu.includes('setOpen(false)') && !mobileHeaderMenu.includes('pointerdown') && mobileHeaderMenu.includes('Escape'));
log('header menu waits for hydration before accepting clicks', mobileHeaderMenu.includes('setHydrated(true)') && mobileHeaderMenu.includes('disabled={!hydrated}'));
log(
  'header has localized right-side navigation and language switcher',
  ['getDictionary', 'LOCALE_HEADER', 'primaryLinks', 'guestLinks', 'MobileHeaderMenu'].every((token) => header.includes(token)) &&
    ['LanguageSwitcher', 'localizePath'].every((token) => mobileHeaderMenu.includes(token)) &&
    ['\u6bcf\u65e5\u5100\u5f0f', '\u624b\u6a5f\u7248', 'AR \u9ad4\u9a57', '\u8aee\u8a62\u8001\u5e2b', '\u514d\u8cac\u8072\u660e', '\u767b\u5165', '\u8001\u5e2b\u7533\u8acb'].every((token) => zhCommon.includes(token)),
);

const teacherPortal = readFileSync('apps/web/app/teacher-portal/page.tsx', 'utf8');
log(
  'teacher portal localizes booking status',
  teacherPortal.includes('copy.statusLabels') &&
    teacherCopy.includes("pending: '待付款'") &&
    teacherCopy.includes("paid: '已付款'") &&
    teacherCopy.includes("pending: 'Pending payment'"),
);
log('teacher portal keeps booking table mobile readable', teacherPortal.includes('overflow-x-auto') && teacherPortal.includes('min-w-[520px]'));
log(
  'teacher portal includes actionable readiness checklist',
  ['TeacherPortalReadiness', 'copy.readiness.items.profile', 'copy.readiness.items.services', 'copy.readiness.items.testMode'].every((token) => teacherPortal.includes(token)) &&
    ['後台準備度', '公開頁完整度', '服務項目已設定', '測試模式提醒'].every((token) => teacherCopy.includes(token)),
);

const myBookingsPage = readFileSync('apps/web/app/account/mybookings/page.tsx', 'utf8');
const bookingPaymentPageForStatus = readFileSync('apps/web/app/account/payment/[id]/page.tsx', 'utf8');
const paymentResultPageForStatus = readFileSync('apps/web/app/account/payment/result/page.tsx', 'utf8');
log(
  'my bookings pending payment links use only valid booking_status enum values',
  myBookingsPage.includes('/account/payment/${b.id}') &&
    myBookingsPage.includes("b.status === 'pending'") &&
    !myBookingsPage.includes('pending_payment'),
);
log(
  'my bookings uses RPC for booking mutations',
  myBookingsPage.includes("rpc('cancel_booking'") &&
    myBookingsPage.includes("rpc('update_booking_followup'") &&
    !myBookingsPage.includes(".from('bookings').update("),
);
log(
  'my bookings shows free test bookings without payment CTA',
  myBookingsPage.includes('payment_provider') &&
    myBookingsPage.includes('free_test') &&
    myBookingsPage.includes('測試期免費'),
);

const bookingExperiencePage = readFileSync('apps/web/app/account/book/page.tsx', 'utf8');
log(
  'booking pages do not reference invalid booking_status enum values',
  [myBookingsPage, bookingExperiencePage, bookingPaymentPageForStatus, paymentResultPageForStatus, teacherPortal].every(
    (source) => !source.includes('pending_payment') && !source.includes("status === 'cancelled'"),
  ),
);
log('booking flow explains payment and refund expectations', ['付款後可在「我的諮詢」查看狀態', '取消政策', 'question.length'].some((token) => bookingExperiencePage.includes(token)) && bookingExperiencePage.includes('系統仍會以資料庫狀態再次確認'));
log(
  'booking flow supports free test mode through RPC',
  bookingExperiencePage.includes('NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE') &&
    bookingExperiencePage.includes("rpc('create_booking_request'") &&
    bookingExperiencePage.includes('p_free_test_mode') &&
    bookingExperiencePage.includes('/account/mybookings') &&
    bookingExperiencePage.includes('測試期免費') &&
    !bookingExperiencePage.includes(".from('bookings').insert("),
);

const teacherDetailPage = readFileSync('apps/web/app/teachers/[id]/page.tsx', 'utf8');
log(
  'teacher detail page supports conversion trust blocks',
  ['copy.detail.fitTitle', 'copy.detail.styleTitle', 'copy.detail.safetyTitle', 'copy.detail.unavailableTitle'].every((token) => teacherDetailPage.includes(token)) &&
    ['適合對象', '諮詢方式', '平台保障', '尚未開放預約'].every((token) => teacherCopy.includes(token)),
);
const teachersPage = readFileSync('apps/web/app/teachers/page.tsx', 'utf8');
log(
  'teacher list page has self-discovery consultation copy',
  ['copy.directory.title', 'copy.directory.guidanceCta', 'copy.directory.detailAction', 'copy.directory.emptyAction'].every((token) => teachersPage.includes(token)) &&
    ['諮詢老師入口', '進入諮詢引導', '查看老師詳情', '申請成為 MELE 諮詢老師'].every((token) => teacherCopy.includes(token)) &&
    !teacherCopy.includes('命理' + '媒合中心'),
);

const teacherApplyPage = readFileSync('apps/web/app/teachers/apply/page.tsx', 'utf8');
log(
  'teacher application signup uses email confirmation callback',
  teacherApplyPage.includes('emailRedirectTo') &&
    teacherApplyPage.includes('/auth/callback?next=') &&
    teacherApplyPage.includes("localizePath('/teachers/apply', locale)"),
);
log(
  'teacher application has pre-submit readiness guidance',
  ['TeacherApplyChecklist', 'copy.apply.checklist', 'TeacherApplyChecklist'].every((token) => teacherApplyPage.includes(token)) &&
    ['申請前自我檢查', '證件與自介影片', '審核進度', '送出後可以到老師後台看狀態'].every((token) => teacherCopy.includes(token)),
);
log('teacher application persists website through submit and activation', teacherApplyPage.includes('p_website: website') && ['p_website text', 'website', 'v_app.website'].every((token) => SQL.includes(token)));

const tarotPage = readFileSync('apps/web/app/tools/tarot/page.tsx', 'utf8');
const runesPage = readFileSync('apps/web/app/tools/runes/page.tsx', 'utf8');
const numerologyPage = readFileSync('apps/web/app/tools/numerology/page.tsx', 'utf8');
const mayaToolPage = readFileSync('apps/web/app/tools/maya/page.tsx', 'utf8');
const baziToolPage = readFileSync('apps/web/app/tools/bazi/page.tsx', 'utf8');
const astroToolPage = readFileSync('apps/web/app/tools/astro/page.tsx', 'utf8');
const ziweiToolPage = readFileSync('apps/web/app/tools/ziwei/page.tsx', 'utf8');
const humanDesignToolPage = readFileSync('apps/web/app/tools/humandesign/page.tsx', 'utf8');
log('tarot reading result includes AR stage', tarotPage.includes('ToolResultSection') && tarotPage.includes('kind="tarot"'));
log('runes reading result includes AR stage', runesPage.includes('ToolResultSection') && runesPage.includes('kind="runes"'));
log('tarot page offers three visual styles', ['forest_athena', 'ocean_poseidon', 'ancient_pharaoh'].every((style) => toolPageCopy.includes(style)) && tarotPage.includes('tarot_style: tarotStyle'));
log('runes page offers three material choices', ['stone', 'wood', 'crystal'].every((material) => toolPageCopy.includes(`value: '${material}'`)) && runesPage.includes('material,'));
log('tarot and runes pages use localized form copy', ['Forest Athena', 'Ocean Poseidon', 'Ancient Pharaoh', 'Draw cards'].every((token) => toolPageCopy.includes(token)) && ['Stone', 'Wood', 'Crystal', 'Draw runes'].every((token) => toolPageCopy.includes(token)));
log('core tool pages have clean Traditional Chinese copy', [
  [numerologyPage, ["calc('numerology'", 'DateOnlyField', 'ToolResultSection', "getToolPageCopy(locale, 'numerology')"]],
  [mayaToolPage, ["calc('maya'", 'DateOnlyField', 'ToolResultSection', "getToolPageCopy(locale, 'maya')"]],
  [baziToolPage, ["calc('bazi'", 'BirthDateTimeFields', 'ToolResultSection', "getToolPageCopy(locale, 'bazi')"]],
  [astroToolPage, ["calc('astro'", 'LocationFields', 'ToolResultSection', "getToolPageCopy(locale, 'astro')"]],
  [ziweiToolPage, ["calc('ziwei'", 'BirthDateTimeFields', 'ToolResultSection', "getToolPageCopy(locale, 'ziwei')"]],
  [humanDesignToolPage, ["calc('humandesign'", 'ToolResultSection', "getToolPageCopy(locale, 'humandesign')"]],
].every(([source, tokens]) => tokens.every((token) => source.includes(token))) && ['生命靈數', '馬雅曆 Kin', '八字排盤', '紫微斗數', '人類圖'].every((token) => toolPageCopy.includes(token)));
const pythonModels = readFileSync('python_api/models.py', 'utf8');
log('Python tarot schema preserves selected visual style', pythonModels.includes('tarot_style') && pythonModels.includes('forest_athena'));
const arToolPages = [
  ['numerology', 'apps/web/app/tools/numerology/page.tsx'],
  ['maya', 'apps/web/app/tools/maya/page.tsx'],
  ['bazi', 'apps/web/app/tools/bazi/page.tsx'],
  ['ziwei', 'apps/web/app/tools/ziwei/page.tsx'],
  ['astro', 'apps/web/app/tools/astro/page.tsx'],
  ['humandesign', 'apps/web/app/tools/humandesign/page.tsx'],
  ['tarot', 'apps/web/app/tools/tarot/page.tsx'],
  ['runes', 'apps/web/app/tools/runes/page.tsx'],
];
log('all calculator result pages include AR stage', arToolPages.every(([kind, file]) => {
  const source = readFileSync(file, 'utf8');
  return source.includes('ToolResultSection') && source.includes(`kind="${kind}"`) && source.includes('result={result}');
}));

const mobilePage = readFileSync('apps/web/app/mobile/page.tsx', 'utf8');
log('mobile page has phone app shell', mobilePage.includes('mobile-shell') && mobilePage.includes('mobile-tabbar'));
log('mobile page opens AR only after a reading result', mobilePage.includes('ToolResultSection') && mobilePage.includes('activeResult.tool') && !mobilePage.includes('ArRelicStage'));
log('mobile page supports daily tarot and runes', mobilePage.includes("draw('tarot')") && mobilePage.includes("draw('runes')"));
log('mobile page preserves tarot styles and rune materials', ['MOBILE_TAROT_STYLES', 'MOBILE_RUNE_MATERIALS', 'tarot_style: tarotStyle', 'material: runeMaterial', 'mobile-style-panel'].every((token) => mobilePage.includes(token)));
log('mobile page includes guidance flow', ['GUIDANCE PATH', '諮詢引導', '整理建議', '保存這次建議', 'match_sessions'].every((token) => mobilePage.includes(token)) && !mobilePage.includes('命理' + '媒合'));
const matchingHelper = readFileSync('apps/web/lib/teacher-matching.ts', 'utf8');
log('guidance helper scores fixed dimensions', ['scoreTeacherMatch', 'rankTeacherMatches', 'buildMatchReasons', 'return 40', 'styleScore', 'trustScore', 'keywordScore'].every((token) => matchingHelper.includes(token)));
log('matching types are exposed', ['MatchAnswers', 'TeacherMatchResult', 'MatchSession'].every((token) => readFileSync('apps/web/types/db.ts', 'utf8').includes(token)));
const mobileGlobalCss = readFileSync('apps/web/app/globals.css', 'utf8');
log('mobile result SVGs do not create horizontal empty space', ['.mobile-app .mele-svg-wrap', 'overflow-x: hidden', '.mobile-app .mele-svg-wrap--tarot svg', 'max-width: 100%'].every((token) => mobileGlobalCss.includes(token)));
log('mobile matching UI has dedicated CSS', ['.mobile-match-steps', '.mobile-match-card', '.mobile-match-grid', '.mobile-tabbar button.is-active'].every((token) => mobileGlobalCss.includes(token)));

const arStage = readFileSync('apps/web/components/ArRelicStage.tsx', 'utf8');
log('AR relic stage includes human-design/plate/card/stone modes', arStage.includes("'human-design'") && arStage.includes("'plate'") && arStage.includes("'card'") && arStage.includes("'stone'"));
log('AR relic stage avoids unfinished GLB/model-viewer output', !arStage.includes('@google/model-viewer') && !arStage.includes('<model-viewer') && arStage.includes('AR / 3D'));
log('AR relic stage uses stable 2D visual previews', ['RelicPreview', '2D VISUAL READY', 'ritual-relic--${mode}', 'targetFor'].every((token) => arStage.includes(token)));
const readingArStage = readFileSync('apps/web/components/ReadingArStage.tsx', 'utf8');
log('reading AR stage binds tarot/rune result details', readingArStage.includes('getTarotDraw') && readingArStage.includes('getRuneDraw') && readingArStage.includes('positionLabel'));
log('reading AR stage supports all calculator tools', ['numerology', 'maya', 'bazi', 'ziwei', 'tarot', 'runes', 'astro', 'humandesign'].every((kind) => readingArStage.includes(`${kind}:`)));
log('reading AR stage maps tarot/rune visual options', readingArStage.includes('TAROT_STYLE_META') && readingArStage.includes('RUNE_MATERIAL_META') && readingArStage.includes('reading-ar__sculpture--${style}') && readingArStage.includes('reading-ar__sculpture--${material}'));
log('reading result stage pauses unfinished GLB/model-viewer output', !readingArStage.includes('<model-viewer') && readingArStage.includes('AR / 3D') && readingArStage.includes('2D'));
log('human design avoids unfinished 3D and uses refined 2D BodyGraph', ['HumanDesignPlanarPreview', 'BodyGraph', 'reading-ar__hd-svg', '2D'].every((token) => readingArStage.includes(token)));
log('reading AR stage removed unused flat identity renderer', !readingArStage.includes('function ReadingIdentity') && !readingArStage.includes('function PlateArt'));
log('reading AR stage has clean result copy hooks', ['VISUAL RESULT STAGE', 'TarotPreview', 'RunePreview', 'PlatePreview'].every((token) => readingArStage.includes(token)));
log('reading AR stage uses refined visual previews as primary', ['VisualPreview', 'reading-ar__model-zone', 'reading-ar__sculpture', 'ReadingDetails'].every((token) => readingArStage.includes(token)));
const globalCss = readFileSync('apps/web/app/globals.css', 'utf8');
log('tarot visual result can switch between drawn cards', ['getTarotDraws', 'activeTarotIndex', 'setActiveTarotIndex', 'reading-ar__carousel', '上一張', '下一張', 'aria-pressed'].every((token) => readingArStage.includes(token)));
log('reading AR carousel CSS is responsive', ['.reading-ar__carousel', '.reading-ar__carousel-button', '.reading-ar__carousel-dots', '.reading-ar__carousel-dot.is-active'].every((token) => globalCss.includes(token)));
log('reading AR stage explains visual diagrams for beginners', ['VisualDiagramGuide', '圖面導覽', '中間主題', '外圈結構', '線條代表', '八字先看日主'].every((token) => readingArStage.includes(token)));
log('reading AR diagram guide CSS is readable', ['.reading-ar__diagram-guide', '.reading-ar__diagram-guide-grid', '.reading-ar__diagram-guide-card', '.reading-ar__diagram-guide-note'].every((token) => globalCss.includes(token)));
log('AR visual CSS includes tarot styles and rune materials', ['reading-ar__sculpture--forest_athena', 'reading-ar__sculpture--ocean_poseidon', 'reading-ar__sculpture--ancient_pharaoh', 'reading-ar__sculpture--stone', 'reading-ar__sculpture--wood', 'reading-ar__sculpture--crystal'].every((selector) => globalCss.includes(selector)));
log('tarot AR cards include ornate illustration layers', ['card-art__mini-frame', 'card-art__scene', 'card-art__caption', 'reading-ar__card-art--forest_athena', 'reading-ar__card-art--ocean_poseidon', 'reading-ar__card-art--ancient_pharaoh'].every((token) => readingArStage.includes(token) || globalCss.includes(token)));
log('non-tarot AR plates include ornate 3D quality layers', ['sculpture-plate__rim--outer', 'sculpture-plate__rim--middle', 'sculpture-plate__nodes', 'sculpture-plate__thickness'].every((token) => readingArStage.includes(token) || globalCss.includes(token)));
log('rune AR stones include premium 3D material layers', ['sculpture-rune__rim', 'sculpture-rune__bevel', 'sculpture-rune__grain--one', 'reading-ar__sculpture--wood', 'reading-ar__sculpture--crystal'].every((token) => readingArStage.includes(token) || globalCss.includes(token)));
log('reading AR stage CSS makes 3D model the primary visual', ['.reading-ar__stage', 'perspective: 1100px', '.reading-ar__model-zone', '.reading-ar__model', '.reading-ar__details', '.reading-ar__actions'].every((token) => globalCss.includes(token)));
log('CSS fallback has sculpted tarot/rune/plate 3D layers', ['.reading-ar__sculpture--tarot', '.sculpture-card__thickness', '.reading-ar__sculpture--rune', '.sculpture-rune__bevel', '.reading-ar__sculpture--plate', '.sculpture-plate__thickness'].every((token) => globalCss.includes(token)));
log('result CSS includes personal reading and next-step flow', ['.personal-reading', '.personal-reading__grid', '.result-next-steps', '.result-next-steps__grid', '.result-next-steps__actions', '.reading-ar__viewer-state'].every((token) => globalCss.includes(token)));
log('result CSS includes interactive reading card states', ['.result-insights__member-prompt', '.result-insights__card-button', '.result-insights__card.is-active', '.result-insights__resonate', '.personal-reading__focus', '.personal-reading__point-action', '.personal-reading__point.is-selected'].every((token) => globalCss.includes(token)));
log('result CSS includes member onboarding path cards', ['.member-action-path', '.member-action-path__steps', '.member-action-path__step.is-primary', '.member-action-path__actions'].every((token) => globalCss.includes(token)));
log('CSS includes teacher readiness surfaces', ['.teacher-readiness', '.teacher-readiness__grid', '.teacher-readiness__item.is-complete', '.teacher-readiness__actions'].every((token) => globalCss.includes(token)));
const toolResult = readFileSync('apps/web/components/ToolResult.tsx', 'utf8');
const memberUnlocks = existsSync('apps/web/lib/member-unlocks.ts')
  ? readFileSync('apps/web/lib/member-unlocks.ts', 'utf8')
  : '';
const mayaTotemGlyph = readFileSync('apps/web/components/MayaTotemGlyph.tsx', 'utf8');
const mayaTotemAssetDir = 'apps/web/public/maya/totems';
const mayaTotemAssets = existsSync(mayaTotemAssetDir)
  ? readdirSync(mayaTotemAssetDir).filter((file) => file.endsWith('.png'))
  : [];
log(
  'maya has a complete 20 totem glyph registry',
  [
    'MAYA_TOTEMS',
    'Red Dragon',
    'White Wind',
    'Blue Night',
    'Yellow Seed',
    'Red Serpent',
    'White Worldbridger',
    'Blue Hand',
    'Yellow Star',
    'Red Moon',
    'White Dog',
    'Blue Monkey',
    'Yellow Human',
    'Red Skywalker',
    'White Wizard',
    'Blue Eagle',
    'Yellow Warrior',
    'Red Earth',
    'White Mirror',
    'Blue Storm',
    'Yellow Sun',
  ].every((token) => mayaTotemGlyph.includes(token)),
);
log(
  'maya uses designed PNG totem assets instead of inline SVG glyphs',
  mayaTotemAssets.length === 20 &&
    mayaTotemGlyph.includes("from 'next/image'") &&
    mayaTotemGlyph.includes('<Image') &&
    mayaTotemGlyph.includes('assetPath') &&
    !mayaTotemGlyph.includes('<svg') &&
    !mayaTotemGlyph.includes('<path') &&
    !mayaTotemGlyph.includes('<circle'),
);
log(
  'maya result uses totem glyphs in gallery, cards, and visual stage',
  toolResult.includes('MayaTotemGallery') &&
    toolResult.includes('MayaOracleBoard') &&
    toolResult.includes('MayaTotemGlyph') &&
    toolResult.includes('mayaSeal') &&
    readingArStage.includes('MayaTotemGlyph') &&
    readingArStage.includes('sculpture-plate__maya-totem') &&
    globalCss.includes('.maya-oracle-board') &&
    globalCss.includes('.maya-totem-gallery') &&
    globalCss.includes('.sculpture-plate__maya-totem'),
);
log('tool result gives members an actionable onboarding path', ['MemberActionPath', 'MEMBER ONBOARDING', '保存這次解讀', '/account/login?return=/account/charts', '回到每日儀式', '找老師深度解讀'].every((token) => toolResult.includes(token)));
log('tool result cards get per-tool ornate styling hooks', toolResult.includes('tool-result-card--${result.tool}') && toolResult.includes('mele-svg-wrap--${result.tool}'));
log('tool result adds readable per-tool explanations', ['TOOL_COPY', 'buildInsight', 'ResultInsightPanel', 'result-insights', 'tarotCards', 'runeCards', 'gateCards'].every((token) => toolResult.includes(token)));
log(
  'tool result adds beginner member guide for all calculators',
  ['BEGINNER_GUIDES', 'BeginnerGuidePanel', '會員初階導讀', '初步認識自己', '瑪雅曆', 'Kin 是你的瑪雅曆身份編號', '調性像是你的做事節奏', '圖騰像是你的核心天賦']
    .every((token) => toolResult.includes(token)) &&
    ['numerology', 'maya', 'bazi', 'ziwei', 'tarot', 'runes', 'astro', 'humandesign'].every((tool) => toolResult.includes(`${tool}:`)),
);
log('result CSS includes beginner member guide cards', ['.beginner-guide', '.beginner-guide__header', '.beginner-guide__grid', '.beginner-guide__item', '.beginner-guide__note'].every((token) => globalCss.includes(token)));
log('tool result reading cards support member interactions', ['result-insights__member-prompt', 'result-insights__card-button', 'result-insights__card-body', 'result-insights__resonate', 'aria-pressed', 'personal-reading__focus', 'personal-reading__point-action'].every((token) => toolResult.includes(token)));
log('tool result adds personal reading summary for all tools', ['buildPersonalReading', 'PersonalReadingPanel', 'PERSONAL READING', '我的優勢', '可能卡點', '今日行動'].every((token) => toolResult.includes(token)));
log('tool result gives clear post-reading next steps', ['RESULT_NEXT_STEPS', 'ResultNextSteps', '\u63a5\u4e0b\u4f86\u53ef\u4ee5\u9019\u6a23\u770b', '\u9810\u7d04\u8001\u5e2b\u89e3\u8b80', '2D'].every((token) => toolResult.includes(token)));
log('tool result covers every calculator explanation type', ['numerology', 'maya', 'bazi', 'ziwei', 'tarot', 'runes', 'astro', 'humandesign'].every((tool) => toolResult.includes(`${tool}:`)));
log('tool result has clean Chinese result states', ['結果重點解讀', '生命靈數解讀', '塔羅牌解讀', '正在整理解讀', '解讀失敗'].every((token) => toolResult.includes(token)));
log('tool result gives unique Maya and Human Design card copy', toolResult.includes('MAYA_ORACLE_COPY') && toolResult.includes('GATE_BRIEFS') && toolResult.includes('顯示生產者') && toolResult.includes('情緒權威'));
log('result CSS prevents compressed unreadable mobile charts', ['.result-insights', 'overflow-wrap: anywhere', '@media (max-width: 720px)', 'overflow-x: auto', 'width: 860px'].every((token) => globalCss.includes(token)));
log('tool result uses beginner-readable reading map', ['GAME_META', 'buildGameProfile', 'ResultGamePanel', 'READING MAP', '新手閱讀順序', '第 1 步｜先看核心主題', '不用一次看懂全部'].every((token) => toolResult.includes(token)));
log('tool result gamified quest links to visual stage', ['#reading-ar-stage', '前往視覺展示', '穩定 2D 展示'].every((token) => toolResult.includes(token)) && readingArStage.includes('id="reading-ar-stage"'));
log('result CSS includes gamified quest panel', ['.result-game', '.result-game__meter', '.result-game__stats', '.result-game__badges', '.result-game__quests', '.result-game__actions'].every((token) => globalCss.includes(token)));
log(
  'tool result exposes member point unlock flow',
  ['PointUnlockPanel', 'claim_daily_points', 'unlock_content', '100 點', '每天可領 200 點', '流日', '流月', '流年']
    .every((token) => toolResult.includes(token)),
);
log(
  'member unlock library provides real closed-beta content',
  existsSync('apps/web/lib/member-unlocks.ts') &&
    ['MEMBER_UNLOCK_OPTIONS', 'buildUnlockedReadingContent', 'buildTeacherReadingBrief', 'unlockScopeKey', 'DAILY_POINT_AMOUNT', 'POINT_UNLOCK_COST', 'deep_reading', 'transit_day', 'transit_month', 'transit_year', '此象', '宜', '忌'].every((token) => memberUnlocks.includes(token)) &&
    !['預留', '之後可把', '正式內容上線', '槽位'].some((token) => memberUnlocks.includes(token)),
);
log(
  'tool result uses generated unlock content instead of inline placeholders',
  toolResult.includes('buildUnlockedReadingContent') &&
    toolResult.includes('getUnlockScopeKey') &&
    toolResult.includes('reading.sections.map') &&
    !toolResult.includes('unlockedBody'),
);
log(
  'tool result saves logged-in calculator results to chart_records',
  toolResult.includes("from('chart_records')") &&
    toolResult.includes('input_data: resultForSave.input') &&
    toolResult.includes('output_data: resultForSave.data') &&
    toolResult.includes('savedRecordKeys'),
);
log('result CSS includes point unlock panel', ['.point-unlock', '.point-unlock__balance', '.point-unlock__grid', '.point-unlock__option'].every((token) => globalCss.includes(token)));
log(
  'charts page shows member wallet and unlock archive',
  ['member_wallets', 'content_unlocks', '會員點數', '解鎖紀錄', '每天可領 200 點', 'member-vault', 'member-unlock-history'].every((token) => chartsPage.includes(token)) &&
    ['.member-vault', '.member-vault__stats', '.member-unlock-history', '.chart-history-card'].every((token) => globalCss.includes(token)),
);
log(
  'charts page reads content unlock timestamps from the migration schema',
  chartsPage.includes('created_at') &&
    chartsPage.includes(".order('created_at'") &&
    !chartsPage.includes('unlocked_at'),
);
log(
  'teacher portal shows member detail briefs for booked customers',
  ['chart_records', 'buildTeacherReadingBrief', 'customer_question', 'chart_data', 'teacher-member-brief', 'TeacherMemberBriefPanel', 'TeacherReadingAssistPanel'].every((token) => teacherPortal.includes(token)) &&
    ['會員詳解備忘', '輔助解盤工作台', '流日 / 流月 / 流年延伸'].every((token) => teacherCopy.includes(token)) &&
    ['.teacher-member-brief', '.teacher-member-brief__grid', '.teacher-member-brief__item'].every((token) => globalCss.includes(token)),
);
const explanations = readFileSync('python_api/engines/explanations.py', 'utf8');
log('backend explanations include non-repetitive Maya oracle roles', explanations.includes('MAYA_ORACLE_ROLES') && explanations.includes('這股力量不是敵人') && !explanations.includes('提醒你從不同角度理解本命 Kin'));
log('backend explanations include richer Bazi day-master guidance', explanations.includes('DAY_MASTER_GUIDE') && explanations.includes('PILLAR_ROLES') && explanations.includes('月令、十神、格局'));
log('backend explanations include Human Design gate meanings', explanations.includes('GATE_MEANINGS') && explanations.includes('第 {gate} 閘門｜') && explanations.includes('家庭與承諾'));
const rendererCommon = readFileSync('python_api/renderers/common.py', 'utf8');
const mayaRenderer = readFileSync('python_api/renderers/maya_render.py', 'utf8');
const tarotRenderer = readFileSync('python_api/renderers/tarot_render.py', 'utf8');
const runesRenderer = readFileSync('python_api/renderers/runes_render.py', 'utf8');
log('calculator SVG renderers share ornate oracle backdrop', rendererCommon.includes('def oracle_backdrop') && ['numerology_render.py', 'maya_render.py', 'bazi_render.py', 'ziwei_render.py', 'astro_render.py', 'hd_render.py'].every((file) => readFileSync(`python_api/renderers/${file}`, 'utf8').includes('oracle_backdrop')));
log(
  'Maya oracle board places challenge left and hidden force bottom',
  mayaRenderer.includes("{cell(130, 380, '挑戰', oracle.get('antipode'))}") &&
    mayaRenderer.includes("{cell(250, 480, '隱藏推動力', oracle.get('occult'))}"),
);
log('tarot result SVG is illustrated, not text-only', ['_card_art', 'tarot_style', 'STYLE_META', 'oracle_backdrop', 'stroke="url(#{uid}-gold)"'].every((token) => tarotRenderer.includes(token)));
log('rune result SVG has material textures', ['MATERIAL_STYLE', '_stone_shape', '水晶', '木頭', '石面', 'oracle_backdrop'].every((token) => runesRenderer.includes(token)));
log('tarot result SVG uses enlarged card showcase layout', ['card_w, card_h, gap = 164, 284, 34', 'height = 500', 'font-size="14"', 'y="460"'].every((token) => tarotRenderer.includes(token)));
const arGlbAssets = [
  ['apps/web/public/ar/tarot-card.glb', 60000],
  ['apps/web/public/ar/rune-stone.glb', 45000],
  ['apps/web/public/ar/astral-plate.glb', 180000],
  ['apps/web/public/ar/human-design-bodygraph.glb', 160000],
];
log('AR GLB assets are detailed sculpted models', arGlbAssets.every(([file, minBytes]) => existsSync(file) && statSync(file).size >= minBytes));
const hdRenderer = readFileSync('python_api/renderers/hd_render.py', 'utf8');
log('Human Design renderer shows unique gate meanings', hdRenderer.includes('GATE_MEANINGS') && hdRenderer.includes('hd-gate-copy') && hdRenderer.includes('第 {gate} 閘門｜{gate_title}'));

const paymentPage = readFileSync('apps/web/app/account/payment/[id]/page.tsx', 'utf8');
log('booking payment page invokes ecpay-checkout', paymentPage.includes("functions.invoke('ecpay-checkout'") && paymentPage.includes('ecpay-form'));
log(
  'booking payment page skips ECPay during free test mode',
  paymentPage.includes('NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE') &&
    paymentPage.includes('free_test') &&
    paymentPage.includes("bookingData.status === 'pending'") &&
    paymentPage.includes('測試期免費'),
);
const paymentResultPage = readFileSync('apps/web/app/account/payment/result/page.tsx', 'utf8');
log('payment result page shows booking state and recovery actions', ['付款已收到', '付款狀態確認中', '查看我的預約', 'ClientBackURL'].every((token) => paymentResultPage.includes(token)));

const bookPage = readFileSync('apps/web/app/account/book/page.tsx', 'utf8');
log(
  'booking flow routes after RPC by payment mode',
  bookPage.includes("rpc('create_booking_request'") &&
    bookPage.includes('/account/payment/') &&
    bookPage.includes('/account/mybookings'),
);

const adminPage = readFileSync('apps/web/app/admin/page.tsx', 'utf8');
const adminLayout = readFileSync('apps/web/app/admin/layout.tsx', 'utf8');
log('admin dashboard includes operational readiness widgets', ['營運總覽', '待審老師', '上架老師', '今日解盤', '公開發布檢查'].every((token) => adminPage.includes(token)));
log('admin login redirect preserves the requested admin path', ['PATH_HEADER', 'stripLocaleFromPathname', 'encodeURIComponent(returnPath)', '/account/login?return='].every((token) => adminLayout.includes(token)));
const adminMembersPage = readFileSync('apps/web/app/admin/members/page.tsx', 'utf8');
log(
  'admin members page manages wallet and profile through RPCs',
  ['member_wallets', 'point_transactions', 'content_unlocks', 'profiles', 'admin_adjust_member_points', 'admin_update_member_profile', '調整原因'].every((token) => adminMembersPage.includes(token)) &&
    adminPage.includes('/admin/members'),
);
const adminTestersPage = readFileSync('apps/web/app/admin/testers/page.tsx', 'utf8');
log(
  'admin testers page manages invite tracking, feedback, and point support',
  ['beta_testers', 'daily_point_claims', 'content_unlocks', 'admin_upsert_beta_tester', 'admin_adjust_member_points', 'copyInvite', 'closed-beta', '/zh-TW/beta'].every((token) => adminTestersPage.includes(token)) &&
    adminPage.includes('/admin/testers') &&
    adminLayout.includes('/admin/testers'),
);
const launchPage = readFileSync('apps/web/app/admin/launch/page.tsx', 'utf8');
log('admin launch checklist checks production env', launchPage.includes('NEXT_PUBLIC_LIFF_ID') && launchPage.includes('MELE_API_URL') && launchPage.includes('iPhone AR fallback'));
log('admin launch checklist separates cloud manual checks', ['SQL migrations 檔案完整', 'ECPay checkout secrets', '封閉公測名單', 'Auth 驗證信與 Redirect URLs', 'ops:check-auth'].every((token) => launchPage.includes(token)));
log('admin launch checklist covers current migrations', ['0009_member_points_unlocks.sql', '0010_kyc_auto_purge_cron.sql', '0011_admin_member_ops.sql', '0012_beta_tester_ops.sql', '0001-0012', 'member_wallets', 'content_unlocks', 'daily_point_claims', 'beta_testers'].every((token) => launchPage.includes(token)));
const retiredNumerologyFunction = existsSync('supabase/functions/calc-numerology/index.ts');
log('retired calc-numerology edge function is removed', !retiredNumerologyFunction);

const webhook = existsSync('supabase/functions/ecpay-webhook/index.ts')
  ? readFileSync('supabase/functions/ecpay-webhook/index.ts', 'utf8')
  : '';
log('ECPay webhook exists', Boolean(webhook));
log('ECPay webhook validates CheckMacValue', webhook.includes('CheckMacValue') && webhook.includes('SHA-256'));
log('ECPay webhook uses official space encoding', webhook.includes(".replace(/%20/g, '+')"));
log('ECPay webhook calls confirm_payment', webhook.includes("rpc('confirm_payment'") || webhook.includes('rpc("confirm_payment"'));
log('ECPay webhook returns 1|OK', webhook.includes('1|OK'));

const checkout = existsSync('supabase/functions/ecpay-checkout/index.ts')
  ? readFileSync('supabase/functions/ecpay-checkout/index.ts', 'utf8')
  : '';
log('ECPay checkout function exists', Boolean(checkout));
log('ECPay checkout function signs CheckMacValue', checkout.includes('CheckMacValue') && checkout.includes('SHA-256'));
log('ECPay checkout function uses CustomField1 booking id', checkout.includes('CustomField1') && checkout.includes('booking.id'));
log(
  'ECPay checkout only accepts pending bookings',
  checkout.includes("booking.status !== 'pending'") && !checkout.includes("['pending', 'cancelled']"),
);

const edgeCors = existsSync('supabase/functions/_shared/cors.ts')
  ? readFileSync('supabase/functions/_shared/cors.ts', 'utf8')
  : '';
log(
  'Edge Function CORS uses configured allowlist',
  edgeCors.includes('corsHeadersFor') &&
    edgeCors.includes('MELE_WEB_URL') &&
    edgeCors.includes('MELE_ALLOWED_ORIGINS') &&
    !edgeCors.includes("'Access-Control-Allow-Origin': '*'"),
);
log(
  'payment edge functions use request-scoped CORS headers',
  checkout.includes('corsHeadersFor(req)') && webhook.includes('corsHeadersFor(req)'),
);

const pythonMain = readFileSync('python_api/main.py', 'utf8');
log(
  'Python API rate limit trusts forwarded headers only when configured',
  pythonMain.includes('MELE_TRUST_PROXY_HEADERS') && pythonMain.includes('trusted proxy'),
);
log(
  'Python API global errors are generic and do not override CORS wildcard',
  pythonMain.includes('"internal_server_error"') &&
    !pythonMain.includes('content={"error": str(exc)') &&
    !pythonMain.includes('Access-Control-Allow-Origin'),
);

const linePush = existsSync('supabase/functions/line-daily-push/index.ts')
  ? readFileSync('supabase/functions/line-daily-push/index.ts', 'utf8')
  : '';
log('LINE daily push function exists', Boolean(linePush));
log('LINE daily push function sends push message', linePush.includes('api.line.me/v2/bot/message/push') && linePush.includes('LINE_CHANNEL_ACCESS_TOKEN'));

console.log('\n============================');
console.log(`Structure verification: \x1b[32m${passed} passed\x1b[0m / \x1b[33m${warned} warnings\x1b[0m / \x1b[31m${failed} failed\x1b[0m`);
process.exit(failed > 0 ? 1 : 0);
