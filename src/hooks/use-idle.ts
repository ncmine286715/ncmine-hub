import { useEffect, useState } from "react";

const ACTIVITY_EVENTS = ["mousemove", "keydown", "scroll", "touchstart", "click"] as const;

export function useIdle(timeoutMs: number): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let timer: number;

    const reset = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), timeoutMs);
    };

    reset();
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));

    return () => {
      window.clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, [timeoutMs]);

  return idle;
}
