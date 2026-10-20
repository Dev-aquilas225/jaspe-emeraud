/* ==========================================================================
   training.html — page-specific motion (progressive enhancement only).
   1. The giant « Avril 2027 » drifts horizontally while it crosses the screen.
   2. Sommet pillars: a soft gold spotlight follows the pointer (fine pointers).
   Everything is skipped with prefers-reduced-motion; content never depends on it.
   ========================================================================== */
(function () {
  'use strict';
  var win = window, doc = document;
  var mqReduce = win.matchMedia ? win.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var mqFine = win.matchMedia ? win.matchMedia('(hover: hover) and (pointer: fine)') : null;
  function reduced() { return !!(mqReduce && mqReduce.matches); }

  /* ---------------------------------------------- 1. date drift on scroll */
  function initDrift() {
    var track = doc.querySelector('.tr-date__track');
    var box = track && track.closest('.tr-date');
    if (!track || !box || !('IntersectionObserver' in win)) return;
    var active = false, ticking = false;

    function update() {
      ticking = false;
      if (!active || reduced()) { track.style.translate = ''; return; }
      var r = box.getBoundingClientRect();
      var vh = win.innerHeight || doc.documentElement.clientHeight;
      var p = (vh - r.top) / (vh + r.height);           /* 0 → 1 while crossing */
      p = Math.max(0, Math.min(1, p));
      var x = (0.5 - p) * Math.min(win.innerWidth * 0.06, 90);
      track.style.translate = x.toFixed(1) + 'px 0';
    }
    function onScroll() {
      if (!ticking && active) { ticking = true; win.requestAnimationFrame(update); }
    }
    new IntersectionObserver(function (entries) {
      active = entries[0].isIntersecting;
      if (active) onScroll();
    }, { rootMargin: '10% 0px 10% 0px' }).observe(box);
    win.addEventListener('scroll', onScroll, { passive: true });
    win.addEventListener('resize', onScroll, { passive: true });
  }

  /* ------------------------------------------- 2. pillar pointer spotlight */
  function initSpotlight() {
    var pillars = doc.querySelectorAll('.tr-pillar');
    if (!pillars.length) return;
    Array.prototype.forEach.call(pillars, function (el) {
      el.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse' || reduced() || (mqFine && !mqFine.matches)) return;
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
        el.classList.add('is-lit');
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('is-lit'); });
    });
  }

  function init() {
    try { initDrift(); } catch (e) { /* enhancement only */ }
    try { initSpotlight(); } catch (e) { /* enhancement only */ }
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
