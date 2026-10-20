/*!
 * Jaspe-Émeraude Group — assets/js/pages/404.js
 * Page 404 « Cette page s’est égarée » :
 *   1. liens internes « #… » réécrits vers l’URL courante (la page tourne sous une
 *      <base href> calculée dans le <head>, sinon « #main » pointerait vers l’accueil) ;
 *   2. affichage de l’adresse demandée ;
 *   3. émeraude brisée : les facettes (SVG) flottent, réagissent au pointeur et se
 *      réassemblent au survol ou au toucher (bouton aria-pressed). Mouvement réduit :
 *      état statique, bascule instantanée. rAF uniquement quand c’est utile.
 */
(function () {
  'use strict';
  var doc = document, win = window;

  /* 1. in-page anchors under <base> */
  var here = location.pathname + location.search;
  Array.prototype.forEach.call(doc.querySelectorAll('a[href^="#"]'), function (a) {
    a.setAttribute('href', here + a.getAttribute('href'));
  });

  /* 2. requested address */
  var pathEl = doc.querySelector('[data-nf-path]'), pathWrap = doc.querySelector('[data-nf-path-wrap]');
  if (pathEl && pathWrap && !/\/404(\.html)?$/i.test(location.pathname)) {
    var shown = location.pathname;
    try { shown = decodeURIComponent(shown); } catch (e) { /* keep raw */ }
    pathEl.textContent = shown + location.search;
    pathEl.title = pathEl.textContent;
    pathWrap.hidden = false;
  }

  /* 3. shattered emerald */
  var stage = doc.querySelector('[data-nf-gem]');
  if (!stage) return;
  var section = stage.closest('.nf') || doc.body;
  var mq = win.matchMedia ? win.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var facets = Array.prototype.map.call(stage.querySelectorAll('.nf-facet'), function (el, i) {
    var v = (el.getAttribute('data-v') || '0,0,0,1').split(',').map(Number);
    return { el: el, tx: v[0], ty: v[1], r: v[2], d: v[3] || 1, ph: i * 2.399, w: 0.55 + ((i * 37) % 23) / 40 };
  });

  var amt = 0, tgt = 0;              /* 0 = whole gem, 1 = shattered */
  var locked = false, hovering = false, suppress = false, started = false;
  var px = 0, py = 0, spx = 0, spy = 0, visible = true, raf = 0, whole = null;
  var t0 = performance.now();

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function reduced() { return !!mq.matches; }

  function apply(t) {
    var a = amt, fl = reduced() ? 0 : a;
    for (var i = 0; i < facets.length; i++) {
      var f = facets[i];
      var fx = Math.sin(t * f.w + f.ph) * 2.6 * fl;
      var fy = Math.cos(t * f.w * 0.8 + f.ph) * 3.4 * fl;
      var fr = Math.sin(t * f.w * 0.6 + f.ph) * 8 * fl;
      var par = 3 + 9 * f.d * a;
      var x = f.tx * a + fx + spx * par, y = f.ty * a + fy + spy * par, r = f.r * a + fr;
      f.el.style.transform = 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px) rotate(' + r.toFixed(2) + 'deg)';
    }
  }

  function setWhole(w) {
    if (w === whole) return;
    whole = w;
    stage.classList.toggle('is-whole', w);
    section.classList.toggle('is-whole', w);
  }

  function crack() {
    if (reduced()) return;
    stage.classList.remove('is-cracking');
    void stage.getBoundingClientRect();
    stage.classList.add('is-cracking');
    setTimeout(function () { stage.classList.remove('is-cracking'); }, 700);
  }

  function shouldRun() {
    if (!visible || doc.hidden || reduced()) return false;
    return amt > 0.001 || Math.abs(tgt - amt) > 0.001 || Math.abs(px - spx) > 0.002 || Math.abs(py - spy) > 0.002;
  }
  function frame(now) {
    raf = 0;
    var k = tgt > amt ? 0.11 : 0.075;  /* bursts fast, reassembles with care */
    amt += (tgt - amt) * k;
    if (Math.abs(tgt - amt) < 0.0015) amt = tgt;
    spx += (px - spx) * 0.08; spy += (py - spy) * 0.08;
    apply((now - t0) / 1000);
    if (tgt === 0 && amt < 0.02) setWhole(true); else if (amt > 0.12) setWhole(false);
    if (shouldRun()) raf = win.requestAnimationFrame(frame);
  }
  function kick() { if (!raf && shouldRun()) raf = win.requestAnimationFrame(frame); }

  function update() {
    var next = (locked || (hovering && !suppress)) ? 0 : 1;
    if (next === 1 && tgt === 0) crack();
    tgt = next;
    stage.setAttribute('aria-pressed', locked ? 'true' : 'false');
    if (reduced()) {
      amt = tgt; spx = spy = 0;
      apply(0);
      setWhole(tgt === 0);
      return;
    }
    kick();
  }

  /* pointer: hover re-assembles (mouse), click / tap / Enter toggles a "keep it whole" lock */
  stage.addEventListener('pointerenter', function (e) {
    if (e.pointerType !== 'mouse' || reduced() || !started) return;
    hovering = true; update();
  });
  stage.addEventListener('pointerleave', function (e) {
    if (e.pointerType !== 'mouse') return;
    hovering = false; suppress = false; update();
  });
  stage.addEventListener('click', function () {
    if (!started) start(true);
    locked = !locked;
    if (!locked) suppress = true;
    update();
  });
  section.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || reduced()) return;
    var r = stage.getBoundingClientRect();
    px = clamp((e.clientX - (r.left + r.width / 2)) / (win.innerWidth / 2), -1, 1);
    py = clamp((e.clientY - (r.top + r.height / 2)) / (win.innerHeight / 2), -1, 1);
    kick();
  }, { passive: true });
  section.addEventListener('pointerleave', function () { px = py = 0; kick(); });

  /* run only while visible */
  if ('IntersectionObserver' in win) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      kick();
    }).observe(stage);
  }
  doc.addEventListener('visibilitychange', kick);
  if (mq.addEventListener) mq.addEventListener('change', function () {
    if (raf) { win.cancelAnimationFrame(raf); raf = 0; }
    update();
  });

  /* intro: the polished gem appears whole, cracks, and its facets drift apart */
  function start(now) {
    if (started) return;
    started = true;
    if (reduced()) { tgt = amt = 1; apply(0); setWhole(false); return; }
    amt = tgt = 0; apply(0); setWhole(true);
    setTimeout(function () {
      if (locked || hovering) return;
      crack(); tgt = 1; kick();
    }, now ? 0 : 700);
  }
  if (win.JEG && win.JEG.isReady) start();
  else {
    doc.addEventListener('jeg:ready', function () { start(); }, { once: true });
    setTimeout(function () { start(); }, 7000); /* safety net if the motion engine is missing */
  }
})();
