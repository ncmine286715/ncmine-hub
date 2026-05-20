import { ArrowUp } from "lucide-react";
import { DiscordIcon, MinecraftBlockIcon } from "@/components/icons/BrandIcons";
import { DISCORD_URL, ADDONS_HUB_URL } from "@/lib/links";

/**
 * Sticky bottom action bar — mobile only.
 * Keeps Discord + Addons Apelões one tap away while scrolling the grid.
 */
export function MobileStickyCTA() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-foreground bg-background/95 backdrop-blur-sm sm:hidden">
      <div className="grid grid-cols-[1fr_1fr_48px] gap-2 p-2">
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-[#5865F2] px-3 py-2.5 text-xs font-bold uppercase text-white shadow-[3px_3px_0_0_var(--ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <DiscordIcon className="h-4 w-4" />
          Discord
        </a>
        <a
          href={ADDONS_HUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-primary px-3 py-2.5 text-xs font-bold uppercase text-primary-foreground shadow-[3px_3px_0_0_var(--ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <MinecraftBlockIcon className="h-4 w-4" />
          Addons
        </a>
        <button
          onClick={scrollToTop}
          aria-label="Voltar ao topo"
          className="flex items-center justify-center border-2 border-foreground bg-background shadow-[3px_3px_0_0_var(--ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
