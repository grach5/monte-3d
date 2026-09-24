// Скриншоты по ключевым точкам прокрутки.
// Playwright берётся из соседнего проекта: NODE_PATH=../monte-site/node_modules
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE || 'http://127.0.0.1:4340';
const W = Number(process.env.W || 1440);
const H = Number(process.env.H || 900);
const OUT = process.env.OUT || 'shots';
mkdirSync(OUT, { recursive: true });

// Точки: имя → доля прокрутки или пиксели ('sel:#id' — к секции)
const POINTS = [
  ['01-hero', 0],
  ['02-manifest', 'sel:#manifest'],
  ['03-catalog-start', 'sel:#catalog'],
  ['04-catalog-mid', 'pin:#catalog:0.5'],
  ['05-catalog-end', 'pin:#catalog:0.95'],
  ['06-prod', 'sel:#proizvodstvo'],
  ['07-prod-caps', 'sel:.caps'],
  ['08-road', 'sel:#dorogi'],
  ['09-works', 'sel:.works'],
  ['10-price', 'sel:#price'],
  ['11-contact', 'sel:#contact'],
];

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=gl', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });

const errs = [];
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));

await page.goto(BASE, { waitUntil: 'load' });
await page.waitForTimeout(3600);           // прелоадер + вступление

for (const [name, at] of POINTS) {
  const y = await page.evaluate((a) => {
    if (typeof a === 'number') return a;
    if (a.startsWith('sel:')) {
      const el = document.querySelector(a.slice(4));
      return el ? el.getBoundingClientRect().top + scrollY + 2 : 0;
    }
    const [, sel, k] = a.split(':');
    const el = document.querySelector(sel);
    const st = el.getBoundingClientRect().top + scrollY;
    // высота закреплённой секции = её собственная высота в потоке
    return st + el.offsetHeight * Number(k);
  }, at);

  await page.evaluate((yy) => {
    if (window.__lenis) window.__lenis.scrollTo(yy, { immediate: true });
    window.scrollTo(0, yy);
  }, y);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  process.stdout.write(`${name} @${Math.round(y)}\n`);
}

if (errs.length) { console.log('\nОШИБКИ КОНСОЛИ:'); errs.forEach((e) => console.log(' · ' + e)); }
else console.log('\nконсоль чистая');

await browser.close();
