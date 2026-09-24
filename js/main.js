/* ============================================================
   Моушн-слой: плавный скролл, появление, горизонтальный каталог,
   счётчики, лента объектов, курсор, меню, форма.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Библиотека не поднялась — сайт всё равно должен открыться и работать:
  // снимаем заставку, показываем всё скрытое, оставляем обычную прокрутку.
  if (typeof gsap === 'undefined') {
    document.body.className += ' ready degraded';
    if (window.__monteBooted) window.__monteBooted();
    var bg = document.getElementById('burger');
    if (bg) bg.addEventListener('click', function () { document.body.classList.toggle('menu-open'); });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- 1. Прелоадер ---------- */
  var bar = document.getElementById('plBar');
  var num = document.getElementById('plNum');
  var shown = 0, target = 0, done = false;

  // Считаем только картинки первого экрана: lazy-кадры ниже сгиба
  // никогда не догрузятся до скролла и повесили бы прелоадер.
  var imgs = Array.prototype.slice.call(document.images)
    .filter(function (im) { return im.loading !== 'lazy'; });
  var total = imgs.length + 1, loaded = 0;
  function tick() { loaded++; target = Math.max(target, Math.min(loaded / total, 1)); }
  imgs.forEach(function (im) {
    if (im.complete) tick();
    else { im.addEventListener('load', tick); im.addEventListener('error', tick); }
  });
  window.addEventListener('load', function () { tick(); target = 1; });
  // Шрифты и WebGL грузятся отдельно — даём полосе идти и без событий.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(tick);
  var t0 = Date.now();
  var creep = setInterval(function () {
    target = Math.max(target, Math.min((Date.now() - t0) / 1500, 0.92));
    if (target >= 1) clearInterval(creep);
  }, 90);
  setTimeout(function () { target = 1; }, 2400);   // страховка от зависшей картинки
  // Жёсткий предел: заставка не держит человека дольше трёх секунд,
  // даже если rAF придушен вкладкой или картинка не отдалась.
  setTimeout(function () { if (!done) { done = true; start(); } }, 3000);

  (function pl() {
    shown += (target - shown) * 0.16;
    if (bar) bar.style.transform = 'scaleX(' + shown + ')';
    if (num) num.textContent = Math.round(shown * 100);
    if (shown > 0.995 && !done) { done = true; start(); return; }
    requestAnimationFrame(pl);
  })();

  /* ---------- 2. Плавный скролл ---------- */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;   // нужен скриптам съёмки
  }
  function go(sel) {
    var el = document.querySelector(sel);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -10 });
    else el.scrollIntoView({ behavior: 'smooth' });
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var h = a.getAttribute('href');
      if (h.length < 2) return;
      e.preventDefault();
      document.body.classList.remove('menu-open');
      if (lenis) lenis.start();
      go(h);
    });
  });

  /* ---------- 3. Старт после прелоадера ---------- */
  function start() {
    document.body.classList.add('ready');
    if (window.__monteBooted) window.__monteBooted();
    var glc = document.getElementById('gl');
    if (glc) setTimeout(function () { glc.classList.add('on'); }, 120);

    if (!document.querySelector('.hero__h')) {
      // Внутренние страницы: вступительного ролика нет, раскрываем заголовок раздела
      gsap.to('.phero h1 .ln i', { y: '0%', duration: 1.05, ease: 'power3.out', stagger: 0.075, delay: 0.1 });
      gsap.fromTo('.phero__lead, .phero__facts', { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08, delay: 0.25 });
      heroCounts.forEach(function (t) { t.play(0); });
      ScrollTrigger.refresh();
      return;
    }
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero__h .ln i', { y: '0%', duration: 1.15, stagger: 0.085 }, 0.15)
      .to('.hero__eyebrow', { opacity: 1, y: 0, duration: .8 }, 0.25)
      .to('.hero__sub', { opacity: 1, y: 0, duration: .9 }, 0.55)
      .to('.hero__cta', { opacity: 1, y: 0, duration: .9 }, 0.68)
      .to('.hero__meta', { opacity: 1, duration: .9 }, 0.8);

    gsap.set(['.hero__eyebrow', '.hero__sub', '.hero__cta'], { y: 18 });
    heroCounts.forEach(function (t) { t.play(0); });
    ScrollTrigger.refresh();
  }
  gsap.set(['.hero__eyebrow', '.hero__sub', '.hero__cta'], { opacity: 0, y: 18 });

  /* ---------- 4. Шапка и меню ---------- */
  var nav = document.getElementById('nav');
  ScrollTrigger.create({
    start: 'top -60',
    onUpdate: function (s) { nav.classList.toggle('stick', s.scroll() > 60); }
  });
  var burger = document.getElementById('burger');
  if (burger) burger.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open');
    if (lenis) open ? lenis.stop() : lenis.start();
  });

  /* ---------- 5. WebGL: прогресс камеры ---------- */
  if (window.MonteScene && MonteScene.ready) {
    ScrollTrigger.create({
      trigger: '#hero', start: 'top top', endTrigger: '#manifest', end: 'bottom top',
      scrub: true,
      onUpdate: function (s) { MonteScene.progress = s.progress; }
    });
    ScrollTrigger.create({
      trigger: '#manifest', start: 'bottom 12%', end: 'bottom top',
      onEnter: function () { document.getElementById('gl').classList.remove('on'); },
      onLeaveBack: function () { document.getElementById('gl').classList.add('on'); },
      onToggle: function (s) { MonteScene.setRunning && MonteScene.setRunning(s.isActive || s.progress < 1); }
    });
    ScrollTrigger.create({
      trigger: '#catalog', start: 'top bottom',
      onEnter: function () { MonteScene.setRunning && MonteScene.setRunning(false); },
      onLeaveBack: function () { MonteScene.setRunning && MonteScene.setRunning(true); }
    });
  }

  /* ---------- 6. Появление блоков ---------- */
  gsap.utils.toArray('[data-rise]').forEach(function (el) {
    gsap.fromTo(el, { opacity: 0, y: 34 }, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });
  gsap.utils.toArray('.split').forEach(function (h) {
    gsap.to(h.querySelectorAll('.ln i'), {
      y: '0%', duration: 1.05, ease: 'power3.out', stagger: 0.075,
      scrollTrigger: { trigger: h, start: 'top 86%' }
    });
  });
  gsap.utils.toArray('.secnum').forEach(function (el) {
    gsap.fromTo(el, { opacity: 0, x: -14 }, {
      opacity: 1, x: 0, duration: .8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%' }
    });
  });

  /* ---------- 7. Манифест: слова зажигаются по скроллу ---------- */
  var words = gsap.utils.toArray('.manifest__t .w');
  if (words.length) {
    ScrollTrigger.create({
      trigger: '.manifest__t', start: 'top 78%', end: 'bottom 55%', scrub: true,
      onUpdate: function (s) {
        var n = Math.round(s.progress * words.length);
        words.forEach(function (w, i) { w.classList.toggle('lit', i < n); });
      }
    });
  }

  /* ---------- 8. Счётчики ---------- */
  var heroCounts = [];
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var to = parseFloat(el.dataset.count);
    var dec = (el.dataset.count.indexOf('.') > -1) ? 1 : 0;
    var o = { v: 0 };
    // Цифры первого экрана крутятся сразу: скроллить до них не нужно.
    var inHero = !!el.closest('.hero');
    var tw = gsap.to(o, {
      v: to, duration: 1.6, ease: 'power2.out',
      paused: inHero, delay: inHero ? 0.9 : 0,
      scrollTrigger: inHero ? null : { trigger: el, start: 'top 92%' },
      onUpdate: function () {
        el.textContent = dec ? o.v.toFixed(1).replace('.', ',')
                             : Math.round(o.v).toLocaleString('ru-RU');
      }
    });
    if (inHero) heroCounts.push(tw);
  });

  /* ---------- 9. Каталог: горизонтальный ход ---------- */
  var track = document.getElementById('catTrack');
  var catBar = document.getElementById('catBar');
  if (track && window.innerWidth > 700) {
    ScrollTrigger.create({
      trigger: '#catalog', start: 'top top', pin: '.cat__pin', scrub: 0.6,
      end: function () { return '+=' + (track.scrollWidth - window.innerWidth + 200); },
      invalidateOnRefresh: true,
      onUpdate: function (s) {
        // --pad читается как строка clamp(): берём уже посчитанный отступ трека.
        var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        var d = track.scrollWidth - window.innerWidth + pad;
        if (d > 0) gsap.set(track, { x: -d * s.progress });
        if (catBar) catBar.style.width = (12 + s.progress * 88) + '%';
      }
    });
  } else if (track) {
    track.style.overflowX = 'auto';
    track.style.scrollSnapType = 'x proximity';
    document.querySelector('.cat__pin').style.height = 'auto';
    document.querySelector('.cat__pin').style.padding = '96px 0 56px';
  }

  /* ---------- 10. Параллакс фона «Дороги» ---------- */
  gsap.utils.toArray('.road__bg').forEach(function (el) {
    gsap.fromTo(el, { yPercent: -8 }, {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '.road', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- 11. Лента объектов ---------- */
  var row = document.querySelector('.marq__row');
  if (row && !reduced) {
    row.innerHTML += row.innerHTML;
    var half = row.scrollWidth / 2;
    var mq = gsap.to(row, { x: -half, duration: 42, ease: 'none', repeat: -1 });
    ScrollTrigger.create({
      trigger: '.works', start: 'top bottom', end: 'bottom top',
      onUpdate: function (s) { mq.timeScale(1 + Math.abs(s.getVelocity() / 2400)); },
      onLeave: function () { mq.pause(); }, onEnterBack: function () { mq.play(); },
      onLeaveBack: function () { mq.pause(); }, onEnter: function () { mq.play(); }
    });
  }

  /* ---------- 11b. Наклон карточек каталога ---------- */
  if (matchMedia('(hover:hover)').matches && !reduced) {
    document.querySelectorAll('.cc').forEach(function (card) {
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, { rotationY: px * 6, rotationX: -py * 6, duration: .5,
                        ease: 'power2.out', transformPerspective: 900 });
      });
      card.addEventListener('pointerleave', function () {
        gsap.to(card, { rotationY: 0, rotationX: 0, duration: .7, ease: 'power3.out' });
      });
    });
  }

  /* ---------- 12. Курсор ---------- */
  var cur = document.getElementById('cursor');
  if (cur && matchMedia('(hover:hover)').matches) {
    var cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY; cur.classList.add('live');
    }, { passive: true });
    (function loop() { cx += (tx - cx) * .18; cy += (ty - cy) * .18;
      cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop); })();
    document.querySelectorAll('a,button,.cc,.prow,.prow2').forEach(function (el) {
      el.addEventListener('pointerenter', function () { cur.classList.add('hot'); });
      el.addEventListener('pointerleave', function () { cur.classList.remove('hot'); });
    });
  }

  /* ---------- 13. Форма ---------- */
  var form = document.getElementById('form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var note = document.getElementById('formNote');
    var f = new FormData(form);
    if (!String(f.get('name') || '').trim() || !String(f.get('phone') || '').trim()) {
      note.textContent = 'Заполните имя и телефон — без них перезвонить не получится.';
      note.classList.remove('ok'); return;
    }
    var body = 'Имя: ' + f.get('name') + '\nТелефон: ' + f.get('phone') + '\nЗадача: ' + (f.get('msg') || '—');
    window.location.href = 'mailto:monte@sstmonte.ru?subject=' +
      encodeURIComponent('Заявка с сайта МОНТЕ') + '&body=' + encodeURIComponent(body);
    note.textContent = 'Открыли почтовую программу с готовым письмом. Не сработало — звоните +7 984 191-50-64.';
    note.classList.add('ok');
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
