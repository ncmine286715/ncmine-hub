import { useEffect, useRef, useState } from "react";
import { useIdle } from "@/hooks/use-idle";

const SEEN_KEY = "ncmine:null-mascot-seen";
const IDLE_TIP_MAX = 2;
const IDLE_TIPS = [
  "Psst! Ja viu os addons novos? 👀",
  "Bora dar uma olhada nas texturas?",
  "Clica num addon pra ver os detalhes!",
];

export function NullMascot() {
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("Clica aí pra baixar, é de graça mesmo.");
  const [entered, setEntered] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const idleTipCount = useRef(0);
  const idle = useIdle(20000);

  useEffect(() => {
    // Enter animation on mount
    const enterT = window.setTimeout(() => setEntered(true), 300);

    let hideT: number | undefined;
    try {
      if (!sessionStorage.getItem(SEEN_KEY)) {
        const showT = window.setTimeout(() => setShowBubble(true), 900);
        hideT = window.setTimeout(() => {
          setShowBubble(false);
          try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {}
        }, 5200);
        return () => {
          clearTimeout(enterT);
          clearTimeout(showT);
          if (hideT) clearTimeout(hideT);
        };
      }
    } catch {}
    return () => clearTimeout(enterT);
  }, []);

  // Dica quando a pessoa fica parada na pagina, no maximo IDLE_TIP_MAX vezes por sessao.
  useEffect(() => {
    if (!idle || idleTipCount.current >= IDLE_TIP_MAX) return;
    idleTipCount.current += 1;
    setBubbleText(IDLE_TIPS[(idleTipCount.current - 1) % IDLE_TIPS.length]);
    setShowBubble(true);
    const hideT = window.setTimeout(() => setShowBubble(false), 4500);
    return () => clearTimeout(hideT);
  }, [idle]);

  const dismissBubble = () => {
    setShowBubble(false);
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {}
  };

  // "Pisca" quando o mouse chega perto do mascote.
  const handleProximityEnter = () => {
    setBlinking(true);
    window.setTimeout(() => setBlinking(false), 180);
  };

  return (
    <div
      className="pointer-events-none fixed bottom-20 right-2 z-40 flex items-end gap-2 sm:bottom-6 sm:right-6"
      aria-hidden={!showBubble}
    >
      {showBubble && (
        <button
          type="button"
          onClick={dismissBubble}
          className="pointer-events-auto relative mb-2 max-w-[180px] border-2 border-foreground bg-background px-3 py-2 text-left text-[10px] font-bold leading-tight shadow-[3px_3px_0_0_var(--ink)] animate-mc-rise sm:max-w-[240px] sm:text-xs"
          aria-label="Fechar dica"
        >
          {bubbleText}
          <span className="absolute -bottom-2 right-4 h-0 w-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-foreground" />
          <span className="absolute -bottom-[6px] right-[19px] h-0 w-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-background" />
        </button>
      )}
      <div
        onMouseEnter={handleProximityEnter}
        className={`pointer-events-auto -m-3 p-3 transition-transform duration-500 ${entered ? "translate-x-0" : "translate-x-24"}`}
        style={{ animation: entered ? "null-bob 2.4s ease-in-out infinite" : undefined }}
      >
        <NullSvg blinking={blinking} className="h-12 w-12 drop-shadow-[3px_3px_0_var(--ink)] sm:h-16 sm:w-16" />
      </div>
      <style>{`
        @keyframes null-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

export function NullSvg({ className, blinking }: { className?: string; blinking?: boolean }) {
  // Minecraft-ish pixel head: solid black, hollow white eyes (blink = eyes flattened).
  return (
    <svg viewBox="0 0 8 8" className={className} shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <rect width="8" height="8" fill="#0a0a0a" />
      {/* Eyes */}
      {blinking ? (
        <>
          <rect x="1" y="3.4" width="2" height="0.3" fill="#ffffff" />
          <rect x="5" y="3.4" width="2" height="0.3" fill="#ffffff" />
        </>
      ) : (
        <>
          <rect x="1" y="3" width="2" height="1" fill="#ffffff" />
          <rect x="5" y="3" width="2" height="1" fill="#ffffff" />
        </>
      )}
      {/* Faint mouth */}
      <rect x="3" y="5" width="2" height="1" fill="#222" />
      {/* Subtle border via inline stroke rectangle */}
      <rect x="0" y="0" width="8" height="8" fill="none" stroke="#000" strokeWidth="0.2" />
    </svg>
  );
}