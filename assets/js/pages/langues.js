/* ==========================================================================
   langues.html — page behaviour (Pôle 02 · Langues étrangères)
   1. Greeting “wave”: each tile greeting is split into characters so the
      letters can bounce on hover / keyboard focus (CSS does the motion).
   2. Fallback filter: while the Google Sheet has not answered (role cards
      shown), the language chips (.lchip[data-pf]) highlight the matching
      role card. Once app.js renders the live grid (.teachers.is-live), it
      takes over the filtering entirely.
   No dependency; content stays fully usable without this file.
   ========================================================================== */
(function () {
  'use strict';
  var doc = document;
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* 1. Greeting wave ------------------------------------------------------ */
  $$('[data-wave]').forEach(function (el) {
    if (el.hasAttribute('data-wave-done')) return;
    var text = el.textContent;
    el.textContent = '';
    Array.from(text).forEach(function (ch, i) {
      var s = doc.createElement('span');
      s.className = 'lg-char';
      s.style.setProperty('--i', i);
      s.textContent = ch;
      el.appendChild(s);
    });
    el.setAttribute('data-wave-done', '');
  });

  /* 2. Fallback filter on the role cards --------------------------------- */
  var grid = doc.querySelector('[data-teachers]');
  if (!grid) return;
  var reset = doc.querySelector('[data-lg-reset]');
  var current = '';

  function isLive() { return grid.classList.contains('is-live'); }

  function setFallback(k) {
    current = k;
    $$('.teacher--role', grid).forEach(function (card) {
      var match = !!k && card.getAttribute('data-k') === k;
      card.classList.toggle('is-match', match);
      card.classList.toggle('is-dim', !!k && !match);
    });
    $$('.lchip[data-pf]').forEach(function (chip) {
      var on = !!k && chip.getAttribute('data-pf') === k;
      chip.classList.toggle('is-active', on);
      chip.setAttribute('aria-pressed', String(on));
    });
    if (reset) reset.hidden = !k;
  }

  doc.addEventListener('click', function (e) {
    var chip = e.target.closest && e.target.closest('.lchip[data-pf]');
    if (!chip || isLive()) return;
    var k = chip.getAttribute('data-pf');
    setFallback(k === current ? '' : k);
  });

  if (reset) {
    reset.addEventListener('click', function () {
      if (window.JEGApp && isLive()) window.JEGApp.filterTeachers('');
      setFallback('');
    });
  }
})();
