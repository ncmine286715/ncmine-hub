import { useEffect, useState } from "react";
import { X, Download, Copy, Check, ArrowDown, Sparkles, Users } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { gaEvent } from "@/lib/gtag";
import { awardPoints, recordDownload } from "@/lib/firebase-services";
import { useAuth } from "@/hooks/use-auth";
import { PixelChest } from "@/components/PixelChest";
import {
  detectInAppBrowser,
  detectPlatform,
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
  addonId?: string;
};

export function DownloadModal({ open, url, title, onClose, addonId }: Props) {
  const [count, setCount] = useState(2);
  const [inApp, setInApp] = useState<InAppKind>(null);
  const [platform, setPlatform] = useState<Platform>("other");
  const [copied, setCopied] = useState(false);
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
    gaEvent("download_start", { addon_id: addonId, title });
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const browser = realBrowserName(platform);
  const ready = count <= 0;
  const waitProgress = Math.min(100, Math.round(((2 - count) / 2) * 100));

  const handleDownloadClick = async () => {
    trackEvent("terabox_open", { addonId, title, platform, inApp: inApp ?? "none" });
    gaEvent("download_click", { addon_id: addonId, title });
    if (user && addonId) {
      try {
        await recordDownload(user.uid, addonId);
        await awardPoints(user.uid, 5);
      } catch (error) {
        console.error("Error recording download:", error);
      }
    }
    onClose();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackEvent("inapp_escape", { kind: inApp, platform, method: "copy", source: "download_modal" });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-foreground/70 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm card-block bg-background p-4 animate-mc-rise sm:p-5">
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

        <div className="mb-4 pr-8">
          <span className="inline-flex items-center gap-1 border-2 border-foreground bg-primary px-2 py-0.5 font-pixel text-[9px] uppercase text-primary-foreground">
            <Sparkles className="h-3 w-3" /> Liberado
          </span>
          <p className="mt-1.5 line-clamp-2 text-sm font-black uppercase leading-tight">{title}</p>
        </div>

        {inApp ? (
          <div className="border-2 border-yellow-500 bg-yellow-500/10 p-3 text-center">
            <p className="text-[12px] font-extrabold uppercase leading-tight text-yellow-800">
              ⚠️ Abra no {browser}
            </p>
            <p className="mt-0.5 text-[10px] leading-snug text-yellow-800/90">
              Aqui no {inAppLabel(inApp)} o download trava.
            </p>
            <button
              onClick={copyLink}
              className="btn-block mt-3 w-full bg-yellow-600 text-white !py-2 text-[11px]"
            >
              {copied ? (
                <><Check className="h-4 w-4" /> Link copiado</>
              ) : (
                <><Copy className="h-4 w-4" /> Copiar link</>
              )}
            </button>
          </div>
        ) : (
          <div className="relative pt-2">
            {/* Baú do Minecraft: fechado enquanto libera, abre quando pronto */}
            <div className="mb-3 flex flex-col items-center gap-2">
              <PixelChest open={ready} />
              <div className="h-3 w-full max-w-[220px] overflow-hidden border-2 border-foreground bg-[#3a3a3a]">
                <div
                  className="h-full bg-gradient-to-r from-[#8aff3c] to-[#4fbf1c] transition-all duration-1000 ease-linear"
                  style={{ width: `${waitProgress}%` }}
                />
              </div>
              <p className="font-pixel text-[9px] uppercase text-muted-foreground">
                {ready ? "Baú aberto! 🎉" : `Abrindo o baú… ${count}s`}
              </p>
            </div>

            <div className="relative pt-4">
              {ready && (
                <>
                  {/* Setas piscando apontando pro botão */}
                  <ArrowDown className="pointer-events-none absolute -top-1 left-1/2 h-6 w-6 -translate-x-1/2 animate-bounce text-primary" />
                  <ArrowDown
                    className="pointer-events-none absolute -top-1 left-[25%] h-4 w-4 animate-bounce text-primary/60"
                    style={{ animationDelay: "150ms" }}
                  />
                  <ArrowDown
                    className="pointer-events-none absolute -top-1 left-[75%] h-4 w-4 animate-bounce text-primary/60"
                    style={{ animationDelay: "300ms" }}
                  />
                  {/* Null pointing */}
                  <div className="pointer-events-none absolute -left-1 -top-4 hidden sm:block">
                    <NullPointer />
                  </div>
                </>
              )}
              <a
                href={ready ? url : undefined}
                target="_blank"
                rel="noopener noreferrer"
                onClick={ready ? handleDownloadClick : (e) => e.preventDefault()}
                aria-disabled={!ready}
                className={`btn-block relative w-full !py-5 text-lg font-black ${
                  ready
                    ? "animate-mc-pulse-orange bg-primary text-primary-foreground"
                    : "cursor-wait bg-muted text-muted-foreground"
                }`}
              >
                {ready ? (
                  <><Download className="h-6 w-6" /> BAIXAR</>
                ) : (
                  <span className="font-pixel text-[11px]">Quase lá… {count}s</span>
                )}
              </a>
            </div>
          </div>
        )}

        <p className="mt-3 text-center text-[10px] font-bold uppercase text-muted-foreground">
          🔒 100% grátis · sem vírus
        </p>
        <p className="mt-1.5 flex items-center justify-center gap-1.5 text-center text-[9px] font-bold text-muted-foreground/80">
          <Users className="h-3 w-3 shrink-0" /> Criança jogando? Chame um adulto pra ajudar.
        </p>
      </div>
    </div>
  );
}

function NullPointer() {
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 8 8" className="h-8 w-8 drop-shadow-[2px_2px_0_var(--ink)]" shapeRendering="crispEdges">
        <rect width="8" height="8" fill="#0a0a0a" />
        <rect x="1" y="3" width="2" height="1" fill="#fff" />
        <rect x="5" y="3" width="2" height="1" fill="#fff" />
      </svg>
      <span className="mt-1 border-2 border-foreground bg-background px-1.5 py-0.5 font-pixel text-[7px] uppercase shadow-[2px_2px_0_0_var(--ink)]">
        toca aí!
      </span>
    </div>
  );
}