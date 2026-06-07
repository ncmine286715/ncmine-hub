import { useState, useMemo } from 'react';
import { Sparkles, TrendingUp, Clock, Star, Flame, ArrowRight, Crown } from 'lucide-react';
import type { Addon } from '@/components/AddonCard';
import { useAuth } from '@/hooks/use-auth';

type Props = {
  addons: Addon[];
  onOpen: (addon: Addon) => void;
  onDownload: (addon: Addon) => void;
};

type FeedSection = 'para_voce' | 'novidades' | 'populares' | 'destaques';

export function PersonalizedFeed({ addons, onOpen, onDownload }: Props) {
  const { user, profile } = useAuth();
  const [activeSection, setActiveSection] = useState<FeedSection>('para_voce');

  const suggestions = useMemo(() => {
    if (!profile?.downloadedAddons?.length) {
      return addons.slice(0, 6);
    }

    const downloadedCategories = new Set<string>();
    const downloadedTags = new Set<string>();

    for (const addon of addons) {
      if (profile.downloadedAddons.includes(addon.id)) {
        downloadedCategories.add(addon.category?.toLowerCase() || '');
        addon.tags?.forEach(t => downloadedTags.add(t.toLowerCase()));
      }
    }

    const scored = addons
      .filter(a => !profile.downloadedAddons.includes(a.id))
      .map(addon => {
        let score = 0;
        if (downloadedCategories.has(addon.category?.toLowerCase() || '')) score += 3;
        addon.tags?.forEach(t => {
          if (downloadedTags.has(t.toLowerCase())) score += 1;
        });
        score += (addon.rating || 0) * 0.5;
        return { addon, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 8).map(s => s.addon);
  }, [addons, profile]);

  const newAddons = useMemo(() => {
    return [...addons]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [addons]);

  const popularAddons = useMemo(() => {
    return [...addons]
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 6);
  }, [addons]);

  const featuredCreators = useMemo(() => {
    const creators = new Map<string, { name: string; count: number; topAddon: Addon }>();
    for (const addon of addons) {
      const author = addon.author || 'Desconhecido';
      if (!creators.has(author)) {
        creators.set(author, { name: author, count: 1, topAddon: addon });
      } else {
        const c = creators.get(author)!;
        c.count++;
        if ((addon.rating || 0) > (c.topAddon.rating || 0)) c.topAddon = addon;
      }
    }
    return Array.from(creators.values())
      .filter(c => c.count >= 2 && c.name !== '@' && c.name !== 'Desconhecido')
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [addons]);

  return (
    <div className="space-y-4">
      {/* Section Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        <FeedTab active={activeSection === 'para_voce'} onClick={() => setActiveSection('para_voce')} icon={<Sparkles className="h-3 w-3" />} label="Pra Voce" />
        <FeedTab active={activeSection === 'novidades'} onClick={() => setActiveSection('novidades')} icon={<Clock className="h-3 w-3" />} label="Novidades" />
        <FeedTab active={activeSection === 'populares'} onClick={() => setActiveSection('populares')} icon={<Flame className="h-3 w-3" />} label="Populares" />
        <FeedTab active={activeSection === 'destaques'} onClick={() => setActiveSection('destaques')} icon={<Crown className="h-3 w-3" />} label="Criadores" />
      </div>

      {/* Para Voce */}
      {activeSection === 'para_voce' && (
        <div className="space-y-3">
          {user && profile ? (
            <p className="text-[10px] text-muted-foreground">
              Baseado no que voce ja baixou e curtiu:
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground">
              Addons em alta na comunidade. Entre pra ter sugestoes personalizadas!
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {suggestions.map(addon => (
              <MiniAddonCard key={addon.id} addon={addon} onOpen={onOpen} onDownload={onDownload} />
            ))}
          </div>
        </div>
      )}

      {/* Novidades */}
      {activeSection === 'novidades' && (
        <div className="space-y-3">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> Adicionados recentemente
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {newAddons.map(addon => (
              <MiniAddonCard key={addon.id} addon={addon} onOpen={onOpen} onDownload={onDownload} showDate />
            ))}
          </div>
        </div>
      )}

      {/* Populares */}
      {activeSection === 'populares' && (
        <div className="space-y-3">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Mais baixados pela comunidade
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {popularAddons.map(addon => (
              <MiniAddonCard key={addon.id} addon={addon} onOpen={onOpen} onDownload={onDownload} showRating />
            ))}
          </div>
        </div>
      )}

      {/* Criadores em destaque */}
      {activeSection === 'destaques' && (
        <div className="space-y-3">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Crown className="h-3 w-3" /> Criadores com mais addons no hub
          </p>
          {featuredCreators.length > 0 ? (
            <div className="space-y-2">
              {featuredCreators.map((creator, i) => (
                <div
                  key={creator.name}
                  className="border-2 border-foreground p-3 flex items-center gap-3 transition-all hover:shadow-[3px_3px_0_0_var(--ink)] hover:translate-y-[-1px] cursor-pointer"
                  onClick={() => onOpen(creator.topAddon)}
                >
                  <span className={`font-pixel text-xs w-6 text-center ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                    #{i + 1}
                  </span>
                  <div className="h-9 w-9 border-2 border-foreground bg-primary/10 flex items-center justify-center font-pixel text-xs">
                    {creator.name[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black uppercase truncate">{creator.name}</p>
                    <p className="text-[9px] text-muted-foreground">{creator.count} addons publicados</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-foreground/10">
              <Crown className="h-6 w-6 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">Nenhum criador em destaque ainda</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FeedTab({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-1.5 text-[9px] font-bold uppercase whitespace-nowrap border-2 border-foreground transition-all ${
        active
          ? 'bg-primary text-primary-foreground shadow-[2px_2px_0_0_var(--ink)]'
          : 'bg-background hover:bg-muted/30'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function MiniAddonCard({ addon, onOpen, onDownload, showDate, showRating }: {
  addon: Addon; onOpen: (a: Addon) => void; onDownload: (a: Addon) => void; showDate?: boolean; showRating?: boolean;
}) {
  return (
    <div
      className="border-2 border-foreground bg-background overflow-hidden cursor-pointer transition-all hover:shadow-[3px_3px_0_0_var(--ink)] hover:translate-y-[-2px] group"
      onClick={() => onOpen(addon)}
    >
      <div className="aspect-[4/3] bg-muted overflow-hidden">
        <img
          src={addon.image}
          alt={addon.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          loading="lazy"
        />
      </div>
      <div className="p-2">
        <p className="text-[10px] font-black uppercase truncate leading-tight">{addon.title}</p>
        <div className="flex items-center justify-between mt-1">
          {showDate && (
            <span className="text-[8px] text-muted-foreground font-bold">
              {new Date(addon.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </span>
          )}
          {showRating && addon.rating && (
            <span className="text-[8px] text-yellow-600 font-bold flex items-center gap-0.5">
              <Star className="h-2.5 w-2.5 fill-current" /> {addon.rating}
            </span>
          )}
          {!showDate && !showRating && (
            <span className="text-[8px] text-muted-foreground uppercase">{addon.category}</span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(addon); }}
            className="text-[8px] font-pixel text-primary uppercase hover:underline"
          >
            Baixar
          </button>
        </div>
      </div>
    </div>
  );
}
