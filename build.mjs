// ============================================================
// Сборка сайта: страницы пишутся прямо в корень проекта,
// оттуда же их отдаёт GitHub Pages. Статика (css, js, img)
// лежит рядом и сборкой не трогается.
//   node build.mjs
// ============================================================
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { catalogPages } from './src/pages-catalog.mjs';
import { roadPages } from './src/pages-road.mjs';
import { miscPages } from './src/pages-misc.mjs';

const ROOT = process.cwd();
// Разделы, которые целиком принадлежат сборке: чистим перед записью,
// чтобы переименованная позиция не осталась висеть старым файлом.
const OWNED = ['catalog', 'asphalt', 'bitum', 'rent', 'works', 'production', 'price', 'documents', 'contacts', 'spec'];

for (const d of OWNED) {
  const p = join(ROOT, d);
  if (existsSync(p)) rmSync(p, { recursive: true, force: true });
}

const pages = [].concat(miscPages(), catalogPages(), roadPages());

for (const p of pages) {
  const full = join(ROOT, p.path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, p.html, 'utf8');
}

// Карта сайта: пригодится, когда снимут noindex на боевом домене
const urls = pages
  .filter((p) => p.path !== '404.html')
  .map((p) => '/' + p.path.replace(/index\.html$/, '').replace(/\\/g, '/'));
writeFileSync(join(ROOT, 'sitemap.txt'), urls.join('\n') + '\n', 'utf8');
writeFileSync(join(ROOT, '.nojekyll'), '', 'utf8');

console.log(`Собрано страниц: ${pages.length}`);
const bySection = {};
for (const p of pages) {
  const k = p.path.split(/[\\/]/)[0].replace('.html', '');
  bySection[k] = (bySection[k] || 0) + 1;
}
console.log(Object.entries(bySection).map(([k, v]) => `  ${k}: ${v}`).join('\n'));
