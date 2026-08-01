import type { Addon } from "@/components/AddonCard";
import { ADDONS, enrichAddons } from "@/lib/addons";

// Fonte remota do catálogo. Por padrão o arquivo estático /addons.json
// (mesmo conteúdo do bundle), mas pode apontar pra qualquer URL pública
// (Gist, GitHub raw, CDN...) via VITE_ADDONS_URL — assim dá pra mudar o
// conteúdo do site sem novo deploy.
export const ADDONS_SOURCE_URL: string =
  (import.meta.env.VITE_ADDONS_URL as string | undefined) || "/addons.json";

const CACHE_KEY = "ncmine:addons-cache-v1";

function isValidCatalog(data: unknown): data is Addon[] {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof (data[0] as Addon)?.id === "string" &&
    typeof (data[0] as Addon)?.title === "string"
  );
}

/** Busca o catálogo remoto. Retorna null quando falhar (usa-se o bundle). */
export async function fetchRemoteAddons(signal?: AbortSignal): Promise<Addon[] | null> {
  try {
    const res = await fetch(ADDONS_SOURCE_URL, {
      signal,
      cache: "no-cache", // revalida (304 é barato), mas nunca serve stale infinito
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!isValidCatalog(data)) return null;
    const enriched = enrichAddons(data);
    try {
      sessionStorage.setItem(CACHE_KEY, String(enriched.length));
    } catch {}
    return enriched;
  } catch {
    return null;
  }
}

/** Catálogo embutido — usado como render inicial instantâneo e fallback. */
export const FALLBACK_ADDONS = ADDONS;
