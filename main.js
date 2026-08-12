/* ============================================================
   PASA — main.js compartido · animaciones GSAP + interacción
   ============================================================ */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && !reduce;

  /* ---------- Año ---------- */
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* ---------- Nav scrolled ---------- */
  const nav = document.querySelector('header.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Menú móvil ---------- */
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  if (burger && menu) {
    const toggle = (open) => {
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
    };
    burger.addEventListener('click', () => toggle(!document.body.classList.contains('menu-open')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
  }

  /* ---------- Link activo según página ---------- */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.links a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });

  /* ---------- Barra de progreso de scroll ---------- */
  const prog = document.createElement('div');
  prog.id = 'scrollbar-progress';
  document.body.appendChild(prog);
  const updProg = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    prog.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
  };
  updProg();
  window.addEventListener('scroll', updProg, { passive: true });

  /* ---------- Botón volver arriba ---------- */
  const fab = document.createElement('button');
  fab.id = 'backtop';
  fab.setAttribute('aria-label', 'Volver arriba');
  fab.textContent = '↑';
  document.body.appendChild(fab);
  fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  window.addEventListener('scroll', () => fab.classList.toggle('show', window.scrollY > 600), { passive: true });

  /* ============================================================
     ANIMACIONES
     ============================================================ */
  /* --- Reveals: siempre por IntersectionObserver (no depende de GSAP) --- */
  const reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .08, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(el => io.observe(el));
    /* Red de seguridad: nada queda oculto para siempre */
    setTimeout(() => reveals.forEach(el => el.classList.add('in')), 4000);
  }

  if (hasGSAP) {
    document.body.classList.add('gsap-on');
    gsap.registerPlugin(ScrollTrigger);

    /* Contadores */
    document.querySelectorAll('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const final = end.toLocaleString('es-MX') + suffix;
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter: () => gsap.to(obj, {
          v: end, duration: 1.5, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString('es-MX') + suffix; },
          onComplete: () => { el.textContent = final; }
        })
      });
      /* Red de seguridad: si el tween no corre, muestra la cifra final */
      setTimeout(() => { if (!el.textContent.trim()) el.textContent = final; }, 4000);
    });

    /* Hero: entrada sutil con estado final explícito */
    const heroBottles = document.querySelector('.hero-bottles');
    if (heroBottles) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo('.hero-copy > *', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .08 })
        .fromTo(heroBottles, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, '-=.5')
        .fromTo('.floater', { opacity: 0 }, { opacity: 1, duration: .6, stagger: .08 }, '-=.5');
      /* Red de seguridad: si los frames se pausan (pestaña en segundo plano,
         batería baja) la animación se adelanta a su estado final en lugar de
         dejar el hero invisible. Adelantar la línea de tiempo evita que el
         propio tween vuelva a ocultar los elementos. */
      setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, 2000);
    }

  } else {
    document.querySelectorAll('[data-count]').forEach(el => {
      el.textContent = parseFloat(el.dataset.count).toLocaleString('es-MX') + (el.dataset.suffix || '');
    });
  }

  /* ============================================================
     PROFUNDIDAD 3D
     Solo escritorio con puntero fino. En táctil no se registra
     ningún listener, así que el móvil se queda exactamente igual.
     ============================================================ */
  const fino = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (!reduce && fino) {

    /* --- Tarjetas: inclinación según el cursor + reflejo especular ---
       Por delegación en el documento: las tarjetas de productos.html se
       generan por JS después de este archivo, así que engancharlas una a
       una aquí no alcanzaría a ninguna. */
    const MAX_X = 8, MAX_Y = 10;   // grados
    let activa = null, pendC = null;

    const reposar = () => {
      if (!activa) return;
      if (pendC) { cancelAnimationFrame(pendC); pendC = null; }
      activa.classList.remove('is-tilting');
      activa.style.transform = '';
      activa = null;
    };

    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest && e.target.closest('.pgrid .pcard');
      if (!card) { reposar(); return; }
      if (card !== activa) { reposar(); activa = card; }

      let glare = card.querySelector(':scope > .glare');
      if (!glare) {
        glare = document.createElement('span');
        glare.className = 'glare';
        glare.setAttribute('aria-hidden', 'true');
        card.appendChild(glare);
      }

      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width  - .5;   // -0.5 … 0.5
      const ny = (e.clientY - r.top)  / r.height - .5;
      if (pendC) return;
      pendC = requestAnimationFrame(() => {
        pendC = null;
        card.classList.add('is-tilting');
        card.style.transform =
          `translateY(-7px) rotateX(${(-ny * MAX_X).toFixed(2)}deg) rotateY(${(nx * MAX_Y).toFixed(2)}deg)`;
        glare.style.setProperty('--gx', ((nx + .5) * 100).toFixed(1) + '%');
        glare.style.setProperty('--gy', ((ny + .5) * 100).toFixed(1) + '%');
      });
    }, { passive: true });

    document.addEventListener('pointerleave', reposar, { passive: true });
    window.addEventListener('scroll', reposar, { passive: true });

    /* --- Hero: las botellas siguen el puntero --- */
    const visual = document.querySelector('.hero-visual');
    if (visual) {
      const bottles = visual.querySelector('.hero-tilt') || visual.querySelector('.hero-bottles');
      let pend = null, dentro = false;

      window.addEventListener('pointermove', (e) => {
        const r = visual.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;   // fuera de pantalla
        const nx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
        const ny = (e.clientY - (r.top + r.height / 2)) / innerHeight;
        if (pend) return;
        pend = requestAnimationFrame(() => {
          pend = null;
          if (!dentro) { visual.classList.add('is-tracking'); dentro = true; }
          bottles.style.setProperty('--px', (nx * 22).toFixed(1) + 'px');
          bottles.style.setProperty('--py', (ny * 12).toFixed(1) + 'px');
          bottles.style.setProperty('--ry', (nx * 7).toFixed(2) + 'deg');
          bottles.style.setProperty('--rx', (-ny * 4).toFixed(2) + 'deg');
        });
      }, { passive: true });

      /* al salir del documento vuelve al reposo con la transición larga */
      document.addEventListener('pointerleave', () => {
        visual.classList.remove('is-tracking'); dentro = false;
        ['--px', '--py', '--ry', '--rx'].forEach(v => bottles.style.removeProperty(v));
      }, { passive: true });
    }
  }
})();
