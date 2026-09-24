import { chromium } from 'playwright';
const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=gl','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport:{width:1440,height:900} });
const slow=[]; const fail=[];
p.on('requestfailed', r=>fail.push(r.url()+' :: '+(r.failure()&&r.failure().errorText)));
p.on('response', async r=>{ const t=r.request().timing(); });
const t0=Date.now();
try {
  await p.goto('https://grach5.github.io/monte-3d/', { waitUntil:'domcontentloaded', timeout:60000 });
  console.log('DOMContentLoaded за', Date.now()-t0, 'мс');
  await p.waitForLoadState('load', { timeout:60000 });
  console.log('load за', Date.now()-t0, 'мс');
} catch(e){ console.log('ОШИБКА:', e.message.split('\n')[0], 'через', Date.now()-t0, 'мс'); }
const st = await p.evaluate(()=>{
  const e = performance.getEntriesByType('resource').map(r=>({u:r.name.replace(location.origin,''),d:Math.round(r.duration),s:Math.round((r.transferSize||0)/1024)}));
  e.sort((a,b)=>b.d-a.d);
  return {top:e.slice(0,8), n:e.length, pl:(()=>{const q=document.getElementById('preloader');const c=q&&getComputedStyle(q);return c?c.visibility+'/'+c.opacity:'нет'})()};
});
console.log('ресурсов:', st.n, 'заставка:', st.pl);
console.log('самые долгие:'); st.top.forEach(x=>console.log('  ', x.d+'мс', x.s+'КБ', x.u));
if (fail.length) { console.log('не загрузились:'); fail.forEach(f=>console.log('  ', f)); }
await b.close();
