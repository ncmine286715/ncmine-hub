import { useState, useEffect } from "react";
import { Sparkles, ArrowDown, ShieldCheck, Zap, TrendingUp, Star, Download, Users, Clock } from "lucide-react";
import { DiscordIcon, YouTubeIcon, MinecraftBlockIcon } from "@/components/icons/BrandIcons";
import { DISCORD_URL, YOUTUBE_URL, CREATOR_NAME } from "@/lib/links";
import { useAuth } from "@/hooks/use-auth";

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.floor(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count.toLocaleString("pt-BR")}</>;
}

export function Hero({ addonsCount }: { addonsCount: number }) {
  const { user } = useAuth();
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="relative mx-auto w-full max-w-7xl px-3 pt-2 sm:px-4 sm:pt-8">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b-2 border-foreground pb-2 sm:pb-3">
        <div className="flex items-center gap-2">
          <MinecraftBlockIcon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
          <span className="font-pixel text-[10px] sm:text-xs">NCMINE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-3 mr-4 text-[9px] font-black uppercase text-muted-foreground sm:flex">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-green-500" /> Links Verificados</span>
            <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-500" /> Download Imediato</span>
          </div>
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" aria-label="Discord" className="inline-flex h-8 w-8 items-center justify-center border-2 border-foreground bg-[#5865F2] text-white sm:hidden">
            <DiscordIcon className="h-4 w-4" />
          </a>
          <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="inline-flex h-8 w-8 items-center justify-center border-2 border-foreground bg-[#FF0000] text-white sm:hidden">
            <YouTubeIcon className="h-4 w-4" />
          </a>
          <nav className="hidden gap-4 text-xs font-bold uppercase sm:flex">
            <a href="#addons" className="hover:text-primary">Addons</a>
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="hover:text-primary">Discord</a>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-primary">YouTube</a>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-4 sm:py-14 overflow-hidden">
        <div aria-hidden className="absolute -left-4 top-2 hidden h-14 w-14 rotate-12 border-2 border-foreground bg-primary shadow-[6px_6px_0_0_var(--ink)] md:block" />
        <div aria-hidden className="absolute -right-2 bottom-2 hidden h-10 w-10 -rotate-6 border-2 border-foreground bg-foreground md:block" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Social proof strip */}
          <div className="mb-3 sm:mb-5 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <span className="inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-3 py-1 font-pixel text-[8px] uppercase shadow-[3px_3px_0_0_var(--ink)] sm:text-[10px]">
              <Sparkles className="h-3 w-3 text-primary" />
              <AnimatedCounter target={addonsCount} />+ Addons Gratis
            </span>
            <span className="inline-flex items-center gap-1.5 border-2 border-green-500 bg-green-50 px-3 py-1 font-pixel text-[8px] uppercase text-green-700 sm:text-[10px]">
              <Users className="h-3 w-3" />
              <AnimatedCounter target={2400} />+ Mineradores
            </span>
          </div>

          {/* Live indicator */}
          <div className="mb-4 flex items-center justify-center gap-2 text-[9px] font-black uppercase text-primary sm:text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <TrendingUp className="h-3 w-3" /> 47 pessoas baixando agora
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl lg:text-8xl">
            <span className="block text-foreground drop-shadow-[4px_4px_0_rgba(0,0,0,0.1)]">{CREATOR_NAME}</span>
            <span className="mt-2 inline-block bg-primary px-3 py-1 text-primary-foreground shadow-[6px_6px_0_0_var(--ink)] rotate-[-1deg]">
              ADDONS GRATIS
            </span>
          </h1>

          {/* Value proposition */}
          <p className="mx-auto mt-5 max-w-xl text-[13px] font-bold leading-snug text-foreground/80 sm:mt-8 sm:text-lg">
            A maior biblioteca de addons de Minecraft Bedrock do Brasil.
            <br className="hidden sm:block" />
            <span className="text-primary">Escolha seu addon e baixe em 10 segundos.</span>
          </p>

          {/* Trust badges mobile */}
          <div className="mt-3 flex items-center justify-center gap-3 sm:hidden">
            <span className="flex items-center gap-1 text-[8px] font-black uppercase text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-green-500" /> Seguro
            </span>
            <span className="flex items-center gap-1 text-[8px] font-black uppercase text-muted-foreground">
              <Zap className="h-3 w-3 text-yellow-500" /> Rapido
            </span>
            <span className="flex items-center gap-1 text-[8px] font-black uppercase text-muted-foreground">
              <Star className="h-3 w-3 text-primary fill-primary" /> Curado
            </span>
          </div>

          {/* CTA */}
          <div id="links" className="mt-6 flex flex-col items-center gap-3 sm:mt-10">
            <a
              href="#addons"
              className={`btn-block bg-primary text-primary-foreground !px-14 !py-5 text-base sm:!px-20 sm:!py-7 sm:text-xl font-black uppercase tracking-[0.15em] shadow-[8px_8px_0_0_var(--ink)] hover:translate-y-[-4px] hover:shadow-[12px_12px_0_0_var(--ink)] active:translate-y-0 active:shadow-none transition-all ${pulse ? "animate-mc-pulse-orange" : ""}`}
            >
              <Download className="h-5 w-5 sm:h-7 sm:w-7" />
              VER ADDONS E BAIXAR
            </a>
            <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1 sm:text-xs">
              <Clock className="h-3 w-3" /> 100% gratis - sem cadastro obrigatorio
            </span>
          </div>

          {/* Urgency - recent downloads */}
          {!user && (
            <div className="mt-6 border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-3 sm:mt-8 sm:inline-flex sm:gap-2">
              <p className="text-[10px] font-bold uppercase text-foreground/70 sm:text-xs">
                <Star className="inline h-3 w-3 text-primary fill-primary mr-1" />
                Crie uma conta gratis para salvar favoritos, ganhar XP e receber alertas de novos addons
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Marquee */}
      <div className="relative -mx-3 overflow-hidden border-y-2 border-foreground bg-foreground text-background sm:-mx-4">
        <div className="flex w-max animate-mc-scroll-x gap-4 whitespace-nowrap py-1.5 font-pixel text-[8px] sm:gap-8 sm:py-3 sm:text-xs">
          {Array.from({ length: 2 }).map((_, group) => (
            <div key={group} className="flex items-center gap-4 px-2 sm:gap-8 sm:px-4">
              {["BEDROCK", "ADDONS", "TEXTURAS", "MOBS", "MAPAS", "NCMINE", "GRATIS", "CURADO"].map((w, i) => (
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
