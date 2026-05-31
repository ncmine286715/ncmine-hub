import { useEffect, useState } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";
import { detectInAppBrowser, currentUrl, type InAppKind } from "@/lib/inAppBrowser";

const LABEL: Record<NonNullable<InAppKind>, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  snapchat: "Snapchat",
};

export function InAppBrowserGuard() {
  const [kind, setKind] = useState<InAppKind>(null);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setKind(detectInAppBrowser());
  }, []);

  if (!kind || dismissed) return null;

  const url = currentUrl();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/20 p-3 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-sm card-block animate-mc-rise bg-background p-3 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-black uppercase">Abrir no navegador</h2>
            <p className="text-xs text-muted-foreground">
              Melhor experiência fora do {LABEL[kind]}.
            </p>
          </div>
          <button onClick={() => setDismissed(true)} className="text-xs opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
          <span className="border px-2 py-1">Downloads</span>
          <span className="border px-2 py-1">Mais rápido</span>
          <span className="border px-2 py-1">Sem travamentos</span>
          <span className="border px-2 py-1">Compatibilidade</span>
        </div>

        <div className="mt-3 flex gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-block flex-1 bg-primary text-primary-foreground"
          >
            <ExternalLink className="h-4 w-4" /> Abrir
          </a>

          <button onClick={copy} className="btn-block px-3">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
