/* ============================================================
   Первый экран не ждёт библиотеку. three.js (около 150 КБ в сжатом
   виде) и сцена подгружаются уже после того, как страница показана,
   поэтому на медленном канале человек видит сайт сразу, а поле
   брусчатки появляется следом.
   ============================================================ */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var base = document.currentScript.src.replace(/js\/hero-boot\.js.*$/, '');

  function add(src, done) {
    var s = document.createElement('script');
    s.src = base + src;
    s.onload = done;
    s.onerror = function () { /* нет сцены — первый экран просто останется тёмным */ };
    document.body.appendChild(s);
  }

  function go() {
    add('js/vendor/three.min.js', function () {
      add('js/scene.js', function () {
        if (window.MonteHeroReady) window.MonteHeroReady();
      });
    });
  }

  if (document.readyState === 'complete') setTimeout(go, 120);
  else window.addEventListener('load', function () { setTimeout(go, 120); });
})();
