// ═══════════════════════════════════════════════════════════════════════
//  SERVICE WORKER
//
//  Why this exists: she should be able to open the app with no signal —
//  in a school car park, in a waiting room — and still see where she is.
//
//  VERSION is stamped by the deploy workflow from a single source of
//  truth. Nothing in here is ever edited by hand; bumping a cache used to
//  mean editing several files in lockstep and that is exactly how stale
//  files reach a phone.
// ═══════════════════════════════════════════════════════════════════════

const VERSION = '__VERSION__';
const SHELL = `ada-road-${VERSION}`;

const FILES = [
  './',
  './index.html',
  './css/app.css',
  './css/fonts.css',
  './fonts/fraunces.woff2',
  './js/app.js',
  './js/data.js',
  './js/ottis.js',
  './js/store.js',
  './js/cloud.js',
  './js/config.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    // One at a time, so a single 404 can't fail the whole install.
    await Promise.all(FILES.map(f => c.add(f).catch(() => {})));
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('ada-road-') && k !== SHELL)
                          .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// The Update button in the app sends this.
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Never touch Firebase or the version check — those must always be live.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('version.json')) return;
  if (e.request.method !== 'GET') return;

  // Pages: network first, so a new build is picked up as soon as there's
  // signal; fall back to the cached copy when there isn't.
  if (e.request.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(e.request);
        const c = await caches.open(SHELL);
        c.put('./index.html', fresh.clone());
        return fresh;
      } catch (err) {
        return (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  // Everything else: cached copy first — the URLs carry a version, so a
  // new build asks for new URLs anyway.
  e.respondWith((async () => {
    const hit = await caches.match(e.request, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const fresh = await fetch(e.request);
      if (fresh.ok) (await caches.open(SHELL)).put(e.request, fresh.clone());
      return fresh;
    } catch (err) {
      return Response.error();
    }
  })());
});
