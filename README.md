# Simulateur INAMI optique

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
- Deux scénarios quand la règle de cumul d'une mutualité est inconnue
- Reste à payer (jamais plus que le prix saisi), documents à remettre, niveau de fiabilité de chaque source
- Interface et explications en français et en néerlandais
- Fiche imprimable pour le client : récapitulatif de la saisie, reste à payer, détail et documents à remettre

Hors v1 : lentilles de contact, verres lenticulaires, filtres médicaux, prismes, basse vision.

## Structure

- `data/inami-2026.json` : seuils, délais et les codes du tarif opticiens du 01/01/2026 (montant plein et montant à 75 %), avec la source
- `data/mutualites.json` : avantages des mutualités, avec source, date de vérification et fiabilité
- `src/calcul.js` : la logique de calcul, une fonction pure sans dépendance
- `src/page.html` : l'interface
- `tests/calcul.test.js` : 75 tests sur les cas limites de l'article 30 et des mutualités, dont un par point relevé lors d'un audit indépendant
- `build.js` : assemble une page HTML autonome dans `dist/`

Les montants sont dans les fichiers de données, pas dans le code : une indexation INAMI se met à jour en changeant un fichier.

## Lancer

```
npm test        # lance les tests (Node 20 ou plus, aucune installation)
npm run build   # génère dist/simulateur.html
```

Les tests et le build tournent aussi sur GitHub Actions à chaque push sur `main` et à chaque pull request.

## Avant une mise en ligne publique

- Montants INAMI vérifiés le 27/10/2026 sur le [tarif officiel du 01/01/2026](https://www.inami.fgov.be/SiteCollectionDocuments/tarif_opticiens_20260101.pdf) ; surveiller l'index de 2,72 % annoncé
- Règle de cumul avec l'INAMI encore inconnue pour Solidaris, Mutualia et la Mutualité libérale (le simulateur affiche deux scénarios)
- Questions ouvertes envoyées à l'INAMI et aux mutualités : renouvellement par œil, borne exacte des 6 mois, enfant avec un œil à 6 D ou plus, cumul quand l'INAMI ne paie qu'un verre
- Faire relire l'interface néerlandaise par un locuteur natif

## Avertissement

Estimation indicative, non contractuelle. Le remboursement final est décidé par la mutualité. Outil indépendant, non affilié à l'INAMI, à une mutualité ou à une enseigne.

## Fait avec

Construit avec Claude Code, à partir de mon expérience de conseiller en optique. Les montants ont été comparés au tarif officiel, et le calcul a été relu par un audit indépendant face à l'article 30. Les points que les textes ne tranchent pas sont signalés dans l'outil.
