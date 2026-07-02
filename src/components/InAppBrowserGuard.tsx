import { useEffect, useState } from "react";
import { ExternalLink, Copy, Check, X, AlertTriangle } from "lucide-react";
import {
  detectInAppBrowser,
  detectPlatform,
  buildExternalHref,
  currentUrl,
  getEscapeInstructions,
  inAppLabel,
  realBrowserName,
  type InAppKind,
  type Platform,
} from "@/lib/inAppBrowser";
import { trackEvent } from "@/lib/analytics";

const DISMISS_KEY = "ncmine:inapp-dismissed";

export function InAppBrowserGuard() {
  const [kind, setKind] = useState<InAppKind>(null);
  const [platform, setPlatform] = useState<Platform>("other");
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const k = detectInAppBrowser();
    setKind(k);
    setPlatform(detectPlatform());
    if (k) {
      // Já ignorou nesta sessão?
      try {
        if (sessionStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
      } catch {}
      trackEvent(
        "inapp_detected",
        { kind: k, platform: detectPlatform() },
        { onceKey: "inapp_detected" },
      );
    }
  }, []);

  if (!kind || dismissed) return null;

  const url = currentUrl();
  const browser = realBrowserName(platform);
  const externalHref = buildExternalHref(url, platform);
  const instructions = getEscapeInstructions(kind, platform).slice(0, 2);

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {}
    setDismissed(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackEvent("inapp_escape", { kind, platform, method: "copy" });
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed left-1/2 top-2 z-[95] w-[calc(100%-16px)] max-w-md -translate-x-1/2 sm:top-3">
      <div className="border-2 border-foreground bg-yellow-400 text-black shadow-[4px_4px_0_0_var(--ink)] animate-mc-rise">
        <div className="flex items-center gap-2 px-2.5 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p className="flex-1 text-[11px] font-black uppercase leading-tight">
            Abra no {browser} pra baixar
          </p>
          <a
            href={externalHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("inapp_escape", { kind, platform, method: "intent" })}
            className="inline-flex items-center gap-1 border-2 border-black bg-primary px-2 py-1 text-[10px] font-black uppercase text-primary-foreground shadow-[2px_2px_0_0_#000] animate-mc-pulse-orange"
          >
            <ExternalLink className="h-3 w-3" /> Abrir
          </a>
          <button
            onClick={copy}
            aria-label="Copiar link"
            className="border-2 border-black bg-white p-1 text-black hover:bg-black hover:text-white"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label="Ajuda"
            className="hidden border-2 border-black bg-white px-1.5 py-1 text-[9px] font-black text-black sm:inline"
          >
            ?
          </button>
          <button
            onClick={dismiss}
            aria-label="Fechar"
            className="border-2 border-black bg-white p-1 text-black hover:bg-black hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        {expanded && (
          <div className="border-t-2 border-black bg-white px-3 py-2">
            <ol className="space-y-1">
              {instructions.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] leading-snug text-black">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center border border-black bg-primary text-[9px] font-black text-primary-foreground">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
