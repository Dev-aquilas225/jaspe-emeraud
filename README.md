# Jaspe-Émeraude Group — site web

> « Poli pour l’excellence » — éducation et développement des compétences à Abidjan, Côte d’Ivoire.
> Site officiel : **https://jaspe-emeraudegroup.com/** · Prévisualisation : **https://dev-aquilas225.github.io/jaspe-emeraud/**

Refonte complète de l’ancien site « une page » en un **site multi-pages statique** : HTML, CSS et
JavaScript « maison », **sans framework ni dépendance** (seule ressource externe : Google Fonts).
Bilingue français / anglais, mode clair / sombre, animations au défilement, écran de chargement
animé, et toutes les fonctions de l’ancien site (inscriptions avec code JEG-XXXX, WhatsApp,
formulaires, professeurs et galeries lus depuis Google Sheets).

---

## 1. Direction artistique (v3)

Choisie avec le client après la v2 (fond ivoire granuleux et police à empattements jugés « sales ») :

- **Typographies** : **Bricolage Grotesque** pour les titres (graisses 700–800, très serrée, grands
  titres jusqu’à ~10 vw, majuscules autorisées) et **Inter** pour le texte et l’interface.
  Pas de police à empattements, pas d’italique : on met un mot en valeur par la **couleur d’accent**,
  un **surligneur** (pastille), un **trait dessiné** ou un **sticker** (badge rond à texte tournant).
- **Fonds nets** : blanc pur, gris brume très clair et **une couleur saturée par pôle** — jamais de
  beige, de grain ou de dégradé terne.

| Univers (`data-tone`) | Couleurs | Où |
|---|---|---|
| `white` / `mist` | blanc / gris brume, texte encre, accent émeraude | sections neutres, pages légales |
| `emerald` / `emerald-vivid` | émeraude profond / émeraude vif | marque, Équipe, Contact, 404, bandeaux d’appel |
| `ink` | noir encre | pied de page, bandeaux défilants |
| `sommet` | noir, rouge, or | 01 · Training & Sommet de l’Excellence |
| `langues` | orange vif | 02 · Langues étrangères |
| `shop` | jaune soleil | 03 · Shopping |
| `camp` | dégradé ciel → menthe, bleu marine | 04 · English Camp |
| `editions` | lilas, violet | 05 · Jaspe’e Editions |

Formes plates et nettes : grands arrondis (20–32 px), pilules, photos arrondies ou en arche,
grands numéros « 01–05 », presque aucune ombre. Le contrat complet (couleurs, composants, exemples
à copier-coller) est dans **`docs/design-system.md`** ; les fonctions métier dans
**`docs/app-components.md`**.

---

## 2. Arborescence

```
.
├── index.html               Accueil
├── training.html            01 · Training / Sommet de l’Excellence (section #sommet)
├── langues.html             02 · Langues étrangères
├── shopping.html            03 · Shopping
├── english-camp.html        04 · English Camp
├── editions.html            05 · Jaspe’e Editions
├── inscriptions.html        Agenda & tarifs (#agenda, #tarifs, #etapes, #paiement)
├── equipe.html              Équipe (#professeurs, #rejoindre)
├── contact.html             Contact (#formulaire, #institutions)
├── mentions-legales.html    Mentions légales
├── confidentialite.html     Politique de confidentialité
├── 404.html                 Page introuvable (fonctionne à n’importe quelle adresse)
├── assets/
│   ├── css/
│   │   ├── main.css         design system : couleurs, typographie, composants, animations
│   │   ├── app.css          fenêtres (inscription…), formulaires, professeurs, galeries
│   │   └── pages/*.css      styles propres à une page
│   ├── js/
│   │   ├── main.js          moteur d’animation, menus, écran de chargement (window.JEG)
│   │   ├── app.js           logique métier + bloc CONFIG (window.JEGApp)
│   │   └── pages/*.js       scripts propres à une page
│   └── img/
│       ├── brand/           logos, favicon, icônes d’application
│       ├── photos/          photos (<nom>.webp + <nom>-sm.webp)
│       └── icons.svg        jeu d’icônes (trait 1,75 px)
├── partials/                modèles de référence : <head>, loader, en-tête, pied de page (non publiés)
├── docs/                    documentation technique (non publiée)
├── robots.txt · sitemap.xml · site.webmanifest
├── netlify.toml             configuration Netlify (404, en-têtes, cache)
└── .github/workflows/deploy-pages.yml   publication GitHub Pages
```

---

## 3. Lancer le site en local

Le site doit être servi par un petit serveur (en ouvrant directement le fichier `index.html`, les
icônes et les données Google Sheets ne se chargent pas). Depuis le dossier du projet :

```bash
npx serve .                  # puis ouvrir l’adresse affichée (http://localhost:3000)
# ou
python3 -m http.server 8000  # puis ouvrir http://localhost:8000
```

Astuce : l’écran de chargement ne s’affiche qu’à la **première page de la session** ; pour le revoir,
ouvrez un nouvel onglet ou une fenêtre de navigation privée.

---

## 4. Modifier les textes

Chaque texte existe **en deux langues**, côte à côte :

```html
<span class="fr">Façonnons votre excellence.</span><span class="en">Let’s shape your excellence.</span>
```

Modifiez les deux. Autres cas :

| Élément | Où se trouve la traduction |
|---|---|
| Titre de l’onglet | `<title data-en="Titre anglais">Titre français</title>` |
| Texte d’aide d’un champ | `data-ph-fr="…"` et `data-ph-en="…"` |
| Libellé d’un bouton-icône (lecteurs d’écran) | `data-aria-fr="…"` et `data-aria-en="…"` |
| Options d’une liste | `<option data-fr="…" data-en="…">` |

Typographie française : apostrophe courbe `’`, guillemets « » avec espaces insécables, espace fine
insécable avant `: ; ! ?` (`&#8239;`). Ne jamais inventer de prix, de dates ou de chiffres : ils
doivent venir du client.

**En-tête et pied de page** : ils sont copiés dans chaque page à partir de `partials/header.html` et
`partials/footer.html`. Pour changer un lien du menu ou du pied de page, modifiez le modèle **puis**
reportez la modification dans toutes les pages (rechercher / remplacer dans l’éditeur).

---

## 5. Photos

- Format **WebP**, deux tailles par photo : `assets/img/photos/<nom>.webp` (≤ 1600 px) et
  `<nom>-sm.webp` (≤ 720 px, pour les téléphones).
- Dans le HTML, toujours : `width` et `height` réels, un `alt` descriptif **en français**,
  `loading="lazy"` et `decoding="async"` (sauf la grande photo d’en-tête : `fetchpriority="high"`),
  et `srcset` + `sizes` avec les deux tailles. Exemple :

```html
<img src="assets/img/photos/camp-02.webp"
     srcset="assets/img/photos/camp-02-sm.webp 720w, assets/img/photos/camp-02.webp 1200w"
     sizes="(min-width: 960px) 40vw, 90vw" width="1200" height="1600"
     alt="Enfants de l’English Camp avec des ballons « E CAMP »" loading="lazy" decoding="async">
```

- Les images sont mises en cache **un an** par Netlify : pour **remplacer** une photo, donnez au
  nouveau fichier un **nouveau nom** (ex. `camp-02b.webp`) et mettez à jour la page.
- Les galeries English Camp, Sommet et Editions peuvent aussi être alimentées sans toucher au code,
  par Google Sheets (ci-dessous).

---

## 6. Google Sheets : professeurs et galerie

Le site lit un tableau Google Sheets à chaque visite (les changements apparaissent en quelques
minutes). Le tableau doit rester **partagé en lecture** (« Toute personne disposant du lien »),
sinon le site garde ses fiches et photos par défaut.

**Onglet « Professeurs »** (page Équipe, et Langues pour les professeurs de langues) — une ligne par
professeur. Colonnes lues : **NOM**, **PRENOMS**, **MATIERES** (+ MATIERES EN), **PRESENTATION…**
(+ PRESENTATION EN), **POINTS FORTS** (+ POINTS FORTS EN), **POLE**, **PHOTO** (lien de partage
Google Drive), **AFFICHAGE** (`oui` pour afficher). Plusieurs matières : séparées par `&`, `,`, `/`
ou « et ». Les colonnes d’heures ou de **tarifs** ne sont **jamais** affichées. Sans réponse du
tableau, des fiches génériques par métier s’affichent.

**Onglet « GALERIE »** — colonnes **PHOTO** (lien de partage Drive d’une photo), **LEGENDE**
(français), **LEGENDE EN**, **POLE**, **AFFICHAGE** (`oui` / `non`). Le **POLE** décide où la photo
apparaît : `English Camp` → page English Camp ; `Sommet de l’Excellence` ou `Training` → page
Training / Sommet ; `Jaspe’e Editions` → page Editions ; `Langues`, `Shopping` ou vide → accueil
(« Nos 5 pôles »). Dès qu’une photo existe pour un pôle, elle remplace les photos d’exemple de cette
section. Chaque photo doit être partagée en lecture.

Détails complets : `docs/app-components.md`, § 12.

---

## 7. Réglages : bloc `CONFIG` de `assets/js/app.js`

Ouvrez `assets/js/app.js` : le bloc **CONFIGURATION** tout en haut est le **seul** endroit à
modifier. Changez uniquement ce qui est entre apostrophes `'…'`.

| Réglage | Rôle |
|---|---|
| `WHATSAPP_NUMBER` | Numéro WhatsApp de tous les boutons, format international sans « + » ni espaces (`2250798719076`). Vide → les boutons mènent à la page Contact. |
| `PHONE_DISPLAY` | Le même numéro, tel qu’il s’affiche. |
| `PAYMENT_NUMBER` / `PAYMENT_NUMBER_RAW` | Numéro Orange Money / Wave des instructions de paiement (avec / sans espaces ; « Copier le numéro » copie la version sans espaces). |
| `EMAIL` | Adresse e-mail de contact. |
| `WEB3FORMS_KEY` | Clé du service **Web3Forms** qui envoie les formulaires par e-mail. |
| `FROM_NAME` | Nom de l’expéditeur des e-mails reçus. |
| `PROFS_CSV_URL` / `GALLERY_CSV_URL` | Adresses des onglets « Professeurs » et « GALERIE » du Google Sheets. |

Juste en dessous, la liste **`OFFERS`** contient les prix « à partir de » de la fenêtre
d’inscription (`price: 3000`…) ; `0` affiche « Prix sur demande via WhatsApp ». Ne modifiez pas les
identifiants `v: '…'`. Pensez à mettre aussi à jour les prix écrits dans les pages. Les numéros
affichés en clair dans les pages (en-tête, pied de page, Contact, mentions légales) se modifient dans
ces pages.

**Web3Forms** (https://web3forms.com) : l’adresse qui **reçoit** les e-mails se règle dans le compte
Web3Forms, pas dans le site. Pour changer d’adresse : créez une nouvelle clé avec la bonne adresse,
puis remplacez `WEB3FORMS_KEY`. Les inscriptions passent d’abord par **WhatsApp** (message prérempli
avec le code JEG-XXXX) ; l’e-mail n’en est qu’une copie de sécurité.

---

## 8. Animations et écran de chargement

Tout est piloté par `assets/js/main.js` avec de simples **attributs HTML** — aucun code à écrire :

| Attribut | Effet |
|---|---|
| `data-reveal` (`up`, `fade`, `scale`, `left`, `right`, `clip`, `mask`, `pop`, `blur`) | apparition au défilement |
| `data-stagger="90"` | les éléments enfants apparaissent l’un après l’autre |
| `data-delay="200"` | délai (ms) |
| `data-split` (ou `"chars"`) | titre révélé mot par mot (ou lettre par lettre) |
| `data-fill` | les mots s’allument pendant le défilement |
| `data-count="15"` (+ `data-prefix` / `data-suffix`) | compteur animé — **uniquement avec de vrais chiffres** |
| `data-parallax="0.12"` | léger décalage au défilement (photos) |
| `data-magnetic`, `data-tilt` | bouton « aimanté », carte inclinable (ordinateur uniquement) |
| `data-draw` (ou `"scrub"`) | tracé de lignes SVG |
| `data-cursor="Voir"` + `data-cursor-en="View"` | étiquette du curseur personnalisé |
| `.marquee` | bandeau de texte défilant |

**Écran de chargement** (première page de la session) : sur fond émeraude, une pierre brute de jaspe
est taillée puis polie en émeraude, « JASPE-ÉMERAUDE » apparaît lettre par lettre avec « Poli pour
l’excellence », barre de progression et compteur ; durée 2,8 s minimum (5,4 s maximum), puis la gemme
s’ouvre sur la page. Pages suivantes : simple rideau émeraude. Après l’intro, l’événement
`jeg:ready` est envoyé (les scripts de page s’en servent pour démarrer leurs animations).

---

## 9. Accessibilité, mouvement réduit, sans JavaScript

- Repères de navigation, lien « Aller au contenu », un seul titre `h1` par page, focus clavier
  visible, menus et fenêtres utilisables au clavier (Échap, piège du focus), libellés bilingues pour
  les lecteurs d’écran, contrastes conformes WCAG AA dans chaque univers de couleur.
- **Mouvement réduit** (réglage « Réduire les animations » du téléphone / ordinateur) : pas d’écran
  de chargement ni de rideau, textes et images affichés directement, pas de parallaxe, d’aimant,
  d’inclinaison ni de bandeau défilant, stickers immobiles.
- **Sans JavaScript** : tout le contenu reste visible, le menu mobile est remplacé par un lien vers le
  pied de page.
- Contrôle rapide avant publication : Lighthouse (Chrome → Outils de développement) en mode mobile.

---

## 10. Déploiement

### GitHub Pages (prévisualisation)

Publication automatique par `.github/workflows/deploy-pages.yml` à chaque envoi (push) sur `main`
ou `claude/site-redesign-animations-nlrcak` → **https://dev-aquilas225.github.io/jaspe-emeraud/**.
À activer une seule fois : *Settings → Pages → Build and deployment → Source : « GitHub Actions »*.
Le workflow publie le site sans `docs/`, `partials/`, `README.md` ni `netlify.toml`. Le site étant
servi sous `/jaspe-emeraud/`, tous les liens sont relatifs ; la page 404 calcule elle-même son
adresse de base et s’affiche correctement à n’importe quelle profondeur d’URL.

### Netlify (site officiel jaspe-emeraudegroup.com)

1. *Add new site → Import an existing project* → choisir le dépôt GitHub.
2. Aucune commande de build ; dossier publié : `.` (déjà indiqué dans `netlify.toml`).
3. *Domain management* : rattacher `jaspe-emeraudegroup.com` et activer HTTPS.

`netlify.toml` gère : la page **404** pour toute adresse inconnue, le blocage de `partials/`,
`docs/`, `README.md`…, les en-têtes de sécurité (`X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`, `X-Frame-Options`) et le cache (images 1 an ; CSS / JS 1 h, car leurs noms ne
changent pas d’une version à l’autre). Pas de `Content-Security-Policy` pour l’instant : il faudrait
autoriser Google Fonts, `docs.google.com`, `drive.google.com`, `*.googleusercontent.com` et
`api.web3forms.com`, et la tester entièrement avant de l’activer.

---

## 11. Checklist avant mise en ligne

- [ ] Parcourir chaque page en **FR et EN**, en **clair et sombre**, sur **téléphone et ordinateur**.
- [ ] Vérifier **prix, dates de l’agenda et numéros** avec le client (pages + `OFFERS` dans `app.js`).
- [ ] Faire une **inscription test** : code JEG-XXXX, message WhatsApp prérempli, copie e-mail reçue.
- [ ] Envoyer chaque **formulaire** (Contact, Bénévoles, Sommet) et vérifier la réception Web3Forms.
- [ ] Vérifier que le **Google Sheets** est partagé en lecture et que les lignes à montrer ont
      `AFFICHAGE = oui` (professeurs et galerie, photos Drive partagées).
- [ ] Ouvrir une **adresse inexistante** (ex. `/test/abc`) sur Netlify et sur GitHub Pages : la 404
      doit s’afficher avec ses styles.
- [ ] Compléter si besoin les **mentions légales** (forme juridique, n° RCCM, responsable de la
      publication) avec les informations officielles du client.
- [ ] Mettre à jour `sitemap.xml` (`lastmod`) si des pages sont ajoutées ou retirées.
- [ ] Lancer **Lighthouse** (performance, accessibilité, SEO) sur l’accueil et une page pôle.
- [ ] Vérifier l’aperçu de partage (WhatsApp / Facebook) : titre, description et image.
