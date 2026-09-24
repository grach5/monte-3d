/* ============================================================
   Каталог: поиск по названию и маркировке, фильтр по группе,
   сортировка по цене. Всё на клиенте — страниц немного,
   а перезагрузка ради фильтра раздражает сильнее, чем помогает.
   ============================================================ */
(function () {
  'use strict';
  var grid = document.getElementById('catGrid');
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.pcard'));
  var q = document.getElementById('catQ');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var sort = document.getElementById('catSort');
  var count = document.getElementById('catCount');
  var empty = document.getElementById('catEmpty');
  var cat = 'all';

  function norm(s) { return (s || '').toLowerCase().replace(/ё/g, 'е'); }

  function apply() {
    var term = norm(q ? q.value.trim() : '');
    var shown = 0;
    cards.forEach(function (c) {
      var okCat = cat === 'all' || c.dataset.cat === cat;
      var okQ = !term || norm(c.dataset.search).indexOf(term) > -1;
      var on = okCat && okQ;
      c.hidden = !on;
      if (on) shown++;
    });
    if (count) count.textContent = shown;
    if (empty) empty.hidden = shown > 0;

    if (sort && sort.value !== 'default') {
      var dir = sort.value === 'asc' ? 1 : -1;
      cards.slice().sort(function (a, b) {
        return (Number(a.dataset.price) - Number(b.dataset.price)) * dir;
      }).forEach(function (c) { grid.appendChild(c); });
    } else {
      cards.forEach(function (c) { grid.appendChild(c); });
    }
  }

  if (q) q.addEventListener('input', apply);
  if (sort) sort.addEventListener('change', apply);
  chips.forEach(function (ch) {
    ch.addEventListener('click', function () {
      chips.forEach(function (o) { o.classList.remove('is-on'); });
      ch.classList.add('is-on');
      cat = ch.dataset.cat;
      apply();
    });
  });

  // ?cat=plitka из мегаменю и ссылок
  var pre = new URLSearchParams(location.search).get('cat');
  if (pre) {
    var hit = chips.find(function (c) { return c.dataset.cat === pre; });
    if (hit) hit.click();
  } else apply();
})();
