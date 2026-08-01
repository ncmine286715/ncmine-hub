import { Search } from "lucide-react";
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
    <header className="relative mx-auto w-full max-w-6xl px-4 pt-4 sm:pt-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <MinecraftBlockIcon className="h-5 w-5 text-primary" />
          <span className="font-pixel text-[10px] uppercase tracking-wider">{SITE_NAME}</span>
        </div>
        <button
          type="button"
          onClick={focusSearch}
          aria-label="Buscar addons"
          className="btn-ghost !px-3 !py-2"
        >
          <Search className="h-4 w-4" />
          <span className="hidden text-xs sm:inline">Buscar</span>
        </button>
      </div>

      {/* Hero — curto e direto */}
      <section className="py-8 text-center sm:py-14">
        <span className="chip chip-primary">{addonsCount} addons · grátis</span>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl">
          Addons de <span className="font-serif-display italic font-normal text-primary">Minecraft Bedrock</span>
        </h1>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={scrollToAddons}
            className="btn-block bg-primary text-primary-foreground !px-6 !py-3"
          >
            Ver addons
          </button>
          <button
            type="button"
            onClick={focusSearch}
            className="btn-ghost border border-border !px-5 !py-3"
          >
            <Search className="h-4 w-4" /> Buscar
          </button>
        </div>
      </section>
    </header>
  );
}
