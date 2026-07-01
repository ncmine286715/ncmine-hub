// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { copyFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import addons from "./src/data/addons.json" with { type: "json" };

const addonPages = (addons as Array<{ id: string }>).map((a) => ({
  path: `/addon/${a.id}`,
}));

// tanstack-start's preview-server-plugin (usado pelo prerender) espera
// dist/server/server.js, mas o output do cloudflare plugin é dist/server/index.mjs.
// Este plugin cria o alias antes do prerender rodar.
const aliasServerBundle = () => ({
  name: "alias-server-bundle-for-prerender",
  apply: "build" as const,
  closeBundle: {
    order: "post" as const,
    handler() {
      const dir = join(process.cwd(), "dist", "server");
      if (!existsSync(dir)) return;
      const files = readdirSync(dir);
      // Encontra o entry principal (index.mjs ou similar) e cria server.js apontando pra ele.
      const entry = files.find((f) => /^index\.(mjs|js)$/.test(f)) ?? files.find((f) => f.endsWith(".mjs"));
      if (!entry) return;
      const target = join(dir, "server.js");
      if (!existsSync(target)) {
        try { copyFileSync(join(dir, entry), target); } catch {}
      }
    },
  },
});

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
// Prerender enabled: home is pure static HTML, killing Cloudflare CPU usage (error 1102).
export default defineConfig({
  plugins: [aliasServerBundle()],
  tanstackStart: {
    prerender: {
      enabled: true,
      crawlLinks: false,
      autoSubfolderIndex: false,
      // Não descobrir /admin, /auth, /favorites... (dependem de Firebase Auth e quebram SSR).
      autoStaticPathsDiscovery: false,
      // Se algum addon quebrar, não faz o build inteiro cair.
      failOnError: false,
    },
    pages: [{ path: "/" }, ...addonPages],
  },
});
