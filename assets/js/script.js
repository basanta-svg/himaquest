document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initNavDropdown();
  initHeroSlider();
  initExperiencesSlider();
  initDestinationsSlider();
  initFaqToggle();
  initLoadMore();
  initBlogFilter();
  initContactForm();
  initNewsletterForm();
  initFooterYear();
});

/* Sticky header: transparent at top, solid on scroll */
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const applyState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 60);
  };

  applyState();
  window.addEventListener('scroll', applyState, { passive: true });
}

/* Mobile nav toggle */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('headerNav');
  const closeBtn = document.getElementById('mobileNavClose');
  if (!toggle || !nav) return;

  let lockedScrollY = 0;

  function closeNav() {
    nav.classList.remove('is-open');
    toggle.classList.remove('is-active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, lockedScrollY);
  }

  function openNav() {
    lockedScrollY = window.scrollY;
    nav.classList.add('is-open');
    toggle.classList.add('is-active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.width = '100%';
  }

  toggle.addEventListener('click', () => {
    if (nav.classList.contains('is-open')) closeNav(); else openNav();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeNav);

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });
}

/* Nav dropdowns (Experiences, Information, ...) — tap-to-toggle for touch/mobile, hover handles desktop via CSS */
function initNavDropdown() {
  document.querySelectorAll('.nav-item.has-dropdown').forEach((item) => {
    const toggle = item.querySelector('.nav-dropdown-toggle');
    const dropdown = item.querySelector('.nav-dropdown');
    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dropdown.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  });
}

/* Full-screen hero slider with fade transitions, arrows, and dots */
function initHeroSlider() {
  const slider = document.getElementById('heroSlider');
  const dotsWrap = document.getElementById('heroDots');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  const heroContent = document.getElementById('heroContent');
  const titleEl = document.getElementById('heroTitle');
  const subtitleEl = document.getElementById('heroSubtitle');
  const ctaEl = heroContent ? heroContent.querySelector('.hero-cta') : null;
  const animatedEls = [titleEl, subtitleEl, ctaEl].filter(Boolean);
  const ENTER_DELAYS = [300, 500, 700];
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  if (slides.length === 0) return;

  let current = slides.findIndex((slide) => slide.classList.contains('is-active'));
  if (current < 0) current = 0;

  const AUTO_DELAY = 6000;
  const SWAP_DELAY = 800;
  let timer = null;

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (index === current ? ' is-active' : '');
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.addEventListener('click', () => goToSlide(index));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.children);

  function setEnterDelays() {
    animatedEls.forEach((el, index) => {
      el.style.transitionDelay = `${ENTER_DELAYS[index] || 0}ms`;
    });
  }

  function clearDelays() {
    animatedEls.forEach((el) => {
      el.style.transitionDelay = '0ms';
    });
  }

  function playEntrance() {
    if (!heroContent) return;
    clearDelays();
    heroContent.classList.remove('is-visible');
    void heroContent.offsetWidth;
    setEnterDelays();
    requestAnimationFrame(() => heroContent.classList.add('is-visible'));
  }

  function updateText(slide) {
    const nextTitle = slide.dataset.title;
    const nextSubtitle = slide.dataset.subtitle;
    if (!heroContent) return;

    clearDelays();
    heroContent.classList.remove('is-visible');

    setTimeout(() => {
      if (titleEl && nextTitle !== undefined) titleEl.textContent = nextTitle;
      if (subtitleEl && nextSubtitle !== undefined) subtitleEl.textContent = nextSubtitle;
      void heroContent.offsetWidth;
      setEnterDelays();
      requestAnimationFrame(() => heroContent.classList.add('is-visible'));
    }, SWAP_DELAY);
  }

  function render() {
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === current);
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === current);
    });
    updateText(slides[current]);
  }

  function goToSlide(index) {
    current = (index + slides.length) % slides.length;
    render();
    resetTimer();
  }

  function nextSlide() { goToSlide(current + 1); }
  function prevSlide() { goToSlide(current - 1); }

  function resetTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(nextSlide, AUTO_DELAY);
  }

  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  resetTimer();
  requestAnimationFrame(playEntrance);
}

/* Mouse/touch draggable destinations slider with arrow-button navigation */
function initDestinationsSlider() {
  const slider = document.getElementById('destSlider');
  const prevBtn = document.getElementById('destPrev');
  const nextBtn = document.getElementById('destNext');
  if (!slider) return;

  const DRAG_THRESHOLD = 6;
  let isDown = false;
  let hasDragged = false;
  let startX = 0;
  let startScrollLeft = 0;

  function step() {
    const card = slider.querySelector('.dest-card');
    if (!card) return slider.clientWidth * 0.8;
    const gap = parseFloat(getComputedStyle(slider).columnGap || getComputedStyle(slider).gap || '0');
    return card.getBoundingClientRect().width + gap;
  }

  function onPointerDown(e) {
    isDown = true;
    hasDragged = false;
    slider.classList.add('is-dragging');
    startX = e.pageX;
    startScrollLeft = slider.scrollLeft;
  }

  function onPointerMove(e) {
    if (!isDown) return;
    const delta = e.pageX - startX;
    if (Math.abs(delta) > DRAG_THRESHOLD) hasDragged = true;
    slider.scrollLeft = startScrollLeft - delta;
  }

  function endDrag() {
    if (!isDown) return;
    isDown = false;
    slider.classList.remove('is-dragging');
  }

  slider.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', endDrag);
  slider.addEventListener('mouseleave', endDrag);

  slider.querySelectorAll('.dest-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (hasDragged) e.preventDefault();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      slider.scrollBy({ left: -step(), behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      slider.scrollBy({ left: step(), behavior: 'smooth' });
    });
  }
}

/* Mouse/touch draggable trips slider with arrow-button navigation */
function initExperiencesSlider() {
  const slider = document.getElementById('expSlider');
  const prevBtn = document.getElementById('expPrev');
  const nextBtn = document.getElementById('expNext');
  if (!slider) return;

  const DRAG_THRESHOLD = 6;
  let isDown = false;
  let hasDragged = false;
  let startX = 0;
  let startScrollLeft = 0;

  function step() {
    const card = slider.querySelector('.trip-card');
    if (!card) return slider.clientWidth * 0.8;
    const gap = parseFloat(getComputedStyle(slider).columnGap || getComputedStyle(slider).gap || '0');
    return card.getBoundingClientRect().width + gap;
  }

  function onPointerDown(e) {
    isDown = true;
    hasDragged = false;
    slider.classList.add('is-dragging');
    startX = e.pageX;
    startScrollLeft = slider.scrollLeft;
  }

  function onPointerMove(e) {
    if (!isDown) return;
    const delta = e.pageX - startX;
    if (Math.abs(delta) > DRAG_THRESHOLD) hasDragged = true;
    slider.scrollLeft = startScrollLeft - delta;
  }

  function endDrag() {
    if (!isDown) return;
    isDown = false;
    slider.classList.remove('is-dragging');
  }

  slider.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', endDrag);
  slider.addEventListener('mouseleave', endDrag);

  slider.querySelectorAll('.trip-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (hasDragged) e.preventDefault();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      slider.scrollBy({ left: -step(), behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      slider.scrollBy({ left: step(), behavior: 'smooth' });
    });
  }
}

/* FAQ accordion: click a question to toggle its answer open/closed */
function initFaqToggle() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.toggle('is-open');
      question.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });
}

/* "Load more" card grids — reveals hidden cards then hides itself */
function initLoadMore() {
  document.querySelectorAll('.load-more-btn').forEach((btn) => {
    const grid = btn.closest('section')?.querySelector('.dzongkhag-grid');
    if (!grid) return;

    btn.addEventListener('click', () => {
      grid.classList.add('is-expanded');
      btn.classList.add('is-hidden');
    });
  });
}

/* Blog category filter */
function initBlogFilter() {
  const filters = document.querySelectorAll('.blog-filter');
  const cards = document.querySelectorAll('.blog-card');
  const emptyMsg = document.querySelector('.blog-empty');
  if (!filters.length || !cards.length) return;

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filter = btn.dataset.filter;
      let visibleCount = 0;

      cards.forEach((card) => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-filtered-out', !match);
        if (match) visibleCount += 1;
      });

      if (emptyMsg) emptyMsg.classList.toggle('is-hidden', visibleCount > 0);
    });
  });
}

/* Footer newsletter sign-up (no backend — shows an inline confirmation) */
function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.querySelector('.footer-newsletter-note')) return;

    const note = document.createElement('p');
    note.className = 'footer-newsletter-note';
    note.textContent = "Thanks — you're on the list.";
    form.insertAdjacentElement('afterend', note);
    form.reset();
  });
}

/* Contact page form (no backend — shows an inline confirmation) */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.querySelector('.contact-form-note')) return;

    const note = document.createElement('p');
    note.className = 'contact-form-note';
    note.textContent = "Thanks for reaching out — we'll be in touch within one business day.";
    form.appendChild(note);
    form.reset();
  });
}

function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
