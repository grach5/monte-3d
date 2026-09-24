// Рендер каталожных картинок: одна 3D-модель на позицию,
// одинаковый ракурс и свет у всех 22 карточек.
//   node render-models.mjs
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { products } from './src/data.mjs';

mkdirSync('img/model', { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=gl', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
page.on('pageerror', (e) => console.log('ERR', e.message));
await page.goto('http://127.0.0.1:4340/tools/model-render.html', { waitUntil: 'load' });
await page.waitForTimeout(800);

let n = 0;
for (const p of products) {
  const data = await page.evaluate((P) => window.renderProduct(P), {
    slug: p.slug, cat: p.cat, dims: p.dims,
  });
  if (!data) { console.log('нет габаритов:', p.slug); continue; }
  writeFileSync(`img/model/${p.slug}.png`, Buffer.from(data.split(',')[1], 'base64'));
  n++;
}
console.log('Отрисовано моделей:', n);
await browser.close();
