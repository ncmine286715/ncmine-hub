import { useEffect, useState } from "react";
import { X, Download, Copy, Check, ExternalLink } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { gaEvent } from "@/lib/gtag";
import {
  detectInAppBrowser,
  detectPlatform,
  currentUrl,
  realBrowserName,
  buildExternalHref,
  type InAppKind,
  type Platform,
} from "@/lib/inAppBrowser";

type Props = {
  open: boolean;
  url: string;
  title: string;
  onClose: () => void;
  addonId?: string;
  onDownloaded?: () => void;
};

export function DownloadModal({ open, url, title, onClose, addonId, onDownloaded }: Props) {
  const [count, setCount] = useState(2);
  const [inApp, setInApp] = useState<InAppKind>(null);
  const [platform, setPlatform] = useState<Platform>("other");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setInApp(detectInAppBrowser());
    setPlatform(detectPlatform());
    setCount(2);
    const t = setInterval(() => setCount((c) => (c > 0 ? c - 1 : 0)), 1000);
    trackEvent("download_start", { addonId, title });
    gaEvent("download_start", { addon_id: addonId, title });
    return () => clearInterval(t);
  }, [open, addonId, title]);

  if (!open) return null;

  const ready = count <= 0;
  const blockDownload = !!inApp && inApp !== "tiktok";
  const browser = realBrowserName(platform);
  const externalHref = buildExternalHref(currentUrl(), platform);

  const handleDownload = () => {
    trackEvent("terabox_open", { addonId, title });
    gaEvent("download_click", { addon_id: addonId, title });
    onDownloaded?.();
    setTimeout(onClose, 400);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-foreground/60 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="card-block relative max-h-[90vh] w-full max-w-sm overflow-y-auto bg-background p-5 animate-rise">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="btn-ghost absolute right-2 top-2 !p-1.5"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pr-8">
          <span className="chip chip-primary">Pronto para baixar</span>
          <h2 className="mt-2 line-clamp-2 text-lg font-bold leading-tight">{title}</h2>
        </div>

        {blockDownload ? (
          <div className="mt-5 rounded-md border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-foreground">
              Abra no {browser} para baixar
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              O download não funciona dentro deste app. Toque em abrir ou copie o link.
            </p>
            <div className="mt-3 flex gap-2">
              <a
                href={externalHref}
                className="btn-block flex-1 bg-primary text-primary-foreground !py-2.5 !text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Abrir no {browser}
              </a>
              <button onClick={copyLink} className="btn-block bg-background !py-2.5 !text-xs">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <a
              href={ready ? url : undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={ready ? handleDownload : (e) => e.preventDefault()}
              aria-disabled={!ready}
              className={`btn-block w-full !py-4 !text-base font-bold tracking-wide transition-opacity ${
                ready ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground opacity-70 pointer-events-none"
              }`}
            >
              <Download className="h-5 w-5" />
              {ready ? "BAIXAR AGORA" : `Preparando… ${count}s`}
            </a>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              100% grátis · sem vírus · via Terabox
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
