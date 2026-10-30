# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Simulateur du remboursement d'une paire de lunettes en Belgique (INAMI + mutualité), utilisé au comptoir par un opticien. Projet en français : code, noms de variables, commentaires, commits et échanges avec l'utilisateur. L'utilisateur est opticien, pas développeur, et travaille souvent depuis l'app iPhone : expliquer simplement, en français.

## Commandes

```
npm test                                                     # node:test, Node 20+, aucune dépendance
node --test --test-name-pattern="Helan" tests/calcul.test.js # un seul test (ou un groupe) par nom
npm run build                                                # dist/simulateur.html et dist/index.html
```

Pas de linter ni de dépendances npm : ne pas en ajouter sans raison. Pour vérifier l'interface, ouvrir `dist/index.html` dans Chromium via Playwright (préinstallé) : en émulation téléphone réelle (`devices['iPhone 13']`, qui respecte la balise viewport, contrairement à une simple fenêtre de 390 px) et à 1200 px, en FR et en NL. WebKit n'est pas installé : ce qui est propre à Safari se vérifie sur l'iPhone de l'utilisateur.

## Architecture

- `src/calcul.js` : toute la logique, fonctions pures sans dépendance. Point d'entrée `simuler(entree, inami, mutualites, lang)`. Ordre du calcul : conditions générales (prescription, délai de renouvellement) → catégorie INAMI œil par œil (`categorieVerre` : 1 = dès ±6 D, 2 = moins de 18 ans, 3 = 65 ans et plus en bifocal ou progressif dès ±4,25 D) → code tarifaire (`classeIndice` puis `choisirCode`, le code le moins cher compatible) → supplément cylindre et monture enfant → colonne à 75 % (non conventionné, non BIM) → mutualité (`calculMutualite`) → reste à payer, plafonné au prix saisi.
- `data/inami-2026.json` : seuils, délais et les codes du tarif opticiens. Chaque code porte `categorie`, `type`, `materiau`, `indice` (`bas`/`haut`/`tous`), une plage `cyl` ([0,0] = sphérique), parfois une plage `puissance` (codes enfants à indice élevé), `honoraire` (taux plein) et `reduit` (colonne à 75 %). Les montants ne sont jamais écrits dans le code : une indexation se fait en changeant ce fichier.
- `data/mutualites.json` : une entrée par mutualité. `cumul_inami` vaut `true` (s'ajoute à l'INAMI, plafonné au reste à payer), `false` (paie seulement si l'INAMI ne rembourse rien) ou `null` (inconnu : le simulateur affiche deux scénarios). `periode_type` vaut `glissant` ou `calendaire`. Le champ `note` en tête du fichier documente les autres champs. `fiabilite` qui commence par « officiel » ou « fiable » supprime l'avertissement « à vérifier ».
- `MESSAGES.fr` / `MESSAGES.nl` dans `calcul.js` : tous les textes renvoyés par le calcul. Un test exige que chaque clé existe dans les deux langues.
- `src/page.html` : l'interface (HTML, CSS et JS dans un seul fichier), avec son propre dictionnaire `UI.fr` / `UI.nl` et les attributs `data-i18n`. Elle contient des marqueurs remplacés au build : `/*FONTS_CSS*/`, `/*INAMI_JSON*/`, `/*MUTUALITES_JSON*/`, `/*CALCUL_JS*/`. Elle ne s'ouvre donc pas directement : toujours passer par `npm run build`.
- `build.js` : intègre les polices de `fonts/` en base64 (aucun appel à Google Fonts, pour le RGPD et l'usage hors ligne), les deux JSON, et `calcul.js` sans ses `export`. Le résultat est une page autonome.

## Conventions

- Dates : chaînes « AAAA-MM-JJ » lues par `lireDate`, sans objet `Date`, pour éviter les décalages de fuseau horaire. Les corrections sont arrondies au quart de dioptrie, les montants au centime.
- Chaque règle ou cas limite de l'article 30 ou d'une mutualité a son test. Un changement de données vérifié sur une source est daté (`verified_on`) et accompagné d'un test.
- Ajouter un texte affiché = l'ajouter en français et en néerlandais.

## Sources et vérification

- Tarif officiel : https://www.inami.fgov.be/SiteCollectionDocuments/tarif_opticiens_20260101.pdf. Pour revérifier, extraire le texte avec `pdftotext -layout` et comparer chaque code (honoraire et colonne non conventionné). La page « Honoraires, prix et remboursements des opticiens » de l'INAMI liste les versions publiées : vérifier qu'aucune n'est plus récente que celle du projet (indexation de 2,72 % annoncée, pas encore appliquée aux opticiens au 28/10/2026).
- Mutualités : préférer les statuts et brochures officiels aux pages web, qui omettent souvent la règle de cumul. mc.be et cm.be refusent les robots : ne pas contourner, passer par la recherche web ou par des documents hébergés ailleurs (brochure MC 2026 sur cm-mc.bynder.com).
- Points ouverts (interprétations de l'article 30 en attente de l'INAMI, ambiguïté Mutualia, cumul déduit pour Solidaris Brabant et la Libérale, règles rares non calculées) : section « Avant une mise en ligne publique » du README.

## Déploiement et git

- `.github/workflows/tests.yml` : tests et build sur `main` et sur chaque PR. `.github/workflows/pages.yml` : à chaque push sur `main`, publication sur GitHub Pages (https://omarhadjmehend.github.io/simulateur-inami/).
- Chaque fusion dans `main` met donc le site public à jour. Travailler sur une branche, ouvrir une PR, et laisser l'utilisateur fusionner.
- Hors périmètre actuel : lentilles de contact, verres lenticulaires, prismes, filtres médicaux, basse vision (leurs codes sont dans le même PDF tarifaire).
