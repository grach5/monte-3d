/* Вкладки прайса: три прайс-листа на одной странице без перезагрузки. */
(function () {
  'use strict';
  var tabs = document.querySelectorAll('.tab');
  if (!tabs.length) return;
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (o) { o.classList.remove('is-on'); });
      t.classList.add('is-on');
      document.querySelectorAll('.tpane').forEach(function (p) {
        var on = p.id === 'pane-' + t.dataset.t;
        p.hidden = !on;
        p.classList.toggle('is-on', on);
      });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });
})();
