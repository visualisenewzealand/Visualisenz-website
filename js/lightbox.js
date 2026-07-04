document.addEventListener('DOMContentLoaded', function () {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return; // only present on the portfolio page

  const imgEl = document.getElementById('lightbox-img');
  const captionEl = document.getElementById('lightbox-caption');
  const counterEl = document.getElementById('lightbox-counter');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  let currentImages = [];
  let currentIndex = 0;

  function getProjectImages(slug) {
    // Prefer the freshly-loaded CMS data if available; fall back to reading whatever is in the DOM
    if (window._portfolioProjects) {
      const project = window._portfolioProjects.find(p => p.slug === slug);
      if (project) return project.images;
    }
    const article = document.getElementById(slug);
    if (!article) return [];
    return Array.from(article.querySelectorAll('img.lightbox-trigger')).map(img => ({
      image: img.getAttribute('src'), alt: img.getAttribute('alt')
    }));
  }

  function show(index) {
    if (!currentImages.length) return;
    currentIndex = (index + currentImages.length) % currentImages.length;
    const img = currentImages[currentIndex];
    imgEl.src = img.image;
    imgEl.alt = img.alt || '';
    captionEl.textContent = img.alt || '';
    counterEl.textContent = currentImages.length > 1 ? `${currentIndex + 1} / ${currentImages.length}` : '';
  }

  function open(slug, index) {
    currentImages = getProjectImages(slug);
    if (!currentImages.length) return;
    show(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Event delegation: works for images rendered dynamically by content-loader.js
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.lightbox-trigger');
    if (!trigger) return;
    const slug = trigger.getAttribute('data-project');
    const index = parseInt(trigger.getAttribute('data-index'), 10) || 0;
    open(slug, index);
  });

  document.addEventListener('keydown', (e) => {
    const trigger = document.activeElement && document.activeElement.classList && document.activeElement.classList.contains('lightbox-trigger');
    if (trigger && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      const slug = document.activeElement.getAttribute('data-project');
      const index = parseInt(document.activeElement.getAttribute('data-index'), 10) || 0;
      open(slug, index);
    }
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(currentIndex - 1));
  nextBtn.addEventListener('click', () => show(currentIndex + 1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(currentIndex - 1);
    if (e.key === 'ArrowRight') show(currentIndex + 1);
  });
});
