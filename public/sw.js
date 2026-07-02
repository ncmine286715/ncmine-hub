// Cache-first para thumbnails de addons — sem workbox, sem dependência externa.
// Só intercepta os hosts de imagem conhecidos; tudo mais passa direto pra rede.
const CACHE_NAME = "ncmine-thumbs-v1";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const IMAGE_HOSTS = [
  "ugc.production.linktr.ee",
  "images.bedrockexplorer.com",
  "i.imgur.com",
  "media.forgecdn.net",
  "xforgeassets001.xboxlive.com",
  "xforgeassets002.xboxlive.com",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (!IMAGE_HOSTS.includes(url.host)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) {
        const cachedAt = Number(cached.headers.get("x-ncmine-cached-at") || 0);
        if (Date.now() - cachedAt < MAX_AGE_MS) return cached;
      }
      try {
        const response = await fetch(request, { mode: "cors", credentials: "omit" });
        if (response.ok) {
          const headers = new Headers(response.headers);
          headers.set("x-ncmine-cached-at", String(Date.now()));
          const body = await response.clone().arrayBuffer();
          const stamped = new Response(body, { status: response.status, statusText: response.statusText, headers });
          cache.put(request, stamped);
        }
        return response;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    }),
  );
});
