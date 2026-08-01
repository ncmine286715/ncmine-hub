// Copia src/data/addons.json -> public/addons.json (catálogo servido como
// arquivo estático, atualizável sem redeploy) e regenera public/sitemap.xml
// com as rotas reais do site + uma URL por addon.
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";

const SITE_URL = "https://mineaddonsnews.online";

await mkdir("public", { recursive: true });
await copyFile("src/data/addons.json", "public/addons.json");

const raw = JSON.parse(await readFile("src/data/addons.json", "utf8"));

const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
const MIN_EDITORIAL_WORDS = 40;

// Deduplica por id e mantém no sitemap só o que tem texto editorial próprio
// (o resto vai com noindex na página, então não pode entrar aqui).
const seen = new Set();
const addons = raw.filter((a) => {
  if (!a?.id || seen.has(a.id)) return false;
  seen.add(a.id);
  const description = norm(a.description);
  return (
    description &&
    description !== norm(a.short) &&
    description.split(" ").length >= MIN_EDITORIAL_WORDS
  );
});

const staticRoutes = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/sobre", changefreq: "monthly", priority: "0.6" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/contato", changefreq: "yearly", priority: "0.4" },
  { path: "/privacidade", changefreq: "yearly", priority: "0.3" },
  { path: "/termos", changefreq: "yearly", priority: "0.3" },
  { path: "/cookies", changefreq: "yearly", priority: "0.3" },
  { path: "/dmca", changefreq: "yearly", priority: "0.3" },
  { path: "/legal", changefreq: "yearly", priority: "0.3" },
];

const urls = [
  ...staticRoutes,
  ...addons.map((a) => ({ path: `/addon/${a.id}`, changefreq: "weekly", priority: "0.7", image: a.image, title: a.title })),
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ...urls.map((u) =>
    [
      "  <url>",
      `    <loc>${SITE_URL}${u.path}</loc>`,
      `    <changefreq>${u.changefreq}</changefreq>`,
      `    <priority>${u.priority}</priority>`,
      u.image
        ? `    <image:image><image:loc>${String(u.image).replace(/&/g, "&amp;")}</image:loc><image:title>${String(u.title).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</image:title></image:image>`
        : null,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n"),
  ),
  "</urlset>",
].join("\n");

await writeFile("public/sitemap.xml", xml);
console.log(
  `[sync-addons] public/addons.json e sitemap.xml atualizados (${urls.length} URLs indexáveis de ${raw.length} addons)`,
);
