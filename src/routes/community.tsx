import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { getPopularAddons, getTopRatedAddons, getNewUsers } from '../lib/firebase-services';
import { FloatingBackground } from '@/components/FloatingBackground';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Users, Trophy, Flame, Star } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [p, t, u] = await Promise.all([
          getPopularAddons(5),
          getTopRatedAddons(5),
          getNewUsers(5)
        ]);
        setPopular(p);
        setTopRated(t);
        setNewUsers(u);
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
        <div className="mx-auto flex max-w-7xl items-center justify-center px-3 py-4">
          <h1 className="font-pixel text-sm uppercase">COMUNIDADE</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-3 py-6 space-y-8">
        {/* New Users */}
        <section>
          <h2 className="flex items-center gap-2 font-pixel text-xs mb-4">
            <Users className="h-4 w-4 text-primary" />
            NOVOS MEMBROS
          </h2>
          <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
            {newUsers.map((user) => (
              <div key={user.id} className="flex flex-col items-center gap-1 group">
                <div className="h-14 w-14 border-2 border-foreground bg-primary/10 flex items-center justify-center font-pixel text-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="text-[10px] font-bold uppercase truncate max-w-[80px]">{user.username}</span>
              </div>
            ))}
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 w-14 border-2 border-foreground bg-muted animate-pulse" />
            ))}
          </div>
        </section>

        {/* Popular Addons */}
        <section>
          <h2 className="flex items-center gap-2 font-pixel text-xs mb-4">
            <Flame className="h-4 w-4 text-orange-500" />
            MAIS FAVORITADOS
          </h2>
          <div className="space-y-3">
            {popular.map((addon, index) => (
              <div 
                key={addon.id} 
                className="card-block p-3 flex items-center justify-between cursor-pointer hover:border-primary transition-colors"
                onClick={() => navigate({ to: '/addon/$id', params: { id: addon.id } })}
              >
                <div className="flex items-center gap-3">
                  <div className="font-pixel text-lg text-muted-foreground/30 w-6">#{index + 1}</div>
                  <span className="font-bold text-sm">{addon.id}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-primary">
                  <Flame className="h-3 w-3" />
                  {addon.favoritesCount}
                </div>
              </div>
            ))}
            {!loading && popular.length === 0 && (
              <p className="text-center text-muted-foreground text-xs py-4">Ainda sem dados de popularidade.</p>
            )}
          </div>
        </section>

        {/* Top Rated */}
        <section>
          <h2 className="flex items-center gap-2 font-pixel text-xs mb-4">
            <Trophy className="h-4 w-4 text-yellow-500" />
            MELHORES AVALIADOS
          </h2>
          <div className="space-y-3">
            {topRated.map((addon, index) => (
              <div 
                key={addon.id} 
                className="card-block p-3 flex items-center justify-between cursor-pointer hover:border-primary transition-colors"
                onClick={() => navigate({ to: '/addon/$id', params: { id: addon.id } })}
              >
                <div className="flex items-center gap-3">
                  <div className="font-pixel text-lg text-muted-foreground/30 w-6">#{index + 1}</div>
                  <span className="font-bold text-sm">{addon.id}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                  <Star className="h-3 w-3 fill-current" />
                  {addon.averageRating?.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Community Stats Card */}
        <div className="card-block bg-primary p-6 text-primary-foreground text-center">
          <MinecraftBlockIcon className="h-12 w-12 mx-auto mb-3" />
          <h3 className="font-pixel text-sm mb-2">FAÇA PARTE DA HISTÓRIA</h3>
          <p className="text-xs opacity-90 leading-relaxed">
            Avalie addons, salve seus favoritos e ajude outros mineradores a encontrar os melhores conteúdos.
          </p>
        </div>
      </main>

      <BottomNavigation activeTab="community" onTabChange={(tab) => navigate({ to: tab === 'home' ? '/' : `/${tab}` })} />
    </div>
  );
}
