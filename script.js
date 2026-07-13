// Year
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

// Theme preference — system-aware initially, explicit choice persisted.
const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');

function applyTheme(theme, persist = false) {
  root.dataset.theme = theme;
  if (persist) {
    try { localStorage.setItem('nullcorp-theme', theme); } catch {}
  }
  if (themeToggle) {
    const isLight = theme === 'light';
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeToggle.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} mode`);
    themeToggle.querySelector('.theme-label').textContent = isLight ? 'Light' : 'Dark';
    themeToggle.querySelector('.theme-icon').textContent = isLight ? '☀' : '◐';
  }
}

applyTheme(root.dataset.theme || 'dark');
themeToggle?.addEventListener('click', () => {
  applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light', true);
});

// Sticky header on scroll
const header = document.getElementById('site-header');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Reveal on scroll — lower threshold so content appears earlier
const items = document.querySelectorAll('.reveal');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduced || !('IntersectionObserver' in window)) {
  items.forEach(x => x.classList.add('visible'));
} else {
  const observer = new IntersectionObserver(entries =>
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
  );
  items.forEach(x => observer.observe(x));

  // Hero parallax
  const media = document.querySelector('.hero-image');
  if (media) {
    addEventListener('scroll', () => {
      if (scrollY < innerHeight) media.style.translate = `0 ${scrollY * .08}px`;
    }, { passive: true });
  }
}

// Intake form — client-side handling with email validation
const form = document.getElementById('intake-form');
const successEl = document.getElementById('intake-success');
const mobileNav = document.querySelector('.mobile-nav');

if (mobileNav) {
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { mobileNav.open = false; });
  });
}

function showFieldError(field, msg) {
  field.classList.add('field-error');
  field.setAttribute('aria-invalid', 'true');
  // Insert an announced, programmatically associated error message.
  let errEl = field.parentElement.querySelector('.field-error-msg');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'field-error-msg';
    errEl.id = `${field.id}-error`;
    errEl.setAttribute('role', 'alert');
    field.parentElement.appendChild(errEl);
  }
  const describedBy = field.getAttribute('aria-describedby') || '';
  if (!describedBy.split(' ').includes(errEl.id)) {
    field.setAttribute('aria-describedby', `${describedBy} ${errEl.id}`.trim());
  }
  errEl.textContent = msg;
}

function clearFieldError(field) {
  field.classList.remove('field-error');
  field.removeAttribute('aria-invalid');
  const errEl = field.parentElement.querySelector('.field-error-msg');
  if (errEl) {
    const describedBy = (field.getAttribute('aria-describedby') || '')
      .split(' ')
      .filter(id => id && id !== errEl.id)
      .join(' ');
    if (describedBy) field.setAttribute('aria-describedby', describedBy);
    else field.removeAttribute('aria-describedby');
    errEl.remove();
  }
}

if (form && successEl) {
  // Clear errors on input
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => clearFieldError(el));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.intake-submit');

    const nameEl     = form.querySelector('#intake-name');
    const emailEl    = form.querySelector('#intake-email');
    const problemEl  = form.querySelector('#intake-problem');

    const name    = nameEl.value.trim();
    const email   = emailEl.value.trim();
    const problem = problemEl.value.trim();

    // Clear prior errors
    [nameEl, emailEl, problemEl].forEach(clearFieldError);

    let hasError = false;

    if (!name) {
      showFieldError(nameEl, 'Name is required');
      hasError = true;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showFieldError(emailEl, 'Email is required');
      hasError = true;
    } else if (!emailRe.test(email)) {
      showFieldError(emailEl, 'Enter a valid email address');
      hasError = true;
    }

    if (!problem) {
      showFieldError(problemEl, 'Tell us what you are building or fixing');
      hasError = true;
    }

    if (hasError) {
      // Focus the first error field
      const first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }

    btn.setAttribute('aria-busy', 'true');
    btn.textContent = 'Sending…';

    // Simulate async send (replace with real endpoint as needed)
    await new Promise(r => setTimeout(r, 900));

    form.hidden = true;
    successEl.hidden = false;
    successEl.focus();
  });
}
