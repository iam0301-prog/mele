import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROOT = process.cwd();
const PROMPT_FILE = resolve(ROOT, 'python_api/data/tarot_art_prompts.json');
const IMAGE_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'];

const args = process.argv.slice(2);

function valueFor(flag, fallback = undefined) {
  const index = args.indexOf(flag);
  if (index === -1) return fallback;
  return args[index + 1] ?? fallback;
}

function hasFlag(flag) {
  return args.includes(flag);
}

const style = valueFor('--style', 'forest_athena');
const from = Number(valueFor('--from', '0'));
const to = Number(valueFor('--to', '77'));
const limitValue = valueFor('--limit');
const limit = limitValue === undefined ? undefined : Number(limitValue);
const jsonlOut = valueFor('--jsonl');
const strict = hasFlag('--strict');

const source = JSON.parse(readFileSync(PROMPT_FILE, 'utf8'));
const items = source.items
  .filter((item) => item.style === style)
  .filter((item) => {
    const id = Number(item.id);
    return Number.isFinite(id) && id >= from && id <= to;
  })
  .sort((a, b) => Number(a.id) - Number(b.id));

function assetExists(item) {
  const output = resolve(ROOT, item.output);
  return IMAGE_EXTENSIONS.some((extension) => {
    const candidate = output.replace(/\.[^.]+$/, `.${extension}`);
    return existsSync(candidate);
  });
}

const rows = items.map((item) => ({
  id: item.id,
  style: item.style,
  name_en: item.name_en,
  name_zh: item.name_zh,
  output: item.output,
  scene: item.scene,
  visual_cue: item.visual_cue,
  prompt: item.prompt,
  exists: assetExists(item),
}));

const missing = rows.filter((row) => !row.exists);
const existing = rows.length - missing.length;
const pending = limit === undefined ? missing : missing.slice(0, limit);

console.log(`Tarot art phase: ${style}`);
console.log(`Range: ${from}-${to}`);
console.log(`Existing: ${existing}/${rows.length}`);
console.log(`Missing: ${missing.length}/${rows.length}`);

if (pending.length) {
  console.log('');
  console.log('Next missing cards:');
  for (const row of pending) {
    console.log(`${row.id.padStart(2, '0')} ${row.name_en} (${row.name_zh}) -> ${row.output}`);
  }
}

if (jsonlOut) {
  const outPath = resolve(ROOT, jsonlOut);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(
    outPath,
    pending.map((row) => JSON.stringify({
      id: row.id,
      style: row.style,
      name_en: row.name_en,
      name_zh: row.name_zh,
      output: row.output,
      prompt: row.prompt,
    })).join('\n') + (pending.length ? '\n' : ''),
    'utf8',
  );
  console.log('');
  console.log(`Wrote prompt queue: ${jsonlOut}`);
}

if (strict && missing.length > 0) {
  process.exitCode = 1;
}
