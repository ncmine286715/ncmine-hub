import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, durationMs = 500) {
  const [value, setValue] = useState(0);
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const end = targetRef.current;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(end * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}
