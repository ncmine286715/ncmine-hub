import { useEffect, useState } from "react";

export type Rect = { top: number; left: number; width: number; height: number };

/**
 * Tracks the live viewport rect of the element with `data-onboarding="<selector>"`.
 * Scrolls it into view when the selector changes and keeps measuring through
 * resize/scroll/layout-shift (e.g. images finishing loading) via ResizeObserver.
 */
export function useTargetRect(selector: string | undefined, active: boolean): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!active || !selector) {
      setRect(null);
      return;
    }

    const measure = () => {
      const el = document.querySelector<HTMLElement>(`[data-onboarding="${selector}"]`);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    let observer: ResizeObserver | undefined;
    const el = document.querySelector<HTMLElement>(`[data-onboarding="${selector}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      observer = new ResizeObserver(measure);
      observer.observe(el);
    }
    measure();

    // Re-measure a few times while the smooth scroll settles.
    const timers = [50, 200, 400, 650].map((ms) => window.setTimeout(measure, ms));

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [selector, active]);

  return rect;
}
