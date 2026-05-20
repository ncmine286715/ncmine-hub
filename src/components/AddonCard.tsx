import { Star, Download, User, Calendar, Tag } from "lucide-react";
import { useState } from "react";

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

export function AddonCard({ addon, onDownload, onOpen }: Props) {
  const [broken, setBroken] = useState(false);

  return (
    <article className="card-block flex flex-col overflow-hidden">
      <button
        type="button"
        onClick={() => onOpen(addon)}
        className="group relative block aspect-[16/10] w-full overflow-hidden border-b-2 border-foreground bg-muted"
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
          <div className="flex h-full w-full items-center justify-center bg-foreground text-background font-pixel text-xs">
            NO PREVIEW
          </div>
        )}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 border-2 border-foreground bg-primary px-2 py-0.5 font-pixel text-[9px] uppercase text-primary-foreground">
          <Tag className="h-3 w-3" />
          {addon.category}
        </span>
        <span className="absolute right-2 top-2 border-2 border-foreground bg-background px-2 py-0.5 font-pixel text-[9px]">
          v{addon.version}
        </span>
      </button>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <h3 className="mb-1 line-clamp-2 text-sm font-extrabold uppercase leading-tight sm:text-base">
          {addon.title}
        </h3>
        <div className="mb-2 flex items-center gap-2 text-[10px] text-muted-foreground sm:gap-3 sm:text-[11px]">
          <span className="inline-flex items-center gap-1 truncate"><User className="h-3 w-3 shrink-0" />{addon.author}</span>
          <span className="hidden items-center gap-1 sm:inline-flex"><Calendar className="h-3 w-3" />{addon.date}</span>
        </div>
        <p className="mb-3 line-clamp-2 text-xs text-muted-foreground sm:line-clamp-3">{addon.short}</p>

        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${i < addon.rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
              />
            ))}
          </span>
          <span className="inline-flex items-center gap-1 font-pixel text-[8px] sm:text-[9px]">
            <Download className="h-3 w-3" />
            {addon.downloads.toLocaleString("pt-BR")}
          </span>
        </div>

        <button
          onClick={() => onDownload(addon)}
          className="btn-block mt-auto bg-foreground text-background !px-3 !py-2 text-xs sm:!px-5 sm:!py-3 sm:text-sm"
        >
          <Download className="h-4 w-4" /> Baixar
        </button>
      </div>
    </article>
  );
}