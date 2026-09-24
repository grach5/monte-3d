// ============================================================
// Каталог: витрина, пять страниц групп и карточка на каждую позицию.
// ============================================================
import { page, esc, up } from './layout.mjs';
import { pageHero, pcard, kv, faqBlock, nextGrid, money, secHead } from './ui.mjs';
import { products, categories, priceList, getPrice, company, byCat, docs } from './data.mjs';

const CAT_LEAD = {
  bordyur: 'Бортовой камень четырёх сечений: от тротуарного 200×80 мм до мостового 600×200 мм. Марки М300 и М400, отгрузка поддонами.',
  bloki: 'Отсевоблок КСР и КПР по ГОСТ 6133-2019: стеновой М50, М75, М100 и перегородочный 90 и 120 мм.',
  plitka: 'Пять форматов по ГОСТ 17608-2017 — прямоугольная брусчатка, крупная плита и три комплекта. Серая, цветная и с мраморной крошкой.',
  ventblok: 'Шесть типоразмеров ВБ-3 … ВБ-8 для набора вертикального вентиляционного канала в кладке. Марка М75.',
  kirpich: 'Фасадный вибропрессованный кирпич 250×120×60 мм, серый и цветной. Новая позиция завода.',
};

const CAT_IMG = {
  bordyur: 'img/product/kerb-close.jpg',
  bloki: 'img/product/block-line.jpg',
  plitka: 'img/product/paver-texture.jpg',
  ventblok: 'img/production/curing-racks.jpg',
  kirpich: 'img/product/wall-samples.jpg',
};

// Габариты по осям — та же логика, что в js/model.js
function axes(p) {
  const d = p.dims || {};
  if (!d.l || !d.w || !d.h) return null;
  if (p.cat === 'bordyur') return { x: d.l, y: Math.max(d.w, d.h), z: Math.min(d.w, d.h) };
  if (p.cat === 'plitka' || p.cat === 'kirpich') {
    const big = [d.l, d.w, d.h].slice().sort((a, b) => b - a);
    return { x: big[0], y: Math.min(d.l, d.w, d.h), z: big[1] };
  }
  return { x: d.l, y: d.h, z: d.w };
}

const priceText = (pr) => (pr ? `${money(pr.price)}${pr.multi ? ' — ' + money(pr.max) : ''} ₽` : 'по запросу');

/* ---------------- витрина каталога ---------------- */
export function catalogHub() {
  const cards = products.map((p) => pcard(p, 1, getPrice(p.slug))).join('');
  const chips = [['all', 'Все позиции']].concat(categories.map((c) => [c.slug, c.short]));

  const body = `
<section class="cwrap">
  <div class="cbar" data-rise>
    <div class="cbar__chips">
      ${chips.map(([slug, label], i) => `<button class="chip${i === 0 ? ' is-on' : ''}" data-cat="${slug}">${esc(label)}</button>`).join('')}
    </div>
    <div class="cbar__tools">
      <label class="cbar__q"><input type="search" id="catQ" placeholder="Поиск: БР 100.30.15, плитка, М75" autocomplete="off"></label>
      <label class="cbar__sort"><select id="catSort">
        <option value="default">По группам</option>
        <option value="asc">Цена: по возрастанию</option>
        <option value="desc">Цена: по убыванию</option>
      </select></label>
    </div>
  </div>
  <p class="cwrap__count"><b id="catCount">${products.length}</b> позиций · цены по прайсу от ${priceList.updated}, ${priceList.vat}</p>
  <div class="pgrid" id="catGrid">${cards}</div>
  <p class="cwrap__empty" id="catEmpty" hidden>Ничего не нашли. Попробуйте маркировку без пробелов — БР100.30.15 — или позвоните: ${company.phone}.</p>
</section>

<section class="custom" data-rise>
  <div>
    <span class="secnum">Под заказ</span>
    <h2>Тот же пресс,<br>другая матрица</h2>
    <p>Вибропресс HESS формует изделие высотой 25–500 мм в габарите поддона: плитка других форматов и толщин, фигурная брусчатка, водоотвод, нестандартный бордюр и блок. Наличие оснастки, срок и цену по каждой позиции подтверждает завод.</p>
  </div>
  <a class="btn btn--accent" href="../contacts/"><span>Обсудить задачу</span></a>
</section>

${nextGrid([
    ['price/', 'Прайс-лист целиком', 'ЗБИ, асфальт и битум одной страницей'],
    ['production/', 'Как это делается', 'формовка, твердение, отгрузка'],
    ['documents/', 'Документы', 'сертификаты и знак «Лучший товар Приморья»'],
  ], 1, 'Дальше')}`;

  return {
    path: 'catalog/index.html',
    html: page({
      title: 'Каталог бетонных изделий МОНТЕ — 22 позиции с ценами | Артём',
      desc: 'Каталог завода МОНТЕ: бордюрный камень, стеновые блоки, тротуарная плитка, вентблоки и облицовочный кирпич. 22 позиции, цены по прайсу от ' + priceList.updated + '.',
      depth: 1, active: 'catalog',
      crumbs: [{ label: 'Каталог' }],
      hero: pageHero({
        label: 'Каталог', depth: 1,
        h1: 'Пять групп,|двадцать две позиции',
        lead: 'Всё, что завод формует на вибропрессе HESS в Артёме. Цены открыто, размеры и масса — из прайса и заводской таблицы.',
        facts: [[products.length, 'позиций в прайсе'], [categories.length, 'групп изделий'], ['9 млн', 'изделий в год']],
      }),
      body, scripts: ['catalog.js'],
    }),
  };
}

/* ---------------- страница группы ---------------- */
export function categoryPage(cat) {
  const list = byCat(cat.slug);
  const prices = list.map((p) => getPrice(p.slug)).filter(Boolean);
  const min = prices.length ? Math.min(...prices.map((p) => p.price)) : null;
  const certs = docs.filter((d) => list.some((p) => p.cert && d.num === p.cert));

  const table = `
<div class="tw" data-rise>
  <table class="tbl">
    <thead><tr><th>Позиция</th><th>Размер, мм</th><th>Марка</th><th>Масса, кг</th><th>На поддоне</th><th>Цена</th></tr></thead>
    <tbody>
      ${list.map((p) => {
        const pr = getPrice(p.slug);
        return `<tr>
          <td data-l="Позиция"><a href="${p.slug}/">${esc(p.short || p.name)}</a></td>
          <td data-l="Размер">${esc(p.size)}</td>
          <td data-l="Марка">${esc(p.grade || '—')}</td>
          <td data-l="Масса">${p.weight ? String(p.weight).replace('.', ',') : '—'}</td>
          <td data-l="На поддоне">${p.perPallet ? p.perPallet + ' шт' : '—'}${p.palletArea ? ` · ${String(p.palletArea).replace('.', ',')} м²` : ''}</td>
          <td data-l="Цена">${priceText(pr)}<i> / ${esc(p.unit)}</i></td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</div>`;

  const body = `
<section class="cwrap cwrap--cat">
  <div class="pgrid">${list.map((p) => pcard(p, 2, getPrice(p.slug))).join('')}</div>
</section>

<section class="sec">
  ${secHead('01', 'Сравнение', 'Все позиции|группы в одной таблице')}
  ${table}
  <p class="note">Цены по прайсу завода от ${priceList.updated}, ${priceList.vat}, ${priceList.terms}. При расхождении сайта и прайса верен прайс.</p>
</section>

${certs.length ? `
<section class="sec">
  ${secHead('02', 'Документы', 'Чем подтверждается')}
  <div class="dgrid">
    ${certs.map((d) => `
    <article class="dcard" data-rise>
      <span class="dcard__t">${esc(d.type)}</span>
      <h3>${esc(d.title)}</h3>
      <dl class="kv kv--tight">
        <div class="kv__r"><dt>Номер</dt><dd>${esc(d.num)}</dd></div>
        <div class="kv__r"><dt>Стандарт</dt><dd>${esc(d.gost)}</dd></div>
        <div class="kv__r"><dt>Срок</dt><dd>${esc(d.from)} — ${esc(d.to)}${d.renewal ? ' <i>документ на переоформлении</i>' : ''}</dd></div>
      </dl>
      <a class="dcard__l" href="../../documents/">Все документы →</a>
    </article>`).join('')}
  </div>
</section>` : ''}

${nextGrid(categories.filter((c) => c.slug !== cat.slug).slice(0, 3).map((c) => [
    `catalog/${c.slug}/`, c.name, c.desc,
  ]), 2, 'Другие группы')}`;

  return {
    path: `catalog/${cat.slug}/index.html`,
    html: page({
      title: `${cat.name} — купить в Артёме, цены завода МОНТЕ`,
      desc: `${cat.name}: ${cat.desc}. Цены завода МОНТЕ по прайсу от ${priceList.updated}, самовывоз из Артёма.`,
      depth: 2, active: 'catalog',
      crumbs: [{ label: 'Каталог', href: 'catalog/' }, { label: cat.short }],
      hero: pageHero({
        label: 'Каталог · ' + cat.short, depth: 2,
        h1: cat.name.length > 26 ? cat.name.replace(' и ', ' и|') : cat.name,
        lead: CAT_LEAD[cat.slug] || cat.desc,
        facts: [[list.length, 'позиции в группе'], [min ? money(min) + ' ₽' : '—', 'минимальная цена'], [list[0] && list[0].gost ? list[0].gost.replace('ГОСТ ', '') : '—', 'стандарт']],
        img: CAT_IMG[cat.slug], imgAlt: cat.name,
      }),
      body,
    }),
  };
}

/* ---------------- карточка позиции ---------------- */
export function productPage(p) {
  const pr = getPrice(p.slug);
  const cat = categories.find((c) => c.slug === p.cat);
  const ax = axes(p);
  const dimLabels = ax ? { x: `${ax.x} мм`, y: `${ax.y} мм`, z: `${ax.z} мм` } : {};
  const near = products.filter((o) => o.cat === p.cat && o.slug !== p.slug).slice(0, 3);

  const gallery = (p.gallery && p.gallery.length ? p.gallery : [p.img]).filter(Boolean);
  const galAlt = p.galleryAlt || [];

  const specRows = [
    ['Маркировка', esc(p.marking || '—')],
    ['Размер', `${esc(p.size)} мм`],
    p.grade && ['Марка бетона', esc(p.grade)],
    p.gost && ['Стандарт', esc(p.gost), p.gostFull && p.gostFull !== p.gost ? p.gostFull : ''],
    p.weight && ['Масса изделия', `${String(p.weight).replace('.', ',')} кг`],
    p.perPallet && ['На поддоне', `${p.perPallet} шт${p.palletLayout ? `, ${esc(p.palletLayout)}` : ''}`],
    p.palletWeight && ['Масса поддона', `${money(p.palletWeight)} кг`],
    p.palletArea && ['Площадь поддона', `${String(p.palletArea).replace('.', ',')} м²`],
    p.cert && ['Сертификат', esc(p.cert)],
  ].filter(Boolean);

  const variants = pr && pr.variants ? pr.variants : [];

  const calcLabel = {
    area: 'Площадь покрытия, м²', set: 'Площадь покрытия, м²',
    linear: 'Длина линии, м', wall: 'Площадь кладки, м²',
    facade: 'Площадь фасада, м²', stack: 'Высота ствола, м',
  }[p.calcType] || 'Количество, шт';

  const PJ = JSON.stringify({
    slug: p.slug, name: p.name, marking: p.marking, cat: p.cat, dims: p.dims,
    unit: p.unit, calcType: p.calcType, weight: p.weight, perPallet: p.perPallet,
    palletWeight: p.palletWeight, palletArea: p.palletArea, areaPerUnit: p.areaPerUnit,
    lengthM: p.lengthM, grade: p.grade, price: pr ? pr.price : 0,
    dimLabels, href: `catalog/${p.cat}/${p.slug}/`,
  });

  const body = `
<section class="pdt">
  <div class="pdt__vis" data-rise>
    <div class="pm" id="pmodel" aria-label="Трёхмерная модель габаритов изделия"></div>
    <div class="pm__bar">
      <span>Габаритная модель · потяните, чтобы повернуть</span>
      <button id="pmReset" type="button">Автоповорот</button>
    </div>
  </div>
  <div class="pdt__info">
    <span class="secnum">${esc(cat ? cat.short : 'Каталог')}</span>
    <h1>${esc(p.name)}</h1>
    <p class="pdt__sub">${esc(p.sub || '')}</p>
    ${pr ? `<div class="pdt__price"><b>${priceText(pr)}</b><i>за ${esc(p.unit)}</i>
      <span>прайс от ${priceList.updated} · ${priceList.vat} · ${priceList.terms}</span></div>` : ''}
    ${p.tags && p.tags.length ? `<span class="tagset">${p.tags.map((t) => `<i>${esc(t)}</i>`).join('')}</span>` : ''}
    <div class="pdt__cta">
      <a class="btn btn--accent" href="#calc"><span>Посчитать объём</span></a>
      <a class="btn" href="tel:${company.phoneRaw}"><span>${company.phone}</span></a>
    </div>
    ${p.descShort ? `<p class="pdt__lead">${esc(p.descShort)}</p>` : ''}
    <ul class="pdt__quick">
      ${[
        p.gost && ['Стандарт', p.gost],
        p.weight && ['Масса штуки', String(p.weight).replace('.', ',') + ' кг'],
        p.perPallet && ['На поддоне', p.perPallet + ' шт'],
        p.palletArea && ['Поддон', String(p.palletArea).replace('.', ',') + ' м²'],
      ].filter(Boolean).slice(0, 3).map(([k, v]) => `<li><b>${esc(v)}</b><span>${esc(k)}</span></li>`).join('')}
    </ul>
  </div>
</section>

<section class="sec sec--split">
  <div>
    ${secHead('01', 'Характеристики', 'Что стоит|в паспорте')}
    ${kv(specRows)}
  </div>
  <div>
    ${variants.length ? `
    <h3 class="minih">Исполнения и цены</h3>
    <div class="vtable">
      ${variants.map((v) => `<div class="vrow"><span>${esc(v.label)}</span><b>${money(v.price)} ₽<i>${esc(p.unit)}</i></b></div>`).join('')}
    </div>` : ''}
    ${p.applications && p.applications.length ? `
    <h3 class="minih">Где применяется</h3>
    <ul class="applist">${p.applications.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
  </div>
</section>

<section class="sec" id="calc-sec">
  ${secHead('02', 'Калькулятор', 'Объём, поддоны|и стоимость')}
  <form class="calc" id="calc" data-rise>
    <div class="calc__in">
      <label><span>${esc(calcLabel)}</span><input type="text" inputmode="decimal" id="calcQty" value="${p.calcType === 'stack' ? '9' : p.unit === 'м²' ? '100' : '50'}"></label>
      ${variants.length > 1 ? `<label><span>Исполнение</span><select id="calcVar">
        ${variants.map((v) => `<option value="${v.price}" data-label="${esc(v.label)}">${esc(v.label)} — ${money(v.price)} ₽</option>`).join('')}
      </select></label>` : variants.length === 1 ? `<input type="hidden" id="calcVar" value="${variants[0].price}" data-label="${esc(variants[0].label)}">` : ''}
    </div>
    <div class="calc__out">
      <div class="fig"><b id="outUnits">—</b><span>потребность</span></div>
      <div class="fig"><b id="outPallets">—</b><span>поддонов</span></div>
      <div class="fig"><b id="outMass">—</b><span>масса</span></div>
      <div class="fig fig--lead"><b id="outSum">—</b><span>по прайсу, с НДС</span></div>
    </div>
    <p class="calc__hint" id="calcHint"></p>
    <div class="calc__act">
      <button class="btn btn--accent" type="button" id="calcAdd"><span>В спецификацию</span></button>
      <a class="btn" href="../../../price/"><span>Весь прайс</span></a>
    </div>
    <p class="calc__note">Расчёт по массе изделия и раскладке на поддоне из заводской таблицы. Доставку и разгрузку считает диспетчер под объём и адрес.</p>
  </form>
</section>

<section class="sec sec--split">
  <div>
    ${secHead('03', 'Описание', 'Зачем эта|позиция')}
    <p class="ptext">${esc(p.desc || '')}</p>
    ${p.note ? `<p class="pnote"><b>На что смотреть.</b> ${esc(p.note)}</p>` : ''}
  </div>
  <div class="gal" data-rise>
    <div class="gal__main" id="galMain"><img src="../../../${gallery[0].replace(/^\//, '')}" alt="${esc(galAlt[0] || p.imgAlt || p.name)}"></div>
    ${gallery.length > 1 ? `<div class="gal__thumbs">
      ${gallery.map((g, i) => `<button class="gal__t${i === 0 ? ' is-on' : ''}" type="button"
        data-src="../../../${g.replace(/^\//, '')}" data-alt="${esc(galAlt[i] || '')}">
        <img src="../../../${g.replace(/^\//, '')}" alt="" loading="lazy"></button>`).join('')}
    </div>` : ''}
    <p class="gal__cap">${esc(galAlt[0] || p.imgAlt || '')}</p>
  </div>
</section>

${faqBlock(p.faq)}

${near.length ? `
<section class="sec">
  ${secHead('04', 'Рядом', 'Другие позиции|группы')}
  <div class="pgrid pgrid--3">${near.map((o) => pcard(o, 3, getPrice(o.slug))).join('')}</div>
</section>` : ''}`;

  const ld = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: p.name, sku: p.slug, description: p.descShort || p.desc,
    brand: { '@type': 'Brand', name: 'МОНТЕ' },
    ...(pr ? {
      offers: {
        '@type': 'AggregateOffer', priceCurrency: 'RUB',
        lowPrice: pr.price, highPrice: pr.max, offerCount: pr.variants.length,
        availability: 'https://schema.org/InStock',
      },
    } : {}),
  };

  return {
    path: `catalog/${p.cat}/${p.slug}/index.html`,
    html: page({
      title: `${p.name} — цена завода в Артёме | МОНТЕ`,
      desc: p.descShort || `${p.name}: ${p.size} мм, ${p.grade || ''}. Цена завода МОНТЕ, прайс от ${priceList.updated}.`,
      depth: 3, active: 'catalog',
      crumbs: [
        { label: 'Каталог', href: 'catalog/' },
        { label: cat ? cat.short : '', href: `catalog/${p.cat}/` },
        { label: p.short || p.name },
      ],
      body: `<script>window.PRODUCT=${PJ};</script>` + body,
      libs: ['https://cdnjs.cloudflare.com/ajax/libs/three.js/0.149.0/three.min.js'],
      scripts: ['model.js', 'product.js'],
      ld,
      cls: 'p-product',
    }),
  };
}

export function catalogPages() {
  return [catalogHub()]
    .concat(categories.map(categoryPage))
    .concat(products.map(productPage));
}
