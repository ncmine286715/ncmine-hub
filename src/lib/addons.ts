import addonsData from "@/data/addons.json";
import type { Addon } from "@/components/AddonCard";

// Nada de número inventado: downloads e rating só aparecem quando existe
// dado real no catálogo. O que vier zerado fica escondido na interface.

const norm = (s?: string) => (s || "").replace(/\s+/g, " ").trim();

/** Normaliza e remove entradas duplicadas (mesmo id) do catálogo. */
export function enrichAddons(list: Addon[]): Addon[] {
  const seen = new Set<string>();
  const out: Addon[] = [];
  for (const addon of list) {
    if (!addon?.id || seen.has(addon.id)) continue;
    seen.add(addon.id);
    const short = norm(addon.short);
    const description = norm(addon.description);
    out.push({
      ...addon,
      title: norm(addon.title),
      author: norm(addon.author),
      short,
      // Descrição igual ao resumo = texto repetido na página. Descarta.
      description: description && description !== short ? description : "",
      downloads: Number(addon.downloads) || 0,
      rating: Number(addon.rating) || 0,
    });
  }
  return out;
}

/**
 * Página só é indexável quando tem texto editorial próprio suficiente.
 * As demais ficam acessíveis, mas com noindex e fora do sitemap
 * (evita o padrão "thin/scraped content" reprovado pelo AdSense).
 */
export const MIN_EDITORIAL_WORDS = 40;

export function isIndexableAddon(addon: Pick<Addon, "short" | "description">): boolean {
  const description = norm(addon.description);
  if (!description || description === norm(addon.short)) return false;
  return description.split(" ").length >= MIN_EDITORIAL_WORDS;
}

export const ADDONS: Addon[] = enrichAddons(addonsData as Addon[]);
