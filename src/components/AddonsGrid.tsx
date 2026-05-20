import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AddonCard, type Addon } from "@/components/AddonCard";

type Props = {
  addons: Addon[];
  onDownload: (a: Addon) => void;
  onOpen: (a: Addon) => void;
};

type Sort = "recent" | "popular" | "rating" | "az";

export function AddonsGrid({ addons, onDownload, onOpen }: Props) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Todos");
  const [sort, setSort] = useState<Sort>("recent");

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
    <section id="addons" className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:py-24">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-block bg-foreground px-2 py-1 font-pixel text-[10px] text-background">
            ADDONS
          </span>
          <h2 className="mt-3 text-4xl font-black uppercase leading-none sm:text-6xl">
            Toda a coleção
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {addons.length} addons selecionados a dedo. Use a busca, filtre por categoria e baixe.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="relative block w-full sm:w-72">
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
            <option value="recent">Recente</option>
            <option value="popular">Popular</option>
            <option value="rating">Rating</option>
            <option value="az">A-Z</option>
          </select>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((c) => {
          const active = c === cat;
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`border-2 border-foreground px-3 py-1.5 text-xs font-bold uppercase transition-all ${
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((a) => (
            <AddonCard key={a.id} addon={a} onDownload={onDownload} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}