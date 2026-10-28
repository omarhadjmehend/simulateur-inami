// Assemble une page HTML autonome (données + calcul + interface) dans dist/simulateur.html
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const lire = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const calcul = lire('./src/calcul.js').replace(/^export /gm, '');
const page = lire('./src/page.html')
  .replace('/*INAMI_JSON*/', () => lire('./data/inami-2026.json').trim())
  .replace('/*MUTUALITES_JSON*/', () => lire('./data/mutualites.json').trim())
  .replace('/*CALCUL_JS*/', () => calcul);

mkdirSync(new URL('./dist/', import.meta.url), { recursive: true });
writeFileSync(new URL('./dist/simulateur.html', import.meta.url), page);
console.log('dist/simulateur.html écrit');
