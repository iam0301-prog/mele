import { spawnSync } from 'node:child_process';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const args = process.argv.slice(2);
const useShell = process.platform === 'win32';

function run(label, commandArgs, extraEnv = {}) {
  console.log(`\n=== ${label} ===\n`);
  const result = spawnSync(npmCmd, commandArgs, {
    cwd: process.cwd(),
    env: { ...process.env, ...extraEnv },
    stdio: 'inherit',
    shell: useShell,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('Build frontend for production E2E', ['run', 'build']);
run(
  'Run Playwright against production frontend',
  ['--prefix', 'apps/web', 'run', 'test:e2e', '--', ...args],
  { PLAYWRIGHT_USE_BUILD: 'true' },
);
