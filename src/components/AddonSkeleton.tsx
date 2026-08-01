/** Placeholders enquanto o catálogo carrega/revalida. */
export function AddonCardSkeleton() {
  return (
    <div className="border-2 border-foreground/15 bg-card">
      <div className="aspect-[4/3] w-full animate-pulse bg-foreground/10" />
      <div className="space-y-2 p-2 sm:p-3">
        <div className="h-3 w-4/5 animate-pulse bg-foreground/10" />
        <div className="h-2.5 w-2/5 animate-pulse bg-foreground/10" />
        <div className="h-7 w-full animate-pulse bg-foreground/10" />
      </div>
    </div>
  );
}

export function AddonsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
      aria-hidden
      role="presentation"
    >
      {Array.from({ length: count }).map((_, i) => (
        <AddonCardSkeleton key={i} />
      ))}
    </div>
  );
}
