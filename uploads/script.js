/* ============================================================
   STORM AGENCY — script.js
   Анимации появления, навигация, магнитные кнопки, форма.
   ============================================================ */

(function () {
  'use strict';

  var TELEGRAM_USERNAME = 'ВАШ_TELEGRAM'; // ← замени на свой ник без @

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Навигация: фон при скролле ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Появление секций при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Hero: вращающийся 3D-объект (Three.js) ---------- */
  (function initHero3D() {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas || !window.THREE) return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (err) {
      canvas.style.display = 'none'; // нет WebGL — остаётся типографика
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 7;

    // Ураган из сердечек: воронка-спираль, закрученная вокруг центра
    var heartShape = new THREE.Shape();
    heartShape.moveTo(2.5, 2.5);
    heartShape.bezierCurveTo(2.5, 2.5, 2.0, 0, 0, 0);
    heartShape.bezierCurveTo(-3.0, 0, -3.0, 3.5, -3.0, 3.5);
    heartShape.bezierCurveTo(-3.0, 5.5, -1.5, 7.7, 2.5, 9.5);
    heartShape.bezierCurveTo(6.0, 7.7, 8.0, 5.5, 8.0, 3.5);
    heartShape.bezierCurveTo(8.0, 3.5, 8.0, 0, 5.0, 0);
    heartShape.bezierCurveTo(3.5, 0, 2.5, 2.5, 2.5, 2.5);

    var heartGeo = new THREE.ExtrudeGeometry(heartShape, {
      depth: 1.6, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.4, bevelSegments: 3, curveSegments: 10
    });
    heartGeo.center();

    var pinkMat = new THREE.MeshStandardMaterial({ color: 0xFF5CA8, metalness: 0.55, roughness: 0.3, emissive: 0x3A0F24 });
    var violetMat = new THREE.MeshStandardMaterial({ color: 0x9D6BFF, metalness: 0.55, roughness: 0.3, emissive: 0x1E1040 });

    var hurricane = new THREE.Group();
    var HEARTS = 90;
    var TURNS = 5.5;
    for (var i = 0; i < HEARTS; i++) {
      var t = i / (HEARTS - 1);                              // 0 (низ) → 1 (верх)
      var angle = t * Math.PI * 2 * TURNS + (i % 3) * 0.35;  // спираль
      var radius = 0.55 + t * 2.35;                          // воронка: узкая внизу, широкая сверху
      var heart = new THREE.Mesh(heartGeo, i % 2 ? violetMat : pinkMat);
      var s = 0.028 + t * 0.03 + Math.random() * 0.012;      // мелкие внизу, крупнее сверху
      heart.scale.setScalar(s);
      heart.position.set(
        Math.cos(angle) * radius,
        (t - 0.5) * 3.4,
        Math.sin(angle) * radius
      );
      heart.rotation.z = Math.PI; // сердечко остриём вниз
      heart.rotation.y = Math.random() * Math.PI * 2;
      heart.userData = {
        baseY: (t - 0.5) * 3.4,
        phase: Math.random() * Math.PI * 2,
        bobSpeed: 0.8 + Math.random() * 0.8,
        spinSpeed: 0.5 + Math.random() * 1.2
      };
      hurricane.add(heart);
    }
    scene.add(hurricane);

    var pinkLight = new THREE.PointLight(0xFF5CA8, 2.2);
    pinkLight.position.set(6, 4, 6);
    scene.add(pinkLight);

    var violetLight = new THREE.PointLight(0x9D6BFF, 2.2);
    violetLight.position.set(-6, -3, 5);
    scene.add(violetLight);

    scene.add(new THREE.AmbientLight(0x4A3663, 1.4));

    var mouseX = 0, mouseY = 0;
    window.addEventListener('pointermove', function (e) {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    hurricane.rotation.x = 0.22; // лёгкий наклон воронки к зрителю

    if (reduceMotion) {
      renderer.render(scene, camera);
      return;
    }

    var clock = new THREE.Clock();
    (function frame() {
      var t = clock.getElapsedTime();
      hurricane.rotation.y = t * 0.45;                 // вращение урагана
      hurricane.position.y = Math.sin(t * 0.6) * 0.22; // floating всей воронки
      for (var j = 0; j < hurricane.children.length; j++) {
        var h = hurricane.children[j];
        h.position.y = h.userData.baseY + Math.sin(t * h.userData.bobSpeed + h.userData.phase) * 0.1;
        h.rotation.y += h.userData.spinSpeed * 0.012;
      }
      camera.position.x += (mouseX * 1.4 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 1.0 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    })();
  })();

  /* ---------- Магнитные кнопки ---------- */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- FAQ: закрывать соседние ---------- */
  var faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- Форма заявки ----------
     Без бэкенда: собираем текст заявки, копируем в буфер
     и открываем Telegram. Чтобы отправлять на почту/в сервис,
     подключи Formspree: добавь action="https://formspree.io/f/ТВОЙ_ID"
     и method="POST" на <form>, а этот обработчик удали. */
  var form = document.getElementById('applyForm');
  var statusEl = document.getElementById('formStatus');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var age = document.getElementById('f-age');
    var consent = document.getElementById('f-gdpr');
    var name = document.getElementById('f-name').value.trim();
    var tg = document.getElementById('f-tg').value.trim();

    if (!name || !tg) {
      statusEl.textContent = 'Заполни имя и Telegram — иначе мы не сможем ответить.';
      return;
    }
    if (!age.checked || !consent.checked) {
      statusEl.textContent = 'Нужны обе галочки: 18+ и согласие на обработку данных.';
      return;
    }

    var message =
      'Заявка в Storm Agency\n' +
      'Имя: ' + name + '\n' +
      'Telegram: ' + tg + '\n' +
      'Опыт: ' + document.getElementById('f-exp').value + '\n' +
      'Ссылки: ' + (document.getElementById('f-page').value.trim() || '—');

    function openTelegram() {
      window.open('https://t.me/' + TELEGRAM_USERNAME, '_blank', 'noopener');
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message).then(function () {
        statusEl.textContent = 'Заявка скопирована — вставь её в открывшийся чат Telegram.';
        openTelegram();
      }).catch(function () {
        statusEl.textContent = 'Открываю Telegram — продублируй туда данные из формы.';
        openTelegram();
      });
    } else {
      statusEl.textContent = 'Открываю Telegram — продублируй туда данные из формы.';
      openTelegram();
    }
  });
})();
