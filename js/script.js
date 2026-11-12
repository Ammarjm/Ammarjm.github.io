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

  /* ---------- Contact form ----------
     On Netlify the message is sent to Netlify Forms (stored + emailed).
     Elsewhere (e.g. GitHub Pages) it falls back to the visitor's email app. */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  var submitBtn = form.querySelector('button[type="submit"]');
  var RECIPIENT = 'alsabateenammar@gmail.com';
  var ON_NETLIFY = /\.netlify\.app$/.test(location.hostname);

  function mailtoHref(name, email, subject, message) {
    return 'mailto:' + RECIPIENT +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
  }

  function setStatus(text, isError) {
    status.textContent = text;
    status.classList.toggle('error', !!isError);
  }

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
    var message = form.elements.message.value.trim();

    if (!ON_NETLIFY || !window.fetch) {
      window.location.href = mailtoHref(name, email, subject, message);
      setStatus('Opening your email app… Thanks for reaching out!');
      form.reset();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    setStatus('');

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      setStatus('Thanks, ' + name + '! Your message has been sent — I’ll get back to you soon.');
      form.reset();
    }).catch(function () {
      status.classList.add('error');
      status.innerHTML = 'Sorry, the message could not be sent. Please email me directly at ' +
        '<a href="' + mailtoHref(name, email, subject, message) + '">' + RECIPIENT + '</a>.';
    }).then(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    });
  });

  form.addEventListener('input', function (e) {
    if (e.target.parentElement) e.target.parentElement.classList.remove('invalid');
  });

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
