import { Search, Download, ArrowDown } from "lucide-react";
import { MinecraftBlockIcon } from "@/components/icons/BrandIcons";
import { SITE_NAME } from "@/lib/links";

function scrollToAddons() {
  if (typeof document === "undefined") return;
  const el = document.getElementById("addons");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function focusSearch() {
  if (typeof document === "undefined") return;
  scrollToAddons();
  setTimeout(() => {
    const input = document.querySelector<HTMLInputElement>('#addons input[placeholder^="Buscar"]');
    input?.focus();
  }, 400);
}

export function Hero({ addonsCount }: { addonsCount: number }) {
  return (
    <header className="relative mx-auto w-full max-w-7xl px-3 pt-2 sm:px-4 sm:pt-6">
      {/* Sticky-ish top bar */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-foreground pb-2 sm:pb-3">
        <div className="flex items-center gap-2">
          <MinecraftBlockIcon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
          <span className="font-pixel text-[10px] uppercase sm:text-xs">{SITE_NAME}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={focusSearch}
            aria-label="Buscar"
            className="inline-flex h-9 w-9 items-center justify-center border-2 border-foreground bg-background hover:bg-muted sm:h-10 sm:w-10"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={scrollToAddons}
            className="btn-block bg-primary text-primary-foreground !px-3 !py-2 text-[11px] font-black uppercase sm:!px-4 sm:!py-2.5 sm:text-xs"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Baixar agora</span>
            <span className="sm:hidden">Baixar</span>
          </button>
        </div>
      </div>

      {/* Minimal hero */}
      <section className="relative py-5 sm:py-10 text-center">
        <h1 className="mx-auto max-w-3xl text-2xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
          {addonsCount}{" "}
          <span className="inline-block bg-primary px-2 py-0.5 text-primary-foreground shadow-[4px_4px_0_0_var(--ink)] rotate-[-1deg]">
            Addons Grátis
          </span>{" "}
          para Minecraft Bedrock
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-[12px] font-medium text-muted-foreground sm:mt-4 sm:text-base">
          Sem cadastro. Sem anúncio de instalação. Clique e baixe.
        </p>
        <button
          type="button"
          onClick={scrollToAddons}
          className="btn-block mx-auto mt-4 bg-foreground text-background !px-5 !py-3 text-xs font-black uppercase tracking-wider sm:mt-6 sm:!px-8 sm:!py-4 sm:text-sm"
        >
          Ver addons <ArrowDown className="h-4 w-4 animate-bounce" />
        </button>
      </section>
    </header>
  );
}
