(function () {
  const ACCENT = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#6A95FF';
  const TG_TOKEN = '8774976715:AAEtWE1zn4JZA0NkeexDTegKI68LKMAMgl8';
  const TG_CHAT = '7984259038';
  const TG_USER = 'locurice';

  /* reveal on scroll */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.setAttribute('data-reveal', 'in'); io.unobserve(e.target); } }), { threshold: 0.15 });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

  /* counters */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, target = +el.dataset.count, t0 = performance.now();
    const tick = n => { const p = Math.min(1, (n - t0) / 1400); el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

  /* manifest words */
  const mt = document.getElementById('manifest-text');
  mt.innerHTML = mt.textContent.trim().split(' ').map(w => `<span data-word>${w}</span> `).join('');
  const words = mt.querySelectorAll('[data-word]'), manifest = document.getElementById('manifest');

  /* nav + manifest on scroll */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('on', window.scrollY > 40);
    const r = manifest.getBoundingClientRect(), vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height * 0.9)));
    words.forEach((w, i) => w.classList.toggle('lit', i / words.length < p));
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* FAQ */
  document.querySelectorAll('.faq-q').forEach(btn => btn.addEventListener('click', () => {
    const item = btn.parentElement, open = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!open) item.classList.add('open');
  }));

  /* experience chips */
  const exp = document.getElementById('exp');
  exp.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; exp.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); });

  /* form → Telegram */
  const form = document.getElementById('form'), err = document.getElementById('err'), submit = document.getElementById('submit');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = form.name.value.trim(), tg = form.tg.value.trim(), page = form.page.value.trim();
    if (!name || !tg) { err.textContent = 'Заполни имя и Telegram — без них не сможем ответить.'; return; }
    if (!document.getElementById('c-age').checked || !document.getElementById('c-pd').checked) { err.textContent = 'Подтверди возраст и согласие на обработку данных.'; return; }
    const expVal = exp.querySelector('.on').textContent;
    const msg = `🌩 Новая заявка — Storm Agency\n\nИмя: ${name}\nTelegram: ${tg}\nОпыт: ${expVal}\nСсылка: ${page || '—'}`;
    err.textContent = ''; submit.disabled = true; submit.textContent = 'отправляем…';
    try {
      const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: TG_CHAT, text: msg }) });
      if (!res.ok) throw new Error(res.status);
      form.classList.add('done');
    } catch (_) {
      err.textContent = 'Не удалось отправить. Напиши напрямую: @' + TG_USER;
      window.open('https://t.me/' + TG_USER + '?text=' + encodeURIComponent(msg), '_blank');
    } finally { submit.disabled = false; submit.textContent = 'отправить заявку →'; }
  });

  /* 3D glass heart */
  const cv = document.getElementById('heart');
  if (window.THREE && cv) {
    const T = THREE;
    const renderer = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(32, 1, 0.1, 100); cam.position.set(0, 0, 11);
    const face = (a, b, c) => { const k = document.createElement('canvas'); k.width = k.height = 64; const g = k.getContext('2d'); const gr = g.createLinearGradient(0, 0, 64, 64); gr.addColorStop(0, a); gr.addColorStop(.5, b); gr.addColorStop(1, c); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return k; };
    const env = new T.CubeTexture([face('#fff', '#202024', '#000'), face('#0a0a0b', '#2a2a30', '#fff'), face('#fff', '#fff', '#303036'), face('#000', '#101014', '#000'), face('#fff', '#1a1a1e', ACCENT), face(ACCENT, '#141418', '#fff')]);
    env.needsUpdate = true; env.encoding = T.sRGBEncoding; scene.environment = env;
    const s = new T.Shape();
    s.moveTo(0, 1.2); s.bezierCurveTo(0, 1.2, -0.1, 2.0, -1.0, 2.0); s.bezierCurveTo(-2.4, 2.0, -2.4, 0.3, -2.4, 0.3);
    s.bezierCurveTo(-2.4, -0.7, -1.4, -1.9, 0, -2.8); s.bezierCurveTo(1.4, -1.9, 2.4, -0.7, 2.4, 0.3);
    s.bezierCurveTo(2.4, 0.3, 2.4, 2.0, 1.0, 2.0); s.bezierCurveTo(0.1, 2.0, 0, 1.2, 0, 1.2);
    const geo = new T.ExtrudeGeometry(s, { depth: 1.1, bevelEnabled: true, bevelThickness: 0.55, bevelSize: 0.5, bevelSegments: 14, curveSegments: 40 }); geo.center();
    const col = new T.Color(ACCENT);
    const mat = new T.MeshPhysicalMaterial({ color: col, metalness: 0, roughness: 0.08, transmission: 0.95, ior: 1.45, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.6, transparent: true, opacity: 0.86, side: T.DoubleSide });
    const heart = new T.Mesh(geo, mat); scene.add(heart);
    const key = new T.DirectionalLight(0xffffff, 1.4); key.position.set(4, 6, 6); scene.add(key);
    const rim = new T.DirectionalLight(col, 2.2); rim.position.set(-6, -2, -4); scene.add(rim);
    scene.add(new T.AmbientLight(0xffffff, 0.35));
    let lw = 0, lh = 0;
    const resize = () => { const w = cv.clientWidth || 1, h = cv.clientHeight || 1; lw = w; lh = h; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); const visH = 2 * 11 * Math.tan(T.MathUtils.degToRad(16)); heart.scale.setScalar(Math.min(visH * 0.78 / 5.6, visH * cam.aspect * 0.6 / 5.6)); };
    resize(); window.addEventListener('resize', resize);
    let mx = 0, my = 0;
    window.addEventListener('mousemove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
    const t0 = performance.now();
    (function loop() {
      requestAnimationFrame(loop);
      if (cv.clientWidth !== lw || cv.clientHeight !== lh) resize();
      const t = (performance.now() - t0) / 1000;
      heart.rotation.y = t * 0.7 + mx * 0.6; heart.rotation.x = Math.sin(t * 0.6) * 0.12 + my * 0.3; heart.position.y = Math.sin(t * 1.1) * 0.18;
      renderer.render(scene, cam);
    })();
  }
})();
