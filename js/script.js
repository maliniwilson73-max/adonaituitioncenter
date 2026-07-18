/* ==========================================================================
   Adonai Tuition Center — Single-Page JavaScript
   Loader · sticky nav · mobile menu · scrollspy · counters · reveal ·
   form validation · back-to-top
   ========================================================================== */
(function () {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* Loader */
  window.addEventListener('load', () => {
    const l = $('#loader');
    if (l) setTimeout(() => l.classList.add('hide'), 300);
  });

  /* Sticky nav + back-to-top */
  const nav = $('#nav');
  const toTop = $('#toTop');
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('solid', y > 60);
    if (toTop) toTop.classList.toggle('show', y > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop && toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* Mobile menu */
  const toggle = $('#navToggle');
  const links = $('#navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      toggle.innerHTML = open ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-list"></i>';
    });
    links.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<i class="bi bi-list"></i>';
      }
    });
  }

  /* Scrollspy — highlight active nav link */
  const sections = $$('section[id]');
  const navAnchors = $$('#navLinks a[href^="#"]');
  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const id = en.target.getAttribute('id');
          navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* Reveal on scroll */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  } else { reveals.forEach(el => el.classList.add('visible')); }

  /* Animated counters */
  const counters = $$('[data-count]');
  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1600, start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const val = target * (1 - Math.pow(1 - p, 3));
      el.textContent = Math.round(val) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { run(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  } else { counters.forEach(run); }

  /* Form validation */
  const validators = {
    required: (v) => v.trim() !== '',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    phone: (v) => /^[+]?[\d\s\-()]{7,15}$/.test(v.trim()),
    name: (v) => /^[a-zA-ZÀ-ɏ .'-]{2,}$/.test(v.trim())
  };
  const validateField = (field) => {
    // Checkbox group (e.g. Subjects) — valid when at least one box is checked
    const group = field.querySelector('[data-checkgroup]');
    if (group) {
      const ok = group.querySelectorAll('input[type="checkbox"]:checked').length > 0;
      field.classList.toggle('invalid', !ok);
      return ok;
    }
    const input = field.querySelector('input, select, textarea');
    if (!input) return true;
    const rules = (input.dataset.validate || '').split(' ').filter(Boolean);
    // Optional fields (no "required" rule) are valid when left empty
    if (input.value.trim() === '' && !rules.includes('required')) { field.classList.remove('invalid'); return true; }
    let ok = true;
    for (const r of rules) { if (validators[r] && !validators[r](input.value)) { ok = false; break; } }
    field.classList.toggle('invalid', !ok);
    return ok;
  };
  $$('form[data-validate-form]').forEach(form => {
    const fields = $$('.field', form);
    fields.forEach(f => {
      const input = f.querySelector('input, select, textarea');
      input && input.addEventListener('blur', () => validateField(f));
      input && input.addEventListener('input', () => { if (f.classList.contains('invalid')) validateField(f); });
    });

    /* Subjects checkbox group + "All Subjects" logic */
    const group = form.querySelector('[data-checkgroup]');
    let resetGroup = null;
    if (group) {
      const groupField = group.closest('.field');
      const allBox = group.querySelector('input[data-all]');
      const boxes = Array.from(group.querySelectorAll('input[type="checkbox"]')).filter(cb => cb !== allBox);
      // When "All Subjects" is checked: check + disable the individual boxes; when unchecked: re-enable them
      const applyAll = () => boxes.forEach(cb => { cb.disabled = allBox.checked; if (allBox.checked) cb.checked = true; });
      allBox.addEventListener('change', () => { applyAll(); validateField(groupField); });
      boxes.forEach(cb => cb.addEventListener('change', () => {
        allBox.checked = boxes.every(x => x.checked);   // auto-check "All" when every subject is picked
        applyAll();
        validateField(groupField);
      }));
      resetGroup = () => { allBox.checked = false; boxes.forEach(cb => { cb.checked = false; cb.disabled = false; }); };
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      fields.forEach(f => { if (!validateField(f)) ok = false; });
      if (ok) {
        // Compose the enquiry and open WhatsApp to the centre's number
        if (form.querySelector('#cname')) {
          const val = (id) => { const el = form.querySelector('#' + id); return el ? el.value.trim() : ''; };
          let subj = '-';
          if (group) {
            const picked = Array.from(group.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value);
            subj = picked.includes('All Subjects') ? 'All Subjects' : (picked.join(', ') || '-');
          }
          const msg = [
            '*New Enquiry - Adonai Tuition Center*',
            'Student: ' + val('cname'),
            'Parent/Guardian: ' + val('cparent'),
            'Program: ' + val('cprogram'),
            'Class: ' + val('cclass'),
            'Subjects: ' + subj,
            'School: ' + (val('cschool') || '-'),
            'Student Phone: ' + (val('cstudentphone') || '-'),
            'Parent Phone: ' + val('cphone')
          ].join('\n');
          window.open('https://wa.me/919841563747?text=' + encodeURIComponent(msg), '_blank', 'noopener');
        }
        const s = $('.form-success', form);
        if (s) { s.classList.add('show'); s.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        form.reset();
        resetGroup && resetGroup();
        setTimeout(() => s && s.classList.remove('show'), 6000);
      } else {
        const first = $('.field.invalid', form);
        first && first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const fi = first && first.querySelector('input, select, textarea');
        fi && fi.focus();
      }
    });
  });

  /* Footer year */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
