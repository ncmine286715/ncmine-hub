import { useEffect, useState } from "react";

type Addon = { id: string; image: string; title: string };
type Item = Addon & {
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
};

/**
 * Floating addon thumbnails drifting behind the page.
 * Pure CSS animations — performant. The addon dataset is loaded lazily
 * (code-split) so this purely decorative layer never bloats the initial
 * bundle of every route just to grab a handful of thumbnails.
 */
export function FloatingBackground() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let cancelled = false;
    import("@/data/addons.json").then((mod) => {
      if (cancelled) return;
      const isMobile = window.innerWidth < 768;
      const count = isMobile ? 3 : 6;
      const pool = (mod.default as Addon[]).filter((a) => a.image).slice(0, count);
      setItems(
        pool.map((a, i) => ({
          ...a,
          // deterministic pseudo-random placement so it doesn't reflow each render
          top: (i * 53) % 90,
          left: (i * 37) % 92,
          size: (isMobile ? 50 : 70) + ((i * 19) % (isMobile ? 50 : 90)),
          delay: (i % 7) * 0.6,
          duration: 8 + (i % 5) * 2,
          rotate: ((i * 23) % 30) - 15,
        })),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-[0.18] sm:opacity-[0.26]"
    >
      {items.map((it) => (
        <img
          key={it.id}
          src={it.image}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute border-2 border-foreground shadow-[4px_4px_0_0_var(--ink)] animate-mc-float pixelated"
          style={{
            top: `${it.top}%`,
            left: `${it.left}%`,
            width: `${it.size}px`,
            height: `${it.size}px`,
            objectFit: "cover",
            animationDelay: `${it.delay}s`,
            animationDuration: `${it.duration}s`,
            ["--r" as never]: `${it.rotate}deg`,
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ))}
    </div>
  );
}
