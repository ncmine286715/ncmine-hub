import { useEffect, useState } from "react";
import { X, ArrowRight, Heart, DollarSign } from "lucide-react";
import { DiscordIcon, InstagramIcon } from "@/components/icons/BrandIcons";
import { DISCORD_URL, INSTAGRAM_URL, LIVEPIX_URL, TERABOX_REFERRAL_URL } from "@/lib/links";

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
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/70 p-4 animate-mc-rise">
      <div className="relative w-full max-w-md card-block bg-background p-6 sm:p-8">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 border-2 border-foreground bg-background p-1 hover:bg-primary hover:text-primary-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 inline-block bg-primary px-3 py-1 font-pixel text-[10px] text-primary-foreground animate-mc-shake">
          ESPERA AÍ!
        </div>

        <h2 className="mb-2 text-2xl font-black uppercase leading-tight">
          {isDiscord ? "Antes do download…" : "Curtiu o conteúdo?"}
        </h2>
        <p className="mb-5 text-sm text-muted-foreground">
          {isDiscord
            ? "Entra no Discord pra falar com a galera, pedir suporte e receber addons em primeira mão. Leva 5 segundos."
            : "Me segue no Instagram pra ver bastidores, novos addons e bizarrices do Minecraft em vídeo curto."}
        </p>

        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn-block mb-3 w-full ${cta.color} animate-mc-pulse-orange`}
        >
          <cta.Icon className="h-5 w-5" />
          {cta.label}
        </a>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="btn-block w-full bg-background text-foreground"
        >
          {count > 0 ? (
            <span className="font-pixel text-[10px]">Aguarde {count}s</span>
          ) : (
            <>
              Ir para o download <ArrowRight className="h-4 w-4" />
            </>
          )}
        </a>

        <p className="mt-4 text-center text-[10px] text-muted-foreground">
          Baixando: <span className="font-semibold text-foreground">{title}</span>
        </p>

        <div className="mt-5 border-t-2 border-dashed border-foreground/30 pt-4">
          <p className="mb-3 text-center font-pixel text-[9px] text-muted-foreground">
            BÔNUS — SE QUISER APOIAR
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <a
              href={LIVEPIX_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-block w-full bg-[#00C16E] text-white text-xs"
            >
              <Heart className="h-4 w-4" />
              Doar um Pix
            </a>
            <a
              href={TERABOX_REFERRAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-block w-full bg-[#1A5CFF] text-white text-xs"
            >
              <DollarSign className="h-4 w-4" />
              Ganhar com Terabox
            </a>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Vira webmaster do Terabox e ganhe divulgando addons.
          </p>
        </div>
      </div>
    </div>
  );
}