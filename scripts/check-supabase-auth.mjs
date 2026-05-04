import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envFiles = [
  resolve('apps/web/.env.local'),
  resolve('.env.local'),
  resolve('.env'),
];

function parseEnvFile(file) {
  if (!existsSync(file)) return {};
  const result = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (!match) continue;
    result[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return result;
}

const env = Object.assign({}, ...envFiles.map(parseEnvFile), process.env);
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const siteUrl = env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const expectedCallback = `${siteUrl.replace(/\/$/, '')}/auth/callback`;
const wantsGoogle = env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN === 'true';
const wantsLine = env.NEXT_PUBLIC_ENABLE_LINE_LOGIN === 'true';
const lineProvider = env.NEXT_PUBLIC_LINE_OAUTH_PROVIDER || 'custom:line';
const lineProviderName = lineProvider.replace(/^custom:/, '');

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`OK   ${message}`);
}

function note(message) {
  console.log(`INFO ${message}`);
}

function detectLineProvider(settings) {
  const external = settings.external ?? {};
  const candidates = [
    lineProvider,
    lineProviderName,
    'line',
    `custom_${lineProviderName}`,
    `custom:${lineProviderName}`,
  ];

  return candidates.some((key) => external[key] === true)
    || (
      typeof external.custom === 'object'
      && external.custom !== null
      && external.custom[lineProviderName] === true
    );
}

if (!supabaseUrl || !anonKey) {
  fail('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.');
  process.exit();
}

let settings;
try {
  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/settings`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });
  if (!response.ok) {
    fail(`Supabase Auth settings returned HTTP ${response.status}.`);
    process.exit();
  }
  settings = await response.json();
} catch (error) {
  fail(`Cannot reach Supabase Auth settings: ${error.message}`);
  process.exit();
}

note(`Project URL: ${supabaseUrl}`);
note(`Expected local/site callback: ${expectedCallback}`);
note('Dashboard must allow this callback under Authentication -> URL Configuration -> Redirect URLs.');

if (settings.disable_signup === false) {
  pass('Signup is enabled.');
} else {
  fail('Signup is disabled in Supabase Auth settings.');
}

if (settings.external?.email === true) {
  pass('Email provider is enabled.');
} else {
  fail('Email provider is not enabled.');
}

if (settings.external?.google === true) {
  pass('Google provider is enabled in Supabase.');
} else if (wantsGoogle) {
  fail('Google login is allowed by frontend config, but Supabase Google provider is not enabled.');
} else {
  note('Google provider is not enabled; frontend should keep Google login disabled.');
}

const lineEnabled = detectLineProvider(settings);
if (wantsLine && lineEnabled) {
  pass(`LINE provider appears enabled in public Auth settings as "${lineProvider}".`);
} else if (wantsLine) {
  fail(`LINE login is allowed by frontend config, but public Auth settings do not expose "${lineProvider}". Confirm custom OAuth provider in Supabase Dashboard.`);
} else if (lineEnabled) {
  note(`LINE provider appears enabled in Supabase, but frontend switch is disabled. Set NEXT_PUBLIC_ENABLE_LINE_LOGIN=true when ready.`);
} else {
  note('LINE login frontend switch is disabled.');
}

if (settings.mailer_autoconfirm === false) {
  pass('Email confirmation is required, so signup should send a confirmation email.');
} else {
  note('Email confirmation is auto-confirmed; users may not receive a confirmation email.');
}

note('This public check cannot read SMTP, bounce suppression, email rate-limit logs, or redirect allowlist values.');
note('If the UI says the email was sent but no mail arrives, check Supabase Auth Logs and SMTP delivery next.');
