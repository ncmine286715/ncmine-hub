import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Sparkles,
  X,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { NullSvg } from "@/components/NullMascot";
import { useTargetRect, type Rect } from "./useTargetRect";

export type OnboardingStepConfig = {
  id: string;
  title: string;
  body: string;
  /** Matches an element rendered with data-onboarding={target}. Omit for a centered, un-highlighted step. */
  target?: string;
};

type Props = {
  steps: OnboardingStepConfig[];
  /** localStorage key used to remember the tour was seen. Bump it (e.g. :v2) to re-trigger after big content changes. */
  storageKey: string;
  /** Delay before auto-starting for first-time visitors. */
  autoStartDelay?: number;
};

const GAP = 10;
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function OnboardingTour({ steps, storageKey, autoStartDelay = 900 }: Props) {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<Element | null>(null);

  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const rect = useTargetRect(step?.target, open);

  // Auto-start once for first-time visitors.
  useEffect(() => {
    let seen = false;
    try {
      seen = !!localStorage.getItem(storageKey);
    } catch {}
    if (seen) return;
    const t = window.setTimeout(() => start(), autoStartDelay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard: ESC to skip, arrows to navigate, Tab trapped inside the card.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        skip();
      } else if (e.key === "ArrowRight") {
        next();
      } else if (e.key === "ArrowLeft") {
        back();
      } else if (e.key === "Tab") {
        trapFocus(e);
      }
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => dialogRef.current?.focus(), 30);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stepIndex]);

  useEffect(() => {
    if (open && step) trackEvent("onboarding_step", { step: step.id, index: stepIndex });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stepIndex]);

  function trapFocus(e: KeyboardEvent) {
    const container = dialogRef.current;
    if (!container) return;
    const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function start() {
    lastFocused.current = document.activeElement;
    setStepIndex(0);
    setOpen(true);
    trackEvent("onboarding_start", {});
  }

  function close() {
    setOpen(false);
    if (lastFocused.current instanceof HTMLElement) lastFocused.current.focus();
  }

  function persistSeen() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ seenAt: Date.now() }));
    } catch {}
  }

  function next() {
    if (isLast) return finish();
    setStepIndex((i) => i + 1);
  }

  function back() {
    if (!isFirst) setStepIndex((i) => i - 1);
  }

  function skip() {
    trackEvent("onboarding_skip", { step: step?.id, index: stepIndex });
    persistSeen();
    close();
  }

  function finish() {
    trackEvent("onboarding_complete", {});
    persistSeen();
    close();
  }

  const viewportMid = typeof window !== "undefined" ? window.innerHeight / 2 : 400;
  const cardBelow = rect ? rect.top < viewportMid : true;

  return (
    <>
      <button
        type="button"
        onClick={start}
        aria-label="Rever tutorial de como usar a página"
        className="fixed bottom-20 left-3 z-40 flex h-10 w-10 items-center justify-center border-2 border-foreground bg-background shadow-[3px_3px_0_0_var(--ink)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground hover:shadow-[5px_5px_0_0_var(--ink)] sm:bottom-6 sm:left-6"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {open && step && (
        <div className="fixed inset-0 z-[95]">
          {rect ? (
            <SpotlightMask rect={rect} onHoleClick={next} />
          ) : (
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
              onClick={skip}
            />
          )}

          {rect && <TourArrow rect={rect} cardBelow={cardBelow} />}

          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
            aria-describedby="onboarding-body"
            tabIndex={-1}
            key={step.id}
            style={cardPositionStyle(rect, cardBelow)}
            className="fixed z-[97] w-[calc(100%-1.5rem)] max-w-sm outline-none"
          >
            <div className="card-block motion-safe:animate-mc-rise relative bg-background p-4 sm:p-5">
              <button
                type="button"
                onClick={skip}
                aria-label="Fechar tutorial"
                className="absolute right-2 top-2 border-2 border-foreground bg-background p-1 hover:bg-primary hover:text-primary-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="mb-3 flex items-start gap-3 pr-6">
                <NullSvg className="motion-safe:animate-mc-bob h-9 w-9 shrink-0 drop-shadow-[2px_2px_0_var(--ink)]" />
                <div className="min-w-0">
                  <span className="font-pixel text-[8px] uppercase text-primary">
                    Passo {stepIndex + 1} de {steps.length}
                  </span>
                  <h2
                    id="onboarding-title"
                    className="mt-1 text-sm font-black uppercase leading-tight sm:text-base"
                  >
                    {step.title}
                  </h2>
                </div>
              </div>

              <p
                id="onboarding-body"
                className="mb-4 text-xs leading-relaxed text-muted-foreground sm:text-sm"
              >
                {step.body}
              </p>

              <div className="mb-4 h-2 w-full border-2 border-foreground bg-background">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={skip}
                  className="text-[10px] font-bold uppercase text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  Pular tutorial
                </button>
                <div className="flex gap-2">
                  {!isFirst && (
                    <button
                      type="button"
                      onClick={back}
                      className="btn-block bg-background !px-3 !py-2 text-[10px]"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Voltar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={next}
                    className="btn-block bg-primary text-primary-foreground !px-3 !py-2 text-[10px]"
                  >
                    {isLast ? (
                      <>
                        Concluir <Sparkles className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        Próximo <ChevronRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Rough estimate of the card's own height, used to keep it fully on-screen
// even when the spotlighted element is taller than the viewport.
const ESTIMATED_CARD_HEIGHT = 240;
const EDGE_MARGIN = 16;

function cardPositionStyle(rect: Rect | null, cardBelow: boolean): CSSProperties {
  if (!rect) {
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }
  const vh = window.innerHeight;
  const clampMax = Math.max(vh - ESTIMATED_CARD_HEIGHT - EDGE_MARGIN, EDGE_MARGIN);
  if (cardBelow) {
    const top = Math.min(Math.max(rect.top + rect.height + 28, EDGE_MARGIN), clampMax);
    return { top, left: "50%", transform: "translateX(-50%)" };
  }
  const bottom = Math.min(Math.max(vh - rect.top + 28, EDGE_MARGIN), clampMax);
  return { bottom, left: "50%", transform: "translateX(-50%)" };
}

function SpotlightMask({ rect, onHoleClick }: { rect: Rect; onHoleClick: () => void }) {
  const pad = 8;
  const bar = "absolute bg-black/70 backdrop-blur-sm transition-all duration-300 ease-out";
  return (
    <>
      <div
        className={bar}
        style={{ left: 0, right: 0, top: 0, height: Math.max(rect.top - pad, 0) }}
      />
      <div
        className={bar}
        style={{ left: 0, right: 0, top: rect.top + rect.height + pad, bottom: 0 }}
      />
      <div
        className={bar}
        style={{
          left: 0,
          width: Math.max(rect.left - pad, 0),
          top: rect.top - pad,
          height: rect.height + pad * 2,
        }}
      />
      <div
        className={bar}
        style={{
          left: rect.left + rect.width + pad,
          right: 0,
          top: rect.top - pad,
          height: rect.height + pad * 2,
        }}
      />
      <div
        className="motion-safe:animate-onboarding-pulse absolute rounded-md border-2 border-primary transition-all duration-300 ease-out"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
        }}
      />
      <button
        type="button"
        onClick={onHoleClick}
        aria-label="Continuar tutorial"
        className="absolute cursor-pointer bg-transparent"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
        }}
      />
    </>
  );
}

function TourArrow({ rect, cardBelow }: { rect: Rect; cardBelow: boolean }) {
  const top = cardBelow ? rect.top + rect.height + GAP - 2 : rect.top - 34;
  const Icon = cardBelow ? ArrowUp : ArrowDown;
  return (
    <div
      className="motion-safe:animate-bounce pointer-events-none fixed z-[96] text-primary"
      style={{ top, left: rect.left + rect.width / 2, transform: "translateX(-50%)" }}
    >
      <Icon className="h-7 w-7 drop-shadow-[2px_2px_0_var(--ink)]" />
    </div>
  );
}
