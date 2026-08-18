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
  './js/roadmap.js',
  './js/onboard.js',
  './js/store.js',
  './js/cloud.js',
  './js/config.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  // Take over straight away. Waiting meant the OLD worker kept serving its
  // cache, and its cache held the previous version of every module.
  self.skipWaiting();
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

  // Our own JavaScript: network first, always.
  //
  // index.html carries ?v= on the files it names, but an ES module import
  // inside app.js (import "./data.js") carries nothing. Those requests
  // matched the cache exactly and were answered with the previous build —
  // so a new app.js ran against an old data.js and the app showed 21 steps
  // when it shipped 32. Cache-busting in the HTML cannot reach them; only
  // going to the network can.
  if (url.pathname.endsWith('.js')) {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(e.request);
        if (fresh.ok) (await caches.open(SHELL)).put(e.request, fresh.clone());
        return fresh;
      } catch (err) {
        return (await caches.match(e.request))
            || (await caches.match(e.request, { ignoreSearch: true }))
            || Response.error();
      }
    })());
    return;
  }

  // Everything else.
  //
  // The match must include the query string. Matching with ignoreSearch
  // meant app.js?v=1.0.3 was answered with the copy cached for v=1.0.2 —
  // which defeats the entire point of putting a version in the URL, and
  // shipped a build where the new code never actually reached the phone.
  //
  // So: exact match first, then network (and cache what comes back), and
  // only if the network is gone do we fall back to any version we have.
  e.respondWith((async () => {
    const exact = await caches.match(e.request);
    if (exact) return exact;
    try {
      const fresh = await fetch(e.request);
      if (fresh.ok) (await caches.open(SHELL)).put(e.request, fresh.clone());
      return fresh;
    } catch (err) {
      const stale = await caches.match(e.request, { ignoreSearch: true });
      return stale || Response.error();
    }
  })());
});
