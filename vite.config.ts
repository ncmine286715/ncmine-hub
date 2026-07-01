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

// Prerender está desativado no momento — a combinação do plugin do
// TanStack Start com o adapter Cloudflare estava quebrando o build
// (augmentReq tentando mutar Request nativa; entry naming mismatch).
// A performance é garantida via cache agressivo do CDN em public/_headers.
export default defineConfig({
  plugins: [],
});
