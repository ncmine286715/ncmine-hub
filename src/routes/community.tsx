import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { getPopularAddons, getTopRatedAddons, getNewUsers, getGlobalActivity } from '../lib/firebase-services';
import { FloatingBackground } from '@/components/FloatingBackground';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Users, Trophy, Flame, Star, MessageSquare, Activity, ArrowLeft } from 'lucide-react';
import { MinecraftBlockIcon } from '@/components/icons/BrandIcons';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Route = createFileRoute('/community')({
  component: CommunityPage,
});

function CommunityPage() {
  const navigate = useNavigate();
  const [popular, setPopular] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [newUsers, setNewUsers] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [p, t, u, a] = await Promise.all([
          getPopularAddons(5),
          getTopRatedAddons(5),
          getNewUsers(10),
          getGlobalActivity(8)
        ]);
        setPopular(p || []);
        setTopRated(t || []);
        setNewUsers(u || []);
        setActivity(a || []);
      } catch (error) {
        console.error('Error loading community data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="relative min-h-screen pb-20 sm:pb-0">
      <FloatingBackground />
      
      <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-4">
          <button onClick={() => navigate({ to: '/' })} className="font-pixel text-[10px] text-muted-foreground uppercase flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Home
          </button>
          <h1 className="font-pixel text-sm uppercase">COMUNIDADE</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-6 grid gap-8 md:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          {/* Activity Feed */}
          <section>
            <h2 className="flex items-center gap-2 font-pixel text-xs mb-4 text-primary">
              <Activity className="h-4 w-4" />
              ATIVIDADE RECENTE
            </h2>
            <div className="space-y-4">
              {activity.map((act) => (
                <div key={act.id} className="group bg-background border-2 border-foreground p-4 sm:p-6 transition-all hover:shadow-[6px_6px_0_0_var(--ink)] flex gap-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 border-2 border-foreground bg-primary/10 flex items-center justify-center font-pixel text-sm overflow-hidden">
                    {act.avatar ? <img src={act.avatar} className="w-full h-full object-cover" /> : act.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase mb-1 truncate">
                      {act.username} <span className="text-muted-foreground font-bold lowercase">comentou em</span> {act.addonId}
                    </p>
                    <p className="text-sm text-foreground/90 font-medium line-clamp-3 mb-3 italic">"{act.text}"</p>
                    <div className="flex items-center justify-between mt-auto">
                       <span className="text-[9px] text-muted-foreground font-bold uppercase">
                        {act.createdAt?.toDate ? formatDistanceToNow(act.createdAt.toDate(), { addSuffix: true, locale: ptBR }) : 'agora'}
                       </span>
                       <button onClick={() => navigate({ to: '/addon/$id', params: { id: act.addonId } })} className="text-[9px] font-pixel text-primary uppercase hover:underline">Ver Addon</button>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && activity.length === 0 && (
                <div className="text-center py-20 border-4 border-dashed border-foreground/5 rounded-3xl">
                  <p className="text-xs text-muted-foreground font-pixel uppercase opacity-30 italic">Silêncio total na mina...</p>
                </div>
              )}
            </div>
          </section>

          {/* New Members Grid */}
          <section>
            <h2 className="flex items-center gap-2 font-pixel text-xs mb-4">
              <Users className="h-4 w-4 text-primary" />
              NOVOS MEMBROS
            </h2>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
              {newUsers.map((user) => (
                <div key={user.id} title={user.username} className="group relative">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-foreground bg-background flex items-center justify-center font-pixel text-base transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:translate-y-[-2px] group-hover:shadow-[4px_4px_0_0_var(--ink)] overflow-hidden">
                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.username[0].toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Rankings */}
        <div className="space-y-8">
          <section>
            <h2 className="flex items-center gap-2 font-pixel text-xs mb-4">
              <Flame className="h-4 w-4 text-orange-500" />
              POPULARES
            </h2>
            <div className="space-y-2">
              {popular.map((addon, index) => (
                <div 
                  key={addon.id} 
                  className="group bg-background border-2 border-foreground p-3 flex items-center justify-between cursor-pointer transition-all hover:bg-orange-50 border-l-8 border-l-orange-500"
                  onClick={() => navigate({ to: '/addon/$id', params: { id: addon.id } })}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-pixel text-[10px] text-muted-foreground">#{index + 1}</span>
                    <span className="font-black text-[10px] uppercase truncate">{addon.id}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black text-orange-500 shrink-0">
                    <Flame className="h-3 w-3" /> {addon.favoritesCount}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-2 font-pixel text-xs mb-4">
              <Trophy className="h-4 w-4 text-yellow-500" />
              RANKING XP
            </h2>
            <div className="space-y-2">
              {topRated.map((addon, index) => (
                <div 
                  key={addon.id} 
                  className="group bg-background border-2 border-foreground p-3 flex items-center justify-between cursor-pointer transition-all hover:bg-yellow-50 border-l-8 border-l-yellow-500"
                  onClick={() => navigate({ to: '/addon/$id', params: { id: addon.id } })}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-pixel text-[10px] text-muted-foreground">#{index + 1}</span>
                    <span className="font-black text-[10px] uppercase truncate">{addon.id}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black text-yellow-500 shrink-0">
                    <Star className="h-3 w-3 fill-current" /> {addon.averageRating?.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="bg-primary border-2 border-foreground p-5 text-primary-foreground text-center shadow-[6px_6px_0_0_var(--ink)] animate-mc-shake">
             <MessageSquare className="h-10 w-10 mx-auto mb-3" />
             <p className="font-pixel text-[10px] mb-2 uppercase leading-none">Faça História!</p>
             <p className="text-[11px] leading-tight font-bold opacity-90 uppercase">Comente e avalie addons para ganhar XP e destaque.</p>
          </div>
        </div>
      </main>

      <BottomNavigation activeTab="community" onTabChange={(tab) => navigate({ to: tab === 'home' ? '/' : `/${tab}` })} />
    </div>
  );
}
