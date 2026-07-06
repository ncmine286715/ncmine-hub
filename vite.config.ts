// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (cloudflare-module preset, build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// `tanstackStart.prerender` doesn't work with the nitro cloudflare-module
// preset: its preview server runs in plain Node, but the worker nitro builds
// does `augmentReq` mutations on the native Request that only workerd (real
// Cloudflare runtime) allows. `scripts/prerender.mjs` does the equivalent
// job instead — it runs after this build, drives a real `wrangler dev`
// (workerd via Miniflare), crawls every route and writes static HTML into
// .output/public. That's what keeps pageviews from invoking the Worker at
// all, which is what was burning through the free plan's CPU-time/request
// budget (error 1102).
export default defineConfig({
  plugins: [],
});
