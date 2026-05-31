import { Star, Download, User, Calendar, Tag, Share2, ExternalLink, Flame, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { shareAddon } from "@/lib/share";

export type Addon = {
  id: string;
  title: string;
  category: string;
  version: string;
  rating: number;
  downloads: number;
  date: string;
  image: string;
  tags: string[];
  short: string;
  description: string;
  downloadUrl: string;
  author: string;
  youtubeId?: string;
};

type Props = {
  addon: Addon;
  onDownload: (a: Addon) => void;
  onOpen: (a: Addon) => void;
};

// Check if addon is "hot" (recent + popular)
function isHotAddon(addon: Addon): boolean {
  const daysSince = Math.floor((Date.now() - new Date(addon.date).getTime()) / (1000 * 60 * 60 * 24));
  return daysSince <= 7 || addon.downloads > 10000;
}

// Check if addon is new (less than 14 days)
function isNewAddon(addon: Addon): boolean {
  const daysSince = Math.floor((Date.now() - new Date(addon.date).getTime()) / (1000 * 60 * 60 * 24));
  return daysSince <= 14;
}

export function AddonCard({ addon, onDownload, onOpen }: Props) {
  const [broken, setBroken] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isHot = isHotAddon(addon);
  const isNew = isNewAddon(addon);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    await shareAddon(addon, (msg) => {
      setToast(msg);
      window.setTimeout(() => setToast(null), 2200);
    });
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDownload(addon);
  };

  return (
    <article className="card-block relative flex flex-col overflow-hidden group">
      {/* Hot/New badge */}
      {isHot && (
        <div className="absolute left-0 top-0 z-20 flex items-center gap-0.5 bg-[#FF0000] px-1.5 py-0.5 font-pixel text-[7px] text-white sm:text-[8px]">
          <Flame className="h-2.5 w-2.5 animate-pulse" />
          HOT
        </div>
      )}
      {!isHot && isNew && (
        <div className="absolute left-0 top-0 z-20 flex items-center gap-0.5 bg-[#00C16E] px-1.5 py-0.5 font-pixel text-[7px] text-white sm:text-[8px]">
          <Zap className="h-2.5 w-2.5" />
          NOVO
        </div>
      )}

      <Link
        to="/addon/$id"
        params={{ id: addon.id }}
        className="relative block aspect-[16/10] w-full overflow-hidden border-b-2 border-foreground bg-muted"
      >
        {!broken ? (
          <img
            src={addon.image}
            alt={addon.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-foreground text-background font-pixel text-[8px] sm:text-xs">
            NO PREVIEW
          </div>
        )}
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        
        <span className="absolute right-1 top-1 border-2 border-foreground bg-primary px-1.5 py-0.5 font-pixel text-[7px] uppercase text-primary-foreground sm:right-2 sm:top-2 sm:px-2 sm:text-[9px]">
          <Tag className="mr-0.5 inline h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span className="max-w-[50px] truncate sm:max-w-none">{addon.category}</span>
        </span>
        
        {/* Quick download button on hover */}
        <button
          onClick={handleDownloadClick}
          className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 btn-block bg-primary text-primary-foreground !px-3 !py-1.5 text-[10px] sm:!px-4 sm:!py-2 sm:text-xs"
        >
          <Download className="h-3 w-3 sm:h-4 sm:w-4" /> Baixar
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-2 sm:p-4">
        <Link
          to="/addon/$id"
          params={{ id: addon.id }}
          className="mb-0.5 line-clamp-2 text-[11px] font-extrabold uppercase leading-tight hover:text-primary sm:mb-1 sm:text-base"
        >
          {addon.title}
        </Link>
        <div className="mb-1.5 flex items-center gap-1.5 text-[9px] text-muted-foreground sm:mb-2 sm:gap-3 sm:text-[11px]">
          <span className="inline-flex items-center gap-0.5 truncate sm:gap-1">
            <User className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
            <span className="max-w-[70px] truncate sm:max-w-none">{addon.author || "Desconhecido"}</span>
          </span>
          <span className="hidden items-center gap-1 sm:inline-flex">
            <Calendar className="h-3 w-3" />{addon.date}
          </span>
        </div>
        <p className="mb-2 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground sm:mb-3 sm:line-clamp-3 sm:text-xs">{addon.short}</p>

        <div className="mb-2 flex items-center justify-between text-[10px] sm:mb-3 sm:text-xs">
          <span className="inline-flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 ${i < addon.rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
              />
            ))}
          </span>
          <span className="inline-flex items-center gap-0.5 font-pixel text-[7px] sm:gap-1 sm:text-[9px]">
            <Download className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {addon.downloads.toLocaleString("pt-BR")}
          </span>
        </div>

        <div className="mt-auto flex gap-1.5 sm:gap-2">
          <button
            onClick={handleDownloadClick}
            className="btn-block flex-1 bg-foreground text-background !px-2 !py-1.5 text-[10px] sm:!px-5 sm:!py-3 sm:text-sm"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Baixar
          </button>
          <Link
            to="/addon/$id"
            params={{ id: addon.id }}
            className="btn-block bg-background !px-2 !py-1.5 text-[10px] sm:!px-3 sm:!py-3"
          >
            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Compartilhar"
            className="btn-block bg-background !px-2 !py-1.5 text-[10px] sm:!px-3 sm:!py-3"
          >
            <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute inset-x-1 bottom-1 z-10 border-2 border-foreground bg-background px-1.5 py-0.5 text-center text-[8px] font-bold shadow-[2px_2px_0_0_var(--ink)] sm:inset-x-2 sm:bottom-2 sm:px-2 sm:py-1 sm:text-[10px] sm:shadow-[3px_3px_0_0_var(--ink)]"
        >
          {toast}
        </div>
      )}
    </article>
  );
}
