import { Sparkles, ArrowDown } from "lucide-react";
import { DiscordIcon, YouTubeIcon, MinecraftBlockIcon } from "@/components/icons/BrandIcons";
import { DISCORD_URL, YOUTUBE_URL, CREATOR_NAME } from "@/lib/links";

export function Hero({ addonsCount }: { addonsCount: number }) {
  return (
    <header className="relative mx-auto w-full max-w-7xl px-3 pt-2 sm:px-4 sm:pt-8">
      {/* Top bar - simplified for mobile */}
      <div className="flex items-center justify-between border-b-2 border-foreground pb-2 sm:pb-3">
        <div className="flex items-center gap-2">
          <MinecraftBlockIcon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
          <span className="font-pixel text-[10px] sm:text-xs">NCMINE</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile quick actions */}
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" aria-label="Discord" className="inline-flex h-8 w-8 items-center justify-center border-2 border-foreground bg-[#5865F2] text-white sm:hidden">
            <DiscordIcon className="h-4 w-4" />
          </a>
          <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="inline-flex h-8 w-8 items-center justify-center border-2 border-foreground bg-[#FF0000] text-white sm:hidden">
            <YouTubeIcon className="h-4 w-4" />
          </a>
          {/* Desktop nav */}
          <nav className="hidden gap-4 text-xs font-bold uppercase sm:flex">
            <a href="#addons" className="hover:text-primary">Addons</a>
            <a href="#links" className="hover:text-primary">Links</a>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-primary">YouTube</a>
          </nav>
        </div>
      </div>

      {/* Compact Mobile Hero */}
      <section className="relative py-3 sm:py-10">
        <div aria-hidden className="absolute -left-4 top-2 hidden h-14 w-14 rotate-12 border-2 border-foreground bg-primary shadow-[6px_6px_0_0_var(--ink)] md:block" />
        <div aria-hidden className="absolute -right-2 bottom-2 hidden h-10 w-10 -rotate-6 border-2 border-foreground bg-foreground md:block" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          {/* Badge */}
          <span className="mb-2 inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-2 py-0.5 font-pixel text-[8px] uppercase shadow-[2px_2px_0_0_var(--ink)] sm:mb-3 sm:gap-2 sm:px-2.5 sm:py-1 sm:text-[10px] sm:shadow-[3px_3px_0_0_var(--ink)]">
            <Sparkles className="h-3 w-3 text-primary" />
            {addonsCount}+ Addons Bedrock
          </span>

          {/* Title - more compact on mobile */}
          <h1 className="text-2xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block">{CREATOR_NAME}</span>
            <span className="mt-1 inline-block bg-primary px-1.5 text-primary-foreground sm:px-2">
              ADDONS APELOES
            </span>
          </h1>

          <p className="mx-auto mt-2 max-w-md text-[11px] text-muted-foreground sm:mt-3 sm:text-sm">
            Os melhores add-ons curados, testados e prontos pra baixar.
          </p>

          {/* Single primary CTA: drives clicks to addons (download) */}
          <div id="links" className="mt-3 flex justify-center sm:mt-6">
            <a
              href="#addons"
              className="btn-block bg-primary text-primary-foreground animate-mc-pulse-orange !px-4 !py-2.5 text-xs sm:!px-6 sm:!py-3 sm:text-sm"
            >
              <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5" />
              Ver Addons
            </a>
          </div>
        </div>
      </section>

      {/* Marquee - smaller on mobile */}
      <div className="relative -mx-3 overflow-hidden border-y-2 border-foreground bg-foreground text-background sm:-mx-4">
        <div className="flex w-max animate-mc-scroll-x gap-4 whitespace-nowrap py-1.5 font-pixel text-[8px] sm:gap-8 sm:py-3 sm:text-xs">
          {Array.from({ length: 2 }).map((_, group) => (
            <div key={group} className="flex items-center gap-4 px-2 sm:gap-8 sm:px-4">
              {["BEDROCK", "ADDONS", "TEXTURAS", "MOBS", "MAPAS", "NCMINE"].map((w, i) => (
                <span key={`${group}-${i}`} className="inline-flex items-center gap-1.5 sm:gap-3">
                  <MinecraftBlockIcon className="h-2.5 w-2.5 text-primary sm:h-4 sm:w-4" />
                  {w}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
