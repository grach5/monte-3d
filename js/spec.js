/* ============================================================
   Спецификация: позиции, отобранные в калькуляторах, живут
   в localStorage браузера. Сервера нет — это черновик заявки,
   который посетитель отправляет письмом или диктует по телефону.
   ============================================================ */
window.MonteSpec = (function () {
  'use strict';
  var KEY = 'monte3d-spec-v1';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* приватный режим */ }
    paint();
    document.dispatchEvent(new CustomEvent('monte-spec'));
  }
  function add(item) {
    var list = read();
    var i = list.findIndex(function (r) { return r.slug === item.slug && r.variant === item.variant; });
    if (i > -1) list[i] = item; else list.push(item);
    write(list);
  }
  function remove(i) { var l = read(); l.splice(i, 1); write(l); }
  function clear() { write([]); }

  function paint() {
    var n = read().length;
    var link = document.getElementById('specLink');
    var cnt = document.getElementById('specCount');
    if (cnt) cnt.textContent = n;
    if (link) link.hidden = n === 0;
  }

  var ru = function (v, d) {
    return Number(v || 0).toLocaleString('ru-RU', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  };

  function renderPage() {
    var host = document.getElementById('specList');
    if (!host) return;
    var list = read();
    var empty = document.getElementById('specEmpty');
    var box = document.getElementById('specBox');
    if (!list.length) {
      if (empty) empty.hidden = false;
      if (box) box.hidden = true;
      return;
    }
    if (empty) empty.hidden = true;
    if (box) box.hidden = false;

    host.innerHTML = list.map(function (r, i) {
      return '<div class="srow">' +
        '<div class="srow__n"><a href="../' + r.href + '">' + r.name + '</a>' +
        (r.variant ? '<i>' + r.variant + '</i>' : '') + '</div>' +
        '<div class="srow__q">' + ru(r.qty, r.unit === 'м²' ? 1 : 0) + ' ' + r.unit + '</div>' +
        '<div class="srow__u">' + ru(r.units) + ' шт</div>' +
        '<div class="srow__s">' + ru(r.sum) + ' ₽</div>' +
        '<button class="srow__x" data-i="' + i + '" aria-label="Убрать позицию">×</button>' +
        '</div>';
    }).join('');

    var total = list.reduce(function (s, r) { return s + (r.sum || 0); }, 0);
    var t = document.getElementById('specTotal');
    if (t) t.textContent = ru(total) + ' ₽';

    host.querySelectorAll('.srow__x').forEach(function (b) {
      b.addEventListener('click', function () { remove(Number(b.dataset.i)); renderPage(); });
    });
  }

  function letter() {
    var list = read();
    if (!list.length) return '';
    var lines = list.map(function (r) {
      return '· ' + r.name + (r.variant ? ' (' + r.variant + ')' : '') +
        ' — ' + ru(r.qty, r.unit === 'м²' ? 1 : 0) + ' ' + r.unit +
        ', ' + ru(r.units) + ' шт, ' + ru(r.sum) + ' ₽';
    });
    var total = list.reduce(function (s, r) { return s + (r.sum || 0); }, 0);
    return lines.join('\n') + '\n\nИтого по прайсу: ' + ru(total) + ' ₽ (с НДС 22%, самовывоз).';
  }

  document.addEventListener('DOMContentLoaded', function () {
    paint(); renderPage();
    var clr = document.getElementById('specClear');
    if (clr) clr.addEventListener('click', function () { clear(); renderPage(); });
    var snd = document.getElementById('specSend');
    if (snd) snd.addEventListener('click', function () {
      var body = 'Прошу выставить счёт по спецификации:\n\n' + letter();
      location.href = 'mailto:monte@sstmonte.ru?subject=' +
        encodeURIComponent('Спецификация с сайта МОНТЕ') + '&body=' + encodeURIComponent(body);
    });
    var cp = document.getElementById('specCopy');
    if (cp) cp.addEventListener('click', function () {
      navigator.clipboard && navigator.clipboard.writeText(letter()).then(function () {
        cp.querySelector('span').textContent = 'Скопировано';
        setTimeout(function () { cp.querySelector('span').textContent = 'Скопировать списком'; }, 2000);
      });
    });
  });

  return { add: add, remove: remove, clear: clear, read: read, letter: letter };
})();
