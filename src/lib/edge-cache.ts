// Every route in this app renders the same HTML for every visitor — all
// personalization (auth, favorites, admin data) is fetched client-side via
// Firebase after hydration, never baked into the server response. That makes
// full-page SSR responses safe to cache at the Cloudflare edge, which turns
// most traffic into cache hits that never invoke the Worker (saving CPU/request
// quota on the free plan) without touching the SSR render pipeline itself.
//
// Account-related routes are excluded anyway, as defense in depth in case that
// assumption ever changes.
const CACHE_EXCLUDED_PATH_PREFIXES = ["/admin", "/auth", "/favorites", "/profile"];

const EDGE_CACHE_S_MAXAGE_SECONDS = 1800;
const EDGE_CACHE_STALE_WHILE_REVALIDATE_SECONDS = 86400;

type MinimalExecutionContext = { waitUntil?: (promise: Promise<unknown>) => void };

function isPathExcluded(pathname: string): boolean {
  return CACHE_EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isCacheableHtmlResponse(response: Response): boolean {
  if (response.status !== 200) return false;
  if (response.headers.has("set-cookie")) return false;
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("text/html");
}

/**
 * Wraps a request handler with Cloudflare's per-request Cache API. Any
 * failure in the caching layer itself falls back to calling `handle()`
 * directly — caching is a pure optimization and must never be able to break
 * the actual response.
 */
export async function withEdgeCache(
  request: Request,
  ctx: unknown,
  handle: () => Promise<Response>,
): Promise<Response> {
  const executionContext = ctx as MinimalExecutionContext | undefined;

  if (request.method !== "GET" || typeof caches === "undefined") {
    return handle();
  }

  const url = new URL(request.url);
  if (isPathExcluded(url.pathname)) {
    return handle();
  }

  const cache = (caches as unknown as { default: Cache }).default;

  try {
    const cached = await cache.match(request);
    if (cached) return cached;
  } catch {
    // Fall through to a normal, uncached response.
  }

  const response = await handle();

  if (typeof executionContext?.waitUntil === "function" && isCacheableHtmlResponse(response)) {
    try {
      const headers = new Headers(response.headers);
      headers.set(
        "Cache-Control",
        `public, max-age=0, s-maxage=${EDGE_CACHE_S_MAXAGE_SECONDS}, stale-while-revalidate=${EDGE_CACHE_STALE_WHILE_REVALIDATE_SECONDS}`,
      );
      const cacheableResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
      const toServe = cacheableResponse.clone();
      executionContext.waitUntil(cache.put(request, cacheableResponse).catch(() => {}));
      return toServe;
    } catch {
      // If anything about constructing the cacheable copy fails, serve the
      // original response untouched rather than risk a broken body.
      return response;
    }
  }

  return response;
}
