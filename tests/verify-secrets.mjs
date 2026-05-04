import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

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

const ignoredDirs = new Set([
  '.git',
  '.next',
  '.next.prev-20260429-055018',
  '.py312-packages',
  '.pytest_cache',
  '.tmp',
  'node_modules',
  'venv',
]);

const ignoredFiles = new Set([
  'package-lock.json',
  'tsconfig.tsbuildinfo',
  'sample_extracted.html',
  '新增 RTF 格式.rtf',
]);

const textExts = new Set([
  '.bat',
  '.cmd',
  '.css',
  '.env',
  '.example',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mjs',
  '.py',
  '.sql',
  '.ts',
  '.tsx',
  '.txt',
  '.yaml',
  '.yml',
]);

function extOf(file) {
  const index = file.lastIndexOf('.');
  return index === -1 ? '' : file.slice(index);
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch (error) {
    if (['EACCES', 'EPERM', 'ENOENT'].includes(error?.code)) return out;
    throw error;
  }

  for (const entry of entries) {
    if (ignoredDirs.has(entry)) continue;
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch (error) {
      if (['EACCES', 'EPERM', 'ENOENT'].includes(error?.code)) continue;
      throw error;
    }
    if (stat.isDirectory()) {
      walk(full, out);
      continue;
    }
    if (ignoredFiles.has(entry)) continue;
    if (stat.size > 1_000_000) continue;
    const ext = extOf(entry);
    if (textExts.has(ext) || entry.startsWith('.env')) out.push(full);
  }
  return out;
}

console.log('\n=== Secret leakage verification ===\n');

ok('secret scan ignores pytest cache directories', ignoredDirs.has('.pytest_cache'));

const files = walk('.');
const frontendFiles = files.filter((file) => file.startsWith(`apps${'\\'}web${'\\'}`) || file.startsWith(`apps/web/`));

const frontendSecretTokens = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'ECPAY_HASH_KEY',
  'ECPAY_HASH_IV',
  'LINE_CHANNEL_ACCESS_TOKEN',
];

for (const token of frontendSecretTokens) {
  const offenders = frontendFiles.filter((file) => {
    const source = readFileSync(file, 'utf8');
    if (file.endsWith('.env.local.example')) return false;
    return source.includes(`${token}=`);
  });
  ok(`frontend does not define ${token}`, offenders.length === 0, offenders.join(', '));
}

const repoSources = files.map((file) => [file, readFileSync(file, 'utf8')]);
const serviceRoleDefinitions = repoSources.filter(([file, source]) => {
  if (file.endsWith('.env.example')) return false;
  if (file.startsWith(`docs${'\\'}`) || file.startsWith('docs/')) return false;
  if (file.startsWith(`supabase${'\\'}README.md`) || file === 'supabase/README.md') return false;
  if (file.includes('verify-secrets.mjs')) return false;
  return source.includes('SUPABASE_SERVICE_ROLE_KEY=');
});
ok('service_role key is not defined outside docs/examples', serviceRoleDefinitions.length === 0, serviceRoleDefinitions.map(([file]) => file).join(', '));

const probableJwtSecrets = repoSources.filter(([file, source]) => {
  if (file.includes('verify-secrets.mjs')) return false;
  return /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/.test(source);
});
ok('repository does not contain committed JWT-like secrets', probableJwtSecrets.length === 0, probableJwtSecrets.map(([file]) => file).join(', '));

const probableEcpaySecrets = repoSources.filter(([file, source]) => {
  if (file.endsWith('.env.example')) return false;
  if (file.startsWith(`docs${'\\'}`) || file.startsWith('docs/')) return false;
  if (file.startsWith(`supabase${'\\'}README.md`) || file === 'supabase/README.md') return false;
  if (file.includes('verify-secrets.mjs')) return false;
  return /ECPAY_(HASH_KEY|HASH_IV)=\S{12,}/.test(source);
});
ok('repository does not contain committed ECPay hash values', probableEcpaySecrets.length === 0, probableEcpaySecrets.map(([file]) => file).join(', '));

ok('web .env.local stays local only', existsSync('apps/web/.gitignore') && readFileSync('apps/web/.gitignore', 'utf8').includes('.env*.local'));

console.log('\n============================');
console.log(`Secret verification: \x1b[32m${passed} passed\x1b[0m / \x1b[31m${failed} failed\x1b[0m`);
process.exit(failed > 0 ? 1 : 0);
