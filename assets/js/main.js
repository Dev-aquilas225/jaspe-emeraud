/*!
 * Jaspe-Émeraude Group — motion engine v3 (assets/js/main.js)
 * « Poli pour l’excellence ». Vanilla, no dependencies.
 * Owner: foundation A3. Page agents: DO NOT EDIT — use the data-attributes and
 * the window.JEG API documented in docs/design-system.md.
 *
 * Public API
 *   window.JEG.refresh(root?)  re-scan [data-reveal] [data-split] [data-fill] [data-count]
 *                              [data-parallax] [data-draw] [data-stagger] .marquee inside root
 *   window.JEG.isReady         true once the loader / page transition has finished
 *   window.JEG.scrollTo(target, {offset}) eased scroll to an element / y (respects reduced motion)
 *   window.JEG.navigate(url)   leave the page with the curtain transition
 *   window.JEG.closeMenus()    close mega-menu + mobile menu
 * Events
 *   document 'jeg:ready'  dispatched once when the intro (loader / curtain) is done
 *   document 'jeg:lang'   (dispatched by app.js) → fills / measures / [data-count] numbers
 *                         (FR "50 000" ↔ EN "50,000") are refreshed
 */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var win = window;
  var JEG = (win.JEG = win.JEG || {});
  JEG.isReady = false;

  /* ------------------------------------------------------------------ utils */
  var mqReduce = win.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = win.matchMedia('(hover: hover) and (pointer: fine)');
  var mqDesktopNav = win.matchMedia('(min-width: 1100px)');
  function reduced() { return mqReduce.matches; }
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function scope(ctx, sel) {
    ctx = ctx || doc;
    var list = $$(sel, ctx);
    if (ctx !== doc && ctx.matches && ctx.matches(sel)) list.unshift(ctx);
    return list;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function isEn() { return root.classList.contains('lang-en'); }
  function raf(fn) { return win.requestAnimationFrame(fn); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function store(type, key, val) {
    try {
      var s = win[type];
      if (val === undefined) return s.getItem(key);
      s.setItem(key, val);
    } catch (e) { /* storage blocked */ }
    return null;
  }
  function headerH() {
    var v = parseFloat(getComputedStyle(root).getPropertyValue('--header-h'));
    return isNaN(v) ? 84 : v;
  }
  /* language roots: split .fr / .en separately so each language staggers from 0 */
  function langTargets(el) {
    var t = $$('.fr, .en', el).filter(function (n) {
      var p = n.parentElement;
      while (p && p !== el) { if (p.classList.contains('fr') || p.classList.contains('en')) return false; p = p.parentElement; }
      return true;
    });
    return t.length ? t : [el];
  }
  var WS = /([ \t\n\r\f]+)/; /* split on breaking whitespace only — keeps U+00A0 / U+202F glued */

  /* ---------------------------------------------------------- scroll loop */
  var vh = win.innerHeight;
  var vw = win.innerWidth;
  var docH = root.scrollHeight;
  var lastY = win.scrollY;
  var ticking = false;
  var scrollSubs = [];
  function onScroll() { if (!ticking) { ticking = true; raf(runScroll); } }
  function runScroll() {
    ticking = false;
    var y = win.scrollY;
    for (var i = 0; i < scrollSubs.length; i++) scrollSubs[i](y, lastY);
    lastY = y;
  }
  win.addEventListener('scroll', onScroll, { passive: true });
  var resizeT;
  win.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () { vh = win.innerHeight; vw = win.innerWidth; docH = root.scrollHeight; runScroll(); }, 120);
  }, { passive: true });
  if ('ResizeObserver' in win) {
    new ResizeObserver(function () { docH = root.scrollHeight; }).observe(doc.body);
  }

  /* --------------------------------------------------------------- header */
  function initHeader() {
    var header = $('[data-header]');
    if (!header) return;
    scrollSubs.push(function (y, prev) {
      header.classList.toggle('is-scrolled', y > 24);
      var locked = root.classList.contains('menu-open') || root.classList.contains('mega-open') ||
        (header.contains(doc.activeElement) && doc.activeElement.matches(':focus-visible'));
      if (locked) { header.classList.remove('is-hidden'); return; }
      if (y > prev + 3 && y > Math.max(240, vh * 0.4)) header.classList.add('is-hidden');
      else if (y < prev - 3 || y < 140) header.classList.remove('is-hidden');
    });
    header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });
  }

  /* ---------------------------------------------------- progress + to-top */
  function initProgress() {
    var bar = $('.scroll-progress');
    var top = $('[data-to-top]');
    scrollSubs.push(function (y) {
      var max = docH - vh;
      var p = max > 0 ? clamp(y / max, 0, 1) : 0;
      if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      if (top) {
        top.classList.toggle('is-visible', y > vh * 1.1);
        top.style.setProperty('--p-off', (1 - p).toFixed(4));
      }
    });
    if (top) top.addEventListener('click', function () {
      scrollToY(0, function () {
        var m = $('#main');
        if (m) m.focus({ preventScroll: true });
      });
    });
  }

  /* --------------------------------------------------------- smooth scroll */
  var scrollAnim = 0;
  function cancelScrollAnim() { if (scrollAnim) { win.cancelAnimationFrame(scrollAnim); scrollAnim = 0; } }
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { win.addEventListener(ev, cancelScrollAnim, { passive: true }); });
  function scrollToY(y, done) {
    cancelScrollAnim();
    y = clamp(y, 0, Math.max(0, root.scrollHeight - win.innerHeight));
    var from = win.scrollY;
    var dist = y - from;
    if (reduced() || Math.abs(dist) < 2) { win.scrollTo(0, y); if (done) done(); return; }
    var dur = clamp(Math.abs(dist) * 0.45, 650, 1500);
    var t0 = performance.now();
    function step(now) {
      var t = clamp((now - t0) / dur, 0, 1);
      win.scrollTo(0, from + dist * easeInOutCubic(t));
      if (t < 1) scrollAnim = raf(step); else { scrollAnim = 0; if (done) done(); }
    }
    scrollAnim = raf(step);
  }
  function scrollToEl(el, opts) {
    if (!el) return;
    opts = opts || {};
    var sm = parseFloat(getComputedStyle(el).scrollMarginTop);
    var off = opts.offset != null ? opts.offset : (isNaN(sm) || sm === 0 ? headerH() + 24 : sm);
    var y = el.getBoundingClientRect().top + win.scrollY - off;
    scrollToY(y, function () {
      if (opts.focus) {
        if (!el.hasAttribute('tabindex') && !el.matches('a,button,input,select,textarea')) el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      }
    });
  }
  JEG.scrollTo = function (target, opts) {
    if (typeof target === 'number') scrollToY(target);
    else scrollToEl(typeof target === 'string' ? $(target) : target, opts);
  };

  /* ------------------------------------------------------------ mega-menu */
  var megaApi = { close: function () {} };
  function initMega() {
    var trigger = $('[data-mega-trigger]');
    var panel = $('[data-mega]');
    var backdrop = $('[data-nav-backdrop]');
    var header = $('[data-header]');
    if (!trigger || !panel) return;
    var item = trigger.parentElement;
    var open = false, tOpen = 0, tClose = 0, hideT = 0, openedAt = 0;
    var previews = $$('[data-mega-img]', panel);
    var links = $$('.mega__item', panel);

    function setPreview(i) {
      previews.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-mega-img') === String(i)); });
    }
    function show() {
      clearTimeout(tClose); clearTimeout(hideT);
      if (open) return;
      open = true; openedAt = performance.now();
      panel.hidden = false;
      if (backdrop) backdrop.hidden = false;
      void panel.offsetHeight;
      root.classList.add('mega-open');
      if (header) header.classList.remove('is-hidden');
      raf(function () {
        panel.classList.add('is-open');
        if (backdrop) backdrop.classList.add('is-visible');
      });
      trigger.setAttribute('aria-expanded', 'true');
    }
    function hide(focusBack) {
      clearTimeout(tOpen);
      if (!open) return;
      open = false;
      panel.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-visible');
      trigger.setAttribute('aria-expanded', 'false');
      root.classList.remove('mega-open');
      hideT = setTimeout(function () { if (!open) { panel.hidden = true; if (backdrop) backdrop.hidden = true; } }, reduced() ? 0 : 720);
      if (focusBack) trigger.focus();
    }
    megaApi.close = function () { hide(false); };

    trigger.addEventListener('click', function () {
      if (open && performance.now() - openedAt > 450) hide(false); else show();
    });
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); show(); setTimeout(function () { if (links[0]) links[0].focus(); }, 60); }
    });
    item.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || !mqFine.matches) return;
      clearTimeout(tClose); tOpen = setTimeout(show, 90);
    });
    item.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse' || !mqFine.matches) return;
      clearTimeout(tOpen); tClose = setTimeout(function () { hide(false); }, 280);
    });
    item.addEventListener('focusout', function (e) {
      if (open && e.relatedTarget && !item.contains(e.relatedTarget)) hide(false);
    });
    panel.addEventListener('keydown', function (e) {
      var i = links.indexOf(doc.activeElement);
      if (i < 0) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); links[(i + 1) % links.length].focus(); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
    });
    links.forEach(function (a) {
      var idx = a.getAttribute('data-mega-index');
      a.addEventListener('pointerenter', function () { setPreview(idx); });
      a.addEventListener('focus', function () { setPreview(idx); });
    });
    if (backdrop) backdrop.addEventListener('click', function () { hide(false); });
    doc.addEventListener('keydown', function (e) {
      if (open && e.key === 'Escape') { e.preventDefault(); hide(true); }
    });
    doc.addEventListener('pointerdown', function (e) {
      if (open && !item.contains(e.target)) hide(false);
    });
    mqDesktopNav.addEventListener('change', function () { hide(false); });
  }

  /* ---------------------------------------------------------- mobile menu */
  var menuApi = { close: function () {} };
  function initMobileMenu() {
    var btn = $('[data-menu-toggle]');
    var menu = $('[data-mobile-menu]');
    var header = $('[data-header]');
    if (!btn || !menu) return;
    var open = false, hideT = 0;

    function focusables() {
      var inHeader = header ? $$('.site-header__tools button, .brand', header) : [];
      var inMenu = $$('a[href], button:not([disabled])', menu);
      return inHeader.concat(inMenu).filter(function (el) {
        return el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
      });
    }
    function openMenu() {
      if (open) return;
      open = true;
      clearTimeout(hideT);
      megaApi.close();
      menu.hidden = false;
      void menu.offsetHeight;
      root.classList.add('menu-open');
      menu.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', isEn() ? 'Close menu' : 'Fermer le menu');
      setTimeout(function () {
        var first = $('a[href]', menu);
        if (open && first) first.focus({ preventScroll: true });
      }, reduced() ? 0 : 420);
    }
    function closeMenu(returnFocus) {
      if (!open) return;
      open = false;
      menu.classList.remove('is-open');
      root.classList.remove('menu-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Menu');
      hideT = setTimeout(function () { if (!open) menu.hidden = true; }, reduced() ? 0 : 780);
      if (returnFocus) btn.focus({ preventScroll: true });
    }
    menuApi.close = function () { closeMenu(false); };
    btn.addEventListener('click', function () { if (open) closeMenu(true); else openMenu(); });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a[href], .js-reg, [data-close-menu]')) closeMenu(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); return; }
      if (e.key !== 'Tab') return;
      var f = focusables();
      if (!f.length) return;
      var i = f.indexOf(doc.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && (i === f.length - 1 || i === -1)) { e.preventDefault(); f[0].focus(); }
    });
    mqDesktopNav.addEventListener('change', function (e) { if (e.matches) closeMenu(false); });
  }
  JEG.closeMenus = function () { megaApi.close(); menuApi.close(); };

  /* ------------------------------------------------- current page in nav */
  function currentFile() {
    var f = decodeURIComponent(location.pathname.split('/').pop() || '');
    if (!f) return 'index.html';
    if (f.indexOf('.') === -1) f += '.html';
    return f;
  }
  function markCurrent() {
    var file = currentFile();
    $$('.site-header a[href], .mobile-menu a[href], .site-footer a[href]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || /^[a-z]+:/i.test(href) || href.indexOf('#') > -1) return;
      var f = href.split('?')[0].split('/').pop() || 'index.html';
      if (f.indexOf('.') === -1) f += '.html';
      if (f === file && !a.hasAttribute('aria-current') && !a.classList.contains('brand')) a.setAttribute('aria-current', 'page');
    });
    if (['training.html', 'langues.html', 'shopping.html', 'english-camp.html', 'editions.html'].indexOf(file) > -1) {
      var t = $('[data-mega-trigger]');
      if (t) t.classList.add('is-current');
    }
  }

  /* --------------------------------------------------------- split text */
  function splitInto(el, mode, cls) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (k) {
        if (k.nodeType === 3) {
          var parts = k.textContent.split(WS);
          if (parts.length === 1 && !parts[0]) return;
          var frag = doc.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (WS.test(p) && !p.trim()) { frag.appendChild(doc.createTextNode(' ')); return; }
            if (cls) { /* fill words */
              var fw = doc.createElement('span');
              fw.className = cls; fw.textContent = p; frag.appendChild(fw); return;
            }
            var w = doc.createElement('span');
            w.className = 'split-w';
            if (mode === 'chars') {
              Array.from(p).forEach(function (ch) {
                var c = doc.createElement('span');
                c.className = 'split-c'; c.style.setProperty('--i', i++); c.textContent = ch; w.appendChild(c);
              });
            } else {
              var inner = doc.createElement('span');
              inner.className = 'split-i'; inner.style.setProperty('--i', i++); inner.textContent = p; w.appendChild(inner);
            }
            frag.appendChild(w);
          });
          node.replaceChild(frag, k);
        } else if (k.nodeType === 1 && k.tagName !== 'BR' && !(k instanceof SVGElement) && !k.classList.contains('split-w') && !k.classList.contains('sr-only')) {
          walk(k);
        }
      });
    })(el);
  }
  function prepSplit(el) {
    if (el.hasAttribute('data-split-done')) return;
    el.setAttribute('data-split-done', '');
    var mode = el.getAttribute('data-split') === 'chars' ? 'chars' : 'words';
    langTargets(el).forEach(function (t) { splitInto(t, mode); });
    var d = parseFloat(el.getAttribute('data-delay'));
    if (d) el.style.setProperty('--delay', d + 'ms');
    if (reduced()) el.classList.add('is-in');
  }

  /* --------------------------------------------------------------- fill */
  var fills = [];
  function prepFill(el) {
    if (el._jegFill) return;
    var groups = langTargets(el).map(function (t) { splitInto(t, 'words', 'fill-w'); return $$('.fill-w', t); });
    el._jegFill = { el: el, groups: groups };
    fills.push(el._jegFill);
    el._jegSet = activeFills;
    if (activeIO) activeIO.observe(el); else activeFills.add(el);
  }
  var activeFills = new Set();
  function updateFills() {
    if (!activeFills.size) return;
    activeFills.forEach(function (el) {
      var f = el._jegFill;
      var r = el.getBoundingClientRect();
      var start = vh * 0.88, end = vh * 0.42;
      var p = reduced() ? 1 : clamp((start - r.top) / (r.height + (start - end)), 0, 1);
      f.groups.forEach(function (words) {
        var n = words.length, lit = p * (n + 6) - 3;
        for (var i = 0; i < n; i++) {
          var o = clamp(lit - i, 0, 1);
          var op = (0.16 + 0.84 * o).toFixed(3);
          if (words[i]._o !== op) { words[i]._o = op; words[i].style.opacity = op; }
        }
      });
    });
  }

  /* ------------------------------------------------------------ parallax */
  var activeParallax = new Set();
  function prepParallax(el) {
    if (el._jegPlx) return;
    el._jegPlx = true;
    el._jegSet = activeParallax;
    if (activeIO) activeIO.observe(el); else activeParallax.add(el);
  }
  function updateParallax() {
    if (!activeParallax.size || reduced()) return;
    var reads = [];
    activeParallax.forEach(function (el) {
      var inMedia = el.parentElement && el.parentElement.classList.contains('media');
      var r = inMedia ? el.parentElement.getBoundingClientRect() : el.getBoundingClientRect();
      var top = inMedia ? r.top : r.top - (el._py || 0);
      var f = parseFloat(el.getAttribute('data-parallax'));
      if (isNaN(f)) f = 0.12;
      var max = inMedia ? r.height * 0.075 : 180;
      var y = clamp(-((top + r.height / 2) - vh / 2) * f, -max, max);
      reads.push([el, y]);
    });
    reads.forEach(function (p) {
      p[0]._py = p[1];
      p[0].style.translate = '0 ' + p[1].toFixed(2) + 'px';
    });
  }

  /* -------------------------------------------------------------- draw */
  var activeDraw = new Set();
  function prepDraw(el) {
    if (el._jegDraw) return;
    var scrub = el.getAttribute('data-draw') === 'scrub';
    var isSvg = el instanceof SVGElement;
    var shapes = isSvg ? (el.matches('path,line,polyline,polygon,circle,rect,ellipse') ? [el] : $$('path,line,polyline,polygon,circle,rect,ellipse', el)) : [];
    var d = parseFloat(el.getAttribute('data-delay'));
    el._jegDraw = { scrub: scrub, shapes: [], html: !isSvg };
    if (d) el.style.setProperty('--delay', d + 'ms');
    shapes.forEach(function (s, i) {
      var len = 0;
      try { len = s.getTotalLength(); } catch (e) { len = 0; }
      if (!len) return;
      len = Math.ceil(len) + 1;
      s.style.strokeDasharray = len + ' ' + len;
      s.style.strokeDashoffset = reduced() ? 0 : len;
      s.style.setProperty('--i', i);
      s.classList.add('draw-shape');
      el._jegDraw.shapes.push({ s: s, len: len });
    });
    if (scrub) {
      el._jegSet = activeDraw;
      if (activeIO) activeIO.observe(el); else activeDraw.add(el);
    }
  }
  function drawIn(el) {
    var d = el._jegDraw;
    if (!d || d.scrub) return;
    d.shapes.forEach(function (o) { o.s.style.strokeDashoffset = 0; });
  }
  function updateDraw() {
    if (!activeDraw.size) return;
    activeDraw.forEach(function (el) {
      var d = el._jegDraw;
      var r = el.getBoundingClientRect();
      var p = reduced() ? 1 : clamp((vh * 0.8 - r.top) / Math.max(r.height, 1), 0, 1);
      if (d.html) el.style.setProperty('--draw', p.toFixed(4));
      d.shapes.forEach(function (o) { o.s.style.strokeDashoffset = (o.len * (1 - p)).toFixed(1); });
    });
  }

  /* ------------------------------------------------------------ counters */
  /* Locale-aware: FR "50 000" / "4,5" (narrow no-break space, decimal comma) · EN "50,000" /
     "4.5". The language is the closest .fr / .en wrapper (a counter inside <span class="fr">
     always stays French), otherwise the page language (html.lang-en). Finished counters are
     re-rendered on 'jeg:lang'; running ones pick the new locale up on their next frame.
     Optional data-prefix-en / data-suffix-en override data-prefix / data-suffix in English. */
  var counters = [];
  function countIsEn(el) {
    var w = el.closest && el.closest('.fr, .en');
    if (w) return w.classList.contains('en');
    return isEn();
  }
  function fmtNum(v, dec, en) {
    var s = v.toFixed(dec).split('.');
    return s[0].replace(/\B(?=(\d{3})+(?!\d))/g, en ? ',' : ' ') + (s[1] ? (en ? '.' : ',') + s[1] : '');
  }
  function countAttr(el, name, en) {
    if (en && el.hasAttribute(name + '-en')) return el.getAttribute(name + '-en') || '';
    return el.getAttribute(name) || '';
  }
  function renderCount(el, v) {
    var en = countIsEn(el);
    el.textContent = countAttr(el, 'data-prefix', en) + fmtNum(v, el._jegCount.dec, en) + countAttr(el, 'data-suffix', en);
  }
  function prepCount(el) {
    if (el._jegCount) return;
    var raw = el.getAttribute('data-count');
    var to = parseFloat(String(raw).replace(',', '.'));
    if (isNaN(to)) return;
    el._jegCount = { to: to, dec: (String(raw).split(/[.,]/)[1] || '').length, done: false, end: false };
    counters.push(el);
    if (!reduced()) renderCount(el, 0);
  }
  function runCount(el) {
    var c = el._jegCount;
    if (!c || c.done) return;
    c.done = true;
    var dur = parseFloat(el.getAttribute('data-duration')) || 1900;
    var delay = parseFloat(el.getAttribute('data-delay')) || 0;
    if (reduced()) { c.end = true; renderCount(el, c.to); return; }
    setTimeout(function () {
      var t0 = performance.now();
      (function step(now) {
        var t = clamp((now - t0) / dur, 0, 1);
        if (t >= 1) c.end = true;
        renderCount(el, c.to * easeOutExpo(t));
        if (t < 1) raf(step);
      })(t0);
    }, delay);
  }
  /* new language: finished counters show their final value, not-started ones their 0 */
  function relangCounts() {
    counters = counters.filter(function (el) { return el.isConnected; });
    counters.forEach(function (el) {
      var c = el._jegCount;
      if (c.end) renderCount(el, c.to);
      else if (!c.done && !reduced()) renderCount(el, 0);
    });
  }

  /* ------------------------------------------------------------- marquee */
  /* .marquee > .marquee__track > .marquee__group : the group is cloned once
     (aria-hidden) when only one is present, and the animation is paused while
     the marquee is off-screen. */
  var marqueeIO = 'IntersectionObserver' in win ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { en.target.classList.toggle('is-offscreen', !en.isIntersecting); });
  }, { rootMargin: '10% 0px 10% 0px' }) : null;
  function prepMarquee(m) {
    if (m._jegMarquee) return;
    m._jegMarquee = true;
    var track = $('.marquee__track', m);
    var groups = track ? $$(':scope > .marquee__group', track) : [];
    if (track && groups.length === 1) {
      var c = groups[0].cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      $$('a, button, [tabindex]', c).forEach(function (n) { n.setAttribute('tabindex', '-1'); });
      $$('[id]', c).forEach(function (n) { n.removeAttribute('id'); });
      track.appendChild(c);
    }
    if (marqueeIO) marqueeIO.observe(m);
  }

  /* -------------------------------------------------------------- reveal */
  var revealIO = 'IntersectionObserver' in win ? new IntersectionObserver(onReveal, { rootMargin: '0px 0px -8% 0px', threshold: 0 }) : null;
  var activeIO = 'IntersectionObserver' in win ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var set = en.target._jegSet;
      if (!set) return;
      if (en.isIntersecting) set.add(en.target); else set.delete(en.target);
    });
    runScroll();
  }, { rootMargin: '30% 0px 30% 0px' }) : null;

  function onReveal(entries) {
    var batch = new Map();
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      revealIO.unobserve(el);
      var extra = 0;
      var parent = el.parentElement && el.parentElement.closest('[data-stagger]');
      if (parent && !el.hasAttribute('data-stagger')) {
        var n = batch.get(parent) || 0;
        var step = parseFloat(parent.getAttribute('data-stagger'));
        extra = n * (isNaN(step) ? 90 : step);
        batch.set(parent, n + 1);
      }
      reveal(el, extra);
    });
  }
  function reveal(el, extra) {
    var base = parseFloat(el.getAttribute('data-delay')) || 0;
    var d = base + (extra || 0);
    if (d) el.style.setProperty('--delay', d + 'ms');
    el.classList.add('is-in');
    if (el._jegCount) runCount(el);
    if (el._jegDraw) drawIn(el);
    if (el.hasAttribute('data-reveal')) {
      var type = el.getAttribute('data-reveal');
      var total = d + (type === 'mask' ? 1900 : 1350);
      setTimeout(function () {
        el.removeAttribute('data-reveal');
        el.classList.remove('is-in');
        el.style.removeProperty('--delay');
      }, reduced() ? 0 : total + 80);
    }
  }
  function revealNow(el) {
    el.classList.add('is-in');
    if (el._jegCount) runCount(el);
    if (el._jegDraw) drawIn(el);
    if (el.hasAttribute('data-reveal')) { el.removeAttribute('data-reveal'); el.classList.remove('is-in'); }
  }

  var REVEAL_SEL = '[data-reveal], [data-split], [data-count], [data-draw]:not([data-draw="scrub"])';
  function prepare(ctx) {
    scope(ctx, '[data-stagger]').forEach(function (p) {
      Array.prototype.forEach.call(p.children, function (c) {
        if (!c.hasAttribute('data-reveal') && !c.hasAttribute('data-split')) c.setAttribute('data-reveal', 'up');
      });
    });
    scope(ctx, '[data-split]').forEach(prepSplit);
    scope(ctx, '[data-fill]').forEach(prepFill);
    scope(ctx, '[data-count]').forEach(prepCount);
    scope(ctx, '[data-draw]').forEach(prepDraw);
    scope(ctx, '[data-parallax]').forEach(prepParallax);
    scope(ctx, '.marquee').forEach(prepMarquee);
  }
  function observe(ctx) {
    var els = scope(ctx, REVEAL_SEL);
    if (reduced() || !revealIO) { els.forEach(revealNow); return; }
    els.forEach(function (el) {
      if (el._jegObserved) return;
      el._jegObserved = true;
      revealIO.observe(el);
    });
  }
  JEG.refresh = function (ctx) {
    ctx = ctx || doc;
    prepare(ctx);
    if (JEG.isReady) observe(ctx);
    docH = root.scrollHeight;
    runScroll();
  };

  /* ----------------------------------------------- magnetic + tilt (mouse) */
  function initPointerFx() {
    if (!mqFine.matches) return;
    var mag = null, tilt = null;
    function releaseMag() {
      if (!mag) return;
      mag.classList.remove('is-magnet');
      mag.style.translate = '';
      mag._mx = mag._my = 0;
      mag = null;
    }
    function releaseTilt() {
      if (!tilt) return;
      tilt.classList.remove('is-tilting');
      tilt.style.transform = '';
      tilt = null;
    }
    doc.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || reduced()) return;
      var t = e.target.closest ? e.target : null;
      if (!t) return;
      var m = t.closest('[data-magnetic]');
      if (m !== mag) { releaseMag(); mag = m; if (mag) mag.classList.add('is-magnet'); }
      if (mag) {
        var r = mag.getBoundingClientRect();
        var s = parseFloat(mag.getAttribute('data-magnetic'));
        if (isNaN(s)) s = 0.32;
        var cx = r.left - (mag._mx || 0) + r.width / 2, cy = r.top - (mag._my || 0) + r.height / 2;
        var dx = (e.clientX - cx) * s, dy = (e.clientY - cy) * s;
        mag._mx = dx; mag._my = dy;
        mag.style.translate = dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px';
      }
      var ti = t.closest('[data-tilt]');
      if (ti !== tilt) {
        releaseTilt(); tilt = ti;
        if (tilt) {
          if (!tilt.querySelector(':scope > .tilt-glare')) {
            var g = doc.createElement('span'); g.className = 'tilt-glare'; g.setAttribute('aria-hidden', 'true'); tilt.appendChild(g);
            if (getComputedStyle(tilt).position === 'static') tilt.style.position = 'relative';
          }
          tilt.classList.add('is-tilting');
        }
      }
      if (tilt) {
        var tr = tilt.getBoundingClientRect();
        var px = clamp((e.clientX - tr.left) / tr.width, 0, 1), py = clamp((e.clientY - tr.top) / tr.height, 0, 1);
        var max = parseFloat(tilt.getAttribute('data-tilt'));
        if (isNaN(max)) max = 8;
        tilt.style.transform = 'perspective(1100px) rotateX(' + ((0.5 - py) * max * 2).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * max * 2).toFixed(2) + 'deg)';
        tilt.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        tilt.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      }
    }, { passive: true });
    root.addEventListener('mouseleave', function () { releaseMag(); releaseTilt(); });
    win.addEventListener('blur', function () { releaseMag(); releaseTilt(); });
  }

  /* --------------------------------------------------------------- cursor */
  function initCursor() {
    var c = $('.cursor');
    if (!c || !mqFine.matches || reduced()) return;
    var ring = $('.cursor__ring', c), dot = $('.cursor__dot', c), label = $('[data-cursor-label]', c);
    root.classList.add('has-cursor');
    c.classList.add('is-hidden');
    var x = -100, y = -100, rx = -100, ry = -100, loop = 0, shown = false;
    function frame() {
      rx += (x - rx) * 0.2; ry += (y - ry) * 0.2;
      ring.style.transform = 'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0)';
      if (Math.abs(x - rx) > 0.1 || Math.abs(y - ry) > 0.1) loop = raf(frame); else loop = 0;
    }
    doc.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      if (!shown) { shown = true; rx = x; ry = y; c.classList.remove('is-hidden'); }
      if (!loop) loop = raf(frame);
    }, { passive: true });
    var INTERACTIVE = 'a[href], button, [role="button"], label, summary, select, .lchip, [data-cursor], input[type="checkbox"], input[type="radio"], input[type="submit"]';
    var TEXT = 'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), textarea, [contenteditable="true"]';
    doc.addEventListener('pointerover', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var txt = t.closest(TEXT);
      var hit = !txt && t.closest(INTERACTIVE);
      var lab = !txt && t.closest('[data-cursor]');
      var text = lab ? ((isEn() && lab.getAttribute('data-cursor-en')) || lab.getAttribute('data-cursor')) : '';
      c.classList.toggle('is-text', !!txt);
      c.classList.toggle('is-hover', !!hit);
      c.classList.toggle('has-label', !!text);
      if (text) label.textContent = text;
    }, { passive: true });
    doc.addEventListener('pointerdown', function () { c.classList.add('is-down'); }, { passive: true });
    doc.addEventListener('pointerup', function () { c.classList.remove('is-down'); }, { passive: true });
    root.addEventListener('mouseleave', function () { c.classList.add('is-hidden'); shown = false; });
  }

  /* ------------------------------------------------- clicks: anchors + transitions */
  var leaving = false;
  function samePath(a, b) {
    var n = function (p) { return p.replace(/\/index\.html?$/i, '/').replace(/\.html?$/i, ''); };
    return n(a) === n(b);
  }
  function navigate(href) {
    var curtain = $('[data-curtain]');
    if (!curtain || reduced()) { location.href = href; return; }
    if (leaving) return;
    leaving = true;
    JEG.closeMenus();
    store('sessionStorage', 'jeg-visited', '1');
    curtain.classList.remove('is-leaving', 'is-done');
    void curtain.offsetWidth;
    curtain.classList.add('is-covering');
    setTimeout(function () { location.href = href; }, 640);
    setTimeout(function () { /* navigation did not happen (download, blocked…) */
      if (!leaving) return;
      leaving = false;
      curtain.classList.remove('is-covering');
      curtain.classList.add('is-done');
    }, 5000);
  }
  JEG.navigate = navigate;
  function initClicks() {
    doc.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var raw = a.getAttribute('href');
      if (!raw || /^(mailto:|tel:|sms:|javascript:)/i.test(raw)) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      var same = samePath(url.pathname, location.pathname) && url.search === location.search;
      if (same && url.hash) {
        if (a.classList.contains('skip-link')) return;
        var id = decodeURIComponent(url.hash.slice(1));
        var target = id === 'top' ? doc.body : doc.getElementById(id);
        if (!target) return;
        e.preventDefault();
        JEG.closeMenus();
        if (history.pushState) history.pushState(null, '', '#' + id);
        var kb = e.detail === 0;
        setTimeout(function () { scrollToEl(target, { focus: kb }); }, root.classList.contains('menu-open') ? 60 : 0);
        return;
      }
      if (a.hasAttribute('data-no-transition')) return;
      if (/\.[a-z0-9]{2,5}$/i.test(url.pathname) && !/\.html?$/i.test(url.pathname)) return;
      if (reduced()) return;
      e.preventDefault();
      navigate(url.href);
    });
    /* prefetch internal pages on hover/focus */
    var pre = {};
    function prefetch(e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank') return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin || samePath(url.pathname, location.pathname) || pre[url.pathname]) return;
      if (!/(\.html?|\/)$/i.test(url.pathname)) return;
      pre[url.pathname] = 1;
      var l = doc.createElement('link');
      l.rel = 'prefetch'; l.href = url.pathname;
      doc.head.appendChild(l);
    }
    doc.addEventListener('pointerover', prefetch, { passive: true });
    doc.addEventListener('focusin', prefetch);
    win.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      leaving = false;
      var c = $('[data-curtain]');
      if (c) { c.classList.remove('is-covering', 'is-leaving'); c.classList.add('is-done'); }
      JEG.closeMenus();
    });
  }

  /* ------------------------------------------------------- page curtain in */
  function uncover() {
    var c = $('[data-curtain]');
    if (!c || !root.classList.contains('is-returning') || reduced()) return Promise.resolve();
    var fonts = doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve();
    return Promise.race([fonts, wait(550)]).then(function () {
      return new Promise(function (resolve) {
        c.classList.add('is-leaving');
        setTimeout(resolve, 200);
        setTimeout(function () { c.classList.remove('is-leaving'); c.classList.add('is-done'); }, 900);
      });
    });
  }

  /* --------------------------------------------------------------- loader */
  /* scroll lock without touching overflow (no scrollbar jump when the loader leaves) */
  var KEYS = { ' ': 1, PageDown: 1, PageUp: 1, ArrowDown: 1, ArrowUp: 1, Home: 1, End: 1 };
  function blockScroll(e) { if (e.type !== 'keydown' || KEYS[e.key]) e.preventDefault(); }
  function lockScroll(on) {
    ['wheel', 'touchmove', 'keydown'].forEach(function (ev) {
      if (on) win.addEventListener(ev, blockScroll, { passive: false });
      else win.removeEventListener(ev, blockScroll, { passive: false });
    });
  }
  function runLoader() {
    var L = $('[data-loader]');
    store('sessionStorage', 'jeg-visited', '1');
    if (!L) return Promise.resolve();
    if (getComputedStyle(L).display === 'none' || reduced()) { L.remove(); return Promise.resolve(); }
    root.classList.add('is-loading');
    lockScroll(true);
    return new Promise(function (resolve) {
      var bar = $('[data-loader-bar]', L), count = $('[data-loader-count]', L);
      var MIN = 2800, MAX = 5400;
      var fontsDone = false, loadDone = doc.readyState === 'complete';
      (doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve()).then(function () { fontsDone = true; });
      if (!loadDone) win.addEventListener('load', function () { loadDone = true; }, { once: true });
      var imgs = $$('img').filter(function (i) { return i.loading !== 'lazy' && !L.contains(i) && !i.closest('[hidden]'); });
      var shown = 0, last = -1;
      function tick() {
        var t = performance.now();
        var done = imgs.filter(function (i) { return i.complete; }).length;
        var res = ((fontsDone ? 1 : 0) + (loadDone ? 1 : 0) + (imgs.length ? done / imgs.length : 1)) / 3;
        var time = clamp(t / MIN, 0, 1);
        var ok = loadDone && fontsDone;
        var target = ok ? time : Math.min(time, 0.12 + 0.8 * res);
        if (t > MAX) target = 1;
        shown += (target * 100 - shown) * (ok ? 0.3 : 0.12);
        if (target === 1 && shown > 99.2) shown = 100;
        var v = Math.floor(shown);
        if (v !== last) { last = v; count.textContent = v; }
        bar.style.transform = 'scaleX(' + (shown / 100).toFixed(4) + ')';
        if (t > MIN + 250 && !ok) L.classList.add('is-waiting');
        if (shown >= 100 && ((ok && t >= MIN) || t > MAX)) { exitLoader(L, resolve); return; }
        raf(tick);
      }
      raf(tick);
    });
  }
  function exitLoader(L, resolve) {
    L.classList.remove('is-waiting');
    L.classList.add('is-exiting');
    var veil = $('[data-loader-veil]', L), gem = $('[data-loader-gem]', L), shape = $('[data-loader-shape]', L), svg = $('[data-loader-window]', L);
    var W = win.innerWidth, H = win.innerHeight;
    var r = shape.getBoundingClientRect();
    var bx = r.left + r.width * 0.16, by = r.top + r.height * 0.104, bw = r.width * 0.68, bh = r.height * 0.792;
    function map(pts) { return pts.map(function (p) { return [bx + p[0] / 100 * bw, by + p[1] / 128 * bh]; }); }
    var OUT = map([[22, 0], [78, 0], [100, 22], [100, 106], [78, 128], [22, 128], [0, 106], [0, 22]]);
    var MID = map([[28, 10], [72, 10], [90, 28], [90, 100], [72, 118], [28, 118], [10, 100], [10, 28]]);
    var TAB = map([[35, 22], [65, 22], [78, 35], [78, 93], [65, 106], [35, 106], [22, 93], [22, 35]]);
    var cx = bx + bw / 2, cy = by + bh / 2, hw = bw / 2, hh = bh / 2, cut = bw * 0.22;
    var dx = Math.max(cx, W - cx), dy = Math.max(cy, H - cy);
    var sMax = Math.max(dx / hw, dy / hh, (dx + dy) / (hw + hh - cut)) * 1.15;
    var evenodd = win.CSS && CSS.supports && CSS.supports('clip-path', 'polygon(evenodd, 0px 0px, 1px 0px, 1px 1px)');
    var polys = svg ? { e: $('.w-edge', svg), r: $('.w-ring', svg), t: $('.w-table', svg) } : null;
    if (svg) svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    function scaled(pts, s) { return pts.map(function (p) { return [cx + (p[0] - cx) * s, cy + (p[1] - cy) * s]; }); }
    function svgPts(pts) { return pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
    function cssPts(pts) { return pts.map(function (p) { return p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px'; }).join(','); }
    var DUR = 1250, t0 = performance.now(), sent = false;
    function finish() {
      if (!sent) { sent = true; resolve(); }
      L.remove();
      root.classList.remove('is-loading');
      lockScroll(false);
      docH = root.scrollHeight;
    }
    function frame(now) {
      var t = clamp((now - t0) / DUR, 0, 1);
      gem.style.opacity = (1 - easeOutCubic(clamp(t / 0.26, 0, 1))).toFixed(3);
      var u = clamp((t - 0.04) / 0.96, 0, 1);
      var s = Math.exp(Math.log(sMax) * (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2));
      var o = scaled(OUT, s);
      if (evenodd) {
        veil.style.clipPath = 'polygon(evenodd,0px 0px,' + W + 'px 0px,' + W + 'px ' + H + 'px,0px ' + H + 'px,0px 0px,' + cssPts(o) + ',' + o[0][0].toFixed(1) + 'px ' + o[0][1].toFixed(1) + 'px,0px 0px)';
      } else {
        veil.style.opacity = (1 - u).toFixed(3);
      }
      if (polys) {
        polys.e.setAttribute('points', svgPts(o));
        polys.r.setAttribute('points', svgPts(scaled(MID, s)));
        polys.t.setAttribute('points', svgPts(scaled(TAB, s)));
        svg.style.opacity = (1 - clamp((u - 0.4) / 0.5, 0, 1)).toFixed(3);
      }
      if (!sent && t > 0.16) { sent = true; resolve(); }
      if (t < 1) raf(frame); else finish();
    }
    raf(frame);
  }

  /* ---------------------------------------------------------------- ready */
  function markReady() {
    if (JEG.isReady) return;
    JEG.isReady = true;
    root.classList.add('is-ready');
    observe(doc);
    runScroll();
    var ev;
    try { ev = new CustomEvent('jeg:ready'); } catch (e) { ev = doc.createEvent('Event'); ev.initEvent('jeg:ready', false, false); }
    doc.dispatchEvent(ev);
  }

  function setYear() {
    var y = String(new Date().getFullYear());
    $$('[data-year]').forEach(function (el) { el.textContent = y; });
  }

  /* ----------------------------------------------------------------- boot */
  function boot() {
    scrollSubs.push(updateParallax, updateFills, updateDraw);
    initHeader();
    initProgress();
    initMega();
    initMobileMenu();
    markCurrent();
    setYear();
    initClicks();
    initPointerFx();
    initCursor();
    prepare(doc);
    runScroll();
    var intro;
    if (reduced()) {
      store('sessionStorage', 'jeg-visited', '1');
      var L = $('[data-loader]');
      if (L) L.remove();
      intro = Promise.resolve();
    } else if (root.classList.contains('is-returning')) {
      var L2 = $('[data-loader]');
      if (L2) L2.remove();
      intro = uncover();
    } else {
      intro = runLoader();
    }
    intro.then(markReady, markReady);
    doc.addEventListener('jeg:lang', function () {
      relangCounts();
      docH = root.scrollHeight;
      fills.forEach(function (f) { f.groups.forEach(function (g) { g.forEach(function (w) { w._o = null; }); }); });
      runScroll();
    });
    win.addEventListener('load', function () { docH = root.scrollHeight; runScroll(); });
    mqReduce.addEventListener && mqReduce.addEventListener('change', function () { if (reduced()) { $$('.is-tilting, .is-magnet').forEach(function (el) { el.style.transform = ''; el.style.translate = ''; }); } });
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
