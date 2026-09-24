/* ============================================================
   Карточка изделия: 3D-модель габаритов, калькулятор объёма
   и стоимости, галерея, добавление в спецификацию.
   Данные позиции приходят в window.PRODUCT из сборки.
   ============================================================ */
(function () {
  'use strict';
  var P = window.PRODUCT;
  if (!P) return;

  /* ---------- 1. Модель ---------- */
  (function viewer() {
    var host = document.getElementById('pmodel');
    if (!host || !window.THREE || !window.MonteModel) return;
    var gl;
    try { gl = document.createElement('canvas').getContext('webgl'); } catch (e) { gl = null; }
    if (!gl) { host.classList.add('is-off'); return; }

    var W = host.clientWidth, H = host.clientHeight;
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(27, W / H, 0.01, 60);

    var model = MonteModel.build(P);
    if (!model) { host.classList.add('is-off'); return; }
    var s = model.userData.size;
    var R = Math.max(s.X, s.Y, s.Z);

    var pivot = new THREE.Group();
    pivot.add(model);
    scene.add(pivot);

    var dim = MonteModel.dims(s);
    pivot.add(dim);

    // площадка под изделием — мягкая тень, а не плоскость
    var shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(R * 4, R * 4),
      new THREE.ShadowMaterial({ opacity: 0.4 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -s.Y / 2 - 0.001;
    shadow.receiveShadow = true;
    pivot.add(shadow);

    scene.add(new THREE.HemisphereLight(0x8fa0b8, 0x101012, 0.7));
    var key = new THREE.DirectionalLight(0xfff2e2, 2.1);
    key.position.set(R * 2.2, R * 3, R * 2.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    var sc = key.shadow.camera;
    sc.left = -R * 2; sc.right = R * 2; sc.top = R * 2; sc.bottom = -R * 2; sc.near = 0.01; sc.far = R * 9;
    key.shadow.bias = -0.0009; key.shadow.normalBias = 0.004;
    scene.add(key);
    var fill = new THREE.DirectionalLight(0x6f92e0, 0.5);
    fill.position.set(-R * 2, R, -R * 2);
    scene.add(fill);

    camera.position.set(R * 1.95, R * 1.35, R * 2.25);
    camera.lookAt(0, 0, 0);

    // подписи размеров: проецируем точки размерных линий в HTML
    var labels = {};
    ['x', 'y', 'z'].forEach(function (k) {
      var el = document.createElement('span');
      el.className = 'pm__lab';
      el.textContent = P.dimLabels && P.dimLabels[k] ? P.dimLabels[k] : '';
      if (!el.textContent) return;
      host.appendChild(el);
      labels[k] = el;
    });

    var drag = false, px = 0, ry = 0.5, rx = -0.16, vry = 0.0022, auto = true;
    host.addEventListener('pointerdown', function (e) {
      drag = true; auto = false; px = e.clientX; host.setPointerCapture(e.pointerId);
      host.classList.add('is-drag');
    });
    host.addEventListener('pointermove', function (e) {
      if (!drag) return;
      ry += (e.clientX - px) * 0.008; px = e.clientX;
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) {
      host.addEventListener(t, function () { drag = false; host.classList.remove('is-drag'); });
    });

    var v3 = new THREE.Vector3();
    function frame() {
      requestAnimationFrame(frame);
      if (auto) ry += vry;
      pivot.rotation.y = ry;
      pivot.rotation.x = rx;
      renderer.render(scene, camera);
      var pts = dim.userData.pts;
      for (var k in labels) {
        v3.copy(pts[k]).applyMatrix4(pivot.matrixWorld).project(camera);
        labels[k].style.left = ((v3.x * 0.5 + 0.5) * W) + 'px';
        labels[k].style.top = ((-v3.y * 0.5 + 0.5) * H) + 'px';
      }
    }
    frame();

    addEventListener('resize', function () {
      W = host.clientWidth; H = host.clientHeight;
      camera.aspect = W / H; camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });

    var reset = document.getElementById('pmReset');
    if (reset) reset.addEventListener('click', function () { auto = true; });
  })();

  /* ---------- 2. Галерея ---------- */
  (function gallery() {
    var main = document.getElementById('galMain');
    if (!main) return;
    document.querySelectorAll('.gal__t').forEach(function (t) {
      t.addEventListener('click', function () {
        document.querySelectorAll('.gal__t').forEach(function (o) { o.classList.remove('is-on'); });
        t.classList.add('is-on');
        var img = main.querySelector('img');
        img.style.opacity = 0;
        setTimeout(function () {
          img.src = t.dataset.src; img.alt = t.dataset.alt || ''; img.style.opacity = 1;
        }, 180);
      });
    });
  })();

  /* ---------- 3. Калькулятор ---------- */
  (function calc() {
    var form = document.getElementById('calc');
    if (!form) return;
    var input = document.getElementById('calcQty');
    var sel = document.getElementById('calcVar');
    var out = {
      units: document.getElementById('outUnits'),
      pallets: document.getElementById('outPallets'),
      mass: document.getElementById('outMass'),
      sum: document.getElementById('outSum'),
    };
    var hint = document.getElementById('calcHint');

    var num = function (v) { return Number(String(v).replace(',', '.')) || 0; };
    var ru = function (v, d) {
      return v.toLocaleString('ru-RU', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
    };

    // штук на единицу ввода
    function perInput() {
      var d = P.dims || {};
      switch (P.calcType) {
        case 'area':
        case 'set':
          if (P.areaPerUnit) return 1 / P.areaPerUnit;
          if (P.palletArea && P.perPallet) return P.perPallet / P.palletArea;
          return 0;
        case 'linear':
          return 1 / (P.lengthM || (d.l ? d.l / 1000 : 1));
        case 'wall':
        case 'facade':
          return 1 / ((d.l / 1000) * (d.h / 1000));
        case 'stack':
          return 1 / (d.l / 1000);
        default:
          return 1;
      }
    }

    function run() {
      var q = num(input.value);
      var per = perInput();
      var units = Math.ceil(q * per);
      if (!isFinite(units) || units < 0) units = 0;

      var pallets = P.perPallet ? Math.ceil(units / P.perPallet) : null;
      var mass = P.weight ? units * P.weight : null;

      var price = sel ? num(sel.value) : (P.price || 0);
      // цена задана за ту же единицу, в которой считает позиция
      var sum = (P.unit === 'м²') ? q * price : units * price;

      out.units.textContent = units ? ru(units) + ' шт' : '—';
      out.pallets.textContent = pallets ? ru(pallets) : '—';
      out.mass.textContent = mass ? (mass >= 1000 ? ru(mass / 1000, 2) + ' т' : ru(mass) + ' кг') : '—';
      out.sum.textContent = sum ? ru(Math.round(sum)) + ' ₽' : '—';

      if (hint) {
        var parts = [];
        if (P.unit === 'м²' && P.areaPerUnit) parts.push('на 1 м² — ' + ru(Math.round(1 / P.areaPerUnit)) + ' шт');
        if (P.calcType === 'wall' || P.calcType === 'facade') parts.push('на 1 м² кладки — ' + ru(Math.round(per), 0) + ' шт');
        if (pallets && P.palletWeight) parts.push('поддон ' + ru(P.palletWeight) + ' кг');
        hint.textContent = parts.join(' · ');
      }
      form.dataset.units = units;
      form.dataset.sum = Math.round(sum);
    }

    input.addEventListener('input', run);
    if (sel) sel.addEventListener('change', run);
    form.addEventListener('submit', function (e) { e.preventDefault(); run(); });
    run();

    var add = document.getElementById('calcAdd');
    if (add) add.addEventListener('click', function () {
      var units = Number(form.dataset.units || 0);
      if (!units) { input.focus(); return; }
      window.MonteSpec.add({
        slug: P.slug, name: P.name, marking: P.marking,
        variant: sel ? sel.options[sel.selectedIndex].dataset.label : (P.grade || ''),
        qty: num(input.value), unit: P.unit, units: units,
        sum: Number(form.dataset.sum || 0), href: P.href,
      });
      add.classList.add('is-done');
      add.querySelector('span').textContent = 'Добавлено в спецификацию';
      setTimeout(function () {
        add.classList.remove('is-done');
        add.querySelector('span').textContent = 'В спецификацию';
      }, 2200);
    });
  })();
})();
