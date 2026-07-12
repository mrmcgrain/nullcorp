// Year
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

// Sticky header on scroll
const header = document.getElementById('site-header');
if (header) {
  const onScroll = () => {
    header.style.background = scrollY > 10
      ? 'rgba(8,9,8,.95)'
      : 'rgba(8,9,8,.7)';
  };
  addEventListener('scroll', onScroll, { passive: true });
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

function showFieldError(field, msg) {
  field.classList.add('field-error');
  field.setAttribute('aria-invalid', 'true');
  // Insert error message if not already present
  let errEl = field.parentElement.querySelector('.field-error-msg');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'field-error-msg';
    errEl.setAttribute('role', 'alert');
    field.parentElement.appendChild(errEl);
  }
  errEl.textContent = msg;
}

function clearFieldError(field) {
  field.classList.remove('field-error');
  field.removeAttribute('aria-invalid');
  const errEl = field.parentElement.querySelector('.field-error-msg');
  if (errEl) errEl.remove();
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
