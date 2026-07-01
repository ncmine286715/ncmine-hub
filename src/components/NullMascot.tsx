import { useEffect, useState } from "react";

const SEEN_KEY = "ncmine:null-mascot-seen";

export function NullMascot() {
  const [showBubble, setShowBubble] = useState(false);
  const [entered, setEntered] = useState(false);

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

  const dismissBubble = () => {
    setShowBubble(false);
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {}
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
          Clica aí pra baixar, é de graça mesmo.
          <span className="absolute -bottom-2 right-4 h-0 w-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-foreground" />
          <span className="absolute -bottom-[6px] right-[19px] h-0 w-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-background" />
        </button>
      )}
      <div
        className={`transition-transform duration-500 ${entered ? "translate-x-0" : "translate-x-24"}`}
        style={{ animation: entered ? "null-bob 2.4s ease-in-out infinite" : undefined }}
      >
        <NullSvg className="h-12 w-12 drop-shadow-[3px_3px_0_var(--ink)] sm:h-16 sm:w-16" />
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

function NullSvg({ className }: { className?: string }) {
  // Minecraft-ish pixel head: solid black, hollow white eyes.
  return (
    <svg viewBox="0 0 8 8" className={className} shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <rect width="8" height="8" fill="#0a0a0a" />
      {/* Eyes */}
      <rect x="1" y="3" width="2" height="1" fill="#ffffff" />
      <rect x="5" y="3" width="2" height="1" fill="#ffffff" />
      {/* Faint mouth */}
      <rect x="3" y="5" width="2" height="1" fill="#222" />
      {/* Subtle border via inline stroke rectangle */}
      <rect x="0" y="0" width="8" height="8" fill="none" stroke="#000" strokeWidth="0.2" />
    </svg>
  );
}