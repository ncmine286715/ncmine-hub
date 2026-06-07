import { useEffect, useState } from "react";
import { ExternalLink, Copy, Check, AlertTriangle, Smartphone, ChevronDown } from "lucide-react";
import { detectInAppBrowser, currentUrl, type InAppKind } from "@/lib/inAppBrowser";

const LABEL: Record<NonNullable<InAppKind>, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  snapchat: "Snapchat",
};

const INSTRUCTIONS: Record<NonNullable<InAppKind>, string[]> = {
  instagram: [
    "Toque nos 3 pontinhos (⋯) no canto superior direito",
    "Selecione \"Abrir no navegador\" ou \"Abrir no Chrome/Safari\"",
    "Pronto! Agora voce pode baixar addons normalmente",
  ],
  tiktok: [
    "Toque nos 3 pontinhos (⋯) no canto inferior direito",
    "Selecione \"Abrir no navegador\"",
    "Se nao aparecer, copie o link e cole no Chrome/Safari",
  ],
  facebook: [
    "Toque nos 3 pontinhos (⋯) no canto superior direito",
    "Selecione \"Abrir no Chrome\" ou \"Abrir no Safari\"",
    "Pronto! Downloads e funcionalidades completas",
  ],
  snapchat: [
    "Segure o link por 2 segundos",
    "Selecione \"Abrir no navegador\"",
    "Ou copie o link e abra manualmente no Chrome/Safari",
  ],
};

const PROBLEMS: string[] = [
  "Downloads nao funcionam",
  "Pagina trava ou fica lenta",
  "Botoes podem nao responder",
  "Compartilhamento limitado",
  "Notificacoes nao ativam",
];

export function InAppBrowserGuard() {
  const [kind, setKind] = useState<InAppKind>(null);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    setKind(detectInAppBrowser());
  }, []);

  if (!kind || dismissed) return null;

  const url = currentUrl();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const instructions = INSTRUCTIONS[kind];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-3 sm:items-center">
      <div className="w-full max-w-md bg-background border-t-2 sm:border-2 border-foreground shadow-[0_-4px_20px_rgba(0,0,0,0.3)] sm:shadow-[6px_6px_0_0_var(--ink)] animate-mc-rise overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="bg-yellow-500 text-black p-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-black uppercase">Navegador do {LABEL[kind]} detectado</p>
            <p className="text-[10px] opacity-80">Funcionalidades limitadas neste modo</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-[10px] font-bold opacity-70 hover:opacity-100 px-2 py-1 border border-black/30"
          >
            Ignorar
          </button>
        </div>

        {/* Problems */}
        <div className="p-3 border-b border-foreground/10">
          <p className="text-[9px] font-pixel uppercase text-muted-foreground mb-2">Problemas neste navegador:</p>
          <div className="flex flex-wrap gap-1">
            {PROBLEMS.map(p => (
              <span key={p} className="text-[9px] px-2 py-0.5 bg-red-50 border border-red-200 text-red-700">
                ✕ {p}
              </span>
            ))}
          </div>
        </div>

        {/* How to open */}
        <div className="p-3">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="w-full flex items-center justify-between text-left"
          >
            <span className="text-[10px] font-bold uppercase flex items-center gap-1">
              <Smartphone className="h-3.5 w-3.5 text-primary" />
              Como abrir no navegador real
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showSteps ? 'rotate-180' : ''}`} />
          </button>

          {showSteps && (
            <div className="mt-2 space-y-2">
              {instructions.map((step, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="w-5 h-5 shrink-0 bg-primary text-primary-foreground flex items-center justify-center text-[9px] font-bold border border-foreground">
                    {i + 1}
                  </span>
                  <p className="text-[11px] leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3 border-t border-foreground/10 space-y-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-block w-full bg-primary text-primary-foreground !py-3 text-sm font-bold animate-mc-pulse-orange"
          >
            <ExternalLink className="h-4 w-4" /> Abrir no Navegador Real
          </a>

          <button onClick={copy} className="btn-block w-full bg-background text-foreground !py-2.5 text-xs">
            {copied ? (
              <><Check className="h-4 w-4 text-green-600" /> Link copiado!</>
            ) : (
              <><Copy className="h-4 w-4" /> Copiar link para colar no navegador</>
            )}
          </button>
        </div>

        {/* Benefits */}
        <div className="p-3 bg-green-50/50 border-t border-foreground/10">
          <p className="text-[9px] font-pixel uppercase text-green-700 mb-1">No navegador real voce tem:</p>
          <div className="flex flex-wrap gap-1">
            <span className="text-[9px] px-2 py-0.5 bg-green-100 border border-green-300 text-green-800">✓ Downloads funcionando</span>
            <span className="text-[9px] px-2 py-0.5 bg-green-100 border border-green-300 text-green-800">✓ Velocidade total</span>
            <span className="text-[9px] px-2 py-0.5 bg-green-100 border border-green-300 text-green-800">✓ Notificacoes</span>
            <span className="text-[9px] px-2 py-0.5 bg-green-100 border border-green-300 text-green-800">✓ Instalacao direta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
