/* Minimal service worker for Nancy AI offline shell */
// FIX: cache name was hardcoded ('nancy-ai-v1') and the fetch handler was
// cache-FIRST for everything, including index.html. Since the version
// string never changed, the browser had no way to tell a new deploy from
// the old one -- every previous fix to index.html kept getting served
// from this stale cache forever, no matter how many times the file on the
// server changed. Bumping the version below forces this file's bytes to
// differ, which is what makes the browser notice an update is available.
const CACHE = 'nancy-ai-v22';
// Libraries + AI model weights alag, PERSISTENT cache me: app update (CACHE bump) par ye delete nahi hote,
// isliye offline ke liye dobara download nahi karna padta.
const LIBS = 'nancy-libs-v1';
const LIB_HOSTS = ['cdn.jsdelivr.net', 'storage.googleapis.com', 'tessdata.projectnaptha.com', 'cdn.glitch.me'];
const ASSETS = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    // purane versions me jo libs cache the (jsdelivr etc.) unhe LIBS me le aao, phir purane delete
    const libs = await caches.open(LIBS);
    for (const k of keys) {
      if (k === CACHE || k === LIBS || !k.startsWith('nancy-ai-')) continue;
      try {
        const old = await caches.open(k);
        for (const req of await old.keys()) {
          let host = ''; try { host = new URL(req.url).hostname; } catch (_) {}
          if (LIB_HOSTS.includes(host) && !(await libs.match(req))) {
            const res = await old.match(req); if (res) await libs.put(req, res);
          }
        }
      } catch (_) {}
    }
    await Promise.all(keys.filter((k) => k !== CACHE && k !== LIBS).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const isHtmlPage = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHtmlPage) {
    // NETWORK-FIRST for the app shell: online ho to latest index.html, offline ho to cached copy.
    e.respondWith(
      fetch(req)
        .then((fresh) => {
          caches.open(CACHE).then((c) => c.put(req, fresh.clone()));
          return fresh;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Offline AI: TF.js/face-api/MediaPipe/ONNX libs + COCO-SSD / gesture / depth model weights + OCR language data.
  // Cache-first (versioned URLs => safe). Pehli baar online load hone par cache ho jaate hain.
  const url = new URL(req.url);
  if (req.method === 'GET' && LIB_HOSTS.includes(url.hostname) && !req.headers.has('range')) {
    e.respondWith(
      caches.open(LIBS).then((c) =>
        c.match(req).then((cached) => cached || fetch(req).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()).catch(() => {});
          return res;
        }))
      )
    );
    return;
  }

  // Other static assets (icons, manifest): cache-first.
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).catch(() => (req.destination === 'document' ? caches.match('./index.html') : Response.error())))
  );
});
