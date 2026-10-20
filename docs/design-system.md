# Jaspe-Émeraude Group — Design system v3 (contract)

> « Poli pour l’excellence » — clean white & mist, **one saturated colour world per section**, Bricolage Grotesque + Inter, flat & crisp, joyful but premium.
> No beige/ivory, no grain/noise, no serif, no italic emphasis, no muddy gradients.

Owner: foundation **A3**. Files you consume but **must not edit**: `assets/css/main.css`, `assets/js/main.js`, `partials/*.html`, `assets/img/icons.svg`.
Business components (modals, forms, teachers, galleries, WhatsApp float, `.js-*` hooks) live in `assets/css/app.css` + `assets/js/app.js` → see `docs/app-components.md`.
Page-specific styles/scripts go in `assets/css/pages/<page>.css` / `assets/js/pages/<page>.js` and must **only use the tokens and semantic variables below** (never hard-code hex colours, never redefine `[data-tone]`).

---

## 1. Page skeleton (copy exactly)

```html
<!doctype html>
<html lang="fr" class="no-js">
<head>
  <!-- partials/head.html with the {{PLACEHOLDERS}} replaced -->
</head>
<body class="page-<key>">
  <!-- partials/loader.html  (loader + curtain + cursor + scroll progress) -->
  <!-- partials/header.html  (skip link + header + mega-menu + mobile menu) -->
  <main id="main" tabindex="-1">
    <!-- sections -->
  </main>
  <!-- partials/footer.html  (ink footer + back-to-top) -->
</body>
</html>
```

### `<head>` (partials/head.html)
Replace only the placeholders, keep the order (meta → SEO → icons → inline boot script → fonts → CSS → JS):

| Placeholder | Example |
|---|---|
| `{{FILE}}` | `english-camp.html` (index → empty: canonical `https://jaspe-emeraudegroup.com/`) |
| `{{TITLE_FR}}` / `{{TITLE_EN}}` | `English Camp — L’anglais qui se vit · Jaspe-Émeraude Group` / `English Camp — English you live · Jaspe-Émeraude Group` (unique per page; `<title data-en="…">`) |
| `{{DESC}}` | French meta description ≈150 chars (also og:description) |
| `{{OG_IMAGE}}` | `assets/img/photos/camp-02.webp` |
| `{{PAGE}}` | page key → `assets/css/pages/{{PAGE}}.css` + `assets/js/pages/{{PAGE}}.js`. **Delete those two lines if the page has no page file.** |

The single Google Fonts link (Bricolage Grotesque opsz/wght 12..96/400..800 + Inter 400–700), `theme-color` (#FFFFFF light / #0A0E0D dark), icons and manifest are already in the partial. No other CDN/framework.

The inline boot script sets `html.js` (removes `no-js`), `html.lang-en` (localStorage `je-lang`), `html.dark` (localStorage `je-theme` or `prefers-color-scheme`) and `html.is-returning` (sessionStorage `jeg-visited` → no loader, curtain instead).

### Header / footer
* Paste the partials verbatim. `aria-current="page"` is added automatically by main.js to matching links in header, mobile menu and footer (the “Nos pôles” trigger gets `.is-current` on the 5 pôle pages). You may hard-code it too.
* The header is a **fixed solid bar**; `main` already gets `padding-top: var(--header-h)` → the first section starts right under the bar. Do **not** add header offsets yourself.
* `--header-h` = 84px (≥900px) / 68px (<900px). Condensed on scroll (`.is-scrolled`, 68/60px), hidden on scroll-down / shown on scroll-up (`.is-hidden`).
* The back-to-top button (in the footer partial) sits on the right, just above the floating WhatsApp button injected by app.js (uses `--float-offset` / `--wa-size` from app.css).

---

## 2. Tokens (`:root`, exact names)

| Group | Tokens |
|---|---|
| Neutrals | `--white #FFFFFF` · `--ink #0B0F0E` · `--ink-2 #4B5552` · `--line #E3E8E6` · `--mist #F3F6F5` |
| Emerald | `--em-900 #04281F` · `--em-800 #063D2E` · `--em-700 #0A5640` · `--em-600 #0E7A57` · `--em-500 #12A06F` · `--em-400 #2BD08F` · `--em-100 #E3F6EE` |
| 01 Training & Sommet | `--sommet-black #0B0B0D` · `--sommet-red #E5262F` · `--sommet-gold #E8B53A` |
| 02 Langues | `--langues #FF5A36` · `--langues-ink #1F0A04` · `--langues-soft #FFE7DF` |
| 03 Shopping | `--shop #FFC83D` · `--shop-ink #261B00` · `--shop-soft #FFF5D6` |
| 04 English Camp | `--camp-sky #58B6FF` · `--camp-mint #7FE7C4` · `--camp-navy #14234B` · `--camp-soft #E8F5FF` · `--camp-gradient` (135deg sky→mint) |
| 05 Jaspe’e Editions | `--ed-violet #7C5CFF` · `--ed-lilac #EDE6FF` · `--ed-ink #22164D` |
| Other | `--wa #25D366` (WhatsApp) · `--om #FF7900` (Orange Money) · `--wave #1DC8FF` (Wave) |
| Fonts | `--font-display` "Bricolage Grotesque" · `--font-body` "Inter" |
| Shape | `--radius 20px` · `--radius-lg 32px` · `--radius-sm 12px` · `--radius-pill 999px` · `--elev` (the ONE shadow, floating UI only) |
| Easing | `--ease-out cubic-bezier(.22,1,.36,1)` · `--ease-in-out cubic-bezier(.65,0,.35,1)` · `--ease-back` |
| z-index | `--z-header 50` · `--z-menu 60` · `--z-float 70` · `--z-modal 80` · `--z-transition 90` · `--z-loader 100` · `--z-cursor 110` |
| Layout | `--container 1320px` · `--gutter clamp(16px,4vw,48px)` · `--header-h` · `--section-y` / `--section-y-sm` / `--section-y-lg` · `--gap` |
| Type | `--fs-xxl` (hero, ≈10.6vw) · `--fs-display` · `--fs-h1` · `--fs-h2` · `--fs-h3` · `--fs-h4` · `--fs-lead` · `--fs-body` · `--fs-sm` · `--fs-xs` · `--fs-eyebrow` |

Dark-mode neutrals (used only by `html.dark`): `--dark-bg #0A0E0D`, `--dark-mist #121917`, `--dark-surface #141C1A`, `--dark-surface-2`, `--dark-line`, `--dark-fg`, `--dark-fg-2`.

---

## 3. Semantic variables (what components use)

Components never hard-code colours; they read these, so they adapt to whatever tone they sit in:

| Variable | Meaning |
|---|---|
| `--bg` / `--bg-image` | section background (colour / optional gradient, camp only) |
| `--fg` / `--fg-2` | main text / secondary text (AA on `--bg`) |
| `--accent` | accent colour ≥3:1 on `--bg` → **large text, icons, shapes, rules** (heading `<em>`, big numbers) |
| `--accent-ink` | accent safe for **small text** ≥4.5:1 (eyebrows, tags, small links) |
| `--accent-fg` | text on an `--accent` fill |
| `--accent-2` | decorative secondary (sparkles, swash, marquee separators) — no contrast guarantee |
| `--surface` / `--surface-fg` / `--surface-fg-2` | cards/boxes inside the section |
| `--border` | hairlines (1–1.5px) |
| `--btn-bg` / `--btn-fg` / `--btn-hover-bg` / `--btn-hover-fg` | primary button |
| `--btn-accent-bg` / `--btn-accent-fg` | accent button (and default sticker colours) |
| `--chip-bg` / `--chip-fg` | chips, icon badges, eyebrow pills |
| `--hl-bg` / `--hl-fg` | highlighter pill behind a word (`.hl`), price pill |
| `--focus` | focus ring colour |

In your page CSS write e.g. `color: var(--fg-2); border-top: 1.5px solid var(--border); background: var(--surface);` — never `#fff`.

---

## 4. Tones — `data-tone="…"`

Put `data-tone` on a **section, page hero, band, panel, card**: it sets every semantic variable **and** paints `background` + `color`. Tones nest (a `data-tone="white"` card inside a camp section works).

| `data-tone` | Background / text | Accent (`--accent` / `--accent-ink`) | Buttons | When to use |
|---|---|---|---|---|
| `white` (default `:root`) | #FFF / ink | em-600 / em-600 | emerald, hover ink | default sections, home hero, chiffres |
| `mist` | --mist / ink | em-600 | emerald | alternate neutral sections, agenda, legal pages |
| `emerald` | --em-800 / white | em-400 | mint (em-400) with em-900 text | deep brand sections (Qui sommes-nous, Institutions, équipe/contact/404 heroes) |
| `emerald-vivid` | --em-600 / white (fg-2 em-100) | white / white | white with em-800 text; accent button = ink | CTA bands, final CTA (default of `.cta-band`) |
| `ink` | --ink / white | em-400 | mint with ink text | footer (default of `.site-footer`), ticker bands |
| `camp` | sky→mint gradient / camp-navy | navy (white = decor only) | navy, white accent button | English Camp |
| `sommet` | sommet-black / white | red (large) / **gold** (small text) | red; accent = gold | Training & Sommet |
| `editions` | ed-lilac / ed-ink | violet (large) / deep violet (small) | deep violet; accent = ed-ink | Jaspe’e Editions |
| `langues` | --langues / langues-ink | **white** (large text only) / langues-ink | ink with white text; accent = white | Langues étrangères |
| `shop` | --shop / shop-ink | em-700 (large) / shop-ink | ink with white text; accent = white | Shopping |

All body-text combinations pass WCAG AA. `--accent` is only guaranteed ≥3:1 (large text, UI); use `--accent-ink` (or `.text-accent-ink`) for small accent text.

**Dark mode** (`html.dark`, toggled by app.js): only neutral tones change — `white` → #0A0E0D, `mist` → #121917, surfaces → #141C1A/#1A2421, text light, accent em-400. Coloured tones (`emerald`, `emerald-vivid`, `ink`, `camp`, `sommet`, `editions`, `langues`, `shop`) stay identical. Everything built on semantic vars follows automatically.

### Tone mapping (mandatory)

| Page / block | Tone |
|---|---|
| **Home** hero | `white` (emerald accents) |
| Home ticker band | `ink` or `emerald-vivid` |
| Qui sommes-nous | `emerald` |
| Nos 5 pôles | `white`, cards in their pôle colours (`.pole-card` with `data-tone` + `data-pole`) |
| English Camp spotlight | `camp` |
| Chiffres | `white` |
| Agenda | `mist` |
| Sommet spotlight | `sommet` |
| Editions spotlight | `editions` |
| Institutions | `emerald` |
| Final CTA | `emerald-vivid` |
| Footer | `ink` (partial) |
| Page heroes | training.html → `sommet` · langues.html → `langues` · shopping.html → `shop` · english-camp.html → `camp` · editions.html → `editions` · inscriptions.html → `mist` · equipe.html → `emerald` · contact.html → `emerald` · mentions-legales / confidentialite → `mist` · 404 → `emerald` |

Inside each pôle page alternate the pôle tone with `white` / `mist` and with the pôle’s soft colour (use `data-pole` + `background: var(--pole-soft)` in page CSS, or a `white` section with pôle-coloured cards); keep the pôle colour as the page accent. Never put two identical coloured tones back-to-back.

---

## 5. Pôle colours — `data-pole="training|langues|shopping|camp|editions"`

For pôle-coloured items **outside** their own section (cards, menu rows, tags, swatches, agenda dots). Sets:
`--pole` (solid colour, AA with `--pole-fg`), `--pole-fg`, `--pole-soft` (light tint), `--pole-ink` (text on soft), `--pole-2` (secondary), `--pole-fill` (solid or camp gradient, for swatches).

| data-pole | --pole / --pole-fg | --pole-soft / --pole-ink |
|---|---|---|
| `training` | sommet-red / white | #FCE9EA / sommet-black |
| `langues` | langues / langues-ink | langues-soft / langues-ink |
| `shopping` | shop / shop-ink | shop-soft / shop-ink |
| `camp` | camp-sky (fill = gradient) / camp-navy | camp-soft / camp-navy |
| `editions` | deep violet / white | ed-lilac / ed-ink |

Components that react to `data-pole`: `.chip[data-pole]`, `.tag[data-pole]`, `.badge[data-pole]`, `.swatch`, `.icon-badge[data-pole]`, `.sticker[data-pole]`, `.mega__item`, `.agenda__item[data-pole]` (dot). Pôle → tone: training→`sommet`, langues→`langues`, shopping→`shop`, camp→`camp`, editions→`editions`.

---

## 6. i18n & content rules

* Bilingual text: `<span class="fr">…</span><span class="en">…</span>`; rule `html:not(.lang-en) .en, html.lang-en .fr {display:none!important}`. Attributes: `data-ph-fr/en` (placeholders), `<option data-fr data-en>`, `data-aria-fr/en`, `<title data-en>`. app.js switches and dispatches `jeg:lang`.
* Copy is verbatim from the client source; never invent numbers, prices, dates, names, partners, testimonials or stats. Microcopy always in both languages.
* French typography: ’ apostrophes, « » with no-break spaces (`« Poli pour l’excellence »`), narrow no-break space before `: ; ! ?` (`&#8239;`).
* Emphasis = accent colour (`<em>` inside headings → accent, never italic), highlighter `.hl`, swash `.swash` or a sticker. No serif, no italics for emphasis.
* Uppercase is allowed for impact on display titles (`.upper`). Keep an elided article glued to its word: `l’<em>excellence.</em>` breaks after `l’` — write `<em>l’excellence.</em>` or wrap in `<span class="nowrap">`.
* Images: always `width`/`height`, French `alt` (empty for decorative), `loading="lazy"` + `decoding="async"` (hero LCP: `fetchpriority="high"`, no lazy), `srcset="…-sm.webp 720w, ….webp 1600w"` + `sizes`.
* Icons: sprite `assets/img/icons.svg` (1.75px stroke) — `<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/img/icons.svg#i-arrow-right"></use></svg>`. Ids: arrow-right/left/up/down, arrow-up-right, chevron-down/right, plus, minus, close, menu, sun, moon, whatsapp, mail, phone, map-pin, calendar, clock, check, copy, gem, diamond, sparkle, monitor, chat, bag, globe, book, pen, tent, award, shield, users, user, school, briefcase, heart, info, quote, external, facebook, instagram, linkedin, youtube.
* Brand marks: `assets/img/brand/logo-mark-t.webp` (+@2x, emerald, transparent; auto-brightened in dark/coloured tones), `logo-mark-white.webp` (+@2x, pure white → add class `brand-mark--white`), `english-camp-logo.webp` / `editions-logo.webp` (white square → wrap in `.badge-logo`).

---

## 7. Typography

| Class | Font | Use |
|---|---|---|
| `.display-xxl` (alias `.hero-title`) | Bricolage 800, `--fs-xxl`, lh .86, −.05em | home hero, up to ~10.6vw (combine with `.upper`) |
| `.display` | Bricolage 800, `--fs-display` | big statements, footer CTA |
| `h1` / `.h1` | 800, `--fs-h1`, −.04em | |
| `h2` / `.h2` | 800, `--fs-h2`, −.035em | section titles |
| `h3` / `.h3` | 700, `--fs-h3` | card / block titles |
| `h4` / `.h4` | 700, `--fs-h4` | |
| `.lead` | Inter, `--fs-lead`, `--fg-2`, max 58ch | intros |
| body | Inter 400, `--fs-body`, lh 1.6 | |
| `.small` / `.text-xs` / `.fine` | | small print |
| `.eyebrow` | Inter 600, 12–13px, uppercase, .14em, `--accent-ink` | labels above titles |
| `.pole-num` | Bricolage 800, huge (5–13rem) | « 01–05 » pôle numbers |
| `.upper` · `.text-accent` · `.text-accent-ink` · `.muted` · `.measure` · `.measure-sm` · `.balance` · `.tabular` · `.outline-text` · `.prose` | helpers |

Emphasis helpers:
```html
<h2 class="h2">Cinq pôles, <em>une même exigence.</em></h2>            <!-- accent colour -->
<h1 class="display-xxl upper" data-split>Poli pour <span class="hl">l’excellence.</span></h1>  <!-- highlighter pill (animates in with data-split / data-reveal) -->
<p class="h2">L’anglais qui se <span class="swash">vit</span></p>         <!-- hand-drawn swash (CSS only; colour = --swash, default --accent-2) -->
```

---

## 8. Layout

```html
<section class="section" data-tone="mist" id="agenda">      <!-- padding-block: --section-y -->
  <div class="container">…</div>                              <!-- max 1320px + gutters; --narrow (900) / --wide (1560) -->
</section>
```
* Section sizes: `.section` · `.section--sm` (alias `--tight`) · `.section--lg` · `.section--flush-top` · `.section--flush-bottom` · `.section--clip` (overflow hidden).
* Shapes: `.section--round` (rounded top, overlaps the previous section by `--radius-lg`) · `.section--inset` (rounded colour panel with a small outer margin). `.band` = thin strip (ticker).
* Grids: `.grid` + `.grid--2|3|4|5` (responsive), `.grid--auto` (`style="--min:260px"`), `.grid--tight`. `.bento` = 12-col grid; children set `style="--span:6"` (≥1024) and `--span-md` (720–1023, default 6).
* Splits: `.split` (1:1 from 900px) + `--7-5` `--5-7` `--4-8` `--8-4` `--reverse` `--center` `--end`; `.sticky` (sticky column).
* Flow: `.stack` (+`--sm|--lg|--xl`), `.cluster`, `.btn-row`, `.center` / `.text-center`.
* Section head:
```html
<div class="section-head section-head--split">
  <div><p class="eyebrow"><span class="eyebrow__num">05</span><span class="fr">Nos pôles</span><span class="en">Our divisions</span></p>
       <h2 class="section-head__title" data-split><span class="fr">Cinq pôles, <em>une même exigence.</em></span><span class="en">Five divisions, <em>one standard.</em></span></h2></div>
  <div class="section-head__aside"><p class="lead">…</p><a class="link-arrow" href="…">…<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/img/icons.svg#i-arrow-right"></use></svg></a></div>
</div>
```
Variants: `--split`, `--center`; `.section-head__title--xl`.

---

## 9. Components (copy-paste)

### Buttons & links
```html
<button type="button" class="btn btn--primary js-reg" data-offer="camp-mini">
  <span class="fr">S’inscrire</span><span class="en">Register</span>
  <span class="btn__icon" aria-hidden="true"><svg class="icon" focusable="false"><use href="assets/img/icons.svg#i-arrow-right"></use></svg></span>
</button>
<a class="btn btn--ghost" href="inscriptions.html">…</a>
<a class="btn btn--accent btn--sm" href="…">…</a>
<a class="btn btn--wa js-wa" href="https://wa.me/2250798719076" target="_blank" rel="noopener"><svg class="icon" aria-hidden="true" focusable="false"><use href="assets/img/icons.svg#i-whatsapp"></use></svg>WhatsApp</a>
<a class="link-arrow" href="…">Voir l’agenda<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/img/icons.svg#i-arrow-right"></use></svg></a>
```
* `.btn` = primary colours of the current tone (`--btn-bg/--btn-fg`, liquid fill to `--btn-hover-bg` on hover). Variants: `--primary` (same as default) · `--accent` (alias **`--gold`** kept) · `--ghost` (outline, fills with `--fg`) · `--light` (white/ink, for photos/colour) · `--dark` (ink) · `--wa` (WhatsApp green, ink text) · sizes `--sm` `--lg` · `--block` · `--icon` (round icon-only; add `aria-label`).
* `.btn__icon` = round bubble with an arrow (rotates on hover). Plain `.icon` inside a button also works; add `icon--arrow` / `icon--up-right` / `icon--down` for the hover nudge.
* `.link-arrow` (+`--light`), `.link-underline`, `.stretched-link` (makes a whole card clickable; other controls inside stay clickable when the card has `.has-stretched` or is a `.pole-card`).
* Add `data-magnetic` on key CTAs (desktop pointer only).

### Eyebrow, chips, tags, badges, prices, swatches
```html
<p class="eyebrow"><span class="eyebrow__num">04</span>English Camp</p>
<p class="eyebrow eyebrow--dot">…</p>   <!-- also --plain, --fg, --pill, --center -->
<span class="chip">Enfants & adultes</span>   <!-- --outline · --solid · --ink · --white · --lg · <span class="chip__dot"></span> -->
<span class="chip" data-pole="camp">English Camp</span>
<span class="tag">Nouveau</span>  <span class="tag" data-pole="editions">Editions</span>
<span class="badge">Sur devis</span>  <span class="badge" data-pole="training">Sommet</span>  <span class="badge badge--accent">…</span>
<span class="price"><span class="fr">dès</span><span class="en">from</span> <b>3 000</b> FCFA</span>   <!-- --soft · --plain -->
<p class="price-tag"><span class="price-tag__label"><span class="fr">À partir de</span><span class="en">From</span></span><span class="price-tag__value">50 000<small>FCFA</small></span></p>  <!-- .price-tag--accent -->
<span class="swatch" data-pole="langues" aria-hidden="true">02</span>   <!-- style="--size:48px" · .swatch--round -->
<span class="icon-badge" data-pole="camp"><svg class="icon" aria-hidden="true" focusable="false"><use href="assets/img/icons.svg#i-tent"></use></svg></span>  <!-- --solid · style="--size:64px" -->
<div class="chip-list">…</div>
```
`.lchip[aria-pressed]` = filter chip (languages filter, created by app.js).

### Sticker (rotating circular text)
`<path id>` must be **unique per page**. Ring text should fill the circle (≈ 2× the phrase); `textLength="280"` spreads it evenly.
```html
<div class="sticker" aria-hidden="true">   <!-- colours: tone accent button; or data-pole="camp" · --ink · --white · --accent · --emerald; sizes --sm / --lg / style="--size:160px;--tilt:6deg" -->
  <svg class="sticker__ring" viewBox="0 0 120 120" focusable="false">
    <defs><path id="st-hero" d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0"/></defs>
    <text class="fr"><textPath href="#st-hero" textLength="280" lengthAdjust="spacing">Poli pour l’excellence • Poli pour l’excellence • </textPath></text>
    <text class="en"><textPath href="#st-hero" textLength="280" lengthAdjust="spacing">Polished for excellence • Polished for excellence • </textPath></text>
  </svg>
  <span class="sticker__core"><svg class="icon" focusable="false"><use href="assets/img/icons.svg#i-arrow-down"></use></svg></span>  <!-- or short text: <span class="sticker__core">dès 3 000</span> -->
</div>
```
Place it absolutely in your layout (`.page-hero__sticker`, `.cta-band__sticker`, inside `.media-stack`, or page CSS). Use `data-reveal="pop"` for an entrance.

### Cards
A `.card` **without** `data-tone` is a surface of its section (`--surface`); **with** `data-tone` it becomes that colour world.
```html
<article class="card card--hover">   <!-- --outline · --lg · --flush · --hover -->
  <span class="icon-badge"><svg class="icon" aria-hidden="true" focusable="false"><use href="assets/img/icons.svg#i-book"></use></svg></span>
  <h3 class="card__title">Club de lecture</h3>
  <p class="card__text">…</p>
  <div class="card__foot"><span class="price">…</span><a class="link-arrow" href="…">…</a></div>
</article>
```
`.card__media` (full-bleed image on top of a card) · `.card--flush`.

**Pôle card** (use both attributes):
```html
<article class="card pole-card" data-tone="camp" data-pole="camp">
  <div class="pole-card__top"><span class="pole-card__num">04</span><span class="pole-card__icon"><svg class="icon" aria-hidden="true" focusable="false"><use href="assets/img/icons.svg#i-tent"></use></svg></span></div>
  <figure class="pole-card__media"><img …></figure>   <!-- optional -->
  <h3 class="pole-card__title"><a class="stretched-link" href="english-camp.html">English Camp</a></h3>
  <p class="pole-card__text"><span class="fr">L’anglais qui se vit, pas qui se récite.</span><span class="en">English you live, not English you recite.</span></p>
  <div class="pole-card__foot"><span class="chip">…</span><span class="pole-card__arrow" aria-hidden="true"><svg class="icon" focusable="false"><use href="assets/img/icons.svg#i-arrow-up-right"></use></svg></span></div>
</article>
```
Pôle → tone: training `sommet` · langues `langues` · shopping `shop` · camp `camp` · editions `editions`. Typical grid: `<div class="bento" data-stagger>` with `style="--span:6"` ×2 then `--span:4` ×3.

**Value card** (fills with `--accent` on hover): `<article class="card value-card"><div class="value-card__num">01<svg class="icon">…</svg></div><h3 class="value-card__title">Exigence</h3><p class="value-card__text">…</p></article>`

**Contact card**: `<a class="contact-card" href="mailto:…"><span class="contact-card__ico"><svg class="icon">…</svg></span><span class="contact-card__label">E-mail</span><span class="contact-card__value">manager@jaspeemeraude.com</span><svg class="icon contact-card__arrow" aria-hidden="true">…#i-arrow-up-right</svg></a>`

### Media & masks
```html
<figure class="media media--arch ratio-3x4" data-reveal="mask">
  <img src="assets/img/photos/camp-02.webp" srcset="assets/img/photos/camp-02-sm.webp 720w, assets/img/photos/camp-02.webp 1200w" sizes="(min-width:960px) 40vw, 90vw" width="1200" height="1600" alt="Enfants de l’English Camp avec des ballons « E CAMP »" loading="lazy" decoding="async">
  <figcaption class="media__caption">English Camp · 1<sup>re</sup> édition</figcaption>
</figure>
```
* Shapes: default rounded (`--radius-lg`) · `--sm` · `--arch` (needs a `ratio-*` class) · `--arch-full` · `--arch-down` · `--circle` · `--pill` · `--blob` · `--facet` (cut octagon) · `--square`.
* Ratios: `ratio-1` `ratio-4x5` (default) `ratio-3x4` `ratio-2x3` `ratio-4x3` `ratio-3x2` `ratio-16x9` `ratio-21x9` `ratio-auto`.
* Hover zoom: `.media--zoom` (or any `a:hover > .media`). Overlay gradient: `.media__shade`. Parallax inside: `<img data-parallax="0.1">`.
* Composition: `.media-stack` (relative wrapper; a direct `.sticker` child is placed bottom-right, tweak `--sx --sr --st --sb`), `.float-chip` (absolute white pill with `--elev`; `.chip__dot` pulses; `.float-chip--idle` floats), `.collage` (12-col canvas, children `style="--col:1 / 8;--row:1 / 9;--z:2"`), `.badge-logo` (round white logo badge, `--size`).

### Marquee (big bold type)
```html
<div class="band" data-tone="ink">
  <div class="marquee ticker" aria-label="Nos pôles">   <!-- .ticker--sm · .marquee--reverse · .marquee--hover-pause · style="--marquee-duration:40s" -->
    <div class="marquee__track"><div class="marquee__group">
      <span class="marquee__item">Training</span><span class="marquee__sep"></span>
      <span class="marquee__item marquee__item--accent">Langues</span><span class="marquee__sep"></span>
      <span class="marquee__item marquee__item--outline">English Camp</span><span class="marquee__sep"></span>
    </div></div>
  </div>
</div>
```
main.js clones the group once (aria-hidden) if only one is present and pauses it off-screen. `.marquee__img` = small pill photo inline in the ticker.

### Page hero (inner pages)
```html
<section class="page-hero" data-tone="langues" data-pole="langues">   <!-- --inset (rounded panel) · --center · --compact -->
  <div class="container page-hero__grid">
    <div>
      <nav class="breadcrumb" aria-label="Fil d’Ariane" data-aria-fr="Fil d’Ariane" data-aria-en="Breadcrumb"><ol>
        <li><a href="index.html"><span class="fr">Accueil</span><span class="en">Home</span></a></li>
        <li><span aria-current="page"><span class="fr">Langues étrangères</span><span class="en">Foreign languages</span></span></li>
      </ol></nav>
      <p class="eyebrow"><span class="eyebrow__num">02</span><span class="fr">Pôle langues</span><span class="en">Languages</span></p>
      <h1 class="page-hero__title" data-split>…<em>…</em></h1>        <!-- .upper · .page-hero__title--xxl -->
      <p class="page-hero__lead" data-reveal data-delay="200">…</p>
      <div class="page-hero__actions btn-row" data-reveal data-delay="300">…</div>
    </div>
    <div class="page-hero__media">
      <figure class="media media--arch ratio-3x4" data-reveal="mask"><img … fetchpriority="high"></figure>
      <div class="page-hero__sticker" data-reveal="pop" data-delay="600"><!-- .sticker --></div>
    </div>
  </div>
  <span class="page-hero__num" aria-hidden="true">02</span>
</section>
```

### CTA band
```html
<section class="section section--sm"><div class="container">
  <div class="cta-band">                       <!-- default = emerald-vivid; any data-tone works; --center · --full -->
    <div class="cta-band__grid">
      <div><p class="eyebrow">…</p><h2 class="cta-band__title" data-split>Façonnons votre <span class="hl">excellence.</span></h2><p class="lead">…</p></div>
      <div class="cta-band__actions"><button type="button" class="btn btn--primary btn--lg js-reg">…</button><a class="btn btn--ghost btn--lg js-wa" href="https://wa.me/2250798719076" target="_blank" rel="noopener">WhatsApp</a></div>
    </div>
    <div class="cta-band__sticker"><!-- optional .sticker --></div>
  </div>
</div></section>
```
For a full-width final CTA use `<section class="section" data-tone="emerald-vivid">` instead. `.panel` = rounded box with any tone (`<div class="panel" data-tone="emerald">`).

### Agenda / timeline
```html
<div class="agenda">
  <span class="agenda__line" data-draw="scrub" aria-hidden="true"></span>
  <article class="agenda__item" data-pole="camp">
    <p class="agenda__date"><span class="fr">Décembre</span><span class="en">December</span> <em>2026</em><small>English Camp</small></p>
    <div class="agenda__body"><span class="tag" data-pole="camp">English Camp</span><h3 class="agenda__title">Mini-camps</h3><p class="agenda__text">…</p></div>
    <div class="agenda__actions"><span class="price">dès <b>5 000</b> FCFA</span><button type="button" class="btn btn--primary btn--sm js-reg" data-offer="camp-mini">…</button></div>
  </article>
</div>
```

### Steps (path)
```html
<ol class="steps steps--4">   <!-- --2 / --3 / --4 → horizontal dashed path ≥860px, vertical below -->
  <li class="step"><h3 class="step__title">…</h3><p class="step__text">…</p></li>
</ol>
```
Numbers (01, 02…) are generated in accent circles.

### Accordion (native `<details>`)
```html
<div class="accordion">   <!-- surface cards; .accordion--lines = hairline rows -->
  <details class="accordion__item" open>
    <summary><span class="fr">Sécurité & encadrement</span><span class="en">Safety & supervision</span><span class="accordion__icon" aria-hidden="true"></span></summary>
    <div class="accordion__body"><ul class="check-list"><li>…</li></ul></div>
  </details>
</div>
```

### Stats / counters
```html
<div class="stats" data-stagger>   <!-- .stats--3 · .stats--plain (no cards, top rule) -->
  <div class="stat"><span class="stat__num" data-count="15">15</span><p class="stat__label">enfants par classe</p><p class="stat__sub">…</p></div>
  <div class="stat"><span class="stat__num"><span data-count="2">2</span><sup>e</sup></span><p class="stat__label">édition du Sommet</p></div>
</div>
```
Only real figures from the brief.

### Other components
* `.price-list > .price-list__item` with `__name`, `__value` (`<small>dès</small>3 000 FCFA`), `__desc`.
* `.pillars` (+`--row` ≥1100px) > `.pillar` > `.pillar__num` + `<div><h3 class="pillar__title">…</h3><p>…</p></div>`.
* `.b2b` (inside an `emerald` section): left text (`.b2b__title`, `.lead`, `.b2b__cta`, `.fine`) + `ul.b2b__list > li` with `.b2b__ico`.
* Lists: `.check-list` (accent check circles), `.dot-list` (alias `.gem-list`), `.num-list`.
* `.pull-quote` (+`<cite>`), `.note` (+`--surface`), `.scroll-cue` (`<a class="scroll-cue" href="#next"><span class="scroll-cue__icon"><svg class="icon">…#i-arrow-down</svg></span>Défiler</a>`), `.rule`.

### Header, mega-menu, mobile menu, footer
Provided by the partials (do not rebuild). Mega-menu rows use `data-pole` swatches and `data-mega-index` previews; the mobile menu is full-screen with big Bricolage links and pôle swatch rows; the footer is `data-tone="ink"` with the big CTA headline, pôle swatches, contact, socials, legal links, `© <span data-year></span>` and the giant wordmark.

---

## 10. Motion engine (`assets/js/main.js`, `window.JEG`)

Everything is opt-in with data-attributes; content is visible without JS and with reduced motion.

| Attribute | Values / options | Effect |
|---|---|---|
| `data-reveal` | `up` (default, empty) · `down` · `left` · `right` · `fade` · `scale` · `pop` · `clip` · `mask` · `blur` | animates in when entering the viewport (once). `mask` = clip from bottom + image zoom-out (use on `.media`). `pop` = scale+rotate (stickers). Attribute is removed when finished. |
| `data-delay="200"` | ms | extra delay (reveal, split, count, draw) |
| `data-stagger="90"` | ms step (default 90) | on a parent: every direct child gets `data-reveal="up"` (unless it has one) and children revealed together are staggered |
| `data-split` | (words) · `"chars"` | line-mask text reveal per word / per character; FR and EN stagger independently. Use on titles. Works with `<em>`, `.hl`, `.swash` inside. |
| `data-fill` | — | words light up (16% → 100%) while scrolling through (long statements) |
| `data-count="15"` | + `data-prefix`, `data-suffix`, `data-duration` (ms, default 1900), decimals via `"4,5"` | counts up from 0 (French number formatting) |
| `data-parallax="0.12"` | factor (default .12; negative = opposite) | vertical parallax; on `<img>` inside `.media` it is clamped to the frame |
| `data-magnetic="0.32"` | strength | element follows the mouse (desktop only) |
| `data-tilt="8"` | max degrees | 3D tilt + glare on hover (desktop only) |
| `data-draw` | (on reveal) · `"scrub"` (scroll-linked) | draws SVG strokes (path/line/circle…). On an HTML element with `"scrub"` it sets `--draw` 0→1 (used by `.agenda__line`). |
| `data-cursor="Voir"` | + `data-cursor-en="View"` | custom cursor shows a label over the element |
| `.marquee` | — | group cloned + paused off-screen (CSS animation) |
| `data-to-top`, `data-header`, `data-mega*`, `data-menu-toggle`, `data-mobile-menu`, `data-nav-backdrop`, `data-curtain`, `data-loader*`, `data-year` | partial hooks | don’t rename |

API:
* `JEG.refresh(root?)` — prepare/observe new content (call after injecting HTML; app.js already does it for its components).
* `JEG.isReady` — `true` once the loader / curtain is done.
* `JEG.scrollTo(target, {offset, focus})` — eased scroll (element, selector or y). Same-page `#hash` links are handled automatically (header offset via `scroll-margin-top`).
* `JEG.navigate(url)` — leave with the emerald curtain transition (internal links are intercepted automatically; opt out with `data-no-transition`; `target="_blank"`, downloads, mailto/tel are ignored).
* `JEG.closeMenus()` — close mega-menu + mobile menu.

Events: `document` **`jeg:ready`** (once, after loader/curtain — start page-specific intro animations on it, or check `JEG.isReady` first); `jeg:lang` (dispatched by app.js; fills/metrics refresh); `jeg:theme`, `jeg:modal` (app.js).

States on `<html>`: `js`/`no-js`, `lang-en`, `dark`, `is-returning`, `is-loading`, `is-ready`, `menu-open`, `mega-open`, `has-cursor` (+ app.js: `has-modal`, `is-scroll-locked`, `app-ready`).

Loader (first visit of the session): deep emerald screen → rough coral jaspe stone is cut (white lines) and polished into a vivid emerald (facets + shine), « JASPE-ÉMERAUDE » rises letter by letter (Bricolage 800), « GROUP » tracks in, bilingual tagline, progress bar + counter; min 2.8s (waits for fonts/load, max 5.4s), then the gem window opens onto the page and `jeg:ready` fires. Next pages in the session: emerald curtain only.

### Reduced motion & no-JS
* `prefers-reduced-motion: reduce`: no loader, no curtain, no cursor; reveals/splits/fills/counters show their final state; no parallax, tilt, magnetic, marquee motion (marquee becomes a scrollable row), sticker rotation stops; smooth scroll is instant; header no longer hides.
* No JS (`html.no-js`): loader/curtain/cursor/progress/to-top hidden, every content visible, burger replaced by a “Menu” link to the footer, mega-menu opens on hover/focus.

---

## 11. Accessibility checklist for page agents
Landmarks (`header`/`nav`/`main#main`/`footer` come from the partials), one `h1` per page, logical heading order, `aria-label` (with `data-aria-fr/en`) on icon-only controls, decorative SVG/stickers `aria-hidden="true"`, `alt` in French, focus is visible everywhere (`--focus`), touch targets ≥ 42px, don’t put small text in `--accent` on `langues`/`camp`/`sommet`/`editions`/`shop` (use `--accent-ink`), keep every animation optional (data-attributes only).
