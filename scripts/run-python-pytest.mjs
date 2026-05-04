import { existsSync } from 'node:fs';
import { delimiter, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';

const root = process.cwd();
const pythonPath = resolve(root, 'python_api');
const py312PackagesPath = resolve(root, '.py312-packages');

function existingPaths(paths) {
  return paths.filter((item) => existsSync(item));
}

function candidate(command, args = [], extraPythonPaths = []) {
  return { command, args, extraPythonPaths };
}

const candidates = [];

if (process.env.PYTHON) {
  candidates.push(candidate(process.env.PYTHON));
}

if (process.platform === 'win32') {
  const localVenv = resolve(root, '.venv-pytest', 'Scripts', 'python.exe');
  if (existsSync(localVenv)) candidates.push(candidate(localVenv));
  const apiVenv = resolve(root, 'python_api', 'venv', 'Scripts', 'python.exe');
  if (existsSync(apiVenv)) candidates.push(candidate(apiVenv));
  const apiVenvSitePackages = resolve(root, 'python_api', 'venv', 'Lib', 'site-packages');
  const codexPython = resolve(
    homedir(),
    '.cache',
    'codex-runtimes',
    'codex-primary-runtime',
    'dependencies',
    'python',
    'python.exe',
  );
  if (existsSync(codexPython)) {
    candidates.push(candidate(codexPython, [], existingPaths([py312PackagesPath, apiVenvSitePackages])));
  }
  candidates.push(candidate('py', ['-3.12']));
  candidates.push(candidate('python'));
} else {
  const localVenv = resolve(root, '.venv-pytest', 'bin', 'python');
  if (existsSync(localVenv)) candidates.push(candidate(localVenv));
  const apiVenv = resolve(root, 'python_api', 'venv', 'bin', 'python');
  if (existsSync(apiVenv)) candidates.push(candidate(apiVenv));
  const apiVenvSitePackages = resolve(root, 'python_api', 'venv', 'lib', 'python3.12', 'site-packages');
  const codexPython = resolve(
    homedir(),
    '.cache',
    'codex-runtimes',
    'codex-primary-runtime',
    'dependencies',
    'python',
    'bin',
    'python',
  );
  if (existsSync(codexPython)) {
    candidates.push(candidate(codexPython, [], existingPaths([py312PackagesPath, apiVenvSitePackages])));
  }
  candidates.push(candidate('python3.12'));
  candidates.push(candidate('python3'));
  candidates.push(candidate('python'));
}

function run(candidateToUse, args, options = {}) {
  return spawnSync(candidateToUse.command, [...candidateToUse.args, ...args], {
    cwd: root,
    env: {
      ...process.env,
      PYTHONPATH: [pythonPath, ...candidateToUse.extraPythonPaths, process.env.PYTHONPATH].filter(Boolean).join(delimiter),
    },
    encoding: 'utf8',
    stdio: options.stdio || 'pipe',
  });
}

let selected;
for (const item of candidates) {
  const version = run(item, ['--version']);
  if (version.status === 0) {
    selected = item;
    break;
  }
}

if (!selected) {
  console.error('No Python 3 interpreter was found. Set PYTHON or create .venv-pytest first.');
  process.exit(1);
}

const result = run(selected, ['-m', 'pytest', 'python_api/tests'], { stdio: 'inherit' });

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
