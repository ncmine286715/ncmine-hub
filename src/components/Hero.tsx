import { Sparkles, Heart } from "lucide-react";
import {
  DiscordIcon,
  InstagramIcon,
  YouTubeIcon,
  TikTokIcon,
  MinecraftBlockIcon,
} from "@/components/icons/BrandIcons";
import {
  DISCORD_URL,
  INSTAGRAM_URL,
  YOUTUBE_URL,
  TIKTOK_URL,
  ADDONS_HUB_URL,
  CREATOR_NAME,
  DONATE_URL,
} from "@/lib/links";

export function Hero({ addonsCount }: { addonsCount: number }) {
  return (
    <header className="relative mx-auto w-full max-w-7xl px-4 pt-3 sm:pt-8">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b-2 border-foreground pb-3">
        <div className="flex items-center gap-2">
          <MinecraftBlockIcon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
          <span className="font-pixel text-[10px] sm:text-xs">NCMINE</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
            className="inline-flex h-8 w-8 items-center justify-center border-2 border-foreground bg-[#5865F2] text-white sm:hidden"
          >
            <DiscordIcon className="h-4 w-4" />
          </a>
          <nav className="hidden gap-4 text-xs font-bold uppercase sm:flex">
            <a href="#addons" className="hover:text-primary">
              Addons
            </a>
            <a href="#links" className="hover:text-primary">
              Links
            </a>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              YouTube
            </a>
          </nav>
        </div>
      </div>

      {/* Compact hero — text + CTAs only, no Null skin */}
      <section className="relative py-4 sm:py-10">
        <div
          aria-hidden
          className="absolute -left-4 top-2 hidden h-14 w-14 rotate-12 border-2 border-foreground bg-primary shadow-[6px_6px_0_0_var(--ink)] md:block"
        />
        <div
          aria-hidden
          className="absolute -right-2 bottom-2 hidden h-10 w-10 -rotate-6 border-2 border-foreground bg-foreground md:block"
        />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <span className="mb-3 inline-flex items-center gap-2 border-2 border-foreground bg-background px-2.5 py-1 font-pixel text-[9px] uppercase shadow-[3px_3px_0_0_var(--ink)] sm:text-[10px]">
            <Sparkles className="h-3 w-3 text-primary" />
            {addonsCount}+ Addons Minecraft Bedrock
          </span>

          <h1 className="text-[2.5rem] font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl lg:text-8xl">
            <span className="block">{CREATOR_NAME}</span>
            <span className="mt-1 inline-block bg-primary px-3 text-primary-foreground shadow-[4px_4px_0_0_var(--ink)]">
              ADDONS APELÕES
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-xs font-medium text-muted-foreground sm:text-base">
            Os melhores add-ons curados, testados e prontos pra baixar.
          </p>

          {/* Primary CTAs */}
          <div id="links" className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <a
              href={ADDONS_HUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-block bg-primary text-primary-foreground !px-5 !py-4 text-sm hover:scale-105 active:scale-95 sm:text-base animate-mc-pulse-orange"
            >
              <MinecraftBlockIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              Ver Addons Apelões
            </a>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-block bg-[#5865F2] text-white !px-5 !py-4 text-sm hover:scale-105 active:scale-95 sm:text-base"
            >
              <DiscordIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              Entrar no Discord
            </a>
          </div>

          {/* Socials & Support */}
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-6">
            <a
              href={DONATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-block bg-red-500 text-white !px-4 !py-2 text-[10px] sm:text-xs hover:bg-red-600"
            >
              <Heart className="h-4 w-4 fill-current" /> Apoie o Canal
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="btn-block bg-foreground text-background !px-3 !py-2 text-[10px] sm:text-xs"
            >
              <InstagramIcon className="h-3.5 w-3.5" /> Insta
            </a>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="btn-block bg-[#FF0000] text-white !px-2.5 !py-1.5 text-[10px] sm:!px-3 sm:!py-2 sm:text-xs"
            >
              <YouTubeIcon className="h-3.5 w-3.5" /> YT
            </a>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="btn-block bg-background !px-2.5 !py-1.5 text-[10px] sm:!px-3 sm:!py-2 sm:text-xs"
            >
              <TikTokIcon className="h-3.5 w-3.5" /> TikTok
            </a>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="relative -mx-4 overflow-hidden border-y-2 border-foreground bg-foreground text-background">
        <div className="flex w-max animate-mc-scroll-x gap-6 whitespace-nowrap py-2 font-pixel text-[10px] sm:gap-8 sm:py-3 sm:text-xs">
          {Array.from({ length: 2 }).map((_, group) => (
            <div key={group} className="flex items-center gap-6 px-3 sm:gap-8 sm:px-4">
              {[
                "BEDROCK",
                "ADDONS",
                "TEXTURE PACKS",
                "MOBS",
                "SOBREVIVÊNCIA",
                "MAPAS",
                "NCMINE ★",
              ].map((w, i) => (
                <span key={`${group}-${i}`} className="inline-flex items-center gap-2 sm:gap-3">
                  <MinecraftBlockIcon className="h-3 w-3 text-primary sm:h-4 sm:w-4" />
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
