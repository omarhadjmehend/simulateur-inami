# Mutopti — simulateur INAMI optique

Outil web qui calcule au comptoir le remboursement d'une paire de lunettes en Belgique : intervention INAMI, avantage de la mutualité et reste à payer. Il ne stocke aucune donnée : tout est calculé dans le navigateur.

## Pourquoi

Les règles INAMI (article 30 de la nomenclature) et les avantages des mutualités se combinent mal de tête. Exemple : une correction de −5,00 (−1,25) a un méridien le plus fort de −6,25 et donne droit à l'INAMI chez un adulte, alors que la sphère seule est sous le seuil de ±6,00. Certaines mutualités (CM, Helan, VNZ) ne paient que si l'INAMI ne rembourse rien. Aucun simulateur belge interactif et à jour n'existait.

## Ce que fait la v1

- Éligibilité INAMI œil par œil (catégories 1°, 2°, 3°), avec la raison affichée
- Validité de la prescription (6 mois jusqu'à sa réception par l'opticien) et renouvellement œil par œil (2 ou 5 ans, ou changement ≥ 0,5 D), avec la règle des 3 verres unifocaux pour des distances différentes
- Code INAMI exact de chaque verre selon le matériau (organique ou minéral), l'indice et le cylindre, parmi les codes du tarif 2026 (les codes enfants à indice élevé sont choisis selon la puissance)
- Supplément cylindre > 6 D et monture enfant (2 interventions max), montants selon la catégorie
- Réduction de 25 % chez un opticien non conventionné, sauf patient BIM, avec les montants arrondis du tarif officiel
- Avantage de 12 mutualités : cumul avec l'INAMI, magasin partenaire, âge adulte propre à chaque mutualité, période glissante ou par année civile, prescription exigée par la mutualité
- Règle de cumul connue pour les 12 mutualités ; deux scénarios si une mutualité ajoutée a une règle inconnue
- Reste à payer (jamais plus que le prix saisi), documents à remettre, niveau de fiabilité de chaque source
- Interface et explications en français et en néerlandais
- Fiche imprimable pour le client : récapitulatif de la saisie, reste à payer, détail et documents à remettre
- Sur téléphone, le total reste affiché en bas de l'écran pendant la saisie
- Application installable sur téléphone, tablette ou ordinateur (Safari : Partager → « Sur l'écran d'accueil » ; Chrome : « Installer ») : icône, plein écran, fonctionne hors ligne, se met à jour seule quand le site change
- Aucun appel à un serveur externe : polices intégrées à la page, fonctionne hors ligne une fois ouverte

Hors v1 : lentilles de contact, verres lenticulaires, filtres médicaux, prismes, basse vision.

## Structure

- `src/accueil.html` : page d'accueil de Mutopti ; `src/legal.html` : mentions légales et confidentialité (identité de l'éditeur dans `data/editeur.json`) ; `src/site.css` : styles communs
- `data/inami-2026.json` : seuils, délais et les codes du tarif opticiens du 01/01/2026 (montant plein et montant à 75 %), avec la source
- `data/mutualites.json` : avantages des mutualités, avec source, date de vérification et fiabilité
- `src/calcul.js` : la logique de calcul, une fonction pure sans dépendance
- `src/page.html` : l'interface
- `tests/calcul.test.js` : 82 tests sur les cas limites de l'article 30 et des mutualités, dont un par point relevé lors d'un audit indépendant
- `fonts/` : polices (licence SIL OFL 1.1), intégrées à la page au build
- `build.js` : assemble une page HTML autonome dans `dist/` (`simulateur.html` et `index.html`)

Les montants sont dans les fichiers de données, pas dans le code : une indexation INAMI se met à jour en changeant un fichier.

## Lancer

```
npm test        # lance les tests (Node 20 ou plus, aucune installation)
npm run build   # génère dist/simulateur.html
```

Les tests et le build tournent aussi sur GitHub Actions à chaque push sur `main` et à chaque pull request.

## Mise en ligne

À chaque push sur `main`, GitHub Actions relance les tests, construit la page et la publie sur GitHub Pages : https://omarhadjmehend.github.io/simulateur-inami/

À activer une seule fois : dans le dépôt GitHub, Settings → Pages → Source : « GitHub Actions ».

## Avant une mise en ligne publique

- Montants INAMI vérifiés le 28/10/2026 (59 montants identiques, dernier tarif publié) sur le [tarif officiel du 01/01/2026](https://www.inami.fgov.be/SiteCollectionDocuments/tarif_opticiens_20260101.pdf) ; surveiller l'index de 2,72 % annoncé
- Avantages des 12 mutualités revérifiés le 28/10/2026 sur leurs pages, brochures ou statuts officiels (CM via recherche web, son site refusant les robots). Règles de cumul tranchées : brochure MC 2026, statuts Mutualia 2026 (art. 47), statuts Solidaris Wallonie 2026 (art. 83), statuts Solidaris Vlaanderen ; Solidaris Brabant et Mutualité libérale déduits de leurs pages
- Non calculé : Solidaris Wallonie plafonne à 100 € l'année des 18 ans ; VNZ accepte une prescription jusqu'à 6 mois après l'achat ; la Mutualité Neutre n'exige pas de prescription pour une monture seule
- Article 30 relu le 28/10/2026 dans sa [coordination officieuse en vigueur depuis le 01/05/2024](https://www.inami.fgov.be/SiteCollectionDocuments/nomenclatureart30_20240501_01.pdf) : seuils, délais, indices et règles enfants confirmés. Avant 18 ans, un changement de 0,5 D sur un œil renouvelle les deux verres (point A.2° 4.2) ; après 18 ans, le simulateur renouvelle seulement l'œil qui a changé (déduit du texte, qui ne prévoit l'exception que pour les enfants)
- Questions encore ouvertes pour l'INAMI (meddev@riziv-inami.fgov.be) : borne exacte des 6 mois, enfant avec un œil à 6 D ou plus, cumul quand l'INAMI ne paie qu'un verre, et paire unifocale de près d'un presbyte qui a déjà une paire de loin remboursée de moins de 5 ans : règle des 3 verres unifocaux (mention de l'ophtalmo exigée, ce qu'applique le simulateur) ou renouvellement ordinaire, la puissance de près étant différente (point A.2.5 a)
- Faire relire l'interface néerlandaise par un locuteur natif

## Avertissement

Estimation indicative, non contractuelle. Le remboursement final est décidé par la mutualité. Outil indépendant, non affilié à l'INAMI, à une mutualité ou à une enseigne.

## Fait avec

Construit avec Claude Code, à partir de mon expérience de conseiller en optique. Les montants ont été comparés au tarif officiel, et le calcul a été relu par un audit indépendant face à l'article 30. Les points que les textes ne tranchent pas sont signalés dans l'outil.
