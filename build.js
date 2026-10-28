// Assemble une page HTML autonome (polices + données + calcul + interface) dans dist/
// dist/simulateur.html pour un usage local, dist/index.html pour la mise en ligne.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const lire = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

// Polices intégrées à la page : aucun appel à un serveur externe (RGPD), fonctionne hors ligne
const POLICES = [
  ['Atkinson Hyperlegible', 400, 'atkinson-400'],
  ['Atkinson Hyperlegible', 700, 'atkinson-700'],
  ['Barlow Semi Condensed', 600, 'barlow-sc-600'],
  ['Barlow Semi Condensed', 700, 'barlow-sc-700'],
];
const polices = POLICES.map(([famille, graisse, fichier]) => {
  const b64 = readFileSync(new URL(`./fonts/${fichier}.woff2`, import.meta.url)).toString('base64');
  return `@font-face { font-family: '${famille}'; font-style: normal; font-weight: ${graisse}; font-display: swap; src: url(data:font/woff2;base64,${b64}) format('woff2'); }`;
}).join('\n');

const calcul = lire('./src/calcul.js').replace(/^export /gm, '');
const page = lire('./src/page.html')
  .replace('/*FONTS_CSS*/', () => polices)
  .replace('/*INAMI_JSON*/', () => lire('./data/inami-2026.json').trim())
  .replace('/*MUTUALITES_JSON*/', () => lire('./data/mutualites.json').trim())
  .replace('/*CALCUL_JS*/', () => calcul);

mkdirSync(new URL('./dist/', import.meta.url), { recursive: true });
writeFileSync(new URL('./dist/simulateur.html', import.meta.url), page);
writeFileSync(new URL('./dist/index.html', import.meta.url), page);
console.log(`dist/simulateur.html et dist/index.html écrits (${Math.round(page.length / 1024)} Ko)`);
