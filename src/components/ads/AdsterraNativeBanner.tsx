import { useEffect, useRef } from "react";

const KEY = "fc144efab9f4920a4ea665f542dfd9e6";
const SCRIPT_SRC = `https://pl29077820.effectivecpmnetwork.com/${KEY}/invoke.js`;
const CONTAINER_ID = `container-${KEY}`;

export function AdsterraNativeBanner({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = "";
    const script = document.createElement("script");
    script.async = true;
    script.dataset.cfasync = "false";
    script.src = SCRIPT_SRC;
    el.appendChild(script);
    return () => {
      el.innerHTML = "";
    };
  }, []);

  return (
    <div className={className}>
      <p className="mb-1.5 text-center font-pixel text-[8px] uppercase tracking-widest text-muted-foreground/50">
        Publicidade
      </p>
      <div id={CONTAINER_ID} ref={containerRef} />
    </div>
  );
}
