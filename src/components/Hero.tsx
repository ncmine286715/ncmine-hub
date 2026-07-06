import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { MinecraftBlockIcon } from "@/components/icons/BrandIcons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE_NAME } from "@/lib/links";
import type { Addon } from "@/components/AddonCard";

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

const SLOT_COUNT = 9;

/** Hotbar de inventário — cada slot é um addon de verdade, o selecionado roda sozinho. */
function useSelectedSlot(total: number) {
  const [selected, setSelected] = useState(0);
  const reduceMotion = useRef(false);
  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion.current || total <= 1) return;
    const id = setInterval(() => setSelected((s) => (s + 1) % total), 1700);
    return () => clearInterval(id);
  }, [total]);
  return selected;
}

export function Hero({
  addonsCount,
  hotbarAddons = [],
}: {
  addonsCount: number;
  hotbarAddons?: Addon[];
}) {
  const slots = hotbarAddons.slice(0, SLOT_COUNT);
  const selected = useSelectedSlot(slots.length);

  return (
    <header
      data-onboarding="hero"
      className="relative mx-auto w-full max-w-7xl px-3 pt-2 sm:px-4 sm:pt-6"
    >
      {/* Top bar */}
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
          <ThemeToggle />
        </div>
      </div>

      <section className="relative grid gap-6 py-6 sm:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8">
        <div className="min-w-0 text-center lg:text-left">
          <h1 className="mx-auto max-w-xl text-2xl font-black uppercase leading-tight tracking-tight sm:text-4xl lg:mx-0 lg:text-5xl">
            Addons pra Minecraft <span className="text-primary">Bedrock</span>
          </h1>
          <p className="mx-auto mt-2 max-w-md text-[12px] font-medium text-muted-foreground sm:mt-3 sm:text-base lg:mx-0">
            Busca na coleção, baixa o arquivo e ativa no seu mundo.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-5 lg:justify-start">
            <span className="border-2 border-foreground/25 px-2.5 py-1 font-pixel text-[8px] uppercase text-muted-foreground sm:text-[9px]">
              {addonsCount} addons
            </span>
            <span className="border-2 border-foreground/25 px-2.5 py-1 font-pixel text-[8px] uppercase text-muted-foreground sm:text-[9px]">
              100% grátis
            </span>
            <span className="border-2 border-foreground/25 px-2.5 py-1 font-pixel text-[8px] uppercase text-muted-foreground sm:text-[9px]">
              Bedrock 1.21+
            </span>
          </div>
        </div>

        {slots.length > 0 && (
          <div className="mx-auto w-full min-w-0 max-w-md lg:mx-0 lg:max-w-none">
            <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 pb-1 scrollbar-hide sm:mx-0 sm:gap-2 sm:px-0">
              {slots.map((addon, i) => (
                <Link
                  key={addon.id}
                  to="/addon/$id"
                  params={{ id: addon.id }}
                  aria-label={addon.title}
                  title={addon.title}
                  className={`hotbar-slot shine-sweep group relative aspect-square w-11 shrink-0 overflow-hidden sm:w-14 ${
                    i === selected ? "hotbar-slot--selected" : ""
                  }`}
                >
                  <img
                    src={addon.image}
                    alt=""
                    aria-hidden
                    loading="eager"
                    referrerPolicy="no-referrer"
                    className="pixelated h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                  />
                  <span
                    className="pointer-events-none absolute bottom-0.5 right-1 select-none text-[9px] font-bold text-white/80"
                    style={{
                      fontFamily: "var(--font-hud)",
                      textShadow: "0 1px 1px rgba(0,0,0,.8)",
                    }}
                  >
                    {i + 1}
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-2 text-center font-pixel text-[8px] uppercase text-muted-foreground lg:text-left">
              Mais baixados agora — clica pra ver
            </p>
          </div>
        )}
      </section>
    </header>
  );
}
