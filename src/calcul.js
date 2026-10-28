// Simulateur INAMI + mutualité — logique de calcul pure (aucune donnée stockée).
// Règles : article 30 de la nomenclature INAMI (version en vigueur depuis le 01/05/2024)
// et tarif opticiens du 01/01/2026. Les montants viennent des fichiers de données, pas du code.
// Les textes affichés existent en français (fr) et en néerlandais (nl).

const arrondi = (n) => Math.round(n * 100) / 100;
const quart = (n) => Math.round(n * 4) / 4;

export function fmtD(v) {
  return v.toFixed(2).replace('.', ',') + ' D';
}

const TYPE = {
  fr: { unifocal: 'unifocal', bifocal: 'bifocal', progressif: 'progressif' },
  nl: { unifocal: 'enkelvoudig', bifocal: 'bifocaal', progressif: 'multifocaal' },
};

export const MESSAGES = {
  fr: {
    cat1: (A, s) => `Correction de ${fmtD(A)} : au moins ±${fmtD(s)}, remboursé à tout âge`,
    cat2: (age, max) => `Moins de ${age} ans : remboursé de 0,00 à ±${fmtD(max)}`,
    cat3: (age, type, A, min) => `${age} ans ou plus, verre ${TYPE.fr[type]}, correction de ${fmtD(A)} (au moins ±${fmtD(min)})`,
    sousSeuil: (A, s) => `Correction de ${fmtD(A)} : sous le seuil de ±${fmtD(s)} pour un adulte`,
    seniorUnifocal: (age, min) => `À ${age} ans ou plus, le seuil de ±${fmtD(min)} ne vaut que pour un bifocal ou un progressif`,
    sansPrescription: "Pas de prescription d'un ophtalmologue (annexe 15bis) : pas d'intervention INAMI pour les verres",
    prescriptionPerimee: (m) => `Prescription reçue plus de ${m} mois après sa date : elle n'est plus valable`,
    renouvellement: (ecoule, delai) => `Renouvellement trop tôt : ${ecoule} mois depuis la dernière paire remboursée, il en faut ${delai}, sauf changement d'au moins 0,5 D pour cet œil`,
    renouvellementParOeil: "Renouvellement accordé œil par œil (seul l'œil dont la correction a changé est remboursé). Lecture de l'article 30 à confirmer auprès de l'INAMI.",
    autreDistance: "Verre unifocal pour une autre distance de vision : remboursable dans le délai de renouvellement si la prescription le mentionne (3 verres unifocaux maximum par période).",
    reduction: "Réduction de 25 % appliquée : opticien non conventionné et patient non BIM.",
    materiauInconnu: "Matériau ou indice non précisé : le montant est celui du code le moins cher possible.",
    indiceInconnuRisque: "Indice non précisé : dans ce cas, seul un verre à indice élevé est remboursé. Avec un verre à indice bas, l'INAMI ne paie rien pour ce verre.",
    enfantIndice: (oeil, min) => `${oeil} : avant 18 ans, un code à indice élevé sous ${fmtD(min)} n'est accepté que si l'autre œil y a droit. Code standard (indice bas) appliqué.`,
    enfantBifocalHaut: (min) => `Avant 18 ans, un bifocal à indice élevé sous ${fmtD(min)} n'a pas de code INAMI si l'autre œil n'y a pas droit : choisir un verre à indice bas pour être remboursé`,
    mineralEnfant: "Avant 18 ans, l'INAMI ne rembourse que des verres organiques sous ±6,00 D, et les deux verres doivent avoir le même indice. Un verre minéral sur l'œil à ±6,00 D ou plus est à confirmer.",
    pasCodeMineralEnfant: "Pas de code INAMI pour des verres minéraux avant 18 ans : seuls les verres organiques sont remboursés",
    pasCodeIndiceBas65: "Entre ±4,25 et ±5,75 D après 65 ans, l'INAMI ne rembourse que les verres à indice élevé",
    pasCode: "Aucun code INAMI pour cette combinaison de verre",
    inamiSuperieurPrix: "L'intervention INAMI dépasse le prix saisi : le remboursement affiché est limité au prix. Vérifie le prix.",
    dateIncoherente: "Une date est incohérente (prescription ou naissance après la délivrance) : vérifie les dates.",
    aVerifier: (nom, fiab) => `Montant ${nom} : source « ${fiab} », à vérifier sur le site de la mutualité.`,
    doc15bis: "Prescription de l'ophtalmologue (annexe 15bis), reçue moins de 6 mois après sa date",
    doc15: "Attestation de délivrance de l'opticien (annexe 15), signée par le client",
    docMut: (nom) => `Facture ou formulaire optique demandé par ${nom}`,
    mutInconnue: 'Mutualité inconnue',
    choisirMut: 'Choisis la mutualité du client pour ajouter son avantage',
    palier: (min, max) => ` (palier ${fmtD(min)} à ${fmtD(max)})`,
    avecPrescription: " (avec prescription d'ophtalmologue)",
    pasAvantage: "Pas d'avantage optique complémentaire",
    partenaire: (p) => `Avantage payé seulement chez ${p}`,
    prescriptionMut: (m) => `Cette mutualité demande une prescription d'ophtalmologue de moins de ${m} mois`,
    dejaUtilise: (p) => `Avantage déjà utilisé il y a moins de ${p} mois`,
    dejaUtiliseCalendaire: (ans) => (ans === 1 ? 'Avantage déjà utilisé cette année civile' : `Avantage déjà utilisé dans la période de ${ans} années civiles`),
    avantage: (m, p, d) => `${m} € tous les ${p} mois${d}`,
    avantageCalendaire: (m, ans, d) => (ans === 1 ? `${m} € par année civile${d}` : `${m} € par période de ${ans} années civiles${d}`),
    montureMut: (m) => ` + ${m} € pour la monture`,
    sansCumul: "Cette mutualité ne paie que si l'INAMI ne rembourse rien",
    cumulPartiel: "L'INAMI ne rembourse qu'une partie de l'achat (un seul verre ou la monture) : pour cette mutualité, le refus de l'avantage est à confirmer.",
    vnzRepli: "Les 100 € tous les 4 ans ont déjà été utilisés : la formule de 50 € par année civile est appliquée. À confirmer avec la mutualité.",
    mutualiaPremiere: "Mutualia ajoute 50 € une seule fois pour la toute première monture d'un enfant (non calculé ici).",
    siCumul: "Si l'avantage s'ajoute à l'INAMI",
    siPasCumul: "Si l'avantage ne s'ajoute pas",
    cumulInconnu: 'Règle de cumul inconnue pour cette mutualité',
  },
  nl: {
    cat1: (A, s) => `Correctie van ${fmtD(A)}: minstens ±${fmtD(s)}, terugbetaald op elke leeftijd`,
    cat2: (age, max) => `Jonger dan ${age} jaar: terugbetaald van 0,00 tot ±${fmtD(max)}`,
    cat3: (age, type, A, min) => `${age} jaar of ouder, ${TYPE.nl[type]} glas, correctie van ${fmtD(A)} (minstens ±${fmtD(min)})`,
    sousSeuil: (A, s) => `Correctie van ${fmtD(A)}: onder de drempel van ±${fmtD(s)} voor een volwassene`,
    seniorUnifocal: (age, min) => `Vanaf ${age} jaar geldt de drempel van ±${fmtD(min)} alleen voor bifocale of multifocale glazen`,
    sansPrescription: 'Geen voorschrift van een oogarts (bijlage 15bis): geen RIZIV-tegemoetkoming voor de glazen',
    prescriptionPerimee: (m) => `Voorschrift meer dan ${m} maanden na de datum ontvangen: het is niet meer geldig`,
    renouvellement: (ecoule, delai) => `Te vroeg voor hernieuwing: ${ecoule} maanden sinds de laatste terugbetaalde bril, er zijn er ${delai} nodig, behalve bij een wijziging van minstens 0,5 D voor dit oog`,
    renouvellementParOeil: 'Hernieuwing per oog toegekend (alleen het oog waarvan de correctie veranderde, wordt terugbetaald). Lezing van artikel 30 te bevestigen door het RIZIV.',
    autreDistance: 'Enkelvoudig glas voor een andere kijkafstand: terugbetaalbaar binnen de hernieuwingstermijn als het voorschrift het vermeldt (maximaal 3 enkelvoudige glazen per periode).',
    reduction: 'Vermindering van 25 % toegepast: opticien zonder conventie en patiënt zonder verhoogde tegemoetkoming.',
    materiauInconnu: 'Materiaal of index niet ingevuld: het bedrag is dat van de goedkoopst mogelijke code.',
    indiceInconnuRisque: 'Index niet ingevuld: in dit geval wordt alleen een glas met hoge index terugbetaald. Met een glas met lage index betaalt het RIZIV niets voor dit glas.',
    enfantIndice: (oeil, min) => `${oeil}: vóór 18 jaar wordt een code met hoge index onder ${fmtD(min)} alleen aanvaard als het andere oog er recht op heeft. Standaardcode (lage index) toegepast.`,
    enfantBifocalHaut: (min) => `Vóór 18 jaar heeft een bifocaal glas met hoge index onder ${fmtD(min)} geen RIZIV-code als het andere oog er geen recht op heeft: kies een glas met lage index om terugbetaald te worden`,
    mineralEnfant: 'Vóór 18 jaar betaalt het RIZIV onder ±6,00 D alleen organische glazen terug, en beide glazen moeten dezelfde index hebben. Een mineraal glas op het oog vanaf ±6,00 D moet bevestigd worden.',
    pasCodeMineralEnfant: 'Geen RIZIV-code voor minerale glazen vóór 18 jaar: alleen organische glazen worden terugbetaald',
    pasCodeIndiceBas65: 'Tussen ±4,25 en ±5,75 D na 65 jaar betaalt het RIZIV alleen glazen met hoge index terug',
    pasCode: 'Geen RIZIV-code voor deze combinatie van glas',
    inamiSuperieurPrix: 'De RIZIV-tegemoetkoming is hoger dan de ingevulde prijs: de getoonde terugbetaling is beperkt tot de prijs. Controleer de prijs.',
    dateIncoherente: 'Een datum klopt niet (voorschrift of geboorte na de aflevering): controleer de datums.',
    aVerifier: (nom, fiab) => `Bedrag ${nom}: bron « ${fiab} », na te kijken op de website van het ziekenfonds.`,
    doc15bis: 'Voorschrift van de oogarts (bijlage 15bis), ontvangen minder dan 6 maanden na de datum',
    doc15: 'Afleveringsattest van de opticien (bijlage 15), ondertekend door de klant',
    docMut: (nom) => `Factuur of optiekformulier gevraagd door ${nom}`,
    mutInconnue: 'Ziekenfonds onbekend',
    choisirMut: 'Kies het ziekenfonds van de klant om het voordeel toe te voegen',
    palier: (min, max) => ` (schijf ${fmtD(min)} tot ${fmtD(max)})`,
    avecPrescription: ' (met voorschrift van een oogarts)',
    pasAvantage: 'Geen aanvullend optiekvoordeel',
    partenaire: (p) => `Voordeel alleen bij ${p}`,
    prescriptionMut: (m) => `Dit ziekenfonds vraagt een voorschrift van een oogarts van minder dan ${m} maanden`,
    dejaUtilise: (p) => `Voordeel minder dan ${p} maanden geleden al gebruikt`,
    dejaUtiliseCalendaire: (ans) => (ans === 1 ? 'Voordeel dit kalenderjaar al gebruikt' : `Voordeel al gebruikt in de periode van ${ans} kalenderjaren`),
    avantage: (m, p, d) => `${m} € om de ${p} maanden${d}`,
    avantageCalendaire: (m, ans, d) => (ans === 1 ? `${m} € per kalenderjaar${d}` : `${m} € per periode van ${ans} kalenderjaren${d}`),
    montureMut: (m) => ` + ${m} € voor het montuur`,
    sansCumul: 'Dit ziekenfonds betaalt alleen als het RIZIV niets terugbetaalt',
    cumulPartiel: 'Het RIZIV betaalt maar een deel van de aankoop terug (één glas of het montuur): voor dit ziekenfonds moet de weigering van het voordeel bevestigd worden.',
    vnzRepli: 'De 100 € om de 4 jaar is al gebruikt: de formule van 50 € per kalenderjaar wordt toegepast. Te bevestigen bij het ziekenfonds.',
    mutualiaPremiere: 'Mutualia geeft eenmalig 50 € extra voor het allereerste montuur van een kind (hier niet berekend).',
    siCumul: 'Als het voordeel bovenop het RIZIV komt',
    siPasCumul: 'Als het voordeel niet bovenop het RIZIV komt',
    cumulInconnu: 'Cumulregel onbekend voor dit ziekenfonds',
  },
};

// --- Dates : chaînes « AAAA-MM-JJ » lues sans fuseau horaire ---
function lireDate(s) {
  if (s && typeof s === 'object' && 'y' in s) return s;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s ?? ''));
  if (!m) return null;
  return { y: +m[1], m: +m[2], d: +m[3] };
}
const cmp = (a, b) => (a.y - b.y) || (a.m - b.m) || (a.d - b.d);
const joursDansMois = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
function ajouterMois(date, n) {
  const t = date.y * 12 + (date.m - 1) + n;
  const y = Math.floor(t / 12);
  const m = (t % 12) + 1;
  return { y, m, d: Math.min(date.d, joursDansMois(y, m)) };
}

/** Âge en années révolues à une date donnée. */
export function ageA(dateNaissance, date) {
  const n = lireDate(dateNaissance);
  const d = lireDate(date);
  let age = d.y - n.y;
  if (d.m < n.m || (d.m === n.m && d.d < n.d)) age -= 1;
  return age;
}

/** Nombre de mois complets écoulés entre deux dates. */
export function moisEntre(debut, fin) {
  const a = lireDate(debut);
  const b = lireDate(fin);
  let mois = (b.y - a.y) * 12 + (b.m - a.m);
  if (b.d < a.d) mois -= 1;
  return mois;
}

/** Vrai si `date` tombe au plus tard N mois après `debut` (même jour inclus). */
export function dansLesMois(debut, date, n) {
  return cmp(lireDate(date), ajouterMois(lireDate(debut), n)) <= 0;
}

/** Amétropie maximale : méridien le plus fort, vision de loin. */
export function ametropieMax(sph, cyl = 0) {
  return Math.max(Math.abs(sph), Math.abs(sph + cyl));
}

/** Nettoie une correction : nombres finis, arrondis au quart de dioptrie. null si l'œil est vide. */
function lireOeil(o) {
  if (!o) return null;
  const s = Number(o.sph);
  const c = Number(o.cyl);
  const sOk = o.sph !== null && o.sph !== '' && o.sph !== undefined && Number.isFinite(s);
  const cOk = o.cyl !== null && o.cyl !== '' && o.cyl !== undefined && Number.isFinite(c);
  if (!sOk && !cOk) return null;
  return { sph: sOk ? quart(s) : 0, cyl: cOk ? quart(c) : 0 };
}

/**
 * Catégorie INAMI d'un verre (article 30) :
 * 1 = tous âges dès ±6,00 D ; 2 = moins de 18 ans de 0,00 à ±5,75 D ;
 * 3 = 65 ans et plus, bifocal/progressif, de ±4,25 à ±5,75 D ; null = pas d'intervention.
 */
export function categorieVerre({ sph, cyl = 0 }, age, typeVerre, inami, lang = 'fr') {
  const T = MESSAGES[lang];
  const s = inami.seuils;
  const A = ametropieMax(sph, cyl);
  if (A >= s.tous_ages) return { categorie: 1, A, raison: T.cat1(A, s.tous_ages) };
  if (age < s.age_enfant_max) return { categorie: 2, A, raison: T.cat2(s.age_enfant_max, s.enfant_max) };
  if (age >= s.age_senior_min && typeVerre !== 'unifocal' && A >= s.senior_min) {
    return { categorie: 3, A, raison: T.cat3(s.age_senior_min, typeVerre, A, s.senior_min) };
  }
  let raison = T.sousSeuil(A, s.tous_ages);
  if (age >= s.age_senior_min && typeVerre === 'unifocal' && A >= s.senior_min) {
    raison = T.seniorUnifocal(s.age_senior_min, s.senior_min);
  }
  return { categorie: null, A, raison };
}

/** Indice « haut » ou « bas » au sens de l'article 30, ou null si on ne peut pas trancher. */
export function classeIndice(materiau, indice, categorie, typeVerre, inami) {
  if (indice == null || !Number.isFinite(Number(indice))) return null;
  const e = inami.indice_eleve;
  if (!materiau) {
    if (indice >= Math.max(e.organique, e.mineral)) return 'haut';
    if (indice < Math.min(e.organique, e.mineral_bifocal_65)) return 'bas';
    return null;
  }
  let seuil = materiau === 'mineral' ? e.mineral : e.organique;
  if (materiau === 'mineral' && categorie === 3 && typeVerre === 'bifocal') seuil = e.mineral_bifocal_65;
  return indice >= seuil ? 'haut' : 'bas';
}

/**
 * Code INAMI le moins cher compatible avec la catégorie, le type, le matériau, l'indice,
 * le cylindre et (pour les codes enfants à indice élevé) la puissance du verre.
 */
export function choisirCode(inami, categorie, typeVerre, materiau, classe, cyl, A = 0) {
  const c = Math.min(Math.abs(cyl), inami.supplement_cylindre.seuil);
  const candidats = inami.codes.filter((k) => {
    if (k.categorie !== categorie || k.type !== typeVerre) return false;
    if (materiau && k.materiau !== materiau) return false;
    if (classe) {
      const strict = categorie === 2 && classe === 'haut';
      if (!(k.indice === classe || (k.indice === 'tous' && !strict))) return false;
    }
    if (k.puissance && (A < k.puissance[0] || A > k.puissance[1])) return false;
    const [lo, hi] = k.cyl;
    return c === 0 ? hi === 0 : lo > 0 && c >= lo && c <= hi;
  });
  if (!candidats.length) return null;
  return candidats.reduce((a, b) => (b.honoraire < a.honoraire ? b : a));
}

function raisonSansCode(categorie, typeVerre, materiau, classe, T, inami) {
  if (categorie === 2 && materiau === 'mineral') return T.pasCodeMineralEnfant;
  if (categorie === 2 && typeVerre === 'bifocal' && classe === 'haut') return T.enfantBifocalHaut(inami.enfant_indice_eleve_min_dioptrie);
  if (categorie === 3 && classe === 'bas') return T.pasCodeIndiceBas65;
  return T.pasCode;
}

/**
 * Calcul complet. Entrée :
 * { dateNaissance, dateDelivrance, dateReceptionPrescription?, typeVerre, materiau ('organique'|'mineral'|null),
 *   indice (nombre|null), yeux: { od: {sph,cyl}|null, og: {sph,cyl}|null },
 *   prescriptionOphtalmo, datePrescription, derniereDelivrance,
 *   changement05 (booléen pour les deux yeux, ou { od, og }), autreDistance,
 *   conventionne, bim, avecMonture, montureInterventions, mutualiteId, dernierAvantage,
 *   achatPartenaire, prixVerres, prixMonture }
 * lang : 'fr' ou 'nl' (langue des textes renvoyés).
 */
export function simuler(entree, inami, mutualites, lang = 'fr') {
  const T = MESSAGES[lang] || MESSAGES.fr;
  const avertissements = [];
  const age = ageA(entree.dateNaissance, entree.dateDelivrance);
  const enfant = age < inami.seuils.age_enfant_max;
  const delivrance = entree.dateDelivrance;
  const reception = entree.dateReceptionPrescription || delivrance;

  if (cmp(lireDate(entree.dateNaissance), lireDate(delivrance)) > 0 ||
      (entree.datePrescription && cmp(lireDate(entree.datePrescription), lireDate(reception)) > 0)) {
    avertissements.push(T.dateIncoherente);
  }

  // 1. Conditions générales du droit INAMI pour les verres
  const motifsSansInami = [];
  if (!entree.prescriptionOphtalmo) {
    motifsSansInami.push(T.sansPrescription);
  } else if (entree.datePrescription && !dansLesMois(entree.datePrescription, reception, inami.prescription_validite_mois)) {
    motifsSansInami.push(T.prescriptionPerimee(inami.prescription_validite_mois));
  }

  // Renouvellement : délai selon l'âge au moment du renouvellement, puis œil par œil
  const changement = typeof entree.changement05 === 'object' && entree.changement05 !== null
    ? { od: !!entree.changement05.od, og: !!entree.changement05.og }
    : { od: !!entree.changement05, og: !!entree.changement05 };
  // Avant 18 ans, les deux verres gardent les mêmes caractéristiques : si un œil a changé d'au moins 0,5 D,
  // le renouvellement vaut pour les deux yeux (article 30, A. 2° groupe cible, point 4.2)
  if (enfant && (changement.od || changement.og)) changement.od = changement.og = true;
  let renouvellementBloque = null;
  if (entree.derniereDelivrance) {
    const delai = enfant ? inami.renouvellement.mois_enfant : inami.renouvellement.mois_adulte;
    const ecoule = moisEntre(entree.derniereDelivrance, delivrance);
    if (ecoule < delai) renouvellementBloque = T.renouvellement(ecoule, delai);
  }
  const autreDistance = !!entree.autreDistance && entree.typeVerre === 'unifocal';

  // 2. Verres, œil par œil : catégorie puis code INAMI selon matériau, indice, cylindre et puissance
  const reduire = entree.conventionne === false && !(inami.reduction_non_conventionne.exception_bim && entree.bim);
  const yeuxIn = { od: lireOeil(entree.yeux?.od), og: lireOeil(entree.yeux?.og) };
  const cats = {};
  let AMax = 0;
  for (const cote of ['od', 'og']) {
    if (!yeuxIn[cote]) continue;
    cats[cote] = categorieVerre(yeuxIn[cote], age, entree.typeVerre, inami, lang);
    AMax = Math.max(AMax, cats[cote].A);
  }
  const indiceConnu = !!entree.materiau && entree.indice != null;
  if (!indiceConnu) {
    avertissements.push(T.materiauInconnu);
    const risque = Object.values(cats).some((c) => c.categorie === 3 || (c.categorie === 2 && entree.typeVerre === 'bifocal'));
    if (risque && classeIndice(entree.materiau, entree.indice, 3, entree.typeVerre, inami) !== 'haut') {
      avertissements.push(T.indiceInconnuRisque);
    }
  }
  if (enfant && entree.materiau === 'mineral' && Object.values(cats).some((c) => c.categorie === 1)) {
    avertissements.push(T.mineralEnfant);
  }

  const yeux = {};
  let totalVerres = 0;
  let totalSupplements = 0;
  let reduction = 0;
  let renouvelleParOeil = false;
  for (const cote of Object.keys(cats)) {
    const oeil = yeuxIn[cote];
    const cat = cats[cote];
    const res = { ...cat, eligible: false, montant: 0, supplement: 0, net: 0, code: null, codeSupplement: null };
    let motif = motifsSansInami[0] || null;
    if (!motif && renouvellementBloque && !changement[cote] && !autreDistance) motif = renouvellementBloque;
    if (cat.categorie && !motif) {
      let classe = classeIndice(entree.materiau, entree.indice, cat.categorie, entree.typeVerre, inami);
      let bifocalSansCode = false;
      if (cat.categorie === 2 && classe === 'haut') {
        const autre = cats[cote === 'od' ? 'og' : 'od'];
        const min = inami.enfant_indice_eleve_min_dioptrie;
        const ok = cat.A >= min || (autre && (autre.A >= min || autre.categorie === 1));
        if (!ok) {
          if (entree.typeVerre === 'bifocal') bifocalSansCode = true;
          else { classe = 'bas'; avertissements.push(T.enfantIndice(cote.toUpperCase(), min)); }
        }
      }
      const code = bifocalSansCode ? null
        : choisirCode(inami, cat.categorie, entree.typeVerre, entree.materiau, classe, oeil.cyl, cat.A);
      if (code) {
        res.eligible = true;
        res.code = code.code;
        res.montant = code.honoraire;
        res.net = reduire ? code.reduit : code.honoraire;
        if (Math.abs(oeil.cyl) > inami.supplement_cylindre.seuil) {
          const sup = inami.supplement_cylindre.par_categorie[String(cat.categorie)];
          res.supplement = sup.honoraire;
          res.codeSupplement = sup.code;
          res.net += reduire ? sup.reduit : sup.honoraire;
        }
        res.net = arrondi(res.net);
        reduction += res.montant + res.supplement - res.net;
        if (renouvellementBloque && changement[cote] && !autreDistance) renouvelleParOeil = true;
      } else {
        res.raison = raisonSansCode(cat.categorie, entree.typeVerre, entree.materiau, bifocalSansCode ? 'haut' : classe, T, inami);
      }
    } else if (cat.categorie) {
      res.raison = motif;
    }
    totalVerres += res.montant;
    totalSupplements += res.supplement;
    yeux[cote] = res;
  }
  if (renouvelleParOeil && Object.values(yeux).some((y) => !y.eligible && y.categorie)) avertissements.push(T.renouvellementParOeil);
  if (autreDistance && renouvellementBloque && totalVerres > 0) avertissements.push(T.autreDistance);

  // 3. Monture : seulement avant 18 ans, deux interventions au maximum,
  //    la première seulement avec au moins un verre remboursé ; pas besoin de prescription
  let monture = 0;
  const m = inami.monture_enfant;
  const dejaMontures = entree.montureInterventions || 0;
  const premiereOk = !(m.premiere_avec_verre && dejaMontures === 0 && totalVerres === 0);
  if (enfant && entree.avecMonture !== false && premiereOk && dejaMontures < m.max_interventions) {
    monture = m.honoraire;
    if (reduire) reduction += m.honoraire - m.reduit;
  }

  // 4. Opticien non conventionné et patient non BIM : colonne à 75 % du tarif
  const brut = totalVerres + totalSupplements + monture;
  reduction = arrondi(reduction);
  if (reduction > 0) avertissements.push(T.reduction);
  const totalInami = arrondi(brut - reduction);

  // 5. Mutualité
  const mut = mutualites.find((x) => x.id === entree.mutualiteId) || null;
  const inamiPartiel = totalInami > 0 && (totalVerres === 0 || Object.values(yeux).some((y) => !y.eligible));
  const mutualite = calculMutualite(mut, { age, AMax, totalInami, inamiPartiel, entree, T, avertissements });
  if (mut && !/^(officiel|fiable)/.test(mut.fiabilite)) {
    avertissements.push(T.aVerifier(mut.nom, mut.fiabilite));
  }

  // 6. Reste à charge (le remboursement total ne dépasse jamais le prix saisi)
  const prix = (Number(entree.prixVerres) || 0) + (Number(entree.prixMonture) || 0);
  if (prix > 0 && totalInami > prix) avertissements.push(T.inamiSuperieurPrix);
  const scenarios = mutualite.scenarios.map((s) => {
    const montantMut = prix > 0 ? Math.min(s.montant, Math.max(0, prix - totalInami)) : s.montant;
    const total = prix > 0 ? Math.min(prix, totalInami + montantMut) : totalInami + montantMut;
    return {
      ...s,
      montant: arrondi(montantMut),
      totalRembourse: arrondi(total),
      reste: prix > 0 ? arrondi(Math.max(0, prix - total)) : null,
    };
  });

  const documents = [];
  if (totalVerres > 0) documents.push(T.doc15bis);
  if (totalInami > 0) documents.push(T.doc15);
  if (mut && scenarios.some((s) => s.montant > 0)) documents.push(T.docMut(mut.nom));

  return {
    age,
    motifsSansInami,
    yeux,
    inami: {
      verres: arrondi(totalVerres),
      supplements: arrondi(totalSupplements),
      monture,
      reduction,
      total: totalInami,
    },
    mutualite: { nom: mut?.nom ?? null, fiabilite: mut?.fiabilite ?? null, source: mut?.source_url ?? null, scenarios },
    prix: prix > 0 ? prix : null,
    avertissements,
    documents,
  };
}

/** Vrai si un avantage reçu le `dernier` bloque encore un nouvel avantage à la date `date`. */
function periodeBloquee(dernier, date, periodeMois, type) {
  if (!dernier || !periodeMois) return false;
  if (type === 'calendaire') {
    const ans = Math.max(1, Math.round(periodeMois / 12));
    return lireDate(date).y - lireDate(dernier).y < ans;
  }
  return moisEntre(dernier, date) < periodeMois;
}

function calculMutualite(mut, { age, AMax, totalInami, inamiPartiel, entree, T, avertissements }) {
  if (!mut) return { scenarios: [{ label: T.mutInconnue, montant: 0, raison: T.choisirMut }] };

  const enfantMut = age < (mut.age_adulte || 18);
  const delivrance = entree.dateDelivrance;
  const prescriptionValide = (mois) =>
    !!entree.prescriptionOphtalmo && (!entree.datePrescription || dansLesMois(entree.datePrescription, delivrance, mois));

  let montant = enfantMut ? mut.montant_enfant : mut.montant_adulte;
  let periode = enfantMut && mut.periode_mois_enfant ? mut.periode_mois_enfant : mut.periode_mois;
  let type = mut.periode_type || 'glissant';
  let detail = '';

  const p = mut.palier;
  if (!enfantMut && p && AMax >= p.min && AMax <= p.max && (p.age_min == null || age >= p.age_min) && (p.age_max == null || age <= p.age_max)) {
    montant = p.montant_adulte;
    detail = T.palier(p.min, p.max);
  }

  const ap = mut.avec_prescription;
  if (ap && prescriptionValide(mut.prescription_validite_mois || 6)) {
    if (periodeBloquee(entree.dernierAvantage, delivrance, ap.periode_mois, ap.periode_type)) {
      avertissements.push(T.vnzRepli);
    } else {
      montant = ap.montant;
      periode = ap.periode_mois;
      type = ap.periode_type || 'glissant';
      detail = T.avecPrescription;
    }
  }

  // Avantage monture enfant propre à la mutualité (Mutualia)
  let montantMonture = 0;
  if (mut.monture_enfant && enfantMut && entree.avecMonture !== false) {
    montantMonture = mut.monture_enfant.montant;
    avertissements.push(T.mutualiaPremiere);
  }

  if (montant === 0) return { scenarios: [{ label: mut.nom, montant: 0, raison: T.pasAvantage }] };
  if (mut.partenaire_requis && !entree.achatPartenaire) {
    return { scenarios: [{ label: mut.nom, montant: 0, raison: T.partenaire(mut.partenaire_requis) }] };
  }
  if (mut.prescription_requise && !prescriptionValide(mut.prescription_validite_mois || 6)) {
    return { scenarios: [{ label: mut.nom, montant: 0, raison: T.prescriptionMut(mut.prescription_validite_mois || 6) }] };
  }
  if (periodeBloquee(entree.dernierAvantage, delivrance, periode, type)) {
    const ans = Math.max(1, Math.round(periode / 12));
    return { scenarios: [{ label: mut.nom, montant: 0, raison: type === 'calendaire' ? T.dejaUtiliseCalendaire(ans) : T.dejaUtilise(periode) }] };
  }

  const total = montant + montantMonture;
  const libelle = (type === 'calendaire'
    ? T.avantageCalendaire(montant, Math.max(1, Math.round(periode / 12)), detail)
    : T.avantage(montant, periode, detail)) + (montantMonture ? T.montureMut(montantMonture) : '');
  if (mut.cumul_inami === true || totalInami === 0) {
    return { scenarios: [{ label: mut.nom, montant: total, raison: libelle }] };
  }
  if (mut.cumul_inami === false) {
    if (inamiPartiel) avertissements.push(T.cumulPartiel);
    return { scenarios: [{ label: mut.nom, montant: 0, raison: T.sansCumul }] };
  }
  return {
    scenarios: [
      { label: T.siCumul, montant: total, raison: libelle },
      { label: T.siPasCumul, montant: 0, raison: T.cumulInconnu },
    ],
  };
}
