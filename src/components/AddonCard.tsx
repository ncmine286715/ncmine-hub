import { Star, Download, User, Share2, Zap } from "lucide-react";
import { useState } from "react";
import { shareAddon } from "@/lib/share";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";
import { recordShare } from "@/lib/firebase-services";
import { useCountUp } from "@/hooks/use-count-up";

export type Addon = {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
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

// Cor "de raridade" (linguagem de tooltip de item do Minecraft) por categoria —
// mesma paleta usada nos botões de categoria do grid (AddonsGrid.tsx).
function categoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case "addon":
      return "text-primary";
    case "textura":
      return "text-[#4CAF50]";
    case "holoprint":
      return "text-[#2196F3]";
    default:
      return "text-foreground/70";
  }
}

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

  const animatedDownloads = useCountUp(addon.downloads);
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

        {isDownloaded && (
          <span className="absolute left-1 top-1 border-2 border-foreground bg-background/90 px-1.5 py-0.5 font-pixel text-[7px] uppercase sm:left-2 sm:top-2 sm:px-2 sm:text-[9px]">
            ✓ Baixado
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <h3 className="mb-0.5 line-clamp-2 break-words text-[11px] font-extrabold uppercase leading-tight sm:text-base">
          {addon.title}
        </h3>

        {/* Linha "tooltip de item": categoria colorida (raridade) + autor + versão */}
        <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase sm:gap-2 sm:text-[10px]">
          <span className={categoryColor(addon.category)}>{addon.category}</span>
          <span className="text-muted-foreground/50">·</span>
          <span className="inline-flex min-w-0 items-center gap-0.5 truncate text-muted-foreground normal-case">
            <User className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{addon.author || "Desconhecido"}</span>
          </span>
          {isNcmine && (
            <span className="shrink-0 border border-primary/60 px-1 text-primary">@ncmine</span>
          )}
        </div>

        <p className="mb-2 line-clamp-2 break-words text-[10px] italic leading-relaxed text-muted-foreground sm:mb-3 sm:line-clamp-3 sm:text-xs">{addon.short}</p>

        <div className="mb-2 flex items-center justify-between text-[10px] sm:mb-3 sm:text-xs">
          <span className="inline-flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${i < addon.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
              />
            ))}
          </span>
          <span
            className="inline-flex items-center gap-0.5 text-muted-foreground sm:gap-1"
            style={{ fontFamily: "var(--font-hud)" }}
          >
            <Download className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {animatedDownloads.toLocaleString("pt-BR")}
          </span>
        </div>

        <div className="mt-auto flex gap-1.5">
          <button
            onClick={() => onOpen(addon)}
            className={`btn-block flex-1 !px-2 !py-2.5 text-[10px] sm:!px-5 sm:!py-3 sm:text-sm shadow-[3px_3px_0_0_var(--ink)] active:translate-y-0.5 active:shadow-none transition-all min-h-[44px] ${
              isDownloaded ? 'bg-background text-foreground' : 'bg-primary text-primary-foreground'
            }`}
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {isDownloaded ? 'Ver addon' : 'Baixar'}
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Compartilhar"
            className="inline-flex min-h-[44px] w-10 shrink-0 items-center justify-center border border-foreground/30 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground sm:w-11"
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
