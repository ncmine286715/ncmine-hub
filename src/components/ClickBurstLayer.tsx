import { useEffect, useState } from "react";

type Burst = { id: number; x: number; y: number };

const PARTICLE_COLORS = ["#8aff3c", "#4fbf1c", "#ffb703", "#ff7a00", "#ffe27a"];
const PARTICLES_PER_BURST = 6;
const MAX_CONCURRENT_BURSTS = 8;
const BURST_LIFETIME_MS = 550;

let idCounter = 0;

// Tiny Minecraft-block-break particle burst rendered at every button/link click.
export function ClickBurstLayer() {
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest("button, a");
      if (!interactive) return;
      if (interactive.hasAttribute("data-no-fx")) return;

      const id = ++idCounter;
      setBursts((prev) => [...prev.slice(-(MAX_CONCURRENT_BURSTS - 1)), { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, BURST_LIFETIME_MS);
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  if (bursts.length === 0) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[300] overflow-hidden">
      {bursts.map((b) => (
        <span key={b.id} className="absolute" style={{ left: b.x, top: b.y }}>
          {Array.from({ length: PARTICLES_PER_BURST }).map((_, i) => {
            const angle = (i / PARTICLES_PER_BURST) * Math.PI * 2 + Math.random() * 0.5;
            const dist = 18 + Math.random() * 20;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist - 8;
            const color = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
            return (
              <i
                key={i}
                className="absolute -ml-[3px] -mt-[3px] block h-[6px] w-[6px]"
                style={
                  {
                    backgroundColor: color,
                    border: "1px solid rgba(0,0,0,0.4)",
                    "--dx": `${dx}px`,
                    "--dy": `${dy}px`,
                    "--r": `${Math.random() > 0.5 ? 90 : -90}deg`,
                    animation: "mc-particle 0.55s ease-out forwards",
                  } as React.CSSProperties
                }
              />
            );
          })}
        </span>
      ))}
    </div>
  );
}
