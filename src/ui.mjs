// ============================================================
// Повторяющиеся блоки страниц. Всё, что встретилось дважды,
// живёт здесь, а не копируется по шаблонам.
// ============================================================
import { esc, up } from './layout.mjs';

export const money = (n) => Number(n).toLocaleString('ru-RU');

// Шапка раздела: номер, надпись, заголовок с построчным раскрытием
export const secHead = (num, label, title, lead = '') => `
<div class="shead">
  <span class="secnum">${num} / ${esc(label)}</span>
  <h2 class="split">${String(title).split('|').map((l) => `<span class="ln"><i>${esc(l)}</i></span>`).join('')}</h2>
  ${lead ? `<p class="shead__lead" data-rise>${lead}</p>` : ''}
</div>`;

// Верх внутренней страницы: крупный заголовок, лид, строка фактов
export const pageHero = ({ label, h1, lead, facts = [], img = null, imgAlt = '', depth = 0, tall = false }) => {
  const b = up(depth);
  return `
<section class="phero${tall ? ' phero--tall' : ''}${img ? ' phero--img' : ''}">
  ${img ? `<div class="phero__bg"><img src="${b}${img}" alt="${esc(imgAlt)}"></div>` : ''}
  <div class="phero__in">
    ${label ? `<span class="secnum">${esc(label)}</span>` : ''}
    <h1 class="split">${String(h1).split('|').map((l) => `<span class="ln"><i>${esc(l)}</i></span>`).join('')}</h1>
    ${lead ? `<p class="phero__lead" data-rise>${lead}</p>` : ''}
    ${facts.length ? `<ul class="phero__facts" data-rise>${facts.map((f) => `<li><b>${f[0]}</b><span>${esc(f[1])}</span></li>`).join('')}</ul>` : ''}
  </div>
</section>`;
};

// Карточка позиции каталога
export const pcard = (p, depth, price) => {
  const b = up(depth);
  // У блоков «маркировка» — заводской шифр на 30 знаков: на карточке он
  // ломает вёрстку и ничего не сообщает. Тогда показываем стандарт.
  const mark = p.marking && p.marking.length <= 20 ? p.marking : (p.gost || p.grade || '');
  const from = price ? `${money(price.price)}${price.multi ? ' — ' + money(price.max) : ''} ₽` : 'по запросу';
  return `
<article class="pcard" data-cat="${p.cat}" data-price="${price ? price.price : 0}"
         data-search="${esc(p.name + ' ' + (p.marking || '') + ' ' + (p.short || '') + ' ' + p.size)}">
  <a class="pcard__a" href="${b}catalog/${p.cat}/${p.slug}/">
    <span class="pcard__ph"><img src="${b}img/model/${p.slug}.png" alt="${esc(p.name)}: модель габаритов" loading="lazy"></span>
    <span class="pcard__mark">${esc(mark)}</span>
    <h3>${esc(p.short || p.name)}</h3>
    <span class="pcard__size">${esc(p.size)} мм${p.grade ? ' · ' + esc(p.grade) : ''}</span>
    <span class="pcard__p">${from}<i>за ${esc(p.unit)}</i></span>
  </a>
</article>`;
};

// Таблица «ключ — значение»
export const kv = (rows) => `
<dl class="kv">${rows.filter(Boolean).map(([k, v, note]) => `
  <div class="kv__r"><dt>${esc(k)}</dt><dd>${v}${note ? `<i>${esc(note)}</i>` : ''}</dd></div>`).join('')}
</dl>`;

// Раскрывающиеся вопросы
export const faqBlock = (items, title = 'Частые вопросы') => {
  if (!items || !items.length) return '';
  return `
<div class="faq" data-rise>
  <h2 class="faq__h">${esc(title)}</h2>
  ${items.map((f) => `
  <details class="faq__i">
    <summary>${esc(f.q)}<span aria-hidden="true"></span></summary>
    <div class="faq__a"><p>${esc(f.a)}</p></div>
  </details>`).join('')}
</div>`;
};

// Плитка ссылок «куда дальше»
export const nextGrid = (items, depth, title = 'Дальше') => {
  const b = up(depth);
  return `
<section class="nexts">
  <h2 class="nexts__h">${esc(title)}</h2>
  <div class="nexts__g">
    ${items.map(([href, t, d]) => `
    <a class="nextc" href="${b}${href}">
      <b>${esc(t)}</b><i>${esc(d)}</i>
      <svg viewBox="0 0 24 12" aria-hidden="true"><path d="M0 6h22M17 1l5 5-5 5"/></svg>
    </a>`).join('')}
  </div>
</section>`;
};

// Полоса обращения
export const ctaBar = (depth, { title, lead, phone, phoneRaw, label }) => `
<section class="ctabar" data-rise>
  <div>
    <h2>${esc(title)}</h2>
    <p>${esc(lead)}</p>
  </div>
  <div class="ctabar__act">
    <a class="btn btn--accent" href="tel:${phoneRaw}"><span>${esc(phone)}</span></a>
    <a class="btn" href="${up(depth)}contacts/"><span>${esc(label || 'Написать в заявку')}</span></a>
  </div>
</section>`;

// Строка таблицы прайса
export const priceRow = (name, sub, size, price) => `
<div class="prow2"><h4>${esc(name)}${sub ? ` <i>${esc(sub)}</i>` : ''}</h4><em>${esc(size)}</em><b>${price}</b></div>`;
