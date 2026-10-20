/* ==========================================================================
   English Camp (english-camp.html) — small page-only interactions.
   Progressive enhancement: the page is complete without this file.
   1. Format cards: the camp-gradient fill grows from the pointer position.
   2. Hero collage: layers drift with the pointer (depth), desktop mouse only.
   Both are skipped with prefers-reduced-motion and on touch pointers.
   ========================================================================== */
(function () {
  'use strict';
  var doc = document;
  var win = window;
  var mqFine = win.matchMedia('(hover: hover) and (pointer: fine)');
  var mqReduce = win.matchMedia('(prefers-reduced-motion: reduce)');
  var raf = win.requestAnimationFrame ? win.requestAnimationFrame.bind(win) : function (f) { return setTimeout(f, 16); };

  function canMove(e) {
    return mqFine.matches && !mqReduce.matches && (!e || e.pointerType === 'mouse');
  }

  /* 1. Format cards — pointer-origin colour fill (--mx / --my used by the CSS) */
  function pointerOrigin(card, e) {
    var r = card.getBoundingClientRect();
    if (!r.width || !r.height) return;
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  }
  Array.prototype.forEach.call(doc.querySelectorAll('.ec-format'), function (card) {
    card.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') pointerOrigin(card, e); });
    card.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') pointerOrigin(card, e); });
  });

  /* 2. Hero collage depth */
  var hero = doc.querySelector('.ec-hero');
  var layers = hero ? Array.prototype.slice.call(hero.querySelectorAll('[data-depth]')) : [];
  if (!hero || !layers.length) return;

  var tx = 0, ty = 0, cx = 0, cy = 0, running = false;
  function apply() {
    layers.forEach(function (l) {
      var d = parseFloat(l.getAttribute('data-depth')) || 0;
      l.style.transform = 'translate3d(' + (cx * d).toFixed(2) + 'px,' + (cy * d).toFixed(2) + 'px,0)';
    });
  }
  function tick() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    if (Math.abs(tx - cx) < 0.002 && Math.abs(ty - cy) < 0.002) {
      cx = tx; cy = ty; apply(); running = false;
      return;
    }
    apply();
    raf(tick);
  }
  function start() { if (!running) { running = true; raf(tick); } }

  hero.addEventListener('pointermove', function (e) {
    if (!canMove(e)) return;
    var r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    start();
  });
  hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; start(); });

  function reset() {
    if (!mqReduce.matches) return;
    tx = ty = cx = cy = 0;
    layers.forEach(function (l) { l.style.transform = ''; });
  }
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', reset);
})();
