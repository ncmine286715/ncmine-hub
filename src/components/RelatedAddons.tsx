import { Link } from "@tanstack/react-router";
import { Star, Heart } from "lucide-react";
import type { Addon } from "@/components/AddonCard";

type Props = {
  current: Addon;
  all: Addon[];
  max?: number;
};

export function RelatedAddons({ current, all, max = 6 }: Props) {
  const related = all
    .filter((a) => a.id !== current.id)
    .map((a) => {
      let score = 0;
      if (a.category === current.category) score += 5;
      const tagOverlap = a.tags?.filter((t) => current.tags?.includes(t)).length ?? 0;
      score += tagOverlap * 2;
      score += (a.rating || 0) * 0.3;
      return { a, score };
    })
    .sort((x, y) => y.score - x.score)
    .slice(0, max)
    .map((x) => x.a);

  if (!related.length) return null;

  return (
    <section className="mt-8 sm:mt-12">
      <div className="mb-3 flex items-center gap-2">
        <Heart className="h-4 w-4 fill-primary text-primary" />
        <h2 className="font-pixel text-[11px] uppercase sm:text-xs">
          Gostou desse? Olha esses também
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-3">
        {related.map((a) => (
          <Link
            key={a.id}
            to="/addon/$id"
            params={{ id: a.id }}
            className="card-block group flex flex-col overflow-hidden"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden border-b-2 border-foreground bg-muted">
              <img
                src={a.image}
                alt={a.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute left-1 top-1 border-2 border-foreground bg-primary px-1.5 py-0.5 font-pixel text-[7px] uppercase text-primary-foreground sm:text-[9px]">
                {a.category}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-2 sm:p-3">
              <h3 className="line-clamp-2 text-[11px] font-extrabold uppercase leading-tight sm:text-sm">
                {a.title}
              </h3>
              <div className="mt-1 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${i < a.rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
                  />
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}