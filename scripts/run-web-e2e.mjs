import { spawnSync } from 'node:child_process';
import net from 'node:net';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const args = process.argv.slice(2);
const useShell = process.platform === 'win32';
const defaultPort = Number(process.env.PORT ?? 3006);

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

function canListen(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 50; port += 1) {
    if (await canListen(port)) {
      return port;
    }
  }

  throw new Error(`Could not find an available Playwright port from ${startPort} to ${startPort + 49}`);
}

async function getPlaywrightEnv() {
  const env = { PLAYWRIGHT_USE_BUILD: 'true' };

  if (!process.env.PLAYWRIGHT_BASE_URL && !process.env.PORT && !process.env.CI) {
    env.PORT = String(await findAvailablePort(defaultPort));
    console.log(`Using available Playwright port ${env.PORT}`);
  }

  return env;
}

run('Build frontend for production E2E', ['run', 'build']);
run(
  'Run Playwright against production frontend',
  ['--prefix', 'apps/web', 'run', 'test:e2e', '--', ...args],
  await getPlaywrightEnv(),
);
