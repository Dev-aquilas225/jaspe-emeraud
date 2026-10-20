/* ==========================================================================
   contact.html — page behaviour (forms, WhatsApp, copy and the ?sujet=b2b
   prefill are handled by app.js). Here: the live local time in Abidjan
   (GMT, Africa/Abidjan) shown on the map block. Hidden without JS.
   ========================================================================== */
(function () {
  'use strict';

  var box, clocks, timer;

  function fmt(locale) {
    try {
      return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Abidjan' }).format(new Date());
    } catch (e) {
      var d = new Date();
      var h = d.getUTCHours(), m = d.getUTCMinutes(); /* Abidjan = UTC+0, no DST */
      return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
    }
  }

  function tick() {
    Array.prototype.forEach.call(clocks, function (t) {
      var en = !!t.closest('.en');
      var txt = fmt(en ? 'en-GB' : 'fr-FR');
      if (t.textContent !== txt) t.textContent = txt;
      t.setAttribute('datetime', txt);
    });
  }

  function init() {
    box = document.querySelector('[data-abidjan-time]');
    if (!box) return;
    clocks = box.querySelectorAll('[data-abidjan-clock]');
    if (!clocks.length) return;
    tick();
    box.hidden = false;
    timer = window.setInterval(tick, 20000);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { window.clearInterval(timer); timer = 0; }
      else if (!timer) { tick(); timer = window.setInterval(tick, 20000); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
