/*!
 * Jaspe-Émeraude Group — assets/js/app.js
 * ---------------------------------------------------------------------------
 * Logique métier du site (aucune dépendance, chargé avec `defer` sur chaque page) :
 *   - langue FR/EN et thème clair/sombre ;
 *   - liens WhatsApp préremplis ;
 *   - fenêtre d’inscription (code JEG-XXXX) et candidature professeur ;
 *   - formulaires Contact / Bénévoles / Sommet (envoi Web3Forms) ;
 *   - professeurs et galeries photo lus depuis Google Sheets ;
 *   - visionneuse photo, copie du numéro, bouton WhatsApp flottant.
 * Documentation complète : docs/app-components.md
 */
(function () {
  'use strict';

  /* ===========================================================================
   * CONFIGURATION — c’est le seul endroit à modifier si une information change.
   * ---------------------------------------------------------------------------
   * WHATSAPP_NUMBER   : numéro WhatsApp au format international, sans « + » ni
   *                     espaces (225 = Côte d’Ivoire). Tous les boutons WhatsApp
   *                     du site l’utilisent. S’il est laissé vide (''), les
   *                     boutons WhatsApp renvoient vers la page Contact.
   * PHONE_DISPLAY     : le même numéro, tel qu’il s’affiche.
   * PAYMENT_NUMBER    : numéro Orange Money / Wave affiché dans les instructions
   *                     de paiement (PAYMENT_NUMBER_RAW = version sans espaces,
   *                     utilisée par les boutons « Copier le numéro »).
   * EMAIL             : adresse de contact affichée.
   * WEB3FORMS_KEY     : clé du service Web3Forms qui transmet les formulaires par
   *                     email (l’adresse de réception se règle sur web3forms.com).
   * FROM_NAME         : nom de l’expéditeur des emails reçus.
   * PROFS_CSV_URL     : onglet « Professeurs » du tableau Google Sheets (CSV).
   * GALLERY_CSV_URL   : onglet « GALERIE » du même tableau (CSV, paramètre gid).
   * PAGES             : noms des pages utilisées par les liens automatiques
   *                     (puces de langues → Équipe, demande « institutions » → Contact).
   * Les prix « à partir de » de la fenêtre d’inscription sont juste en dessous (OFFERS).
   * =========================================================================== */
  var CONFIG = {
    WHATSAPP_NUMBER: '2250798719076',
    PHONE_DISPLAY: '+225 07 98 71 90 76',
    PAYMENT_NUMBER: '07 98 71 90 76',
    PAYMENT_NUMBER_RAW: '0798719076',
    EMAIL: 'manager@jaspeemeraude.com',
    WEB3FORMS_KEY: 'c2c711e6-95c8-4b11-8fde-de5ddcf8389f',
    WEB3FORMS_ENDPOINT: 'https://api.web3forms.com/submit',
    FROM_NAME: 'Site Jaspe-Émeraude Group',
    PROFS_CSV_URL: 'https://docs.google.com/spreadsheets/d/13paSFmg8fTUf8vHr7FkRbzy9-s029JhFKD6BH40KRc0/gviz/tq?tqx=out:csv&headers=0',
    GALLERY_CSV_URL: 'https://docs.google.com/spreadsheets/d/13paSFmg8fTUf8vHr7FkRbzy9-s029JhFKD6BH40KRc0/gviz/tq?tqx=out:csv&headers=0&gid=1789262433',
    PAGES: { team: 'equipe.html', contact: 'contact.html', privacy: 'confidentialite.html' }
  };

  /* Objets des emails envoyés par les formulaires du site (Web3Forms). */
  var FORM_SUBJECTS = {
    contact: 'Site web — Nouveau message (Contact)',
    benevoles: 'Site web — Candidature bénévole',
    sommet: "Site web — Inscription Sommet de l'Excellence"
  };

  /* Message WhatsApp par défaut (boutons .js-wa sans message personnalisé). */
  var WA_DEFAULT = {
    fr: 'Bienvenue chez vous à JASPE-EMERAUDE GROUP ! Bâtissons ensemble, pierre après pierre.',
    en: 'Welcome home to JASPE-EMERAUDE GROUP! Let us build together, stone by stone.'
  };

  /* OFFRES de la fenêtre d’inscription.
     v     : identifiant utilisé par les boutons (data-offer="…") — ne pas modifier ;
     price : prix « à partir de » en FCFA (0 = « prix sur demande via WhatsApp ») ;
     pole  : pôle de l’offre (couleur de la fenêtre) ;
     fr/en : libellés affichés et repris dans le message WhatsApp. */
  var OFFERS = [
    { v: 'camp-seances', price: 3000, pole: 'camp', fr: 'English Camp : séances régulières', en: 'English Camp: regular sessions' },
    { v: 'camp-mini', price: 5000, pole: 'camp', fr: 'English Camp : mini-camp', en: 'English Camp: mini-camp' },
    { v: 'camp-grand', price: 20000, pole: 'camp', fr: 'English Camp : grand camp', en: 'English Camp: grand camp' },
    { v: 'langues', price: 50000, pole: 'langues', fr: 'Langues étrangères : cours', en: 'Foreign languages: lessons' },
    { v: 'training', price: 50000, pole: 'training', fr: "Training / Sommet de l'Excellence : formation", en: 'Training / Excellence Summit: training' },
    { v: 'edition-club', price: 0, pole: 'editions', fr: "Jaspe'e Editions : club de lecture et d'écriture", en: "Jaspe'e Editions: reading & writing club" },
    { v: 'edition-auteur', price: 0, pole: 'editions', fr: "Jaspe'e Editions : accompagnement d'auteur", en: "Jaspe'e Editions: author support" }
  ];
  /* Les 5 pôles : numéro, couleur de section (data-tone) et nom affiché. */
  var POLES = {
    training: { n: '01', tone: 'sommet', fr: 'Training / Sommet de l’Excellence', en: 'Training / Excellence Summit' },
    langues: { n: '02', tone: 'langues', fr: 'Langues étrangères', en: 'Foreign languages' },
    shopping: { n: '03', tone: 'shop', fr: 'Shopping', en: 'Shopping' },
    camp: { n: '04', tone: 'camp', fr: 'English Camp', en: 'English Camp' },
    editions: { n: '05', tone: 'editions', fr: 'Jaspe’e Editions', en: 'Jaspe’e Editions' }
  };
  var LANG_OPTIONS = [
    { v: 'anglais', fr: 'Anglais', en: 'English' },
    { v: 'espagnol', fr: 'Espagnol', en: 'Spanish' },
    { v: 'allemand', fr: 'Allemand', en: 'German' },
    { v: 'chinois', fr: 'Chinois (mandarin)', en: 'Chinese (Mandarin)' },
    { v: 'autre', fr: 'Autre langue', en: 'Another language' }
  ];
  var AGE_OPTIONS = [
    { v: 'enfant', fr: 'Enfant', en: 'Child' },
    { v: 'adolescent', fr: 'Adolescent', en: 'Teenager' },
    { v: 'adulte', fr: 'Adulte', en: 'Adult' }
  ];
  var TEACH_SUBJECTS = [
    { v: 'anglais', fr: 'Anglais', en: 'English' },
    { v: 'espagnol', fr: 'Espagnol', en: 'Spanish' },
    { v: 'allemand', fr: 'Allemand', en: 'German' },
    { v: 'chinois', fr: 'Chinois (mandarin)', en: 'Chinese (Mandarin)' },
    { v: 'litterature', fr: 'Littérature', en: 'Literature' },
    { v: 'francais', fr: 'Français', en: 'French' },
    { v: 'bureautique', fr: 'Bureautique et formation professionnelle', en: 'Office software and professional training' },
    { v: 'autre', fr: 'Autre (à préciser dans le message)', en: 'Other (please specify in the message)' }
  ];
  var CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

  /* ===========================================================================
   * OUTILS
   * =========================================================================== */
  var root = document.documentElement;
  var NBSP = '\u00A0';   /* espace insécable (typographie française) */
  var NNBSP = '\u202F';  /* espace fine insécable (séparateur des milliers en français) */

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function lang() { return root.classList.contains('lang-en') ? 'en' : 'fr'; }
  function tr(fr, en) { return lang() === 'en' ? en : fr; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  /* Texte bilingue échappé : <span class="fr">…</span><span class="en">…</span> */
  function bi(fr, en) {
    fr = esc(fr); en = esc(en == null || en === '' ? fr : en);
    return fr === en ? fr : '<span class="fr">' + fr + '</span><span class="en">' + en + '</span>';
  }
  /* Version HTML brut (contenu déjà sûr). */
  function biHtml(fr, en) { return '<span class="fr">' + fr + '</span><span class="en">' + en + '</span>'; }
  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } }
  };
  function emit(name, detail) {
    var ev;
    try { ev = new CustomEvent(name, { detail: detail }); } catch (e) {
      ev = document.createEvent('CustomEvent'); ev.initCustomEvent(name, false, false, detail);
    }
    document.dispatchEvent(ev);
  }
  /* Demande au moteur d’animation (main.js) de prendre en compte un contenu injecté. */
  function refreshMotion(el) {
    try { if (window.JEG && typeof window.JEG.refresh === 'function') window.JEG.refresh(el); } catch (e) { /* ignore */ }
  }
  var uidN = 0;
  function uid(p) { uidN += 1; return (p || 'jeg') + '-' + uidN; }
  /* Clé de comparaison : minuscules, sans accents ni espaces/ponctuation (« Matières EN » → « matieresen »). */
  function key(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
  }
  function fmtNumber(n, sep) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep); }
  /* Défilement doux : utilise celui du moteur d’animation (main.js) s’il est présent. */
  function smoothScrollTo(el, opts) {
    if (!el) return;
    if (window.JEG && typeof window.JEG.scrollTo === 'function') { window.JEG.scrollTo(el, opts || {}); return; }
    try { el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' }); } catch (e) { el.scrollIntoView(); }
  }
  /* Navigation vers une autre page : avec le rideau de transition de main.js si disponible. */
  function goTo(url) {
    if (window.JEG && typeof window.JEG.navigate === 'function') window.JEG.navigate(url);
    else window.location.href = url;
  }
  function isShown(el) { return !!el && el.isConnected && el.getClientRects().length > 0 && !el.closest('[inert],[hidden]'); }
  function debounce(fn, ms) {
    var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }
  /* Attend la fin d’une transition CSS (avec délai de secours). */
  function afterTransition(el, ms, fn) {
    var done = false;
    function finish(e) {
      if (done || (e && e.target !== el)) return;
      done = true; el.removeEventListener('transitionend', finish); fn();
    }
    if (!el) { fn(); return; }
    el.addEventListener('transitionend', finish);
    setTimeout(finish, ms);
  }

  /* Région « aria-live » commune pour annoncer les confirmations aux lecteurs d’écran. */
  var liveRegion = null;
  function announce(text) {
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.className = 'jeg-sr';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('role', 'status');
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = '';
    setTimeout(function () { liveRegion.textContent = text; }, 60);
  }

  var ICONS = {
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14.5 5.5L8 12l6.5 6.5"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9.5 5.5L16 12l-6.5 6.5"/></svg>',
    zoom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6.5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/></svg>',
    gem: '<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M38 14h44l24 26-46 68L14 40z"/><path d="M14 40h92M38 14l22 26 22-26M60 40v68"/></svg>'
  };
  /* Coche animée des écrans de confirmation (cercle + trait dessinés en CSS). */
  var CHECK_SVG = '<svg class="form-ok__check" viewBox="0 0 52 52" aria-hidden="true" focusable="false"><circle class="form-ok__ring" cx="26" cy="26" r="24" fill="none"/><path class="form-ok__tick" fill="none" d="M15.5 27.5l7 7 14-15"/></svg>';

  /* ===========================================================================
   * 1. LANGUE (FR / EN)
   *    Boutons [data-lang] ; html.lang-en ; placeholders data-ph-fr/en ;
   *    <option data-fr data-en> ; aria-label data-aria-fr/en ; alt data-alt-fr/en ;
   *    <title data-en>. Choix mémorisé (je-lang). Événement « jeg:lang ».
   * =========================================================================== */
  var langHandlers = [];
  function onLang(fn) { langHandlers.push(fn); }

  function applyLang(scope) {
    var l = lang(), ctx = scope || document;
    $$('[data-ph-fr]', ctx).forEach(function (i) {
      var v = l === 'en' ? (i.getAttribute('data-ph-en') || i.getAttribute('data-ph-fr')) : i.getAttribute('data-ph-fr');
      i.setAttribute('placeholder', v);
    });
    $$('option[data-fr], optgroup[data-fr]', ctx).forEach(function (o) {
      var v = o.getAttribute('data-' + l) || o.getAttribute('data-fr');
      if (o.tagName === 'OPTGROUP') o.label = v; else o.textContent = v;
    });
    $$('[data-aria-fr]', ctx).forEach(function (e) {
      e.setAttribute('aria-label', l === 'en' ? (e.getAttribute('data-aria-en') || e.getAttribute('data-aria-fr')) : e.getAttribute('data-aria-fr'));
    });
    $$('[data-alt-fr]', ctx).forEach(function (e) {
      e.setAttribute('alt', l === 'en' ? (e.getAttribute('data-alt-en') || e.getAttribute('data-alt-fr')) : e.getAttribute('data-alt-fr'));
    });
    $$('[data-title-fr]', ctx).forEach(function (e) {
      e.setAttribute('title', l === 'en' ? (e.getAttribute('data-title-en') || e.getAttribute('data-title-fr')) : e.getAttribute('data-title-fr'));
    });
    if (!scope) {
      root.setAttribute('lang', l);
      $$('[data-lang]').forEach(function (b) {
        if (b.tagName === 'BUTTON' || b.getAttribute('role') === 'button') b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === l));
      });
      var t = document.querySelector('title');
      if (t) {
        if (!t.hasAttribute('data-fr')) t.setAttribute('data-fr', t.textContent);
        var title = l === 'en' ? (t.getAttribute('data-en') || t.getAttribute('data-fr')) : t.getAttribute('data-fr');
        if (document.title !== title) document.title = title;
      }
    }
  }

  function setLang(l) {
    l = l === 'en' ? 'en' : 'fr';
    var changed = lang() !== l;
    root.classList.toggle('lang-en', l === 'en');
    store.set('je-lang', l);
    applyLang();
    if (!changed) return;
    langHandlers.forEach(function (fn) { try { fn(l); } catch (e) { /* ignore */ } });
    emit('jeg:lang', { lang: l });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button[data-lang], [role="button"][data-lang]');
    if (!b) return;
    e.preventDefault();
    setLang(b.getAttribute('data-lang'));
  });

  /* ===========================================================================
   * 2. THÈME (clair / sombre) — bouton [data-theme-toggle], mémorisé (je-theme).
   *    Transition circulaire depuis le bouton (View Transitions API) si possible.
   * =========================================================================== */
  function isDark() { return root.classList.contains('dark'); }
  function syncThemeButtons() {
    $$('[data-theme-toggle]').forEach(function (b) { b.setAttribute('aria-pressed', String(isDark())); });
  }
  function applyTheme(dark) {
    root.classList.toggle('dark', dark);
    syncThemeButtons();
    emit('jeg:theme', { theme: dark ? 'dark' : 'light' });
  }
  function toggleTheme(btn) {
    var next = !isDark();
    store.set('je-theme', next ? 'dark' : 'light');
    if (!document.startViewTransition || reducedMotion() || !btn) { applyTheme(next); return; }
    var r = btn.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    root.classList.add('is-theme-vt');
    var vt;
    try { vt = document.startViewTransition(function () { applyTheme(next); }); } catch (e) {
      root.classList.remove('is-theme-vt'); applyTheme(next); return;
    }
    vt.ready.then(function () {
      root.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 720, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(function () { /* ignore */ });
    vt.finished.then(cleanup, cleanup);
    function cleanup() { root.classList.remove('is-theme-vt'); }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-theme-toggle]');
    if (!b) return;
    e.preventDefault();
    toggleTheme(b);
  });
  /* Sans choix enregistré, on suit le réglage du système en direct. */
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onScheme = function (ev) { if (!store.get('je-theme')) applyTheme(ev.matches); };
    if (mq.addEventListener) mq.addEventListener('change', onScheme); else if (mq.addListener) mq.addListener(onScheme);
  }

  /* ===========================================================================
   * 3. WHATSAPP — liens .js-wa (message data-wa-msg-fr / data-wa-msg-en).
   *    « JEG-____ » est remplacé par le dernier code d’inscription (je-last-code).
   * =========================================================================== */
  /* Lien wa.me avec message prérempli (ou page Contact si aucun numéro n’est configuré). */
  function waUrl(msg) {
    if (!CONFIG.WHATSAPP_NUMBER) return CONFIG.PAGES.contact;
    return 'https://wa.me/' + CONFIG.WHATSAPP_NUMBER + (msg ? '?text=' + encodeURIComponent(msg) : '');
  }
  function setWaLink(a, msg) {
    a.setAttribute('href', waUrl(msg));
    if (!CONFIG.WHATSAPP_NUMBER) { a.removeAttribute('target'); return; }
    a.setAttribute('target', '_blank');
    var rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
    if (rel.indexOf('noopener') < 0) a.setAttribute('rel', rel.concat('noopener').join(' '));
  }
  function updateWa(scope) {
    var l = lang(), last = store.get('je-last-code');
    var list = $$('.js-wa', scope);
    if (scope && scope.matches && scope.matches('.js-wa')) list.unshift(scope);
    list.forEach(function (a) {
      var msg = a.getAttribute('data-wa-msg-' + l) || a.getAttribute('data-wa-msg-fr') || WA_DEFAULT[l];
      if (last) msg = msg.replace('JEG-____', last);
      setWaLink(a, msg);
    });
  }
  onLang(function () { updateWa(); });

  /* ===========================================================================
   * 4. FENÊTRES MODALES (inscription, candidature, visionneuse)
   *    Accessibles : role=dialog, aria-modal, piège du focus, Échap, clic à
   *    l’extérieur, retour du focus, défilement bloqué, fenêtres empilables.
   * =========================================================================== */
  var Modal = (function () {
    var stack = [];
    var inertNodes = [];
    var FOCUSABLE = 'a[href],area[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),iframe,[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';

    function focusables(el) {
      return $$(FOCUSABLE, el).filter(function (n) { return n.getClientRects().length > 0 && !n.closest('[hidden],[inert]'); });
    }
    function top() { return stack[stack.length - 1]; }

    function lockScroll() {
      var sbw = window.innerWidth - root.clientWidth;
      root.style.setProperty('--jeg-scrollbar', sbw + 'px');
      root.classList.add('is-scroll-locked');
    }
    function unlockScroll() {
      root.classList.remove('is-scroll-locked');
      root.style.removeProperty('--jeg-scrollbar');
    }
    /* Rend le reste de la page inerte (ni focus, ni lecteur d’écran) sous la fenêtre du dessus. */
    function updateInert() {
      inertNodes.forEach(function (n) { n.removeAttribute('inert'); });
      inertNodes = [];
      var t = top();
      if (!t) return;
      Array.prototype.forEach.call(document.body.children, function (n) {
        /* (la région « aria-live » reste active pour les annonces faites depuis la fenêtre) */
        if (n === t.el || n === liveRegion || n.hasAttribute('inert') || /^(SCRIPT|STYLE|TEMPLATE|LINK)$/.test(n.tagName)) return;
        n.setAttribute('inert', '');
        inertNodes.push(n);
      });
    }

    function open(el, opts) {
      opts = opts || {};
      if (!el || stack.some(function (s) { return s.el === el; })) return;
      var entry = { el: el, trigger: opts.trigger || document.activeElement, onClose: opts.onClose, onKey: opts.onKey };
      stack.push(entry);
      /* Ferme le méga-menu / menu mobile éventuellement ouverts (main.js). */
      try { if (window.JEG && typeof window.JEG.closeMenus === 'function') window.JEG.closeMenus(); } catch (e) { /* ignore */ }
      if (el.parentNode !== document.body || el !== document.body.lastElementChild) document.body.appendChild(el);
      el.style.zIndex = String(80 + stack.length);
      el.hidden = false;
      el.classList.remove('is-closing');
      if (stack.length === 1) lockScroll();
      updateInert();
      root.classList.add('has-modal');
      void el.offsetWidth; // force le calcul du style initial pour la transition
      el.classList.add('is-open');
      var dlg = $('.jm__dialog', el);
      var target = opts.focus || $('[data-autofocus]', el) || dlg;
      try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
      if (dlg) dlg.scrollTop = 0;
      el.scrollTop = 0;
      emit('jeg:modal', { open: true, id: el.id });
    }

    function close(el) {
      var i = -1;
      stack.forEach(function (s, k) { if (s.el === el) i = k; });
      if (i < 0) return;
      var entry = stack.splice(i, 1)[0];
      el.classList.remove('is-open');
      el.classList.add('is-closing');
      var finish = function () {
        if (el.classList.contains('is-open')) return;
        el.classList.remove('is-closing');
        el.hidden = true;
      };
      if (reducedMotion()) finish(); else afterTransition($('.jm__dialog', el), 520, finish);
      updateInert();
      if (!stack.length) { unlockScroll(); root.classList.remove('has-modal'); }
      /* Retour du focus sur le déclencheur ; s’il a disparu (ex. menu mobile refermé),
         sur le bouton du menu ou, à défaut, sur le contenu principal. */
      var t = entry.trigger;
      if (top()) {
        var host = top().el;
        var d = isShown(t) && host.contains(t) ? t : $('.jm__dialog', host);
        if (d) d.focus({ preventScroll: true });
      } else {
        if (!isShown(t) || typeof t.focus !== 'function') {
          t = [$('[data-menu-toggle]'), $('#main'), $('main')].filter(isShown)[0];
          if (t && !t.matches('a,button,input,select,textarea,[tabindex]')) t.setAttribute('tabindex', '-1');
        }
        if (t) { try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } }
      }
      if (entry.onClose) entry.onClose();
      emit('jeg:modal', { open: stack.length > 0, id: el.id });
    }

    /* Clavier : Échap ferme la fenêtre du dessus ; Tab reste piégé dedans. */
    window.addEventListener('keydown', function (e) {
      var t = top();
      if (!t) return;
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault(); e.stopPropagation();
        close(t.el);
        return;
      }
      if (e.key === 'Tab') {
        e.stopPropagation();
        var f = focusables(t.el);
        if (!f.length) { e.preventDefault(); return; }
        var first = f[0], last = f[f.length - 1], a = document.activeElement;
        var inside = t.el.contains(a);
        if (e.shiftKey && (a === first || !inside || a === $('.jm__dialog', t.el))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (a === last || !inside)) { e.preventDefault(); first.focus(); }
        return;
      }
      if (t.onKey) t.onKey(e);
    }, true);
    /* Si le focus s’échappe malgré tout, on le ramène dans la fenêtre. */
    document.addEventListener('focusin', function (e) {
      var t = top();
      if (t && !t.el.contains(e.target)) {
        var d = $('.jm__dialog', t.el); if (d) d.focus({ preventScroll: true });
      }
    });

    /* Clic à l’extérieur (sur le voile) ou sur un bouton [data-jm-close]. */
    var downOutside = false;
    document.addEventListener('pointerdown', function (e) {
      var t = top();
      downOutside = !!(t && t.el.contains(e.target) && !e.target.closest('.jm__dialog'));
    }, true);
    document.addEventListener('click', function (e) {
      var t = top();
      if (!t) return;
      var c = e.target.closest('[data-jm-close]');
      if (c && t.el.contains(c)) { e.preventDefault(); close(t.el); return; }
      if (downOutside && t.el.contains(e.target) && !e.target.closest('.jm__dialog')) close(t.el);
      downOutside = false;
    });

    /* Crée une fenêtre modale dans <body> (injectée une seule fois). */
    function create(o) {
      var el = document.createElement('div');
      el.className = 'jm' + (o.cls ? ' ' + o.cls : '');
      el.id = o.id;
      el.hidden = true;
      var labelAttrs = o.labelledby
        ? ' aria-labelledby="' + o.labelledby + '"'
        : ' aria-label="' + esc(tr(o.label[0], o.label[1])) + '" data-aria-fr="' + esc(o.label[0]) + '" data-aria-en="' + esc(o.label[1]) + '"';
      el.innerHTML =
        '<div class="jm__scrim" aria-hidden="true"></div>' +
        '<div class="jm__dialog" role="dialog" aria-modal="true" tabindex="-1"' + (o.tone ? ' data-tone="' + o.tone + '"' : '') + labelAttrs + '>' +
          '<button type="button" class="jm__close" data-jm-close aria-label="' + esc(tr('Fermer', 'Close')) + '" data-aria-fr="Fermer" data-aria-en="Close">' + ICONS.close + '</button>' +
          o.html +
        '</div>';
      document.body.appendChild(el);
      applyLang(el);
      updateWa(el);
      return el;
    }

    return { open: open, close: close, create: create, isOpen: function () { return stack.length > 0; }, top: top };
  })();

  /* ===========================================================================
   * 5. VALIDATION DES FORMULAIRES (messages bilingues, aria-invalid, aria-describedby)
   * =========================================================================== */
  var ERR = {
    required: ['Ce champ est requis.', 'This field is required.'],
    select: ['Veuillez faire un choix.', 'Please make a selection.'],
    email: ['Adresse email invalide.', 'Please enter a valid email address.'],
    tel: ['Numéro WhatsApp invalide (8 chiffres minimum).', 'Invalid WhatsApp number (at least 8 digits).'],
    check: ['Veuillez cocher cette case pour continuer.', 'Please tick this box to continue.']
  };

  function checkControl(el) {
    if (el.disabled || el.closest('[hidden]')) return null;
    if (el.type === 'checkbox') return el.required && !el.checked ? 'check' : null;
    var v = String(el.value || '').trim();
    if (el.required && !v) return el.tagName === 'SELECT' ? 'select' : 'required';
    if (v && el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'email';
    if (v && (el.type === 'tel' || el.name === 'whatsapp') && v.replace(/\D/g, '').length < 8) return 'tel';
    return null;
  }
  function describedBy(el, id, add) {
    var ids = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean).filter(function (x) { return x !== id; });
    if (add) ids.push(id);
    if (ids.length) el.setAttribute('aria-describedby', ids.join(' ')); else el.removeAttribute('aria-describedby');
  }
  function setFieldError(el, code) {
    var field = el.closest('.field') || el.parentElement;
    var msg = field && field.querySelector('.field__error');
    if (!code) {
      el.removeAttribute('aria-invalid');
      if (field) field.classList.remove('is-invalid');
      if (msg) { describedBy(el, msg.id, false); msg.remove(); }
      return;
    }
    el.setAttribute('aria-invalid', 'true');
    field.classList.add('is-invalid');
    if (!msg) {
      msg = document.createElement('span');
      msg.className = 'field__error';
      msg.id = uid('err');
      field.appendChild(msg);
    }
    describedBy(el, msg.id, true);
    msg.innerHTML = ICONS.alert + '<span>' + biHtml(esc(ERR[code][0]), esc(ERR[code][1])) + '</span>';
  }
  function formControls(form) {
    return $$('input, select, textarea', form).filter(function (el) {
      return el.name && !/^(hidden|submit|button|reset)$/.test(el.type);
    });
  }
  /* Valide tout le formulaire ; renvoie true si tout est correct. */
  function validateForm(form) {
    var first = null;
    formControls(form).forEach(function (el) {
      var c = checkControl(el);
      setFieldError(el, c);
      if (c && !first) first = el;
    });
    if (first) {
      try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
      var f = first.closest('.field') || first;
      if (f.scrollIntoView) f.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
      form.classList.remove('is-shaking'); void form.offsetWidth; form.classList.add('is-shaking');
    }
    return !first;
  }
  /* Une fois signalé, un champ est revérifié pendant la saisie ; l’erreur disparaît dès qu’il est correct. */
  function liveValidation(form) {
    function onEdit(e) {
      var el = e.target;
      if (!el || !el.name || el.getAttribute('aria-invalid') !== 'true') return;
      if (!checkControl(el)) setFieldError(el, null);
    }
    form.addEventListener('input', onEdit);
    form.addEventListener('change', onEdit);
    form.addEventListener('animationend', function (e) { if (e.target === form) form.classList.remove('is-shaking'); });
  }
  function clearErrors(form) { formControls(form).forEach(function (el) { setFieldError(el, null); }); }

  function setLoading(btn, on) {
    if (!btn) return;
    if (on) {
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.classList.add('is-loading');
      if (!$('.btn-spinner', btn)) btn.insertAdjacentHTML('beforeend', '<span class="btn-spinner" aria-hidden="true"></span>');
    } else {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      btn.classList.remove('is-loading');
    }
  }

  function sendWeb3(fd) {
    return fetch(CONFIG.WEB3FORMS_ENDPOINT, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j || !j.success) throw new Error((j && j.message) || 'error'); return j; });
  }

  /* --- Construction des champs (utilisé par les fenêtres d’inscription / candidature) --- */
  function optionsHtml(list, withPrice) {
    return list.map(function (o) {
      return '<option value="' + esc(o.v) + '"' + (withPrice ? ' data-price="' + o.price + '"' : '') +
        ' data-fr="' + esc(o.fr) + '" data-en="' + esc(o.en) + '">' + esc(o.fr) + '</option>';
    }).join('');
  }
  function fieldHtml(o) {
    var id = o.id;
    var label = '<label class="field__label" for="' + id + '">' + biHtml(esc(o.label[0]), esc(o.label[1])) + '</label>';
    var attrs = ' id="' + id + '" name="' + o.name + '"' + (o.required ? ' required' : '') + (o.attrs ? ' ' + o.attrs : '');
    var ctrl;
    if (o.type === 'select') ctrl = '<select' + attrs + '>' + o.options + '</select>';
    else if (o.type === 'textarea') ctrl = '<textarea' + attrs + ' rows="' + (o.rows || 3) + '"></textarea>';
    else ctrl = '<input type="' + (o.type || 'text') + '"' + attrs + '>';
    return '<div class="field' + (o.cls ? ' ' + o.cls : '') + '"' + (o.hidden ? ' hidden' : '') + (o.wrapId ? ' id="' + o.wrapId + '"' : '') + '>' +
      label + ctrl + (o.hint || '') + '</div>';
  }
  function consentHtml(id, fr, en) {
    return '<div class="field field--check"><label class="check" for="' + id + '">' +
      '<input type="checkbox" id="' + id + '" name="consent" required><span class="check__box" aria-hidden="true"></span>' +
      '<span class="check__text">' + biHtml(esc(fr), esc(en)) + '</span></label></div>' +
      '<p class="form__note"><a class="link-privacy" href="' + CONFIG.PAGES.privacy + '" target="_blank" rel="noopener">' +
      biHtml('Politique de confidentialité', 'Privacy policy') + '</a></p>';
  }
  /* Panneau de couleur à gauche des fenêtres (bandeau en haut sur mobile).
     Sa couleur = data-tone (emerald par défaut, couleur du pôle pour l’inscription). */
  function asideHtml(o) {
    return '<aside class="jm__aside" data-tone="' + (o.tone || 'emerald') + '">' +
      '<span class="jm__num" aria-hidden="true">' + (o.num || '') + '</span>' +
      '<p class="jm__kicker">' + o.kicker + '</p>' +
      '<h2 class="jm__title" id="' + o.titleId + '">' + o.title + '</h2>' +
      '<p class="jm__lead">' + o.lead + '</p>' +
      '<p class="jm__pole" hidden></p>' +
      (o.steps ? '<ol class="jm__steps">' + o.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' : '') +
      '</aside>';
  }
  /* Pôle d’une offre d’inscription (camp, langues, training, editions) ou ''. */
  function offerPole(v) {
    for (var i = 0; i < OFFERS.length; i++) if (OFFERS[i].v === v) return OFFERS[i].pole || '';
    return '';
  }

  /* ===========================================================================
   * 6. INSCRIPTION — boutons .js-reg[data-offer][data-lang-pref]
   *    Génère un code JEG-XXXX, prépare le message WhatsApp, envoie une copie
   *    discrète par email (Web3Forms). WhatsApp reste le canal principal.
   * =========================================================================== */
  var Reg = (function () {
    var el, aside, numEl, poleEl, form, formWrap, done, waBtn, codeBox, codeSr, payFr, payEn, priceHint, langWrap, copyBtn;

    function build() {
      if (el) return;
      var stepItems = [
        biHtml('Le formulaire', 'The form'),
        biHtml('L’envoi sur WhatsApp', 'Sending on WhatsApp'),
        biHtml('Le paiement Orange Money ou Wave', 'Payment by Orange Money or Wave')
      ];
      var html =
        '<div class="jm__layout">' +
        asideHtml({
          kicker: biHtml('Inscription', 'Registration'),
          titleId: 'jr-title',
          title: biHtml('S’inscrire.', 'Register.'),
          lead: biHtml('Quelques informations, puis votre code d’inscription JEG-XXXX vous est remis.', 'A few details, then you receive your JEG-XXXX registration code.'),
          steps: stepItems
        }) +
        '<div class="jm__main">' +
          '<div class="reg-form" data-step="form">' +
            '<form class="form" novalidate>' +
              fieldHtml({ id: 'jr-offre', name: 'offre', type: 'select', required: true, label: ['Offre ou session', 'Offer or session'], options: optionsHtml(OFFERS, true), attrs: 'data-autofocus',
                hint: '<p class="field__hint reg-price" aria-live="polite"></p>' }) +
              fieldHtml({ id: 'jr-langue', name: 'langue', type: 'select', label: ['Langue souhaitée', 'Language you want to learn'], options: optionsHtml(LANG_OPTIONS), hidden: true, wrapId: 'jr-langue-wrap', cls: 'field--reveal' }) +
              '<div class="form__row">' +
                fieldHtml({ id: 'jr-participant', name: 'participant', required: true, label: ['Nom du participant', 'Participant’s name'], attrs: 'autocomplete="name"' }) +
                fieldHtml({ id: 'jr-parent', name: 'parent', label: ['Nom du parent (si enfant)', 'Parent’s name (if a child)'], attrs: 'autocomplete="off"' }) +
              '</div>' +
              '<div class="form__row">' +
                fieldHtml({ id: 'jr-age', name: 'age', type: 'select', required: true, label: ['Tranche d’âge', 'Age group'], options: optionsHtml(AGE_OPTIONS) }) +
                fieldHtml({ id: 'jr-whatsapp', name: 'whatsapp', type: 'tel', required: true, label: ['Téléphone WhatsApp', 'WhatsApp number'], attrs: 'inputmode="tel" autocomplete="tel" placeholder="+225 …"' }) +
              '</div>' +
              fieldHtml({ id: 'jr-email', name: 'email', type: 'email', label: ['Email (facultatif)', 'Email (optional)'], attrs: 'autocomplete="email"' }) +
              fieldHtml({ id: 'jr-message', name: 'message', type: 'textarea', rows: 3, label: ['Message (facultatif)', 'Message (optional)'] }) +
              consentHtml('jr-consent', 'J’accepte que mes informations soient utilisées pour traiter mon inscription.', 'I agree that my information may be used to process my registration.') +
              '<div class="form__actions"><button class="btn btn--primary" type="submit"><span class="btn__label">' + biHtml('Valider mon inscription', 'Submit my registration') + '</span></button></div>' +
            '</form>' +
          '</div>' +
          '<div class="reg-done" data-step="done" hidden tabindex="-1">' +
            '<p class="jm__kicker">' + biHtml('Inscription prête', 'Registration ready') + '</p>' +
            '<h3 class="reg-done__title">' + biHtml('Votre code d’inscription', 'Your registration code') + '</h3>' +
            '<div class="reg-code"><strong class="reg-code__value" aria-hidden="true">JEG-0000</strong><span class="jeg-sr reg-code__sr"></span>' +
              '<button type="button" class="reg-code__copy js-copy" data-copy="" data-copied-fr="Code copié ✓" data-copied-en="Code copied ✓"><span class="reg-code__copy-icon">' + ICONS.copy + '</span><span>' + biHtml('Copier le code', 'Copy code') + '</span></button>' +
            '</div>' +
            '<ol class="reg-steps">' +
              '<li>' + biHtml('Envoyez votre inscription sur WhatsApp avec le bouton ci-dessous.', 'Send your registration on WhatsApp using the button below.') + '</li>' +
              '<li><span class="fr reg-pay-fr"></span><span class="en reg-pay-en"></span></li>' +
              '<li>' + biHtml('Envoyez votre preuve de paiement sur WhatsApp en indiquant votre code <b class="reg-code-inline"></b>.', 'Send your proof of payment on WhatsApp, quoting your code <b class="reg-code-inline"></b>.') + '</li>' +
            '</ol>' +
            '<p class="form__note">' + biHtml('Votre inscription est confirmée dès vérification du paiement.', 'Your registration is confirmed once the payment has been verified.') + '</p>' +
            '<div class="reg-actions">' +
              '<a class="btn btn--primary btn--wa reg-wa" href="#" target="_blank" rel="noopener"><span class="btn__label">' + biHtml('Envoyer mon inscription sur WhatsApp', 'Send my registration on WhatsApp') + '</span><span class="btn__icon">' + ICONS.wa + '</span></a>' +
              '<button type="button" class="btn btn--ghost js-copy" data-copy="' + CONFIG.PAYMENT_NUMBER_RAW + '"><span class="btn__label">' + biHtml('Copier le numéro de paiement', 'Copy payment number') + '</span></button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '</div>';
      el = Modal.create({ id: 'jeg-reg-modal', cls: 'jm--form jm--reg', labelledby: 'jr-title', html: html });
      aside = $('.jm__aside', el);
      numEl = $('.jm__num', el);
      poleEl = $('.jm__pole', el);
      form = $('form', el);
      formWrap = $('.reg-form', el);
      done = $('.reg-done', el);
      waBtn = $('.reg-wa', el);
      codeBox = $('.reg-code__value', el);
      codeSr = $('.reg-code__sr', el);
      copyBtn = $('.reg-code__copy', el);
      payFr = $('.reg-pay-fr', el);
      payEn = $('.reg-pay-en', el);
      priceHint = $('.reg-price', el);
      langWrap = $('#jr-langue-wrap', el);
      form.elements.offre.addEventListener('change', sync);
      liveValidation(form);
      form.addEventListener('submit', submit);
    }

    /* Couleur de la fenêtre selon le pôle de l’offre choisie :
       panneau gauche en data-tone (camp, langues, sommet, editions ; emerald sinon)
       et data-pole sur la fenêtre (accents --pole / --pole-fg / --pole-soft). */
    function tint(v) {
      var key = offerPole(v), p = POLES[key];
      aside.setAttribute('data-tone', p ? p.tone : 'emerald');
      if (p) el.setAttribute('data-pole', key); else el.removeAttribute('data-pole');
      numEl.textContent = p ? p.n : '';
      poleEl.hidden = !p;
      poleEl.innerHTML = p ? biHtml('Pôle ' + p.n + ' · ' + esc(p.fr), 'Division ' + p.n + ' · ' + esc(p.en)) : '';
    }
    function priceText(price) {
      if (price > 0) return biHtml('À partir de ' + fmtNumber(price, NNBSP) + NBSP + 'FCFA', 'From ' + fmtNumber(price, ',') + ' FCFA');
      return biHtml('Prix sur demande via WhatsApp.', 'Price on request via WhatsApp.');
    }
    function sync(animate) {
      var isLang = form.elements.offre.value === 'langues';
      var wasHidden = langWrap.hidden;
      langWrap.hidden = !isLang;
      if (isLang && wasHidden && animate !== false) {
        langWrap.classList.remove('is-entering'); void langWrap.offsetWidth; langWrap.classList.add('is-entering');
      }
      var opt = form.elements.offre.selectedOptions[0];
      priceHint.innerHTML = opt ? priceText(parseInt(opt.getAttribute('data-price') || '0', 10)) : '';
      tint(form.elements.offre.value);
    }
    function showForm() {
      form.reset();
      clearErrors(form);
      done.hidden = true;
      formWrap.hidden = false;
      el.classList.remove('is-done');
    }
    function hasOption(select, v) { return !!v && $$('option', select).some(function (o) { return o.value === v; }); }

    function open(offer, trigger, langPref) {
      build();
      if (!done.hidden) showForm();
      if (hasOption(form.elements.offre, offer)) form.elements.offre.value = offer;
      if (langPref) langPref = LANGS.indexOf(subjectKey(langPref)) > -1 ? subjectKey(langPref) : 'autre';
      if (hasOption(form.elements.langue, langPref)) form.elements.langue.value = langPref;
      sync(false);
      Modal.open(el, { trigger: trigger });
    }

    function genCode() {
      var a = CODE_ALPHABET, s = '', u = new Uint32Array(4), i;
      if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(u);
      else for (i = 0; i < 4; i++) u[i] = Math.floor(Math.random() * 4294967296);
      for (i = 0; i < 4; i++) s += a[u[i] % a.length];
      return 'JEG-' + s;
    }

    /* Révélation animée du code : chaque caractère « se taille » avant de se fixer. */
    function revealCode(code) {
      codeSr.textContent = code;
      var wrap = codeBox.parentNode;
      wrap.classList.remove('is-settled');
      if (reducedMotion()) { codeBox.textContent = code; wrap.classList.add('is-settled'); return; }
      var start = null, dur = 1100, fixed = code.slice(0, 4), rand = code.slice(4);
      function frame(now) {
        if (start === null) start = now;
        var p = (now - start) / dur, out = fixed;
        for (var i = 0; i < rand.length; i++) {
          var settleAt = 0.35 + i * 0.17;
          out += p >= settleAt ? rand[i] : CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
        }
        codeBox.textContent = out;
        if (p < 1) requestAnimationFrame(frame);
        else { codeBox.textContent = code; wrap.classList.add('is-settled'); }
      }
      requestAnimationFrame(frame);
    }

    function submit(e) {
      e.preventDefault();
      if (!validateForm(form)) return;
      var l = lang();
      var v = function (k) { return String(form.elements[k].value || '').trim(); };
      var opt = form.elements.offre.selectedOptions[0], ageOpt = form.elements.age.selectedOptions[0];
      var langOpt = form.elements.langue.selectedOptions[0];
      var price = parseInt(opt.getAttribute('data-price') || '0', 10), code = genCode();

      /* Message WhatsApp prérempli (identique au site d’origine). */
      var L = l === 'en'
        ? ['Hello, I would like to register.', 'Code', 'Offer', 'Participant', 'Parent', 'Age group', 'WhatsApp', 'Email', 'Message']
        : ["Bonjour, je souhaite m'inscrire.", 'Code', 'Offre', 'Participant', 'Parent', "Tranche d'âge", 'WhatsApp', 'Email', 'Message'];
      var lines = [L[0], L[1] + ' : ' + code, L[2] + ' : ' + opt.getAttribute('data-' + l), L[3] + ' : ' + v('participant')];
      if (v('parent')) lines.push(L[4] + ' : ' + v('parent'));
      lines.push(L[5] + ' : ' + ageOpt.getAttribute('data-' + l), L[6] + ' : ' + v('whatsapp'));
      if (opt.value === 'langues') lines.splice(3, 0, (l === 'en' ? 'Language' : 'Langue') + ' : ' + langOpt.getAttribute('data-' + l));
      if (v('email')) lines.push(L[7] + ' : ' + v('email'));
      if (v('message')) lines.push(L[8] + ' : ' + v('message'));
      setWaLink(waBtn, lines.join('\n'));

      /* Écran de confirmation */
      var num = CONFIG.PAYMENT_NUMBER.replace(/ /g, NBSP);
      if (price > 0) {
        payFr.textContent = 'Réglez par Orange Money ou Wave au ' + num + NBSP + ': à partir de ' + fmtNumber(price, NNBSP) + NBSP + 'FCFA, selon la formule choisie.';
        payEn.textContent = 'Pay by Orange Money or Wave to ' + num + ': from ' + fmtNumber(price, ',') + ' FCFA, depending on the option chosen.';
      } else {
        payFr.textContent = 'Demandez le prix sur WhatsApp, puis réglez par Orange Money ou Wave au ' + num + '.';
        payEn.textContent = 'Ask for the price on WhatsApp, then pay by Orange Money or Wave to ' + num + '.';
      }
      $$('.reg-code-inline', el).forEach(function (b) { b.textContent = code; });
      copyBtn.setAttribute('data-copy', code);
      formWrap.hidden = true;
      done.hidden = false;
      el.classList.add('is-done');
      revealCode(code);
      store.set('je-last-code', code);
      updateWa();
      var dlg = $('.jm__dialog', el);
      if (dlg) dlg.scrollTop = 0;
      el.scrollTop = 0;
      setTimeout(function () { try { waBtn.focus({ preventScroll: true }); } catch (err) { waBtn.focus(); } }, 40);
      announce(tr('Inscription prête. Votre code : ', 'Registration ready. Your code: ') + code);

      /* Copie par email (envoi discret : WhatsApp reste le canal principal). */
      try {
        var fd = new FormData();
        fd.append('access_key', CONFIG.WEB3FORMS_KEY);
        fd.append('subject', 'Site web — Inscription ' + code + ' — ' + opt.getAttribute('data-fr'));
        fd.append('from_name', CONFIG.FROM_NAME);
        fd.append('formulaire', 'inscription');
        fd.append('code', code);
        fd.append('offre', opt.getAttribute('data-fr'));
        if (opt.value === 'langues') fd.append('langue_souhaitee', langOpt.getAttribute('data-fr'));
        fd.append('participant', v('participant'));
        fd.append('parent', v('parent'));
        fd.append('tranche_age', ageOpt.getAttribute('data-fr'));
        fd.append('whatsapp', v('whatsapp'));
        fd.append('email', v('email'));
        fd.append('message', v('message'));
        fd.append('langue', l);
        fetch(CONFIG.WEB3FORMS_ENDPOINT, { method: 'POST', body: fd, headers: { Accept: 'application/json' } }).catch(function () { /* silencieux */ });
      } catch (err) { /* silencieux */ }
    }

    return { open: open };
  })();

  /* ===========================================================================
   * 7. CANDIDATURE PROFESSEUR — boutons .js-teach[data-subject]
   * =========================================================================== */
  var Teach = (function () {
    var el, form, formWrap, done, waBtn;

    function build() {
      if (el) return;
      var html =
        '<div class="jm__layout">' +
        asideHtml({
          kicker: biHtml('Enseigner avec nous', 'Teach with us'),
          titleId: 'jt-title',
          title: biHtml('Devenir professeur.', 'Become a teacher.'),
          lead: biHtml('Vous enseignez une langue ou une matière ? Envoyez-nous votre candidature.', 'Do you teach a language or a subject? Send us your application.')
        }) +
        '<div class="jm__main">' +
          '<div class="teach-form">' +
            '<form class="form" novalidate>' +
              fieldHtml({ id: 'jt-matiere', name: 'matiere', type: 'select', required: true, label: ['Langue ou matière enseignée', 'Language or subject taught'], options: optionsHtml(TEACH_SUBJECTS), attrs: 'data-autofocus' }) +
              '<div class="form__row">' +
                fieldHtml({ id: 'jt-nom', name: 'nom', required: true, label: ['Nom complet', 'Full name'], attrs: 'autocomplete="name"' }) +
                fieldHtml({ id: 'jt-whatsapp', name: 'whatsapp', type: 'tel', required: true, label: ['Téléphone WhatsApp', 'WhatsApp number'], attrs: 'inputmode="tel" autocomplete="tel" placeholder="+225 …"' }) +
              '</div>' +
              fieldHtml({ id: 'jt-email', name: 'email', type: 'email', label: ['Email (facultatif)', 'Email (optional)'], attrs: 'autocomplete="email"' }) +
              fieldHtml({ id: 'jt-experience', name: 'experience', type: 'textarea', rows: 3, label: ['Diplômes et expérience (facultatif)', 'Qualifications and experience (optional)'] }) +
              fieldHtml({ id: 'jt-dispo', name: 'dispo', label: ['Disponibilités (facultatif)', 'Availability (optional)'], attrs: 'data-ph-fr="Ex. : mercredi et samedi après-midi" data-ph-en="E.g. Wednesday and Saturday afternoons" placeholder="Ex. : mercredi et samedi après-midi"' }) +
              fieldHtml({ id: 'jt-message', name: 'message', type: 'textarea', rows: 3, label: ['Message (facultatif)', 'Message (optional)'] }) +
              consentHtml('jt-consent', 'J’accepte que mes informations soient utilisées pour étudier ma candidature.', 'I agree that my information may be used to review my application.') +
              '<div class="form__actions"><button class="btn btn--primary" type="submit"><span class="btn__label">' + biHtml('Envoyer ma candidature', 'Send my application') + '</span></button></div>' +
            '</form>' +
          '</div>' +
          '<div class="teach-done reg-done" hidden tabindex="-1">' +
            '<span class="reg-done__check">' + CHECK_SVG + '</span>' +
            '<p class="jm__kicker">' + biHtml('Candidature prête', 'Application ready') + '</p>' +
            '<h3 class="reg-done__title">' + biHtml('Dernière étape', 'One last step') + '</h3>' +
            '<p class="reg-done__text">' + biHtml('Envoyez votre candidature sur WhatsApp avec le bouton ci-dessous. Nous reviendrons vers vous très bientôt.', 'Send your application on WhatsApp using the button below. We will get back to you very soon.') + '</p>' +
            '<div class="reg-actions"><a class="btn btn--primary btn--wa teach-wa" href="#" target="_blank" rel="noopener"><span class="btn__label">' + biHtml('Envoyer ma candidature sur WhatsApp', 'Send my application on WhatsApp') + '</span><span class="btn__icon">' + ICONS.wa + '</span></a></div>' +
          '</div>' +
        '</div>' +
        '</div>';
      el = Modal.create({ id: 'jeg-teach-modal', cls: 'jm--form jm--teach', labelledby: 'jt-title', html: html });
      form = $('form', el);
      formWrap = $('.teach-form', el);
      done = $('.teach-done', el);
      waBtn = $('.teach-wa', el);
      liveValidation(form);
      form.addEventListener('submit', submit);
    }

    function open(subject, trigger) {
      build();
      if (!done.hidden) { form.reset(); clearErrors(form); done.hidden = true; formWrap.hidden = false; el.classList.remove('is-done'); }
      if (subject) {
        /* « Anglais », « english », « anglais »… → anglais ; matière inconnue → « Autre ». */
        var k = subjectKey(subject);
        var exists = $$('option', form.elements.matiere).some(function (o) { return o.value === k; });
        form.elements.matiere.value = exists ? k : 'autre';
      }
      Modal.open(el, { trigger: trigger });
    }

    function submit(e) {
      e.preventDefault();
      if (!validateForm(form)) return;
      var l = lang();
      var v = function (k) { return String(form.elements[k].value || '').trim(); };
      var mo = form.elements.matiere.selectedOptions[0];
      var L = l === 'en'
        ? ['Hello, I would like to apply as a teacher.', 'Subject', 'Name', 'WhatsApp', 'Email', 'Qualifications and experience', 'Availability', 'Message']
        : ['Bonjour, je souhaite devenir professeur chez vous.', 'Matière', 'Nom', 'WhatsApp', 'Email', 'Diplômes et expérience', 'Disponibilités', 'Message'];
      var lines = [L[0], L[1] + ' : ' + mo.getAttribute('data-' + l), L[2] + ' : ' + v('nom'), L[3] + ' : ' + v('whatsapp')];
      if (v('email')) lines.push(L[4] + ' : ' + v('email'));
      if (v('experience')) lines.push(L[5] + ' : ' + v('experience'));
      if (v('dispo')) lines.push(L[6] + ' : ' + v('dispo'));
      if (v('message')) lines.push(L[7] + ' : ' + v('message'));
      setWaLink(waBtn, lines.join('\n'));
      formWrap.hidden = true;
      done.hidden = false;
      el.classList.add('is-done');
      var dlg = $('.jm__dialog', el);
      if (dlg) dlg.scrollTop = 0;
      el.scrollTop = 0;
      setTimeout(function () { try { waBtn.focus({ preventScroll: true }); } catch (err) { waBtn.focus(); } }, 40);
      announce(tr('Candidature prête. Dernière étape : envoyez-la sur WhatsApp.', 'Application ready. One last step: send it on WhatsApp.'));
      try {
        var fd = new FormData();
        fd.append('access_key', CONFIG.WEB3FORMS_KEY);
        fd.append('subject', 'Site web — Candidature professeur — ' + mo.getAttribute('data-fr'));
        fd.append('from_name', CONFIG.FROM_NAME);
        fd.append('formulaire', 'candidature-professeur');
        fd.append('matiere', mo.getAttribute('data-fr'));
        fd.append('nom', v('nom'));
        fd.append('whatsapp', v('whatsapp'));
        fd.append('email', v('email'));
        fd.append('diplomes_experience', v('experience'));
        fd.append('disponibilites', v('dispo'));
        fd.append('message', v('message'));
        fd.append('langue_du_site', l);
        fetch(CONFIG.WEB3FORMS_ENDPOINT, { method: 'POST', body: fd, headers: { Accept: 'application/json' } }).catch(function () { /* silencieux */ });
      } catch (err) { /* silencieux */ }
    }

    return { open: open };
  })();

  /* Déclencheurs .js-reg / .js-teach (délégation : fonctionne aussi pour le contenu injecté).
     Phase de capture : passe avant la transition de page de main.js si le déclencheur est un lien. */
  document.addEventListener('click', function (e) {
    if (!e.target.closest || e.button) return;
    var t = e.target.closest('.js-teach');
    if (t) { e.preventDefault(); Teach.open(t.getAttribute('data-subject'), t); return; }
    var r = e.target.closest('.js-reg');
    if (r) { e.preventDefault(); Reg.open(r.getAttribute('data-offer'), r, r.getAttribute('data-lang-pref')); }
  }, true);

  /* ===========================================================================
   * 8. FORMULAIRES DE PAGE — form.js-form[data-form="contact|benevoles|sommet"]
   *    Le bloc de confirmation .form-ok suit immédiatement le formulaire.
   * =========================================================================== */
  function findOk(form) {
    var n = form.nextElementSibling;
    if (n && (n.classList.contains('form-ok') || n.classList.contains('ok'))) return n;
    return form.parentElement ? $('.form-ok', form.parentElement) : null;
  }
  function initPageForm(form) {
    if (form.__jeg) return;
    form.__jeg = true;
    form.setAttribute('novalidate', '');
    var ok = findOk(form);
    if (ok) {
      ok.hidden = true;
      if (!ok.hasAttribute('role')) ok.setAttribute('role', 'status');
      ok.setAttribute('tabindex', '-1');
      if (!$('.form-ok__check', ok)) ok.insertAdjacentHTML('afterbegin', CHECK_SVG);
    }
    liveValidation(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.classList.contains('is-sending')) return;
      var err = $('.form-err', form);
      if (err) err.remove();
      if (!validateForm(form)) return;
      var btn = $('[type="submit"]', form);
      form.classList.add('is-sending');
      setLoading(btn, true);
      var data = new FormData(form);
      data.append('access_key', CONFIG.WEB3FORMS_KEY);
      data.append('subject', FORM_SUBJECTS[form.getAttribute('data-form')] || 'Site web — Message');
      data.append('from_name', CONFIG.FROM_NAME);
      data.append('formulaire', form.getAttribute('data-form'));
      data.append('langue', lang());
      sendWeb3(data).then(function () {
        form.classList.remove('is-sending');
        setLoading(btn, false);
        showSuccess(form, ok);
      }).catch(function () {
        form.classList.remove('is-sending');
        setLoading(btn, false);
        var p = document.createElement('p');
        p.className = 'form-err';
        p.setAttribute('role', 'alert');
        p.innerHTML = ICONS.alert + '<span>' + biHtml('L’envoi a échoué. Réessayez ou écrivez-nous sur WhatsApp.', 'Sending failed. Please try again or message us on WhatsApp.') + '</span>';
        form.appendChild(p);
      });
    });
  }
  function showSuccess(form, ok) {
    var reveal = function () {
      form.hidden = true;
      form.classList.remove('is-leaving');
      if (!ok) { announce(tr('Merci, c’est envoyé.', 'Thank you, it has been sent.')); return; }
      ok.hidden = false;
      ok.classList.remove('is-shown'); void ok.offsetWidth; ok.classList.add('is-shown');
      try { ok.focus({ preventScroll: true }); } catch (e) { ok.focus(); }
      var r = ok.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) ok.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
    };
    if (reducedMotion()) { reveal(); return; }
    form.classList.add('is-leaving');
    setTimeout(reveal, 320);
  }

  /* --- Demande « institutions » : contact.html?sujet=b2b ou lien a[data-subject="b2b"] --- */
  function prefillB2B(form, flash) {
    var p = form.elements.profil, m = form.elements.message;
    if (p) p.value = 'ecole';
    if (m && !m.value) {
      m.value = lang() === 'en'
        ? 'Hello, we would like to request a presentation of your offer for institutions.'
        : 'Bonjour, nous souhaitons recevoir une présentation de votre offre pour les institutions.';
    }
    if (flash) [p, m].forEach(function (x) {
      var f = x && (x.closest('.field') || x);
      if (!f) return;
      f.classList.remove('is-flash'); void f.offsetWidth; f.classList.add('is-flash');
    });
    [p, m].forEach(function (x) { if (x && x.getAttribute('aria-invalid') === 'true' && !checkControl(x)) setFieldError(x, null); });
  }
  function initB2B() {
    var form = $('form.js-form[data-form="contact"]');
    var params;
    try { params = new URLSearchParams(window.location.search); } catch (e) { params = null; }
    if (form && params && params.get('sujet') === 'b2b') prefillB2B(form, true);
    if (!form) {
      $$('a[data-subject="b2b"]').forEach(function (a) {
        var href = a.getAttribute('href') || '';
        if (href.indexOf(CONFIG.PAGES.contact) < 0) a.setAttribute('href', CONFIG.PAGES.contact + '?sujet=b2b#formulaire');
      });
    }
    /* Sur la page qui contient le formulaire : préremplissage sur place, sans recharger
       (phase de capture : passe avant la transition de page de main.js). */
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-subject="b2b"]');
      if (!a || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
      var f = $('form.js-form[data-form="contact"]');
      if (!f) return; /* lien normal vers contact.html?sujet=b2b (transition gérée par main.js) */
      e.preventDefault();
      if (f.hidden) { var ok = findOk(f); if (ok) ok.hidden = true; f.hidden = false; }
      prefillB2B(f, true);
      var target = document.getElementById('formulaire') || f;
      smoothScrollTo(target, { focus: true });
      if (!window.JEG || !window.JEG.scrollTo) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        setTimeout(function () { try { target.focus({ preventScroll: true }); } catch (err) { /* ignore */ } }, 400);
      }
    }, true);
  }

  /* ===========================================================================
   * 9. PROFESSEURS — conteneur [data-teachers] (+ puces [data-teachers-filter])
   *    Lus depuis Google Sheets (PROFS_CSV_URL). Colonnes reconnues (ordre libre,
   *    ligne de titres détectée automatiquement) : NOM, PRENOMS, MATIERES
   *    (+ MATIERES EN), PRESENTATION… (+ EN), POINTS FORTS (+ EN), POLE, PHOTO,
   *    AFFICHAGE (oui/non). Les autres colonnes (heures, tarifs…) ne sont jamais affichées.
   * =========================================================================== */
  function parseCSV(t) {
    var r = [], row = [], f = '', q = false;
    for (var i = 0; i < t.length; i++) {
      var c = t[i];
      if (q) {
        if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && t[i + 1] === '\n') i++;
        row.push(f); r.push(row); row = []; f = '';
      } else f += c;
    }
    if (f || row.length) { row.push(f); r.push(row); }
    return r;
  }
  var sheetCache = {};
  function fetchSheet(url) {
    if (!url) return Promise.reject(new Error('no url'));
    if (!sheetCache[url]) {
      sheetCache[url] = fetch(url, { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
        .then(parseCSV);
    }
    return sheetCache[url];
  }
  /* Lien de partage Google Drive → miniature affichable. */
  function driveImg(u, size) {
    u = String(u || '').trim();
    if (!u) return '';
    var m = u.match(/\/d\/([\w-]{20,})/) || u.match(/[?&]id=([\w-]{20,})/);
    return m ? 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w' + size : u;
  }

  /* Matières connues : accents, majuscules et traduction corrigés à l’affichage. */
  var SUBJ = {
    anglais: ['Anglais', 'English'], espagnol: ['Espagnol', 'Spanish'], allemand: ['Allemand', 'German'],
    chinois: ['Chinois (mandarin)', 'Chinese (Mandarin)'], litterature: ['Littérature', 'Literature'],
    francais: ['Français', 'French'], bureautique: ['Bureautique', 'Office software'],
    lecture: ['Lecture', 'Reading'], ecriture: ['Écriture', 'Writing']
  };
  var LANGS = ['anglais', 'espagnol', 'allemand', 'chinois'];
  var POLES_EN = {
    'langues étrangères': 'Foreign languages', 'training / sommet de l\'excellence': 'Training / Excellence Summit',
    'formation': 'Training', 'sommet de l\'excellence': 'Excellence Summit', 'jaspe\'e editions': "Jaspe'e Editions",
    'jaspe édition': "Jaspe'e Editions", 'english camp': 'English Camp', 'shopping': 'Shopping'
  };
  /* Texte de la colonne POLE → clé de pôle (training, langues, shopping, camp, editions). */
  function poleKey(s) {
    var k = key(s);
    if (!k) return '';
    if (k.indexOf('camp') > -1) return 'camp';
    if (/langue|language/.test(k)) return 'langues';
    if (/edition|jaspee/.test(k)) return 'editions';
    if (/shop|fourniture|boutique/.test(k)) return 'shopping';
    if (/training|sommet|summit|formation/.test(k)) return 'training';
    return '';
  }
  /* Couleur déduite des matières quand la colonne POLE est vide (couleur seulement, jamais de texte). */
  function subjectsPole(keys) {
    for (var i = 0; i < keys.length; i++) {
      if (LANGS.indexOf(keys[i]) > -1) return 'langues';
      if (keys[i] === 'bureautique') return 'training';
      if (keys[i] === 'lecture' || keys[i] === 'ecriture') return 'editions';
    }
    return '';
  }
  function subjectKey(s) {
    var k = key(s);
    if (/mandarin|chinois|chinese/.test(k)) return 'chinois';
    if (/anglais|english/.test(k)) return 'anglais';
    if (/espagnol|spanish/.test(k)) return 'espagnol';
    if (/allemand|german/.test(k)) return 'allemand';
    if (/litterature|literature/.test(k)) return 'litterature';
    if (/francais|french/.test(k)) return 'francais';
    if (/bureautique/.test(k)) return 'bureautique';
    if (/^lecture$|^reading$/.test(k)) return 'lecture';
    if (/^ecriture$|^writing$/.test(k)) return 'ecriture';
    return k;
  }
  function sentenceCase(s) { s = String(s || '').trim().toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); }
  function splitSubjects(s) {
    return String(s || '').split(/\s*(?:&|,|;|\/|\+|·)\s*|\s+et\s+|\s+and\s+/i).map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function titleCase(s) { return s.toLowerCase().replace(/(^|[\s\-'’])(\S)/g, function (m, a, b) { return a + b.toUpperCase(); }); }
  function initials(n) {
    return String(n || '?').trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase();
  }
  function chipList(s) {
    return String(s || '').split(/[,;\n]/).map(function (x) { return x.trim(); }).filter(Boolean)
      .map(function (x) { return x.charAt(0).toUpperCase() + x.slice(1); });
  }

  function parseTeachers(rows) {
    var hi = -1, i;
    for (i = 0; i < Math.min(rows.length, 6); i++) {
      if (rows[i].some(function (c) { return key(c) === 'nom'; })) { hi = i; break; }
    }
    if (hi < 0) return null;
    var H = rows[hi].map(key);
    rows = rows.slice(hi + 1);
    function find(fn) { for (var j = 0; j < H.length; j++) if (H[j] && fn(H[j])) return j; return -1; }
    function isEn(k) { return /en$/.test(k) && !/fr$/.test(k); }
    var C = {
      nom: find(function (k) { return k === 'nom'; }),
      prenom: find(function (k) { return k.indexOf('prenom') === 0 || k.indexOf('prenon') === 0; }),
      matierefr: find(function (k) { return k.indexOf('matiere') === 0 && !isEn(k); }),
      matiereen: find(function (k) { return k.indexOf('matiere') === 0 && isEn(k); }),
      presentationfr: find(function (k) { return k.indexOf('presentation') === 0 && !isEn(k); }),
      presentationen: find(function (k) { return k.indexOf('presentation') === 0 && isEn(k); }),
      pointsfortsfr: find(function (k) { return k.indexOf('pointsfort') === 0 && !isEn(k); }),
      pointsfortsen: find(function (k) { return k.indexOf('pointsfort') === 0 && isEn(k); }),
      pole: find(function (k) { return k.indexOf('pole') === 0; }),
      photo: find(function (k) { return k.indexOf('photo') === 0; }),
      afficher: find(function (k) { return k.indexOf('affich') === 0; })
    };
    function g(r, k) { var j = C[k]; return j == null || j < 0 ? '' : String(r[j] || '').trim(); }
    var labels = {};
    var list = rows.filter(function (r) { var a = key(g(r, 'afficher')); return g(r, 'nom') && (a === 'oui' || a === 'yes'); });
    if (!list.length) return null;
    var teachers = list.map(function (r) {
      var fr = splitSubjects(g(r, 'matierefr')), en = splitSubjects(g(r, 'matiereen')), keys = [];
      fr.forEach(function (x, j) {
        var k = subjectKey(x);
        if (!k) return;
        if (keys.indexOf(k) < 0) keys.push(k);
        if (!SUBJ[k] && !labels[k]) labels[k] = [sentenceCase(x), sentenceCase(en[j] || x)];
      });
      return {
        name: titleCase([g(r, 'prenom'), g(r, 'nom')].filter(Boolean).join(' ')),
        photo: driveImg(g(r, 'photo'), 400),
        pole: g(r, 'pole'),
        bfr: g(r, 'presentationfr'), ben: g(r, 'presentationen'),
        cfr: chipList(g(r, 'pointsfortsfr')), cen: chipList(g(r, 'pointsfortsen')),
        keys: keys
      };
    });
    return { teachers: teachers, labels: labels };
  }

  var teacherGrids = [];
  function TeacherGrid(grid) {
    var self = this;
    this.grid = grid;
    this.T = null;
    this.labels = {};
    this.cur = '';
    this.pending = null;
    var only = (grid.getAttribute('data-only') || '').trim();
    this.only = only ? (key(only) === 'langues' ? LANGS.slice() : only.split(/[\s,]+/).map(subjectKey).filter(Boolean)) : null;
    var sec = grid.closest('section') || document;
    this.filterBox = $('[data-teachers-filter]', sec) || $('[data-teachers-filter]');
    if (this.filterBox && this.filterBox.__jegUsed) this.filterBox = null;
    if (this.filterBox) this.filterBox.__jegUsed = true;
    var initial = grid.getAttribute('data-filter') || '';
    try {
      var q = new URLSearchParams(window.location.search).get('matiere');
      if (q) initial = q;
    } catch (e) { /* ignore */ }
    if (initial) this.pending = subjectKey(initial);

    grid.addEventListener('click', function (e) {
      var b = e.target.closest('.teacher__more');
      if (!b) return;
      var card = b.closest('.teacher');
      var open = card.classList.toggle('is-open');
      b.setAttribute('aria-expanded', String(open));
      b.innerHTML = open ? biHtml('Voir moins', 'Read less') : biHtml('Voir plus', 'Read more');
    });
    /* Photo introuvable → initiales. */
    grid.addEventListener('error', function (e) {
      var img = e.target;
      if (!img || img.tagName !== 'IMG' || !img.closest('.teacher__avatar')) return;
      var av = img.closest('.teacher__avatar');
      av.innerHTML = '<span class="teacher__initials">' + esc(av.getAttribute('data-initials') || '') + '</span>';
    }, true);
    if (this.filterBox) {
      this.filterBox.addEventListener('click', function (e) {
        var b = e.target.closest('.filter-chip');
        if (!b) return;
        var k = b.getAttribute('data-k');
        self.setFilter(k === self.cur ? '' : k, true);
      });
    }
  }
  TeacherGrid.prototype.label = function (k) { return this.labels[k] || SUBJ[k] || [k, k]; };
  TeacherGrid.prototype.load = function (data) {
    var self = this, list = data.teachers;
    this.labels = data.labels;
    if (this.only) list = list.filter(function (t) { return t.keys.some(function (k) { return self.only.indexOf(k) > -1; }); });
    if (!list.length) return; /* rien à afficher : les fiches de secours restent */
    this.T = list;
    this.buildChips();
    this.setFilter(this.pending || '', false);
    this.pending = null;
  };
  TeacherGrid.prototype.count = function (k) { return this.T.filter(function (t) { return t.keys.indexOf(k) > -1; }).length; };
  TeacherGrid.prototype.buildChips = function () {
    var self = this, box = this.filterBox;
    if (!box) return;
    var keys = (this.only || LANGS).slice();
    if (!this.only) this.T.forEach(function (t) { t.keys.forEach(function (k) { if (keys.indexOf(k) < 0) keys.push(k); }); });
    var h = '<p class="teachers-filter__hint">' + biHtml('Cliquez sur une matière pour voir les professeurs qui l’enseignent.', 'Click a subject to see the teachers who teach it.') + '</p>' +
      '<div class="teachers-filter__chips" role="group" aria-label="' + esc(tr('Matières', 'Subjects')) + '" data-aria-fr="Matières" data-aria-en="Subjects">' +
      '<button type="button" class="filter-chip" data-k="" aria-pressed="false">' + biHtml('Tous', 'All') + ' <i>' + this.T.length + '</i></button>';
    keys.forEach(function (k) {
      var L = self.label(k), n = self.count(k);
      h += '<button type="button" class="filter-chip' + (n ? '' : ' is-zero') + '" data-k="' + esc(k) + '" aria-pressed="false">' + bi(L[0], L[1]) + ' <i>' + n + '</i></button>';
    });
    box.innerHTML = h + '</div>';
    box.hidden = false;
    box.classList.add('teachers-filter');
  };
  /* Fiche professeur (v3) : avatar cerclé de la couleur du pôle, matières en puces,
     présentation repliable, points forts, étiquette du pôle (data-pole). */
  TeacherGrid.prototype.cardHtml = function (t, i) {
    var self = this;
    var ini = initials(t.name);
    var av = t.photo
      ? '<span class="teacher__avatar" data-initials="' + esc(ini) + '"><img src="' + esc(t.photo) + '" alt="' + esc(t.name) + '" width="160" height="160" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span>'
      : '<span class="teacher__avatar" aria-hidden="true"><span class="teacher__initials">' + esc(ini) + '</span></span>';
    var subjects = t.keys.length
      ? '<ul class="teacher__subjects" aria-label="' + esc(tr('Matières', 'Subjects')) + '" data-aria-fr="Matières" data-aria-en="Subjects">' +
        t.keys.map(function (k) { var L = self.label(k); return '<li>' + bi(L[0], L[1]) + '</li>'; }).join('') + '</ul>'
      : '';
    var bioId = uid('bio');
    var bio = (t.bfr || t.ben)
      ? '<p class="teacher__bio" id="' + bioId + '">' + bi(t.bfr || t.ben, t.ben || t.bfr) + '</p>' +
        '<button type="button" class="teacher__more" aria-expanded="false" aria-controls="' + bioId + '" hidden>' + biHtml('Voir plus', 'Read more') + '</button>'
      : '';
    var chips = function (arr, cls) { return '<ul class="teacher__chips' + (cls ? ' ' + cls : '') + '">' + arr.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>'; };
    var ch = '';
    if (t.cfr.length || t.cen.length) {
      ch = '<div class="teacher__strengths"><p class="teacher__label">' + biHtml('Points forts', 'Strengths') + '</p>' +
        ((t.cen.length && t.cen.join('|') !== t.cfr.join('|') && t.cfr.length)
          ? chips(t.cfr, 'fr') + chips(t.cen, 'en')
          : chips(t.cfr.length ? t.cfr : t.cen)) + '</div>';
    }
    /* Étiquette du pôle : uniquement si la colonne POLE est remplie dans le tableau. */
    var pk = poleKey(t.pole);
    var pole = t.pole
      ? '<span class="teacher__pole">' + bi(t.pole, POLES_EN[t.pole.toLowerCase()] || (POLES[pk] && POLES[pk].en) || t.pole) + '</span>'
      : '';
    /* Couleur de la fiche : pôle indiqué, sinon déduit des matières (langue → Langues…). */
    var dataPole = pk || subjectsPole(t.keys);
    return '<article class="teacher is-live"' + (dataPole ? ' data-pole="' + dataPole + '"' : '') + ' style="--i:' + i + '">' +
      '<div class="teacher__head">' + av +
        '<span class="teacher__index" aria-hidden="true">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
      '</div>' +
      '<h3 class="teacher__name">' + esc(t.name) + '</h3>' +
      subjects + bio + ch +
      (pole ? '<div class="teacher__foot">' + pole + '</div>' : '') +
      '</article>';
  };
  TeacherGrid.prototype.emptyHtml = function (k) {
    var L = this.label(k);
    /* « Je veux apprendre » ouvre l’inscription sur l’offre correspondante. */
    var offer = k === 'bureautique' ? 'training' : 'langues';
    return '<div class="teachers-empty">' +
      '<span class="teachers-empty__gem">' + ICONS.gem + '</span>' +
      '<p>' + biHtml('Aucun professeur n’est encore présenté pour «' + NBSP + esc(L[0]) + NBSP + '».', 'No teacher is listed yet for “' + esc(L[1]) + '”.') + '</p>' +
      '<div class="teachers-empty__actions">' +
        '<button type="button" class="btn btn--primary btn--sm js-reg" data-offer="' + offer + '"' + (offer === 'langues' ? ' data-lang-pref="' + esc(k) + '"' : '') + '>' + biHtml('Je veux apprendre', 'I want to learn') + '</button>' +
        '<button type="button" class="btn btn--ghost btn--sm js-teach" data-subject="' + esc(k) + '">' + biHtml('Je veux enseigner', 'I want to teach') + '</button>' +
      '</div></div>';
  };
  TeacherGrid.prototype.render = function (animate) {
    var self = this, cur = this.cur;
    var list = cur ? this.T.filter(function (t) { return t.keys.indexOf(cur) > -1; }) : this.T;
    this.grid.innerHTML = list.length ? list.map(function (t, i) { return self.cardHtml(t, i); }).join('') : this.emptyHtml(cur);
    this.grid.classList.add('teachers', 'is-live');
    this.grid.classList.toggle('is-empty', !list.length);
    if (this.filterBox) {
      $$('.filter-chip', this.filterBox).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-k') === cur)); });
    }
    /* Puces de langues de la page : la langue filtrée est mise en évidence. */
    $$('.lchip[data-pf]').forEach(function (c) {
      var on = !!cur && subjectKey(c.getAttribute('data-pf')) === cur;
      c.classList.toggle('is-active', on);
      if (c.tagName === 'BUTTON') c.setAttribute('aria-pressed', String(on));
    });
    this.grid.setAttribute('aria-busy', 'false');
    applyLang(this.grid);
    this.checkBios();
    if (animate !== false) this.animateIn();
    refreshMotion(this.grid);
  };
  TeacherGrid.prototype.animateIn = function () {
    var grid = this.grid;
    grid.classList.remove('is-entering');
    if (reducedMotion() || !('IntersectionObserver' in window)) { grid.classList.remove('is-pending'); return; }
    grid.classList.add('is-pending');
    if (this.io) this.io.disconnect();
    var io = this.io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      grid.classList.remove('is-pending');
      void grid.offsetWidth;
      grid.classList.add('is-entering');
    }, { threshold: 0.01 });
    io.observe(grid);
  };
  TeacherGrid.prototype.checkBios = function () {
    var grid = this.grid;
    requestAnimationFrame(function () {
      $$('.teacher', grid).forEach(function (c) {
        var b = $('.teacher__bio', c), btn = $('.teacher__more', c);
        if (!b || !btn || c.classList.contains('is-open')) return;
        btn.hidden = b.scrollHeight <= b.clientHeight + 2;
      });
    });
  };
  TeacherGrid.prototype.setFilter = function (k, fromUser) {
    k = k ? subjectKey(k) : '';
    if (!this.T) { this.pending = k; return; }
    this.cur = k;
    this.render(true);
    if (fromUser) {
      var L = k ? this.label(k) : ['Tous', 'All'];
      var n = k ? this.count(k) : this.T.length;
      announce(tr(L[0] + NBSP + ': ' + n + ' professeur' + (n > 1 ? 's' : ''), L[1] + ': ' + n + ' teacher' + (n > 1 ? 's' : '')));
    }
  };

  function initTeachers() {
    $$('[data-teachers]').forEach(function (g) { teacherGrids.push(new TeacherGrid(g)); });
    if (teacherGrids.length) {
      teacherGrids.forEach(function (tg) { tg.grid.setAttribute('aria-busy', 'true'); });
      fetchSheet(CONFIG.PROFS_CSV_URL).then(function (rows) {
        var data = parseTeachers(rows);
        teacherGrids.forEach(function (tg) {
          tg.grid.setAttribute('aria-busy', 'false');
          if (data) tg.load(data);
        });
      }).catch(function () {
        /* tableau injoignable : les fiches par défaut restent affichées */
        teacherGrids.forEach(function (tg) { tg.grid.setAttribute('aria-busy', 'false'); });
      });
      window.addEventListener('resize', debounce(function () { teacherGrids.forEach(function (tg) { if (tg.T) tg.checkBios(); }); }, 200), { passive: true });
      onLang(function () { teacherGrids.forEach(function (tg) { if (tg.T) tg.checkBios(); }); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { teacherGrids.forEach(function (tg) { if (tg.T) tg.checkBios(); }); });
    }
    /* Puces de langues .lchip[data-pf] : filtre sur place, sinon page Équipe. */
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.lchip[data-pf]');
      if (!b || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      var k = b.getAttribute('data-pf');
      if (teacherGrids.length) {
        teacherGrids.forEach(function (tg) { tg.setFilter(k, true); });
        smoothScrollTo(document.getElementById('professeurs') || teacherGrids[0].grid);
      } else {
        goTo(CONFIG.PAGES.team + '?matiere=' + encodeURIComponent(k) + '#professeurs');
      }
    }, true);
  }

  /* ===========================================================================
   * 10. GALERIES PHOTO — [data-gallery="english-camp|sommet|editions|poles"]
   *    Les <figure> présentes dans la page servent de secours ; si l’onglet
   *    GALERIE du tableau contient des photos pour ce pôle, elles les remplacent.
   *    Colonnes : PHOTO (lien Drive partagé), LEGENDE, LEGENDE EN, POLE, AFFICHAGE (oui/non).
   * =========================================================================== */
  function galleryTarget(p) {
    p = key(p);
    if (p.indexOf('camp') > -1) return 'english-camp';
    if (p.indexOf('sommet') > -1 || p.indexOf('training') > -1 || p.indexOf('formation') > -1) return 'sommet';
    if (p.indexOf('edition') > -1 || p.indexOf('jaspee') > -1) return 'editions';
    return 'poles';
  }
  /* Légendes saisies en MAJUSCULES sans accents : version soignée + traduction pour les cas connus. */
  var CAPTIONS = {
    premiereedition: ['Première édition', 'First edition'],
    deuxiemeedition: ['Deuxième édition', 'Second edition'],
    troisiemeedition: ['Troisième édition', 'Third edition'],
    retouralalecture: ['Retour à la lecture', 'Retour à la lecture'],
    lajeunesecretaire: ['La jeune secrétaire', 'La jeune secrétaire']
  };
  function looksLikePlaceholder(s) {
    var k = key(s);
    return !k || /alafindelasection|legendeen|traduction|translation|todo|xxx/.test(k);
  }
  function niceCaption(fr, en) {
    fr = String(fr || '').trim(); en = String(en || '').trim();
    var known = CAPTIONS[key(fr)];
    if (looksLikePlaceholder(en)) en = '';
    if (known) return [known[0], en || known[1]];
    if (fr && fr === fr.toUpperCase() && /[A-Z]/.test(fr)) fr = sentenceCase(fr);
    if (en && en === en.toUpperCase() && /[A-Z]/.test(en)) en = sentenceCase(en);
    return [fr, en || fr];
  }
  function parseGallery(rows) {
    var hi = -1, i;
    for (i = 0; i < Math.min(rows.length, 6); i++) {
      if (rows[i].some(function (c) { return key(c).indexOf('photo') === 0; })) { hi = i; break; }
    }
    if (hi < 0) return {};
    var H = rows[hi].map(key);
    rows = rows.slice(hi + 1);
    function col(fn) { for (var j = 0; j < H.length; j++) if (H[j] && fn(H[j])) return j; return -1; }
    var P = col(function (k) { return k.indexOf('photo') === 0; });
    var LF = col(function (k) { return k.indexOf('legende') === 0 && !/en$/.test(k); });
    var LE = col(function (k) { return k.indexOf('legende') === 0 && /en$/.test(k); });
    var PO = col(function (k) { return k.indexOf('pole') === 0; });
    var A = col(function (k) { return k.indexOf('affich') === 0; });
    function g(r, j) { return j < 0 ? '' : String(r[j] || '').trim(); }
    var groups = {};
    rows.forEach(function (r) {
      var a = key(g(r, A)), p = g(r, P);
      if (!p || /\/folders\//.test(p) || (A > -1 && a !== 'oui' && a !== 'yes')) return;
      var cap = niceCaption(g(r, LF), g(r, LE));
      var t = galleryTarget(g(r, PO));
      (groups[t] = groups[t] || []).push({ url: p, fr: cap[0], en: cap[1] });
    });
    return groups;
  }

  function figureCaption(fig) {
    var fc = $('figcaption', fig);
    var fr = fig.getAttribute('data-fr'), en = fig.getAttribute('data-en');
    if (!fr && fc) {
      var f = $('.fr', fc), e = $('.en', fc);
      fr = (f || fc).textContent.trim();
      en = e ? e.textContent.trim() : fr;
    }
    return [fr || '', en || fr || ''];
  }
  /* Rend chaque photo cliquable au clavier (bouton superposé) et prépare la visionneuse. */
  function prepareFigures(box) {
    $$(':scope > figure', box).forEach(function (fig) {
      fig.classList.add('gallery__item');
      var img = $('img', fig);
      var w = img && parseFloat(img.getAttribute('width')), h = img && parseFloat(img.getAttribute('height'));
      if (w && h && !fig.style.getPropertyValue('--r')) fig.style.setProperty('--r', (w / h).toFixed(4));
      if ($('.gallery__zoom', fig)) return;
      var cap = figureCaption(fig);
      var fr = 'Agrandir la photo' + (cap[0] ? NBSP + ': ' + cap[0] : '');
      var en = 'Enlarge photo' + (cap[1] ? ': ' + cap[1] : '');
      fig.insertAdjacentHTML('beforeend', '<button type="button" class="gallery__zoom" aria-haspopup="dialog" aria-label="' + esc(tr(fr, en)) + '" data-aria-fr="' + esc(fr) + '" data-aria-en="' + esc(en) + '"><span class="gallery__zoom-icon">' + ICONS.zoom + '</span></button>');
    });
  }
  /* Mise en page « justifiée » : chaque rangée occupe toute la largeur, les photos
     gardent leurs proportions et la hauteur des rangées reste proche de la cible. */
  function figRatio(fig) {
    var r = parseFloat(fig.style.getPropertyValue('--r'));
    return r > 0.2 && r < 6 ? r : 4 / 3;
  }
  function justifyGallery(box) {
    if (box.classList.contains('gallery--rail')) return;
    var figs = $$(':scope > figure', box);
    var cs = getComputedStyle(box);
    var W = Math.floor(box.getBoundingClientRect().width - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0)) - 1;
    if (!figs.length || W < 100) return;
    var gap = parseFloat(cs.columnGap) || 0;
    var target = W < 560 ? 150 : W < 900 ? 210 : 270;
    var rows = [], row = [], sum = 0;
    figs.forEach(function (f) {
      var r = figRatio(f);
      row.push(f); sum += r;
      var h = (W - gap * (row.length - 1)) / sum;
      if (h > target) return;
      if (row.length > 1) {
        var prevH = (W - gap * (row.length - 2)) / (sum - r);
        if (prevH - target < target - h) { row.pop(); rows.push({ items: row, h: prevH, full: true }); row = [f]; sum = r; return; }
      }
      rows.push({ items: row, h: h, full: true }); row = []; sum = 0;
    });
    if (row.length) {
      var hl = (W - gap * (row.length - 1)) / sum;
      var prev = rows[rows.length - 1];
      var merged = prev ? prev.items.concat(row) : null;
      var hm = merged ? (W - gap * (merged.length - 1)) / merged.reduce(function (a, f) { return a + figRatio(f); }, 0) : 0;
      /* Évite une photo orpheline en dernière rangée : on la regroupe si la rangée reste assez haute. */
      if (hl > target * 1.2 && merged && hm >= target * 0.62) rows[rows.length - 1] = { items: merged, h: hm, full: true };
      else rows.push({ items: row, h: Math.min(hl, target * 1.2), full: hl <= target * 1.2 });
    }
    rows.forEach(function (rw) {
      var used = 0, n = rw.items.length;
      rw.items.forEach(function (f, i) {
        var w = Math.floor(figRatio(f) * rw.h);
        if (rw.full && i === n - 1) w = W - used - gap * (n - 1);
        used += w;
        f.style.width = w + 'px';
        f.style.height = Math.round(rw.h) + 'px';
      });
    });
    box.classList.add('is-justified');
  }
  var justifyQueue = [];
  function queueJustify(box) {
    if (justifyQueue.indexOf(box) < 0) justifyQueue.push(box);
    if (justifyQueue.length > 1) return;
    requestAnimationFrame(function () {
      var q = justifyQueue.slice(); justifyQueue = [];
      q.forEach(justifyGallery);
    });
  }
  function liveFigureHtml(it) {
    var s = function (w) { return driveImg(it.url, w); };
    return '<figure class="gallery__item is-live" data-fr="' + esc(it.fr) + '" data-en="' + esc(it.en) + '">' +
      '<img src="' + esc(s(1200)) + '" srcset="' + esc(s(600)) + ' 600w, ' + esc(s(1200)) + ' 1200w, ' + esc(s(1600)) + ' 1600w"' +
      ' sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw" alt="' + esc(it.fr) + '" data-alt-fr="' + esc(it.fr) + '" data-alt-en="' + esc(it.en) + '"' +
      ' width="1200" height="900" loading="lazy" decoding="async" referrerpolicy="no-referrer">' +
      (it.fr ? '<figcaption>' + bi(it.fr, it.en) + '</figcaption>' : '') +
      '</figure>';
  }
  function renderLiveGallery(box, items) {
    var fallback = $$(':scope > figure', box);
    var anchor = fallback[0] || null;
    var frag = document.createElement('div');
    frag.innerHTML = items.map(liveFigureHtml).join('');
    var live = Array.prototype.slice.call(frag.children);
    /* Les nouvelles photos reprennent les attributs d’animation (data-reveal…) des photos de secours. */
    var revealAttrs = anchor ? Array.prototype.filter.call(anchor.attributes, function (a) { return a.name.indexOf('data-reveal') === 0; }) : [];
    live.forEach(function (f, i) {
      f.style.setProperty('--i', i);
      revealAttrs.forEach(function (a) { f.setAttribute(a.name, a.value); });
      box.insertBefore(f, anchor);
    });
    fallback.forEach(function (f) { f.remove(); });
    box.__fallback = fallback;
    box.classList.add('is-live');
    box.setAttribute('data-gallery-source', 'sheet');
    setGalleryEmpty(box);
    prepareFigures(box);
    applyLang(box);
    justifyGallery(box);
    /* Photo Drive inaccessible → retirée ; si plus aucune, on remet les photos de secours. */
    live.forEach(function (fig) {
      var img = $('img', fig);
      img.addEventListener('error', function () {
        fig.remove();
        if (!$('figure.is-live', box) && box.__fallback) {
          box.__fallback.forEach(function (f) { box.appendChild(f); });
          box.classList.remove('is-live');
          box.removeAttribute('data-gallery-source');
          refreshMotion(box);
        }
        setGalleryEmpty(box);
        queueJustify(box);
      });
      var onLoad = function () {
        if (img.naturalWidth) fig.style.setProperty('--r', (img.naturalWidth / img.naturalHeight).toFixed(4));
        fig.classList.add('is-loaded');
        queueJustify(box);
      };
      img.addEventListener('load', onLoad);
      if (img.complete && img.naturalWidth) onLoad();
    });
    refreshMotion(box);
  }
  /* Galerie sans aucune photo (ni de secours, ni du tableau) : masquée, ainsi que
     son bloc parent éventuel [data-gallery-block] (titre « En images » compris). */
  function setGalleryEmpty(box) {
    var empty = !$(':scope > figure', box);
    box.hidden = empty;
    var block = box.closest('[data-gallery-block]');
    if (block) block.hidden = empty;
  }
  function initGalleries() {
    var boxes = $$('[data-gallery]');
    if (!boxes.length) return;
    boxes.forEach(function (b) { b.classList.add('gallery'); setGalleryEmpty(b); prepareFigures(b); justifyGallery(b); });
    if ('ResizeObserver' in window) {
      var widths = new WeakMap();
      var ro = new ResizeObserver(function (entries) {
        entries.forEach(function (en) {
          var w = Math.round(en.contentRect.width);
          if (widths.get(en.target) !== w) { widths.set(en.target, w); queueJustify(en.target); }
        });
      });
      boxes.forEach(function (b) { ro.observe(b); });
    } else {
      window.addEventListener('resize', debounce(function () { boxes.forEach(justifyGallery); }, 150), { passive: true });
    }
    fetchSheet(CONFIG.GALLERY_CSV_URL).then(function (rows) {
      var groups = parseGallery(rows);
      boxes.forEach(function (b) {
        var items = groups[b.getAttribute('data-gallery')];
        if (items && items.length) renderLiveGallery(b, items);
      });
    }).catch(function () { /* tableau injoignable : les photos du site restent */ });
    document.addEventListener('click', function (e) {
      var z = e.target.closest && e.target.closest('.gallery__zoom');
      if (!z) return;
      e.preventDefault();
      var fig = z.closest('figure'), box = fig.closest('[data-gallery]');
      var figs = $$(':scope > figure', box);
      Lightbox.open(figs, figs.indexOf(fig), z);
    });
  }

  /* ===========================================================================
   * 11. VISIONNEUSE PHOTO (lightbox) — flèches, ← →, Échap, balayage tactile
   * =========================================================================== */
  var Lightbox = (function () {
    var el, stage, img, capEl, countEl, prevBtn, nextBtn;
    var items = [], index = 0, token = 0, ratio = 4 / 3, figs = [];

    function largest(im) {
      var set = im.getAttribute('srcset');
      if (!set) return im.currentSrc || im.src;
      var best = null, bw = 0;
      set.split(',').forEach(function (part) {
        var bits = part.trim().split(/\s+/), w = parseInt(bits[1], 10) || 0;
        if (bits[0] && w >= bw) { bw = w; best = bits[0]; }
      });
      return best ? new URL(best, document.baseURI).href : (im.currentSrc || im.src);
    }
    function itemFrom(fig) {
      var im = $('img', fig), cap = figureCaption(fig);
      return { fig: fig, thumb: im, large: im ? largest(im) : '', alt: im ? im.alt : '', fr: cap[0], en: cap[1] };
    }
    function build() {
      if (el) return;
      el = Modal.create({
        id: 'jeg-lightbox', cls: 'jm--lightbox', tone: 'ink', label: ['Galerie photo', 'Photo gallery'],
        html:
          '<div class="lb">' +
            '<p class="lb__count" aria-live="polite"><span class="lb__i">01</span><span class="lb__sep">/</span><span class="lb__n">01</span></p>' +
            '<div class="lb__stage"><div class="lb__frame"><img class="lb__img" alt="" decoding="async"></div><span class="lb__spinner" aria-hidden="true"></span></div>' +
            '<p class="lb__caption"></p>' +
            '<button type="button" class="lb__nav lb__nav--prev" aria-label="Photo précédente" data-aria-fr="Photo précédente" data-aria-en="Previous photo">' + ICONS.prev + '</button>' +
            '<button type="button" class="lb__nav lb__nav--next" aria-label="Photo suivante" data-aria-fr="Photo suivante" data-aria-en="Next photo">' + ICONS.next + '</button>' +
          '</div>'
      });
      stage = $('.lb__stage', el);
      img = $('.lb__img', el);
      capEl = $('.lb__caption', el);
      countEl = $('.lb__count', el);
      prevBtn = $('.lb__nav--prev', el);
      nextBtn = $('.lb__nav--next', el);
      prevBtn.addEventListener('click', function () { go(-1); });
      nextBtn.addEventListener('click', function () { go(1); });
      /* Clic sur le fond (pas sur la photo ni les boutons) = fermer. */
      var lbRoot = $('.lb', el);
      lbRoot.addEventListener('click', function (e) { if (e.target === lbRoot || e.target === stage) Modal.close(el); });
      swipe(lbRoot);
      window.addEventListener('resize', debounce(fit, 120), { passive: true });
    }
    function fit() {
      if (!el || el.hidden) return;
      var small = window.innerWidth < 700;
      var maxW = Math.min(window.innerWidth - (small ? 24 : 240), 1500);
      var maxH = window.innerHeight - (small ? 250 : 170) - (capEl.hidden ? -40 : 0);
      var w = maxW, h = w / ratio;
      if (h > maxH) { h = maxH; w = h * ratio; }
      img.style.width = Math.round(w) + 'px';
      img.style.height = Math.round(h) + 'px';
    }
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function meta() {
      var it = items[index];
      $('.lb__i', countEl).textContent = pad(index + 1);
      $('.lb__n', countEl).textContent = pad(items.length);
      capEl.innerHTML = it.fr ? bi(it.fr, it.en) : '';
      capEl.hidden = !it.fr;
      img.alt = tr(it.fr || it.alt, it.en || it.alt);
      var multi = items.length > 1;
      prevBtn.hidden = nextBtn.hidden = !multi;
      el.classList.toggle('is-single', !multi);
    }
    function loadImage(src) {
      return new Promise(function (res, rej) {
        var im = new Image();
        im.decoding = 'async';
        im.referrerPolicy = 'no-referrer';
        im.onload = function () { res(im); };
        im.onerror = rej;
        im.src = src;
      });
    }
    function preload(i) {
      var it = items[(i + items.length) % items.length];
      if (it && !it.pre) { it.pre = true; loadImage(it.large).catch(function () { /* ignore */ }); }
    }
    function show(i, dir, zoomFrom) {
      index = (i + items.length) % items.length;
      var it = items[index], my = ++token;
      meta();
      var th = it.thumb;
      var thumbReady = th && th.complete && th.naturalWidth > 0;
      var animateIn = function () {
        if (reducedMotion()) return;
        if (zoomFrom && thumbReady) {
          var a = th.getBoundingClientRect(), b = img.getBoundingClientRect();
          if (a.width && b.width) {
            var s = Math.max(a.width / b.width, a.height / b.height);
            var dx = (a.left + a.width / 2) - (b.left + b.width / 2), dy = (a.top + a.height / 2) - (b.top + b.height / 2);
            img.animate([
              { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')', opacity: 0.35, clipPath: 'inset(8% round 18px)' },
              { transform: 'none', opacity: 1, clipPath: 'inset(0% round 18px)' }
            ], { duration: 620, easing: 'cubic-bezier(.22,1,.36,1)' });
            return;
          }
        }
        var off = dir ? dir * 48 : 0;
        img.animate([
          { transform: 'translateX(' + off + 'px) scale(.985)', opacity: 0 },
          { transform: 'none', opacity: 1 }
        ], { duration: 460, easing: 'cubic-bezier(.22,1,.36,1)' });
      };
      if (thumbReady) {
        ratio = th.naturalWidth / th.naturalHeight || ratio;
        img.src = th.currentSrc || th.src;
        fit();
        animateIn();
        el.classList.remove('is-loading');
        if (it.large && it.large !== img.src) {
          loadImage(it.large).then(function (im) {
            if (my !== token) return;
            img.src = im.src;
          }).catch(function () { /* on garde la miniature */ });
        }
      } else {
        el.classList.add('is-loading');
        loadImage(it.large).then(function (im) {
          if (my !== token) return;
          ratio = im.naturalWidth / im.naturalHeight || ratio;
          img.src = im.src;
          fit();
          el.classList.remove('is-loading');
          animateIn();
        }).catch(function () { if (my === token) el.classList.remove('is-loading'); });
      }
      preload(index + 1); preload(index - 1);
    }
    function go(d) { if (items.length > 1) show(index + d, d); }
    /* Balayage tactile : la photo suit le doigt, puis passe à la suivante / précédente. */
    function swipe(area) {
      var x0 = null, y0 = 0, dx = 0, pid = null;
      area.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' || items.length < 2 || e.target.closest('button')) return;
        x0 = e.clientX; y0 = e.clientY; dx = 0; pid = e.pointerId;
      });
      area.addEventListener('pointermove', function (e) {
        if (x0 === null || e.pointerId !== pid) return;
        dx = e.clientX - x0;
        if (Math.abs(dx) > Math.abs(e.clientY - y0)) img.style.transform = 'translateX(' + dx + 'px)';
      });
      var end = function () {
        if (x0 === null) return;
        x0 = null;
        img.style.transform = '';
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      };
      area.addEventListener('pointerup', end);
      area.addEventListener('pointercancel', end);
    }
    function onKey(e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'Home') { e.preventDefault(); show(0, -1); }
      else if (e.key === 'End') { e.preventDefault(); show(items.length - 1, 1); }
    }
    function open(figList, i, trigger) {
      build();
      figs = figList;
      items = figList.map(itemFrom).filter(function (it) { return it.thumb; });
      if (!items.length) return;
      Modal.open(el, {
        trigger: trigger,
        focus: $('.jm__close', el),
        onKey: onKey,
        onClose: function () {
          /* Le focus revient sur la dernière photo affichée. */
          var f = items[index] && items[index].fig, z = f && $('.gallery__zoom', f);
          if (z && z !== trigger) { try { z.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
        }
      });
      show(Math.max(0, i), 0, true);
    }
    onLang(function () { if (el && !el.hidden && items[index]) meta(); });
    return { open: open };
  })();

  /* ===========================================================================
   * 12. COPIE — boutons .js-copy[data-copy] (ex. numéro de paiement)
   * =========================================================================== */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    var t = document.createElement('textarea');
    t.value = text;
    t.setAttribute('readonly', '');
    t.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
    document.body.appendChild(t);
    t.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    t.remove();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.js-copy');
    if (!b) return;
    e.preventDefault();
    var text = b.getAttribute('data-copy') || b.getAttribute('data-num') || '';
    if (!text) return;
    copyText(text).then(function () { copyFeedback(b); }, function () { copyFeedback(b); });
  });
  function copyFeedback(b) {
    var fr = b.getAttribute('data-copied-fr') || 'Numéro copié ✓';
    var en = b.getAttribute('data-copied-en') || 'Number copied ✓';
    if (b.__copyTimer) clearTimeout(b.__copyTimer);
    if (!b.__copyHtml) {
      b.__copyHtml = b.innerHTML;
      b.style.minWidth = b.getBoundingClientRect().width + 'px';
    }
    b.innerHTML = '<span class="copy-done">' + biHtml(esc(fr), esc(en)) + '</span>';
    b.classList.remove('is-copied'); void b.offsetWidth; b.classList.add('is-copied');
    announce(tr(fr, en));
    b.__copyTimer = setTimeout(function () {
      b.innerHTML = b.__copyHtml;
      b.__copyHtml = null;
      b.style.minWidth = '';
      b.classList.remove('is-copied');
    }, 2200);
  }

  /* ===========================================================================
   * 13. BOUTON WHATSAPP FLOTTANT (injecté sur chaque page)
   *     Masqué quand le pied de page est visible ou qu’une fenêtre est ouverte.
   *     Ajoutez data-no-wa-float sur <body> pour ne pas l’afficher sur une page.
   * =========================================================================== */
  function initFloat() {
    if (document.body.hasAttribute('data-no-wa-float') || $('.wa-float')) return;
    var a = document.createElement('a');
    a.className = 'wa-float js-wa';
    a.href = waUrl('');
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('data-aria-fr', 'Nous écrire sur WhatsApp');
    a.setAttribute('data-aria-en', 'Message us on WhatsApp');
    a.setAttribute('aria-label', tr('Nous écrire sur WhatsApp', 'Message us on WhatsApp'));
    a.innerHTML = '<span class="wa-float__icon">' + ICONS.wa + '</span><span class="wa-float__label" aria-hidden="true">' + biHtml('Écrivez-nous', 'Message us') + '</span>';
    document.body.appendChild(a);
    updateWa(a);
    var show = function () { a.classList.add('is-ready'); };
    if (window.JEG && window.JEG.isReady) show();
    else {
      document.addEventListener('jeg:ready', show, { once: true });
      setTimeout(show, 2600); /* secours si le chargeur ne signale rien */
    }
    var footer = $('.site-footer') || $('body > footer') || $('footer');
    if (footer && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        a.classList.toggle('is-hidden', es[0].isIntersecting);
      }, { rootMargin: '0px 0px -12% 0px' }).observe(footer);
    }
  }

  /* ===========================================================================
   * INITIALISATION
   * =========================================================================== */
  function init() {
    /* Secours si le script de démarrage du <head> est absent : langue et thème mémorisés. */
    var savedLang = store.get('je-lang'), savedTheme = store.get('je-theme');
    if (savedLang === 'en' || savedLang === 'fr') root.classList.toggle('lang-en', savedLang === 'en');
    if (savedTheme === 'dark' || savedTheme === 'light') root.classList.toggle('dark', savedTheme === 'dark');
    applyLang();
    syncThemeButtons();
    updateWa();
    $$('form.js-form[data-form]').forEach(initPageForm);
    initB2B();
    initTeachers();
    initGalleries();
    initFloat();
    root.classList.add('app-ready');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  /* Petite API publique (utile pour le contenu injecté ou le débogage). */
  window.JEGApp = {
    config: CONFIG,
    lang: lang,
    setLang: setLang,
    applyLang: applyLang,
    updateWa: updateWa,
    openRegistration: function (offer, langPref) { Reg.open(offer, document.activeElement, langPref); },
    openTeacher: function (subject) { Teach.open(subject, document.activeElement); },
    openLightbox: function (figures, index) { Lightbox.open(figures, index || 0, document.activeElement); },
    initForm: initPageForm,
    filterTeachers: function (k) { teacherGrids.forEach(function (tg) { tg.setFilter(k, true); }); },
    modal: Modal
  };
})();
