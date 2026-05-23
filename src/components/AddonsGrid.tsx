import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AddonCard, type Addon } from "@/components/AddonCard";

type Props = {
  addons: Addon[];
  featuredAddon?: Addon;
  onDownload: (a: Addon) => void;
  onOpen: (a: Addon) => void;
};

type Sort = "mix" | "recent" | "popular" | "rating" | "az";

export function AddonsGrid({ addons, featuredAddon, onDownload, onOpen }: Props) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Todos");
  const [sort, setSort] = useState<Sort>("mix");

  const categories = useMemo(() => {
    const set = new Set(addons.map((a) => a.category));
    return ["Todos", ...Array.from(set)];
  }, [addons]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let list = addons.filter((a) => {
      const matchesCat = cat === "Todos" || a.category === cat;
      if (!matchesCat) return false;
      if (!ql) return true;
      return (
        a.title.toLowerCase().includes(ql) ||
        a.author?.toLowerCase().includes(ql) ||
        a.tags?.some((t) => t.toLowerCase().includes(ql)) ||
        a.short?.toLowerCase().includes(ql)
      );
    });
    if (sort === "mix") return list;
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "popular":
          return (b.downloads || 0) - (a.downloads || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "az":
          return a.title.localeCompare(b.title);
        case "recent":
        default:
          return (b.date || "").localeCompare(a.date || "");
      }
    });
    return list;
  }, [addons, q, cat, sort]);

  return (
    <section id="addons" className="relative mx-auto w-full max-w-7xl px-3 py-6 pb-28 sm:px-4 sm:py-20">
      <header className="mb-4 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-block bg-foreground px-2 py-1 font-pixel text-[9px] text-background sm:text-[10px]">
            ADDONS
          </span>
          <h2 className="mt-2 text-2xl font-black uppercase leading-none sm:mt-3 sm:text-5xl">
            Toda a coleção
          </h2>
          <p className="mt-1 max-w-xl text-[11px] text-muted-foreground sm:mt-2 sm:text-sm">
            {addons.length} addons curados. Busque, filtre e baixe.
          </p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <label className="relative block flex-1 sm:w-72 sm:flex-initial">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar addon, tag, autor…"
              className="w-full border-2 border-foreground bg-background py-2.5 pl-9 pr-3 text-sm font-medium outline-none placeholder:text-muted-foreground focus:bg-primary/10"
            />
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="border-2 border-foreground bg-background px-2 py-2.5 text-sm font-bold uppercase"
          >
            <option value="mix">Misturado</option>
            <option value="recent">Recente</option>
            <option value="popular">Popular</option>
            <option value="rating">Rating</option>
            <option value="az">A-Z</option>
          </select>
        </div>
      </header>

      <div className="mb-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {categories.map((c) => {
          const active = c === cat;
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 border-2 border-foreground px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                active ? "bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--ink)]" : "bg-background hover:bg-foreground hover:text-background"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="card-block p-10 text-center">
          <p className="font-pixel text-xs">NADA ENCONTRADO</p>
          <p className="mt-2 text-sm text-muted-foreground">Tenta outro termo ou categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((a) => (
            <AddonCard key={a.id} addon={a} onDownload={onDownload} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}