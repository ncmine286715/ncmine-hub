import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

// Nenhuma rota lê cookies ou searchParams durante o SSR (Firebase/auth só
// rodam client-side, ?q= é aplicado só depois do mount) — então o HTML de
// uma URL é idêntico pra qualquer visitante. Sem isso, TODA pageview
// reexecuta o SSR inteiro no Worker, o que estourava o limite de
// requests/CPU-time do plano. Cacheia a resposta no edge (Cache API) por
// rota (ignorando querystring) e reusa em requests seguintes na mesma PoP.
const HTML_CACHE_TTL_SECONDS = 300;

function cacheKeyFor(request: Request): Request {
  const url = new URL(request.url);
  url.search = "";
  return new Request(url.toString(), request);
}

// caches.default is Cloudflare-specific (not in lib.dom's CacheStorage), so
// it isn't typed without @cloudflare/workers-types — cast minimally instead
// of pulling in the package.
//
// ctx is normally an ExecutionContext with .waitUntil() to background a
// cache write, but TanStack Start's Cloudflare service wrapper
// (.output/server/index.mjs's lazyService) invokes this fetch with only the
// request — env/ctx come through as undefined. So the cache write is
// awaited inline instead of backgrounded; it costs a little latency on a
// cache miss but works regardless of what ctx turns out to be.

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const cache = (caches as unknown as { default: Cache }).default;
    const cacheable = request.method === "GET";
    const cacheKey = cacheable ? cacheKeyFor(request) : undefined;

    if (cacheKey) {
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);

      if (cacheKey && normalized.status === 200) {
        const toCache = new Response(normalized.body, normalized);
        toCache.headers.set("Cache-Control", `public, max-age=${HTML_CACHE_TTL_SECONDS}`);
        await cache.put(cacheKey, toCache.clone());
        return toCache;
      }
      return normalized;
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
