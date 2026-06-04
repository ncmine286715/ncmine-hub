import { Sparkles, ArrowDown, ShieldCheck, Zap, TrendingUp } from "lucide-react";
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
          <div className="hidden sm:flex items-center gap-3 mr-4 text-[9px] font-black uppercase text-muted-foreground">
             <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-green-500" /> Links Verificados</span>
             <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-500" /> Download Imediato</span>
          </div>
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
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="hover:text-primary">Discord</a>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-primary">YouTube</a>
          </nav>
        </div>
      </div>

      {/* Compact Mobile Hero */}
      <section className="relative py-3 sm:py-12 overflow-hidden">
        <div aria-hidden className="absolute -left-4 top-2 hidden h-14 w-14 rotate-12 border-2 border-foreground bg-primary shadow-[6px_6px_0_0_var(--ink)] md:block" />
        <div aria-hidden className="absolute -right-2 bottom-2 hidden h-10 w-10 -rotate-6 border-2 border-foreground bg-foreground md:block" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-4 flex flex-col items-center gap-2 sm:mb-6">
            <span className="inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-3 py-1 font-pixel text-[8px] uppercase shadow-[3px_3px_0_0_var(--ink)] sm:text-[10px]">
              <Sparkles className="h-3 w-3 text-primary" />
              {addonsCount}+ Addons Bedrock Disponíveis
            </span>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-primary animate-pulse">
               <TrendingUp className="h-3 w-3" /> 2.4k pessoas online agora
            </div>
          </div>

          {/* Title - more compact on mobile */}
          <h1 className="text-3xl font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl lg:text-8xl">
            <span className="block text-foreground drop-shadow-[4px_4px_0_rgba(0,0,0,0.1)]">{CREATOR_NAME}</span>
            <span className="mt-2 inline-block bg-primary px-3 py-1 text-primary-foreground shadow-[6px_6px_0_0_var(--ink)] rotate-[-1deg]">
              DOWNLOADS GRATIS
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[12px] font-bold leading-tight text-muted-foreground sm:mt-8 sm:text-lg">
            A maior biblioteca de addons apelações do Brasil. <br className="hidden sm:block" />
            Clique no botão abaixo para escolher seu pack e começar.
          </p>

          {/* Single primary CTA: drives clicks to addons (download) */}
          <div id="links" className="mt-8 flex justify-center sm:mt-12">
            <a
              href="#addons"
              className="btn-block bg-primary text-primary-foreground !px-12 !py-5 text-sm sm:!px-20 sm:!py-6 sm:text-xl font-black uppercase tracking-[0.2em] shadow-[8px_8px_0_0_var(--ink)] hover:translate-y-[-4px] hover:shadow-[12px_12px_0_0_var(--ink)] active:translate-y-0 active:shadow-none transition-all animate-mc-pulse-orange"
            >
              <ArrowDown className="h-5 w-5 sm:h-7 sm:w-7" />
              BAIXAR AGORA
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
