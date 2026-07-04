document.addEventListener('DOMContentLoaded', async function () {

  function esc(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ---------- Shared footer / contact details (every page) ----------
  async function loadSettings() {
    let settings;
    try {
      const res = await fetch('data/settings.json');
      settings = await res.json();
    } catch (e) {
      console.error('Could not load site settings', e);
      return null;
    }

    const emailEl = document.getElementById('footer-email');
    if (emailEl) { emailEl.textContent = settings.contact.email; emailEl.href = 'mailto:' + settings.contact.email; }

    const phoneEl = document.getElementById('footer-phone');
    if (phoneEl) { phoneEl.textContent = settings.contact.phone_display; phoneEl.href = 'tel:' + settings.contact.phone_link; }

    const addrEl = document.getElementById('footer-address');
    if (addrEl) addrEl.textContent = settings.contact.address;

    const nzbnEl = document.getElementById('footer-nzbn');
    if (nzbnEl) nzbnEl.textContent = 'NZBN: ' + settings.contact.nzbn;

    const socialMap = { facebook: 'social-facebook', instagram: 'social-instagram', youtube: 'social-youtube', linkedin: 'social-linkedin' };
    Object.keys(socialMap).forEach(key => {
      const el = document.getElementById(socialMap[key]);
      if (el && settings.socials[key]) el.href = settings.socials[key];
    });

    const reviewsBtn = document.getElementById('reviews-btn');
    if (reviewsBtn && settings.reviews_url) reviewsBtn.href = settings.reviews_url;

    const chatBtn = document.getElementById('chat-btn');
    if (chatBtn) chatBtn.href = 'mailto:' + settings.contact.email;

    const bioEl = document.getElementById('bio-text');
    if (bioEl && settings.bio_text) bioEl.textContent = settings.bio_text;

    // Homepage slideshow
    const slideshow = document.getElementById('slideshow');
    if (slideshow && settings.slideshow && settings.slideshow.length) {
      const slidesHtml = settings.slideshow.map((s, i) => `
        <div class="slide${i === 0 ? ' active' : ''}" style="background-image:url('${esc(s.image)}');">
          <div class="slide-text"><h3>${esc(s.label)}</h3>${s.description ? `<p>${esc(s.description)}</p>` : ''}</div>
        </div>`).join('');
      const dotsHtml = settings.slideshow.map((s, i) => `<button class="dot${i === 0 ? ' active' : ''}" data-slide="${i}" aria-label="Slide ${i + 1}"></button>`).join('');
      slideshow.innerHTML = slidesHtml + `<div class="slide-dots">${dotsHtml}</div>`;
      if (window.initSlideshow) window.initSlideshow();
    }

    return settings;
  }

  // ---------- Portfolio data (homepage tiles + full portfolio page) ----------
  async function loadPortfolio() {
    let projects;
    try {
      const res = await fetch('data/portfolio.json');
      projects = await res.json();
    } catch (e) {
      console.error('Could not load portfolio data', e);
      return;
    }
    projects.sort((a, b) => a.order - b.order);

    // Homepage "Step inside our renders" tile grid
    const workGrid = document.querySelector('.work-grid');
    if (workGrid) {
      workGrid.innerHTML = projects.map(p => `
        <a class="work-tile reveal" href="portfolio.html#${esc(p.category)}">
          <img src="${esc(p.homepage_tile_image)}" alt="${esc(p.title)} render">
          <div class="work-tile-text"><span class="cat">${esc(p.category_label)}</span><h3>${esc(p.title)}</h3></div>
        </a>`).join('');
      if (window.initRevealObserver) window.initRevealObserver();
    }

    // Full portfolio page listing, grouped by category in a fixed display order
    const catContainer = document.getElementById('portfolio-categories');
    if (catContainer) {
      const catOrder = [
        { key: 'property', title: 'Property Developments', alt: false },
        { key: 'commercial', title: 'Commercial Projects', alt: true },
        { key: 'residential', title: 'Residential Projects', alt: false }
      ];
      catContainer.innerHTML = catOrder.map(cat => {
        const items = projects.filter(p => p.category === cat.key);
        if (!items.length) return '';
        const articlesHtml = items.map(p => {
          const gridClass = p.layout === 'pair' ? 'project-grid pair' : 'project-grid';
          const imagesHtml = p.images.map(img => `<div class="pg-item"><img src="${esc(img.image)}" alt="${esc(img.alt)}"></div>`).join('');
          let videoHtml = '';
          if (p.videos && p.videos.length === 1) {
            const v = p.videos[0];
            videoHtml = `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${esc(v.video_id)}" title="${esc(p.title)} video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
          } else if (p.videos && p.videos.length > 1) {
            videoHtml = `<div class="video-embed-row">${p.videos.map(v => `
              <div>${v.label ? `<span class="video-label">${esc(v.label)}</span>` : ''}
                <div class="video-embed"><iframe src="https://www.youtube.com/embed/${esc(v.video_id)}" title="${esc(p.title)} ${esc(v.label)} video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>
              </div>`).join('')}</div>`;
          }
          return `
          <article class="project" id="${esc(p.slug)}">
            <div class="project-head">
              <h3>${esc(p.title)}</h3>
              <div class="project-meta"><span class="label">${esc(p.category_label)}</span><span class="credit">${esc(p.credit)}</span></div>
            </div>
            <div class="${gridClass}">${imagesHtml}</div>
            ${videoHtml}
          </article>`;
        }).join('');
        return `
        <section class="cat-group${cat.alt ? ' alt' : ''}" data-cat="${cat.key}" id="${cat.key}">
          <div class="wrap">
            <h2 class="cat-title">${cat.title}</h2>
            ${articlesHtml}
          </div>
        </section>`;
      }).join('');
      if (window.initFilters) window.initFilters();
    }
  }

  await Promise.all([loadSettings(), loadPortfolio()]);
});
