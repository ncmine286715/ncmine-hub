import { useEffect, useState } from "react";

type Addon = { id: string; image: string };
type Row = { images: string[]; dur: number; reverse: boolean };

/**
 * Fundo decorativo: grade de linhas + faixas de thumbnails de addons
 * passando lentamente. Dataset carregado lazy (code-split) pra não pesar
 * o bundle inicial das rotas.
 */
export function FloatingBackground() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let cancelled = false;
    import("@/data/addons.json").then((mod) => {
      if (cancelled) return;
      const isMobile = window.innerWidth < 768;
      const pool = (mod.default as Addon[]).filter((a) => a.image).map((a) => a.image);
      if (!pool.length) return;
      const perRow = isMobile ? 6 : 10;
      const rowCount = isMobile ? 3 : 4;
      setRows(
        Array.from({ length: rowCount }, (_, r) => ({
          images: Array.from({ length: perRow }, (_, i) => pool[(r * perRow + i * 3) % pool.length]),
          dur: 70 + r * 18,
          reverse: r % 2 === 1,
        })),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-grid-lines" />

      <div className="absolute inset-0 flex flex-col justify-around opacity-[0.10] sm:opacity-[0.14]">
        {rows.map((row, r) => (
          <div key={r} className="overflow-hidden">
            <div
              className={`marquee-track ${row.reverse ? "reverse" : ""}`}
              style={{ ["--dur" as never]: `${row.dur}s` }}
            >
              {[...row.images, ...row.images].map((src, i) => (
                <img
                  key={`${r}-${i}`}
                  src={src}
                  alt=""
                  loading="lazy"
                  decoding="async"
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

      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
    </div>
  );
}
