// Cache-first para thumbnails de addons — sem workbox, sem dependência externa.
// Só intercepta os hosts de imagem conhecidos; tudo mais passa direto pra rede.
const CACHE_NAME = "ncmine-thumbs-v2";
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
      if (cached) return cached;
      try {
        // no-cors: replica o que um <img src> faz nativamente. A maioria
        // desses hosts (bedrockexplorer, forgecdn, linktr.ee) não manda
        // header CORS — pedir "cors" aqui faz o fetch rejeitar e a imagem
        // nunca aparece, mesmo a URL sendo válida.
        const response = await fetch(request, { mode: "no-cors", credentials: "omit" });
        if (response.ok || response.type === "opaque") {
          cache.put(request, response.clone());
        }
        return response;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    }),
  );
});
