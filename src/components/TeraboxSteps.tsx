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
  Trophy,
  Users,
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
import { NullSvg } from "@/components/NullMascot";

type Step = {
  icon: typeof Download;
  title: string;
  desc: string;
  highlight?: boolean;
  /** Passo com ação externa (ex: criar conta). Marca como feito ao clicar. */
  cta?: { label: string; href: string; eventSource: string };
  /** Aviso extra pra pais/responsáveis (só no passo de criar conta). */
  kidNote?: string;
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
      cta: {
        label: "Criar conta grátis",
        href: TERABOX_REFERRAL_URL,
        eventSource: "steps_inline_step",
      },
      kidNote: "Criança jogando? Chame um adulto pra ajudar a criar a conta. 👨‍👩‍👦",
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
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    setInApp(detectInAppBrowser());
    setPlatform(detectPlatform());
  }, []);

  const steps = buildSteps(inApp, platform);
  const browser = realBrowserName(platform);
  const progress = steps.length ? Math.round((checked.size / steps.length) * 100) : 0;
  const allDone = steps.length > 0 && checked.size === steps.length;

  useEffect(() => {
    if (!allDone) return;
    trackEvent("quest_complete", { totalSteps: steps.length, inApp, platform });
    setCelebrate(true);
    const t = window.setTimeout(() => setCelebrate(false), 4200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);

  const toggleStep = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      const willComplete = !next.has(i);
      if (willComplete) next.add(i);
      else next.delete(i);
      trackEvent("quest_step_toggle", { step: i, title: steps[i]?.title, completed: willComplete });
      return next;
    });
  };

  const handleCta = (i: number, s: Step) => {
    if (!s.cta) return;
    trackEvent("terabox_open", { source: s.cta.eventSource, inApp, platform });
    setChecked((prev) => new Set(prev).add(i));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="relative border-2 border-foreground bg-background">
      {/* Achievement toast */}
      {celebrate && (
        <div className="pointer-events-none absolute -top-3 right-2 z-20 animate-mc-rise sm:-top-4 sm:right-4">
          <div className="flex items-center gap-2 border-2 border-foreground bg-foreground px-3 py-2 shadow-[3px_3px_0_0_var(--orange)]">
            <Trophy className="h-5 w-5 shrink-0 text-yellow-400" />
            <div className="leading-tight">
              <p className="font-pixel text-[8px] text-yellow-400">Conquista desbloqueada!</p>
              <p className="text-[10px] font-bold text-background">Missão download completa 🎉</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-2 bg-foreground px-3 py-2 text-background">
        <span className="inline-flex items-center gap-2 font-pixel text-[9px] uppercase sm:text-[10px]">
          <Play className="h-3.5 w-3.5 text-primary" />
          Missão: baixar o addon
        </span>
        <span className="hidden items-center gap-1 text-[8px] font-bold uppercase text-green-400 sm:inline-flex">
          <ShieldCheck className="h-3 w-3" /> 100% grátis
        </span>
      </div>

      {/* Barra de XP (progresso da missão) */}
      <div className="border-b-2 border-foreground/15 bg-muted/30 px-3 py-2 sm:px-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-pixel text-[7px] uppercase text-muted-foreground sm:text-[8px]">
            Progresso da missão
          </span>
          <span className="font-pixel text-[7px] text-primary sm:text-[8px]">
            {checked.size}/{steps.length}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden border-2 border-foreground bg-[#3a3a3a]">
          <div
            className="h-full bg-gradient-to-r from-[#8aff3c] to-[#4fbf1c] transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              backgroundImage:
                progress > 0
                  ? "repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 3px, transparent 3px 6px), linear-gradient(to right, #8aff3c, #4fbf1c)"
                  : undefined,
            }}
          />
        </div>
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

      {/* Passos (checklist interativo) */}
      <ol className={`space-y-2 p-3 ${compact ? "" : "sm:space-y-2.5 sm:p-4"}`}>
        {steps.map((s, i) => {
          const done = checked.has(i);
          return (
            <li
              key={i}
              className={`border-2 p-2 transition-colors sm:p-2.5 ${
                done
                  ? "border-green-600/60 bg-green-600/5"
                  : s.highlight
                    ? "border-primary bg-primary/5"
                    : "border-foreground/15 bg-background"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleStep(i)}
                aria-pressed={done}
                className="flex w-full items-start gap-2.5 text-left sm:gap-3"
              >
                <div
                  className={`relative flex h-7 w-7 shrink-0 items-center justify-center border-2 border-foreground font-pixel text-[10px] transition-colors sm:h-8 sm:w-8 ${
                    done
                      ? "bg-green-600 text-white"
                      : s.highlight
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-foreground"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`flex items-center gap-1.5 text-[12px] font-extrabold uppercase leading-tight sm:text-sm ${
                      done ? "text-green-700 line-through decoration-2" : ""
                    }`}
                  >
                    <s.icon
                      className={`h-3.5 w-3.5 shrink-0 ${
                        done ? "text-green-600" : s.highlight ? "text-primary" : "text-foreground/70"
                      }`}
                    />
                    {s.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground sm:text-xs">
                    {s.desc}
                  </p>
                </div>
              </button>

              {/* CTA embutido no passo (ex: criar conta) */}
              {s.cta && (
                <div className="mt-2 pl-9 sm:pl-11">
                  <a
                    href={s.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleCta(i, s)}
                    className="btn-block w-full bg-[#1A5CFF] text-white !py-2 text-[11px] sm:text-xs"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> {s.cta.label}
                  </a>
                  {s.kidNote && (
                    <p className="mt-1.5 flex items-start gap-1.5 text-[10px] font-bold leading-snug text-foreground/70">
                      <Users className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                      {s.kidNote}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Mascote com dica amigável (foco em ser simples pra crianças) */}
      <div className="flex items-start gap-2 border-t-2 border-dashed border-foreground/20 px-3 py-2.5 sm:px-4">
        <NullSvg className="h-6 w-6 shrink-0 drop-shadow-[2px_2px_0_var(--ink)]" />
        <p className="text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
          <span className="font-bold text-foreground">Dica do Null:</span> toque em cada passo pra
          marcar como feito. Se algo der errado, chame um adulto pra ajudar — tudo aqui é de graça.
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
