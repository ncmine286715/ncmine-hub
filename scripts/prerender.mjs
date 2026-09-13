#!/usr/bin/env node
// Gera HTML estático para cada rota depois do `vite build`.
//
// Por quê: nenhuma rota lê cookies/searchParams durante o SSR (Firebase/auth
// só rodam client-side), então o HTML de uma URL é idêntico pra todo mundo.
// Sem isso, toda pageview reexecuta SSR completo no Worker do Cloudflare —
// e no plano free isso estoura CPU-time/requests (erro 1102) rapidinho.
//
// O prerender embutido do TanStack Start (`tanstackStart.prerender`) não
// funciona com o preset `cloudflare-module` do nitro: o preview server que
// ele sobe roda em Node puro, mas o worker gerado pelo nitro faz
// `augmentReq` mutando propriedades do Request nativo — isso só é permitido
// dentro do runtime real do Cloudflare (workerd), não em Node. `vite preview`
// tem o mesmo problema. Por isso este script sobe `wrangler dev` (que roda
// workerd de verdade via Miniflare) e faz o crawl por HTTP puro.
//
// Os arquivos .html gerados caem em .output/public, então o Cloudflare serve
// como asset estático — o Worker nem chega a ser invocado pra essas rotas
// (CPU zero). O Worker continua de pé como fallback pra qualquer rota que
// não tenha sido pré-renderada (ex: addon novo antes do próximo deploy).

import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SERVER_DIR = join(ROOT, ".output", "server");
const PUBLIC_DIR = join(ROOT, ".output", "public");
const WRANGLER_CONFIG = join(SERVER_DIR, "wrangler.json");
const CONCURRENCY = 12;
const READY_TIMEOUT_MS = 30_000;

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

function loadRoutes() {
  const addons = JSON.parse(readFileSync(join(ROOT, "src", "data", "addons.json"), "utf8"));
  const staticRoutes = ["/", "/sobre", "/faq", "/contato", "/privacidade", "/termos", "/cookies", "/dmca", "/legal"];
  const addonRoutes = addons.map((a) => `/addon/${a.id}`);
  return [...new Set([...staticRoutes, ...addonRoutes])];
}

async function waitUntilReady(baseUrl, deadline) {
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${baseUrl}/robots.txt`);
      if (res.ok) return;
    } catch {
      // ainda subindo
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`wrangler dev não ficou pronto em ${READY_TIMEOUT_MS}ms`);
}

function routeToFilePath(route) {
  if (route === "/") return join(PUBLIC_DIR, "index.html");
  return join(PUBLIC_DIR, `${route}.html`);
}

async function crawlRoute(baseUrl, route) {
  const res = await fetch(`${baseUrl}${route}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const filePath = routeToFilePath(route);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html);
}

async function runPool(items, limit, worker) {
  let ok = 0;
  const failed = [];
  let cursor = 0;
  async function next() {
    while (cursor < items.length) {
      const item = items[cursor++];
      try {
        await worker(item);
        ok++;
      } catch (err) {
        failed.push({ item, error: err instanceof Error ? err.message : String(err) });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
  return { ok, failed };
}

async function main() {
  if (!existsSync(WRANGLER_CONFIG)) {
    console.error(`[prerender] ${WRANGLER_CONFIG} não existe — rode "vite build" antes.`);
    process.exit(1);
  }

  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const wranglerBin = join(ROOT, "node_modules", ".bin", "wrangler");

  console.log(`[prerender] Subindo wrangler dev na porta ${port}...`);
  const child = spawn(
    wranglerBin,
    ["dev", "--config", "wrangler.json", "--port", String(port), "--ip", "127.0.0.1"],
    { cwd: SERVER_DIR, stdio: ["ignore", "pipe", "pipe"] },
  );

  let startupLog = "";
  child.stdout.on("data", (d) => (startupLog += d));
  child.stderr.on("data", (d) => (startupLog += d));

  const cleanup = () => {
    if (!child.killed) child.kill("SIGTERM");
  };
  process.on("exit", cleanup);

  try {
    await waitUntilReady(baseUrl, Date.now() + READY_TIMEOUT_MS);
  } catch (err) {
    console.error("[prerender] wrangler dev falhou ao iniciar. Saída:");
    console.error(startupLog);
    cleanup();
    process.exit(1);
  }

  const routes = loadRoutes();
  console.log(`[prerender] Crawling ${routes.length} rotas (concorrência ${CONCURRENCY})...`);
  const start = Date.now();
  const { ok, failed } = await runPool(routes, CONCURRENCY, (route) => crawlRoute(baseUrl, route));
  const seconds = ((Date.now() - start) / 1000).toFixed(1);

  cleanup();

  console.log(`[prerender] ${ok}/${routes.length} páginas geradas em ${seconds}s.`);
  if (failed.length > 0) {
    console.warn(`[prerender] ${failed.length} rota(s) falharam e ficam sem versão estática (caem no Worker ao vivo):`);
    for (const f of failed.slice(0, 20)) console.warn(`  ${f.item} — ${f.error}`);
    if (failed.length > 20) console.warn(`  ...e mais ${failed.length - 20}`);
  }
}

main().catch((err) => {
  console.error("[prerender] Erro inesperado:", err);
  process.exit(1);
});
