import { useEffect, useState } from "react";

type Row = { images: string[]; dur: number; reverse: boolean };

/** Ambiente do device: decide quanto (ou se) vale animar o fundo. */
function readEnv() {
  if (typeof window === "undefined") return { enabled: false, mobile: false };
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const saveData = !!nav.connection?.saveData;
  const slowNet = /2g/.test(nav.connection?.effectiveType || "");
  const lowMem = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2;
  const lowCores = (nav.hardwareConcurrency || 8) <= 4;
  return {
    enabled: !(reduced || saveData || slowNet || lowMem || lowCores),
    mobile: window.innerWidth < 768,
  };
}

/**
 * Fundo decorativo: grade de linhas + faixas de thumbnails deslizando.
 * Leve por padrão: só a grade CSS aparece de cara; as faixas de imagem
 * entram depois do idle e só em aparelhos que aguentam. Em celular fraco,
 * data saver ou reduced-motion, fica só a grade (custo zero).
 */
export function FloatingBackground() {
  const [rows, setRows] = useState<Row[]>([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const { enabled, mobile } = readEnv();
    if (!enabled) return;

    let cancelled = false;
    const build = () => {
      // Reaproveita o catálogo já presente no bundle das rotas — sem novo fetch.
      import("@/lib/addons").then(({ ADDONS }) => {
        if (cancelled) return;
        const pool = ADDONS.filter((a) => a.image).map((a) => a.image);
        if (!pool.length) return;
        const perRow = mobile ? 4 : 8;
        const rowCount = mobile ? 2 : 3;
        setRows(
          Array.from({ length: rowCount }, (_, r) => ({
            images: Array.from({ length: perRow }, (_, i) => pool[(r * perRow + i * 7) % pool.length]),
            dur: 90 + r * 25,
            reverse: r % 2 === 1,
          })),
        );
      });
    };

    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: object) => number })
      .requestIdleCallback;
    const timer = idle ? idle(build, { timeout: 4000 }) : window.setTimeout(build, 2000);

    // Aba em segundo plano não anima (economiza bateria/CPU no celular).
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    onVis();

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      if (!idle) window.clearTimeout(timer as number);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-grid-lines" />

      {rows.length > 0 && (
        <div
          className="absolute inset-0 flex flex-col justify-around opacity-[0.08] sm:opacity-[0.12]"
          style={{ contentVisibility: "auto", contain: "layout paint style" } as React.CSSProperties}
        >
          {rows.map((row, r) => (
            <div key={r} className="overflow-hidden">
              <div
                className={`marquee-track ${row.reverse ? "reverse" : ""}`}
                style={{
                  ["--dur" as never]: `${row.dur}s`,
                  animationPlayState: paused ? "paused" : "running",
                  willChange: "transform",
                }}
              >
                {[...row.images, ...row.images].map((src, i) => (
                  <img
                    key={`${r}-${i}`}
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    referrerPolicy="no-referrer"
                    className="mx-3 h-20 w-32 shrink-0 border border-foreground object-cover sm:h-28 sm:w-48"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
    </div>
  );
}
