import { useMemo, useState } from "react";
import { Search, Star, Download, Grid3X3, Package, Image, Layers, Sparkles } from "lucide-react";
import { AddonCard, type Addon } from "@/components/AddonCard";

type Props = {
  addons: Addon[];
  featuredAddon?: Addon;
  onDownload: (a: Addon) => void;
  onOpen: (a: Addon) => void;
  externalCategory?: string;
  onCategoryChange?: (cat: string) => void;
};

type Sort = "mix" | "recent" | "popular" | "rating" | "az";

type CategoryConfig = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
};

const CATEGORY_CONFIG: CategoryConfig[] = [
  { id: "Todos", label: "Todos", icon: <Grid3X3 className="h-4 w-4" />, color: "text-foreground", bgColor: "bg-foreground text-background" },
  { id: "Addon", label: "Addons", icon: <Package className="h-4 w-4" />, color: "text-primary", bgColor: "bg-primary text-primary-foreground" },
  { id: "Texture Pack", label: "Texturas", icon: <Image className="h-4 w-4" />, color: "text-[#4CAF50]", bgColor: "bg-[#4CAF50] text-white" },
  { id: "Holoprint", label: "Holoprint", icon: <Layers className="h-4 w-4" />, color: "text-[#2196F3]", bgColor: "bg-[#2196F3] text-white" },
  { id: "Addon Pack", label: "Packs", icon: <Sparkles className="h-4 w-4" />, color: "text-[#9C27B0]", bgColor: "bg-[#9C27B0] text-white" },
];

export function AddonsGrid({ addons, featuredAddon, onDownload, onOpen, externalCategory, onCategoryChange }: Props) {
  const [q, setQ] = useState("");
  const [internalCat, setInternalCat] = useState<string>("Todos");
  const [sort, setSort] = useState<Sort>("mix");

  const cat = externalCategory ?? internalCat;
  const setCat = onCategoryChange ?? setInternalCat;

  const categories = useMemo(() => {
    const set = new Set(addons.map((a) => a.category));
    return ["Todos", ...Array.from(set)];
  }, [addons]);

  // Map categories to our config, with fallback for dynamic categories
  const categoryButtons = useMemo(() => {
    return categories.map(catName => {
      const config = CATEGORY_CONFIG.find(c => c.id.toLowerCase() === catName.toLowerCase());
      if (config) return { ...config, id: catName };
      return {
        id: catName,
        label: catName,
        icon: <Grid3X3 className="h-4 w-4" />,
        color: "text-foreground",
        bgColor: "bg-foreground text-background"
      };
    });
  }, [categories]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let list = addons.filter((a) => {
      const matchesCat = cat === "Todos" || a.category.toLowerCase() === cat.toLowerCase();
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
    <section id="addons" className="relative mx-auto w-full max-w-7xl px-3 py-4 pb-24 sm:px-4 sm:py-20 sm:pb-20">
      {/* Mobile Quick Categories */}
      <div className="mb-4 sm:hidden">
        <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-2 scrollbar-hide">
          {categoryButtons.slice(0, 5).map((c) => {
            const active = c.id.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`flex shrink-0 items-center gap-1.5 border-2 border-foreground px-3 py-2 text-xs font-bold transition-all ${
                  active 
                    ? `${c.bgColor} shadow-[3px_3px_0_0_var(--ink)]` 
                    : "bg-background hover:bg-muted"
                }`}
              >
                {c.icon}
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <header className="mb-4 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-block bg-foreground px-2 py-1 font-pixel text-[9px] text-background sm:text-[10px]">
            ADDONS
          </span>
          <h2 className="mt-2 text-xl font-black uppercase leading-none sm:mt-3 sm:text-5xl">
            {cat === "Todos" ? "Toda a colecao" : cat}
          </h2>
          <p className="mt-1 max-w-xl text-[11px] text-muted-foreground sm:mt-2 sm:text-sm">
            {filtered.length} {filtered.length === 1 ? "addon" : "addons"} {cat !== "Todos" ? `em ${cat}` : "curados"}. Busque, filtre e baixe.
          </p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <label data-onboarding="search" className="relative block flex-1 sm:w-72 sm:flex-initial">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar addon..."
              className="w-full border-2 border-foreground bg-background py-2.5 pl-9 pr-3 text-sm font-medium outline-none placeholder:text-muted-foreground focus:bg-primary/10"
            />
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="border-2 border-foreground bg-background px-2 py-2.5 text-sm font-bold uppercase"
          >
            <option value="mix">Mix</option>
            <option value="recent">Novo</option>
            <option value="popular">Popular</option>
            <option value="rating">Rating</option>
            <option value="az">A-Z</option>
          </select>
        </div>
      </header>

      {/* Desktop Categories */}
      <div className="mb-6 hidden gap-2 sm:flex sm:flex-wrap">
        {categoryButtons.map((c) => {
          const active = c.id.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`flex shrink-0 items-center gap-2 border-2 border-foreground px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                active ? `${c.bgColor} shadow-[3px_3px_0_0_var(--ink)]` : "bg-background hover:bg-foreground hover:text-background"
              }`}
            >
              {c.icon}
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Featured addon (always first) */}
      {featuredAddon && cat === "Todos" && (
        <div data-onboarding="featured" className="mb-4 sm:mb-5">
          <div className="relative overflow-hidden border-2 border-foreground bg-background">
            <button
              type="button"
              onClick={() => onOpen(featuredAddon)}
              className="group relative block aspect-[16/9] w-full overflow-hidden bg-muted sm:aspect-[24/9]"
            >
              <img
                src={featuredAddon.image}
                alt={featuredAddon.title}
                loading="eager"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 border-2 border-foreground bg-primary px-2 py-0.5 font-pixel text-[9px] uppercase text-primary-foreground">
                <Star className="h-3 w-3" />
                Destaque
              </span>
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white sm:hidden">
                <h3 className="text-base font-black uppercase leading-tight">
                  {featuredAddon.title}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-xs text-white/80">
                  {featuredAddon.short}
                </p>
              </div>
            </button>
            <div className="hidden flex-col gap-2 p-3 sm:flex sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <div className="flex-1">
                <h3 className="text-base font-black uppercase leading-tight sm:text-lg">
                  {featuredAddon.title}
                </h3>
                <p className="mt-0.5 max-w-md text-xs text-muted-foreground sm:text-sm">
                  {featuredAddon.short}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 font-pixel text-[10px]">
                  <Download className="h-3 w-3" /> {featuredAddon.downloads.toLocaleString("pt-BR")} downloads
                </p>
              </div>
              <button
                onClick={() => onDownload(featuredAddon)}
                className="btn-block shrink-0 bg-primary text-primary-foreground !px-4 !py-2.5 text-xs sm:!px-8 sm:!py-4 sm:text-sm shadow-[4px_4px_0_0_var(--ink)] hover:-translate-y-0.5 active:translate-y-0 transition-all font-black uppercase tracking-widest"
              >
                <Download className="h-5 w-5" /> Baixar Agora
              </button>
            </div>
            {/* Mobile download button */}
            <div className="flex items-center justify-between gap-2 border-t-2 border-foreground p-3 sm:hidden bg-primary/5">
              <span className="text-[10px] font-bold text-foreground/70 flex items-center gap-1">
                <Download className="h-3 w-3" /> {featuredAddon.downloads.toLocaleString("pt-BR")}
              </span>
              <button
                onClick={() => onDownload(featuredAddon)}
                className="btn-block flex-1 bg-primary text-primary-foreground !px-4 !py-2.5 text-xs font-black shadow-[3px_3px_0_0_var(--ink)] justify-center"
              >
                <Download className="h-4 w-4" /> Baixar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card-block p-10 text-center">
          <p className="font-pixel text-xs">NADA ENCONTRADO</p>
          <p className="mt-2 text-sm text-muted-foreground">Tenta outro termo ou categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((a) => (
            <AddonCard key={a.id} addon={a} onDownload={onDownload} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}
