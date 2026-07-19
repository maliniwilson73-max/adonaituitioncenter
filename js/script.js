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

  /* Sticky nav + adaptive colour theme + back-to-top */
  const nav = $('#nav');
  const toTop = $('#toTop');
  const navSections = $$('main > section, footer');

  // Inverse scheme: over a DARK section → WHITE bar (.navbar-light);
  // over a LIGHT section → DARK-BLUE bar (.navbar-dark).
  const applyNavTheme = (sectionDark) => {
    if (!nav) return;
    nav.classList.toggle('navbar-light', sectionDark);
    nav.classList.toggle('navbar-dark', !sectionDark);
  };
  let navThemeIO = null;
  const buildNavThemeObserver = () => {
    if (!nav || !('IntersectionObserver' in window) || !navSections.length) return;
    if (navThemeIO) navThemeIO.disconnect();
    const navH = nav.offsetHeight;
    const bottom = Math.max(0, window.innerHeight - navH - 1);
    // Root shrinks to a 1px line just below the navbar → only the section under
    // the navbar reports as intersecting.
    navThemeIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) applyNavTheme(en.target.dataset.nav === 'dark'); });
    }, { rootMargin: `-${navH}px 0px -${bottom}px 0px`, threshold: 0 });
    navSections.forEach((s) => navThemeIO.observe(s));
  };

  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 60);
    if (toTop) toTop.classList.toggle('show', y > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  buildNavThemeObserver();
  let navRz; window.addEventListener('resize', () => { clearTimeout(navRz); navRz = setTimeout(buildNavThemeObserver, 200); }, { passive: true });
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
    // Multi-select subjects — valid when at least one option is selected
    const ms = field.querySelector('[data-multiselect]');
    if (ms) {
      const ok = ms.querySelectorAll('.ms-option.selected').length > 0;
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

    /* Subjects multi-select dropdown (chips + exclusive "All Subjects") */
    const ms = form.querySelector('[data-multiselect]');
    let resetGroup = null;
    if (ms) {
      const control = ms.querySelector('.ms-control');
      const chipsWrap = ms.querySelector('.ms-chips');
      const placeholder = ms.querySelector('.ms-placeholder');
      const options = Array.from(ms.querySelectorAll('.ms-option'));
      const msField = ms.closest('.field');
      const selected = new Set();

      const toggle = (v, force) => {
        const willSelect = (force !== undefined) ? force : !selected.has(v);
        if (willSelect) {
          if (v === 'All Subjects') { selected.clear(); selected.add(v); }   // exclusive
          else { selected.delete('All Subjects'); selected.add(v); }         // individual clears "All"
        } else { selected.delete(v); }
        render();
      };
      const render = () => {
        chipsWrap.querySelectorAll('.ms-chip').forEach(c => c.remove());
        placeholder.style.display = selected.size ? 'none' : '';
        options.forEach(opt => {
          const v = opt.dataset.value, on = selected.has(v);
          opt.classList.toggle('selected', on);
          opt.setAttribute('aria-selected', on ? 'true' : 'false');
          if (on) {
            const chip = document.createElement('span');
            chip.className = 'ms-chip';
            const t = document.createElement('span'); t.textContent = v; chip.appendChild(t);
            const x = document.createElement('button');
            x.type = 'button'; x.className = 'ms-chip-x'; x.setAttribute('aria-label', 'Remove ' + v); x.innerHTML = '&times;';
            x.addEventListener('click', (e) => { e.stopPropagation(); toggle(v, false); });
            chip.appendChild(x);
            chipsWrap.appendChild(chip);
          }
        });
        if (msField.classList.contains('invalid')) validateField(msField);
      };

      const open = () => { ms.classList.add('open'); control.setAttribute('aria-expanded', 'true'); };
      const close = () => { ms.classList.remove('open'); control.setAttribute('aria-expanded', 'false'); };
      control.addEventListener('click', (e) => {
        if (e.target.closest('.ms-chip-x')) return;
        ms.classList.contains('open') ? close() : open();
      });
      control.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); options[0].focus(); }
        else if (e.key === 'Escape') close();
      });
      options.forEach((opt, i) => {
        opt.setAttribute('tabindex', '-1');
        opt.addEventListener('click', () => toggle(opt.dataset.value));
        opt.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(opt.dataset.value); }
          else if (e.key === 'ArrowDown') { e.preventDefault(); (options[i + 1] || options[0]).focus(); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); (options[i - 1] || options[options.length - 1]).focus(); }
          else if (e.key === 'Escape' || e.key === 'Tab') { close(); control.focus(); }
        });
      });
      document.addEventListener('click', (e) => { if (!ms.contains(e.target)) close(); });

      resetGroup = () => { selected.clear(); render(); close(); };
      render();
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
          if (ms) {
            const picked = Array.from(ms.querySelectorAll('.ms-option.selected')).map(o => o.dataset.value);
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
