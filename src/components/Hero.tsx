import { ArrowDown, Sparkles } from "lucide-react";
import nullSkin from "@/assets/null-skin.png";
import { DiscordIcon, InstagramIcon, YouTubeIcon, TikTokIcon, MinecraftBlockIcon } from "@/components/icons/BrandIcons";
import { DISCORD_URL, INSTAGRAM_URL, YOUTUBE_URL, TIKTOK_URL, CREATOR_NAME } from "@/lib/links";

export function Hero({ addonsCount }: { addonsCount: number }) {
  return (
    <header className="relative mx-auto w-full max-w-7xl px-4 pt-10 sm:pt-16">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b-2 border-foreground pb-4">
        <div className="flex items-center gap-2">
          <MinecraftBlockIcon className="h-6 w-6 text-primary" />
          <span className="font-pixel text-xs">NCMINE</span>
        </div>
        <nav className="hidden gap-4 text-xs font-bold uppercase sm:flex">
          <a href="#addons" className="hover:text-primary">Addons</a>
          <a href="#links" className="hover:text-primary">Links</a>
          <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-primary">YouTube</a>
        </nav>
      </div>

      {/* Hero */}
      <section className="relative grid items-center gap-8 py-12 sm:py-20 md:grid-cols-2">
        {/* Decorative orange block */}
        <div aria-hidden className="absolute -left-6 top-1/3 hidden h-24 w-24 rotate-12 border-2 border-foreground bg-primary shadow-[6px_6px_0_0_var(--ink)] md:block" />
        <div aria-hidden className="absolute right-10 bottom-10 hidden h-16 w-16 -rotate-6 border-2 border-foreground bg-foreground md:block" />

        <div className="relative z-10">
          <span className="mb-4 inline-flex items-center gap-2 border-2 border-foreground bg-background px-3 py-1 font-pixel text-[10px] uppercase shadow-[3px_3px_0_0_var(--ink)]">
            <Sparkles className="h-3 w-3 text-primary" />
            Criador de Conteúdo Minecraft
          </span>

          <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
            <span className="block">{CREATOR_NAME}</span>
            <span className="mt-2 block bg-primary px-2 text-primary-foreground sm:inline-block">
              ADDONS
            </span>
            <span className="block">Selecionados.</span>
          </h1>

          <p className="mt-5 max-w-md text-base text-muted-foreground">
            O hub oficial dos melhores add-ons de Minecraft Bedrock. Curados, testados
            e prontos pra baixar. {addonsCount}+ disponíveis agora.
          </p>

          {/* Primary CTAs — highlighted */}
          <div id="links" className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-block bg-[#5865F2] text-white animate-mc-pulse-orange"
            >
              <DiscordIcon className="h-5 w-5" />
              Entrar no Discord
            </a>
            <a
              href="#addons"
              className="btn-block bg-primary text-primary-foreground"
            >
              <MinecraftBlockIcon className="h-5 w-5" />
              Addons Apelões
            </a>
          </div>

          {/* Secondary socials */}
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-block bg-foreground text-background"
            >
              <InstagramIcon className="h-4 w-4" /> Instagram
            </a>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-block bg-[#FF0000] text-white"
            >
              <YouTubeIcon className="h-4 w-4" /> YouTube
            </a>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-block bg-background"
            >
              <TikTokIcon className="h-4 w-4" /> TikTok
            </a>
          </div>
        </div>

        {/* Null skin */}
        <div className="relative mx-auto flex w-full max-w-md items-center justify-center">
          <div aria-hidden className="absolute inset-x-6 bottom-4 h-6 rounded-full bg-foreground/30 blur-md" />
          <div className="relative animate-mc-bob">
            <div aria-hidden className="absolute inset-0 -z-10 translate-x-3 translate-y-3 bg-primary" />
            <img
              src={nullSkin}
              alt={`${CREATOR_NAME} — skin do Null`}
              width={768}
              height={1024}
              className="pixelated relative block w-full select-none border-2 border-foreground bg-background"
              draggable={false}
            />
            <span className="absolute -right-2 -top-2 border-2 border-foreground bg-primary px-2 py-0.5 font-pixel text-[10px] uppercase text-primary-foreground rotate-6 shadow-[3px_3px_0_0_var(--ink)]">
              NULL
            </span>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="relative -mx-4 overflow-hidden border-y-2 border-foreground bg-foreground text-background">
        <div className="flex w-max animate-mc-scroll-x gap-8 whitespace-nowrap py-3 font-pixel text-xs">
          {Array.from({ length: 2 }).map((_, group) => (
            <div key={group} className="flex items-center gap-8 px-4">
              {["BEDROCK", "ADDONS", "TEXTURE PACKS", "MOBS", "SOBREVIVÊNCIA", "MAPAS", "NCMINE", "NULL ★"].map((w, i) => (
                <span key={`${group}-${i}`} className="inline-flex items-center gap-3">
                  <MinecraftBlockIcon className="h-4 w-4 text-primary" />
                  {w}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <a href="#addons" className="mx-auto mt-8 flex w-fit items-center gap-2 text-xs font-bold uppercase text-muted-foreground hover:text-foreground">
        Role pra ver os addons <ArrowDown className="h-3 w-3 animate-mc-bob" />
      </a>
    </header>
  );
}