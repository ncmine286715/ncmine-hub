import { X, Download, Star, User, Calendar, ExternalLink, Share2 } from "lucide-react";
import { useState } from "react";
import type { Addon } from "@/components/AddonCard";
import { shareAddon } from "@/lib/share";
import { Link } from "@tanstack/react-router";

type Props = {
  addon: Addon | null;
  onClose: () => void;
  onDownload: (a: Addon) => void;
};

export function AddonDetailModal({ addon, onClose, onDownload }: Props) {
  if (!addon) return null;
  
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-foreground/70 sm:items-center sm:p-4">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal content */}
      <div className="relative w-full max-w-3xl card-block animate-mc-rise overflow-hidden bg-background sm:rounded-none">
        {/* Mobile drag indicator */}
        <div className="flex justify-center py-2 sm:hidden">
          <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
        </div>
        
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-2 top-2 z-10 border-2 border-foreground bg-background p-1.5 hover:bg-primary hover:text-primary-foreground sm:right-3 sm:top-3"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex max-h-[90vh] flex-col sm:max-h-none sm:grid sm:grid-cols-2">
          {/* Image/Video section */}
          <div className="aspect-video w-full shrink-0 overflow-hidden border-b-2 border-foreground bg-muted sm:aspect-[16/10] sm:border-b-0 sm:border-r-2">
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

          {/* Content section */}
          <div className="flex flex-1 flex-col overflow-hidden p-3 sm:p-6">
            <span className="mb-1.5 inline-block self-start bg-primary px-1.5 py-0.5 font-pixel text-[8px] uppercase text-primary-foreground sm:mb-2 sm:px-2 sm:text-[9px]">
              {addon.category}
            </span>
            <h3 className="mb-1.5 text-lg font-black uppercase leading-tight sm:mb-2 sm:text-2xl">
              {addon.title}
            </h3>
            
            {/* Meta info */}
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground sm:mb-3 sm:gap-3 sm:text-xs">
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                {addon.author || "Desconhecido"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />{addon.date}
              </span>
              <span className="font-pixel text-[8px] sm:text-[9px]">v{addon.version}</span>
              <span className="inline-flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${i < addon.rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
                ))}
              </span>
            </div>

            {/* Tags */}
            <div className="mb-3 flex flex-wrap gap-1 sm:mb-4">
              {addon.tags?.slice(0, 5).map((t) => (
                <span key={t} className="border-2 border-foreground bg-background px-1 py-0.5 text-[8px] uppercase sm:px-1.5 sm:text-[10px]">
                  {t}
                </span>
              ))}
              {(addon.tags?.length || 0) > 5 && (
                <span className="text-[8px] text-muted-foreground sm:text-[10px]">
                  +{addon.tags!.length - 5}
                </span>
              )}
            </div>

            {/* Description - scrollable */}
            <div className="mb-3 flex-1 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-foreground/80 sm:mb-5 sm:text-sm">
              {addon.description}
            </div>

            {/* Actions */}
            <DetailActions addon={addon} onDownload={onDownload} />

            <Link
              to="/addon/$id"
              params={{ id: addon.id }}
              onClick={onClose}
              className="mt-2 inline-flex items-center justify-center gap-1 text-[11px] font-bold uppercase text-primary hover:underline sm:text-xs"
            >
              Abrir página completa <ExternalLink className="h-3 w-3" />
            </Link>

            {addon.youtubeId && (
              <a
                href={`https://youtu.be/${addon.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-foreground sm:text-xs"
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

import { FavoriteButton } from "./FavoriteButton";

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
        className="btn-block flex-1 bg-primary text-primary-foreground !py-2.5 text-xs sm:!py-3 sm:text-sm"
      >
        <Download className="h-4 w-4" /> Baixar agora
      </button>
      <FavoriteButton addonId={addon.id} />
      <button
        type="button"
        onClick={handleShare}
        aria-label="Compartilhar addon"
        className="btn-block bg-background !py-2.5 sm:!py-3"
      >
        <Share2 className="h-4 w-4" />
      </button>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 border-2 border-foreground bg-background px-2 py-1 text-[9px] font-bold shadow-[2px_2px_0_0_var(--ink)] sm:-top-9 sm:text-[10px] sm:shadow-[3px_3px_0_0_var(--ink)]"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
