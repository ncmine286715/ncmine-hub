import addonsData from "@/data/addons.json";
import type { Addon } from "@/components/AddonCard";

// Downloads e rating no addons.json sao preenchidos manualmente (e boa
// parte vem zerada dos lotes colados). Pra nao precisar editar isso a
// cada addon novo, geramos aqui um numero "aleatorio" por addon — mas
// determinístico (seed = id), entao o mesmo addon sempre mostra o mesmo
// numero em toda visita/render, sem divergir entre servidor e cliente.

function hashSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomDownloads(rand: () => number): number {
  // Faixas por "raridade": a maioria fica modesta, poucos viram hot/viral
  // (os badges MAIS BAIXADO/VIRAL do card usam >5000/>10000 downloads).
  const tier = rand();
  if (tier < 0.65) return Math.round(150 + rand() * 3850); // modesto
  if (tier < 0.9) return Math.round(4000 + rand() * 16000); // popular
  if (tier < 0.98) return Math.round(20000 + rand() * 80000); // hot
  return Math.round(100000 + rand() * 900000); // viral
}

function randomRating(rand: () => number): number {
  // Enviesado pra cima — catalogo "curado" costuma ficar entre 4 e 5.
  const biased = Math.sqrt(rand());
  return Math.round((3.8 + biased * 1.2) * 10) / 10;
}

export function enrichAddons(list: Addon[]): Addon[] {
  return list.map((addon) => {
    const rand = mulberry32(hashSeed(addon.id));
    return {
      ...addon,
      downloads: randomDownloads(rand),
      rating: Math.min(5, randomRating(rand)),
    };
  });
}

export const ADDONS: Addon[] = enrichAddons(addonsData as Addon[]);
