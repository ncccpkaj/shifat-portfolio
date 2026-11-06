(() => {
  const root = document.documentElement;
  root.classList.add('has-js');
  const themeButton = document.querySelector('.theme-toggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const themePreference = window.matchMedia('(prefers-color-scheme: dark)');
  const themeKey = 'shifat-portfolio-theme';

  const savedTheme = localStorage.getItem(themeKey);
  const hasThemeChoice = savedTheme === 'light' || savedTheme === 'dark';

  function applyTheme(theme, remember = false) {
    root.dataset.theme = theme;
    if (themeMeta) themeMeta.content = theme === 'dark' ? '#11131a' : '#f8f9fc';
    if (themeButton) {
      const nextTheme = theme === 'dark' ? 'light' : 'dark';
      themeButton.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
      themeButton.setAttribute('title', `Switch to ${nextTheme} theme`);
      themeButton.innerHTML = theme === 'dark'
        ? '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"></path></svg>'
        : '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8a8.6 8.6 0 1 0 11.3 11.3Z"></path></svg>';
    }
    if (remember) localStorage.setItem(themeKey, theme);
  }

  applyTheme(hasThemeChoice ? savedTheme : (themePreference.matches ? 'dark' : 'light'));
  themeButton?.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
  });
  themePreference.addEventListener('change', (event) => {
    if (!hasThemeChoice && !localStorage.getItem(themeKey)) applyTheme(event.matches ? 'dark' : 'light');
  });

  const menuButton = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  function closeMenu() {
    if (!menuButton || !siteNav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    siteNav.classList.remove('is-open');
  }
  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    siteNav?.classList.toggle('is-open', !isOpen);
  });
  siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', (event) => {
    if (siteNav?.classList.contains('is-open') && !siteNav.contains(event.target) && !menuButton?.contains(event.target)) closeMenu();
  });

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    let scrollFrame = 0;
    window.addEventListener('scroll', () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        root.style.setProperty('--ambient-shift', `${Math.min(window.scrollY * 0.055, 150)}px`);
        scrollFrame = 0;
      });
    }, { passive: true });
  }
  const revealItems = document.querySelectorAll('.reveal');
  const skillRows = document.querySelectorAll('.skill-row');
  function revealItem(item) {
    item.classList.add('is-visible');
    if (item.classList.contains('skill-row')) animateCount(item);
    item.querySelectorAll?.('.skill-row').forEach((row) => {
      row.classList.add('is-visible');
      animateCount(row);
    });
  }
  function animateCount(row) {
    if (row.dataset.counted) return;
    row.dataset.counted = 'true';
    const target = Number(row.dataset.value);
    row.style.setProperty('--skill-target', `${Math.min(target, 100)}%`);
    const count = row.querySelector('.skill-count');
    if (!count) return;
    if (reduceMotion) { count.textContent = target; return; }
    const duration = 1000;
    const started = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      count.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealItem(entry.target);
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -30px 0px' });
    revealItems.forEach((item) => observer.observe(item));
    skillRows.forEach((row) => observer.observe(row));
  } else {
    revealItems.forEach(revealItem);
    skillRows.forEach(revealItem);
  }

  const navLinks = [...document.querySelectorAll('.site-nav a')];
  const observedSections = document.querySelectorAll('main section[id]');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    observedSections.forEach((section) => sectionObserver.observe(section));
  }
})();
