// Проверка ссылок и картинок по файлам: каждая относительная ссылка
// должна указывать на существующий файл. Без браузера, за секунды.
//   node linkcheck.mjs
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';

const ROOT = process.cwd();
const SKIP = new Set(['node_modules', 'shots', 'shots-m', 'shots-live', '.git', 'src', 'tools']);

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const bad = [];
let checked = 0;

for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const dir = dirname(f);
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const r of refs) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(r)) continue;
    checked++;
    const clean = r.split('#')[0].split('?')[0];
    if (!clean) continue;
    let target = resolve(dir, clean);
    if (clean.endsWith('/') || (existsSync(target) && statSync(target).isDirectory())) {
      target = join(target, 'index.html');
    }
    if (!existsSync(target)) bad.push(`${relative(ROOT, f)} → ${r}`);
  }
}

console.log(`Страниц: ${files.length}, ссылок проверено: ${checked}`);
if (bad.length) {
  console.log(`БИТЫХ: ${bad.length}`);
  bad.slice(0, 40).forEach((b) => console.log('  ' + b));
  process.exitCode = 1;
} else {
  console.log('Битых ссылок нет.');
}
