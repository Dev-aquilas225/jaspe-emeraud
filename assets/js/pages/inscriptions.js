/* ==========================================================================
   inscriptions.html — page behaviour (everything else lives in main.js / app.js).
   Shows the visitor's latest registration code (saved by app.js in
   localStorage['je-last-code']) next to the « Envoyer ma preuve de paiement »
   button, and keeps it up to date after a registration made on this page.
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'je-last-code';
  var CODE_RE = /^JEG-[A-Z0-9]{4}$/;

  function readCode() {
    try { return window.localStorage.getItem(KEY) || ''; } catch (e) { return ''; }
  }

  function render() {
    var code = readCode();
    var ok = CODE_RE.test(code);
    var boxes = document.querySelectorAll('[data-last-code]');
    Array.prototype.forEach.call(boxes, function (box) {
      var out = box.querySelector('[data-last-code-value]');
      if (ok && out) out.textContent = code;
      box.hidden = !ok;
    });
  }

  function init() {
    render();
    /* app.js dispatches jeg:modal when the registration modal opens/closes */
    document.addEventListener('jeg:modal', render);
    window.addEventListener('storage', function (e) { if (!e || e.key === KEY) render(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
