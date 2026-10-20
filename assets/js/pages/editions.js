/* editions.html — Pôle 05 Jaspe’e Editions
 * Author-support path [data-ed-path]: as the list scrolls through the viewport a
 * line draws from step to step (--sp on each .ed-path__seg) and each node lights
 * up (.is-on) when the line reaches it. Reduced motion / no IntersectionObserver
 * → everything shown at once. No JS → CSS shows the finished path. */
(function () {
  'use strict';
  var paths = Array.prototype.slice.call(document.querySelectorAll('[data-ed-path]'));
  if (!paths.length) return;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var active = new Set();
  var ticking = false;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function setProgress(el, p) {
    var d = el._edPath;
    if (!d || d.p === p) return;
    d.p = p;
    var t = p * (d.steps.length - 1);
    d.steps.forEach(function (s, i) {
      s.classList.toggle('is-on', p > 0 && t >= i - 0.02);
      if (d.segs[i]) d.segs[i].style.setProperty('--sp', clamp(t - i, 0, 1).toFixed(3));
    });
  }

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    active.forEach(function (el) {
      var r = el.getBoundingClientRect();
      /* starts when the list top reaches 82% of the viewport, ends ~45% of a viewport later */
      var p = clamp((vh * 0.82 - r.top) / (vh * 0.45), 0, 1);
      setProgress(el, Math.round(p * 1000) / 1000);
    });
  }
  function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }

  paths.forEach(function (el) {
    var steps = Array.prototype.slice.call(el.querySelectorAll('.ed-path__step'));
    el._edPath = { steps: steps, segs: steps.map(function (s) { return s.querySelector('.ed-path__seg'); }), p: -1 };
  });

  function showAll() { paths.forEach(function (el) { setProgress(el, 1); }); }

  if (mqReduce.matches || !('IntersectionObserver' in window)) { showAll(); return; }

  paths.forEach(function (el) { setProgress(el, 0); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) active.add(en.target); else active.delete(en.target);
    });
    onScroll();
  }, { rootMargin: '20% 0px 20% 0px' });
  paths.forEach(function (el) { io.observe(el); });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  var onChange = function (e) {
    if (e.matches) { io.disconnect(); window.removeEventListener('scroll', onScroll); showAll(); }
  };
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', onChange);
})();
