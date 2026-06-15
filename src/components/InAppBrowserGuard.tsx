import { useEffect, useState } from "react";
import { ExternalLink, Copy, Check, AlertTriangle, Smartphone, ChevronDown } from "lucide-react";
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

const PROBLEMS: string[] = [
  "Download não funciona",
  "Conta do Terabox trava",
  "Página fica lenta",
  "Não importa no Minecraft",
];

export function InAppBrowserGuard() {
  const [kind, setKind] = useState<InAppKind>(null);
  const [platform, setPlatform] = useState<Platform>("other");
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSteps, setShowSteps] = useState(true);

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
  const instructions = getEscapeInstructions(kind, platform);

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
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-3">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto border-t-2 border-foreground bg-background shadow-[0_-4px_20px_rgba(0,0,0,0.3)] animate-mc-rise sm:border-2 sm:shadow-[6px_6px_0_0_var(--ink)]">
        {/* Header */}
        <div className="flex items-center gap-2 bg-yellow-500 p-3 text-black">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-black uppercase">
              Você está no navegador do {inAppLabel(kind)}
            </p>
            <p className="text-[10px] opacity-80">Aqui o download dos addons não funciona</p>
          </div>
          <button
            onClick={dismiss}
            className="border border-black/30 px-2 py-1 text-[10px] font-bold opacity-70 hover:opacity-100"
          >
            Ignorar
          </button>
        </div>

        {/* Solução em destaque */}
        <div className="p-3">
          <p className="mb-2 text-center text-[11px] font-bold uppercase text-foreground sm:text-xs">
            Abra no {browser} em 1 toque para baixar de boa 👇
          </p>
          <a
            href={externalHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("inapp_escape", { kind, platform, method: "intent" })}
            className="btn-block w-full animate-mc-pulse-orange bg-primary !py-3.5 text-sm font-black text-primary-foreground"
          >
            <ExternalLink className="h-4 w-4" /> Abrir no {browser}
          </a>

          <button
            onClick={copy}
            className="btn-block mt-2 w-full bg-background text-foreground !py-2.5 text-xs"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" /> Link copiado — cole no {browser}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copiar link para colar no {browser}
              </>
            )}
          </button>
        </div>

        {/* Passo a passo manual (caso o botão não abra) */}
        <div className="border-t border-foreground/10 p-3">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase">
              <Smartphone className="h-3.5 w-3.5 text-primary" />
              Não abriu? Faça manual
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showSteps ? "rotate-180" : ""}`}
            />
          </button>

          {showSteps && (
            <div className="mt-2 space-y-2">
              {instructions.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-foreground bg-primary text-[9px] font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 text-[11px] leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comparação problema/benefício */}
        <div className="grid grid-cols-2 gap-px border-t border-foreground/10 bg-foreground/10">
          <div className="bg-background p-3">
            <p className="mb-1.5 font-pixel text-[8px] uppercase text-red-600">Neste navegador</p>
            <div className="space-y-1">
              {PROBLEMS.map((p) => (
                <p key={p} className="text-[9px] leading-tight text-red-700">
                  ✕ {p}
                </p>
              ))}
            </div>
          </div>
          <div className="bg-green-50/60 p-3">
            <p className="mb-1.5 font-pixel text-[8px] uppercase text-green-700">No {browser}</p>
            <div className="space-y-1">
              <p className="text-[9px] leading-tight text-green-800">✓ Download funcionando</p>
              <p className="text-[9px] leading-tight text-green-800">✓ Conta Terabox em 10s</p>
              <p className="text-[9px] leading-tight text-green-800">✓ Velocidade total</p>
              <p className="text-[9px] leading-tight text-green-800">✓ Instala no Minecraft</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
