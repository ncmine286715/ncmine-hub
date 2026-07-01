import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import type { Addon } from "@/components/AddonCard";
import { trackEvent } from "@/lib/analytics";

const DISMISS_KEY = "ncmine:nudge-dismissed";

type Props = {
  addon: Addon;
  onDownload: (a: Addon) => void;
  delayMs?: number;
};

export function NudgePopup({ addon, onDownload, delayMs = 8000 }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {}

    let shown = false;
    const timer = window.setTimeout(() => {
      shown = true;
      setVisible(true);
      trackEvent("nudge_show", { addonId: addon.id });
    }, delayMs);

    // Cancel if user clicks anything meaningful before the delay
    const cancel = () => {
      if (!shown) {
        clearTimeout(timer);
      }
    };
    document.addEventListener("click", cancel, { once: true });

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", cancel);
    };
  }, [addon.id, delayMs]);

  const dismiss = () => {
    setVisible(false);
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch {}
    trackEvent("nudge_dismiss", { addonId: addon.id });
  };

  const handleDownload = () => {
    trackEvent("nudge_click", { addonId: addon.id });
    onDownload(addon);
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Sugestão de download"
      className="fixed z-40 border-2 border-foreground bg-background shadow-[6px_6px_0_0_var(--ink)] animate-mc-rise
        bottom-24 left-2 right-2 sm:bottom-6 sm:left-6 sm:right-auto sm:w-[340px]"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fechar"
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center border border-foreground bg-background hover:bg-muted"
      >
        <X className="h-3 w-3" />
      </button>
      <div className="flex items-stretch gap-2 p-2 pr-8 sm:gap-3 sm:p-3">
        <img
          src={addon.image}
          alt=""
          referrerPolicy="no-referrer"
          className="h-14 w-14 shrink-0 border-2 border-foreground object-cover sm:h-16 sm:w-16"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-pixel text-[8px] uppercase text-primary sm:text-[9px]">Mais baixado</span>
          </div>
          <p className="line-clamp-1 text-xs font-black uppercase leading-tight sm:text-sm">
            {addon.title}
          </p>
          <p className="text-[10px] text-muted-foreground sm:text-xs">
            {addon.downloads.toLocaleString("pt-BR")} downloads · {addon.category}
          </p>
          <button
            onClick={handleDownload}
            className="btn-block mt-1.5 w-full bg-primary text-primary-foreground !py-1.5 text-[11px] font-black uppercase sm:!py-2 sm:text-xs"
          >
            <Download className="h-3.5 w-3.5" /> Baixar Grátis
          </button>
        </div>
      </div>
    </div>
  );
}