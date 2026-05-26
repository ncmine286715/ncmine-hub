import { X, Download, Star, User, Calendar, ExternalLink, Share2 } from "lucide-react";
import { useState } from "react";
import type { Addon } from "@/components/AddonCard";
import { shareAddon } from "@/lib/share";

type Props = {
  addon: Addon | null;
  onClose: () => void;
  onDownload: (a: Addon) => void;
};

export function AddonDetailModal({ addon, onClose, onDownload }: Props) {
  if (!addon) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/70 p-4">
      <div className="relative w-full max-w-3xl card-block animate-mc-rise overflow-hidden bg-background">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 border-2 border-foreground bg-background p-1 hover:bg-primary hover:text-primary-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid gap-0 md:grid-cols-2">
          <div className="aspect-[16/10] w-full overflow-hidden border-b-2 border-foreground bg-muted md:border-b-0 md:border-r-2">
            {addon.youtubeId ? (
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${addon.youtubeId}`}
                title={addon.title}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img
                src={addon.image}
                alt={addon.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="flex max-h-[80vh] flex-col p-5 sm:p-6">
            <span className="mb-2 inline-block self-start bg-primary px-2 py-0.5 font-pixel text-[9px] uppercase text-primary-foreground">
              {addon.category}
            </span>
            <h3 className="mb-2 text-xl font-black uppercase leading-tight sm:text-2xl">
              {addon.title}
            </h3>
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{addon.author}</span>
              <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{addon.date}</span>
              <span className="font-pixel text-[9px]">v{addon.version}</span>
              <span className="inline-flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < addon.rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
                ))}
              </span>
            </div>

            <div className="mb-4 flex flex-wrap gap-1">
              {addon.tags?.map((t) => (
                <span key={t} className="border-2 border-foreground bg-background px-1.5 py-0.5 text-[10px] uppercase">
                  {t}
                </span>
              ))}
            </div>

            <div className="mb-5 flex-1 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
              {addon.description}
            </div>

            <DetailActions addon={addon} onDownload={onDownload} />
            {addon.youtubeId && (
              <a
                href={`https://youtu.be/${addon.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Ver no YouTube <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailActions({
  addon,
  onDownload,
}: {
  addon: Addon;
  onDownload: (a: Addon) => void;
}) {
  const [toast, setToast] = useState<string | null>(null);
  const handleShare = async () => {
    await shareAddon(addon, (msg) => {
      setToast(msg);
      window.setTimeout(() => setToast(null), 2200);
    });
  };
  return (
    <div className="relative flex gap-2">
      <button
        onClick={() => onDownload(addon)}
        className="btn-block flex-1 bg-primary text-primary-foreground"
      >
        <Download className="h-4 w-4" /> Baixar agora
      </button>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Compartilhar addon"
        className="btn-block bg-background"
      >
        <Share2 className="h-4 w-4" />
      </button>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 border-2 border-foreground bg-background px-2 py-1 text-[10px] font-bold shadow-[3px_3px_0_0_var(--ink)]"
        >
          {toast}
        </div>
      )}
    </div>
  );
}