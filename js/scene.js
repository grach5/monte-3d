/* ============================================================
   WebGL-сцена первого экрана: поле вибропрессованной брусчатки.
   Геометрия — реальная форма камня с фаской, материал — процедурный
   бетон (без фотографий: фото завода в 3D читаются как мусор).
   Камерой управляет скролл, лёгкий параллакс — мышью.
   ============================================================ */
window.MonteScene = (function () {
  'use strict';

  var api = { progress: 0, ready: false, dispose: null };
  var canvas = document.getElementById('gl');
  if (!canvas || !window.THREE) return api;

  // Слабое железо и reduced-motion — сцену не поднимаем.
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gl = null;
  try { gl = canvas.getContext('webgl2') || canvas.getContext('webgl'); } catch (e) { gl = null; }
  if (!gl || reduced) return api;

  var W = window.innerWidth, H = window.innerHeight;
  var mobile = W < 760;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !mobile, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
  renderer.setSize(W, H);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var BG = 0x0b0b0c;
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.FogExp2(BG, 0.082);

  var camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200);

  /* ---------- процедурный бетон ---------- */
  function concreteMaps() {
    var S = 512;
    var c = document.createElement('canvas'); c.width = c.height = S;
    var x = c.getContext('2d');
    x.fillStyle = '#7b7b76'; x.fillRect(0, 0, S, S);

    // крупные пятна замеса
    for (var i = 0; i < 220; i++) {
      var r = 18 + Math.random() * 90;
      var g = x.createRadialGradient(Math.random() * S, Math.random() * S, 0, 0, 0, r);
      g.addColorStop(0, 'rgba(255,255,255,' + (0.03 + Math.random() * 0.05) + ')');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      x.save(); x.translate(Math.random() * S, Math.random() * S);
      x.fillStyle = g; x.beginPath(); x.arc(0, 0, r, 0, 6.3); x.fill(); x.restore();
    }
    // зёрна отсева
    var img = x.getImageData(0, 0, S, S), d = img.data;
    for (var p = 0; p < d.length; p += 4) {
      var n = (Math.random() - 0.5) * 46;
      d[p] += n; d[p + 1] += n; d[p + 2] += n * 0.92;
    }
    x.putImageData(img, 0, 0);
    // редкие тёмные включения
    for (var k = 0; k < 1600; k++) {
      x.fillStyle = 'rgba(40,40,42,' + (0.08 + Math.random() * 0.25) + ')';
      x.beginPath(); x.arc(Math.random() * S, Math.random() * S, 0.5 + Math.random() * 2.2, 0, 6.3); x.fill();
    }

    var map = new THREE.CanvasTexture(c);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.encoding = THREE.sRGBEncoding;
    map.anisotropy = renderer.capabilities.getMaxAnisotropy();

    var bump = new THREE.CanvasTexture(c);
    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
    return { map: map, bump: bump };
  }
  var maps = concreteMaps();

  /* ---------- форма камня: прямоугольник с фаской ---------- */
  function stoneShape(w, h, r) {
    var s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return s;
  }
  var geo = new THREE.ExtrudeGeometry(stoneShape(1, 0.5, 0.045), {
    depth: 0.34, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 2, curveSegments: 3
  });
  geo.rotateX(-Math.PI / 2);          // положить плашмя
  geo.translate(0, -0.17, 0);
  geo.computeVertexNormals();

  var mat = new THREE.MeshStandardMaterial({
    map: maps.map, bumpMap: maps.bump, bumpScale: 0.035,
    color: 0xffffff, roughness: 0.95, metalness: 0.0
  });

  /* ---------- поле ---------- */
  var COLS = mobile ? 20 : 30, ROWS = mobile ? 26 : 40;
  var GX = 1.06, GZ = 0.56;
  var COUNT = COLS * ROWS;
  var mesh = new THREE.InstancedMesh(geo, mat, COUNT);
  mesh.castShadow = !mobile; mesh.receiveShadow = true;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  var base = new Float32Array(COUNT * 3);   // x, z, фаза
  var spin = new Float32Array(COUNT);
  var col = new THREE.Color();
  var dummy = new THREE.Object3D();

  // палитра завода: серый бетон, редкие красные и терракотовые камни
  var TINTS = [0xd7d7d2, 0xc9c9c4, 0xbdbdb8, 0xaeaea9, 0x9b9b97];
  var ACCENTS = [0x8e3325, 0x7a2f24, 0x6b513c];

  var i = 0;
  for (var r0 = 0; r0 < ROWS; r0++) {
    for (var c0 = 0; c0 < COLS; c0++) {
      var off = (r0 % 2) * GX * 0.5;
      var px = (c0 - COLS / 2) * GX + off + (Math.random() - 0.5) * 0.012;
      var pz = (r0 - ROWS / 2) * GZ + (Math.random() - 0.5) * 0.008;
      base[i * 3] = px; base[i * 3 + 1] = pz;
      base[i * 3 + 2] = Math.random() * 6.28;
      spin[i] = (Math.random() - 0.5) * 0.02;

      var accent = Math.random() < 0.035;
      col.setHex(accent ? ACCENTS[(Math.random() * ACCENTS.length) | 0]
                        : TINTS[(Math.random() * TINTS.length) | 0]);
      var j = 0.80 + Math.random() * 0.22;          // разнобой замеса
      col.multiplyScalar(accent ? 1 : j);
      mesh.setColorAt(i, col);
      i++;
    }
  }
  mesh.instanceColor.needsUpdate = true;
  scene.add(mesh);

  // тёмное основание под швами, чтобы не просвечивал фон
  var floor = new THREE.Mesh(
    new THREE.PlaneGeometry(COLS * GX * 1.4, ROWS * GZ * 1.4),
    new THREE.MeshStandardMaterial({ color: 0x0e0e10, roughness: 1 })
  );
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.2; floor.receiveShadow = !mobile;
  scene.add(floor);

  /* ---------- свет ---------- */
  scene.add(new THREE.HemisphereLight(0x4a525e, 0x08080a, 0.30));

  var key = new THREE.DirectionalLight(0xffeedb, 1.75);
  key.position.set(-9, 11, 6);
  if (!mobile) {
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    var s = key.shadow.camera;
    s.left = -16; s.right = 16; s.top = 14; s.bottom = -14; s.near = 1; s.far = 46;
    key.shadow.bias = -0.0012; key.shadow.normalBias = 0.02;
  }
  scene.add(key);

  var rim = new THREE.DirectionalLight(0x6f92e0, 0.34);
  rim.position.set(10, 4, -12);
  scene.add(rim);

  // красный акцент завода — тёплый отблеск у горизонта
  var glow = new THREE.PointLight(0xe1483c, 7, 20, 2);
  glow.position.set(3, 1.1, -7);
  scene.add(glow);

  /* ---------- камера: старт и ход по скроллу ---------- */
  var CAM = [
    { p: [0, 2.05, 8.0],  l: [0, 0.0, -3] },   // низкий взгляд вдоль укладки
    { p: [2.4, 5.6, 5.6], l: [0, 0, -3] },     // подъём
    { p: [0, 13.5, 2.2],  l: [0, 0, -1.5] }    // почти сверху
  ];
  function lerp(a, b, t) { return a + (b - a) * t; }
  function camAt(t) {
    var seg = t < 0.5 ? 0 : 1, k = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
    k = k * k * (3 - 2 * k);
    var A = CAM[seg], B = CAM[seg + 1];
    return {
      p: [lerp(A.p[0], B.p[0], k), lerp(A.p[1], B.p[1], k), lerp(A.p[2], B.p[2], k)],
      l: [lerp(A.l[0], B.l[0], k), lerp(A.l[1], B.l[1], k), lerp(A.l[2], B.l[2], k)]
    };
  }

  var mx = 0, my = 0, tmx = 0, tmy = 0;
  if (!mobile) {
    window.addEventListener('pointermove', function (e) {
      tmx = (e.clientX / window.innerWidth - 0.5);
      tmy = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });
  }

  /* ---------- цикл ---------- */
  var clock = new THREE.Clock();
  var running = true, visible = true, raf = 0;
  var look = new THREE.Vector3();

  function frame() {
    raf = requestAnimationFrame(frame);
    if (!running || !visible) return;
    var t = clock.getElapsedTime();
    var pr = api.progress;

    // волна по укладке: камни чуть всплывают и возвращаются
    var lift = 1 - Math.min(pr * 1.4, 1);
    for (var n = 0; n < COUNT; n++) {
      var bx = base[n * 3], bz = base[n * 3 + 1], ph = base[n * 3 + 2];
      var wave = Math.sin((bx * 0.24 + bz * 0.34) - t * 0.62 + ph * 0.12);
      var y = wave * 0.055 * lift + Math.sin(t * 0.5 + ph) * 0.006;
      // к концу прокрутки часть камней расходится — укладка «разбирается»
      var sp = pr > 0.55 ? (pr - 0.55) / 0.45 : 0;
      dummy.position.set(bx * (1 + sp * 0.06), y + sp * (0.4 + ((n % 7) * 0.12)) * (wave * 0.5 + 0.5),
                         bz * (1 + sp * 0.1));
      dummy.rotation.set(sp * spin[n] * 9, spin[n] * 2 + sp * spin[n] * 14, sp * spin[n] * 7);
      dummy.updateMatrix();
      mesh.setMatrixAt(n, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // свет ходит вдоль укладки — по поверхности идёт блик
    key.position.set(-9 + Math.sin(t * 0.18) * 7, 11, 6 + Math.cos(t * 0.15) * 4);
    glow.intensity = 6 + Math.sin(t * 1.3) * 1.8;

    mx += (tmx - mx) * 0.045; my += (tmy - my) * 0.045;
    var c = camAt(pr);
    camera.position.set(c.p[0] + mx * 1.5, c.p[1] - my * 0.7, c.p[2]);
    look.set(c.l[0] + mx * 0.8, c.l[1], c.l[2]);
    camera.lookAt(look);

    scene.fog.density = 0.082 + pr * 0.022;
    renderer.render(scene, camera);
  }

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    camera.aspect = W / H; camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  }
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () { visible = !document.hidden; });

  api.setRunning = function (v) { running = v; };
  api.ready = true;
  frame();
  return api;
})();
