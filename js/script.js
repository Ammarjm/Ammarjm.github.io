/* =========================================================
   Ammar Alsabateen — Portfolio interactions
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  /* ---------- Theme toggle (dark is default) ---------- */
  var themeBtn = document.getElementById('theme-toggle');
  var metaTheme = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var next = theme === 'dark' ? 'light' : 'dark';
    themeBtn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#0b0d12' : '#f7f8fb');
  }

  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  themeBtn.addEventListener('click', function () {
    var theme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    try { localStorage.setItem('theme', theme); } catch (e) { /* storage unavailable */ }
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menu-toggle');
  var navLinks = document.getElementById('nav-links');

  function setMenu(open) {
    navLinks.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  menuBtn.addEventListener('click', function () {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });
  document.addEventListener('click', function (e) {
    if (navLinks.classList.contains('open') && !e.target.closest('.nav')) setMenu(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) setMenu(false);
  });

  /* ---------- Header border on scroll ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal with gentle stagger ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  // Stagger siblings inside grids/timelines
  document.querySelectorAll('.skills-grid, .projects-grid, .services-grid, .timeline, .hero-inner').forEach(function (group) {
    group.querySelectorAll(':scope > .reveal').forEach(function (el, i) {
      el.style.setProperty('--delay', (i * 0.08) + 's');
    });
  });

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Active nav link ---------- */
  var links = navLinks.querySelectorAll('a[href^="#"]');
  var sections = Array.prototype.map.call(links, function (a) {
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);

  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        links.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Contact form (no backend: opens email client) ---------- */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  var RECIPIENT = 'alsabateenammar@gmail.com';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;

    ['name', 'email', 'message'].forEach(function (id) {
      var input = form.elements[id];
      var ok = input.value.trim() !== '' && (id !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()));
      input.parentElement.classList.toggle('invalid', !ok);
      if (!ok) valid = false;
    });

    if (!valid) {
      status.textContent = 'Please fill in your name, a valid email and a message.';
      status.classList.add('error');
      return;
    }

    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var subject = form.elements.subject.value.trim() || 'Portfolio enquiry from ' + name;
    var body = form.elements.message.value.trim() + '\n\n— ' + name + ' (' + email + ')';

    window.location.href = 'mailto:' + RECIPIENT +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    status.classList.remove('error');
    status.textContent = 'Opening your email app… Thanks for reaching out!';
    form.reset();
  });

  form.addEventListener('input', function (e) {
    if (e.target.parentElement) e.target.parentElement.classList.remove('invalid');
  });

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
