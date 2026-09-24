// ============================================================
// Каркас страницы: голова, шапка с мегаменю, подвал, хлебные крошки.
// Все ссылки относительные и считаются от глубины страницы, поэтому
// сайт одинаково работает и локально, и в подкаталоге GitHub Pages.
// ============================================================
import { company, legalEntities } from './data.mjs';

export const SITE = 'МОНТЕ · Стройспецтехника';
export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Путь наверх от страницы глубины d ('' | '../' | '../../' …)
export const up = (d) => (d ? '../'.repeat(d) : '');

// Разделы верхнего меню. sub — колонка мегаменю.
export const NAV = [
  {
    id: 'catalog', label: 'Каталог', href: 'catalog/',
    sub: [
      ['catalog/bordyur/', 'Бордюрный камень', 'четыре типоразмера'],
      ['catalog/bloki/', 'Стеновые блоки', 'КСР и КПР, пять позиций'],
      ['catalog/plitka/', 'Тротуарная плитка', 'пять форматов'],
      ['catalog/ventblok/', 'Вентблоки', 'ВБ-3 … ВБ-8'],
      ['catalog/kirpich/', 'Кирпич облицовочный', '250×120×60'],
      ['catalog/', 'Весь каталог', '22 позиции с ценами'],
    ],
  },
  { id: 'production', label: 'Производство', href: 'production/' },
  {
    id: 'road', label: 'Дороги и техника', href: 'asphalt/',
    sub: [
      ['asphalt/', 'Асфальтобетон', '60 марок, завод 120 т/ч'],
      ['bitum/', 'Битумные вяжущие', 'эмульсии ЭБДК и мастика'],
      ['rent/', 'Аренда техники', '78 единиц, 9 типов'],
      ['works/', 'Строительные работы', 'земля, дорога, благоустройство'],
    ],
  },
  { id: 'price', label: 'Прайс', href: 'price/' },
  { id: 'docs', label: 'Документы', href: 'documents/' },
  { id: 'contacts', label: 'Контакты', href: 'contacts/' },
];

const navHtml = (d, active) => {
  const b = up(d);
  return NAV.map((n) => {
    const on = n.id === active ? ' is-on' : '';
    if (!n.sub) return `<a class="nav__l${on}" href="${b}${n.href}">${n.label}</a>`;
    return `<div class="nav__drop${on}">
      <a class="nav__l" href="${b}${n.href}">${n.label}<svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg></a>
      <div class="mega"><div class="mega__in">
        ${n.sub.map(([h, t, s]) => `<a href="${b}${h}"><b>${t}</b><i>${s}</i></a>`).join('')}
      </div></div>
    </div>`;
  }).join('');
};

const menuHtml = (d) => {
  const b = up(d);
  const rows = [];
  let i = 0;
  for (const n of NAV) {
    i++;
    rows.push(`<a class="menu__a" href="${b}${n.href}"><em>${String(i).padStart(2, '0')}</em>${n.label}</a>`);
    if (n.sub) rows.push(`<div class="menu__sub">${n.sub.map(([h, t]) => `<a href="${b}${h}">${t}</a>`).join('')}</div>`);
  }
  return rows.join('');
};

export const crumbsHtml = (d, items) => {
  if (!items || !items.length) return '';
  const b = up(d);
  const li = [`<a href="${b}">Главная</a>`]
    .concat(items.map((c) => (c.href ? `<a href="${b}${c.href}">${esc(c.label)}</a>` : `<span>${esc(c.label)}</span>`)));
  return `<nav class="crumbs" aria-label="Хлебные крошки">${li.join('<i>/</i>')}</nav>`;
};

const orgLd = () => JSON.stringify({
  '@context': 'https://schema.org', '@type': 'Organization',
  name: 'Стройспецтехника МОНТЕ',
  address: { '@type': 'PostalAddress', addressLocality: 'Артём', addressRegion: 'Приморский край', streetAddress: 'ул. Севская, 44', postalCode: '692754', addressCountry: 'RU' },
  telephone: company.phoneRaw, email: company.email,
  subOrganization: legalEntities.map((e) => ({ '@type': 'Organization', name: e.legal, taxID: e.inn })),
});

export function page({ title, desc, depth = 0, active = '', crumbs = null, hero = '', body = '', scripts = [], libs = [], ld = null, cls = '' }) {
  const b = up(depth);
  const head = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="icon" href="${b}img/brand/mark-monte.png">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<link rel="stylesheet" href="${b}css/style.css">
<link rel="stylesheet" href="${b}css/pages.css">
<script type="application/ld+json">${orgLd()}</script>
${ld ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>` : ''}
<script>
/* Предохранитель загрузки. Если основной скрипт по любой причине не
   отработал — не поднялась библиотека, отключён JavaScript, ошибка в
   браузере, — заставка снимается сама, а всё скрытое под анимацию
   показывается. Сайт обязан открываться при любом раскладе. */
(function () {
  var t = setTimeout(function () {
    if (!document.body.classList.contains('ready')) {
      document.body.className += ' ready degraded';
    }
  }, 2600);
  window.__monteBooted = function () { clearTimeout(t); };
  document.addEventListener('DOMContentLoaded', function () {
    if (typeof gsap === 'undefined') document.body.className += ' degraded';
  });
})();
</script>
<noscript><style>.preloader{display:none}[data-fade],[data-rise]{opacity:1!important}
.split .ln i,.hero__h .ln i,.phero h1 .ln i{transform:none!important}</style></noscript>
</head>
<body class="${cls}">`;

  const header = `
<div class="preloader" id="preloader">
  <div class="preloader__inner">
    <div class="preloader__mark">МОНТЕ</div>
    <div class="preloader__bar"><i id="plBar"></i></div>
    <div class="preloader__num"><span id="plNum">0</span></div>
  </div>
</div>
<div class="grain" aria-hidden="true"></div>
<div class="cursor" id="cursor" aria-hidden="true"><span></span></div>

<header class="nav" id="nav">
  <a class="nav__logo" href="${b}">
    <svg viewBox="0 0 34 34" class="nav__glyph" aria-hidden="true"><path d="M2 32V2h6l9 15 9-15h6v30h-6V13l-9 15-9-15v19z"/></svg>
    <span class="nav__name">МОНТЕ<i>Стройспецтехника</i></span>
  </a>
  <nav class="nav__links">${navHtml(depth, active)}</nav>
  <a class="nav__spec" href="${b}spec/" id="specLink" hidden>Спецификация<b id="specCount">0</b></a>
  <a class="nav__tel" href="tel:${company.phoneRaw}">${company.phone}<i>завод</i></a>
  <button class="burger" id="burger" aria-label="Меню" aria-expanded="false"><span></span><span></span></button>
</header>

<div class="menu" id="menu">
  <div class="menu__list">${menuHtml(depth)}</div>
  <div class="menu__foot">
    <a href="tel:${company.phoneRaw}">${company.phone} <i>завод МОНТЕ</i></a>
    <a href="tel:${company.phone2Raw}">${company.phone2} <i>Стройспецтехника</i></a>
  </div>
</div>
<main id="top">`;

  const foot = `
<footer class="foot">
  <div class="foot__cols">
    <div class="foot__c">
      <span class="foot__h">Завод</span>
      <a href="${b}catalog/">Каталог изделий</a>
      <a href="${b}production/">Производство</a>
      <a href="${b}price/">Прайс-лист</a>
      <a href="${b}documents/">Документы</a>
    </div>
    <div class="foot__c">
      <span class="foot__h">Дороги</span>
      <a href="${b}asphalt/">Асфальтобетон</a>
      <a href="${b}bitum/">Битумные вяжущие</a>
      <a href="${b}rent/">Аренда техники</a>
      <a href="${b}works/">Строительные работы</a>
    </div>
    <div class="foot__c">
      <span class="foot__h">Связь</span>
      <a href="tel:${company.phoneRaw}">${company.phone}<i>завод МОНТЕ</i></a>
      <a href="tel:${company.phone2Raw}">${company.phone2}<i>Стройспецтехника</i></a>
      <a href="mailto:${company.email}">${company.email}</a>
      <a href="${b}contacts/">Адрес и реквизиты</a>
    </div>
    <div class="foot__c foot__c--addr">
      <span class="foot__h">Площадка</span>
      <p>692754, Приморский край,<br>г. Артём, ул. Севская, 44</p>
      <p>${company.hours}<br>отгрузка по согласованию</p>
    </div>
  </div>
  <div class="foot__t">
    ${legalEntities.map((e) => `<span>${esc(e.legal)} · ИНН ${e.inn} · ОГРН ${e.ogrn}</span>`).join('')}
  </div>
  <div class="foot__b">
    <span>© 2026 Стройспецтехника МОНТЕ, Артём</span>
    <span class="demo">Демонстрационный прототип</span>
    <a href="#top">Наверх ↑</a>
  </div>
</footer>
</main>
<script src="${b}js/vendor/gsap.min.js"></script>
<script src="${b}js/vendor/ScrollTrigger.min.js"></script>
<script src="${b}js/vendor/lenis.min.js"></script>
${libs.map((u) => `<script src="${u}"></script>`).join(String.fromCharCode(10))}
${scripts.map((s) => `<script src="${b}js/${s}"></script>`).join('\n')}
<script src="${b}js/spec.js"></script>
<script src="${b}js/main.js"></script>
</body>
</html>`;

  return head + header + crumbsHtml(depth, crumbs) + hero + body + foot;
}
