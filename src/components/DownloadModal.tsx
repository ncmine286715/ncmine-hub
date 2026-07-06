import { useEffect, useState } from "react";
import { X, Download, Copy, Check, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { gaEvent } from "@/lib/gtag";
import { awardPoints, recordDownload } from "@/lib/firebase-services";
import { useAuth } from "@/hooks/use-auth";
import { TERABOX_TUTORIAL_YT_ID } from "@/lib/tutorial";
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
  /** Chamado quando o usuario de fato clica em baixar (nao ao so fechar o popup). */
  onDownloaded?: () => void;
};

export function DownloadModal({ open, url, title, onClose, addonId, onDownloaded }: Props) {
  const [count, setCount] = useState(2);
  const [inApp, setInApp] = useState<InAppKind>(null);
  const [platform, setPlatform] = useState<Platform>("other");
  const [copied, setCopied] = useState(false);
  const [bursting, setBursting] = useState(false);
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
  // TikTok libera o botao de baixar direto (so com aviso) — os demais
  // in-apps continuam so com "copiar link", pois o Terabox trava neles.
  const blockDownload = !!inApp && inApp !== "tiktok";

  const handleDownloadClick = async () => {
    trackEvent("terabox_open", { addonId, title, platform, inApp: inApp ?? "none" });
    gaEvent("download_click", { addon_id: addonId, title });
    setBursting(true);
    onDownloaded?.();
    if (user && addonId) {
      try {
        await recordDownload(user.uid, addonId);
        await awardPoints(user.uid, 5);
      } catch (error) {
        console.error("Error recording download:", error);
      }
    }
    setTimeout(onClose, 550);
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

      <div className="relative max-h-[92vh] w-full max-w-sm overflow-y-auto card-block bg-background p-4 animate-mc-rise sm:p-5">
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

        {blockDownload ? (
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
          <div className="pt-1">
            {inApp === "tiktok" && (
              <div className="mb-3 border-2 border-yellow-500 bg-yellow-500/10 p-2.5 text-center">
                <p className="text-[11px] font-extrabold uppercase leading-tight text-yellow-800">
                  ⚠️ Baixando pelo TikTok
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-yellow-800/90">
                  Se travar, toque nos ⋯ e abra no {browser}.
                </p>
              </div>
            )}

            {/* Video mostra como baixar — sem instrucao escrita */}
            <div className="mb-3 overflow-hidden border-2 border-foreground bg-muted">
              <div className="aspect-video w-full">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${TERABOX_TUTORIAL_YT_ID}?rel=0&modestbranding=1`}
                  title="Como baixar"
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="mb-2 h-2 w-full overflow-hidden border-2 border-foreground bg-[#3a3a3a]">
              <div
                className="h-full bg-gradient-to-r from-[#8aff3c] to-[#4fbf1c] transition-all duration-1000 ease-linear"
                style={{ width: `${waitProgress}%` }}
              />
            </div>
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
                <span className="font-pixel text-[11px]">Aguarde {count}s</span>
              )}
              {bursting && <BlockBurst />}
            </a>

            {inApp === "tiktok" && (
              <button
                type="button"
                onClick={copyLink}
                className="mt-2 flex w-full items-center justify-center gap-1 text-[10px] font-bold uppercase text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <><Check className="h-3 w-3" /> Link copiado</>
                ) : (
                  <><Copy className="h-3 w-3" /> Se não baixar, copiar link</>
                )}
              </button>
            )}
          </div>
        )}

        <p className="mt-3 text-center text-[10px] font-bold uppercase text-muted-foreground">
          🔒 Grátis e seguro
        </p>
      </div>
    </div>
  );
}

const BLOCK_COLORS = ["#6b4020", "#4a7c2c", "#8aff3c", "#e0b83c", "#4fd1e8", "#e05a3c"];

function BlockBurst() {
  const [particles] = useState(() =>
    Array.from({ length: 14 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
      const dist = 50 + Math.random() * 55;
      return {
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist - 16,
        rot: Math.random() * 320 - 160,
        color: BLOCK_COLORS[i % BLOCK_COLORS.length],
        delay: Math.random() * 70,
      };
    }),
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-visible">
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute h-2.5 w-2.5 animate-block-burst"
          style={{
            backgroundColor: p.color,
            boxShadow: "1px 1px 0 0 rgba(0,0,0,0.4)",
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
            "--rot": `${p.rot}deg`,
            animationDelay: `${p.delay}ms`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

