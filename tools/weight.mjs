import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://127.0.0.1:4340';
const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=gl','--enable-unsafe-swiftshader'] });
for (const path of ['/', '/catalog/', '/rent/', '/catalog/plitka/plitka-b1-p6/']) {
  const p = await b.newPage({ viewport:{width:1440,height:900} });
  const t0=Date.now(); let bytes=0, n=0;
  p.on('response', async r => { try { const h=r.headers()['content-length']; if(h) {bytes+=Number(h); n++;} } catch(e){} });
  await p.goto(BASE+path, { waitUntil:'load', timeout:60000 });
  const t=Date.now()-t0;
  // догружаем ленивые картинки прокруткой, чтобы увидеть полный вес
  await p.evaluate(async()=>{ for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));} });
  await p.waitForTimeout(1200);
  console.log(path.padEnd(38), 'load', String(t).padStart(5), 'мс,', n, 'запросов,', Math.round(bytes/1024), 'КБ');
  await p.close();
}
await b.close();
