/* ==========================================================================
   Home (index.html) — page behaviour only (everything generic is in main.js)
   - hero entrance once the loader / curtain is done ('jeg:ready')
   - pointer depth on the hero photo composition ([data-depth] layers),
     desktop pointer only, off with reduced motion; rAF only while moving
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var win = window;
  var hero = doc.querySelector('.home-hero');
  if (!hero) return;

  var mqReduce = win.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = win.matchMedia('(hover: hover) and (pointer: fine)');

  /* ---------------------------------------------------------- entrance */
  function enter() { hero.classList.add('is-entered'); }
  if (win.JEG && win.JEG.isReady) enter();
  else {
    doc.addEventListener('jeg:ready', enter, { once: true });
    setTimeout(enter, 7000); /* safety net if the motion engine never fires */
  }

  /* ------------------------------------------------------ pointer depth */
  var layers = Array.prototype.slice.call(hero.querySelectorAll('[data-depth]'));
  if (!layers.length) return;
  var depth = layers.map(function (l) {
    var d = parseFloat(l.getAttribute('data-depth'));
    return isNaN(d) ? 12 : d;
  });
  var tx = 0, ty = 0, cx = 0, cy = 0, frame = 0;

  function apply() {
    for (var i = 0; i < layers.length; i++) {
      layers[i].style.transform = 'translate3d(' + (-cx * depth[i]).toFixed(2) + 'px,' + (-cy * depth[i]).toFixed(2) + 'px,0)';
    }
  }
  function tick() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    apply();
    if (Math.abs(tx - cx) > 0.0015 || Math.abs(ty - cy) > 0.0015) frame = win.requestAnimationFrame(tick);
    else { cx = tx; cy = ty; apply(); frame = 0; }
  }
  function kick() { if (!frame) frame = win.requestAnimationFrame(tick); }

  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || !mqFine.matches || mqReduce.matches) return;
    var r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
    kick();
  }, { passive: true });
  hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; kick(); });

  function reset() {
    if (frame) { win.cancelAnimationFrame(frame); frame = 0; }
    tx = ty = cx = cy = 0;
    layers.forEach(function (l) { l.style.transform = ''; });
  }
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', function () { if (mqReduce.matches) reset(); });
})();
