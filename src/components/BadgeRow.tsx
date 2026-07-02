import { allBadgeDefinitions, computeBadges } from "@/lib/badges";

export function BadgeRow({ profile }: { profile: any }) {
  const earned = new Set(computeBadges(profile).map((b) => b.id));
  const all = allBadgeDefinitions();

  return (
    <div className="mt-8">
      <h3 className="font-pixel text-xs mb-4 flex items-center gap-2">🏆 CONQUISTAS</h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {all.map((b) => {
          const has = earned.has(b.id);
          return (
            <div
              key={b.id}
              title={b.description}
              className={`flex flex-col items-center gap-1 border-2 border-foreground p-2 text-center shadow-[3px_3px_0_0_var(--ink)] ${
                has ? "bg-primary/10" : "bg-muted/30 grayscale opacity-50"
              }`}
            >
              <span className="text-xl leading-none">{b.emoji}</span>
              <span className="text-[8px] font-bold uppercase leading-tight">{b.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
