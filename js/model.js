/* ============================================================
   Параметрическая 3D-модель изделия по габаритам из прайса.
   Сплошные изделия — призма с фаской, пустотелые — набор стенок
   и перемычек: так видно и сечение, и число пустот.
   Используется и на карточке (вращение мышью), и в рендере
   каталожных картинок (render-models.mjs).
   ============================================================ */
window.MonteModel = (function () {
  'use strict';

  // Ориентация: X — длина, Y — высота, Z — ширина.
  // В данных завода порядок осей у бордюра и плитки разный,
  // поэтому раскладываем по смыслу изделия, а не по имени поля.
  function axes(p) {
    var d = p.dims || {};
    var a = [d.l, d.w, d.h].filter(function (v) { return typeof v === 'number'; });
    if (a.length < 3) return null;
    var l = d.l, w = d.w, h = d.h;
    if (p.cat === 'bordyur') {
      // БР 100.30.15 — длина.высота.ширина: камень стоит на ребре
      return { x: l, y: Math.max(w, h), z: Math.min(w, h) };
    }
    if (p.cat === 'plitka' || p.cat === 'kirpich') {
      var thin = Math.min(l, w, h);
      var rest = [l, w, h].filter(function (v, i, arr) { return true; });
      // толщина — самый малый габарит, остальные два в плане
      var big = [l, w, h].slice().sort(function (a2, b2) { return b2 - a2; });
      return { x: big[0], y: thin, z: big[1] };
    }
    return { x: l, y: h, z: w };
  }

  // Число пустот по позиции. Источник — опись фото заказчика
  // и назначение изделия; сплошным ставится 0.
  function voids(p) {
    var s = p.slug || '';
    if (p.cat === 'bloki') {
      if (s.indexOf('peregorodochnyy') > -1) return { n: 2, wall: 30 };
      if (s.indexOf('m100') > -1) return { n: 3, wall: 34 };
      return { n: 4, wall: 30 };
    }
    if (p.cat === 'ventblok') {
      if (s === 'ventblok-vb-3') return { n: 3, wall: 40 };
      return { n: 1, wall: 45 };
    }
    return { n: 0, wall: 0 };
  }

  function beveledBox(X, Y, Z, bev) {
    var s = new THREE.Shape();
    var hx = X / 2, hz = Z / 2, r = Math.min(bev, hx * 0.6, hz * 0.6);
    s.moveTo(-hx + r, -hz);
    s.lineTo(hx - r, -hz); s.quadraticCurveTo(hx, -hz, hx, -hz + r);
    s.lineTo(hx, hz - r); s.quadraticCurveTo(hx, hz, hx - r, hz);
    s.lineTo(-hx + r, hz); s.quadraticCurveTo(-hx, hz, -hx, hz - r);
    s.lineTo(-hx, -hz + r); s.quadraticCurveTo(-hx, -hz, -hx + r, -hz);
    var bv = Math.min(Y * 0.12, X * 0.03, 0.02);
    var g = new THREE.ExtrudeGeometry(s, {
      depth: Math.max(Y - bv * 2, Y * 0.5), bevelEnabled: true,
      bevelThickness: bv, bevelSize: bv, bevelSegments: 2, curveSegments: 4
    });
    g.rotateX(-Math.PI / 2);
    g.computeBoundingBox();
    var bb = g.boundingBox;
    g.translate(0, -(bb.min.y + bb.max.y) / 2, 0);
    return g;
  }

  // Процедурный бетон: то же зерно, что в сцене первого экрана
  var _tex = null;
  function concrete() {
    if (_tex) return _tex;
    var S = 512, c = document.createElement('canvas');
    c.width = c.height = S;
    var x = c.getContext('2d');
    x.fillStyle = '#8d8d88'; x.fillRect(0, 0, S, S);
    for (var i = 0; i < 160; i++) {
      var r = 20 + Math.random() * 80;
      var g = x.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, 'rgba(255,255,255,' + (0.03 + Math.random() * 0.05) + ')');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      x.save(); x.translate(Math.random() * S, Math.random() * S);
      x.fillStyle = g; x.beginPath(); x.arc(0, 0, r, 0, 6.3); x.fill(); x.restore();
    }
    var im = x.getImageData(0, 0, S, S), d = im.data;
    for (var p = 0; p < d.length; p += 4) {
      var n = (Math.random() - 0.5) * 42;
      d[p] += n; d[p + 1] += n; d[p + 2] += n * 0.94;
    }
    x.putImageData(im, 0, 0);
    for (var k = 0; k < 1400; k++) {
      x.fillStyle = 'rgba(44,44,46,' + (0.08 + Math.random() * 0.22) + ')';
      x.beginPath(); x.arc(Math.random() * S, Math.random() * S, 0.5 + Math.random() * 2, 0, 6.3); x.fill();
    }
    _tex = new THREE.CanvasTexture(c);
    _tex.wrapS = _tex.wrapT = THREE.RepeatWrapping;
    _tex.encoding = THREE.sRGBEncoding;
    // Мипмапы, собранные из canvas, в части драйверов уходят почти в чёрное:
    // текстура бетона превращается в угольную. Обходим — фильтруем без мипов.
    _tex.generateMipmaps = false;
    _tex.minFilter = THREE.LinearFilter;
    _tex.repeat.set(2, 2);
    return _tex;
  }

  // Изделие в метрах: группа мешей + габариты
  function build(p, color) {
    var ax = axes(p);
    if (!ax) return null;
    var X = ax.x / 1000, Y = ax.y / 1000, Z = ax.z / 1000;
    var v = voids(p);
    var mat = new THREE.MeshStandardMaterial({
      map: concrete(), color: color || 0xcfcfc9, roughness: 0.94, metalness: 0,
      bumpMap: concrete(), bumpScale: 0.0016
    });
    var grp = new THREE.Group();

    if (!v.n) {
      var m = new THREE.Mesh(beveledBox(X, Y, Z, Math.min(X, Z) * 0.04), mat);
      m.castShadow = m.receiveShadow = true;
      grp.add(m);
    } else {
      // корпус из стенок: две продольные, две торцевые, перемычки
      var t = v.wall / 1000;
      var add = function (sx, sy, sz, px, py, pz) {
        var g = new THREE.BoxGeometry(sx, sy, sz);
        var mm = new THREE.Mesh(g, mat);
        mm.position.set(px, py, pz);
        mm.castShadow = mm.receiveShadow = true;
        grp.add(mm);
      };
      add(X, Y, t, 0, 0, (Z - t) / 2);
      add(X, Y, t, 0, 0, -(Z - t) / 2);
      add(t, Y, Z - t * 2, (X - t) / 2, 0, 0);
      add(t, Y, Z - t * 2, -(X - t) / 2, 0, 0);
      var inner = X - t * 2;
      var cell = (inner - t * (v.n - 1)) / v.n;
      for (var i = 1; i < v.n; i++) {
        var px2 = -inner / 2 + i * cell + (i - 0.5) * t;
        add(t, Y, Z - t * 2, px2, 0, 0);
      }
    }
    grp.userData.size = { X: X, Y: Y, Z: Z };
    return grp;
  }

  // Размерные линии по трём осям + точки для подписей
  function dims(size, accent) {
    var X = size.X, Y = size.Y, Z = size.Z;
    var g = new THREE.Group();
    var mat = new THREE.LineBasicMaterial({ color: accent || 0xe1483c, transparent: true, opacity: 0.85 });
    var off = Math.max(X, Y, Z) * 0.2;
    var pts = {};
    function line(a, b) {
      var geo = new THREE.BufferGeometry().setFromPoints([a, b]);
      g.add(new THREE.Line(geo, mat));
    }
    function tick(p, dir) {
      var d = dir.clone().multiplyScalar(off * 0.22);
      line(p.clone().sub(d), p.clone().add(d));
    }
    var V = THREE.Vector3;
    // длина (X) — внизу спереди
    var y0 = -Y / 2 - off * 0.5, z0 = Z / 2 + off * 0.5;
    line(new V(-X / 2, y0, z0), new V(X / 2, y0, z0));
    tick(new V(-X / 2, y0, z0), new V(0, 1, 0)); tick(new V(X / 2, y0, z0), new V(0, 1, 0));
    pts.x = new V(0, y0, z0);
    // высота (Y) — справа
    var x1 = X / 2 + off * 0.5;
    line(new V(x1, -Y / 2, z0), new V(x1, Y / 2, z0));
    tick(new V(x1, -Y / 2, z0), new V(1, 0, 0)); tick(new V(x1, Y / 2, z0), new V(1, 0, 0));
    pts.y = new V(x1, 0, z0);
    // ширина (Z) — внизу слева, чтобы не столкнуться с высотой
    var x2 = -X / 2 - off * 0.5;
    line(new V(x2, y0, -Z / 2), new V(x2, y0, Z / 2));
    tick(new V(x2, y0, -Z / 2), new V(0, 1, 0)); tick(new V(x2, y0, Z / 2), new V(0, 1, 0));
    pts.z = new V(x2 - off * 0.25, y0, 0);
    g.userData.pts = pts;
    return g;
  }

  return { build: build, dims: dims, axes: axes, voids: voids, concrete: concrete };
})();
