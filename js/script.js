/* Aadil Abdullah — Portfolio
   No dependencies. Everything degrades gracefully if this file fails to load. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js-loaded'); // tells the page this script is running
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
     Theme: dark by default, remembered per visitor
  --------------------------------------------------------------- */
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var toggle = document.getElementById('themeToggle');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#f3f5ff' : '#000521');
    if (toggle) {
      toggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    }
  }

  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }

      if (!document.startViewTransition || reduceMotion) {
        applyTheme(next);
        return;
      }

      // The new theme grows out of the button as a circle
      var rect = toggle.getBoundingClientRect();
      var x = rect.left + rect.width / 2;
      var y = rect.top + rect.height / 2;
      var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

      var transition = document.startViewTransition(function () { applyTheme(next); });
      transition.ready.then(function () {
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 650, easing: 'cubic-bezier(0.65, 0, 0.25, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(function () { /* transition skipped */ });
    });
  }

  /* ---------------------------------------------------------------
     Header: transparent over the hero, solid everywhere else
  --------------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  var hero = document.querySelector('.hero');

  if (header) {
    if (!hero) {
      header.classList.add('is-solid');
    } else {
      var ticking = false;
      var updateHeader = function () {
        header.classList.toggle('is-solid', window.scrollY > hero.offsetHeight - header.offsetHeight - 12);
        ticking = false;
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(updateHeader); }
      }, { passive: true });
      updateHeader();
    }
  }

  /* ---------------------------------------------------------------
     Mobile menu
  --------------------------------------------------------------- */
  var menuBtn = document.getElementById('menuBtn');
  var menu = document.getElementById('mobileMenu');

  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (header) header.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    if (open) {
      var first = menu.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    }
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      setMenu(!menu.classList.contains('is-open'));
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setMenu(false);
        menuBtn.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 820 && menu.classList.contains('is-open')) setMenu(false);
    });
  }

  /* ---------------------------------------------------------------
     Hero: load sequence + background loop
  --------------------------------------------------------------- */
  function ready() { root.classList.add('is-ready'); }
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 900); })]).then(function () {
    requestAnimationFrame(ready);
  });

  var loop = document.querySelector('.hero-video');
  if (loop) {
    if (reduceMotion) {
      loop.removeAttribute('autoplay');
      loop.pause();
    } else {
      loop.addEventListener('playing', function () { loop.classList.add('is-playing'); }, { once: true });
      var p = loop.play();
      if (p && p.catch) p.catch(function () { /* autoplay blocked: the poster stays */ });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          var visible = entries[0].isIntersecting;
          if (visible) { var q = loop.play(); if (q && q.catch) q.catch(function () {}); }
          else loop.pause();
        }).observe(loop);
      }
    }
  }

  /* ---------------------------------------------------------------
     Scroll-triggered bits: image reveal + stat counters.
     Plain position checks (no observers), so nothing can stay hidden.
  --------------------------------------------------------------- */
  var pending = [];
  var queued = false;

  function inView(el) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh * 0.92 && r.bottom > 0;
  }
  function check() {
    queued = false;
    pending = pending.filter(function (item) {
      if (!inView(item.el)) return true;
      item.run(item.el);
      return false;
    });
  }
  function queueCheck() {
    if (!queued) { queued = true; requestAnimationFrame(check); }
  }
  function watch(el, run) { pending.push({ el: el, run: run }); }

  window.addEventListener('scroll', queueCheck, { passive: true });
  window.addEventListener('resize', queueCheck);
  window.addEventListener('load', queueCheck);
  window.addEventListener('hashchange', queueCheck);

  document.querySelectorAll('.reveal-img').forEach(function (el) {
    if (reduceMotion) el.classList.add('is-in');
    else watch(el, function (node) { node.classList.add('is-in'); });
  });

  if (!reduceMotion) {
    document.querySelectorAll('.count').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      el.textContent = '0';
      watch(el, function (node) {
        var start = performance.now();
        var duration = 1100;
        (function step(now) {
          var t = Math.min((now - start) / duration, 1);
          node.textContent = Math.round((1 - Math.pow(1 - t, 3)) * target);
          if (t < 1) requestAnimationFrame(step);
        })(start);
      });
    });
  }

  check();
  setTimeout(check, 500);
  setTimeout(check, 1500);

  /* ---------------------------------------------------------------
     Project filter (re-flows the wide / narrow rhythm)
  --------------------------------------------------------------- */
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile'));
  var filters = document.querySelectorAll('.filter');

  function layoutTiles() {
    var i = 0;
    tiles.forEach(function (tile) {
      if (tile.hidden) return;
      tile.setAttribute('data-size', (i % 4 === 0 || i % 4 === 3) ? 'wide' : 'narrow');
      i++;
    });
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-filter');
      filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });

      tiles.forEach(function (tile) {
        tile.hidden = !(value === 'all' || tile.getAttribute('data-category') === value);
      });
      layoutTiles();
      queueCheck();

      if (!reduceMotion) {
        tiles.filter(function (t) { return !t.hidden; }).forEach(function (tile, index) {
          tile.animate(
            [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }],
            { duration: 550, delay: index * 70, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'backwards' }
          );
        });
      }
    });
  });
  layoutTiles();

  /* ---------------------------------------------------------------
     Contact form (Formspree)
  --------------------------------------------------------------- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  var submit = document.getElementById('formBtn');

  if (form && status && submit) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.classList.remove('is-error');
      status.textContent = '';
      submit.disabled = true;
      submit.textContent = 'Sending…';

      fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          status.textContent = 'Thanks, your message is on its way. I’ll reply soon.';
          form.reset();
          return;
        }
        return response.json().then(function (result) {
          status.classList.add('is-error');
          status.textContent = result && result.errors
            ? result.errors.map(function (err) { return err.message; }).join(', ')
            : 'Something went wrong sending your message. Please try again.';
        });
      }).catch(function () {
        status.classList.add('is-error');
        status.textContent = 'Network problem. Please try again, or email me directly.';
      }).then(function () {
        submit.disabled = false;
        submit.textContent = 'Send message';
      });
    });
  }
})();
