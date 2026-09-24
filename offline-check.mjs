// Проверка живучести: сайт должен открываться при полностью
// закрытом внешнем интернете и при выключенном JavaScript.
//   node offline-check.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = (process.env.BASE || 'http://127.0.0.1:4340').replace(/\/$/, '');
mkdirSync('shots-offline', { recursive: true });
const PAGES = [['home', '/'], ['catalog', '/catalog/'], ['product', '/catalog/plitka/plitka-b1-p6/'], ['price', '/price/']];

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=gl', '--enable-unsafe-swiftshader'] });

async function run(tag, { js = true, cutExternal = false }) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: js });
  const page = await ctx.newPage();
  if (cutExternal) {
    // рубим всё, что не наш хост
    await page.route('**/*', (route) => {
      const u = new URL(route.request().url());
      const own = new URL(BASE);
      if (u.host === own.host) return route.continue();
      return route.abort();
    });
  }
  for (const [name, path] of PAGES) {
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(3800);
    const state = await page.evaluate(() => {
      const pl = document.getElementById('preloader');
      const st = pl ? getComputedStyle(pl) : null;
      const h1 = document.querySelector('h1');
      // считаем только то, что уже на экране: блоки ниже сгиба
      // показываются по прокрутке, и это не поломка
      const hidden = [...document.querySelectorAll('[data-rise],[data-fade]')]
        .filter((e) => {
          const r = e.getBoundingClientRect();
          return r.top < innerHeight * 0.8 && r.bottom > 0 && getComputedStyle(e).opacity === '0';
        }).length;
      return {
        preloaderVisible: !!(st && st.visibility !== 'hidden' && st.opacity !== '0' && st.display !== 'none'),
        h1: h1 ? h1.innerText.replace(/\s+/g, ' ').trim().slice(0, 42) : null,
        hiddenBlocks: hidden,
        body: document.body.className,
      };
    });
    await page.screenshot({ path: `shots-offline/${tag}-${name}.png` });
    const ok = !state.preloaderVisible && state.h1 && state.hiddenBlocks === 0;
    console.log(`${ok ? 'OK  ' : 'ПЛОХО'} ${tag} ${path} — заставка:${state.preloaderVisible ? 'висит' : 'снята'}, h1:"${state.h1}", скрытых блоков:${state.hiddenBlocks}, body:"${state.body}"`);
  }
  await ctx.close();
}

console.log('— обычная загрузка —');
await run('normal', {});
console.log('\n— внешние домены недоступны —');
await run('cut', { cutExternal: true });
console.log('\n— JavaScript выключен —');
await run('nojs', { js: false });

await browser.close();
