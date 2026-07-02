import { Star, Download, User, Calendar, Tag, Share2, Zap } from "lucide-react";
import { useState } from "react";
import { shareAddon } from "@/lib/share";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";
import { recordShare } from "@/lib/firebase-services";

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
  achievementFriendly?: boolean;
  platforms?: string[];
  multiplayer?: boolean;
};

type Props = {
  addon: Addon;
  onDownload: (a: Addon) => void;
  onOpen: (a: Addon) => void;
  index?: number;
};

export function AddonCard({ addon, onDownload, onOpen, index = 0 }: Props) {
  const { user, profile } = useAuth();
  const isDownloaded = profile?.downloadedAddons?.includes(addon.id);
  const [broken, setBroken] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent("share", { addonId: addon.id, title: addon.title });
    if (user) recordShare(user.uid, addon.id).catch(() => {});
    await shareAddon(addon, (msg) => {
      setToast(msg);
      window.setTimeout(() => setToast(null), 2200);
    });
  };

  const isHot = addon.downloads > 5000;
  const isViral = addon.downloads > 10000;
  const authorLower = (addon.author || "").toLowerCase();
  const isNcmine = authorLower.includes("ncmine") || authorLower.includes("nicolas");

  return (
    <article
      className={`card-block animate-card-in relative flex flex-col overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] ${isDownloaded ? 'border-primary/40' : ''}`}
      style={{ animationDelay: `${Math.min(index, 14) * 40}ms` }}
    >
      <button
        type="button"
        onClick={() => { trackEvent("addon_click", { addonId: addon.id, title: addon.title }); onOpen(addon); }}
        className="group relative block aspect-[16/10] w-full overflow-hidden border-b-2 border-foreground bg-muted"
      >
        {!broken ? (
          <img
            src={addon.image}
            alt={addon.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setBroken(true)}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${isDownloaded ? 'grayscale-[0.3] opacity-80' : ''}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-foreground text-background font-pixel text-[8px] sm:text-xs">
            NO PREVIEW
          </div>
        )}

        {isViral ? (
          <div className="absolute top-0 right-0 left-0 bg-red-600 text-white text-[7px] font-pixel py-1 text-center uppercase animate-pulse border-b-2 border-foreground z-20 flex items-center justify-center gap-1">
            <Zap className="h-2.5 w-2.5" /> VIRAL <Zap className="h-2.5 w-2.5" />
          </div>
        ) : isHot ? (
          <div className="absolute top-0 right-0 left-0 bg-orange-500 text-white text-[7px] font-pixel py-1 text-center uppercase border-b-2 border-foreground z-20 flex items-center justify-center gap-1">
            <Download className="h-2.5 w-2.5" /> MAIS BAIXADO
          </div>
        ) : null}

        {isDownloaded && !isViral && !isHot && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/20 pointer-events-none">
            <span className="bg-primary text-white border-2 border-foreground px-2 py-1 font-pixel text-[7px] uppercase shadow-[2px_2px_0_0_var(--ink)]">
              Ja baixou
            </span>
          </div>
        )}

        <span className="absolute left-1 top-1 inline-flex items-center gap-0.5 border-2 border-foreground bg-primary px-1.5 py-0.5 font-pixel text-[7px] uppercase text-primary-foreground sm:left-2 sm:top-2 sm:gap-1 sm:px-2 sm:text-[9px]">
          <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span className="max-w-[60px] truncate sm:max-w-none">{addon.category}</span>
        </span>
        <span className="absolute right-1 top-1 border-2 border-foreground bg-background px-1.5 py-0.5 font-pixel text-[7px] sm:right-2 sm:top-2 sm:px-2 sm:text-[9px]">
          v{addon.version}
        </span>
        {isNcmine && (
          <span className="absolute right-1 bottom-1 border-2 border-foreground bg-primary px-1.5 py-0.5 font-pixel text-[7px] uppercase text-primary-foreground sm:right-2 sm:bottom-2 sm:px-2 sm:text-[9px]">
            @ncmine
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <h3 className="mb-0.5 line-clamp-2 text-[11px] font-extrabold uppercase leading-tight sm:mb-1 sm:text-base">
          {addon.title}
        </h3>
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
                className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${i < addon.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
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
            onClick={() => onOpen(addon)}
            className={`btn-block flex-1 !px-2 !py-2.5 text-[10px] sm:!px-5 sm:!py-3 sm:text-sm shadow-[3px_3px_0_0_var(--ink)] active:translate-y-0.5 active:shadow-none transition-all min-h-[44px] ${
              isDownloaded ? 'bg-background text-foreground' : 'bg-primary text-primary-foreground'
            }`}
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {isDownloaded ? 'Ver' : 'Baixar'}
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Compartilhar"
            className="btn-block bg-background !px-2.5 !py-2.5 text-[10px] sm:!px-3 sm:!py-3 border-2 border-foreground hover:bg-muted active:scale-95 transition-all min-h-[44px]"
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
