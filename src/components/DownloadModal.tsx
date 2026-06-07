import { useEffect, useState } from "react";
import { X, ArrowRight, Heart, DollarSign, HelpCircle } from "lucide-react";
import { DiscordIcon, InstagramIcon } from "@/components/icons/BrandIcons";
import { DISCORD_URL, INSTAGRAM_URL, LIVEPIX_URL, TERABOX_REFERRAL_URL } from "@/lib/links";
import { TeraboxTutorial } from "@/components/TeraboxTutorial";
import { InstallGuide } from "@/components/InstallGuide";
import { trackEvent } from "@/lib/analytics";
import { awardPoints } from "@/lib/firebase-services";

type Variant = "discord" | "instagram";

type Props = {
  open: boolean;
  url: string;
  title: string;
  onClose: () => void;
};

import { useAuth } from "@/hooks/use-auth";
import { recordDownload } from "@/lib/firebase-services";

export function DownloadModal({ open, url, title, onClose, addonId }: Props & { addonId?: string }) {
  const [variant, setVariant] = useState<Variant>("discord");
  const [count, setCount] = useState(3);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const { user } = useAuth();

  const handleDownloadClick = async () => {
    // Sempre rastreia (logado ou anônimo)
    trackEvent("download_start", { addonId, title });
    if (user && addonId) {
      try {
        await recordDownload(user.uid, addonId);
        await awardPoints(user.uid, 5); // +5 XP por download
      } catch (error) {
        console.error("Error recording download:", error);
      }
    }
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    setVariant(Math.random() < 0.5 ? "discord" : "instagram");
    setCount(3);
    const t = setInterval(() => setCount((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [open]);

  if (!open) return null;

  const isDiscord = variant === "discord";
  const cta = isDiscord
    ? { href: DISCORD_URL, label: "Entrar no Discord", Icon: DiscordIcon, color: "bg-[#5865F2] text-white" }
    : { href: INSTAGRAM_URL, label: "Me seguir no Insta", Icon: InstagramIcon, color: "bg-foreground text-background" };

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
          onClick={handleDownloadClick}
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

        {/* Install Guide Button */}
        <button
          onClick={() => setShowInstallGuide(!showInstallGuide)}
          className="mt-3 w-full btn-block bg-muted/50 text-foreground !py-2 text-[10px] flex items-center justify-center gap-1"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          {showInstallGuide ? 'Fechar guia de instalacao' : 'Como instalar este addon?'}
        </button>

        {showInstallGuide && (
          <div className="mt-2">
            <InstallGuide addonTitle={title} onClose={() => setShowInstallGuide(false)} />
          </div>
        )}

        {/* Tutorial Terabox - universal em todo download */}
        {!showInstallGuide && (
          <div className="mt-3 sm:mt-4">
            <TeraboxTutorial compact />
          </div>
        )}

        {/* Support section - collapsible on mobile */}
        <details className="group mt-4 border-t-2 border-dashed border-foreground/30 pt-3 sm:mt-5 sm:pt-4">
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
