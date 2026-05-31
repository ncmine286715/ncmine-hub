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
    } catch {
      /* noop */
    }
  };

  const benefits = [
    "Downloads mais estáveis",
    "Maior velocidade",
    "Menos travamentos",
    "Melhor compatibilidade",
    "Navegação mais rápida",
    "Links funcionando corretamente",
    "Melhor suporte a arquivos",
    "Menor chance de erros",
    "Mais segurança",
    "Experiência completa do site",
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/60 p-4 sm:items-center">
      <div className="w-full max-w-md card-block animate-mc-rise bg-background p-6 sm:p-8">
        <div className="mb-4 inline-block bg-primary px-3 py-1 font-pixel text-[10px] text-primary-foreground">
          RECOMENDADO
        </div>

        <h2 className="mb-2 text-2xl font-black uppercase tracking-tight">
          Abra em seu navegador
        </h2>

        <p className="mb-4 text-sm text-muted-foreground">
          Você está usando o navegador interno do <span className="font-semibold text-foreground">{LABEL[kind]}</span>. Para aproveitar todos os recursos do site, abra a página no Chrome, Edge, Firefox ou Safari.
        </p>

        <div className="mb-5 grid grid-cols-2 gap-2 text-xs">
          {benefits.map((item) => (
            <div key={item} className="border border-foreground/20 bg-muted px-2 py-1">
              ✓ {item}
            </div>
          ))}
        </div>

        <ol className="mb-6 space-y-2 text-sm">
          <li className="flex gap-2"><span className="font-pixel text-primary">1.</span> Toque nos <strong>três pontinhos</strong> (•••).</li>
          <li className="flex gap-2"><span className="font-pixel text-primary">2.</span> Selecione <strong>"Abrir no navegador"</strong>.</li>
          <li className="flex gap-2"><span className="font-pixel text-primary">3.</span> Ou copie o link abaixo.</li>
        </ol>

        <div className="mb-4 flex items-center gap-2 border-2 border-foreground bg-muted p-2">
          <code className="flex-1 truncate text-xs">{url}</code>
          <button onClick={copy} className="shrink-0 border-2 border-foreground bg-background px-2 py-1 text-xs font-bold hover:bg-primary hover:text-primary-foreground">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-block flex-1 bg-primary text-primary-foreground"
          >
            <ExternalLink className="h-4 w-4" /> Abrir agora
          </a>
          <button onClick={() => setDismissed(true)} className="btn-block flex-1">
            Continuar aqui
          </button>
        </div>
      </div>
    </div>
  );
}
