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

  // Scroll-reveal animation
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.12 });
      reveals.forEach(el => io.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('in'));
    }
  }

  // Homepage "Our Renders" slideshow
  const slides = document.querySelectorAll('#slideshow .slide');
  const dots = document.querySelectorAll('#slideshow .dot');
  if (slides.length) {
    let idx = 0, timer;
    function show(i) {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      slides[i].classList.add('active');
      dots[i].classList.add('active');
      idx = i;
    }
    function next() { show((idx + 1) % slides.length); }
    function start() { timer = setInterval(next, 4200); }
    function stop() { clearInterval(timer); }
    dots.forEach((d, i) => d.addEventListener('click', () => { show(i); stop(); start(); }));
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) { start(); }
  }

  // Portfolio page category filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const catGroups = document.querySelectorAll('.cat-group');
  if (filterBtns.length && catGroups.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        catGroups.forEach(g => {
          g.classList.toggle('hidden', f !== 'all' && g.dataset.cat !== f);
        });
      });
    });
  }

  // Footer copyright year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
