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

      {/* Hero copy — editorial, minimal */}
      <section className="grid items-center gap-6 py-10 sm:py-16 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="min-w-0 text-center lg:text-left">
          <span className="chip chip-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {addonsCount} addons curados
          </span>
          <h1 className="mt-4 text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Os melhores addons
            <br />
            de <span className="font-serif-display italic font-normal text-primary">Minecraft Bedrock</span>
            <br />
            em um só lugar.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0">
            Curadoria semanal do @ncmine. Sem cadastro, sem anúncio disfarçado de botão. Escolha, baixe e jogue.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
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
              <Search className="h-4 w-4" /> Buscar por nome
            </button>
          </div>
        </div>

        {/* Editorial stat panel — highlights instead of hotbar chaos */}
        <aside className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
          <div className="card-block p-5 sm:p-6">
            <p className="font-pixel text-[9px] uppercase tracking-widest text-muted-foreground">
              Coleção atual
            </p>
            <p className="mt-1 text-5xl font-black tabular-nums text-foreground sm:text-6xl">
              {addonsCount}
              <span className="text-primary">.</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">addons ativos no hub</p>

            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
              <Stat label="Grátis" value="100%" />
              <Stat label="Cadastro" value="0" />
              <Stat label="Bedrock" value="✓" />
            </div>
          </div>
        </aside>
      </section>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-bold text-foreground sm:text-xl">{value}</p>
      <p className="mt-0.5 font-pixel text-[8px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
