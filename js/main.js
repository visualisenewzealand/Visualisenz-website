document.addEventListener('DOMContentLoaded', function () {

  // Header scroll behaviour — only applies where the header starts transparent (homepage hero).
  // Pages whose header already starts with class="scrolled" in the HTML keep it permanently solid.
  const header = document.getElementById('site-header');
  if (header && !header.classList.contains('scrolled')) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    document.addEventListener('scroll', onScroll, { passive: true });
  }

  // Mobile nav toggle
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // Scroll-reveal animation (reusable so dynamically-loaded content can trigger it too)
  let revealObserver = null;
  window.initRevealObserver = function () {
    const reveals = document.querySelectorAll('.reveal:not(.reveal-bound)');
    if (!reveals.length) return;
    if ('IntersectionObserver' in window) {
      if (!revealObserver) {
        revealObserver = new IntersectionObserver((entries) => {
          entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); } });
        }, { threshold: 0.12 });
      }
      reveals.forEach(el => { el.classList.add('reveal-bound'); revealObserver.observe(el); });
    } else {
      reveals.forEach(el => { el.classList.add('reveal-bound', 'in'); });
    }
  };
  window.initRevealObserver();

  // Homepage "Our Renders" slideshow (reusable so dynamically-loaded slides can (re)initialise it)
  window.initSlideshow = function () {
    const slides = document.querySelectorAll('#slideshow .slide');
    const dots = document.querySelectorAll('#slideshow .dot');
    if (!slides.length) return;
    if (window._slideshowTimer) clearInterval(window._slideshowTimer);
    let idx = 0;
    function show(i) {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      slides[i].classList.add('active');
      dots[i].classList.add('active');
      idx = i;
    }
    function next() { show((idx + 1) % slides.length); }
    function start() { window._slideshowTimer = setInterval(next, 4200); }
    function stop() { clearInterval(window._slideshowTimer); }
    dots.forEach((d, i) => d.addEventListener('click', () => { show(i); stop(); start(); }));
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) { start(); }
  };
  window.initSlideshow();

  // Portfolio page category filter (reusable so it (re)binds after dynamic content loads)
  window.initFilters = function () {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const catGroups = document.querySelectorAll('.cat-group');
    if (!filterBtns.length || !catGroups.length) return;
    filterBtns.forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        document.querySelectorAll('.cat-group').forEach(g => {
          g.classList.toggle('hidden', f !== 'all' && g.dataset.cat !== f);
        });
      });
    });
  };
  window.initFilters();

  // Footer copyright year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
