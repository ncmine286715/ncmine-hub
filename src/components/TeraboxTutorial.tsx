import { useState } from "react";
import { Play, ChevronDown } from "lucide-react";
import { TERABOX_TUTORIAL_YT_ID } from "@/lib/tutorial";

type Props = {
  defaultOpen?: boolean;
  compact?: boolean;
};

export function TeraboxTutorial({ defaultOpen = false, compact = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [load, setLoad] = useState(defaultOpen);

  return (
    <div className={`border-2 border-foreground bg-background ${compact ? "" : "shadow-[3px_3px_0_0_var(--ink)]"}`}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setLoad(true);
        }}
        className="flex w-full items-center justify-between gap-2 bg-foreground px-3 py-2 text-left text-background"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2 font-pixel text-[9px] uppercase sm:text-[10px]">
          <Play className="h-3.5 w-3.5 text-primary" />
          Como baixar do Terabox
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="aspect-video w-full bg-muted">
          {load && (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${TERABOX_TUTORIAL_YT_ID}?rel=0`}
              title="Tutorial Terabox"
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      )}
      {!open && (
        <p className="px-3 py-2 text-[10px] text-muted-foreground sm:text-xs">
          Primeira vez no Terabox? Toque para ver o passo a passo rápido.
        </p>
      )}
    </div>
  );
}