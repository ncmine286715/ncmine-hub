import { useEffect, useState } from "react";
import { X, Heart, ExternalLink, Download, ShieldCheck, Zap } from "lucide-react";
import { DiscordIcon, InstagramIcon, YouTubeIcon } from "@/components/icons/BrandIcons";
import { DISCORD_URL, INSTAGRAM_URL, YOUTUBE_URL, LIVEPIX_URL } from "@/lib/links";
import { TeraboxSteps } from "@/components/TeraboxSteps";
import { trackEvent } from "@/lib/analytics";
import { awardPoints, recordDownload } from "@/lib/firebase-services";
import { useAuth } from "@/hooks/use-auth";
import {
  detectInAppBrowser,
  detectPlatform,
  buildExternalHref,
  currentUrl,
  inAppLabel,
  realBrowserName,
  type InAppKind,
  type Platform,
} from "@/lib/inAppBrowser";

type Props = {
  open: boolean;
  url: string;
  title: string;
  onClose: () => void;
};

export function DownloadModal({
  open,
  url,
  title,
  onClose,
  addonId,
}: Props & { addonId?: string }) {
  const [count, setCount] = useState(2);
  const [inApp, setInApp] = useState<InAppKind>(null);
  const [platform, setPlatform] = useState<Platform>("other");
  const { user } = useAuth();

  useEffect(() => {
    if (!open) return;
    const k = detectInAppBrowser();
    const p = detectPlatform();
    setInApp(k);
    setPlatform(p);
    setCount(2);
    const t = setInterval(() => setCount((c) => (c > 0 ? c - 1 : 0)), 1000);
    trackEvent("download_start", { addonId, title, inApp: k ?? "none", platform: p });
    return () => clearInterval(t);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const browser = realBrowserName(platform);
  const ready = count <= 0;

  const handleDownloadClick = async () => {
    trackEvent("terabox_open", { addonId, title, platform, inApp: inApp ?? "none" });
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

  const handleEscape = () => {
    trackEvent("inapp_escape", {
      kind: inApp,
      platform,
      method: "intent",
      source: "download_modal",
    });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-foreground/70 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative max-h-[94vh] w-full max-w-md overflow-y-auto card-block bg-background p-4 animate-mc-rise sm:p-6">
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

        {/* Título */}
        <div className="mb-1 inline-flex items-center gap-1.5 bg-primary px-2 py-0.5 font-pixel text-[9px] text-primary-foreground sm:text-[10px]">
          <Download className="h-3 w-3" /> QUASE LÁ
        </div>
        <h2 className="mb-1 text-lg font-black uppercase leading-tight sm:text-2xl">
          Baixar addon
        </h2>
        <p className="mb-3 line-clamp-1 text-xs text-muted-foreground sm:mb-4">
          <span className="font-semibold text-foreground">{title}</span>
        </p>

        {inApp ? (
          /* ===== EM NAVEGADOR INTERNO: bloqueio + escape ===== */
          <div className="mb-3 border-2 border-yellow-500 bg-yellow-500/10 p-3">
            <p className="text-[13px] font-extrabold uppercase leading-tight text-yellow-800">
              O download não funciona no {inAppLabel(inApp)}
            </p>
            <p className="mt-1 text-[11px] leading-snug text-yellow-800/90">
              Você está no navegador interno do app. Toque abaixo para abrir no {browser} — aí o
              download e a conta do Terabox funcionam normalmente.
            </p>
            <a
              href={buildExternalHref(currentUrl(), platform)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleEscape}
              className="btn-block mt-3 w-full animate-mc-pulse-orange bg-primary !py-3.5 text-sm font-black text-primary-foreground"
            >
              <ExternalLink className="h-5 w-5" /> Abrir no {browser} e baixar
            </a>
          </div>
        ) : (
          /* ===== NAVEGADOR REAL: download é o herói ===== */
          <>
            <a
              href={ready ? url : undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={ready ? handleDownloadClick : (e) => e.preventDefault()}
              aria-disabled={!ready}
              className={`btn-block w-full !py-4 text-base font-black ${
                ready
                  ? "animate-mc-pulse-orange bg-primary text-primary-foreground"
                  : "cursor-wait bg-muted text-muted-foreground"
              }`}
            >
              {ready ? (
                <>
                  <Download className="h-6 w-6" /> Baixar no Terabox
                </>
              ) : (
                <span className="font-pixel text-[11px]">Preparando download… {count}s</span>
              )}
            </a>
            <div className="mt-2 flex items-center justify-center gap-3 text-[10px] font-bold uppercase text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-green-500" /> 100% grátis
              </span>
              <span className="inline-flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-500" /> Abre no Terabox
              </span>
            </div>
          </>
        )}

        {/* Tutorial sempre visível */}
        <div className="mt-4">
          <TeraboxSteps compact showVideo />
        </div>

        {/* Social — secundário, não bloqueia */}
        <div className="mt-4 border-t-2 border-dashed border-foreground/20 pt-3">
          <p className="mb-2 text-center text-[10px] font-bold uppercase text-muted-foreground">
            Segue pra não perder os próximos addons
          </p>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("external_click", { to: "discord", source: "download_modal" })
              }
              className="btn-block bg-[#5865F2] text-white !px-1 !py-2 text-[10px]"
            >
              <DiscordIcon className="h-4 w-4" /> Discord
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("external_click", { to: "instagram", source: "download_modal" })
              }
              className="btn-block bg-foreground text-background !px-1 !py-2 text-[10px]"
            >
              <InstagramIcon className="h-4 w-4" /> Insta
            </a>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("external_click", { to: "youtube", source: "download_modal" })
              }
              className="btn-block bg-[#FF0000] text-white !px-1 !py-2 text-[10px]"
            >
              <YouTubeIcon className="h-4 w-4" /> YouTube
            </a>
          </div>
        </div>

        {/* Apoiar — opcional, recolhido */}
        <details className="group mt-3 border-t-2 border-dashed border-foreground/20 pt-3">
          <summary className="flex cursor-pointer items-center justify-center gap-1 font-pixel text-[8px] text-muted-foreground sm:text-[9px]">
            APOIAR O PROJETO (OPCIONAL)
            <span className="transition-transform group-open:rotate-180">▼</span>
          </summary>
          <a
            href={LIVEPIX_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("external_click", { to: "livepix", source: "download_modal" })
            }
            className="btn-block mt-3 w-full bg-[#00C16E] text-white !py-2.5 text-xs"
          >
            <Heart className="h-4 w-4" /> Doar um Pix pro projeto
          </a>
          <p className="mt-2 text-center text-[9px] text-muted-foreground">
            Os addons são e sempre serão grátis. Doação é só carinho. ❤️
          </p>
        </details>
      </div>
    </div>
  );
}
