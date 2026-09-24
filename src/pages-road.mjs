// ============================================================
// Дорожное направление: асфальтобетон, битумные вяжущие,
// аренда техники (хаб + девять типов) и работы (хаб + четыре вида).
// ============================================================
import { page, esc } from './layout.mjs';
import { pageHero, secHead, nextGrid, faqBlock, money, kv } from './ui.mjs';
import {
  roadMeta, asphaltGroups, asphaltCount, asphaltMin, asphaltMax,
  bitumenGroups, bitumenCount, fleetGroups, fleetListed, fleetTypes,
  workTypes, company, group, asphalt,
} from './data.mjs';

const allMachines = fleetGroups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.name })));
const byArts = (arts) => allMachines.filter((m) => arts.includes(m.art));
const imgPath = (s, depth) => '../'.repeat(depth) + String(s || '').replace(/^\//, '');

/* ---------------- Асфальтобетон ---------------- */
export function asphaltPage() {
  const body = `
<section class="sec sec--split">
  <div>
    ${secHead('01', 'Завод', 'Своя смесь,|своя укладка')}
    <p class="ptext">Асфальтобетонный завод группы работает в Артёме и отгружает горячую смесь ${asphalt.capacityTh} тонн в час. Отгрузка идёт от ${esc(asphalt.legal)}: самовывоз самосвалом заказчика или доставка нашим транспортом по заявке. Подтверждённая рабочая смесь завода — ${esc(asphalt.confirmedMix)}.</p>
    <p class="pnote"><b>Почему смесь нельзя везти далеко.</b> Горячая смесь теряет температуру в кузове, и после остывания её уже не уплотнить до проектной плотности. Плечо доставки диспетчер считает вместе с временем укладки, а не отдельно.</p>
  </div>
  ${kv([
    ['Производительность', `${asphalt.capacityTh} т/ч`],
    ['Отгружает', esc(roadMeta.asphalt.legal) + ` · ИНН ${roadMeta.asphalt.inn}`],
    ['Позиций в прайсе', `${asphaltCount} марок по четырём стандартам`],
    ['Цена', `${money(asphaltMin)} — ${money(asphaltMax)} ₽ за тонну`],
    ['Условия', esc(roadMeta.asphalt.terms)],
    ['Прайс от', esc(roadMeta.asphalt.updated) + ` · ${esc(roadMeta.asphalt.vat)}`],
  ])}
</section>

${asphaltGroups.map((g, i) => `
<section class="sec">
  ${secHead(String(i + 2).padStart(2, '0'), g.std, g.name, esc(g.lead))}
  <div class="ptable ptable--wide" data-rise>
    ${g.items.map((it) => `
    <div class="prow2"><h4>${esc(it.m)}</h4><em>${esc(it.use)}</em><b>${money(it.p)} ₽<span>тонна</span></b></div>`).join('')}
  </div>
</section>`).join('')}

<section class="sec">
  <p class="note">${esc(roadMeta.asphalt.delivery)} Цены по прайсу «Асфальтобетон» от ${esc(roadMeta.asphalt.updated)}, ${esc(roadMeta.asphalt.vat)}, ${esc(roadMeta.asphalt.terms)}.</p>
</section>

${faqBlock([
    { q: 'Сколько тонн смеси нужно на мой участок?', a: 'Ориентир: на 1 м² слоя толщиной 5 см уходит примерно 0,12 тонны плотной смеси. Точный расход зависит от типа смеси и коэффициента уплотнения — считает диспетчер по проекту или замерам.' },
    { q: 'Можно забрать смесь своим транспортом?', a: 'Да, цена в прайсе дана при самовывозе с площадки в Артёме. Кузов должен быть чистым и укрытым тентом — иначе смесь остывает и теряет качество в дороге.' },
    { q: 'Чем плотная смесь отличается от пористой?', a: 'Плотная идёт в верхний слой покрытия и работает как износостойкий слой. Пористая и высокопористая — в нижний слой и основание: они дешевле, но не рассчитаны на прямой контакт с колесом.' },
    { q: 'Что такое ЩМА и когда её берут?', a: 'Щебёночно-мастичная смесь по ГОСТ 31015-2002 держит колею и сдвиг лучше плотной. Её ставят на полосы с интенсивным движением и на подъёмы, где покрытие работает на сдвиг.' },
  ], 'Вопросы по смеси')}

${nextGrid([
    ['bitum/', 'Битумные вяжущие', 'эмульсии ЭБДК и мастика МБЗ'],
    ['works/dorozhnye-raboty/', 'Дорожные работы', 'основание, покрытие, бортовой камень'],
    ['rent/samosval/', 'Самосвалы', 'вывоз и подвоз материала'],
  ], 1, 'Дальше')}`;

  return {
    path: 'asphalt/index.html',
    html: page({
      title: `Асфальтобетонная смесь в Артёме — ${asphaltCount} марок, цены завода | Стройспецтехника МОНТЕ`,
      desc: `Горячая асфальтобетонная смесь со своего завода в Артёме: ${asphaltCount} марок по ГОСТ 9128-2013, ГОСТ 31015-2002 и ГОСТ Р. Цены от ${money(asphaltMin)} ₽ за тонну, прайс от ${roadMeta.asphalt.updated}.`,
      depth: 1, active: 'road',
      crumbs: [{ label: 'Асфальтобетон' }],
      hero: pageHero({
        label: 'Дороги · Асфальтобетон', depth: 1,
        h1: 'Горячая смесь|со своего завода',
        lead: `${asphaltCount} марок по четырём стандартам. Отгрузка круглый сезон с площадки в Артёме, укладка — своим звеном и своей техникой.`,
        facts: [[asphalt.capacityTh + ' т/ч', 'производительность'], [asphaltCount, 'марок в прайсе'], [money(asphaltMin) + ' ₽', 'от, за тонну']],
        img: 'img/objects/asphalt-night.jpg', imgAlt: 'Ночная укладка асфальтобетона',
      }),
      body,
    }),
  };
}

/* ---------------- Битумные вяжущие ---------------- */
export function bitumPage() {
  const body = `
<section class="sec sec--split">
  <div>
    ${secHead('01', 'Производство', 'Эмульсия|варится здесь же')}
    <p class="ptext">Битумные эмульсии и дорожную мастику выпускает ${esc(roadMeta.bitumen.legal)} на той же площадке в Артёме, где стоит завод бетонных изделий. Поэтому подгрунтовка приезжает на объект вместе со смесью, а не отдельной закупкой у посредника.</p>
    <p class="pnote"><b>Скорость распада — главный параметр.</b> Он определяет, успеете ли вы уложиться в технологию: быстрый распад под подгрунтовку, средний под пропитку и ямочный ремонт, медленный — под холодные смеси и укрепление грунтов.</p>
  </div>
  ${kv([
    ['Стандарт эмульсий', 'ГОСТ Р 58952.1-2020'],
    ['Выпускает', esc(roadMeta.bitumen.legal) + ` · ИНН ${roadMeta.bitumen.inn}`],
    ['Позиций', `${bitumenCount}: три марки эмульсии и мастика`],
    ['Единица', 'тонна, ' + esc(roadMeta.bitumen.vat)],
    ['Условия', esc(roadMeta.bitumen.terms)],
    ['Прайс от', esc(roadMeta.bitumen.updated)],
  ])}
</section>

${bitumenGroups.map((g, gi) => `
<section class="sec">
  ${secHead(String(gi + 2).padStart(2, '0'), g.std || 'Мастика', g.name, esc(g.lead))}
  <div class="bgrid">
    ${g.items.map((it) => `
    <article class="bcard" data-rise>
      <div class="bcard__top">
        <h3>${esc(it.m)}</h3>
        <b>${money(it.p)} ₽<i>за тонну</i></b>
      </div>
      ${it.speed ? `<span class="bcard__sp">${esc(it.speed)}</span>` : ''}
      <p class="bcard__use">${esc(it.use)}</p>
      <p class="bcard__d">${esc(it.desc)}</p>
    </article>`).join('')}
  </div>
</section>`).join('')}

${faqBlock([
    { q: 'Сколько эмульсии нужно на подгрунтовку?', a: 'Расход назначает проект производства работ. Ориентировочный диапазон на подгрунтовку между слоями — сотые доли тонны на квадратный метр; точную норму подтверждает лаборатория и технологическая карта объекта.' },
    { q: 'Чем эмульсия лучше горячего битума?', a: 'С эмульсией работают при обычной температуре: не нужен разогрев и битумовоз с котлом. Она равномернее распределяется по основанию и безопаснее в работе.' },
    { q: 'Как хранить эмульсию?', a: 'В закрытой ёмкости, без промерзания и длительного отстаивания. Расслоившуюся эмульсию перед применением перемешивают; замороженная эмульсия к применению не годится.' },
    { q: 'Для чего мастика МБЗ?', a: 'Для герметизации трещин и деформационных швов покрытия. Это ремонтная работа, которая останавливает разрушение кромок и продлевает срок службы дорожной одежды.' },
  ], 'Вопросы по вяжущим')}

${nextGrid([
    ['asphalt/', 'Асфальтобетон', `${asphaltCount} марок со своего завода`],
    ['works/dorozhnye-raboty/', 'Дорожные работы', 'укладка своим звеном'],
    ['contacts/', 'Заявка на отгрузку', 'диспетчер подтвердит объём и срок'],
  ], 1, 'Дальше')}`;

  return {
    path: 'bitum/index.html',
    html: page({
      title: 'Битумные эмульсии ЭБДК и мастика МБЗ — завод МОНТЕ, Артём',
      desc: 'Битумные дорожные эмульсии ЭБДК Б, С, М по ГОСТ Р 58952.1-2020 и мастика МБЗ собственного производства. Цены завода МОНТЕ, прайс от ' + roadMeta.bitumen.updated + '.',
      depth: 1, active: 'road',
      crumbs: [{ label: 'Битумные вяжущие' }],
      hero: pageHero({
        label: 'Дороги · Битум', depth: 1,
        h1: 'Эмульсии ЭБДК|и мастика МБЗ',
        lead: 'Три скорости распада под разные работы и заливочная мастика для швов. Собственное производство на площадке в Артёме.',
        facts: [[bitumenCount, 'позиции в прайсе'], ['ЭБДК', 'Б · С · М'], [money(84000) + ' ₽', 'от, за тонну']],
        img: 'img/product/night-asphalt.jpg', imgAlt: 'Розлив вяжущего по основанию',
      }),
      body,
    }),
  };
}

/* ---------------- Аренда техники: хаб ---------------- */
export function rentHub() {
  const body = `
<section class="sec">
  ${secHead('01', 'Типы', 'Что можно взять|в работу')}
  <div class="tgrid">
    ${fleetTypes.map((t) => {
      const ms = byArts(t.arts);
      const ph = ms.find((m) => m.img);
      return `
    <a class="tcard" href="${t.slug}/" data-rise>
      <span class="tcard__ph">${ph ? `<img src="${imgPath(ph.img, 1)}" alt="${esc(t.h1)}" loading="lazy">` : ''}</span>
      <h3>${esc(t.h1)}</h3>
      <p>${esc(t.lead.split('.')[0])}.</p>
      <span class="tcard__n">${ms.length} ${ms.length === 1 ? 'машина' : ms.length < 5 ? 'машины' : 'машин'} в парке</span>
    </a>`;
    }).join('')}
  </div>
</section>

<section class="sec">
  ${secHead('02', 'Парк', 'Состав парка|по группам работ')}
  ${fleetGroups.map((g) => `
  <div class="fgroup" data-rise>
    <div class="fgroup__h"><h3>${esc(g.name)}</h3><p>${esc(g.lead)}</p></div>
    <div class="tw">
      <table class="tbl">
        <thead><tr><th>Машина</th><th>Марка и модель</th><th>Назначение</th></tr></thead>
        <tbody>${g.items.map((m) => `<tr>
          <td data-l="Машина">${esc(m.n)}</td>
          <td data-l="Марка">${esc(m.m)}${m.trunc ? ' <i>обозначение в каталоге обрезано</i>' : ''}</td>
          <td data-l="Назначение">${esc(m.use)}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>
  </div>`).join('')}
  <p class="note">В каталоге опубликовано ${fleetListed} единиц, завод заявляет ${group.fleetClaimed}. Грузоподъёмность, вылет стрелы и суточные ставки завод не публикует — их подтверждает диспетчер под конкретную задачу.</p>
</section>

${faqBlock([
    { q: 'Как считается смена?', a: 'Стандартная смена — восемь часов на объекте плюс подача. Переработка и ночные работы согласуются отдельно. Точную ставку под вашу задачу называет диспетчер.' },
    { q: 'Кто отвечает за доставку техники?', a: 'Гусеничные машины приходят на трале, колёсные — своим ходом. Подача считается отдельно от работы и зависит от плеча и подъезда к площадке.' },
    { q: 'Работаете вахтой и подрядом?', a: 'Да. Помимо почасовой и посменной работы берём объект целиком: своя техника, своё звено, свои материалы — асфальт, бетонные изделия и битум с собственных производств.' },
  ], 'Вопросы по аренде')}

${nextGrid([
    ['works/', 'Работы под ключ', 'земля, дорога, благоустройство, монтаж'],
    ['asphalt/', 'Асфальтобетон', 'своя смесь к своей укладке'],
    ['contacts/', 'Диспетчер', 'подберёт машину под задачу'],
  ], 1, 'Дальше')}`;

  return {
    path: 'rent/index.html',
    html: page({
      title: `Аренда спецтехники в Артёме и Приморском крае — ${group.fleetClaimed} единиц | Стройспецтехника МОНТЕ`,
      desc: 'Аренда экскаваторов, автокранов, самосвалов, катков, грейдера, погрузчиков и тралов в Артёме. Собственный парк, работа сменой, вахтой и подрядом.',
      depth: 1, active: 'road',
      crumbs: [{ label: 'Аренда техники' }],
      hero: pageHero({
        label: 'Дороги · Техника', depth: 1,
        h1: 'Собственный парк|на семьдесят восемь единиц',
        lead: 'Земля, подъём, дорога, перевозка. Работаем сменой, вахтой и подрядом под объект — без субподряда на технику.',
        facts: [[group.fleetClaimed, 'единиц техники'], [fleetTypes.length, 'типов машин'], [group.projects, 'проектов']],
        img: 'img/work/zemlyanye.jpg', imgAlt: 'Экскаватор грузит грунт в самосвал',
      }),
      body,
    }),
  };
}

/* ---------------- Аренда: страница типа ---------------- */
export function rentType(t) {
  const ms = byArts(t.arts);
  const body = `
<section class="sec sec--split">
  <div>
    ${secHead('01', 'Задачи', 'Что закрывает|эта машина')}
    <ul class="applist applist--wide">${t.tasks.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  </div>
  <div>
    <h3 class="minih">Что уточнить до заказа</h3>
    <div class="checks">
      ${t.checks.map((c) => `<div class="check" data-rise><b>${esc(c.t)}</b><p>${esc(c.d)}</p></div>`).join('')}
    </div>
  </div>
</section>

<section class="sec">
  ${secHead('02', 'Парк', 'Машины этого|типа у нас')}
  <div class="mgrid">
    ${ms.map((m) => `
    <article class="mcard" data-rise>
      <span class="mcard__ph">${m.img ? `<img src="${imgPath(m.img, 2)}" alt="${esc(m.n)} ${esc(m.m)}" loading="lazy">` : ''}</span>
      <h3>${esc(m.m)}</h3>
      <span class="mcard__n">${esc(m.n)}</span>
      <p>${esc(m.use)}</p>
    </article>`).join('')}
  </div>
  <p class="note">Снимки каталожные: это изображение модели, а не конкретной единицы парка. Грузоподъёмность, вылет стрелы и ставку подтверждает диспетчер под задачу.</p>
</section>

${nextGrid(
    fleetTypes.filter((o) => o.slug !== t.slug).slice(0, 3).map((o) => [`rent/${o.slug}/`, o.h1, o.lead.split('.')[0] + '.']),
    2, 'Другая техника')}`;

  return {
    path: `rent/${t.slug}/index.html`,
    html: page({
      title: t.title,
      desc: t.desc,
      depth: 2, active: 'road',
      crumbs: [{ label: 'Аренда техники', href: 'rent/' }, { label: t.h1 }],
      hero: pageHero({
        label: 'Аренда · ' + t.h1, depth: 2,
        h1: t.h1,
        lead: t.lead,
        facts: [[ms.length, 'машин этого типа'], ['смена', 'вахта · подряд'], ['Артём', 'и Приморский край']],
      }),
      body,
    }),
  };
}

/* ---------------- Работы: хаб ---------------- */
export function worksHub() {
  const body = `
<section class="sec">
  ${secHead('01', 'Направления', 'Четыре вида|работ')}
  <div class="wgrid">
    ${workTypes.map((w) => `
    <a class="wcard" href="${w.slug}/" data-rise>
      <span class="wcard__ph"><img src="${imgPath(w.img, 1)}" alt="${esc(w.imgAlt)}" loading="lazy"></span>
      <div class="wcard__t">
        <h3>${esc(w.h1)}</h3>
        <p>${esc(w.lead)}</p>
        <span class="wcard__go">Подробно →</span>
      </div>
    </a>`).join('')}
  </div>
</section>

<section class="sec sec--split">
  <div>
    ${secHead('02', 'Почему мы', 'Материал и техника|из одних рук')}
    <p class="ptext">Асфальтобетон, бетонные изделия и битумные вяжущие выпускает сама группа, техника — своя, звено — своё. На объекте это означает, что срок не зависит от чужих поставок, а претензия по материалу и по работе идёт в один адрес.</p>
  </div>
  ${kv([
    ['Ведём деятельность', 'с ' + group.founded + ' года'],
    ['Выполнено проектов', String(group.projects)],
    ['Техника', group.fleetClaimed + ' единиц в собственности'],
    ['Материалы', 'свой асфальтобетонный завод и завод ЗБИ'],
    ['Форма работы', 'смена, вахта, подряд под объект'],
  ])}
</section>

${nextGrid([
    ['rent/', 'Аренда техники', 'если нужна только машина'],
    ['catalog/', 'Каталог изделий', 'бордюр и плитка для благоустройства'],
    ['contacts/', 'Обсудить объект', 'выезд и оценка'],
  ], 1, 'Дальше')}`;

  return {
    path: 'works/index.html',
    html: page({
      title: 'Строительно-монтажные работы в Артёме и Приморском крае | Стройспецтехника МОНТЕ',
      desc: 'Земляные, дорожные и монтажные работы, благоустройство территории. Своя техника, свои материалы, работа сменой, вахтой и подрядом.',
      depth: 1, active: 'road',
      crumbs: [{ label: 'Строительные работы' }],
      hero: pageHero({
        label: 'Дороги · Работы', depth: 1,
        h1: 'Объект целиком:|техника, материал,|звено',
        lead: 'Земляные и дорожные работы, благоустройство и монтаж. Берём участок под ключ или отдельным этапом.',
        facts: [[workTypes.length, 'вида работ'], [group.projects, 'проектов'], ['с ' + group.founded, 'на рынке']],
        img: 'img/objects/courtyard.jpg', imgAlt: 'Благоустроенный двор после сдачи',
      }),
      body,
    }),
  };
}

/* ---------------- Работы: вид ---------------- */
export function workType(w) {
  const fleet = (w.fleet || []).map((s) => fleetTypes.find((t) => t.slug === s)).filter(Boolean);
  const body = `
<section class="sec sec--split">
  <div>
    ${secHead('01', 'Состав', 'Что входит|в работу')}
    <ul class="applist applist--wide">${w.scope.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  </div>
  <div class="wphoto" data-rise>
    <img src="${imgPath(w.img, 2)}" alt="${esc(w.imgAlt)}">
    <p>${esc(w.imgAlt)}</p>
  </div>
</section>

<section class="sec">
  ${secHead('02', 'Порядок', 'Как идёт|работа')}
  <div class="steps">
    ${w.stages.map((s, i) => `
    <div class="step" data-rise>
      <span class="step__n">${String(i + 1).padStart(2, '0')}</span>
      <h3>${esc(s.t)}</h3>
      <p>${esc(s.d)}</p>
    </div>`).join('')}
  </div>
</section>

${fleet.length ? `
<section class="sec">
  ${secHead('03', 'Техника', 'Чем это|делается')}
  <div class="tgrid tgrid--3">
    ${fleet.map((t) => {
      const ms = byArts(t.arts);
      const ph = ms.find((m) => m.img);
      return `<a class="tcard" href="../../rent/${t.slug}/" data-rise>
        <span class="tcard__ph">${ph ? `<img src="${imgPath(ph.img, 2)}" alt="${esc(t.h1)}" loading="lazy">` : ''}</span>
        <h3>${esc(t.h1)}</h3>
        <span class="tcard__n">${ms.length} в парке</span>
      </a>`;
    }).join('')}
  </div>
</section>` : ''}

${nextGrid(
    workTypes.filter((o) => o.slug !== w.slug).map((o) => [`works/${o.slug}/`, o.h1, o.lead.split('.')[0] + '.']),
    2, 'Другие работы')}`;

  return {
    path: `works/${w.slug}/index.html`,
    html: page({
      title: w.title,
      desc: w.desc,
      depth: 2, active: 'road',
      crumbs: [{ label: 'Строительные работы', href: 'works/' }, { label: w.h1 }],
      hero: pageHero({
        label: 'Работы · ' + w.h1, depth: 2,
        h1: w.h1,
        lead: w.lead,
        facts: [[w.scope.length, 'видов операций'], [w.stages.length, 'этапа'], ['своя', 'техника и звено']],
        img: w.img.replace(/^\//, ''), imgAlt: w.imgAlt,
      }),
      body,
    }),
  };
}

export function roadPages() {
  return [asphaltPage(), bitumPage(), rentHub(), worksHub()]
    .concat(fleetTypes.map(rentType))
    .concat(workTypes.map(workType));
}
