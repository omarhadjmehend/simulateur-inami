// Mode hors ligne : la page est gardée sur l'appareil.
// En ligne, la version du site est toujours prise en premier (tarifs à jour) ; hors ligne, la copie gardée.
const VERSION = '/*VERSION*/';
const CACHE = 'simulateur-inami-' + VERSION;
const FICHIERS = ['./', './index.html', './simulateur.html', './legal.html', './manifest.webmanifest', './icone-180.png', './icone-192.png', './icone-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((rep) => {
        const copie = rep.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copie));
        return rep;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});
