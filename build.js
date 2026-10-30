// Assemble une page HTML autonome (polices + données + calcul + interface) dans dist/
// dist/simulateur.html pour un usage local, dist/index.html pour la mise en ligne.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const lire = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

// Polices intégrées à la page : aucun appel à un serveur externe (RGPD), fonctionne hors ligne
const POLICES = [
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

// Application installable : manifeste, icônes et mode hors ligne. La version change à chaque
// modification de la page, ce qui remplace la copie gardée sur les appareils.
const version = createHash('sha256').update(page).digest('hex').slice(0, 12);
writeFileSync(new URL('./dist/sw.js', import.meta.url), lire('./src/sw.js').replace('/*VERSION*/', version));
copyFileSync(new URL('./src/manifest.webmanifest', import.meta.url), new URL('./dist/manifest.webmanifest', import.meta.url));
for (const t of [180, 192, 512]) {
  copyFileSync(new URL(`./icones/icone-${t}.png`, import.meta.url), new URL(`./dist/icone-${t}.png`, import.meta.url));
}
console.log(`dist/simulateur.html et dist/index.html écrits, application installable (version ${version}) (${Math.round(page.length / 1024)} Ko)`);
