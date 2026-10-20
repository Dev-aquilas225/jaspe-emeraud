# Business components — `assets/js/app.js` + `assets/css/app.css`

Everything the site *does* (registration, WhatsApp, forms, teachers, galleries…) lives in
`assets/js/app.js` (no dependency, loaded with `defer` after `main.js`) and is styled by
`assets/css/app.css` (loaded after `main.css`). Page agents only write **markup with the hooks
below** — no page-level JS is needed for any of these features.

```html
<link rel="stylesheet" href="assets/css/main.css">
<link rel="stylesheet" href="assets/css/app.css">
<script defer src="assets/js/main.js"></script>
<script defer src="assets/js/app.js"></script>
```

**Colour rule (v3).** Every component uses only the semantic variables of `main.css`
(`--bg --fg --fg-2 --accent --accent-fg --surface --surface-fg --border --btn-bg --btn-fg
--chip-bg --chip-fg --focus`), `--pole / --pole-fg / --pole-soft` (via `data-pole`) or
`currentColor`. So a form, a teacher grid or a gallery dropped inside **any**
`data-tone="…"` section (or a `.card`) adapts by itself, in light and dark mode.
Do not restyle them per page; if something looks wrong inside a tone, fix the tone variables.

---

## 0. What app.js does on every page (nothing to add)

| Feature | Details |
|---|---|
| FR/EN switch | `button[data-lang="fr|en"]` anywhere. Toggles `html.lang-en`, `html[lang]`, `aria-pressed`, `<title data-en>`, `[data-ph-fr/en]` placeholders, `<option|optgroup data-fr data-en>`, `[data-aria-fr/en]` aria-labels, `[data-alt-fr/en]` alts, `[data-title-fr/en]` titles. Stored in `localStorage['je-lang']`. Dispatches `document` event **`jeg:lang`** (`detail.lang`). |
| Theme toggle | `[data-theme-toggle]` button. Toggles `html.dark`, sets `aria-pressed`, stores `localStorage['je-theme']` (`dark`/`light`), circular View-Transition from the button. Follows the OS live while nothing is stored. Dispatches `jeg:theme`. |
| WhatsApp links | every `.js-wa` gets its `wa.me` URL in the current language (see §3). |
| Floating WhatsApp button | `.wa-float` injected bottom-right, shown after `jeg:ready`, hidden while the footer is visible, a modal is open or the mobile menu is open (`html.menu-open`). Opt out per page: `<body data-no-wa-float>`. |
| Modals | registration, teacher application and photo viewer are **injected** in `<body>` on first use: `role="dialog"`, `aria-modal`, focus trap, Esc, outside click, focus returned to the trigger, scroll lock (`html.is-scroll-locked`, scrollbar width in `--jeg-scrollbar`), the rest of the page made `inert`, stackable. While one is open: `html.has-modal`. Dispatches `jeg:modal`. |
| Motion engine | injected/replaced content is passed to `window.JEG.refresh(el)`; page jumps use `JEG.scrollTo` / `JEG.navigate` when available. |

Head boot script (partials/head.html) sets `lang-en` / `dark` before paint; app.js also re-reads
`je-lang` / `je-theme` as a fallback.

Lang switch & theme toggle (header partial):

```html
<div class="lang-switch" role="group" aria-label="Langue / Language">
  <button type="button" data-lang="fr" aria-pressed="true">FR</button>
  <button type="button" data-lang="en" aria-pressed="false">EN</button>
</div>
<button type="button" class="theme-toggle" data-theme-toggle aria-pressed="false"
        aria-label="Mode sombre" data-aria-fr="Mode sombre" data-aria-en="Dark mode">…icons…</button>
```

---

## 1. Registration buttons — `.js-reg[data-offer]`

Any `<button>` (or `<a>`) with `.js-reg` opens the registration modal. `data-offer` preselects the
offer; the modal's colour panel takes the offer's pôle colour (`data-tone`) and a
« Pôle 0X · … » pill. Without `data-offer` (header CTA) the first offer is preselected and the panel is emerald.

| `data-offer` | Shown label (FR) | From (FCFA) | Pôle → modal tone |
|---|---|---|---|
| `camp-seances` | English Camp : séances régulières | 3 000 | camp → `camp` |
| `camp-mini` | English Camp : mini-camp | 5 000 | camp → `camp` |
| `camp-grand` | English Camp : grand camp | 20 000 | camp → `camp` |
| `langues` | Langues étrangères : cours | 50 000 | langues → `langues` |
| `training` | Training / Sommet de l'Excellence : formation | 50 000 | training → `sommet` |
| `edition-club` | Jaspe'e Editions : club de lecture et d'écriture | price on request | editions → `editions` |
| `edition-auteur` | Jaspe'e Editions : accompagnement d'auteur | price on request | editions → `editions` |

`data-lang-pref="anglais|espagnol|allemand|chinois|autre"` (only with `langues`) preselects the
language (any spelling: « Espagnol », `spanish`…; unknown → « Autre langue »).

```html
<!-- header CTA (no offer) -->
<button type="button" class="btn btn--primary btn--sm js-reg"><span class="fr">S’inscrire</span><span class="en">Register</span></button>

<!-- English Camp -->
<button type="button" class="btn btn--primary js-reg" data-offer="camp-seances"><span class="fr">Inscrire mon enfant</span><span class="en">Enrol my child</span></button>
<button type="button" class="btn btn--primary btn--sm js-reg" data-offer="camp-mini"><span class="fr">S’inscrire</span><span class="en">Register</span></button>
<button type="button" class="btn btn--primary btn--sm js-reg" data-offer="camp-grand"><span class="fr">S’inscrire</span><span class="en">Register</span></button>

<!-- Langues (optionally one per language) -->
<button type="button" class="btn btn--ghost js-reg" data-offer="langues"><span class="fr">S’inscrire</span><span class="en">Register</span></button>
<button type="button" class="btn btn--ghost btn--sm js-reg" data-offer="langues" data-lang-pref="chinois"><span class="fr">Apprendre le chinois</span><span class="en">Learn Chinese</span></button>

<!-- Training -->
<button type="button" class="btn btn--ghost js-reg" data-offer="training"><span class="fr">S’inscrire</span><span class="en">Register</span></button>

<!-- Jaspe'e Editions (Wednesday/Saturday agenda: camp-seances / edition-club) -->
<button type="button" class="btn btn--primary js-reg" data-offer="edition-club"><span class="fr">S’inscrire (samedi)</span><span class="en">Register (Saturday)</span></button>
<button type="button" class="btn btn--ghost js-reg" data-offer="edition-auteur"><span class="fr">Être accompagné(e)</span><span class="en">Get support</span></button>
```

What happens on submit (identical to the old site): fields validated (participant, age group,
WhatsApp ≥ 8 digits, consent) → code **`JEG-XXXX`** (4 chars of `23456789ABCDEFGHJKLMNPQRSTUVWXYZ`,
`crypto.getRandomValues`) → confirmation screen with the code (copy button), payment steps
(« Réglez par Orange Money ou Wave au 07 98 71 90 76 : à partir de 3 000 FCFA… »), a green
« Envoyer mon inscription sur WhatsApp » button whose message is prefilled
(`Bonjour, je souhaite m'inscrire.\nCode : JEG-…\nOffre : …\n[Langue : …]\nParticipant : …\n[Parent : …]\nTranche d'âge : …\nWhatsApp : …\n[Email : …]\n[Message : …]`,
EN version when the site is in English), the code saved in `localStorage['je-last-code']`, and a
silent e-mail copy sent to Web3Forms (`formulaire=inscription`, subject
`Site web — Inscription JEG-XXXX — <offre>`). WhatsApp remains the main channel.

## 2. Teacher application — `.js-teach[data-subject]`

```html
<button type="button" class="btn btn--ghost js-teach"><span class="fr">Je veux enseigner</span><span class="en">I want to teach</span></button>
<button type="button" class="btn btn--ghost btn--sm js-teach" data-subject="anglais"><span class="fr">Enseigner l’anglais</span><span class="en">Teach English</span></button>
```

`data-subject`: `anglais espagnol allemand chinois litterature francais bureautique autre`
(any spelling; unknown → « Autre »). Fields: subject, full name, WhatsApp, e-mail, qualifications,
availability, message, consent → prefilled WhatsApp message + Web3Forms copy
(`formulaire=candidature-professeur`, subject `Site web — Candidature professeur — <matière>`).

## 3. WhatsApp links — `.js-wa`

```html
<!-- default message (« Bienvenue chez vous à JASPE-EMERAUDE GROUP ! … ») -->
<a class="btn btn--primary js-wa" href="https://wa.me/2250798719076" target="_blank" rel="noopener">
  <span class="btn__icon"><svg class="icon" aria-hidden="true" focusable="false"><use href="assets/img/icons.svg#i-whatsapp"></use></svg></span>
  <span class="fr">Écrire sur WhatsApp</span><span class="en">Message us on WhatsApp</span></a>

<!-- custom message, both languages -->
<a class="btn btn--ghost js-wa" href="https://wa.me/2250798719076" target="_blank" rel="noopener"
   data-wa-msg-fr="Bonjour, j'ai une question sur English Camp."
   data-wa-msg-en="Hello, I have a question about English Camp."><span class="fr">Poser une question</span><span class="en">Ask a question</span></a>

<!-- payment proof: JEG-____ is replaced by the visitor's last registration code -->
<a class="btn btn--primary btn--wa js-wa" href="https://wa.me/2250798719076" target="_blank" rel="noopener"
   data-wa-msg-fr="Bonjour, je viens d'effectuer un paiement. Code d'inscription : JEG-____. Voici ma capture :"
   data-wa-msg-en="Hello, I have just made a payment. Registration code: JEG-____. Here is my screenshot:"><span class="fr">Envoyer ma preuve de paiement</span><span class="en">Send my proof of payment</span></a>
```

Keep a real `wa.me` `href` in the markup (works without JS). Other real messages from the old site:
`Bonjour, je souhaite être informé(e) de la date du concours de dictée.` / `Hello, I would like to be informed of the date of the dictation contest.` ·
`Bonjour, je souhaite connaître les prix de Jaspe'e Editions.` / `Hello, I would like to know the prices at Jaspe'e Editions.`

`.btn--wa` (defined in app.css) = `.btn` in WhatsApp green with ink text; use it with `.btn--primary`.

**Floating button / back-to-top.** The WhatsApp button sits bottom-right
(`--wa-size: 58px`, `--wa-gap: 18px`). Anything else floating bottom-right (e.g. `[data-to-top]`)
must use `bottom: var(--float-offset)` (= 88px, or 18px on pages with `data-no-wa-float`).

## 4. Copy button — `.js-copy[data-copy]`

```html
<button type="button" class="btn btn--ghost btn--sm js-copy" data-copy="0798719076">
  <span class="fr">Copier le numéro</span><span class="en">Copy number</span></button>
<!-- custom feedback text (default « Numéro copié ✓ / Number copied ✓ ») -->
<button type="button" class="pay-card__copy js-copy" data-copy="0798719076"
        data-copied-fr="Copié ✓" data-copied-en="Copied ✓">…</button>
```

The label is swapped for 2.2 s (width locked, no jump), `.is-copied` is added (pop), screen readers
are notified. Non-`.btn` copy buttons get `--btn-bg/--btn-fg` colours while copied.
(Legacy `data-num` still works.)

## 5. Page forms — `form.js-form[data-form="contact|benevoles|sommet"]`

Rules: `class="form js-form"`, `data-form`, `novalidate` (added anyway), each control in a
`.field` with a `<label class="field__label" for>` and a **unique id**, `required` where needed,
submit button `.btn.btn--primary` inside `.form__actions`, and the confirmation **`.form-ok` as the
very next sibling, with `hidden`**. Two columns: wrap fields in `.form__row`.
Validation is bilingual & accessible (`aria-invalid`, message linked with `aria-describedby`,
focus on the first error); `type="email"` must look like an e-mail; `name="whatsapp"`/`type="tel"`
needs ≥ 8 digits. On success the form fades out and `.form-ok` appears (animated check); on
failure a `.form-err` alert is added under the button. Sent to Web3Forms with every named field +
`access_key`, `subject`, `from_name`, `formulaire` (= data-form), `langue` (fr/en).

| data-form | Fields (`name`) | E-mail subject |
|---|---|---|
| `contact` | `nom`*, `contact`*, `profil` (particulier/ecole/entreprise), `message`* | Site web — Nouveau message (Contact) |
| `benevoles` | `nom`*, `contact`*, `poste`* (community-manager / assistant-administratif / commercial), `motivation`* | Site web — Candidature bénévole |
| `sommet` | `contact`* | Site web — Inscription Sommet de l'Excellence |

### Contact (contact.html, inside `<section id="formulaire">`)

```html
<form class="form js-form" data-form="contact" novalidate>
  <div class="form__row">
    <div class="field">
      <label class="field__label" for="c-nom"><span class="fr">Nom complet</span><span class="en">Full name</span></label>
      <input id="c-nom" name="nom" required autocomplete="name">
    </div>
    <div class="field">
      <label class="field__label" for="c-contact"><span class="fr">Email ou WhatsApp</span><span class="en">Email or WhatsApp</span></label>
      <input id="c-contact" name="contact" required autocomplete="email">
    </div>
  </div>
  <div class="field">
    <label class="field__label" for="c-profil"><span class="fr">Vous êtes</span><span class="en">You are</span></label>
    <select id="c-profil" name="profil">
      <option value="particulier" data-fr="Un particulier / une famille" data-en="An individual / a family">Un particulier / une famille</option>
      <option value="ecole" data-fr="Une école" data-en="A school">Une école</option>
      <option value="entreprise" data-fr="Une entreprise" data-en="A company">Une entreprise</option>
    </select>
  </div>
  <div class="field">
    <label class="field__label" for="c-message"><span class="fr">Votre message</span><span class="en">Your message</span></label>
    <textarea id="c-message" name="message" required></textarea>
  </div>
  <div class="form__actions">
    <button class="btn btn--primary" type="submit"><span class="fr">Envoyer</span><span class="en">Send</span></button>
  </div>
</form>
<div class="form-ok" role="status" hidden>
  <p><span class="fr">Merci, votre message a bien été pris en compte. Nous vous répondrons rapidement.</span><span class="en">Thank you, your message has been received. We'll reply shortly.</span></p>
</div>
```

### Bénévoles (equipe.html, inside `#rejoindre`)

```html
<form class="form js-form" data-form="benevoles" novalidate>
  <div class="form__row">
    <div class="field">
      <label class="field__label" for="v-nom"><span class="fr">Nom complet</span><span class="en">Full name</span></label>
      <input id="v-nom" name="nom" required autocomplete="name">
    </div>
    <div class="field">
      <label class="field__label" for="v-contact"><span class="fr">Email ou WhatsApp</span><span class="en">Email or WhatsApp</span></label>
      <input id="v-contact" name="contact" required>
    </div>
  </div>
  <div class="field">
    <label class="field__label" for="v-poste"><span class="fr">Poste visé</span><span class="en">Position</span></label>
    <select id="v-poste" name="poste" required>
      <option value="" data-fr="Choisir…" data-en="Choose…">Choisir…</option>
      <option value="community-manager" data-fr="Community manager" data-en="Community manager">Community manager</option>
      <option value="assistant-administratif" data-fr="Assistant(e) administratif(ve)" data-en="Administrative assistant">Assistant(e) administratif(ve)</option>
      <option value="commercial" data-fr="Commercial(e)" data-en="Sales representative">Commercial(e)</option>
    </select>
  </div>
  <div class="field">
    <label class="field__label" for="v-motivation"><span class="fr">Votre motivation</span><span class="en">Your motivation</span></label>
    <textarea id="v-motivation" name="motivation" required></textarea>
  </div>
  <div class="form__actions">
    <button class="btn btn--primary" type="submit"><span class="fr">Envoyer ma candidature</span><span class="en">Send my application</span></button>
  </div>
</form>
<div class="form-ok" role="status" hidden>
  <p><span class="fr">Merci pour votre candidature ! Nous reviendrons vers vous très bientôt.</span><span class="en">Thank you for applying! We'll get back to you very soon.</span></p>
</div>
```

### Sommet (training.html `#sommet`) — inline variant `.form--inline`

```html
<form class="form form--inline js-form" data-form="sommet" novalidate>
  <div class="field">
    <label class="field__label" for="s-contact">Email / WhatsApp</label>
    <input id="s-contact" name="contact" required
           data-ph-fr="Votre email ou numéro WhatsApp" data-ph-en="Your email or WhatsApp number" placeholder="Votre email ou numéro WhatsApp">
  </div>
  <div class="form__actions">
    <button class="btn btn--primary" type="submit"><span class="fr">Être informé(e) de l’ouverture des inscriptions</span><span class="en">Notify me when registration opens</span></button>
  </div>
</form>
<div class="form-ok" role="status" hidden>
  <p><span class="fr">Merci ! Vous serez informé(e) dès l’ouverture des inscriptions au Sommet de l’Excellence.</span><span class="en">Thank you! We'll let you know as soon as registration for the Excellence Summit opens.</span></p>
</div>
```

In `.form--inline` the label is visually hidden (add `.is-visible` to show it).
Forms work on any tone; inside a white card on a coloured section just put them in a `.card`.

## 6. Institutions (B2B) link — `a[data-subject="b2b"]`

```html
<a class="btn btn--primary" href="contact.html?sujet=b2b#formulaire" data-subject="b2b">
  <span class="fr">Demander une présentation</span><span class="en">Request a presentation</span></a>
```

On contact.html the click prefills the contact form in place (« Vous êtes » = Une école + message
« Bonjour, nous souhaitons recevoir une présentation de votre offre pour les institutions. » / EN)
and scrolls to `#formulaire`; on other pages it goes to `contact.html?sujet=b2b#formulaire`, which
prefills on load. Keep `id="formulaire"` on the contact form section.

## 7. Teachers — `[data-teachers]` (+ `[data-teachers-filter]`)

Teachers come from the Google Sheet (« Professeurs » tab). The **static cards inside
`[data-teachers]` are the fallback** shown until/unless the sheet answers — use *role* cards,
never invented names. Give the grid the class `teachers`. The filter box (subject chips with counts)
is filled by app.js — leave it empty and `hidden`. Section id `professeurs` (equipe.html).

```html
<section class="section" data-tone="white" id="professeurs">
  <div class="container">
    …heading…
    <div class="btns">
      <button type="button" class="btn btn--primary js-reg" data-offer="langues"><span class="fr">Je veux apprendre</span><span class="en">I want to learn</span></button>
      <button type="button" class="btn btn--ghost js-teach"><span class="fr">Je veux enseigner</span><span class="en">I want to teach</span></button>
    </div>
    <div data-teachers-filter hidden></div>
    <div class="teachers" data-teachers>
      <article class="teacher teacher--role" data-pole="training">
        <div class="teacher__head"><span class="teacher__avatar" aria-hidden="true"><svg class="icon" aria-hidden="true" focusable="false"><use href="assets/img/icons.svg#i-monitor"></use></svg></span></div>
        <h3 class="teacher__name"><span class="fr">Formateur en bureautique</span><span class="en">Office software trainer</span></h3>
        <ul class="teacher__subjects"><li><span class="fr">Bureautique</span><span class="en">Office software</span></li></ul>
        <div class="teacher__foot"><span class="teacher__pole"><span class="fr">Training / Sommet de l’Excellence</span><span class="en">Training / Excellence Summit</span></span></div>
      </article>
      <article class="teacher teacher--role" data-pole="langues">
        <div class="teacher__head"><span class="teacher__avatar" aria-hidden="true"><svg class="icon" aria-hidden="true" focusable="false"><use href="assets/img/icons.svg#i-chat"></use></svg></span></div>
        <h3 class="teacher__name"><span class="fr">Professeur d’anglais</span><span class="en">English teacher</span></h3>
        <ul class="teacher__subjects"><li><span class="fr">Anglais</span><span class="en">English</span></li></ul>
        <div class="teacher__foot"><span class="teacher__pole"><span class="fr">Langues étrangères</span><span class="en">Foreign languages</span></span></div>
      </article>
      <article class="teacher teacher--role" data-pole="langues">
        <div class="teacher__head"><span class="teacher__avatar" aria-hidden="true"><svg class="icon" aria-hidden="true" focusable="false"><use href="assets/img/icons.svg#i-chat"></use></svg></span></div>
        <h3 class="teacher__name"><span class="fr">Professeur d’espagnol</span><span class="en">Spanish teacher</span></h3>
        <ul class="teacher__subjects"><li><span class="fr">Espagnol</span><span class="en">Spanish</span></li></ul>
        <div class="teacher__foot"><span class="teacher__pole"><span class="fr">Langues étrangères</span><span class="en">Foreign languages</span></span></div>
      </article>
      <article class="teacher teacher--role" data-pole="camp">
        <div class="teacher__head"><span class="teacher__avatar" aria-hidden="true"><svg class="icon" aria-hidden="true" focusable="false"><use href="assets/img/icons.svg#i-tent"></use></svg></span></div>
        <h3 class="teacher__name"><span class="fr">Animateur d’immersion en anglais</span><span class="en">English immersion facilitator</span></h3>
        <ul class="teacher__subjects"><li><span class="fr">Anglais</span><span class="en">English</span></li><li>Immersion</li></ul>
        <div class="teacher__foot"><span class="teacher__pole">English Camp</span></div>
      </article>
      <article class="teacher teacher--role" data-pole="training">
        <div class="teacher__head"><span class="teacher__avatar" aria-hidden="true"><svg class="icon" aria-hidden="true" focusable="false"><use href="assets/img/icons.svg#i-award"></use></svg></span></div>
        <h3 class="teacher__name"><span class="fr">Formateur en développement des compétences</span><span class="en">Skills development trainer</span></h3>
        <ul class="teacher__subjects"><li><span class="fr">Développement des compétences</span><span class="en">Skills development</span></li></ul>
        <div class="teacher__foot"><span class="teacher__pole"><span class="fr">Training / Sommet de l’Excellence</span><span class="en">Training / Excellence Summit</span></span></div>
      </article>
      <article class="teacher teacher--role" data-pole="editions">
        <div class="teacher__head"><span class="teacher__avatar" aria-hidden="true"><svg class="icon" aria-hidden="true" focusable="false"><use href="assets/img/icons.svg#i-book"></use></svg></span></div>
        <h3 class="teacher__name"><span class="fr">Animateur lecture et écriture</span><span class="en">Reading &amp; writing facilitator</span></h3>
        <ul class="teacher__subjects"><li><span class="fr">Lecture</span><span class="en">Reading</span></li><li><span class="fr">Écriture</span><span class="en">Writing</span></li></ul>
        <div class="teacher__foot"><span class="teacher__pole">Jaspe’e Editions</span></div>
      </article>
    </div>
  </div>
</section>
```

Live cards rendered by app.js: `article.teacher.is-live[data-pole]` → `.teacher__head` (`.teacher__avatar`
photo or initials, ringed in the pôle colour + outlined index `01`), `.teacher__name`,
`.teacher__subjects` chips, `.teacher__bio` (4 lines + « Voir plus »), `.teacher__strengths`
(« Points forts » chips), `.teacher__pole` tag (only if the POLE column is filled).
Card colour = POLE column, else derived from subjects (languages → `langues`).
Only rows with `AFFICHAGE = oui` are shown; hours/rates columns are never displayed.

Options:
- `data-only="langues"` on `[data-teachers]` (langues.html): only language teachers (or
  `data-only="anglais espagnol"`).
- `data-filter="espagnol"`: initial filter. `equipe.html?matiere=espagnol#professeurs` does the same.
- Empty filter → card with « Je veux apprendre » (`.js-reg`) / « Je veux enseigner » (`.js-teach`).

## 8. Language chips — `.lchip[data-pf]`

```html
<div class="lchips" role="group" aria-label="Langues proposées" data-aria-fr="Langues proposées" data-aria-en="Languages offered">
  <button type="button" class="lchip" data-pf="anglais"><span class="fr">Anglais</span><span class="en">English</span></button>
  <button type="button" class="lchip" data-pf="espagnol"><span class="fr">Espagnol</span><span class="en">Spanish</span></button>
  <button type="button" class="lchip" data-pf="allemand"><span class="fr">Allemand</span><span class="en">German</span></button>
  <button type="button" class="lchip" data-pf="chinois"><span class="fr">Chinois (mandarin)</span><span class="en">Chinese (Mandarin)</span></button>
</div>
```

If the page has a `[data-teachers]` grid: filters it and scrolls to `#professeurs`; the active chip
gets `.is-active` + `aria-pressed="true"`. Otherwise: goes to `equipe.html?matiere=<pf>#professeurs`.
`.lchip` is styled by main.css (app.css only has a zero-specificity fallback).

## 9. Photo galleries — `[data-gallery="english-camp|sommet|editions|poles"]`

The `<figure>` **direct children** are the fallback (site photos). If the sheet's « GALERIE » tab
has visible photos for that pôle they replace them (if all Drive photos fail, the fallback comes
back). Sheet POLE → gallery: contains « camp » → `english-camp`; « sommet » / « training » /
« formation » → `sommet`; « edition » / « jaspe'e » → `editions`; anything else (Langues, Shopping,
empty) → `poles`. Captions: LEGENDE (FR) and LEGENDE EN; if LEGENDE EN is empty or an instruction
placeholder (e.g. « à la fin de la section ») a clean caption is used (« PREMIERE EDITION » →
« Première édition / First edition »). Every photo becomes a button opening the lightbox
(arrows, ← →, Home/End, swipe, Esc, focus returned to the last photo viewed).

Layout: default = justified rows (each row fills the width, ratios kept — give every `<img>` its
real `width`/`height`). Add `.gallery--rail` for a horizontal snap rail (`tabindex="0"` + aria-label).
A gallery with no figure (and nothing in the sheet) is `hidden`, together with its closest
`[data-gallery-block]` wrapper (use it for an « En images » heading).

```html
<!-- english-camp.html -->
<div data-gallery="english-camp">
  <figure><img src="assets/img/photos/camp-01.webp" srcset="assets/img/photos/camp-01-sm.webp 720w, assets/img/photos/camp-01.webp 1600w" sizes="(min-width: 900px) 50vw, 100vw" width="1600" height="900" alt="Enfants fiers de leurs certificats de l’English Camp" loading="lazy" decoding="async"><figcaption><span class="fr">Première édition</span><span class="en">First edition</span></figcaption></figure>
  <figure><img src="assets/img/photos/camp-03.webp" srcset="assets/img/photos/camp-03-sm.webp 720w, assets/img/photos/camp-03.webp 1080w" sizes="(min-width: 900px) 33vw, 100vw" width="1080" height="810" alt="Adolescents en t-shirts English Camp devant la bannière" loading="lazy" decoding="async"></figure>
  <figure><img src="assets/img/photos/camp-04.webp" srcset="assets/img/photos/camp-04-sm.webp 720w, assets/img/photos/camp-04.webp 1080w" sizes="(min-width: 900px) 33vw, 100vw" width="1080" height="810" alt="Grand groupe joyeux avec certificats en classe" loading="lazy" decoding="async"></figure>
  <figure><img src="assets/img/photos/camp-06.webp" srcset="assets/img/photos/camp-06-sm.webp 720w, assets/img/photos/camp-06.webp 1080w" sizes="(min-width: 900px) 50vw, 100vw" width="1080" height="607" alt="Séance d’anglais en classe" loading="lazy" decoding="async"></figure>
  <figure><img src="assets/img/photos/camp-07.webp" srcset="assets/img/photos/camp-07-sm.webp 720w, assets/img/photos/camp-07.webp 1080w" sizes="(min-width: 900px) 33vw, 100vw" width="1080" height="810" alt="Adolescents en t-shirts noirs devant la bannière English Camp" loading="lazy" decoding="async"></figure>
  <figure><img src="assets/img/photos/camp-09.webp" srcset="assets/img/photos/camp-09-sm.webp 720w, assets/img/photos/camp-09.webp 1080w" sizes="(min-width: 900px) 33vw, 100vw" width="1080" height="810" alt="Les tout-petits en t-shirts bleus" loading="lazy" decoding="async"></figure>
</div>

<!-- training.html #sommet -->
<div data-gallery="sommet">
  <figure><img src="assets/img/photos/sommet-01.webp" srcset="assets/img/photos/sommet-01-sm.webp 720w, assets/img/photos/sommet-01.webp 1080w" sizes="(min-width: 900px) 33vw, 100vw" width="1080" height="719" alt="Accueil des participants au Sommet de l’Excellence" loading="lazy" decoding="async"><figcaption><span class="fr">Première édition</span><span class="en">First edition</span></figcaption></figure>
  <figure><img src="assets/img/photos/sommet-02.webp" srcset="assets/img/photos/sommet-02-sm.webp 720w, assets/img/photos/sommet-02.webp 1080w" sizes="(min-width: 900px) 33vw, 100vw" width="1080" height="720" alt="Participants avec leurs certificats sur la pelouse" loading="lazy" decoding="async"><figcaption><span class="fr">Première édition</span><span class="en">First edition</span></figcaption></figure>
  <figure><img src="assets/img/photos/sommet-03.webp" srcset="assets/img/photos/sommet-03-sm.webp 720w, assets/img/photos/sommet-03.webp 1080w" sizes="(min-width: 900px) 33vw, 100vw" width="1080" height="720" alt="Activité de groupe sur le toit-terrasse" loading="lazy" decoding="async"><figcaption><span class="fr">Première édition</span><span class="en">First edition</span></figcaption></figure>
  <figure><img src="assets/img/photos/sommet-04.webp" srcset="assets/img/photos/sommet-04-sm.webp 720w, assets/img/photos/sommet-04.webp 1080w" sizes="(min-width: 900px) 33vw, 100vw" width="1080" height="720" alt="Moment d’énergie collective sur le toit-terrasse" loading="lazy" decoding="async"><figcaption><span class="fr">Première édition</span><span class="en">First edition</span></figcaption></figure>
</div>

<!-- editions.html (rail variant) -->
<div class="gallery--rail" data-gallery="editions" tabindex="0" aria-label="Photos Jaspe’e Editions" data-aria-fr="Photos Jaspe’e Editions" data-aria-en="Jaspe’e Editions photos">
  <figure><img src="assets/img/photos/editions-01.webp" srcset="assets/img/photos/editions-01-sm.webp 543w, assets/img/photos/editions-01.webp 1206w" sizes="(min-width: 900px) 30vw, 70vw" width="1206" height="1600" alt="Mains présentant le livre « Retour à la lecture »" loading="lazy" decoding="async"><figcaption>Retour à la lecture</figcaption></figure>
  <figure><img src="assets/img/photos/editions-02.webp" srcset="assets/img/photos/editions-02-sm.webp 720w, assets/img/photos/editions-02.webp 1600w" sizes="(min-width: 900px) 40vw, 85vw" width="1600" height="1298" alt="Présentoir de livres Jaspe’e Editions" loading="lazy" decoding="async"></figure>
  <figure><img src="assets/img/photos/editions-04.webp" srcset="assets/img/photos/editions-04-sm.webp 480w, assets/img/photos/editions-04.webp 1067w" sizes="(min-width: 900px) 28vw, 65vw" width="1067" height="1600" alt="Lectrice tenant le livre" loading="lazy" decoding="async"></figure>
  <figure><img src="assets/img/photos/editions-05.webp" srcset="assets/img/photos/editions-05-sm.webp 720w, assets/img/photos/editions-05.webp 1080w" sizes="(min-width: 900px) 45vw, 85vw" width="1080" height="720" alt="Table de présentation du livre « La jeune secrétaire » au Sommet" loading="lazy" decoding="async"><figcaption>La jeune secrétaire</figcaption></figure>
  <figure><img src="assets/img/photos/editions-06.webp" srcset="assets/img/photos/editions-06-sm.webp 720w, assets/img/photos/editions-06.webp 1080w" sizes="(min-width: 900px) 45vw, 85vw" width="1080" height="720" alt="« La jeune secrétaire » exposé au Sommet de l’Excellence" loading="lazy" decoding="async"><figcaption>La jeune secrétaire</figcaption></figure>
</div>

<!-- index.html « Nos 5 pôles » (Langues, Shopping…): no photo yet → hidden until the sheet has some -->
<div data-gallery-block>
  <p class="eyebrow"><span class="fr">En images</span><span class="en">In pictures</span></p>
  <div data-gallery="poles"></div>
</div>
```

(Captions without a known source: leave them out rather than inventing one.)

## 10. CSS hooks & variables (app.css)

| Hook | Use |
|---|---|
| `--float-offset` | bottom offset for any other bottom-right floating UI (back-to-top). |
| `--wa-size`, `--wa-gap` | floating WhatsApp button geometry. |
| `.btn--wa` | WhatsApp-green button variant. |
| `html.has-modal`, `html.is-scroll-locked`, `--jeg-scrollbar` | modal open state (pad a fixed header with `padding-right: var(--jeg-scrollbar)`). |
| `.form`, `.form__row`, `.field`, `.field__label`, `.field__hint`, `.check` + `.check__box` + `.check__text`, `.form__actions`, `.form__note`, `.form--inline`, `.form-ok`, `.form-err` | form system (works in any tone). |
| `.teachers`, `.teacher`, `.teacher--role`, `.teacher__*`, `.filter-chip` | teachers. |
| `.gallery` (added by JS), `.gallery--rail`, `.gallery__zoom` | galleries. |
| `.jm`, `.jm__dialog`, `.jm__aside[data-tone]`, `.jm--reg[data-pole]`, `.jm--lightbox` | injected modals. |

Custom checkbox markup (e.g. a consent box in a page form):

```html
<div class="field field--check"><label class="check" for="c-consent">
  <input type="checkbox" id="c-consent" name="consent" required><span class="check__box" aria-hidden="true"></span>
  <span class="check__text"><span class="fr">J’accepte…</span><span class="en">I agree…</span></span></label></div>
```

## 11. JS API (debug / injected content)

`window.JEGApp`: `config`, `lang()`, `setLang('en')`, `applyLang(el)`, `updateWa(el)`,
`openRegistration(offer, langPref)`, `openTeacher(subject)`, `openLightbox(figures, index)`,
`initForm(formEl)` (for a `.js-form` injected after load), `filterTeachers(key)`, `modal`.
Events on `document`: `jeg:lang`, `jeg:theme`, `jeg:modal`.

---

## 12. Guide pour le client (en français)

### Les réglages (fichier `assets/js/app.js`, bloc « CONFIGURATION » tout en haut)

Ouvrez `assets/js/app.js` avec un éditeur de texte : le bloc `CONFIG` est le **seul** endroit à
modifier. Changez uniquement ce qui est entre apostrophes `'…'`.

| Réglage | À quoi il sert |
|---|---|
| `WHATSAPP_NUMBER` | Numéro WhatsApp de tous les boutons, au format international **sans « + » ni espaces** (`2250798719076`). Laissé vide (`''`), les boutons WhatsApp mènent à la page Contact. |
| `PHONE_DISPLAY` | Le même numéro tel qu’il s’affiche. |
| `PAYMENT_NUMBER` / `PAYMENT_NUMBER_RAW` | Numéro Orange Money / Wave des instructions de paiement (avec et sans espaces ; la version sans espaces est celle que copient les boutons « Copier le numéro »). |
| `EMAIL` | Adresse e-mail de contact. |
| `WEB3FORMS_KEY` | Clé Web3Forms (envoi des formulaires par e-mail, voir plus bas). |
| `FROM_NAME` | Nom de l’expéditeur des e-mails reçus. |
| `PROFS_CSV_URL` / `GALLERY_CSV_URL` | Adresses des onglets « Professeurs » et « GALERIE » du tableau Google Sheets. |

**Prix.** Juste sous le bloc CONFIG, la liste `OFFERS` contient les prix « à partir de » de la
fenêtre d’inscription (`price: 3000`…). Mettez `0` pour afficher « Prix sur demande via WhatsApp ».
Ne modifiez pas les identifiants `v: '…'` (ils sont utilisés par les boutons du site). Pensez à
mettre aussi à jour les prix écrits dans les pages.

Les numéros affichés en clair dans les pages (en-tête, pied de page, page Contact) se modifient dans
ces pages.

### Les professeurs (Google Sheets, onglet « Professeurs »)

Le site lit le tableau à chaque visite : une modification apparaît sur le site en quelques minutes,
sans rien toucher au site.

- **Une ligne = un professeur.** La ligne de titres est détectée automatiquement (elle doit contenir
  une colonne **NOM**), l’ordre des colonnes est libre.
- Colonnes lues : **NOM**, **PRENOMS**, **MATIERES** (+ **MATIERES EN** pour l’anglais),
  **PRESENTATION…** (+ **PRESENTATION EN**), **POINTS FORTS** (+ **POINTS FORTS EN**), **POLE**,
  **PHOTO**, **AFFICHAGE**.
- **AFFICHAGE** : `oui` pour afficher la fiche, `non` (ou vide) pour la masquer.
- **MATIERES** : plusieurs matières séparées par `&`, une virgule, `/` ou « et »
  (ex. `ANGLAIS & LITTERATURE`). Les accents et majuscules des matières connues sont corrigés
  automatiquement et traduits en anglais (Anglais, Espagnol, Allemand, Chinois (mandarin), Littérature,
  Français, Bureautique, Lecture, Écriture).
- **POINTS FORTS** : séparés par des virgules (ex. `Rigueur, excellence, assiduité`).
- **POLE** (facultatif) : par ex. `Langues étrangères`, `English Camp`, `Training / Sommet de l'Excellence`,
  `Jaspe'e Editions`, `Shopping` — affiché en étiquette de couleur sur la fiche.
- **PHOTO** (facultatif) : lien de partage Google Drive de la photo (« Toute personne disposant du
  lien » en lecture). Sans photo, les initiales s’affichent.
- Les autres colonnes (heures, séances, **TARIFS**…) ne sont **jamais** affichées sur le site.
- Si le tableau est injoignable, le site affiche des fiches génériques par métier.

### Les photos (Google Sheets, onglet « GALERIE »)

- Colonnes : **PHOTO** (lien de partage Google Drive d’une photo — pas d’un dossier),
  **LEGENDE** (français), **LEGENDE EN** (anglais), **POLE**, **AFFICHAGE** (`oui` / `non`).
- **POLE** décide de la page/section où la photo apparaît : `English Camp` → English Camp ;
  `Sommet de l'Excellence` ou `Training` → Training / Sommet ; `Jaspe'e Editions` → Editions ;
  `Langues`, `Shopping` ou vide → « Nos 5 pôles » (accueil).
- Dès qu’au moins une photo est indiquée pour un pôle, elle remplace les photos d’exemple de cette
  section. Si **LEGENDE EN** est vide, la légende française (ou sa traduction connue) est utilisée.
- Chaque photo doit être partagée en lecture (« Toute personne disposant du lien »).
- Le tableau doit rester **publié / partagé en lecture** : sinon le site garde ses photos et fiches
  par défaut.

### Les formulaires (Web3Forms)

Les formulaires Contact, Bénévoles et Sommet, ainsi qu’une copie de chaque inscription et de chaque
candidature professeur, sont envoyés par e-mail grâce au service gratuit **Web3Forms**
(https://web3forms.com).

- L’adresse qui **reçoit** les e-mails se règle dans votre compte Web3Forms (pas dans le site).
- Objets des e-mails : « Site web — Nouveau message (Contact) », « Site web — Candidature bénévole »,
  « Site web — Inscription Sommet de l'Excellence », « Site web — Inscription JEG-XXXX — <offre> »,
  « Site web — Candidature professeur — <matière> ».
- Pour changer de clé : créez une clé sur web3forms.com avec l’adresse de réception souhaitée, puis
  remplacez `WEB3FORMS_KEY` dans le bloc CONFIG.
- Les inscriptions passent d’abord par **WhatsApp** (message prérempli avec le code JEG-XXXX) :
  l’e-mail n’est qu’une copie de sécurité. Le paiement (Orange Money ou Wave) se confirme sur
  WhatsApp avec ce code.
