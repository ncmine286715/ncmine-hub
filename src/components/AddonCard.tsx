import { Star, Download, User, Flame } from "lucide-react";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
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

export function AddonCard({ addon, onOpen, index = 0 }: Props) {
  const [broken, setBroken] = useState(false);
  const animatedDownloads = useCountUp(addon.downloads);
  const isHot = addon.downloads > 5000;
  const authorLower = (addon.author || "").toLowerCase();
  const isNcmine = authorLower.includes("ncmine") || authorLower.includes("nicolas");

  return (
    <article
      className="card-block animate-card-in flex flex-col overflow-hidden"
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
    >
      <button
        type="button"
        onClick={() => { trackEvent("addon_click", { addonId: addon.id, title: addon.title }); onOpen(addon); }}
        className="group relative block aspect-[16/10] w-full overflow-hidden border-b border-border bg-muted"
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
          <div className="flex h-full w-full items-center justify-center bg-muted font-pixel text-[9px] text-muted-foreground">
            SEM PREVIEW
          </div>
        )}
        {isHot && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
            <Flame className="h-2.5 w-2.5" /> Popular
          </span>
        )}
        {isNcmine && (
          <span className="absolute right-2 top-2 rounded-full border border-ink bg-background px-2 py-0.5 font-pixel text-[8px] uppercase text-primary">
            @ncmine
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="text-primary">{addon.category}</span>
          <span className="opacity-40">·</span>
          <span className="inline-flex min-w-0 items-center gap-1 truncate normal-case">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">{addon.author || "Desconhecido"}</span>
          </span>
        </div>

        <h3 className="line-clamp-2 text-sm font-bold leading-snug sm:text-base">
          {addon.title}
        </h3>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{addon.short}</p>

        <div className="mt-auto flex items-center justify-between pt-1 text-[11px]">
          {addon.rating > 0 ? (
            <span className="inline-flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < addon.rating ? "fill-primary text-primary" : "text-border"}`}
                />
              ))}
            </span>
          ) : <span />}
          <span className="inline-flex items-center gap-1 font-medium text-muted-foreground tabular-nums">
            <Download className="h-3 w-3" />
            {animatedDownloads.toLocaleString("pt-BR")}
          </span>
        </div>

        <button
          onClick={() => onOpen(addon)}
          className="btn-block mt-2 w-full bg-primary text-primary-foreground !px-3 !py-2.5 !text-[12px]"
        >
          <Download className="h-3.5 w-3.5" /> Baixar
        </button>
      </div>
    </article>
  );
}
