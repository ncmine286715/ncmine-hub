import { useEffect, useState } from "react";
import { X, ArrowRight, Heart, DollarSign, Play, HelpCircle } from "lucide-react";
import { DiscordIcon, InstagramIcon } from "@/components/icons/BrandIcons";
import { DISCORD_URL, INSTAGRAM_URL, LIVEPIX_URL, TERABOX_REFERRAL_URL, TERABOX_TUTORIAL_URL } from "@/lib/links";

type Variant = "discord" | "instagram";

type Props = {
  open: boolean;
  url: string;
  title: string;
  onClose: () => void;
};

export function DownloadModal({ open, url, title, onClose }: Props) {
  const [variant, setVariant] = useState<Variant>("discord");
  const [count, setCount] = useState(3);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!open) return;
    setVariant(Math.random() < 0.5 ? "discord" : "instagram");
    setCount(3);
    setShowTutorial(false);
    const t = setInterval(() => setCount((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [open]);

  if (!open) return null;

  const isDiscord = variant === "discord";
  const cta = isDiscord
    ? { href: DISCORD_URL, label: "Entrar no Discord", Icon: DiscordIcon, color: "bg-[#5865F2] text-white" }
    : { href: INSTAGRAM_URL, label: "Me seguir no Insta", Icon: InstagramIcon, color: "bg-foreground text-background" };

  // Tutorial overlay
  if (showTutorial) {
    return (
      <div className="fixed inset-0 z-[95] flex items-center justify-center bg-foreground/80 p-4">
        <div className="absolute inset-0" onClick={() => setShowTutorial(false)} />
        <div className="relative w-full max-w-3xl card-block animate-mc-rise overflow-hidden bg-background">
          <button
            onClick={() => setShowTutorial(false)}
            className="absolute right-2 top-2 z-10 border-2 border-foreground bg-background p-1.5 hover:bg-primary hover:text-primary-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="aspect-video w-full bg-black">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/fN4BennXjTY?si=Tz6C8QLpNW2d9xtz&autoplay=1"
              title="Tutorial Terabox"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-4">
            <h3 className="font-pixel text-sm">COMO BAIXAR DO TERABOX</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Siga o passo a passo para baixar qualquer addon do Terabox no celular ou computador.
            </p>
            <button
              onClick={() => setShowTutorial(false)}
              className="btn-block mt-3 w-full bg-primary text-primary-foreground !py-2.5 text-sm"
            >
              Entendi, voltar ao download
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-foreground/70 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-md card-block bg-background p-4 animate-mc-rise sm:p-8">
        {/* Mobile drag indicator */}
        <div className="mb-2 flex justify-center sm:hidden">
          <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
        </div>
        
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-2 top-2 border-2 border-foreground bg-background p-1 hover:bg-primary hover:text-primary-foreground sm:right-3 sm:top-3"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 inline-block bg-primary px-2 py-0.5 font-pixel text-[9px] text-primary-foreground animate-mc-shake sm:mb-4 sm:px-3 sm:py-1 sm:text-[10px]">
          ESPERA AI!
        </div>

        <h2 className="mb-1.5 text-xl font-black uppercase leading-tight sm:mb-2 sm:text-2xl">
          {isDiscord ? "Antes do download..." : "Curtiu o conteudo?"}
        </h2>
        <p className="mb-4 text-xs text-muted-foreground sm:mb-5 sm:text-sm">
          {isDiscord
            ? "Entra no Discord pra falar com a galera, pedir suporte e receber addons em primeira mao."
            : "Me segue no Instagram pra ver bastidores, novos addons e bizarrices do Minecraft em video curto."}
        </p>

        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn-block mb-2 w-full ${cta.color} animate-mc-pulse-orange !py-2.5 text-sm sm:mb-3 sm:!py-3`}
        >
          <cta.Icon className="h-5 w-5" />
          {cta.label}
        </a>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="btn-block w-full bg-background text-foreground !py-2.5 text-sm sm:!py-3"
        >
          {count > 0 ? (
            <span className="font-pixel text-[10px]">Aguarde {count}s</span>
          ) : (
            <>
              Ir para o download <ArrowRight className="h-4 w-4" />
            </>
          )}
        </a>

        <p className="mt-3 text-center text-[10px] text-muted-foreground sm:mt-4">
          Baixando: <span className="font-semibold text-foreground">{title}</span>
        </p>

        {/* Tutorial Terabox - always visible */}
        <div className="mt-4 border-t-2 border-dashed border-foreground/30 pt-3 sm:pt-4">
          <button
            onClick={() => setShowTutorial(true)}
            className="flex w-full items-center gap-3 rounded-none border-2 border-[#FF0000]/30 bg-[#FF0000]/5 p-2.5 text-left transition-colors hover:bg-[#FF0000]/10 sm:p-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-foreground bg-[#FF0000] text-white sm:h-10 sm:w-10">
              <Play className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="flex-1">
              <span className="flex items-center gap-1.5 font-pixel text-[8px] text-[#FF0000] sm:text-[9px]">
                <HelpCircle className="h-3 w-3" />
                NAO SABE BAIXAR?
              </span>
              <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
                Assista o tutorial de como baixar do Terabox
              </p>
            </div>
          </button>
        </div>

        {/* Support section - collapsible */}
        <details className="group mt-3 border-t-2 border-dashed border-foreground/30 pt-3 sm:mt-4 sm:pt-4">
          <summary className="flex cursor-pointer items-center justify-center gap-1 font-pixel text-[8px] text-muted-foreground sm:text-[9px]">
            BONUS — APOIAR O PROJETO
            <span className="transition-transform group-open:rotate-180">▼</span>
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={LIVEPIX_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-block w-full bg-[#00C16E] text-white !py-2 text-[10px] sm:!py-2.5 sm:text-xs"
            >
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Doar Pix
            </a>
            <a
              href={TERABOX_REFERRAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-block w-full bg-[#1A5CFF] text-white !py-2 text-[10px] sm:!py-2.5 sm:text-xs"
            >
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Ganhar $
            </a>
          </div>
          <p className="mt-2 text-center text-[9px] text-muted-foreground sm:text-[10px]">
            Vira webmaster do Terabox e ganhe divulgando addons.
          </p>
        </details>
      </div>
    </div>
  );
}
