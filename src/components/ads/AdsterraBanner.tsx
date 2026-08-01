import { useEffect, useRef } from "react";

const KEY = "9a98a3b31d91c4b164ea0ce081293fc6";
const SCRIPT_SRC = `https://www.highperformanceformat.com/${KEY}/invoke.js`;

// atOptions e global e lido de forma sincrona pelo invoke.js assim que ele
// carrega — por isso so pode ter 1 <AdsterraBanner> montado por vez na
// pagina (dois ao mesmo tempo disputariam a mesma variavel global).
export function AdsterraBanner({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = "";
    (window as unknown as { atOptions?: unknown }).atOptions = {
      key: KEY,
      format: "iframe",
      height: 250,
      width: 300,
      params: {},
    };
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    el.appendChild(script);
    return () => {
      el.innerHTML = "";
    };
  }, []);

  return (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
      <p className="mb-1.5 text-center font-pixel text-[8px] uppercase tracking-widest text-muted-foreground/50">
        Publicidade
      </p>
      <div ref={containerRef} style={{ width: 300, height: 250 }} />
    </div>
  );
}
