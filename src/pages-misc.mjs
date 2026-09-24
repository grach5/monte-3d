// ============================================================
// Главная, производство, прайс, документы, контакты,
// спецификация и страница 404.
// ============================================================
import { page, esc } from './layout.mjs';
import { pageHero, secHead, nextGrid, faqBlock, money, kv, priceRow } from './ui.mjs';
import {
  products, categories, priceList, getPrice, company, capacity, legalEntities,
  companies, group, docs, roadMeta, asphaltGroups, asphaltCount, asphaltMin,
  bitumenGroups, bitumenCount, transport, asphalt, fleetTypes, workTypes,
} from './data.mjs';

const priceText = (pr) => (pr ? `${money(pr.price)}${pr.multi ? ' — ' + money(pr.max) : ''} ₽` : 'по запросу');

/* ---------------- Главная ---------------- */
export function home() {
  const hero = `
<canvas id="gl" aria-hidden="true"></canvas>
<div class="scrim" aria-hidden="true"></div>

<section class="hero" id="hero">
  <div class="hero__grid">
    <div class="hero__eyebrow" data-fade><span class="dot"></span>Артём · Приморский край · с ${group.founded}</div>
    <h1 class="hero__h">
      <span class="ln"><i>Бетон,</i></span>
      <span class="ln"><i>который держит</i></span>
      <span class="ln"><i>город.</i></span>
    </h1>
    <p class="hero__sub" data-fade>
      Вибропресс Hess. 9 млн изделий в год.<br>Свой асфальтобетонный завод и ${group.fleetClaimed} единиц техники.
    </p>
    <div class="hero__cta" data-fade>
      <a class="btn btn--accent" href="catalog/"><span>Каталог изделий</span></a>
      <a class="btn" href="price/"><span>Прайс от ${priceList.updated}</span></a>
    </div>
  </div>
  <div class="hero__meta">
    <div class="hero__scroll"><i></i>скролл</div>
    <ul class="hero__facts">
      <li><b data-count="9">0</b><span>млн изделий в год</span></li>
      <li><b data-count="${group.fleetClaimed}">0</b><span>единиц техники</span></li>
      <li><b data-count="${group.projects}">0</b><span>проектов</span></li>
    </ul>
  </div>
</section>`;

  const body = `
<section class="manifest" id="manifest">
  <p class="manifest__t">
    ${'Завод полного цикла в Артёме: формуем бетон, варим битум, выпускаем асфальт и сами кладём его своей техникой.'
      .split(' ').map((w) => `<span class="w">${esc(w)}</span>`).join(' ')}
  </p>
  <div class="manifest__ent">
    ${companies.map((c) => `
    <article data-rise>
      <em>${esc(c.legal)}</em>
      <h3>${esc(c.slug === 'monte' ? 'Производство' : 'Дороги и работы')}</h3>
      <p>${esc(c.desc)}</p>
      <div class="manifest__links">
        ${c.units.map((u) => {
          const href = u.href === '/catalog/' ? 'catalog/' : u.href === '/bitum/' ? 'bitum/'
            : u.href === '/production/' ? 'production/' : u.href === '/asphalt/' ? 'asphalt/'
            : u.href === '/rent/' ? 'rent/' : u.href === '/construction/' ? 'works/' : 'contacts/';
          return `<a href="${href}"><b>${esc(u.t)}</b><i>${esc(u.d)}</i></a>`;
        }).join('')}
      </div>
    </article>`).join('')}
  </div>
</section>

<section class="cat" id="catalog">
  <div class="cat__pin">
    <div class="cat__head">
      <span class="secnum">01 / Каталог</span>
      <h2>Пять групп<br>изделий</h2>
    </div>
    <div class="cat__track" id="catTrack">
      ${categories.map((c, i) => {
        const list = products.filter((p) => p.cat === c.slug);
        const min = Math.min(...list.map((p) => (getPrice(p.slug) ? getPrice(p.slug).price : Infinity)));
        return `
      <article class="cc">
        <span class="cc__n">${String(i + 1).padStart(2, '0')}</span>
        <div class="cc__ph"><img src="img/cut/cat-${c.slug}.webp" alt="${esc(c.name)}" loading="lazy"></div>
        <h3>${esc(c.short)}</h3>
        <p>${esc(c.desc)}</p>
        <span class="cc__p">от ${money(min)} ₽<i>за ${esc(list[0].unit)}</i></span>
        <a class="cc__go" href="catalog/${c.slug}/" aria-label="${esc(c.name)}"></a>
      </article>`;
      }).join('')}
      <article class="cc cc--all">
        <h3>Весь каталог<br>и калькуляторы</h3>
        <p>${products.length} позиций с ценами, габаритные 3D-модели, расчёт объёма и поддонов по каждой.</p>
        <a class="btn btn--accent" href="catalog/"><span>Открыть каталог</span></a>
      </article>
    </div>
    <div class="cat__bar"><i id="catBar"></i></div>
  </div>
</section>

<section class="prod" id="proizvodstvo">
  <div class="prod__head">
    <span class="secnum">02 / Производство</span>
    <h2 class="split"><span class="ln"><i>Немецкий пресс,</i></span><span class="ln"><i>приморский отсев</i></span></h2>
  </div>
  <div class="prod__rows">
    <div class="prow" data-rise>
      <span class="prow__k">01</span><h3>Формовка</h3>
      <p>Жёсткая смесь уплотняется вибрацией под давлением. Плотность выше, воды меньше, геометрия — в допуске ГОСТ.</p>
      <div class="prow__img"><img src="img/production/line-pavers.jpg" alt="Линия формовки" loading="lazy"></div>
    </div>
    <div class="prow" data-rise>
      <span class="prow__k">02</span><h3>Твердение</h3>
      <p>Камера пропарки, затем выдержка на стеллажах. Отгрузка — после набора отпускной прочности.</p>
      <div class="prow__img"><img src="img/production/curing-racks.jpg" alt="Камера твердения" loading="lazy"></div>
    </div>
    <div class="prow" data-rise>
      <span class="prow__k">03</span><h3>Отгрузка</h3>
      <p>Пакетирование на поддоны, самовывоз с площадки в Артёме или доставка манипулятором и фурой.</p>
      <div class="prow__img"><img src="img/production/blocks-line.jpg" alt="Готовые блоки на поддонах" loading="lazy"></div>
    </div>
  </div>
  <div class="caps">
    ${capacity.map((c) => `<div><b data-count="${String(c.value).replace(',', '.')}">0</b><em>${esc(c.unit)}</em><span>${esc(c.label)} — ${esc(c.note)}</span></div>`).join('')}
  </div>
  <a class="wide-link" href="production/"><b>Как устроено производство</b><i>линия, камера твердения, контроль и отгрузка</i><svg viewBox="0 0 24 12" aria-hidden="true"><path d="M0 6h22M17 1l5 5-5 5"/></svg></a>
</section>

<section class="road" id="dorogi">
  <div class="road__bg"><img src="img/objects/asphalt-night.jpg" alt="Укладка асфальта" loading="lazy"></div>
  <div class="road__in">
    <span class="secnum">03 / Дороги и техника</span>
    <h2 class="split"><span class="ln"><i>От смеси</i></span><span class="ln"><i>до сданного</i></span><span class="ln"><i>участка</i></span></h2>
    <div class="road__cols">
      <a href="asphalt/" data-rise><b>${asphalt.capacityTh} т/ч</b><h3>Асфальтобетон</h3><p>${asphaltCount} марок со своего завода, от ${money(asphaltMin)} ₽ за тонну.</p><span>Смотреть →</span></a>
      <a href="bitum/" data-rise><b>ЭБДК</b><h3>Битумные вяжущие</h3><p>Эмульсии трёх скоростей распада и мастика МБЗ.</p><span>Смотреть →</span></a>
      <a href="rent/" data-rise><b>${group.fleetClaimed}</b><h3>Аренда техники</h3><p>Экскаваторы, краны, самосвалы, катки, грейдер, тралы.</p><span>Смотреть →</span></a>
      <a href="works/" data-rise><b>${group.projects}</b><h3>Работы под ключ</h3><p>Земля, дорога, благоустройство, монтаж.</p><span>Смотреть →</span></a>
    </div>
  </div>
</section>

<section class="works">
  <div class="marq" id="marq">
    <div class="marq__row">
      <figure><img src="img/objects/courtyard.jpg" alt="Благоустройство двора" loading="lazy"><figcaption>Благоустройство двора</figcaption></figure>
      <figure><img src="img/objects/road-kerb.jpg" alt="Установка бордюра" loading="lazy"><figcaption>Бордюр на проезжей части</figcaption></figure>
      <figure><img src="img/product/paving-done.jpg" alt="Уложенная брусчатка" loading="lazy"><figcaption>Укладка брусчатки</figcaption></figure>
      <figure><img src="img/work/asphalt-plant.jpg" alt="Асфальтобетонный завод" loading="lazy"><figcaption>Асфальтобетонный завод</figcaption></figure>
      <figure><img src="img/objects/paving-checker.jpg" alt="Плитка в шахматной раскладке" loading="lazy"><figcaption>Раскладка «шахматы»</figcaption></figure>
      <figure><img src="img/work/zemlyanye.jpg" alt="Земляные работы" loading="lazy"><figcaption>Земляные работы</figcaption></figure>
      <figure><img src="img/product/color-wall.jpg" alt="Цветная кладка" loading="lazy"><figcaption>Цветной блок в кладке</figcaption></figure>
      <figure><img src="img/objects/curb-street.jpg" alt="Бордюр на улице" loading="lazy"><figcaption>Улица после сдачи</figcaption></figure>
    </div>
  </div>
</section>

<section class="price" id="price">
  <div class="price__head">
    <span class="secnum">04 / Прайс</span>
    <h2 class="split"><span class="ln"><i>Цены открыто</i></span></h2>
    <p>Прайс завода от ${priceList.updated} · ${priceList.vat} · ${priceList.terms}</p>
  </div>
  <div class="ptable">
    ${categories.map((c) => {
      const list = products.filter((p) => p.cat === c.slug);
      return `<div class="pgroup"><span>${esc(c.name)}</span></div>` + list.slice(0, 3).map((p) => {
        const pr = getPrice(p.slug);
        return `<a class="prow2 prow2--l" href="catalog/${p.cat}/${p.slug}/"><h4>${esc(p.short || p.name)}</h4><em>${esc(p.size)}</em><b>${priceText(pr)}<span>${esc(p.unit)}</span></b></a>`;
      }).join('');
    }).join('')}
  </div>
  <a class="wide-link" href="price/"><b>Весь прайс: ЗБИ, асфальт и битум</b><i>${products.length} + ${asphaltCount} + ${bitumenCount} позиций одной страницей</i><svg viewBox="0 0 24 12" aria-hidden="true"><path d="M0 6h22M17 1l5 5-5 5"/></svg></a>
</section>

${contactSection(0)}`;

  return {
    path: 'index.html',
    html: page({
      title: 'МОНТЕ — завод бетонных изделий и дорожных материалов в Артёме',
      desc: 'Вибропрессованные бетонные изделия, асфальтобетон, битумные вяжущие, аренда техники и работы. Артём, Приморский край. Цены открыто.',
      depth: 0, active: '',
      hero, body,
      
      scripts: ['hero-boot.js'],
      cls: 'p-home',
    }),
  };
}

/* ---------------- общий блок контактов ---------------- */
function contactSection(depth) {
  const b = '../'.repeat(depth);
  return `
<section class="contact" id="contact">
  <div class="contact__l">
    <span class="secnum">05 / Контакты</span>
    <h2 class="split"><span class="ln"><i>Позвоните</i></span><span class="ln"><i>на завод</i></span></h2>
    <div class="tels">
      <a href="tel:${company.phoneRaw}"><b>${company.phone}</b><i>завод МОНТЕ · изделия и битум</i></a>
      <a href="tel:${company.phone2Raw}"><b>${company.phone2}</b><i>Стройспецтехника · асфальт, техника, работы</i></a>
      <a href="mailto:${company.email}"><b>${company.email}</b><i>почта для заявок и счетов</i></a>
    </div>
    <div class="addr">
      <p>692754, Приморский край,<br>г. Артём, ул. Севская, 44</p>
      <p>${company.hours}<br>отгрузка по согласованию</p>
    </div>
  </div>
  <form class="form" id="form" novalidate>
    <label><span>Как к вам обращаться</span><input type="text" name="name" required></label>
    <label><span>Телефон</span><input type="tel" name="phone" required placeholder="+7"></label>
    <label><span>Что нужно</span><textarea name="msg" rows="3" placeholder="Позиция, объём, адрес объекта"></textarea></label>
    <button class="btn btn--accent btn--wide" type="submit"><span>Отправить заявку</span></button>
    <p class="form__note" id="formNote">Перезвоним в рабочее время. Спецификацию и счёт выставляем по номенклатуре прайса.</p>
  </form>
</section>`;
}

/* ---------------- Производство ---------------- */
export function production() {
  const body = `
<section class="sec sec--split">
  <div>
    ${secHead('01', 'Технология', 'Вибропрессование,|а не литьё')}
    <p class="ptext">Изделия формуются на немецком вибропрессе ${esc(company.press)}: жёсткая малоподвижная смесь уплотняется вибрацией под давлением пуансона. Воды в такой смеси в разы меньше, чем в литьевой, поэтому изделие выходит плотнее, прочнее по морозостойкости и держит геометрию в допуске стандарта.</p>
    <p class="pnote"><b>Почему это видно на объекте.</b> Плотный вибропрессованный камень меньше впитывает воду, а значит меньше разрушается на циклах замораживания — на приморскую зиму это главный параметр долговечности покрытия.</p>
  </div>
  ${kv([
    ['Площадка', 'г. Артём, ул. Севская, 44'],
    ['Оборудование', 'вибропресс ' + esc(company.press) + ' (Германия)'],
    ['Проектная мощность', '9 млн изделий в год'],
    ['Номенклатура', products.length + ' позиций в прайсе'],
    ['Юрлицо', esc(legalEntities[0].legal) + ' · ИНН ' + legalEntities[0].inn],
    ['Отгрузка', 'поддонами, самовывоз или доставка'],
  ])}
</section>

<section class="sec">
  ${secHead('02', 'Передел', 'От отсева|до поддона')}
  <div class="steps steps--4">
    <div class="step" data-rise><span class="step__n">01</span><h3>Смесь</h3><p>Отсев дробления, цемент, вода и пигмент дозируются на узле. Малоподвижная смесь — основа плотности будущего изделия.</p></div>
    <div class="step" data-rise><span class="step__n">02</span><h3>Формовка</h3><p>Матрица и пуансон задают типоразмер. Вибрация под давлением уплотняет смесь, изделие сразу выходит на поддон.</p></div>
    <div class="step" data-rise><span class="step__n">03</span><h3>Твердение</h3><p>Камера пропарки, затем выдержка на стеллажах до набора отпускной прочности. Только после этого партия идёт на склад.</p></div>
    <div class="step" data-rise><span class="step__n">04</span><h3>Отгрузка</h3><p>Пакетирование на поддоны, погрузка манипулятором или погрузчиком. Самовывоз с площадки или доставка по краю.</p></div>
  </div>
</section>

<section class="sec">
  ${secHead('03', 'Мощности', 'Сколько завод|может дать')}
  <div class="caps caps--page">
    ${capacity.map((c) => `<div data-rise><b data-count="${String(c.value).replace(',', '.')}">0</b><em>${esc(c.unit)}</em><span>${esc(c.label)}<i>${esc(c.note)}</i></span></div>`).join('')}
  </div>
</section>

<section class="sec">
  ${secHead('04', 'Признание', 'Лучший товар|Приморья 2026')}
  <div class="award award--page" data-rise>
    <img src="../img/brand/best-primorye-2026-light.png" alt="Знак «Лучший товар Приморья 2026»">
    <div>
      <p>Звание присвоено камню стеновому пустотелому, бордюру дорожному и тротуарному и плитке бетонной тротуарной — письмо Росстандарта № 43/09/2599 от 09.07.2026.</p>
      <a class="btn" href="../documents/"><span>Документы завода</span></a>
    </div>
  </div>
</section>

<section class="sec">
  ${secHead('05', 'Фото', 'Как это|выглядит')}
  <div class="phgrid">
    ${[
      ['img/production/line-pavers.jpg', 'Брусчатка красного исполнения на выходе вибропресса'],
      ['img/production/curing-racks.jpg', 'Изделия в камере твердения на стеллажах'],
      ['img/production/kerb-line.jpg', 'Бортовой камень на линии'],
      ['img/production/blocks-line.jpg', 'Готовые блоки на поддонах'],
      ['img/product/shop-racks.jpg', 'Склад готовой продукции'],
      ['img/product/colors.jpg', 'Образцы цветов изделий завода'],
    ].map(([src, alt]) => `<figure data-rise><img src="../${src}" alt="${esc(alt)}" loading="lazy"><figcaption>${esc(alt)}</figcaption></figure>`).join('')}
  </div>
</section>

${faqBlock([
    { q: 'Чем вибропрессованное изделие лучше литого?', a: 'Меньше воды в смеси и уплотнение под давлением дают более плотный бетон: выше прочность и морозостойкость, точнее геометрия. Литые изделия дешевле в оснастке, но на открытой площадке служат меньше.' },
    { q: 'Можно ли приехать и посмотреть продукцию?', a: 'Да, площадка в Артёме на Севской, 44 работает по будням с 9:00 до 18:00. Отгрузку и осмотр партии лучше согласовать заранее по телефону.' },
    { q: 'Делаете ли изделия по своим размерам?', a: 'Пресс формует изделие высотой 25–500 мм в габарите поддона, конкретный типоразмер задаёт сменная матрица. Наличие оснастки, срок и цену подтверждает завод по запросу.' },
  ], 'Вопросы о производстве')}

${nextGrid([
    ['catalog/', 'Каталог изделий', products.length + ' позиций с ценами'],
    ['documents/', 'Документы', 'сертификаты и знак качества'],
    ['price/', 'Прайс-лист', 'ЗБИ, асфальт и битум'],
  ], 1, 'Дальше')}`;

  return {
    path: 'production/index.html',
    html: page({
      title: 'Производство бетонных изделий МОНТЕ в Артёме — вибропресс Hess',
      desc: 'Как устроен завод бетонных изделий МОНТЕ: вибропресс Hess, камера твердения, проектная мощность 9 млн изделий в год. Артём, Приморский край.',
      depth: 1, active: 'production',
      crumbs: [{ label: 'Производство' }],
      hero: pageHero({
        label: 'Производство', depth: 1,
        h1: 'Завод в Артёме:|как получается камень',
        lead: 'Отсев, цемент и вибрация под давлением. Ниже — передел от смеси до поддона и то, на что это влияет на объекте.',
        facts: [['9 млн', 'изделий в год'], [company.press, 'вибропресс, Германия'], [products.length, 'позиций в прайсе']],
        img: 'img/production/kerb-line.jpg', imgAlt: 'Линия завода бетонных изделий',
      }),
      body,
    }),
  };
}

/* ---------------- Прайс ---------------- */
export function price() {
  const zbi = categories.map((c) => {
    const list = products.filter((p) => p.cat === c.slug);
    return `<div class="pgroup"><span>${esc(c.name)}</span></div>` + list.map((p) => {
      const pr = getPrice(p.slug);
      return `<a class="prow2 prow2--l" href="../catalog/${p.cat}/${p.slug}/">
        <h4>${esc(p.short || p.name)}${p.marking ? ` <i>${esc(p.marking)}</i>` : ''}</h4>
        <em>${esc(p.size)} мм${p.grade ? ' · ' + esc(p.grade) : ''}</em>
        <b>${priceText(pr)}<span>${esc(p.unit)}</span></b></a>`;
    }).join('');
  }).join('');

  const asp = asphaltGroups.map((g) => `<div class="pgroup"><span>${esc(g.name)} · ${esc(g.std)}</span></div>` +
    g.items.map((it) => priceRow(it.m, '', it.use, `${money(it.p)} ₽<span>тонна</span>`)).join('')).join('');

  const bit = bitumenGroups.map((g) => `<div class="pgroup"><span>${esc(g.name)}${g.std ? ' · ' + esc(g.std) : ''}</span></div>` +
    g.items.map((it) => priceRow(it.m, it.speed || '', it.use, `${money(it.p)} ₽<span>тонна</span>`)).join('')).join('');

  const body = `
<section class="sec">
  <div class="tabs" data-rise>
    <button class="tab is-on" data-t="zbi">Бетонные изделия<i>${products.length}</i></button>
    <button class="tab" data-t="asp">Асфальтобетон<i>${asphaltCount}</i></button>
    <button class="tab" data-t="bit">Битумные вяжущие<i>${bitumenCount}</i></button>
  </div>

  <div class="tpane is-on" id="pane-zbi">
    <p class="note note--top">Прайс завода бетонных изделий от ${priceList.updated} · ${priceList.vat} · ${priceList.terms}. Отгружает ${esc(legalEntities[0].legal)}.</p>
    <div class="ptable">${zbi}</div>
  </div>

  <div class="tpane" id="pane-asp" hidden>
    <p class="note note--top">Прайс «Асфальтобетон» от ${esc(roadMeta.asphalt.updated)} · ${esc(roadMeta.asphalt.vat)} · ${esc(roadMeta.asphalt.terms)}. Отгружает ${esc(roadMeta.asphalt.legal)}.</p>
    <div class="ptable ptable--wide">${asp}</div>
  </div>

  <div class="tpane" id="pane-bit" hidden>
    <p class="note note--top">Прайс битумных материалов от ${esc(roadMeta.bitumen.updated)} · ${esc(roadMeta.bitumen.vat)} · ${esc(roadMeta.bitumen.terms)}. Выпускает ${esc(roadMeta.bitumen.legal)}.</p>
    <div class="ptable ptable--wide">${bit}</div>
  </div>
</section>

<section class="sec">
  ${secHead('01', 'Доставка', 'Чем везём|и сколько влезает')}
  <div class="tw" data-rise>
    <table class="tbl">
      <thead><tr><th>Транспорт</th><th>Грузоподъёмность</th><th>Поддонов</th><th>Примечание</th></tr></thead>
      <tbody>${transport.map((t) => `<tr>
        <td data-l="Транспорт">${esc(t.name)}</td>
        <td data-l="Грузоподъёмность">${money(t.capacityKg)} кг</td>
        <td data-l="Поддонов">до ${t.maxPallets}</td>
        <td data-l="Примечание">${esc(t.note)}</td>
      </tr>`).join('')}</tbody>
    </table>
  </div>
  <p class="note">Вместимость — оценочная: реальный рейс ограничивает то, что наступит раньше, масса или место. Стоимость доставки считает диспетчер под объём и адрес; цены прайса даны при самовывозе.</p>
</section>

<section class="sec">
  <p class="note note--warn"><b>Важно.</b> При расхождении сайта и прайса верен прайс: он новее и подписан заводом. Цены действуют на дату документа и могут быть пересмотрены заводом без уведомления сайта.</p>
</section>

${nextGrid([
    ['catalog/', 'Каталог с калькуляторами', 'посчитать объём и поддоны'],
    ['spec/', 'Спецификация', 'собрать список и отправить на счёт'],
    ['contacts/', 'Выставить счёт', 'по номенклатуре прайса'],
  ], 1, 'Дальше')}`;

  return {
    path: 'price/index.html',
    html: page({
      title: 'Прайс-лист МОНТЕ: бетонные изделия, асфальтобетон, битум — Артём',
      desc: `Цены завода МОНТЕ: ${products.length} позиций ЗБИ, ${asphaltCount} марок асфальтобетона и ${bitumenCount} позиции битумных материалов. Прайсы от ${priceList.updated} и ${roadMeta.asphalt.updated}.`,
      depth: 1, active: 'price',
      crumbs: [{ label: 'Прайс' }],
      hero: pageHero({
        label: 'Прайс', depth: 1,
        h1: 'Цены открыто,|все три прайса',
        lead: 'Бетонные изделия, асфальтобетонные смеси и битумные вяжущие. Цены с НДС 22% при самовывозе с площадки в Артёме.',
        facts: [[products.length + asphaltCount + bitumenCount, 'позиций всего'], [priceList.updated, 'прайс ЗБИ'], [roadMeta.asphalt.updated, 'прайс асфальта']],
      }),
      body, scripts: ['tabs.js'],
    }),
  };
}

/* ---------------- Документы ---------------- */
export function documents() {
  const body = `
<section class="sec">
  ${secHead('01', 'Сертификаты', 'Что есть|на руках')}
  <div class="dgrid dgrid--2">
    ${docs.map((d) => `
    <article class="dcard dcard--img" data-rise>
      <a class="dcard__ph" href="../${d.img.replace(/^\//, '')}" target="_blank" rel="noopener">
        <img src="../${d.img.replace(/^\//, '')}" alt="${esc(d.title)}" loading="lazy">
      </a>
      <div class="dcard__b">
        <span class="dcard__t">${esc(d.type)}</span>
        <h3>${esc(d.title)}</h3>
        <dl class="kv kv--tight">
          <div class="kv__r"><dt>Номер</dt><dd>${esc(d.num)}</dd></div>
          <div class="kv__r"><dt>Стандарт</dt><dd>${esc(d.gost)}</dd></div>
          <div class="kv__r"><dt>Орган</dt><dd>${esc(d.org)}</dd></div>
          <div class="kv__r"><dt>Срок</dt><dd>${esc(d.from)} — ${esc(d.to)}</dd></div>
        </dl>
        ${d.renewal ? '<p class="dcard__warn">Срок вышел 22.08.2026, документ на переоформлении. На тендер и проверку запрашивайте у завода актуальный бланк.</p>' : ''}
      </div>
    </article>`).join('')}
  </div>
</section>

<section class="sec">
  ${secHead('02', 'Награда', 'Лучший товар|Приморья 2026')}
  <div class="award award--page" data-rise>
    <img src="../img/brand/best-primorye-2026-light.png" alt="Знак «Лучший товар Приморья 2026»">
    <div>
      <p>Письмо Росстандарта № 43/09/2599 от 09.07.2026. Звание присвоено камню стеновому пустотелому, бордюру дорожному и тротуарному и плитке бетонной тротуарной — знак ставится только на эти группы.</p>
      <a class="btn" href="../img/docs/award-letter-rst.jpg" target="_blank" rel="noopener"><span>Скан письма</span></a>
    </div>
  </div>
</section>

<section class="sec">
  ${secHead('03', 'Реквизиты', 'Два юрлица|и что отгружает каждое')}
  <div class="lgrid">
    ${legalEntities.map((e) => `
    <article class="lcard" data-rise>
      <h3>${esc(e.legal)}</h3>
      <p class="lcard__scope">${esc(e.scope)}</p>
      <dl class="kv kv--tight">
        <div class="kv__r"><dt>ИНН</dt><dd>${esc(e.inn)}</dd></div>
        <div class="kv__r"><dt>КПП</dt><dd>${esc(e.kpp)}</dd></div>
        <div class="kv__r"><dt>ОГРН</dt><dd>${esc(e.ogrn)}</dd></div>
        <div class="kv__r"><dt>Адрес</dt><dd>${esc(e.address)}</dd></div>
        <div class="kv__r"><dt>Директор</dt><dd>${esc(e.director)}</dd></div>
      </dl>
    </article>`).join('')}
  </div>
</section>

${nextGrid([
    ['production/', 'Производство', 'как получается изделие'],
    ['catalog/', 'Каталог', 'что подтверждают эти документы'],
    ['contacts/', 'Запросить бланк', 'скан по почте под тендер'],
  ], 1, 'Дальше')}`;

  return {
    path: 'documents/index.html',
    html: page({
      title: 'Документы и сертификаты завода МОНТЕ — Артём',
      desc: 'Сертификаты соответствия на бортовой камень и тротуарную плитку, знак «Лучший товар Приморья 2026», реквизиты ООО «МОНТЕ» и ООО «Стройспецтехника».',
      depth: 1, active: 'docs',
      crumbs: [{ label: 'Документы' }],
      hero: pageHero({
        label: 'Документы', depth: 1,
        h1: 'Чем подтверждается|качество',
        lead: 'Сертификаты соответствия, письмо Росстандарта и реквизиты обоих юридических лиц группы.',
        facts: [[docs.length, 'сертификата'], ['2026', 'знак Приморья'], [legalEntities.length, 'юрлица']],
      }),
      body,
    }),
  };
}

/* ---------------- Контакты ---------------- */
export function contacts() {
  const body = `
<section class="sec sec--split">
  <div>
    ${secHead('01', 'Связь', 'Два номера|и кто на них')}
    <div class="tels tels--page">
      <a href="tel:${company.phoneRaw}"><b>${company.phone}</b><i>${esc(legalEntities[0].legal)} · бетонные изделия, битум</i></a>
      <a href="tel:${company.phone2Raw}"><b>${company.phone2}</b><i>${esc(legalEntities[1].legal)} · асфальт, техника, работы</i></a>
      <a href="mailto:${company.email}"><b>${company.email}</b><i>заявки, спецификации, счета</i></a>
    </div>
    <p class="pnote"><b>Номера принадлежат разным юрлицам.</b> Это не дубли: по первому отгружают изделия и битум, по второму — смесь, технику и работы. Звонок не туда стоит вам одного лишнего переключения.</p>
  </div>
  ${kv([
    ['Площадка', '692754, Приморский край, г. Артём, ул. Севская, 44'],
    ['Режим', esc(company.hours) + ', отгрузка по согласованию'],
    ['Самовывоз', 'цены прайсов даны при самовывозе с площадки'],
    ['Доставка', 'считает диспетчер под объём и адрес'],
    ['Регион работ', 'Артём, Владивосток и Приморский край'],
  ])}
</section>

<section class="sec">
  ${secHead('02', 'Реквизиты', 'Кому выставлять|и от кого ждать')}
  <div class="lgrid">
    ${legalEntities.map((e) => `
    <article class="lcard" data-rise>
      <h3>${esc(e.legal)}</h3>
      <p class="lcard__scope">${esc(e.scope)}</p>
      <dl class="kv kv--tight">
        <div class="kv__r"><dt>ИНН</dt><dd>${esc(e.inn)}</dd></div>
        <div class="kv__r"><dt>КПП</dt><dd>${esc(e.kpp)}</dd></div>
        <div class="kv__r"><dt>ОГРН</dt><dd>${esc(e.ogrn)}</dd></div>
        <div class="kv__r"><dt>Почта</dt><dd>${esc(e.email)}</dd></div>
        <div class="kv__r"><dt>Директор</dt><dd>${esc(e.director)}</dd></div>
      </dl>
    </article>`).join('')}
  </div>
</section>

${contactSection(1)}

${faqBlock([
    { q: 'Работаете с юридическими лицами по безналу?', a: 'Да. Счёт выставляется от того юрлица, которое отгружает позицию: изделия и битум — ООО «МОНТЕ», смесь, техника и работы — ООО «Стройспецтехника».' },
    { q: 'Можно забрать продукцию своим транспортом?', a: 'Да, цены прайсов даны при самовывозе с площадки в Артёме. Учтите массу поддона: изделия грузят манипулятором или погрузчиком, вручную поддон не переносят.' },
    { q: 'Сколько стоит доставка?', a: 'Доставку считает диспетчер под объём, адрес и тип транспорта. Ориентиры по вместимости машин приведены на странице прайса.' },
  ], 'Вопросы по работе')}

${nextGrid([
    ['price/', 'Прайс-лист', 'все три прайса одной страницей'],
    ['spec/', 'Спецификация', 'собрать список позиций для счёта'],
    ['documents/', 'Документы', 'сертификаты и реквизиты'],
  ], 1, 'Дальше')}`;

  return {
    path: 'contacts/index.html',
    html: page({
      title: 'Контакты завода МОНТЕ — Артём, Севская 44 | Стройспецтехника',
      desc: 'Телефоны, почта, адрес площадки и реквизиты ООО «МОНТЕ» и ООО «Стройспецтехника». Артём, ул. Севская, 44.',
      depth: 1, active: 'contacts',
      crumbs: [{ label: 'Контакты' }],
      hero: pageHero({
        label: 'Контакты', depth: 1,
        h1: 'Артём,|Севская 44',
        lead: 'Площадка, с которой уходит и бетонное изделие, и горячая смесь, и техника на объект.',
        facts: [['2', 'юрлица группы'], [company.hours.replace('Пн–Пт ', ''), 'будни'], ['Приморский край', 'регион работ']],
      }),
      body,
    }),
  };
}

/* ---------------- Спецификация ---------------- */
export function spec() {
  const body = `
<section class="sec">
  <p class="specempty" id="specEmpty" hidden>
    Спецификация пуста. Откройте любую позицию в <a href="../catalog/">каталоге</a>,
    посчитайте объём в калькуляторе и нажмите «В спецификацию» — позиции соберутся здесь.
  </p>
  <div id="specBox" hidden>
    <div class="stable" data-rise>
      <div class="srow srow--h"><div>Позиция</div><div>Объём</div><div>Штук</div><div>По прайсу</div><div></div></div>
      <div id="specList"></div>
      <div class="srow srow--t"><div>Итого по прайсу, с НДС 22%</div><div></div><div></div><div id="specTotal">—</div><div></div></div>
    </div>
    <div class="specact">
      <button class="btn btn--accent" id="specSend" type="button"><span>Отправить на счёт</span></button>
      <button class="btn" id="specCopy" type="button"><span>Скопировать списком</span></button>
      <button class="btn btn--ghost" id="specClear" type="button"><span>Очистить</span></button>
    </div>
    <p class="note">Спецификация хранится только в вашем браузере: сервера у этого прототипа нет. Итог считается по ценам прайса при самовывозе — доставка, разгрузка и скидка на объём в сумму не входят.</p>
  </div>
</section>

${nextGrid([
    ['catalog/', 'Каталог', 'добавить ещё позиции'],
    ['price/', 'Прайс-лист', 'проверить цены и доставку'],
    ['contacts/', 'Контакты', 'выставить счёт'],
  ], 1, 'Дальше')}`;

  return {
    path: 'spec/index.html',
    html: page({
      title: 'Спецификация — черновик заявки | МОНТЕ',
      desc: 'Список позиций, собранный в калькуляторах каталога: объём, количество и сумма по прайсу завода МОНТЕ.',
      depth: 1, active: '',
      crumbs: [{ label: 'Спецификация' }],
      hero: pageHero({
        label: 'Спецификация', depth: 1,
        h1: 'Черновик|вашей заявки',
        lead: 'Позиции, которые вы посчитали в каталоге. Отправьте список на почту завода или продиктуйте по телефону.',
      }),
      body,
    }),
  };
}

/* ---------------- 404 ---------------- */
export function notFound() {
  return {
    path: '404.html',
    html: page({
      title: 'Страница не найдена | МОНТЕ',
      desc: 'Такой страницы на сайте нет.',
      depth: 0, active: '',
      hero: pageHero({
        label: 'Ошибка 404', depth: 0,
        h1: 'Такой страницы|здесь нет',
        lead: 'Возможно, позиция переехала в другую группу каталога или ссылка набрана с опечаткой.',
      }),
      body: nextGrid([
        ['catalog/', 'Каталог изделий', products.length + ' позиций с ценами'],
        ['price/', 'Прайс-лист', 'ЗБИ, асфальт и битум'],
        ['contacts/', 'Контакты', 'позвонить на завод'],
      ], 0, 'Куда дальше'),
    }),
  };
}

export function miscPages() {
  return [home(), production(), price(), documents(), contacts(), spec(), notFound()];
}
