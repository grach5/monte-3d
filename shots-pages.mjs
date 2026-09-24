// Снимки всех ключевых страниц: верх и один экран в середине.
//   node shots-pages.mjs            (десктоп 1440×900)
//   W=390 H=844 OUT=pm node shots-pages.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = (process.env.BASE || 'http://127.0.0.1:4340').replace(/\/$/, '');
const W = Number(process.env.W || 1440);
const H = Number(process.env.H || 900);
const OUT = process.env.OUT || 'shots-pages';
mkdirSync(OUT, { recursive: true });

const PAGES = [
  ['01-home', '/'],
  ['02-catalog', '/catalog/'],
  ['03-cat-plitka', '/catalog/plitka/'],
  ['04-product', '/catalog/plitka/plitka-b1-p6/'],
  ['05-product-kerb', '/catalog/bordyur/bordyur-br-100-30-15/'],
  ['06-production', '/production/'],
  ['07-asphalt', '/asphalt/'],
  ['08-bitum', '/bitum/'],
  ['09-rent', '/rent/'],
  ['10-rent-type', '/rent/avtokran/'],
  ['11-works', '/works/'],
  ['12-work-type', '/works/blagoustroystvo/'],
  ['13-price', '/price/'],
  ['14-documents', '/documents/'],
  ['15-contacts', '/contacts/'],
  ['16-spec', '/spec/'],
  ['17-404', '/404.html'],
];

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=gl', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const errs = [];
page.on('console', (m) => { if (m.type() === 'error') errs.push(page.url() + ' :: ' + m.text()); });
page.on('pageerror', (e) => errs.push(page.url() + ' :: PAGEERROR ' + e.message));

for (const [name, path] of PAGES) {
  await page.goto(BASE + path, { waitUntil: 'load' });
  await page.waitForTimeout(3400);
  await page.screenshot({ path: `${OUT}/${name}-top.png` });
  const h = await page.evaluate(() => document.body.scrollHeight);
  if (h > H * 1.6) {
    const y = Math.round(Math.min(h * 0.42, h - H));
    await page.evaluate((yy) => {
      if (window.__lenis) window.__lenis.scrollTo(yy, { immediate: true });
      window.scrollTo(0, yy);
    }, y);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/${name}-mid.png` });
  }
  process.stdout.write(`${name} ${path} h=${h}\n`);
}

if (errs.length) { console.log('\nОШИБКИ:'); [...new Set(errs)].slice(0, 25).forEach((e) => console.log(' · ' + e)); }
else console.log('\nконсоль чистая на всех страницах');

await browser.close();
