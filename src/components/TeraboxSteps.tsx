import { useEffect, useState } from "react";
import {
  ExternalLink,
  Copy,
  Check,
  MousePointerClick,
  UserPlus,
  Download,
  Boxes,
  Play,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import {
  detectInAppBrowser,
  detectPlatform,
  currentUrl,
  inAppLabel,
  realBrowserName,
  getEscapeInstructions,
  type InAppKind,
  type Platform,
} from "@/lib/inAppBrowser";
import { TERABOX_TUTORIAL_YT_ID } from "@/lib/tutorial";
import { TERABOX_REFERRAL_URL } from "@/lib/links";
import { trackEvent } from "@/lib/analytics";

type Step = {
  icon: typeof Download;
  title: string;
  desc: string;
  highlight?: boolean;
};

function buildSteps(inApp: InAppKind, platform: Platform): Step[] {
  const browser = realBrowserName(platform);
  const steps: Step[] = [];

  if (inApp) {
    steps.push({
      icon: ExternalLink,
      title: `Abra no ${browser}`,
      desc: `Você está dentro do ${inAppLabel(inApp)}. O download do Terabox só funciona no navegador real do celular.`,
      highlight: true,
    });
  }

  steps.push(
    {
      icon: MousePointerClick,
      title: "Toque em Baixar",
      desc: "O botão laranja abre o arquivo no Terabox (é onde os addons ficam guardados).",
    },
    {
      icon: UserPlus,
      title: "Crie sua conta grátis no Terabox",
      desc: "Leva 10 segundos com Google ou e-mail. É necessário para liberar o download — e é de graça.",
      highlight: true,
    },
    {
      icon: Download,
      title: "Baixe o arquivo",
      desc: "Toque em Baixar no Terabox e salve o arquivo .mcaddon ou .mcpack no celular.",
    },
    {
      icon: Boxes,
      title: "Abra com o Minecraft",
      desc: "Toque no arquivo baixado. Ele instala sozinho no Minecraft — é só ativar no seu mundo.",
    },
  );

  return steps;
}

type Props = {
  /** Mostra título compacto (para usar dentro de modais). */
  compact?: boolean;
  /** Mostra o botão de vídeo-tutorial do YouTube. */
  showVideo?: boolean;
};

export function TeraboxSteps({ compact = false, showVideo = true }: Props) {
  const [inApp, setInApp] = useState<InAppKind>(null);
  const [platform, setPlatform] = useState<Platform>("other");
  const [copied, setCopied] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    setInApp(detectInAppBrowser());
    setPlatform(detectPlatform());
  }, []);

  const steps = buildSteps(inApp, platform);
  const browser = realBrowserName(platform);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="border-2 border-foreground bg-background">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 bg-foreground px-3 py-2 text-background">
        <span className="inline-flex items-center gap-2 font-pixel text-[9px] uppercase sm:text-[10px]">
          <Play className="h-3.5 w-3.5 text-primary" />
          Como baixar — passo a passo
        </span>
        <span className="hidden items-center gap-1 text-[8px] font-bold uppercase text-green-400 sm:inline-flex">
          <ShieldCheck className="h-3 w-3" /> 100% grátis
        </span>
      </div>

      {/* Aviso navegador interno (só aparece se detectado) */}
      {inApp && (
        <div className="border-b-2 border-yellow-500 bg-yellow-500/10 p-2.5">
          <p className="text-[11px] font-extrabold uppercase leading-snug text-yellow-800">
            ⚠️ Abra no {browser} pra baixar
          </p>
          <p className="mt-0.5 text-[10px] leading-snug text-yellow-800/90">
            Aqui no {inAppLabel(inApp)} o download trava. É rápido:
          </p>
          <ol className="mt-2 space-y-1">
            {getEscapeInstructions(inApp, platform).slice(0, 2).map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center border-2 border-yellow-600 bg-yellow-600 font-pixel text-[8px] text-white">
                  {i + 1}
                </span>
                <span className="text-[11px] font-bold leading-snug text-yellow-900">{step}</span>
              </li>
            ))}
          </ol>
          <button onClick={copy} className="btn-block mt-2 w-full bg-yellow-600 text-white !py-1.5 text-[10px]">
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Link copiado — cole no {browser}
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copiar link (cola no {browser})
              </>
            )}
          </button>
        </div>
      )}

      {/* Passos */}
      <ol className={`space-y-2 p-3 ${compact ? "" : "sm:space-y-2.5 sm:p-4"}`}>
        {steps.map((s, i) => (
          <li
            key={i}
            className={`flex items-start gap-2.5 border-2 p-2 transition-colors sm:gap-3 sm:p-2.5 ${
              s.highlight ? "border-primary bg-primary/5" : "border-foreground/15 bg-background"
            }`}
          >
            <div
              className={`relative flex h-7 w-7 shrink-0 items-center justify-center border-2 border-foreground font-pixel text-[10px] sm:h-8 sm:w-8 ${
                s.highlight ? "bg-primary text-primary-foreground" : "bg-background text-foreground"
              }`}
            >
              {i + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase leading-tight sm:text-sm">
                <s.icon
                  className={`h-3.5 w-3.5 shrink-0 ${s.highlight ? "text-primary" : "text-foreground/70"}`}
                />
                {s.title}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground sm:text-xs">
                {s.desc}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {/* CTA criar conta grátis (link de referral) */}
      <div className="border-t-2 border-dashed border-foreground/20 px-3 py-2.5 sm:px-4">
        <a
          href={TERABOX_REFERRAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackEvent("terabox_open", { source: "steps_create_account", inApp, platform })
          }
          className="btn-block w-full bg-[#1A5CFF] text-white !py-2.5 text-xs sm:text-sm"
        >
          <UserPlus className="h-4 w-4" /> Criar minha conta grátis no Terabox
        </a>
        <p className="mt-2 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
          <span className="font-bold text-foreground">Por que preciso de conta?</span> É onde os
          arquivos ficam hospedados. A conta grátis libera o download na velocidade máxima e guarda
          seus addons salvos.
        </p>
      </div>

      {/* Vídeo-tutorial opcional */}
      {showVideo && (
        <div className="border-t-2 border-foreground/15">
          <button
            type="button"
            onClick={() => setVideoOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left sm:px-4"
            aria-expanded={videoOpen}
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase sm:text-xs">
              <Play className="h-3.5 w-3.5 text-[#FF0000]" />
              Prefere ver em vídeo?
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${videoOpen ? "rotate-180" : ""}`}
            />
          </button>
          {videoOpen && (
            <div className="aspect-video w-full bg-muted">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${TERABOX_TUTORIAL_YT_ID}?rel=0`}
                title="Tutorial Terabox"
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
