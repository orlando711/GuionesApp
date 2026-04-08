// ⚡ VERSIÓN — cambiá este número cada vez que actualizás la app
const VERSION = '2.0.0';
const CACHE = 'guiones-v' + VERSION;
const ASSETS = ['./index.html', './manifest.json'];

// Instalar — cachear archivos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting()) // activa inmediatamente sin esperar
  );
});

// Activar — borrar cachés viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim()) // toma control de todas las pestañas abiertas
  );
});

// Fetch — red primero, caché como fallback
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Si la respuesta es válida, actualizá el caché
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Mensaje desde la app para forzar actualización
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
