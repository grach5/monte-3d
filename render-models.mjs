// Рендер каталожных картинок: одна 3D-модель на позицию,
// одинаковый ракурс и свет у всех 22 карточек.
//   node render-models.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';
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
  // Обрезаем прозрачные поля и кладём webp: png с альфой весил по 300–800 КБ,
  // и каталог из 22 карточек грузился минутами.
  await sharp(Buffer.from(data.split(',')[1], 'base64'))
    .trim({ threshold: 6 })
    .resize({ width: 560, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(`img/model/${p.slug}.webp`);
  n++;
}
console.log('Отрисовано моделей:', n);
await browser.close();
