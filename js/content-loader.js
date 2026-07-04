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

    const headerContactBtn = document.getElementById('header-contact-btn');
    if (headerContactBtn) headerContactBtn.href = 'mailto:' + settings.contact.email;

    const footerDesc = document.getElementById('footer-description');
    if (footerDesc && settings.footer_description) footerDesc.textContent = settings.footer_description;

    const bioEl = document.getElementById('bio-text');
    if (bioEl && settings.bio_text) bioEl.textContent = settings.bio_text;

    // Homepage text blocks
    const ht = settings.homepage_text;
    if (ht) {
      const heroH = document.getElementById('hero-heading');
      if (heroH && ht.hero_heading_line1 && ht.hero_heading_line2) {
        heroH.innerHTML = `${esc(ht.hero_heading_line1)}<br>${esc(ht.hero_heading_line2).replace(/(exists\.?)$/i, '<em>$1</em>')}`;
      }
      const setText = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
      setText('hero-subtext', ht.hero_subtext);
      setText('manifesto-heading', ht.manifesto_heading);
      setText('services-heading', ht.services_heading);
      setText('services-subtext', ht.services_subtext);
      setText('work-heading', ht.work_heading);
      setText('work-subtext', ht.work_subtext);
      setText('about-heading', ht.about_heading);
      setText('reviews-heading', ht.reviews_heading);
      setText('reviews-subtext', ht.reviews_subtext);
      setText('cta-heading', ht.cta_heading);
      setText('cta-subtext', ht.cta_subtext);
    }

    // Navigation (reorderable via CMS) — rendered correctly whether we're on the homepage or another page
    if (settings.nav_items && settings.nav_items.length) {
      const isHomepage = !!document.querySelector('.hero');
      const currentPath = location.pathname.split('/').pop() || 'index.html';

      function navHref(link) {
        if (link.startsWith('#')) return isHomepage ? link : 'index.html' + link;
        return link;
      }
      function isCurrent(link) {
        return !link.startsWith('#') && link === currentPath;
      }

      const headerNavParent = document.getElementById('nav-links');
      const ctaBtn = document.getElementById('header-contact-btn');
      if (headerNavParent && ctaBtn) {
        // Remove all existing nav links except the CTA button itself
        Array.from(headerNavParent.querySelectorAll('a')).forEach(a => {
          if (a.id !== 'header-contact-btn') a.remove();
        });
        // Insert freshly-ordered links right before the CTA button
        settings.nav_items.forEach(item => {
          const a = document.createElement('a');
          a.href = navHref(item.link);
          a.textContent = item.label;
          if (isCurrent(item.link)) a.className = 'current';
          headerNavParent.insertBefore(a, ctaBtn);
        });
      }
      const footerNavEl = document.getElementById('footer-nav-items-container');
      if (footerNavEl) {
        footerNavEl.innerHTML = settings.nav_items.map(item =>
          `<li><a href="${esc(navHref(item.link))}">${esc(item.label)}</a></li>`
        ).join('\n') + '\n<li><a href="terms.html">Terms &amp; Conditions</a></li>';
      }
    }

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
      const data = await res.json();
      projects = data.projects;
    } catch (e) {
      console.error('Could not load portfolio data', e);
      return;
    }
    projects.sort((a, b) => a.order - b.order);
    window._portfolioProjects = projects;

    // Homepage "Step inside our renders" tile grid
    const workGrid = document.querySelector('.work-grid');
    if (workGrid) {
      workGrid.innerHTML = projects.map(p => `
        <a class="work-tile reveal" href="portfolio.html#${esc(p.slug)}">
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
          const imagesHtml = p.images.map((img, i) => `<div class="pg-item"><img src="${esc(img.image)}" alt="${esc(img.alt)}" class="lightbox-trigger" data-project="${esc(p.slug)}" data-index="${i}" tabindex="0"></div>`).join('');
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
              <h3>${p.external_link ? `<a href="${esc(p.external_link)}" target="_blank" rel="noopener">${esc(p.title)}</a>` : esc(p.title)}</h3>
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

  // ---------- Terms & Conditions page content ----------
  async function loadTerms() {
    const introEl = document.getElementById('terms-intro');
    const sectionsEl = document.getElementById('terms-sections');
    if (!introEl && !sectionsEl) return;
    let terms;
    try {
      const res = await fetch('data/terms.json');
      terms = await res.json();
    } catch (e) {
      console.error('Could not load terms content', e);
      return;
    }
    if (introEl && terms.intro) introEl.textContent = terms.intro;
    if (sectionsEl && terms.sections && terms.sections.length) {
      sectionsEl.innerHTML = terms.sections.map(s => `
        <h2>${esc(s.heading)}</h2>
        ${(s.body || '').split('\n\n').map(p => `<p>${esc(p)}</p>`).join('\n')}
      `).join('\n');
    }
  }

  await Promise.all([loadSettings(), loadPortfolio(), loadTerms()]);
});
