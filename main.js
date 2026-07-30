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
  if (hasGSAP) {
    document.body.classList.add('gsap-on');
    gsap.registerPlugin(ScrollTrigger);

    /* Reveals con stagger por sección */
    document.querySelectorAll('section, .marquee, footer.site').forEach(scope => {
      const items = scope.querySelectorAll('.reveal');
      if (!items.length) return;
      gsap.set(items, { opacity: 0, y: 36 });
      ScrollTrigger.batch(items, {
        start: 'top 88%',
        onEnter: batch => gsap.to(batch, {
          opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .09, overwrite: true
        })
      });
    });

    /* Contadores */
    document.querySelectorAll('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () => gsap.to(obj, {
          v: end, duration: 1.6, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString('es-MX') + suffix; }
        })
      });
    });

    /* Hero home: solo una entrada sutil, sin loops infinitos */
    const heroBottles = document.querySelector('.hero-bottles');
    if (heroBottles) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-copy > *', { y: 30, opacity: 0, duration: .7, stagger: .08 })
        .from(heroBottles, { y: 40, opacity: 0, duration: .8 }, '-=.5')
        .from('.floater', { opacity: 0, duration: .6, stagger: .08 }, '-=.5');
    }

  } else {
    /* Fallback sin GSAP: IntersectionObserver */
    const reveals = document.querySelectorAll('.reveal');
    if (reduce || !('IntersectionObserver' in window)) {
      reveals.forEach(el => el.classList.add('in'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: .12 });
      reveals.forEach(el => io.observe(el));
    }
    document.querySelectorAll('[data-count]').forEach(el => {
      el.textContent = parseFloat(el.dataset.count).toLocaleString('es-MX') + (el.dataset.suffix || '');
    });
  }
})();
