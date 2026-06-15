import { useEffect, useState } from "react";
import { X, Heart, ExternalLink, Download, ShieldCheck, Zap, Play, Users } from "lucide-react";
import { DiscordIcon, InstagramIcon, YouTubeIcon } from "@/components/icons/BrandIcons";
import { DISCORD_URL, INSTAGRAM_URL, YOUTUBE_URL, LIVEPIX_URL } from "@/lib/links";
import { TERABOX_TUTORIAL_YT_ID } from "@/lib/tutorial";
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
  const [videoOpen, setVideoOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!open) return;
    const k = detectInAppBrowser();
    const p = detectPlatform();
    setInApp(k);
    setPlatform(p);
    setCount(2);
    setVideoOpen(false);
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

  const openVideo = () => {
    setVideoOpen((v) => !v);
    if (!videoOpen) trackEvent("tutorial_video_open", { addonId, source: "download_modal" });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-foreground/70 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative max-h-[94vh] w-full max-w-sm overflow-y-auto card-block bg-background p-4 animate-mc-rise sm:p-5">
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

        {/* Título enxuto */}
        <h2 className="mb-0.5 pr-8 text-lg font-black uppercase leading-tight sm:text-xl">
          Baixar grátis
        </h2>
        <p className="mb-3 line-clamp-1 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{title}</span>
        </p>

        {inApp ? (
          /* ===== NAVEGADOR INTERNO: aviso pequeno + escape ===== */
          <>
            <div className="mb-3 flex items-start gap-2 border-2 border-yellow-500 bg-yellow-500/10 p-2.5">
              <span className="text-base leading-none">⚠️</span>
              <p className="text-[11px] font-bold leading-snug text-yellow-800">
                Abra no {browser} pra baixar — aqui no {inAppLabel(inApp)} não funciona.
              </p>
            </div>
            <a
              href={buildExternalHref(currentUrl(), platform)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleEscape}
              className="btn-block w-full animate-mc-pulse-orange bg-primary !py-4 text-base font-black text-primary-foreground"
            >
              <ExternalLink className="h-5 w-5" /> Abrir no {browser}
            </a>
          </>
        ) : (
          /* ===== NAVEGADOR REAL: download é o herói ===== */
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
                <Download className="h-6 w-6" /> Baixar agora
              </>
            ) : (
              <span className="font-pixel text-[11px]">Liberando… {count}s</span>
            )}
          </a>
        )}

        {/* Badges de confiança — curtos, com prova social */}
        <div className="mt-2 flex items-center justify-center gap-3 text-[10px] font-bold uppercase text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-green-500" /> Grátis
          </span>
          <span className="inline-flex items-center gap-1">
            <Zap className="h-3 w-3 text-yellow-500" /> Sem vírus
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3 text-primary" /> +10 mil baixaram
          </span>
        </div>

        {/* Tutorial em VÍDEO (pop-up) — sem paredão de texto */}
        <button
          type="button"
          onClick={openVideo}
          aria-expanded={videoOpen}
          className="btn-block mt-3 w-full bg-foreground text-background !py-2.5 text-xs"
        >
          <Play className="h-4 w-4 text-[#FF0000]" />
          {videoOpen ? "Fechar vídeo" : "Não sabe instalar? Vídeo de 40s"}
        </button>
        {videoOpen && (
          <div className="mt-2 aspect-video w-full border-2 border-foreground bg-muted">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${TERABOX_TUTORIAL_YT_ID}?rel=0&autoplay=1`}
              title="Como instalar"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Seguir + Apoiar — rodapé minúsculo, não rouba o foco */}
        <div className="mt-3 flex items-center justify-center gap-3 border-t-2 border-dashed border-foreground/20 pt-2.5 text-muted-foreground">
          <span className="text-[9px] font-bold uppercase">Seguir:</span>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
            onClick={() => trackEvent("external_click", { to: "discord", source: "download_modal" })}
            className="hover:text-[#5865F2]"
          >
            <DiscordIcon className="h-4 w-4" />
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            onClick={() => trackEvent("external_click", { to: "instagram", source: "download_modal" })}
            className="hover:text-foreground"
          >
            <InstagramIcon className="h-4 w-4" />
          </a>
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            onClick={() => trackEvent("external_click", { to: "youtube", source: "download_modal" })}
            className="hover:text-[#FF0000]"
          >
            <YouTubeIcon className="h-4 w-4" />
          </a>
          <span className="text-foreground/20">·</span>
          <a
            href={LIVEPIX_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("external_click", { to: "livepix", source: "download_modal" })}
            className="inline-flex items-center gap-1 text-[9px] font-bold uppercase hover:text-[#00C16E]"
          >
            <Heart className="h-3 w-3" /> Apoiar
          </a>
        </div>
      </div>
    </div>
  );
}
