/* ==========================================================================
   shopping.html — page behaviour (Pôle 03 · Shopping)
   The WhatsApp chat preview “plays” (message, list lines, typing dots) the
   first time it scrolls into view. Without JS or with reduced motion the
   chat is simply shown in its final state.
   ========================================================================== */
(function () {
  'use strict';
  var chat = document.querySelector('[data-chat]');
  if (!chat || !('IntersectionObserver' in window)) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  chat.classList.add('is-armed');
  var io = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    requestAnimationFrame(function () { chat.classList.add('is-playing'); });
  }, { threshold: 0.4 });
  io.observe(chat);
})();
